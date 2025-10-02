import { requireClientAuth } from "@/lib/client-auth"
import { ClientDashboardLayout } from "@/components/client-dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Calculator, Clock, AlertTriangle, CheckCircle, Play } from "lucide-react"
import { months } from "@/lib/payroll"
import { getAttendanceStats } from "@/lib/attendance"

export default async function PayrollRunPage() {
  const client = await requireClientAuth()
  const attendanceStats = getAttendanceStats()

  const currentMonth = new Date().toLocaleString("default", { month: "long" })
  const currentYear = new Date().getFullYear()

  // Mock payroll processing data
  const payrollProcessingData = {
    totalEmployees: 156,
    processedEmployees: 0,
    estimatedTime: "15 minutes",
    lastProcessed: "February 2024",
    attendanceDataAvailable: true,
    salaryStructuresUpdated: true,
    complianceChecksComplete: true,
  }

  return (
    <ClientDashboardLayout client={client}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Run Payroll</h1>
            <p className="text-muted-foreground">
              Process payroll for {currentMonth} {currentYear}
            </p>
          </div>
          <Badge variant="secondary">Ready to Process</Badge>
        </div>

        {/* Pre-processing Checks */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CheckCircle className="mr-2 h-5 w-5 text-green-500" />
              Pre-processing Checks
            </CardTitle>
            <CardDescription>Verify all requirements before running payroll</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg border border-green-200">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-medium text-green-800">Attendance Data</p>
                  <p className="text-sm text-green-600">Complete for {currentMonth}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg border border-green-200">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-medium text-green-800">Salary Structures</p>
                  <p className="text-sm text-green-600">All employees updated</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg border border-green-200">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-medium text-green-800">Compliance</p>
                  <p className="text-sm text-green-600">Tax rates current</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payroll Configuration */}
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Payroll Configuration</CardTitle>
              <CardDescription>Configure payroll processing parameters</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Payroll Period</label>
                <div className="flex space-x-2">
                  <Select defaultValue={currentMonth}>
                    <SelectTrigger className="flex-1">
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
                  <Select defaultValue={currentYear.toString()}>
                    <SelectTrigger className="w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2024">2024</SelectItem>
                      <SelectItem value="2023">2023</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Processing Options</label>
                <div className="space-y-2">
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" defaultChecked className="rounded" />
                    <span className="text-sm">Include attendance adjustments</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" defaultChecked className="rounded" />
                    <span className="text-sm">Calculate overtime payments</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" defaultChecked className="rounded" />
                    <span className="text-sm">Apply leave deductions</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" className="rounded" />
                    <span className="text-sm">Generate pay slips automatically</span>
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Processing Summary</CardTitle>
              <CardDescription>Overview of payroll processing scope</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-bold">{payrollProcessingData.totalEmployees}</div>
                  <p className="text-sm text-muted-foreground">Total Employees</p>
                </div>
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-bold">{attendanceStats.presentToday}</div>
                  <p className="text-sm text-muted-foreground">Present Today</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Estimated Processing Time</span>
                  <span className="font-medium">{payrollProcessingData.estimatedTime}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Last Processed</span>
                  <span className="font-medium">{payrollProcessingData.lastProcessed}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Attendance Rate</span>
                  <span className="font-medium">{attendanceStats.attendanceRate}%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Processing Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calculator className="mr-2 h-5 w-5" />
              Payroll Processing Status
            </CardTitle>
            <CardDescription>Real-time processing progress and status updates</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Processing Progress</span>
              </div>
              <span className="text-sm font-medium">
                {payrollProcessingData.processedEmployees} / {payrollProcessingData.totalEmployees} employees
              </span>
            </div>

            <Progress
              value={(payrollProcessingData.processedEmployees / payrollProcessingData.totalEmployees) * 100}
              className="w-full"
            />

            {payrollProcessingData.processedEmployees === 0 ? (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Payroll processing has not started yet. Click "Start Processing" to begin.
                </AlertDescription>
              </Alert>
            ) : (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>Payroll processing completed successfully for all employees.</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-center space-x-4">
          <Button size="lg" className="px-8">
            <Play className="mr-2 h-4 w-4" />
            Start Processing
          </Button>
          <Button variant="outline" size="lg">
            Preview Calculations
          </Button>
        </div>
      </div>
    </ClientDashboardLayout>
  )
}
