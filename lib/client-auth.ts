import { cookies } from "next/headers"
import { redirect } from "next/navigation"

export interface Client {
  id: string
  email: string
  name: string
  companyName: string
  companyId: string
  subscriptionPlan: "basic" | "premium" | "enterprise"
  subscriptionStatus: "active" | "inactive" | "trial"
  trialEndsAt?: string
  createdAt: string
}

// Mock client database - In production, this would be a real database
const clients: (Client & { password: string })[] = [
  {
    id: "client_1",
    email: "demo@techcorp.com",
    name: "John Smith",
    companyName: "TechCorp Solutions",
    companyId: "company_1",
    subscriptionPlan: "premium",
    subscriptionStatus: "active",
    password: "demo123",
    createdAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "client_2",
    email: "admin@startupxyz.com",
    name: "Sarah Johnson",
    companyName: "StartupXYZ",
    companyId: "company_2",
    subscriptionPlan: "basic",
    subscriptionStatus: "trial",
    trialEndsAt: "2024-12-31T23:59:59Z",
    password: "startup123",
    createdAt: "2024-01-15T00:00:00Z",
  },
]

export async function clientSignIn(
  email: string,
  password: string,
): Promise<{ success: boolean; error?: string; client?: Client }> {
  const client = clients.find((c) => c.email === email && c.password === password)

  if (!client) {
    return { success: false, error: "Invalid email or password" }
  }

  if (client.subscriptionStatus === "inactive") {
    return { success: false, error: "Your subscription is inactive. Please contact support." }
  }

  // Create client session
  const sessionData = {
    id: client.id,
    email: client.email,
    name: client.name,
    companyName: client.companyName,
    companyId: client.companyId,
    subscriptionPlan: client.subscriptionPlan,
    subscriptionStatus: client.subscriptionStatus,
    trialEndsAt: client.trialEndsAt,
    createdAt: client.createdAt,
  }

  const cookieStore = await cookies()
  cookieStore.set("client_session", JSON.stringify(sessionData), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  })

  return { success: true, client: sessionData }
}

export async function clientSignUp(
  name: string,
  email: string,
  password: string,
  companyName: string,
): Promise<{ success: boolean; error?: string; client?: Client }> {
  // Check if client already exists
  if (clients.find((c) => c.email === email)) {
    return { success: false, error: "Client with this email already exists" }
  }

  // Create new client with trial subscription
  const newClient = {
    id: `client_${Date.now()}`,
    email,
    name,
    companyName,
    companyId: `company_${Date.now()}`,
    subscriptionPlan: "basic" as const,
    subscriptionStatus: "trial" as const,
    trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days trial
    password,
    createdAt: new Date().toISOString(),
  }

  clients.push(newClient)

  const clientData = { ...newClient }
  delete (clientData as any).password

  return { success: true, client: clientData }
}

export async function getClientSession(): Promise<Client | null> {
  try {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get("client_session")

    if (!sessionCookie) {
      return null
    }

    const session = JSON.parse(sessionCookie.value)
    return session
  } catch {
    return null
  }
}

export async function clientSignOut() {
  const cookieStore = await cookies()
  cookieStore.delete("client_session")
}

export async function requireClientAuth(): Promise<Client> {
  const session = await getClientSession()
  if (!session) {
    redirect("/client/login")
  }
  return session
}

export function getClientStats() {
  const totalClients = clients.length
  const activeClients = clients.filter((c) => c.subscriptionStatus === "active").length
  const trialClients = clients.filter((c) => c.subscriptionStatus === "trial").length

  return {
    totalClients,
    activeClients,
    trialClients,
  }
}

export function getClientById(id: string): Client | undefined {
  const client = clients.find((c) => c.id === id)
  if (client) {
    const { password, ...clientData } = client
    return clientData
  }
  return undefined
}
