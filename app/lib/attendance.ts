export interface AttendanceRecord {
  id: string
  employeeId: string
  employeeName: string
  department: string
  date: string
  checkIn?: string
  checkOut?: string
  breakStart?: string
  breakEnd?: string
  status: "present" | "absent" | "late" | "half-day" | "on-leave"
  workingHours?: number
  overtimeHours?: number
  notes?: string
  location?: string
  createdAt: string
  updatedAt: string
}

export interface AttendanceStats {
  totalEmployees: number
  presentToday: number
  absentToday: number
  lateToday: number
  onLeaveToday: number
  averageWorkingHours: number
  attendanceRate: number
}

export interface AttendanceFilter {
  department?: string
  status?: string
  dateFrom?: string
  dateTo?: string
  employeeId?: string
}

// Mock attendance data
const attendanceRecords: AttendanceRecord[] = [
  {
    id: "att_1",
    employeeId: "emp_1",
    employeeName: "John Doe",
    department: "Engineering",
    date: "2024-03-15",
    checkIn: "09:00",
    checkOut: "18:00",
    breakStart: "13:00",
    breakEnd: "14:00",
    status: "present",
    workingHours: 8,
    overtimeHours: 0,
    location: "Office",
    createdAt: "2024-03-15T09:00:00Z",
    updatedAt: "2024-03-15T18:00:00Z",
  },
  {
    id: "att_2",
    employeeId: "emp_2",
    employeeName: "Alice Smith",
    department: "HR",
    date: "2024-03-15",
    checkIn: "09:15",
    checkOut: "17:45",
    status: "late",
    workingHours: 7.5,
    overtimeHours: 0,
    location: "Office",
    createdAt: "2024-03-15T09:15:00Z",
    updatedAt: "2024-03-15T17:45:00Z",
  },
  {
    id: "att_3",
    employeeId: "emp_3",
    employeeName: "Bob Johnson",
    department: "Sales",
    date: "2024-03-15",
    status: "absent",
    notes: "Sick leave",
    createdAt: "2024-03-15T00:00:00Z",
    updatedAt: "2024-03-15T00:00:00Z",
  },
  {
    id: "att_4",
    employeeId: "emp_4",
    employeeName: "Sarah Wilson",
    department: "Marketing",
    date: "2024-03-15",
    checkIn: "09:30",
    checkOut: "19:15",
    status: "present",
    workingHours: 9,
    overtimeHours: 1,
    location: "Remote",
    createdAt: "2024-03-15T09:30:00Z",
    updatedAt: "2024-03-15T19:15:00Z",
  },
  {
    id: "att_5",
    employeeId: "emp_5",
    employeeName: "Mike Davis",
    department: "Engineering",
    date: "2024-03-15",
    status: "on-leave",
    notes: "Annual leave",
    createdAt: "2024-03-15T00:00:00Z",
    updatedAt: "2024-03-15T00:00:00Z",
  },
]

export function getAttendanceRecords(filter?: AttendanceFilter): AttendanceRecord[] {
  let filtered = [...attendanceRecords]

  if (filter?.department) {
    filtered = filtered.filter((record) => record.department === filter.department)
  }

  if (filter?.status) {
    filtered = filtered.filter((record) => record.status === filter.status)
  }

  if (filter?.employeeId) {
    filtered = filtered.filter((record) => record.employeeId === filter.employeeId)
  }

  if (filter?.dateFrom) {
    filtered = filtered.filter((record) => record.date >= filter.dateFrom!)
  }

  if (filter?.dateTo) {
    filtered = filtered.filter((record) => record.date <= filter.dateTo!)
  }

  return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

export function getAttendanceStats(date?: string): AttendanceStats {
  const targetDate = date || new Date().toISOString().split("T")[0]
  const todayRecords = attendanceRecords.filter((record) => record.date === targetDate)

  const totalEmployees = 156 // Mock total employees
  const presentToday = todayRecords.filter((r) => r.status === "present" || r.status === "late").length
  const absentToday = todayRecords.filter((r) => r.status === "absent").length
  const lateToday = todayRecords.filter((r) => r.status === "late").length
  const onLeaveToday = todayRecords.filter((r) => r.status === "on-leave").length

  const workingHours = todayRecords.filter((r) => r.workingHours).map((r) => r.workingHours!)
  const averageWorkingHours =
    workingHours.length > 0 ? workingHours.reduce((sum, hours) => sum + hours, 0) / workingHours.length : 0

  const attendanceRate = totalEmployees > 0 ? (presentToday / totalEmployees) * 100 : 0

  return {
    totalEmployees,
    presentToday,
    absentToday,
    lateToday,
    onLeaveToday,
    averageWorkingHours: Math.round(averageWorkingHours * 10) / 10,
    attendanceRate: Math.round(attendanceRate * 10) / 10,
  }
}

export function getAttendanceById(id: string): AttendanceRecord | undefined {
  return attendanceRecords.find((record) => record.id === id)
}

export function createAttendanceRecord(
  data: Omit<AttendanceRecord, "id" | "createdAt" | "updatedAt">,
): AttendanceRecord {
  const newRecord: AttendanceRecord = {
    ...data,
    id: `att_${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  attendanceRecords.push(newRecord)
  return newRecord
}

export function updateAttendanceRecord(id: string, data: Partial<AttendanceRecord>): AttendanceRecord | null {
  const index = attendanceRecords.findIndex((record) => record.id === id)
  if (index === -1) return null

  attendanceRecords[index] = {
    ...attendanceRecords[index],
    ...data,
    updatedAt: new Date().toISOString(),
  }

  return attendanceRecords[index]
}

export function markCheckIn(employeeId: string, time?: string, location?: string): AttendanceRecord {
  const today = new Date().toISOString().split("T")[0]
  const checkInTime = time || new Date().toTimeString().slice(0, 5)

  // Check if record already exists for today
  const existingRecord = attendanceRecords.find((record) => record.employeeId === employeeId && record.date === today)

  if (existingRecord) {
    return updateAttendanceRecord(existingRecord.id, {
      checkIn: checkInTime,
      location,
      status: checkInTime > "09:15" ? "late" : "present",
    })!
  }

  // Create new record
  return createAttendanceRecord({
    employeeId,
    employeeName: `Employee ${employeeId}`, // In real app, fetch from employee data
    department: "Unknown", // In real app, fetch from employee data
    date: today,
    checkIn: checkInTime,
    location,
    status: checkInTime > "09:15" ? "late" : "present",
  })
}

export function markCheckOut(employeeId: string, time?: string): AttendanceRecord | null {
  const today = new Date().toISOString().split("T")[0]
  const checkOutTime = time || new Date().toTimeString().slice(0, 5)

  const existingRecord = attendanceRecords.find((record) => record.employeeId === employeeId && record.date === today)

  if (!existingRecord || !existingRecord.checkIn) {
    return null
  }

  // Calculate working hours
  const checkIn = new Date(`2024-01-01T${existingRecord.checkIn}:00`)
  const checkOut = new Date(`2024-01-01T${checkOutTime}:00`)
  const workingHours = (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60)

  // Account for break time (1 hour default)
  const actualWorkingHours = Math.max(0, workingHours - 1)
  const overtimeHours = Math.max(0, actualWorkingHours - 8)

  return updateAttendanceRecord(existingRecord.id, {
    checkOut: checkOutTime,
    workingHours: Math.round(actualWorkingHours * 10) / 10,
    overtimeHours: Math.round(overtimeHours * 10) / 10,
  })!
}

export function getDepartments(): string[] {
  const departments = [...new Set(attendanceRecords.map((record) => record.department))]
  return departments.filter(Boolean).sort()
}

export function getAttendanceTrends(days = 7): { date: string; present: number; absent: number; late: number }[] {
  const trends = []
  const today = new Date()

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    const dateStr = date.toISOString().split("T")[0]

    const dayRecords = attendanceRecords.filter((record) => record.date === dateStr)

    trends.push({
      date: dateStr,
      present: dayRecords.filter((r) => r.status === "present").length,
      absent: dayRecords.filter((r) => r.status === "absent").length,
      late: dayRecords.filter((r) => r.status === "late").length,
    })
  }

  return trends
}
