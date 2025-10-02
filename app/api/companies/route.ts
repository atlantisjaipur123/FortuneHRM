import { NextRequest, NextResponse } from "next/server"
import { getCompanies, createCompany } from "@/lib/auth"
import { requireSuperAdmin } from "@/lib/auth"

export async function GET() {
  try {
    const companies = getCompanies()
    return NextResponse.json(companies)
  } catch (error) {
    console.error("Error fetching companies:", error)
    return NextResponse.json({ error: "Failed to fetch companies" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireSuperAdmin()
    
    const body = await request.json()
    const { name, adminName, nature, address, pan, gstin, tan } = body
    
    if (!name || !adminName || !nature || !address || !pan) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }
    
    const company = await createCompany({
      name,
      adminName,
      nature,
      address,
      pan,
      gstin: gstin || "",
      tan: tan || "",
      adminId: "temp_admin_id", // In real app, this would come from session
    })
    
    return NextResponse.json(company)
  } catch (error) {
    console.error("Error creating company:", error)
    return NextResponse.json({ error: "Failed to create company" }, { status: 500 })
  }
}