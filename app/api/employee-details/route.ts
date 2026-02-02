// app/api/employee-details/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getSession } from "@/app/lib/auth";
import { getCompanyId } from "@/app/lib/getCompanyid";
import { calculateEmployeeSalary } from "@/app/lib/calculateSalary";

/* ------------------------------------------------------------------
   GET → List employees (company scoped)
-------------------------------------------------------------------*/
export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const companyId = getCompanyId();
    const { searchParams } = new URL(req.url);

    // Filter parameters
    const branch = searchParams.get("branch");
    const department = searchParams.get("department");
    const designation = searchParams.get("designation");
    const category = searchParams.get("category");
    const level = searchParams.get("level");
    const grade = searchParams.get("grade");
    const ptGroup = searchParams.get("ptGroup");
    const shift = searchParams.get("shift");
    const includeResigned = searchParams.get("includeResigned") === "true";
    const search = searchParams.get("search");

    // Build where clause
    const where: any = {
      companyId,
      deletedAt: null,
    };

    // Apply filters
    if (branch && branch !== "all") where.branch = branch;
    if (department && department !== "all") where.department = department;
    if (designation && designation !== "all") where.designation = designation;
    if (category && category !== "all") where.category = category;
    if (level && level !== "all") where.scale = level;
    if (grade && grade !== "all") where.grade = grade;
    if (ptGroup && ptGroup !== "all") where.ptGroup = ptGroup;
    if (shift && shift !== "all") where.shiftId = shift;  // Fixed: use shiftId not shift


    // Filter resigned employees
    if (!includeResigned) {
      where.dor = null;
    }

    // Search filter
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { code: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { pan: { contains: search, mode: "insensitive" } },
      ];
    }

    const employees = await prisma.employee.findMany({
      where,
      include: {
        permanentAddress: true,
        correspondenceAddress: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, employees });
  } catch (error: any) {
    console.error("Error in GET /api/employee-details:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

/* ------------------------------------------------------------------
   POST → Create employee
-------------------------------------------------------------------*/
export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    // if (!session) {
    //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    // }

    let companyId: string;
    try {
      companyId = getCompanyId();
    } catch (error: any) {
      return NextResponse.json(
        { error: error.message || "Company ID is required. Please select a company." },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { employee, salary } = body;

    if (!employee) {
      return NextResponse.json({ error: "Employee data is required" }, { status: 400 });
    }

    // Validate required fields - only code is mandatory
    if (!employee.code || employee.code.trim() === "") {
      return NextResponse.json(
        { error: "Employee code is required" },
        { status: 400 }
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      // Check if employee code already exists
      const existing = await tx.employee.findFirst({
        where: {
          companyId,
          code: employee.code,
          deletedAt: null,
        },
      });

      if (existing) {
        throw new Error("Employee code already exists");
      }

      // Handle addresses
      let permanentAddressId = null;
      let correspondenceAddressId = null;

      if (employee.permanentAddress && Object.keys(employee.permanentAddress).length > 0) {
        const permanentAddr = await tx.address.create({
          data: employee.permanentAddress,
        });
        permanentAddressId = permanentAddr.id;
      }

      if (employee.correspondenceAddress && Object.keys(employee.correspondenceAddress).length > 0) {
        const correspondenceAddr = await tx.address.create({
          data: employee.correspondenceAddress,
        });
        correspondenceAddressId = correspondenceAddr.id;
      }

      // Helper function to convert undefined to null for Prisma
      const toNull = (value: any) => (value === undefined || value === "") ? null : value;
      const toDate = (value: any) => (value && value !== "") ? new Date(value) : null;
      const toInt = (value: any) => {
        if (value === undefined || value === "" || value === null) return null;
        const parsed = parseInt(value);
        return isNaN(parsed) ? null : parsed;
      };

      // Prepare employee data - convert undefined to null for optional fields
      const employeeData: any = {
        companyId,
        code: employee.code,
        name: employee.name || "",
        fatherHusbandName: toNull(employee.fatherHusbandName),
        pan: toNull(employee.pan),
        aadhaar: toNull(employee.aadhaar),
        uan: toNull(employee.uan),
        pfAcNo: toNull(employee.pfAcNo),
        esiNo: toNull(employee.esiNo),
        email: toNull(employee.email),
        nasscomRegNo: toNull(employee.nasscomRegNo),
        gender: employee.gender || "MALE",
        maritalStatus: employee.maritalStatus || "UNMARRIED",
        dob: toDate(employee.dob),
        doj: employee.doj ? new Date(employee.doj) : new Date(),
        dor: toDate(employee.dor),
        dateOfMarriage: toDate(employee.dateOfMarriage),
        fathersName: toNull(employee.fathersName),
        mothersName: toNull(employee.mothersName),
        caste: toNull(employee.caste),
        bloodGroup: toNull(employee.bloodGroup),
        nationality: toNull(employee.nationality),
        religion: toNull(employee.religion),
        noOfDependent: toInt(employee.noOfDependent),
        spouse: toNull(employee.spouse),
        photo: toNull(employee.photo),
        physicallyHandicap: toNull(employee.physicallyHandicap),
        registeredInPmrpy: employee.registeredInPmrpy || false,
        emergencyContact: toNull(employee.emergencyContact),
        emergencyPhone: toNull(employee.emergencyPhone),
        permanentAddressId,
        correspondenceAddressId,
        stdCode: toNull(employee.stdCode),
        phone: toNull(employee.phone),
        mobile: toNull(employee.mobile),
        internalId: toNull(employee.internalId),
        scale: toNull(employee.scale || employee.level),
        ptGroup: toNull(employee.ptGroup),
        noticePeriodMonths: toInt(employee.noticePeriodMonths),
        probationPeriodMonths: toInt(employee.probationPeriodMonths),
        confirmationDate: toDate(employee.confirmationDate),
        resigLetterDate: toDate(employee.resigLetterDate),
        resigDateLwd: toDate(employee.resigDateLwd),
        resignationReason: toNull(employee.resignationReason),
        appraisalDate: toDate(employee.appraisalDate),
        commitmentCompletionDate: toDate(employee.commitmentCompletionDate),
        dateOfDeath: toDate(employee.dateOfDeath),
        identityMark: toNull(employee.identityMark),
        reimbursementApplicable: employee.reimbursementApplicable || false,
        branch: toNull(employee.branch),
        department: toNull(employee.department),
        designation: toNull(employee.designation),
        level: toNull(employee.level),
        grade: toNull(employee.grade),
        category: toNull(employee.category),
        attendanceType: toNull(employee.attendanceType),
        shiftId: toNull(employee.shiftId),
        bankName: toNull(employee.bankName),
        bankBranch: toNull(employee.bankBranch),
        bankIfsc: toNull(employee.bankIfsc),
        bankAddress: toNull(employee.bankAddress),
        nameAsPerAc: toNull(employee.nameAsPerAc),
        salaryAcNumber: toNull(employee.salaryAcNumber),
        paymentMode: employee.paymentMode || "TRANSFER",
        acType: employee.acType || "ECS",
        bankRefNo: toNull(employee.bankRefNo),
        wardCircleRange: toNull(employee.wardCircleRange),
        licPolicyNo: toNull(employee.licPolicyNo),
        policyTerm: toNull(employee.policyTerm),
        licId: toNull(employee.licId),
        annualRenewableDate: toDate(employee.annualRenewableDate),
        hraApplicable: employee.hraApplicable || false,
        bonusApplicable: employee.bonusApplicable || false,
        gratuityApplicable: employee.gratuityApplicable || false,
        lwfApplicable: employee.lwfApplicable || false,
        pfApplicable: employee.pfApplicable || false,
        pfJoiningDate: toDate(employee.pfJoiningDate),
        pfLastDate: toDate(employee.pfLastDate),
        previousPfNo: toNull(employee.previousPfNo),
        salaryForPfOption: toNull(employee.salaryForPfOption),
        salaryForPf: employee.salaryForPf ? parseFloat(employee.salaryForPf) : null,
        minAmtPf: employee.minAmtPf ? parseFloat(employee.minAmtPf) : null,
        pensionAppl: employee.pensionAppl || false,
        pensionJoiningDate: toDate(employee.pensionJoiningDate),
        pensionOnHigherWages: employee.pensionOnHigherWages || false,
        noLimit: employee.noLimit || false,
        esiApplicable: employee.esiApplicable || false,
        esiJoiningDate: toDate(employee.esiJoiningDate),
        esiLastDate: toDate(employee.esiLastDate),
        salaryForEsiOption: toNull(employee.salaryForEsiOption),
        salaryForEsi: employee.salaryForEsi ? parseFloat(employee.salaryForEsi) : null,
        minAmtEsiContribution: employee.minAmtEsiContribution ? parseFloat(employee.minAmtEsiContribution) : null,
        dispensaryOrPanel: toNull(employee.dispensaryOrPanel),
        recruitmentAgency: toNull(employee.recruitmentAgency),
        bankMandate: toNull(employee.bankMandate),
        employmentStatus: employee.employmentStatus || "ACTIVE",
        lapTops: toNull(employee.lapTops),
        companyVehicle: toNull(employee.companyVehicle),
        corpCreditCardNo: toNull(employee.corpCreditCardNo),
        transportRoute: toNull(employee.transportRoute),
        workLocation: toNull(employee.workLocation),
        reasonForLeaving: toNull(employee.reasonForLeaving),
        service: toNull(employee.service),
        remarks: toNull(employee.remarks),
        createdBy: session.id,
      };

      // Create employee
      const createdEmployee = await tx.employee.create({
        data: employeeData,
        include: {
          permanentAddress: true,
          correspondenceAddress: true,
        },
      });

      // If salary is provided, calculate and save it
      // If salary is provided, calculate and save it
      let salaryResult = null;
      if (salary && salary.mode && salary.inputAmount !== undefined) {
        const salaryMode = String(salary.mode).toUpperCase();
        if (salaryMode !== "CTC" && salaryMode !== "GROSS") {
          throw new Error(`Invalid salary mode: ${salary.mode}. Must be "CTC" or "GROSS"`);
        }

        const inputAmount = Number(salary.inputAmount);
        if (isNaN(inputAmount) || inputAmount <= 0) {
          throw new Error("Invalid salary amount. Must be a positive number");
        }

        const selectedHeadIds = Array.isArray(salary.selectedHeadIds)
          ? salary.selectedHeadIds
          : [];

        salaryResult = await calculateEmployeeSalary({
          tx,
          companyId,
          employeeId: createdEmployee.id,
          salary: {
            mode: salaryMode as "CTC" | "GROSS",
            inputAmount,
            selectedHeadIds, // ← CAN BE EMPTY
          },
        });
      }


      return {
        employee: createdEmployee,
        salary: salaryResult,
      };
    });

    return NextResponse.json({ success: true, ...result });
  } catch (error: any) {
    console.error("Error in POST /api/employee-details:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

/* ------------------------------------------------------------------
   PUT → Update employee
-------------------------------------------------------------------*/
export async function PUT(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let companyId: string;
    try {
      companyId = getCompanyId();
    } catch (error: any) {
      return NextResponse.json(
        { error: error.message || "Company ID is required. Please select a company." },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { id, employee, salary } = body;

    if (!id) {
      return NextResponse.json({ error: "Employee ID is required" }, { status: 400 });
    }

    if (!employee) {
      return NextResponse.json({ error: "Employee data is required" }, { status: 400 });
    }

    const result = await prisma.$transaction(async (tx) => {
      // Check if employee exists and belongs to company
      const existing = await tx.employee.findFirst({
        where: {
          id,
          companyId,
          deletedAt: null,
        },
      });

      if (!existing) {
        throw new Error("Employee not found");
      }

      // Check if code is being changed and if new code already exists
      if (employee.code && employee.code !== existing.code) {
        const codeExists = await tx.employee.findFirst({
          where: {
            companyId,
            code: employee.code,
            id: { not: id },
            deletedAt: null,
          },
        });

        if (codeExists) {
          throw new Error("Employee code already exists");
        }
      }

      // Handle addresses
      let permanentAddressId = existing.permanentAddressId;
      let correspondenceAddressId = existing.correspondenceAddressId;

      if (employee.permanentAddress) {
        if (permanentAddressId) {
          await tx.address.update({
            where: { id: permanentAddressId },
            data: employee.permanentAddress,
          });
        } else if (Object.keys(employee.permanentAddress).length > 0) {
          const permanentAddr = await tx.address.create({
            data: employee.permanentAddress,
          });
          permanentAddressId = permanentAddr.id;
        }
      }

      if (employee.correspondenceAddress) {
        if (correspondenceAddressId) {
          await tx.address.update({
            where: { id: correspondenceAddressId },
            data: employee.correspondenceAddress,
          });
        } else if (Object.keys(employee.correspondenceAddress).length > 0) {
          const correspondenceAddr = await tx.address.create({
            data: employee.correspondenceAddress,
          });
          correspondenceAddressId = correspondenceAddr.id;
        }
      }

      // Helper functions for PUT route
      const toNull = (value: any) => (value === undefined || value === "") ? null : value;
      const toDate = (value: any) => (value && value !== "") ? new Date(value) : null;
      const toInt = (value: any) => {
        if (value === undefined || value === "" || value === null) return null;
        const parsed = parseInt(value);
        return isNaN(parsed) ? null : parsed;
      };

      // Prepare update data - only include fields that are provided
      const updateData: any = {
        updatedBy: session.id,
      };

      // Update code if provided
      if (employee.code !== undefined) updateData.code = employee.code;
      if (employee.name !== undefined) updateData.name = employee.name || "";

      // Update optional fields only if they are provided (including null)
      if (employee.fatherHusbandName !== undefined) updateData.fatherHusbandName = toNull(employee.fatherHusbandName);
      if (employee.pan !== undefined) updateData.pan = toNull(employee.pan);
      if (employee.aadhaar !== undefined) updateData.aadhaar = toNull(employee.aadhaar);
      if (employee.uan !== undefined) updateData.uan = toNull(employee.uan);
      if (employee.pfAcNo !== undefined) updateData.pfAcNo = toNull(employee.pfAcNo);
      if (employee.esiNo !== undefined) updateData.esiNo = toNull(employee.esiNo);
      if (employee.email !== undefined) updateData.email = toNull(employee.email);
      if (employee.nasscomRegNo !== undefined) updateData.nasscomRegNo = toNull(employee.nasscomRegNo);
      if (permanentAddressId !== undefined) updateData.permanentAddressId = permanentAddressId;
      if (correspondenceAddressId !== undefined) updateData.correspondenceAddressId = correspondenceAddressId;

      // Update dates
      if (employee.dob !== undefined) updateData.dob = toDate(employee.dob);
      if (employee.doj !== undefined) updateData.doj = employee.doj ? new Date(employee.doj) : undefined;
      if (employee.dor !== undefined) updateData.dor = toDate(employee.dor);
      if (employee.dateOfMarriage !== undefined) updateData.dateOfMarriage = toDate(employee.dateOfMarriage);

      // Update other fields
      if (employee.gender) updateData.gender = employee.gender;
      if (employee.maritalStatus) updateData.maritalStatus = employee.maritalStatus;
      if (employee.fathersName !== undefined) updateData.fathersName = toNull(employee.fathersName);
      if (employee.mothersName !== undefined) updateData.mothersName = toNull(employee.mothersName);
      if (employee.caste !== undefined) updateData.caste = toNull(employee.caste);
      if (employee.bloodGroup !== undefined) updateData.bloodGroup = toNull(employee.bloodGroup);
      if (employee.nationality !== undefined) updateData.nationality = toNull(employee.nationality);
      if (employee.religion !== undefined) updateData.religion = toNull(employee.religion);
      if (employee.noOfDependent !== undefined) updateData.noOfDependent = toInt(employee.noOfDependent);
      if (employee.spouse !== undefined) updateData.spouse = toNull(employee.spouse);
      if (employee.photo !== undefined) updateData.photo = toNull(employee.photo);
      if (employee.physicallyHandicap !== undefined) updateData.physicallyHandicap = toNull(employee.physicallyHandicap);
      if (employee.registeredInPmrpy !== undefined) updateData.registeredInPmrpy = employee.registeredInPmrpy;
      if (employee.emergencyContact !== undefined) updateData.emergencyContact = toNull(employee.emergencyContact);
      if (employee.emergencyPhone !== undefined) updateData.emergencyPhone = toNull(employee.emergencyPhone);
      if (employee.stdCode !== undefined) updateData.stdCode = toNull(employee.stdCode);
      if (employee.phone !== undefined) updateData.phone = toNull(employee.phone);
      if (employee.mobile !== undefined) updateData.mobile = toNull(employee.mobile);
      if (employee.internalId !== undefined) updateData.internalId = toNull(employee.internalId);
      if (employee.scale !== undefined) updateData.scale = toNull(employee.scale || employee.level);
      if (employee.level !== undefined) updateData.level = toNull(employee.level);
      if (employee.ptGroup !== undefined) updateData.ptGroup = toNull(employee.ptGroup);
      if (employee.noticePeriodMonths !== undefined) updateData.noticePeriodMonths = toInt(employee.noticePeriodMonths);
      if (employee.probationPeriodMonths !== undefined) updateData.probationPeriodMonths = toInt(employee.probationPeriodMonths);
      if (employee.confirmationDate !== undefined) updateData.confirmationDate = toDate(employee.confirmationDate);
      if (employee.resigLetterDate !== undefined) updateData.resigLetterDate = toDate(employee.resigLetterDate);
      if (employee.resigDateLwd !== undefined) updateData.resigDateLwd = toDate(employee.resigDateLwd);
      if (employee.resignationReason !== undefined) updateData.resignationReason = toNull(employee.resignationReason);
      if (employee.appraisalDate !== undefined) updateData.appraisalDate = toDate(employee.appraisalDate);
      if (employee.commitmentCompletionDate !== undefined) updateData.commitmentCompletionDate = toDate(employee.commitmentCompletionDate);
      if (employee.dateOfDeath !== undefined) updateData.dateOfDeath = toDate(employee.dateOfDeath);
      if (employee.identityMark !== undefined) updateData.identityMark = toNull(employee.identityMark);
      if (employee.reimbursementApplicable !== undefined) updateData.reimbursementApplicable = employee.reimbursementApplicable;
      if (employee.branch !== undefined) updateData.branch = toNull(employee.branch);
      if (employee.department !== undefined) updateData.department = toNull(employee.department);
      if (employee.designation !== undefined) updateData.designation = toNull(employee.designation);
      if (employee.grade !== undefined) updateData.grade = toNull(employee.grade);
      if (employee.category !== undefined) updateData.category = toNull(employee.category);
      if (employee.attendanceType !== undefined) updateData.attendanceType = toNull(employee.attendanceType);
      if (employee.shiftId !== undefined) updateData.shiftId = toNull(employee.shiftId);
      if (employee.bankName !== undefined) updateData.bankName = toNull(employee.bankName);
      if (employee.bankBranch !== undefined) updateData.bankBranch = toNull(employee.bankBranch);
      if (employee.bankIfsc !== undefined) updateData.bankIfsc = toNull(employee.bankIfsc);
      if (employee.bankAddress !== undefined) updateData.bankAddress = toNull(employee.bankAddress);
      if (employee.nameAsPerAc !== undefined) updateData.nameAsPerAc = toNull(employee.nameAsPerAc);
      if (employee.salaryAcNumber !== undefined) updateData.salaryAcNumber = toNull(employee.salaryAcNumber);
      if (employee.paymentMode !== undefined) updateData.paymentMode = employee.paymentMode;
      if (employee.acType !== undefined) updateData.acType = employee.acType;
      if (employee.bankRefNo !== undefined) updateData.bankRefNo = toNull(employee.bankRefNo);
      if (employee.wardCircleRange !== undefined) updateData.wardCircleRange = toNull(employee.wardCircleRange);
      if (employee.licPolicyNo !== undefined) updateData.licPolicyNo = toNull(employee.licPolicyNo);
      if (employee.policyTerm !== undefined) updateData.policyTerm = toNull(employee.policyTerm);
      if (employee.licId !== undefined) updateData.licId = toNull(employee.licId);
      if (employee.annualRenewableDate !== undefined) updateData.annualRenewableDate = toDate(employee.annualRenewableDate);
      if (employee.hraApplicable !== undefined) updateData.hraApplicable = employee.hraApplicable;
      if (employee.bonusApplicable !== undefined) updateData.bonusApplicable = employee.bonusApplicable;
      if (employee.gratuityApplicable !== undefined) updateData.gratuityApplicable = employee.gratuityApplicable;
      if (employee.lwfApplicable !== undefined) updateData.lwfApplicable = employee.lwfApplicable;
      if (employee.pfApplicable !== undefined) updateData.pfApplicable = employee.pfApplicable;
      if (employee.pfJoiningDate !== undefined) updateData.pfJoiningDate = toDate(employee.pfJoiningDate);
      if (employee.pfLastDate !== undefined) updateData.pfLastDate = toDate(employee.pfLastDate);
      if (employee.previousPfNo !== undefined) updateData.previousPfNo = toNull(employee.previousPfNo);
      if (employee.salaryForPfOption !== undefined) updateData.salaryForPfOption = toNull(employee.salaryForPfOption);
      if (employee.salaryForPf !== undefined) updateData.salaryForPf = employee.salaryForPf ? parseFloat(employee.salaryForPf) : null;
      if (employee.minAmtPf !== undefined) updateData.minAmtPf = employee.minAmtPf ? parseFloat(employee.minAmtPf) : null;
      if (employee.pensionAppl !== undefined) updateData.pensionAppl = employee.pensionAppl;
      if (employee.pensionJoiningDate !== undefined) updateData.pensionJoiningDate = toDate(employee.pensionJoiningDate);
      if (employee.pensionOnHigherWages !== undefined) updateData.pensionOnHigherWages = employee.pensionOnHigherWages;
      if (employee.noLimit !== undefined) updateData.noLimit = employee.noLimit;
      if (employee.esiApplicable !== undefined) updateData.esiApplicable = employee.esiApplicable;
      if (employee.esiJoiningDate !== undefined) updateData.esiJoiningDate = toDate(employee.esiJoiningDate);
      if (employee.esiLastDate !== undefined) updateData.esiLastDate = toDate(employee.esiLastDate);
      if (employee.salaryForEsiOption !== undefined) updateData.salaryForEsiOption = toNull(employee.salaryForEsiOption);
      if (employee.salaryForEsi !== undefined) updateData.salaryForEsi = employee.salaryForEsi ? parseFloat(employee.salaryForEsi) : null;
      if (employee.minAmtEsiContribution !== undefined) updateData.minAmtEsiContribution = employee.minAmtEsiContribution ? parseFloat(employee.minAmtEsiContribution) : null;
      if (employee.dispensaryOrPanel !== undefined) updateData.dispensaryOrPanel = toNull(employee.dispensaryOrPanel);
      if (employee.recruitmentAgency !== undefined) updateData.recruitmentAgency = toNull(employee.recruitmentAgency);
      if (employee.bankMandate !== undefined) updateData.bankMandate = toNull(employee.bankMandate);
      if (employee.employmentStatus !== undefined) updateData.employmentStatus = employee.employmentStatus;
      if (employee.lapTops !== undefined) updateData.lapTops = toNull(employee.lapTops);
      if (employee.companyVehicle !== undefined) updateData.companyVehicle = toNull(employee.companyVehicle);
      if (employee.corpCreditCardNo !== undefined) updateData.corpCreditCardNo = toNull(employee.corpCreditCardNo);
      if (employee.transportRoute !== undefined) updateData.transportRoute = toNull(employee.transportRoute);
      if (employee.workLocation !== undefined) updateData.workLocation = toNull(employee.workLocation);
      if (employee.reasonForLeaving !== undefined) updateData.reasonForLeaving = toNull(employee.reasonForLeaving);
      if (employee.service !== undefined) updateData.service = toNull(employee.service);
      if (employee.remarks !== undefined) updateData.remarks = toNull(employee.remarks);

      // Update employee
      const updatedEmployee = await tx.employee.update({
        where: { id },
        data: updateData,
        include: {
          permanentAddress: true,
          correspondenceAddress: true,
        },
      });

      // Update salary if provided
      // Update salary if provided
      let salaryResult = null;
      if (salary && salary.mode && salary.inputAmount !== undefined) {
        const salaryMode = String(salary.mode).toUpperCase();
        if (salaryMode !== "CTC" && salaryMode !== "GROSS") {
          throw new Error(`Invalid salary mode: ${salary.mode}. Must be "CTC" or "GROSS"`);
        }

        const inputAmount = Number(salary.inputAmount);
        if (isNaN(inputAmount) || inputAmount <= 0) {
          throw new Error("Invalid salary amount. Must be a positive number");
        }

        const selectedHeadIds = Array.isArray(salary.selectedHeadIds)
          ? salary.selectedHeadIds
          : [];

        // Delete old salary
        await tx.employeeSalaryHead.deleteMany({
          where: { employeeId: id },
        });

        const existingConfig = await (tx as any).employeeSalaryConfig.findFirst({
          where: { employeeId: id },
        });
        if (existingConfig) {
          await (tx as any).employeeSalaryConfig.delete({
            where: { id: existingConfig.id },
          });
        }

        salaryResult = await calculateEmployeeSalary({
          tx,
          companyId,
          employeeId: id,
          salary: {
            mode: salaryMode as "CTC" | "GROSS",
            inputAmount,
            selectedHeadIds, // ← CAN BE EMPTY
          },
        });
      }


      return {
        employee: updatedEmployee,
        salary: salaryResult,
      };
    });

    return NextResponse.json({ success: true, ...result });
  } catch (error: any) {
    console.error("Error in PUT /api/employee-details:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

/* ------------------------------------------------------------------
   DELETE → Soft delete employee
-------------------------------------------------------------------*/
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

    if (!id) {
      return NextResponse.json({ error: "Employee ID is required" }, { status: 400 });
    }

    const existing = await prisma.employee.findFirst({
      where: {
        id,
        companyId,
        deletedAt: null,
      },
    });

    if (!existing) {
      return NextResponse.json({ error: "Employee not found" }, { status: 404 });
    }

    await prisma.employee.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        updatedBy: session.id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error in DELETE /api/employee-details/[id]:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
