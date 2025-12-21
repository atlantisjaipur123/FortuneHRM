"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { GlobalLayout } from "@/app/components/global-layout";

interface ColumnConfig {
  key: string;
  label: string;
  type: "percentage" | "value";
  defaultValue: number | string;
  required?: boolean; // Added to mark required fields
}

interface ESIRate {
  id: number;
  [key: string]: number | string;
  empShare: number;
  employerShare: number;
  wageCeiling: number;
  effectiveDate: string;
  endDate: string;
  remarks: string;
}

interface PFRate {
  id: number;
  [key: string]: number | string;
  empShareAc1: number;
  erShareAc2: number;
  adminChargesAc10: number;
  epsAc21: number;
  edliChargesAc21: number;
  adminChargesAc22: number;
  calcType: "Fixed" | "On Actual";
  wageCeiling: number;
  epsWageCeiling: number;
  minEpsContribution: number;
  effectiveDate: string;
  endDate: string;
  remarks: string;
}

const initialESIColumns: ColumnConfig[] = [
  { key: "empShare", label: "Emp. Share", type: "percentage", defaultValue: 0.75, required: true },
  { key: "employerShare", label: "Employer Share", type: "percentage", defaultValue: 3.25, required: true },
  { key: "wageCeiling", label: "Wage Ceiling", type: "value", defaultValue: 21000, required: true },
];

const initialPFColumns: ColumnConfig[] = [
  { key: "empShareAc1", label: "Emp. Share A/c1", type: "percentage", defaultValue: 12, required: true },
  { key: "erShareAc2", label: "ER Share A/c2", type: "percentage", defaultValue: 3.67, required: true },
  { key: "adminChargesAc10", label: "Admin Charges A/c10", type: "percentage", defaultValue: 0.50, required: true },
  { key: "epsAc21", label: "EPS A/c21", type: "percentage", defaultValue: 8.33, required: true },
  { key: "edliChargesAc21", label: "EDLI Charges A/c21", type: "percentage", defaultValue: 0.50, required: true },
  { key: "adminChargesAc22", label: "Admin Charges A/c22", type: "percentage", defaultValue: 0.00, required: true },
  { key: "calcType", label: "Calc Type", type: "value", defaultValue: "Fixed", required: true },
  { key: "wageCeiling", label: "Wage Ceiling", type: "value", defaultValue: 15000, required: true },
  { key: "epsWageCeiling", label: "EPS Wage Ceiling", type: "value", defaultValue: 15000, required: true },
  { key: "minEpsContribution", label: "Min EPS Contrib", type: "value", defaultValue: 75, required: true },
];

const initialESIRates: ESIRate[] = [
  {
    id: 1,
    empShare: 0.75,
    employerShare: 3.25,
    wageCeiling: 21000,
    effectiveDate: "2025-09-01",
    endDate: "",
    remarks: "",
  },
];

const initialPFRates: PFRate[] = [
  {
    id: 1,
    empShareAc1: 12,
    erShareAc2: 3.67,
    adminChargesAc10: 0.50,
    epsAc21: 8.33,
    edliChargesAc21: 0.50,
    adminChargesAc22: 0.00,
    calcType: "Fixed",
    wageCeiling: 15000,
    epsWageCeiling: 15000,
    minEpsContribution: 75,
    effectiveDate: "2025-09-01",
    endDate: "",
    remarks: "",
  },
];

export default function PFESIRatesSetupPage() {
  const [esiRates, setESIRates] = useState<ESIRate[]>(initialESIRates);
  const [esiForm, setESIForm] = useState<Partial<ESIRate>>({});
  const [selectedESIRate, setSelectedESIRate] = useState<ESIRate | null>(null);
  const [isEditingESI, setIsEditingESI] = useState(false);
  const [esiColumns, setESIColumns] = useState<ColumnConfig[]>(initialESIColumns);
  const [isAddESIColumnModalOpen, setIsAddESIColumnModalOpen] = useState(false);
  const [newESIColumn, setNewESIColumn] = useState<{ label: string; type: "percentage" | "value" }>({ label: "", type: "percentage" });

  const [pfRates, setPFRates] = useState<PFRate[]>(initialPFRates);
  const [pfForm, setPFForm] = useState<Partial<PFRate>>({});
  const [selectedPFRate, setSelectedPFRate] = useState<PFRate | null>(null);
  const [isEditingPF, setIsEditingPF] = useState(false);
  const [pfColumns, setPFColumns] = useState<ColumnConfig[]>(initialPFColumns);
  const [isAddPFColumnModalOpen, setIsAddPFColumnModalOpen] = useState(false);
  const [newPFColumn, setNewPFColumn] = useState<{ label: string; type: "percentage" | "value" }>({ label: "", type: "percentage" });

  // Format date to YYYY-MM-DD
  const formatDate = (date: Date | null) => {
    if (!date) return "";
    return date.toISOString().split("T")[0];
  };

  // Handle ESI column addition
  const handleAddESIColumn = () => {
    if (!newESIColumn.label) {
      alert("Please enter a column label");
      return;
    }
    const newKey = `customField${Date.now()}`;
    setESIColumns([...esiColumns, { key: newKey, label: newESIColumn.label, type: newESIColumn.type, defaultValue: 0 }]);
    setNewESIColumn({ label: "", type: "percentage" });
    setIsAddESIColumnModalOpen(false);
  };

  const handleESIColumnChange = (field: string, value: string) => {
    setNewESIColumn({ ...newESIColumn, [field]: value });
  };

  // Handle PF column addition
  const handleAddPFColumn = () => {
    if (!newPFColumn.label) {
      alert("Please enter a column label");
      return;
    }
    const newKey = `customField${Date.now()}`;
    setPFColumns([...pfColumns, { key: newKey, label: newPFColumn.label, type: newPFColumn.type, defaultValue: 0 }]);
    setNewPFColumn({ label: "", type: "percentage" });
    setIsAddPFColumnModalOpen(false);
  };

  const handlePFColumnChange = (field: string, value: string) => {
    setNewPFColumn({ ...newPFColumn, [field]: value });
  };

  const handleESISubmit = () => {
    // Validate required fields
    const requiredFields = esiColumns.filter(col => col.required).map(col => col.key).concat(["effectiveDate"]);
    const missingFields = requiredFields.filter(field => !esiForm[field] || esiForm[field] === "");
    if (missingFields.length > 0) {
      alert(`Please fill in all required fields for ESI: ${missingFields.join(", ")}`);
      return;
    }

    if (isEditingESI && esiForm.id) {
      setESIRates(
        esiRates.map((rate) =>
          rate.id === esiForm.id ? { ...rate, ...esiForm } : rate
        )
      );
    } else {
      const newId = Math.max(...esiRates.map((r) => r.id), 0) + 1;
      const newRate = { id: newId, ...esiForm } as ESIRate;
      setESIRates([newRate, ...esiRates]);
    }
    setESIForm({});
    setIsEditingESI(false);
    setSelectedESIRate(null);
  };

  const handleESIEdit = (rate: ESIRate) => {
    setESIForm({ ...rate, effectiveDate: rate.effectiveDate || "", endDate: rate.endDate || "" });
    setIsEditingESI(true);
    setSelectedESIRate(rate);
  };

  const handleESIDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this ESI rate?")) {
      setESIRates(esiRates.filter((rate) => rate.id !== id));
      if (selectedESIRate?.id === id) {
        setSelectedESIRate(null);
        setESIForm({});
        setIsEditingESI(false);
      }
    }
  };

  const handleESICancel = () => {
    setESIForm({});
    setIsEditingESI(false);
    setSelectedESIRate(null);
  };

  const handleESIChange = (field: string, value: string | Date) => {
    setESIForm({ ...esiForm, [field]: typeof value === "string" ? value : formatDate(value) });
  };

  const handlePFSubmit = () => {
    // Validate required fields
    const requiredFields = pfColumns.filter(col => col.required).map(col => col.key).concat(["effectiveDate"]);
    const missingFields = requiredFields.filter(field => !pfForm[field] || pfForm[field] === "");
    if (missingFields.length > 0) {
      alert(`Please fill in all required fields for PF: ${missingFields.join(", ")}`);
      return;
    }

    if (isEditingPF && pfForm.id) {
      setPFRates(
        pfRates.map((rate) =>
          rate.id === pfForm.id ? { ...rate, ...pfForm } : rate
        )
      );
    } else {
      const newId = Math.max(...pfRates.map((r) => r.id), 0) + 1;
      const newRate = { id: newId, ...pfForm } as PFRate;
      setPFRates([newRate, ...pfRates]);
    }
    setPFForm({});
    setIsEditingPF(false);
    setSelectedPFRate(null);
  };

  const handlePFEdit = (rate: PFRate) => {
    setPFForm({ ...rate, effectiveDate: rate.effectiveDate || "", endDate: rate.endDate || "" });
    setIsEditingPF(true);
    setSelectedPFRate(rate);
  };

  const handlePFDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this PF rate?")) {
      setPFRates(pfRates.filter((rate) => rate.id !== id));
      if (selectedPFRate?.id === id) {
        setSelectedPFRate(null);
        setPFForm({});
        setIsEditingPF(false);
      }
    }
  };

  const handlePFCancel = () => {
    setPFForm({});
    setIsEditingPF(false);
    setSelectedPFRate(null);
  };

  const handlePFChange = (field: string, value: string | Date) => {
    setPFForm({ ...pfForm, [field]: typeof value === "string" ? value : formatDate(value) });
  };

  const handlePFCalcTypeChange = (value: "Fixed" | "On Actual") => {
    setPFForm({ ...pfForm, calcType: value });
  };

  return (
    <GlobalLayout>
      <div className="p-6 bg-gray-50 min-h-screen space-y-8">
      {/* ESI Section */}
      <Card className="shadow-lg border border-gray-200 rounded-lg">
        <CardHeader className="bg-gradient-to-r from-blue-100 to-white p-6 border-b border-gray-200 flex justify-between items-center">
          <CardTitle className="text-2xl font-semibold text-gray-800">ESI Rate Calculation Setup</CardTitle>
          <Button
            onClick={() => setIsAddESIColumnModalOpen(true)}
            className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-md text-sm font-medium transition duration-200"
          >
            Add Column
          </Button>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {esiColumns.map((col) => (
              <div key={col.key}>
                <Label className="text-sm font-medium text-gray-700">
                  {col.label} {col.type === "percentage" ? "(%)" : ""}{col.required ? "*" : ""}
                </Label>
                <Input
                  type="number"
                  value={esiForm[col.key] ?? ""}
                  onChange={(e) => handleESIChange(col.key, e.target.value)}
                  className="mt-1 h-12 border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  placeholder={col.defaultValue.toString()}
                />
              </div>
            ))}
            <div>
              <Label className="text-sm font-medium text-gray-700">Effective Date*</Label>
              <DatePicker
                selected={esiForm.effectiveDate ? new Date(esiForm.effectiveDate) : null}
                onChange={(date: Date | null) => handleESIChange("effectiveDate", date ?? "")}
                dateFormat="yyyy-MM-dd"
                className="mt-1 h-12 w-full border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                placeholderText="Select date"
              />
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700">End Date</Label>
              <DatePicker
                selected={esiForm.endDate ? new Date(esiForm.endDate) : null}
                onChange={(date: Date | null) => handleESIChange("endDate", date ?? "")}
                dateFormat="yyyy-MM-dd"
                className="mt-1 h-12 w-full border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                placeholderText="Select date"
              />
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700">Remarks</Label>
              <Input
                value={esiForm.remarks || ""}
                onChange={(e) => handleESIChange("remarks", e.target.value)}
                className="mt-1 h-12 border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                placeholder="Remarks"
              />
            </div>
          </div>
          <div className="flex space-x-4 mb-6">
            <Button
              onClick={handleESISubmit}
              className="bg-green-600 text-white hover:bg-green-700 px-6 py-3 rounded-md text-sm font-medium transition duration-200"
            >
              {isEditingESI ? "Update" : "Add"}
            </Button>
            <Button
              onClick={() => selectedESIRate && handleESIEdit(selectedESIRate)}
              disabled={!selectedESIRate}
              className="bg-yellow-500 text-white hover:bg-yellow-600 px-6 py-3 rounded-md text-sm font-medium transition duration-200"
            >
              Modify
            </Button>
            <Button
              variant="outline"
              onClick={handleESICancel}
              className="border-gray-300 text-gray-700 hover:bg-gray-100 px-6 py-3 rounded-md text-sm font-medium transition duration-200"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => selectedESIRate && handleESIDelete(selectedESIRate.id)}
              disabled={!selectedESIRate}
              className="bg-red-600 text-white hover:bg-red-700 px-6 py-3 rounded-md text-sm font-medium transition duration-200"
            >
              Delete
            </Button>
          </div>
          <Table className="w-full bg-white border border-gray-200 rounded-md shadow-sm">
            <TableHeader className="bg-gray-100">
              <TableRow>
                <TableHead className="p-3 text-sm font-semibold text-gray-700">S.N.</TableHead>
                {esiColumns.map((col) => (
                  <TableHead key={col.key} className="p-3 text-sm font-semibold text-gray-700">{col.label}</TableHead>
                ))}
                <TableHead className="p-3 text-sm font-semibold text-gray-700">Effective Date</TableHead>
                <TableHead className="p-3 text-sm font-semibold text-gray-700">End Date</TableHead>
                <TableHead className="p-3 text-sm font-semibold text-gray-700">Remarks</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {esiRates.map((rate) => (
                <TableRow
                  key={rate.id}
                  onClick={() => setSelectedESIRate(rate)}
                  className={`cursor-pointer hover:bg-gray-50 ${selectedESIRate?.id === rate.id ? "bg-blue-50" : ""}`}
                >
                  <TableCell className="p-3 text-sm text-gray-600">{rate.id}</TableCell>
                  {esiColumns.map((col) => (
                    <TableCell key={col.key} className="p-3 text-sm text-gray-600">
                      {col.type === "percentage" ? `${(Number(rate[col.key]) || 0).toFixed(2)}%` : rate[col.key]}
                    </TableCell>
                  ))}
                  <TableCell className="p-3 text-sm text-gray-600">{rate.effectiveDate}</TableCell>
                  <TableCell className="p-3 text-sm text-gray-600">{rate.endDate}</TableCell>
                  <TableCell className="p-3 text-sm text-gray-600">{rate.remarks}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add Column Modal for ESI */}
      <Dialog open={isAddESIColumnModalOpen} onOpenChange={setIsAddESIColumnModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New ESI Column</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="esiColumnLabel" className="text-right">Column Label</Label>
              <Input
                id="esiColumnLabel"
                value={newESIColumn.label}
                onChange={(e) => handleESIColumnChange("label", e.target.value)}
                className="col-span-3"
                placeholder="Enter column label"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="esiColumnType" className="text-right">Type</Label>
              <Select
                value={newESIColumn.type}
                onValueChange={(value: "percentage" | "value") => handleESIColumnChange("type", value)}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentage">Percentage</SelectItem>
                  <SelectItem value="value">Value</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsAddESIColumnModalOpen(false)}
              className="border-gray-300 text-gray-700 hover:bg-gray-100"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddESIColumn}
              className="bg-blue-600 text-white hover:bg-blue-700"
            >
              Add Column
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* PF Section */}
      <Card className="shadow-lg border border-gray-200 rounded-lg">
        <CardHeader className="bg-gradient-to-r from-blue-100 to-white p-6 border-b border-gray-200 flex justify-between items-center">
          <CardTitle className="text-2xl font-semibold text-gray-800">PF Rate Calculation Setup</CardTitle>
          <Button
            onClick={() => setIsAddPFColumnModalOpen(true)}
            className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-md text-sm font-medium transition duration-200"
          >
            Add Column
          </Button>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {pfColumns.map((col) => (
              <div key={col.key}>
                <Label className="text-sm font-medium text-gray-700">
                  {col.label} {col.type === "percentage" ? "(%)" : ""}{col.required ? "*" : ""}
                </Label>
                {col.key === "calcType" ? (
                  <Select
                    value={pfForm.calcType || ""}
                    onValueChange={handlePFCalcTypeChange}
                  >
                    <SelectTrigger className="mt-1 h-12 border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500">
                      <SelectValue placeholder="Select calc type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Fixed">Fixed</SelectItem>
                      <SelectItem value="On Actual">On Actual</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    type="number"
                    value={pfForm[col.key] ?? ""}
                    onChange={(e) => handlePFChange(col.key, e.target.value)}
                    className="mt-1 h-12 border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    placeholder={col.defaultValue.toString()}
                  />
                )}
              </div>
            ))}
            <div>
              <Label className="text-sm font-medium text-gray-700">Effective Date*</Label>
              <DatePicker
                selected={pfForm.effectiveDate ? new Date(pfForm.effectiveDate) : null}
                onChange={(date: Date | null) => handlePFChange("effectiveDate", date ?? "")}
                dateFormat="yyyy-MM-dd"
                className="mt-1 h-12 w-full border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                placeholderText="Select date"
              />
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700">End Date</Label>
              <DatePicker
                selected={pfForm.endDate ? new Date(pfForm.endDate) : null}
                onChange={(date: Date | null) => handlePFChange("endDate", date ?? "")}
                dateFormat="yyyy-MM-dd"
                className="mt-1 h-12 w-full border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                placeholderText="Select date"
              />
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700">Remarks</Label>
              <Input
                value={pfForm.remarks || ""}
                onChange={(e) => handlePFChange("remarks", e.target.value)}
                className="mt-1 h-12 border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                placeholder="Remarks"
              />
            </div>
          </div>
          <div className="flex space-x-4 mb-6">
            <Button
              onClick={handlePFSubmit}
              className="bg-green-600 text-white hover:bg-green-700 px-6 py-3 rounded-md text-sm font-medium transition duration-200"
            >
              {isEditingPF ? "Update" : "Add"}
            </Button>
            <Button
              onClick={() => selectedPFRate && handlePFEdit(selectedPFRate)}
              disabled={!selectedPFRate}
              className="bg-yellow-500 text-white hover:bg-yellow-600 px-6 py-3 rounded-md text-sm font-medium transition duration-200"
            >
              Modify
            </Button>
            <Button
              variant="outline"
              onClick={handlePFCancel}
              className="border-gray-300 text-gray-700 hover:bg-gray-100 px-6 py-3 rounded-md text-sm font-medium transition duration-200"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => selectedPFRate && handlePFDelete(selectedPFRate.id)}
              disabled={!selectedPFRate}
              className="bg-red-600 text-white hover:bg-red-700 px-6 py-3 rounded-md text-sm font-medium transition duration-200"
            >
              Delete
            </Button>
          </div>
          <Table className="w-full bg-white border border-gray-200 rounded-md shadow-sm">
            <TableHeader className="bg-gray-100">
              <TableRow>
                <TableHead className="p-3 text-sm font-semibold text-gray-700">S.N.</TableHead>
                {pfColumns.map((col) => (
                  <TableHead key={col.key} className="p-3 text-sm font-semibold text-gray-700">{col.label}</TableHead>
                ))}
                <TableHead className="p-3 text-sm font-semibold text-gray-700">Effective Date</TableHead>
                <TableHead className="p-3 text-sm font-semibold text-gray-700">End Date</TableHead>
                <TableHead className="p-3 text-sm font-semibold text-gray-700">Remarks</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pfRates.map((rate) => (
                <TableRow
                  key={rate.id}
                  onClick={() => setSelectedPFRate(rate)}
                  className={`cursor-pointer hover:bg-gray-50 ${selectedPFRate?.id === rate.id ? "bg-blue-50" : ""}`}
                >
                  <TableCell className="p-3 text-sm text-gray-600">{rate.id}</TableCell>
                  {pfColumns.map((col) => (
                    <TableCell key={col.key} className="p-3 text-sm text-gray-600">
                      {col.type === "percentage" ? `${(Number(rate[col.key]) || 0).toFixed(2)}%` : rate[col.key]}
                    </TableCell>
                  ))}
                  <TableCell className="p-3 text-sm text-gray-600">{rate.effectiveDate}</TableCell>
                  <TableCell className="p-3 text-sm text-gray-600">{rate.endDate}</TableCell>
                  <TableCell className="p-3 text-sm text-gray-600">{rate.remarks}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add Column Modal for PF */}
      <Dialog open={isAddPFColumnModalOpen} onOpenChange={setIsAddPFColumnModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New PF Column</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="pfColumnLabel" className="text-right">Column Label</Label>
              <Input
                id="pfColumnLabel"
                value={newPFColumn.label}
                onChange={(e) => handlePFColumnChange("label", e.target.value)}
                className="col-span-3"
                placeholder="Enter column label"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="pfColumnType" className="text-right">Type</Label>
              <Select
                value={newPFColumn.type}
                onValueChange={(value: "percentage" | "value") => handlePFColumnChange("type", value)}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentage">Percentage</SelectItem>
                  <SelectItem value="value">Value</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsAddPFColumnModalOpen(false)}
              className="border-gray-300 text-gray-700 hover:bg-gray-100"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddPFColumn}
              className="bg-blue-600 text-white hover:bg-blue-700"
            >
              Add Column
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      </div>
    </GlobalLayout>
  );
}