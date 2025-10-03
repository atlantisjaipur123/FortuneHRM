import { requireSuperAdmin, getCompanyById } from "@/app/lib/auth"
import CompanyDetailsPage from "./CompanyDetailsPage"

type Employee = {
  id: string
  name: string
  position: string
  salary: number
  email?: string
}

export default async function ServerCompanyDetails({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  await requireSuperAdmin()
  const { id } = await params
  const company = getCompanyById(id) ?? null // Convert undefined to null

  // Employees data placeholder (replace with actual fetch)
  const employees: Employee[] = []

  return <CompanyDetailsPage company={company} employees={employees} companyId={id} />
}