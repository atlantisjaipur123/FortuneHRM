import { requireSuperAdmin, getCompanies, getCompanyStats } from "@/app/lib/auth"
import { SuperAdminDashboardClient } from "./SuperAdminDashboardClient"
import { GlobalLayout } from "@/app/components/global-layout"

export default async function SuperAdminDashboard() {
  await requireSuperAdmin()
  
  const companies = getCompanies()
  const stats = getCompanyStats()

  return (
    <GlobalLayout>
      <SuperAdminDashboardClient companies={companies} stats={stats} />
    </GlobalLayout>
  )
}