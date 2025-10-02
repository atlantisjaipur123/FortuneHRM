"use client"
import React, { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Building2, Users, Plus, Edit, Trash2, ArrowLeft, MoreHorizontal } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import Link from "next/link"
import type { Company } from "@/lib/auth"

interface Employee {
  id: string
  name: string
  employeeId: string
  email: string
  phone: string
  pan: string
  accountNumber: string
  ifscCode: string
  bankName: string
  designation: string
  department: string
  joiningDate: string
  salary: number
  status: "active" | "inactive"
}

interface CompanyDetailClientProps {
  company: Company
}

export function CompanyDetailClient({ company }: CompanyDetailClientProps) {
  const [employees, setEmployees] = useState<Employee[]>([
    {
      id: "1",
      name: "John Doe",
      employeeId: "EMP001",
      email: "john.doe@company.com",
      phone: "+91 9876543210",
      pan: "ABCDE1234F",
      accountNumber: "1234567890",
      ifscCode: "SBIN0001234",
      bankName: "State Bank of India",
      designation: "Software Engineer",
      department: "Engineering",
      joiningDate: "2024-01-15",
      salary: 75000,
      status: "active"
    },
    {
      id: "2",
      name: "Jane Smith",
      employeeId: "EMP002",
      email: "jane.smith@company.com",
      phone: "+91 9876543211",
      pan: "FGHIJ5678K",
      accountNumber: "0987654321",
      ifscCode: "HDFC0005678",
      bankName: "HDFC Bank",
      designation: "HR Manager",
      department: "Human Resources",
      joiningDate: "2024-02-01",
      salary: 65000,
      status: "active"
    }
  ])

  const [isAddEmployeeOpen, setIsAddEmployeeOpen] = useState(false)
  const [isEditEmployeeOpen, setIsEditEmployeeOpen] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)
  const [searchTerm, setSearchTerm] = useState("")

  const filteredEmployees = employees.filter(employee =>
    employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const addEmployee = (formData: FormData) => {
    const newEmployee: Employee = {
      id: Date.now().toString(),
      name: formData.get("name") as string,
      employeeId: formData.get("employeeId") as string,
      email: formData.get("email") as string,
      phone: formData.get("phone") as string,
      pan: formData.get("pan") as string,
      accountNumber: formData.get("accountNumber") as string,
      ifscCode: formData.get("ifscCode") as string,
      bankName: formData.get("bankName") as string,
      designation: formData.get("designation") as string,
      department: formData.get("department") as string,
      joiningDate: formData.get("joiningDate") as string,
      salary: parseFloat(formData.get("salary") as string),
      status: "active"
    }
    setEmployees([...employees, newEmployee])
    setIsAddEmployeeOpen(false)
  }

  const updateEmployee = (formData: FormData) => {
    if (selectedEmployee) {
      const updatedEmployee: Employee = {
        ...selectedEmployee,
        name: formData.get("name") as string,
        employeeId: formData.get("employeeId") as string,
        email: formData.get("email") as string,
        phone: formData.get("phone") as string,
        pan: formData.get("pan") as string,
        accountNumber: formData.get("accountNumber") as string,
        ifscCode: formData.get("ifscCode") as string,
        bankName: formData.get("bankName") as string,
        designation: formData.get("designation") as string,
        department: formData.get("department") as string,
        joiningDate: formData.get("joiningDate") as string,
        salary: parseFloat(formData.get("salary") as string),
        status: formData.get("status") as "active" | "inactive"
      }
      setEmployees(employees.map(emp => emp.id === selectedEmployee.id ? updatedEmployee : emp))
      setIsEditEmployeeOpen(false)
      setSelectedEmployee(null)
    }
  }

  const deleteEmployee = (id: string) => {
    if (confirm('Are you sure you want to delete this employee?')) {
      setEmployees(employees.filter(emp => emp.id !== id))
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="flex h-16 items-center justify-between px-6">
          <div className="flex items-center space-x-4">
            <Link href="/super-admin">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Companies
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-bold">{company.name}</h1>
              <p className="text-sm text-muted-foreground">Company Details & Employee Management</p>
            </div>
          </div>
        </div>
      </header>

      <div className="p-6 space-y-6">
        {/* Company Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Building2 className="mr-2 h-5 w-5" />
              Company Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Company Name</Label>
                <p className="text-sm font-medium">{company.name}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Admin Name</Label>
                <p className="text-sm font-medium">{company.adminName}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                <Badge variant={company.status === "active" ? "default" : "secondary"}>
                  {company.status}
                </Badge>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Nature of Business</Label>
                <p className="text-sm font-medium">{company.nature}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">PAN</Label>
                <p className="text-sm font-medium">{company.pan}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">GSTIN</Label>
                <p className="text-sm font-medium">{company.gstin || "N/A"}</p>
              </div>
              <div className="md:col-span-2 lg:col-span-3">
                <Label className="text-sm font-medium text-muted-foreground">Address</Label>
                <p className="text-sm font-medium">{company.address}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Created At</Label>
                <p className="text-sm font-medium">{new Date(company.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Employee Management */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center">
                  <Users className="mr-2 h-5 w-5" />
                  Employees ({employees.length})
                </CardTitle>
                <CardDescription>Manage company employees</CardDescription>
              </div>
              <Button onClick={() => setIsAddEmployeeOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Employee
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center py-4">
              <Input
                placeholder="Search employees..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Designation</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEmployees.map((employee) => (
                    <TableRow key={employee.id}>
                      <TableCell className="font-medium">{employee.employeeId}</TableCell>
                      <TableCell>{employee.name}</TableCell>
                      <TableCell>{employee.email}</TableCell>
                      <TableCell>{employee.department}</TableCell>
                      <TableCell>{employee.designation}</TableCell>
                      <TableCell>
                        <Badge variant={employee.status === "active" ? "default" : "secondary"}>
                          {employee.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => {
                              setSelectedEmployee(employee)
                              setIsEditEmployeeOpen(true)
                            }}>
                              <Edit className="mr-2 h-4 w-4" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => deleteEmployee(employee.id)}>
                              <Trash2 className="mr-2 h-4 w-4" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Add Employee Dialog */}
        <Dialog open={isAddEmployeeOpen} onOpenChange={setIsAddEmployeeOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Employee</DialogTitle>
            </DialogHeader>
            <form onSubmit={(e) => {
              e.preventDefault()
              const formData = new FormData(e.currentTarget)
              addEmployee(formData)
            }} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input id="name" name="name" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="employeeId">Employee ID *</Label>
                  <Input id="employeeId" name="employeeId" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input id="email" name="email" type="email" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone *</Label>
                  <Input id="phone" name="phone" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pan">PAN *</Label>
                  <Input id="pan" name="pan" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="designation">Designation *</Label>
                  <Input id="designation" name="designation" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department">Department *</Label>
                  <Select name="department" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Engineering">Engineering</SelectItem>
                      <SelectItem value="Human Resources">Human Resources</SelectItem>
                      <SelectItem value="Finance">Finance</SelectItem>
                      <SelectItem value="Marketing">Marketing</SelectItem>
                      <SelectItem value="Sales">Sales</SelectItem>
                      <SelectItem value="Operations">Operations</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="joiningDate">Joining Date *</Label>
                  <Input id="joiningDate" name="joiningDate" type="date" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="salary">Salary *</Label>
                  <Input id="salary" name="salary" type="number" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="accountNumber">Account Number *</Label>
                  <Input id="accountNumber" name="accountNumber" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ifscCode">IFSC Code *</Label>
                  <Input id="ifscCode" name="ifscCode" required />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="bankName">Bank Name *</Label>
                  <Input id="bankName" name="bankName" required />
                </div>
              </div>
              <Button type="submit" className="w-full">
                Add Employee
              </Button>
            </form>
          </DialogContent>
        </Dialog>

        {/* Edit Employee Dialog */}
        <Dialog open={isEditEmployeeOpen} onOpenChange={setIsEditEmployeeOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Employee</DialogTitle>
            </DialogHeader>
            {selectedEmployee && (
              <form onSubmit={(e) => {
                e.preventDefault()
                const formData = new FormData(e.currentTarget)
                updateEmployee(formData)
              }} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name *</Label>
                    <Input id="name" name="name" defaultValue={selectedEmployee.name} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="employeeId">Employee ID *</Label>
                    <Input id="employeeId" name="employeeId" defaultValue={selectedEmployee.employeeId} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input id="email" name="email" type="email" defaultValue={selectedEmployee.email} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone *</Label>
                    <Input id="phone" name="phone" defaultValue={selectedEmployee.phone} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pan">PAN *</Label>
                    <Input id="pan" name="pan" defaultValue={selectedEmployee.pan} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="designation">Designation *</Label>
                    <Input id="designation" name="designation" defaultValue={selectedEmployee.designation} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="department">Department *</Label>
                    <Select name="department" defaultValue={selectedEmployee.department} required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Engineering">Engineering</SelectItem>
                        <SelectItem value="Human Resources">Human Resources</SelectItem>
                        <SelectItem value="Finance">Finance</SelectItem>
                        <SelectItem value="Marketing">Marketing</SelectItem>
                        <SelectItem value="Sales">Sales</SelectItem>
                        <SelectItem value="Operations">Operations</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="joiningDate">Joining Date *</Label>
                    <Input id="joiningDate" name="joiningDate" type="date" defaultValue={selectedEmployee.joiningDate} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="salary">Salary *</Label>
                    <Input id="salary" name="salary" type="number" defaultValue={selectedEmployee.salary} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="accountNumber">Account Number *</Label>
                    <Input id="accountNumber" name="accountNumber" defaultValue={selectedEmployee.accountNumber} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ifscCode">IFSC Code *</Label>
                    <Input id="ifscCode" name="ifscCode" defaultValue={selectedEmployee.ifscCode} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status">Status *</Label>
                    <Select name="status" defaultValue={selectedEmployee.status} required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="bankName">Bank Name *</Label>
                    <Input id="bankName" name="bankName" defaultValue={selectedEmployee.bankName} required />
                  </div>
                </div>
                <Button type="submit" className="w-full">
                  Update Employee
                </Button>
              </form>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
