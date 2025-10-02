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
}

export function CompanyInformationForm({ 
  isOpen, 
  onOpenChange, 
  onSubmit, 
  error, 
  title = "Company Information" 
}: CompanyInformationFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    const formData = new FormData(e.currentTarget)
    await onSubmit(formData)
    setIsSubmitting(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[95vh] overflow-hidden p-0">
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
          <Tabs defaultValue="company-info" className="h-full flex flex-col">
            <TabsList className="grid grid-cols-3 mx-6 mb-4 bg-muted/40 p-1 rounded-md">
              <TabsTrigger value="company-info" className="text-sm font-medium">Company Info</TabsTrigger>
              <TabsTrigger value="authorized-person" className="text-sm font-medium">Authorised Person Details</TabsTrigger>
              <TabsTrigger value="additional-details" className="text-sm font-medium">Additional Details</TabsTrigger>
            </TabsList>
            
            <div className="flex-1 overflow-y-auto px-6 pb-6 max-h-[60vh]">
              <TabsContent value="company-info" className="mt-0">
                <div className="bg-gray-50 rounded-lg p-6 space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    {/* Left Column */}
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="code" className="text-sm font-medium">
                          Code <span className="text-red-500">*</span>
                        </Label>
                        <Input id="code" name="code" className="bg-white h-10" />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="flat" className="text-sm font-medium">
                          Flat <span className="text-red-500">*</span>
                        </Label>
                        <Input id="flat" name="flat" className="bg-white h-10" />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="road" className="text-sm font-medium">Road/ Street/ Lane</Label>
                        <Input id="road" name="road" className="bg-white h-10" />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="city" className="text-sm font-medium">Town/ City/ District</Label>
                        <Input id="city" name="city" className="bg-white h-10" />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="pan" className="text-sm font-medium">
                          PAN <span className="text-red-500">*</span>
                        </Label>
                        <div className="flex gap-2">
                          <Input id="pan" name="pan" className="bg-white flex-1" />
                          <Button type="button" variant="outline" size="sm">...</Button>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="tan" className="text-sm font-medium">
                          TAN <span className="text-red-500">*</span>
                        </Label>
                        <div className="flex gap-2">
                          <Input id="tan" name="tan" className="bg-white flex-1" />
                          <Button type="button" variant="outline" size="sm">...</Button>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="regYear" className="text-sm font-medium">Reg. Year - Reg. No.</Label>
                        <div className="flex gap-2">
                          <Input id="regYear" name="regYear" className="bg-white h-10" placeholder="Year" />
                          <Input id="regNo" name="regNo" className="bg-white h-10" placeholder="No." />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="natureOfCompany" className="text-sm font-medium">Nature of Company</Label>
                        <div className="flex gap-2">
                          <Input id="natureOfCompany" name="natureOfCompany" className="bg-white flex-1" />
                          <Button type="button" variant="outline" size="sm">...</Button>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-sm font-medium">E-Mail</Label>
                        <div className="flex gap-2">
                          <Input id="email" name="email" type="email" className="bg-white flex-1" />
                          <Button type="button" variant="outline" size="sm">...</Button>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="epfCode" className="text-sm font-medium">Code No. Alloted by EPF</Label>
                        <div className="flex gap-2">
                          <Input id="epfCode" name="epfCode" className="bg-white flex-1" />
                          <Button type="button" variant="outline" size="sm">...</Button>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="pfCoverageDate" className="text-sm font-medium">PF Coverage Date</Label>
                        <Input id="pfCoverageDate" name="pfCoverageDate" type="date" className="bg-blue-50 h-10" />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="esiNumber" className="text-sm font-medium">ESI Number</Label>
                        <Input id="esiNumber" name="esiNumber" className="bg-blue-50 h-10" />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="ptRegCert" className="text-sm font-medium">PT Reg. Certificate No.</Label>
                        <Input id="ptRegCert" name="ptRegCert" className="bg-white h-10" />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="ptEnrCert" className="text-sm font-medium">PT Enr. Certificate No.</Label>
                        <Input id="ptEnrCert" name="ptEnrCert" className="bg-white h-10" />
                      </div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="cin" className="text-sm font-medium">CIN</Label>
                        <Input id="cin" name="cin" className="bg-white h-10" />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="state" className="text-sm font-medium">State</Label>
                        <Select name="state">
                          <SelectTrigger className="bg-white h-10">
                            <SelectValue placeholder="Select State" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="maharashtra">Maharashtra</SelectItem>
                            <SelectItem value="karnataka">Karnataka</SelectItem>
                            <SelectItem value="tamilnadu">Tamil Nadu</SelectItem>
                            <SelectItem value="gujarat">Gujarat</SelectItem>
                            <SelectItem value="delhi">Delhi</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="ddoCode" className="text-sm font-medium">DDO Code</Label>
                        <Input id="ddoCode" name="ddoCode" className="bg-white h-10" />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="ddoRegNo" className="text-sm font-medium">DDO Reg. No.</Label>
                        <Input id="ddoRegNo" name="ddoRegNo" className="bg-blue-50 h-10" />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="tanRegNo" className="text-sm font-medium">TAN Reg. No.</Label>
                        <Input id="tanRegNo" name="tanRegNo" className="bg-white h-10" />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="lwfRegNo" className="text-sm font-medium">LWF Reg. No.</Label>
                        <Input id="lwfRegNo" name="lwfRegNo" className="bg-white h-10" />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="branchDivision" className="text-sm font-medium">
                          Branch/Division <span className="text-red-500">*</span>
                        </Label>
                        <Input id="branchDivision" name="branchDivision" className="bg-white h-10" />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="leaveSetupType" className="text-sm font-medium">Leave SetUp Type</Label>
                        <Select name="leaveSetupType" defaultValue="financial-year">
                          <SelectTrigger className="bg-white h-10">
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
                        <Select name="employeeListOrder" defaultValue="name">
                          <SelectTrigger className="bg-white h-10">
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
                          <Checkbox id="showBranchName" name="showBranchName" />
                          <Label htmlFor="showBranchName" className="text-sm">Show Branch Name With Branch Code</Label>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Checkbox id="dontGeneratePF" name="dontGeneratePF" />
                          <Label htmlFor="dontGeneratePF" className="text-sm">Donot Generate PF No Automatically</Label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="authorized-person" className="mt-0">
                <div className="bg-gray-50 rounded-lg p-6 space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    {/* Left Column */}
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="apName" className="text-sm font-medium">
                          Authorised Person Name <span className="text-red-500">*</span>
                        </Label>
                        <Input id="apName" name="apName" className="bg-white h-10" />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="apDob" className="text-sm font-medium">Date of Birth</Label>
                        <Input id="apDob" name="apDob" type="date" className="bg-white h-10" />
                      </div>
                      
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Sex</Label>
                        <RadioGroup name="apSex" defaultValue="male" className="flex gap-6">
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
                        <Input id="apPremise" name="apPremise" className="bg-white h-10" />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="apArea" className="text-sm font-medium">Area/ Location</Label>
                        <Input id="apArea" name="apArea" className="bg-white h-10" />
                      </div>
                      
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">
                          Pin <span className="text-red-500">*</span> - State <span className="text-red-500">*</span>
                        </Label>
                        <div className="flex gap-2">
                          <Input id="apPin" name="apPin" className="bg-white h-10" />
                          <div className="flex gap-2 flex-1">
                            <Input id="apState" name="apState" className="bg-white flex-1" />
                            <Button type="button" variant="outline" size="sm">▼</Button>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">STD Code - Phone No.</Label>
                        <div className="flex gap-2">
                          <Input id="apStdCode" name="apStdCode" className="bg-blue-50 h-10" />
                          <Input id="apPhone" name="apPhone" className="bg-white h-10" />
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                          <Checkbox id="addressChanged" name="addressChanged" />
                          <Label htmlFor="addressChanged" className="text-sm">Has Address of Person Responsible Changed Since Submitting the Last Return</Label>
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
                          Designation <span className="text-red-500">*</span>
                        </Label>
                        <Input id="apDesignation" name="apDesignation" className="bg-white h-10" />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="apFatherName" className="text-sm font-medium">Father's Name</Label>
                        <Input id="apFatherName" name="apFatherName" className="bg-white h-10" />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="apFlat" className="text-sm font-medium">
                          Flat <span className="text-red-500">*</span>
                        </Label>
                        <Input id="apFlat" name="apFlat" className="bg-white h-10" />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="apRoad" className="text-sm font-medium">Road/ Street/ Lane</Label>
                        <Input id="apRoad" name="apRoad" className="bg-white h-10" />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="apCity" className="text-sm font-medium">
                          Town/ City/ District <span className="text-red-500">*</span>
                        </Label>
                        <Input id="apCity" name="apCity" className="bg-white h-10" />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="apPan" className="text-sm font-medium">
                          PAN <span className="text-red-500">*</span>
                        </Label>
                        <div className="flex gap-2">
                          <Input id="apPan" name="apPan" className="bg-white flex-1" />
                          <Button type="button" variant="outline" size="sm">...</Button>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="apEmail" className="text-sm font-medium">E-Mail</Label>
                        <Input id="apEmail" name="apEmail" type="email" className="bg-white h-10" />
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="additional-details" className="mt-0">
                <div className="bg-gray-50 rounded-lg p-6 space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    {/* Left Column */}
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="gstin" className="text-sm font-medium">GSTIN</Label>
                        <Input id="gstin" name="gstin" className="bg-white h-10" />
                      </div>
                      
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">
                          Type of Deductor <span className="text-red-500">*</span>
                        </Label>
                        <RadioGroup name="deductorType" className="flex gap-6">
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
                        <Input id="paoCode" name="paoCode" className="bg-white h-10" />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="ministryName" className="text-sm font-medium">Ministry Name</Label>
                        <Input id="ministryName" name="ministryName" className="bg-white h-10" />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="ministryIfOthers" className="text-sm font-medium">Ministry (If Others)</Label>
                        <Input id="ministryIfOthers" name="ministryIfOthers" className="bg-white h-10" />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="paoRegNo" className="text-sm font-medium">PAO Reg. No.</Label>
                        <Input id="paoRegNo" name="paoRegNo" className="bg-white h-10" />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="tdsCircle" className="text-sm font-medium">TDS Circle</Label>
                        <Input id="tdsCircle" name="tdsCircle" className="bg-white h-10" />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="ain" className="text-sm font-medium">AIN of PAO/TO/CDDO</Label>
                        <Input id="ain" name="ain" className="bg-white h-10" />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="labourId" className="text-sm font-medium">Labour Identification No.</Label>
                        <Input id="labourId" name="labourId" className="bg-white h-10" />
                      </div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="cin" className="text-sm font-medium">CIN</Label>
                        <Input id="cin" name="cin" className="bg-white h-10" />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="state" className="text-sm font-medium">State</Label>
                        <Select name="state">
                          <SelectTrigger className="bg-white h-10">
                            <SelectValue placeholder="Select State" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="maharashtra">Maharashtra</SelectItem>
                            <SelectItem value="karnataka">Karnataka</SelectItem>
                            <SelectItem value="tamilnadu">Tamil Nadu</SelectItem>
                            <SelectItem value="gujarat">Gujarat</SelectItem>
                            <SelectItem value="delhi">Delhi</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="ddoCode" className="text-sm font-medium">DDO Code</Label>
                        <Input id="ddoCode" name="ddoCode" className="bg-white h-10" />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="ddoRegNo" className="text-sm font-medium">DDO Reg. No.</Label>
                        <Input id="ddoRegNo" name="ddoRegNo" className="bg-blue-50 h-10" />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="tanRegNo" className="text-sm font-medium">TAN Reg. No.</Label>
                        <Input id="tanRegNo" name="tanRegNo" className="bg-white h-10" />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="lwfRegNo" className="text-sm font-medium">LWF Reg. No.</Label>
                        <Input id="lwfRegNo" name="lwfRegNo" className="bg-white h-10" />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="branchDivision" className="text-sm font-medium">
                          Branch/Division <span className="text-red-500">*</span>
                        </Label>
                        <Input id="branchDivision" name="branchDivision" className="bg-white h-10" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6 space-y-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="addressChangedEmployer" name="addressChangedEmployer" />
                      <Label htmlFor="addressChangedEmployer" className="text-sm">
                        Has Address of Employer Changed Since Submitting the Last Return
                      </Label>
                    </div>
                    
                    <div className="flex items-center space-x-6">
                      <RadioGroup name="companyType" className="flex gap-6">
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="government" id="typeGovernment" />
                          <Label htmlFor="typeGovernment" className="text-sm">O Government</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="others" id="typeOthers" />
                          <Label htmlFor="typeOthers" className="text-sm">O Others</Label>
                        </div>
                      </RadioGroup>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </div>
            
            <div className="border-t p-6 bg-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-red-500 text-sm">*</span>
                  <span className="text-sm text-muted-foreground">Mandatory Fields for TDS</span>
                </div>
                
                <div className="flex space-x-3">
                  <Button type="submit" disabled={isSubmitting} className="bg-blue-500 hover:bg-blue-600 text-white">
                    {isSubmitting ? "Updating..." : "Update"}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="bg-blue-500 hover:bg-blue-600 text-white">
                    Cancel
                  </Button>
                  <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="bg-blue-500 hover:bg-blue-600 text-white">
                    Exit
                  </Button>
                </div>
              </div>
            </div>
          </Tabs>
        </form>
      </DialogContent>
    </Dialog>
  )
}
