"use client";

import { useState } from "react";

type AddEmployeeProps = {
  employee?: any;
  onSubmit?: (updatedEmployee: any) => void;
  onCancel?: () => void;
};

const AddEmployee = ({ onSubmit, onCancel }: AddEmployeeProps) => {
  const [activeTab, setActiveTab] = useState("Personal");

  const tabs = [
    "Personal",
    "Financial",
    "Other",
    "Family",
    "Nominee(s)",
    "Witness",
    "Experience",
  ];

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