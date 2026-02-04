"use client";

import { useState, useEffect } from "react";
import { calculateSalary } from "@/app/lib/calculateSalary";
import { useCompanySetups } from "@/hooks/useCompanySetups";
const INDIAN_STATES: string[] = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Andaman and Nicobar Islands",
  "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Jammu and Kashmir",
  "Ladakh",
  "Lakshadweep",
  "Puducherry",
];



type AddEmployeeProps = {
  employee?: any;
  onSubmit?: (updatedEmployee: any) => void;
  onCancel?: () => void;
};

const AddEmployee = ({ employee: employeeProp, onSubmit, onCancel }: AddEmployeeProps) => {
  const [activeTab, setActiveTab] = useState("Personal");

  const tabs = [
    "Personal",
    "Office details",
    "Qualification",
    "Financial",
    "Salary",
    "Other",
    "Family",
    "Nominee(s)",
    "Witness",
    "Experience",
  ];
  // DEMO SALARY HEADS (No DB, No API)

  // DEMO OFFICE SETUP DATA (No DB, No API)
  const officeSetups = {
    branches: ["Head Office", "Delhi Branch", "Mumbai Branch", "Bangalore Branch"],
    departments: ["Human Resources", "Information Technology", "Finance", "Operations", "Marketing"],
    designations: ["Software Engineer", "HR Manager", "Accountant", "Team Lead", "Intern"],
    levels: ["L1 - Entry", "L2 - Junior", "L3 - Mid", "L4 - Senior", "L5 - Lead"],
    grades: ["Grade A", "Grade B", "Grade C", "Grade D"],
    categories: ["Permanent", "Contract", "Probation", "Freelance"],
    attendanceTypes: ["Biometric", "Manual Punch", "Mobile App", "Web Login"]
  };
  const tableInput =
    "w-full h-9 px-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-400";

  const tableTextarea =
    "w-full px-2 py-1 text-sm border border-gray-300 rounded resize-none focus:outline-none focus:ring-1 focus:ring-blue-400";
  const [totalExperience, setTotalExperience] = useState({
    years: "",
    months: "",
  });

  const MAX_UPLOAD_SIZE = 50 * 1024; // 50 KB
  const [employee, setEmployee] = useState<any>({
    family: [],
    nominees: [],
    qualifications: [],
    witnesses: [],
    experiences: [],
    companyAssets: [],
  });


  // Load employee data when prop changes (for editing)
  useEffect(() => {
    if (employeeProp && Object.keys(employeeProp).length > 0) {
      // Deep clone to avoid reference issues
      setEmployee(JSON.parse(JSON.stringify(employeeProp)));

      // Load salary data if employee has salary information
      if (employeeProp.salary) {
        setSalaryMode(employeeProp.salary.mode || "CTC");
        setSalaryAmount(employeeProp.salary.inputAmount || 0);
        if (employeeProp.salary.selectedHeadIds) {
          setSelectedHeadIds(employeeProp.salary.selectedHeadIds);
        }
      }
    } else {
      setEmployee({
        family: [],
        nominees: [],
        qualifications: [],
        witnesses: [],
        experiences: [],
        companyAssets: [],
      });
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




  const handleFieldChange = (field: string, value: any) => {
    setEmployee((prev: any) => ({ ...prev, [field]: value }));
  };
  const addRow = (key: string, emptyRow: any) => {
    setEmployee((prev: any) => ({
      ...prev,
      [key]: [...(prev[key] || []), emptyRow],
    }));
  };

  const deleteRow = (key: string, index: number) => {
    setEmployee((prev: any) => ({
      ...prev,
      [key]: prev[key].filter((_: any, i: number) => i !== index),
    }));
  };

  const updateRow = (key: string, index: number, field: string, value: any) => {
    setEmployee((prev: any) => {
      const updated = [...prev[key]];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, [key]: updated };
    });
  };


  // ---------------- SALARY CALCULATION ENGINE ----------------
  useEffect(() => {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!employee.code || employee.code.trim() === "") {
      alert("Employee Code is required");
      return;
    }

    const payload = {
      employee,
      salary: {
        mode: salaryMode,
        inputAmount: salaryAmount,
        selectedHeadIds,
      },
    };

    try {
      // Get company ID from localStorage for header
      const selectedCompany = localStorage.getItem("selectedCompany");
      if (!selectedCompany) {
        alert("Please select a company first");
        return;
      }

      const company = JSON.parse(selectedCompany);
      const companyId = company?.id;

      if (!companyId) {
        alert("Invalid company selection");
        return;
      }

      const res = await fetch("/api/employee-details", {
        method: employeeProp?.id ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          "x-company-id": companyId,
        },
        body: JSON.stringify(employeeProp?.id ? { id: employeeProp.id, ...payload } : payload),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || error.message || "Failed to save employee");
      }

      const result = await res.json();
      alert(employeeProp?.id ? "Employee updated successfully" : "Employee created successfully");
      onSubmit?.(result);
    } catch (err: any) {
      alert(err.message || "Failed to save employee");
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
        {activeTab === "Personal" && (
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold">Code <span className="text-red-500">*</span></label>
              <input
                type="text"
                className="w-full p-2 border border-gray-300 rounded"
                value={employee.code || ""}
                onChange={(e) => handleFieldChange("code", e.target.value)}
                required
              />

              <label className="block text-sm font-bold mt-4">Name</label>
              <input
                type="text"
                className="w-full p-2 border border-gray-300 rounded"
                value={employee.name || ""}
                onChange={(e) => handleFieldChange("name", e.target.value)}
              />

              <label className="block text-sm font-bold mt-4">Permanent Address Details : -</label>
              <input
                type="text"
                value={employee.permanentAddress?.flat || ""}
                onChange={(e) =>
                  setEmployee((prev: any) => ({
                    ...prev,
                    permanentAddress: {
                      ...prev.permanentAddress,
                      flat: e.target.value
                    }
                  }))
                }
              />

              <input type="text" value={employee.permanentAddress?.building || ""} onChange={(e) =>
                setEmployee((prev: any) => ({
                  ...prev,
                  permanentAddress: {
                    ...prev.permanentAddress,
                    building: e.target.value
                  }
                }))
              } placeholder="Building" className="w-full p-2 border border-gray-300 rounded mt-1" />
              <input type="text" value={employee.permanentAddress?.area || ""} onChange={(e) =>
                setEmployee((prev: any) => ({
                  ...prev,
                  permanentAddress: {
                    ...prev.permanentAddress,
                    area: e.target.value
                  }
                }))
              } placeholder="Area" className="w-full p-2 border border-gray-300 rounded mt-1" />
              <input type="text" value={employee.permanentAddress?.road || ""} onChange={(e) =>
                setEmployee((prev: any) => ({
                  ...prev,
                  permanentAddress: {
                    ...prev.permanentAddress,
                    road: e.target.value
                  }
                }))
              } placeholder="Road" className="w-full p-2 border border-gray-300 rounded mt-1" />
              <input type="text" value={employee.permanentAddress?.city || ""} onChange={(e) =>
                setEmployee((prev: any) => ({
                  ...prev,
                  permanentAddress: {
                    ...prev.permanentAddress,
                    city: e.target.value
                  }
                }))
              } placeholder="City" className="w-full p-2 border border-gray-300 rounded mt-1" />
              <input type="text" value={employee.permanentAddress?.pin || ""} onChange={(e) =>
                setEmployee((prev: any) => ({
                  ...prev,
                  permanentAddress: {
                    ...prev.permanentAddress,
                    pin: e.target.value
                  }
                }))
              } placeholder="PIN" className="w-full p-2 border border-gray-300 rounded mt-1" />
              <input type="text" value={employee.permanentAddress?.district || ""} onChange={(e) =>
                setEmployee((prev: any) => ({
                  ...prev,
                  permanentAddress: {
                    ...prev.permanentAddress,
                    district: e.target.value
                  }
                }))
              } placeholder="District" className="w-full p-2 border border-gray-300 rounded mt-1" />
              <select
                className="w-full p-2 border border-gray-300 rounded mt-1"
                value={employee.permanentState ?? ""}
                onChange={(e) => handleFieldChange("permanentState", e.target.value)}
              >
                <option value="">Select State</option>
                {INDIAN_STATES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}

              </select>

              <label className="block text-sm font-bold mt-4">E-Mail</label>
              <input
                type="email"
                className="w-full p-2 border border-gray-300 rounded"
                value={employee.email || ""}
                onChange={(e) => handleFieldChange("email", e.target.value)}
              />

              <label className="block text-sm font-bold mt-4">DOB</label>
              <input
                type="date"
                className="w-full p-2 border border-gray-300 rounded"
                value={employee.dob || ""}
                onChange={(e) => handleFieldChange("dob", e.target.value)}
              />

              <label className="block text-sm font-bold mt-4">PAN</label>
              <input
                type="text"
                className="w-full p-2 border border-gray-300 rounded"
                value={employee.pan || ""}
                onChange={(e) => handleFieldChange("pan", e.target.value)}
              />

              <label className="block text-sm font-bold mt-4">NASSCOM Reg No.</label>
              <input
                type="text"
                className="w-full p-2 border border-gray-300 rounded"
                value={employee.nasscomRegNo || ""}
                onChange={(e) => handleFieldChange("nasscomRegNo", e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-bold">Addhar No.</label>
              <input type="text" value={employee.aadharNo || ""} onChange={(e) => handleFieldChange("aadharNo", e.target.value)} className="w-full p-2 border border-gray-300 rounded" />

              <label className="block text-sm font-bold mt-4">Mobile No.</label>
              <input type="text" value={employee.mobileNo || ""} onChange={(e) => handleFieldChange("mobileNo", e.target.value)} className="w-full p-2 border border-gray-300 rounded" />

              <label className="block text-sm font-bold mt-4">Internal ID</label>
              <input type="text" value={employee.internalId || ""} onChange={(e) => handleFieldChange("internalId", e.target.value)} className="w-full p-2 border border-gray-300 rounded" />

              <label className="block text-sm font-bold mt-4">Notice Period</label>
              <input
                type="text"
                className="w-full p-2 border border-gray-300 rounded"
                value={employee.noticePeriodMonths || ""}
                onChange={(e) => handleFieldChange("noticePeriodMonths", e.target.value)}
              />

              <label className="block text-sm font-bold mt-4">Joining Date</label>
              <input
                type="date"
                className="w-full p-2 border border-gray-300 rounded"
                value={employee.doj || ""}
                onChange={(e) => handleFieldChange("doj", e.target.value)}
              />

              <label className="block text-sm font-bold mt-4">Probation Period</label>
              <input type="text" value={employee.probationPeriodMonths || ""} onChange={(e) => handleFieldChange("probationPeriodMonths", e.target.value)} className="w-full p-2 border border-gray-300 rounded" placeholder="Months" />

              <label className="block text-sm font-bold mt-4">Confirmation Date</label>
              <input type="date" value={employee.confirmationDate || ""} onChange={(e) => handleFieldChange("confirmationDate", e.target.value)} className="w-full p-2 border border-gray-300 rounded" />

              <label className="block text-sm font-bold mt-4">Resig. Letter Date</label>
              <input type="date" value={employee.resignationLetterDate || ""} onChange={(e) => handleFieldChange("resignationLetterDate", e.target.value)} className="w-full p-2 border border-gray-300 rounded" />

              <label className="block text-sm font-bold mt-4">Resig. Date L.W.D.</label>
              <input type="date" value={employee.resignationDateLWD || ""} onChange={(e) => handleFieldChange("resignationDateLWD", e.target.value)} className="w-full p-2 border border-gray-300 rounded" />

              <label className="block text-sm font-bold mt-4">Appraisal Date</label>
              <input type="date" value={employee.appraisalDate || ""} onChange={(e) => handleFieldChange("appraisalDate", e.target.value)} className="w-full p-2 border border-gray-300 rounded" />

              <label className="block text-sm font-bold mt-4">Commitment Completion Date</label>
              <input type="date" value={employee.commitmentCompletionDate || ""} onChange={(e) => handleFieldChange("commitmentCompletionDate", e.target.value)} className="w-full p-2 border border-gray-300 rounded" />

              <label className="block text-sm font-bold mt-4">Date of Death</label>
              <input type="date" value={employee.dateOfDeath || ""} onChange={(e) => handleFieldChange("dateOfDeath", e.target.value)} className="w-full p-2 border border-gray-300 rounded" />

              <label className="block text-sm font-bold mt-4">SELECT REASON</label>
              <select value={employee.reason || ""} onChange={(e) => handleFieldChange("reason", e.target.value)} className="w-full p-2 border border-gray-300 rounded">
                <option>SELECT REASON</option>
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
                  <option>UnMarried</option>
                  <option>Married</option>
                  <option>Widowed</option>
                  <option>Divorced</option>
                </select>

                <label className="block text-sm font-bold mt-4">Father's Name</label>
                <input type="text" value={employee.fathersName || ""} onChange={(e) => handleFieldChange("fathersName", e.target.value)} className="w-full p-2 border border-gray-300 rounded" />

                <label className="block text-sm font-bold mt-4">Mother's Name</label>
                <input type="text" value={employee.mothersName || ""} onChange={(e) => handleFieldChange("mothersName", e.target.value)} className="w-full p-2 border border-gray-300 rounded" />

                <label className="block text-sm font-bold mt-4">Blood Group</label>
                <select value={employee.bloodGroup || ""} onChange={(e) => handleFieldChange("bloodGroup", e.target.value)} className="w-full p-2 border border-gray-300 rounded">
                  <option>A+</option>
                  <option>A-</option>
                  <option>B+</option>
                  <option>B-</option>
                  <option>AB+</option>
                  <option>AB-</option>
                  <option>O+</option>
                  <option>O-</option>
                </select>

                <label className="block text-sm font-bold mt-4">Date of Marriage</label>
                <input type="date" value={employee.dateOfMarriage || ""} onChange={(e) => handleFieldChange("dateOfMarriage", e.target.value)} className="w-full p-2 border border-gray-300 rounded" />

                <label className="block text-sm font-bold mt-4">No. Dependent</label>
                <input type="text" value={employee.noOfDependents || ""} onChange={(e) => handleFieldChange("noOfDependents", e.target.value)} className="w-full p-2 border border-gray-300 rounded" />
              </div>

              <div>
                <label className="block text-sm font-bold">Caste</label>
                <select value={employee.caste || ""} onChange={(e) => handleFieldChange("caste", e.target.value)} className="w-full p-2 border border-gray-300 rounded">
                  <option>GEN</option>
                  <option>OBC</option>
                  <option>SC</option>
                  <option>ST</option>
                </select>

                <label className="block text-sm font-bold mt-4">Nationality</label>
                <select value={employee.nationality || ""} onChange={(e) => handleFieldChange("nationality", e.target.value)} className="w-full p-2 border border-gray-300 rounded">
                  <option>Indian</option>
                  <option>NRI</option>
                </select>

                <label className="block text-sm font-bold mt-4">Religion</label>
                <select value={employee.religion || ""} onChange={(e) => handleFieldChange("religion", e.target.value)} className="w-full p-2 border border-gray-300 rounded">
                  <option>Hindu</option>
                  <option>Muslim</option>
                  <option>Christian</option>
                  <option>Sikh</option>
                  <option>Buddhist</option>
                  <option>Jain</option>
                  <option>Others</option>
                </select>

                <label className="block text-sm font-bold mt-4">Spouse</label>
                <input type="text" value={employee.spouse || ""} onChange={(e) => handleFieldChange("spouse", e.target.value)} className="w-full p-2 border border-gray-300 rounded" />

                <div className="mt-4">
                  <input type="checkbox" /> Reimbursement Applicable
                </div>

                <label className="block text-sm font-bold mt-4">Correspondence Address Details : -</label>

                <input type="text" value={employee.correspondenceAddress || ""} onChange={(e) => handleFieldChange("correspondenceAddress", e.target.value)} placeholder="Address" className="w-full p-2 border border-gray-300 rounded mt-1" />
                <input type="text" value={employee.correspondenceCity || ""} onChange={(e) => handleFieldChange("correspondenceCity", e.target.value)} placeholder="City" className="w-full p-2 border border-gray-300 rounded mt-1" />
                <input type="text" value={employee.correspondenceDistrict || ""} onChange={(e) => handleFieldChange("correspondenceDistrict", e.target.value)} placeholder="District" className="w-full p-2 border border-gray-300 rounded mt-1" />
                <select
                  className="w-full p-2 border border-gray-300 rounded mt-1"
                  value={employee.correspondenceState ?? ""}
                  onChange={(e) => handleFieldChange("correspondenceState", e.target.value)}
                >
                  <option value="">Select State</option>
                  {INDIAN_STATES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}

                </select>
                <input type="text" value={employee.correspondencePIN || ""} onChange={(e) => handleFieldChange("correspondencePIN", e.target.value)} placeholder="PIN" className="w-full p-2 border border-gray-300 rounded mt-1" />
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
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select Branch</option>
                  {officeSetups.branches.map((b) => (
                    <option key={b} value={b}>{b}</option>
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
                  <option value="">Select Department</option>
                  {officeSetups.departments.map((d) => (
                    <option key={d} value={d}>{d}</option>
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
                  <option value="">Select Designation</option>
                  {officeSetups.designations.map((d) => (
                    <option key={d} value={d}>{d}</option>
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
                  <option value="">Select Level</option>
                  {officeSetups.levels.map((l) => (
                    <option key={l} value={l}>{l}</option>
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
                  <option value="">Select Grade</option>
                  {officeSetups.grades.map((g) => (
                    <option key={g} value={g}>{g}</option>
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
                  <option value="">Select Category</option>
                  {officeSetups.categories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              {/* Attendance Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Attendance Type</label>
                <select
                  value={employee.attendanceType || ""}
                  onChange={(e) => handleFieldChange("attendanceType", e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Type</option>
                  {officeSetups.attendanceTypes.map((t) => (
                    <option key={t} value={t}>{t}</option>
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

                            updateRow("qualifications", index, "uploadCertification", file);
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
              <input type="text" value={employee.bankIFSC || ""} onChange={(e) => handleFieldChange("bankIFSC", e.target.value)} className="w-full p-2 border border-gray-300 rounded" />

              <label className="block text-sm font-bold mt-4">Address</label>
              <input type="text" value={employee.bankAddress || ""} onChange={(e) => handleFieldChange("bankAddress", e.target.value)} className="w-full p-2 border border-gray-300 rounded" />

              <label className="block text-sm font-bold mt-4">Name as per A/c</label>
              <input type="text" value={employee.bankNameAsPerAcoount || ""} onChange={(e) => handleFieldChange("bankNameAsPerAcoount", e.target.value)} className="w-full p-2 border border-gray-300 rounded" />

              <label className="block text-sm font-bold mt-4">Salary A/c Number</label>
              <input type="text" value={employee.bankAccountNumber || ""} onChange={(e) => handleFieldChange("bankAccountNumber", e.target.value)} className="w-full p-2 border border-gray-300 rounded" />

              <label className="block text-sm font-bold mt-4">Payment Mode</label>
              <select value={employee.paymentMode || ""} onChange={(e) => handleFieldChange("paymentMode", e.target.value)} className="w-full p-2 border border-gray-300 rounded">
                <option>TRANSFER</option>
              </select>

              <label className="block text-sm font-bold mt-4">A/c Type</label>
              <select value={employee.accountType || ""} onChange={(e) => handleFieldChange("accountType", e.target.value)} className="w-full p-2 border border-gray-300 rounded">
                <option>ECS</option>
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
              <input type="date" value={employee.annualRenewalDate || ""} onChange={(e) => handleFieldChange("annualRenewalDate", e.target.value)} className="w-full p-2 border border-gray-300 rounded" />

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
              <input type="text" value={employee.pfNo || ""} onChange={(e) => handleFieldChange("pfNo", e.target.value)} className="w-full p-2 border border-gray-300 rounded" />

              <label className="block text-sm font-bold mt-4">UAN</label>
              <input type="text" value={employee.uan || ""} onChange={(e) => handleFieldChange("uan", e.target.value)} className="w-full p-2 border border-gray-300 rounded" />

              <div className="mt-4">
                <label className="block text-sm text-gray-600">(If Salary &gt; PF-Cut Off then consider Actual Salary OR Specify the Salary)</label>
                <input
                  type="radio"
                  name="pf_salary"
                  value="ACTUAL"
                  checked={employee.pfSalary === "ACTUAL"}
                  onChange={() => handleFieldChange("pfSalary", "ACTUAL")}
                />
                Consider Actual Salary

                <input
                  type="radio"
                  name="pf_salary"
                  value="EMPLOYER"
                  checked={employee.pfSalary === "EMPLOYER"}
                  onChange={() => handleFieldChange("pfSalary", "EMPLOYER")}
                  className="ml-4"
                />
                Same For Employer


              </div>

              <label className="block text-sm font-bold mt-4">Salary For PF</label>
              <input type="text" value={employee.salaryForPf || ""} onChange={(e) => handleFieldChange("salaryForPf", e.target.value)} className="w-full p-2 border border-gray-300 rounded" />

              <label className="block text-sm font-bold mt-4">Specify Min. Amt of PF</label>
              <input type="text" value={employee.specifyMinAmtOfPf || ""} onChange={(e) => handleFieldChange("specifyMinAmtOfPf", e.target.value)} className="w-full p-2 border border-gray-300 rounded" />

              <div className="mt-4">
                <input type="checkbox" checked={employee.pensionAppl || false} onChange={(e) => handleFieldChange("pensionAppl", e.target.checked)} /> Pension Appl.
              </div>

              <label className="block text-sm font-bold mt-4">Joining Date</label>
              <input type="date" value={employee.joiningDate || ""} onChange={(e) => handleFieldChange("joiningDate", e.target.value)} className="w-full p-2 border border-gray-300 rounded" />

              <label className="block text-sm font-bold mt-4">Pension No Limit</label>
              <input type="checkbox" checked={employee.pensionNoLimit || false} onChange={(e) => handleFieldChange("pensionNoLimit", e.target.checked)} />

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
              <input type="text" value={employee.specifyMinAmtOfEsi || ""} onChange={(e) => handleFieldChange("specifyMinAmtOfEsi", e.target.value)} className="w-full p-2 border border-gray-300 rounded" />

              <div className="mt-4 flex items-center gap-4">
                <input type="radio" name="esi_mode" checked={employee.esiMode === "Dispensary"} onChange={() => handleFieldChange("esiMode", "Dispensary")} /> Dispensary
                <input type="radio" name="esi_mode" checked={employee.esiMode === "Panel System"} onChange={() => handleFieldChange("esiMode", "Panel System")} /> Panel System
                <input type="text" value={employee.esiDispensary || ""} onChange={(e) => handleFieldChange("esiDispensary", e.target.value)} className="w-full p-2 border border-gray-300 rounded" />
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
              <option>Active</option>
              <option>Probation</option>
              <option>Resigned</option>
              <option>Terminated</option>
              <option>Retired</option>
              <option>Deceased</option>
              <option>Other</option>
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

            <label className="block text-sm font-bold">Company Assets : -</label>
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr>
                  <th className="border border-gray-300 p-2">S.N.</th>
                  <th className="border border-gray-300 p-2">Particular</th>
                  <th className="border border-gray-300 p-2">Remark</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-300 p-2">1</td>
                  <td className="border border-gray-300 p-2"><input type="text" value={employee.companyAssets || ""} onChange={(e) => handleFieldChange("companyAssets", e.target.value)} className="w-full" /></td>
                  <td className="border border-gray-300 p-2"><input type="text" value={employee.companyAssetsRemark || ""} onChange={(e) => handleFieldChange("companyAssetsRemark", e.target.value)} className="w-full" /></td>
                </tr>
              </tbody>
            </table>
            <div className="flex gap-2 mt-2">
              <button className="px-4 py-2 bg-yellow-300 rounded">Add Row</button>
              <button className="px-4 py-2 bg-yellow-300 rounded">Delete Row</button>
            </div>

            <label className="block text-sm font-bold mt-4">Reason For Leaving</label>
            <select className="w-full p-2 border border-gray-300 rounded">
              <option>Resigned</option>
              <option>Terminated</option>
              <option>Retired</option>
              <option>Deceased</option>
              <option>Other</option>
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
                onClick={() =>
                  setEmployee((prev: any) => ({
                    ...prev,
                    nominees: [...(prev.family || [])],
                  }))
                }
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

            <div className="flex gap-2 mb-4">
              <input
                type="text"
                placeholder="Years"
                className="p-2 border border-gray-300 rounded w-32"
                value={totalExperience.years}
                onChange={(e) =>
                  setTotalExperience((p) => ({ ...p, years: e.target.value }))
                }
              />
              <input
                type="text"
                placeholder="Months"
                className="p-2 border border-gray-300 rounded w-32"
                value={totalExperience.months}
                onChange={(e) =>
                  setTotalExperience((p) => ({ ...p, months: e.target.value }))
                }
              />
            </div>

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
          <button type="submit" className="px-6 py-2 bg-blue-500 text-white rounded">
            Update
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