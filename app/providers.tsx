"use client"

import { SidebarProvider } from '@/app/lib/sidebar-context'
import { CompanyProvider } from '@/app/context/company-context'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <CompanyProvider>
      <SidebarProvider>
        {children}
      </SidebarProvider>
    </CompanyProvider>
  )
}

