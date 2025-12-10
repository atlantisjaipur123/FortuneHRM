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
}

export async function getCompanies(): Promise<Company[]> {
  // Temporary mock data until backend is connected
  return [
    {
      id: "1",
      name: "Tech Corp",
      employees: 120,
      status: "active",
    },
    {
      id: "2",
      name: "Innova Solutions",
      employees: 80,
      status: "inactive",
    }
  ]
}

export async function getCompanyStats() {
  const companies = await getCompanies()

  return {
    totalCompanies: companies.length,
    activeCompanies: companies.filter(c => c.status === "active").length,
    inactiveCompanies: companies.filter(c => c.status === "inactive").length,
  }
}