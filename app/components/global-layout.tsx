"use client"

import React, { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { GlobalSidebar, SidebarToggle, MobileMenuButton } from '@/components/global-sidebar'
import { useSidebar } from '@/app/lib/sidebar-context'

interface GlobalLayoutProps {
  children: React.ReactNode
}

export function GlobalLayout({ children }: GlobalLayoutProps) {
  const { isCollapsed } = useSidebar()
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)

  // Handle hydration
  useEffect(() => {
    setMounted(true)
  }, [])

  // Don't show sidebar on login/signup pages
  const shouldShowSidebar = !pathname.startsWith('/login') && 
                           !pathname.startsWith('/signup') && 
                           !pathname.startsWith('/onboarding') &&
                           pathname !== '/'

  if (!shouldShowSidebar) {
    return <>{children}</>
  }

  // Prevent hydration mismatch by showing skeleton until mounted
  if (!mounted) {
    return (
      <div className="flex h-screen bg-background">
        {/* Sidebar Skeleton */}
        <div className="hidden lg:flex lg:w-64 lg:flex-col lg:border-r lg:bg-card">
          <div className="flex h-full flex-col">
            <div className="flex h-16 items-center border-b px-6">
              <div className="h-8 w-8 bg-muted rounded animate-pulse" />
              <div className="ml-3 min-w-0">
                <div className="h-6 w-16 bg-muted rounded animate-pulse" />
              </div>
            </div>
            <div className="flex-1 p-4">
              <div className="space-y-2">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-8 bg-muted rounded animate-pulse" />
                ))}
              </div>
            </div>
          </div>
        </div>
        {/* Main Content Skeleton */}
        <div className="flex flex-1 flex-col overflow-hidden">
          <div className="flex h-16 items-center border-b bg-card px-4">
            <div className="flex items-center space-x-4">
              <div className="h-8 w-8 bg-muted rounded animate-pulse" />
              <div className="h-6 w-16 bg-muted rounded animate-pulse" />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-6">
            {children}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Global Sidebar */}
      <GlobalSidebar />

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header className="flex h-16 items-center border-b bg-card px-4">
          <div className="flex items-center space-x-4">
            <MobileMenuButton />
            <SidebarToggle />
            <div className="flex items-center space-x-2">
              <div className="h-6 w-6 bg-primary rounded" />
              <span className="font-semibold">HRPro</span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
