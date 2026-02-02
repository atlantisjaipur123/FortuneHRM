// app/api/employee-details/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getSession } from "@/app/lib/auth";
import { getCompanyId } from "@/app/lib/getCompanyid";

/* ------------------------------------------------------------------
   GET → Get single employee by ID (for editing)
-------------------------------------------------------------------*/
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const companyId = getCompanyId();
    const { id } = params;

    if (!id) {
      return NextResponse.json({ error: "Employee ID is required" }, { status: 400 });
    }

    const employee = await prisma.employee.findFirst({
      where: {
        id,
        companyId,
        deletedAt: null,
      },
      include: {
        permanentAddress: true,
        correspondenceAddress: true,
        familyMembers: true,
        nominees: true,
        witnesses: true,
        experiences: true,
        qualifications: true,
        assets: true,
      },
    });

    if (!employee) {
      return NextResponse.json({ error: "Employee not found" }, { status: 404 });
    }

    // Transform the employee data to match the frontend format
    const transformedEmployee = {
      id: employee.id,
      code: employee.code,
      name: employee.name,
      fatherHusbandName: employee.fatherHusbandName || "",
      pan: employee.pan || "",
      dob: employee.dob ? new Date(employee.dob).toISOString().split("T")[0] : "",
      doj: employee.doj ? new Date(employee.doj).toISOString().split("T")[0] : "",
      dor: employee.dor ? new Date(employee.dor).toISOString().split("T")[0] : "",
      uan: employee.uan || "",
      pfAcNo: employee.pfAcNo || "",
      email: employee.email || "",
      nasscomRegNo: employee.nasscomRegNo || "",
      gender: employee.gender || "Male",
      maritalStatus: employee.maritalStatus || "UnMarried",
      fathersName: employee.fathersName || "",
      mothersName: employee.mothersName || "",
      caste: employee.caste || "GEN",
      bloodGroup: employee.bloodGroup || "",
      nationality: employee.nationality || "Resident",
      religion: employee.religion || "Hindu",
      dateOfMarriage: employee.dateOfMarriage ? new Date(employee.dateOfMarriage).toISOString().split("T")[0] : "",
      noOfDependent: employee.noOfDependent?.toString() || "",
      spouse: employee.spouse || "",
      stdCode: employee.stdCode || "",
      phone: employee.phone || "",
      mobile: employee.mobile || "",
      internalId: employee.internalId || "",
      noticePeriodMonths: employee.noticePeriodMonths?.toString() || "",
      probationPeriodMonths: employee.probationPeriodMonths?.toString() || "",
      confirmationDate: employee.confirmationDate ? new Date(employee.confirmationDate).toISOString().split("T")[0] : "",
      resigLetterDate: employee.resigLetterDate ? new Date(employee.resigLetterDate).toISOString().split("T")[0] : "",
      resigDateLwd: employee.resigDateLwd ? new Date(employee.resigDateLwd).toISOString().split("T")[0] : "",
      resignationReason: employee.resignationReason || "",
      appraisalDate: employee.appraisalDate ? new Date(employee.appraisalDate).toISOString().split("T")[0] : "",
      dateOfDeath: employee.dateOfDeath ? new Date(employee.dateOfDeath).toISOString().split("T")[0] : "",
      commitmentCompletionDate: employee.commitmentCompletionDate ? new Date(employee.commitmentCompletionDate).toISOString().split("T")[0] : "",
      identityMark: employee.identityMark || "",
      reimbursementApplicable: employee.reimbursementApplicable || false,
      permanentAddress: employee.permanentAddress || {},
      correspondenceAddress: employee.correspondenceAddress || {},
      bankName: employee.bankName || "",
      bankBranch: employee.bankBranch || "",
      bankIfsc: employee.bankIfsc || "",
      bankAddress: employee.bankAddress || "",
      nameAsPerAc: employee.nameAsPerAc || "",
      salaryAcNumber: employee.salaryAcNumber || "",
      paymentMode: employee.paymentMode || "TRANSFER",
      acType: employee.acType || "ECS",
      bankRefNo: employee.bankRefNo || "",
      wardCircleRange: employee.wardCircleRange || "",
      licPolicyNo: employee.licPolicyNo || "",
      policyTerm: employee.policyTerm || "",
      licId: employee.licId || "",
      annualRenewableDate: employee.annualRenewableDate ? new Date(employee.annualRenewableDate).toISOString().split("T")[0] : "",
      hraApplicable: employee.hraApplicable || false,
      bonusApplicable: employee.bonusApplicable || false,
      gratuityApplicable: employee.gratuityApplicable || false,
      lwfApplicable: employee.lwfApplicable || false,
      pfApplicable: employee.pfApplicable || false,
      physicallyHandicap: employee.physicallyHandicap || "NO",
      registeredInPmrpy: employee.registeredInPmrpy || false,
      previousPfNo: employee.previousPfNo || "",
      pfJoiningDate: employee.pfJoiningDate ? new Date(employee.pfJoiningDate).toISOString().split("T")[0] : "",
      pfLastDate: employee.pfLastDate ? new Date(employee.pfLastDate).toISOString().split("T")[0] : "",
      salaryForPfOption: employee.salaryForPfOption || "",
      salaryForPf: employee.salaryForPf?.toString() || "",
      minAmtPf: employee.minAmtPf?.toString() || "",
      pensionAppl: employee.pensionAppl || false,
      pensionJoiningDate: employee.pensionJoiningDate ? new Date(employee.pensionJoiningDate).toISOString().split("T")[0] : "",
      pensionOnHigherWages: employee.pensionOnHigherWages || false,
      noLimit: employee.noLimit || false,
      esiApplicable: employee.esiApplicable || false,
      esiJoiningDate: employee.esiJoiningDate ? new Date(employee.esiJoiningDate).toISOString().split("T")[0] : "",
      esiNo: employee.esiNo || "",
      esiLastDate: employee.esiLastDate ? new Date(employee.esiLastDate).toISOString().split("T")[0] : "",
      salaryForEsiOption: employee.salaryForEsiOption || "",
      salaryForEsi: employee.salaryForEsi?.toString() || "",
      minAmtEsiContribution: employee.minAmtEsiContribution?.toString() || "",
      dispensaryOrPanel: employee.dispensaryOrPanel || "",
      recruitmentAgency: employee.recruitmentAgency || "",
      bankMandate: employee.bankMandate || "",
      employmentStatus: employee.employmentStatus || "",
      lapTops: employee.lapTops || "",
      companyVehicle: employee.companyVehicle || "",
      corpCreditCardNo: employee.corpCreditCardNo || "",
      transportRoute: employee.transportRoute || "",
      workLocation: employee.workLocation || "",
      assets: employee.assets || [],
      qualifications: employee.qualifications || [],
      reasonForLeaving: employee.reasonForLeaving || "",
      service: employee.service || "",
      remarks: employee.remarks || "",
      familyMembers: employee.familyMembers || [],
      nominees: employee.nominees || [],
      witnesses: employee.witnesses || [],
      previousYears: "",
      previousMonths: "",
      experiences: employee.experiences || [],
      branch: employee.branch || "",
      category: employee.category || "",
      designation: employee.designation || "",
      department: employee.department || "",
      level: employee.scale || "",
      ptGroup: employee.ptGroup || "",
      shift: employee.shiftId || "",
    };

    return NextResponse.json({ success: true, employee: transformedEmployee });
  } catch (error: any) {
    console.error("Error in GET /api/employee-details/[id]:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const companyId = getCompanyId();
    const { id } = params;
    console.log("DELETE DEBUG →", {
      id,
      companyId,
    });

    if (!id) {
      return NextResponse.json({ error: "Employee ID is required" }, { status: 400 });
    }

    // Atomic update + company scoping
    const result = await prisma.employee.updateMany({
      where: { id, deletedAt: null },
      data: { deletedAt: new Date(), updatedBy: session.id },
    });

    if (result.count === 0) {
      // nothing updated → either not found or already deleted / not in this company
      return NextResponse.json({ error: "Employee not found" }, { status: 404 });
    }

    // success — choose either 204 or 200 with JSON depending on frontend expectations.
    return new NextResponse(null, { status: 204 });
    // OR, if you prefer JSON:
    // return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error in DELETE /api/employee-details/[id]:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}