import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getCompanyId } from "@/app/lib/getCompanyid";
import { getSession } from "@/app/lib/auth";

export async function GET() {
  try {
    console.log("[LEAVE GET] Starting request");
    const companyId = getCompanyId();
    console.log("[LEAVE GET] Retrieved companyId:", companyId);
    const policies = await prisma.leavePolicy.findMany({
      where: { companyId },
      orderBy: { createdAt: "desc" },
    });
    console.log("[LEAVE GET] Fetched policies count:", policies.length);
    return NextResponse.json({ success: true, policies });
  } catch (e: any) {
    console.error("[LEAVE GET] Error:", e.message);
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    console.log("[LEAVE POST] Starting request");
    const companyId = getCompanyId();
    const session = await getSession();
    const body = await req.json();

    console.log("[LEAVE POST] companyId:", companyId);
    console.log("[LEAVE POST] body:", body);

    // === EXTRA SAFETY: Verify company actually exists ===
    const company = await prisma.company.findUnique({
      where: { id: companyId, deletedAt: null },
    });

    if (!company) {
      return NextResponse.json({
        success: false,
        error: "Company not found or has been deleted. Please select a valid company from the sidebar."
      }, { status: 400 });
    }

    // Convert "FULL DAY" → "FULL_DAY" for Prisma enum
    const leaveType = (body.type || "FULL DAY")
      .toUpperCase()
      .replace(/ /g, "_") as "FULL_DAY" | "HALF_DAY";

    const policy = await prisma.leavePolicy.create({
      data: {
        companyId,
        name: body.name?.trim(),
        code: body.code?.trim().toUpperCase(),
        description: body.description || null,
        applicability: body.applicability || { all: true, branches: [], departments: [], levels: [], categories: [] },
        status: "Active",

        type: leaveType,
        leaveValue: Number(body.leaveValue) || 1,
        payConsume: !!body.payConsume,
        allowApply: !!body.allowApply,
        halfDay: !!body.halfDay,

        accrueRule: body.accrueRule || "None",
        fixedDays: Number(body.fixedDays) || 0,
        fixedPeriod: body.fixedPeriod || "Yearly",
        plPer: Number(body.plPer) || 0,
        plBasis: body.plBasis || null,
        minAttendance: Number(body.minAttendance) || 0,

        maxPerMonth: Number(body.maxPerMonth) || 0,
        availedFrom: body.availedFrom || "1st",
        autoAllot: !!body.autoAllot,

        restrictDays: Number(body.restrictDays) || 0,
        mandatoryDocDays: Number(body.mandatoryDocDays) || 3,

        allowEncash: !!body.allowEncash,
        minEncash: Number(body.minEncash) || 0,
        maxEncash: Number(body.maxEncash) || 0,

        cfOption: body.cfOption || "Lapse at the end of Year",
        cfMaxLimit: Number(body.cfMaxLimit) || 0,

        createdBy: session?.id || "system",
      },
    });

    console.log("[LEAVE POST] SUCCESS → ID:", policy.id);

    // ═══════════════════════════════════════════════════════════════
    // AUTO-ASSIGN: Create EmployeeLeaveBalance for eligible employees
    // ═══════════════════════════════════════════════════════════════
    try {
      const currentYear = new Date().getFullYear();
      const applicability = (policy.applicability || { all: true }) as any;

      // Build employee filter based on applicability rules
      let empWhere: any = { companyId, deletedAt: null, employmentStatus: "ACTIVE" };

      if (!applicability.all) {
        const andConditions: any[] = [];
        if (applicability.branches?.length > 0) {
          andConditions.push({ branch: { in: applicability.branches } });
        }
        if (applicability.departments?.length > 0) {
          andConditions.push({ department: { in: applicability.departments } });
        }
        if (applicability.levels?.length > 0) {
          andConditions.push({ level: { in: applicability.levels } });
        }
        if (applicability.categories?.length > 0) {
          andConditions.push({ category: { in: applicability.categories } });
        }
        if (andConditions.length > 0) {
          empWhere.AND = andConditions;
        }
      }

      const eligibleEmployees = await prisma.employee.findMany({
        where: empWhere,
        select: { id: true },
      });

      if (eligibleEmployees.length > 0) {
        const totalAllotted = Number(policy.fixedDays) || 0;
        await prisma.employeeLeaveBalance.createMany({
          data: eligibleEmployees.map((emp) => ({
            companyId,
            employeeId: emp.id,
            leavePolicyId: policy.id,
            year: currentYear,
            totalAllotted,
            carriedOver: 0,
            used: 0,
            encashed: 0,
            lapsed: 0,
            balance: totalAllotted,
          })),
          skipDuplicates: true,
        });
        console.log(`[LEAVE POST] Auto-assigned ${policy.code} to ${eligibleEmployees.length} employees`);
      }
    } catch (allocErr: any) {
      // Don't fail the policy creation if allocation has issues
      console.error("[LEAVE POST] Auto-allocation warning:", allocErr.message);
    }

    return NextResponse.json({ success: true, policy }, { status: 201 });
  } catch (e: any) {
    console.error("[LEAVE POST] FAILED:", e.message, "| Code:", e.code);

    if (e.message.includes("Company ID is required")) {
      return NextResponse.json({
        success: false,
        error: "No company selected. Please select a company from the sidebar."
      }, { status: 400 });
    }

    return NextResponse.json({
      success: false,
      error: e.message || "Failed to create leave policy"
    }, { status: 500 });
  }
}

// PATCH and DELETE remain the same as previous version (you can keep them)
export async function PATCH(req: NextRequest) {
  try {
    console.log("[LEAVE PATCH] Starting request");
    const companyId = getCompanyId();
    const session = await getSession();
    const body = await req.json();
    console.log("[LEAVE PATCH] body:", body);
    const { id, ...updateData } = body;

    // === ONLY THIS LINE WAS ADDED - Fixes applicability update ===
    if (updateData.type) {
      updateData.type = updateData.type.toUpperCase().replace(/ /g, "_");
    }

    const policy = await prisma.leavePolicy.update({
      where: { id, companyId },
      data: {
        ...updateData,
        updatedBy: session?.id || "system"
      },
    });

    console.log("[LEAVE PATCH] SUCCESS → ID:", policy.id);
    return NextResponse.json({ success: true, policy });
  } catch (e: any) {
    console.error("[LEAVE PATCH] FAILED:", e.message);
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    console.log("[LEAVE DELETE] Starting request");
    const companyId = getCompanyId();
    console.log("[LEAVE DELETE] Retrieved companyId:", companyId);
    const { id } = await req.json();
    console.log("[LEAVE DELETE] Deleting policy ID:", id);
    await prisma.leavePolicy.delete({ where: { id, companyId } });
    console.log("[LEAVE DELETE] SUCCESS");
    return NextResponse.json({ success: true });
  } catch (e: any) {
    console.error("[LEAVE DELETE] FAILED:", e.message);
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}