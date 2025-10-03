import { requireSuperAdmin, getCompanies, getCompanyStats } from "@/app/lib/auth"
import { SuperAdminDashboardClient } from "./SuperAdminDashboardClient"

export default async function SuperAdminDashboard() {
  await requireSuperAdmin()
  
  const companies = getCompanies()
  const stats = getCompanyStats()

  return <SuperAdminDashboardClient companies={companies} stats={stats} />
}