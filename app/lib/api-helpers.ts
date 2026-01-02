import { NextResponse } from "next/server"
import { getCompanyId, validateCompanyId, companyIdErrorResponse, invalidCompanyResponse } from "./getCompanyid"
import { getSession } from "./auth"
import { prisma } from "./prisma"

/**
 * Helper to create Prisma where clause with company isolation
 * 
 * @param companyId - Company ID to filter by
 * @returns Prisma where clause object
 */
export function withCompanyFilter(companyId: string) {
  return {
    companyId,
    deletedAt: null, // Also filter out soft-deleted records
  }
}

/**
 * Standard API route wrapper (ERROR-FREE VERSION)
 */
export async function withCompany(
  handler: (companyId: string) => Promise<NextResponse> | NextResponse
): Promise<NextResponse> {
  try {
    // 1️⃣ Auth check
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // 2️⃣ Get companyId
    let companyId: string
    try {
      companyId = getCompanyId()
    } catch {
      return companyIdErrorResponse()
    }

    // 3️⃣ Validate company exists
    try {
      await validateCompanyId(companyId, prisma)
    } catch (err: any) {
      return invalidCompanyResponse(err?.message)
    }

    // 4️⃣ Execute handler
    return await handler(companyId)

  } catch (error) {
    console.error("API Error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}