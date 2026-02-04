
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getSession } from "@/app/lib/auth";
import { getCompanyId } from "@/app/lib/getCompanyid";

function parseDate(dateInput: any): Date | null {
  if (!dateInput) return null;
  const date = new Date(dateInput);
  return isNaN(date.getTime()) ? null : date;
}

// ---------------------------------------------
// GET → List active PF / ESI / Gratuity rules
// ---------------------------------------------
export async function GET(req: NextRequest) {
  const user = await getSession();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const rateType = searchParams.get("rateType") as "PF" | "ESI" | "GRATUITY" | null;

  let companyId: string | undefined;
  if (user.role !== "super_admin") {
    try {
      companyId = getCompanyId();
      if (!companyId) throw new Error("Missing company");
    } catch {
      return NextResponse.json({ error: "Company context required" }, { status: 400 });
    }
  }

  const rules = await prisma.pFESIRate.findMany({
    where: {
      ...(companyId ? { companyId } : {}),
      ...(rateType ? { rateType } : {}),
      isActive: true,
    },
    orderBy: { effectiveFrom: "desc" },
  });

  return NextResponse.json({ success: true, data: rules });
}

// ---------------------------------------------
// POST → Create new PF / ESI / Gratuity rule
// ---------------------------------------------
export async function POST(req: NextRequest) {
  const user = await getSession();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let companyId: string;
  try {
    companyId = getCompanyId();
    if (!companyId) throw new Error("Missing company ID");
  } catch {
    return NextResponse.json({ error: "Company context required" }, { status: 400 });
  }

  // Verify company exists (critical for avoiding foreign key errors)
  const company = await prisma.company.findUnique({
    where: { id: companyId },
    select: { id: true },
  });
  if (!company) {
    return NextResponse.json({ error: "Company not found" }, { status: 404 });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const {
    rateType,
    effectiveFrom,
    effectiveTo,
    remarks,
    // ESI fields
    empShare,
    employerShare,
    esiWageCeiling,
    // PF fields
    empShareAc1,
    erShareAc2,
    adminChargesAc10,
    epsAc21,
    edliChargesAc21,
    adminChargesAc22,
    calcType,
    pfWageCeiling,
    epsWageCeiling,
    minEpsContribution,
    // Gratuity fields
    gratuityPercent,
    gratuityBase,
  } = body;

  if (!rateType || !["PF", "ESI", "GRATUITY"].includes(rateType)) {
    return NextResponse.json(
      { error: "rateType must be PF, ESI, or GRATUITY" },
      { status: 400 }
    );
  }

  const fromDate = parseDate(effectiveFrom);
  if (!fromDate) {
    return NextResponse.json({ error: "Valid effectiveFrom date is required" }, { status: 400 });
  }

  const toDate = parseDate(effectiveTo);

  // Overlap check (only for PF and ESI – Gratuity can have multiple)
  if (rateType !== "GRATUITY") {
    const overlap = await prisma.pFESIRate.findFirst({
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

    if (overlap) {
      return NextResponse.json(
        { error: `An active ${rateType} rule already exists for the selected date range` },
        { status: 409 }
      );
    }
  }

  try {
    const createData: any = {
      companyId,
      rateType,
      effectiveFrom: fromDate,
      effectiveTo: toDate,
      remarks: remarks || null,
      createdBy: user.id,
      isActive: true,
    };

    // ESI specific fields
    if (rateType === "ESI") {
      createData.empShare = empShare !== undefined ? Number(empShare) : null;
      createData.employerShare = employerShare !== undefined ? Number(employerShare) : null;
      createData.esiWageCeiling = esiWageCeiling !== undefined ? Number(esiWageCeiling) : null;
    }

    // PF specific fields
    if (rateType === "PF") {
      createData.empShareAc1 = empShareAc1 !== undefined ? Number(empShareAc1) : null;
      createData.erShareAc2 = erShareAc2 !== undefined ? Number(erShareAc2) : null;
      createData.adminChargesAc10 = adminChargesAc10 !== undefined ? Number(adminChargesAc10) : null;
      createData.epsAc21 = epsAc21 !== undefined ? Number(epsAc21) : null;
      createData.edliChargesAc21 = edliChargesAc21 !== undefined ? Number(edliChargesAc21) : null;
      createData.adminChargesAc22 = adminChargesAc22 !== undefined ? Number(adminChargesAc22) : null;
      createData.calcType = calcType || null;
      createData.pfWageCeiling = pfWageCeiling !== undefined ? Number(pfWageCeiling) : null;
      createData.epsWageCeiling = epsWageCeiling !== undefined ? Number(epsWageCeiling) : null;
      createData.minEpsContribution = minEpsContribution !== undefined ? Number(minEpsContribution) : null;
    }

    // Gratuity specific fields
    if (rateType === "GRATUITY") {
      createData.gratuityPercent = gratuityPercent !== undefined ? Number(gratuityPercent) : null;
      createData.gratuityBase = gratuityBase || null;
    }

    const rule = await prisma.pFESIRate.create({
      data: createData,
    });

    return NextResponse.json({ success: true, data: rule }, { status: 201 });
  } catch (error: any) {
    console.error("Create statutory rate error:", error);

    if (error.code === "P2003") {
      return NextResponse.json(
        { error: "Foreign key violation – invalid companyId" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error.message || "Failed to create statutory rate" },
      { status: 500 }
    );
  }
}

// ---------------------------------------------
// PATCH → Update existing rule
// ---------------------------------------------
export async function PATCH(req: NextRequest) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let companyId: string;
  try {
    companyId = getCompanyId();
  } catch {
    return NextResponse.json({ error: "Company context required" }, { status: 400 });
  }

  const body = await req.json();
  const { id, ...updates } = body;

  if (!id) {
    return NextResponse.json({ error: "Rule ID required" }, { status: 400 });
  }

  const existing = await prisma.pFESIRate.findUnique({ where: { id } });
  console.log("akash", existing)
  console.log("rahul", companyId, id)
  // if (!existing || existing.companyId !== companyId) {
  //   return NextResponse.json({ error: "Rule not found or access denied" }, { status: 404 });
  // }

  const fromDate = updates.effectiveFrom
    ? parseDate(updates.effectiveFrom)
    : existing.effectiveFrom;

  const toDate =
    updates.effectiveTo !== undefined
      ? parseDate(updates.effectiveTo)
      : existing.effectiveTo;

  if (updates.effectiveFrom && !fromDate) {
    return NextResponse.json({ error: "Invalid effectiveFrom date" }, { status: 400 });
  }

  // 🔒 Overlap check (exclude self)
  if (existing.rateType !== "GRATUITY") {
    const overlap = await prisma.pFESIRate.findFirst({
      where: {
        companyId,
        rateType: existing.rateType,
        id: { not: id },
        isActive: true,
        AND: [
          {
            effectiveFrom: { lte: toDate ?? new Date("9999-12-31") },
          },
          {
            OR: [
              { effectiveTo: null },
              { effectiveTo: { gte: fromDate ?? undefined } },
            ],
          },
        ],
      },
    });

    if (overlap) {
      return NextResponse.json(
        { error: "Updated dates overlap with another active rule" },
        { status: 409 }
      );
    }
  }

  // ✅ Build update object safely
  const updateData: any = {
    updatedBy: user.id,
  };

  // Dates
  if (updates.effectiveFrom) updateData.effectiveFrom = fromDate;
  if (updates.effectiveTo !== undefined) updateData.effectiveTo = toDate;

  if (updates.remarks !== undefined) {
    updateData.remarks = updates.remarks || null;
  }

  // 🔹 ESI
  if (existing.rateType === "ESI") {
    if (updates.empShare !== undefined)
      updateData.empShare = Number(updates.empShare);
    if (updates.employerShare !== undefined)
      updateData.employerShare = Number(updates.employerShare);
    if (updates.esiWageCeiling !== undefined)
      updateData.esiWageCeiling = Number(updates.esiWageCeiling);
  }

  // 🔹 PF
  if (existing.rateType === "PF") {
    if (updates.empShareAc1 !== undefined)
      updateData.empShareAc1 = Number(updates.empShareAc1);
    if (updates.erShareAc2 !== undefined)
      updateData.erShareAc2 = Number(updates.erShareAc2);
    if (updates.adminChargesAc10 !== undefined)
      updateData.adminChargesAc10 = Number(updates.adminChargesAc10);
    if (updates.epsAc21 !== undefined)
      updateData.epsAc21 = Number(updates.epsAc21);
    if (updates.edliChargesAc21 !== undefined)
      updateData.edliChargesAc21 = Number(updates.edliChargesAc21);
    if (updates.adminChargesAc22 !== undefined)
      updateData.adminChargesAc22 = Number(updates.adminChargesAc22);
    if (updates.calcType !== undefined)
      updateData.calcType = updates.calcType || null;
    if (updates.pfWageCeiling !== undefined)
      updateData.pfWageCeiling = Number(updates.pfWageCeiling);
    if (updates.epsWageCeiling !== undefined)
      updateData.epsWageCeiling = Number(updates.epsWageCeiling);
    if (updates.minEpsContribution !== undefined)
      updateData.minEpsContribution = Number(updates.minEpsContribution);
  }

  // 🔹 GRATUITY
  if (existing.rateType === "GRATUITY") {
    if (updates.gratuityPercent !== undefined)
      updateData.gratuityPercent =
        updates.gratuityPercent === ""
          ? null
          : Number(updates.gratuityPercent);

    if (updates.gratuityBase !== undefined)
      updateData.gratuityBase = updates.gratuityBase || null;
  }

  const rule = await prisma.pFESIRate.update({
    where: { id },
    data: updateData,
  });

  return NextResponse.json({ success: true, data: rule });
}


// ---------------------------------------------
// ---------------------------------------------
export async function DELETE(req: NextRequest) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let companyId: string;
  try {
    companyId = getCompanyId();
    if (!companyId) throw new Error();
  } catch {
    return NextResponse.json({ error: "Company context required" }, { status: 400 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Rule ID required" }, { status: 400 });

  const result = await prisma.pFESIRate.updateMany({
    where: { id, companyId },
    data: { isActive: false, updatedBy: user.id },
  });

  if (result.count === 0) {
    return NextResponse.json({ error: "Rule not found or access denied" }, { status: 404 });
  }

  return NextResponse.json({ success: true, message: "Rule deactivated" });
}