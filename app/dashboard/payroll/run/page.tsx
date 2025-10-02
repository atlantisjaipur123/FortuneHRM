"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, Play, CheckCircle, AlertCircle, Users, Calculator, DollarSign } from "lucide-react"
import { DashboardLayout } from "@/components/dashboard-layout"
import Link from "next/link"
import { getEmployeesByCompany } from "@/lib/employees"
import { calculatePayroll, months } from "@/lib/payroll"
import type { User } from "@/lib/auth"

// Mock user for demo
const mockUser: User = {
  id: "1",
  email: "admin@company.com",
  name: "Admin User",
  role: "company_admin",
  companyId: "1",
  companyName: "Demo Company",
}

export default function RunPayrollPage() {
  const [selectedMonth, setSelectedMonth] = useState(new Date().toLocaleString("default", { month: "long" }))
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [isProcessing, setIsProcessing] = useState(false)
  const [processedEmployees, setProcessedEmployees] = useState<string[]>([])
  const [progress, setProgress] = useState(0)

  const employees = getEmployeesByCompany(mockUser.companyId || "1").filter((emp) => emp.status === "active")

  // Calculate payroll for preview
  const payrollPreview = employees.map((employee) => calculatePayroll(employee))

  const totalGrossSalary = payrollPreview.reduce((sum, item) => sum + item.grossSalary, 0)
  const totalDeductions = payrollPreview.reduce((sum, item) => sum + item.totalDeductions, 0)
  const totalNetSalary = payrollPreview.reduce((sum, item) => sum + item.netSalary, 0)

  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i)

  const handleProcessPayroll = async () => {
    setIsProcessing(true)
    setProgress(0)
    setProcessedEmployees([])

    // Simulate payroll processing
    for (let i = 0; i < employees.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, 1000)) // Simulate processing time
      setProcessedEmployees((prev) => [...prev, employees[i].id])
      setProgress(((i + 1) / employees.length) * 100)
    }

    // Final completion
    await new Promise((resolve) => setTimeout(resolve, 500))
    setIsProcessing(false)
  }

  const isCompleted = processedEmployees.length === employees.length && !isProcessing

  return (
    <DashboardLayout user={mockUser}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard/payroll">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Payroll
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Run Payroll</h1>
              <p className="text-muted-foreground">
                Process payroll for {selectedMonth} {selectedYear}
              </p>
            </div>
          </div>
        </div>

        {/* Month/Year Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Payroll Period</CardTitle>
            <CardDescription>Select the month and year for payroll processing</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Month</label>
                <Select value={selectedMonth} onValueChange={setSelectedMonth} disabled={isProcessing}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {months.map((month) => (
                      <SelectItem key={month} value={month}>
                        {month}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Year</label>
                <Select
                  value={selectedYear.toString()}
                  onValueChange={(value) => setSelectedYear(Number.parseInt(value))}
                  disabled={isProcessing}
                >
                  <SelectTrigger className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Employees</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{employees.length}</div>
              <p className="text-xs text-muted-foreground">Active employees</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Gross Salary</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{totalGrossSalary.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Total gross amount</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Deductions</CardTitle>
              <Calculator className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{totalDeductions.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Total deductions</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Net Payable</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">₹{totalNetSalary.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Amount to be paid</p>
            </CardContent>
          </Card>
        </div>

        {/* Processing Status */}
        {(isProcessing || isCompleted) && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {isCompleted ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-blue-500" />
                )}
                {isCompleted ? "Payroll Processing Complete" : "Processing Payroll..."}
              </CardTitle>
              <CardDescription>
                {isCompleted
                  ? `Successfully processed payroll for ${employees.length} employees`
                  : `Processing payroll for ${selectedMonth} ${selectedYear}`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>
                {isCompleted && (
                  <div className="flex gap-2">
                    <Button asChild>
                      <Link href="/dashboard/payroll">View Payroll Records</Link>
                    </Button>
                    <Button variant="outline">Download Payslips</Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Employee Payroll Preview */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Payroll Preview</CardTitle>
                <CardDescription>Review payroll calculations before processing</CardDescription>
              </div>
              {!isProcessing && !isCompleted && (
                <Button onClick={handleProcessPayroll} disabled={employees.length === 0}>
                  <Play className="mr-2 h-4 w-4" />
                  Process Payroll
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Basic Salary</TableHead>
                    <TableHead>Allowances</TableHead>
                    <TableHead>Gross Salary</TableHead>
                    <TableHead>Deductions</TableHead>
                    <TableHead>Net Salary</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payrollPreview.map((item, index) => {
                    const isProcessed = processedEmployees.includes(item.employeeId)
                    const allowances =
                      item.hra + item.conveyanceAllowance + item.medicalAllowance + item.specialAllowance

                    return (
                      <TableRow key={item.employeeId}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{item.employeeName}</p>
                            <p className="text-sm text-muted-foreground">{item.employeeCode}</p>
                          </div>
                        </TableCell>
                        <TableCell>₹{item.basicSalary.toLocaleString()}</TableCell>
                        <TableCell>₹{allowances.toLocaleString()}</TableCell>
                        <TableCell>₹{item.grossSalary.toLocaleString()}</TableCell>
                        <TableCell>₹{item.totalDeductions.toLocaleString()}</TableCell>
                        <TableCell className="font-medium">₹{item.netSalary.toLocaleString()}</TableCell>
                        <TableCell>
                          {isProcessed ? (
                            <Badge className="bg-green-100 text-green-800">
                              <CheckCircle className="mr-1 h-3 w-3" />
                              Processed
                            </Badge>
                          ) : isProcessing ? (
                            <Badge variant="secondary">Processing...</Badge>
                          ) : (
                            <Badge variant="outline">Pending</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
