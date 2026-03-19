
// app/attendance/page.tsx
"use client"

import React, { useState, useMemo, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { toast } from "@/hooks/use-toast"
import { Calendar, Info, User } from "lucide-react"
import { GlobalLayout } from "@/app/components/global-layout"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { api } from "@/app/lib/api"
import { useCompanySetups } from "@/hooks/useCompanySetups"

// Helper function to calculate week off days for a month
function calculateWeekOffDays(month: number, year: number, shift: any): number {
  if (!shift?.defineWeeklyOff || !shift?.weeklyOffPattern) return 0;

  const daysInMonth = new Date(year, month, 0).getDate();
  let weekOffCount = 0;

  const offDays = new Set<string>();
  shift.weeklyOffPattern.forEach((pattern: any) => {
    if (pattern.type === "Full day") {
      offDays.add(pattern.day);
    }
  });

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month - 1, day);
    const dayName = date.toLocaleString('en-US', { weekday: 'short' });
    if (offDays.has(dayName)) {
      weekOffCount++;
    }
  }

  return weekOffCount;
}

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

  // ============== FILTER STATES ==============
  const [selectedBranch, setSelectedBranch] = useState<string>("all")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all")
  const [selectedDesignation, setSelectedDesignation] = useState<string>("all")
  const [selectedLevel, setSelectedLevel] = useState<string>("all")
  const [selectedGrade, setSelectedGrade] = useState<string>("all")
  const [selectedAttendanceType, setSelectedAttendanceType] = useState<string>("all")
  const [selectedShift, setSelectedShift] = useState<string>("all")

  // ============== MONTH / YEAR ==============
  const currentDate = new Date()
  const [selectedMonth, setSelectedMonth] = useState<string>((currentDate.getMonth() + 1).toString().padStart(2, "0"))
  const [selectedYear, setSelectedYear] = useState<string>(currentDate.getFullYear().toString())

  const daysInMonth = useMemo(() => {
    return new Date(parseInt(selectedYear), parseInt(selectedMonth), 0).getDate()
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
      { value: "Halfday", label: "Halfday" },
    ]
    const fromPolicies = leavePolicyCodes
      .filter(p => !['P', 'A', 'HALFDAY'].includes(p.code.toUpperCase()))
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
      const branchMatch = selectedBranch === "all" || emp.branch === selectedBranch
      const catMatch = selectedCategory === "all" || emp.category === selectedCategory
      const deptMatch = selectedDepartment === "all" || emp.department === selectedDepartment
      const desigMatch = selectedDesignation === "all" || emp.designation === selectedDesignation
      const levelMatch = selectedLevel === "all" || emp.level === selectedLevel
      const gradeMatch = selectedGrade === "all" || emp.grade === selectedGrade
      const attTypeMatch = selectedAttendanceType === "all" || emp.attendanceType === selectedAttendanceType
      const shiftMatch = selectedShift === "all" || emp.shiftId === selectedShift

      return (
        branchMatch &&
        catMatch &&
        deptMatch &&
        desigMatch &&
        levelMatch &&
        gradeMatch &&
        attTypeMatch &&
        shiftMatch
      )
    })
  }, [
    employees,
    selectedBranch,
    selectedCategory,
    selectedDepartment,
    selectedDesignation,
    selectedLevel,
    selectedGrade,
    selectedAttendanceType,
    selectedShift,
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
        <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-teal-500 mb-8">
          Attendance Management
        </h1>

        {/* FILTER CARD */}
        <Card className="bg-white border border-gray-300 rounded-lg shadow-sm mb-6">
          <CardHeader className="bg-blue-50 p-4 rounded-t-lg">
            <CardTitle className="text-lg font-semibold text-gray-900">Filter Attendance</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
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

              {/* All other filters */}
              <div>
                <Label>Branch</Label>
                <Select value={selectedBranch} onValueChange={setSelectedBranch}>
                  <SelectTrigger><SelectValue placeholder="All Branches" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Branches</SelectItem>
                    {branches.map((b) => <SelectItem key={b} value={b}>{b}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Category</Label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger><SelectValue placeholder="All Categories" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Department</Label>
                <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                  <SelectTrigger><SelectValue placeholder="All Departments" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Departments</SelectItem>
                    {departments.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Designation</Label>
                <Select value={selectedDesignation} onValueChange={setSelectedDesignation}>
                  <SelectTrigger><SelectValue placeholder="All Designations" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Designations</SelectItem>
                    {designations.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Level</Label>
                <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                  <SelectTrigger><SelectValue placeholder="All Levels" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Levels</SelectItem>
                    {levels.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Grade</Label>
                <Select value={selectedGrade} onValueChange={setSelectedGrade}>
                  <SelectTrigger><SelectValue placeholder="All Grades" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Grades</SelectItem>
                    {grades.map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Attendance Type</Label>
                <Select value={selectedAttendanceType} onValueChange={setSelectedAttendanceType}>
                  <SelectTrigger><SelectValue placeholder="All Types" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {attendanceTypes.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Shift</Label>
                <Select value={selectedShift} onValueChange={setSelectedShift}>
                  <SelectTrigger><SelectValue placeholder="All Shifts" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Shifts</SelectItem>
                    {shiftsList.map((s: any) => (
                      <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* MAIN TABLE CARD */}
        <Card className="bg-white border border-gray-300 rounded-lg shadow-sm">
          <CardHeader className="bg-blue-50 p-4 rounded-t-lg">
            <CardTitle className="text-lg font-semibold text-gray-900">
              Attendance Records — {selectedMonth}/{selectedYear}
            </CardTitle>
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
                    <TableHead>Branch</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>P</TableHead>
                    <TableHead>A</TableHead>
                    <TableHead>WO</TableHead>
                    {leavePolicyCodes.map(policy => (
                      <TableHead key={policy.code}>{policy.code}</TableHead>
                    ))}
                    <TableHead>Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={9 + leavePolicyCodes.length} className="text-center py-8 text-gray-500">
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
                      const shiftData = shiftsList.find((s: any) => s.id === emp.shiftId);
                      const weekOffDays = calculateWeekOffDays(parseInt(selectedMonth), parseInt(selectedYear), shiftData);

                      // Calculate total
                      const present = summary['P'] || 0;
                      const absent = summary['A'] || 0;
                      const halfday = summary['Halfday'] || 0;
                      const leaves = leavePolicyCodes.reduce((sum, policy) => sum + (summary[policy.code] || 0), 0);
                      const total = present + absent + weekOffDays + leaves + halfday;

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
                          <TableCell>{emp.branch}</TableCell>
                          <TableCell>{emp.department}</TableCell>
                          <TableCell className="text-center font-semibold text-green-600">{summary['P'] || 0}</TableCell>
                          <TableCell className="text-center font-semibold text-red-600">{summary['A'] || 0}</TableCell>
                          <TableCell className="text-center font-semibold text-blue-600">{weekOffDays}</TableCell>
                          {leavePolicyCodes.map(policy => (
                            <TableCell key={policy.code} className="text-center font-semibold text-purple-600">
                              {summary[policy.code] || 0}
                            </TableCell>
                          ))}
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
                      <TableCell colSpan={9 + leavePolicyCodes.length} className="text-center py-8 text-gray-500">
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
    return !["P", "A", "Halfday"].includes(status);
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

        {/* 3-Column Grid of Days */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[0, 1, 2].map((col) => {
            const start = col * 10
            const end = Math.min(start + 10, daysInMonth)
            if (start >= daysInMonth) return null

            return (
              <div key={col} className="border rounded-lg overflow-hidden">
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

        {/* Summary */}
        <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4">
          {Object.entries(attendanceSummary).map(([status, count]) => (
            <div key={status} className="text-center bg-gray-50 p-4 rounded-lg">
              <Badge className={`${getStatusColor(status)} text-white mb-1`}>{status}</Badge>
              <p className="text-3xl font-bold text-gray-800">{count}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}