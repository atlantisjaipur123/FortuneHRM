"use server"

import { clientSignIn, clientSignUp, clientSignOut } from "@/lib/client-auth"
import { redirect } from "next/navigation"

export async function clientSignInAction(email: string, password: string) {
  return await clientSignIn(email, password)
}

export async function clientSignUpAction(name: string, email: string, password: string, companyName: string) {
  return await clientSignUp(name, email, password, companyName)
}

export async function clientSignOutAction() {
  await clientSignOut()
  redirect("/client/login")
}
