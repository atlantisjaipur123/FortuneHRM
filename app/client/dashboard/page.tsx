import { requireClientAuth } from "@/lib/client-auth"
import { ClientDashboardLayout } from "@/components/client-dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Users, Clock, Calculator, TrendingUp, Calendar, AlertCircle, CheckCircle, XCircle } from "lucide-react"
import Link from "next/link"

export default async function ClientDashboardPage() {
  const client = await requireClientAuth()

  // Mock data - in production this would come from database
  const dashboardData = {
    totalEmployees: 156,
    presentToday: 142,
    absentToday: 8,
    lateToday: 6,
    pendingLeaveRequests: 12,
    upcomingPayroll: "March 2024",
    attendanceRate: 91.0,
    recentActivities: [
      { id: 1, type: "attendance", message: "John Doe checked in", time: "9:15 AM", status: "success" },
      { id: 2, type: "leave", message: "Sarah Smith requested leave", time: "8:30 AM", status: "pending" },
      { id: 3, type: "payroll", message: "February payroll processed", time: "Yesterday", status: "success" },
      { id: 4, type: "employee", message: "New employee Alice Johnson added", time: "2 days ago", status: "success" },
    ],
  }

  return (
    <ClientDashboardLayout client={client}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">Welcome back, {client.name}</p>
          </div>
          {client.subscriptionStatus === "trial" && (
            <Badge variant="secondary" className="text-sm">
              Trial Account
            </Badge>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData.totalEmployees}</div>
              <p className="text-xs text-muted-foreground">Active workforce</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Present Today</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{dashboardData.presentToday}</div>
              <p className="text-xs text-muted-foreground">{dashboardData.attendanceRate}% attendance rate</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Leaves</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{dashboardData.pendingLeaveRequests}</div>
              <p className="text-xs text-muted-foreground">Awaiting approval</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Next Payroll</CardTitle>
              <Calculator className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData.upcomingPayroll}</div>
              <p className="text-xs text-muted-foreground">Processing date</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions & Recent Activity */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common tasks and shortcuts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button asChild className="w-full justify-start">
                <Link href="/client/employees/new">
                  <Users className="mr-2 h-4 w-4" />
                  Add New Employee
                </Link>
              </Button>
              <Button variant="outline" asChild className="w-full justify-start bg-transparent">
                <Link href="/client/attendance">
                  <Clock className="mr-2 h-4 w-4" />
                  View Attendance
                </Link>
              </Button>
              <Button variant="outline" asChild className="w-full justify-start bg-transparent">
                <Link href="/client/payroll">
                  <Calculator className="mr-2 h-4 w-4" />
                  Process Payroll
                </Link>
              </Button>
              <Button variant="outline" asChild className="w-full justify-start bg-transparent">
                <Link href="/client/reports">
                  <TrendingUp className="mr-2 h-4 w-4" />
                  Generate Reports
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest updates and notifications</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dashboardData.recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      {activity.status === "success" && <CheckCircle className="h-5 w-5 text-green-500" />}
                      {activity.status === "pending" && <AlertCircle className="h-5 w-5 text-yellow-500" />}
                      {activity.status === "error" && <XCircle className="h-5 w-5 text-red-500" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">{activity.message}</p>
                      <p className="text-xs text-muted-foreground">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Attendance Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Today's Attendance Overview</CardTitle>
            <CardDescription>Real-time attendance status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{dashboardData.presentToday}</div>
                <p className="text-sm text-green-600">Present</p>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600">{dashboardData.absentToday}</div>
                <p className="text-sm text-red-600">Absent</p>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">{dashboardData.lateToday}</div>
                <p className="text-sm text-yellow-600">Late</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </ClientDashboardLayout>
  )
}
