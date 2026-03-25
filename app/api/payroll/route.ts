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

        // Fetch Rules
        const pfRule = await prisma.pFESIRate.findFirst({
            where: { companyId, rateType: "PF", isActive: true },
            orderBy: { effectiveFrom: "desc" },
        });

        const esiRule = await prisma.pFESIRate.findFirst({
            where: { companyId, rateType: "ESI", isActive: true },
            orderBy: { effectiveFrom: "desc" },
        });

        const gratuityRule = await prisma.pFESIRate.findFirst({
            where: { companyId, rateType: "GRATUITY", isActive: true },
            orderBy: { effectiveFrom: "desc" },
        });

        // Fetch salary heads to know what's applicable for PF/ESI/Gratuity
        const allSystemHeads = await prisma.salaryHead.findMany({
            where: { companyId }
        });

        const getHeadApplicability = (headName: string) => {
            const head = allSystemHeads.find(h => h.name === headName);
            return (head?.applicableFor as any) || {};
        };

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
                const rec = daily.find(r => r.date.toDateString() === d.toDateString() && r.employeeId === emp.id);
                
                let isWO = false;
                if (!rec && empShift?.defineWeeklyOff && (empShift.weeklyOffPattern as any)) {
                    const dayName = d.toLocaleString('en-US', { weekday: 'short' });
                    const weekOfMonth = Math.ceil(d.getDate() / 7);
                    const patterns = (empShift.weeklyOffPattern as any) || [];
                    isWO = patterns.some((p: any) => p.type === "Full day" && p.week === weekOfMonth && p.day === dayName);
                }

                let status = "P";
                if (!rec) {
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

            const payrollDetails: any = {
                id: emp.id,
                code: emp.code,
                name: emp.name,
                daysInMonth,
                totalWorkingDays,
                heads: {}
            };

            let grossAmount = 0;
            let pfBaseMonth = 0;
            let esiBaseMonth = 0;
            let gratuityBaseMonth = 0;

            // 1. Prorate each head
            emp.salaryBreakdown.forEach(breakdown => {
                const headName = breakdown.headName;
                const valuePerDay = breakdown.netAmount / daysInMonth;
                const calculatedValue = valuePerDay * totalWorkingDays;
                
                payrollDetails.heads[headName] = calculatedValue;
                
                grossAmount += calculatedValue;

                const applicableFor = getHeadApplicability(headName);
                if (applicableFor.PF) pfBaseMonth += calculatedValue;
                if (applicableFor.ESI) esiBaseMonth += calculatedValue;
                if (applicableFor.Gratuity) gratuityBaseMonth += calculatedValue;
            });

            let pfEmp = 0;
            let pfEmployer = 0;
            let esiEmp = 0;
            let esiEmployer = 0;
            let gratuity = 0;

            // 2. PF Calculation
            if (pfRule?.isActive && pfBaseMonth > 0) {
                const pfWageCeiling = pfRule.pfWageCeiling || Infinity;
                const pfBase = Math.min(pfBaseMonth, pfWageCeiling);
                
                if (pfRule.empShareAc1) pfEmp = Math.round((pfBase * pfRule.empShareAc1) / 100);
                
                if (pfRule.erShareAc2) pfEmployer += (pfBase * pfRule.erShareAc2) / 100;
                if (pfRule.epsAc21) pfEmployer += (pfBase * pfRule.epsAc21) / 100;
                if (pfRule.edliChargesAc21) pfEmployer += (pfBase * pfRule.edliChargesAc21) / 100;
                if (pfRule.adminChargesAc10) pfEmployer += (pfBase * pfRule.adminChargesAc10) / 100;
                pfEmployer = Math.round(pfEmployer);
            }

            // 3. ESI Calculation (ESI is typically on gross if no specific applicability mapped)
            if (esiRule?.isActive && esiBaseMonth > 0) {
                const esiWageCeiling = esiRule.esiWageCeiling || Infinity;
                // ESI is calculated on gross
                if (grossAmount <= esiWageCeiling) {
                    if (esiRule.empShare) esiEmp = Math.round((grossAmount * esiRule.empShare) / 100);
                    if (esiRule.employerShare) esiEmployer = Math.round((grossAmount * esiRule.employerShare) / 100);
                }
            }

            // 4. Gratuity Calculation
            if (gratuityBaseMonth > 0) {
                if (gratuityRule?.isActive && gratuityRule.gratuityPercent) {
                    gratuity = Math.round((gratuityBaseMonth * gratuityRule.gratuityPercent) / 100);
                } else {
                    gratuity = Math.round((gratuityBaseMonth * 15) / 26 / 12);
                }
            }

            // CTC = Gross (which is all earning heads) + Employer PF + Employer ESI + Gratuity
            const totalCTC = Math.round(grossAmount + pfEmployer + esiEmployer + gratuity);
            // Net Pay = Gross - Employee PF - Employee ESI
            const netPay = Math.round(grossAmount - pfEmp - esiEmp);

            return {
                ...payrollDetails,
                grossAmount: Math.round(grossAmount),
                pfEmployee: pfEmp,
                pfEmployer: pfEmployer,
                esiEmployee: esiEmp,
                esiEmployer: esiEmployer,
                gratuity,
                totalCTC,
                netPay
            };
        });

        // Check which ones are already saved
        const existingRecords = await prisma.payrollRecord.findMany({
            where: { companyId, month, year }
        });
        const savedMap = new Map(existingRecords.map(r => [r.employeeId, true]));

        result.forEach(r => {
            r.isSaved = savedMap.has(r.id);
        });

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

export async function POST(req: NextRequest) {
    try {
        const companyId = getCompanyId();
        const payload = await req.json();
        const { records, month, year } = payload;

        if (!Array.isArray(records) || !month || !year) {
            return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
        }

        const dataToSave = records.map(record => ({
            companyId,
            employeeId: record.id,
            month: Number(month),
            year: Number(year),
            totalWorkingDays: record.totalWorkingDays,
            basicSalary: 0, 
            hra: 0,
            grossSalary: record.grossAmount,
            providentFund: record.pfEmployee,
            esi: record.esiEmployee,
            loanDeduction: 0,
            advanceDeduction: 0,
            professionalTax: 0,
            tds: 0,
            netSalary: record.netPay,
            processedDate: new Date(),
            status: "PROCESSED",
            notes: "",
            metadata: {
                heads: record.heads,
                pfEmployer: record.pfEmployer,
                esiEmployer: record.esiEmployer,
                gratuity: record.gratuity,
                totalCTC: record.totalCTC,
                daysInMonth: record.daysInMonth
            }
        }));

        const existingRecords = await prisma.payrollRecord.findMany({
            where: {
                companyId,
                month: Number(month),
                year: Number(year),
                employeeId: { in: records.map(r => r.id) }
            }
        });
        const existingMap = new Map(existingRecords.map(r => [r.employeeId, r.id]));

        let createdCount = 0;
        let updatedCount = 0;

        for (const record of dataToSave) {
            const existingId = existingMap.get(record.employeeId);
            if (existingId) {
                await prisma.payrollRecord.update({
                    where: { id: existingId },
                    data: record
                });
                updatedCount++;
            } else {
                await prisma.payrollRecord.create({
                    data: record
                });
                createdCount++;
            }
        }

        return NextResponse.json({ success: true, message: `Created ${createdCount}, Updated ${updatedCount} records.` });
    } catch (error: any) {
        console.error("[PAYROLL POST] Error:", error.message);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
