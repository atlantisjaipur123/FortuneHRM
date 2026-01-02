import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getSession } from "@/app/lib/auth";
import { getCompanyId } from "@/app/lib/getCompanyid";

// ---------------------------------------------
// GET → List PF / ESI rules
// ---------------------------------------------
export async function GET(req: NextRequest) {
  const user = await getSession();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const rateType = searchParams.get("rateType"); // PF | ESI

  let companyId: string | undefined;

  // Super Admin can view all
  if (user.role !== "super_admin") {
    try {
      companyId = getCompanyId();
    } catch {
      return NextResponse.json(
        { error: "Company ID is required" },
        { status: 400 }
      );
    }
  }

  const rules = await prisma.pFESIRate.findMany({
    where: {
      ...(companyId ? { companyId } : {}),
      ...(rateType ? { rateType } : {}),
      isActive: true, // Only return active rules
    },
    orderBy: { effectiveFrom: "desc" },
  });

  return NextResponse.json({ success: true, data: rules });
}

// ---------------------------------------------
// POST → Create PF / ESI rule
// ---------------------------------------------
export async function POST(req: NextRequest) {
  const user = await getSession();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let companyId: string;
  try {
    companyId = getCompanyId();
  } catch {
    return NextResponse.json(
      { error: "Company ID is required" },
      { status: 400 }
    );
  }

  const body = await req.json();

  const {
    rateType, // 'PF' | 'ESI'
    effectiveFrom,
    effectiveTo,
    ...rest
  } = body;

  if (!rateType || !effectiveFrom) {
    return NextResponse.json(
      { error: "rateType and effectiveFrom are required" },
      { status: 400 }
    );
  }

  try {
    const fromDate = new Date(effectiveFrom);
    if (isNaN(fromDate.getTime())) {
      return NextResponse.json(
        { error: "Invalid effectiveFrom date" },
        { status: 400 }
      );
    }
    const toDate = effectiveTo ? new Date(effectiveTo) : null;
    if (toDate && isNaN(toDate.getTime())) {
      return NextResponse.json(
        { error: "Invalid effectiveTo date" },
        { status: 400 }
      );
    }



    const overlap =
  rateType === "GRATUITY"
    ? null
    : await prisma.pFESIRate.findFirst({
        where: {
          companyId,
          rateType,
          isActive: true,
          OR: [
            {
              effectiveFrom: { lte: toDate ?? new Date("9999-12-31") },
              effectiveTo: { gte: fromDate },
            },
            {
              effectiveTo: null,
              effectiveFrom: { lte: toDate ?? new Date("9999-12-31") },
            },
          ],
        },
      });

  
    const createData: any = {
      companyId,
      rateType,
      effectiveFrom: fromDate,
      effectiveTo: toDate,
      createdBy: user.id,
    };

    if (rateType === "ESI") {
      if (rest.empShare !== undefined) createData.empShare = Number(rest.empShare);
      if (rest.employerShare !== undefined) createData.employerShare = Number(rest.employerShare);
      if (rest.esiWageCeiling !== undefined) createData.esiWageCeiling = Number(rest.esiWageCeiling);
      if (rest.remarks !== undefined) createData.remarks = rest.remarks;
    }

    if (rateType === "PF") {
      if (rest.empShareAc1 !== undefined) createData.empShareAc1 = Number(rest.empShareAc1);
      if (rest.erShareAc2 !== undefined) createData.erShareAc2 = Number(rest.erShareAc2);
      if (rest.adminChargesAc10 !== undefined) createData.adminChargesAc10 = Number(rest.adminChargesAc10);
      if (rest.epsAc21 !== undefined) createData.epsAc21 = Number(rest.epsAc21);
      if (rest.edliChargesAc21 !== undefined) createData.edliChargesAc21 = Number(rest.edliChargesAc21);
      if (rest.adminChargesAc22 !== undefined) createData.adminChargesAc22 = Number(rest.adminChargesAc22);
      if (rest.calcType !== undefined) createData.calcType = rest.calcType;
      if (rest.pfWageCeiling !== undefined) createData.pfWageCeiling = Number(rest.pfWageCeiling);
      if (rest.epsWageCeiling !== undefined) createData.epsWageCeiling = Number(rest.epsWageCeiling);
      if (rest.minEpsContribution !== undefined) createData.minEpsContribution = Number(rest.minEpsContribution);
      if (rest.remarks !== undefined) createData.remarks = rest.remarks;
    }

    if (rateType === "GRATUITY") {
      if (rest.employerShare !== undefined)
        createData.employerShare = Number(rest.employerShare);
      if (rest.remarks !== undefined)
        createData.remarks = rest.remarks;
    }


    const rule = await prisma.pFESIRate.create({
      data: createData,
    });

    return NextResponse.json({ success: true, data: rule });
  } catch (error: any) {
    console.error("Create PF/ESI rule error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create PF/ESI rule" },
      { status: 500 }
    );
  }
}


export async function PATCH(req: NextRequest) {
  const user = await getSession();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let companyId: string;
  try {
    companyId = getCompanyId();
  } catch {
    return NextResponse.json(
      { error: "Company ID is required" },
      { status: 400 }
    );
  }

  const body = await req.json();
  const { id, ...data } = body;

  if (!id) {
    return NextResponse.json(
      { error: "Rule ID is required" },
      { status: 400 }
    );
  }

  // Verify rule belongs to company
  const existing = await prisma.pFESIRate.findFirst({
    where: { id, companyId },
  });

  if (!existing) {
    return NextResponse.json(
      { error: "Rule not found or access denied" },
      { status: 404 }
    );
  }

  // Handle date fields
  const updateData: any = { ...data };
  if (data.effectiveFrom) {
    updateData.effectiveFrom = new Date(data.effectiveFrom);
  }
  if (data.effectiveTo !== undefined) {
    updateData.effectiveTo = data.effectiveTo ? new Date(data.effectiveTo) : null;
  }
  updateData.updatedBy = user.id;

  // Check for overlapping rules (excluding current rule)
  if (updateData.effectiveFrom || updateData.effectiveTo !== undefined) {
    const fromDate = updateData.effectiveFrom || existing.effectiveFrom;
    const toDate = updateData.effectiveTo !== undefined ? updateData.effectiveTo : existing.effectiveTo;

    const overlap = await prisma.pFESIRate.findFirst({
      where: {
        companyId,
        rateType: existing.rateType,
        id: { not: id }, // Exclude current rule
        isActive: true,
        OR: [
          {
            effectiveFrom: { lte: toDate ?? new Date("9999-12-31") },
            effectiveTo: { gte: fromDate },
          },
          {
            effectiveTo: null,
            effectiveFrom: { lte: toDate ?? new Date("9999-12-31") },
          },
        ],
      },
    });

    if (overlap) {
      return NextResponse.json(
        { error: "Overlapping rule exists for selected date range" },
        { status: 409 }
      );
    }
  }

  const rule = await prisma.pFESIRate.update({
    where: { id },
    data: updateData,
  });

  return NextResponse.json({ success: true, data: rule });
}


export async function DELETE(req: NextRequest) {
  const user = await getSession();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let companyId: string;
  try {
    companyId = getCompanyId();
  } catch {
    return NextResponse.json(
      { error: "Company ID is required" },
      { status: 400 }
    );
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json(
      { error: "Rule ID is required" },
      { status: 400 }
    );
  }

  // Verify rule belongs to company and soft delete
  const result = await prisma.pFESIRate.updateMany({
    where: {
      id,
      companyId,
    },
    data: {
      isActive: false,
      updatedBy: user.id,
    },
  });

  if (!result.count) {
    return NextResponse.json(
      { error: "Rule not found or access denied" },
      { status: 404 }
    );
  }

  return NextResponse.json({ success: true });
}