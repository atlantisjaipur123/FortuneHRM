"use client";

import { useState, useEffect } from "react";
import { calculateSalary } from "@/app/lib/calculateSalary";
import {useCompanySetups} from "@/hooks/useCompanySetups";  
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

const [employee, setEmployee] = useState<any>({});

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
    // Reset form for new employee
    setEmployee({});
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
            className={`px-6 py-3 text-sm font-medium ${
              activeTab === tab
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
                  setEmployee((prev:any) => ({
                    ...prev,
                    permanentAddress: {
                      ...prev.permanentAddress,
                      flat: e.target.value
                    }
                  }))
                }
              />

              <input type="text" placeholder="Building" className="w-full p-2 border border-gray-300 rounded mt-1" />
              <input type="text" placeholder="Area" className="w-full p-2 border border-gray-300 rounded mt-1" />
              <input type="text" placeholder="Road" className="w-full p-2 border border-gray-300 rounded mt-1" />
              <input type="text" placeholder="City" className="w-full p-2 border border-gray-300 rounded mt-1" />
              <input type="text" placeholder="PIN" className="w-full p-2 border border-gray-300 rounded mt-1" />
              <input type="text" placeholder="District" className="w-full p-2 border border-gray-300 rounded mt-1" />
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
              <input type="text" className="w-full p-2 border border-gray-300 rounded" />
                           
              <label className="block text-sm font-bold mt-4">Mobile No.</label>
              <input type="text" className="w-full p-2 border border-gray-300 rounded" />
              
              <label className="block text-sm font-bold mt-4">Internal ID</label>
              <input type="text" className="w-full p-2 border border-gray-300 rounded" />
              
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
              <input type="text" className="w-full p-2 border border-gray-300 rounded" placeholder="Months" />
              
              <label className="block text-sm font-bold mt-4">Confirmation Date</label>
              <input type="date" className="w-full p-2 border border-gray-300 rounded" />
              
              <label className="block text-sm font-bold mt-4">Resig. Letter Date</label>
              <input type="date" className="w-full p-2 border border-gray-300 rounded" />
              
              <label className="block text-sm font-bold mt-4">Resig. Date L.W.D.</label>
              <input type="date" className="w-full p-2 border border-gray-300 rounded" />
              
              <label className="block text-sm font-bold mt-4">Appraisal Date</label>
              <input type="date" className="w-full p-2 border border-gray-300 rounded" />
              
              <label className="block text-sm font-bold mt-4">Commitment Completion Date</label>
              <input type="date" className="w-full p-2 border border-gray-300 rounded" />
              
              <label className="block text-sm font-bold mt-4">Date of Death</label>
              <input type="date" className="w-full p-2 border border-gray-300 rounded" />
              
              <label className="block text-sm font-bold mt-4">SELECT REASON</label>
              <select className="w-full p-2 border border-gray-300 rounded">
                <option>SELECT REASON</option>
              </select>
            </div>
            
            <div className="col-span-2 grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold">Gender</label>
                <div className="flex">
                  <input type="radio" name="gender" /> Male
                  <input type="radio" name="gender" className="ml-4" /> Female
                </div>
                
                <label className="block text-sm font-bold mt-4">Marital Status</label>
                <select className="w-full p-2 border border-gray-300 rounded">
                  <option>UnMarried</option>
                  <option>Married</option>
                  <option>Widowed</option>
                  <option>Divorced</option>
                </select>
                
                <label className="block text-sm font-bold mt-4">Father's Name</label>
                <input type="text" className="w-full p-2 border border-gray-300 rounded" />
                
                <label className="block text-sm font-bold mt-4">Mother's Name</label>
                <input type="text" className="w-full p-2 border border-gray-300 rounded" />
                
                <label className="block text-sm font-bold mt-4">Blood Group</label>
                <select className="w-full p-2 border border-gray-300 rounded">
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
                <input type="date" className="w-full p-2 border border-gray-300 rounded" />
                
                <label className="block text-sm font-bold mt-4">No. Dependent</label>
                <input type="text" className="w-full p-2 border border-gray-300 rounded" />
              </div>
              
              <div>
                <label className="block text-sm font-bold">Caste</label>
                <select className="w-full p-2 border border-gray-300 rounded">
                  <option>GEN</option>
                  <option>OBC</option>
                  <option>SC</option>
                  <option>ST</option>
                </select>
                
                <label className="block text-sm font-bold mt-4">Nationality</label>
                <select className="w-full p-2 border border-gray-300 rounded">
                  <option>Indian</option>
                  <option>NRI</option>
                </select>
                
                <label className="block text-sm font-bold mt-4">Religion</label>
                <select className="w-full p-2 border border-gray-300 rounded">
                  <option>Hindu</option>
                  <option>Muslim</option>
                  <option>Christian</option>
                  <option>Sikh</option>
                  <option>Buddhist</option>
                  <option>Jain</option>
                  <option>Others</option>
                </select>
                
                <label className="block text-sm font-bold mt-4">Spouse</label>
                <input type="text" className="w-full p-2 border border-gray-300 rounded" />
                
                <div className="mt-4">
                  <input type="checkbox" /> Reimbursement Applicable
                </div>
                
                <label className="block text-sm font-bold mt-4">Correspondence Address Details : -</label>
                
                <input type="text" placeholder="Address" className="w-full p-2 border border-gray-300 rounded mt-1" />
                <input type="text" placeholder="City" className="w-full p-2 border border-gray-300 rounded mt-1" />
                <input type="text" placeholder="District" className="w-full p-2 border border-gray-300 rounded mt-1" />
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
                <input type="text" placeholder="PIN" className="w-full p-2 border border-gray-300 rounded mt-1" />
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
          
              <table className="w-full border border-gray-300 ">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 p-2 text-sm">S.N.</th>
                    <th className="border border-gray-300 p-2 text-sm">College / University</th>
                    <th className="border border-gray-300 p-2 text-sm">Degree Completion Year<br/>(From – To)</th>
                    <th className="border border-gray-300 p-2 text-sm">CGPA / %</th>
                    <th className="border border-gray-300 p-2 text-sm">Reg No.<br/>(if any)</th>
                    <th className="border border-gray-300 p-2 text-sm">Degree Validity Year<br/>(if any)</th>
                    <th className="border border-gray-300 p-2 text-sm">Upload Certification<br/>(PDF)</th>
                    <th className="border border-gray-300 p-2 text-sm">Action</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-300 p-2 text-center">1</td>
                    <td className="border border-gray-300 p-1">
                      <input type="text" className="w-full p-1 border rounded" placeholder="e.g. Delhi University" />
                    </td>
                    <td className="border border-gray-300 p-1">
                      <div className="flex gap-1">
                        <input type="date" className="w-full p-1 border rounded" />
                        <span className="self-center">–</span>
                        <input type="date" className="w-full p-1 border rounded" />
                      </div>
                    </td>
                    <td className="border border-gray-300 p-1">
                      <input type="text" className="w-full p-1 border rounded" placeholder="e.g. 8.5 or 85%" />
                    </td>
                    <td className="border border-gray-300 p-1">
                      <input type="text" className="w-full p-1 border rounded" placeholder="Optional" />
                    </td>
                    <td className="border border-gray-300 p-1">
                      <input type="text" className="w-full p-1 border rounded" placeholder="e.g. 2025" />
                    </td>
                    <td className="border border-gray-300 p-1">
                      <input type="file" accept=".pdf" className="text-xs" />
                    </td>
                    <td className="border border-gray-300 p-1 text-center">
                      <button className="text-red-600 text-sm hover:underline">Delete</button>
                    </td>
                  </tr>
                </tbody>
              </table>
          
              <div className="mt-3">
                <button className="px-4 py-2 bg-yellow-300 text-black rounded text-sm">
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
              <input type="text" className="w-full p-2 border border-gray-300 rounded">
              </input>
              
              <label className="block text-sm font-bold mt-4">Bank Branch</label>
              <input type="text" className="w-full p-2 border border-gray-300 rounded" />
              
              <label className="block text-sm font-bold mt-4">Bank IFSC</label>
              <input type="text" className="w-full p-2 border border-gray-300 rounded" />
              
              <label className="block text-sm font-bold mt-4">Address</label>
              <input type="text" className="w-full p-2 border border-gray-300 rounded" />
              
              <label className="block text-sm font-bold mt-4">Name as per A/c</label>
              <input type="text" className="w-full p-2 border border-gray-300 rounded" />
              
              <label className="block text-sm font-bold mt-4">Salary A/c Number</label>
              <input type="text" className="w-full p-2 border border-gray-300 rounded" />
              
              <label className="block text-sm font-bold mt-4">Payment Mode</label>
              <select className="w-full p-2 border border-gray-300 rounded">
                <option>TRANSFER</option>
              </select>
              
              <label className="block text-sm font-bold mt-4">A/c Type</label>
              <select className="w-full p-2 border border-gray-300 rounded">
                <option>ECS</option>
              </select>
              
              <label className="block text-sm font-bold mt-4">Bank Ref. No.</label>
              <input type="text" className="w-full p-2 border border-gray-300 rounded" />
              
              <label className="block text-sm font-bold mt-4">Ward/Circle/Range</label>
              <input type="text" className="w-full p-2 border border-gray-300 rounded" />
              
              <label className="block text-sm font-bold mt-4">LIC Policy No.</label>
              <input type="text" className="w-full p-2 border border-gray-300 rounded" />
              
              <label className="block text-sm font-bold mt-4">Policy Term</label>
              <input type="text" className="w-full p-2 border border-gray-300 rounded" />
              
              <label className="block text-sm font-bold mt-4">LIC ID</label>
              <input type="text" className="w-full p-2 border border-gray-300 rounded" />
              
              <label className="block text-sm font-bold mt-4">Annual Renewal Date</label>
              <input type="date" className="w-full p-2 border border-gray-300 rounded" />
              
              <div className="mt-4 flex flex-wrap gap-4">
                <input type="checkbox" /> HRA Applicable
                <input type="checkbox" /> Bonus Applicable
                <input type="checkbox" /> Gratuity Applicable
                <input type="checkbox" /> LWF Applicable
              </div>
            </div>
            
            <div>
              <div className="flex items-center">
                <input type="checkbox" /> PF Applicable
              </div>
              
              <label className="block text-sm font-bold mt-4">Educational Qual.</label>
              <input type="text" className="w-full p-2 border border-gray-300 rounded" />

              
              
              <label className="block text-sm font-bold mt-4">Physically Handicap</label>
              <select className="w-full p-2 border border-gray-300 rounded">
                <option>NO</option>
                <option>YES</option>
              </select>
              
              <label className="block text-sm font-bold mt-4">Registered in PMRPY</label>
              <input type="checkbox" />
              
              <label className="block text-sm font-bold mt-4">PF Joining Date</label>
              <input type="date" className="w-full p-2 border border-gray-300 rounded" />
              
              <label className="block text-sm font-bold mt-4">PF Last Date</label>
              <input type="date" className="w-full p-2 border border-gray-300 rounded" />
              
              <label className="block text-sm font-bold mt-4">PF No.</label>
              <input type="text" className="w-full p-2 border border-gray-300 rounded" />
              
              <label className="block text-sm font-bold mt-4">UAN</label>
              <input type="text" className="w-full p-2 border border-gray-300 rounded" />
              
              <div className="mt-4">
                <label className="block text-sm text-gray-600">(If Salary &gt; PF-Cut Off then consider Actual Salary OR Specify the Salary)</label>
                <input type="radio" name="pf_salary" /> Consider Actual Salary
                <input type="radio" name="pf_salary" className="ml-4" /> Same For Employer
              </div>
              
              <label className="block text-sm font-bold mt-4">Salary For PF</label>
              <input type="text" className="w-full p-2 border border-gray-300 rounded" />
              
              <label className="block text-sm font-bold mt-4">Specify Min. Amt of PF</label>
              <input type="text" className="w-full p-2 border border-gray-300 rounded" />
              
              <div className="mt-4">
                <input type="checkbox" /> Pension Appl.
              </div>
              
              <label className="block text-sm font-bold mt-4">Joining Date</label>
              <input type="date" className="w-full p-2 border border-gray-300 rounded" />
              
              <label className="block text-sm font-bold mt-4">Pension No Limit</label>
              <input type="checkbox" />
              
              <div className="mt-4">
                <input type="radio" name="pension" /> Pension on Higher Wages
              </div>
              
              <div className="mt-4">
                <input type="checkbox" /> ESI Applicable
              </div>
              
              <label className="block text-sm font-bold mt-4">ESI Joining Date</label>
              <input type="date" className="w-full p-2 border border-gray-300 rounded" />
              
              <label className="block text-sm font-bold mt-4">ESI Last Date</label>
              <input type="date" className="w-full p-2 border border-gray-300 rounded" />
              
              <label className="block text-sm font-bold mt-4">ESI No.</label>
              <input type="text" className="w-full p-2 border border-gray-300 rounded" />
              
              <label className="block text-sm text-gray-600 mt-4">(If Salary &gt; ESI-Cut Off then consider Actual Salary or Specify the Salary)</label>
              <input type="radio" name="esi_salary" /> Consider Actual Salary
              <input type="radio" name="esi_salary" className="ml-4" /> Salary For ESI
              
              <label className="block text-sm font-bold mt-4">Specify Min. Amount of ESI Contribution</label>
              <input type="text" className="w-full p-2 border border-gray-300 rounded" />
              
              <div className="mt-4 flex items-center gap-4">
                <input type="radio" /> Dispensary
                <input type="radio" /> Panel System
                <input type="text" className="w-full p-2 border border-gray-300 rounded" />
              </div>
            </div>
          </div>
        )}

        {activeTab === "Other" && (
          <div className="space-y-6">
            <label className="block text-sm font-bold">Recruitment Agency</label>
            <input type="text" className="w-full p-2 border border-gray-300 rounded" />
            
            <label className="block text-sm font-bold">Bank Mandate</label>
            <input type="text" className="w-full p-2 border border-gray-300 rounded" />
            
            <label className="block text-sm font-bold">Employment Status</label>
            <select className="w-full p-2 border border-gray-300 rounded">
              <option>Active</option>
              <option>Probation</option>
              <option>Resigned</option>
              <option>Terminated</option>
              <option>Retired</option>
              <option>Deceased</option>
              <option>Other</option>
            </select>
            
            <label className="block text-sm font-bold">Lap Tops</label>
            <input type="text" className="w-full p-2 border border-gray-300 rounded" />
            
            <label className="block text-sm font-bold">Company Vehicle</label>
            <input type="text" className="w-full p-2 border border-gray-300 rounded" />
            
            <label className="block text-sm font-bold">Corp. Credit Card No.</label>
            <input type="text" className="w-full p-2 border border-gray-300 rounded" />
            
            <label className="block text-sm font-bold">Transport Route</label>
            <input type="text" className="w-full p-2 border border-gray-300 rounded" />
            
            <label className="block text-sm font-bold">Work Location</label>
            <input type="text" className="w-full p-2 border border-gray-300 rounded" />
            
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
                  <td className="border border-gray-300 p-2"><input type="text" className="w-full" /></td>
                  <td className="border border-gray-300 p-2"><input type="text" className="w-full" /></td>
                </tr>
              </tbody>
            </table>
            <div className="flex gap-2 mt-2">
              <button className="px-4 py-2 bg-yellow-300 rounded">Add Row</button>
              <button className="px-4 py-2 bg-yellow-300 rounded">Delete Row</button>
            </div>
            
            <label className="block text-sm font-bold mt-4">Educational Qualification : -</label>
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr>
                  <th className="border border-gray-300 p-2">S.N.</th>
                  <th className="border border-gray-300 p-2">Qualification</th>
                  <th className="border border-gray-300 p-2">University/College</th>
                  <th className="border border-gray-300 p-2">Subject</th>
                  <th className="border border-gray-300 p-2">Year</th>
                  <th className="border border-gray-300 p-2">%</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-300 p-2">1</td>
                  <td className="border border-gray-300 p-2"><input type="text" className="w-full" /></td>
                  <td className="border border-gray-300 p-2"><input type="text" className="w-full" /></td>
                  <td className="border border-gray-300 p-2"><input type="text" className="w-full" /></td>
                  <td className="border border-gray-300 p-2"><input type="text" className="w-full" /></td>
                  <td className="border border-gray-300 p-2"><input type="text" className="w-full" /></td>
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
            <input type="text" className="w-full p-2 border border-gray-300 rounded" />
            
            <label className="block text-sm font-bold mt-4">Remarks : -</label>
            <input type="text" className="w-full p-2 border border-gray-300 rounded" />
          </div>
        )}

        {activeTab === "Family" && (
          <div>
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr>
                  <th className="border border-gray-300 p-2">S.N.</th>
                  <th className="border border-gray-300 p-2">Name</th>
                  <th className="border border-gray-300 p-2">Address</th>
                  <th className="border border-gray-300 p-2">Relationship with Employee</th>
                  <th className="border border-gray-300 p-2">DOB/Age</th>
                  <th className="border border-gray-300 p-2">Whether Residing with him or not</th>
                  <th className="border border-gray-300 p-2">District</th>
                  <th className="border border-gray-300 p-2">State</th>
                  <th className="border border-gray-300 p-2">Remark</th>
                  <th className="border border-gray-300 p-2">Family Member's Aadhar</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-300 p-2">1</td>
                  <td className="border border-gray-300 p-2"><input type="text" className="w-full" /></td>
                  <td className="border border-gray-300 p-2"><input type="text" className="w-full" /></td>
                  <td className="border border-gray-300 p-2"><input type="text" className="w-full" /></td>
                  <td className="border border-gray-300 p-2"><input type="text" className="w-full" /></td>
                  <td className="border border-gray-300 p-2"><input type="checkbox" /></td>
                  <td className="border border-gray-300 p-2"><input type="text" className="w-full" /></td>
                  <td className="border border-gray-300 p-2"><input type="text" className="w-full" /></td>
                  <td className="border border-gray-300 p-2"><input type="text" className="w-full" /></td>
                  <td className="border border-gray-300 p-2"><input type="text" className="w-full" /></td>
                </tr>
              </tbody>
            </table>
            <div className="flex gap-2 mt-2">
              <button className="px-4 py-2 bg-yellow-300 rounded">Add Row</button>
              <button className="px-4 py-2 bg-yellow-300 rounded">Delete Row</button>
            </div>
          </div>
        )}

        {activeTab === "Nominee(s)" && (
          <div>
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr>
                  <th className="border border-gray-300 p-2">S.N.</th>
                  <th className="border border-gray-300 p-2">Name</th>
                  <th className="border border-gray-300 p-2">Address</th>
                  <th className="border border-gray-300 p-2">District</th>
                  <th className="border border-gray-300 p-2">State</th>
                  <th className="border border-gray-300 p-2">PIN</th>
                  <th className="border border-gray-300 p-2">Relationship with Employee</th>
                  <th className="border border-gray-300 p-2">DOB/Age</th>
                  <th className="border border-gray-300 p-2">Proportion by which the gratuity will be shared</th>
                  <th className="border border-gray-300 p-2">Marital Status</th>
                  <th className="border border-gray-300 p-2">Remark</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-300 p-2">1</td>
                  <td className="border border-gray-300 p-2"><input type="text" className="w-full" /></td>
                  <td className="border border-gray-300 p-2"><input type="text" className="w-full" /></td>
                  <td className="border border-gray-300 p-2"><input type="text" className="w-full" /></td>
                  <td className="border border-gray-300 p-2"><input type="text" className="w-full" /></td>
                  <td className="border border-gray-300 p-2"><input type="text" className="w-full" /></td>
                  <td className="border border-gray-300 p-2"><input type="text" className="w-full" /></td>
                  <td className="border border-gray-300 p-2"><input type="text" className="w-full" /></td>
                  <td className="border border-gray-300 p-2"><input type="text" className="w-full" /></td>
                  <td className="border border-gray-300 p-2">
                    <select className="w-full">
                      <option>UnMarried</option>
                      <option>Married</option>
                      <option>Widowed</option>
                      <option>Divorced</option>
                    </select>
                  </td>
                  <td className="border border-gray-300 p-2"><input type="text" className="w-full" /></td>
                </tr>
              </tbody>
            </table>
            <div className="flex gap-2 mt-2">
              <button className="px-4 py-2 bg-yellow-300 rounded">Add Row</button>
              <button className="px-4 py-2 bg-yellow-300 rounded">Delete Row</button>
              <button className="px-4 py-2 bg-yellow-300 rounded ml-auto">Import From Family Details</button>
            </div>
          </div>
        )}

        {activeTab === "Witness" && (
          <div>
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr>
                  <th className="border border-gray-300 p-2">S.N.</th>
                  <th className="border border-gray-300 p-2">Name</th>
                  <th className="border border-gray-300 p-2">Address</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-300 p-2">1</td>
                  <td className="border border-gray-300 p-2"><input type="text" className="w-full" /></td>
                  <td className="border border-gray-300 p-2"><input type="text" className="w-full" /></td>
                </tr>
              </tbody>
            </table>
            <div className="flex gap-2 mt-2">
              <button className="px-4 py-2 bg-yellow-300 rounded">Add Row</button>
              <button className="px-4 py-2 bg-yellow-300 rounded">Delete Row</button>
            </div>
          </div>
        )}

        {activeTab === "Experience" && (
          <div>
            <label className="block text-sm font-bold">Previous Work Experience : -</label>
            <input type="text" placeholder="Years" className="p-2 border border-gray-300 rounded mr-2" />
            <input type="text" placeholder="Months" className="p-2 border border-gray-300 rounded" />
            
            <table className="w-full border-collapse border border-gray-300 mt-4">
              <thead>
                <tr>
                  <th className="border border-gray-300 p-2">S.N.</th>
                  <th className="border border-gray-300 p-2">Company Name</th>
                  <th className="border border-gray-300 p-2">Location</th>
                  <th className="border border-gray-300 p-2">Designation</th>
                  <th className="border border-gray-300 p-2">From</th>
                  <th className="border border-gray-300 p-2">To</th>
                  <th className="border border-gray-300 p-2">Remark</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-300 p-2">1</td>
                  <td className="border border-gray-300 p-2"><input type="text" className="w-full" /></td>
                  <td className="border border-gray-300 p-2"><input type="text" className="w-full" /></td>
                  <td className="border border-gray-300 p-2"><input type="text" className="w-full" /></td>
                  <td className="border border-gray-300 p-2"><input type="date" className="w-full" /></td>
                  <td className="border border-gray-300 p-2"><input type="date" className="w-full" /></td>
                  <td className="border border-gray-300 p-2"><input type="text" className="w-full" /></td>
                </tr>
              </tbody>
            </table>
            <div className="flex gap-2 mt-2">
              <button className="px-4 py-2 bg-yellow-300 rounded">Add Row</button>
              <button className="px-4 py-2 bg-yellow-300 rounded">Delete Row</button>
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