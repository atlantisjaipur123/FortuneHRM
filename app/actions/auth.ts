"use server"

import { signIn, signUp, signOut, createCompany, getSession } from "@/app/lib/auth"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"

export async function loginAction(formData: FormData): Promise<void> {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  if (!email || !password) {
    throw new Error("Email and password are required")
  }

  const result = await signIn(email, password)

  if (!result.success) {
    throw new Error(result.error || "Login failed")
  }

  if (result.user?.role === "super_admin") {
    redirect("/super-admin")
  } else if (result.user?.role === "company_admin") {
    if (result.user.companyId) {
      redirect("/dashboard")
    } else {
      redirect("/onboarding")
    }
  }
}

export async function signupAction(formData: FormData): Promise<void> {
  const name = formData.get("name") as string
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  if (!name || !email || !password) {
    throw new Error("All fields are required")
  }

  const result = await signUp(name, email, password)

  if (!result.success) {
    throw new Error(result.error || "Signup failed")
  }

  await signIn(email, password)
  redirect("/onboarding")
}

export async function logoutAction() {
  await signOut()
  redirect("/login")
}

export async function createCompanyAction(formData: any) {
  if (!formData || !(formData instanceof FormData)) {
    console.error("Invalid formData:", { type: typeof formData, value: formData })
    return { error: "Invalid input: FormData expected" }
  }

  const session = await getSession()
  if (!session) {
    redirect("/login")
  }

  const companyName = formData.get("companyName") as string
  const nature = formData.get("nature") as string
  const address = formData.get("address") as string
  const pan = formData.get("pan") as string
  const gstin = formData.get("gstin") as string
  const tan = formData.get("tan") as string

  if (!companyName || !nature || !address || !pan) {
    return { error: "Required fields are missing" }
  }

  try {
    const company = await createCompany({
      name: companyName,
      nature,
      address,
      pan,
      gstin: gstin || "",
      tan: tan || "",
      adminId: session.id,
    })

    revalidatePath("/dashboard")
    return { success: true, company }
  } catch (error) {
    console.error("Create company error:", error)
    return { error: "Failed to create company" }
  }
}