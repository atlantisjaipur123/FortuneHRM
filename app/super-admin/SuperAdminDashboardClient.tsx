"use client"
import React, { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Building2, AlertCircle, MoreHorizontal, ArrowUpDown, Pencil, Trash2, Users, DollarSign, Calculator, Calendar, CreditCard, Banknote, CalendarDays, CreditCardIcon, TrendingUp, Clock, UserCheck, Clock3, FileText, Briefcase, Scale, Projector, Receipt } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Link from "next/link"
import { useRouter } from "next/navigation"
import type { Company } from "@/app/lib/auth"
import { CreateCompanyDialog } from "../../components/dialogs/CreateCompanyDialog"
import { CompanyMasterDialog } from "../../components/dialogs/CompanyMasterDialog"
import { toast } from "@/components/ui/use-toast"

// Extend base Company with optional fields
type CompanyExtended = Company & {
  adminName?: string
  serviceName?: string
  startDate?: string | Date
  endDate?: string | Date
  code?: string
  flat?: string
  road?: string
  city?: string
  pin?: string
  state?: string
  stdCode?: string
  phone?: string
  email?: string
  dateOfStartingBusiness?: string
  typeOfCompany?: string
  pfRegionalOffice?: string
  pensionCoverageDate?: string
  esiLocalOffice?: string
  ptoCircleNo?: string
  website?: string
  defaultAttendance?: string
  companyVisibility?: string
  apName?: string
  apDob?: string
  apSex?: string
  apPremise?: string
  apArea?: string
  apPin?: string
  apState?: string
  apStd?: string
  apPhone?: string
  apDesignation?: string
  apFatherName?: string
  apFlat?: string
  apRoad?: string
  apCity?: string
  apEmail?: string
  cin?: string
  deductorType?: string
  paoCode?: string
  ministryName?: string
  ministryIfOthers?: string
  tdsCircle?: string
  ain?: string
  ddoCode?: string
  ddoRegNo?: string
  tanRegNo?: string
  lwfRegNo?: string
  branchDivision?: string
}

interface SuperAdminDashboardClientProps {
  companies: Company[]
  stats: {
    totalCompanies: number
    activeCompanies: number
    totalEmployees: number
  }
}


export function SuperAdminDashboardClient({ companies: initialCompanies, stats }: SuperAdminDashboardClientProps) {
  const [companies, setCompanies] = useState<CompanyExtended[]>(initialCompanies as CompanyExtended[])
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isCompanyMasterOpen, setIsCompanyMasterOpen] = useState(false)
  const [selectedCompany, setSelectedCompany] = useState<CompanyExtended | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [sortConfig, setSortConfig] = useState<{ key: keyof CompanyExtended; direction: 'asc' | 'desc' } | null>(null)
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set())
  const [currentCompany, setCurrentCompany] = useState<CompanyExtended | null>(null)
  const [isCompanyConfirmed, setIsCompanyConfirmed] = useState(false)
  const [companySearchTerm, setCompanySearchTerm] = useState("")
  const [selectedMonth, setSelectedMonth] = useState<string>("")
  const [selectedYear, setSelectedYear] = useState<string>("")
  const router = useRouter()

  // Search filtering for Current Company card
  const filteredSearchCompanies = useMemo(() => {
    if (!Array.isArray(companies)) return [];
    return companies.filter(
      (company) =>
        company.name.toLowerCase().includes(companySearchTerm.toLowerCase()) ||
        (company.serviceName || "").toLowerCase().includes(companySearchTerm.toLowerCase()) ||
        (company.adminName || "").toLowerCase().includes(companySearchTerm.toLowerCase())
    );
  }, [companies, companySearchTerm]);

  // Generate years for dropdown (current year and past 5 years)
  const years = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 6 }, (_, i) => (currentYear - i).toString());
  }, []);

  // Create Company
  const createCompany = async (formData: FormData) => {
    setError(null)
    try {
      const companyData = {
        name: formData.get("code") as string || `Company ${companies.length + 1}`,
        adminName: formData.get("apName") as string || "New Admin",
        nature: formData.get("natureOfCompany") as string || "",
        address: `${formData.get("flat") || ""} ${formData.get("road") || ""} ${formData.get("city") || ""}`.trim(),
        pan: formData.get("pan") as string || "",
        gstin: formData.get("gstin") as string || "",
        tan: formData.get("tan") as string || "",
        serviceName: (formData.get("serviceName") as string) || undefined,
        startDate: (formData.get("startDate") as string) || undefined,
        endDate: (formData.get("endDate") as string) || undefined,
        code: formData.get("code") as string || "",
        flat: formData.get("flat") as string || "",
        road: formData.get("road") as string || "",
        city: formData.get("city") as string || "",
        pin: formData.get("pin") as string || "",
        state: formData.get("state") as string || "",
        stdCode: formData.get("stdCode") as string || "",
        phone: formData.get("phone") as string || "",
        email: formData.get("email") as string || "",
        dateOfStartingBusiness: formData.get("dateOfStartingBusiness") as string || "",
        typeOfCompany: formData.get("typeOfCompany") as string || "",
        pfRegionalOffice: formData.get("pfRegionalOffice") as string || "",
        pensionCoverageDate: formData.get("pensionCoverageDate") as string || "",
        esiLocalOffice: formData.get("esiLocalOffice") as string || "",
        ptoCircleNo: formData.get("ptoCircleNo") as string || "",
        website: formData.get("website") as string || "",
        defaultAttendance: formData.get("defaultAttendance") as string || "",
        companyVisibility: formData.get("companyVisibility") as string || "",
        apName: formData.get("apName") as string || "",
        apDob: formData.get("apDob") as string || "",
        apSex: formData.get("apSex") as string || "",
        apPremise: formData.get("apPremise") as string || "",
        apArea: formData.get("apArea") as string || "",
        apPin: formData.get("apPin") as string || "",
        apState: formData.get("apState") as string || "",
        apStd: formData.get("apStdCode") as string || "",
        apPhone: formData.get("apPhone") as string || "",
        apDesignation: formData.get("apDesignation") as string || "",
        apFatherName: formData.get("apFatherName") as string || "",
        apFlat: formData.get("apFlat") as string || "",
        apRoad: formData.get("apRoad") as string || "",
        apCity: formData.get("apCity") as string || "",
        apEmail: formData.get("apEmail") as string || "",
        apPan: formData.get("apPan") as string || "",
        cin: formData.get("cin") as string || "",
        deductorType: formData.get("deductorType") as string || "",
        paoCode: formData.get("paoCode") as string || "",
        ministryName: formData.get("ministryName") as string || "",
        ministryIfOthers: formData.get("ministryIfOthers") as string || "",
        tdsCircle: formData.get("tdsCircle") as string || "",
        ain: formData.get("ain") as string || "",
        ddoCode: formData.get("ddoCode") as string || "",
        ddoRegNo: formData.get("ddoRegNo") as string || "",
        tanRegNo: formData.get("tanRegNo") as string || "",
        lwfRegNo: formData.get("lwfRegNo") as string || "",
        branchDivision: formData.get("branchDivision") as string || "",
        status: "active",
        createdAt: new Date().toISOString(),
        id: `company_${Date.now()}`,
        adminId: `admin_${Date.now()}`
      }
      
      // Store in localStorage for immediate display
      localStorage.setItem("companyData", JSON.stringify(companyData))
      
      // Add to companies list
      setCompanies([...companies, companyData as unknown as CompanyExtended])
      setIsCreateOpen(false)
      
      // Show success message
      toast({
        title: "Company Created Successfully",
        description: `Company "${companyData.name}" has been added to the system.`,
        duration: 5000,
      })
    } catch (error) {
      setError('Failed to create company')
    }
  }

  // Update Company
  const updateCompany = (formData: FormData) => {
    if (selectedCompany) {
      const updatedCompany: CompanyExtended = {
        ...selectedCompany,
        name: formData.get("nameAdd") as string || selectedCompany.name,
        adminName: formData.get("authorisedPersonName") as string || selectedCompany.adminName,
        createdAt: formData.get("dateOfStartingBusiness") as string || selectedCompany.createdAt,
        status: (formData.get("status") as "active" | "inactive") || selectedCompany.status,
        nature: formData.get("natureOfBusiness") as string || selectedCompany.nature,
        address: formData.get("address") as string || selectedCompany.address,
        pan: formData.get("pan") as string || selectedCompany.pan,
        gstin: formData.get("gstin") as string || selectedCompany.gstin || "",
        tan: formData.get("tan") as string || selectedCompany.tan || "",
        serviceName: (formData.get("serviceName") as string) || selectedCompany.serviceName,
        startDate: (formData.get("startDate") as string) || selectedCompany.startDate,
        endDate: (formData.get("endDate") as string) || selectedCompany.endDate,
        code: formData.get("code") as string || selectedCompany.code || "",
        flat: formData.get("flat") as string || selectedCompany.flat || "",
        road: formData.get("road") as string || selectedCompany.road || "",
        city: formData.get("city") as string || selectedCompany.city || "",
        pin: formData.get("pin") as string || selectedCompany.pin || "",
        state: formData.get("state") as string || selectedCompany.state || "",
        stdCode: formData.get("stdCode") as string || selectedCompany.stdCode || "",
        phone: formData.get("phone") as string || selectedCompany.phone || "",
        email: formData.get("email") as string || selectedCompany.email || "",
        dateOfStartingBusiness: formData.get("dateOfStartingBusiness") as string || selectedCompany.createdAt || "",
        typeOfCompany: formData.get("typeOfCompany") as string || selectedCompany.typeOfCompany || "",
        pfRegionalOffice: formData.get("pfRegionalOffice") as string || selectedCompany.pfRegionalOffice || "",
        pensionCoverageDate: formData.get("pensionCoverageDate") as string || selectedCompany.pensionCoverageDate || "",
        esiLocalOffice: formData.get("esiLocalOffice") as string || selectedCompany.esiLocalOffice || "",
        ptoCircleNo: formData.get("ptoCircleNo") as string || selectedCompany.ptoCircleNo || "",
        website: formData.get("website") as string || selectedCompany.website || "",
        defaultAttendance: formData.get("defaultAttendance") as string || selectedCompany.defaultAttendance || "",
        companyVisibility: formData.get("companyVisibility") as string || selectedCompany.companyVisibility || "",
        apName: formData.get("apName") as string || selectedCompany.apName || "",
        apDob: formData.get("apDob") as string || selectedCompany.apDob || "",
        apSex: formData.get("apSex") as string || selectedCompany.apSex || "",
        apPremise: formData.get("apPremise") as string || selectedCompany.apPremise || "",
        apArea: formData.get("apArea") as string || selectedCompany.apArea || "",
        apPin: formData.get("apPin") as string || selectedCompany.apPin || "",
        apState: formData.get("apState") as string || selectedCompany.apState || "",
        apStd: formData.get("apStd") as string || selectedCompany.apStd || "",
        apPhone: formData.get("apPhone") as string || selectedCompany.apPhone || "",
        apDesignation: formData.get("apDesignation") as string || selectedCompany.apDesignation || "",
        apFatherName: formData.get("apFatherName") as string || selectedCompany.apFatherName || "",
        apFlat: formData.get("apFlat") as string || selectedCompany.apFlat || "",
        apRoad: formData.get("apRoad") as string || selectedCompany.apRoad || "",
        apCity: formData.get("apCity") as string || selectedCompany.apCity || "",
        apEmail: formData.get("apEmail") as string || selectedCompany.apEmail || "",
        cin: formData.get("cin") as string || selectedCompany.cin || "",
        deductorType: formData.get("deductorType") as string || selectedCompany.deductorType || "",
        paoCode: formData.get("paoCode") as string || selectedCompany.paoCode || "",
        ministryName: formData.get("ministryName") as string || selectedCompany.ministryName || "",
        ministryIfOthers: formData.get("ministryIfOthers") as string || selectedCompany.ministryIfOthers || "",
        tdsCircle: formData.get("tdsCircle") as string || selectedCompany.tdsCircle || "",
        ain: formData.get("ain") as string || selectedCompany.ain || "",
        ddoCode: formData.get("ddoCode") as string || selectedCompany.ddoCode || "",
        ddoRegNo: formData.get("ddoRegNo") as string || selectedCompany.ddoRegNo || "",
        tanRegNo: formData.get("tanRegNo") as string || selectedCompany.tanRegNo || "",
        lwfRegNo: formData.get("lwfRegNo") as string || selectedCompany.lwfRegNo || "",
        branchDivision: formData.get("branchDivision") as string || selectedCompany.branchDivision || "",
      }
      setCompanies(companies.map(c => c.id === selectedCompany.id ? updatedCompany : c))
      setIsCompanyMasterOpen(false)
    }
  }

  // Delete Company
  const deleteCompany = (id: string) => {
    if (confirm('Are you sure you want to delete this company?')) {
      setCompanies(companies.filter(c => c.id !== id))
      setSelectedRows(prev => {
        const newSet = new Set(prev)
        newSet.delete(id)
        return newSet
      })
      if (currentCompany?.id === id) {
        setCurrentCompany(null)
        setIsCompanyConfirmed(false)
        setSelectedMonth("")
        setSelectedYear("")
      }
    }
  }

  // Backup and Restore actions
  const backupCompany = (id: string) => {
    console.log('Backup company', id)
  }

  const restoreCompany = (id: string) => {
    console.log('Restore company', id)
  }

  // Sorting logic
  const sortedCompanies = useMemo(() => {
    let sortableCompanies = [...companies]
    if (sortConfig !== null) {
      const { key, direction } = sortConfig
      sortableCompanies.sort((a, b) => {
        const aVal = a[key] as unknown as string | number | Date | undefined
        const bVal = b[key] as unknown as string | number | Date | undefined

        const normalize = (val: typeof aVal) => {
          if (val == null) return ''
          if (key === 'startDate' || key === 'endDate' || key === 'createdAt') {
            return new Date(val as any).getTime()
          }
          return typeof val === 'number' ? val : String(val).toLowerCase()
        }

        const av = normalize(aVal) as any
        const bv = normalize(bVal) as any

        if (av < bv) return direction === 'asc' ? -1 : 1
        if (av > bv) return direction === 'asc' ? 1 : -1
        return 0
      })
    }
    return sortableCompanies
  }, [companies, sortConfig])

  // Filtering logic for table
  const filteredCompanies = sortedCompanies.filter(company =>
    company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (company as CompanyExtended).serviceName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ((company as CompanyExtended).adminName || '').toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Handle row selection
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedRows(new Set(filteredCompanies.map(c => c.id)))
    } else {
      setSelectedRows(new Set())
    }
  }

  const handleSelectRow = (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedRows(prev => {
      const newSet = new Set(prev)
      if (e.target.checked) {
        newSet.add(id)
      } else {
        newSet.delete(id)
      }
      return newSet
    })
  }

  // Handle OK button to confirm company, month, and year
  const handleConfirm = () => {
    if (currentCompany && selectedMonth && selectedYear) {
      setIsCompanyConfirmed(true)
      // Here you can add logic to filter data based on currentCompany.id, selectedMonth, and selectedYear
      console.log(`Confirmed: Company ${currentCompany.name}, Month ${selectedMonth}, Year ${selectedYear}`)
    } else {
      toast({
        title: "Selection Incomplete",
        description: "Please select a company, month, and year before confirming.",
        variant: "destructive",
        duration: 5000,
      })
    }
  }

  // Handle Clear button to reset all selections
  const handleClear = () => {
    setCurrentCompany(null)
    setIsCompanyConfirmed(false)
    setCompanySearchTerm("")
    setSelectedMonth("")
    setSelectedYear("")
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="flex flex-col sm:flex-row">
        <main className="flex-1 p-2 sm:p-4 overflow-auto">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">Companies</h1>
                <p className="text-muted-foreground">Manage all companies registered on the platform</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 sm:gap-4 mb-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm sm:text-base font-medium">Total Companies</CardTitle>
                  <Building2 className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-xl sm:text-2xl font-bold">{stats.totalCompanies}</div>
                  <p className="text-xs sm:text-sm text-muted-foreground">{stats.activeCompanies} active, {stats.totalCompanies - stats.activeCompanies} inactive</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm sm:text-base font-medium">Current Company</CardTitle>
                  <Building2 className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-1 sm:space-x-2">
                      <Building2 className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                      <span className="text-base sm:text-lg font-semibold">{currentCompany ? currentCompany.name : "No company selected"}</span>
                    </div>
                    <div className="relative">
                      <Input
                        placeholder="Search companies..."
                        value={companySearchTerm}
                        onChange={(e) => setCompanySearchTerm(e.target.value)}
                        className="w-full text-xs sm:text-sm"
                      />
                      {companySearchTerm && filteredSearchCompanies.length > 0 && (
                        <div className="absolute z-10 w-full bg-card border rounded-md mt-1 max-h-40 sm:max-h-60 overflow-auto">
                          {filteredSearchCompanies.map((company) => (
                            <div
                              key={company.id}
                              className="p-1 sm:p-2 hover:bg-primary/10 cursor-pointer text-xs sm:text-sm"
                              onClick={() => { setCurrentCompany(company); setIsCompanyConfirmed(false); setCompanySearchTerm(""); }}
                            >
                              {company.name}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col sm:flex-row sm:space-x-2 space-y-2 sm:space-y-0">
                      <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                        <SelectTrigger className="w-full sm:w-[180px] text-xs sm:text-sm">
                          <SelectValue placeholder="Select month" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="01">January</SelectItem>
                          <SelectItem value="02">February</SelectItem>
                          <SelectItem value="03">March</SelectItem>
                          <SelectItem value="04">April</SelectItem>
                          <SelectItem value="05">May</SelectItem>
                          <SelectItem value="06">June</SelectItem>
                          <SelectItem value="07">July</SelectItem>
                          <SelectItem value="08">August</SelectItem>
                          <SelectItem value="09">September</SelectItem>
                          <SelectItem value="10">October</SelectItem>
                          <SelectItem value="11">November</SelectItem>
                          <SelectItem value="12">December</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select value={selectedYear} onValueChange={setSelectedYear}>
                        <SelectTrigger className="w-full sm:w-[120px] text-xs sm:text-sm">
                          <SelectValue placeholder="Select year" />
                        </SelectTrigger>
                        <SelectContent>
                          {years.map((year) => (
                            <SelectItem key={year} value={year}>{year}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex flex-col space-y-2 sm:flex-row sm:space-x-2 sm:space-y-0">
                      <Button size="sm" onClick={handleConfirm} disabled={!currentCompany || !selectedMonth || !selectedYear || isCompanyConfirmed} className="w-full sm:w-auto text-xs sm:text-sm">OK</Button>
                      <Button size="sm" variant="outline" onClick={handleClear} className="w-full sm:w-auto text-xs sm:text-sm">Clear</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm sm:text-base font-medium">Total Employees</CardTitle>
                  <Building2 className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-xl sm:text-2xl font-bold">{stats.totalEmployees}</div>
                  <p className="text-xs sm:text-sm text-muted-foreground">Across all companies</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">Registered Companies</CardTitle>
                <CardDescription className="text-sm sm:text-base">Manage all companies registered on the platform</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row items-center py-1 sm:py-2 gap-2 sm:gap-4">
                  <Input
                    placeholder="Search by name or admin..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="max-w-full sm:max-w-sm text-xs sm:text-sm"
                  />
                  <Button onClick={() => setIsCreateOpen(true)} className="w-full sm:w-auto text-xs sm:text-sm">Add New Company</Button>
                  <Button onClick={() => setIsCompanyMasterOpen(true)} className="w-full sm:w-auto text-xs sm:text-sm">Company Master</Button>
                </div>
                <div className="rounded-md border overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="min-w-[50px] sm:min-w-[80px]"><input type="checkbox" checked={selectedRows.size === filteredCompanies.length} onChange={handleSelectAll} /></TableHead>
                        <TableHead className="min-w-[50px] sm:min-w-[80px]">Sr.No.</TableHead>
                        <TableHead className="min-w-[80px] sm:min-w-[120px]">
                          <Button variant="ghost" onClick={() => setSortConfig({ key: 'id', direction: sortConfig?.key === 'id' && sortConfig.direction === 'asc' ? 'desc' : 'asc' })} className="text-xs sm:text-sm">
                            Company ID <ArrowUpDown className="ml-1 h-3 w-3 sm:h-4 sm:w-4" />
                          </Button>
                        </TableHead>
                        <TableHead className="min-w-[100px] sm:min-w-[150px]">
                          <Button variant="ghost" onClick={() => setSortConfig({ key: 'name', direction: sortConfig?.key === 'name' && sortConfig.direction === 'asc' ? 'desc' : 'asc' })} className="text-xs sm:text-sm">
                            Company Name <ArrowUpDown className="ml-1 h-3 w-3 sm:h-4 sm:w-4" />
                          </Button>
                        </TableHead>
                        <TableHead className="min-w-[100px] sm:min-w-[150px]">
                          <Button variant="ghost" onClick={() => setSortConfig({ key: 'serviceName', direction: sortConfig?.key === 'serviceName' && sortConfig.direction === 'asc' ? 'desc' : 'asc' })} className="text-xs sm:text-sm">
                            Name of Services <ArrowUpDown className="ml-1 h-3 w-3 sm:h-4 sm:w-4" />
                          </Button>
                        </TableHead>
                        <TableHead className="min-w-[80px] sm:min-w-[100px]">Status</TableHead>
                        <TableHead className="min-w-[100px] sm:min-w-[120px]">
                          <Button variant="ghost" onClick={() => setSortConfig({ key: 'startDate', direction: sortConfig?.key === 'startDate' && sortConfig.direction === 'asc' ? 'desc' : 'asc' })} className="text-xs sm:text-sm">
                            Start Date <ArrowUpDown className="ml-1 h-3 w-3 sm:h-4 sm:w-4" />
                          </Button>
                        </TableHead>
                        <TableHead className="min-w-[100px] sm:min-w-[120px]">
                          <Button variant="ghost" onClick={() => setSortConfig({ key: 'endDate', direction: sortConfig?.key === 'endDate' && sortConfig.direction === 'asc' ? 'desc' : 'asc' })} className="text-xs sm:text-sm">
                            End Date <ArrowUpDown className="ml-1 h-3 w-3 sm:h-4 sm:w-4" />
                          </Button>
                        </TableHead>
                        <TableHead colSpan={2} className="text-right min-w-[100px] sm:min-w-[150px]">
                          <Button onClick={() => setIsCreateOpen(true)} className="ml-auto text-xs sm:text-sm">Add New Company</Button>
                        </TableHead>
                        <TableHead className="min-w-[80px] sm:min-w-[100px]">Backup</TableHead>
                        <TableHead className="min-w-[80px] sm:min-w-[100px]">Restore</TableHead>
                        <TableHead className="min-w-[80px] sm:min-w-[100px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredCompanies.length ? (
                        filteredCompanies.map((company, index) => (
                          <TableRow key={company.id}>
                            <TableCell className="min-w-[50px] sm:min-w-[80px]"><input type="checkbox" checked={selectedRows.has(company.id)} onChange={(e) => handleSelectRow(company.id, e)} /></TableCell>
                            <TableCell className="min-w-[50px] sm:min-w-[80px]">{index + 1}</TableCell>
                            <TableCell className="min-w-[80px] sm:min-w-[120px]">{company.id}</TableCell>
                            <TableCell className="min-w-[100px] sm:min-w-[150px]">
                              <button className="text-blue-600 hover:underline font-medium text-xs sm:text-sm" onClick={() => { setCurrentCompany(company); setIsCompanyConfirmed(false); setCompanySearchTerm(""); }}>
                                {company.name}
                              </button>
                            </TableCell>
                            <TableCell className="min-w-[100px] sm:min-w-[150px]">{company.serviceName ?? '—'}</TableCell>
                            <TableCell className="min-w-[80px] sm:min-w-[100px]">
                              <Badge variant={company.status === "active" ? "default" : "secondary"} className="text-xs sm:text-sm">{company.status}</Badge>
                            </TableCell>
                            <TableCell className="min-w-[100px] sm:min-w-[120px]">{company.startDate ? new Date(company.startDate as any).toLocaleDateString() : '—'}</TableCell>
                            <TableCell className="min-w-[100px] sm:min-w-[120px]">{company.endDate ? new Date(company.endDate as any).toLocaleDateString() : '—'}</TableCell>
                            <TableCell className="min-w-[80px] sm:min-w-[100px]">
                              <Button variant="outline" size="sm" onClick={() => backupCompany(company.id)} className="text-xs sm:text-sm">Backup</Button>
                            </TableCell>
                            <TableCell className="min-w-[80px] sm:min-w-[100px]">
                              <Button variant="outline" size="sm" onClick={() => restoreCompany(company.id)} className="text-xs sm:text-sm">Restore</Button>
                            </TableCell>
                            <TableCell className="min-w-[80px] sm:min-w-[100px]">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" className="h-6 w-6 sm:h-8 sm:w-8 p-0"><MoreHorizontal className="h-3 w-3 sm:h-4 sm:w-4" /></Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem asChild><Link href={`/company/${company.id}`} className="text-xs sm:text-sm"><Building2 className="mr-1 h-3 w-3 sm:mr-2 sm:h-4 sm:w-4" /> View Details</Link></DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => { setSelectedCompany(company); setIsCompanyMasterOpen(true); }} className="text-xs sm:text-sm"><Pencil className="mr-1 h-3 w-3 sm:mr-2 sm:h-4 sm:w-4" /> Edit</DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => deleteCompany(company.id)} className="text-xs sm:text-sm"><Trash2 className="mr-1 h-3 w-3 sm:mr-2 sm:h-4 sm:w-4" /> Delete</DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow><TableCell colSpan={13} className="h-16 sm:h-24 text-center text-xs sm:text-sm">No companies registered yet</TableCell></TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
                {selectedRows.size > 0 && <div className="mt-1 sm:mt-2"><Badge className="text-xs sm:text-sm">{selectedRows.size} row(s) selected</Badge></div>}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
      
      {/* Dialogs */}
      <CreateCompanyDialog
        isOpen={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onCreate={createCompany}
        error={error}
      />
      
      <CompanyMasterDialog
        isOpen={isCompanyMasterOpen}
        onOpenChange={setIsCompanyMasterOpen}
        selectedCompany={selectedCompany}
        onUpdate={updateCompany}
        error={error}
      />
    </div>
  )
}