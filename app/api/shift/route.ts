import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import { getSession } from "@/app/lib/auth"; // Assuming this gets the user session
import { z } from "zod"; // For professional validation

// Helper to get companyId from headers (sent by api.ts as x-company-id)
const getCompanyId = (req: NextRequest) => {
  const companyId = req.headers.get("x-company-id");
  if (!companyId) throw new Error("Company context required");
  return companyId;
};

// Shared schema for create/update payload validation
const shiftSchema = z.object({
  name: z.string().min(1, "Name is required"),
  code: z.string().max(10).nullable(),
  color: z.string().regex(/^#[0-9a-f]{6}$/i).nullable(), // Hex color
  startTime: z.string().regex(/^\d{2}:\d{2}$/, "Invalid time format"),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, "Invalid time format"),
  breakDuration: z.number().int().min(0),
  workingHours: z.number().min(0),
  firstHalfDuration: z.number().int().min(0),
  secondHalfDuration: z.number().int().min(0),
  checkInGrace: z.number().int().min(0),
  lateGrace: z.number().int().min(0),
  earlyGrace: z.number().int().min(0),
  halfDayThreshold: z.number().int().min(0),
  fullDayThreshold: z.number().int().min(0),
  noAttendanceThreshold: z.number().int().min(0),
  halfDayAbsenceThreshold: z.number().int().min(0),
  earlyCheckoutThreshold: z.number().int().min(0),
  shiftAllowance: z.boolean(),
  defineWeeklyOff: z.boolean(),
  weeklyOffPattern: z.array(z.object({
    week: z.number().int().min(1).max(5),
    day: z.enum(["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]),
    type: z.enum(["Full day", "Time"]),
    time: z.string().regex(/^\d{2}:\d{2}$/).nullable(),
  })).min(0).max(5),
  restrictManagerBackdate: z.boolean(),
  restrictHRBackdate: z.boolean(),
  restrictManagerFuture: z.boolean(),
});

// GET: List active shifts for the company
export async function GET(req: NextRequest) {
  try {
    const user = await getSession();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const companyId = getCompanyId(req);
    const shifts = await prisma.shift.findMany({
      where: { companyId, isActive: true },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ success: true, shifts });
  } catch (error: any) {
    console.error("Shift GET error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}

// POST: Create new shift
export async function POST(req: NextRequest) {
  try {
    const user = await getSession();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const companyId = getCompanyId(req);
    const body = await req.json();

    const validated = shiftSchema.parse(body);

    const shift = await prisma.shift.create({
      data: {
        companyId,
        ...validated,
        createdBy: user.id,
      },
    });

    return NextResponse.json({ success: true, shift }, { status: 201 });
  } catch (error: any) {
    console.error("Shift POST error:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid input", details: error.errors }, { status: 400 });
    }
    if (error.code === "P2002") {
      return NextResponse.json({ error: "Shift name or code already exists" }, { status: 409 });
    }
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}

// PATCH: Update existing shift
export async function PATCH(req: NextRequest) {
  try {
    const user = await getSession();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const companyId = getCompanyId(req);
    const body = await req.json();
    const { id, ...updateData } = body;

    if (!id) return NextResponse.json({ error: "Shift ID is required" }, { status: 400 });

    const validated = shiftSchema.partial().parse(updateData); // Partial for updates

    const result = await prisma.shift.updateMany({
      where: { id, companyId },
      data: { ...validated, updatedBy: user.id, updatedAt: new Date() },
    });

    if (result.count === 0) return NextResponse.json({ error: "Shift not found" }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Shift PATCH error:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid input", details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}

// DELETE: Soft delete shift
export async function DELETE(req: NextRequest) {
  try {
    const user = await getSession();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const companyId = getCompanyId(req);
    const body = await req.json();
    const { id } = body;

    if (!id) return NextResponse.json({ error: "Shift ID is required" }, { status: 400 });

    const result = await prisma.shift.updateMany({
      where: { id, companyId },
      data: { isActive: false, updatedBy: user.id, updatedAt: new Date() },
    });

    if (result.count === 0) return NextResponse.json({ error: "Shift not found" }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Shift DELETE error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}