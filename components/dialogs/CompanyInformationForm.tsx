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
  initialData?:any
  mode?:"view"|"edit"|"create"
}
const FIELD_LIMITS: Record<string, number> = {
  // Company
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
  mode ="create"
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
    return String(value)
  }

  // Helper function to get checkbox value
  const getCheckboxValue = (field: string): boolean => {
    if (!initialData) return false
    return initialData[field] === true || initialData[field] === "true"
  }


  const REQUIRED_FIELDS_BY_TAB: Record<string, string[]> = {
    "company-info": ["code", "pan", "tan"],
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
  
    // 2️⃣ Max length check
    Object.entries(FIELD_LIMITS).forEach(([field, max]) => {
      const value = String(formData.get(field) || "").trim()
      if (value && value.length > max) {
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
                            <Label htmlFor="code" className="text-sm font-medium">
                              Code
                            </Label>
                            <Input
                              id="code"
                              name="code"
                              maxLength={50} // 🔒 DB limit
                              defaultValue={getValue("code")}
                              readOnly={isReadOnly}
                              className={`bg-white h-10 ${
                                errors.code ? "border-red-500 focus-visible:ring-red-500" : ""
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
                              PAN 
                            </Label>
                            <div className="flex gap-2">
                            <Input
                              id="pan"
                              name="pan"
                              maxLength={10} // 🔒 DB + PAN rule
                              defaultValue={getValue("pan")}
                              readOnly={isReadOnly}
                              className={`bg-white h-10 ${
                                errors.pan ? "border-red-500 focus-visible:ring-red-500" : ""
                              } ${isReadOnly ? "bg-gray-50 cursor-not-allowed" : ""}`}
                              onChange={(e) => {
                                const value = e.target.value.toUpperCase()

                                // Clear error only when valid length
                                if (value.length === 10) {
                                  setErrors((prev) => ({ ...prev, pan: "" }))
                                }
                              }}
                              onBlur={(e) => {
                                const value = e.target.value.trim()

                                if (!value) {
                                  setErrors((prev) => ({ ...prev, pan: "This field is required" }))
                                } else if (value.length !== 10) {
                                  setErrors((prev) => ({ ...prev, pan: "PAN must be exactly 10 characters" }))
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
                              TAN 
                            </Label>
                            <div className="flex gap-2">
                            <Input
                              id="tan"
                              name="tan"
                              maxLength={10} // 🔒 DB limit
                              defaultValue={getValue("tan")}
                              readOnly={isReadOnly}
                              className={`bg-white h-10 ${
                                errors.tan ? "border-red-500 focus-visible:ring-red-500" : ""
                              } ${isReadOnly ? "bg-gray-50 cursor-not-allowed" : ""}`}
                              onChange={(e) => {
                                const value = e.target.value.toUpperCase()

                                if (value.length === 10) {
                                  setErrors((prev) => ({ ...prev, tan: "" }))
                                }
                              }}
                              onBlur={(e) => {
                                const value = e.target.value.trim()

                                if (!value) {
                                  setErrors((prev) => ({ ...prev, tan: "This field is required" }))
                                } else if (value.length !== 10) {
                                  setErrors((prev) => ({ ...prev, tan: "TAN must be exactly 10 characters" }))
                                }
                              }}
                            />

                              {errors.tan && (
                                <p className="text-xs text-red-500 mt-1">{errors.tan}</p>
                              )}
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="regYear" className="text-sm font-medium">Reg. Year - Reg. No.</Label>
                            <div className="flex gap-2">
                              <Input 
                                id="regYear" 
                                name="regYear" 
                                defaultValue={getValue("regYear")}
                                readOnly={isReadOnly}
                                className={`bg-white h-10 ${isReadOnly ? "bg-gray-50 cursor-not-allowed" : ""}`} 
                                placeholder="Year" 
                              />
                              <Input 
                                id="regNo" 
                                name="regNo" 
                                defaultValue={getValue("regNo")}
                                readOnly={isReadOnly}
                                className={`bg-white h-10 ${isReadOnly ? "bg-gray-50 cursor-not-allowed" : ""}`} 
                                placeholder="No." 
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
                            <Label htmlFor="epfCode" className="text-sm font-medium">Code No. Alloted by EPF</Label>
                            <div className="flex gap-2">
                              <Input 
                                id="epfCode" 
                                name="epfCode" 
                                defaultValue={getValue("epfCode")}
                                readOnly={isReadOnly}
                                className={`bg-white flex-1 ${isReadOnly ? "bg-gray-50 cursor-not-allowed" : ""}`} 
                              />
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="pfCoverageDate" className="text-sm font-medium">PF Coverage Date</Label>
                            <Input 
                              id="pfCoverageDate" 
                              name="pfCoverageDate" 
                              type="date" 
                              defaultValue={getValue("pfCoverageDate")}
                              readOnly={isReadOnly}
                              className={`bg-blue-50 h-10 ${isReadOnly ? "bg-gray-50 cursor-not-allowed" : ""}`} 
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
                        </div>

                        {/* Right Column */}
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="cin" className="text-sm font-medium">CIN</Label>
                            <Input
                              id="cin"
                              name="cin"
                              maxLength={21} // 🔒 DB limit
                              defaultValue={getValue("cin")}
                              readOnly={isReadOnly}
                              className={`bg-white h-10 ${
                                errors.cin ? "border-red-500 focus-visible:ring-red-500" : ""
                              } ${isReadOnly ? "bg-gray-50 cursor-not-allowed" : ""}`}
                              onChange={(e) => {
                                const value = e.target.value.toUpperCase()

                                // Clear error only when within limit
                                if (value.length <= 21) {
                                  setErrors((prev) => ({ ...prev, cin: "" }))
                                }
                              }}
                              onBlur={(e) => {
                                const value = e.target.value.trim()

                                if (value && value.length > 21) {
                                  setErrors((prev) => ({
                                    ...prev,
                                    cin: "CIN can be maximum 21 characters",
                                  }))
                                }
                              }}
                            />

                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="state" className="text-sm font-medium">State</Label>
                            <Select name="state">
                              <SelectTrigger className="bg-white h-10">
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
                              Authorised Person Name 
                            </Label>
                            <Input
                              id="apName"
                              name="apName"
                              maxLength={50} // 🔒 DB / FIELD_LIMIT
                              defaultValue={getValue("apName")}
                              readOnly={isReadOnly}
                              className={`bg-white h-10 ${
                                errors.apName ? "border-red-500 focus-visible:ring-red-500" : ""
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
                              defaultValue={getValue("apDob")}
                              readOnly={isReadOnly}
                              className={`bg-white h-10 ${isReadOnly ? "bg-gray-50 cursor-not-allowed" : ""}`} 
                            />
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
                                defaultValue={getValue("apPin")}
                                readOnly={isReadOnly}
                                className={`bg-white h-10 ${isReadOnly ? "bg-gray-50 cursor-not-allowed" : ""}`} 
                              />
                              
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <Label className="text-sm font-medium">STD Code - Phone No.</Label>
                            <div className="flex gap-2">
                              <Input 
                                id="apStdCode" 
                                name="apStdCode" 
                                defaultValue={getValue("apStdCode")}
                                readOnly={isReadOnly}
                                className={`w-20 bg-blue-50 h-10 ${isReadOnly ? "bg-gray-50 cursor-not-allowed" : ""}`} 
                              />
                              <Input 
                                id="apPhone" 
                                name="apPhone" 
                                defaultValue={getValue("apPhone")}
                                readOnly={isReadOnly}
                                className={`bg-white h-10 ${isReadOnly ? "bg-gray-50 cursor-not-allowed" : ""}`} 
                              />
                            </div>
                          </div>
                          
                          <div className="space-y-3">
                            <div className="flex items-center space-x-2">
                              <Checkbox 
                                id="addressChanged" 
                                name="addressChanged" 
                                defaultChecked={getCheckboxValue("addressChanged")}
                                disabled={isReadOnly}
                              />
                              <Label htmlFor="addressChanged" className="text-sm"></Label>
                            </div>
                            
                            <p className="text-red-500 text-xs">
                              To Enter Mobile No., Enter '91' in STD Code and 10 Digit Mobile No. in Phone No. Box.
                            </p>
                          </div>
                        </div>

                        {/* Right Column */}
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="apDesignation" className="text-sm font-medium">
                              Designation 
                            </Label>
                            <Input
                              id="apDesignation"
                              name="apDesignation"
                              maxLength={50} // 🔒 FIELD_LIMIT
                              defaultValue={getValue("apDesignation")}
                              readOnly={isReadOnly}
                              className={`bg-white h-10 ${
                                errors.apDesignation ? "border-red-500 focus-visible:ring-red-500" : ""
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
                              PAN 
                            </Label>
                            <div className="flex gap-2">
                            <Input
                              id="apPan"
                              name="apPan"
                              maxLength={10} // 🔒 PAN length
                              defaultValue={getValue("apPan")}
                              readOnly={isReadOnly}
                              className={`bg-white h-10 uppercase ${
                                errors.apPan ? "border-red-500 focus-visible:ring-red-500" : ""
                              } ${isReadOnly ? "bg-gray-50 cursor-not-allowed" : ""}`}
                              onChange={(e) => {
                                const value = e.target.value.toUpperCase()

                                // force uppercase in input
                                e.target.value = value

                                // clear error only if valid length
                                if (value.length === 10) {
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
                                } else if (value.length !== 10) {
                                  setErrors((prev) => ({
                                    ...prev,
                                    apPan: "PAN must be exactly 10 characters",
                                  }))
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
                              className={`bg-white h-10 ${
                                errors.apEmail ? "border-red-500 focus-visible:ring-red-500" : ""
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
                              className={`bg-white h-10 ${
                                errors.gstin ? "border-red-500 focus-visible:ring-red-500" : ""
                              }`}
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
                                <RadioGroupItem value="gov" id="deductorGov" />
                                <Label htmlFor="deductorGov" className="text-sm">Gov.</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="union-gov" id="deductorUnionGov" />
                                <Label htmlFor="deductorUnionGov" className="text-sm">Union Govt.</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="others" id="deductorOthers" />
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
                        <div className="flex items-center space-x-2">
                          <Checkbox 
                            id="addressChangedEmployer" 
                            name="addressChangedEmployer" 
                            defaultChecked={getCheckboxValue("addressChangedEmployer")}
                            disabled={isReadOnly}
                          />
                          <Label htmlFor="addressChangedEmployer" className="text-sm">
                           
                          </Label>
                        </div>
                        
                        <div className="flex items-center space-x-6">
                          <RadioGroup 
                            name="companyType" 
                            defaultValue={getValue("companyType")}
                            className="flex gap-6"
                            disabled={isReadOnly}
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="government" id="typeGovernment" />
                              <Label htmlFor="typeGovernment" className="text-sm"> Government</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="others" id="typeOthers" />
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
                      {isSubmitting ? "Updating..." : "Update"}
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
