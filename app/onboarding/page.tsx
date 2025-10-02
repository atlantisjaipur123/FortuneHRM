"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { Building2, CheckCircle, ArrowRight, ArrowLeft } from "lucide-react"
import { createCompanyAction } from "@/app/actions/auth"
import { useRouter } from "next/navigation"

const companyNatures = [
  "Information Technology",
  "Manufacturing",
  "Healthcare",
  "Education",
  "Finance & Banking",
  "Retail & E-commerce",
  "Construction",
  "Consulting Services",
  "Transportation & Logistics",
  "Food & Beverage",
  "Real Estate",
  "Other",
]

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    companyName: "",
    nature: "",
    address: "",
    city: "",
    state: "",
    pinCode: "",
    pan: "",
    gstin: "",
    tan: "",
  })
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const isSubmitting = useRef(false)

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setError(null) // Clear error on input change
  }

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (isSubmitting.current) return
    isSubmitting.current = true
    setError(null)

    const formDataObj = new FormData()
    formDataObj.append("companyName", formData.companyName)
    formDataObj.append("nature", formData.nature)
    formDataObj.append("address", `${formData.address}, ${formData.city}, ${formData.state} - ${formData.pinCode}`)
    formDataObj.append("pan", formData.pan)
    formDataObj.append("gstin", formData.gstin)
    formDataObj.append("tan", formData.tan)
    // Note: adminId should come from the session, not hardcoded. For now, assuming it's handled server-side.

    console.log("Submitting FormData:", Array.from(formDataObj.entries())) // Debug

    try {
      const result = await createCompanyAction(formDataObj)
      if (result.error) {
        setError(result.error)
        isSubmitting.current = false
        return
      }

      if (result.success && result.company) {
        try {
          localStorage.setItem("companyData", JSON.stringify(result.company))
        } catch (e) {
          console.error("Failed to save company data to localStorage:", e)
        }
        router.push("/dashboard")
      }
    } catch (e) {
      console.error("Submission error:", e)
      setError("An unexpected error occurred")
      isSubmitting.current = false
    }
  }

  const isStep1Valid = formData.companyName && formData.nature
  const isStep2Valid = formData.address && formData.city && formData.state && formData.pinCode && formData.pan
  const progress = (currentStep / 3) * 100

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Logo and Progress */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-6">
            <Building2 className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold text-foreground">HRPro</span>
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold">Set up your company</h1>
            <p className="text-muted-foreground">Complete your company profile to get started</p>
            <div className="w-full max-w-md mx-auto">
              <Progress value={progress} className="h-2" />
              <p className="text-sm text-muted-foreground mt-2">Step {currentStep} of 3</p>
            </div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>
              {currentStep === 1 && "Company Information"}
              {currentStep === 2 && "Company Details"}
              {currentStep === 3 && "Review & Confirm"}
            </CardTitle>
            <CardDescription>
              {currentStep === 1 && "Tell us about your company"}
              {currentStep === 2 && "Provide your company's legal and contact information"}
              {currentStep === 3 && "Review your information and complete setup"}
            </CardDescription>
          </CardHeader>

          <CardContent>
            {currentStep === 1 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="companyName">Company Name *</Label>
                  <Input
                    id="companyName"
                    value={formData.companyName}
                    onChange={(e) => handleInputChange("companyName", e.target.value)}
                    placeholder="Enter your company name"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nature">Nature of Business *</Label>
                  <Select value={formData.nature} onValueChange={(value) => handleInputChange("nature", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your business type" />
                    </SelectTrigger>
                    <SelectContent>
                      {companyNatures.map((nature) => (
                        <SelectItem key={nature} value={nature}>
                          {nature}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex justify-end pt-4">
                  <Button onClick={handleNext} disabled={!isStep1Valid}>
                    Next
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="address">Company Address *</Label>
                  <Textarea
                    id="address"
                    value={formData.address}
                    onChange={(e) => handleInputChange("address", e.target.value)}
                    placeholder="Enter your complete company address"
                    rows={3}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => handleInputChange("city", e.target.value)}
                      placeholder="City"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">State *</Label>
                    <Input
                      id="state"
                      value={formData.state}
                      onChange={(e) => handleInputChange("state", e.target.value)}
                      placeholder="State"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pinCode">PIN Code *</Label>
                    <Input
                      id="pinCode"
                      value={formData.pinCode}
                      onChange={(e) => handleInputChange("pinCode", e.target.value)}
                      placeholder="PIN Code"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="pan">Company PAN *</Label>
                    <Input
                      id="pan"
                      value={formData.pan}
                      onChange={(e) => handleInputChange("pan", e.target.value.toUpperCase())}
                      placeholder="ABCDE1234F"
                      maxLength={10}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gstin">GSTIN</Label>
                    <Input
                      id="gstin"
                      value={formData.gstin}
                      onChange={(e) => handleInputChange("gstin", e.target.value.toUpperCase())}
                      placeholder="22ABCDE1234F1Z5"
                      maxLength={15}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tan">TAN</Label>
                    <Input
                      id="tan"
                      value={formData.tan}
                      onChange={(e) => handleInputChange("tan", e.target.value.toUpperCase())}
                      placeholder="ABCD12345E"
                      maxLength={10}
                    />
                  </div>
                </div>

                <div className="flex justify-between pt-4">
                  <Button variant="outline" onClick={handlePrevious}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Previous
                  </Button>
                  <Button onClick={handleNext} disabled={!isStep2Valid}>
                    Next
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Company Name</Label>
                      <p className="text-sm font-medium">{formData.companyName}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Nature of Business</Label>
                      <p className="text-sm font-medium">{formData.nature}</p>
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Address</Label>
                    <p className="text-sm font-medium">
                      {formData.address}, {formData.city}, {formData.state} - {formData.pinCode}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">PAN</Label>
                      <p className="text-sm font-medium">{formData.pan}</p>
                    </div>
                    {formData.gstin && (
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">GSTIN</Label>
                        <p className="text-sm font-medium">{formData.gstin}</p>
                      </div>
                    )}
                    {formData.tan && (
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">TAN</Label>
                        <p className="text-sm font-medium">{formData.tan}</p>
                      </div>
                    )}
                  </div>
                </div>

                {error && (
                  <div className="text-destructive text-sm bg-destructive/10 p-3 rounded-md">{error}</div>
                )}

                <form onSubmit={handleSubmit}>
                  <input type="hidden" name="companyName" value={formData.companyName} />
                  <input type="hidden" name="nature" value={formData.nature} />
                  <input
                    type="hidden"
                    name="address"
                    value={`${formData.address}, ${formData.city}, ${formData.state} - ${formData.pinCode}`}
                  />
                  <input type="hidden" name="pan" value={formData.pan} />
                  <input type="hidden" name="gstin" value={formData.gstin} />
                  <input type="hidden" name="tan" value={formData.tan} />

                  <div className="flex justify-between">
                    <Button type="button" variant="outline" onClick={handlePrevious}>
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Previous
                    </Button>
                    <Button type="submit" disabled={isSubmitting.current} className="bg-primary">
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Complete Setup
                    </Button>
                  </div>
                </form>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}