"use server"

import { requireSuperAdmin, updateCompanyStatus } from "@/app/lib/auth"
import { revalidatePath } from "next/cache"

export async function toggleCompanyStatusAction(companyId: string, currentStatus: string) {
  await requireSuperAdmin()

  const newStatus = currentStatus === "active" ? "inactive" : "active"
  const success = updateCompanyStatus(companyId, newStatus)

  if (success) {
    revalidatePath("/super-admin")
    return { success: true, message: `Company ${newStatus === "active" ? "activated" : "suspended"} successfully` }
  }

  return { success: false, message: "Failed to update company status" }
}
