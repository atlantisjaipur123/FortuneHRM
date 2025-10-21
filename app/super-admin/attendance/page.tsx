/*
"use client"

import React, { useState, useMemo, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { GlobalLayout } from "@/app/components/global-layout"
import { toast } from "@/components/ui/use-toast"
import { Calendar } from "lucide-react"
import { useCompany } from "@/lib/context/CompanyContext"
import type { CompanyExtended } from "@/app/lib/types"

// Mock employee data (replace with API fetch)
const mockEmployees = [
  {
    id: "EMP001",
    companyId: "company_1",
    name: "John Doe",
    branch: "Main Branch",
    category: "Full-Time",
    department: "IT",
    designation: "Engineer",
    level: "Mid",
    grade: "B2",
    attendanceType: "Biometric",
    shift: "Morning",
    attendance: Array(31).fill(8),
  },
  {
    id: "EMP002",
    companyId: "company_1",
    name: "Jane Smith",
    branch: "Branch A",
    category: "Part-Time",
    department: "HR",
    designation: "Manager",
    level: "Senior",
    grade: "A1",
    attendanceType: "Manual",
    shift: "Afternoon",
    attendance: Array(31).fill(4),
  },
]

export default function AttendancePage() {
  const { currentCompany, selectedMonth, selectedYear } = useCompany()

  // Initialize setups from localStorage
  const [branches, setBranches] = useState<string[]>(() => JSON.parse(localStorage.getItem("branch-detail") || "[]"))
  const [categories, setCategories] = useState<string[]>(() => JSON.parse(localStorage.getItem("category") || "[]"))
  const [departments, setDepartments] = useState<string[]>(() => JSON.parse(localStorage.getItem("department") || "[]"))
  const [designations, setDesignations] = useState<string[]>(() => JSON.parse(localStorage.getItem("designation") || "[]"))
  const [levels, setLevels] = useState<string[]>(() => JSON.parse(localStorage.getItem("level") || "[]"))
  const [grades, setGrades] = useState<string[]>(() => JSON.parse(localStorage.getItem("grade") || "[]"))
  const [attendanceTypes, setAttendanceTypes] = useState<string[]>(() => JSON.parse(localStorage.getItem("attendance-type") || "[]"))
  const [shifts, setShifts] = useState<string[]>(() => JSON.parse(localStorage.getItem("shift") || "[]"))

  // Dropdown selections
  const [selectedBranch, setSelectedBranch] = useState<string>("")
  const [selectedCategory, setSelectedCategory] = useState<string>("")
  const [selectedDepartment, setSelectedDepartment] = useState<string>("")
  const [selectedDesignation, setSelectedDesignation] = useState<string>("")
  const [selectedLevel, setSelectedLevel] = useState<string>("")
  const [selectedGrade, setSelectedGrade] = useState<string>("")
  const [selectedAttendanceType, setSelectedAttendanceType] = useState<string>("")
  const [selectedShift, setSelectedShift] = useState<string>("")
  const [employees, setEmployees] = useState(mockEmployees)
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set())
  const [bulkEditDialog, setBulkEditDialog] = useState<{ day: number; value: string } | null>(null)

  // Generate years
  const years = useMemo(() => {
    const currentYear = new Date().getFullYear()
    return Array.from({ length: 6 }, (_, i) => (currentYear - i).toString())
  }, [])

  // Calculate days in selected month
  const daysInMonth = useMemo(() => {
    if (!selectedMonth || !selectedYear) return 31
    const date = new Date(parseInt(selectedYear), parseInt(selectedMonth) - 1, 1)
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }, [selectedMonth, selectedYear])

  // Filter employees
  const filteredEmployees = useMemo(() => {
    if (!currentCompany) return []
    return employees.filter((employee) => {
      return (
        employee.companyId === currentCompany.id &&
        (!selectedBranch || employee.branch === selectedBranch) &&
        (!selectedCategory || employee.category === selectedCategory) &&
        (!selectedDepartment || employee.department === selectedDepartment) &&
        (!selectedDesignation || employee.designation === selectedDesignation) &&
        (!selectedLevel || employee.level === selectedLevel) &&
        (!selectedGrade || employee.grade === selectedGrade) &&
        (!selectedAttendanceType || employee.attendanceType === selectedAttendanceType) &&
        (!selectedShift || employee.shift === selectedShift)
      )
    })
  }, [
    employees,
    currentCompany,
    selectedBranch,
    selectedCategory,
    selectedDepartment,
    selectedDesignation,
    selectedLevel,
    selectedGrade,
    selectedAttendanceType,
    selectedShift,
  ])

  // Handle attendance change
  const handleAttendanceChange = (employeeId: string, day: number, value: string) => {
    const numValue = parseFloat(value)
    if (isNaN(numValue) || numValue < 0) {
      toast({
        title: "Invalid Input",
        description: "Please enter a valid number of hours (0 or greater).",
        variant: "destructive",
        duration: 3000,
      })
      return
    }
    setEmployees((prev) =>
      prev.map((emp) =>
        emp.id === employeeId
          ? { ...emp, attendance: emp.attendance.map((h, i) => (i === day ? numValue : h)) }
          : emp
      )
    )
    // TODO: Save to database
    // await fetch("/api/attendance", { method: "POST", body: JSON.stringify({ employeeId, day, month: selectedMonth, year: selectedYear, hours: numValue }) })
  }

  // Handle bulk edit
  const handleBulkEdit = (day: number, value: string) => {
    const numValue = parseFloat(value)
    if (isNaN(numValue) || numValue < 0) {
      toast({
        title: "Invalid Input",
        description: "Please enter a valid number of hours (0 or greater).",
        variant: "destructive",
        duration: 3000,
      })
      return
    }
    setEmployees((prev) =>
      prev.map((emp) =>
        selectedRows.has(emp.id)
          ? { ...emp, attendance: emp.attendance.map((h, i) => (i === day ? numValue : h)) }
          : emp
      )
    )
    // TODO: Save bulk changes to database
    setBulkEditDialog(null)
  }

  // Handle row selection
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRows(new Set(filteredEmployees.map((emp) => emp.id)))
    } else {
      setSelectedRows(new Set())
    }
  }

  const handleSelectRow = (id: string, checked: boolean) => {
    setSelectedRows((prev) => {
      const newSet = new Set(prev)
      if (checked) {
        newSet.add(id)
      } else {
        newSet.delete(id)
      }
      return newSet
    })
  }

  return (
    <GlobalLayout>
      <div className="min-h-screen bg-gradient-to-br from-gray-100 via-gray-200 to-gray-300 p-6 text-gray-900">
        <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-teal-500 mb-8">
          Attendance Management
        </h1>

        <Card className="bg-white border border-gray-300 rounded-lg shadow-sm hover:shadow-md transition-shadow mb-6">
          <CardHeader className="bg-blue-50 p-4 rounded-t-lg">
            <CardTitle className="text-lg font-semibold text-gray-900">Filter Attendance</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="branch" className="text-gray-700">Branch</Label>
                <Select value={selectedBranch} onValueChange={setSelectedBranch}>
                  <SelectTrigger id="branch" className="text-xs sm:text-sm">
                    <SelectValue placeholder="Select branch" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Branches</SelectItem>
                    {branches.map((branch) => (
                      <SelectItem key={branch} value={branch}>{branch}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="category" className="text-gray-700">Category</Label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger id="category" className="text-xs sm:text-sm">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Categories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="department" className="text-gray-700">Department</Label>
                <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                  <SelectTrigger id="department" className="text-xs sm:text-sm">
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Departments</SelectItem>
                    {departments.map((dept) => (
                      <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="designation" className="text-gray-700">Designation</Label>
                <Select value={selectedDesignation} onValueChange={setSelectedDesignation}>
                  <SelectTrigger id="designation" className="text-xs sm:text-sm">
                    <SelectValue placeholder="Select designation" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Designations</SelectItem>
                    {designations.map((des) => (
                      <SelectItem key={des} value={des}>{des}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="level" className="text-gray-700">Level</Label>
                <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                  <SelectTrigger id="level" className="text-xs sm:text-sm">
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Levels</SelectItem>
                    {levels.map((level) => (
                      <SelectItem key={level} value={level}>{level}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="grade" className="text-gray-700">Grade</Label>
                <Select value={selectedGrade} onValueChange={setSelectedGrade}>
                  <SelectTrigger id="grade" className="text-xs sm:text-sm">
                    <SelectValue placeholder="Select grade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Grades</SelectItem>
                    {grades.map((grade) => (
                      <SelectItem key={grade} value={grade}>{grade}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="attendanceType" className="text-gray-700">Attendance Type</Label>
                <Select value={selectedAttendanceType} onValueChange={setSelectedAttendanceType}>
                  <SelectTrigger id="attendanceType" className="text-xs sm:text-sm">
                    <SelectValue placeholder="Select attendance type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Attendance Types</SelectItem>
                    {attendanceTypes.map((type) => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="shift" className="text-gray-700">Shift</Label>
                <Select value={selectedShift} onValueChange={setSelectedShift}>
                  <SelectTrigger id="shift" className="text-xs sm:text-sm">
                    <SelectValue placeholder="Select shift" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Shifts</SelectItem>
                    {shifts.map((shift) => (
                      <SelectItem key={shift} value={shift}>{shift}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border border-gray-300 rounded-lg shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="bg-blue-50 p-4 rounded-t-lg">
            <CardTitle className="text-lg font-semibold text-gray-900">Attendance Records</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            {!currentCompany && (
              <p className="text-red-600 text-center py-3">Please select a company from the dashboard.</p>
            )}
            {selectedRows.size > 0 && (
              <div className="mb-4">
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => setBulkEditDialog({ day: 0, value: "" })}
                  className="bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                >
                  <Calendar className="h-4 w-4 mr-2" /> Bulk Edit Attendance
                </Button>
                <span className="ml-2 text-xs sm:text-sm text-gray-700">
                  {selectedRows.size} employee(s) selected
                </span>
              </div>
            )}
            <div className="overflow-x-auto">
              <Table className="w-full">
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="text-gray-700">
                      <Checkbox
                        checked={selectedRows.size === filteredEmployees.length && filteredEmployees.length > 0}
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                    <TableHead className="text-gray-700">Employee ID</TableHead>
                    <TableHead className="text-gray-700">Name</TableHead>
                    <TableHead className="text-gray-700">Branch</TableHead>
                    <TableHead className="text-gray-700">Category</TableHead>
                    <TableHead className="text-gray-700">Department</TableHead>
                    <TableHead className="text-gray-700">Designation</TableHead>
                    <TableHead className="text-gray-700">Level</TableHead>
                    <TableHead className="text-gray-700">Grade</TableHead>
                    <TableHead className="text-gray-700">Attendance Type</TableHead>
                    <TableHead className="text-gray-700">Shift</TableHead>
                    {Array.from({ length: daysInMonth }, (_, i) => (
                      <TableHead key={i} className="text-gray-700">{i + 1}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEmployees.length > 0 ? (
                    filteredEmployees.map((employee) => (
                      <TableRow key={employee.id} className="hover:bg-gray-100 transition-colors">
                        <TableCell>
                          <Checkbox
                            checked={selectedRows.has(employee.id)}
                            onCheckedChange={(checked) => handleSelectRow(employee.id, checked as boolean)}
                          />
                        </TableCell>
                        <TableCell className="text-gray-800">{employee.id}</TableCell>
                        <TableCell className="text-gray-800">{employee.name}</TableCell>
                        <TableCell className="text-gray-800">{employee.branch}</TableCell>
                        <TableCell className="text-gray-800">{employee.category}</TableCell>
                        <TableCell className="text-gray-800">{employee.department}</TableCell>
                        <TableCell className="text-gray-800">{employee.designation}</TableCell>
                        <TableCell className="text-gray-800">{employee.level}</TableCell>
                        <TableCell className="text-gray-800">{employee.grade}</TableCell>
                        <TableCell className="text-gray-800">{employee.attendanceType}</TableCell>
                        <TableCell className="text-gray-800">{employee.shift}</TableCell>
                        {employee.attendance.slice(0, daysInMonth).map((hours, day) => (
                          <TableCell key={day}>
                            <Input
                              type="number"
                              value={hours}
                              onChange={(e) => handleAttendanceChange(employee.id, day, e.target.value)}
                              className="w-16 text-xs sm:text-sm border-gray-300 bg-white focus:ring-2 focus:ring-blue-500"
                              min="0"
                            />
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={11 + daysInMonth} className="h-16 sm:h-24 text-center text-gray-500">
                        No employees found for the selected filters.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Dialog open={bulkEditDialog !== null} onOpenChange={() => setBulkEditDialog(null)}>
          <DialogContent className="bg-white border border-gray-300 rounded-lg shadow-lg">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold text-gray-900">
                Bulk Edit Attendance for Day {bulkEditDialog?.day ? bulkEditDialog.day + 1 : ""}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-5 py-5">
              <div className="space-y-2">
                <Label htmlFor="bulk-hours" className="text-gray-700">Hours</Label>
                <Input
                  id="bulk-hours"
                  type="number"
                  value={bulkEditDialog?.value || ""}
                  onChange={(e) => setBulkEditDialog({ ...bulkEditDialog!, value: e.target.value })}
                  placeholder="Enter hours"
                  className="border-gray-300 bg-white focus:ring-2 focus:ring-blue-500"
                  min="0"
                />
              </div>
              <Button
                onClick={() => handleBulkEdit(bulkEditDialog!.day, bulkEditDialog!.value)}
                className="w-full bg-blue-600 text-white hover:bg-blue-700 transition-colors"
              >
                Apply
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </GlobalLayout>
  )
}*/