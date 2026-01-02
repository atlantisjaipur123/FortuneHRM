import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import { getSession } from "@/app/lib/auth";
import { getCompanyId } from "@/app/lib/getCompanyid";

// -----------------------------------------------------
// GET → List shifts (company-scoped)
// -----------------------------------------------------
export async function GET(req: NextRequest) {
  const user = await getSession();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let companyId: string;
  try {
    companyId = getCompanyId();
  } catch (error: any) {
    return NextResponse.json(
      { error: "Company ID is required" },
      { status: 400 }
    );
  }

  const shifts = await prisma.shift.findMany({
    where: {
      companyId: companyId,
      isActive: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ success: true, shifts });
}

// -----------------------------------------------------
// POST → Create shift
// -----------------------------------------------------
export async function POST(req: NextRequest) {
  const user = await getSession();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let companyId: string;
  try {
    companyId = getCompanyId();
  } catch (error: any) {
    return NextResponse.json(
      { error: "Company ID is required" },
      { status: 400 }
    );
  }

  const body = await req.json();

  if (!body.name || !body.startTime || !body.endTime) {
    return NextResponse.json(
      { error: "Shift name, startTime and endTime are required" },
      { status: 400 }
    );
  }

  try {
    const shift = await prisma.shift.create({
      data: {
        companyId: companyId,

        name: body.name,
        code: body.code || null,

        startTime: body.startTime,
        endTime: body.endTime,

        breakDuration: body.breakDuration
          ? Number(body.breakDuration)
          : null,

        workingHours: body.workingHours
          ? Number(body.workingHours)
          : null,

        shiftType: body.shiftType || "FIXED",

        checkInAllowedFrom: body.checkInAllowedFrom
          ? Number(body.checkInAllowedFrom)
          : null,

        checkOutAllowedFrom: body.checkOutAllowedFrom
          ? Number(body.checkOutAllowedFrom)
          : null,

        createdBy: user.id,
      },
    });

    return NextResponse.json({ success: true, shift });
  } catch (error: any) {
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "Shift with this name already exists" },
        { status: 409 }
      );
    }

    console.error("Create shift error:", error);
    return NextResponse.json(
      { error: "Failed to create shift" },
      { status: 500 }
    );
  }
}

// -----------------------------------------------------
// PATCH → Update shift (expects id in body)
// -----------------------------------------------------
export async function PATCH(req: NextRequest) {
  const user = await getSession();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let companyId: string;
  try {
    companyId = getCompanyId();
  } catch (error: any) {
    return NextResponse.json(
      { error: "Company ID is required" },
      { status: 400 }
    );
  }

  const { id, ...data } = await req.json();

  if (!id) {
    return NextResponse.json(
      { error: "Shift ID is required" },
      { status: 400 }
    );
  }

  const result = await prisma.shift.updateMany({
    where: {
      id,
      companyId: companyId, // 🔐 multi-tenant protection
    },
    data: {
      ...data,
      updatedBy: user.id,
    },
  });

  if (!result.count) {
    return NextResponse.json(
      { error: "Shift not found or access denied" },
      { status: 404 }
    );
  }

  return NextResponse.json({ success: true });
}

// -----------------------------------------------------
// DELETE → Soft delete (expects id in body)
// -----------------------------------------------------
export async function DELETE(req: NextRequest) {
  const user = await getSession();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let companyId: string;
  try {
    companyId = getCompanyId();
  } catch (error: any) {
    return NextResponse.json(
      { error: "Company ID is required" },
      { status: 400 }
    );
  }

  const { id } = await req.json();

  if (!id) {
    return NextResponse.json(
      { error: "Shift ID is required" },
      { status: 400 }
    );
  }

  await prisma.shift.updateMany({
    where: {
      id,
      companyId: companyId,
    },
    data: {
      isActive: false,
      updatedBy: user.id,
    },
  });

  return NextResponse.json({ success: true });
}
