'use client'
import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Building2, MapPin, FileText, Users, Plus } from "lucide-react"
import { notFound } from "next/navigation"
import Link from "next/link"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

// Define Types
type Company = {
  id: string
  name: string
  adminName: string
  adminId: string
  createdAt: string
  status: "active" | "inactive"
  nature: string
  address: string
  pan: string
  gstin?: string
  tan?: string
}

type Employee = {
  id: string
  name: string
  position: string
  salary: number
  email?: string
}

interface CompanyDetailsPageProps {
  company: Company | null
  employees: Employee[]
  companyId: string
}

export default function CompanyDetailsPage({
  company,
  employees,
  companyId,
}: CompanyDetailsPageProps) {
  if (!company) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="flex h-16 items-center justify-between px-6">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/super-admin">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Link>
            </Button>
            <div>
              <h1 className="text-xl font-bold">{company.name}</h1>
              <p className="text-sm text-muted-foreground">Company Details</p>
            </div>
          </div>
          <Badge variant={company.status === "active" ? "default" : "secondary"}>{company.status}</Badge>
        </div>
      </header>

      <div className="p-6 max-w-4xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Company Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Building2 className="mr-2 h-5 w-5" />
                Company Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Company Name</label>
                <p className="text-sm font-medium">{company.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Nature of Business</label>
                <p className="text-sm font-medium">{company.nature}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Registration Date</label>
                <p className="text-sm font-medium">{new Date(company.createdAt).toLocaleDateString()}</p>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MapPin className="mr-2 h-5 w-5" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Address</label>
                <p className="text-sm font-medium">{company.address}</p>
              </div>
            </CardContent>
          </Card>

          {/* Legal Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="mr-2 h-5 w-5" />
                Legal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">PAN</label>
                <p className="text-sm font-medium">{company.pan}</p>
              </div>
              {company.gstin && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">GSTIN</label>
                  <p className="text-sm font-medium">{company.gstin}</p>
                </div>
              )}
              {company.tan && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">TAN</label>
                  <p className="text-sm font-medium">{company.tan}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Employees */}
          <Card>
            <CardHeader className="flex justify-between items-center">
              <CardTitle className="flex items-center">
                <Users className="mr-2 h-5 w-5" />
                Employees ({employees.length})
              </CardTitle>
              <AddEmployeeDialog companyId={companyId} companyName={company.name} />
            </CardHeader>
            <CardContent>
              {employees.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {employees.map((employee) => (
                    <div key={employee.id} className="border p-4 rounded-md">
                      <p><strong>Name:</strong> {employee.name}</p>
                      <p><strong>Position:</strong> {employee.position}</p>
                      <p><strong>Salary:</strong> ${employee.salary.toLocaleString()}</p>
                      <p><strong>Email:</strong> {employee.email || "N/A"}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No employees registered yet.</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4 mt-8">
          <Button variant="outline">Edit Company</Button>
          <Button variant={company.status === "active" ? "destructive" : "default"}>
            {company.status === "active" ? "Suspend Company" : "Activate Company"}
          </Button>
        </div>
      </div>
    </div>
  )
}

// Client Component for Add Employee Dialog
import { useState, useTransition } from "react"

function AddEmployeeDialog({ companyId, companyName }: { companyId: string; companyName: string }) {
  const [isOpen, setIsOpen] = useState(false)
  const [employeeData, setEmployeeData] = useState({ name: "", position: "", salary: "", email: "" })
  const [, startTransition] = useTransition()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const newEmployee: Employee = {
      id: Math.random().toString(36).substr(2, 9),
      name: employeeData.name,
      position: employeeData.position,
      salary: parseFloat(employeeData.salary) || 0,
      email: employeeData.email || "",
    }
    startTransition(() => {
      // TODO: replace with API call to persist employee for companyId
      setIsOpen(false)
      setEmployeeData({ name: "", position: "", salary: "", email: "" })
    })
  }

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setIsOpen(true)}>
        <Plus className="mr-2 h-4 w-4" /> Add Employee
      </Button>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Employee to {companyName}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={employeeData.name}
                onChange={(e) => setEmployeeData({ ...employeeData, name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="position">Position</Label>
              <Input
                id="position"
                value={employeeData.position}
                onChange={(e) => setEmployeeData({ ...employeeData, position: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="salary">Salary</Label>
              <Input
                id="salary"
                type="number"
                value={employeeData.salary}
                onChange={(e) => setEmployeeData({ ...employeeData, salary: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email (Optional)</Label>
              <Input
                id="email"
                type="email"
                value={employeeData.email}
                onChange={(e) => setEmployeeData({ ...employeeData, email: e.target.value })}
              />
            </div>
            <Button type="submit" className="w-full">Add Employee</Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}