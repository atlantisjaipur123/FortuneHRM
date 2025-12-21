import { CompanyGuard } from "@/app/components/company-guard"
import { ReactNode } from "react"

export default function CompanyLayout({ children }: { children: ReactNode }) {
  return <CompanyGuard>{children}</CompanyGuard>
}
