// app/api/employee-details/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getSession } from "@/app/lib/auth";
import { getCompanyId } from "@/app/lib/getCompanyid";
import { calculateEmployeeSalary } from "@/app/lib/calculateSalary";

/* ------------------------------------------------------------------
   GET → List employees (company scoped)
-------------------------------------------------------------------*/
// Helper utilities
/* ---------------- ENUM NORMALIZER ---------------- */
const hasAddressData = (addr: any) =>
  addr && Object.values(addr).some(v => v && String(v).trim() !== "");


const toEnum = (v: any) => {
  if (v === undefined) return undefined; // do not touch missing fields
  if (v === null || v === "") return null;
  return String(v).trim().toUpperCase();
};

const toTrimmedString = (v: any): string | null => (typeof v === 'string' && v.trim()) ? v.trim() : null;
const toLowerEmail = (v: any): string | null => typeof v === 'string' ? v.trim().toLowerCase() : null;
const toDate = (v: any): Date | null => (v && !isNaN(Date.parse(v))) ? new Date(v) : null;
const toNumber = (v: any): number | null => {
  const n = Number(v);
  return isNaN(n) ? null : n;
};
const toInt = (v: any): number | null => {
  const n = Number(v);
  return (isNaN(n) || !Number.isInteger(n)) ? null : n;
};
const toBoolean = (v: any): boolean => !!v;
export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const companyId = getCompanyId();
    const { searchParams } = new URL(req.url);

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

    const where: any = {
      companyId,
      deletedAt: null,
    };

    if (branch && branch !== "all") where.branch = branch;
    if (department && department !== "all") where.department = department;
    if (designation && designation !== "all") where.designation = designation;
    if (category && category !== "all") where.category = category;
    if (level && level !== "all") where.scale = level;
    if (grade && grade !== "all") where.grade = grade;
    if (ptGroup && ptGroup !== "all") where.ptGroup = ptGroup;
    if (shift && shift !== "all") where.shiftId = shift;

    if (!includeResigned) {
      where.dor = null;
    }

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
        qualifications: true,
        experiences: true,
        familyMembers: true,
        nominees: true,
        witnesses: true,
        assets: true,
        salaryConfig: true,
      },
      orderBy: { createdAt: "desc" },
    });
    const normalizedEmployees = employees.map((emp) => ({
      ...emp,

      permanentAddress: emp.permanentAddress ?? {
        address1: "",
        address2: "",
        city: "",
        state: "",
        country: "",
        pincode: "",
      },

      correspondenceAddress: emp.correspondenceAddress ?? {
        address1: "",
        address2: "",
        city: "",
        state: "",
        country: "",
        pincode: "",
      },
    }));

    return NextResponse.json({ success: true, employees: normalizedEmployees });



  } catch (error: any) {
    console.error("Error in GET /api/employee-details:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

/* ------------------------------------------------------------------
   POST → Create employee + optional salary calculation
-------------------------------------------------------------------*/

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let companyId: string;
    try {
      companyId = getCompanyId();
      console.log("[POST] Company ID:", companyId);
    } catch (err: any) {
      return NextResponse.json(
        { error: err.message || "Company ID is required" },
        { status: 400 }
      );
    }

    const body = await req.json();
    console.log("[POST] Raw received body:", JSON.stringify(body, null, 2));

    // Support both possible structures: { employee: {...}, salary: {...} } or root-level
    const payload = body.employee || body;

    if (!payload || !payload.code?.toString().trim()) {
      return NextResponse.json(
        { error: "Employee code is required" },
        { status: 400 }
      );
    }

    const salaryInput = body.salary || payload.salary || null;

    // Read related records from body (root level), NOT from payload (body.employee)
    const qualifications = body.qualifications || payload.qualifications || [];
    const family = body.family || payload.family || [];
    const nominees = body.nominees || payload.nominees || [];
    const witnesses = body.witnesses || payload.witnesses || [];
    const experiences = body.experiences || payload.experiences || [];
    const companyAssets = body.companyAssets || payload.companyAssets || [];

    const result = await prisma.$transaction(
      async (tx) => {
        // 1. Prevent duplicate code
        const existing = await tx.employee.findFirst({
          where: { companyId, code: payload.code.trim(), deletedAt: null },
        });
        if (existing) throw new Error("Employee code already exists");

        let permanentAddressId: string | null = null;
        let correspondenceAddressId: string | null = null;

        if (hasAddressData(payload.permanentAddress)) {
          const addr = await tx.address.create({ data: payload.permanentAddress });
          permanentAddressId = addr.id;
        }
        if (hasAddressData(payload.correspondenceAddress)) {
          const addr = await tx.address.create({ data: payload.correspondenceAddress });
          correspondenceAddressId = addr.id;
        }

        const toNull = (v: any) => (v == null || v === "") ? null : v;
        const toDate = (v: any) => (v && v !== "") ? new Date(v) : null;
        const toNumber = (v: any, asInt = false) => {
          if (v == null || v === "") return null;
          const n = asInt ? parseInt(v, 10) : parseFloat(v);
          return Number.isNaN(n) ? null : n;
        };

        const employeeData: any = {
          companyId,
          code: payload.code.trim(),
          name: payload.name?.trim() || "",
          fatherHusbandName: toNull(payload.fatherHusbandName),
          pan: toNull(payload.pan?.trim()),
          aadhaar: toNull(payload.aadhaar?.trim()),
          uan: toNull(payload.uan?.trim()),
          pfAcNo: toNull(payload.pfAcNo?.trim()),
          esiNo: toNull(payload.esiNo?.trim()),
          email: toNull(payload.email?.trim()?.toLowerCase()),
          nasscomRegNo: toNull(payload.nasscomRegNo),
          gender: toEnum(payload.gender) || "MALE",
          maritalStatus: toEnum(payload.maritalStatus) || "UNMARRIED",
          dob: toDate(payload.dob),
          doj: payload.doj ? new Date(payload.doj) : new Date(),
          dor: toDate(payload.dor),
          dateOfMarriage: toDate(payload.dateOfMarriage),
          fathersName: toNull(payload.fathersName),
          mothersName: toNull(payload.mothersName),
          caste: toNull(payload.caste),
          bloodGroup: (() => {
            const bg = toNull(payload.bloodGroup);
            if (!bg) return null;
            // Normalize: "A+" → "A_POSITIVE", "AB-" → "AB_NEGATIVE"
            return bg.replace('+', '_POSITIVE').replace('-', '_NEGATIVE').toUpperCase();
          })(),
          nationality: toNull(payload.nationality),
          religion: toEnum(payload.religion),
          noOfDependent: toNumber(payload.noOfDependent, true),
          spouse: toNull(payload.spouse),
          photo: toNull(payload.photo),
          physicallyHandicap: toNull(payload.physicallyHandicap),
          registeredInPmrpy: !!payload.registeredInPmrpy,
          emergencyContact: toNull(payload.emergencyContact),
          emergencyPhone: toNull(payload.emergencyPhone),
          permanentAddressId,
          correspondenceAddressId,
          phone: toNull(payload.phone),
          mobile: toNull(payload.mobile),
          internalId: toNull(payload.internalId),
          scale: toNull(payload.scale || payload.level),
          ptGroup: toNull(payload.ptGroup),
          noticePeriodMonths: toNumber(payload.noticePeriodMonths, true),
          probationPeriodMonths: toNumber(payload.probationPeriodMonths, true),
          confirmationDate: toDate(payload.confirmationDate),
          resigLetterDate: toDate(payload.resigLetterDate),
          resigDateLwd: toDate(payload.resigDateLwd),
          resignationReason: toNull(payload.resignationReason),
          appraisalDate: toDate(payload.appraisalDate),
          commitmentCompletionDate: toDate(payload.commitmentCompletionDate),
          dateOfDeath: toDate(payload.dateOfDeath),
          identityMark: toNull(payload.identityMark),
          reimbursementApplicable: !!payload.reimbursementApplicable,
          branch: toNull(payload.branch),
          department: toNull(payload.department),
          designation: toNull(payload.designation),
          level: toNull(payload.level),
          grade: toNull(payload.grade),
          category: toNull(payload.category),
          attendanceType: toNull(payload.attendanceType),
          shiftId: toNull(payload.shiftId),
          bankName: toNull(payload.bankName),
          bankBranch: toNull(payload.bankBranch),
          bankIfsc: toNull(payload.bankIfsc),
          bankAddress: toNull(payload.bankAddress),
          nameAsPerAc: toNull(payload.nameAsPerAc),
          salaryAcNumber: toNull(payload.salaryAcNumber),
          paymentMode: toEnum(payload.paymentMode) || "TRANSFER",
          acType: toEnum(payload.acType) || "ECS",
          bankRefNo: toNull(payload.bankRefNo),
          wardCircleRange: toNull(payload.wardCircleRange),
          licPolicyNo: toNull(payload.licPolicyNo),
          policyTerm: toNull(payload.policyTerm),
          licId: toNull(payload.licId),
          annualRenewableDate: toDate(payload.annualRenewableDate),
          hraApplicable: !!payload.hraApplicable,
          bonusApplicable: !!payload.bonusApplicable,
          gratuityApplicable: !!payload.gratuityApplicable,
          lwfApplicable: !!payload.lwfApplicable,
          pfApplicable: !!payload.pfApplicable,
          pfJoiningDate: toDate(payload.pfJoiningDate),
          pfLastDate: toDate(payload.pfLastDate),
          previousPfNo: toNull(payload.previousPfNo),
          salaryForPfOption: toNull(payload.salaryForPfOption),
          salaryForPf: toNumber(payload.salaryForPf),
          minAmtPf: toNumber(payload.minAmtPf),
          pensionAppl: !!payload.pensionAppl,
          pensionJoiningDate: toDate(payload.pensionJoiningDate),
          pensionOnHigherWages: !!payload.pensionOnHigherWages,
          noLimit: !!payload.noLimit,
          esiApplicable: !!payload.esiApplicable,
          esiJoiningDate: toDate(payload.esiJoiningDate),
          esiLastDate: toDate(payload.esiLastDate),
          salaryForEsiOption: toNull(payload.salaryForEsiOption),
          salaryForEsi: toNumber(payload.salaryForEsi),
          minAmtEsiContribution: toNumber(payload.minAmtEsiContribution),
          dispensaryOrPanel: toNull(payload.dispensaryOrPanel),
          recruitmentAgency: toNull(payload.recruitmentAgency),
          bankMandate: toNull(payload.bankMandate),
          employmentStatus: toEnum(payload.employmentStatus) || "ACTIVE",
          reasonForLeaving: toNull(payload.reasonForLeaving),
          stdCode: toNull(payload.stdCode),
          lapTops: toNull(payload.lapTops),
          companyVehicle: toNull(payload.companyVehicle),
          corpCreditCardNo: toNull(payload.corpCreditCardNo),
          transportRoute: toNull(payload.transportRoute),
          workLocation: toNull(payload.workLocation),
          service: toNull(payload.service),
          remarks: toNull(payload.remarks),
          createdBy: session.id,
        };

        const createdEmployee = await tx.employee.create({
          data: employeeData,
          include: {
            permanentAddress: true,
            correspondenceAddress: true,
          },
        });

        // ── Related records with field name mapping ─────────────────────

        // Qualifications
        if (qualifications?.length) {
          await tx.qualification.createMany({
            data: qualifications
              .map((q: any) => {
                const { id, from, to, score, degreeValidityYear, uploadCertification, ...rest } = q;
                return {
                  ...rest,
                  employeeId: createdEmployee.id,
                  fromYear: from ? new Date(from).getFullYear() : null,
                  toYear: to ? new Date(to).getFullYear() : null,
                  percentage: score != null ? String(score) : null,
                  validityYear: degreeValidityYear ? toNumber(degreeValidityYear, true) : null,
                  certificate: (() => {
                    if (!uploadCertification) return null;
                    // Frontend sends { name, size, base64 } object
                    if (typeof uploadCertification === 'object' && uploadCertification.base64) {
                      return uploadCertification.base64;
                    }
                    // Backward compat: if it's already a string
                    if (typeof uploadCertification === 'string' && uploadCertification.trim()) {
                      return uploadCertification.trim();
                    }
                    return null;
                  })(),
                };
              })
              .filter((q: any) => q.college?.trim() || q.degree?.trim() || q.fromYear || q.toYear),
          });
        }

        // Family members – important rename: residing → residingWith
        if (family?.length) {
          await tx.familyMember.createMany({
            data: family
              .map((f: any) => {
                const { id, residing, ...rest } = f;
                return {
                  ...rest,
                  employeeId: createdEmployee.id,
                  residingWith: residing !== undefined ? Boolean(residing) : true,
                };
              })
              .filter((f: any) => f.name?.trim() || f.relationship?.trim()),
          });
        }

        // Experiences (expects from/to as dates)
        if (experiences?.length) {
          const validExperiences = experiences
            .filter((e: any) => (e.companyName?.trim() || e.designation?.trim()) && e.from && e.to)
            .map((e: any) => {
              const { id, ...rest } = e;
              return {
                ...rest,
                from: new Date(e.from),
                to: new Date(e.to),
                employeeId: createdEmployee.id,
              };
            });
          if (validExperiences.length > 0) {
            await tx.experience.createMany({ data: validExperiences });
          }
        }

        // Nominees
        if (nominees?.length) {
          await tx.nominee.createMany({
            data: nominees
              .map((n: any) => {
                const { id, gratuityShare, ...rest } = n;

                return {
                  ...rest,
                  employeeId: createdEmployee.id,

                  gratuityShare:
                    gratuityShare === "" ||
                      gratuityShare === undefined ||
                      gratuityShare === null
                      ? null
                      : Number(gratuityShare),
                };
              })
              .filter((n: any) => n.name?.trim() || n.relationship?.trim()),
          });
        }


        // Witnesses
        if (witnesses?.length) {
          await tx.witness.createMany({
            data: witnesses
              .map((w: any) => {
                const { id, ...rest } = w;
                return { ...rest, employeeId: createdEmployee.id };
              })
              .filter((w: any) => w.name?.trim() || w.relationship?.trim()),
          });
        }

        // Company Assets
        if (companyAssets?.length) {
          await tx.companyAsset.createMany({
            data: companyAssets
              .map((a: any) => {
                const { id, ...rest } = a;
                return { ...rest, employeeId: createdEmployee.id };
              })
              .filter((a: any) => a.particular?.trim() || a.value?.trim()),
          });
        }

        // Salary calculation
        let salaryResult = null;

        if (salaryInput?.mode && salaryInput?.inputAmount != null) {
          const mode = String(salaryInput.mode).toUpperCase();
          if (mode !== "CTC" && mode !== "GROSS") {
            throw new Error(`Invalid salary mode: ${mode}. Must be CTC or GROSS`);
          }

          const amount = Number(salaryInput.inputAmount);
          if (Number.isNaN(amount) || amount <= 0) {
            throw new Error("Salary amount must be a positive number");
          }

          salaryResult = await calculateEmployeeSalary({
            tx,
            companyId,
            employeeId: createdEmployee.id,
            salary: {
              mode: mode as "CTC" | "GROSS",
              inputAmount: amount,
              selectedHeadIds: Array.isArray(salaryInput.selectedHeadIds)
                ? salaryInput.selectedHeadIds
                : [],
            },
          });
        }

        // --- PHASE 6 & 7: LEAVE AUTO-PROVISIONING & PRORATION ---
        const currentYear = new Date().getFullYear();
        const activePolicies = await tx.leavePolicy.findMany({
          where: { companyId, isActive: true },
        });

        const leaveBalancesToCreate = [];

        for (const policy of activePolicies) {
          const app = policy.applicability as any;
          let isApplicable = true;

          if (app && !app.all) {
            const fail =
              (app.branches?.length > 0 && !app.branches.includes(createdEmployee.branch)) ||
              (app.departments?.length > 0 && !app.departments.includes(createdEmployee.department)) ||
              (app.designations?.length > 0 && !app.designations.includes(createdEmployee.designation)) ||
              (app.categories?.length > 0 && !app.categories.includes(createdEmployee.category)) ||
              (app.levels?.length > 0 && !app.levels.includes(createdEmployee.level)) ||
              (app.grades?.length > 0 && !app.grades.includes(createdEmployee.grade)) ||
              (app.attendanceTypes?.length > 0 && !app.attendanceTypes.includes(createdEmployee.attendanceType));

            if (fail) isApplicable = false;
          }

          if (isApplicable) {
            // Phase 7: Proration Logic
            const totalDaysPerYear = policy.fixedDays || policy.totalPerYear || 0;
            let allottedDays = totalDaysPerYear;

            if (createdEmployee.doj) {
              const dojDate = new Date(createdEmployee.doj);
              if (dojDate.getFullYear() === currentYear) {
                const monthsRemaining = 12 - dojDate.getMonth();
                allottedDays = (totalDaysPerYear / 12) * monthsRemaining;
                allottedDays = Math.round(allottedDays * 2) / 2; // Round to nearest 0.5
              }
            }

            leaveBalancesToCreate.push({
              companyId,
              employeeId: createdEmployee.id,
              leavePolicyId: policy.id,
              year: currentYear,
              totalAllotted: allottedDays,
              carriedOver: 0,
              used: 0,
              encashed: 0,
              lapsed: 0,
              balance: allottedDays,
            });
          }
        }

        if (leaveBalancesToCreate.length > 0) {
          await tx.employeeLeaveBalance.createMany({
            data: leaveBalancesToCreate
          });
        }
        // --- END LEAVE AUTO-PROVISIONING ---

        return { employee: createdEmployee, salary: salaryResult };
      },
      { timeout: 45000, maxWait: 10000 }
    );

    return NextResponse.json({ success: true, ...result }, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/employee-details failed:", error);
    const message = error.message || "Failed to create employee";
    const status = error.message?.includes("already exists") ? 409 : 500;
    return NextResponse.json({ error: message }, { status });
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
    const { id, employee, salary, qualifications, family, nominees, witnesses, experiences } = body;

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

      if (hasAddressData(employee.permanentAddress)) {
        if (permanentAddressId) {
          const { id: _pid, ...permanentAddressData } = employee.permanentAddress;

          await tx.address.update({
            where: { id: permanentAddressId },
            data: permanentAddressData,
          });

        } else {
          const permanentAddr = await tx.address.create({
            data: employee.permanentAddress,
          });
          permanentAddressId = permanentAddr.id;
        }
      }


      if (hasAddressData(employee.correspondenceAddress)) {
        if (correspondenceAddressId) {
          const { id: _cid, ...correspondenceAddressData } = employee.correspondenceAddress;

          await tx.address.update({
            where: { id: correspondenceAddressId },
            data: correspondenceAddressData,
          });
        } else {
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
      if (employee.gender !== undefined) updateData.gender = toEnum(employee.gender);
      if (employee.maritalStatus !== undefined) updateData.maritalStatus = toEnum(employee.maritalStatus);
      if (employee.fathersName !== undefined) updateData.fathersName = toNull(employee.fathersName);
      if (employee.mothersName !== undefined) updateData.mothersName = toNull(employee.mothersName);
      if (employee.caste !== undefined) updateData.caste = toNull(employee.caste);
      if (employee.bloodGroup !== undefined) updateData.bloodGroup = toNull(employee.bloodGroup);
      if (employee.nationality !== undefined) updateData.nationality = toNull(employee.nationality);
      if (employee.religion !== undefined) updateData.religion = toEnum(employee.religion);
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
      if (employee.paymentMode !== undefined) updateData.paymentMode = toEnum(employee.paymentMode);
      if (employee.acType !== undefined) updateData.acType = toEnum(employee.acType);
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
      if (employee.employmentStatus !== undefined) updateData.employmentStatus = toEnum(employee.employmentStatus);
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

      // ── Update related records (delete + recreate) ──────────────────────
      // Qualifications
      if (qualifications !== undefined) {
        await tx.qualification.deleteMany({ where: { employeeId: id } });
        const validQuals = (qualifications || [])
          .map((q: any) => {
            const { id: _id, from, to, score, degreeValidityYear, uploadCertification, ...rest } = q;
            return {
              ...rest,
              employeeId: id,
              fromYear: from ? new Date(from).getFullYear() : null,
              toYear: to ? new Date(to).getFullYear() : null,
              percentage: score != null ? String(score) : null,
              validityYear: degreeValidityYear ? parseInt(degreeValidityYear) || null : null,
              certificate: (() => {
                if (!uploadCertification) return null;
                if (typeof uploadCertification === 'object' && uploadCertification.base64) {
                  return uploadCertification.base64;
                }
                if (typeof uploadCertification === 'string' && uploadCertification.trim()) {
                  return uploadCertification.trim();
                }
                return null;
              })(),
            };
          })
          .filter((q: any) => q.college?.trim() || q.degree?.trim() || q.fromYear || q.toYear);
        if (validQuals.length > 0) {
          await tx.qualification.createMany({ data: validQuals });
        }
      }

      // Family members
      if (family !== undefined) {
        await tx.familyMember.deleteMany({ where: { employeeId: id } });
        const validFamily = (family || [])
          .map((f: any) => {
            const { id: _id, residing, ...rest } = f;
            return {
              ...rest,
              employeeId: id,
              residingWith: residing !== undefined ? Boolean(residing) : true,
            };
          })
          .filter((f: any) => f.name?.trim() || f.relationship?.trim());
        if (validFamily.length > 0) {
          await tx.familyMember.createMany({ data: validFamily });
        }
      }

      // Nominees
      if (nominees !== undefined) {
        await tx.nominee.deleteMany({ where: { employeeId: id } });
        const validNominees = (nominees || [])
          .map((n: any) => {
            const { id: _id, gratuityShare, ...rest } = n;
            return {
              ...rest,
              employeeId: id,
              gratuityShare: gratuityShare === "" || gratuityShare == null ? null : Number(gratuityShare),
            };
          })
          .filter((n: any) => n.name?.trim() || n.relationship?.trim());
        if (validNominees.length > 0) {
          await tx.nominee.createMany({ data: validNominees });
        }
      }

      // Witnesses
      if (witnesses !== undefined) {
        await tx.witness.deleteMany({ where: { employeeId: id } });
        const validWitnesses = (witnesses || [])
          .map((w: any) => {
            const { id: _id, ...rest } = w;
            return { ...rest, employeeId: id };
          })
          .filter((w: any) => w.name?.trim() || w.address?.trim());
        if (validWitnesses.length > 0) {
          await tx.witness.createMany({ data: validWitnesses });
        }
      }

      // Experiences
      if (experiences !== undefined) {
        await tx.experience.deleteMany({ where: { employeeId: id } });
        const validExps = (experiences || [])
          .filter((e: any) => (e.companyName?.trim() || e.designation?.trim()) && e.from && e.to)
          .map((e: any) => {
            const { id: _id, ...rest } = e;
            return {
              ...rest,
              from: new Date(e.from),
              to: new Date(e.to),
              employeeId: id,
            };
          });
        if (validExps.length > 0) {
          await tx.experience.createMany({ data: validExps });
        }
      }

      let salaryResult = null;

      if (salary && salary.mode && salary.inputAmount !== undefined) {

        const salaryMode = String(salary.mode).toUpperCase();
        if (salaryMode !== "CTC" && salaryMode !== "GROSS") {
          throw new Error(`Invalid salary mode: ${salary.mode}`);
        }

        const inputAmount = Number(salary.inputAmount);
        if (isNaN(inputAmount) || inputAmount <= 0) {
          throw new Error("Invalid salary amount");
        }

        const selectedHeadIds = Array.isArray(salary.selectedHeadIds)
          ? salary.selectedHeadIds
          : [];

        // 1️⃣ Delete OLD salary first (VERY IMPORTANT)
        // remove any existing salary breakdown + config in one go
        await tx.employeeSalaryHead.deleteMany({ where: { employeeId: id } });
        await tx.employeeSalaryConfig.deleteMany({ where: { employeeId: id } });


        // 2️⃣ Recalculate salary
        salaryResult = await calculateEmployeeSalary({
          tx,
          companyId,
          employeeId: id,
          salary: {
            mode: salaryMode as "CTC" | "GROSS",
            inputAmount,
            selectedHeadIds,
          },
        });
      }


      return {
        employee: updatedEmployee,
        salary: salaryResult,
      };
    }, { timeout: 45000, maxWait: 10000 });
    return NextResponse.json({
      success: true,
      employee: result.employee,
      salary: result.salary,
    });

  } catch (error: any) {
    console.error("Error in PUT /api/employee-details:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}