"use client"

import React, { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Building2, Users, Calculator, Calendar, Clock, Settings, Menu, Home, FileText, BarChart3, ChevronLeft, ChevronRight } from "lucide-react"
import { LogoutButton } from "@/components/logout-button"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/app/lib/utils"

interface CollapsibleSidebarProps {
  user?: any
  client?: any
  navigation?: Array<{
    name: string
    href: string
    icon: any
  }>
}

const defaultNavigation = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "Employees", href: "/dashboard/employees", icon: Users },
  { name: "Payroll", href: "/dashboard/payroll", icon: Calculator },
  { name: "Leave Management", href: "/dashboard/leave", icon: Calendar },
  { name: "Attendance", href: "/dashboard/attendance", icon: Clock },
  { name: "Reports", href: "/dashboard/reports", icon: FileText },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
]

const clientNavigation = [
  { name: "Dashboard", href: "/client/dashboard", icon: Home },
  { name: "Employees", href: "/client/employees", icon: Users },
  { name: "Attendance", href: "/client/attendance", icon: Clock },
  { name: "Payroll", href: "/client/payroll", icon: Calculator },
  { name: "Leave Requests", href: "/client/leave", icon: Calendar },
  { name: "Reports", href: "/client/reports", icon: BarChart3 },
  { name: "Settings", href: "/client/settings", icon: Settings },
]

const superAdminNavigation = [
  { name: "Dashboard", href: "/super-admin", icon: Home },
  { name: "Companies", href: "/super-admin/companies", icon: Building2 },
  { name: "Employee Details", href: "/super-admin/employee-details", icon: Users },
  { name: "Salary Head", href: "/super-admin/salary-head", icon: Calculator },
]

export function CollapsibleSidebar({ user, client, navigation }: CollapsibleSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()

  // Load sidebar state from localStorage on mount
  useEffect(() => {
    const savedState = localStorage.getItem('sidebar-collapsed')
    if (savedState !== null) {
      setIsCollapsed(JSON.parse(savedState))
    }
  }, [])

  // Save sidebar state to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('sidebar-collapsed', JSON.stringify(isCollapsed))
  }, [isCollapsed])

  const toggleSidebar = () => {
    setIsCollapsed(prev => !prev)
  }

  // Determine which navigation to show based on current route
  const getCurrentNavigation = () => {
    if (navigation) return navigation
    if (pathname.startsWith('/super-admin')) {
      return superAdminNavigation
    } else if (pathname.startsWith('/client')) {
      return clientNavigation
    } else {
      return defaultNavigation
    }
  }

  const currentNavigation = getCurrentNavigation()

  const SidebarContent = () => (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex h-16 items-center border-b px-6">
        <Building2 className="h-8 w-8 text-primary flex-shrink-0" />
        {!isCollapsed && (
          <div className="ml-3 min-w-0">
            <p className="text-lg font-semibold">HRPro</p>
            {user && <p className="text-xs text-muted-foreground truncate">{user.companyName}</p>}
            {client && <p className="text-xs text-muted-foreground truncate">{client.companyName}</p>}
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-4 py-4">
        {currentNavigation.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                isCollapsed && "justify-center"
              )}
              onClick={() => setSidebarOpen(false)}
            >
              <item.icon className={cn("h-4 w-4", !isCollapsed && "mr-3")} />
              {!isCollapsed && item.name}
            </Link>
          )
        })}
      </nav>

      {/* User Info */}
      <div className="border-t p-4">
        {!isCollapsed ? (
          <div className="flex items-center justify-between">
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">
                {user?.name || client?.name || "User"}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {user?.email || client?.email || "user@example.com"}
              </p>
            </div>
            <LogoutButton />
          </div>
        ) : (
          <div className="flex justify-center">
            <LogoutButton />
          </div>
        )}
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop Sidebar */}
      <div className={cn(
        "hidden lg:flex lg:flex-col lg:border-r lg:bg-card transition-all duration-300",
        isCollapsed ? "lg:w-16" : "lg:w-64"
      )}>
        <SidebarContent />
      </div>

      {/* Mobile Sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="w-64 p-0">
          <SidebarContent />
        </SheetContent>
      </Sheet>
    </>
  )
}

export function SidebarToggle({ isCollapsed, toggleSidebar }: { isCollapsed: boolean, toggleSidebar: () => void }) {
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleSidebar}
      className="hidden lg:flex"
    >
      {isCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
    </Button>
  )
}

export function MobileMenuButton({ onOpenChange }: { onOpenChange: (open: boolean) => void }) {
  return (
    <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => onOpenChange(true)}>
      <Menu className="h-5 w-5" />
    </Button>
  )
}
