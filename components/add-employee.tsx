"use client";

import { useState } from "react";
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  const payload = {
    ...employee,
    salary_heads: selectedSalaryHeads,
    // Add other arrays later
  };

  try {
    const res = await fetch('http://localhost:5000/api/employees', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const result = await res.json();

    if (res.ok) {
      alert('Employee saved successfully!');
      console.log('Saved:', result.employee);
    } else {
      alert('Error: ' + result.error);
    }
  } catch (err) {
    alert('Network error');
  }
};

type AddEmployeeProps = {
  employee?: any;
  onSubmit?: (updatedEmployee: any) => void;
  onCancel?: () => void;
};

const AddEmployee = ({ onSubmit, onCancel }: AddEmployeeProps) => {
  const [activeTab, setActiveTab] = useState("Personal");

  const tabs = [
    "Personal",
    "Office details",
    "Qualification",
    "Salary",
    "Financial",
    "Other",
    "Family",
    "Nominee(s)",
    "Witness",
    "Experience",
  ];
  // DEMO SALARY HEADS (No DB, No API)
const salaryHeads = [
  "Basic Pay",
  "House Rent Allowance (HRA)",
  "Dearness Allowance (DA)",
  "Conveyance Allowance",
  "Medical Allowance",
  "Special Allowance",
  "Performance Bonus",
  "Fuel Allowance",
  "Mobile Reimbursement",
  "Laptop Allowance"
];
const [selectedSalaryHeads, setSelectedSalaryHeads] = useState<string[]>([
  "Basic Pay",
  "House Rent Allowance (HRA)",
  "Dearness Allowance (DA)"
]);
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


const handleFieldChange = (field: string, value: any) => {
  setEmployee((prev: any) => ({ ...prev, [field]: value }));
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

      <form className="bg-white p-6 rounded-md" onSubmit={(e) => { e.preventDefault(); onSubmit?.({}); }}>
        {activeTab === "Personal" && (
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold">Code *</label>
              <input type="text" className="w-full p-2 border border-gray-300 rounded" defaultValue="AJS43" />
              
              <label className="block text-sm font-bold mt-4">Name *</label>
              <input type="text" className="w-full p-2 border border-gray-300 rounded" />
              
              <label className="block text-sm font-bold mt-4">Permanent Address Details : -</label>
              <input type="text" placeholder="Flat" className="w-full p-2 border border-gray-300 rounded mt-1" />
              <input type="text" placeholder="Building" className="w-full p-2 border border-gray-300 rounded mt-1" />
              <input type="text" placeholder="Area" className="w-full p-2 border border-gray-300 rounded mt-1" />
              <input type="text" placeholder="Road" className="w-full p-2 border border-gray-300 rounded mt-1" />
              <input type="text" placeholder="City" className="w-full p-2 border border-gray-300 rounded mt-1" />
              <input type="text" placeholder="PIN" className="w-full p-2 border border-gray-300 rounded mt-1" />
              <input type="text" placeholder="District" className="w-full p-2 border border-gray-300 rounded mt-1" />
              <select className="w-full p-2 border border-gray-300 rounded mt-1">
                <option>State</option>
              </select>
              
              <label className="block text-sm font-bold mt-4">E-Mail</label>
              <input type="email" className="w-full p-2 border border-gray-300 rounded" />
              
              <label className="block text-sm font-bold mt-4">DOB *</label>
              <input type="date" className="w-full p-2 border border-gray-300 rounded" />
              
              <label className="block text-sm font-bold mt-4">PAN</label>
              <input type="text" className="w-full p-2 border border-gray-300 rounded" />
              
              <label className="block text-sm font-bold mt-4">NASSCOM Reg No.</label>
              <input type="text" className="w-full p-2 border border-gray-300 rounded" />
            </div>
            
            <div>
              <label className="block text-sm font-bold">[Additional Info]</label>
              <input type="text" className="w-full p-2 border border-gray-300 rounded" />
              
              <label className="block text-sm font-bold mt-4">[Identity Proof]</label>
              <input type="text" className="w-full p-2 border border-gray-300 rounded" />
              
              <label className="block text-sm font-bold mt-4">STD Code</label>
              <input type="text" className="w-full p-2 border border-gray-300 rounded" />
              
              <label className="block text-sm font-bold mt-4">Phone</label>
              <input type="text" className="w-full p-2 border border-gray-300 rounded" />
              
              <label className="block text-sm font-bold mt-4">Mobile</label>
              <input type="text" className="w-full p-2 border border-gray-300 rounded" />
              
              <label className="block text-sm font-bold mt-4">Internal ID</label>
              <input type="text" className="w-full p-2 border border-gray-300 rounded" />
              
              <label className="block text-sm font-bold mt-4">Notice Period *</label>
              <input type="text" className="w-full p-2 border border-gray-300 rounded" />
              
              <label className="block text-sm font-bold mt-4">Joining Date</label>
              <input type="date" className="w-full p-2 border border-gray-300 rounded" />
              
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
              
              <div className="mt-4">
                <button className="px-4 py-2 bg-yellow-300 rounded">Add</button>
                <button className="px-4 py-2 bg-yellow-300 rounded ml-2">Remove</button>
              </div>
              
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
                </select>
                
                <label className="block text-sm font-bold mt-4">Father's Name</label>
                <input type="text" className="w-full p-2 border border-gray-300 rounded" />
                
                <label className="block text-sm font-bold mt-4">Mother's Name</label>
                <input type="text" className="w-full p-2 border border-gray-300 rounded" />
                
                <label className="block text-sm font-bold mt-4">Blood Group</label>
                <select className="w-full p-2 border border-gray-300 rounded">
                  <option></option>
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
                </select>
                
                <label className="block text-sm font-bold mt-4">Nationality</label>
                <select className="w-full p-2 border border-gray-300 rounded">
                  <option>Resident</option>
                </select>
                
                <label className="block text-sm font-bold mt-4">Religion</label>
                <select className="w-full p-2 border border-gray-300 rounded">
                  <option>Hindu</option>
                </select>
                
                <label className="block text-sm font-bold mt-4">Spouse</label>
                <input type="text" className="w-full p-2 border border-gray-300 rounded" />
                
                <div className="mt-4">
                  <input type="checkbox" /> Reimbursement Applicable
                </div>
                
                <label className="block text-sm font-bold mt-4">Correspondence Address Details : -</label>
                <button className="px-4 py-2 bg-yellow-300 rounded">Copy</button>
                <button className="px-4 py-2 bg-yellow-300 rounded ml-2">Clear</button>
                
                <input type="text" placeholder="Address" className="w-full p-2 border border-gray-300 rounded mt-1" />
                <input type="text" placeholder="City" className="w-full p-2 border border-gray-300 rounded mt-1" />
                <input type="text" placeholder="District" className="w-full p-2 border border-gray-300 rounded mt-1" />
                <select className="w-full p-2 border border-gray-300 rounded mt-1">
                  <option>State</option>
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
          
              <table className="w-full border border-gray-300">
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
        
            {/* Select All */}
            <div className="flex justify-end">
              <label className="flex items-center text-sm font-medium text-blue-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedSalaryHeads.length === salaryHeads.length}
                  onChange={(e) => {
                    setSelectedSalaryHeads(e.target.checked ? salaryHeads : []);
                  }}
                  className="mr-2 h-4 w-4 accent-blue-600"
                />
                {selectedSalaryHeads.length === salaryHeads.length ? "Deselect All" : "Select All"}
              </label>
            </div>
        
            {/* Heads List */}
            <div className="space-y-3 max-h-80 overflow-y-auto border border-gray-200 p-4 rounded-lg bg-gray-50">
              {salaryHeads.map((head) => (
                <label
                  key={head}
                  className="flex items-center gap-3 p-3 bg-white rounded-md shadow-sm hover:shadow transition-shadow cursor-pointer border border-gray-200"
                >
                  <input
                    type="checkbox"
                    checked={selectedSalaryHeads.includes(head)}
                    onChange={() => {
                      setSelectedSalaryHeads(prev =>
                        prev.includes(head)
                          ? prev.filter(h => h !== head)
                          : [...prev, head]
                      );
                    }}
                    className="mr-3 h-5 w-5 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-gray-700 font-medium">{head}</span>
                </label>
              ))}
            </div>
        
            {/* Count */}
            <div className="text-right">
              <p className="text-sm text-gray-600">
                <strong>{selectedSalaryHeads.length}</strong> of <strong>{salaryHeads.length}</strong> components selected
              </p>
            </div>
          </div>
        )}
  

        {activeTab === "Financial" && (
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold">Bank Name</label>
              <select className="w-full p-2 border border-gray-300 rounded">
                <option></option>
              </select>
              
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
              <select className="w-full p-2 border border-gray-300 rounded">
                <option></option>
              </select>
              
              <label className="block text-sm font-bold mt-4">Physically Handicap</label>
              <select className="w-full p-2 border border-gray-300 rounded">
                <option>NO</option>
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
              <option></option>
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
              <option></option>
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
          <button type="button" className="px-6 py-2 bg-yellow-300 text-black rounded">
            Import Resigned Employee Detail
          </button>
          <div className="flex gap-2">
            <button type="submit" className="px-6 py-2 bg-blue-500 text-white rounded">
              Update
            </button>
            <button type="button" className="px-6 py-2 bg-gray-500 text-white rounded" onClick={() => onCancel?.()}>
              Cancel
            </button>
            <button type="button" className="px-6 py-2 bg-yellow-300 text-black rounded">
              Exit
            </button>
          </div>
          <span className="text-red-500 text-sm">* Mandatory Fields for TDS</span>
        </div>
      </form>
    </div>
  );
};

export default AddEmployee