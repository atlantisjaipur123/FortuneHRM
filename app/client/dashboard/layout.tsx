import type React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Client Dashboard - HRPro",
  description: "Manage your HR operations from the client dashboard",
}

export default function ClientDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
