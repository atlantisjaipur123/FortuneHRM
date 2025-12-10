"use server"

import { prisma } from "../lib/prisma"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

export async function loginAction(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  if (!email || !password) {
    redirect("/login?error=Missing credentials")
  }

  // Find user by email
  const user = await prisma.user.findUnique({
    where: { email }
  })

  if (!user) {
    redirect("/login?error=Invalid email or password")
  }

  // Plain text password check (temporary — not secure)
  if (user.password !== password) {
    redirect("/login?error=Invalid email or password")
  }

  // Set session cookie
  cookies().set("session_user", JSON.stringify({
    id: user.id,
    email: user.email,
    name: user.name || "",
    role: user.role,
  }), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
  })

  // Update last login timestamp
  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() }
  })

  // Redirect based on role
  if (user.role === "super_admin") {
    redirect("/super-admin")
  } else if (user.role === "company_admin") {
    redirect("/company-admin")
  } else {
    redirect("/employee")
  }
}
