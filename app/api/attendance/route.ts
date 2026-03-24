// app/api/attendance/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getCompanyId } from "@/app/lib/getCompanyid";
import { getSession } from "@/app/lib/auth";

/* ─── Mapping helpers ────────────────────────────────────────────────
   The Prisma AttendanceStatus enum has: PRESENT, ABSENT, LATE, HALF_DAY, ON_LEAVE, HOLIDAY, WEEKEND
   The frontend uses shortnames: P, A, Halfday, and leave-policy codes (CL, PL, SL, LWP, etc.)
   We map between the two so the DB always stores valid enum values,
   and we keep the leave-policy code in the `notes` field for traceability.
──────────────────────────────────────────────────────────────────── */

/** Frontend shortname → Prisma enum + optional leave code */
function mapToPrismaStatus(frontendValue: string): { enumStatus: string; leaveCode: string | null } {
    if (frontendValue === "P") return { enumStatus: "PRESENT", leaveCode: null };
    if (frontendValue === "A") return { enumStatus: "ABSENT", leaveCode: null };
    if (frontendValue === "WO") return { enumStatus: "WEEKEND", leaveCode: null };
    if (frontendValue === "Halfday") return { enumStatus: "HALF_DAY", leaveCode: null };
    // Everything else is a leave-policy code (CL, PL, SL, LWP, etc.)
    return { enumStatus: "ON_LEAVE", leaveCode: frontendValue };
}

/** Prisma enum + notes → frontend shortname */
function mapToFrontend(enumStatus: string, notes: string | null): string {
    switch (enumStatus) {
        case "PRESENT": return "P";
        case "ABSENT": return "A";
        case "HALF_DAY": return "Halfday";
        case "ON_LEAVE": return notes || "A"; // notes stores the leave code
        case "LATE": return "P"; // late still counts as present in grid
        case "HOLIDAY": return "H";
        case "WEEKEND": return "WO";
        default: return "P";
    }
}

/* ─── GET ─────────────────────────────────────────────────────────── */
export async function GET(req: NextRequest) {
    try {
        const companyId = getCompanyId();
        const { searchParams } = new URL(req.url);
        const month = parseInt(searchParams.get("month") || String(new Date().getMonth() + 1));
        const year = parseInt(searchParams.get("year") || String(new Date().getFullYear()));

        const employees = await prisma.employee.findMany({
            where: { companyId, deletedAt: null },
            select: {
                id: true, code: true, name: true,
                branch: true, category: true, department: true,
                designation: true, level: true, grade: true,
                attendanceType: true, shiftId: true,
                doj: true, employmentStatus: true,
            },
        });

        const daily = await prisma.attendance.findMany({
            where: {
                companyId,
                date: { gte: new Date(year, month - 1, 1), lt: new Date(year, month, 1) },
            },
        });

        const balances = await prisma.employeeLeaveBalance.findMany({
            where: { companyId, year },
            include: { leavePolicy: { select: { code: true, name: true } } },
        });

        // Also fetch leave policies so frontend can build dynamic status dropdowns
        // Include fixedDays + applicability for auto-fill logic
        const leavePolicies = await prisma.leavePolicy.findMany({
            where: { companyId, isActive: true },
            select: { id: true, code: true, name: true, leaveValue: true, fixedDays: true, applicability: true },
            orderBy: { name: "asc" },
        });

        const shifts = await prisma.shift.findMany({
            where: { companyId }
        });
        const shiftMap = new Map(shifts.map(s => [s.id, s]));

        const result = employees.map(emp => {
            const empShift = emp.shiftId ? shiftMap.get(emp.shiftId) : null;
            const daysInMonth = new Date(year, month, 0).getDate();
            const attendance = Array.from({ length: daysInMonth }, (_, i) => {
                const d = new Date(year, month - 1, i + 1);
                const rec = daily.find(r => r.employeeId === emp.id && r.date.toDateString() === d.toDateString());
                if (!rec) {
                    // Check if week off
                    let isWO = false;
                    if (empShift?.defineWeeklyOff && empShift.weeklyOffPattern) {
                        const dayName = d.toLocaleString('en-US', { weekday: 'short' });
                        const weekOfMonth = Math.ceil(d.getDate() / 7);
                        const patterns = (empShift.weeklyOffPattern as any) || [];
                        isWO = patterns.some((p: any) => p.type === "Full day" && p.week === weekOfMonth && p.day === dayName);
                    }
                    return isWO ? "WO" : "P";
                }
                return mapToFrontend(rec.status, rec.notes);
            });

            // Compute leave balances from existing records
            const empBalances: Record<string, number> = {};

            // First, set ALL active leave policies to 0 as default
            leavePolicies.forEach(p => {
                empBalances[p.code] = 0;
            });

            // Then override with actual balances from DB records
            balances
                .filter(b => b.employeeId === emp.id)
                .forEach(b => {
                    const key = b.leavePolicy.code || b.leavePolicy.name;
                    const computedBalance = b.totalAllotted + b.carriedOver - b.used - b.encashed - b.lapsed;
                    empBalances[key] = Math.round(computedBalance * 100) / 100;
                });

            return { ...emp, attendance, leaveBalances: empBalances };
        });

        // ═══════════════════════════════════════════════════════════════
        // AUTO-FILL: Create missing EmployeeLeaveBalance records
        // For employees who match a policy's applicability but have no record
        // ═══════════════════════════════════════════════════════════════
        try {
            const existingBalanceKeys = new Set(
                balances.map(b => `${b.employeeId}:${b.leavePolicyId}`)
            );

            const missingRecords: any[] = [];

            for (const policy of leavePolicies) {
                const applicability = (policy as any).applicability || { all: true };
                
                for (const emp of employees) {
                    const key = `${emp.id}:${policy.id}`;
                    if (existingBalanceKeys.has(key)) continue;

                    // Check eligibility
                    let eligible = true;
                    if (!applicability.all) {
                        if (applicability.branches?.length > 0 && !applicability.branches.includes(emp.branch)) eligible = false;
                        if (applicability.departments?.length > 0 && !applicability.departments.includes(emp.department)) eligible = false;
                        if (applicability.levels?.length > 0 && !applicability.levels.includes(emp.level)) eligible = false;
                        if (applicability.categories?.length > 0 && !applicability.categories.includes(emp.category)) eligible = false;
                    }

                    if (eligible) {
                        missingRecords.push({
                            companyId,
                            employeeId: emp.id,
                            leavePolicyId: policy.id,
                            year,
                            totalAllotted: (policy as any).fixedDays || 0,
                            carriedOver: 0,
                            used: 0,
                            encashed: 0,
                            lapsed: 0,
                            balance: (policy as any).fixedDays || 0,
                        });
                    }
                }
            }

            if (missingRecords.length > 0) {
                await prisma.employeeLeaveBalance.createMany({
                    data: missingRecords,
                    skipDuplicates: true,
                });
                console.log(`[ATTENDANCE GET] Auto-created ${missingRecords.length} missing leave balance records`);
                
                // Re-fetch balances so response includes the new records
                const updatedBalances = await prisma.employeeLeaveBalance.findMany({
                    where: { companyId, year },
                    include: { leavePolicy: { select: { code: true, name: true } } },
                });

                // Update result with fresh balances
                result.forEach(emp => {
                    const freshBalances: Record<string, number> = {};
                    leavePolicies.forEach(p => { freshBalances[p.code] = 0; });
                    updatedBalances
                        .filter(b => b.employeeId === emp.id)
                        .forEach(b => {
                            const key = b.leavePolicy.code || b.leavePolicy.name;
                            freshBalances[key] = Math.round((b.totalAllotted + b.carriedOver - b.used - b.encashed - b.lapsed) * 100) / 100;
                        });
                    emp.leaveBalances = freshBalances;
                });
            }
        } catch (autoFillErr: any) {
            console.error("[ATTENDANCE GET] Auto-fill warning:", autoFillErr.message);
        }

        return NextResponse.json({
            success: true,
            employees: result,
            // Send leave policies so frontend builds dynamic status options
            leavePolicies: leavePolicies.map(p => ({ code: p.code, name: p.name, value: p.leaveValue })),
        });
    } catch (error: any) {
        console.error("[ATTENDANCE GET] Error:", error.message);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

/* ─── POST ────────────────────────────────────────────────────────── */
export async function POST(req: NextRequest) {
    try {
        const companyId = getCompanyId();
        const session = await getSession();
        const { employeeId, date, status: frontendStatus, notes: userNotes } = await req.json();

        const attendanceDate = new Date(date);
        const { enumStatus, leaveCode } = mapToPrismaStatus(frontendStatus);

        // Find existing record to see if we need to refund a previous leave
        const existingRecord = await prisma.attendance.findUnique({
            where: { employeeId_date: { employeeId, date: attendanceDate } }
        });

        const oldLeaveCode = (existingRecord?.status === "ON_LEAVE" && existingRecord?.notes) ? existingRecord.notes : null;

        // Combine: if it's a leave code, store it in notes so we can recover it in GET
        const finalNotes = leaveCode || userNotes || null;

        await prisma.attendance.upsert({
            where: { employeeId_date: { employeeId, date: attendanceDate } },
            update: {
                status: enumStatus as any,
                notes: finalNotes,
                updatedBy: session?.id || "system",
            },
            create: {
                companyId,
                employeeId,
                date: attendanceDate,
                status: enumStatus as any,
                notes: finalNotes,
                createdBy: session?.id || "system",
            },
        });

        // Handle Leave Balance Refund/Deduction logically
        if (oldLeaveCode !== leaveCode) {
            const leaveYear = attendanceDate.getFullYear();

            // 1. REFUND old leave if there was one
            if (oldLeaveCode) {
                const oldPolicy = await prisma.leavePolicy.findFirst({
                    where: { companyId, code: oldLeaveCode } // No isActive check for refunding old policies
                });
                if (oldPolicy) {
                    const oldBalance = await prisma.employeeLeaveBalance.findUnique({
                        where: { employeeId_leavePolicyId_year: { employeeId, leavePolicyId: oldPolicy.id, year: leaveYear } }
                    });
                    if (oldBalance && oldBalance.used > 0) {
                        await prisma.employeeLeaveBalance.update({
                            where: { id: oldBalance.id },
                            data: { used: Math.max(0, oldBalance.used - (oldPolicy.leaveValue || 1)) }
                        });
                    }
                }
            }

            // 2. DEDUCT new leave if applicable
            if (leaveCode) {
                const newPolicy = await prisma.leavePolicy.findFirst({
                    where: { companyId, code: leaveCode, isActive: true },
                });
                if (newPolicy) {
                    const newBalance = await prisma.employeeLeaveBalance.findUnique({
                        where: { employeeId_leavePolicyId_year: { employeeId, leavePolicyId: newPolicy.id, year: leaveYear } }
                    });
                    if (newBalance) {
                        await prisma.employeeLeaveBalance.update({
                            where: { id: newBalance.id },
                            data: { used: newBalance.used + (newPolicy.leaveValue || 1) }
                        });
                    } else {
                        await prisma.employeeLeaveBalance.create({
                            data: {
                                companyId, employeeId, leavePolicyId: newPolicy.id, year: leaveYear,
                                totalAllotted: newPolicy.fixedDays || 0,
                                used: newPolicy.leaveValue || 1,
                                carriedOver: 0, encashed: 0, lapsed: 0,
                            },
                        });
                    }
                }
            }
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("[ATTENDANCE POST] Error:", error.message);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

/* ─── POST BATCH ───────────────────────────────────────────────────── */
export async function PATCH(req: NextRequest) {
    try {
        const companyId = getCompanyId();
        const session = await getSession();
        const { changes } = await req.json();

        if (!Array.isArray(changes) || changes.length === 0) {
            return NextResponse.json({ success: false, error: "Invalid batch data" }, { status: 400 });
        }

        const results = [];
        let hasError = false;
        let lastError = "";

        for (const change of changes) {
            const { employeeId, date, status: frontendStatus } = change;
            const attendanceDate = new Date(date);
            const { enumStatus, leaveCode } = mapToPrismaStatus(frontendStatus);

            try {
                // Find existing record to see if we need to refund a previous leave
                const existingRecord = await prisma.attendance.findUnique({
                    where: { employeeId_date: { employeeId, date: attendanceDate } }
                });

                const oldLeaveCode = (existingRecord?.status === "ON_LEAVE" && existingRecord?.notes) ? existingRecord.notes : null;

                // Combine: if it's a leave code, store it in notes so we can recover it in GET
                const finalNotes = leaveCode || null;

                await prisma.attendance.upsert({
                    where: { employeeId_date: { employeeId, date: attendanceDate } },
                    update: {
                        status: enumStatus as any,
                        notes: finalNotes,
                        updatedBy: session?.id || "system",
                    },
                    create: {
                        companyId,
                        employeeId,
                        date: attendanceDate,
                        status: enumStatus as any,
                        notes: finalNotes,
                        createdBy: session?.id || "system",
                    },
                });

                // Handle Leave Balance Refund/Deduction logically
                if (oldLeaveCode !== leaveCode) {
                    const leaveYear = attendanceDate.getFullYear();

                    // 1. REFUND old leave if there was one
                    if (oldLeaveCode) {
                        const oldPolicy = await prisma.leavePolicy.findFirst({
                            where: { companyId, code: oldLeaveCode } // No isActive check for refunding old policies
                        });
                        if (oldPolicy) {
                            const oldBalance = await prisma.employeeLeaveBalance.findUnique({
                                where: { employeeId_leavePolicyId_year: { employeeId, leavePolicyId: oldPolicy.id, year: leaveYear } }
                            });
                            if (oldBalance && oldBalance.used > 0) {
                                await prisma.employeeLeaveBalance.update({
                                    where: { id: oldBalance.id },
                                    data: { used: Math.max(0, oldBalance.used - (oldPolicy.leaveValue || 1)) }
                                });
                            }
                        }
                    }

                    // 2. DEDUCT new leave if applicable
                    if (leaveCode) {
                        const newPolicy = await prisma.leavePolicy.findFirst({
                            where: { companyId, code: leaveCode, isActive: true },
                        });
                        if (newPolicy) {
                            const newBalance = await prisma.employeeLeaveBalance.findUnique({
                                where: { employeeId_leavePolicyId_year: { employeeId, leavePolicyId: newPolicy.id, year: leaveYear } }
                            });
                            if (newBalance) {
                                await prisma.employeeLeaveBalance.update({
                                    where: { id: newBalance.id },
                                    data: { used: newBalance.used + (newPolicy.leaveValue || 1) }
                                });
                            } else {
                                await prisma.employeeLeaveBalance.create({
                                    data: {
                                        companyId, employeeId, leavePolicyId: newPolicy.id, year: leaveYear,
                                        totalAllotted: newPolicy.fixedDays || 0,
                                        used: newPolicy.leaveValue || 1,
                                        carriedOver: 0, encashed: 0, lapsed: 0,
                                    },
                                });
                            }
                        }
                    }
                }

                results.push({ employeeId, date, status: frontendStatus, success: true });
            } catch (error: any) {
                hasError = true;
                lastError = error.message;
                results.push({ employeeId, date, status: frontendStatus, success: false, error: error.message });
            }
        }

        if (hasError) {
            return NextResponse.json({
                success: false,
                error: `Some updates failed: ${lastError}`,
                results
            }, { status: 207 }); // 207 Multi-Status
        }

        return NextResponse.json({ success: true, results });
    } catch (error: any) {
        console.error("[ATTENDANCE BATCH] Error:", error.message);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
