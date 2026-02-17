import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma'; // Ensure this path matches your prisma client export
import { getCompanyId } from '@/app/lib/getCompanyid';

export async function GET() {
    try {
        // In a real app, get companyId from session/auth
        const companyId = getCompanyId();

        const leaveConfigs = await prisma.leaveTypeConfig.findMany({
            where: { companyId },
            orderBy: { createdAt: 'desc' },
        });

        // Grouping by "Policy" (since your schema treats types individually, 
        // we mimic the frontend's 'Policy' grouping logic)
        return NextResponse.json({
            data: [{
                name: "Default Policy",
                leaveTypes: leaveConfigs,
                applicability: { type: 'All' },
                status: 'Active'
            }]
        });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { leaveTypes, name } = body;
        const companyId = getCompanyId();

        const created = await prisma.$transaction(
            leaveTypes.map((lt: any) => prisma.leaveTypeConfig.create({
                data: {
                    companyId,
                    name: lt.name,
                    code: lt.code,
                    type: lt.type === 'Half Day' ? 'HALF_DAY' : 'FULL_DAY',
                    payConsume: lt.payConsume,
                    allowApply: lt.allowApply,
                    halfDay: lt.halfDay,
                    accrueRule: lt.accrueRule,
                    fixedDays: lt.fixedDays,
                    fixedPeriod: lt.fixedPeriod,
                    plPer: lt.plPer,
                    plBasis: lt.plBasis,
                    minAttendance: lt.minAttendance,
                    maxPerMonth: lt.maxPerMonth,
                    availedFrom: lt.availedFrom,
                    autoAllot: lt.autoAllot,
                    restrictDays: lt.restrictDays,
                    mandatoryDocDays: lt.mandatoryDocDays,
                    allowEncash: lt.allowEncash,
                    minEncash: lt.minEncash,
                    maxEncash: lt.maxEncash,
                    cfOption: lt.cfOption,
                    cfMaxLimit: lt.cfMaxLimit,
                }
            }))
        );

        return NextResponse.json({ data: created });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}

export async function PUT(req: Request) {
    try {
        const body = await req.json();
        const { leaveTypes } = body;
        const companyId = getCompanyId();

        // Update logic: Delete existing types for company and recreate 
        // or perform individual upserts
        await prisma.$transaction([
            prisma.leaveTypeConfig.deleteMany({ where: { companyId } }),
            ...leaveTypes.map((lt: any) => prisma.leaveTypeConfig.create({
                data: { /* ... same mapping as POST ... */ }
            }))
        ]);

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}

export async function DELETE(req: Request) {
    try {
        const { policyName } = await req.json();
        const companyId = getCompanyId();
        console.log("companyId:", companyId, typeof companyId);


        // Since your schema doesn't have a "Policy" model, 
        // we delete by name or company
        await prisma.leaveTypeConfig.deleteMany({
            where: { companyId, name: policyName }
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}