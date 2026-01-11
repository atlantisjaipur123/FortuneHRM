import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/app/lib/prisma"
import { getSession } from "@/app/lib/auth"
import { CompanyStatus, CompanyVisibility, DefaultAttendance, LeaveSetupType, EmployeeListOrder, DeductorType, CompanyType, StateCode, Gender } from "@prisma/client"

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

// Helper function to convert state name (from form) to StateCode enum
function normalizeStateCode(state: string | undefined): StateCode {
  if (!state) return StateCode.MAHARASHTRA
  
  // Convert spaces to underscores and uppercase for enum matching
  const normalized = state.toUpperCase().replace(/\s+/g, "_").replace(/-/g, "_")
  
  // Check if it matches a valid enum value
  const validState = Object.values(StateCode).find(
    (code) => code === normalized || code === state.toUpperCase()
  )
  
  return validState || StateCode.MAHARASHTRA
}

// ============================================================================
// GET - List all companies with optional filters and stats
// ============================================================================
export async function GET(request: NextRequest) {
  try {
    // Verify super admin access
    await verifySuperAdmin()
    
    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search") || ""
    const status = searchParams.get("status") as CompanyStatus | null
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "100")
    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {
      deletedAt: null, // Only show non-deleted companies
    }

    if (status) {
      where.status = status
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { code: { contains: search, mode: "insensitive" } },
        { serviceName: { contains: search, mode: "insensitive" } },
        { authorizedPerson: { name: { contains: search, mode: "insensitive" } } },
      ]
    }

    // Get companies with authorized person and employee count
    const [companies, totalCount] = await Promise.all([
      prisma.company.findMany({
        where,
        skip,
        take: limit,
        include: {
          authorizedPerson: true,
          _count: {
            select: { employees: true },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.company.count({ where }),
    ])

    // Get stats
    const stats = {
      totalCompanies: await prisma.company.count({ where: { deletedAt: null } }),
      activeCompanies: await prisma.company.count({
        where: { deletedAt: null, status: CompanyStatus.ACTIVE },
      }),
      totalEmployees: await prisma.employee.count({
        where: { 
          deletedAt: null,
          company: { deletedAt: null } 
        },
      }),
    }

    // Transform companies to match the expected format
    const formattedCompanies = companies.map((company) => {
      const { _count, ...companyWithoutCount } = company
      return {
        ...companyWithoutCount,
        status: company.status === CompanyStatus.ACTIVE ? "active" : "inactive",
        adminName: company.authorizedPerson?.name,
        startDate: company.startDate?.toISOString(),
        endDate: company.endDate?.toISOString(),
        employees: company._count.employees,
        createdAt: company.createdAt.toISOString(),
      }
    })

    return NextResponse.json({
      success: true,
      companies: formattedCompanies,
      stats,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    })
  } catch (error: any) {
    console.error("GET companies error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to fetch companies" },
      { status: error.status || 500 }
    )
  }
}

// ============================================================================
// POST - Create a new company with authorized person
// ============================================================================
export async function POST(request: NextRequest) {
  try {
    const session = await verifySuperAdmin()

    const body = await request.json()

    // Validate required fields
    if (!body.code || !body.name || !body.pan || !body.tan) {
      return NextResponse.json(
        { error: "Missing required fields: code, name, pan, tan" },
        { status: 400 }
      )
    }

    // Check if code already exists
    const existingCompany = await prisma.company.findUnique({
      where: { code: body.code },
    })

    if (existingCompany) {
      return NextResponse.json(
        { error: "Company code already exists" },
        { status: 400 }
      )
    }

    // Prepare company data
    const companyData: any = {
      code: body.code,
      name: body.name,
      serviceName: body.serviceName || null,
      pan: body.pan,
      tan: body.tan,
      gstin: body.gstin || null,
      flat: body.flat || "",
      road: body.road || null,
      city: body.city || "",
      state: normalizeStateCode(body.state),
      pin: body.pin || "",
      stdCode: body.stdCode || null,
      phone: body.phone || null,
      email: body.email || null,
      website: body.website || null,
      status: body.status === "active" ? CompanyStatus.ACTIVE : CompanyStatus.INACTIVE,
      visibility: body.companyVisibility 
        ? (body.companyVisibility.toUpperCase() as CompanyVisibility) 
        : CompanyVisibility.PRIVATE,
      startDate: body.startDate ? new Date(body.startDate) : null,
      endDate: body.endDate ? new Date(body.endDate) : null,
      dateOfStartingBusiness: body.dateOfStartingBusiness 
        ? new Date(body.dateOfStartingBusiness) 
        : null,
      cin: body.cin || null,
      typeOfCompany: body.typeOfCompany || null,
      natureOfCompany: body.nature || body.natureOfCompany || null,
      pfRegionalOffice: body.pfRegionalOffice || null,
      pensionCoverageDate: body.pensionCoverageDate 
        ? new Date(body.pensionCoverageDate) 
        : null,
      esiLocalOffice: body.esiLocalOffice || null,
      ptoCircleNo: body.ptoCircleNo || null,
      branchDivision: body.branchDivision || "MAIN",
      deductorType: body.deductorType 
        ? (body.deductorType.toUpperCase() as DeductorType) 
        : null,
      defaultAttendance: body.defaultAttendance
        ? (body.defaultAttendance.toUpperCase().replace("-", "_") as DefaultAttendance)
        : DefaultAttendance.PRESENT,
      // Missing fields from form - EPF/ESI/PT
      epfCode: body.epfCode || null,
      pfCoverageDate: body.pfCoverageDate ? new Date(body.pfCoverageDate) : null,
      esiNumber: body.esiNumber || null,
      ptRegCert: body.ptRegCert || null,
      ptEnrCert: body.ptEnrCert || null,
      // Missing fields - Settings
      leaveSetupType: body.leaveSetupType
        ? (body.leaveSetupType.toUpperCase().replace("-", "_") as LeaveSetupType)
        : LeaveSetupType.FINANCIAL_YEAR,
      employeeListOrder: body.employeeListOrder
        ? (body.employeeListOrder.toUpperCase() as EmployeeListOrder)
        : EmployeeListOrder.NAME,
      showBranchName: body.showBranchName === true || body.showBranchName === "true" || false,
      dontGeneratePF: body.dontGeneratePF === true || body.dontGeneratePF === "true" || false,
      // Missing fields - Additional Details
      paoRegNo: body.paoRegNo || null,
      tdsCircle: body.tdsCircle || null,
      labourId: body.labourId || null,
      companyType: body.companyType
        ? (body.companyType.toUpperCase() as CompanyType)
        : null,
      addressChangedEmployer: body.addressChangedEmployer === true || body.addressChangedEmployer === "true" || false,
      createdBy: session.id,
    }

    // Prepare authorized person data if provided
    const authorizedPersonData = body.apName
      ? {
          name: body.apName,
          designation: body.apDesignation || "",
          fatherName: body.apFatherName || null,
          dob: body.apDob ? new Date(body.apDob) : null,
          gender: body.apSex 
            ? (body.apSex.toUpperCase() as Gender) 
            : Gender.MALE,
          premise: body.apPremise || null,
          flat: body.apFlat || body.flat || "",
          road: body.apRoad || body.road || null,
          area: body.apArea || null,
          city: body.apCity || body.city || "",
          state: body.apState || null,
          pin: body.apPin || body.pin || "",
          pan: body.apPan || body.pan,
          email: body.apEmail || body.email || null,
          stdCode: body.apStd || body.apStdCode || null,
          phone: body.apPhone || body.phone || null,
          addressChanged: false,
          createdBy: session.id,
        }
      : null

    // Create company with authorized person in a transaction
    const company = await prisma.$transaction(async (tx) => {
      const newCompany = await tx.company.create({
        data: companyData,
      })
    
      if (authorizedPersonData) {
        await tx.authorizedPerson.create({
          data: {
            ...authorizedPersonData,
            companyId: newCompany.id,
          },
        })
      }
    
      // 🔒 CREATE DEFAULT SYSTEM SALARY HEAD → SPECIAL ALLOWANCE
      await tx.salaryHead.create({
        data: {
          companyId: newCompany.id,
          name: "Special Allowance",
          shortName: "SA",
          fieldType: "Earnings",
          isPercentage: false,
          value: 0,
          isSystem: true,
          systemCode: "SPECIAL_ALLOWANCE",
          form16Field: "Allowance",
          applicableFor: {
            ESI: false,
            Bonus: false,
            PT: false,
            LWF: false,
            Gratuity: false,
            LeaveEncashment: false,
            PF: false,
          },
          createdBy: session.id,
        },
      })
    
      return newCompany
    })
    

    // Fetch the created company with relations
    const createdCompany = await prisma.company.findUnique({
      where: { id: company.id },
      include: {
        authorizedPerson: true,
        _count: { select: { employees: true } },
      },
    })

    const { _count, ...companyWithoutCount } = createdCompany!
    return NextResponse.json({
      success: true,
      company: {
        ...companyWithoutCount,
        status: createdCompany!.status === CompanyStatus.ACTIVE ? "active" : "inactive",
        adminName: createdCompany!.authorizedPerson?.name,
        startDate: createdCompany!.startDate?.toISOString(),
        endDate: createdCompany!.endDate?.toISOString(),
        employees: createdCompany!._count.employees,
        createdAt: createdCompany!.createdAt.toISOString(),
      },
      message: "Company created successfully",
    }, { status: 201 })
  } catch (error: any) {
    console.error("POST company error:", error)
    
    // Handle Prisma unique constraint errors
    if (error.code === "P2002") {
      const field = error.meta?.target?.[0] || "field"
      return NextResponse.json(
        { error: `Company with this ${field} already exists` },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: error.message || "Failed to create company" },
      { status: 500 }
    )
  }
}

// ============================================================================
// PUT - Update an existing company
// ============================================================================
export async function PUT(request: NextRequest) {
  try {
    const session = await verifySuperAdmin()

    const body = await request.json()

    if (!body.id) {
      return NextResponse.json(
        { error: "Company ID is required" },
        { status: 400 }
      )
    }

    // Check if company exists
    const existingCompany = await prisma.company.findUnique({
      where: { id: body.id },
      include: { authorizedPerson: true },
    })

    if (!existingCompany) {
      return NextResponse.json(
        { error: "Company not found" },
        { status: 404 }
      )
    }

    // Prepare update data
    const updateData: any = {
      updatedBy: session.id,
    }

    // Update company fields if provided
    if (body.name !== undefined) updateData.name = body.name
    if (body.code !== undefined) updateData.code = body.code
    if (body.serviceName !== undefined) updateData.serviceName = body.serviceName || null
    if (body.pan !== undefined) updateData.pan = body.pan
    if (body.tan !== undefined) updateData.tan = body.tan
    if (body.gstin !== undefined) updateData.gstin = body.gstin || null
    if (body.flat !== undefined) updateData.flat = body.flat
    if (body.road !== undefined) updateData.road = body.road || null
    if (body.city !== undefined) updateData.city = body.city
    if (body.state !== undefined) updateData.state = normalizeStateCode(body.state)
    if (body.pin !== undefined) updateData.pin = body.pin
    if (body.stdCode !== undefined) updateData.stdCode = body.stdCode || null
    if (body.phone !== undefined) updateData.phone = body.phone || null
    if (body.email !== undefined) updateData.email = body.email || null
    if (body.website !== undefined) updateData.website = body.website || null
    if (body.status !== undefined) {
      updateData.status = body.status === "active" 
        ? CompanyStatus.ACTIVE 
        : CompanyStatus.INACTIVE
    }
    if (body.companyVisibility !== undefined) {
      updateData.visibility = body.companyVisibility.toUpperCase() as CompanyVisibility
    }
    if (body.startDate !== undefined) {
      updateData.startDate = body.startDate ? new Date(body.startDate) : null
    }
    if (body.endDate !== undefined) {
      updateData.endDate = body.endDate ? new Date(body.endDate) : null
    }
    if (body.dateOfStartingBusiness !== undefined) {
      updateData.dateOfStartingBusiness = body.dateOfStartingBusiness 
        ? new Date(body.dateOfStartingBusiness) 
        : null
    }
    if (body.cin !== undefined) updateData.cin = body.cin || null
    if (body.typeOfCompany !== undefined) updateData.typeOfCompany = body.typeOfCompany || null
    if (body.nature || body.natureOfCompany !== undefined) {
      updateData.natureOfCompany = body.nature || body.natureOfCompany || null
    }
    if (body.pfRegionalOffice !== undefined) updateData.pfRegionalOffice = body.pfRegionalOffice || null
    if (body.pensionCoverageDate !== undefined) {
      updateData.pensionCoverageDate = body.pensionCoverageDate 
        ? new Date(body.pensionCoverageDate) 
        : null
    }
    if (body.esiLocalOffice !== undefined) updateData.esiLocalOffice = body.esiLocalOffice || null
    if (body.ptoCircleNo !== undefined) updateData.ptoCircleNo = body.ptoCircleNo || null
    if (body.branchDivision !== undefined) updateData.branchDivision = body.branchDivision
    if (body.deductorType !== undefined) {
      updateData.deductorType = body.deductorType 
        ? (body.deductorType.toUpperCase() as DeductorType) 
        : null
    }
    if (body.defaultAttendance !== undefined) {
      updateData.defaultAttendance = body.defaultAttendance.toUpperCase().replace("-", "_") as DefaultAttendance
    }
    // Missing fields from form - EPF/ESI/PT
    if (body.epfCode !== undefined) updateData.epfCode = body.epfCode || null
    if (body.pfCoverageDate !== undefined) {
      updateData.pfCoverageDate = body.pfCoverageDate ? new Date(body.pfCoverageDate) : null
    }
    if (body.esiNumber !== undefined) updateData.esiNumber = body.esiNumber || null
    if (body.ptRegCert !== undefined) updateData.ptRegCert = body.ptRegCert || null
    if (body.ptEnrCert !== undefined) updateData.ptEnrCert = body.ptEnrCert || null
    // Missing fields - Settings
    if (body.leaveSetupType !== undefined) {
      updateData.leaveSetupType = body.leaveSetupType.toUpperCase().replace("-", "_") as LeaveSetupType
    }
    if (body.employeeListOrder !== undefined) {
      updateData.employeeListOrder = body.employeeListOrder.toUpperCase() as EmployeeListOrder
    }
    if (body.showBranchName !== undefined) {
      updateData.showBranchName = body.showBranchName === true || body.showBranchName === "true"
    }
    if (body.dontGeneratePF !== undefined) {
      updateData.dontGeneratePF = body.dontGeneratePF === true || body.dontGeneratePF === "true"
    }
    // Missing fields - Additional Details
    if (body.paoRegNo !== undefined) updateData.paoRegNo = body.paoRegNo || null
    if (body.tdsCircle !== undefined) updateData.tdsCircle = body.tdsCircle || null
    if (body.labourId !== undefined) updateData.labourId = body.labourId || null
    if (body.companyType !== undefined) {
      updateData.companyType = body.companyType ? (body.companyType.toUpperCase() as CompanyType) : null
    }
    if (body.addressChangedEmployer !== undefined) {
      updateData.addressChangedEmployer = body.addressChangedEmployer === true || body.addressChangedEmployer === "true"
    }

    // Prepare authorized person update data
    const apUpdateData: any = {}
    if (body.apName !== undefined) apUpdateData.name = body.apName
    if (body.apDesignation !== undefined) apUpdateData.designation = body.apDesignation
    if (body.apFatherName !== undefined) apUpdateData.fatherName = body.apFatherName || null
    if (body.apDob !== undefined) apUpdateData.dob = body.apDob ? new Date(body.apDob) : null
    if (body.apSex !== undefined) apUpdateData.gender = body.apSex.toUpperCase() as Gender
    if (body.apPremise !== undefined) apUpdateData.premise = body.apPremise || null
    if (body.apFlat !== undefined) apUpdateData.flat = body.apFlat
    if (body.apRoad !== undefined) apUpdateData.road = body.apRoad || null
    if (body.apArea !== undefined) apUpdateData.area = body.apArea || null
    if (body.apCity !== undefined) apUpdateData.city = body.apCity
    if (body.apState !== undefined) apUpdateData.state = body.apState || null
    if (body.apPin !== undefined) apUpdateData.pin = body.apPin
    if (body.apPan !== undefined) apUpdateData.pan = body.apPan
    if (body.apEmail !== undefined) apUpdateData.email = body.apEmail || null
    if (body.apStd !== undefined || body.apStdCode !== undefined) {
      apUpdateData.stdCode = body.apStd || body.apStdCode || null
    }
    if (body.apPhone !== undefined) apUpdateData.phone = body.apPhone || null

    // Update in transaction
    const updatedCompany = await prisma.$transaction(async (tx) => {
      // Update company
      const company = await tx.company.update({
        where: { id: body.id },
        data: updateData,
      })

      // Update or create authorized person
      if (Object.keys(apUpdateData).length > 0) {
        if (existingCompany.authorizedPerson) {
          await tx.authorizedPerson.update({
            where: { companyId: body.id },
            data: { ...apUpdateData, updatedBy: session.id },
          })
        } else if (apUpdateData.name) {
          // Create authorized person if it doesn't exist
          await tx.authorizedPerson.create({
            data: {
              companyId: body.id,
              ...apUpdateData,
              flat: apUpdateData.flat || company.flat,
              city: apUpdateData.city || company.city,
              pin: apUpdateData.pin || company.pin,
              designation: apUpdateData.designation || "",
              createdBy: session.id,
            },
          })
        }
      }

      return company
    })

    // Fetch updated company with relations
    const result = await prisma.company.findUnique({
      where: { id: updatedCompany.id },
      include: {
        authorizedPerson: true,
        _count: { select: { employees: true } },
      },
    })

    const { _count, ...companyWithoutCount } = result!
    return NextResponse.json({
      success: true,
      company: {
        ...companyWithoutCount,
        status: result!.status === CompanyStatus.ACTIVE ? "active" : "inactive",
        adminName: result!.authorizedPerson?.name,
        startDate: result!.startDate?.toISOString(),
        endDate: result!.endDate?.toISOString(),
        employees: result!._count.employees,
        createdAt: result!.createdAt.toISOString(),
      },
      message: "Company updated successfully",
    })
  } catch (error: any) {
    console.error("PUT company error:", error)
    
    if (error.code === "P2002") {
      const field = error.meta?.target?.[0] || "field"
      return NextResponse.json(
        { error: `Company with this ${field} already exists` },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: error.message || "Failed to update company" },
      { status: 500 }
    )
  }
}

// ============================================================================
// DELETE - Soft delete a company
// ============================================================================
export async function DELETE(request: NextRequest) {
  try {
    await verifySuperAdmin()

    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json(
        { error: "Company ID is required" },
        { status: 400 }
      )
    }

    // Check if company exists
    const company = await prisma.company.findUnique({
      where: { id },
    })

    if (!company) {
      return NextResponse.json(
        { error: "Company not found" },
        { status: 404 }
      )
    }

    // Soft delete by setting deletedAt
    await prisma.company.update({
      where: { id },
      data: { deletedAt: new Date() },
    })

    return NextResponse.json({
      success: true,
      message: "Company deleted successfully",
    })
  } catch (error: any) {
    console.error("DELETE company error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to delete company" },
      { status: 500 }
    )
  }
}

