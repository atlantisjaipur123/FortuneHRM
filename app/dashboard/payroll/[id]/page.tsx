import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Download, DollarSign, Calculator, Calendar, User } from "lucide-react"
import { DashboardLayout } from "@/components/dashboard-layout"
import Link from "next/link"
import { getPayrollById } from "@/lib/payroll"
import { notFound } from "next/navigation"
import type { User as AuthUser } from "@/lib/auth"

// Mock user for demo
const mockUser: AuthUser = {
  id: "1",
  email: "admin@company.com",
  name: "Admin User",
  role: "company_admin",
  companyId: "1",
  companyName: "Demo Company",
}

export default async function PayrollDetailsPage({
  params,
}: {
  params: { id: string }
}) {
  const { id } = params
  const payrollItem = getPayrollById(id)

  if (!payrollItem) {
    notFound()
  }

  const allowances =
    payrollItem.hra + payrollItem.conveyanceAllowance + payrollItem.medicalAllowance + payrollItem.specialAllowance

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
              <h1 className="text-3xl font-bold">Payroll Details</h1>
              <p className="text-muted-foreground">
                {payrollItem.employeeName} - {payrollItem.payrollMonth} {payrollItem.payrollYear}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge
              variant={
                payrollItem.status === "paid" ? "default" : payrollItem.status === "processed" ? "secondary" : "outline"
              }
            >
              {payrollItem.status}
            </Badge>
            <Button>
              <Download className="mr-2 h-4 w-4" />
              Download Payslip
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Employee Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="mr-2 h-5 w-5" />
                Employee Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Employee Name</label>
                <p className="text-sm font-medium">{payrollItem.employeeName}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Employee Code</label>
                <p className="text-sm font-medium">{payrollItem.employeeCode}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Designation</label>
                <p className="text-sm font-medium">{payrollItem.designation}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Department</label>
                <p className="text-sm font-medium">{payrollItem.department}</p>
              </div>
            </CardContent>
          </Card>

          {/* Payroll Period */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="mr-2 h-5 w-5" />
                Payroll Period
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Month & Year</label>
                <p className="text-sm font-medium">
                  {payrollItem.payrollMonth} {payrollItem.payrollYear}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Working Days</label>
                <p className="text-sm font-medium">{payrollItem.workingDays} days</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Present Days</label>
                <p className="text-sm font-medium">{payrollItem.presentDays} days</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Leave Days</label>
                <p className="text-sm font-medium">{payrollItem.leaveDays} days</p>
              </div>
            </CardContent>
          </Card>

          {/* Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calculator className="mr-2 h-5 w-5" />
                Payroll Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Gross Salary</label>
                <p className="text-lg font-bold">₹{payrollItem.grossSalary.toLocaleString()}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Total Deductions</label>
                <p className="text-lg font-bold text-red-600">-₹{payrollItem.totalDeductions.toLocaleString()}</p>
              </div>
              <div className="border-t pt-2">
                <label className="text-sm font-medium text-muted-foreground">Net Salary</label>
                <p className="text-2xl font-bold text-green-600">₹{payrollItem.netSalary.toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>

          {/* Earnings Breakdown */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center">
                <DollarSign className="mr-2 h-5 w-5" />
                Earnings Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">Basic Salary</span>
                    <span className="text-sm font-medium">₹{payrollItem.basicSalary.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">House Rent Allowance (HRA)</span>
                    <span className="text-sm font-medium">₹{payrollItem.hra.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Conveyance Allowance</span>
                    <span className="text-sm font-medium">₹{payrollItem.conveyanceAllowance.toLocaleString()}</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">Medical Allowance</span>
                    <span className="text-sm font-medium">₹{payrollItem.medicalAllowance.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Special Allowance</span>
                    <span className="text-sm font-medium">₹{payrollItem.specialAllowance.toLocaleString()}</span>
                  </div>
                  {payrollItem.overtimeAmount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-sm">Overtime ({payrollItem.overtimeHours} hrs)</span>
                      <span className="text-sm font-medium">₹{payrollItem.overtimeAmount.toLocaleString()}</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="border-t mt-4 pt-4">
                <div className="flex justify-between font-medium">
                  <span>Total Earnings</span>
                  <span>₹{payrollItem.grossSalary.toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Deductions Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Deductions Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm">Provident Fund (PF)</span>
                  <span className="text-sm font-medium">₹{payrollItem.providentFund.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Employee State Insurance (ESI)</span>
                  <span className="text-sm font-medium">₹{payrollItem.esi.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Professional Tax</span>
                  <span className="text-sm font-medium">₹{payrollItem.professionalTax.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Income Tax (TDS)</span>
                  <span className="text-sm font-medium">₹{payrollItem.incomeTax.toLocaleString()}</span>
                </div>
                {payrollItem.otherDeductions > 0 && (
                  <div className="flex justify-between">
                    <span className="text-sm">Other Deductions</span>
                    <span className="text-sm font-medium">₹{payrollItem.otherDeductions.toLocaleString()}</span>
                  </div>
                )}
              </div>
              <div className="border-t mt-4 pt-4">
                <div className="flex justify-between font-medium text-red-600">
                  <span>Total Deductions</span>
                  <span>₹{payrollItem.totalDeductions.toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Processing Information */}
        {(payrollItem.processedAt || payrollItem.paidAt) && (
          <Card>
            <CardHeader>
              <CardTitle>Processing Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Status</label>
                  <p className="text-sm font-medium capitalize">{payrollItem.status}</p>
                </div>
                {payrollItem.processedAt && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Processed At</label>
                    <p className="text-sm font-medium">{new Date(payrollItem.processedAt).toLocaleString()}</p>
                  </div>
                )}
                {payrollItem.paidAt && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Paid At</label>
                    <p className="text-sm font-medium">{new Date(payrollItem.paidAt).toLocaleString()}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
