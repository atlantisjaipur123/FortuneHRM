/**
 * Backend Helper: Extract and Validate Company ID from Request Headers
 * 
 * This function MUST be used in all API routes that require tenant isolation.
 * It reads the x-company-id header and validates it exists.
 * 
 * @throws Error if company ID is missing or invalid
 * @returns The validated company ID string
 */

import { headers } from "next/headers"
import { NextResponse } from "next/server"

/**
 * Extract company ID from request headers
 * 
 * @returns Company ID string
 * @throws Error if company ID is missing
 */
export function getCompanyId(): string {
  const headersList = headers()
  const companyId = headersList.get("x-company-id")

  if (!companyId || companyId.trim() === "") {
    throw new Error("Company ID is required. Please select a company.")
  }

  return companyId.trim()
}

/**
 * Validate that a company exists in the database
 * 
 * @param companyId - Company ID to validate
 * @param prisma - Prisma client instance
 * @returns Company object if valid
 * @throws Error if company doesn't exist or is deleted
 */
export async function validateCompanyId(
  companyId: string,
  prisma: any
): Promise<{ id: string; name: string; status: string }> {
  const company = await prisma.company.findFirst({
    where: {
      id: companyId,
      deletedAt: null, // Ensure company is not soft-deleted
    },
    select: {
      id: true,
      name: true,
      status: true,
    },
  })

  if (!company) {
    throw new Error("Company not found or has been deleted.")
  }

  return company
}

/**
 * Helper to create error response for missing company ID
 */
export function companyIdErrorResponse() {
  return NextResponse.json(
    {
      error: "Company ID is required",
      message: "Please select a company before making this request.",
    },
    { status: 400 }
  )
}

/**
 * Helper to create error response for invalid company
 */
export function invalidCompanyResponse(message?: string) {
  return NextResponse.json(
    {
      error: "Invalid company",
      message: message || "The selected company is invalid or has been deleted.",
    },
    { status: 404 }
  )
}
