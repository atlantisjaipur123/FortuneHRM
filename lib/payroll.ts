export interface PayrollItem {
  id: string
  employeeId: string
  employeeName: string
  employeeCode: string
  designation: string
  department: string
  // Salary Components
  basicSalary: number
  hra: number
  conveyanceAllowance: number
  medicalAllowance: number
  specialAllowance: number
  // Deductions
  providentFund: number
  esi: number
  professionalTax: number
  incomeTax: number
  otherDeductions: number
  // Calculated Fields
  grossSalary: number
  totalDeductions: number
  netSalary: number
  // Payroll Details
  payrollMonth: string
  payrollYear: number
  workingDays: number
  presentDays: number
  leaveDays: number
  overtimeHours: number
  overtimeAmount: number
  status: "draft" | "processed" | "paid"
  processedAt?: string
  paidAt?: string
  companyId: string
  createdAt: string
  updatedAt: string
}

export interface PayrollSummary {
  id: string
  companyId: string
  month: string
  year: number
  totalEmployees: number
  totalGrossSalary: number
  totalDeductions: number
  totalNetSalary: number
  status: "draft" | "processing" | "completed"
  processedAt?: string
  createdAt: string
  updatedAt: string
}

// Mock payroll data
const payrollItems: PayrollItem[] = [
  {
    id: "1",
    employeeId: "1",
    employeeName: "John Doe",
    employeeCode: "EMP001",
    designation: "Software Engineer",
    department: "Engineering",
    basicSalary: 50000,
    hra: 20000,
    conveyanceAllowance: 2000,
    medicalAllowance: 1500,
    specialAllowance: 5000,
    providentFund: 6000,
    esi: 375,
    professionalTax: 200,
    incomeTax: 8000,
    otherDeductions: 0,
    grossSalary: 78500,
    totalDeductions: 14575,
    netSalary: 63925,
    payrollMonth: "January",
    payrollYear: 2024,
    workingDays: 22,
    presentDays: 22,
    leaveDays: 0,
    overtimeHours: 0,
    overtimeAmount: 0,
    status: "paid",
    processedAt: "2024-01-31T10:00:00Z",
    paidAt: "2024-02-01T14:30:00Z",
    companyId: "1",
    createdAt: "2024-01-31T10:00:00Z",
    updatedAt: "2024-02-01T14:30:00Z",
  },
  {
    id: "2",
    employeeId: "2",
    employeeName: "Jane Smith",
    employeeCode: "EMP002",
    designation: "HR Manager",
    department: "Human Resources",
    basicSalary: 60000,
    hra: 24000,
    conveyanceAllowance: 2000,
    medicalAllowance: 1500,
    specialAllowance: 8000,
    providentFund: 7200,
    esi: 450,
    professionalTax: 200,
    incomeTax: 12000,
    otherDeductions: 0,
    grossSalary: 95500,
    totalDeductions: 19850,
    netSalary: 75650,
    payrollMonth: "January",
    payrollYear: 2024,
    workingDays: 22,
    presentDays: 21,
    leaveDays: 1,
    overtimeHours: 0,
    overtimeAmount: 0,
    status: "paid",
    processedAt: "2024-01-31T10:00:00Z",
    paidAt: "2024-02-01T14:30:00Z",
    companyId: "1",
    createdAt: "2024-01-31T10:00:00Z",
    updatedAt: "2024-02-01T14:30:00Z",
  },
]

const payrollSummaries: PayrollSummary[] = [
  {
    id: "1",
    companyId: "1",
    month: "January",
    year: 2024,
    totalEmployees: 2,
    totalGrossSalary: 174000,
    totalDeductions: 34425,
    totalNetSalary: 139575,
    status: "completed",
    processedAt: "2024-01-31T10:00:00Z",
    createdAt: "2024-01-31T10:00:00Z",
    updatedAt: "2024-02-01T14:30:00Z",
  },
]

export function getPayrollByCompany(companyId: string): PayrollItem[] {
  return payrollItems.filter((item) => item.companyId === companyId)
}

export function getPayrollById(id: string): PayrollItem | undefined {
  return payrollItems.find((item) => item.id === id)
}

export function getPayrollSummariesByCompany(companyId: string): PayrollSummary[] {
  return payrollSummaries.filter((summary) => summary.companyId === companyId)
}

export function getPayrollSummaryById(id: string): PayrollSummary | undefined {
  return payrollSummaries.find((summary) => summary.id === id)
}

export function calculatePayroll(employeeData: any): Omit<PayrollItem, "id" | "createdAt" | "updatedAt"> {
  const basicSalary = employeeData.basicSalary
  const hra = Math.round(basicSalary * 0.4) // 40% of basic
  const conveyanceAllowance = 2000
  const medicalAllowance = 1500
  const specialAllowance = Math.round(basicSalary * 0.1) // 10% of basic

  const grossSalary = basicSalary + hra + conveyanceAllowance + medicalAllowance + specialAllowance

  // Deductions
  const providentFund = Math.round(basicSalary * 0.12) // 12% of basic
  const esi = grossSalary <= 21000 ? Math.round(grossSalary * 0.0075) : 0 // 0.75% if gross <= 21k
  const professionalTax = 200
  const incomeTax = calculateIncomeTax(grossSalary * 12) / 12 // Annual to monthly

  const totalDeductions = providentFund + esi + professionalTax + incomeTax
  const netSalary = grossSalary - totalDeductions

  return {
    employeeId: employeeData.id,
    employeeName: `${employeeData.firstName} ${employeeData.lastName}`,
    employeeCode: employeeData.employeeCode,
    designation: employeeData.designation,
    department: employeeData.department,
    basicSalary,
    hra,
    conveyanceAllowance,
    medicalAllowance,
    specialAllowance,
    providentFund,
    esi,
    professionalTax,
    incomeTax: Math.round(incomeTax),
    otherDeductions: 0,
    grossSalary,
    totalDeductions,
    netSalary,
    payrollMonth: new Date().toLocaleString("default", { month: "long" }),
    payrollYear: new Date().getFullYear(),
    workingDays: 22,
    presentDays: 22, // This would come from attendance data
    leaveDays: 0,
    overtimeHours: 0,
    overtimeAmount: 0,
    status: "draft" as const,
    companyId: employeeData.companyId,
  }
}

function calculateIncomeTax(annualSalary: number): number {
  // Simplified Indian income tax calculation for demo
  if (annualSalary <= 250000) return 0
  if (annualSalary <= 500000) return (annualSalary - 250000) * 0.05
  if (annualSalary <= 1000000) return 12500 + (annualSalary - 500000) * 0.2
  return 112500 + (annualSalary - 1000000) * 0.3
}

export function processPayroll(companyId: string, month: string, year: number): PayrollSummary {
  // This would typically fetch employee data and calculate payroll
  const newSummary: PayrollSummary = {
    id: Date.now().toString(),
    companyId,
    month,
    year,
    totalEmployees: 0,
    totalGrossSalary: 0,
    totalDeductions: 0,
    totalNetSalary: 0,
    status: "processing",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  payrollSummaries.push(newSummary)
  return newSummary
}

export function updatePayrollStatus(id: string, status: PayrollItem["status"]): boolean {
  const index = payrollItems.findIndex((item) => item.id === id)
  if (index === -1) return false

  payrollItems[index].status = status
  payrollItems[index].updatedAt = new Date().toISOString()

  if (status === "processed") {
    payrollItems[index].processedAt = new Date().toISOString()
  } else if (status === "paid") {
    payrollItems[index].paidAt = new Date().toISOString()
  }

  return true
}

export const months = [
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
