/**
 * API Route Helpers for Multi-Tenant Isolation
 * 
 * Provides utilities for API routes to ensure strict tenant isolation.
 * Use these helpers in all API routes that access tenant-specific data.
 */

import { NextRequest, NextResponse } from "next/server"
import { getCompanyId, validateCompanyId, companyIdErrorResponse, invalidCompanyResponse } from "./getCompanyid"
import { getSession } from "./auth"
import { prisma } from "./prisma"

/**
 * Standard API route handler wrapper
 * 
 * Automatically:
 * 1. Validates authentication
 * 2. Extracts and validates company ID
 * 3. Validates company exists
 * 4. Provides company context to handler
 * 
 * Usage:
 * ```ts
 * export async function GET(request: NextRequest) {
 *   return withCompany(async (companyId, company, session) => {
 *     // Your handler code here
 *     // companyId is guaranteed to be valid
 *     // company object is guaranteed to exist
 *     // session is guaranteed to be authenticated
 *   })
 * }
 * ```
 */
export async function withCompany<T = any>(
  handler: (
    companyId: string,
    company: { id: string; name: string; status: string },
    session: any
  ) => Promise<NextResponse<T>> | NextResponse<T>
): Promise<NextResponse> {
  try {
    // 1. Validate authentication
    const session = await getSession()
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // 2. Extract company ID from headers
    let companyId: string
    try {
      companyId = getCompanyId()
    } catch (error) {
      return companyIdErrorResponse()
    }

    // 3. Validate company exists
    let company: { id: string; name: string; status: string }
    try {
      company = await validateCompanyId(companyId, prisma)
    } catch (error) {
      return invalidCompanyResponse(error instanceof Error ? error.message : undefined)
    }

    // 4. Execute handler with validated context
    return await handler(companyId, company, session)
  } catch (error) {
    console.error("API route error:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "An unexpected error occurred",
      },
      { status: 500 }
    )
  }
}

/**
 * Create a Prisma where clause with company isolation
 * 
 * Usage:
 * ```ts
 * const employees = await prisma.employee.findMany({
 *   where: {
 *     ...withCompanyFilter(companyId),
 *     // ... other filters
 *   }
 * })
 * ```
 */
export function withCompanyFilter(companyId: string) {
  return {
    companyId,
    deletedAt: null, // Also filter out soft-deleted records
  }
}

/**
 * Validate that a resource belongs to the specified company
 * 
 * @throws Error if resource doesn't belong to company
 */
export async function validateCompanyOwnership(
  model: string,
  resourceId: string,
  companyId: string,
  prismaClient: any
): Promise<void> {
  const resource = await prismaClient[model].findFirst({
    where: {
      id: resourceId,
      companyId,
      deletedAt: null,
    },
  })

  if (!resource) {
    throw new Error(`${model} not found or doesn't belong to the selected company`)
  }
}

