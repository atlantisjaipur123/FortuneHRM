
// app/attendance/page.tsx
"use client"

import React, { useState, useMemo, useEffect, useRef } from "react"
import * as XLSX from "xlsx"
import * as FileSaver from "file-saver"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { toast } from "@/hooks/use-toast"
import { Calendar, Info, User, ChevronLeft, ChevronRight, Download } from "lucide-react"
import { GlobalLayout } from "@/app/components/global-layout"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { api } from "@/app/lib/api"
import { useCompanySetups } from "@/hooks/useCompanySetups"

// Helper function removed since API now correctly tracks WO

export default function AttendancePage() {
  // ============== REAL SETUP DATA FROM DB (no localStorage) ==============
  const { data: setups } = useCompanySetups()

  const branches = useMemo<string[]>(() => setups?.branches?.map((b: any) => b.name) || [], [setups])
  const categories = useMemo<string[]>(() => setups?.employeeCategories?.map((c: any) => c.name) || [], [setups])
  const departments = useMemo<string[]>(() => setups?.departments?.map((d: any) => d.name) || [], [setups])
  const designations = useMemo<string[]>(() => setups?.designations?.map((d: any) => d.name) || [], [setups])
  const levels = useMemo<string[]>(() => setups?.levels?.map((l: any) => l.name) || [], [setups])
  const grades = useMemo<string[]>(() => setups?.grades?.map((g: any) => g.name) || [], [setups])
  const attendanceTypes = useMemo<string[]>(() => setups?.attendanceTypes?.map((a: any) => a.name) || [], [setups])
  const shiftsList = useMemo<any[]>(() => setups?.shifts || [], [setups]) // full objects for id + name

  // ============== FILTER STATES (multi-select arrays, empty = all) ==============
  const [selectedBranches, setSelectedBranches] = useState<string[]>([])
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([])
  const [selectedDesignations, setSelectedDesignations] = useState<string[]>([])
  const [selectedLevels, setSelectedLevels] = useState<string[]>([])
  const [selectedGrades, setSelectedGrades] = useState<string[]>([])
  const [selectedAttendanceTypes, setSelectedAttendanceTypes] = useState<string[]>([])
  const [selectedShifts, setSelectedShifts] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState("")

  // ============== MONTH / YEAR ==============
  const currentDate = new Date()
  const [selectedMonth, setSelectedMonth] = useState<string>((currentDate.getMonth() + 1).toString().padStart(2, "0"))
  const [selectedYear, setSelectedYear] = useState<string>(currentDate.getFullYear().toString())

  const daysInMonth = useMemo(() => {
    return new Date(parseInt(selectedYear), parseInt(selectedMonth), 0).getDate()
  }, [selectedMonth, selectedYear])

  // ============== MONTH NAVIGATION ==============
  const goToPrevMonth = () => {
    let m = parseInt(selectedMonth) - 1
    let y = parseInt(selectedYear)
    if (m < 1) { m = 12; y-- }
    setSelectedMonth(m.toString().padStart(2, "0"))
    setSelectedYear(y.toString())
  }

  const goToNextMonth = () => {
    let m = parseInt(selectedMonth) + 1
    let y = parseInt(selectedYear)
    if (m > 12) { m = 1; y++ }
    setSelectedMonth(m.toString().padStart(2, "0"))
    setSelectedYear(y.toString())
  }

  // ============== MONTH DISPLAY LABEL ==============
  const monthLabel = useMemo(() => {
    const date = new Date(parseInt(selectedYear), parseInt(selectedMonth) - 1)
    return date.toLocaleString('default', { month: 'long', year: 'numeric' })
  }, [selectedMonth, selectedYear])

  // ============== MAIN DATA ==============
  const [employees, setEmployees] = useState<any[]>([])
  const [policies, setPolicies] = useState<any[]>([])
  const [leavePolicyCodes, setLeavePolicyCodes] = useState<{ code: string; name: string }[]>([])
  const [loading, setLoading] = useState(true)

  // ============== UI STATES ==============
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set())
  const [bulkEditDialog, setBulkEditDialog] = useState<{ day?: number; value: string } | null>(null)
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null)

  // ============== FETCH REAL DATA ==============
  // Policies (once)
  useEffect(() => {
    const fetchPolicies = async () => {
      try {
        const res = await api.get("/api/leave")
        setPolicies(res.policies || [])
      } catch (e) {
        console.error("Failed to load policies")
      }
    }
    fetchPolicies()
  }, [])

  // Attendance data (on month/year change)
  const loadAttendance = async () => {
    setLoading(true)
    try {
      const res = await api.get(`/api/attendance?month=${selectedMonth}&year=${selectedYear}`)
      setEmployees(res.employees || [])
      // Store leave policies returned by API for dynamic status dropdowns
      if (res.leavePolicies) setLeavePolicyCodes(res.leavePolicies)
    } catch (e) {
      toast({ title: "Error", description: "Failed to load attendance", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  // Dynamic status options: mandatory P + A, then leave policy codes from DB
  const statusOptions = useMemo(() => {
    const defaults = [
      { value: "P", label: "P — Present" },
      { value: "A", label: "A — Absent" },
      { value: "WO", label: "WO — Week Off" },
      { value: "Halfday", label: "Halfday" },
    ]
    const fromPolicies = leavePolicyCodes
      .filter(p => !['P', 'A', 'WO', 'HALFDAY'].includes(p.code.toUpperCase()))
      .map(p => ({ value: p.code, label: `${p.code} — ${p.name}` }))
    return [...defaults, ...fromPolicies]
  }, [leavePolicyCodes])

  useEffect(() => {
    loadAttendance()
  }, [selectedMonth, selectedYear])

  // Sync selectedEmployee with latest employee data so UI updates instantly
  useEffect(() => {
    if (selectedEmployee) {
      const updatedEmp = employees.find(e => e.id === selectedEmployee.id)
      if (updatedEmp) {
        setSelectedEmployee(updatedEmp)
      }
    }
  }, [employees])

  // ============== FILTERED EMPLOYEES (REAL FILTERING) ==============
  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      const branchMatch = selectedBranches.length === 0 || selectedBranches.includes(emp.branch)
      const catMatch = selectedCategories.length === 0 || selectedCategories.includes(emp.category)
      const deptMatch = selectedDepartments.length === 0 || selectedDepartments.includes(emp.department)
      const desigMatch = selectedDesignations.length === 0 || selectedDesignations.includes(emp.designation)
      const levelMatch = selectedLevels.length === 0 || selectedLevels.includes(emp.level)
      const gradeMatch = selectedGrades.length === 0 || selectedGrades.includes(emp.grade)
      const attTypeMatch = selectedAttendanceTypes.length === 0 || selectedAttendanceTypes.includes(emp.attendanceType)
      const shiftMatch = selectedShifts.length === 0 || selectedShifts.includes(emp.shiftId)

      const searchMatch = !searchQuery ||
        emp.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.code?.toLowerCase().includes(searchQuery.toLowerCase())

      return (
        branchMatch &&
        catMatch &&
        deptMatch &&
        desigMatch &&
        levelMatch &&
        gradeMatch &&
        attTypeMatch &&
        shiftMatch &&
        searchMatch
      )
    })
  }, [
    employees,
    selectedBranches,
    selectedCategories,
    selectedDepartments,
    selectedDesignations,
    selectedLevels,
    selectedGrades,
    selectedAttendanceTypes,
    selectedShifts,
    searchQuery,
  ])

  // ============== SHIFT NAME MAP (for nice display) ==============
  const shiftNameMap = useMemo(() => {
    const map = new Map<string, string>()
    shiftsList.forEach((s: any) => map.set(s.id, s.name))
    return map
  }, [shiftsList])

  // ============== ROW SELECTION ==============
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
      if (checked) newSet.add(id)
      else newSet.delete(id)
      return newSet
    })
  }

  // ============== SINGLE DAY CHANGE (REAL API) ==============
  const handleAttendanceChange = async (employeeId: string, day: number, value: string) => {
    const dateStr = `${selectedYear}-${selectedMonth}-${(day + 1).toString().padStart(2, "0")}`

    try {
      await api.post("/api/attendance", { employeeId, date: dateStr, status: value })
      await loadAttendance()
      toast({ title: "Saved", description: `Day ${day + 1} updated` })
    } catch (e: any) {
      const errorMsg = e instanceof Error ? e.message : String(e) || "Failed to save attendance";
      if (errorMsg.includes("Insufficient balance")) {
        toast({ title: "Insufficient Balance", description: errorMsg, variant: "destructive" })
      } else {
        toast({ title: "Notice", description: errorMsg, variant: "destructive" })
      }
    }
  }

  // ============== MAIN TABLE BULK EDIT ==============
  const handleBulkEdit = async (day?: number, value?: string) => {
    if (!day || !value) return

    try {
      let hasError = false;
      let lastErrorMsg = "";
      for (const empId of selectedRows) {
        const dateStr = `${selectedYear}-${selectedMonth}-${(day + 1).toString().padStart(2, "0")}`
        try {
          await api.post("/api/attendance", { employeeId: empId, date: dateStr, status: value })
        } catch (e: any) {
          hasError = true;
          lastErrorMsg = e instanceof Error ? e.message : String(e) || "Some updates failed";
        }
      }
      await loadAttendance()
      setBulkEditDialog(null)
      setSelectedRows(new Set())

      if (hasError) {
        if (lastErrorMsg.includes("Insufficient balance")) {
          toast({ title: "Insufficient Balance", description: lastErrorMsg, variant: "destructive" })
        } else {
          toast({ title: "Notice", description: lastErrorMsg, variant: "destructive" })
        }
      } else {
        toast({ title: "Bulk Update Done" })
      }
    } catch (e: any) {
      toast({ title: "Error", description: "Unexpected error during bulk edit", variant: "destructive" })
    }
  }

  return (
    <GlobalLayout>
      <div className="min-h-screen bg-gradient-to-br from-gray-100 via-gray-200 to-gray-300 p-6 text-gray-900">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-teal-500">
            Attendance Management
          </h1>
          {/* Quick Month Navigation */}
          <div className="flex items-center gap-3 bg-white rounded-xl shadow-sm border border-gray-200 px-4 py-2">
            <Button onClick={goToPrevMonth} variant="ghost" size="sm" className="h-8 w-8 p-0">
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <span className="text-lg font-semibold text-gray-800 min-w-[160px] text-center">
              {monthLabel}
            </span>
            <Button onClick={goToNextMonth} variant="ghost" size="sm" className="h-8 w-8 p-0">
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* FILTER CARD */}
        <Card className="bg-white border border-gray-300 rounded-lg shadow-sm mb-6">
          <CardHeader className="bg-blue-50 p-4 rounded-t-lg">
            <CardTitle className="text-lg font-semibold text-gray-900">Filter Attendance</CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-4">
            <div className="w-full md:w-1/3">
              <Label>Search Employee</Label>
              <Input
                placeholder="Search by name or code..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Month & Year */}
              <div>
                <Label>Month</Label>
                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 12 }, (_, i) => (
                      <SelectItem key={i} value={(i + 1).toString().padStart(2, "0")}>
                        {new Date(0, i).toLocaleString("default", { month: "long" })}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Year</Label>
                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 10 }, (_, i) => (
                      <SelectItem key={i} value={(currentDate.getFullYear() - 5 + i).toString()}>
                        {currentDate.getFullYear() - 5 + i}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* All other filters — multi-select checkboxes */}
              <MultiCheckboxFilter label="Branch" options={branches.map(b => ({ value: b, label: b }))} selected={selectedBranches} onChange={setSelectedBranches} />
              <MultiCheckboxFilter label="Category" options={categories.map(c => ({ value: c, label: c }))} selected={selectedCategories} onChange={setSelectedCategories} />
              <MultiCheckboxFilter label="Department" options={departments.map(d => ({ value: d, label: d }))} selected={selectedDepartments} onChange={setSelectedDepartments} />
              <MultiCheckboxFilter label="Designation" options={designations.map(d => ({ value: d, label: d }))} selected={selectedDesignations} onChange={setSelectedDesignations} />
              <MultiCheckboxFilter label="Level" options={levels.map(l => ({ value: l, label: l }))} selected={selectedLevels} onChange={setSelectedLevels} />
              <MultiCheckboxFilter label="Grade" options={grades.map(g => ({ value: g, label: g }))} selected={selectedGrades} onChange={setSelectedGrades} />
              <MultiCheckboxFilter label="Attendance Type" options={attendanceTypes.map(t => ({ value: t, label: t }))} selected={selectedAttendanceTypes} onChange={setSelectedAttendanceTypes} />
              <MultiCheckboxFilter label="Shift" options={shiftsList.map((s: any) => ({ value: s.id, label: s.name }))} selected={selectedShifts} onChange={setSelectedShifts} />
            </div>
          </CardContent>
        </Card>

        {/* MAIN TABLE CARD */}
        <Card className="bg-white border border-gray-300 rounded-lg shadow-sm">
          <CardHeader className="bg-blue-50 p-4 rounded-t-lg">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold text-gray-900">
                Attendance Records — {monthLabel}
              </CardTitle>
              <Button
                onClick={() => {
                  const rows = filteredEmployees.map(emp => {
                    const attendance = emp.attendance || []
                    const summary: Record<string, number> = {}
                    attendance.forEach((status: string) => { summary[status] = (summary[status] || 0) + 1 })
                    const wo = summary['WO'] || 0
                    const present = summary['P'] || 0
                    const absent = summary['A'] || 0
                    const halfday = summary['Halfday'] || 0
                    const row: any = {
                      'Code': emp.code,
                      'Name': emp.name,
                      'Department': emp.department || '',
                      'Status': emp.employmentStatus === 'ACTIVE' ? 'Active' : 'Deactive',
                      'DOJ': emp.doj ? new Date(emp.doj).toLocaleDateString('en-IN') : '',
                      'Present': present,
                      'Absent': absent,
                      'Halfday': halfday,
                      'WO': wo,
                    }
                    leavePolicyCodes.forEach(p => { row[p.code] = summary[p.code] || 0 })
                    const leaves = leavePolicyCodes.reduce((s, p) => s + (summary[p.code] || 0), 0)
                    row['Payable'] = present + wo + leaves + (halfday * 0.5)
                    row['Total'] = present + absent + wo + leaves + halfday
                    row['Days in Month'] = daysInMonth
                    return row
                  })
                  const ws = XLSX.utils.json_to_sheet(rows)
                  const wb = { Sheets: { Attendance: ws }, SheetNames: ['Attendance'] }
                  const buf = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
                  FileSaver.saveAs(
                    new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }),
                    `attendance_${selectedMonth}_${selectedYear}.xlsx`
                  )
                }}
                variant="outline"
                className="flex items-center gap-2 bg-white hover:bg-green-50 border-green-300 text-green-700"
              >
                <Download className="h-4 w-4" />
                Export to Excel
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-4">
            {selectedRows.size > 0 && (
              <div className="mb-4 flex items-center gap-3">
                <Button
                  onClick={() => setBulkEditDialog({ value: "P" })}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Calendar className="mr-2 h-4 w-4" /> Bulk Edit Selected
                </Button>
                <span className="text-sm text-gray-600">
                  {selectedRows.size} employee(s) selected
                </span>
              </div>
            )}

            <ScrollArea className="w-full">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead>
                      <Checkbox
                        checked={filteredEmployees.length > 0 && selectedRows.size === filteredEmployees.length}
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>DOJ</TableHead>
                    <TableHead>P</TableHead>
                    <TableHead>A</TableHead>
                    <TableHead>WO</TableHead>
                    <TableHead>HD</TableHead>
                    {leavePolicyCodes.map(policy => (
                      <TableHead key={policy.code}>{policy.code}</TableHead>
                    ))}
                    <TableHead>Payable</TableHead>
                    <TableHead>Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={12 + leavePolicyCodes.length} className="text-center py-8 text-gray-500">
                        Loading attendance...
                      </TableCell>
                    </TableRow>
                  ) : filteredEmployees.length > 0 ? (
                    filteredEmployees.map((emp) => {
                      // Calculate attendance summary
                      const attendance = emp.attendance || [];
                      const summary: Record<string, number> = {};
                      attendance.forEach((status: string) => {
                        summary[status] = (summary[status] || 0) + 1;
                      });

                      // Calculate week off days
                      const weekOffDays = summary['WO'] || 0;

                      // Calculate total
                      const present = summary['P'] || 0;
                      const absent = summary['A'] || 0;
                      const halfday = summary['Halfday'] || 0;
                      const leaves = leavePolicyCodes.reduce((sum, policy) => sum + (summary[policy.code] || 0), 0);
                      const total = present + absent + weekOffDays + leaves + halfday;
                      const payable = present + weekOffDays + leaves + (halfday * 0.5);

                      return (
                        <TableRow
                          key={emp.id}
                          className="hover:bg-gray-100 cursor-pointer"
                          onClick={() => setSelectedEmployee(emp)}
                        >
                          <TableCell onClick={(e) => e.stopPropagation()}>
                            <Checkbox
                              checked={selectedRows.has(emp.id)}
                              onCheckedChange={(ch) => handleSelectRow(emp.id, !!ch)}
                            />
                          </TableCell>
                          <TableCell>{emp.code}</TableCell>
                          <TableCell>{emp.name}</TableCell>
                          <TableCell>{emp.department}</TableCell>
                          <TableCell>
                            <Badge className={emp.employmentStatus === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                              {emp.employmentStatus === 'ACTIVE' ? 'Active' : 'Deactive'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm">{emp.doj ? new Date(emp.doj).toLocaleDateString('en-IN') : '—'}</TableCell>
                          <TableCell className="text-center font-semibold text-green-600">{summary['P'] || 0}</TableCell>
                          <TableCell className="text-center font-semibold text-red-600">{summary['A'] || 0}</TableCell>
                          <TableCell className="text-center font-semibold text-blue-600">{weekOffDays}</TableCell>
                          <TableCell className="text-center font-semibold text-yellow-600">{halfday}</TableCell>
                          {leavePolicyCodes.map(policy => (
                            <TableCell key={policy.code} className="text-center font-semibold text-purple-600">
                              {summary[policy.code] || 0}
                            </TableCell>
                          ))}
                          <TableCell className="text-center font-bold text-gray-800">
                            {payable}
                          </TableCell>
                          <TableCell className="text-center font-bold">
                            <span className={total === daysInMonth ? "text-green-600" : "text-red-600"}>
                              {total}/{daysInMonth}
                            </span>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={10 + leavePolicyCodes.length} className="text-center py-8 text-gray-500">
                        No employees match the selected filters.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* MAIN BULK DIALOG */}
        <Dialog open={bulkEditDialog !== null} onOpenChange={() => setBulkEditDialog(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Bulk Edit Attendance</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label>Day</Label>
                <Select
                  value={bulkEditDialog?.day !== undefined ? String(bulkEditDialog.day + 1) : ""}
                  onValueChange={(v) => bulkEditDialog && setBulkEditDialog({ ...bulkEditDialog, day: parseInt(v) - 1 })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select day" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: daysInMonth }, (_, i) => (
                      <SelectItem key={i} value={String(i + 1)}>{i + 1}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Status</Label>
                <Select
                  value={bulkEditDialog?.value || "P"}
                  onValueChange={(v) => bulkEditDialog && setBulkEditDialog({ ...bulkEditDialog, value: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={() => handleBulkEdit(bulkEditDialog?.day, bulkEditDialog?.value)} className="w-full bg-blue-600">
                Apply to Selected Employees
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* EMPLOYEE DETAIL POPUP */}
        <Dialog open={!!selectedEmployee} onOpenChange={() => setSelectedEmployee(null)}>
          <DialogContent className="max-w-5xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                {selectedEmployee?.name} — {selectedEmployee?.code}
              </DialogTitle>
            </DialogHeader>

            {selectedEmployee && (
              <ScrollArea className="max-h-[85vh]">
                <div className="space-y-6">
                  {/* Leave Balances - Moved to top */}
                  <Card>
                    <CardHeader className="bg-purple-50">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Info className="h-4 w-4" />
                        Leave Balances
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 grid grid-cols-2 sm:grid-cols-4 gap-6">
                      {Object.entries(selectedEmployee.leaveBalances || {}).map(([code, bal]) => (
                        <div key={code} className="text-center">
                          <Badge className="bg-purple-600 text-white mb-2">{code}</Badge>
                          <p className="text-2xl font-semibold text-gray-800">{String(bal)}</p>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  {/* Attendance Grid */}
                  <AttendanceDetails
                    selectedEmployee={selectedEmployee}
                    selectedMonth={selectedMonth}
                    selectedYear={selectedYear}
                    daysInMonth={daysInMonth}
                    handleAttendanceChange={handleAttendanceChange}
                    shiftNameMap={shiftNameMap}
                    refreshAttendance={loadAttendance}
                    statusOptions={statusOptions}
                  />
                </div>
              </ScrollArea>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </GlobalLayout>
  )
}

/* ====================== POPUP ATTENDANCE DETAILS ====================== */
function AttendanceDetails({
  selectedEmployee,
  selectedMonth,
  selectedYear,
  daysInMonth,
  handleAttendanceChange,
  shiftNameMap,
  refreshAttendance,
  statusOptions,
}: {
  selectedEmployee: any
  selectedMonth: string
  selectedYear: string
  daysInMonth: number
  handleAttendanceChange: (empId: string, day: number, status: string) => Promise<void>
  shiftNameMap: Map<string, string>
  refreshAttendance: () => Promise<void>
  statusOptions: { value: string; label: string }[]
}) {
  const [localAttendance, setLocalAttendance] = useState<string[]>([]);
  const [changes, setChanges] = useState<Record<number, string>>({});
  const [saving, setSaving] = useState(false);
  const [selectedDays, setSelectedDays] = useState<Set<number>>(new Set());
  const [bulkStatus, setBulkStatus] = useState<string>("P");
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Initialize local attendance when employee changes
  useEffect(() => {
    if (selectedEmployee) {
      setLocalAttendance([...(selectedEmployee.attendance || [])]);
      setChanges({});
      setSelectedDays(new Set());
      setValidationErrors([]);
    }
  }, [selectedEmployee]);

  const getCurrentAttendance = (day: number) => {
    return changes[day] !== undefined ? changes[day] : localAttendance[day] || "P";
  };

  const handleLocalChange = (day: number, value: string) => {
    setChanges(prev => ({
      ...prev,
      [day]: value
    }));
    // Run validation in real-time and clear errors if valid
    setTimeout(() => {
      const errors = validateLeaveBalances();
      setValidationErrors(errors);
    }, 0);
  };

  // Helper function to check if a status is a leave code
  const isLeaveCode = (status: string) => {
    return !["P", "A", "WO", "Halfday"].includes(status);
  };

  // Local leave balance validation
  const validateLeaveBalances = () => {
    const errors: string[] = [];
    const leaveBalances = selectedEmployee?.leaveBalances || {};
    const proposedLeaveUsage: Record<string, number> = {};

    // Count total proposed leave usage for the month
    for (let day = 0; day < daysInMonth; day++) {
      const status = getCurrentAttendance(day);
      if (isLeaveCode(status)) {
        proposedLeaveUsage[status] = (proposedLeaveUsage[status] || 0) + 1;
      }
    }

    // Check each leave type against available balance
    // The available balance already accounts for existing usage across all months
    Object.entries(proposedLeaveUsage).forEach(([leaveCode, daysUsed]) => {
      const availableBalance = leaveBalances[leaveCode] || 0;
      if (daysUsed > availableBalance) {
        errors.push(`${leaveCode}: ${daysUsed} days requested but only ${availableBalance} days available`);
      }
    });

    return errors;
  };

  const handleSaveChanges = async () => {
    // Validate leave balances locally first
    const errors = validateLeaveBalances();
    if (errors.length > 0) {
      setValidationErrors(errors);
      toast({
        title: "Insufficient Leave Balance",
        description: errors.join(". "),
        variant: "destructive"
      });
      return;
    }

    if (Object.keys(changes).length === 0) {
      toast({ title: "No changes to save" });
      return;
    }

    setSaving(true);
    setValidationErrors([]); // Clear errors during save

    let hasError = false;
    let lastErrorMsg = "";

    try {
      // Send all changes in one request
      const changeRequests = Object.entries(changes).map(([dayStr, status]) => {
        const day = parseInt(dayStr);
        const dateStr = `${selectedYear}-${selectedMonth}-${(day + 1).toString().padStart(2, "0")}`;
        return {
          employeeId: selectedEmployee.id,
          date: dateStr,
          status
        };
      });

      // Send batch request
      await api.patch("/api/attendance", { changes: changeRequests });

      // Update local state
      const newAttendance = [...localAttendance];
      Object.entries(changes).forEach(([dayStr, status]) => {
        const day = parseInt(dayStr);
        newAttendance[day] = status;
      });
      setLocalAttendance(newAttendance);
      setChanges({});
      setValidationErrors([]);

      toast({ title: "All changes saved successfully" });
      await refreshAttendance();
    } catch (e: any) {
      hasError = true;
      lastErrorMsg = e instanceof Error ? e.message : String(e) || "Failed to save changes";
      toast({ title: "Error", description: lastErrorMsg, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleSelectAllDays = (checked: boolean) => {
    if (checked) {
      setSelectedDays(new Set(Array.from({ length: daysInMonth }, (_, i) => i)));
    } else {
      setSelectedDays(new Set());
    }
  };

  const handleBulkApply = () => {
    if (selectedDays.size === 0) {
      toast({ title: "No days selected", variant: "destructive" });
      return;
    }

    // Apply the bulk status to all selected days
    const newChanges = { ...changes };
    selectedDays.forEach(day => {
      newChanges[day] = bulkStatus;
    });

    setChanges(newChanges);
    setSelectedDays(new Set());

    // Run validation after bulk changes
    setTimeout(() => {
      const errors = validateLeaveBalances();
      setValidationErrors(errors);
    }, 0);

    toast({ title: `Applied ${bulkStatus} to ${selectedDays.size} days` });
  };

  const attendanceSummary = useMemo(() => {
    const counts: Record<string, number> = {}
    for (let day = 0; day < daysInMonth; day++) {
      const status = getCurrentAttendance(day);
      counts[status] = (counts[status] || 0) + 1;
    }
    return counts
  }, [localAttendance, changes, daysInMonth])

  const getStatusColor = (s: string) => {
    if (s === "P") return "bg-green-500"
    if (s === "A") return "bg-red-500"
    if (s === "Halfday") return "bg-yellow-500"
    if (["CL", "PL", "SL"].includes(s)) return "bg-blue-500"
    if (s === "LWP") return "bg-orange-500"
    return "bg-gray-500"
  }

  return (
    <Card>
      <CardHeader className="bg-blue-50">
        <CardTitle className="text-base flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Calendar className="h-4 w-4" /> Daily Attendance Grid
          </span>
          {Object.keys(changes).length > 0 && (
            <Button
              onClick={handleSaveChanges}
              disabled={saving}
              className="bg-green-600 hover:bg-green-700"
            >
              {saving ? "Saving..." : `Save ${Object.keys(changes).length} Changes`}
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        {/* Validation Errors */}
        {validationErrors.length > 0 && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <h4 className="text-red-800 font-semibold mb-2">Leave Balance Errors:</h4>
            <ul className="text-red-700 text-sm">
              {validationErrors.map((error, index) => (
                <li key={index}>• {error}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Bulk Selection Controls */}
        <div className="flex items-center gap-3 mb-4">
          <Checkbox
            checked={selectedDays.size === daysInMonth}
            onCheckedChange={handleSelectAllDays}
          />
          <span className="text-sm">Select All Days</span>
          {selectedDays.size > 0 && (
            <>
              <Select value={bulkStatus} onValueChange={setBulkStatus}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={handleBulkApply} className="bg-blue-600">
                Apply to {selectedDays.size} day(s)
              </Button>
            </>
          )}
        </div>

        {/* Summary — shown at top with all status types */}
        <div className="mb-4 grid grid-cols-3 sm:grid-cols-6 gap-2">
          {(() => {
            const allStatuses: { key: string; label: string }[] = [
              { key: 'P', label: 'P' },
              { key: 'A', label: 'A' },
              { key: 'WO', label: 'WO' },
              { key: 'Halfday', label: 'HD' },
              ...statusOptions
                .filter(o => !['P', 'A', 'WO', 'Halfday'].includes(o.value))
                .map(o => ({ key: o.value, label: o.value })),
            ]
            return allStatuses.map(({ key, label }) => (
              <div key={key} className="text-center bg-gray-50 p-2 rounded-md">
                <Badge className={`${getStatusColor(key)} text-white text-xs px-1.5 py-0.5`}>{label}</Badge>
                <p className="text-lg font-bold text-gray-800 mt-0.5">{attendanceSummary[key] || 0}</p>
              </div>
            ))
          })()}
        </div>

        {/* 3-Column Grid of Days (dynamic sizing for 28-31 days) */}
        {(() => {
          const perCol = Math.ceil(daysInMonth / 3)
          return (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[0, 1, 2].map((col) => {
                const start = col * perCol
                const end = Math.min(start + perCol, daysInMonth)
                if (start >= daysInMonth) return null

                return (
                  <div key={col} className="border rounded-lg overflow-visible pb-4">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-50">
                          <TableHead className="w-12" />
                          <TableHead>Date</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {Array.from({ length: end - start }, (_, i) => {
                          const day = start + i
                          const status = getCurrentAttendance(day)
                          const dateObj = new Date(parseInt(selectedYear), parseInt(selectedMonth) - 1, day + 1)
                          const weekday = dateObj.toLocaleString("default", { weekday: "short" })
                          const hasChange = changes[day] !== undefined

                          return (
                            <TableRow key={day} className={hasChange ? "bg-yellow-50" : ""}>
                              <TableCell>
                                <Checkbox
                                  checked={selectedDays.has(day)}
                                  onCheckedChange={(ch) => {
                                    const ns = new Set(selectedDays)
                                    if (ch) ns.add(day)
                                    else ns.delete(day)
                                    setSelectedDays(ns)
                                  }}
                                />
                              </TableCell>
                              <TableCell className="font-medium">
                                {day + 1} <span className="text-xs text-gray-500">({weekday})</span>
                                {hasChange && <span className="ml-1 text-xs text-orange-600">●</span>}
                              </TableCell>
                              <TableCell>
                                <Select
                                  value={status}
                                  onValueChange={(v) => handleLocalChange(day, v)}
                                >
                                  <SelectTrigger className="w-28 text-sm">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {statusOptions.map(opt => (
                                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </TableCell>
                            </TableRow>
                          )
                        })}
                      </TableBody>
                    </Table>
                  </div>
                )
              })}
            </div>
          )
        })()}
      </CardContent>
    </Card>
  )
}

/* ====================== MULTI-SELECT CHECKBOX FILTER ====================== */
function MultiCheckboxFilter({
  label,
  options,
  selected,
  onChange,
}: {
  label: string
  options: { value: string; label: string }[]
  selected: string[]
  onChange: (values: string[]) => void
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const toggle = (val: string) => {
    if (selected.includes(val)) {
      onChange(selected.filter(v => v !== val))
    } else {
      onChange([...selected, val])
    }
  }

  const displayText = selected.length === 0
    ? `All ${label}s`
    : selected.length === 1
      ? options.find(o => o.value === selected[0])?.label || selected[0]
      : `${selected.length} selected`

  return (
    <div ref={ref} className="relative">
      <Label>{label}</Label>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
      >
        <span className="truncate">{displayText}</span>
        <svg className="h-4 w-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="absolute z-50 mt-1 w-full max-h-60 overflow-auto rounded-md border bg-white shadow-lg p-2">
          {selected.length > 0 && (
            <button
              type="button"
              onClick={() => onChange([])}
              className="w-full text-left text-xs text-blue-600 hover:text-blue-800 mb-1 px-2 py-1"
            >
              Clear all
            </button>
          )}
          {options.length === 0 ? (
            <p className="text-sm text-gray-400 px-2 py-1">No options</p>
          ) : (
            options.map(opt => (
              <label key={opt.value} className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-gray-100 cursor-pointer text-sm">
                <Checkbox
                  checked={selected.includes(opt.value)}
                  onCheckedChange={() => toggle(opt.value)}
                />
                {opt.label}
              </label>
            ))
          )}
        </div>
      )}
    </div>
  )
}