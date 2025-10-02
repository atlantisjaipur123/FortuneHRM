import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Users, Calendar, Calculator, Clock, Plus, TrendingUp, AlertCircle, CheckCircle } from "lucide-react"
import { requireCompanyAdmin } from "@/lib/auth"
import { DashboardLayout } from "@/components/dashboard-layout"
import Link from "next/link"

export default async function CompanyDashboard() {
  const user = await requireCompanyAdmin()

  // Mock data - in real app this would come from database
  const dashboardData = {
    totalEmployees: 45,
    activeEmployees: 42,
    pendingLeaveRequests: 3,
    upcomingPayrollDate: "2024-01-31",
    recentActivities: [
      { id: 1, type: "employee_added", message: "John Doe added to Engineering", time: "2 hours ago" },
      { id: 2, type: "leave_approved", message: "Leave request approved for Jane Smith", time: "4 hours ago" },
      { id: 3, type: "payroll_processed", message: "December payroll processed successfully", time: "1 day ago" },
    ],
    quickStats: {
      presentToday: 38,
      onLeaveToday: 4,
      lateArrivals: 2,
    },
  }

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div>
          <h1 className="text-3xl font-bold text-balance">Welcome back, {user.name}</h1>
          <p className="text-muted-foreground">Here's what's happening at {user.companyName} today.</p>
        </div>

        {/* Quick Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData.totalEmployees}</div>
              <p className="text-xs text-muted-foreground">{dashboardData.activeEmployees} active</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Leave Requests</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData.pendingLeaveRequests}</div>
              <p className="text-xs text-muted-foreground">Requires your attention</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Present Today</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData.quickStats.presentToday}</div>
              <p className="text-xs text-muted-foreground">{dashboardData.quickStats.onLeaveToday} on leave</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Next Payroll</CardTitle>
              <Calculator className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Jan 31</div>
              <p className="text-xs text-muted-foreground">5 days remaining</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick Actions */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common tasks and shortcuts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button asChild className="w-full justify-start">
                <Link href="/dashboard/employees/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Add New Employee
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start bg-transparent">
                <Link href="/dashboard/payroll/run">
                  <Calculator className="mr-2 h-4 w-4" />
                  Run Payroll
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start bg-transparent">
                <Link href="/dashboard/leave-requests">
                  <Calendar className="mr-2 h-4 w-4" />
                  Review Leave Requests
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start bg-transparent">
                <Link href="/dashboard/attendance">
                  <Clock className="mr-2 h-4 w-4" />
                  View Attendance
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Recent Activities */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Recent Activities</CardTitle>
              <CardDescription>Latest updates and changes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dashboardData.recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{activity.message}</p>
                      <p className="text-xs text-muted-foreground">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Alerts and Notifications */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertCircle className="mr-2 h-5 w-5 text-amber-500" />
                Attention Required
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Pending leave requests</span>
                <Badge variant="secondary">{dashboardData.pendingLeaveRequests}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Late arrivals today</span>
                <Badge variant="secondary">{dashboardData.quickStats.lateArrivals}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Incomplete employee profiles</span>
                <Badge variant="secondary">2</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="mr-2 h-5 w-5 text-green-500" />
                This Month's Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">New employees added</span>
                <Badge>3</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Average attendance</span>
                <Badge>94.2%</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Payroll processed</span>
                <Badge className="bg-green-100 text-green-800">On time</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
