import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/app/lib/prisma"
import { getSession } from "@/app/lib/auth"

// Helper function to verify super admin access in API routes
async function verifySuperAdmin() {
  const session = await getSession()
  if (!session) {
    throw { status: 401, message: "Unauthorized" }
  }
  if (session.role !== "super_admin") {
    throw { status: 403, message: "Forbidden: Super admin access required" }
  }
  return session
}

// ============================================================================
// POST - Create a backup for a company
// ============================================================================
export async function POST(request: NextRequest) {
  try {
    await verifySuperAdmin()

    const body = await request.json()
    const { companyId } = body

    if (!companyId) {
      return NextResponse.json(
        { error: "Company ID is required" },
        { status: 400 }
      )
    }

    // Check if company exists
    const company = await prisma.company.findUnique({
      where: { id: companyId },
      include: {
        authorizedPerson: true,
        branches: true,
        departments: true,
        designations: true,
        employees: {
          include: {
            familyMembers: true,
            qualifications: true,
            nominees: true,
          },
        },
        salaryHeads: true,
        leaveTypes: true,
        shifts: true,
      },
    })

    if (!company) {
      return NextResponse.json(
        { error: "Company not found" },
        { status: 404 }
      )
    }

    // Create backup record
    const backup = await prisma.backup.create({
      data: {
        companyId,
        version: `backup-${Date.now()}`,
        metadata: {
          company: {
            id: company.id,
            name: company.name,
            code: company.code,
          },
          recordCounts: {
            branches: company.branches.length,
            departments: company.departments.length,
            designations: company.designations.length,
            employees: company.employees.length,
            salaryHeads: company.salaryHeads.length,
            leaveTypes: company.leaveTypes.length,
            shifts: company.shifts.length,
          },
          createdAt: new Date().toISOString(),
        },
      },
    })

    // In a real implementation, you would:
    // 1. Export all company data to a JSON/CSV file
    // 2. Store it in cloud storage (S3, Supabase Storage, etc.)
    // 3. Update the backup record with fileUrl and sizeInBytes

    return NextResponse.json({
      success: true,
      backup: {
        id: backup.id,
        companyId: backup.companyId,
        version: backup.version,
        createdAt: backup.createdAt.toISOString(),
        metadata: backup.metadata,
      },
      message: "Company backup created successfully",
    }, { status: 201 })
  } catch (error: any) {
    console.error("POST backup error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to create backup" },
      { status: 500 }
    )
  }
}

// ============================================================================
// GET - List backups for a company
// ============================================================================
export async function GET(request: NextRequest) {
  try {
    await verifySuperAdmin()

    const { searchParams } = new URL(request.url)
    const companyId = searchParams.get("companyId")

    if (!companyId) {
      return NextResponse.json(
        { error: "Company ID is required" },
        { status: 400 }
      )
    }

    const backups = await prisma.backup.findMany({
      where: { companyId },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({
      success: true,
      backups: backups.map((backup) => ({
        id: backup.id,
        companyId: backup.companyId,
        version: backup.version,
        fileUrl: backup.fileUrl,
        sizeInBytes: backup.sizeInBytes?.toString(),
        metadata: backup.metadata,
        createdAt: backup.createdAt.toISOString(),
      })),
    })
  } catch (error: any) {
    console.error("GET backups error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to fetch backups" },
      { status: 500 }
    )
  }
}

