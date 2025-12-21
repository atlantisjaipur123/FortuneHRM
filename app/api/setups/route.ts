import { NextResponse } from "next/server"
import { withCompany } from "@/app/lib/api-helpers"
import { prisma } from "@/app/lib/prisma"

// GET all setups for selected company
export async function GET() {
  return withCompany(async (companyId) => {
    const [
      branches,
      departments,
      designations,
      categories,
      levels,
      grades,
      attendanceTypes,
    ] = await Promise.all([
      prisma.branch.findMany({ where: { companyId }, orderBy: { name: "asc" } }),
      prisma.department.findMany({ where: { companyId }, orderBy: { name: "asc" } }),
      prisma.designation.findMany({ where: { companyId }, orderBy: { name: "asc" } }),
      prisma.employeeCategory.findMany({ where: { companyId }, orderBy: { name: "asc" } }),
      prisma.level.findMany({ where: { companyId }, orderBy: { name: "asc" } }),
      prisma.grade.findMany({ where: { companyId }, orderBy: { name: "asc" } }),
      prisma.attendanceTypeConfig.findMany({ where: { companyId }, orderBy: { name: "asc" } }),
    ])

    return NextResponse.json({
      branches,
      departments,
      designations,
      categories,
      levels,
      grades,
      attendanceTypes,
    })
  })
}

// ADD setup item
export async function POST(req: Request) {
  return withCompany(async (companyId) => {
    const { type, name } = await req.json()

    if (!type || !name?.trim()) {
      return NextResponse.json({ error: "Type and name required" }, { status: 400 })
    }

    const models = {
      branch: prisma.branch,
      department: prisma.department,
      designation: prisma.designation,
      category: prisma.employeeCategory,
      level: prisma.level,
      grade: prisma.grade,
      attendanceType: prisma.attendanceTypeConfig,
    } as const

    const model = models[type as keyof typeof models]
    if (!model) {
      return NextResponse.json({ error: "Invalid setup type" }, { status: 400 })
    }

    try {
      // Branch requires a code field - generate from name
      if (type === "branch") {
        const code = name.trim().toUpperCase().replace(/\s+/g, "_").substring(0, 50)
        const created = await model.create({
          data: { 
            name: name.trim(), 
            companyId,
            code,
            isHeadOffice: false,
          },
        })
        return NextResponse.json(created)
      }

      // Other models just need name and companyId
      const created = await model.create({
        data: { name: name.trim(), companyId },
      })

      return NextResponse.json(created)
    } catch (error: any) {
      console.error("Database error:", error)
      // Handle unique constraint violations
      if (error.code === "P2002") {
        return NextResponse.json(
          { error: `${name.trim()} already exists for this company` },
          { status: 409 }
        )
      }
      return NextResponse.json(
        { error: error.message || "Failed to create setup item" },
        { status: 500 }
      )
    }
  })
}

// DELETE setup item
export async function DELETE(req: Request) {
  return withCompany(async (companyId) => {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")
    const type = searchParams.get("type")

    if (!id || !type) {
      return NextResponse.json({ error: "Missing id or type" }, { status: 400 })
    }

    const models = {
      branch: prisma.branch,
      department: prisma.department,
      designation: prisma.designation,
      category: prisma.employeeCategory,
      level: prisma.level,
      grade: prisma.grade,
      attendanceType: prisma.attendanceTypeConfig,
    } as const

    const model = models[type as keyof typeof models]
    if (!model) {
      return NextResponse.json({ error: "Invalid setup type" }, { status: 400 })
    }

    try {
      // First verify the record belongs to this company
      const record = await model.findFirst({
        where: { id, companyId },
      })

      if (!record) {
        return NextResponse.json(
          { error: "Record not found or does not belong to this company" },
          { status: 404 }
        )
      }

      // Delete the record
      await model.delete({
        where: { id },
      })

      return NextResponse.json({ success: true })
    } catch (error: any) {
      console.error("Delete error:", error)
      if (error.code === "P2025") {
        return NextResponse.json(
          { error: "Record not found" },
          { status: 404 }
        )
      }
      return NextResponse.json(
        { error: error.message || "Failed to delete setup item" },
        { status: 500 }
      )
    }
  })
}
