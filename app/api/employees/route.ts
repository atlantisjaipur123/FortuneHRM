/**
 * Example API Route with Multi-Tenant Isolation
 * 
 * This demonstrates the proper pattern for all tenant-specific API routes:
 * 1. Use withCompany wrapper for automatic validation
 * 2. Always filter by companyId in Prisma queries
 * 3. Never trust client-sent companyId in body
 * 4. Return only data belonging to the selected company
 */

import { NextRequest, NextResponse } from "next/server"
import { withCompany, withCompanyFilter } from "@/app/lib/api-helpers"
import { prisma } from "@/app/lib/prisma"

/**
 * GET /api/employees
 * 
 * List all employees for the selected company
 */
export async function GET(request: NextRequest) {
  return withCompany(async (companyId, company, session) => {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search") || ""
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "50")
    const skip = (page - 1) * limit

    // Build where clause with company isolation
    const where: any = {
      ...withCompanyFilter(companyId), // CRITICAL: Always filter by companyId
    }

    // Add search filter if provided
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { employeeId: { contains: search, mode: "insensitive" } },
      ]
    }

    // Fetch employees with pagination
    const [employees, total] = await Promise.all([
      prisma.employee.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          email: true,
          employeeId: true,
          designation: true,
          department: true,
          createdAt: true,
          // Never include companyId in response (security)
        },
      }),
      prisma.employee.count({ where }),
    ])

    return NextResponse.json({
      data: employees,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      company: {
        id: company.id,
        name: company.name,
      },
    })
  })
}

/**
 * POST /api/employees
 * 
 * Create a new employee for the selected company
 * 
 * IMPORTANT: companyId comes from header, NOT from request body
 */
export async function POST(request: NextRequest) {
  return withCompany(async (companyId, company, session) => {
    const body = await request.json()

    // Validate required fields
    if (!body.name || !body.email) {
      return NextResponse.json(
        { error: "Name and email are required" },
        { status: 400 }
      )
    }

    // Check if email already exists for this company
    const existing = await prisma.employee.findFirst({
      where: {
        ...withCompanyFilter(companyId),
        email: body.email,
      },
    })

    if (existing) {
      return NextResponse.json(
        { error: "Employee with this email already exists" },
        { status: 409 }
      )
    }

    // Create employee - companyId comes from header, NOT body
    const employee = await prisma.employee.create({
      data: {
        name: body.name,
        email: body.email,
        employeeId: body.employeeId,
        designation: body.designation,
        department: body.department,
        phone: body.phone,
        // CRITICAL: Use companyId from header, never from body
        companyId: companyId,
        createdBy: session.id,
      },
      select: {
        id: true,
        name: true,
        email: true,
        employeeId: true,
        designation: true,
        department: true,
        createdAt: true,
      },
    })

    return NextResponse.json(
      {
        data: employee,
        message: "Employee created successfully",
      },
      { status: 201 }
    )
  })
}

