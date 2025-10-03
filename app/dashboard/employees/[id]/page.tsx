import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Edit, UserIcon, CreditCard, Briefcase, Phone, Mail, MapPin } from "lucide-react"
import { DashboardLayout } from "@/components/dashboard-layout"
import Link from "next/link"
import { getEmployeeById } from "@/app/lib/employees"
import { notFound } from "next/navigation"
import type { AuthUser } from "@/app/lib/auth"

// Mock user for demo
const mockUser: AuthUser = {
  id: "1",
  email: "admin@company.com",
  name: "Admin User",
  role: "company_admin",
  companyId: "1",
  companyName: "Demo Company",
}

export default async function EmployeeDetailsPage({
  params,
}: {
  params: { id: string }
}) {
  const { id } = params
  const employee = await getEmployeeById(id)

  if (!employee) {
    notFound()
  }

  return (
    <DashboardLayout user={mockUser}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard/employees">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Employees
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold">
                {employee.firstName} {employee.lastName}
              </h1>
              <p className="text-muted-foreground">{employee.employeeCode}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={employee.status === "active" ? "default" : "secondary"}>{employee.status}</Badge>
            <Button asChild>
              <Link href={`/dashboard/employees/${employee.id}/edit`}>
                <Edit className="mr-2 h-4 w-4" />
                Edit Employee
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <UserIcon className="mr-2 h-5 w-5" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Full Name</label>
                <p className="text-sm font-medium">
                  {employee.firstName} {employee.lastName}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Father's Name</label>
                <p className="text-sm font-medium">{employee.fatherName || "Not provided"}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Date of Birth</label>
                <p className="text-sm font-medium">
                  {employee.dateOfBirth ? new Date(employee.dateOfBirth).toLocaleDateString() : "Not provided"}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Gender</label>
                <p className="text-sm font-medium capitalize">{employee.gender || "Not provided"}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Marital Status</label>
                <p className="text-sm font-medium capitalize">{employee.maritalStatus || "Not provided"}</p>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Phone className="mr-2 h-5 w-5" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">{employee.phone}</p>
                  <p className="text-xs text-muted-foreground">Phone</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">{employee.email}</p>
                  <p className="text-xs text-muted-foreground">Email</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
                <div>
                  <p className="text-sm font-medium">{employee.permanentAddress || "Not provided"}</p>
                  <p className="text-xs text-muted-foreground">Permanent Address</p>
                </div>
              </div>
              {employee.emergencyContact && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Emergency Contact</label>
                  <p className="text-sm font-medium">
                    {employee.emergencyContact} - {employee.emergencyPhone}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Employment Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Briefcase className="mr-2 h-5 w-5" />
                Employment Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Designation</label>
                <p className="text-sm font-medium">{employee.designation}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Department</label>
                <p className="text-sm font-medium">{employee.department}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Date of Joining</label>
                <p className="text-sm font-medium">{new Date(employee.dateOfJoining).toLocaleDateString()}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Probation Period</label>
                <p className="text-sm font-medium">{employee.probationPeriod} months</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Basic Salary</label>
                <p className="text-sm font-medium">₹{employee.basicSalary.toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>

          {/* Financial Details */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center">
                <CreditCard className="mr-2 h-5 w-5" />
                Financial Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Bank Name</label>
                  <p className="text-sm font-medium">{employee.bankName || "Not provided"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Account Number</label>
                  <p className="text-sm font-medium">{employee.accountNumber || "Not provided"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">IFSC Code</label>
                  <p className="text-sm font-medium">{employee.ifscCode || "Not provided"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">PAN Number</label>
                  <p className="text-sm font-medium">{employee.pan || "Not provided"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">UAN (PF)</label>
                  <p className="text-sm font-medium">{employee.uan || "Not provided"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">ESI Number</label>
                  <p className="text-sm font-medium">{employee.esiNumber || "Not provided"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Years with Company</label>
                <p className="text-sm font-medium">
                  {Math.floor(
                    (Date.now() - new Date(employee.dateOfJoining).getTime()) / (365.25 * 24 * 60 * 60 * 1000),
                  )}{" "}
                  years
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Last Updated</label>
                <p className="text-sm font-medium">{new Date(employee.updatedAt).toLocaleDateString()}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
