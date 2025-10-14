"use client"

import type React from "react"
import { GlobalLayout } from "@/app/components/global-layout"
import type { Client } from "@/app/lib/client-auth"

interface ClientDashboardLayoutProps {
  children: React.ReactNode
  client: Client
}

export function ClientDashboardLayout({ children, client }: ClientDashboardLayoutProps) {
  return (
    <GlobalLayout>
      {children}
    </GlobalLayout>
  )
}
