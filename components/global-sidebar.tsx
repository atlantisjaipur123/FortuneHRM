"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  Building2,
  Users,
  Calculator,
  Calendar,
  Clock,
  Settings,
  Menu,
  Home,
  FileText,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  CreditCard,
  Banknote,
  CalendarDays,
  CreditCardIcon,
  TrendingUp,
  UserCheck,
  Clock3,
  Scale,
  Projector,
  Receipt,
} from "lucide-react";
import { LogoutButton } from "@/components/logout-button";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/app/lib/utils";
import { useSidebar } from "@/app/lib/sidebar-context";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Briefcase } from "lucide-react";

// Note: These imports are commented out as they might not be available in all contexts
// import { useAuth } from "@/app/lib/auth"
// import { useClientAuth } from "@/app/lib/client-auth"

interface GlobalSidebarProps {
  user?: any;
  client?: any;
}

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: Home, adminOnly: true },
  { name: "Employees", href: "/dashboard/employees", icon: Users, adminOnly: true },
  { name: "Payroll", href: "/dashboard/payroll", icon: Calculator, adminOnly: true },
  { name: "Leave Management", href: "/dashboard/leave", icon: Calendar, adminOnly: true },
  { name: "Attendance", href: "/dashboard/attendance", icon: Clock, adminOnly: true },
  { name: "Reports", href: "/dashboard/reports", icon: FileText, adminOnly: true },
  { name: "Settings", href: "/dashboard/settings", icon: Settings, adminOnly: true },
];

const clientNavigation = [
  { name: "Dashboard", href: "/client/dashboard", icon: Home },
  { name: "Employees", href: "/client/employees", icon: Users },
  { name: "Attendance", href: "/client/attendance", icon: Clock },
  { name: "Payroll", href: "/client/payroll", icon: Calculator },
  { name: "Leave Requests", href: "/client/leave", icon: Calendar },
  { name: "Reports", href: "/client/reports", icon: BarChart3 },
  { name: "Settings", href: "/client/settings", icon: Settings },
];

const superAdminNavigation = [
  { name: "Dashboard", href: "/super-admin", icon: Home },
  { name: "Companies", href: "/super-admin/companies", icon: Building2 },
  { name: "Employee Details", href: "/super-admin/employee-details", icon: Users },
  { name: "Salary Head", href: "/super-admin/salary-head", icon: Calculator },
];

export function GlobalSidebar({ user, client }: GlobalSidebarProps) {
  const { isCollapsed, toggleSidebar } = useSidebar();
  const pathname = usePathname();
  const [mounted, setMounted] = React.useState(false);
  const [expandedSections, setExpandedSections] = React.useState<Set<string>>(new Set());

  // Load expanded sections from localStorage on mount
  React.useEffect(() => {
    try {
      const savedSections = localStorage.getItem('sidebar-expanded-sections');
      if (savedSections) {
        const sectionsArray = JSON.parse(savedSections);
        setExpandedSections(new Set(sectionsArray));
      }
    } catch (error) {
      console.warn('Failed to load expanded sections from localStorage:', error);
    }
  }, []);

  // Save expanded sections to localStorage when they change
  React.useEffect(() => {
    try {
      localStorage.setItem('sidebar-expanded-sections', JSON.stringify(Array.from(expandedSections)));
    } catch (error) {
      console.warn('Failed to save expanded sections to localStorage:', error);
    }
  }, [expandedSections]);

  // Handle hydration
  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Memoize navigation selection to prevent unnecessary re-renders
  const currentNavigation = React.useMemo(() => {
    if (pathname?.startsWith("/super-admin")) {
      return superAdminNavigation;
    } else if (pathname?.startsWith("/client")) {
      return clientNavigation;
    } else {
      return navigation;
    }
  }, [pathname]);

  // Full menu (with routes added where available)
  const employeeMasterOptions = [
    { id: "employee-details", title: "Employee Details", icon: Users, href: "/super-admin/employee-details" },
    { id: "salary-heads", title: "Salary Heads", icon: DollarSign, href: "/super-admin/salary-head" },
    { id: "salary-setup", title: "Salary SetUp", icon: Calculator },
    { id: "resign-date-setting", title: "Resign Date Setting", icon: Calendar },
    { id: "pf-esi-rate", title: "PF/ESI Rate", icon: CreditCard, href: "/super-admin/PF-ESI" },
    { id: "pf-interest-loan", title: "PF (Interest Due & Loan Applicable)", icon: Banknote },
    { id: "professional-tax-rate", title: "Professional Tax Rate", icon: Calculator },
    { id: "test", title: "test", icon: CalendarDays ,href: "/test"},
    { id: "payment-mode", title: "Payment Mode", icon: CreditCardIcon },
    { id: "increment-due-setup", title: "Increment Due SetUp", icon: TrendingUp },
    { id: "pt-group-master", title: "PT Group Master", icon: Users },
    { id: "reminder-setup", title: "Reminder SetUp", icon: Clock },
    { id: "unpaid-leave-master", title: "Unpaid Leave Master", icon: Calendar },
    { id: "leave-setup", title: "Leave SetUp", icon: CalendarDays },
    { id: "monthly-variables", title: "Monthly Variables", icon: Calculator },
    { id: "import-wkoff-attendance", title: "Import WkOff From Attendance Machine", icon: Clock3 },
    { id: "attendance", title: "Attendance", icon: Clock,href: "/super-admin/attendance" },
    { id: "payroll-cycle", title: "payroll cycle", icon: Clock, href: "/super-admin/payroll-cycle" },
    { id: "leave", title: "Leave", icon: CalendarDays, href: "/super-admin/leave" },
    { id: "monthly-absent", title: "Monthly Absent (Emp./Group Wise)", icon: UserCheck },
    { id: "import-export-days-off", title: "Import/Export Days Off (UnPaid)", icon: FileText },
    { id: "setups", title: "Setups", icon: Settings, href: "/super-admin/setups" },
    { id: "shift", title: "shift", icon: Clock3, href: "/super-admin/shift" },
    { id: "loan-detail", title: "Loan Detail", icon: Banknote },
    { id: "project-master", title: "Project Master", icon: Projector },
    { id: "project-salary-definition", title: "Project Salary Definition", icon: Calculator },
    { id: "reimbursement-type", title: "Reimbursement Type", icon: Receipt },
  ];

  const groupedEmployeeMasterOptions: Record<string, typeof employeeMasterOptions> = {
    "Employee Management": employeeMasterOptions.slice(0, 8),
    "Payroll Configuration": employeeMasterOptions.slice(8, 16),
    "Leave & Attendance": employeeMasterOptions.slice(16, 20),
    "Organizational Setup": employeeMasterOptions.slice(20, 23),
    "Financial Management": employeeMasterOptions.slice(23, 27),
  };

  const toggleSection = React.useCallback((id: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  // Debounced toggle function to prevent rapid state changes
  const debouncedToggleSection = React.useCallback(
    React.useMemo(() => {
      let timeoutId: NodeJS.Timeout;
      return (id: string) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => toggleSection(id), 50);
      };
    }, [toggleSection]),
    [toggleSection]
  );

  // Prevent hydration mismatch - show skeleton instead of empty content
  if (!mounted) {
    return (
      <>
        {/* Desktop Sidebar Skeleton */}
        <div className="hidden lg:flex lg:w-64 lg:flex-col lg:border-r lg:bg-card">
          <div className="flex h-full flex-col">
            <div className="flex h-16 items-center border-b px-6">
              <Building2 className="h-8 w-8 text-primary flex-shrink-0" />
              <div className="ml-3 min-w-0">
                <p className="text-lg font-semibold">HRPro</p>
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
        {/* Mobile Sidebar */}
        <Sheet>
          <SheetContent side="left" className="w-64 p-0">
            <div className="flex h-full flex-col">
              <div className="flex h-16 items-center border-b px-6">
                <Building2 className="h-8 w-8 text-primary flex-shrink-0" />
                <div className="ml-3 min-w-0">
                  <p className="text-lg font-semibold">HRPro</p>
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
          </SheetContent>
        </Sheet>
      </>
    );
  }

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
        {pathname?.startsWith("/super-admin") ? (
          <div className="space-y-1">
            {/* Top-level links */}
            {/* Dashboard as heading (non-clickable) */}
            <div
              className={cn(
                "flex items-center rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground",
                isCollapsed && "justify-center"
              )}
            >
              <Home className={cn("h-4 w-4", !isCollapsed && "mr-3")} />
              {!isCollapsed && "Dashboard"}
            </div>

             {/* Companies button now routes to dashboard */}
             {(() => {
               const href = "/super-admin";
               const isActive = pathname === href;
               return (
                 <Link
                   href={href}
                   className={cn(
                     "flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                     isActive ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                     isCollapsed && "justify-center"
                   )}
                 >
                   <Building2 className={cn("h-4 w-4", !isCollapsed && "mr-3")} />
                   {!isCollapsed && "Companies"}
                 </Link>
               );
             })()}

            {/* Grouped Employee Master like in inner sidebar */}
            {!isCollapsed && (
              <Collapsible open={expandedSections.has("employee-master")} onOpenChange={() => debouncedToggleSection("employee-master")}>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" className="w-full justify-between px-3 py-2 h-auto">
                    <div className="flex items-center">
                      <Users className="mr-2 h-4 w-4" />
                      <span className="font-medium">Employee Master</span>
                    </div>
                    {expandedSections.has("employee-master") ? <ChevronLeft className="h-4 w-4 rotate-90" /> : <ChevronRight className="h-4 w-4" />}
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-1 ml-2">
                  {Object.entries(groupedEmployeeMasterOptions).map(([groupName, options]) => (
                    <Collapsible key={groupName} open={expandedSections.has(groupName)} onOpenChange={() => debouncedToggleSection(groupName)}>
                      <CollapsibleTrigger asChild>
                        <Button variant="ghost" className="w-full justify-between px-3 py-2 h-auto text-sm">
                          <span className="font-medium">{groupName}</span>
                          {expandedSections.has(groupName) ? <ChevronLeft className="h-3 w-3 rotate-90" /> : <ChevronRight className="h-3 w-3" />}
                        </Button>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="space-y-1 ml-3">
                         {options.map((option) => {
                           const Icon = option.icon as any;
                           const href = option.href || "#";
                           // Fixed active state detection - only exact match
                           const isActive = href !== "#" && pathname === href;
                           return (
                             <Link
                               key={option.id}
                               href={href}
                               className={cn(
                                 "flex items-center w-full rounded-md px-2 py-2 text-xs transition-colors",
                                 isActive ? "bg-primary/10 text-primary font-medium" : "hover:bg-muted"
                               )}
                             >
                               <Icon className="mr-2 h-3 w-3" />
                               {option.title}
                             </Link>
                           );
                         })}
                      </CollapsibleContent>
                    </Collapsible>
                  ))}
                </CollapsibleContent>
              </Collapsible>
            )}
          </div>
        ) : (
           currentNavigation.map((item) => {
             // Fixed active state detection for main navigation - exact match only
             const isActive = pathname === item.href;
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
               >
                 <item.icon className={cn("h-4 w-4", !isCollapsed && "mr-3")} />
                 {!isCollapsed && item.name}
               </Link>
             );
           })
        )}
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
   );

  return (
    <>
      {/* Desktop Sidebar */}
      <div
        className={cn(
          "hidden lg:flex lg:flex-col lg:border-r lg:bg-card transition-all duration-300",
          isCollapsed ? "lg:w-16" : "lg:w-64"
        )}
      >
        <SidebarContent />
      </div>

      {/* Mobile Sidebar */}
      <Sheet>
        <SheetContent side="left" className="w-64 p-0">
          <SidebarContent />
        </SheetContent>
      </Sheet>
    </>
  );
}

export function SidebarToggle() {
  const { isCollapsed, toggleSidebar } = useSidebar();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleSidebar}
      className="hidden lg:flex"
    >
      {isCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
    </Button>
  );
}

export function MobileMenuButton() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="lg:hidden">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-64 p-0">
        <div className="flex h-full flex-col">
          <div className="flex h-16 items-center border-b px-6">
            <Building2 className="h-8 w-8 text-primary flex-shrink-0" />
            <div className="ml-3 min-w-0">
              <p className="text-lg font-semibold">HRPro</p>
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
      </SheetContent>
    </Sheet>
  );
}
