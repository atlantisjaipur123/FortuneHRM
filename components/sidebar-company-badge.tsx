"use client"

import { Building2, AlertTriangle } from "lucide-react"
import { useCompany } from "@/app/context/company-context"

export function SidebarCompanyBadge() {
  const { company } = useCompany()

  if (!company) {
    return (
      <div className="mx-4 my-3 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 flex items-center gap-2">
        <AlertTriangle className="h-4 w-4 text-destructive" />
        <span className="text-xs font-medium text-destructive">
          No company selected
        </span>
      </div>
    )
  }

  return (
    <div className="mx-4 my-3 rounded-md border bg-muted px-3 py-2">
      <div className="flex items-center gap-2">
        <Building2 className="h-4 w-4 text-primary" />
        <span className="text-xs text-muted-foreground">
          Active Company
        </span>
      </div>
      <div className="mt-1 text-sm font-semibold truncate">
        {company.name}
      </div>
    </div>
  )
}
