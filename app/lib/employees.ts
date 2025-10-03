export interface Employee {
  id: string
  employeeCode: string
  // Personal Details
  firstName: string
  lastName: string
  fatherName: string
  dateOfBirth: string
  gender: "male" | "female" | "other"
  maritalStatus: "single" | "married" | "divorced" | "widowed"
  permanentAddress: string
  currentAddress: string
  phone: string
  email: string
  emergencyContact: string
  emergencyPhone: string
  // Financial Details
  bankName: string
  accountNumber: string
  ifscCode: string
  pan: string
  uan: string
  esiNumber: string
  // Employment Details
  dateOfJoining: string
  designation: string
  department: string
  probationPeriod: number
  basicSalary: number
  status: "active" | "inactive" | "terminated"
  companyId: string
  createdAt: string
  updatedAt: string
}

// Mock employee data
const employees: Employee[] = [
  {
    id: "1",
    employeeCode: "EMP001",
    firstName: "John",
    lastName: "Doe",
    fatherName: "Robert Doe",
    dateOfBirth: "1990-05-15",
    gender: "male",
    maritalStatus: "married",
    permanentAddress: "123 Main St, City, State 12345",
    currentAddress: "123 Main St, City, State 12345",
    phone: "+91 9876543210",
    email: "john.doe@company.com",
    emergencyContact: "Jane Doe",
    emergencyPhone: "+91 9876543211",
    bankName: "State Bank of India",
    accountNumber: "1234567890",
    ifscCode: "SBIN0001234",
    pan: "ABCDE1234F",
    uan: "123456789012",
    esiNumber: "1234567890",
    dateOfJoining: "2023-01-15",
    designation: "Software Engineer",
    department: "Engineering",
    probationPeriod: 6,
    basicSalary: 50000,
    status: "active",
    companyId: "1",
    createdAt: "2023-01-15T00:00:00Z",
    updatedAt: "2023-01-15T00:00:00Z",
  },
  {
    id: "2",
    employeeCode: "EMP002",
    firstName: "Jane",
    lastName: "Smith",
    fatherName: "Michael Smith",
    dateOfBirth: "1988-08-22",
    gender: "female",
    maritalStatus: "single",
    permanentAddress: "456 Oak Ave, City, State 12345",
    currentAddress: "456 Oak Ave, City, State 12345",
    phone: "+91 9876543212",
    email: "jane.smith@company.com",
    emergencyContact: "Michael Smith",
    emergencyPhone: "+91 9876543213",
    bankName: "HDFC Bank",
    accountNumber: "0987654321",
    ifscCode: "HDFC0001234",
    pan: "FGHIJ5678K",
    uan: "210987654321",
    esiNumber: "0987654321",
    dateOfJoining: "2022-11-01",
    designation: "HR Manager",
    department: "Human Resources",
    probationPeriod: 3,
    basicSalary: 60000,
    status: "active",
    companyId: "1",
    createdAt: "2022-11-01T00:00:00Z",
    updatedAt: "2022-11-01T00:00:00Z",
  },
]

export function getEmployeesByCompany(companyId: string): Employee[] {
  return employees.filter((emp) => emp.companyId === companyId)
}

export function getEmployeeById(id: string): Employee | undefined {
  return employees.find((emp) => emp.id === id)
}

export function createEmployee(employeeData: Omit<Employee, "id" | "createdAt" | "updatedAt">): Employee {
  const newEmployee: Employee = {
    ...employeeData,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  employees.push(newEmployee)
  return newEmployee
}

export function updateEmployee(id: string, employeeData: Partial<Employee>): Employee | null {
  const index = employees.findIndex((emp) => emp.id === id)
  if (index === -1) return null

  employees[index] = {
    ...employees[index],
    ...employeeData,
    updatedAt: new Date().toISOString(),
  }
  return employees[index]
}

export function deleteEmployee(id: string): boolean {
  const index = employees.findIndex((emp) => emp.id === id)
  if (index === -1) return false

  employees.splice(index, 1)
  return true
}

export function generateEmployeeCode(companyId: string): string {
  const companyEmployees = getEmployeesByCompany(companyId)
  const nextNumber = companyEmployees.length + 1
  return `EMP${nextNumber.toString().padStart(3, "0")}`
}

export const departments = [
  "Engineering",
  "Human Resources",
  "Finance",
  "Marketing",
  "Sales",
  "Operations",
  "Customer Support",
  "Legal",
  "Administration",
]

export const designations = [
  "Software Engineer",
  "Senior Software Engineer",
  "Team Lead",
  "Project Manager",
  "HR Manager",
  "HR Executive",
  "Finance Manager",
  "Accountant",
  "Marketing Manager",
  "Sales Executive",
  "Operations Manager",
  "Customer Support Executive",
]
