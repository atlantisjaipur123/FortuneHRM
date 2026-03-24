// app/api/payroll/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getCompanyId } from "@/app/lib/getCompanyid";

export async function GET(req: NextRequest) {
    try {
        const companyId = getCompanyId();
        const { searchParams } = new URL(req.url);
        const month = parseInt(searchParams.get("month") || String(new Date().getMonth() + 1));
        const year = parseInt(searchParams.get("year") || String(new Date().getFullYear()));

        const employees = await prisma.employee.findMany({
            where: { companyId, deletedAt: null },
            include: {
                salaryBreakdown: true
            }
        });

        const daily = await prisma.attendance.findMany({
            where: {
                companyId,
                date: { gte: new Date(year, month - 1, 1), lt: new Date(year, month, 1) },
            },
        });

        const shifts = await prisma.shift.findMany({
            where: { companyId }
        });
        const shiftMap = new Map(shifts.map(s => [s.id, s]));

        const result = employees.map(emp => {
            const empShift = emp.shiftId ? shiftMap.get(emp.shiftId) : null;
            const daysInMonth = new Date(year, month, 0).getDate();
            
            let pCount = 0;
            let aCount = 0;
            let woCount = 0;
            let halfdayCount = 0;
            let leaveCount = 0;

            for (let i = 1; i <= daysInMonth; i++) {
                const d = new Date(year, month - 1, i);
                const rec = daily.find(r => r.employeeId === emp.id && r.date.toDateString() === d.toDateString());
                
                let status = "P";
                if (!rec) {
                    let isWO = false;
                    if (empShift?.defineWeeklyOff && (empShift.weeklyOffPattern as any)) {
                        const dayName = d.toLocaleString('en-US', { weekday: 'short' });
                        const weekOfMonth = Math.ceil(d.getDate() / 7);
                        const patterns = (empShift.weeklyOffPattern as any) || [];
                        isWO = patterns.some((p: any) => p.type === "Full day" && p.week === weekOfMonth && p.day === dayName);
                    }
                    status = isWO ? "WO" : "P";
                } else {
                    if (rec.status === "PRESENT") status = "P";
                    else if (rec.status === "ABSENT") status = "A";
                    else if (rec.status === "WEEKEND") status = "WO";
                    else if (rec.status === "HALF_DAY") status = "Halfday";
                    else if (rec.status === "ON_LEAVE") status = "LEAVE";
                    else if (rec.status === "HOLIDAY" || rec.status === "LATE") status = "P";
                    else status = "P";
                }

                if (status === "P") pCount++;
                else if (status === "A") aCount++;
                else if (status === "WO") woCount++;
                else if (status === "Halfday") halfdayCount++;
                else if (status === "LEAVE") leaveCount++;
            }

            const totalWorkingDays = pCount + woCount + leaveCount + (halfdayCount * 0.5);

            // Calculate prorated salary heads
            const payrollDetails: any = {
                id: emp.id,
                code: emp.code,
                name: emp.name,
                daysInMonth,
                totalWorkingDays,
                heads: {}
            };

            let grossAmount = 0;
            let pfEmp = 0;
            let pfEmployer = 0;
            let esiEmp = 0;
            let esiEmployer = 0;
            let gratuity = 0;

            emp.salaryBreakdown.forEach(breakdown => {
                const headName = breakdown.headName;
                const valuePerDay = breakdown.netAmount / daysInMonth;
                const calculatedValue = valuePerDay * totalWorkingDays;
                
                payrollDetails.heads[headName] = calculatedValue;

                const dailyPfEmp = breakdown.pfEmployee / daysInMonth;
                const dailyPfEmployer = breakdown.pfEmployer / daysInMonth;
                const dailyEsiEmp = breakdown.esiEmployee / daysInMonth;
                const dailyEsiEmployer = breakdown.esiEmployer / daysInMonth;
                const dailyGratuity = breakdown.gratuityEmployer / daysInMonth;

                grossAmount += calculatedValue;
                pfEmp += (dailyPfEmp * totalWorkingDays);
                pfEmployer += (dailyPfEmployer * totalWorkingDays);
                esiEmp += (dailyEsiEmp * totalWorkingDays);
                esiEmployer += (dailyEsiEmployer * totalWorkingDays);
                gratuity += (dailyGratuity * totalWorkingDays);
            });

            // CTC = Gross (which is all earning heads) + Employer PF + Employer ESI + Gratuity
            const totalCTC = grossAmount + pfEmployer + esiEmployer + gratuity;
            // Net Pay = Gross - Employee PF - Employee ESI
            const netPay = grossAmount - pfEmp - esiEmp;

            return {
                ...payrollDetails,
                grossAmount,
                pfEmployee: pfEmp,
                pfEmployer: pfEmployer,
                esiEmployee: esiEmp,
                esiEmployer: esiEmployer,
                gratuity,
                totalCTC,
                netPay
            };
        });

        // We also need to send a distinct list of all salary heads so frontend can render columns dynamically
        const allHeads = Array.from(new Set(
            employees.flatMap(emp => emp.salaryBreakdown.map(b => b.headName))
        )).sort();

        return NextResponse.json({
            success: true,
            records: result,
            salaryHeads: allHeads
        });
    } catch (error: any) {
        console.error("[PAYROLL GET] Error:", error.message);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
