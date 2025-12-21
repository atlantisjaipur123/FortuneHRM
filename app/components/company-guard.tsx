"use client"

/**
 * Company Guard Component
 * 
 * Blocks page rendering if no company is selected.
 * Shows a warning UI and prevents API calls.
 * 
 * Usage:
 * ```tsx
 * <CompanyGuard>
 *   <YourPageContent />
 * </CompanyGuard>
 * ```
 */

import React from "react"
import { useCompany } from "@/app/context/company-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, Building2 } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

interface CompanyGuardProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function CompanyGuard({ children, fallback }: CompanyGuardProps) {
  const { company } = useCompany()

  // If company is selected, render children
  if (company?.id) {
    return <>{children}</>
  }

  // If custom fallback provided, use it
  if (fallback) {
    return <>{fallback}</>
  }

  // Default: Show warning UI
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <CardTitle>No Company Selected</CardTitle>
          </div>
          <CardDescription>
            You must select a company to access this page.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4">
            <p className="text-sm text-muted-foreground">
              All data in this application is company-specific. Please select a
              company from the dashboard to continue.
            </p>
          </div>
          <div className="flex gap-2">
            <Button asChild className="flex-1">
              <Link href="/super-admin">
                <Building2 className="mr-2 h-4 w-4" />
                Go to Dashboard
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

/**
 * Hook to check if company is selected
 * Useful for conditional rendering or enabling/disabling features
 */
export function useCompanyGuard() {
  const { company } = useCompany()
  
  return {
    hasCompany: !!company?.id,
    company,
    requireCompany: () => {
      if (!company?.id) {
        throw new Error("Company selection is required for this operation")
      }
      return company
    },
  }
}

