// app/actions/auth.ts  ← FIXED: proper error messages

"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"

export async function loginAction(formData: FormData) {
  const email = formData.get("email")?.toString().trim()
  const password = formData.get("password")?.toString()

  if (!email || !password) {
    return redirect(`/login?error=${encodeURIComponent("Email and password required")}`)
  }

  try {
    const res = await fetch(`${API_URL}/api/v1/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    })

    // Only treat network/backend-down as "cannot reach"
    if (!res.ok && res.status >= 500) {
      console.error("Backend unreachable:", res.status)
      return redirect(`/login?error=${encodeURIComponent("Cannot reach server. Try again later.")}`)
    }

    const result = await res.json()

    // All 4xx cases (401, 400, etc.) → wrong credentials
    if (!result.success || !result.user) {
      return redirect(`/login?error=${encodeURIComponent("Invalid email or password")}`)
    }

    // Success → save session
    cookies().set("session", JSON.stringify(result.user), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 8,
    })

    return redirect("/super-admin")

  } catch (err) {
    // Only real network errors reach here
    console.error("Network error:", err)
    return redirect(`/login?error=${encodeURIComponent("Cannot reach server. Try again later.")}`)
  }
}

export async function logoutAction() {
  cookies().delete("session")
  redirect("/login")
}