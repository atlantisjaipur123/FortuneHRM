// app/api/attendance/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getCompanyId } from "@/app/lib/getCompanyid";
import { getSession } from "@/app/lib/auth";

export async function GET(req: NextRequest) {
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

    const result = employees.map(emp => {
        const daysInMonth = new Date(year, month, 0).getDate();
        const attendance = Array.from({ length: daysInMonth }, (_, i) => {
            const d = new Date(year, month - 1, i + 1);
            const rec = daily.find(r => r.employeeId === emp.id && r.date.toDateString() === d.toDateString());
            return rec?.status || "P";
        });

        const empBalances = balances
            .filter(b => b.employeeId === emp.id)
            .reduce((acc, b) => {
                acc[b.leavePolicy.code || b.leavePolicy.name] = b.balance;
                return acc;
            }, {} as Record<string, number>);

        return { ...emp, attendance, leaveBalances: empBalances };
    });

    return NextResponse.json({ success: true, employees: result });
}

export async function POST(req: NextRequest) {
    const companyId = getCompanyId();
    const session = await getSession();
    const { employeeId, date, status, notes } = await req.json();

    const attendanceDate = new Date(date);

    await prisma.attendance.upsert({
        where: { employeeId_date: { employeeId, date: attendanceDate } },
        update: { status, notes, updatedBy: session?.id || "system" },
        create: {
            companyId, employeeId, date: attendanceDate, status: status as any,
            notes: notes || null, createdBy: session?.id || "system",
        },
    });

    // Auto deduct leave balance (uses your existing EmployeeLeaveBalance model)
    if (["CL", "PL", "SL", "LWP"].includes(status)) {
        const policy = await prisma.leavePolicy.findFirst({ where: { companyId, code: status } });
        if (policy) {
            await prisma.employeeLeaveBalance.upsert({
                where: { employeeId_leavePolicyId_year: { employeeId, leavePolicyId: policy.id, year: attendanceDate.getFullYear() } },
                update: { used: { increment: 1 }, balance: { decrement: 1 } },
                create: {
                    companyId, employeeId, leavePolicyId: policy.id, year: attendanceDate.getFullYear(),
                    totalAllotted: policy.fixedDays || 0, used: 1, balance: (policy.fixedDays || 0) - 1,
                    carriedOver: 0, encashed: 0, lapsed: 0,
                },
            });
        }
    }

    return NextResponse.json({ success: true });
}