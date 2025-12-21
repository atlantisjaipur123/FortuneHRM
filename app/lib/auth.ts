// app/lib/auth.ts

import { cookies } from "next/headers"
import { redirect } from "next/navigation"

// =========================
// USER SESSION TYPES
// =========================

export interface User {
  id: string
  email: string
  name: string
  role: "super_admin" | "company_admin"
  companyId?: string | null
}

// =========================
// SESSION MANAGEMENT
// =========================

export async function getSession(): Promise<User | null> {
  try {
    const cookie = cookies().get("session_user")
    if (!cookie) return null
    return JSON.parse(cookie.value) as User
  } catch {
    return null
  }
}

export async function signOut() {
  cookies().delete("session_user")
}

// =========================
// ROLE GUARDS
// =========================

export async function requireAuth(): Promise<User> {
  const session = await getSession()
  if (!session) redirect("/login")
  return session
}

export async function requireSuperAdmin(): Promise<User> {
  const session = await requireAuth()
  if (session.role !== "super_admin") redirect("/dashboard")
  return session
}

export async function requireCompanyAdmin(): Promise<User> {
  const session = await requireAuth()
  if (session.role !== "company_admin") redirect("/login")
  return session
}

// =========================
// SUPER ADMIN HELPERS
// (Replace with backend call later)
// =========================

export interface Company {
  id: string
  name: string
  employees: number
  status: "active" | "inactive"
  code?: string
  serviceName?: string
  adminName?: string
  startDate?: string
  endDate?: string
  createdAt?: string
}

export async function getCompanies(): Promise<Company[]> {
  try {
    const { prisma } = await import("./prisma")
    const { CompanyStatus } = await import("@prisma/client")

    const companies = await prisma.company.findMany({
      where: { deletedAt: null },
      include: {
        authorizedPerson: true,
        _count: {
          select: { employees: true },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return companies.map((company) => ({
      id: company.id,
      name: company.name,
      employees: company._count.employees,
      status: company.status === CompanyStatus.ACTIVE ? "active" : "inactive",
      code: company.code,
      serviceName: company.serviceName || undefined,
      adminName: company.authorizedPerson?.name || undefined,
      startDate: company.startDate?.toISOString(),
      endDate: company.endDate?.toISOString(),
      createdAt: company.createdAt.toISOString(),
    }))
  } catch (error) {
    console.error("Error fetching companies:", error)
    // Return empty array on error
    return []
  }
}

export async function getCompanyStats() {
  try {
    const { prisma } = await import("./prisma")
    const { CompanyStatus } = await import("@prisma/client")

    const [totalCompanies, activeCompanies, totalEmployees] = await Promise.all([
      prisma.company.count({ where: { deletedAt: null } }),
      prisma.company.count({
        where: { deletedAt: null, status: CompanyStatus.ACTIVE },
      }),
      prisma.employee.count({
        where: {
          deletedAt: null,
          company: { deletedAt: null },
        },
      }),
    ])

  return {
      totalCompanies,
      activeCompanies,
      inactiveCompanies: totalCompanies - activeCompanies,
      totalEmployees,
    }
  } catch (error) {
    console.error("Error fetching company stats:", error)
    return {
      totalCompanies: 0,
      activeCompanies: 0,
      inactiveCompanies: 0,
      totalEmployees: 0,
    }
  }
}