import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardDescription, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Building2, AlertCircle } from "lucide-react"
import Link from "next/link"
import { signupAction } from "@/app/actions/auth"
import { getSession } from "@/app/lib/auth"
import { redirect } from "next/navigation"

export default async function SignUpPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  // Redirect if already logged in
  const session = await getSession()
  if (session) {
    if (session.role === "super_admin") {
      redirect("/super-admin")
    } else if (session.companyId) {
      redirect("/dashboard")
    } else {
      redirect("/onboarding")
    }
  }

  const { error } = await searchParams

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* Logo */}
        <div className="flex items-center justify-center space-x-2 mb-8">
          <Building2 className="h-8 w-8 text-primary" />
          <span className="text-2xl font-bold text-foreground">HRPro</span>
        </div>

        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Create your account</CardTitle>
            <CardDescription>Get started with your free trial today</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <div className="flex items-center space-x-2 text-destructive text-sm bg-destructive/10 p-3 rounded-md">
                <AlertCircle className="h-4 w-4" />
                <span>{error}</span>
              </div>
            )}

            <form action={async (formData) => {
              'use server'
              try {
                await signupAction(formData)
              } catch (error) {
                redirect(`/signup?error=${encodeURIComponent(error instanceof Error ? error.message : 'Signup failed')}`)
              }
            }} className="grid grid-cols-2 gap-4">
              {/* User Info Section */}
              <div className="space-y-2 col-span-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input id="name" name="name" type="text" placeholder="Enter your full name" required />
              </div>
              <div className="space-y-2 col-span-2">
                <Label htmlFor="email">Email *</Label>
                <Input id="email" name="email" type="email" placeholder="Enter your email" required />
              </div>
              <div className="space-y-2 col-span-2">
                <Label htmlFor="password">Password *</Label>
                <Input id="password" name="password" type="password" placeholder="Enter your password" required />
              </div>

              {/* Company Info Section */}
              <div className="space-y-2">
                <Label htmlFor="gstin">GSTIN</Label>
                <Input id="gstin" name="gstin" type="text" placeholder="Enter GSTIN" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cin">CIN</Label>
                <Input id="cin" name="cin" type="text" placeholder="Enter CIN" />
              </div>
              <div className="space-y-2 col-span-2">
                <Label>Type of Deductor</Label>
                <div className="flex items-center space-x-4">
                  <label className="flex items-center space-x-2">
                    <Input id="deductorGov" name="deductorType" type="radio" value="Gov" className="w-4 h-4" />
                    <span>Gov.</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <Input id="deductorUnionGov" name="deductorType" type="radio" value="UnionGov" className="w-4 h-4" />
                    <span>Union Govt.</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <Input id="deductorOthers" name="deductorType" type="radio" value="Others" className="w-4 h-4" />
                    <span>Others</span>
                  </label>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="paoCode">PAO Code</Label>
                <Input id="paoCode" name="paoCode" type="text" placeholder="Enter PAO Code" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ministryName">Ministry Name</Label>
                <Input id="ministryName" name="ministryName" type="text" placeholder="Enter Ministry Name" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="paoRegNo">PAO Reg. No.</Label>
                <Input id="paoRegNo" name="paoRegNo" type="text" placeholder="Enter PAO Reg. No." />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tdsCircle">TDS Circle</Label>
                <Input id="tdsCircle" name="tdsCircle" type="text" placeholder="Enter TDS Circle" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ain">AIN of PAO/TDO/CDDO</Label>
                <Input id="ain" name="ain" type="text" placeholder="Enter AIN" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="labourId">Labour Identification No.</Label>
                <Input id="labourId" name="labourId" type="text" placeholder="Enter Labour Identification No." />
              </div>
              <div className="space-y-2">
                <Label htmlFor="code">Code</Label>
                <Input id="code" name="code" type="text" placeholder="Enter Code" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="flat">Flat</Label>
                <Input id="flat" name="flat" type="text" placeholder="Enter Flat" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="road">Road/Street/Lane</Label>
                <Input id="road" name="road" type="text" placeholder="Enter Road/Street/Lane" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="town">Town/City/District</Label>
                <Input id="town" name="town" type="text" placeholder="Enter Town/City/District" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pan">PAN</Label>
                <Input id="pan" name="pan" type="text" placeholder="Enter PAN" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="regYear">Reg. Year - Reg. No.</Label>
                <Input id="regYear" name="regYear" type="text" placeholder="Enter Reg. Year - Reg. No." />
              </div>
              <div className="space-y-2">
                <Label htmlFor="natureOfCompany">Nature of Company</Label>
                <Input id="natureOfCompany" name="natureOfCompany" type="text" placeholder="Enter Nature of Company" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="emailCompany">E-Mail</Label>
                <Input id="emailCompany" name="emailCompany" type="email" placeholder="Enter E-Mail" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="codeNoEPF">Code No. Allotted by EPF</Label>
                <Input id="codeNoEPF" name="codeNoEPF" type="text" placeholder="Enter Code No. Allotted by EPF" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pfCoverageDate">PF Coverage Date</Label>
                <Input id="pfCoverageDate" name="pfCoverageDate" type="date" placeholder="Enter PF Coverage Date" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="esiNumber">ESI Number</Label>
                <Input id="esiNumber" name="esiNumber" type="text" placeholder="Enter ESI Number" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ptRegCertificateNo">PT Reg. Certificate No.</Label>
                <Input id="ptRegCertificateNo" name="ptRegCertificateNo" type="text" placeholder="Enter PT Reg. Certificate No." />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ptEnrCertificateNo">PT Enr. Certificate No.</Label>
                <Input id="ptEnrCertificateNo" name="ptEnrCertificateNo" type="text" placeholder="Enter PT Enr. Certificate No." />
              </div>
              <div className="space-y-2">
                <Label htmlFor="leaveSetupType">Leave Setup Type</Label>
                <Input id="leaveSetupType" name="leaveSetupType" value="FINANCIAL-YEAR-WISE" readOnly />
              </div>
              <div className="space-y-2">
                <Label htmlFor="employeeListOrder">Employee List Order</Label>
                <Input id="employeeListOrder" name="employeeListOrder" value="NAME" readOnly />
              </div>

              {/* Authorised Person Details Section */}
              <div className="space-y-2">
                <Label htmlFor="authorisedPersonName">Authorised Person Name</Label>
                <Input id="authorisedPersonName" name="authorisedPersonName" type="text" placeholder="Enter Authorised Person Name" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">Date of Birth</Label>
                <Input id="dateOfBirth" name="dateOfBirth" type="date" placeholder="Enter Date of Birth" required />
              </div>
              <div className="space-y-2 col-span-2">
                <Label>Sex</Label>
                <div className="flex items-center space-x-4">
                  <label className="flex items-center space-x-2">
                    <Input id="sexMale" name="sex" type="radio" value="Male" className="w-4 h-4" />
                    <span>Male</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <Input id="sexFemale" name="sex" type="radio" value="Female" className="w-4 h-4" />
                    <span>Female</span>
                  </label>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="premiseBuilding">Premise/Building</Label>
                <Input id="premiseBuilding" name="premiseBuilding" type="text" placeholder="Enter Premise/Building" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="areaLocation">Area/Location</Label>
                <Input id="areaLocation" name="areaLocation" type="text" placeholder="Enter Area/Location" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pinState">PIN - State</Label>
                <Input id="pinState" name="pinState" type="text" placeholder="Enter PIN - State" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="stdCodePhone">STD Code - Phone No.</Label>
                <Input id="stdCodePhone" name="stdCodePhone" type="text" placeholder="Enter STD Code - Phone No." required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="designation">Designation</Label>
                <Input id="designation" name="designation" type="text" placeholder="Enter Designation" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fatherName">Father's Name</Label>
                <Input id="fatherName" name="fatherName" type="text" placeholder="Enter Father's Name" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="flatAuth">Flat</Label>
                <Input id="flatAuth" name="flatAuth" type="text" placeholder="Enter Flat" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="roadAuth">Road/Street/Lane</Label>
                <Input id="roadAuth" name="roadAuth" type="text" placeholder="Enter Road/Street/Lane" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="townAuth">Town/City/District</Label>
                <Input id="townAuth" name="townAuth" type="text" placeholder="Enter Town/City/District" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="panAuth">PAN</Label>
                <Input id="panAuth" name="panAuth" type="text" placeholder="Enter PAN" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="emailAuth">E-Mail</Label>
                <Input id="emailAuth" name="emailAuth" type="email" placeholder="Enter E-Mail" />
              </div>

              {/* Additional Details Section */}
              <div className="space-y-2">
                <Label htmlFor="ddoCode">DDO Code</Label>
                <Input id="ddoCode" name="ddoCode" type="text" placeholder="Enter DDO Code" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                <Input id="state" name="state" type="text" placeholder="Enter State" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ddoRegNo">DDO Reg. No.</Label>
                <Input id="ddoRegNo" name="ddoRegNo" type="text" placeholder="Enter DDO Reg. No." />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tanRegNo">TAN Reg. No.</Label>
                <Input id="tanRegNo" name="tanRegNo" type="text" placeholder="Enter TAN Reg. No." />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lwfRegNo">LWF Reg. No.</Label>
                <Input id="lwfRegNo" name="lwfRegNo" type="text" placeholder="Enter LWF Reg. No." />
              </div>
              <div className="space-y-2">
                <Label htmlFor="branchDivision">Branch/Division</Label>
                <Input id="branchDivision" name="branchDivision" type="text" placeholder="Enter Branch/Division" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nameAdd">Name</Label>
                <Input id="nameAdd" name="nameAdd" type="text" placeholder="Enter Name" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="areaLocationAdd">Area/Location</Label>
                <Input id="areaLocationAdd" name="areaLocationAdd" type="text" placeholder="Enter Area/Location" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pinStateAdd">PIN - State</Label>
                <Input id="pinStateAdd" name="pinStateAdd" type="text" placeholder="Enter PIN - State" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="natureOfBusiness">Nature of Business</Label>
                <Input id="natureOfBusiness" name="natureOfBusiness" type="text" placeholder="Enter Nature of Business" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dateOfStartingBusiness">Date of Starting Business</Label>
                <Input id="dateOfStartingBusiness" name="dateOfStartingBusiness" type="date" placeholder="Enter Date of Starting Business" />
              </div>
              <div className="space-y-2 col-span-2">
                <Label>Type of Company</Label>
                <div className="flex items-center space-x-4">
                  <label className="flex items-center space-x-2">
                    <Input id="companyGov" name="companyType" type="radio" value="Government" className="w-4 h-4" />
                    <span>Government</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <Input id="companyOthers" name="companyType" type="radio" value="Others" className="w-4 h-4" />
                    <span>Others</span>
                  </label>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="pfRegionalOffice">PF Regional Office</Label>
                <Input id="pfRegionalOffice" name="pfRegionalOffice" type="text" placeholder="Enter PF Regional Office" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pensionCoverageDate">Pension Coverage Date</Label>
                <Input id="pensionCoverageDate" name="pensionCoverageDate" type="date" placeholder="Enter Pension Coverage Date" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="esiLocalOffice">ESI Local Office</Label>
                <Input id="esiLocalOffice" name="esiLocalOffice" type="text" placeholder="Enter ESI Local Office" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ptoCircleNo">P.T.O. Circle No.</Label>
                <Input id="ptoCircleNo" name="ptoCircleNo" type="text" placeholder="Enter P.T.O. Circle No." />
              </div>
              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input id="website" name="website" type="text" placeholder="Enter Website" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="defaultAttendance">Default Attendance</Label>
                <Input id="defaultAttendance" name="defaultAttendance" value="PRESENT" readOnly />
              </div>
              <div className="space-y-2">
                <Label htmlFor="companyVisibility">Company Visibility</Label>
                <Input id="companyVisibility" name="companyVisibility" value="ALWAYS" readOnly />
              </div>

              <Button type="submit" className="w-full col-span-2" size="lg">
                Create Account
              </Button>
            </form>

            <div className="text-center text-sm text-muted-foreground col-span-2">
              Already have an account?{" "}
              <Link href="/login" className="text-primary hover:underline">
                Sign in
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}