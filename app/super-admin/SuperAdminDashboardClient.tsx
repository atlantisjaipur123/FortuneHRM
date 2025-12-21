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
import { useCompany } from "@/app/context/company-context"   

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
  const { setCompany } = useCompany()
  const [isCompanyDropdownOpen, setIsCompanyDropdownOpen] = useState(false)

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
      // Prepare company data for API
      const companyData: any = {
        code: formData.get("code") as string,
        name: formData.get("name") as string || formData.get("code") as string || `Company ${companies.length + 1}`,
        pan: formData.get("pan") as string || "",
        tan: formData.get("tan") as string || "",
        gstin: formData.get("gstin") as string || undefined,
        serviceName: formData.get("serviceName") as string || undefined,
        startDate: formData.get("startDate") as string || undefined,
        endDate: formData.get("endDate") as string || undefined,
        flat: formData.get("flat") as string || "",
        road: formData.get("road") as string || undefined,
        city: formData.get("city") as string || "",
        pin: formData.get("pin") as string || "",
        state: formData.get("state") as string || undefined,
        stdCode: formData.get("stdCode") as string || undefined,
        phone: formData.get("phone") as string || undefined,
        email: formData.get("email") as string || undefined,
        dateOfStartingBusiness: formData.get("dateOfStartingBusiness") as string || undefined,
        typeOfCompany: formData.get("typeOfCompany") as string || undefined,
        nature: formData.get("natureOfCompany") as string || undefined,
        natureOfCompany: formData.get("natureOfCompany") as string || undefined,
        pfRegionalOffice: formData.get("pfRegionalOffice") as string || undefined,
        pensionCoverageDate: formData.get("pensionCoverageDate") as string || undefined,
        esiLocalOffice: formData.get("esiLocalOffice") as string || undefined,
        ptoCircleNo: formData.get("ptoCircleNo") as string || undefined,
        website: formData.get("website") as string || undefined,
        defaultAttendance: formData.get("defaultAttendance") as string || undefined,
        companyVisibility: formData.get("companyVisibility") as string || undefined,
        cin: formData.get("cin") as string || undefined,
        deductorType: formData.get("deductorType") as string || undefined,
        paoCode: formData.get("paoCode") as string || undefined,
        ministryName: formData.get("ministryName") as string || undefined,
        ministryIfOthers: formData.get("ministryIfOthers") as string || undefined,
        tdsCircle: formData.get("tdsCircle") as string || undefined,
        ain: formData.get("ain") as string || undefined,
        ddoCode: formData.get("ddoCode") as string || undefined,
        ddoRegNo: formData.get("ddoRegNo") as string || undefined,
        tanRegNo: formData.get("tanRegNo") as string || undefined,
        lwfRegNo: formData.get("lwfRegNo") as string || undefined,
        branchDivision: formData.get("branchDivision") as string || undefined,
        status: formData.get("status") as string || "active",
        // Authorized Person fields
        apName: formData.get("apName") as string || undefined,
        apDob: formData.get("apDob") as string || undefined,
        apSex: formData.get("apSex") as string || undefined,
        apPremise: formData.get("apPremise") as string || undefined,
        apArea: formData.get("apArea") as string || undefined,
        apPin: formData.get("apPin") as string || undefined,
        apState: formData.get("apState") as string || undefined,
        apStdCode: formData.get("apStdCode") as string || formData.get("apStd") as string || undefined,
        apStd: formData.get("apStdCode") as string || formData.get("apStd") as string || undefined,
        apPhone: formData.get("apPhone") as string || undefined,
        apDesignation: formData.get("apDesignation") as string || undefined,
        apFatherName: formData.get("apFatherName") as string || undefined,
        apFlat: formData.get("apFlat") as string || undefined,
        apRoad: formData.get("apRoad") as string || undefined,
        apCity: formData.get("apCity") as string || undefined,
        apEmail: formData.get("apEmail") as string || undefined,
        apPan: formData.get("apPan") as string || undefined,
      }

      // Remove undefined values
      Object.keys(companyData).forEach(key => {
        if (companyData[key] === undefined || companyData[key] === "") {
          delete companyData[key]
        }
      })

      // Call API to create company
      const response = await fetch("/api/super-admin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(companyData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to create company")
      }

      // Add the new company to the list
      if (data.success && data.company) {
        setCompanies([...companies, data.company as CompanyExtended])
        setIsCreateOpen(false)
        
        // Refresh the page to update stats
        router.refresh()
        
        toast({
          title: "Company Created Successfully",
          description: `Company "${data.company.name}" has been added to the system.`,
          duration: 5000,
        })
      }
    } catch (error: any) {
      console.error("Create company error:", error)
      const errorMessage = error.message || "Failed to create company"
      setError(errorMessage)
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
        duration: 5000,
      })
    }
  }

  // Update Company
  const updateCompany = async (formData: FormData) => {
    if (!selectedCompany) {
      setError("No company selected")
      return
    }

    setError(null)
    try {
      // Prepare update data for API
      const updateData: any = {
        id: selectedCompany.id,
        name: formData.get("nameAdd") as string || selectedCompany.name,
        code: formData.get("code") as string || selectedCompany.code,
        pan: formData.get("pan") as string || (selectedCompany as any).pan || "",
        tan: formData.get("tan") as string || (selectedCompany as any).tan || "",
        gstin: formData.get("gstin") as string || (selectedCompany as any).gstin || undefined,
        serviceName: formData.get("serviceName") as string || selectedCompany.serviceName || undefined,
        startDate: formData.get("startDate") as string || selectedCompany.startDate || undefined,
        endDate: formData.get("endDate") as string || selectedCompany.endDate || undefined,
        flat: formData.get("flat") as string || selectedCompany.flat || "",
        road: formData.get("road") as string || selectedCompany.road || undefined,
        city: formData.get("city") as string || selectedCompany.city || "",
        pin: formData.get("pin") as string || selectedCompany.pin || "",
        state: formData.get("state") as string || selectedCompany.state || undefined,
        stdCode: formData.get("stdCode") as string || selectedCompany.stdCode || undefined,
        phone: formData.get("phone") as string || selectedCompany.phone || undefined,
        email: formData.get("email") as string || selectedCompany.email || undefined,
        dateOfStartingBusiness: formData.get("dateOfStartingBusiness") as string || selectedCompany.dateOfStartingBusiness || undefined,
        typeOfCompany: formData.get("typeOfCompany") as string || selectedCompany.typeOfCompany || undefined,
        nature: formData.get("natureOfBusiness") as string || (selectedCompany as any).nature || undefined,
        natureOfCompany: formData.get("natureOfBusiness") as string || (selectedCompany as any).nature || undefined,
        pfRegionalOffice: formData.get("pfRegionalOffice") as string || selectedCompany.pfRegionalOffice || undefined,
        pensionCoverageDate: formData.get("pensionCoverageDate") as string || selectedCompany.pensionCoverageDate || undefined,
        esiLocalOffice: formData.get("esiLocalOffice") as string || selectedCompany.esiLocalOffice || undefined,
        ptoCircleNo: formData.get("ptoCircleNo") as string || selectedCompany.ptoCircleNo || undefined,
        website: formData.get("website") as string || selectedCompany.website || undefined,
        defaultAttendance: formData.get("defaultAttendance") as string || selectedCompany.defaultAttendance || undefined,
        companyVisibility: formData.get("companyVisibility") as string || selectedCompany.companyVisibility || undefined,
        status: formData.get("status") as string || selectedCompany.status,
        cin: formData.get("cin") as string || selectedCompany.cin || undefined,
        deductorType: formData.get("deductorType") as string || selectedCompany.deductorType || undefined,
        paoCode: formData.get("paoCode") as string || selectedCompany.paoCode || undefined,
        ministryName: formData.get("ministryName") as string || selectedCompany.ministryName || undefined,
        ministryIfOthers: formData.get("ministryIfOthers") as string || selectedCompany.ministryIfOthers || undefined,
        tdsCircle: formData.get("tdsCircle") as string || selectedCompany.tdsCircle || undefined,
        ain: formData.get("ain") as string || selectedCompany.ain || undefined,
        ddoCode: formData.get("ddoCode") as string || selectedCompany.ddoCode || undefined,
        ddoRegNo: formData.get("ddoRegNo") as string || selectedCompany.ddoRegNo || undefined,
        tanRegNo: formData.get("tanRegNo") as string || selectedCompany.tanRegNo || undefined,
        lwfRegNo: formData.get("lwfRegNo") as string || selectedCompany.lwfRegNo || undefined,
        branchDivision: formData.get("branchDivision") as string || selectedCompany.branchDivision || undefined,
        // Authorized Person fields
        apName: formData.get("apName") as string || formData.get("authorisedPersonName") as string || selectedCompany.apName || undefined,
        apDob: formData.get("apDob") as string || selectedCompany.apDob || undefined,
        apSex: formData.get("apSex") as string || selectedCompany.apSex || undefined,
        apPremise: formData.get("apPremise") as string || selectedCompany.apPremise || undefined,
        apArea: formData.get("apArea") as string || selectedCompany.apArea || undefined,
        apPin: formData.get("apPin") as string || selectedCompany.apPin || undefined,
        apState: formData.get("apState") as string || selectedCompany.apState || undefined,
        apStdCode: formData.get("apStdCode") as string || formData.get("apStd") as string || selectedCompany.apStd || undefined,
        apStd: formData.get("apStdCode") as string || formData.get("apStd") as string || selectedCompany.apStd || undefined,
        apPhone: formData.get("apPhone") as string || selectedCompany.apPhone || undefined,
        apDesignation: formData.get("apDesignation") as string || selectedCompany.apDesignation || undefined,
        apFatherName: formData.get("apFatherName") as string || selectedCompany.apFatherName || undefined,
        apFlat: formData.get("apFlat") as string || selectedCompany.apFlat || undefined,
        apRoad: formData.get("apRoad") as string || selectedCompany.apRoad || undefined,
        apCity: formData.get("apCity") as string || selectedCompany.apCity || undefined,
        apEmail: formData.get("apEmail") as string || selectedCompany.apEmail || undefined,
        apPan: formData.get("apPan") as string || (selectedCompany as any).apPan || undefined,
      }

      // Call API to update company
      const response = await fetch("/api/super-admin", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to update company")
      }

      // Update the company in the list
      if (data.success && data.company) {
        setCompanies(companies.map(c => c.id === selectedCompany.id ? data.company as CompanyExtended : c))
        setIsCompanyMasterOpen(false)
        
        // Refresh the page to update stats
        router.refresh()
        
        toast({
          title: "Company Updated Successfully",
          description: `Company "${data.company.name}" has been updated.`,
          duration: 5000,
        })
      }
    } catch (error: any) {
      console.error("Update company error:", error)
      const errorMessage = error.message || "Failed to update company"
      setError(errorMessage)
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
        duration: 5000,
      })
    }
  }

  // Delete Company
  const deleteCompany = async (id: string) => {
    if (!confirm('Are you sure you want to delete this company?')) {
      return
    }

    setError(null)
    try {
      // Call API to delete company
      const response = await fetch(`/api/super-admin?id=${id}`, {
        method: "DELETE",
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete company")
      }

      // Remove company from the list
      if (data.success) {
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
        
        // Refresh the page to update stats
        router.refresh()
        
        toast({
          title: "Company Deleted Successfully",
          description: "The company has been deleted.",
          duration: 5000,
        })
      }
    } catch (error: any) {
      console.error("Delete company error:", error)
      const errorMessage = error.message || "Failed to delete company"
      setError(errorMessage)
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
        duration: 5000,
      })
    }
  }

  // Backup and Restore actions
  const backupCompany = async (id: string) => {
    setError(null)
    try {
      const response = await fetch("/api/super-admin/backup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ companyId: id }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to backup company")
      }

      if (data.success) {
        toast({
          title: "Backup Created Successfully",
          description: `Backup "${data.backup.version}" has been created for the company.`,
          duration: 5000,
        })
      }
    } catch (error: any) {
      console.error("Backup company error:", error)
      const errorMessage = error.message || "Failed to backup company"
      setError(errorMessage)
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
        duration: 5000,
      })
    }
  }

  const restoreCompany = async (id: string) => {
    setError(null)
    try {
      // First, get the latest backup for this company
      const backupResponse = await fetch(`/api/super-admin/backup?companyId=${id}`)
      const backupData = await backupResponse.json()

      if (!backupResponse.ok || !backupData.success || backupData.backups.length === 0) {
        throw new Error("No backup found for this company")
      }

      // Use the latest backup
      const latestBackup = backupData.backups[0]

      const response = await fetch("/api/super-admin/restore", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          backupId: latestBackup.id,
          companyId: id 
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to restore company")
      }

      if (data.success) {
        toast({
          title: "Company Restored Successfully",
          description: `Company has been restored from backup "${latestBackup.version}".`,
          duration: 5000,
        })
      }
    } catch (error: any) {
      console.error("Restore company error:", error)
      const errorMessage = error.message || "Failed to restore company"
      setError(errorMessage)
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
        duration: 5000,
      })
    }
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

 // Handle OK button to confirm ONLY company
const handleConfirm = () => {
  if (!currentCompany) {
    toast({
      title: "No company selected",
      description: "Please select a company before continuing.",
      variant: "destructive",
      duration: 4000,
    })
    return
  }

  // 🔐 Set globally
  setCompany({
    id: currentCompany.id,
    name: currentCompany.name,
  })

  setIsCompanyConfirmed(true)

  toast({
    title: "Company selected",
    description: currentCompany.name,
    duration: 3000,
  })
}


  // Handle Clear button to reset all selections
  const handleClear = () => {
    setCompany(null)
    setCurrentCompany(null)
    setIsCompanyConfirmed(false)
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
                        onFocus={() => setIsCompanyDropdownOpen(true)}
                        className="w-full text-xs sm:text-sm"
                      />

                      {isCompanyDropdownOpen && filteredSearchCompanies.length > 0 && (
                        <div className="absolute z-50 w-full bg-card border rounded-md mt-1 max-h-60 overflow-auto shadow-md">
                          {filteredSearchCompanies.map((company) => (
                            <div
                              key={company.id}
                              className="p-2 text-sm hover:bg-primary/10 cursor-pointer"
                              onClick={() => {
                                setCurrentCompany(company)
                                setIsCompanyConfirmed(false)
                                setCompanySearchTerm("")
                                setIsCompanyDropdownOpen(false) // ✅ CLOSE DROPDOWN
                              }}
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
                      <Button size="sm" onClick={handleConfirm} disabled={!currentCompany || isCompanyConfirmed} className="w-full sm:w-auto text-xs sm:text-sm">OK</Button>
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
              <CardContent className="overflow-visible">
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
                <div className="rounded-md border overflow-x-auto overflow-y-visible">
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
                                  <Button 
                                    variant="ghost" 
                                    className="h-6 w-6 sm:h-8 sm:w-8 p-0" 
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <MoreHorizontal className="h-3 w-3 sm:h-4 sm:w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" sideOffset={5}>
                                  <DropdownMenuItem asChild>
                                    <Link href={`/company/${company.id}`} className="text-xs sm:text-sm">
                                      <Building2 className="mr-1 h-3 w-3 sm:mr-2 sm:h-4 sm:w-4" /> View Details
                                    </Link>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedCompany(company);
                                      setIsCompanyMasterOpen(true);
                                    }} 
                                    className="text-xs sm:text-sm"
                                  >
                                    <Pencil className="mr-1 h-3 w-3 sm:mr-2 sm:h-4 sm:w-4" /> Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      deleteCompany(company.id);
                                    }} 
                                    className="text-xs sm:text-sm"
                                  >
                                    <Trash2 className="mr-1 h-3 w-3 sm:mr-2 sm:h-4 sm:w-4" /> Delete
                                  </DropdownMenuItem>
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