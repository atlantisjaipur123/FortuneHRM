"use client";

import { useState, useMemo } from "react";
import * as XLSX from "xlsx";
import * as FileSaver from "file-saver";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import AddEmployee from "@/components/add-employee";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { GlobalLayout } from "@/app/components/global-layout";

// ─────────────────────────────────────────────────────────────────────────────
// INTERFACES (unchanged)
// ─────────────────────────────────────────────────────────────────────────────
interface Address {
  flat?: string;
  building?: string;
  area?: string;
  road?: string;
  city?: string;
  pin?: string;
  district?: string;
  state?: string;
}

interface FamilyMember {
  name?: string;
  address?: string;
  relationship?: string;
  dobAge?: string;
  residingWith?: boolean;
  district?: string;
  state?: string;
  remark?: string;
  aadhar?: string;
}

interface Nominee {
  name?: string;
  address?: string;
  district?: string;
  state?: string;
  pin?: string;
  relationship?: string;
  dobAge?: string;
  gratuityProportion?: string;
  maritalStatus?: string;
  remark?: string;
}

interface Experience {
  companyName?: string;
  location?: string;
  designation?: string;
  from?: string;
  to?: string;
  remark?: string;
}

interface Asset {
  particular?: string;
  remark?: string;
}

interface Education {
  qualification?: string;
  universityCollege?: string;
  subject?: string;
  year?: string;
  percentage?: string;
}

interface Employee {
  id: number;
  code: string;
  name: string;
  fatherHusbandName: string;
  pan: string;
  dob: string;
  doj: string;
  dor: string;
  uan: string;
  pfAcNo: string;
  permanentAddress: Address;
  email: string;
  nasscomRegNo: string;
  gender: string;
  maritalStatus: string;
  fathersName: string;
  mothersName: string;
  caste: string;
  bloodGroup: string;
  nationality: string;
  religion: string;
  dateOfMarriage: string;
  noOfDependent: string;
  spouse: string;
  stdCode: string;
  phone: string;
  mobile: string;
  internalId: string;
  noticePeriodMonths: string;
  probationPeriodMonths: string;
  confirmationDate: string;
  resigLetterDate: string;
  resigDateLwd: string;
  resignationReason: string;
  appraisalDate: string;
  dateOfDeath: string;
  commitmentCompletionDate: string;
  identityMark: string;
  reimbursementApplicable: boolean;
  correspondenceAddress: Address;
  photo: string;
  bankName: string;
  bankBranch: string;
  bankIfsc: string;
  bankAddress: string;
  nameAsPerAc: string;
  salaryAcNumber: string;
  paymentMode: string;
  acType: string;
  bankRefNo: string;
  wardCircleRange: string;
  licPolicyNo: string;
  policyTerm: string;
  licId: string;
  annualRenewableDate: string;
  hraApplicable: boolean;
  bonusApplicable: boolean;
  gratuityApplicable: boolean;
  lwfApplicable: boolean;
  pfApplicable: boolean;
  physicallyHandicap: string;
  educationalQual: string;
  registeredInPmrpy: boolean;
  previousPfNo: string;
  pfJoiningDate: string;
  pfLastDate: string;
  salaryForPfOption: string;
  salaryForPf: string;
  minAmtPf: string;
  pensionAppl: boolean;
  pensionJoiningDate: string;
  pensionOnHigherWages: boolean;
  noLimit: boolean;
  esiApplicable: boolean;
  esiJoiningDate: string;
  esiNo: string;
  esiLastDate: string;
  salaryForEsiOption: string;
  salaryForEsi: string;
  minAmtEsiContribution: string;
  dispensaryOrPanel: string;
  recruitmentAgency: string;
  bankMandate: string;
  employmentStatus: string;
  lapTops: string;
  companyVehicle: string;
  corpCreditCardNo: string;
  transportRoute: string;
  workLocation: string;
  companyAssets: Asset[];
  educationalQualifications: Education[];
  reasonForLeaving: string;
  service: string;
  remarks: string;
  family: FamilyMember[];
  nominees: Nominee[];
  witnesses: Nominee[];
  previousYears: string;
  previousMonths: string;
  experiences: Experience[];
  branch: string;
  category: string;
  designation: string;
  department: string;
  scale: string;
  ptGroup: string;
  shift: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// INITIAL DATA
// ─────────────────────────────────────────────────────────────────────────────
const initialEmployees: Employee[] = [
  {
    id: 1,
    code: "AJ502",
    name: "ASHISH CHOUDHARY",
    fatherHusbandName: "SHANKAR LAL CHOUDHARY",
    pan: "CCEPC7570F",
    dob: "1991-01-10",
    doj: "2020-12-22",
    dor: "",
    uan: "101453128899",
    pfAcNo: "RJRAJ223938160000010026",
    permanentAddress: {},
    email: "",
    nasscomRegNo: "",
    gender: "Male",
    maritalStatus: "UnMarried",
    fathersName: "",
    mothersName: "",
    caste: "GEN",
    bloodGroup: "",
    nationality: "Resident",
    religion: "Hindu",
    dateOfMarriage: "",
    noOfDependent: "",
    spouse: "",
    stdCode: "",
    phone: "",
    mobile: "",
    internalId: "",
    noticePeriodMonths: "",
    probationPeriodMonths: "",
    confirmationDate: "",
    resigLetterDate: "",
    resigDateLwd: "",
    resignationReason: "",
    appraisalDate: "",
    dateOfDeath: "",
    commitmentCompletionDate: "",
    identityMark: "",
    reimbursementApplicable: false,
    correspondenceAddress: {},
    photo: "",
    bankName: "",
    bankBranch: "",
    bankIfsc: "",
    bankAddress: "",
    nameAsPerAc: "",
    salaryAcNumber: "",
    paymentMode: "TRANSFER",
    acType: "ECS",
    bankRefNo: "",
    wardCircleRange: "",
    licPolicyNo: "",
    policyTerm: "",
    licId: "",
    annualRenewableDate: "",
    hraApplicable: false,
    bonusApplicable: false,
    gratuityApplicable: false,
    lwfApplicable: false,
    pfApplicable: false,
    physicallyHandicap: "NO",
    educationalQual: "",
    registeredInPmrpy: false,
    previousPfNo: "",
    pfJoiningDate: "",
    pfLastDate: "",
    salaryForPfOption: "",
    salaryForPf: "",
    minAmtPf: "",
    pensionAppl: false,
    pensionJoiningDate: "",
    pensionOnHigherWages: false,
    noLimit: false,
    esiApplicable: false,
    esiJoiningDate: "",
    esiNo: "",
    esiLastDate: "",
    salaryForEsiOption: "",
    salaryForEsi: "",
    minAmtEsiContribution: "",
    dispensaryOrPanel: "",
    recruitmentAgency: "",
    bankMandate: "",
    employmentStatus: "",
    lapTops: "",
    companyVehicle: "",
    corpCreditCardNo: "",
    transportRoute: "",
    workLocation: "",
    companyAssets: [],
    educationalQualifications: [],
    reasonForLeaving: "",
    service: "",
    remarks: "",
    family: [],
    nominees: [],
    witnesses: [],
    previousYears: "",
    previousMonths: "",
    experiences: [],
    branch: "Main Branch",
    category: "Full-Time",
    designation: "Software Engineer",
    department: "IT",
    scale: "Level 3",
    ptGroup: "Group A",
    shift: "Morning",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
export default function EmployeeDetailsPage() {
  const [employees, setEmployees] = useState<Employee[]>(initialEmployees);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Partial<Employee>>({});
  const [showAllEmployees, setShowAllEmployees] = useState(true);
  const [includeResigned, setIncludeResigned] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  // ── Load dropdown options from localStorage (fallback values) ──
  const [branches] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem("branch-detail") || "[]"); }
    catch { return ["Main Branch", "Branch A", "Branch B"]; }
  });
  const [categories] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem("category") || "[]"); }
    catch { return ["Full-Time", "Part-Time", "Contract"]; }
  });
  const [departments] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem("department") || "[]"); }
    catch { return ["IT", "HR", "Finance", "Operations"]; }
  });
  const [designations] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem("designation") || "[]"); }
    catch { return ["Software Engineer", "Manager", "Analyst", "Director"]; }
  });
  const [levels] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem("level") || "[]"); }
    catch { return ["Level 1", "Level 2", "Level 3", "Level 4"]; }
  });
  const [grades] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem("grade") || "[]"); }
    catch { return ["A1", "A2", "B1", "B2"]; }
  });
  const [ptGroups] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem("pt-group") || "[]"); }
    catch { return ["Group A", "Group B", "Group C"]; }
  });
  const [shifts] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem("shift") || "[]"); }
    catch { return ["Morning", "Afternoon", "Night"]; }
  });

  // ── Filter states (8 dropdowns) ──
  const [selectedBranch, setSelectedBranch] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all");
  const [selectedDesignation, setSelectedDesignation] = useState<string>("all");
  const [selectedLevel, setSelectedLevel] = useState<string>("all");
  const [selectedGrade, setSelectedGrade] = useState<string>("all");
  const [selectedPtGroup, setSelectedPtGroup] = useState<string>("all");
  const [selectedShift, setSelectedShift] = useState<string>("all");

  // ── Filtered employees (real-time) ──
  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      const showAll = showAllEmployees;
      const resigned = includeResigned || !emp.dor;

      const branch = selectedBranch === "all" || emp.branch === selectedBranch;
      const category = selectedCategory === "all" || emp.category === selectedCategory;
      const department = selectedDepartment === "all" || emp.department === selectedDepartment;
      const designation = selectedDesignation === "all" || emp.designation === selectedDesignation;
      const level = selectedLevel === "all" || emp.scale === selectedLevel;
      const grade = selectedGrade === "all" || emp.scale === selectedGrade;
      const ptGroup = selectedPtGroup === "all" || emp.ptGroup === selectedPtGroup;
      const shift = selectedShift === "all" || emp.shift === selectedShift;

      return showAll && resigned && branch && category && department && designation && level && grade && ptGroup && shift;
    });
  }, [
    employees,
    showAllEmployees,
    includeResigned,
    selectedBranch,
    selectedCategory,
    selectedDepartment,
    selectedDesignation,
    selectedLevel,
    selectedGrade,
    selectedPtGroup,
    selectedShift,
  ]);

  // ── CRUD ──
  const handleSubmit = (updatedEmployee: Partial<Employee>) => {
    if (updatedEmployee.id) {
      setEmployees((prev) =>
        prev.map((emp) => (emp.id === updatedEmployee.id ? { ...emp, ...updatedEmployee } : emp))
      );
    } else {
      const newId = Math.max(...employees.map((e) => e.id), 0) + 1;
      setEmployees((prev) => [...prev, { ...updatedEmployee, id: newId } as Employee]);
    }
    setOpen(false);
    setForm({});
  };

  const handleEdit = (employee: Employee) => {
    setForm(employee);
    setOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Delete this employee?")) {
      setEmployees((prev) => prev.filter((emp) => emp.id !== id));
    }
  };

  // ── Import ──
  const normalizeHeader = (header: string) =>
    typeof header === "string" ? header.toLowerCase().replace(/\s+/g, "").trim() : "";

  const handleImport = () => {
    if (!file) return alert("Please select a file.");

    const reader = new FileReader();
    reader.onload = (e) => {
      const data = e.target?.result;
      if (!data) return;

      const workbook = XLSX.read(data, { type: "binary" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const importedData = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as string[][];

      if (importedData.length < 2) {
        return alert("File is empty or has only header.");
      }

      const headers = importedData[0].map(normalizeHeader);
      const lastId = Math.max(...employees.map((e) => e.id), 0);
      const toBoolean = (v: any) => v === "true" || v === true;

      const importedEmployees = importedData
        .slice(1)
        .map((row) => {
          const obj: { [k: string]: any } = {};
          headers.forEach((h, i) => {
            if (h) obj[h] = row[i] || "";
          });

          return {
            code: obj.code,
            name: obj.name,
            fatherHusbandName: obj.fatherhusbandname || obj.fathershusbandsname,
            pan: obj.pan,
            dob: obj.dob,
            doj: obj.doj,
            dor: obj.dor,
            uan: obj.uan,
            pfAcNo: obj.pfacno,
            email: obj.email,
            nasscomRegNo: obj.nasscomregno,
            gender: obj.gender,
            maritalStatus: obj.maritalstatus,
            fathersName: obj.fathersname,
            mothersName: obj.mothersname,
            caste: obj.caste,
            bloodGroup: obj.bloodgroup,
            nationality: obj.nationality,
            religion: obj.religion,
            dateOfMarriage: obj.dateofmarriage,
            noOfDependent: obj.noofdependent,
            spouse: obj.spouse,
            stdCode: obj.stdcode,
            phone: obj.phone,
            mobile: obj.mobile,
            internalId: obj.internalid,
            noticePeriodMonths: obj.noticeperiodmonths,
            probationPeriodMonths: obj.probationperiodmonths,
            confirmationDate: obj.confirmationdate,
            resigLetterDate: obj.resigletterdate,
            resigDateLwd: obj.resigdatelwd,
            resignationReason: obj.resignationreason,
            appraisalDate: obj.appraisaldate,
            dateOfDeath: obj.dateofdeath,
            commitmentCompletionDate: obj.commitmentcompletiondate,
            identityMark: obj.identitymark,
            reimbursementApplicable: toBoolean(obj.reimbursementapplicable),
            bankName: obj.bankname,
            bankBranch: obj.bankbranch,
            bankIfsc: obj.bankifsc,
            bankAddress: obj.bankaddress,
            nameAsPerAc: obj.nameasperac,
            salaryAcNumber: obj.salaryacnumber,
            paymentMode: obj.paymentmode,
            acType: obj.actype,
            bankRefNo: obj.bankrefno,
            wardCircleRange: obj.wardcirclerange,
            licPolicyNo: obj.licpolicyno,
            policyTerm: obj.policyterm,
            licId: obj.licid,
            annualRenewableDate: obj.annualrenewabledate,
            hraApplicable: toBoolean(obj.hraapplicable),
            bonusApplicable: toBoolean(obj.bonusapplicable),
            gratuityApplicable: toBoolean(obj.gratuityapplicable),
            lwfApplicable: toBoolean(obj.lwfapplicable),
            pfApplicable: toBoolean(obj.pfapplicable),
            physicallyHandicap: obj.physicallyhandicap,
            educationalQual: obj.educationalqual,
            registeredInPmrpy: toBoolean(obj.registeredinpmrpy),
            previousPfNo: obj.previouspfno,
            pfJoiningDate: obj.pfjoiningdate,
            pfLastDate: obj.pflastdate,
            salaryForPfOption: obj.salaryforpfoption,
            salaryForPf: obj.salaryforpf,
            minAmtPf: obj.minamtpf,
            pensionAppl: toBoolean(obj.pensionappl),
            pensionJoiningDate: obj.pensionjoiningdate,
            pensionOnHigherWages: toBoolean(obj.pensiononhigherwages),
            noLimit: toBoolean(obj.nolimit),
            esiApplicable: toBoolean(obj.esiapplicable),
            esiJoiningDate: obj.esijoiningdate,
            esiNo: obj.esino,
            esiLastDate: obj.esilastdate,
            salaryForEsiOption: obj.salaryforesioption,
            salaryForEsi: obj.salaryforesi,
            minAmtEsiContribution: obj.minamtesicontribution,
            dispensaryOrPanel: obj.dispensaryorpanel,
            recruitmentAgency: obj.recruitmentagency,
            bankMandate: obj.bankmandate,
            employmentStatus: obj.employmentstatus,
            lapTops: obj.laptops,
            companyVehicle: obj.companyvehicle,
            corpCreditCardNo: obj.corpcreditcardno,
            transportRoute: obj.transportroute,
            workLocation: obj.worklocation,
            reasonForLeaving: obj.reasonforleaving,
            service: obj.service,
            remarks: obj.remarks,
            branch: obj.branch || "",
            category: obj.category || "",
            designation: obj.designation || "",
            department: obj.department || "",
            scale: obj.scale || "",
            ptGroup: obj.ptgroup || "",
            shift: obj.shift || "",
            permanentAddress: {},
            correspondenceAddress: {},
            companyAssets: [],
            educationalQualifications: [],
            family: [],
            nominees: [],
            witnesses: [],
            experiences: [],
          };
        })
        .filter((e) => e.code && e.name && e.doj);

      if (importedEmployees.length === 0) {
        alert("No valid rows found (code, name, doj required).");
        return;
      }

      const newEmployees = importedEmployees.map((e, i) => ({
        ...e,
        id: lastId + i + 1,
      })) as Employee[];

      setEmployees((prev) => [...prev, ...newEmployees]);
      setShowImportModal(false);
      setFile(null);
      alert(`${newEmployees.length} employees imported!`);
    };
    reader.readAsBinaryString(file);
  };

  // ── Export ──
  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(
      employees.map((emp) => ({
        Code: emp.code,
        Name: emp.name,
        "Father's/Husband's Name": emp.fatherHusbandName,
        PAN: emp.pan,
        DOB: emp.dob,
        DOJ: emp.doj,
        DOR: emp.dor,
        UAN: emp.uan,
        "PF A/c No.": emp.pfAcNo,
        Email: emp.email,
        "NASSCOM Reg No.": emp.nasscomRegNo,
        Gender: emp.gender,
        "Marital Status": emp.maritalStatus,
        "Father's Name": emp.fathersName,
        "Mother's Name": emp.mothersName,
        Caste: emp.caste,
        "Blood Group": emp.bloodGroup,
        Nationality: emp.nationality,
        Religion: emp.religion,
        "Date of Marriage": emp.dateOfMarriage,
        "No. of Dependent": emp.noOfDependent,
        Spouse: emp.spouse,
        "STD Code": emp.stdCode,
        Phone: emp.phone,
        Mobile: emp.mobile,
        "Internal ID": emp.internalId,
        "Notice Period Months": emp.noticePeriodMonths,
        "Probation Period Months": emp.probationPeriodMonths,
        "Confirmation Date": emp.confirmationDate,
        "Resig. Letter Date": emp.resigLetterDate,
        "Resig. Date L.W.D.": emp.resigDateLwd,
        "Resignation Reason": emp.resignationReason,
        "Appraisal Date": emp.appraisalDate,
        "Date of Death": emp.dateOfDeath,
        "Commitment Completion Date": emp.commitmentCompletionDate,
        "Identity Mark": emp.identityMark,
        "Reimbursement Applicable": emp.reimbursementApplicable,
        "Bank Name": emp.bankName,
        "Bank Branch": emp.bankBranch,
        "Bank IFSC": emp.bankIfsc,
        "Bank Address": emp.bankAddress,
        "Name as per A/c": emp.nameAsPerAc,
        "Salary A/c Number": emp.salaryAcNumber,
        "Payment Mode": emp.paymentMode,
        "A/c Type": emp.acType,
        "Bank Ref No.": emp.bankRefNo,
        "Ward/Circle/Range": emp.wardCircleRange,
        "LIC Policy No.": emp.licPolicyNo,
        "Policy Term": emp.policyTerm,
        "LIC ID": emp.licId,
        "Annual Renewable Date": emp.annualRenewableDate,
        "HRA Applicable": emp.hraApplicable,
        "Bonus Applicable": emp.bonusApplicable,
        "Gratuity Applicable": emp.gratuityApplicable,
        "LWF Applicable": emp.lwfApplicable,
        "PF Applicable": emp.pfApplicable,
        "Physically Handicap": emp.physicallyHandicap,
        "Educational Qual.": emp.educationalQual,
        "Registered in PMRPY": emp.registeredInPmrpy,
        "Previous PF No.": emp.previousPfNo,
        "PF Joining Date": emp.pfJoiningDate,
        "PF Last Date": emp.pfLastDate,
        "Salary For PF Option": emp.salaryForPfOption,
        "Salary For PF": emp.salaryForPf,
        "Min. Amt PF": emp.minAmtPf,
        "Pension Appl.": emp.pensionAppl,
        "Pension Joining Date": emp.pensionJoiningDate,
        "Pension on Higher Wages": emp.pensionOnHigherWages,
        "No Limit": emp.noLimit,
        "ESI Applicable": emp.esiApplicable,
        "ESI Joining Date": emp.esiJoiningDate,
        "ESI No.": emp.esiNo,
        "ESI Last Date": emp.esiLastDate,
        "Salary For ESI Option": emp.salaryForEsiOption,
        "Salary For ESI": emp.salaryForEsi,
        "Min. Amt ESI Contribution": emp.minAmtEsiContribution,
        "Dispensary / Panel System": emp.dispensaryOrPanel,
        "Recruitment Agency": emp.recruitmentAgency,
        "Bank Mandate": emp.bankMandate,
        "Employment Status": emp.employmentStatus,
        "Lap Tops": emp.lapTops,
        "Company Vehicle": emp.companyVehicle,
        "Corp. Credit Card No.": emp.corpCreditCardNo,
        "Transport Route": emp.transportRoute,
        "Work Location": emp.workLocation,
        "Reason For Leaving": emp.reasonForLeaving,
        Service: emp.service,
        Remarks: emp.remarks,
        Branch: emp.branch,
        Category: emp.category,
        Designation: emp.designation,
        Department: emp.department,
        Scale: emp.scale,
        "PT Group": emp.ptGroup,
        Shift: emp.shift,
      }))
    );
    const wb = { Sheets: { data: ws }, SheetNames: ["data"] };
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const data = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    FileSaver.saveAs(data, `employees_${new Date().toISOString().split("T")[0]}.xlsx`);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setFile(e.target.files[0]);
  };

  // ── UI ──
  return (
    <GlobalLayout>
      <div className="p-4 sm:p-6 space-y-6">

        {/* ── FILTER CARD (8 dropdowns) ── */}
        <Card>
          <CardHeader className="bg-blue-50 p-4 rounded-t-lg">
            <CardTitle className="text-lg font-semibold">Filter Employees</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* 1. Branch */}
              <div>
                <Label htmlFor="branch">Branch</Label>
                <Select value={selectedBranch} onValueChange={setSelectedBranch}>
                  <SelectTrigger id="branch">
                    <SelectValue placeholder="All Branches" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Branches</SelectItem>
                    {branches.map((b) => (
                      <SelectItem key={b} value={b}>{b}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* 2. Category */}
              <div>
                <Label htmlFor="category">Category</Label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger id="category">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* 3. Department */}
              <div>
                <Label htmlFor="department">Department</Label>
                <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                  <SelectTrigger id="department">
                    <SelectValue placeholder="All Departments" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Departments</SelectItem>
                    {departments.map((d) => (
                      <SelectItem key={d} value={d}>{d}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* 4. Designation */}
              <div>
                <Label htmlFor="designation">Designation</Label>
                <Select value={selectedDesignation} onValueChange={setSelectedDesignation}>
                  <SelectTrigger id="designation">
                    <SelectValue placeholder="All Designations" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Designations</SelectItem>
                    {designations.map((d) => (
                      <SelectItem key={d} value={d}>{d}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* 5. Level */}
              <div>
                <Label htmlFor="level">Level</Label>
                <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                  <SelectTrigger id="level">
                    <SelectValue placeholder="All Levels" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Levels</SelectItem>
                    {levels.map((l) => (
                      <SelectItem key={l} value={l}>{l}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* 6. Grade */}
              <div>
                <Label htmlFor="grade">Grade</Label>
                <Select value={selectedGrade} onValueChange={setSelectedGrade}>
                  <SelectTrigger id="grade">
                    <SelectValue placeholder="All Grades" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Grades</SelectItem>
                    {grades.map((g) => (
                      <SelectItem key={g} value={g}>{g}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* 7. PT Group */}
              <div>
                <Label htmlFor="ptGroup">PT Group</Label>
                <Select value={selectedPtGroup} onValueChange={setSelectedPtGroup}>
                  <SelectTrigger id="ptGroup">
                    <SelectValue placeholder="All PT Groups" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All PT Groups</SelectItem>
                    {ptGroups.map((p) => (
                      <SelectItem key={p} value={p}>{p}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* 8. Shift */}
              <div>
                <Label htmlFor="shift">Shift</Label>
                <Select value={selectedShift} onValueChange={setSelectedShift}>
                  <SelectTrigger id="shift">
                    <SelectValue placeholder="All Shifts" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Shifts</SelectItem>
                    {shifts.map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Checkboxes */}
            <div className="flex flex-wrap items-center gap-4 mt-6">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="showAll"
                  checked={showAllEmployees}
                  onCheckedChange={(c) => setShowAllEmployees(c === true)}
                />
                <Label htmlFor="showAll">Show All Employees</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="includeResigned"
                  checked={includeResigned}
                  onCheckedChange={(c) => setIncludeResigned(c === true)}
                />
                <Label htmlFor="includeResigned">Include Resigned</Label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ── MAIN TABLE CARD ── */}
        <Card>
          <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <CardTitle className="text-lg sm:text-2xl">Employee Details</CardTitle>
            <div className="flex gap-2 flex-wrap">
              <Button onClick={() => setShowImportModal(true)} variant="outline">
                Import
              </Button>
              <Button onClick={exportToExcel} variant="outline">
                Export
              </Button>
              <Button onClick={() => { setForm({}); setOpen(true); }}>
                + Add Employee
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>S.N.</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Father's/Husband's</TableHead>
                    <TableHead>PAN</TableHead>
                    <TableHead>DOB</TableHead>
                    <TableHead>DOJ</TableHead>
                    <TableHead>DOR</TableHead>
                    <TableHead>UAN</TableHead>
                    <TableHead>PF A/c No.</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEmployees.length > 0 ? (
                    filteredEmployees.map((emp, i) => (
                      <TableRow key={emp.id}>
                        <TableCell>{i + 1}</TableCell>
                        <TableCell>{emp.code}</TableCell>
                        <TableCell>{emp.name}</TableCell>
                        <TableCell>{emp.fatherHusbandName}</TableCell>
                        <TableCell>{emp.pan}</TableCell>
                        <TableCell>{emp.dob}</TableCell>
                        <TableCell>{emp.doj}</TableCell>
                        <TableCell>{emp.dor}</TableCell>
                        <TableCell>{emp.uan}</TableCell>
                        <TableCell>{emp.pfAcNo}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => handleEdit(emp)}>
                              Modify
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => handleDelete(emp.id)}>
                              Delete
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={11} className="text-center py-8 text-gray-500">
                        No employees match the selected filters.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* ── ADD / EDIT DIALOG ── */}
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto p-0">
            <AddEmployee
              employee={form}
              onSubmit={handleSubmit}
              onCancel={() => {
                setForm({});
                setOpen(false);
              }}
            />
          </DialogContent>
        </Dialog>

        {/* ── IMPORT DIALOG ── */}
        <Dialog open={showImportModal} onOpenChange={setShowImportModal}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Import Employees from Excel</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Upload .xlsx file. Rows missing <strong>code</strong>, <strong>name</strong>, or <strong>doj</strong> will be skipped.
              </p>
              <div>
                <Label htmlFor="excel-file">Excel File</Label>
                <Input
                  id="excel-file"
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileChange}
                  className="mt-2"
                />
              </div>
            </div>
            <DialogFooter className="mt-4">
              <Button onClick={handleImport} disabled={!file}>
                Import
              </Button>
              <Button variant="outline" onClick={() => setShowImportModal(false)}>
                Cancel
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </GlobalLayout>
  );
}