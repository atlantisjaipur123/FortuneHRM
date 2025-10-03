"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calculator, Download, Play, Eye, DollarSign, Users, TrendingUp, Clock } from "lucide-react"
import { DashboardLayout } from "@/components/dashboard-layout"
import Link from "next/link"
import { getPayrollByCompany, getPayrollSummariesByCompany, months } from "@/app/lib/payroll"
import type { User } from "@/app/lib/auth"

// Mock user for demo
const mockUser: User = {
  id: "1",
  email: "admin@company.com",
  name: "Admin User",
  role: "company_admin",
  companyId: "1",
  companyName: "Demo Company",
}

export default function PayrollPage() {
  const [selectedMonth, setSelectedMonth] = useState(new Date().toLocaleString("default", { month: "long" }))
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())

  const payrollItems = getPayrollByCompany(mockUser.companyId || "1")
  const payrollSummaries = getPayrollSummariesByCompany(mockUser.companyId || "1")

  // Filter payroll items by selected month/year
  const filteredPayroll = payrollItems.filter(
    (item) => item.payrollMonth === selectedMonth && item.payrollYear === selectedYear,
  )

  // Calculate summary stats
  const totalEmployees = filteredPayroll.length
  const totalGrossSalary = filteredPayroll.reduce((sum, item) => sum + item.grossSalary, 0)
  const totalNetSalary = filteredPayroll.reduce((sum, item) => sum + item.netSalary, 0)
  const totalDeductions = filteredPayroll.reduce((sum, item) => sum + item.totalDeductions, 0)

  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i)

  return (
    <DashboardLayout user={mockUser}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Payroll Management</h1>
            <p className="text-muted-foreground">Process and manage employee payroll</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Export Payroll
            </Button>
            <Button asChild>
              <Link href="/dashboard/payroll/run">
                <Play className="mr-2 h-4 w-4" />
                Run Payroll
              </Link>
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalEmployees}</div>
              <p className="text-xs text-muted-foreground">In current payroll</p>
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
              <CardTitle className="text-sm font-medium">Total Deductions</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{totalDeductions.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">PF, ESI, Tax, etc.</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Net Payable</CardTitle>
              <Calculator className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{totalNetSalary.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Amount to be paid</p>
            </CardContent>
          </Card>
        </div>

        {/* Payroll Filters and Table */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle>Payroll Records</CardTitle>
                <CardDescription>View and manage payroll for employees</CardDescription>
              </div>
              <div className="flex gap-2">
                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
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
                <Select
                  value={selectedYear.toString()}
                  onValueChange={(value) => setSelectedYear(Number.parseInt(value))}
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
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPayroll.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                        No payroll records found for {selectedMonth} {selectedYear}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredPayroll.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{item.employeeName}</p>
                            <p className="text-sm text-muted-foreground">{item.employeeCode}</p>
                          </div>
                        </TableCell>
                        <TableCell>{item.department}</TableCell>
                        <TableCell>₹{item.basicSalary.toLocaleString()}</TableCell>
                        <TableCell>₹{item.grossSalary.toLocaleString()}</TableCell>
                        <TableCell>₹{item.totalDeductions.toLocaleString()}</TableCell>
                        <TableCell className="font-medium">₹{item.netSalary.toLocaleString()}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              item.status === "paid" ? "default" : item.status === "processed" ? "secondary" : "outline"
                            }
                          >
                            {item.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/dashboard/payroll/${item.id}`}>
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Recent Payroll Summaries */}
        <Card>
          <CardHeader>
            <CardTitle>Payroll History</CardTitle>
            <CardDescription>Recent payroll processing history</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {payrollSummaries.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">No payroll history available</p>
              ) : (
                payrollSummaries.map((summary) => (
                  <div key={summary.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <Calculator className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">
                          {summary.month} {summary.year} Payroll
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {summary.totalEmployees} employees • ₹{summary.totalNetSalary.toLocaleString()} net payable
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={summary.status === "completed" ? "default" : "secondary"}>{summary.status}</Badge>
                      {summary.processedAt && (
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Clock className="mr-1 h-3 w-3" />
                          {new Date(summary.processedAt).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
