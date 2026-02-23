-- CreateEnum
CREATE TYPE "StatutoryType" AS ENUM ('PF', 'ESI', 'GRATUITY');

-- CreateEnum
CREATE TYPE "state_code" AS ENUM ('ANDHRA_PRADESH', 'ARUNACHAL_PRADESH', 'ASSAM', 'BIHAR', 'CHHATTISGARH', 'GOA', 'GUJARAT', 'HARYANA', 'HIMACHAL_PRADESH', 'JHARKHAND', 'KARNATAKA', 'KERALA', 'MADHYA_PRADESH', 'MAHARASHTRA', 'MANIPUR', 'MEGHALAYA', 'MIZORAM', 'NAGALAND', 'ODISHA', 'PUNJAB', 'RAJASTHAN', 'SIKKIM', 'TAMIL_NADU', 'TELANGANA', 'TRIPURA', 'UTTAR_PRADESH', 'UTTARAKHAND', 'WEST_BENGAL', 'DELHI', 'JAMMU_AND_KASHMIR', 'LADAKH', 'CHANDIGARH', 'PUDUCHERRY', 'LAKSHADWEEP', 'ANDAMAN_AND_NICOBAR_ISLANDS', 'DADRA_AND_NAGAR_HAVELI_AND_DAMAN_AND_DIU');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'OTHER');

-- CreateEnum
CREATE TYPE "MaritalStatus" AS ENUM ('MARRIED', 'UNMARRIED', 'DIVORCED', 'WIDOWED');

-- CreateEnum
CREATE TYPE "BloodGroup" AS ENUM ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-');

-- CreateEnum
CREATE TYPE "Religion" AS ENUM ('HINDU', 'MUSLIM', 'CHRISTIAN', 'SIKH', 'BUDDHIST', 'JAIN', 'OTHERS');

-- CreateEnum
CREATE TYPE "PaymentMode" AS ENUM ('TRANSFER', 'CHEQUE', 'CASH');

-- CreateEnum
CREATE TYPE "AccountType" AS ENUM ('ECS', 'NEFT', 'RTGS', 'IMPS');

-- CreateEnum
CREATE TYPE "employee_status" AS ENUM ('ACTIVE', 'PROBATION', 'RESIGNED', 'TERMINATED', 'RETIRED', 'DECEASED');

-- CreateEnum
CREATE TYPE "company_status" AS ENUM ('ACTIVE', 'INACTIVE', 'ARCHIVED', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "company_visibility" AS ENUM ('PUBLIC', 'PRIVATE', 'HIDDEN');

-- CreateEnum
CREATE TYPE "default_attendance" AS ENUM ('PRESENT', 'ABSENT', 'HALF_DAY');

-- CreateEnum
CREATE TYPE "leave_setup_type" AS ENUM ('FINANCIAL_YEAR', 'CALENDAR_YEAR');

-- CreateEnum
CREATE TYPE "employee_list_order" AS ENUM ('NAME', 'ID', 'DEPARTMENT');

-- CreateEnum
CREATE TYPE "DeductorType" AS ENUM ('GOV', 'UNION_GOV', 'OTHERS');

-- CreateEnum
CREATE TYPE "CompanyType" AS ENUM ('GOVERNMENT', 'OTHERS');

-- CreateEnum
CREATE TYPE "attendance_status" AS ENUM ('PRESENT', 'ABSENT', 'LATE', 'HALF_DAY', 'ON_LEAVE', 'HOLIDAY', 'WEEKEND');

-- CreateEnum
CREATE TYPE "leave_status" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "leave_type" AS ENUM ('FULL_DAY', 'HALF_DAY');

-- CreateEnum
CREATE TYPE "payroll_status" AS ENUM ('DRAFT', 'PROCESSING', 'COMPLETED', 'PAID', 'CANCELLED');

-- CreateEnum
CREATE TYPE "shift_type" AS ENUM ('FIXED', 'ROTATING', 'FLEXIBLE');

-- CreateTable
CREATE TABLE "companies" (
    "id" TEXT NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "name" TEXT NOT NULL,
    "serviceName" TEXT,
    "status" "company_status" NOT NULL DEFAULT 'ACTIVE',
    "visibility" "company_visibility" NOT NULL DEFAULT 'PRIVATE',
    "startDate" DATE,
    "endDate" DATE,
    "dateOfStartingBusiness" DATE,
    "cin" VARCHAR(21),
    "pan" VARCHAR(10) NOT NULL,
    "tan" VARCHAR(10) NOT NULL,
    "gstin" VARCHAR(15),
    "flat" TEXT NOT NULL,
    "road" TEXT,
    "city" TEXT NOT NULL,
    "state" "state_code" NOT NULL,
    "pin" VARCHAR(6) NOT NULL,
    "stdCode" TEXT,
    "phone" TEXT,
    "email" VARCHAR(255),
    "website" TEXT,
    "pfRegionalOffice" TEXT,
    "pensionCoverageDate" DATE,
    "esiLocalOffice" TEXT,
    "ptoCircleNo" TEXT,
    "pfCoverageDate" DATE,
    "esiNumber" TEXT,
    "ptRegCert" TEXT,
    "ptEnrCert" TEXT,
    "lwfRegNo" TEXT,
    "ddoCode" TEXT,
    "ddoRegNo" TEXT,
    "tanRegNo" TEXT,
    "paoCode" TEXT,
    "paoRegNo" TEXT,
    "ain" TEXT,
    "tdsCircle" TEXT,
    "ministryName" TEXT,
    "ministryIfOthers" TEXT,
    "labourId" TEXT,
    "branchDivision" TEXT NOT NULL,
    "typeOfCompany" TEXT,
    "natureOfCompany" TEXT,
    "epfCode" TEXT,
    "leaveSetupType" "leave_setup_type" NOT NULL DEFAULT 'FINANCIAL_YEAR',
    "employeeListOrder" "employee_list_order" NOT NULL DEFAULT 'NAME',
    "defaultAttendance" "default_attendance" NOT NULL DEFAULT 'PRESENT',
    "showBranchName" BOOLEAN NOT NULL DEFAULT false,
    "dontGeneratePF" BOOLEAN NOT NULL DEFAULT false,
    "deductorType" "DeductorType",
    "companyType" "CompanyType",
    "addressChangedEmployer" BOOLEAN NOT NULL DEFAULT false,
    "adminId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "archivedAt" TIMESTAMP(3),
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "searchVector" tsvector,

    CONSTRAINT "companies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "authorized_persons" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "designation" TEXT NOT NULL,
    "fatherName" TEXT,
    "dob" DATE,
    "gender" "Gender" NOT NULL DEFAULT 'MALE',
    "premise" TEXT,
    "flat" TEXT NOT NULL,
    "road" TEXT,
    "area" TEXT,
    "city" TEXT NOT NULL,
    "state" TEXT,
    "pin" VARCHAR(6) NOT NULL,
    "pan" VARCHAR(10) NOT NULL,
    "email" VARCHAR(255),
    "stdCode" TEXT,
    "phone" TEXT,
    "addressChanged" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,

    CONSTRAINT "authorized_persons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "branches" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "isHeadOffice" BOOLEAN NOT NULL DEFAULT false,
    "flat" TEXT,
    "road" TEXT,
    "city" TEXT,
    "state" "state_code",
    "pin" VARCHAR(6),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,

    CONSTRAINT "branches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "departments" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,

    CONSTRAINT "departments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "designations" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,

    CONSTRAINT "designations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employee_categories" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,

    CONSTRAINT "employee_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "levels" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,

    CONSTRAINT "levels_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "grades" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,

    CONSTRAINT "grades_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attendance_type_configs" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,

    CONSTRAINT "attendance_type_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "salary_heads" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "shortName" TEXT,
    "form16Field" TEXT,
    "fieldType" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "calcBase" TEXT,
    "isPercentage" BOOLEAN NOT NULL DEFAULT false,
    "value" DOUBLE PRECISION,
    "applicableFor" JSONB,
    "percentageOf" TEXT,
    "isSystem" BOOLEAN NOT NULL DEFAULT false,
    "systemCode" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,

    CONSTRAINT "salary_heads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employees" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "code" VARCHAR(20) NOT NULL,
    "name" TEXT NOT NULL,
    "fatherHusbandName" TEXT,
    "pan" VARCHAR(10),
    "aadhaar" VARCHAR(12),
    "uan" VARCHAR(12),
    "pfAcNo" VARCHAR(30),
    "esiNo" VARCHAR(20),
    "email" VARCHAR(255),
    "nasscomRegNo" TEXT,
    "gender" "Gender" NOT NULL DEFAULT 'MALE',
    "maritalStatus" "MaritalStatus" NOT NULL DEFAULT 'UNMARRIED',
    "dob" DATE,
    "doj" DATE NOT NULL,
    "dor" DATE,
    "dateOfMarriage" DATE,
    "fathersName" TEXT,
    "mothersName" TEXT,
    "caste" TEXT,
    "bloodGroup" "BloodGroup",
    "nationality" TEXT,
    "religion" "Religion",
    "noOfDependent" INTEGER,
    "spouse" TEXT,
    "photo" TEXT,
    "physicallyHandicap" TEXT,
    "registeredInPmrpy" BOOLEAN NOT NULL DEFAULT false,
    "emergencyContact" TEXT,
    "emergencyPhone" TEXT,
    "permanentAddressId" TEXT,
    "correspondenceAddressId" TEXT,
    "stdCode" TEXT,
    "phone" TEXT,
    "mobile" TEXT,
    "internalId" TEXT,
    "scale" TEXT,
    "ptGroup" TEXT,
    "noticePeriodMonths" INTEGER,
    "probationPeriodMonths" INTEGER,
    "confirmationDate" DATE,
    "resigLetterDate" DATE,
    "resigDateLwd" DATE,
    "resignationReason" TEXT,
    "appraisalDate" DATE,
    "commitmentCompletionDate" DATE,
    "dateOfDeath" DATE,
    "identityMark" TEXT,
    "reimbursementApplicable" BOOLEAN NOT NULL DEFAULT false,
    "branch" TEXT,
    "department" TEXT,
    "designation" TEXT,
    "level" TEXT,
    "grade" TEXT,
    "category" TEXT,
    "attendanceType" TEXT,
    "shiftId" TEXT,
    "bankName" TEXT,
    "bankBranch" TEXT,
    "bankIfsc" TEXT,
    "bankAddress" TEXT,
    "nameAsPerAc" TEXT,
    "salaryAcNumber" TEXT,
    "paymentMode" "PaymentMode" DEFAULT 'TRANSFER',
    "acType" "AccountType" DEFAULT 'ECS',
    "bankRefNo" TEXT,
    "wardCircleRange" TEXT,
    "licPolicyNo" TEXT,
    "policyTerm" TEXT,
    "licId" TEXT,
    "annualRenewableDate" DATE,
    "hraApplicable" BOOLEAN NOT NULL DEFAULT false,
    "bonusApplicable" BOOLEAN NOT NULL DEFAULT false,
    "gratuityApplicable" BOOLEAN NOT NULL DEFAULT false,
    "lwfApplicable" BOOLEAN NOT NULL DEFAULT false,
    "pfApplicable" BOOLEAN NOT NULL DEFAULT false,
    "pfJoiningDate" DATE,
    "pfLastDate" DATE,
    "previousPfNo" TEXT,
    "salaryForPfOption" TEXT,
    "salaryForPf" DOUBLE PRECISION,
    "minAmtPf" DOUBLE PRECISION,
    "pensionAppl" BOOLEAN NOT NULL DEFAULT false,
    "pensionJoiningDate" DATE,
    "pensionOnHigherWages" BOOLEAN NOT NULL DEFAULT false,
    "noLimit" BOOLEAN NOT NULL DEFAULT false,
    "esiApplicable" BOOLEAN NOT NULL DEFAULT false,
    "esiJoiningDate" DATE,
    "esiLastDate" DATE,
    "salaryForEsiOption" TEXT,
    "salaryForEsi" DOUBLE PRECISION,
    "minAmtEsiContribution" DOUBLE PRECISION,
    "dispensaryOrPanel" TEXT,
    "recruitmentAgency" TEXT,
    "bankMandate" TEXT,
    "employmentStatus" "employee_status" NOT NULL DEFAULT 'ACTIVE',
    "lapTops" TEXT,
    "companyVehicle" TEXT,
    "corpCreditCardNo" TEXT,
    "transportRoute" TEXT,
    "workLocation" TEXT,
    "reasonForLeaving" TEXT,
    "service" TEXT,
    "remarks" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdBy" TEXT,
    "updatedBy" TEXT,

    CONSTRAINT "employees_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employee_salary_configs" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "salaryMode" TEXT NOT NULL,
    "inputAmount" DOUBLE PRECISION NOT NULL,
    "grossSalary" DOUBLE PRECISION NOT NULL,
    "netSalary" DOUBLE PRECISION NOT NULL,
    "annualCtc" DOUBLE PRECISION NOT NULL,
    "pfRuleSnapshot" JSONB NOT NULL,
    "esiRuleSnapshot" JSONB NOT NULL,
    "gratuityRuleSnapshot" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "employee_salary_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "addresses" (
    "id" TEXT NOT NULL,
    "permanentEmployeeId" TEXT,
    "correspondenceEmployeeId" TEXT,
    "flat" TEXT,
    "building" TEXT,
    "area" TEXT,
    "road" TEXT,
    "city" TEXT,
    "district" TEXT,
    "state" "state_code",
    "pin" VARCHAR(6),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "addresses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "qualifications" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "college" TEXT,
    "degree" TEXT,
    "subject" TEXT,
    "fromYear" INTEGER,
    "toYear" INTEGER,
    "year" TEXT,
    "cgpa" TEXT,
    "percentage" TEXT,
    "regNo" TEXT,
    "validityYear" INTEGER,
    "certificate" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "qualifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "experiences" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "location" TEXT,
    "designation" TEXT NOT NULL,
    "from" DATE NOT NULL,
    "to" DATE NOT NULL,
    "remark" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "experiences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "family_members" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "relationship" TEXT NOT NULL,
    "dobAge" TEXT,
    "residingWith" BOOLEAN NOT NULL DEFAULT true,
    "address" TEXT,
    "district" TEXT,
    "state" TEXT,
    "aadhar" TEXT,
    "remark" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "family_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "nominees" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "relationship" TEXT NOT NULL,
    "dobAge" TEXT,
    "address" TEXT,
    "district" TEXT,
    "state" TEXT,
    "pin" TEXT,
    "gratuityShare" DOUBLE PRECISION,
    "maritalStatus" "MaritalStatus",
    "remark" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "nominees_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "witnesses" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "witnesses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "company_assets" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "particular" TEXT NOT NULL,
    "remark" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,

    CONSTRAINT "company_assets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employee_salary_heads" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "salaryHeadId" TEXT NOT NULL,
    "headName" TEXT NOT NULL,
    "headType" TEXT NOT NULL,
    "baseAmount" DOUBLE PRECISION NOT NULL,
    "netAmount" DOUBLE PRECISION NOT NULL,
    "pfEmployee" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "pfEmployer" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "esiEmployee" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "esiEmployer" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "gratuityEmployer" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "employee_salary_heads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attendances" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "checkIn" TIMESTAMP(3),
    "checkOut" TIMESTAMP(3),
    "breakStart" TIMESTAMP(3),
    "breakEnd" TIMESTAMP(3),
    "status" "attendance_status" NOT NULL DEFAULT 'PRESENT',
    "workingHours" DOUBLE PRECISION DEFAULT 0,
    "overtimeHours" DOUBLE PRECISION DEFAULT 0,
    "notes" TEXT,
    "location" TEXT,
    "shiftId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,

    CONSTRAINT "attendances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "leave_policies" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'Active',
    "type" "leave_type" NOT NULL DEFAULT 'FULL_DAY',
    "leaveValue" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "payConsume" BOOLEAN NOT NULL DEFAULT true,
    "allowApply" BOOLEAN NOT NULL DEFAULT true,
    "halfDay" BOOLEAN NOT NULL DEFAULT false,
    "accrueRule" TEXT,
    "fixedDays" DOUBLE PRECISION,
    "fixedPeriod" TEXT,
    "plPer" DOUBLE PRECISION,
    "plBasis" TEXT,
    "minAttendance" DOUBLE PRECISION,
    "totalPerYear" DOUBLE PRECISION,
    "maxPerMonth" DOUBLE PRECISION,
    "availedFrom" TEXT,
    "autoAllot" BOOLEAN NOT NULL DEFAULT false,
    "restrictDays" DOUBLE PRECISION,
    "mandatoryDocDays" DOUBLE PRECISION,
    "allowEncash" BOOLEAN NOT NULL DEFAULT false,
    "minEncash" DOUBLE PRECISION,
    "maxEncash" DOUBLE PRECISION,
    "cfOption" TEXT,
    "cfMaxLimit" DOUBLE PRECISION,
    "applicability" JSONB NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,

    CONSTRAINT "leave_policies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employee_leave_balances" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "leavePolicyId" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "totalAllotted" DOUBLE PRECISION NOT NULL,
    "carriedOver" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "used" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "encashed" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "lapsed" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "employee_leave_balances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "leave_applications" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "leavePolicyId" TEXT NOT NULL,
    "startDate" DATE NOT NULL,
    "endDate" DATE NOT NULL,
    "days" DOUBLE PRECISION NOT NULL,
    "type" "leave_type" NOT NULL DEFAULT 'FULL_DAY',
    "status" "leave_status" NOT NULL DEFAULT 'PENDING',
    "reason" TEXT,
    "appliedDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "approvedBy" TEXT,
    "approvedAt" TIMESTAMP(3),
    "rejectedBy" TEXT,
    "rejectedAt" TIMESTAMP(3),
    "rejectionReason" TEXT,
    "documents" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,

    CONSTRAINT "leave_applications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shifts" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "breakDuration" INTEGER,
    "workingHours" DOUBLE PRECISION,
    "shiftType" "shift_type" NOT NULL DEFAULT 'FIXED',
    "checkInAllowedFrom" INTEGER,
    "checkOutAllowedFrom" INTEGER,
    "shiftAllowance" BOOLEAN NOT NULL DEFAULT false,
    "weeklyOffPattern" JSONB NOT NULL,
    "restrictManagerBackdate" BOOLEAN NOT NULL DEFAULT false,
    "restrictHRBackdate" BOOLEAN NOT NULL DEFAULT false,
    "restrictManagerFuture" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,

    CONSTRAINT "shifts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shift_rotations" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "shiftId" TEXT NOT NULL,
    "employeeId" TEXT,
    "department" TEXT,
    "startDate" DATE NOT NULL,
    "endDate" DATE,
    "rotationPattern" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,

    CONSTRAINT "shift_rotations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payroll_cycles" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "cycleType" TEXT NOT NULL,
    "startDate" DATE NOT NULL,
    "endDate" DATE NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,

    CONSTRAINT "payroll_cycles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payroll_records" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "payrollCycleId" TEXT,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "basicSalary" DOUBLE PRECISION NOT NULL,
    "hra" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "conveyanceAllowance" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "medicalAllowance" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "specialAllowance" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "grossSalary" DOUBLE PRECISION NOT NULL,
    "providentFund" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "esi" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "professionalTax" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "incomeTax" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "otherDeductions" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalDeductions" DOUBLE PRECISION NOT NULL,
    "netSalary" DOUBLE PRECISION NOT NULL,
    "workingDays" INTEGER NOT NULL,
    "presentDays" INTEGER NOT NULL,
    "leaveDays" INTEGER NOT NULL DEFAULT 0,
    "overtimeHours" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "overtimeAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "lateDeduction" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "status" "payroll_status" NOT NULL DEFAULT 'DRAFT',
    "processedAt" TIMESTAMP(3),
    "paidAt" TIMESTAMP(3),
    "remarks" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,

    CONSTRAINT "payroll_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pf_esi_rates" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "rateType" "StatutoryType" NOT NULL,
    "gratuityPercent" DOUBLE PRECISION,
    "gratuityBase" TEXT,
    "empShare" DOUBLE PRECISION,
    "employerShare" DOUBLE PRECISION,
    "esiWageCeiling" DOUBLE PRECISION,
    "empShareAc1" DOUBLE PRECISION,
    "erShareAc2" DOUBLE PRECISION,
    "adminChargesAc10" DOUBLE PRECISION,
    "epsAc21" DOUBLE PRECISION,
    "edliChargesAc21" DOUBLE PRECISION,
    "adminChargesAc22" DOUBLE PRECISION,
    "calcType" TEXT,
    "pfWageCeiling" DOUBLE PRECISION,
    "epsWageCeiling" DOUBLE PRECISION,
    "minEpsContribution" DOUBLE PRECISION,
    "effectiveFrom" DATE NOT NULL,
    "effectiveTo" DATE,
    "remarks" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,

    CONSTRAINT "pf_esi_rates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "short_leave_policies" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "applicableOn" TEXT,
    "totalHours" INTEGER NOT NULL DEFAULT 2,
    "totalMinutes" INTEGER NOT NULL DEFAULT 0,
    "minHours" INTEGER NOT NULL DEFAULT 1,
    "minMinutes" INTEGER NOT NULL DEFAULT 0,
    "maxHours" INTEGER NOT NULL DEFAULT 1,
    "maxMinutes" INTEGER NOT NULL DEFAULT 0,
    "deductBalance" BOOLEAN NOT NULL DEFAULT true,
    "allowBackdated" BOOLEAN NOT NULL DEFAULT true,
    "advanceApplicability" TEXT,
    "status" TEXT NOT NULL DEFAULT 'Active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,

    CONSTRAINT "short_leave_policies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'USER',
    "password" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastLoginAt" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "backups" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "filePath" TEXT,
    "fileUrl" TEXT,
    "sizeInBytes" BIGINT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,

    CONSTRAINT "backups_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "companies_code_key" ON "companies"("code");

-- CreateIndex
CREATE UNIQUE INDEX "company_pan_key" ON "companies"("pan");

-- CreateIndex
CREATE UNIQUE INDEX "company_tan_key" ON "companies"("tan");

-- CreateIndex
CREATE UNIQUE INDEX "company_gstin_key" ON "companies"("gstin");

-- CreateIndex
CREATE INDEX "companies_code_idx" ON "companies"("code");

-- CreateIndex
CREATE INDEX "companies_name_idx" ON "companies"("name");

-- CreateIndex
CREATE INDEX "companies_pan_idx" ON "companies"("pan");

-- CreateIndex
CREATE INDEX "companies_tan_idx" ON "companies"("tan");

-- CreateIndex
CREATE INDEX "companies_gstin_idx" ON "companies"("gstin");

-- CreateIndex
CREATE INDEX "companies_status_idx" ON "companies"("status");

-- CreateIndex
CREATE INDEX "companies_startDate_idx" ON "companies"("startDate");

-- CreateIndex
CREATE INDEX "companies_endDate_idx" ON "companies"("endDate");

-- CreateIndex
CREATE INDEX "companies_state_idx" ON "companies"("state");

-- CreateIndex
CREATE INDEX "companies_branchDivision_idx" ON "companies"("branchDivision");

-- CreateIndex
CREATE INDEX "companies_deletedAt_idx" ON "companies"("deletedAt");

-- CreateIndex
CREATE INDEX "companies_createdAt_idx" ON "companies"("createdAt");

-- CreateIndex
CREATE INDEX "companies_adminId_idx" ON "companies"("adminId");

-- CreateIndex
CREATE INDEX "companies_email_idx" ON "companies"("email");

-- CreateIndex
CREATE INDEX "companies_status_deletedAt_idx" ON "companies"("status", "deletedAt");

-- CreateIndex
CREATE INDEX "companies_status_visibility_idx" ON "companies"("status", "visibility");

-- CreateIndex
CREATE INDEX "companies_companyType_status_idx" ON "companies"("companyType", "status");

-- CreateIndex
CREATE INDEX "companies_createdAt_status_idx" ON "companies"("createdAt", "status");

-- CreateIndex
CREATE INDEX "companies_searchVector_idx" ON "companies" USING GIN ("searchVector");

-- CreateIndex
CREATE UNIQUE INDEX "companies_code_branchDivision_key" ON "companies"("code", "branchDivision");

-- CreateIndex
CREATE UNIQUE INDEX "authorized_persons_companyId_key" ON "authorized_persons"("companyId");

-- CreateIndex
CREATE INDEX "authorized_persons_pan_idx" ON "authorized_persons"("pan");

-- CreateIndex
CREATE INDEX "authorized_persons_companyId_idx" ON "authorized_persons"("companyId");

-- CreateIndex
CREATE INDEX "authorized_persons_email_idx" ON "authorized_persons"("email");

-- CreateIndex
CREATE INDEX "branches_companyId_idx" ON "branches"("companyId");

-- CreateIndex
CREATE INDEX "branches_code_idx" ON "branches"("code");

-- CreateIndex
CREATE INDEX "branches_companyId_isHeadOffice_idx" ON "branches"("companyId", "isHeadOffice");

-- CreateIndex
CREATE UNIQUE INDEX "branches_companyId_code_key" ON "branches"("companyId", "code");

-- CreateIndex
CREATE INDEX "departments_companyId_idx" ON "departments"("companyId");

-- CreateIndex
CREATE INDEX "departments_companyId_name_idx" ON "departments"("companyId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "departments_companyId_name_key" ON "departments"("companyId", "name");

-- CreateIndex
CREATE INDEX "designations_companyId_idx" ON "designations"("companyId");

-- CreateIndex
CREATE INDEX "designations_companyId_name_idx" ON "designations"("companyId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "designations_companyId_name_key" ON "designations"("companyId", "name");

-- CreateIndex
CREATE INDEX "employee_categories_companyId_idx" ON "employee_categories"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "employee_categories_companyId_name_key" ON "employee_categories"("companyId", "name");

-- CreateIndex
CREATE INDEX "levels_companyId_idx" ON "levels"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "levels_companyId_name_key" ON "levels"("companyId", "name");

-- CreateIndex
CREATE INDEX "grades_companyId_idx" ON "grades"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "grades_companyId_name_key" ON "grades"("companyId", "name");

-- CreateIndex
CREATE INDEX "attendance_type_configs_companyId_idx" ON "attendance_type_configs"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "attendance_type_configs_companyId_name_key" ON "attendance_type_configs"("companyId", "name");

-- CreateIndex
CREATE INDEX "salary_heads_companyId_idx" ON "salary_heads"("companyId");

-- CreateIndex
CREATE INDEX "salary_heads_companyId_name_idx" ON "salary_heads"("companyId", "name");

-- CreateIndex
CREATE INDEX "salary_heads_fieldType_idx" ON "salary_heads"("fieldType");

-- CreateIndex
CREATE UNIQUE INDEX "salary_heads_companyId_name_key" ON "salary_heads"("companyId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "employees_permanentAddressId_key" ON "employees"("permanentAddressId");

-- CreateIndex
CREATE UNIQUE INDEX "employees_correspondenceAddressId_key" ON "employees"("correspondenceAddressId");

-- CreateIndex
CREATE INDEX "employees_companyId_idx" ON "employees"("companyId");

-- CreateIndex
CREATE INDEX "employees_pan_idx" ON "employees"("pan");

-- CreateIndex
CREATE INDEX "employees_uan_idx" ON "employees"("uan");

-- CreateIndex
CREATE INDEX "employees_esiNo_idx" ON "employees"("esiNo");

-- CreateIndex
CREATE INDEX "employees_aadhaar_idx" ON "employees"("aadhaar");

-- CreateIndex
CREATE INDEX "employees_email_idx" ON "employees"("email");

-- CreateIndex
CREATE INDEX "employees_doj_idx" ON "employees"("doj");

-- CreateIndex
CREATE INDEX "employees_dor_idx" ON "employees"("dor");

-- CreateIndex
CREATE INDEX "employees_department_idx" ON "employees"("department");

-- CreateIndex
CREATE INDEX "employees_designation_idx" ON "employees"("designation");

-- CreateIndex
CREATE INDEX "employees_branch_idx" ON "employees"("branch");

-- CreateIndex
CREATE INDEX "employees_category_idx" ON "employees"("category");

-- CreateIndex
CREATE INDEX "employees_level_idx" ON "employees"("level");

-- CreateIndex
CREATE INDEX "employees_grade_idx" ON "employees"("grade");

-- CreateIndex
CREATE INDEX "employees_attendanceType_idx" ON "employees"("attendanceType");

-- CreateIndex
CREATE INDEX "employees_employmentStatus_idx" ON "employees"("employmentStatus");

-- CreateIndex
CREATE INDEX "employees_deletedAt_idx" ON "employees"("deletedAt");

-- CreateIndex
CREATE INDEX "employees_shiftId_idx" ON "employees"("shiftId");

-- CreateIndex
CREATE INDEX "employees_companyId_deletedAt_idx" ON "employees"("companyId", "deletedAt");

-- CreateIndex
CREATE INDEX "employees_companyId_employmentStatus_idx" ON "employees"("companyId", "employmentStatus");

-- CreateIndex
CREATE INDEX "employees_companyId_department_idx" ON "employees"("companyId", "department");

-- CreateIndex
CREATE INDEX "employees_companyId_designation_idx" ON "employees"("companyId", "designation");

-- CreateIndex
CREATE INDEX "employees_companyId_branch_idx" ON "employees"("companyId", "branch");

-- CreateIndex
CREATE INDEX "employees_companyId_category_idx" ON "employees"("companyId", "category");

-- CreateIndex
CREATE INDEX "employees_department_employmentStatus_idx" ON "employees"("department", "employmentStatus");

-- CreateIndex
CREATE INDEX "employees_doj_employmentStatus_idx" ON "employees"("doj", "employmentStatus");

-- CreateIndex
CREATE INDEX "employees_companyId_doj_idx" ON "employees"("companyId", "doj");

-- CreateIndex
CREATE INDEX "employees_companyId_shiftId_idx" ON "employees"("companyId", "shiftId");

-- CreateIndex
CREATE UNIQUE INDEX "employees_companyId_code_key" ON "employees"("companyId", "code");

-- CreateIndex
CREATE UNIQUE INDEX "employee_salary_configs_employeeId_key" ON "employee_salary_configs"("employeeId");

-- CreateIndex
CREATE INDEX "employee_salary_configs_companyId_idx" ON "employee_salary_configs"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "addresses_permanentEmployeeId_key" ON "addresses"("permanentEmployeeId");

-- CreateIndex
CREATE UNIQUE INDEX "addresses_correspondenceEmployeeId_key" ON "addresses"("correspondenceEmployeeId");

-- CreateIndex
CREATE INDEX "addresses_state_idx" ON "addresses"("state");

-- CreateIndex
CREATE INDEX "addresses_city_idx" ON "addresses"("city");

-- CreateIndex
CREATE INDEX "addresses_pin_idx" ON "addresses"("pin");

-- CreateIndex
CREATE INDEX "qualifications_employeeId_idx" ON "qualifications"("employeeId");

-- CreateIndex
CREATE INDEX "qualifications_employeeId_fromYear_idx" ON "qualifications"("employeeId", "fromYear");

-- CreateIndex
CREATE INDEX "experiences_employeeId_idx" ON "experiences"("employeeId");

-- CreateIndex
CREATE INDEX "experiences_employeeId_from_idx" ON "experiences"("employeeId", "from");

-- CreateIndex
CREATE INDEX "family_members_employeeId_idx" ON "family_members"("employeeId");

-- CreateIndex
CREATE INDEX "family_members_employeeId_relationship_idx" ON "family_members"("employeeId", "relationship");

-- CreateIndex
CREATE INDEX "nominees_employeeId_idx" ON "nominees"("employeeId");

-- CreateIndex
CREATE INDEX "witnesses_employeeId_idx" ON "witnesses"("employeeId");

-- CreateIndex
CREATE INDEX "company_assets_employeeId_idx" ON "company_assets"("employeeId");

-- CreateIndex
CREATE INDEX "employee_salary_heads_salaryHeadId_idx" ON "employee_salary_heads"("salaryHeadId");

-- CreateIndex
CREATE INDEX "employee_salary_heads_employeeId_idx" ON "employee_salary_heads"("employeeId");

-- CreateIndex
CREATE INDEX "employee_salary_heads_companyId_idx" ON "employee_salary_heads"("companyId");

-- CreateIndex
CREATE INDEX "attendances_companyId_idx" ON "attendances"("companyId");

-- CreateIndex
CREATE INDEX "attendances_employeeId_idx" ON "attendances"("employeeId");

-- CreateIndex
CREATE INDEX "attendances_date_idx" ON "attendances"("date");

-- CreateIndex
CREATE INDEX "attendances_status_idx" ON "attendances"("status");

-- CreateIndex
CREATE INDEX "attendances_companyId_date_idx" ON "attendances"("companyId", "date");

-- CreateIndex
CREATE INDEX "attendances_employeeId_date_idx" ON "attendances"("employeeId", "date");

-- CreateIndex
CREATE INDEX "attendances_companyId_employeeId_date_idx" ON "attendances"("companyId", "employeeId", "date");

-- CreateIndex
CREATE INDEX "attendances_companyId_status_date_idx" ON "attendances"("companyId", "status", "date");

-- CreateIndex
CREATE INDEX "attendances_shiftId_idx" ON "attendances"("shiftId");

-- CreateIndex
CREATE UNIQUE INDEX "attendances_employeeId_date_key" ON "attendances"("employeeId", "date");

-- CreateIndex
CREATE INDEX "leave_policies_companyId_idx" ON "leave_policies"("companyId");

-- CreateIndex
CREATE INDEX "leave_policies_companyId_code_idx" ON "leave_policies"("companyId", "code");

-- CreateIndex
CREATE UNIQUE INDEX "leave_policies_companyId_name_key" ON "leave_policies"("companyId", "name");

-- CreateIndex
CREATE INDEX "employee_leave_balances_companyId_year_idx" ON "employee_leave_balances"("companyId", "year");

-- CreateIndex
CREATE UNIQUE INDEX "employee_leave_balances_employeeId_leavePolicyId_year_key" ON "employee_leave_balances"("employeeId", "leavePolicyId", "year");

-- CreateIndex
CREATE INDEX "leave_applications_companyId_idx" ON "leave_applications"("companyId");

-- CreateIndex
CREATE INDEX "leave_applications_employeeId_idx" ON "leave_applications"("employeeId");

-- CreateIndex
CREATE INDEX "leave_applications_leavePolicyId_idx" ON "leave_applications"("leavePolicyId");

-- CreateIndex
CREATE INDEX "leave_applications_status_idx" ON "leave_applications"("status");

-- CreateIndex
CREATE INDEX "leave_applications_startDate_idx" ON "leave_applications"("startDate");

-- CreateIndex
CREATE INDEX "leave_applications_endDate_idx" ON "leave_applications"("endDate");

-- CreateIndex
CREATE INDEX "leave_applications_companyId_employeeId_idx" ON "leave_applications"("companyId", "employeeId");

-- CreateIndex
CREATE INDEX "leave_applications_companyId_status_idx" ON "leave_applications"("companyId", "status");

-- CreateIndex
CREATE INDEX "leave_applications_employeeId_status_idx" ON "leave_applications"("employeeId", "status");

-- CreateIndex
CREATE INDEX "leave_applications_employeeId_startDate_endDate_idx" ON "leave_applications"("employeeId", "startDate", "endDate");

-- CreateIndex
CREATE INDEX "leave_applications_companyId_startDate_endDate_idx" ON "leave_applications"("companyId", "startDate", "endDate");

-- CreateIndex
CREATE INDEX "shifts_companyId_idx" ON "shifts"("companyId");

-- CreateIndex
CREATE INDEX "shifts_companyId_isActive_idx" ON "shifts"("companyId", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "shifts_companyId_name_key" ON "shifts"("companyId", "name");

-- CreateIndex
CREATE INDEX "shift_rotations_companyId_idx" ON "shift_rotations"("companyId");

-- CreateIndex
CREATE INDEX "shift_rotations_shiftId_idx" ON "shift_rotations"("shiftId");

-- CreateIndex
CREATE INDEX "shift_rotations_employeeId_idx" ON "shift_rotations"("employeeId");

-- CreateIndex
CREATE INDEX "shift_rotations_companyId_startDate_endDate_idx" ON "shift_rotations"("companyId", "startDate", "endDate");

-- CreateIndex
CREATE INDEX "payroll_cycles_companyId_idx" ON "payroll_cycles"("companyId");

-- CreateIndex
CREATE INDEX "payroll_cycles_cycleType_idx" ON "payroll_cycles"("cycleType");

-- CreateIndex
CREATE INDEX "payroll_cycles_startDate_endDate_idx" ON "payroll_cycles"("startDate", "endDate");

-- CreateIndex
CREATE INDEX "payroll_cycles_companyId_cycleType_idx" ON "payroll_cycles"("companyId", "cycleType");

-- CreateIndex
CREATE INDEX "payroll_cycles_companyId_isActive_idx" ON "payroll_cycles"("companyId", "isActive");

-- CreateIndex
CREATE INDEX "payroll_records_companyId_idx" ON "payroll_records"("companyId");

-- CreateIndex
CREATE INDEX "payroll_records_employeeId_idx" ON "payroll_records"("employeeId");

-- CreateIndex
CREATE INDEX "payroll_records_payrollCycleId_idx" ON "payroll_records"("payrollCycleId");

-- CreateIndex
CREATE INDEX "payroll_records_month_year_idx" ON "payroll_records"("month", "year");

-- CreateIndex
CREATE INDEX "payroll_records_status_idx" ON "payroll_records"("status");

-- CreateIndex
CREATE INDEX "payroll_records_companyId_month_year_idx" ON "payroll_records"("companyId", "month", "year");

-- CreateIndex
CREATE INDEX "payroll_records_employeeId_month_year_idx" ON "payroll_records"("employeeId", "month", "year");

-- CreateIndex
CREATE INDEX "payroll_records_companyId_status_idx" ON "payroll_records"("companyId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "payroll_records_employeeId_month_year_key" ON "payroll_records"("employeeId", "month", "year");

-- CreateIndex
CREATE INDEX "pf_esi_rates_companyId_idx" ON "pf_esi_rates"("companyId");

-- CreateIndex
CREATE INDEX "pf_esi_rates_rateType_idx" ON "pf_esi_rates"("rateType");

-- CreateIndex
CREATE INDEX "pf_esi_rates_effectiveFrom_effectiveTo_idx" ON "pf_esi_rates"("effectiveFrom", "effectiveTo");

-- CreateIndex
CREATE INDEX "pf_esi_rates_companyId_rateType_idx" ON "pf_esi_rates"("companyId", "rateType");

-- CreateIndex
CREATE INDEX "pf_esi_rates_companyId_isActive_idx" ON "pf_esi_rates"("companyId", "isActive");

-- CreateIndex
CREATE INDEX "pf_esi_rates_companyId_effectiveFrom_idx" ON "pf_esi_rates"("companyId", "effectiveFrom");

-- CreateIndex
CREATE INDEX "short_leave_policies_companyId_idx" ON "short_leave_policies"("companyId");

-- CreateIndex
CREATE INDEX "short_leave_policies_companyId_status_idx" ON "short_leave_policies"("companyId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "short_leave_policies_companyId_name_key" ON "short_leave_policies"("companyId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_role_idx" ON "users"("role");

-- CreateIndex
CREATE INDEX "users_isActive_idx" ON "users"("isActive");

-- CreateIndex
CREATE INDEX "users_email_isActive_idx" ON "users"("email", "isActive");

-- CreateIndex
CREATE INDEX "backups_companyId_idx" ON "backups"("companyId");

-- CreateIndex
CREATE INDEX "backups_createdAt_idx" ON "backups"("createdAt");

-- CreateIndex
CREATE INDEX "backups_companyId_createdAt_idx" ON "backups"("companyId", "createdAt");

-- AddForeignKey
ALTER TABLE "companies" ADD CONSTRAINT "companies_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "authorized_persons" ADD CONSTRAINT "authorized_persons_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "branches" ADD CONSTRAINT "branches_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "departments" ADD CONSTRAINT "departments_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "designations" ADD CONSTRAINT "designations_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_categories" ADD CONSTRAINT "employee_categories_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "levels" ADD CONSTRAINT "levels_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "grades" ADD CONSTRAINT "grades_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance_type_configs" ADD CONSTRAINT "attendance_type_configs_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "salary_heads" ADD CONSTRAINT "salary_heads_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employees" ADD CONSTRAINT "employees_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employees" ADD CONSTRAINT "employees_correspondenceAddressId_fkey" FOREIGN KEY ("correspondenceAddressId") REFERENCES "addresses"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employees" ADD CONSTRAINT "employees_permanentAddressId_fkey" FOREIGN KEY ("permanentAddressId") REFERENCES "addresses"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employees" ADD CONSTRAINT "employees_shiftId_fkey" FOREIGN KEY ("shiftId") REFERENCES "shifts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_salary_configs" ADD CONSTRAINT "employee_salary_configs_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "qualifications" ADD CONSTRAINT "qualifications_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "experiences" ADD CONSTRAINT "experiences_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "family_members" ADD CONSTRAINT "family_members_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nominees" ADD CONSTRAINT "nominees_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "witnesses" ADD CONSTRAINT "witnesses_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_assets" ADD CONSTRAINT "company_assets_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_salary_heads" ADD CONSTRAINT "employee_salary_heads_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_salary_heads" ADD CONSTRAINT "employee_salary_heads_salaryHeadId_fkey" FOREIGN KEY ("salaryHeadId") REFERENCES "salary_heads"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendances" ADD CONSTRAINT "attendances_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendances" ADD CONSTRAINT "attendances_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendances" ADD CONSTRAINT "attendances_shiftId_fkey" FOREIGN KEY ("shiftId") REFERENCES "shifts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leave_policies" ADD CONSTRAINT "leave_policies_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_leave_balances" ADD CONSTRAINT "employee_leave_balances_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_leave_balances" ADD CONSTRAINT "employee_leave_balances_leavePolicyId_fkey" FOREIGN KEY ("leavePolicyId") REFERENCES "leave_policies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_leave_balances" ADD CONSTRAINT "employee_leave_balances_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leave_applications" ADD CONSTRAINT "leave_applications_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leave_applications" ADD CONSTRAINT "leave_applications_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leave_applications" ADD CONSTRAINT "leave_applications_leavePolicyId_fkey" FOREIGN KEY ("leavePolicyId") REFERENCES "leave_policies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shifts" ADD CONSTRAINT "shifts_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shift_rotations" ADD CONSTRAINT "shift_rotations_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shift_rotations" ADD CONSTRAINT "shift_rotations_shiftId_fkey" FOREIGN KEY ("shiftId") REFERENCES "shifts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payroll_cycles" ADD CONSTRAINT "payroll_cycles_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payroll_records" ADD CONSTRAINT "payroll_records_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payroll_records" ADD CONSTRAINT "payroll_records_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payroll_records" ADD CONSTRAINT "payroll_records_payrollCycleId_fkey" FOREIGN KEY ("payrollCycleId") REFERENCES "payroll_cycles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pf_esi_rates" ADD CONSTRAINT "pf_esi_rates_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "short_leave_policies" ADD CONSTRAINT "short_leave_policies_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "backups" ADD CONSTRAINT "backups_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
