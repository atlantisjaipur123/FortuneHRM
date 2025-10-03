import { getAttendanceRecords } from "./attendance"
import { calculatePayroll, type PayrollItem } from "./payroll"

export interface PayrollCalculationInput {
  employeeId: string
  basicSalary: number
  month: string
  year: number
  companyId: string
}

export interface EnhancedPayrollItem extends PayrollItem {
  attendanceData: {
    totalWorkingDays: number
    actualPresentDays: number
    totalLeaveDays: number
    totalOvertimeHours: number
    lateCount: number
  }
  salaryAdjustments: {
    leaveDeduction: number
    overtimePayment: number
    lateDeduction: number
  }
}

export function calculatePayrollWithAttendance(employeeData: any, month: string, year: number): EnhancedPayrollItem {
  // Get attendance data for the employee for the specified month
  const attendanceRecords = getAttendanceRecords({
    employeeId: employeeData.id,
    dateFrom: `${year}-${String(getMonthNumber(month)).padStart(2, "0")}-01`,
    dateTo: `${year}-${String(getMonthNumber(month)).padStart(2, "0")}-31`,
  })

  // Calculate attendance metrics
  const totalWorkingDays = getWorkingDaysInMonth(month, year)
  const actualPresentDays = attendanceRecords.filter((r) => r.status === "present" || r.status === "late").length
  const totalLeaveDays = attendanceRecords.filter((r) => r.status === "absent" || r.status === "on-leave").length
  const totalOvertimeHours = attendanceRecords.reduce((sum, r) => sum + (r.overtimeHours || 0), 0)
  const lateCount = attendanceRecords.filter((r) => r.status === "late").length

  // Calculate base payroll
  const basePayroll = calculatePayroll(employeeData)

  // Calculate salary adjustments based on attendance
  const dailySalary = basePayroll.basicSalary / totalWorkingDays
  const leaveDeduction = totalLeaveDays * dailySalary
  const overtimeRate = basePayroll.basicSalary / totalWorkingDays / 8 // Per hour rate
  const overtimePayment = totalOvertimeHours * overtimeRate * 1.5 // 1.5x for overtime
  const lateDeduction = lateCount * 100 // ₹100 per late arrival

  // Apply adjustments
  const adjustedGrossSalary = basePayroll.grossSalary - leaveDeduction + overtimePayment - lateDeduction
  const adjustedNetSalary = adjustedGrossSalary - basePayroll.totalDeductions

  const enhancedPayroll: EnhancedPayrollItem = {
    ...basePayroll,
    id: `enhanced-${employeeData.id}-${month}-${year}`,
    grossSalary: Math.round(adjustedGrossSalary),
    netSalary: Math.round(adjustedNetSalary),
    workingDays: totalWorkingDays,
    presentDays: actualPresentDays,
    leaveDays: totalLeaveDays,
    overtimeHours: totalOvertimeHours,
    overtimeAmount: Math.round(overtimePayment),
    payrollMonth: month,
    payrollYear: year,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    attendanceData: {
      totalWorkingDays,
      actualPresentDays,
      totalLeaveDays,
      totalOvertimeHours,
      lateCount,
    },
    salaryAdjustments: {
      leaveDeduction: Math.round(leaveDeduction),
      overtimePayment: Math.round(overtimePayment),
      lateDeduction: Math.round(lateDeduction),
    },
  }

  return enhancedPayroll
}

export function bulkCalculatePayroll(employees: any[], month: string, year: number): EnhancedPayrollItem[] {
  return employees.map((employee) => calculatePayrollWithAttendance(employee, month, year))
}

export function generatePayrollReport(payrollItems: EnhancedPayrollItem[]) {
  const totalEmployees = payrollItems.length
  const totalGrossSalary = payrollItems.reduce((sum, item) => sum + item.grossSalary, 0)
  const totalDeductions = payrollItems.reduce((sum, item) => sum + item.totalDeductions, 0)
  const totalNetSalary = payrollItems.reduce((sum, item) => sum + item.netSalary, 0)
  const totalOvertimePayment = payrollItems.reduce((sum, item) => sum + item.salaryAdjustments.overtimePayment, 0)
  const totalLeaveDeductions = payrollItems.reduce((sum, item) => sum + item.salaryAdjustments.leaveDeduction, 0)

  return {
    summary: {
      totalEmployees,
      totalGrossSalary,
      totalDeductions,
      totalNetSalary,
      totalOvertimePayment,
      totalLeaveDeductions,
    },
    departmentWise: getDepartmentWiseBreakdown(payrollItems),
    attendanceImpact: getAttendanceImpactAnalysis(payrollItems),
  }
}

function getDepartmentWiseBreakdown(payrollItems: EnhancedPayrollItem[]) {
  const departments = [...new Set(payrollItems.map((item) => item.department))]

  return departments.map((dept) => {
    const deptItems = payrollItems.filter((item) => item.department === dept)
    return {
      department: dept,
      employeeCount: deptItems.length,
      totalGrossSalary: deptItems.reduce((sum, item) => sum + item.grossSalary, 0),
      totalNetSalary: deptItems.reduce((sum, item) => sum + item.netSalary, 0),
      averageAttendance: deptItems.reduce((sum, item) => sum + item.presentDays, 0) / deptItems.length,
    }
  })
}

function getAttendanceImpactAnalysis(payrollItems: EnhancedPayrollItem[]) {
  const totalLeaveDeductions = payrollItems.reduce((sum, item) => sum + item.salaryAdjustments.leaveDeduction, 0)
  const totalOvertimePayments = payrollItems.reduce((sum, item) => sum + item.salaryAdjustments.overtimePayment, 0)
  const totalLateDeductions = payrollItems.reduce((sum, item) => sum + item.salaryAdjustments.lateDeduction, 0)

  const employeesWithLeaves = payrollItems.filter((item) => item.leaveDays > 0).length
  const employeesWithOvertime = payrollItems.filter((item) => item.overtimeHours > 0).length
  const employeesWithLateArrivals = payrollItems.filter((item) => item.attendanceData.lateCount > 0).length

  return {
    totalLeaveDeductions,
    totalOvertimePayments,
    totalLateDeductions,
    netAttendanceImpact: totalOvertimePayments - totalLeaveDeductions - totalLateDeductions,
    employeesWithLeaves,
    employeesWithOvertime,
    employeesWithLateArrivals,
  }
}

function getMonthNumber(monthName: string): number {
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ]
  return months.indexOf(monthName) + 1
}

function getWorkingDaysInMonth(month: string, year: number): number {
  const monthNumber = getMonthNumber(month)
  const daysInMonth = new Date(year, monthNumber, 0).getDate()
  let workingDays = 0

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, monthNumber - 1, day)
    const dayOfWeek = date.getDay()
    // Exclude Sundays (0) - adjust based on your company's working days
    if (dayOfWeek !== 0) {
      workingDays++
    }
  }

  return workingDays
}

export function validatePayrollData(payrollItem: EnhancedPayrollItem): { isValid: boolean; errors: string[] } {
  const errors: string[] = []

  if (payrollItem.basicSalary <= 0) {
    errors.push("Basic salary must be greater than 0")
  }

  if (payrollItem.presentDays > payrollItem.workingDays) {
    errors.push("Present days cannot exceed working days")
  }

  if (payrollItem.grossSalary < payrollItem.basicSalary) {
    errors.push("Gross salary cannot be less than basic salary")
  }

  if (payrollItem.netSalary <= 0) {
    errors.push("Net salary must be positive after deductions")
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}
