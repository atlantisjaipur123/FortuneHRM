import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getSession } from "@/app/lib/auth";
import { getCompanyId } from "@/app/lib/getCompanyid";

/* ------------------------------------------------------------------
   GET → List salary heads (company scoped)
-------------------------------------------------------------------*/
export async function GET() {
  const user = await getSession();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const companyId = getCompanyId();

  // Just fetch existing salary heads - no automatic creation
  const salaryHeads = await prisma.salaryHead.findMany({
    where: { companyId },
    orderBy: { createdAt: "asc" },
  });

  // Map to frontend format
  // Ensure all required fields are present
  const mappedHeads = salaryHeads.map((head: any) => ({
    id: head.id,
    name: head.name,
    shortName: head.shortName || "",
    fieldType: head.fieldType,
    isPercentage: head.isPercentage || false,
    value: head.value || 0,
    percentageOf: head.percentageOf || head.calcBase || null, // Support both field names
    form16Field: head.form16Field || null,
    applicableFor: head.applicableFor || {},
    isSystem: head.isSystem || false,
    systemCode: head.systemCode || null,
    createdAt: head.createdAt,
    updatedAt: head.updatedAt,
  }));

  return NextResponse.json({ success: true, salaryHeads: mappedHeads });
}



/* ------------------------------------------------------------------
   POST → Create salary head
-------------------------------------------------------------------*/
export async function POST(req: NextRequest) {
  try {
    const user = await getSession();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let companyId: string;
    try {
      companyId = getCompanyId();
    } catch (error: any) {
      return NextResponse.json(
        { error: error.message || "Company ID is required. Please select a company." },
        { status: 400 }
      );
    }

    const body = await req.json();

    const {
      name,
      shortName,
      fieldType,
      isPercentage,
      percentageOf, // This maps to calcBase in schema
      value,
      form16Field,
      applicableFor,
    } = body;

    if (!name || !fieldType) {
      return NextResponse.json(
        { error: "name and fieldType are required" },
        { status: 400 }
      );
    }

    // Prevent % of itself
    if (isPercentage && percentageOf === shortName) {
      return NextResponse.json(
        { error: "Salary head cannot be percentage of itself" },
        { status: 400 }
      );
    }

    const created = await prisma.salaryHead.create({
      data: {
        companyId,
        name,
        shortName,
        fieldType,
        isPercentage,
        percentageOf: percentageOf || null, // Use percentageOf directly as Prisma expects
        value: value || 0,
        form16Field: form16Field || null,
        applicableFor: applicableFor || {},
        createdBy: user.id,
      },
    });

    return NextResponse.json({ success: true, salaryHead: created });
  } catch (error: any) {
    console.error("Error in POST /api/salary-head:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

/* ------------------------------------------------------------------
   PUT → Update salary head
-------------------------------------------------------------------*/
export async function PUT(req: NextRequest) {
  const user = await getSession();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const companyId = getCompanyId();
  const body = await req.json();

  const {
    id,
    name,
    shortName,
    fieldType,
    isPercentage,
    percentageOf,
    value,
    form16Field,
    applicableFor,
  } = body;

  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  // Prevent cross-company update
  const existing = await prisma.salaryHead.findFirst({
    where: { id, companyId },
  });

  if (!existing) {
    return NextResponse.json(
      { error: "Salary head not found" },
      { status: 404 }
    );
  }

  if (isPercentage && percentageOf === shortName) {
    return NextResponse.json(
      { error: "Salary head cannot be percentage of itself" },
      { status: 400 }
    );
  }

  let updateData: any = {
    updatedBy: user.id,
  };

  // 🚨 SYSTEM HEAD: only name editable
  if (existing.isSystem) {
    updateData.name = name;
  } else {
    // Normal salary head → full edit allowed
    updateData = {
      name,
      shortName,
      fieldType,
      isPercentage,
      percentageOf: percentageOf || null, // Use percentageOf directly as Prisma expects
      value,
      form16Field,
      applicableFor,
      updatedBy: user.id,
    };
  }

  const updated = await prisma.salaryHead.update({
    where: { id },
    data: updateData,
  });


  return NextResponse.json({ success: true, salaryHead: updated });
}

/* ------------------------------------------------------------------
   DELETE → Delete salary head
-------------------------------------------------------------------*/
export async function DELETE(req: NextRequest) {
  const user = await getSession();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await req.json();

  if (!id) {
    return NextResponse.json(
      { error: "Salary head ID is required" },
      { status: 400 }
    );
  }

  // 🔍 Fetch salary head first
  const salaryHead = await prisma.salaryHead.findUnique({
    where: { id },
  });

  if (!salaryHead) {
    return NextResponse.json(
      { error: "Salary head not found" },
      { status: 404 }
    );
  }

  // 🚫 STEP 5: BLOCK SYSTEM HEAD DELETION
  if (salaryHead.isSystem) {
    return NextResponse.json(
      { error: "System salary head cannot be deleted" },
      { status: 400 }
    );
  }

  // ✅ Safe to delete normal heads
  await prisma.salaryHead.delete({
    where: { id },
  });

  return NextResponse.json({ success: true });
}



