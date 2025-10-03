"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { Building2, Users, Calculator, Calendar, Clock, Settings, Menu, Home, BarChart3 } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/app/lib/utils"
import type { Client } from "@/app/lib/client-auth"
import { clientSignOutAction } from "@/app/actions/client-auth"

interface ClientDashboardLayoutProps {
  children: React.ReactNode
  client: Client
}

const navigation = [
  { name: "Dashboard", href: "/client/dashboard", icon: Home },
  { name: "Employees", href: "/client/employees", icon: Users },
  { name: "Attendance", href: "/client/attendance", icon: Clock },
  { name: "Payroll", href: "/client/payroll", icon: Calculator },
  { name: "Leave Requests", href: "/client/leave", icon: Calendar },
  { name: "Reports", href: "/client/reports", icon: BarChart3 },
  { name: "Settings", href: "/client/settings", icon: Settings },
]

export function ClientDashboardLayout({ children, client }: ClientDashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()

  const getSubscriptionBadge = () => {
    if (client.subscriptionStatus === "trial") {
      return <Badge variant="secondary">Trial</Badge>
    }
    if (client.subscriptionPlan === "premium") {
      return <Badge variant="default">Premium</Badge>
    }
    if (client.subscriptionPlan === "enterprise") {
      return <Badge variant="default">Enterprise</Badge>
    }
    return <Badge variant="outline">Basic</Badge>
  }

  const handleSignOut = async () => {
    await clientSignOutAction()
  }

  const SidebarContent = () => (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex h-16 items-center border-b px-6">
        <Building2 className="h-8 w-8 text-primary" />
        <div className="ml-3 flex-1">
          <p className="text-lg font-semibold">HRPro</p>
          <div className="flex items-center space-x-2">
            <p className="text-xs text-muted-foreground truncate">{client.companyName}</p>
            {getSubscriptionBadge()}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-4 py-4">
        {navigation.map((item) => {
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
              )}
              onClick={() => setSidebarOpen(false)}
            >
              <item.icon className="mr-3 h-4 w-4" />
              {item.name}
            </Link>
          )
        })}
      </nav>

      {/* Trial Info */}
      {client.subscriptionStatus === "trial" && client.trialEndsAt && (
        <div className="mx-4 mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-xs font-medium text-yellow-800">Trial expires:</p>
          <p className="text-xs text-yellow-600">{new Date(client.trialEndsAt).toLocaleDateString()}</p>
          <Button size="sm" className="w-full mt-2" asChild>
            <Link href="/client/upgrade">Upgrade Now</Link>
          </Button>
        </div>
      )}

      {/* User Info */}
      <div className="border-t p-4">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{client.name}</p>
            <p className="text-xs text-muted-foreground truncate">{client.email}</p>
          </div>
          <Button variant="ghost" size="sm" onClick={handleSignOut}>
            Sign Out
          </Button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="flex h-screen bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col lg:border-r lg:bg-card">
        <SidebarContent />
      </div>

      {/* Mobile Sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="w-64 p-0">
          <SidebarContent />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Mobile Header */}
        <header className="flex h-16 items-center border-b bg-card px-4 lg:hidden">
          <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
          </Sheet>
          <div className="ml-4 flex items-center space-x-2">
            <Building2 className="h-6 w-6 text-primary" />
            <span className="font-semibold">HRPro</span>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  )
}
