"use client"
import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertCircle, X } from "lucide-react"

interface CompanyInformationFormProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (formData: FormData) => Promise<void>
  error: string | null
  title?: string
  initialData?: any
  mode?: "view" | "edit" | "create"
}
const FIELD_LIMITS: Record<string, number> = {
  // Company
  name: 100, // 🔒 Mandatory DB field
  code: 50,
  pan: 10,
  tan: 10,
  cin: 21,
  gstin: 15,
  pin: 6,
  email: 255,

  apName: 100,
  apDesignation: 100,
  apPan: 10,
  apPin: 6,
  apEmail: 255,
}



export function CompanyInformationForm({
  isOpen,
  onOpenChange,
  onSubmit,
  error,
  title = "Company Information",
  initialData,
  mode = "create"
}: CompanyInformationFormProps) {
  const isReadOnly = mode === "view";
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [activeTab, setActiveTab] = useState("company-info")

  // Helper function to get value from initialData
  const getValue = (field: string, defaultValue: string = ""): string => {
    if (!initialData) return defaultValue
    const value = initialData[field]
    if (value === null || value === undefined) return defaultValue
    if (value instanceof Date) return value.toISOString().split('T')[0] // Format date for input[type="date"]
    if (typeof value === "string" && value.match(/^\d{4}-\d{2}-\d{2}T/)) return value.split('T')[0] // API returns ISO strings
    return String(value)
  }

  // Helper function to get checkbox value
  const getCheckboxValue = (field: string): boolean => {
    if (!initialData) return false
    return initialData[field] === true || initialData[field] === "true"
  }


  const REQUIRED_FIELDS_BY_TAB: Record<string, string[]> = {
    "company-info": ["name", "code", "pan", "tan"],
    "authorized-person": ["apName", "apDesignation", "apPan"],
  }


  const validateForm = (formData: FormData) => {
    const newErrors: Record<string, string> = {}
    let firstErrorTab: string | null = null

    // 1️⃣ Mandatory check (tab-aware)
    Object.entries(REQUIRED_FIELDS_BY_TAB).forEach(([tab, fields]) => {
      fields.forEach((field) => {
        const value = String(formData.get(field) || "").trim()

        if (!value) {
          newErrors[field] = "This field is required"
          if (!firstErrorTab) firstErrorTab = tab
        }
      })
    })

    // 2️⃣ Pattern and Format Validations on Submit

    // Exact PAN format
    const pan = String(formData.get("pan") || "").trim()
    if (pan && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(pan)) {
      newErrors.pan = "Invalid PAN format (e.g. ABCDE1234F)"
      if (!firstErrorTab) firstErrorTab = "company-info"
    }

    const apPan = String(formData.get("apPan") || "").trim()
    if (apPan && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(apPan)) {
      newErrors.apPan = "Invalid PAN format (e.g. ABCDE1234F)"
      if (!firstErrorTab) firstErrorTab = "authorized-person"
    }

    // Exact Mobile Format
    const apPhone = String(formData.get("apPhone") || "").trim()
    if (apPhone && apPhone.length !== 10) {
      newErrors.apPhone = "Mobile number must be exactly 10 digits"
      if (!firstErrorTab) firstErrorTab = "authorized-person"
    }

    // Exact PIN Format
    const apPin = String(formData.get("apPin") || "").trim()
    if (apPin && apPin.length !== 6) {
      newErrors.apPin = "PIN code must be exactly 6 digits"
      if (!firstErrorTab) firstErrorTab = "authorized-person"
    }

    // Future Date Blocks (Dates cannot be in the future, year between 1900 and 2099)
    const validateDate = (field: string, tab: string, label: string) => {
      const val = String(formData.get(field) || "").trim()
      if (val) {
        const dateVal = new Date(val)
        const year = dateVal.getFullYear()
        if (year < 1900 || year > 2099) {
          newErrors[field] = `Year must be between 1900 and 2099`
          if (!firstErrorTab) firstErrorTab = tab
        } else if (dateVal > new Date()) {
          newErrors[field] = `${label} cannot be in the future`
          if (!firstErrorTab) firstErrorTab = tab
        }
      }
    }
    validateDate("pensionCoverageDate", "company-info", "Pension Coverage Date")
    validateDate("pfCoverageDate", "company-info", "PF Coverage Date")
    validateDate("apDob", "authorized-person", "Date of Birth")

    // 3️⃣ Max length check
    Object.entries(FIELD_LIMITS).forEach(([field, max]) => {
      const value = String(formData.get(field) || "").trim()
      // Only check max length if not already errored by pattern
      if (value && value.length > max && !newErrors[field]) {
        newErrors[field] = `Max ${max} characters allowed`
      }
    })

    setErrors(newErrors)

    // 🔥 Switch to tab with first error
    if (firstErrorTab) {
      setActiveTab(firstErrorTab)
    }

    return Object.keys(newErrors).length === 0
  }






  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const formData = new FormData(e.currentTarget)

    if (!validateForm(formData)) {
      return
    }

    setIsSubmitting(true)

    try {
      await onSubmit(formData)
    } catch (err) {
      console.error("Submit failed:", err)
      // ❗ do NOT close dialog
      // ❗ do NOT reset form
    } finally {
      setIsSubmitting(false) // 🔥 THIS IS THE FIX
    }
  }



  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[95vh] overflow-hidden p-0" showCloseButton={false}>
        <DialogHeader className="p-6 pb-4 border-b">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-semibold">{title}</DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        {error && (
          <div className="mx-6 mb-4 flex items-center space-x-2 text-destructive text-sm bg-destructive/10 p-3 rounded-md">
            <AlertCircle className="h-4 w-4" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex-1 overflow-hidden">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="h-full flex flex-col"
          >
            <TabsList className="grid grid-cols-3 mx-6 mb-4 bg-muted/40 p-1 rounded-md">
              <TabsTrigger value="company-info" className="text-sm font-medium">Company Info</TabsTrigger>
              <TabsTrigger value="authorized-person" className="text-sm font-medium">Authorised Person Details</TabsTrigger>
              <TabsTrigger value="additional-details" className="text-sm font-medium">Additional Details</TabsTrigger>
            </TabsList>

            <fieldset disabled={isReadOnly} className="contents">
              <div className="flex-1 overflow-y-auto px-6 pb-6 max-h-[60vh]">
                <TabsContent
                  value="company-info"
                  forceMount
                  className="mt-0 data-[state=inactive]:hidden"
                >

                  <div className="bg-gray-50 rounded-lg p-6 space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                      {/* Left Column */}
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="name" className="text-sm font-medium">
                            Company Name <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="name"
                            name="name"
                            maxLength={100} // 🔒 DB limit
                            defaultValue={getValue("name")}
                            readOnly={isReadOnly}
                            className={`bg-white h-10 ${errors.name ? "border-red-500 focus-visible:ring-red-500" : ""} ${isReadOnly ? "bg-gray-50 cursor-not-allowed" : ""}`}
                            onChange={(e) => {
                              const value = e.target.value
                              if (value.trim() && value.length <= 100) {
                                setErrors((prev) => ({ ...prev, name: "" }))
                              }
                            }}
                            onBlur={(e) => {
                              const value = e.target.value.trim()
                              if (!value) {
                                setErrors((prev) => ({ ...prev, name: "This field is required" }))
                              } else if (value.length > 100) {
                                setErrors((prev) => ({ ...prev, name: "Max 100 characters allowed" }))
                              }
                            }}
                          />
                          {errors.name && (
                            <p className="text-xs text-red-500 mt-1">{errors.name}</p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="code" className="text-sm font-medium">
                            Code <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="code"
                            name="code"
                            maxLength={50} // 🔒 DB limit
                            defaultValue={getValue("code")}
                            readOnly={isReadOnly}
                            className={`bg-white h-10 ${errors.code ? "border-red-500 focus-visible:ring-red-500" : ""
                              } ${isReadOnly ? "bg-gray-50 cursor-not-allowed" : ""}`}
                            onChange={(e) => {
                              const value = e.target.value

                              // Clear error only when value becomes valid
                              if (value.trim() && value.length <= 50) {
                                setErrors((prev) => ({ ...prev, code: "" }))
                              }
                            }}
                            onBlur={(e) => {
                              const value = e.target.value.trim()

                              if (!value) {
                                setErrors((prev) => ({ ...prev, code: "This field is required" }))
                              } else if (value.length > 50) {
                                setErrors((prev) => ({ ...prev, code: "Max 50 characters allowed" }))
                              }
                            }}
                          />

                          {errors.code && (
                            <p className="text-xs text-red-500 mt-1">{errors.code}</p>
                          )}

                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="flat" className="text-sm font-medium">
                            Flat
                          </Label>
                          <Input
                            id="flat"
                            name="flat"
                            defaultValue={getValue("flat")}
                            readOnly={isReadOnly}
                            className={`bg-white h-10 ${isReadOnly ? "bg-gray-50 cursor-not-allowed" : ""}`}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="road" className="text-sm font-medium">Road/ Street/ Lane</Label>
                          <Input
                            id="road"
                            name="road"
                            defaultValue={getValue("road")}
                            readOnly={isReadOnly}
                            className={`bg-white h-10 ${isReadOnly ? "bg-gray-50 cursor-not-allowed" : ""}`}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="city" className="text-sm font-medium">Town/ City/ District</Label>
                          <Input
                            id="city"
                            name="city"
                            defaultValue={getValue("city")}
                            readOnly={isReadOnly}
                            className={`bg-white h-10 ${isReadOnly ? "bg-gray-50 cursor-not-allowed" : ""}`}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="pan" className="text-sm font-medium">
                            PAN <span className="text-red-500">*</span>
                          </Label>
                          <div className="flex gap-2">
                            <Input
                              id="pan"
                              name="pan"
                              maxLength={10} // 🔒 DB + PAN rule
                              defaultValue={getValue("pan")}
                              readOnly={isReadOnly}
                              className={`bg-white h-10 uppercase ${errors.pan ? "border-red-500 focus-visible:ring-red-500" : ""
                                } ${isReadOnly ? "bg-gray-50 cursor-not-allowed" : ""}`}
                              onChange={(e) => {
                                let value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '')
                                if (value.length > 10) value = value.slice(0, 10)
                                e.target.value = value

                                if (/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(value)) {
                                  setErrors((prev) => ({ ...prev, pan: "" }))
                                }
                              }}
                              onBlur={(e) => {
                                const value = e.target.value.trim()

                                if (!value) {
                                  setErrors((prev) => ({ ...prev, pan: "This field is required" }))
                                } else if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(value)) {
                                  setErrors((prev) => ({ ...prev, pan: "Invalid PAN format (e.g. ABCDE1234F)" }))
                                } else {
                                  setErrors((prev) => ({ ...prev, pan: "" }))
                                }
                              }}
                            />

                            {errors.pan && (
                              <p className="text-xs text-red-500 mt-1">{errors.pan}</p>
                            )}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="tan" className="text-sm font-medium">
                            TAN <span className="text-red-500">*</span>
                          </Label>
                          <div className="flex gap-2">
                            <Input
                              id="tan"
                              name="tan"
                              maxLength={10} // 🔒 DB limit
                              defaultValue={getValue("tan")}
                              readOnly={isReadOnly}
                              className={`bg-white h-10 ${errors.tan ? "border-red-500 focus-visible:ring-red-500" : ""
                                } ${isReadOnly ? "bg-gray-50 cursor-not-allowed" : ""}`}
                              onChange={(e) => {
                                const value = e.target.value.toUpperCase()

                                if (value.length === 10) {
                                  setErrors((prev) => ({ ...prev, tan: "" }))
                                }
                              }}
                              onBlur={(e) => {
                                const value = e.target.value.trim()

                                // If empty → no error (optional field)
                                if (!value) {
                                  setErrors((prev) => ({ ...prev, tan: "" }))
                                  return
                                }

                                // If filled → must be exactly 10 chars
                                if (value.length !== 10) {
                                  setErrors((prev) => ({
                                    ...prev,
                                    tan: "TAN must be exactly 10 characters",
                                  }))
                                } else {
                                  setErrors((prev) => ({ ...prev, tan: "" }))
                                }
                              }}

                            />

                            {errors.tan && (
                              <p className="text-xs text-red-500 mt-1">{errors.tan}</p>
                            )}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="serviceName" className="text-sm font-medium">Service Name</Label>
                          <div className="flex gap-2">
                            <Input
                              id="serviceName"
                              name="serviceName"
                              defaultValue={getValue("serviceName")}
                              readOnly={isReadOnly}
                              className={`bg-white h-10 flex-1 ${isReadOnly ? "bg-gray-50 cursor-not-allowed" : ""}`}
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="natureOfCompany" className="text-sm font-medium">Nature of Company</Label>
                          <div className="flex gap-2">
                            <Input
                              id="natureOfCompany"
                              name="natureOfCompany"
                              defaultValue={getValue("natureOfCompany")}
                              readOnly={isReadOnly}
                              className={`bg-white flex-1 ${isReadOnly ? "bg-gray-50 cursor-not-allowed" : ""}`}
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="email" className="text-sm font-medium">E-Mail</Label>
                          <div className="flex gap-2">
                            <Input
                              id="email"
                              name="email"
                              type="email"
                              defaultValue={getValue("email")}
                              readOnly={isReadOnly}
                              className={`bg-white flex-1 ${isReadOnly ? "bg-gray-50 cursor-not-allowed" : ""}`}
                            />

                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="website" className="text-sm font-medium">Website</Label>
                          <Input
                            id="website"
                            name="website"
                            defaultValue={getValue("website")}
                            readOnly={isReadOnly}
                            className={`bg-white h-10 ${isReadOnly ? "bg-gray-50 cursor-not-allowed" : ""}`}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="ptEnrCert" className="text-sm font-medium">PT Enr. Certificate No.</Label>
                          <Input
                            id="ptEnrCert"
                            name="ptEnrCert"
                            defaultValue={getValue("ptEnrCert")}
                            readOnly={isReadOnly}
                            className={`bg-white h-10 ${isReadOnly ? "bg-gray-50 cursor-not-allowed" : ""}`}
                          />
                        </div>
                      </div>

                      {/* Right Column */}
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="pfRegionalOffice" className="text-sm font-medium">PF Regional Office</Label>
                          <Input
                            id="pfRegionalOffice"
                            name="pfRegionalOffice"
                            defaultValue={getValue("pfRegionalOffice")}
                            readOnly={isReadOnly}
                            className={`bg-white h-10 ${isReadOnly ? "bg-gray-50 cursor-not-allowed" : ""}`}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="pensionCoverageDate" className="text-sm font-medium">Pension Coverage Date</Label>
                          <Input
                            id="pensionCoverageDate"
                            name="pensionCoverageDate"
                            type="date"
                            max={new Date().toISOString().split('T')[0]} // 🔒 Block future dates
                            defaultValue={getValue("pensionCoverageDate")}
                            readOnly={isReadOnly}
                            className={`bg-blue-50 h-10 ${errors.pensionCoverageDate ? "border-red-500 focus-visible:ring-red-500" : ""} ${isReadOnly ? "bg-gray-50 cursor-not-allowed" : ""}`}
                            onChange={(e) => {
                              if (e.target.value) setErrors(prev => ({ ...prev, pensionCoverageDate: "" }))
                            }}
                            onBlur={(e) => {
                              const value = e.target.value
                              if (value) {
                                const dateVal = new Date(value)
                                const year = dateVal.getFullYear()
                                if (year < 1900 || year > 2099) {
                                  setErrors((prev) => ({ ...prev, pensionCoverageDate: "Year must be between 1900 and 2099" }))
                                } else if (dateVal > new Date()) {
                                  setErrors((prev) => ({ ...prev, pensionCoverageDate: "Future dates are not allowed" }))
                                }
                              }
                            }}
                          />
                          {errors.pensionCoverageDate && <p className="text-xs text-red-500 mt-1">{errors.pensionCoverageDate}</p>}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="pfCoverageDate" className="text-sm font-medium">PF Coverage Date</Label>
                          <Input
                            id="pfCoverageDate"
                            name="pfCoverageDate"
                            type="date"
                            max={new Date().toISOString().split('T')[0]} // 🔒 Block future dates
                            defaultValue={getValue("pfCoverageDate")}
                            readOnly={isReadOnly}
                            className={`bg-blue-50 h-10 ${errors.pfCoverageDate ? "border-red-500 focus-visible:ring-red-500" : ""} ${isReadOnly ? "bg-gray-50 cursor-not-allowed" : ""}`}
                            onChange={(e) => {
                              if (e.target.value) setErrors(prev => ({ ...prev, pfCoverageDate: "" }))
                            }}
                            onBlur={(e) => {
                              const value = e.target.value
                              if (value) {
                                const dateVal = new Date(value)
                                const year = dateVal.getFullYear()
                                if (year < 1900 || year > 2099) {
                                  setErrors((prev) => ({ ...prev, pfCoverageDate: "Year must be between 1900 and 2099" }))
                                } else if (dateVal > new Date()) {
                                  setErrors((prev) => ({ ...prev, pfCoverageDate: "Future dates are not allowed" }))
                                }
                              }
                            }}
                          />
                          {errors.pfCoverageDate && <p className="text-xs text-red-500 mt-1">{errors.pfCoverageDate}</p>}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="esiLocalOffice" className="text-sm font-medium">ESI Local Office</Label>
                          <Input
                            id="esiLocalOffice"
                            name="esiLocalOffice"
                            defaultValue={getValue("esiLocalOffice")}
                            readOnly={isReadOnly}
                            className={`bg-white h-10 ${isReadOnly ? "bg-gray-50 cursor-not-allowed" : ""}`}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="esiNumber" className="text-sm font-medium">ESI Number</Label>
                          <Input
                            id="esiNumber"
                            name="esiNumber"
                            defaultValue={getValue("esiNumber")}
                            readOnly={isReadOnly}
                            className={`bg-blue-50 h-10 ${isReadOnly ? "bg-gray-50 cursor-not-allowed" : ""}`}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="ptoCircleNo" className="text-sm font-medium">PTO Circle No.</Label>
                          <Input
                            id="ptoCircleNo"
                            name="ptoCircleNo"
                            defaultValue={getValue("ptoCircleNo")}
                            readOnly={isReadOnly}
                            className={`bg-white h-10 ${isReadOnly ? "bg-gray-50 cursor-not-allowed" : ""}`}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="ptRegCert" className="text-sm font-medium">PT Reg. Certificate No.</Label>
                          <Input
                            id="ptRegCert"
                            name="ptRegCert"
                            defaultValue={getValue("ptRegCert")}
                            readOnly={isReadOnly}
                            className={`bg-white h-10 ${isReadOnly ? "bg-gray-50 cursor-not-allowed" : ""}`}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="ptEnrCert" className="text-sm font-medium">PT Enr. Certificate No.</Label>
                          <Input
                            id="ptEnrCert"
                            name="ptEnrCert"
                            defaultValue={getValue("ptEnrCert")}
                            readOnly={isReadOnly}
                            className={`bg-white h-10 ${isReadOnly ? "bg-gray-50 cursor-not-allowed" : ""}`}
                          />
                        </div>



                        <div className="space-y-2">
                          <Label htmlFor="leaveSetupType" className="text-sm font-medium">Leave SetUp Type</Label>
                          <Select
                            name="leaveSetupType"
                            defaultValue={getValue("leaveSetupType", "financial-year")}
                            disabled={isReadOnly}
                          >
                            <SelectTrigger className={`bg-white h-10 ${isReadOnly ? "bg-gray-50 cursor-not-allowed" : ""}`}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="financial-year">FINANCIAL-YEAR WISE</SelectItem>
                              <SelectItem value="calendar-year">CALENDAR-YEAR WISE</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="employeeListOrder" className="text-sm font-medium">Employee List Order</Label>
                          <Select
                            name="employeeListOrder"
                            defaultValue={getValue("employeeListOrder", "name")}
                            disabled={isReadOnly}
                          >
                            <SelectTrigger className={`bg-white h-10 ${isReadOnly ? "bg-gray-50 cursor-not-allowed" : ""}`}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="name">NAME</SelectItem>
                              <SelectItem value="id">ID</SelectItem>
                              <SelectItem value="department">DEPARTMENT</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-3">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="showBranchName"
                              name="showBranchName"
                              defaultChecked={getCheckboxValue("showBranchName")}
                              disabled={isReadOnly}
                            />
                            <Label htmlFor="showBranchName" className="text-sm">Show Branch Name With Branch Code</Label>
                          </div>

                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="dontGeneratePF"
                              name="dontGeneratePF"
                              defaultChecked={getCheckboxValue("dontGeneratePF")}
                              disabled={isReadOnly}
                            />
                            <Label htmlFor="dontGeneratePF" className="text-sm">Do not Generate PF No Automatically</Label>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent
                  value="authorized-person"
                  forceMount
                  className="mt-0 data-[state=inactive]:hidden"
                >

                  <div className="bg-gray-50 rounded-lg p-6 space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                      {/* Left Column */}
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="apName" className="text-sm font-medium">
                            Authorised Person Name <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="apName"
                            name="apName"
                            maxLength={50} // 🔒 DB / FIELD_LIMIT
                            defaultValue={getValue("apName")}
                            readOnly={isReadOnly}
                            className={`bg-white h-10 ${errors.apName ? "border-red-500 focus-visible:ring-red-500" : ""
                              } ${isReadOnly ? "bg-gray-50 cursor-not-allowed" : ""}`}
                            onChange={(e) => {
                              const value = e.target.value

                              // Clear error only when valid
                              if (value.trim() && value.length <= 50) {
                                setErrors((prev) => ({ ...prev, apName: "" }))
                              }
                            }}
                            onBlur={(e) => {
                              const value = e.target.value.trim()

                              if (!value) {
                                setErrors((prev) => ({
                                  ...prev,
                                  apName: "This field is required",
                                }))
                              } else if (value.length > 50) {
                                setErrors((prev) => ({
                                  ...prev,
                                  apName: "Max 50 characters allowed",
                                }))
                              }
                            }}
                          />

                          {errors.apName && (
                            <p className="text-xs text-red-500 mt-1">{errors.apName}</p>
                          )}


                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="apDob" className="text-sm font-medium">Date of Birth</Label>
                          <Input
                            id="apDob"
                            name="apDob"
                            type="date"
                            max={new Date().toISOString().split('T')[0]} // 🔒 Block future dates
                            defaultValue={getValue("apDob")}
                            readOnly={isReadOnly}
                            className={`bg-white h-10 ${errors.apDob ? "border-red-500 focus-visible:ring-red-500" : ""} ${isReadOnly ? "bg-gray-50 cursor-not-allowed" : ""}`}
                            onChange={(e) => {
                              if (e.target.value) setErrors(prev => ({ ...prev, apDob: "" }))
                            }}
                            onBlur={(e) => {
                              const value = e.target.value
                              if (value) {
                                const dateVal = new Date(value)
                                const year = dateVal.getFullYear()
                                if (year < 1900 || year > 2099) {
                                  setErrors((prev) => ({ ...prev, apDob: "Year must be between 1900 and 2099" }))
                                } else if (dateVal > new Date()) {
                                  setErrors((prev) => ({ ...prev, apDob: "Date of Birth cannot be in the future" }))
                                }
                              }
                            }}
                          />
                          {errors.apDob && <p className="text-xs text-red-500 mt-1">{errors.apDob}</p>}
                        </div>

                        <div className="space-y-2">
                          <Label className="text-sm font-medium">Sex</Label>
                          <RadioGroup
                            name="apSex"
                            defaultValue={getValue("apSex", "male")}
                            className="flex gap-6"
                            disabled={isReadOnly}
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="male" id="apSexMale" />
                              <Label htmlFor="apSexMale" className="text-sm">Male</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="female" id="apSexFemale" />
                              <Label htmlFor="apSexFemale" className="text-sm">Female</Label>
                            </div>
                          </RadioGroup>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="apPremise" className="text-sm font-medium">Premise/ Building</Label>
                          <Input
                            id="apPremise"
                            name="apPremise"
                            defaultValue={getValue("apPremise")}
                            readOnly={isReadOnly}
                            className={`bg-white h-10 ${isReadOnly ? "bg-gray-50 cursor-not-allowed" : ""}`}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="apArea" className="text-sm font-medium">Area/ Location</Label>
                          <Input
                            id="apArea"
                            name="apArea"
                            defaultValue={getValue("apArea")}
                            readOnly={isReadOnly}
                            className={`bg-white h-10 ${isReadOnly ? "bg-gray-50 cursor-not-allowed" : ""}`}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label className="text-sm font-medium">
                            Pin
                          </Label>
                          <div className="flex gap-2">
                            <Input
                              id="apPin"
                              name="apPin"
                              maxLength={6} // 🔒 6 digits max
                              defaultValue={getValue("apPin")}
                              readOnly={isReadOnly}
                              className={`bg-white h-10 ${errors.apPin ? "border-red-500 focus-visible:ring-red-500" : ""} ${isReadOnly ? "bg-gray-50 cursor-not-allowed" : ""}`}
                              onChange={(e) => {
                                let value = e.target.value.replace(/\D/g, '')
                                if (value.length > 6) value = value.slice(0, 6)
                                e.target.value = value
                                if (value.length === 6) setErrors(prev => ({ ...prev, apPin: "" }))
                              }}
                              onBlur={(e) => {
                                const value = e.target.value
                                if (value && value.length !== 6) {
                                  setErrors(prev => ({ ...prev, apPin: "PIN code must be exactly 6 digits" }))
                                } else {
                                  setErrors(prev => ({ ...prev, apPin: "" }))
                                }
                              }}
                            />
                            {errors.apPin && <p className="text-xs text-red-500 mt-1">{errors.apPin}</p>}

                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-sm font-medium">Mobile no.</Label>
                          <div className="flex gap-2">

                            <Input
                              id="apPhone"
                              name="apPhone"
                              maxLength={10} // 🔒 10 digits
                              defaultValue={getValue("apPhone")}
                              readOnly={isReadOnly}
                              className={`bg-white h-10 ${errors.apPhone ? "border-red-500 focus-visible:ring-red-500" : ""} ${isReadOnly ? "bg-gray-50 cursor-not-allowed" : ""}`}
                              onChange={(e) => {
                                let value = e.target.value.replace(/\D/g, '')
                                if (value.length > 10) value = value.slice(0, 10)
                                e.target.value = value
                                if (value.length === 10) setErrors(prev => ({ ...prev, apPhone: "" }))
                              }}
                              onBlur={(e) => {
                                const value = e.target.value
                                if (value && value.length !== 10) {
                                  setErrors(prev => ({ ...prev, apPhone: "Mobile number must be exactly 10 digits" }))
                                } else {
                                  setErrors(prev => ({ ...prev, apPhone: "" }))
                                }
                              }}
                            />
                            {errors.apPhone && <p className="text-xs text-red-500 mt-1">{errors.apPhone}</p>}
                          </div>
                        </div>


                      </div>

                      {/* Right Column */}
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="apDesignation" className="text-sm font-medium">
                            Designation <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="apDesignation"
                            name="apDesignation"
                            maxLength={50} // 🔒 FIELD_LIMIT
                            defaultValue={getValue("apDesignation")}
                            readOnly={isReadOnly}
                            className={`bg-white h-10 ${errors.apDesignation ? "border-red-500 focus-visible:ring-red-500" : ""
                              } ${isReadOnly ? "bg-gray-50 cursor-not-allowed" : ""}`}
                            onChange={(e) => {
                              const value = e.target.value

                              // Clear error only when valid
                              if (value.trim() && value.length <= 50) {
                                setErrors((prev) => ({ ...prev, apDesignation: "" }))
                              }
                            }}
                            onBlur={(e) => {
                              const value = e.target.value.trim()

                              if (!value) {
                                setErrors((prev) => ({
                                  ...prev,
                                  apDesignation: "This field is required",
                                }))
                              } else if (value.length > 50) {
                                setErrors((prev) => ({
                                  ...prev,
                                  apDesignation: "Max 50 characters allowed",
                                }))
                              }
                            }}
                          />

                          {errors.apDesignation && (
                            <p className="text-xs text-red-500 mt-1">{errors.apDesignation}</p>
                          )}

                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="apFatherName" className="text-sm font-medium">Father's Name</Label>
                          <Input
                            id="apFatherName"
                            name="apFatherName"
                            defaultValue={getValue("apFatherName")}
                            readOnly={isReadOnly}
                            className={`bg-white h-10 ${isReadOnly ? "bg-gray-50 cursor-not-allowed" : ""}`}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="apFlat" className="text-sm font-medium">
                            Flat
                          </Label>
                          <Input
                            id="apFlat"
                            name="apFlat"
                            defaultValue={getValue("apFlat")}
                            readOnly={isReadOnly}
                            className={`bg-white h-10 ${isReadOnly ? "bg-gray-50 cursor-not-allowed" : ""}`}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="apRoad" className="text-sm font-medium">Road/ Street/ Lane</Label>
                          <Input
                            id="apRoad"
                            name="apRoad"
                            defaultValue={getValue("apRoad")}
                            readOnly={isReadOnly}
                            className={`bg-white h-10 ${isReadOnly ? "bg-gray-50 cursor-not-allowed" : ""}`}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="apCity" className="text-sm font-medium">
                            Town/ City/ District
                          </Label>
                          <Input
                            id="apCity"
                            name="apCity"
                            defaultValue={getValue("apCity")}
                            readOnly={isReadOnly}
                            className={`bg-white h-10 ${isReadOnly ? "bg-gray-50 cursor-not-allowed" : ""}`}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="apPan" className="text-sm font-medium">
                            PAN <span className="text-red-500">*</span>
                          </Label>
                          <div className="flex gap-2">
                            <Input
                              id="apPan"
                              name="apPan"
                              maxLength={10} // 🔒 PAN length
                              defaultValue={getValue("apPan")}
                              readOnly={isReadOnly}
                              className={`bg-white h-10 uppercase ${errors.apPan ? "border-red-500 focus-visible:ring-red-500" : ""
                                } ${isReadOnly ? "bg-gray-50 cursor-not-allowed" : ""}`}
                              onChange={(e) => {
                                let value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '')
                                if (value.length > 10) value = value.slice(0, 10)
                                e.target.value = value

                                if (/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(value)) {
                                  setErrors((prev) => ({ ...prev, apPan: "" }))
                                }
                              }}
                              onBlur={(e) => {
                                const value = e.target.value.trim()

                                if (!value) {
                                  setErrors((prev) => ({
                                    ...prev,
                                    apPan: "This field is required",
                                  }))
                                } else if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(value)) {
                                  setErrors((prev) => ({
                                    ...prev,
                                    apPan: "Invalid PAN format (e.g. ABCDE1234F)",
                                  }))
                                } else {
                                  setErrors((prev) => ({ ...prev, apPan: "" }))
                                }
                              }}
                            />

                            {errors.apPan && (
                              <p className="text-xs text-red-500 mt-1">{errors.apPan}</p>
                            )}


                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="apEmail" className="text-sm font-medium">E-Mail</Label>
                          <Input
                            id="apEmail"
                            name="apEmail"
                            type="email"
                            maxLength={255} // 🔒 DB-safe
                            defaultValue={getValue("apEmail")}
                            readOnly={isReadOnly}
                            className={`bg-white h-10 ${errors.apEmail ? "border-red-500 focus-visible:ring-red-500" : ""
                              } ${isReadOnly ? "bg-gray-50 cursor-not-allowed" : ""}`}
                            onChange={(e) => {
                              const value = e.target.value

                              // clear error only when valid email or empty (optional field)
                              if (!value || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                                setErrors((prev) => ({ ...prev, apEmail: "" }))
                              }
                            }}
                            onBlur={(e) => {
                              const value = e.target.value.trim()

                              if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                                setErrors((prev) => ({
                                  ...prev,
                                  apEmail: "Enter a valid email address",
                                }))
                              }
                            }}
                          />

                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent
                  value="additional-details"
                  forceMount
                  className="mt-0 data-[state=inactive]:hidden"
                >

                  <div className="bg-gray-50 rounded-lg p-6 space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                      {/* Left Column */}
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="gstin" className="text-sm font-medium">GSTIN</Label>
                          <Input
                            id="gstin"
                            name="gstin"
                            maxLength={15} // 🔒 DB limit
                            defaultValue={getValue("gstin")}
                            readOnly={isReadOnly}
                            className={`bg-white h-10 ${errors.gstin ? "border-red-500 focus-visible:ring-red-500" : ""
                              } ${isReadOnly ? "bg-gray-50 cursor-not-allowed" : ""}`}
                            onChange={(e) => {
                              const value = e.target.value.toUpperCase()

                              // Clear error only when valid length
                              if (!value || value.length === 15) {
                                setErrors((prev) => ({ ...prev, gstin: "" }))
                              }
                            }}
                            onBlur={(e) => {
                              const value = e.target.value.trim()

                              if (value && value.length !== 15) {
                                setErrors((prev) => ({
                                  ...prev,
                                  gstin: "GSTIN must be exactly 15 characters",
                                }))
                              }
                            }}
                          />

                        </div>

                        <div className="space-y-2">
                          <Label className="text-sm font-medium">
                            Type of Deductor
                          </Label>
                          <RadioGroup
                            name="deductorType"
                            defaultValue={getValue("deductorType")}
                            className="flex gap-6"
                            disabled={isReadOnly}
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="GOV" id="deductorGov" />
                              <Label htmlFor="deductorGov" className="text-sm">Gov.</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="UNION_GOV" id="deductorUnionGov" />
                              <Label htmlFor="deductorUnionGov" className="text-sm">Union Govt.</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="OTHERS" id="deductorOthers" />
                              <Label htmlFor="deductorOthers" className="text-sm">Others</Label>
                            </div>
                          </RadioGroup>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="paoCode" className="text-sm font-medium">PAO Code</Label>
                          <Input
                            id="paoCode"
                            name="paoCode"
                            defaultValue={getValue("paoCode")}
                            readOnly={isReadOnly}
                            className={`bg-white h-10 ${isReadOnly ? "bg-gray-50 cursor-not-allowed" : ""}`}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="ministryName" className="text-sm font-medium">Ministry Name</Label>
                          <Input
                            id="ministryName"
                            name="ministryName"
                            defaultValue={getValue("ministryName")}
                            readOnly={isReadOnly}
                            className={`bg-white h-10 ${isReadOnly ? "bg-gray-50 cursor-not-allowed" : ""}`}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="ministryIfOthers" className="text-sm font-medium">Ministry (If Others)</Label>
                          <Input
                            id="ministryIfOthers"
                            name="ministryIfOthers"
                            defaultValue={getValue("ministryIfOthers")}
                            readOnly={isReadOnly}
                            className={`bg-white h-10 ${isReadOnly ? "bg-gray-50 cursor-not-allowed" : ""}`}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="paoRegNo" className="text-sm font-medium">PAO Reg. No.</Label>
                          <Input
                            id="paoRegNo"
                            name="paoRegNo"
                            defaultValue={getValue("paoRegNo")}
                            readOnly={isReadOnly}
                            className={`bg-white h-10 ${isReadOnly ? "bg-gray-50 cursor-not-allowed" : ""}`}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="tdsCircle" className="text-sm font-medium">TDS Circle</Label>
                          <Input
                            id="tdsCircle"
                            name="tdsCircle"
                            defaultValue={getValue("tdsCircle")}
                            readOnly={isReadOnly}
                            className={`bg-white h-10 ${isReadOnly ? "bg-gray-50 cursor-not-allowed" : ""}`}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="ain" className="text-sm font-medium">AIN of PAO/TO/CDDO</Label>
                          <Input
                            id="ain"
                            name="ain"
                            defaultValue={getValue("ain")}
                            readOnly={isReadOnly}
                            className={`bg-white h-10 ${isReadOnly ? "bg-gray-50 cursor-not-allowed" : ""}`}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="labourId" className="text-sm font-medium">Labour Identification No.</Label>
                          <Input
                            id="labourId"
                            name="labourId"
                            defaultValue={getValue("labourId")}
                            readOnly={isReadOnly}
                            className={`bg-white h-10 ${isReadOnly ? "bg-gray-50 cursor-not-allowed" : ""}`}
                          />
                        </div>
                      </div>

                      {/* Right Column */}
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="cin" className="text-sm font-medium">CIN</Label>
                          <Input
                            id="cin"
                            name="cin"
                            defaultValue={getValue("cin")}
                            readOnly={isReadOnly}
                            className={`bg-white h-10 ${isReadOnly ? "bg-gray-50 cursor-not-allowed" : ""}`}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="state" className="text-sm font-medium">State</Label>
                          <Select
                            name="state"
                            defaultValue={getValue("state")}
                            disabled={isReadOnly}
                          >
                            <SelectTrigger className={`bg-white h-10 ${isReadOnly ? "bg-gray-50 cursor-not-allowed" : ""}`}>
                              <SelectValue placeholder="Select State" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="ANDAMAN AND NICOBAR ISLANDS">ANDAMAN AND NICOBAR ISLANDS</SelectItem>
                              <SelectItem value="ANDHRA PRADESH">ANDHRA PRADESH</SelectItem>
                              <SelectItem value="ARUNACHAL PRADESH">ARUNACHAL PRADESH</SelectItem>
                              <SelectItem value="ASSAM">ASSAM</SelectItem>
                              <SelectItem value="BIHAR">BIHAR</SelectItem>
                              <SelectItem value="CHANDIGARH">CHANDIGARH</SelectItem>
                              <SelectItem value="CHHATTISGARH">CHHATTISGARH</SelectItem>
                              <SelectItem value="DADRA AND NAGAR HAVELI AND DAMAN AND DIU">DADRA AND NAGAR HAVELI AND DAMAN AND DIU</SelectItem>
                              <SelectItem value="DELHI">DELHI</SelectItem>
                              <SelectItem value="GOA">GOA</SelectItem>
                              <SelectItem value="GUJARAT">GUJARAT</SelectItem>
                              <SelectItem value="HARYANA">HARYANA</SelectItem>
                              <SelectItem value="HIMACHAL PRADESH">HIMACHAL PRADESH</SelectItem>
                              <SelectItem value="JAMMU AND KASHMIR">JAMMU AND KASHMIR</SelectItem>
                              <SelectItem value="JHARKHAND">JHARKHAND</SelectItem>
                              <SelectItem value="KARNATAKA">KARNATAKA</SelectItem>
                              <SelectItem value="KERALA">KERALA</SelectItem>
                              <SelectItem value="LADAKH">LADAKH</SelectItem>
                              <SelectItem value="LAKSHADWEEP">LAKSHADWEEP</SelectItem>
                              <SelectItem value="MADHYA PRADESH">MADHYA PRADESH</SelectItem>
                              <SelectItem value="MAHARASHTRA">MAHARASHTRA</SelectItem>
                              <SelectItem value="MANIPUR">MANIPUR</SelectItem>
                              <SelectItem value="MEGHALAYA">MEGHALAYA</SelectItem>
                              <SelectItem value="MIZORAM">MIZORAM</SelectItem>
                              <SelectItem value="NAGALAND">NAGALAND</SelectItem>
                              <SelectItem value="ODISHA">ODISHA</SelectItem>
                              <SelectItem value="PUDUCHERRY">PUDUCHERRY</SelectItem>
                              <SelectItem value="PUNJAB">PUNJAB</SelectItem>
                              <SelectItem value="RAJASTHAN">RAJASTHAN</SelectItem>
                              <SelectItem value="SIKKIM">SIKKIM</SelectItem>
                              <SelectItem value="TAMIL NADU">TAMIL NADU</SelectItem>
                              <SelectItem value="TELANGANA">TELANGANA</SelectItem>
                              <SelectItem value="TRIPURA">TRIPURA</SelectItem>
                              <SelectItem value="UTTAR PRADESH">UTTAR PRADESH</SelectItem>
                              <SelectItem value="UTTARAKHAND">UTTARAKHAND</SelectItem>
                              <SelectItem value="WEST BENGAL">WEST BENGAL</SelectItem>
                              <SelectItem value="OTHER">OTHER</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="ddoCode" className="text-sm font-medium">DDO Code</Label>
                          <Input
                            id="ddoCode"
                            name="ddoCode"
                            defaultValue={getValue("ddoCode")}
                            readOnly={isReadOnly}
                            className={`bg-white h-10 ${isReadOnly ? "bg-gray-50 cursor-not-allowed" : ""}`}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="ddoRegNo" className="text-sm font-medium">DDO Reg. No.</Label>
                          <Input
                            id="ddoRegNo"
                            name="ddoRegNo"
                            defaultValue={getValue("ddoRegNo")}
                            readOnly={isReadOnly}
                            className={`bg-blue-50 h-10 ${isReadOnly ? "bg-gray-50 cursor-not-allowed" : ""}`}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="tanRegNo" className="text-sm font-medium">TAN Reg. No.</Label>
                          <Input
                            id="tanRegNo"
                            name="tanRegNo"
                            defaultValue={getValue("tanRegNo")}
                            readOnly={isReadOnly}
                            className={`bg-white h-10 ${isReadOnly ? "bg-gray-50 cursor-not-allowed" : ""}`}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="lwfRegNo" className="text-sm font-medium">LWF Reg. No.</Label>
                          <Input
                            id="lwfRegNo"
                            name="lwfRegNo"
                            defaultValue={getValue("lwfRegNo")}
                            readOnly={isReadOnly}
                            className={`bg-white h-10 ${isReadOnly ? "bg-gray-50 cursor-not-allowed" : ""}`}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="branchDivision" className="text-sm font-medium">
                            Branch/Division
                          </Label>
                          <Input
                            id="branchDivision"
                            name="branchDivision"
                            defaultValue={getValue("branchDivision")}
                            readOnly={isReadOnly}
                            className={`bg-white h-10 ${isReadOnly ? "bg-gray-50 cursor-not-allowed" : ""}`}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 space-y-4">

                      <div className="flex items-center space-x-6">
                        <RadioGroup
                          name="companyType"
                          defaultValue={getValue("companyType")}
                          className="flex gap-6"
                          disabled={isReadOnly}
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="GOVERNMENT" id="typeGovernment" />
                            <Label htmlFor="typeGovernment" className="text-sm"> Government</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="OTHERS" id="typeOthers" />
                            <Label htmlFor="typeOthers" className="text-sm"> Others</Label>
                          </div>
                        </RadioGroup>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </div>
            </fieldset>

            <div className="border-t p-6 bg-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-muted-foreground">Mandatory Fields for TDS</span>
                </div>

                <div className="flex space-x-3">
                  {!isReadOnly && (
                    <Button type="submit" disabled={isSubmitting} className="bg-blue-500 hover:bg-blue-600 text-white">
                      {isSubmitting
                        ? (mode === "create" ? "Creating..." : "Updating...")
                        : (mode === "create" ? "Create" : "Update")}
                    </Button>
                  )}
                  <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="bg-blue-500 hover:bg-blue-600 text-white">
                    {isReadOnly ? "Close" : "Cancel"}
                  </Button>
                  {!isReadOnly && (
                    <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="bg-blue-500 hover:bg-blue-600 text-white">
                      Exit
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </Tabs>
        </form>
      </DialogContent>
    </Dialog>
  )
}
