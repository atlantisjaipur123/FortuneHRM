"use client";

import { useState, useEffect } from "react";
import { calculateSalary } from "@/app/lib/calculateSalary";
import { useCompanySetups } from "@/hooks/useCompanySetups";
const INDIAN_STATES = [
  "ANDHRA_PRADESH",
  "ARUNACHAL_PRADESH",
  "ASSAM",
  "BIHAR",
  "CHHATTISGARH",
  "GOA",
  "GUJARAT",
  "HARYANA",
  "HIMACHAL_PRADESH",
  "JHARKHAND",
  "KARNATAKA",
  "KERALA",
  "MADHYA_PRADESH",
  "MAHARASHTRA",
  "MANIPUR",
  "MEGHALAYA",
  "MIZORAM",
  "NAGALAND",
  "ODISHA",
  "PUNJAB",
  "RAJASTHAN",
  "SIKKIM",
  "TAMIL_NADU",
  "TELANGANA",
  "TRIPURA",
  "UTTAR_PRADESH",
  "UTTARAKHAND",
  "WEST_BENGAL",
  "DELHI",
  "JAMMU_AND_KASHMIR",
  "LADAKH",
  "CHANDIGARH",
  "PUDUCHERRY",
  "LAKSHADWEEP",
  "ANDAMAN_AND_NICOBAR_ISLANDS",
  "DADRA_AND_NAGAR_HAVELI_AND_DAMAN_AND_DIU"

];



type AddEmployeeProps = {
  employee?: any;
  onSubmit?: (payload: any) => void | Promise<void>;
  onCancel?: () => void;
};

const AddEmployee = ({ employee: employeeProp, onSubmit, onCancel }: AddEmployeeProps) => {
  const [activeTab, setActiveTab] = useState("Personal");
  const { data: setups, loading: setupsLoading } = useCompanySetups();
  useEffect(() => {
    if (setups) {
      console.log("------- REAL DB SETUPS -------");
      console.log(setups);
      console.log("------------------------------");
    }
  }, [setups]);

  const tabs = [
    "Personal",
    "Office details",
    "Financial",
    "Qualification",
    "Salary",
    "Other",
    "Family",
    "Nominee(s)",
    "Witness",
    "Experience",
  ];
  // DEMO SALARY HEADS (No DB, No API)

  // DEMO OFFICE SETUP DATA (No DB, No API)
  const [isSameAsAbove, setIsSameAsAbove] = useState(false);

  const MAX_UPLOAD_SIZE = 50 * 1024; // 50 KB
  const [isSaving, setIsSaving] = useState(false);
  const [employee, setEmployee] = useState<any>({
    // ================= PERSONAL TAB =================
    code: "",
    name: "",
    gender: "MALE",
    maritalStatus: "UNMARRIED",
    fathersName: "",
    mothersName: "",
    spouse: "",
    dob: "",
    dateOfMarriage: "",
    bloodGroup: "",
    nationality: "Indian",
    religion: "HINDU",
    caste: "GEN",
    noOfDependent: "",
    email: "",
    mobile: "",
    pan: "",
    aadhaar: "",
    nasscomRegNo: "",
    internalId: "",
    resignationReason: "",
    reasonForLeaving: "",
    fatherHusbandName: "",
    emergencyContact: "",
    emergencyPhone: "",
    identityMark: "",
    photo: "",
    stdCode: "",
    scale: "",
    ptGroup: "",
    shiftId: "",
    previousPfNo: "",
    salaryForEsiOption: "",
    salaryForEsi: "",

    // ================= OFFICE DETAILS TAB =================
    branch: "",
    department: "",
    designation: "",
    level: "",
    grade: "",
    category: "",
    attendanceType: "",

    // ================= QUALIFICATION & EXPERIENCE (Shared) =================
    educationalQualification: "",

    // ================= FINANCIAL TAB =================
    // Bank Details
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
    // Insurance/LIC
    licPolicyNo: "",
    policyTerm: "",
    licId: "",
    annualRenewableDate: "",
    // Applicability Flags
    reimbursementApplicable: false,
    hraApplicable: false,
    bonusApplicable: false,
    gratuityApplicable: false,
    lwfApplicable: false,
    pfApplicable: false,
    // PF Details
    pfAcNo: "",
    pfJoiningDate: "",
    pfLastDate: "",
    salaryForPfOption: "ACTUAL",
    salaryForPf: "",
    minAmtPf: "",
    pensionAppl: false,
    pensionJoiningDate: "",
    noLimit: false,
    pensionOnHigherWages: false,
    // ESI Details
    esiApplicable: false,
    esiJoiningDate: "",
    esiLastDate: "",
    esiNo: "",
    minAmtEsiContribution: "",
    dispensaryOrPanel: "Dispensary",
    // Handicap & PMRPY
    physicallyHandicap: "NO",
    registeredInPmrpy: false,

    // ================= OTHER TAB =================
    recruitmentAgency: "",
    bankMandate: "",
    employmentStatus: "ACTIVE",
    lapTops: "",
    companyVehicle: "",
    corpCreditCardNo: "",
    transportRoute: "",
    workLocation: "",
    service: "",
    remarks: "",

    // ================= EMPLOYMENT DATES (Shared Across Tabs) =================
    doj: "",
    dor: "",
    noticePeriodMonths: "",
    probationPeriodMonths: "",
    confirmationDate: "",
    resigLetterDate: "",
    resigDateLwd: "",
    appraisalDate: "",
    commitmentCompletionDate: "",
    dateOfDeath: "",

    // ================= ADDRESSES =================
    permanentAddress: {
      flat: "",
      building: "",
      area: "",
      road: "",
      city: "",
      district: "",
      state: "",
      pin: "",
    },
    correspondenceAddress: {
      flat: "",
      building: "",
      area: "",
      road: "",
      city: "",
      district: "",
      state: "",
      pin: "",
    },

    // ================= ARRAYS (Relations) =================
    family: [],
    nominees: [],
    qualifications: [],
    witnesses: [],
    experiences: [],
  });

  // Removed totalExperience state
  const tableInput = "w-full h-9 px-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-400";
  const tableTextarea = "w-full px-2 py-1 text-sm border border-gray-300 rounded resize-none focus:outline-none focus:ring-1 focus:ring-blue-400";

  // Helper to update nested address fields
  const handleAddressChange = (type: "permanentAddress" | "correspondenceAddress", field: string, value: string) => {
    setEmployee((prev: any) => ({
      ...prev,
      [type]: { ...prev[type], [field]: value },
    }));
  };

  // ================= 1. SYNC "SAME AS ABOVE" =================
  useEffect(() => {
    if (!isSameAsAbove) return;

    setEmployee((prev: any) => ({
      ...prev,
      correspondenceAddress: { ...prev.permanentAddress },
    }));
  }, [isSameAsAbove, employee.permanentAddress]);

  // ================= 3. LOAD EMPLOYEE DATA WHEN PROP CHANGES (FOR EDITING) =================
  // ✅ FIXED EDIT MODE + INITIAL CHECKBOX LOGIC
  useEffect(() => {
    if (employeeProp && Object.keys(employeeProp).length > 0) {
      const cloned = JSON.parse(JSON.stringify(employeeProp));

      // Ensure address objects are complete
      cloned.permanentAddress = {
        flat: cloned.permanentAddress?.flat || "",
        building: cloned.permanentAddress?.building || "",
        area: cloned.permanentAddress?.area || "",
        road: cloned.permanentAddress?.road || "",
        city: cloned.permanentAddress?.city || "",
        district: cloned.permanentAddress?.district || "",
        state: cloned.permanentAddress?.state || "",
        pin: cloned.permanentAddress?.pin || "",
      };

      cloned.correspondenceAddress = {
        flat: cloned.correspondenceAddress?.flat || "",
        building: cloned.correspondenceAddress?.building || "",
        area: cloned.correspondenceAddress?.area || "",
        road: cloned.correspondenceAddress?.road || "",
        city: cloned.correspondenceAddress?.city || "",
        district: cloned.correspondenceAddress?.district || "",
        state: cloned.correspondenceAddress?.state || "",
        pin: cloned.correspondenceAddress?.pin || "",
      };

      // 🔥 CRITICAL: Auto-set checkbox based on real data
      const p = cloned.permanentAddress;
      const c = cloned.correspondenceAddress;
      const addressesMatch =
        p.flat === c.flat &&
        p.building === c.building &&
        p.area === c.area &&
        p.road === c.road &&
        p.city === c.city &&
        p.district === c.district &&
        p.state === c.state &&
        p.pin === c.pin;

      setIsSameAsAbove(addressesMatch);

      // Normalize Qualifications (Backend: percentage/validityYear -> Frontend: score/degreeValidityYear)
      if (cloned.qualifications) {
        cloned.qualifications = cloned.qualifications.map((q: any) => ({
          ...q,
          score: q.percentage || q.cgpa || "",
          degreeValidityYear: q.validityYear || "",
        }));
      }

      // Normalize Family (Backend: residingWith -> Frontend: residing)
      if (cloned.family) {
        cloned.family = cloned.family.map((f: any) => ({
          ...f,
          residing: f.residingWith,
        }));
      }

      // Normalize Experiences (Format dates for <input type="date">)
      if (cloned.experiences) {
        cloned.experiences = cloned.experiences.map((exp: any) => ({
          ...exp,
          from: exp.from ? new Date(exp.from).toISOString().split("T")[0] : "",
          to: exp.to ? new Date(exp.to).toISOString().split("T")[0] : "",
        }));
      }

      setEmployee(cloned);

      // Salary prefill (unchanged)
      if (cloned.salary) {
        setSalaryMode(cloned.salary.mode || "CTC");
        setSalaryAmount(cloned.salary.inputAmount || 0);
        setSelectedHeadIds(cloned.salary.selectedHeadIds || []);
      }
    } else {
      // New employee reset
      setEmployee({
        permanentAddress: { flat: "", building: "", area: "", road: "", city: "", district: "", state: "", pin: "" },
        correspondenceAddress: { flat: "", building: "", area: "", road: "", city: "", district: "", state: "", pin: "" },
        family: [],
        nominees: [],
        qualifications: [],
        witnesses: [],
        experiences: [],
      });
      setIsSameAsAbove(false);
      setSalaryMode("CTC");
      setSalaryAmount(0);
      setSelectedHeadIds([]);
    }
  }, [employeeProp]);



  type SalaryMode = "CTC" | "GROSS";
  const [salaryMode, setSalaryMode] = useState<SalaryMode>("CTC");
  const [salaryAmount, setSalaryAmount] = useState<number>(0);
  const [salaryError, setSalaryError] = useState<string | null>(null);



  const [salaryHeads, setSalaryHeads] = useState<any[]>([]);
  useEffect(() => {
    async function loadSalaryHeads() {
      try {
        // Get company ID from localStorage
        const selectedCompany = localStorage.getItem("selectedCompany");
        if (!selectedCompany) {
          console.warn("No company selected");
          setSalaryHeads([]);
          setSelectedHeadIds([]);
          return;
        }

        const company = JSON.parse(selectedCompany);
        const companyId = company?.id;

        if (!companyId) {
          console.warn("Invalid company data");
          setSalaryHeads([]);
          setSelectedHeadIds([]);
          return;
        }

        // Fetch salary heads with company ID in header
        const res = await fetch("/api/salary-head", {
          headers: {
            "x-company-id": companyId,
          },
        });

        if (!res.ok) {
          throw new Error(`Failed to fetch salary heads: ${res.status} ${res.statusText}`);
        }

        const data = await res.json();
        const heads = data.salaryHeads || [];

        if (heads.length > 0) {
          console.log("Loaded salary heads:", heads.length);
        }

        setSalaryHeads(heads);
        // Only auto-select all heads if there are heads available
        if (heads.length > 0) {
          setSelectedHeadIds(heads.map((h: any) => h.id));
        }
      } catch (err) {
        console.error("Failed to load salary heads", err);
        // Set empty array on error to prevent UI issues
        setSalaryHeads([]);
        setSelectedHeadIds([]);
      }
    }

    loadSalaryHeads();
  }, []);

  // Fetch PF and ESI rules
  useEffect(() => {
    async function loadPFEsiRules() {
      try {
        const selectedCompany = localStorage.getItem("selectedCompany");
        if (!selectedCompany) {
          return;
        }

        const company = JSON.parse(selectedCompany);
        const companyId = company?.id;

        if (!companyId) {
          return;
        }

        // Fetch PF rule
        const pfRes = await fetch(`/api/Pf-Esi?rateType=PF`, {
          headers: {
            "x-company-id": companyId,
          },
        });
        if (pfRes.ok) {
          const pfData = await pfRes.json();
          if (pfData.data && pfData.data.length > 0) {
            // Get the most recent active rule
            setPfRule(pfData.data[0]);
          }
        }

        // Fetch ESI rule
        const esiRes = await fetch(`/api/Pf-Esi?rateType=ESI`, {
          headers: {
            "x-company-id": companyId,
          },
        });
        if (esiRes.ok) {
          const esiData = await esiRes.json();
          if (esiData.data && esiData.data.length > 0) {
            // Get the most recent active rule
            setEsiRule(esiData.data[0]);
          }
        }
      } catch (err) {
        console.error("Failed to load PF/ESI rules", err);
      }
    }

    loadPFEsiRules();
  }, []);



  const [selectedHeadIds, setSelectedHeadIds] = useState<string[]>([]);


  const [pfRule, setPfRule] = useState<any>(null);
  const [esiRule, setEsiRule] = useState<any>(null);
  const [calculationTotals, setCalculationTotals] = useState<any>(null);

  const [calculatedRows, setCalculatedRows] = useState<any[]>([]);


  const num = (v: any) => (v === null || v === undefined ? 0 : Number(v));




  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // ── Per-field validation (returns error message or empty string) ──
  const validateField = (field: string, value: any): string => {
    const v = value == null ? "" : String(value).trim();
    switch (field) {
      case "code":
        if (!v) return "Employee Code is required.";
        if (v.length > 20) return "Max 20 characters.";
        return "";
      case "name":
        if (!v) return "Employee Name is required.";
        return "";
      case "doj":
        if (!v) return "Date of Joining is required.";
        { const d = new Date(v); if (isNaN(d.getTime())) return "Invalid date."; const y = d.getFullYear(); if (y < 1950 || y > 2099) return "Year must be 1950–2099."; }
        return "";
      case "pan":
        if (!v) return "";
        if (v.length !== 10 || !/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(v.toUpperCase())) return "Format: ABCDE1234F";
        return "";
      case "aadhaar":
        if (!v) return "";
        if (!/^\d{12}$/.test(v.replace(/\D/g, ""))) return "Must be 12 digits.";
        return "";
      case "uan":
        if (!v) return "";
        if (!/^\d{12}$/.test(v.replace(/\D/g, ""))) return "Must be 12 digits.";
        return "";
      case "mobile":
        if (!v) return "";
        if (!/^\d{10}$/.test(v.replace(/\D/g, ""))) return "Must be 10 digits.";
        return "";
      case "email":
        if (!v) return "";
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return "Invalid email.";
        return "";
      case "bankIfsc":
        if (!v) return "";
        if (v.replace(/[^A-Za-z0-9]/g, "").length !== 11) return "Must be 11 chars.";
        return "";
      case "noOfDependent":
      case "noticePeriodMonths":
      case "probationPeriodMonths":
        if (!v) return "";
        if (!/^\d+$/.test(v)) return "Must be a number.";
        return "";
      // Date fields
      case "dob": case "dor": case "dateOfMarriage": case "confirmationDate":
      case "pfJoiningDate": case "pfLastDate": case "esiJoiningDate": case "esiLastDate":
      case "annualRenewableDate": case "resigLetterDate": case "resigDateLwd":
      case "appraisalDate": case "commitmentCompletionDate": case "dateOfDeath":
      case "pensionJoiningDate":
        if (!v) return "";
        { const d = new Date(v); if (isNaN(d.getTime())) return "Invalid date."; const y = d.getFullYear(); if (y < 1950 || y > 2099) return "Year must be 1950–2099."; }
        return "";
      default:
        return "";
    }
  };

  const handleFieldChange = (field: string, value: any) => {
    setEmployee((prev: typeof employee) => ({ ...prev, [field]: value }));
    // Validate and update field errors
    const err = validateField(field, value);
    setFieldErrors((prev) => {
      const next = { ...prev };
      if (err) next[field] = err; else delete next[field];
      return next;
    });
  };

  /** Returns red border class if field has error */
  const fieldClass = (field: string, base = "w-full p-2 border rounded") =>
    `${base} ${fieldErrors[field] ? "border-red-500 bg-red-50" : "border-gray-300"}`;

  /** Inline error message shown below input */
  const FieldError = ({ field }: { field: string }) =>
    fieldErrors[field]
      ? <p className="text-red-500 text-xs mt-0.5">{fieldErrors[field]}</p>
      : null;
  const addRow = (key: string, emptyRow: any) => {
    setEmployee((prev: typeof employee) => ({
      ...prev,
      [key]: [...(prev[key] || []), emptyRow],
    }));
  };

  const deleteRow = (key: string, index: number) => {
    setEmployee((prev: typeof employee) => ({
      ...prev,
      [key]: prev[key].filter((_: any, i: number) => i !== index),
    }));
  };

  const updateRow = (key: string, index: number, field: string, value: any) => {
    setEmployee((prev: typeof employee) => {
      const updated = [...prev[key]];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, [key]: updated };
    });
  };



  // ---------------- SALARY CALCULATION ENGINE ----------------
  useEffect(() => {
    setSalaryError(null);
    if (!salaryAmount || salaryAmount <= 0 || salaryHeads.length === 0 || selectedHeadIds.length === 0) {
      setCalculatedRows([]);
      setCalculationTotals(null);
      return;
    }

    try {
      const result = calculateSalary({
        mode: salaryMode,
        inputAmount: salaryAmount,
        heads: salaryHeads,
        selectedHeadIds: selectedHeadIds,
        pfRule: pfRule,
        esiRule: esiRule,
      });

      setSalaryError(null);  // 👈 CLEAR ERROR ON SUCCESS
      setCalculatedRows(result.rows);
      setCalculationTotals(result.totals);
    } catch (error: any) {
      const message =
        error?.message ||
        "Total salary heads exceed the entered CTC. Please adjust the salary structure.";

      setSalaryError(message);   // 👈 STORE ERROR FOR UI
      setCalculatedRows([]);
      setCalculationTotals(null);
    }

  }, [
    salaryAmount,
    salaryMode,
    selectedHeadIds,
    salaryHeads,
    pfRule,
    esiRule,
  ]);

  // ── Sanitization helpers ──────────────────────────────────────────
  const sanitize = {
    /** Trim to null — never sends empty strings for optional fields */
    str: (v: any): string | null => {
      if (v == null) return null;
      const s = String(v).trim();
      return s === "" ? null : s;
    },
    /** Trim to string — returns "" instead of null for required fields */
    req: (v: any): string => String(v ?? "").trim(),
    /** Boolean coercion */
    bool: (v: any): boolean => v === true || v === "true" || v === 1,
    /** Integer or null */
    int: (v: any): number | null => {
      if (v == null || v === "") return null;
      const n = parseInt(String(v), 10);
      return Number.isNaN(n) ? null : n;
    },
    /** Float or null */
    float: (v: any): number | null => {
      if (v == null || v === "") return null;
      const n = parseFloat(String(v));
      return Number.isNaN(n) ? null : n;
    },
    /** Date string → valid ISO or null. Rejects years outside 1950–2099. */
    date: (v: any): string | null => {
      if (!v || v === "") return null;
      const d = new Date(v);
      if (isNaN(d.getTime())) return null;
      const year = d.getFullYear();
      if (year < 1950 || year > 2099) return null; // reject unreasonable dates
      return d.toISOString();
    },
    /** PAN: ABCDE1234F → uppercase, strip non-alnum, max 10 chars */
    pan: (v: any): string | null => {
      if (!v) return null;
      const s = String(v).replace(/[^A-Za-z0-9]/g, "").toUpperCase().slice(0, 10);
      return s === "" ? null : s;
    },
    /** Aadhaar: 12 digits only */
    aadhaar: (v: any): string | null => {
      if (!v) return null;
      const s = String(v).replace(/\D/g, "").slice(0, 12);
      return s === "" ? null : s;
    },
    /** UAN: 12 digits only */
    uan: (v: any): string | null => {
      if (!v) return null;
      const s = String(v).replace(/\D/g, "").slice(0, 12);
      return s === "" ? null : s;
    },
    /** ESI No: up to 20 chars, digits and dashes */
    esiNo: (v: any): string | null => {
      if (!v) return null;
      const s = String(v).replace(/[^0-9\-]/g, "").slice(0, 20);
      return s === "" ? null : s;
    },
    /** Mobile: 10 digits */
    mobile: (v: any): string | null => {
      if (!v) return null;
      const s = String(v).replace(/\D/g, "").slice(0, 10);
      return s === "" ? null : s;
    },
    /** Phone: digits, spaces, dashes, parens allowed */
    phone: (v: any): string | null => {
      if (!v) return null;
      const s = String(v).replace(/[^\d\s\-\+\(\)]/g, "").trim();
      return s === "" ? null : s;
    },
    /** Email: lowercase, trimmed */
    email: (v: any): string | null => {
      if (!v) return null;
      const s = String(v).trim().toLowerCase();
      if (s === "") return null;
      // basic email format check
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s)) return null;
      return s;
    },
    /** IFSC: 11 alphanumeric chars */
    ifsc: (v: any): string | null => {
      if (!v) return null;
      const s = String(v).replace(/[^A-Za-z0-9]/g, "").toUpperCase().slice(0, 11);
      return s === "" ? null : s;
    },
    /** Enum: uppercase, trimmed */
    enumVal: (v: any, fallback: string): string => {
      if (!v || String(v).trim() === "") return fallback;
      return String(v).trim().toUpperCase();
    },
    /** PIN code: 6 digits */
    pin: (v: any): string | null => {
      if (!v) return null;
      const s = String(v).replace(/\D/g, "").slice(0, 6);
      return s === "" ? null : s;
    },
  };

  /** Sanitize an address object — all fields trimmed, state uppercased, pin 6 digits */
  const sanitizeAddress = (addr: any) => {
    if (!addr || typeof addr !== "object") return null;
    const cleaned = {
      flat: sanitize.str(addr.flat),
      building: sanitize.str(addr.building),
      area: sanitize.str(addr.area),
      road: sanitize.str(addr.road),
      city: sanitize.str(addr.city),
      district: sanitize.str(addr.district),
      state: addr.state ? String(addr.state).trim().toUpperCase().replace(/\s+/g, "_") : null,
      pin: sanitize.pin(addr.pin),
    };
    // Return null if entirely empty
    const hasData = Object.values(cleaned).some((v) => v != null && v !== "");
    return hasData ? cleaned : null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    // Run all validations and collect field-level errors
    const allErrors: Record<string, string> = {};
    const fieldsToValidate = [
      "code", "name", "doj", "pan", "aadhaar", "uan", "mobile", "email", "bankIfsc",
      "noOfDependent", "noticePeriodMonths", "probationPeriodMonths",
      "dob", "dor", "dateOfMarriage", "confirmationDate", "pfJoiningDate", "pfLastDate",
      "esiJoiningDate", "esiLastDate", "annualRenewableDate", "resigLetterDate",
      "resigDateLwd", "appraisalDate", "commitmentCompletionDate", "dateOfDeath", "pensionJoiningDate",
    ];
    fieldsToValidate.forEach((f) => {
      const err = validateField(f, employee[f]);
      if (err) allErrors[f] = err;
    });

    // Logical date cross-checks
    if (employee.dob && employee.doj) {
      const dob = new Date(employee.dob);
      const doj = new Date(employee.doj);
      if (!isNaN(dob.getTime()) && !isNaN(doj.getTime()) && dob >= doj) {
        allErrors.dob = (allErrors.dob || "") + " Must be before DOJ.";
      }
    }
    if (employee.doj && employee.dor) {
      const doj = new Date(employee.doj);
      const dor = new Date(employee.dor);
      if (!isNaN(doj.getTime()) && !isNaN(dor.getTime()) && doj >= dor) {
        allErrors.dor = (allErrors.dor || "") + " Must be after DOJ.";
      }
    }

    // Branch/Dept/Designation required
    if (!employee.branch) allErrors.branch = "Branch is required.";
    if (!employee.department) allErrors.department = "Department is required.";
    if (!employee.designation) allErrors.designation = "Designation is required.";

    setFieldErrors(allErrors);

    if (Object.keys(allErrors).length > 0) {
      setIsSaving(false);
      // Switch to the tab that has the first error
      if (allErrors.branch || allErrors.department || allErrors.designation) setActiveTab("Office details");
      else if (allErrors.code || allErrors.name || allErrors.dob || allErrors.pan || allErrors.aadhaar || allErrors.mobile || allErrors.email || allErrors.doj) setActiveTab("Personal");
      return;
    }

    // ── Build sanitized payload ─────────────────────────────────────
    // Maps EVERY column from the Prisma Employee model
    const finalPayload = {
      employee: {
        ...(employee.id && { id: employee.id }),

        // ─── Required fields ───
        code: sanitize.req(employee.code).slice(0, 20),
        name: sanitize.req(employee.name),
        doj: sanitize.date(employee.doj),

        // ─── Personal details ───
        fatherHusbandName: sanitize.str(employee.fatherHusbandName) || sanitize.str(employee.fathersName),
        fathersName: sanitize.str(employee.fathersName),
        mothersName: sanitize.str(employee.mothersName),
        gender: sanitize.enumVal(employee.gender, "MALE"),
        maritalStatus: sanitize.enumVal(employee.maritalStatus, "UNMARRIED"),
        dob: sanitize.date(employee.dob),
        dor: sanitize.date(employee.dor),
        dateOfMarriage: sanitize.date(employee.dateOfMarriage),
        bloodGroup: sanitize.str(employee.bloodGroup),
        nationality: sanitize.str(employee.nationality) || "Indian",
        religion: employee.religion ? sanitize.enumVal(employee.religion, "") : null,
        caste: sanitize.str(employee.caste),
        noOfDependent: sanitize.int(employee.noOfDependent),
        spouse: sanitize.str(employee.spouse),
        photo: sanitize.str(employee.photo),
        physicallyHandicap: sanitize.str(employee.physicallyHandicap),
        identityMark: sanitize.str(employee.identityMark),

        // ─── Identity docs (sanitized) ───
        pan: sanitize.pan(employee.pan),
        aadhaar: sanitize.aadhaar(employee.aadhaar),
        uan: sanitize.uan(employee.uan),
        pfAcNo: sanitize.str(employee.pfAcNo)?.slice(0, 30) ?? null,
        esiNo: sanitize.esiNo(employee.esiNo),
        email: sanitize.email(employee.email),
        nasscomRegNo: sanitize.str(employee.nasscomRegNo),

        // ─── Contact ───
        stdCode: sanitize.str(employee.stdCode),
        phone: sanitize.phone(employee.phone),
        mobile: sanitize.mobile(employee.mobile),
        emergencyContact: sanitize.str(employee.emergencyContact),
        emergencyPhone: sanitize.phone(employee.emergencyPhone),
        internalId: sanitize.str(employee.internalId),

        // ─── Office details ───
        branch: sanitize.str(employee.branch),
        department: sanitize.str(employee.department),
        designation: sanitize.str(employee.designation),
        level: sanitize.str(employee.level),
        grade: sanitize.str(employee.grade),
        category: sanitize.str(employee.category),
        scale: sanitize.str(employee.scale),
        ptGroup: sanitize.str(employee.ptGroup),
        attendanceType: sanitize.str(employee.attendanceType),
        shiftId: sanitize.str(employee.shiftId),

        // ─── Employment periods ───
        noticePeriodMonths: sanitize.int(employee.noticePeriodMonths),
        probationPeriodMonths: sanitize.int(employee.probationPeriodMonths),
        confirmationDate: sanitize.date(employee.confirmationDate),
        resigLetterDate: sanitize.date(employee.resigLetterDate),
        resigDateLwd: sanitize.date(employee.resigDateLwd),
        resignationReason: sanitize.str(employee.resignationReason),
        appraisalDate: sanitize.date(employee.appraisalDate),
        commitmentCompletionDate: sanitize.date(employee.commitmentCompletionDate),
        dateOfDeath: sanitize.date(employee.dateOfDeath),

        // ─── Booleans ───
        registeredInPmrpy: sanitize.bool(employee.registeredInPmrpy),
        reimbursementApplicable: sanitize.bool(employee.reimbursementApplicable),
        hraApplicable: sanitize.bool(employee.hraApplicable),
        bonusApplicable: sanitize.bool(employee.bonusApplicable),
        gratuityApplicable: sanitize.bool(employee.gratuityApplicable),
        lwfApplicable: sanitize.bool(employee.lwfApplicable),

        // ─── Bank & Financial ───
        bankName: sanitize.str(employee.bankName),
        bankBranch: sanitize.str(employee.bankBranch),
        bankIfsc: sanitize.ifsc(employee.bankIfsc),
        bankAddress: sanitize.str(employee.bankAddress),
        nameAsPerAc: sanitize.str(employee.nameAsPerAc),
        salaryAcNumber: sanitize.str(employee.salaryAcNumber),
        paymentMode: employee.paymentMode ? sanitize.enumVal(employee.paymentMode, "TRANSFER") : "TRANSFER",
        acType: employee.acType ? sanitize.enumVal(employee.acType, "ECS") : "ECS",
        bankRefNo: sanitize.str(employee.bankRefNo),
        wardCircleRange: sanitize.str(employee.wardCircleRange),
        licPolicyNo: sanitize.str(employee.licPolicyNo),
        policyTerm: sanitize.str(employee.policyTerm),
        licId: sanitize.str(employee.licId),
        annualRenewableDate: sanitize.date(employee.annualRenewableDate),

        // ─── PF details ───
        pfApplicable: sanitize.bool(employee.pfApplicable),
        pfJoiningDate: sanitize.date(employee.pfJoiningDate),
        pfLastDate: sanitize.date(employee.pfLastDate),
        previousPfNo: sanitize.str(employee.previousPfNo),
        salaryForPfOption: sanitize.str(employee.salaryForPfOption),
        salaryForPf: sanitize.float(employee.salaryForPf),
        minAmtPf: sanitize.float(employee.minAmtPf),
        pensionAppl: sanitize.bool(employee.pensionAppl),
        pensionJoiningDate: sanitize.date(employee.pensionJoiningDate),
        pensionOnHigherWages: sanitize.bool(employee.pensionOnHigherWages),
        noLimit: sanitize.bool(employee.noLimit),

        // ─── ESI details ───
        esiApplicable: sanitize.bool(employee.esiApplicable),
        esiJoiningDate: sanitize.date(employee.esiJoiningDate),
        esiLastDate: sanitize.date(employee.esiLastDate),
        salaryForEsiOption: sanitize.str(employee.salaryForEsiOption),
        salaryForEsi: sanitize.float(employee.salaryForEsi),
        minAmtEsiContribution: sanitize.float(employee.minAmtEsiContribution),
        dispensaryOrPanel: sanitize.str(employee.dispensaryOrPanel),

        // ─── Other / miscellaneous ───
        recruitmentAgency: sanitize.str(employee.recruitmentAgency),
        bankMandate: sanitize.str(employee.bankMandate),
        employmentStatus: sanitize.enumVal(employee.employmentStatus, "ACTIVE"),
        lapTops: sanitize.str(employee.lapTops),
        companyVehicle: sanitize.str(employee.companyVehicle),
        corpCreditCardNo: sanitize.str(employee.corpCreditCardNo),
        transportRoute: sanitize.str(employee.transportRoute),
        workLocation: sanitize.str(employee.workLocation),
        reasonForLeaving: sanitize.str(employee.reasonForLeaving),
        service: sanitize.str(employee.service),
        remarks: sanitize.str(employee.remarks),

        // ─── Addresses (sanitized objects) ───
        permanentAddress: sanitizeAddress(employee.permanentAddress),
        correspondenceAddress: sanitizeAddress(employee.correspondenceAddress),
      },

      // Related records (backend expects these at root)
      qualifications: (employee.qualifications || []).filter((q: any) => q.college?.trim() || q.degree?.trim()),
      family: (employee.family || []).filter((f: any) => f.name?.trim() || f.relationship?.trim()),
      nominees: (employee.nominees || []).filter((n: any) => n.name?.trim() || n.relationship?.trim()),
      witnesses: (employee.witnesses || []).filter((w: any) => w.name?.trim()),
      experiences: (employee.experiences || []).filter((x: any) => x.companyName?.trim() || x.designation?.trim()),

      // Salary
      salary: salaryAmount
        ? {
          mode: salaryMode,
          inputAmount: Number(salaryAmount),
          selectedHeadIds: selectedHeadIds || [],
        }
        : null,
    };

    console.log("🚀 FINAL PAYLOAD:", JSON.stringify(finalPayload, null, 2));

    try {
      await onSubmit?.(finalPayload);
    } catch (err) {
      console.error("Submit error:", err);
    } finally {
      setIsSaving(false);
    }
  };



  return (
    <div className="w-full max-w-6xl mx-auto p-6 bg-beige-100 border border-gray-300 rounded-lg shadow-md">
      <div className="flex border-b border-gray-300 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab}
            className={`px-6 py-3 text-sm font-medium ${activeTab === tab
              ? "bg-white border-t border-l border-r border-gray-300 rounded-t-md"
              : "bg-beige-200 text-gray-600"
              }`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      <form className="bg-white p-6 rounded-md" onSubmit={handleSubmit}>
        {/* ── Validation error banner ── */}
        {Object.keys(fieldErrors).length > 0 && (
          <div className="mb-4 p-3 bg-red-50 border border-red-300 rounded text-red-700 text-sm">
            <strong>Please fix the highlighted fields before submitting.</strong>
          </div>
        )}
        {activeTab === "Personal" && (
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold">Code <span className="text-red-500">*</span></label>
              <input
                type="text"
                className={fieldClass("code")}
                value={employee.code || ""}
                maxLength={20}
                onChange={(e) => handleFieldChange("code", e.target.value)}
                required
              />
              <FieldError field="code" />

              <label className="block text-sm font-bold mt-4">Name <span className="text-red-500">*</span></label>
              <input
                type="text"
                className={fieldClass("name")}
                value={employee.name || ""}
                onChange={(e) => handleFieldChange("name", e.target.value)}
              />
              <FieldError field="name" />
              <div className="col-span-2 flex flex-col space-y-4 mt-4">

                {/* Permanent Address */}
                <label className="block text-sm font-bold mt-4">
                  Permanent Address Details :-
                </label>
                <input
                  type="text"
                  className="w-full p-2 border border-gray-300 rounded mt-1"
                  placeholder="Flat / House No."
                  value={employee.permanentAddress?.flat || ""}
                  onChange={(e) => handleAddressChange("permanentAddress", "flat", e.target.value)}
                />

                <input
                  type="text"
                  className="w-full p-2 border border-gray-300 rounded mt-1"
                  placeholder="Building"
                  value={employee.permanentAddress?.building || ""}
                  onChange={(e) => handleAddressChange("permanentAddress", "building", e.target.value)}
                />

                <input
                  type="text"
                  className="w-full p-2 border border-gray-300 rounded mt-1"
                  placeholder="Area"
                  value={employee.permanentAddress?.area || ""}
                  onChange={(e) => handleAddressChange("permanentAddress", "area", e.target.value)}
                />

                <input
                  type="text"
                  className="w-full p-2 border border-gray-300 rounded mt-1"
                  placeholder="Road"
                  value={employee.permanentAddress?.road || ""}
                  onChange={(e) => handleAddressChange("permanentAddress", "road", e.target.value)}
                />

                <input
                  type="text"
                  className="w-full p-2 border border-gray-300 rounded mt-1"
                  placeholder="City"
                  value={employee.permanentAddress?.city || ""}
                  onChange={(e) => handleAddressChange("permanentAddress", "city", e.target.value)}
                />

                <input
                  type="text"
                  className="w-full p-2 border border-gray-300 rounded mt-1"
                  placeholder="District"
                  value={employee.permanentAddress?.district || ""}
                  onChange={(e) => handleAddressChange("permanentAddress", "district", e.target.value)}
                />

                <select
                  className="w-full p-2 border border-gray-300 rounded mt-1"
                  value={employee.permanentAddress?.state || ""}
                  onChange={(e) => handleAddressChange("permanentAddress", "state", e.target.value)}
                >
                  <option value="">Select State</option>
                  {INDIAN_STATES.map((s) => (
                    <option key={s} value={s}>{s.replaceAll("_", " ")}</option>
                  ))}
                </select>

                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  pattern="[0-9]{6}"
                  className="w-full p-2 border border-gray-300 rounded mt-1"
                  placeholder="PIN"
                  value={employee.permanentAddress?.pin || ""}
                  onChange={(e) => {
                    let value = e.target.value.replace(/\D/g, "");
                    handleAddressChange("permanentAddress", "pin", value)
                  }}
                />


                {/* Same as Above Checkbox */}
                <div className="flex items-center mt-3">
                  <input
                    type="checkbox"
                    className="mr-2"
                    checked={isSameAsAbove}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setIsSameAsAbove(checked);

                      if (checked) {
                        // Sync immediately
                        setEmployee((prev: any) => ({
                          ...prev,
                          correspondenceAddress: { ...prev.permanentAddress },
                        }));
                      }
                      // When unchecking → do NOTHING (keep current correspondenceAddress)
                      // This allows independent editing in Update mode
                    }}
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Correspondence address is same as above
                  </span>
                </div>
                {/* Correspondence Address */}
                <label className="block text-sm font-bold mt-4">
                  Correspondence Address Details :-
                </label>

                <input
                  disabled={isSameAsAbove}
                  type="text"
                  className="w-full p-2 border border-gray-300 rounded mt-1"
                  placeholder="Flat / House No."
                  value={employee.correspondenceAddress?.flat || ""}
                  onChange={(e) => handleAddressChange("correspondenceAddress", "flat", e.target.value)}
                />

                <input
                  disabled={isSameAsAbove}
                  type="text"
                  className="w-full p-2 border border-gray-300 rounded mt-1"
                  placeholder="Building"
                  value={employee.correspondenceAddress?.building || ""}
                  onChange={(e) => handleAddressChange("correspondenceAddress", "building", e.target.value)}
                />

                <input
                  disabled={isSameAsAbove}
                  type="text"
                  className="w-full p-2 border border-gray-300 rounded mt-1"
                  placeholder="Area"
                  value={employee.correspondenceAddress?.area || ""}
                  onChange={(e) => handleAddressChange("correspondenceAddress", "area", e.target.value)}
                />

                <input
                  disabled={isSameAsAbove}
                  type="text"
                  className="w-full p-2 border border-gray-300 rounded mt-1"
                  placeholder="Road"
                  value={employee.correspondenceAddress?.road || ""}
                  onChange={(e) => handleAddressChange("correspondenceAddress", "road", e.target.value)}
                />

                <input
                  disabled={isSameAsAbove}
                  type="text"
                  className="w-full p-2 border border-gray-300 rounded mt-1"
                  placeholder="City"
                  value={employee.correspondenceAddress?.city || ""}
                  onChange={(e) => handleAddressChange("correspondenceAddress", "city", e.target.value)}
                />

                <input
                  disabled={isSameAsAbove}
                  type="text"
                  className="w-full p-2 border border-gray-300 rounded mt-1"
                  placeholder="District"
                  value={employee.correspondenceAddress?.district || ""}
                  onChange={(e) => handleAddressChange("correspondenceAddress", "district", e.target.value)}
                />

                <select
                  disabled={isSameAsAbove}
                  className="w-full p-2 border border-gray-300 rounded mt-1"
                  value={employee.correspondenceAddress?.state || ""}
                  onChange={(e) => handleAddressChange("correspondenceAddress", "state", e.target.value)}
                >
                  <option value="">Select State</option>
                  {INDIAN_STATES.map((s) => (
                    <option key={s} value={s}>{s.replaceAll("_", " ")}</option>
                  ))}
                </select>

                <input
                  disabled={isSameAsAbove}
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  pattern="[0-9]{6}"
                  className="w-full p-2 border border-gray-300 rounded mt-1"
                  placeholder="PIN"
                  value={employee.correspondenceAddress?.pin || ""}
                  onChange={(e) => {
                    let value = e.target.value.replace(/\D/g, "");
                    handleAddressChange("correspondenceAddress", "pin", value)
                  }}
                />
              </div>


              <label className="block text-sm font-bold mt-4">E-Mail</label>
              <input
                type="email"
                className={fieldClass("email")}
                value={employee.email || ""}
                onChange={(e) => handleFieldChange("email", e.target.value)}
              />
              <FieldError field="email" />

              <label className="block text-sm font-bold mt-4">DOB</label>
              <input
                type="date"
                min="1950-01-01" max="2099-12-31"
                className={fieldClass("dob")}
                value={employee.dob || ""}
                onChange={(e) => handleFieldChange("dob", e.target.value)}
              />
              <FieldError field="dob" />

              <label className="block text-sm font-bold mt-4">PAN</label>
              <input
                type="text"
                maxLength={10}
                className={fieldClass("pan")}
                value={employee.pan || ""}
                onChange={(e) => handleFieldChange("pan", e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""))}
              />
              <FieldError field="pan" />

              <label className="block text-sm font-bold mt-4">NASSCOM Reg No.</label>
              <input
                type="text"
                className="w-full p-2 border border-gray-300 rounded"
                value={employee.nasscomRegNo || ""}
                onChange={(e) => handleFieldChange("nasscomRegNo", e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-bold">Aadhaar No.</label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={12}
                className={fieldClass("aadhaar")}
                value={employee.aadhaar || ""}
                onChange={(e) => handleFieldChange("aadhaar", e.target.value.replace(/\D/g, ""))}
              />
              <FieldError field="aadhaar" />

              <label className="block text-sm font-bold mt-4">Mobile No.</label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={10}
                className={fieldClass("mobile")}
                value={employee.mobile || ""}
                onChange={(e) => handleFieldChange("mobile", e.target.value.replace(/\D/g, ""))}
              />
              <FieldError field="mobile" />

              <label className="block text-sm font-bold mt-4">Internal ID</label>
              <input type="text" value={employee.internalId || ""} onChange={(e) => handleFieldChange("internalId", e.target.value)} className="w-full p-2 border border-gray-300 rounded" />

              <label className="block text-sm font-bold mt-4">Notice Period</label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={3}
                className={fieldClass("noticePeriodMonths")}
                value={employee.noticePeriodMonths || ""}
                onChange={(e) => handleFieldChange("noticePeriodMonths", e.target.value.replace(/\D/g, ""))}
                placeholder="Months"
              />
              <FieldError field="noticePeriodMonths" />

              <label className="block text-sm font-bold mt-4">Joining Date <span className="text-red-500">*</span></label>
              <input
                type="date"
                min="1950-01-01" max="2099-12-31"
                className={fieldClass("doj")}
                value={employee.doj || ""}
                onChange={(e) => handleFieldChange("doj", e.target.value)}
              />
              <FieldError field="doj" />

              <label className="block text-sm font-bold mt-4">Probation Period</label>
              <input type="text" inputMode="numeric" maxLength={3} value={employee.probationPeriodMonths || ""} onChange={(e) => handleFieldChange("probationPeriodMonths", e.target.value.replace(/\D/g, ""))} className={fieldClass("probationPeriodMonths")} placeholder="Months" />
              <FieldError field="probationPeriodMonths" />

              <label className="block text-sm font-bold mt-4">Confirmation Date</label>
              <input type="date" min="1950-01-01" max="2099-12-31" value={employee.confirmationDate || ""} onChange={(e) => handleFieldChange("confirmationDate", e.target.value)} className={fieldClass("confirmationDate")} />
              <FieldError field="confirmationDate" />

              <label className="block text-sm font-bold mt-4">Resig. Letter Date</label>
              <input type="date" min="1950-01-01" max="2099-12-31" value={employee.resigLetterDate || ""} onChange={(e) => handleFieldChange("resigLetterDate", e.target.value)} className={fieldClass("resigLetterDate")} />
              <FieldError field="resigLetterDate" />

              <label className="block text-sm font-bold mt-4">Resig. Date L.W.D.</label>
              <input type="date" min="1950-01-01" max="2099-12-31" value={employee.resigDateLwd || ""} onChange={(e) => handleFieldChange("resigDateLwd", e.target.value)} className={fieldClass("resigDateLwd")} />
              <FieldError field="resigDateLwd" />

              <label className="block text-sm font-bold mt-4">Appraisal Date</label>
              <input type="date" min="1950-01-01" max="2099-12-31" value={employee.appraisalDate || ""} onChange={(e) => handleFieldChange("appraisalDate", e.target.value)} className={fieldClass("appraisalDate")} />
              <FieldError field="appraisalDate" />

              <label className="block text-sm font-bold mt-4">Commitment Completion Date</label>
              <input type="date" min="1950-01-01" max="2099-12-31" value={employee.commitmentCompletionDate || ""} onChange={(e) => handleFieldChange("commitmentCompletionDate", e.target.value)} className={fieldClass("commitmentCompletionDate")} />
              <FieldError field="commitmentCompletionDate" />

              <label className="block text-sm font-bold mt-4">Date of Death</label>
              <input type="date" min="1950-01-01" max="2099-12-31" value={employee.dateOfDeath || ""} onChange={(e) => handleFieldChange("dateOfDeath", e.target.value)} className={fieldClass("dateOfDeath")} />
              <FieldError field="dateOfDeath" />

              <label className="block text-sm font-bold mt-4">Resignation Reason</label>
              <select value={employee.resignationReason || ""} onChange={(e) => handleFieldChange("resignationReason", e.target.value)} className="w-full p-2 border border-gray-300 rounded">
                <option value="">SELECT REASON</option>
                <option>Resigned</option>
                <option>Terminated</option>
                <option>Retired</option>
                <option>Other</option>
              </select>
            </div>

            <div className="col-span-2 grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold">Gender</label>
                <div className="flex">
                  <input
                    type="radio"
                    name="gender"
                    checked={employee.gender === "MALE"}
                    onChange={() => handleFieldChange("gender", "MALE")}
                  /> MALE

                  <input
                    type="radio"
                    name="gender"
                    checked={employee.gender === "FEMALE"}
                    onChange={() => handleFieldChange("gender", "FEMALE")}
                    className="ml-4"
                  /> FEMALE

                </div>

                <label className="block text-sm font-bold mt-4">Marital Status</label>
                <select value={employee.maritalStatus || ""} onChange={(e) => handleFieldChange("maritalStatus", e.target.value)} className="w-full p-2 border border-gray-300 rounded">
                  <option value="">Select</option>
                  <option value="UNMARRIED">Unmarried</option>
                  <option value="MARRIED">Married</option>
                  <option value="WIDOWED">Widowed</option>
                  <option value="DIVORCED">Divorced</option>
                </select>

                <label className="block text-sm font-bold mt-4">Father's Name</label>
                <input type="text" value={employee.fathersName || ""} onChange={(e) => handleFieldChange("fathersName", e.target.value)} className="w-full p-2 border border-gray-300 rounded" />

                <label className="block text-sm font-bold mt-4">Mother's Name</label>
                <input type="text" value={employee.mothersName || ""} onChange={(e) => handleFieldChange("mothersName", e.target.value)} className="w-full p-2 border border-gray-300 rounded" />

                <label className="block text-sm font-bold mt-4">Blood Group</label>
                <select value={employee.bloodGroup || ""} onChange={(e) => handleFieldChange("bloodGroup", e.target.value)} className="w-full p-2 border border-gray-300 rounded">
                  <option value="">Select</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>

                <label className="block text-sm font-bold mt-4">Date of Marriage</label>
                <input type="date" min="1950-01-01" max="2099-12-31" value={employee.dateOfMarriage || ""} onChange={(e) => handleFieldChange("dateOfMarriage", e.target.value)} className={fieldClass("dateOfMarriage")} />
                <FieldError field="dateOfMarriage" />

                <label className="block text-sm font-bold mt-4">No. Dependent</label>
                <input type="text" inputMode="numeric" maxLength={2} value={employee.noOfDependent || ""} onChange={(e) => handleFieldChange("noOfDependent", e.target.value.replace(/\D/g, ""))} className={fieldClass("noOfDependent")} />
                <FieldError field="noOfDependent" />
              </div>

              <div>
                <label className="block text-sm font-bold">Caste</label>
                <select value={employee.caste || ""} onChange={(e) => handleFieldChange("caste", e.target.value)} className="w-full p-2 border border-gray-300 rounded">
                  <option value="">Select</option>
                  <option value="GEN">General</option>
                  <option value="OBC">OBC</option>
                  <option value="SC">SC</option>
                  <option value="ST">ST</option>
                </select>

                <label className="block text-sm font-bold mt-4">Nationality</label>
                <select value={employee.nationality || ""} onChange={(e) => handleFieldChange("nationality", e.target.value)} className="w-full p-2 border border-gray-300 rounded">
                  <option value="">Select</option>
                  <option value="Indian">Indian</option>
                  <option value="NRI">NRI</option>
                  <option value="Foreign">Foreign</option>
                </select>

                <label className="block text-sm font-bold mt-4">Religion</label>
                <select value={employee.religion || ""} onChange={(e) => handleFieldChange("religion", e.target.value)} className="w-full p-2 border border-gray-300 rounded">
                  <option value="">Select</option>
                  <option value="HINDU">Hindu</option>
                  <option value="MUSLIM">Muslim</option>
                  <option value="CHRISTIAN">Christian</option>
                  <option value="SIKH">Sikh</option>
                  <option value="BUDDHIST">Buddhist</option>
                  <option value="JAIN">Jain</option>
                  <option value="OTHERS">Others</option>
                </select>

                <label className="block text-sm font-bold mt-4">Spouse</label>
                <input type="text" value={employee.spouse || ""} onChange={(e) => handleFieldChange("spouse", e.target.value)} className="w-full p-2 border border-gray-300 rounded" />

                <div className="mt-4">
                  <input type="checkbox" checked={employee.reimbursementApplicable || false} onChange={(e) => handleFieldChange("reimbursementApplicable", e.target.checked)} /> Reimbursement Applicable
                </div>
              </div>
            </div>
          </div>
        )}
        {activeTab === "Office details" && (
          <div className="p-6 space-y-6">
            <h3 className="text-xl font-bold text-gray-800">Office Details</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* Branch */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Branch *</label>
                <select
                  value={employee.branch || ""}
                  onChange={(e) => handleFieldChange("branch", e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">{setupsLoading ? "Loading..." : "Select Branch"}</option>
                  {setups?.branches?.map((b: any) => (
                    <option key={b.id} value={b.name}>{b.name}</option>
                  ))}
                </select>
              </div>

              {/* Department */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department *</label>
                <select
                  value={employee.department || ""}
                  onChange={(e) => handleFieldChange("department", e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">{setupsLoading ? "Loading..." : "Select Department"}</option>
                  {setups?.departments?.map((d: any) => (
                    <option key={d.id} value={d.name}>{d.name}</option>
                  ))}
                </select>
              </div>

              {/* Designation */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Designation *</label>
                <select
                  value={employee.designation || ""}
                  onChange={(e) => handleFieldChange("designation", e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">{setupsLoading ? "Loading..." : "Select Designation"}</option>
                  {setups?.designations?.map((d: any) => (
                    <option key={d.id} value={d.name}>{d.name}</option>
                  ))}
                </select>
              </div>

              {/* Level */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Level</label>
                <select
                  value={employee.level || ""}
                  onChange={(e) => handleFieldChange("level", e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">{setupsLoading ? "Loading..." : "Select Level"}</option>
                  {setups?.levels?.map((l: any) => (
                    <option key={l.id} value={l.name}>{l.name}</option>
                  ))}
                </select>
              </div>

              {/* Grade */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Grade</label>
                <select
                  value={employee.grade || ""}
                  onChange={(e) => handleFieldChange("grade", e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">{setupsLoading ? "Loading..." : "Select Grade"}</option>
                  {setups?.grades?.map((g: any) => (
                    <option key={g.id} value={g.name}>{g.name}</option>
                  ))}
                </select>
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={employee.category || ""}
                  onChange={(e) => handleFieldChange("category", e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">{setupsLoading ? "Loading..." : "Select Category"}</option>
                  {setups?.categories?.map((c: any) => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>

              {/* Attendance Type (MISSING FIELD ADDED HERE) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Attendance Type</label>
                <select
                  value={employee.attendanceType || ""}
                  onChange={(e) => handleFieldChange("attendanceType", e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">{setupsLoading ? "Loading..." : "Select Type"}</option>
                  {setups?.attendanceTypes?.map((at: any) => (
                    <option key={at.id} value={at.name}>{at.name}</option>
                  ))}
                </select>
              </div>

            </div>
          </div>
        )}



        {activeTab === "Qualification" && (
          <div className="mt-6">
            <h3 className="text-lg font-bold mb-4">Educational Qualifications</h3>

            <table className="w-full border border-gray-300 table-fixed">
              <colgroup>
                <col className="w-[4%]" />   {/* S.N. */}
                <col className="w-[25%]" />  {/* College */}
                <col className="w-[15%]" />  {/* From–To */}
                <col className="w-[10%]" />  {/* CGPA */}
                <col className="w-[12%]" />  {/* Reg No */}
                <col className="w-[10%]" />  {/* Validity */}
                <col className="w-[10%]" />  {/* Upload */}
                <col className="w-[8%]" />   {/* Action */}
              </colgroup>

              <thead>
                <tr className="bg-gray-100">
                  <th className="border p-2 text-xs font-semibold text-left">S.N.</th>
                  <th className="border p-2 text-xs font-semibold text-left">College / University</th>
                  <th className="border p-2 text-xs font-semibold text-left">Degree Completion Year<br />(From – To)</th>
                  <th className="border p-2 text-xs font-semibold text-left">CGPA / %</th>
                  <th className="border p-2 text-xs font-semibold text-left">Reg No.<br />(if any)</th>
                  <th className="border p-2 text-xs font-semibold text-left">Degree Validity Year<br />(if any)</th>
                  <th className="border p-2 text-xs font-semibold text-left">Upload Certification<br />(PDF)</th>
                  <th className="border p-2 text-xs font-semibold text-left">Action</th>
                </tr>
              </thead>
              <tbody>
                {(employee.qualifications || []).map((q: any, index: number) => (
                  <tr key={index}>
                    <td className="border p-2 text-center">{index + 1}</td>

                    <td className="border p-2 align-center overflow-hidden">
                      <input
                        value={q.college || ""}
                        onChange={(e) =>
                          updateRow("qualifications", index, "college", e.target.value)
                        }
                        className="w-full p-2 border rounded text-sm"
                        placeholder="Enter College Name"
                      />
                    </td>

                    <td className="border px-2 py-2">
                      <div className="flex flex-col gap-1">
                        <input
                          type="date"
                          className="w-full p-1 border rounded text-sm"
                          value={q.from || ""}
                          onChange={(e) =>
                            updateRow("qualifications", index, "from", e.target.value)
                          }
                        />
                        <input
                          type="date"
                          className="w-full p-1 border rounded text-sm"
                          value={q.to || ""}
                          onChange={(e) =>
                            updateRow("qualifications", index, "to", e.target.value)
                          }
                        />
                      </div>
                    </td>

                    <td className="border p-2">
                      <input
                        value={q.score || ""}
                        onChange={(e) =>
                          updateRow("qualifications", index, "score", e.target.value)
                        }
                        className="w-full p-1 border rounded text-sm text-center"
                        placeholder="CGPA / %"
                      />
                    </td>

                    <td className="border p-2">
                      <input
                        value={q.regNo || ""}
                        onChange={(e) =>
                          updateRow("qualifications", index, "regNo", e.target.value)
                        }
                        className="w-full p-1 border rounded text-sm text-center"
                        placeholder="Reg No"
                      />
                    </td>

                    <td className="border p-2">
                      <input
                        value={q.degreeValidityYear || ""}
                        onChange={(e) =>
                          updateRow("qualifications", index, "degreeValidityYear", e.target.value)
                        }
                        className="w-full p-1 border rounded text-sm text-center"
                        placeholder="Validity Year"
                      />
                    </td>

                    <td className="border px-2 py-3 align-top">
                      <label className="block cursor-pointer">
                        <span className="inline-block mb-1 px-2 py-1 text-xs bg-gray-100 border rounded hover:bg-gray-200">
                          Choose File
                        </span>

                        <input
                          type="file"
                          accept=".pdf"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            if (file.size > MAX_UPLOAD_SIZE) {
                              alert("File size must be 50 KB or less.");
                              e.target.value = ""; // reset input
                              return;
                            }
                            const reader = new FileReader();
                            reader.onload = (ev) => {
                              const base64 = (ev.target?.result as string).split(',')[1]; // Strip prefix
                              updateRow("qualifications", index, "uploadCertification", {
                                name: file.name,
                                size: file.size,
                                base64, // Backend saves as certificate
                              });
                            };
                            reader.readAsDataURL(file);
                          }}
                        />

                      </label>

                      {q.uploadCertification && (
                        <p className="mt-1 text-[11px] text-gray-700 break-words whitespace-normal leading-snug">
                          {q.uploadCertification.name}
                          <span className="block text-gray-500">
                            ({Math.ceil(q.uploadCertification.size / 1024)} KB)
                          </span>
                        </p>
                      )}

                    </td>


                    <td className="border p-2 text-center">
                      <button
                        type="button"
                        onClick={() => deleteRow("qualifications", index)}
                        className="text-red-600 text-sm"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>

                ))}
              </tbody>

            </table>

            <div className="mt-3">
              <button
                type="button"
                onClick={() =>
                  addRow("qualifications", {
                    college: "",
                    from: "",
                    to: "",
                    score: "",
                    regNo: "",
                    degreeValidityYear: "",
                    uploadCertification: "",
                  })
                }
                className="px-4 py-2 bg-yellow-300 text-black rounded text-sm"
              >
                Add Row
              </button>

            </div>
          </div>
        )}
        {activeTab === "Salary" && (
          <div className="p-6 space-y-5">
            <h3 className="text-xl font-bold text-gray-800">Salary Components</h3>
            {salaryError && (
              <div className="rounded-md border border-red-400 bg-red-50 p-4 text-red-700">
                <strong>Salary Configuration Error:</strong>
                <div className="mt-1">{salaryError}</div>
              </div>
            )}


            {/* Top controls */}
            <div className="flex gap-4 items-end mb-4">
              <div>
                <label className="block text-sm font-medium mb-1">Salary Base</label>
                <select
                  value={salaryMode}
                  onChange={(e) => setSalaryMode(e.target.value as any)}
                  className="w-40 p-2 border rounded"
                >
                  <option value="CTC">CTC</option>
                  <option value="GROSS">Gross</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Amount (Monthly)</label>
                <input
                  type="number"
                  value={salaryAmount}
                  onChange={(e) => setSalaryAmount(Number(e.target.value))}
                  className="w-48 p-2 border rounded"
                  placeholder="Enter amount"
                />
              </div>

              <div className="ml-auto text-sm text-gray-600">
                Selected: <strong>{selectedHeadIds.length}</strong> / <strong>{salaryHeads.length}</strong>
              </div>
            </div>

            {/* Main content: Left (Heads list) + Right (Calculation preview) */}
            <div className="grid grid-cols-1 gap-4">
              {/* Left: Vertical heads list with checkboxes on right */}
              <div className="col-span-2 border rounded-lg bg-gray-50 p-4">
                <h4 className="font-semibold mb-3 text-gray-700">Select Salary Heads</h4>
                {salaryHeads.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">
                    No salary heads found. Please create salary heads in the Salary Head configuration page.
                  </div>
                ) : (
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {salaryHeads.map((h: any) => (
                      <label
                        key={h.id}
                        className="flex items-center justify-between p-3 bg-white rounded border hover:bg-gray-50 cursor-pointer transition-colors"
                      >
                        <div className="flex-1">
                          <div className="font-medium text-sm">
                            {h.name || "Unnamed Head"}
                            {h.shortName && <span className="text-xs text-gray-500 ml-1">({h.shortName})</span>}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {h.isPercentage
                              ? `${h.value || 0}% of ${h.percentageOf || "Amount"}`
                              : `Fixed ₹${h.value || 0}`}
                          </div>
                          <div className="text-xs text-gray-400 mt-0.5">
                            {h.fieldType || "Earnings"}
                          </div>
                        </div>
                        <input
                          type="checkbox"
                          checked={selectedHeadIds.includes(h.id)}
                          onChange={() =>
                            setSelectedHeadIds(prev =>
                              prev.includes(h.id)
                                ? prev.filter(id => id !== h.id)
                                : [...prev, h.id]
                            )
                          }
                          className="h-4 w-4 ml-3 cursor-pointer"
                        />
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Detailed breakdown table */}
            {calculatedRows.length > 0 && calculationTotals && (
              <div className="mt-6">
                <h4 className="font-semibold mb-3 text-gray-700">
                  Salary & CTC Breakup
                </h4>

                <div className="overflow-x-auto border rounded-lg">
                  <table className="w-full border-collapse text-sm">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="border p-2 text-left font-semibold">
                          Salary Heads
                        </th>
                        <th className="border p-2 text-right font-semibold">
                          Monthly Amount (Rs.)
                        </th>
                        <th className="border p-2 text-right font-semibold">
                          Annual Amount (Rs.)
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {/* ===== Earnings / Gross ===== */}
                      {calculatedRows.map((r, i) => (
                        <tr
                          key={r.id ?? i}
                          className={r.isSpecialAllowance ? "bg-yellow-50" : ""}
                        >
                          <td className="border p-2">
                            {r.name}
                            {r.isSpecialAllowance && (
                              <span className="text-xs text-gray-500 ml-1">(Balance)</span>
                            )}
                          </td>
                          <td className="border p-2 text-right">
                            ₹{Number(r.baseAmount || 0).toFixed(2)}
                          </td>
                          <td className="border p-2 text-right">
                            ₹{(Number(r.baseAmount || 0) * 12).toFixed(2)}
                          </td>
                        </tr>
                      ))}

                      {/* ===== Gross Total ===== */}
                      <tr className="bg-gray-100 font-semibold">
                        <td className="border p-2">Gross Salary</td>
                        <td className="border p-2 text-right">
                          ₹
                          {calculatedRows
                            .reduce((s, r) => s + Number(r.baseAmount || 0), 0)
                            .toFixed(2)}
                        </td>
                        <td className="border p-2 text-right">
                          ₹
                          {(
                            calculatedRows.reduce(
                              (s, r) => s + Number(r.baseAmount || 0),
                              0
                            ) * 12
                          ).toFixed(2)}
                        </td>
                      </tr>

                      {/* ===== Employer Contributions ===== */}
                      <tr>
                        <td className="border p-2">Employer PF</td>
                        <td className="border p-2 text-right">
                          ₹{calculationTotals.totalPfEmployer.toFixed(2)}
                        </td>
                        <td className="border p-2 text-right">
                          ₹{(calculationTotals.totalPfEmployer * 12).toFixed(2)}
                        </td>
                      </tr>

                      <tr>
                        <td className="border p-2">Employer ESI</td>
                        <td className="border p-2 text-right">
                          ₹{calculationTotals.totalEsiEmployer.toFixed(2)}
                        </td>
                        <td className="border p-2 text-right">
                          ₹{(calculationTotals.totalEsiEmployer * 12).toFixed(2)}
                        </td>
                      </tr>

                      <tr>
                        <td className="border p-2">Gratuity</td>
                        <td className="border p-2 text-right">
                          ₹{calculationTotals.totalGratuityEmployer.toFixed(2)}
                        </td>
                        <td className="border p-2 text-right">
                          ₹{(calculationTotals.totalGratuityEmployer * 12).toFixed(2)}
                        </td>
                      </tr>

                      {/* ===== FINAL CTC ===== */}
                      <tr className="bg-green-100 font-bold">
                        <td className="border p-2">CTC</td>
                        <td className="border p-2 text-right">
                          ₹{calculationTotals.ctc.toFixed(2)}
                        </td>
                        <td className="border p-2 text-right">
                          ₹{(calculationTotals.ctc * 12).toFixed(2)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

          </div>
        )}



        {activeTab === "Financial" && (
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold">Bank Name</label>
              <input type="text" value={employee.bankName || ""} onChange={(e) => handleFieldChange("bankName", e.target.value)} className="w-full p-2 border border-gray-300 rounded">
              </input>

              <label className="block text-sm font-bold mt-4">Bank Branch</label>
              <input type="text" value={employee.bankBranch || ""} onChange={(e) => handleFieldChange("bankBranch", e.target.value)} className="w-full p-2 border border-gray-300 rounded" />

              <label className="block text-sm font-bold mt-4">Bank IFSC</label>
              <input type="text" value={employee.bankIfsc || ""} onChange={(e) => handleFieldChange("bankIfsc", e.target.value)} className="w-full p-2 border border-gray-300 rounded" />

              <label className="block text-sm font-bold mt-4">Address</label>
              <input type="text" value={employee.bankAddress || ""} onChange={(e) => handleFieldChange("bankAddress", e.target.value)} className="w-full p-2 border border-gray-300 rounded" />

              <label className="block text-sm font-bold mt-4">Name as per A/c</label>
              <input type="text" value={employee.nameAsPerAc || ""} onChange={(e) => handleFieldChange("nameAsPerAc", e.target.value)} className="w-full p-2 border border-gray-300 rounded" />

              <label className="block text-sm font-bold mt-4">Salary A/c Number</label>
              <input type="text" value={employee.salaryAcNumber || ""} onChange={(e) => handleFieldChange("salaryAcNumber", e.target.value)} className="w-full p-2 border border-gray-300 rounded" />

              <label className="block text-sm font-bold mt-4">Payment Mode</label>
              <select value={employee.paymentMode || ""} onChange={(e) => handleFieldChange("paymentMode", e.target.value)} className="w-full p-2 border border-gray-300 rounded">
                <option value="">Select</option>
                <option value="TRANSFER">Transfer</option>
                <option value="CHEQUE">Cheque</option>
                <option value="CASH">Cash</option>
              </select>

              <label className="block text-sm font-bold mt-4">A/c Type</label>
              <select value={employee.acType || ""} onChange={(e) => handleFieldChange("acType", e.target.value)} className="w-full p-2 border border-gray-300 rounded">
                <option value="">Select</option>
                <option value="ECS">ECS</option>
                <option value="NEFT">NEFT</option>
                <option value="RTGS">RTGS</option>
                <option value="IMPS">IMPS</option>
              </select>

              <label className="block text-sm font-bold mt-4">Bank Ref. No.</label>
              <input type="text" value={employee.bankRefNo || ""} onChange={(e) => handleFieldChange("bankRefNo", e.target.value)} className="w-full p-2 border border-gray-300 rounded" />

              <label className="block text-sm font-bold mt-4">Ward/Circle/Range</label>
              <input type="text" value={employee.wardCircleRange || ""} onChange={(e) => handleFieldChange("wardCircleRange", e.target.value)} className="w-full p-2 border border-gray-300 rounded" />

              <label className="block text-sm font-bold mt-4">LIC Policy No.</label>
              <input type="text" value={employee.licPolicyNo || ""} onChange={(e) => handleFieldChange("licPolicyNo", e.target.value)} className="w-full p-2 border border-gray-300 rounded" />

              <label className="block text-sm font-bold mt-4">Policy Term</label>
              <input type="text" value={employee.policyTerm || ""} onChange={(e) => handleFieldChange("policyTerm", e.target.value)} className="w-full p-2 border border-gray-300 rounded" />

              <label className="block text-sm font-bold mt-4">LIC ID</label>
              <input type="text" value={employee.licId || ""} onChange={(e) => handleFieldChange("licId", e.target.value)} className="w-full p-2 border border-gray-300 rounded" />

              <label className="block text-sm font-bold mt-4">Annual Renewal Date</label>
              <input type="date" value={employee.annualRenewableDate || ""} onChange={(e) => handleFieldChange("annualRenewableDate", e.target.value)} className="w-full p-2 border border-gray-300 rounded" />

              <div className="mt-4 flex flex-wrap gap-4">
                <input type="checkbox" checked={employee.hraApplicable || false} onChange={(e) => handleFieldChange("hraApplicable", e.target.checked)} /> HRA Applicable
                <input type="checkbox" checked={employee.bonusApplicable || false} onChange={(e) => handleFieldChange("bonusApplicable", e.target.checked)} /> Bonus Applicable
                <input type="checkbox" checked={employee.gratuityApplicable || false} onChange={(e) => handleFieldChange("gratuityApplicable", e.target.checked)} /> Gratuity Applicable
                <input type="checkbox" checked={employee.lwfApplicable || false} onChange={(e) => handleFieldChange("lwfApplicable", e.target.checked)} /> LWF Applicable
              </div>
            </div>

            <div>
              <div className="flex items-center">
                <input type="checkbox" checked={employee.pfApplicable || false} onChange={(e) => handleFieldChange("pfApplicable", e.target.checked)} /> PF Applicable
              </div>

              <label className="block text-sm font-bold mt-4">Educational Qual.</label>
              <input type="text" value={employee.educationalQualification || ""} onChange={(e) => handleFieldChange("educationalQualification", e.target.value)} className="w-full p-2 border border-gray-300 rounded" />



              <label className="block text-sm font-bold mt-4">Physically Handicap</label>
              <select value={employee.physicallyHandicap || ""} onChange={(e) => handleFieldChange("physicallyHandicap", e.target.value)} className="w-full p-2 border border-gray-300 rounded">
                <option>NO</option>
                <option>YES</option>
              </select>

              <label className="block text-sm font-bold mt-4">Registered in PMRPY</label>
              <input type="checkbox" checked={employee.registeredInPmrpy || false} onChange={(e) => handleFieldChange("registeredInPmrpy", e.target.checked)} />

              <label className="block text-sm font-bold mt-4">PF Joining Date</label>
              <input type="date" value={employee.pfJoiningDate || ""} onChange={(e) => handleFieldChange("pfJoiningDate", e.target.value)} className="w-full p-2 border border-gray-300 rounded" />

              <label className="block text-sm font-bold mt-4">PF Last Date</label>
              <input type="date" value={employee.pfLastDate || ""} onChange={(e) => handleFieldChange("pfLastDate", e.target.value)} className="w-full p-2 border border-gray-300 rounded" />

              <label className="block text-sm font-bold mt-4">PF No.</label>
              <input type="text" value={employee.pfAcNo || ""} onChange={(e) => handleFieldChange("pfAcNo", e.target.value)} className="w-full p-2 border border-gray-300 rounded" />

              <label className="block text-sm font-bold mt-4">UAN</label>
              <input type="text" value={employee.uan || ""} onChange={(e) => handleFieldChange("uan", e.target.value)} className="w-full p-2 border border-gray-300 rounded" />

              <div className="mt-4">
                <label className="block text-sm text-gray-600">(If Salary &gt; PF-Cut Off then consider Actual Salary OR Specify the Salary)</label>
                <input
                  type="radio"
                  name="pf_salary"
                  value="ACTUAL"
                  checked={employee.salaryForPfOption === "ACTUAL"}
                  onChange={() => handleFieldChange("salaryForPfOption", "ACTUAL")}
                />
                Consider Actual Salary

                <input
                  type="radio"
                  name="pf_salary"
                  value="EMPLOYER"
                  checked={employee.salaryForPfOption === "EMPLOYER"}
                  onChange={() => handleFieldChange("salaryForPfOption", "EMPLOYER")}
                  className="ml-4"
                />
                Same For Employer


              </div>

              <label className="block text-sm font-bold mt-4">Salary For PF</label>
              <input type="text" value={employee.salaryForPf || ""} onChange={(e) => handleFieldChange("salaryForPf", e.target.value)} className="w-full p-2 border border-gray-300 rounded" />

              <label className="block text-sm font-bold mt-4">Specify Min. Amt of PF</label>
              <input type="text" value={employee.minAmtPf || ""} onChange={(e) => handleFieldChange("minAmtPf", e.target.value)} className="w-full p-2 border border-gray-300 rounded" />

              <div className="mt-4">
                <input type="checkbox" checked={employee.pensionAppl || false} onChange={(e) => handleFieldChange("pensionAppl", e.target.checked)} /> Pension Appl.
              </div>

              <label className="block text-sm font-bold mt-4">Pension Joining Date</label>
              <input type="date" value={employee.pensionJoiningDate || ""} onChange={(e) => handleFieldChange("pensionJoiningDate", e.target.value)} className="w-full p-2 border border-gray-300 rounded" />

              <label className="block text-sm font-bold mt-4">Pension No Limit</label>
              <input type="checkbox" checked={employee.noLimit || false} onChange={(e) => handleFieldChange("noLimit", e.target.checked)} />

              <div className="mt-4">
                <input type="radio" checked={employee.pensionOnHigherWages || false} onChange={(e) => handleFieldChange("pensionOnHigherWages", e.target.checked)} name="pension" /> Pension on Higher Wages
              </div>

              <div className="mt-4">
                <input type="checkbox" checked={employee.esiApplicable || false} onChange={(e) => handleFieldChange("esiApplicable", e.target.checked)} /> ESI Applicable
              </div>

              <label className="block text-sm font-bold mt-4">ESI Joining Date</label>
              <input type="date" value={employee.esiJoiningDate || ""} onChange={(e) => handleFieldChange("esiJoiningDate", e.target.value)} className="w-full p-2 border border-gray-300 rounded" />

              <label className="block text-sm font-bold mt-4">ESI Last Date</label>
              <input type="date" value={employee.esiLastDate || ""} onChange={(e) => handleFieldChange("esiLastDate", e.target.value)} className="w-full p-2 border border-gray-300 rounded" />

              <label className="block text-sm font-bold mt-4">ESI No.</label>
              <input type="text" value={employee.esiNo || ""} onChange={(e) => handleFieldChange("esiNo", e.target.value)} className="w-full p-2 border border-gray-300 rounded" />

              <label className="block text-sm font-bold mt-4">Specify Min. Amount of ESI Contribution</label>
              <input type="text" value={employee.minAmtEsiContribution || ""} onChange={(e) => handleFieldChange("minAmtEsiContribution", e.target.value)} className="w-full p-2 border border-gray-300 rounded" />

              <div className="mt-4 flex items-center gap-4">
                <input type="radio" name="esi_mode" checked={employee.dispensaryOrPanel === "Dispensary"} onChange={() => handleFieldChange("dispensaryOrPanel", "Dispensary")} /> Dispensary
                <input type="radio" name="esi_mode" checked={employee.dispensaryOrPanel === "Panel System"} onChange={() => handleFieldChange("dispensaryOrPanel", "Panel System")} /> Panel System
                <input type="text" value={employee.dispensaryOrPanel || ""} onChange={(e) => handleFieldChange("dispensaryOrPanel", e.target.value)} className="w-full p-2 border border-gray-300 rounded" />
              </div>
            </div>
          </div>
        )}

        {activeTab === "Other" && (
          <div className="space-y-6">
            <label className="block text-sm font-bold">Recruitment Agency</label>
            <input type="text" value={employee.recruitmentAgency || ""} onChange={(e) => handleFieldChange("recruitmentAgency", e.target.value)} className="w-full p-2 border border-gray-300 rounded" />

            <label className="block text-sm font-bold">Bank Mandate</label>
            <input type="text" value={employee.bankMandate || ""} onChange={(e) => handleFieldChange("bankMandate", e.target.value)} className="w-full p-2 border border-gray-300 rounded" />

            <label className="block text-sm font-bold">Employment Status</label>
            <select value={employee.employmentStatus || ""} onChange={(e) => handleFieldChange("employmentStatus", e.target.value)} className="w-full p-2 border border-gray-300 rounded">
              <option value="">Select Status</option>
              <option value="ACTIVE">Active</option>
              <option value="PROBATION">Probation</option>
              <option value="RESIGNED">Resigned</option>
              <option value="TERMINATED">Terminated</option>
              <option value="RETIRED">Retired</option>
              <option value="DECEASED">Deceased</option>
            </select>

            <label className="block text-sm font-bold">Lap Tops</label>
            <input type="text" value={employee.lapTops || ""} onChange={(e) => handleFieldChange("lapTops", e.target.value)} className="w-full p-2 border border-gray-300 rounded" />

            <label className="block text-sm font-bold">Company Vehicle</label>
            <input type="text" value={employee.companyVehicle || ""} onChange={(e) => handleFieldChange("companyVehicle", e.target.value)} className="w-full p-2 border border-gray-300 rounded" />

            <label className="block text-sm font-bold">Corp. Credit Card No.</label>
            <input type="text" value={employee.corpCreditCardNo || ""} onChange={(e) => handleFieldChange("corpCreditCardNo", e.target.value)} className="w-full p-2 border border-gray-300 rounded" />

            <label className="block text-sm font-bold">Transport Route</label>
            <input type="text" value={employee.transportRoute || ""} onChange={(e) => handleFieldChange("transportRoute", e.target.value)} className="w-full p-2 border border-gray-300 rounded" />

            <label className="block text-sm font-bold">Work Location</label>
            <input type="text" value={employee.workLocation || ""} onChange={(e) => handleFieldChange("workLocation", e.target.value)} className="w-full p-2 border border-gray-300 rounded" />


            <label className="block text-sm font-bold mt-4">Reason For Leaving</label>
            <select value={employee.reasonForLeaving || ""} onChange={(e) => handleFieldChange("reasonForLeaving", e.target.value)} className="w-full p-2 border border-gray-300 rounded">
              <option value="">Select Reason</option>
              <option value="Resigned">Resigned</option>
              <option value="Terminated">Terminated</option>
              <option value="Retired">Retired</option>
              <option value="Deceased">Deceased</option>
              <option value="Other">Other</option>
            </select>

            <label className="block text-sm font-bold mt-4">Service : -</label>
            <input type="text" value={employee.service || ""} onChange={(e) => handleFieldChange("service", e.target.value)} className="w-full p-2 border border-gray-300 rounded" />

            <label className="block text-sm font-bold mt-4">Remarks : -</label>
            <input type="text" value={employee.remarks || ""} onChange={(e) => handleFieldChange("remarks", e.target.value)} className="w-full p-2 border border-gray-300 rounded" />
          </div>
        )}

        {activeTab === "Family" && (

          <div>
            <table className="w-full border-collapse border border-gray-300 table-fixed">

              <colgroup>
                <col className="w-[4%]" />   {/* SN */}
                <col className="w-[10%]" />  {/* Name */}
                <col className="w-[18%]" />  {/* Address */}
                <col className="w-[12%]" />  {/* Relationship */}
                <col className="w-[8%]" />   {/* DOB */}
                <col className="w-[6%]" />   {/* Residing */}
                <col className="w-[10%]" />  {/* District */}
                <col className="w-[10%]" />  {/* State */}
                <col className="w-[12%]" />  {/* Remark */}
                <col className="w-[10%]" />  {/* Aadhaar */}
                <col className="w-[10%]" />  {/* Action */}
              </colgroup>


              <thead>
                <tr className="bg-gray-100">
                  <th className="border p-2 text-xs font-semibold">S.N.</th>
                  <th className="border p-2 text-xs font-semibold">Name</th>
                  <th className="border p-2 text-xs font-semibold">Address</th>
                  <th className="border p-2 text-xs font-semibold">Relationship</th>
                  <th className="border p-2 text-xs font-semibold">DOB / Age</th>
                  <th className="border p-2 text-xs font-semibold">Residing</th>
                  <th className="border p-2 text-xs font-semibold">District</th>
                  <th className="border p-2 text-xs font-semibold">State</th>
                  <th className="border p-2 text-xs font-semibold">Remark</th>
                  <th className="border p-2 text-xs font-semibold">Aadhaar</th>
                  <th className="border p-2 text-xs font-semibold">Action</th>
                </tr>
              </thead>

              <tbody>
                {(employee.family || []).map((f: any, index: number) => (
                  <tr key={index} className="align-center">
                    {/* S.N */}
                    <td className="border p-2 text-center text-sm">
                      {index + 1}
                    </td>

                    {/* Name */}
                    <td className="border p-2">
                      <textarea
                        rows={2}
                        placeholder="Full Name"
                        className={tableTextarea}
                        value={f.name || ""}
                        onChange={(e) => updateRow("family", index, "name", e.target.value)}
                      />
                    </td>

                    {/* Address */}
                    <td className="border p-2">
                      <textarea
                        rows={3}
                        placeholder="Complete Address"
                        className={tableTextarea}
                        value={f.address || ""}
                        onChange={(e) => updateRow("family", index, "address", e.target.value)}
                      />
                    </td>

                    {/* Relationship */}
                    <td className="border p-2">
                      <input
                        placeholder="Relationship"
                        className={tableInput}
                        value={f.relationship || ""}
                        onChange={(e) =>
                          updateRow("family", index, "relationship", e.target.value)
                        }
                      />
                    </td>

                    {/* DOB / Age */}
                    <td className="border p-2">
                      <input
                        placeholder="DOB / Age"
                        className={tableInput}
                        value={f.dobAge || ""}
                        onChange={(e) =>
                          updateRow("family", index, "dobAge", e.target.value)
                        }
                      />
                    </td>

                    {/* Residing */}
                    <td className="border p-2 text-center align-middle">
                      <input
                        type="checkbox"
                        className="h-4 w-4"
                        checked={!!f.residing}
                        onChange={(e) =>
                          updateRow("family", index, "residing", e.target.checked)
                        }
                      />
                    </td>


                    {/* District */}
                    <td className="border p-2">
                      <input
                        placeholder="District"
                        className={tableInput}
                        value={f.district || ""}
                        onChange={(e) =>
                          updateRow("family", index, "district", e.target.value)
                        }
                      />
                    </td>

                    {/* State */}
                    <td className="border p-2">
                      <input
                        placeholder="State"
                        className={tableInput}
                        value={f.state || ""}
                        onChange={(e) =>
                          updateRow("family", index, "state", e.target.value)
                        }
                      />
                    </td>

                    {/* Remark */}
                    <td className="border p-2">
                      <textarea
                        rows={2}
                        placeholder="Remark"
                        className={tableTextarea}
                        value={f.remark || ""}
                        onChange={(e) =>
                          updateRow("family", index, "remark", e.target.value)
                        }
                      />
                    </td>

                    {/* Aadhaar */}
                    <td className="border p-2">
                      <input
                        placeholder="Aadhaar"
                        className={tableInput}
                        value={f.aadhar || ""}
                        onChange={(e) =>
                          updateRow("family", index, "aadhar", e.target.value)
                        }
                      />
                    </td>
                    {/* Action */}
                    <td className="border p-2 text-center">
                      <button
                        type="button"
                        onClick={() => deleteRow("family", index)}
                        className="text-red-600 text-xs hover:underline"
                      >
                        Delete
                      </button>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex gap-2 mt-2">

              <div className="flex gap-2 mt-3">
                <button
                  type="button"
                  className="px-4 py-2 bg-yellow-300 rounded text-sm"
                  onClick={() =>
                    addRow("family", {
                      name: "",
                      address: "",
                      relationship: "",
                      dobAge: "",
                      residing: false,
                      district: "",
                      state: "",
                      remark: "",
                      aadhar: "",
                    })
                  }
                >
                  Add Row
                </button>
              </div>


            </div>
          </div>
        )}

        {activeTab === "Nominee(s)" && (
          <div>
            <table className="w-full border-collapse border border-gray-300 table-fixed">
              <colgroup>
                <col className="w-[4%]" />
                <col className="w-[12%]" />
                <col className="w-[18%]" />
                <col className="w-[10%]" />
                <col className="w-[10%]" />
                <col className="w-[8%]" />
                <col className="w-[14%]" />
                <col className="w-[8%]" />
                <col className="w-[12%]" />
                <col className="w-[10%]" />
              </colgroup>

              <thead>
                <tr className="bg-gray-100">
                  <th className="border p-2 text-xs">S.N.</th>
                  <th className="border p-2 text-xs">Name</th>
                  <th className="border p-2 text-xs">Address</th>
                  <th className="border p-2 text-xs">District</th>
                  <th className="border p-2 text-xs">State</th>
                  <th className="border p-2 text-xs">PIN</th>
                  <th className="border p-2 text-xs">Relationship</th>
                  <th className="border p-2 text-xs">DOB / Age</th>
                  <th className="border p-2 text-xs">Gratuity %</th>
                  <th className="border p-2 text-xs">Action</th>
                </tr>
              </thead>

              <tbody>
                {(employee.nominees || []).map((n: any, index: number) => (
                  <tr key={index}>
                    <td className="border p-2 text-center">{index + 1}</td>

                    <td className="border p-2">
                      <input
                        className={tableInput}
                        placeholder="Name"
                        value={n.name || ""}
                        onChange={(e) =>
                          updateRow("nominees", index, "name", e.target.value)
                        }
                      />
                    </td>

                    <td className="border p-2">
                      <textarea
                        rows={2}
                        placeholder="Address"
                        className={tableTextarea}
                        value={n.address || ""}
                        onChange={(e) =>
                          updateRow("nominees", index, "address", e.target.value)
                        }
                      />
                    </td>

                    <td className="border p-2">
                      <input
                        className={tableInput}
                        placeholder="District"
                        value={n.district || ""}
                        onChange={(e) =>
                          updateRow("nominees", index, "district", e.target.value)
                        }
                      />
                    </td>

                    <td className="border p-2">
                      <input
                        className={tableInput}
                        placeholder="State"
                        value={n.state || ""}
                        onChange={(e) =>
                          updateRow("nominees", index, "state", e.target.value)
                        }
                      />
                    </td>

                    <td className="border p-2">
                      <input
                        className={tableInput}
                        placeholder="PIN"
                        value={n.pin || ""}
                        onChange={(e) =>
                          updateRow("nominees", index, "pin", e.target.value)
                        }
                      />
                    </td>

                    <td className="border p-2">
                      <input
                        className={tableInput}
                        placeholder="Relationship"
                        value={n.relationship || ""}
                        onChange={(e) =>
                          updateRow("nominees", index, "relationship", e.target.value)
                        }
                      />
                    </td>

                    <td className="border p-2">
                      <input
                        className={tableInput}
                        placeholder="DOB / Age"
                        value={n.dobAge || ""}
                        onChange={(e) =>
                          updateRow("nominees", index, "dobAge", e.target.value)
                        }
                      />
                    </td>

                    <td className="border p-2">
                      <input
                        className={tableInput}
                        placeholder="Gratuity %"
                        value={n.gratuityShare || ""}
                        onChange={(e) =>
                          updateRow("nominees", index, "gratuityShare", e.target.value)
                        }
                      />
                    </td>

                    <td className="border p-2 text-center">
                      <button
                        type="button"
                        className="text-red-600 text-xs"
                        onClick={() => deleteRow("nominees", index)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="flex gap-2 mt-3">
              <button
                type="button"
                className="px-4 py-2 bg-yellow-300 rounded text-sm"
                onClick={() =>
                  addRow("nominees", {
                    name: "",
                    address: "",
                    district: "",
                    state: "",
                    pin: "",
                    relationship: "",
                    dobAge: "",
                    gratuityShare: "",
                  })
                }
              >
                Add Row
              </button>

              <button
                type="button"
                className="px-4 py-2 bg-yellow-300 rounded text-sm ml-auto"
                onClick={() => {
                  setEmployee((prev: any) => ({
                    ...prev,
                    nominees: (prev.family || []).map((f: any) => ({
                      name: f.name || "",
                      address: f.address || "",
                      district: f.district || "",
                      state: f.state || "",
                      pin: "",
                      relationship: f.relationship || "",
                      dobAge: f.dobAge || "",
                      gratuityShare: "100",
                    })),
                  }));
                }}
              >
                Import From Family
              </button>
            </div>
          </div>
        )}


        {activeTab === "Witness" && (
          <div>
            <table className="w-full border-collapse border border-gray-300 table-fixed">
              <colgroup>
                <col className="w-[6%]" />
                <col className="w-[32%]" />
                <col className="w-[46%]" />
                <col className="w-[16%]" />
              </colgroup>

              <thead>
                <tr className="bg-gray-100">
                  <th className="border p-2 text-xs font-semibold">S.N.</th>
                  <th className="border p-2 text-xs font-semibold">Name</th>
                  <th className="border p-2 text-xs font-semibold">Address</th>
                  <th className="border p-2 text-xs font-semibold">Action</th>
                </tr>
              </thead>

              <tbody>
                {(employee.witnesses || []).map((w: any, index: number) => (
                  <tr key={index}>
                    <td className="border p-2 text-center">{index + 1}</td>

                    <td className="border p-2">
                      <input
                        type="text"
                        className={tableInput}
                        placeholder="Witness Name"
                        value={w.name || ""}
                        onChange={(e) =>
                          updateRow("witnesses", index, "name", e.target.value)
                        }
                      />
                    </td>

                    <td className="border p-2">
                      <textarea
                        rows={2}
                        className={tableTextarea}
                        placeholder="Complete Address"
                        value={w.address || ""}
                        onChange={(e) =>
                          updateRow("witnesses", index, "address", e.target.value)
                        }
                      />
                    </td>

                    <td className="border p-2 text-center">
                      <button
                        type="button"
                        className="text-red-600 text-xs hover:underline"
                        onClick={() => deleteRow("witnesses", index)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="flex gap-2 mt-3">
              <button
                type="button"
                className="px-4 py-2 bg-yellow-300 rounded text-sm"
                onClick={() =>
                  addRow("witnesses", {
                    name: "",
                    address: "",
                  })
                }
              >
                Add Row
              </button>
            </div>
          </div>
        )}


        {activeTab === "Experience" && (
          <div>
            <label className="block text-sm font-bold mb-2">
              Previous Work Experience : -
            </label>

            <table className="w-full border-collapse border border-gray-300 table-fixed">
              <colgroup>
                <col className="w-[4%]" />
                <col className="w-[18%]" />
                <col className="w-[16%]" />
                <col className="w-[16%]" />
                <col className="w-[14%]" />
                <col className="w-[14%]" />
                <col className="w-[18%]" />
              </colgroup>

              <thead>
                <tr className="bg-gray-100">
                  <th className="border p-2 text-xs font-semibold">S.N.</th>
                  <th className="border p-2 text-xs font-semibold">Company Name</th>
                  <th className="border p-2 text-xs font-semibold">Location</th>
                  <th className="border p-2 text-xs font-semibold">Designation</th>
                  <th className="border p-2 text-xs font-semibold">From</th>
                  <th className="border p-2 text-xs font-semibold">To</th>
                  <th className="border p-2 text-xs font-semibold">Remark</th>
                </tr>
              </thead>

              <tbody>
                {(employee.experiences || []).map((exp: any, index: number) => (
                  <tr key={index}>
                    <td className="border p-2 text-center">{index + 1}</td>

                    <td className="border p-2">
                      <input
                        className={tableInput}
                        value={exp.companyName || ""}
                        onChange={(e) =>
                          updateRow("experiences", index, "companyName", e.target.value)
                        }
                      />
                    </td>

                    <td className="border p-2">
                      <input
                        className={tableInput}
                        value={exp.location || ""}
                        onChange={(e) =>
                          updateRow("experiences", index, "location", e.target.value)
                        }
                      />
                    </td>

                    <td className="border p-2">
                      <input
                        className={tableInput}
                        value={exp.designation || ""}
                        onChange={(e) =>
                          updateRow("experiences", index, "designation", e.target.value)
                        }
                      />
                    </td>

                    <td className="border p-2">
                      <input
                        type="date"
                        className={tableInput}
                        value={exp.from || ""}
                        onChange={(e) =>
                          updateRow("experiences", index, "from", e.target.value)
                        }
                      />
                    </td>

                    <td className="border p-2">
                      <input
                        type="date"
                        className={tableInput}
                        value={exp.to || ""}
                        onChange={(e) =>
                          updateRow("experiences", index, "to", e.target.value)
                        }
                      />
                    </td>

                    <td className="border p-2">
                      <input
                        className={tableInput}
                        value={exp.remark || ""}
                        onChange={(e) =>
                          updateRow("experiences", index, "remark", e.target.value)
                        }
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="flex gap-2 mt-3">
              <button
                type="button"
                className="px-4 py-2 bg-yellow-300 rounded text-sm"
                onClick={() =>
                  addRow("experiences", {
                    companyName: "",
                    location: "",
                    designation: "",
                    from: "",
                    to: "",
                    remark: "",
                  })
                }
              >
                Add Row
              </button>

              <button
                type="button"
                className="px-4 py-2 bg-yellow-300 rounded text-sm"
                onClick={() =>
                  deleteRow("experiences", employee.experiences.length - 1)
                }
                disabled={!employee.experiences?.length}
              >
                Delete Last Row
              </button>
            </div>
          </div>
        )}


        <div className="flex justify-between mt-6 items-center">
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
          >
            {isSaving ? "Saving..." : (employeeProp?.id ? "Update Employee" : "Create Employee")}
          </button>
          <button type="button" className="px-6 py-2 bg-gray-500 text-white rounded" onClick={() => onCancel?.()}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddEmployee