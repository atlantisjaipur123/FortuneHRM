"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import type { Employee } from "@/app/lib/employees";
import { getEmployeesByCompany, deleteEmployee } from "@/app/lib/employees";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function EmployeeDetail() {
  // TODO: Replace with actual selected company id from context or route
  const companyId = "1";
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [formData, setFormData] = useState<Employee>({} as Employee);

  useEffect(() => {
    const employeeData = getEmployeesByCompany(companyId);
    setEmployees(employeeData);
  }, [companyId]);

  useEffect(() => {
    if (employee && Object.keys(employee).length > 0) {
      setFormData(employee);
    }
  }, [employee]);


  const handleAddNew = () => {
    // Placeholder for future add flow
    // This can open a dialog once implemented
    // For now, no-op
  };

  const handleDelete = (id: string) => {
    const confirmed = window.confirm("Are you sure you want to delete this employee?");
    if (!confirmed) return;
    const success = deleteEmployee(id);
    if (success) {
      setEmployees((prev) => prev.filter((e) => e.id !== id));
    }
  };

  const columns = [
    { key: "sn", header: "S.N." },
    { key: "employeeCode", header: "Code" },
    { key: "name", header: "Name" },
    { key: "fatherName", header: "Father's Name" },
    { key: "pan", header: "PAN" },
    { key: "dateOfBirth", header: "DOB" },
    { key: "dateOfJoining", header: "DOJ" },
    { key: "actions", header: "Actions" },
  ] as const;

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Employee Details - Company ID: {companyId}</h2>
        <Button onClick={handleAddNew}>
          <Plus size={16} className="mr-2" /> Add New Employee
        </Button>
      </div>

      <Table>
        <TableCaption>Employees associated with the selected company</TableCaption>
        <TableHeader>
          <TableRow>
            {columns.map((c) => (
              <TableHead key={c.key}>{c.header}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {employees.map((emp, index) => (
            <TableRow key={emp.id}>
              <TableCell>{index + 1}</TableCell>
              <TableCell>{emp.employeeCode}</TableCell>
              <TableCell>{emp.firstName} {emp.lastName}</TableCell>
              <TableCell>{emp.fatherName}</TableCell>
              <TableCell>{emp.pan}</TableCell>
              <TableCell>{emp.dateOfBirth}</TableCell>
              <TableCell>{emp.dateOfJoining}</TableCell>
              <TableCell>
                <Button variant="destructive" size="sm" onClick={() => handleDelete(emp.id)}>
                  <Trash2 size={14} className="mr-1" /> Delete
                </Button>
              </TableCell>
            </TableRow>
          ))}
          {employees.length === 0 && (
            <TableRow>
              <TableCell colSpan={columns.length} className="text-center text-sm text-muted-foreground">
                No employees found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}