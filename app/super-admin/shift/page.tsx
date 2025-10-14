"use client";

import React, { useState } from "react";
import { GlobalLayout } from "@/app/components/global-layout";

interface Shift {
  id: number;
  shiftCode: string;
  shiftName: string;
  shiftStart: string;
  shiftEnd: string;
  isActive: boolean;
}

interface Employee {
  id: number;
  name: string;
  calcSalaryDate: string;
  fromDate: string;
  tsExistUpto: string;
  tsLockedUpto: string;
  manualEntryExist: boolean;
}

const ShiftPage = () => {
  const [shifts, setShifts] = useState<Shift[]>([
    { id: 1, shiftCode: "AFT", shiftName: "Afternoon", shiftStart: "12:30", shiftEnd: "20:30", isActive: true },
    { id: 2, shiftCode: "AWD", shiftName: "Afternoon", shiftStart: "09:30", shiftEnd: "17:00", isActive: true },
  ]);

  const [employees, setEmployees] = useState<Employee[]>([
    { id: 214, name: "AMIT KUMAR VERMA, SENIOR MANAGER", calcSalaryDate: "31/12/2013", fromDate: "31/12/2013", tsExistUpto: "31/12/2014", tsLockedUpto: "31/12/2014", manualEntryExist: true },
    { id: 357, name: "DEEPAK ALWADHI, MANAGER", calcSalaryDate: "31/12/2013", fromDate: "31/12/2013", tsExistUpto: "31/12/2014", tsLockedUpto: "31/12/2014", manualEntryExist: true },
  ]);

  const [showAddShift, setShowAddShift] = useState(false);
  const [newShift, setNewShift] = useState({
    shiftName: "",
    shiftCode: "",
    shiftStart: "00:00",
    shiftEnd: "00:00",
    shiftDuration: 0,
    workDuration: 0,
    breakApplicable: false,
    breakStart: "00:00",
    breakEnd: "00:00",
    breakDuration: 0,
    nightShift: false,
    partTimeShift: false,
  });

  const [sourceShift, setSourceShift] = useState("");
  const [destinationShift, setDestinationShift] = useState("");
  const [selectedEmployees, setSelectedEmployees] = useState<number[]>([]);

  const handleAddShift = () => {
    const shift = { ...newShift, id: shifts.length + 1, isActive: true };
    setShifts([...shifts, shift]);
    setShowAddShift(false);
    setNewShift({
      shiftName: "",
      shiftCode: "",
      shiftStart: "00:00",
      shiftEnd: "00:00",
      shiftDuration: 0,
      workDuration: 0,
      breakApplicable: false,
      breakStart: "00:00",
      breakEnd: "00:00",
      breakDuration: 0,
      nightShift: false,
      partTimeShift: false,
    });
  };

  const handleMoveEmployees = () => {
    // Logic to move selected employees to destination shift
    console.log("Moving employees", selectedEmployees, "to", destinationShift);
    setSelectedEmployees([]);
  };

  return (
    <GlobalLayout>
      <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Shift Management</h1>

      {/* Shift List */}
      <div className="mb-4">
        <button
          onClick={() => setShowAddShift(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Add New
        </button>
        <table className="w-full border-collapse border border-gray-300 mt-4">
          <thead>
            <tr className="bg-gray-200">
              <th className="border border-gray-300 p-2">Shift Code</th>
              <th className="border border-gray-300 p-2">Shift Name</th>
              <th className="border border-gray-300 p-2">Shift Start</th>
              <th className="border border-gray-300 p-2">Shift End</th>
              <th className="border border-gray-300 p-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {shifts.map((shift) => (
              <tr key={shift.id}>
                <td className="border border-gray-300 p-2">{shift.shiftCode}</td>
                <td className="border border-gray-300 p-2">{shift.shiftName}</td>
                <td className="border border-gray-300 p-2">{shift.shiftStart}</td>
                <td className="border border-gray-300 p-2">{shift.shiftEnd}</td>
                <td className="border border-gray-300 p-2">Edit | Delete</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Shift Form */}
      {showAddShift && (
        <div className="mb-4 p-4 border border-gray-300 rounded">
          <h2 className="text-xl font-semibold mb-2">Add New Shift</h2>
          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Shift Name"
              value={newShift.shiftName}
              onChange={(e) => setNewShift({ ...newShift, shiftName: e.target.value })}
              className="border p-2 rounded"
            />
            <input
              type="text"
              placeholder="Shift Code"
              value={newShift.shiftCode}
              onChange={(e) => setNewShift({ ...newShift, shiftCode: e.target.value })}
              className="border p-2 rounded"
            />
            <input
              type="time"
              value={newShift.shiftStart}
              onChange={(e) => setNewShift({ ...newShift, shiftStart: e.target.value })}
              className="border p-2 rounded"
            />
            <input
              type="time"
              value={newShift.shiftEnd}
              onChange={(e) => setNewShift({ ...newShift, shiftEnd: e.target.value })}
              className="border p-2 rounded"
            />
            <input
              type="number"
              placeholder="Shift Duration (min)"
              value={newShift.shiftDuration}
              onChange={(e) => setNewShift({ ...newShift, shiftDuration: parseInt(e.target.value) })}
              className="border p-2 rounded"
            />
            <input
              type="number"
              placeholder="Work Duration (min)"
              value={newShift.workDuration}
              onChange={(e) => setNewShift({ ...newShift, workDuration: parseInt(e.target.value) })}
              className="border p-2 rounded"
            />
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={newShift.breakApplicable}
                onChange={(e) => setNewShift({ ...newShift, breakApplicable: e.target.checked })}
              />
              Break Applicable
            </label>
            {newShift.breakApplicable && (
              <>
                <input
                  type="time"
                  value={newShift.breakStart}
                  onChange={(e) => setNewShift({ ...newShift, breakStart: e.target.value })}
                  className="border p-2 rounded"
                />
                <input
                  type="time"
                  value={newShift.breakEnd}
                  onChange={(e) => setNewShift({ ...newShift, breakEnd: e.target.value })}
                  className="border p-2 rounded"
                />
                <input
                  type="number"
                  placeholder="Break Duration (min)"
                  value={newShift.breakDuration}
                  onChange={(e) => setNewShift({ ...newShift, breakDuration: parseInt(e.target.value) })}
                  className="border p-2 rounded"
                />
              </>
            )}
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={newShift.nightShift}
                onChange={(e) => setNewShift({ ...newShift, nightShift: e.target.checked })}
              />
              Night Shift
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={newShift.partTimeShift}
                onChange={(e) => setNewShift({ ...newShift, partTimeShift: e.target.checked })}
              />
              Part-time Shift
            </label>
          </div>
          <div className="mt-4">
            <button
              onClick={handleAddShift}
              className="bg-green-500 text-white px-4 py-2 rounded mr-2"
            >
              Save
            </button>
            <button
              onClick={() => setShowAddShift(false)}
              className="bg-red-500 text-white px-4 py-2 rounded"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Shift Master */}
      <div className="mb-4 p-4 border border-gray-300 rounded">
        <h2 className="text-xl font-semibold mb-2">Shift Master</h2>
        <div className="grid grid-cols-2 gap-4">
          <select
            value={sourceShift}
            onChange={(e) => setSourceShift(e.target.value)}
            className="border p-2 rounded"
          >
            <option value="">Select Source Shift</option>
            {shifts.map((shift) => (
              <option key={shift.id} value={shift.shiftCode}>{shift.shiftName}</option>
            ))}
          </select>
          <select
            value={destinationShift}
            onChange={(e) => setDestinationShift(e.target.value)}
            className="border p-2 rounded"
          >
            <option value="">Select Destination Shift</option>
            {shifts.map((shift) => (
              <option key={shift.id} value={shift.shiftCode}>{shift.shiftName}</option>
            ))}
          </select>
        </div>
        <table className="w-full border-collapse border border-gray-300 mt-4">
          <thead>
            <tr className="bg-gray-200">
              <th className="border border-gray-300 p-2"><input type="checkbox" /></th>
              <th className="border border-gray-300 p-2">Employee</th>
              <th className="border border-gray-300 p-2">CalcSalaryDate</th>
              <th className="border border-gray-300 p-2">FromDate</th>
              <th className="border border-gray-300 p-2">TS Exist Upto</th>
              <th className="border border-gray-300 p-2">TS Locked Upto</th>
              <th className="border border-gray-300 p-2">Manual Entry Exist</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((employee) => (
              <tr key={employee.id}>
                <td className="border border-gray-300 p-2">
                  <input
                    type="checkbox"
                    checked={selectedEmployees.includes(employee.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedEmployees([...selectedEmployees, employee.id]);
                      } else {
                        setSelectedEmployees(selectedEmployees.filter((id) => id !== employee.id));
                      }
                    }}
                  />
                </td>
                <td className="border border-gray-300 p-2">{employee.name}</td>
                <td className="border border-gray-300 p-2">{employee.calcSalaryDate}</td>
                <td className="border border-gray-300 p-2">{employee.fromDate}</td>
                <td className="border border-gray-300 p-2">{employee.tsExistUpto}</td>
                <td className="border border-gray-300 p-2">{employee.tsLockedUpto}</td>
                <td className="border border-gray-300 p-2">{employee.manualEntryExist ? "Yes" : "No"}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <button
          onClick={handleMoveEmployees}
          className="bg-blue-500 text-white px-4 py-2 rounded mt-4"
          disabled={!selectedEmployees.length || !destinationShift}
        >
          Move Employees
        </button>
      </div>
      </div>
    </GlobalLayout>
  );
};

export default ShiftPage;