import { requireClientAuth } from "@/app/lib/client-auth"
import { ClientDashboardLayout } from "@/components/client-dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Calculator, Download, Play, Users, DollarSign, TrendingUp, FileText } from "lucide-react"
import { getPayrollByCompany, getPayrollSummariesByCompany, months } from "@/app/lib/payroll"
import Link from "next/link"

export default async function ClientPayrollPage() {
  const client = await requireClientAuth()
  const payrollItems = getPayrollByCompany(client.companyId)
  const payrollSummaries = getPayrollSummariesByCompany(client.companyId)

  // Calculate current month stats
  const currentMonth = new Date().toLocaleString("default", { month: "long" })
  const currentYear = new Date().getFullYear()
  const currentMonthPayroll = payrollItems.filter(
    (item) => item.payrollMonth === currentMonth && item.payrollYear === currentYear,
  )

  const totalEmployees = 156 // Mock data
  const processedEmployees = currentMonthPayroll.length
  const totalGrossSalary = currentMonthPayroll.reduce((sum, item) => sum + item.grossSalary, 0)
  const totalNetSalary = currentMonthPayroll.reduce((sum, item) => sum + item.netSalary, 0)

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "draft":
        return <Badge variant="secondary">Draft</Badge>
      case "processed":
        return <Badge variant="default">Processed</Badge>
      case "paid":
        return (
          <Badge variant="default" className="bg-green-500">
            Paid
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <ClientDashboardLayout client={client}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Payroll Management</h1>
            <p className="text-muted-foreground">Process and manage employee payroll</p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export Reports
            </Button>
            <Button asChild>
              <Link href="/client/payroll/run">
                <Play className="mr-2 h-4 w-4" />
                Run Payroll
              </Link>
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalEmployees}</div>
              <p className="text-xs text-muted-foreground">{processedEmployees} processed this month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Gross Payroll</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalGrossSalary)}</div>
              <p className="text-xs text-muted-foreground">Current month total</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Net Payroll</CardTitle>
              <Calculator className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalNetSalary)}</div>
              <p className="text-xs text-muted-foreground">After deductions</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Processing Status</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Math.round((processedEmployees / totalEmployees) * 100)}%</div>
              <p className="text-xs text-muted-foreground">Completion rate</p>
            </CardContent>
          </Card>
        </div>

        {/* Payroll History */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Payroll History</CardTitle>
                <CardDescription>Previous payroll processing records</CardDescription>
              </div>
              <Select defaultValue={currentMonth}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {months.map((month) => (
                    <SelectItem key={month} value={month}>
                      {month} 2024
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Period</TableHead>
                    <TableHead>Employees</TableHead>
                    <TableHead>Gross Amount</TableHead>
                    <TableHead>Net Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Processed Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payrollSummaries.map((summary) => (
                    <TableRow key={summary.id}>
                      <TableCell className="font-medium">
                        {summary.month} {summary.year}
                      </TableCell>
                      <TableCell>{summary.totalEmployees}</TableCell>
                      <TableCell>{formatCurrency(summary.totalGrossSalary)}</TableCell>
                      <TableCell>{formatCurrency(summary.totalNetSalary)}</TableCell>
                      <TableCell>{getStatusBadge(summary.status)}</TableCell>
                      <TableCell>
                        {summary.processedAt ? new Date(summary.processedAt).toLocaleDateString() : "-"}
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/client/payroll/${summary.id}`}>
                            <FileText className="h-4 w-4" />
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Current Month Payroll Details */}
        <Card>
          <CardHeader>
            <CardTitle>Current Month Payroll Details</CardTitle>
            <CardDescription>
              {currentMonth} {currentYear} - Individual employee payroll breakdown
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Basic Salary</TableHead>
                    <TableHead>Gross Salary</TableHead>
                    <TableHead>Deductions</TableHead>
                    <TableHead>Net Salary</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentMonthPayroll.length > 0 ? (
                    currentMonthPayroll.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{item.employeeName}</div>
                            <div className="text-sm text-muted-foreground">{item.employeeCode}</div>
                          </div>
                        </TableCell>
                        <TableCell>{item.department}</TableCell>
                        <TableCell>{formatCurrency(item.basicSalary)}</TableCell>
                        <TableCell>{formatCurrency(item.grossSalary)}</TableCell>
                        <TableCell>{formatCurrency(item.totalDeductions)}</TableCell>
                        <TableCell className="font-medium">{formatCurrency(item.netSalary)}</TableCell>
                        <TableCell>{getStatusBadge(item.status)}</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/client/payroll/employee/${item.id}`}>
                              <FileText className="h-4 w-4" />
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8">
                        <div className="flex flex-col items-center space-y-2">
                          <Calculator className="h-8 w-8 text-muted-foreground" />
                          <p className="text-muted-foreground">No payroll data for current month</p>
                          <Button asChild>
                            <Link href="/client/payroll/run">Run Payroll for {currentMonth}</Link>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </ClientDashboardLayout>
  )
}
