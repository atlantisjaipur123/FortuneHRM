"use client"

import type React from "react"
import { GlobalLayout } from "@/app/components/global-layout"
import type { User } from "@/app/lib/auth"

interface DashboardLayoutProps {
  children: React.ReactNode
  user: User
}

export function DashboardLayout({ children, user }: DashboardLayoutProps) {
  return (
    <GlobalLayout>
      {children}
    </GlobalLayout>
  )
}
