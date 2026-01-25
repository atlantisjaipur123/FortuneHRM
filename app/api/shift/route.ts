import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import { getSession } from "@/app/lib/auth";
import { getCompanyId } from "@/app/lib/getCompanyid";

// -----------------------------------------------------
// GET → List shifts (company-scoped)
// -----------------------------------------------------
export async function GET(req: NextRequest) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const companyId = getCompanyId();
    const shifts = await prisma.shift.findMany({
      where: { companyId, isActive: true },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ success: true, shifts });
  } catch (error: any) {
    return NextResponse.json({ error: "Company context required" }, { status: 400 });
  }
}

// -----------------------------------------------------
// POST → Create shift (Aligned with 6-step frontend)
// -----------------------------------------------------
export async function POST(req: NextRequest) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const companyId = getCompanyId();
    const body = await req.json();

    // Validation: Required fields from Step 1 & 2
    if (!body.name || !body.startTime || !body.endTime) {
      return NextResponse.json({ error: "Name, Start Time, and End Time are required" }, { status: 400 });
    }

    // SANITIZATION: Prevents NaN and Negative values [cite: 454-455]
    // We use Math.max(0, ...) to ensure no negative time is ever stored.
    const payload = {
      companyId,
      name: body.name,
      code: body.code || null,
      startTime: body.startTime,
      endTime: body.endTime,
      // Frontend sends minutes, we store as Int
      breakDuration: Math.max(0, Number(body.breakDuration || 0)), 
      // Frontend sends hours as decimal (e.g., 8.5), we store as Float
      workingHours: Math.max(0, Number(body.workingHours || 0)), 
      // Grace periods from Step 2
      checkInAllowedFrom: Math.max(0, Number(body.checkInAllowedFrom || 0)),
      checkOutAllowedFrom: Math.max(0, Number(body.checkOutAllowedFrom || 0)),
      // Additional Step 3-5 fields
      shiftAllowance: !!body.shiftAllowance,
      weeklyOffPattern: body.weeklyOffPattern || [], // Note: Ensure this is a Json field in Prisma
      restrictManagerBackdate: !!body.restrictManagerBackdate,
      restrictHRBackdate: !!body.restrictHRBackdate,
      restrictManagerFuture: !!body.restrictManagerFuture,
      createdBy: user.id,
      isActive: true,
    };

    const shift = await prisma.shift.create({ data: payload });
    return NextResponse.json({ success: true, shift });
  } catch (error: any) {
    if (error.code === "P2002") return NextResponse.json({ error: "Shift code/name already exists" }, { status: 409 });
    console.error("Shift POST error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// -----------------------------------------------------
// PATCH → Update shift (Expects ID in body)
// -----------------------------------------------------
export async function PATCH(req: NextRequest) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const companyId = getCompanyId();
    const { id, ...data } = await req.json();

    if (!id) return NextResponse.json({ error: "Shift ID is required" }, { status: 400 });

    // Scrub numeric fields to prevent negative values on update
    if (data.breakDuration !== undefined) data.breakDuration = Math.max(0, Number(data.breakDuration));
    if (data.workingHours !== undefined) data.workingHours = Math.max(0, Number(data.workingHours));
    if (data.checkInAllowedFrom !== undefined) data.checkInAllowedFrom = Math.max(0, Number(data.checkInAllowedFrom));
    if (data.checkOutAllowedFrom !== undefined) data.checkOutAllowedFrom = Math.max(0, Number(data.checkOutAllowedFrom));

    const result = await prisma.shift.updateMany({
      where: { id, companyId },
      data: { ...data, updatedBy: user.id },
    });

    if (!result.count) return NextResponse.json({ error: "Shift not found" }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}

// -----------------------------------------------------
// DELETE → Soft delete (Expects ID in body per frontend)
// -----------------------------------------------------
export async function DELETE(req: NextRequest) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const companyId = getCompanyId();
    const { id } = await req.json(); // Correctly parses JSON body from frontend API() call

    if (!id) return NextResponse.json({ error: "Shift ID is required" }, { status: 400 });

    await prisma.shift.updateMany({
      where: { id, companyId },
      data: { isActive: false, updatedBy: user.id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}