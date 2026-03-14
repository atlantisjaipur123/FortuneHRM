"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import * as XLSX from "xlsx";
import * as FileSaver from "file-saver";
import { api } from "@/app/lib/api";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import AddEmployee from "@/components/add-employee";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { GlobalLayout } from "@/app/components/global-layout";
import { useCompanySetups } from "@/hooks/useCompanySetups"
const sanitizeForPrisma = (data: any) => {
  const sanitized = { ...data };

  // 1. Force UPPERCASE for Enums (Prisma/Postgres requirement)
  const enums = ['gender', 'maritalStatus', 'bloodGroup', 'religion', 'paymentMode', 'acType', 'employmentStatus'];
  enums.forEach(key => {
    if (sanitized[key]) sanitized[key] = sanitized[key].toUpperCase();
  });

  // 2. Map Blood Group Special Cases
  if (sanitized.bloodGroup) {
    sanitized.bloodGroup = sanitized.bloodGroup.replace('+', '_POSITIVE').replace('-', '_NEGATIVE');
  }

  // 3. Convert Strings to Numbers for Int/Float fields
  const numbers = ['noOfDependent', 'noticePeriodMonths', 'probationPeriodMonths', 'salaryForPf', 'minAmtPf', 'salaryForEsi', 'minAmtEsiContribution'];
  numbers.forEach(key => {
    if (sanitized[key]) sanitized[key] = Number(sanitized[key]);
  });
  // 4. FIX: Convert Date Strings to ISO format
  const dateFields = ['dob', 'doj', 'dor', 'dateOfMarriage', 'confirmationDate', 'pfJoiningDate', 'esiJoiningDate', 'annualRenewableDate'];
  dateFields.forEach(field => {
    if (sanitized[field] && sanitized[field] !== "") {
      sanitized[field] = new Date(sanitized[field]).toISOString();
    } else {
      delete sanitized[field]; // Don't send empty strings to Date fields
    }
  });
  // 5. FIX: Ensure Booleans are actual booleans
  const boolFields = ['reimbursementApplicable', 'hraApplicable', 'bonusApplicable', 'gratuityApplicable', 'lwfApplicable', 'pfApplicable', 'pensionAppl', 'esiApplicable'];
  boolFields.forEach(field => {
    if (sanitized[field] !== undefined) sanitized[field] = sanitized[field] === true || sanitized[field] === 'true';
  });
  const cleanAddr = (addr: any) => {
    if (addr && addr.state) {
      addr.state = addr.state.toUpperCase().replace(/\s+/g, '_');
    }
    return addr;
  };

  if (sanitized.permanentAddress) sanitized.permanentAddress = cleanAddr(sanitized.permanentAddress);
  if (sanitized.correspondenceAddress) sanitized.correspondenceAddress = cleanAddr(sanitized.correspondenceAddress);

  return sanitized;
};


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
  degree?: string;
  college?: string;
  subject?: string;
  year?: string;
  percentage?: string;
}

interface Employee {
  id: string;
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
  assets: Asset[];
  qualifications: Education[];
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
  level: string;
  ptGroup: string;
  shiftId: string;
}



// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
export default function EmployeeDetailsPage() {
  const { data: setups, loading: setupsLoading } = useCompanySetups()
  const router = useRouter()

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Partial<Employee>>({});
  const [showAllEmployees, setShowAllEmployees] = useState(true);
  const [includeResigned, setIncludeResigned] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [selectedBranches, setSelectedBranches] = useState<string[]>([])
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([])
  const [selectedDesignations, setSelectedDesignations] = useState<string[]>([])
  const [selectedLevels, setSelectedLevels] = useState<string[]>([])
  const [selectedGrades, setSelectedGrades] = useState<string[]>([])
  const [search, setSearch] = useState("");

  const [selectedShifts, setSelectedShifts] = useState<string[]>([])

  // ── Load employees from API ──
  async function loadEmployees() {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedBranches.length) {
        selectedBranches.forEach(b => params.append("branch", b))
      }

      if (selectedCategories.length) {
        selectedCategories.forEach(c => params.append("category", c))
      }

      if (selectedDepartments.length) {
        selectedDepartments.forEach(d => params.append("department", d))
      }

      if (selectedDesignations.length) {
        selectedDesignations.forEach(d => params.append("designation", d))
      }

      if (selectedLevels.length) {
        selectedLevels.forEach(l => params.append("level", l))
      }

      if (selectedGrades.length) {
        selectedGrades.forEach(g => params.append("grade", g))
      }


      if (selectedShifts.length) {
        selectedShifts.forEach(s => params.append("shift", s))
      }

      params.append("includeResigned", includeResigned.toString());

      const response = await api.get(`/api/employee-details?${params.toString()}`);
      const backendEmployees = response.employees || [];
      console.log("backendEmployees", backendEmployees)
      // Transform backend data to frontend format
      const transformedEmployees: Employee[] = backendEmployees.map((emp: any) => ({
        id: emp.id,
        code: emp.code,
        name: emp.name,
        fatherHusbandName: emp.fatherHusbandName || "",
        pan: emp.pan || "",
        dob: emp.dob ? new Date(emp.dob).toISOString().split("T")[0] : "",
        doj: emp.doj ? new Date(emp.doj).toISOString().split("T")[0] : "",
        dor: emp.dor ? new Date(emp.dor).toISOString().split("T")[0] : "",
        uan: emp.uan || "",
        pfAcNo: emp.pfAcNo || "",
        email: emp.email || "",
        nasscomRegNo: emp.nasscomRegNo || "",
        gender: emp.gender || "MALE",
        maritalStatus: emp.maritalStatus || "UNMARRIED",
        fathersName: emp.fathersName || "",
        mothersName: emp.mothersName || "",
        caste: emp.caste || "GEN",
        bloodGroup: emp.bloodGroup || "",
        nationality: emp.nationality || "Resident",
        religion: emp.religion || "HINDU",
        dateOfMarriage: emp.dateOfMarriage ? new Date(emp.dateOfMarriage).toISOString().split("T")[0] : "",
        noOfDependent: emp.noOfDependent?.toString() || "",
        spouse: emp.spouse || "",
        stdCode: emp.stdCode || "",
        phone: emp.phone || "",
        mobile: emp.mobile || "",
        internalId: emp.internalId || "",
        noticePeriodMonths: emp.noticePeriodMonths?.toString() || "",
        probationPeriodMonths: emp.probationPeriodMonths?.toString() || "",
        confirmationDate: emp.confirmationDate ? new Date(emp.confirmationDate).toISOString().split("T")[0] : "",
        resigLetterDate: emp.resigLetterDate ? new Date(emp.resigLetterDate).toISOString().split("T")[0] : "",
        resigDateLwd: emp.resigDateLwd ? new Date(emp.resigDateLwd).toISOString().split("T")[0] : "",
        resignationReason: emp.resignationReason || "",
        appraisalDate: emp.appraisalDate ? new Date(emp.appraisalDate).toISOString().split("T")[0] : "",
        dateOfDeath: emp.dateOfDeath ? new Date(emp.dateOfDeath).toISOString().split("T")[0] : "",
        commitmentCompletionDate: emp.commitmentCompletionDate ? new Date(emp.commitmentCompletionDate).toISOString().split("T")[0] : "",
        identityMark: emp.identityMark || "",
        reimbursementApplicable: emp.reimbursementApplicable || false,
        permanentAddress: emp.permanentAddress || {},
        correspondenceAddress: emp.correspondenceAddress || {},
        bankName: emp.bankName || "",
        bankBranch: emp.bankBranch || "",
        bankIfsc: emp.bankIfsc || "",
        bankAddress: emp.bankAddress || "",
        nameAsPerAc: emp.nameAsPerAc || "",
        salaryAcNumber: emp.salaryAcNumber || "",
        paymentMode: emp.paymentMode || "TRANSFER",
        acType: emp.acType || "ECS",
        bankRefNo: emp.bankRefNo || "",
        wardCircleRange: emp.wardCircleRange || "",
        licPolicyNo: emp.licPolicyNo || "",
        policyTerm: emp.policyTerm || "",
        licId: emp.licId || "",
        annualRenewableDate: emp.annualRenewableDate ? new Date(emp.annualRenewableDate).toISOString().split("T")[0] : "",
        hraApplicable: emp.hraApplicable || false,
        bonusApplicable: emp.bonusApplicable || false,
        gratuityApplicable: emp.gratuityApplicable || false,
        lwfApplicable: emp.lwfApplicable || false,
        pfApplicable: emp.pfApplicable || false,
        physicallyHandicap: emp.physicallyHandicap || "NO",
        educationalQual: emp.educationalQual || "",
        registeredInPmrpy: emp.registeredInPmrpy || false,
        previousPfNo: emp.previousPfNo || "",
        pfJoiningDate: emp.pfJoiningDate ? new Date(emp.pfJoiningDate).toISOString().split("T")[0] : "",
        pfLastDate: emp.pfLastDate ? new Date(emp.pfLastDate).toISOString().split("T")[0] : "",
        salaryForPfOption: emp.salaryForPfOption || "",
        salaryForPf: emp.salaryForPf?.toString() || "",
        minAmtPf: emp.minAmtPf?.toString() || "",
        pensionAppl: emp.pensionAppl || false,
        pensionJoiningDate: emp.pensionJoiningDate ? new Date(emp.pensionJoiningDate).toISOString().split("T")[0] : "",
        pensionOnHigherWages: emp.pensionOnHigherWages || false,
        noLimit: emp.noLimit || false,
        esiApplicable: emp.esiApplicable || false,
        esiJoiningDate: emp.esiJoiningDate ? new Date(emp.esiJoiningDate).toISOString().split("T")[0] : "",
        esiNo: emp.esiNo || "",
        esiLastDate: emp.esiLastDate ? new Date(emp.esiLastDate).toISOString().split("T")[0] : "",
        salaryForEsiOption: emp.salaryForEsiOption || "",
        salaryForEsi: emp.salaryForEsi?.toString() || "",
        minAmtEsiContribution: emp.minAmtEsiContribution?.toString() || "",
        dispensaryOrPanel: emp.dispensaryOrPanel || "",
        recruitmentAgency: emp.recruitmentAgency || "",
        bankMandate: emp.bankMandate || "",
        employmentStatus: emp.employmentStatus || "",
        lapTops: emp.lapTops || "",
        companyVehicle: emp.companyVehicle || "",
        corpCreditCardNo: emp.corpCreditCardNo || "",
        transportRoute: emp.transportRoute || "",
        workLocation: emp.workLocation || "",
        assets: [],
        qualifications: [],
        reasonForLeaving: emp.reasonForLeaving || "",
        service: emp.service || "",
        remarks: emp.remarks || "",
        family: [],
        nominees: [],
        witnesses: [],
        previousYears: "",
        previousMonths: "",
        experiences: [],
        branch: emp.branch || "",
        category: emp.category || "",
        designation: emp.designation || "",
        department: emp.department || "",
        level: emp.level || "",
        ptGroup: emp.ptGroup || "",
        shiftId: emp.shiftId || "",
      }));

      setEmployees(transformedEmployees as unknown as Employee[]);
    } catch (error: any) {
      console.error("Failed to load employees:", error);
      alert(error.message || "Failed to load employees");
    } finally {
      setLoading(false);
    }
  }

  // ── Load employees from API when filters change ──
  useEffect(() => {
    loadEmployees();
  }, [
    selectedBranches,
    selectedCategories,
    selectedDepartments,
    selectedDesignations,
    selectedLevels,
    selectedGrades,
    selectedShifts,
    includeResigned,
  ]);
  const filteredEmployees = useMemo(() => {
    if (!search.trim()) return employees;

    const term = search.toLowerCase();

    return employees.filter(emp =>
      emp.name?.toLowerCase().includes(term) ||
      emp.code?.toLowerCase().includes(term)
    );
  }, [employees, search]);



  // ── Filtered employees (real-time) ──

  const cleanArray = (v: any) => Array.isArray(v) ? v : [];

  const cleanAddress = (v: any) =>
    v && typeof v === "object" && Object.keys(v).length > 0 ? v : null;

  const cleanSalary = (s: any) =>
    s && s.mode && s.inputAmount
      ? {
        mode: String(s.mode).toUpperCase(),
        inputAmount: Number(s.inputAmount),
        selectedHeadIds: Array.isArray(s.selectedHeadIds) ? s.selectedHeadIds : []
      }
      : null;

  // ── CRUD ──
  // ================= DEBUG INSPECTOR =================
  const inspect = (label: string, data: any) => {
    console.log(`\n================ ${label} ================`);
    console.log("TYPE:", typeof data);
    console.log("IS ARRAY:", Array.isArray(data));
    console.dir(data, { depth: null });
  };
  // ===================================================


  const handleSubmit = async (formData: any) => {
    console.log("🚀 Starting Submission...");

    try {
      setLoading(true);

      // ─────────────────────────────────────────────────────────────
      // Child (AddEmployee) now sends PERFECT structure:
      // { employee: {code, name, permanentAddress, ...}, salary, qualifications, family, ... }
      // We just need to sanitize + clean relations — NO double nesting
      // ─────────────────────────────────────────────────────────────

      const {
        employee: rawEmployee = {},
        salary,
        qualifications = [],
        experiences = [],
        family = [],
        nominees = [],
        witnesses = [],
        // companyAssets not sent by child yet → keep empty
      } = formData;

      // 1. Sanitize the main employee object (dates, enums, numbers, booleans)
      const employeeData = sanitizeForPrisma(rawEmployee);

      // 2. Clean relations (exactly like before)
      const relations = {
        salaryConfig: salary ? cleanSalary(salary) : null,

        qualifications: cleanArray(qualifications).map(({ id, ...rest }: any) => rest),

        experiences: cleanArray(experiences).map(({ id, ...rest }: any) => ({
          ...rest,
          from: rest.from ? new Date(rest.from).toISOString() : null,
          to: rest.to ? new Date(rest.to).toISOString() : null,
        })),

        familyMembers: cleanArray(family).map(({ id, ...rest }: any) => rest),

        nominees: cleanArray(nominees).map(({ id, ...rest }: any) => ({
          ...rest,
          gratuityShare: rest.gratuityShare ? parseFloat(rest.gratuityShare) : null,
        })),

        witnesses: cleanArray(witnesses).map(({ id, ...rest }: any) => rest),

        assets: [], // child doesn't send assets yet

        permanentAddress: cleanAddress(employeeData.permanentAddress),
        correspondenceAddress: cleanAddress(employeeData.correspondenceAddress),
      };

      // 3. FINAL PAYLOAD — single "employee" level (this is what backend expects)
      const finalPayload = {
        employee: {
          ...employeeData,
          permanentAddress: relations.permanentAddress,
          correspondenceAddress: relations.correspondenceAddress,
        },
        salary: relations.salaryConfig,
        qualifications: relations.qualifications,
        experiences: relations.experiences,
        family: relations.familyMembers,
        nominees: relations.nominees,
        witnesses: relations.witnesses,
        companyAssets: relations.assets,
      };

      console.log("📦 FINAL PAYLOAD (to API):", JSON.stringify(finalPayload, null, 2));

      // 4. Create or Update
      const isUpdate = !!rawEmployee?.id;
      if (isUpdate) {
        // Update
        await api.put("/api/employee-details", {
          id: rawEmployee.id,
          ...finalPayload,
        });
      } else {
        // Create
        const postData = { ...finalPayload };
        delete (postData.employee as any).id; // safety
        await api.post("/api/employee-details", postData);
      }

      alert(`Employee ${isUpdate ? "updated" : "created"} successfully!`);
      setOpen(false);
      loadEmployees(); // Refresh table
    } catch (error: any) {
      console.error("❌ Submission Failed:", error);
      alert(error.response?.data?.error || error.message || "Check console for details");
    } finally {
      setLoading(false);
    }
  };
  // ================= MODIFY EMPLOYEE (REAL DB FETCH) =================
  const handleEdit = async (id: string) => {
    try {
      setLoading(true);

      // 🔥 1. FETCH FULL EMPLOYEE FROM DATABASE
      const res = await api.get(`/api/employee-details/${id}`);

      if (!res?.employee) {
        alert("Employee not found in database");
        return;
      }

      const emp = res.employee;
      console.log("FULL EMPLOYEE FROM DB:", emp);

      // 🔥 2. Convert DB data → Form format
      const formatted: any = {
        ...emp,

        // Dates for input fields
        dob: emp.dob || "",
        doj: emp.doj || "",
        dor: emp.dor || "",
        dateOfMarriage: emp.dateOfMarriage || "",
        confirmationDate: emp.confirmationDate || "",
        pfJoiningDate: emp.pfJoiningDate || "",
        esiJoiningDate: emp.esiJoiningDate || "",

        // Relations
        family: emp.familyMembers || [],
        nominees: emp.nominees || [],
        witnesses: emp.witnesses || [],
        assets: emp.assets || [],
        qualifications: emp.qualifications || [],
        experiences: emp.experiences || [],

        // Address
        permanentAddress: emp.permanentAddress || {},
        correspondenceAddress: emp.correspondenceAddress || {},

        // 🔥 Salary Prefill
        salary: emp.salaryConfig
          ? {
            mode: emp.salaryConfig.salaryMode,
            inputAmount: emp.salaryConfig.inputAmount,
            selectedHeadIds: emp.salaryBreakdown?.map((s: any) => s.salaryHeadId) || [],
            breakdown: emp.salaryBreakdown || [],
          }
          : null,
      };

      // 🔥 3. Put into form state
      setForm(formatted);

      // 🔥 4. Open modal
      setOpen(true);

    } catch (error: any) {
      console.error("Modify Load Failed:", error);
      alert(error.response?.data?.error || "Failed to load employee");
    } finally {
      setLoading(false);
    }
  };


  // ================= DELETE EMPLOYEE =================
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this employee?")) return;

    try {
      await api.delete(`/api/employee-details/${id}`);
      alert("Employee deleted successfully");
      loadEmployees();
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.error || "Delete failed");
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
      const lastId = Math.max(...employees.map((e) => parseInt(e.id, 10)), 0);
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
            assets: [],
            qualifications: [],
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
        photo: (e as any).photo || "",
        previousYears: (e as any).previousYears || "",
        previousMonths: (e as any).previousMonths || "",
      })) as unknown as Employee[];

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
        "PT Group": emp.ptGroup,
        ShiftId: emp.shiftId,
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
                <Label>Branch</Label>

                <Popover>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className="w-full justify-start bg-gray-200 p-2 rounded-md text-sm"
                    >
                      {selectedBranches.length === 0
                        ? "All Branches"
                        : `${selectedBranches.length} selected`}
                    </button>
                  </PopoverTrigger>


                  <PopoverContent
                    className="w-64 max-h-64 overflow-y-auto"
                    align="start"
                  >
                    <div className="space-y-2">
                      {setups?.branches?.map((b: any) => {
                        const checked = selectedBranches.includes(b.name)

                        return (
                          <div
                            key={b.id}
                            className="flex items-center gap-2"
                          >
                            <Checkbox
                              checked={checked}
                              onCheckedChange={(v) => {
                                setSelectedBranches((prev) =>
                                  v
                                    ? [...prev, b.name]
                                    : prev.filter((x) => x !== b.name)
                                )
                              }}
                            />
                            <span className="text-sm">{b.name}</span>
                          </div>
                        )
                      })}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <Label>Category</Label>

                <Popover>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className="w-full justify-start bg-gray-200 p-2 rounded-md text-sm"
                    >
                      {selectedCategories.length === 0
                        ? "All Categories"
                        : `${selectedCategories.length} selected`}
                    </button>
                  </PopoverTrigger>

                  <PopoverContent
                    className="w-64 max-h-64 overflow-y-auto"
                    align="start"
                  >
                    <div className="space-y-2">
                      {setups?.categories?.map((c: any) => {
                        const checked = selectedCategories.includes(c.name)

                        return (
                          <div key={c.id} className="flex items-center gap-2">
                            <Checkbox
                              checked={checked}
                              onCheckedChange={(v) => {
                                setSelectedCategories((prev) =>
                                  v
                                    ? [...prev, c.name]
                                    : prev.filter((x) => x !== c.name)
                                )
                              }}
                            />
                            <span className="text-sm">{c.name}</span>
                          </div>
                        )
                      })}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>



              {/* 3. Department */}
              <div>
                <Label>Department</Label>

                <Popover>
                  <PopoverTrigger asChild >
                    <button type="button" className="w-full justify-start bg-gray-200 p-2 rounded-md text-sm">
                      {selectedDepartments.length === 0
                        ? "All Departments"
                        : `${selectedDepartments.length} selected`}
                    </button>
                  </PopoverTrigger>

                  <PopoverContent className="w-64 max-h-64 overflow-y-auto" align="start">
                    {setups?.departments?.map((d: any) => (
                      <div key={d.id} className="flex items-center gap-2">
                        <Checkbox
                          checked={selectedDepartments.includes(d.name)}
                          onCheckedChange={(v) =>
                            setSelectedDepartments(prev =>
                              v ? [...prev, d.name] : prev.filter(x => x !== d.name)
                            )
                          }
                        />
                        <span className="text-sm">{d.name}</span>
                      </div>
                    ))}
                  </PopoverContent>
                </Popover>
              </div>

              {/* 4. Designation */}
              <div>
                <Label>Designation</Label>

                <Popover>
                  <PopoverTrigger asChild>
                    <button type="button" className="w-full justify-start bg-gray-200 p-2 rounded-md text-sm">
                      {selectedDesignations.length === 0
                        ? "All Designations"
                        : `${selectedDesignations.length} selected`}
                    </button>
                  </PopoverTrigger>

                  <PopoverContent className="w-64 max-h-64 overflow-y-auto" align="start">
                    {setups?.designations?.map((d: any) => (
                      <div key={d.id} className="flex items-center gap-2">
                        <Checkbox
                          checked={selectedDesignations.includes(d.name)}
                          onCheckedChange={(v) =>
                            setSelectedDesignations(prev =>
                              v ? [...prev, d.name] : prev.filter(x => x !== d.name)
                            )
                          }
                        />
                        <span className="text-sm">{d.name}</span>
                      </div>
                    ))}
                  </PopoverContent>
                </Popover>
              </div>


              {/* 5. Level */}
              <div>
                <Label>Level</Label>

                <Popover>
                  <PopoverTrigger asChild>
                    <button type="button" className="w-full justify-start bg-gray-200 p-2 rounded-md text-sm">
                      {selectedLevels.length === 0
                        ? "All Levels"
                        : `${selectedLevels.length} selected`}
                    </button>
                  </PopoverTrigger>

                  <PopoverContent className="w-64 max-h-64 overflow-y-auto" align="start">
                    {setups?.levels?.map((l: any) => (
                      <div key={l.id} className="flex items-center gap-2">
                        <Checkbox
                          checked={selectedLevels.includes(l.name)}
                          onCheckedChange={(v) =>
                            setSelectedLevels(prev =>
                              v ? [...prev, l.name] : prev.filter(x => x !== l.name)
                            )
                          }
                        />
                        <span className="text-sm">{l.name}</span>
                      </div>
                    ))}
                  </PopoverContent>
                </Popover>
              </div>


              {/* 6. Grade */}
              <div>
                <Label>Grade</Label>

                <Popover>
                  <PopoverTrigger asChild>
                    <button type="button" className="w-full justify-start bg-gray-200 p-2 rounded-md text-sm">
                      {selectedGrades.length === 0
                        ? "All Grades"
                        : `${selectedGrades.length} selected`}
                    </button>
                  </PopoverTrigger>

                  <PopoverContent className="w-64 max-h-64 overflow-y-auto" align="start">
                    {setups?.grades?.map((g: any) => (
                      <div key={g.id} className="flex items-center gap-2">
                        <Checkbox
                          checked={selectedGrades.includes(g.name)}
                          onCheckedChange={(v) =>
                            setSelectedGrades(prev =>
                              v ? [...prev, g.name] : prev.filter(x => x !== g.name)
                            )
                          }
                        />
                        <span className="text-sm">{g.name}</span>
                      </div>
                    ))}
                  </PopoverContent>
                </Popover>
              </div>

            </div> {/* END FILTER GRID */}

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
          <CardHeader className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
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
            </div>

            {/* 🔍 SEARCH BAR */}
            <div className="max-w-md">
              <Input
                placeholder="Search by Employee Name or Code..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-white"
              />
            </div>
          </CardHeader>

          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-gray-500">Loading employees...</div>
            ) : (
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
                          <TableCell>{emp.id}</TableCell>
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
                              <Button size="sm" variant="outline" onClick={() => handleEdit(emp.id)}>
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

            )}
          </CardContent>
        </Card>

        {/* ── ADD / EDIT DIALOG ── */}
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto p-0">
            <AddEmployee
              employee={form}
              onSubmit={handleSubmit}
              onCancel={() => {
                setForm({}); // Reset form when canceling
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