import { cookies } from "next/headers"
import { redirect } from "next/navigation"

export interface User {
  id: string
  email: string
  name: string
  role: "super_admin" | "company_admin"
  companyId?: string
  companyName?: string
}

export interface Company {
  id: string
  name: string
  nature: string
  address: string
  pan: string
  gstin: string
  tan: string
  adminId: string
  status: "active" | "inactive"
  createdAt: string
}

// Mock database - In production, this would be a real database
const users: (User & { password: string })[] = [
  {
    id: "1",
    email: "admin@hrpro.com",
    name: "Super Admin",
    role: "super_admin",
    password: "admin123",
  },
]

const companies: Company[] = [
  {
    id: "1",
    name: "TechCorp Solutions",
    nature: "Information Technology",
    address: "123 Tech Street, Silicon Valley, CA 94000",
    pan: "ABCDE1234F",
    gstin: "22ABCDE1234F1Z5",
    tan: "DEL12345A",
    adminId: "1",
    status: "active",
    createdAt: "2024-01-15T00:00:00Z",
    adminName: "Alice Johnson"
  },
  {
    id: "2",
    name: "HealthInc Medical",
    nature: "Healthcare",
    address: "456 Health Road, MedCity, NY 10001",
    pan: "FGHIJ5678K",
    gstin: "33FGHIJ5678K1Z6",
    tan: "MUM56789B",
    adminId: "2",
    status: "active",
    createdAt: "2024-02-20T00:00:00Z",
    adminName: "Bob Smith"
  }
]

export async function signIn(
  email: string,
  password: string,
): Promise<{ success: boolean; error?: string; user?: User }> {
  const user = users.find((u) => u.email === email && u.password === password)

  if (!user) {
    return { success: false, error: "Invalid email or password" }
  }

  // Create session
  const sessionData = {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    companyId: user.companyId,
    companyName: user.companyName,
  }

  const cookieStore = await cookies()
  cookieStore.set("session", JSON.stringify(sessionData), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  })

  return { success: true, user: sessionData }
}

export async function signUp(
  name: string,
  email: string,
  password: string,
): Promise<{ success: boolean; error?: string; user?: User }> {
  // Check if user already exists
  if (users.find((u) => u.email === email)) {
    return { success: false, error: "User with this email already exists" }
  }

  // Create new user
  const newUser = {
    id: Date.now().toString(),
    email,
    name,
    role: "company_admin" as const,
    password,
  }

  users.push(newUser)

  return { success: true, user: { id: newUser.id, email: newUser.email, name: newUser.name, role: newUser.role } }
}

export async function createCompany(companyData: Omit<Company, "id" | "createdAt" | "status">) {
  const newCompany: Company = {
    ...companyData,
    id: Date.now().toString(),
    status: "active",
    createdAt: new Date().toISOString(),
  }

  companies.push(newCompany)

  // Update user with company info
  const userIndex = users.findIndex((u) => u.id === companyData.adminId)
  if (userIndex !== -1) {
    users[userIndex].companyId = newCompany.id
    users[userIndex].companyName = newCompany.name
  }

  return newCompany
}

export async function getSession(): Promise<User | null> {
  try {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get("session")

    if (!sessionCookie) {
      return null
    }

    const session = JSON.parse(sessionCookie.value)
    return session
  } catch {
    return null
  }
}

export async function signOut() {
  const cookieStore = await cookies()
  cookieStore.delete("session")
}

export async function requireAuth(): Promise<User> {
  const session = await getSession()
  if (!session) {
    redirect("/login")
  }
  return session
}

export async function requireSuperAdmin(): Promise<User> {
  const session = await requireAuth()
  if (session.role !== "super_admin") {
    redirect("/dashboard")
  }
  return session
}

export async function requireCompanyAdmin(): Promise<User> {
  const session = await requireAuth()
  if (session.role !== "company_admin") {
    redirect("/login")
  }
  return session
}

export function getCompanies(): Company[] {
  return companies
}

export function getCompanyById(id: string): Company | undefined {
  return companies.find((c) => c.id === id)
}

export function updateCompanyStatus(id: string, status: "active" | "inactive"): boolean {
  const companyIndex = companies.findIndex((c) => c.id === id)
  if (companyIndex !== -1) {
    companies[companyIndex].status = status
    return true
  }
  return false
}

export function getCompanyStats() {
  const totalCompanies = companies.length
  const activeCompanies = companies.filter((c) => c.status === "active").length
  const totalEmployees = companies.reduce((acc, company) => {
    // Mock employee count - in real app this would come from database
    return acc + Math.floor(Math.random() * 50) + 10
  }, 0)

  return {
    totalCompanies,
    activeCompanies,
    totalEmployees,
  }
}
