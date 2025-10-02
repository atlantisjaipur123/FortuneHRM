"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

interface SalaryHead {
  id: number;
  description: string;
  shortName: string;
  form16Field: string;
  fieldType: "Earnings" | "Deductions";
  applicable: { ESI: boolean; Bonus: boolean; PT: boolean; LWF: boolean; Gratuity: boolean; LeaveEncashment: boolean };
}

const initialSalaryHeads: SalaryHead[] = [
  { id: 1, description: "BASIC SALARY", shortName: "", form16Field: "Salary u/s 17(1)", fieldType: "Earnings", applicable: { ESI: false, Bonus: false, PT: false, LWF: false, Gratuity: false, LeaveEncashment: false } },
  { id: 2, description: "DEARNESS ALLOWANCE", shortName: "WANCE", form16Field: "Salary u/s 17(1)", fieldType: "Earnings", applicable: { ESI: false, Bonus: false, PT: false, LWF: false, Gratuity: false, LeaveEncashment: false } },
  { id: 3, description: "BONUS", shortName: "", form16Field: "Bonus", fieldType: "Earnings", applicable: { ESI: false, Bonus: true, PT: false, LWF: false, Gratuity: false, LeaveEncashment: false } },
  { id: 4, description: "FEES & COMMISSION", shortName: "SION", form16Field: "Salary u/s 17(1)", fieldType: "Earnings", applicable: { ESI: false, Bonus: false, PT: false, LWF: false, Gratuity: false, LeaveEncashment: false } },
  { id: 5, description: "OVERTIME", shortName: "", form16Field: "Salary u/s 17(1)", fieldType: "Earnings", applicable: { ESI: false, Bonus: false, PT: false, LWF: false, Gratuity: false, LeaveEncashment: false } },
  { id: 6, description: "ADVANCE SALARY", shortName: "Y", form16Field: "Salary u/s 17(1)", fieldType: "Earnings", applicable: { ESI: false, Bonus: false, PT: false, LWF: false, Gratuity: false, LeaveEncashment: false } },
  { id: 7, description: "ACCOMMODATION", shortName: "N", form16Field: "Perquisites u/s 17(2)", fieldType: "Earnings", applicable: { ESI: false, Bonus: false, PT: false, LWF: false, Gratuity: false, LeaveEncashment: false } },
  { id: 8, description: "CAR/OTHER AUTOMOTIVE", shortName: "OMOTIVE", form16Field: "Perquisites u/s 17(2)", fieldType: "Earnings", applicable: { ESI: false, Bonus: false, PT: false, LWF: false, Gratuity: false, LeaveEncashment: false } },
  { id: 9, description: "SWEEPER, GARDENER, WATCHMAN OR", shortName: "ENER, WATCHMAN OR", form16Field: "Perquisites u/s 17(2)", fieldType: "Earnings", applicable: { ESI: false, Bonus: false, PT: false, LWF: false, Gratuity: false, LeaveEncashment: false } },
  { id: 10, description: "GAS, ELECTRICITY, WATER", shortName: "Y, WATER", form16Field: "Perquisites u/s 17(2)", fieldType: "Earnings", applicable: { ESI: false, Bonus: false, PT: false, LWF: false, Gratuity: false, LeaveEncashment: false } },
  { id: 11, description: "INTEREST FREE OR CONCESSIONAL LOANS", shortName: "OR CONCESSIONAL LOANS", form16Field: "Perquisites u/s 17(2)", fieldType: "Earnings", applicable: { ESI: false, Bonus: false, PT: false, LWF: false, Gratuity: false, LeaveEncashment: false } },
  { id: 12, description: "HOLIDAY EXPENSES", shortName: "SES", form16Field: "Perquisites u/s 17(2)", fieldType: "Earnings", applicable: { ESI: false, Bonus: false, PT: false, LWF: false, Gratuity: false, LeaveEncashment: false } },
];

export default function SalaryHeadPage() {
  const [salaryHeads, setSalaryHeads] = useState<SalaryHead[]>(initialSalaryHeads);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Partial<SalaryHead>>({});
  const [selectedSalaryHead, setSelectedSalaryHead] = useState<SalaryHead | null>(null);
  const [showOnlySetupHeads, setShowOnlySetupHeads] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const handleSubmit = () => {
    // Validate required fields
    if (!form.description || !form.form16Field || !form.fieldType || !form.applicable) {
      alert("Please fill in all required fields and select applicable options");
      return;
    }

    if (isEditing && form.id) {
      setSalaryHeads(
        salaryHeads.map((head) =>
          head.id === form.id ? { ...head, ...form } : head
        )
      );
    } else {
      const newId = Math.max(...salaryHeads.map((h) => h.id)) + 1;
      setSalaryHeads([...salaryHeads, { ...form, id: newId } as SalaryHead]);
    }
    setForm({});
    setIsEditing(false);
    setSelectedSalaryHead(null);
    setOpen(false);
  };

  const handleEdit = (salaryHead: SalaryHead) => {
    setForm(salaryHead);
    setIsEditing(true);
    setSelectedSalaryHead(salaryHead);
  };

  const handleAdd = () => {
    if (!form.description || !form.shortName || !form.form16Field || !form.fieldType) {
      alert("Please fill all fields before proceeding");
      return;
    }
    setOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this salary head?")) {
      setSalaryHeads(salaryHeads.filter((head) => head.id !== id));
      if (selectedSalaryHead?.id === id) {
        setSelectedSalaryHead(null);
        setForm({});
        setIsEditing(false);
      }
    }
  };

  const handleCancel = () => {
    setForm({});
    setIsEditing(false);
    setSelectedSalaryHead(null);
    setOpen(false);
  };

  const handleChange = (field: keyof SalaryHead, value: string) => {
    setForm({ ...form, [field]: value });
  };

  const handleFieldTypeChange = (value: "Earnings" | "Deductions") => {
    setForm({ ...form, fieldType: value });
  };

  const handleApplicableChange = (field: keyof SalaryHead["applicable"], value: boolean) => {
    setForm({
      ...form,
      applicable: { ...(form.applicable || { ESI: false, Bonus: false, PT: false, LWF: false, Gratuity: false, LeaveEncashment: false }), [field]: value },
    });
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <Card className="shadow-lg border border-gray-200 rounded-lg">
        <CardHeader className="bg-gradient-to-r from-blue-100 to-white p-6 border-b border-gray-200">
          <CardTitle className="text-2xl font-semibold text-gray-800">Salary Heads Management</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <Label className="text-sm font-medium text-gray-700">Name of Salary Head *</Label>
              <Input
                value={form.description || ""}
                onChange={(e) => handleChange("description", e.target.value)}
                className="mt-1 h-12 border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                placeholder="Enter salary head name"
              />
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700">Display/Short Name *</Label>
              <Input
                value={form.shortName || ""}
                onChange={(e) => handleChange("shortName", e.target.value)}
                className="mt-1 h-12 border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                placeholder="Enter short name"
              />
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700">Under Form 16 Field *</Label>
              <Select
                value={form.form16Field || ""}
                onValueChange={(value) => handleChange("form16Field", value)}
              >
                <SelectTrigger className="mt-1 h-12 border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500">
                  <SelectValue placeholder="Select Form 16 Field" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Salary u/s 17(1)">Salary u/s 17(1)</SelectItem>
                  <SelectItem value="Perquisites u/s 17(2)">Perquisites u/s 17(2)</SelectItem>
                  <SelectItem value="Bonus">Bonus</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700">Field Type *</Label>
              <Select
                value={form.fieldType || ""}
                onValueChange={handleFieldTypeChange}
              >
                <SelectTrigger className="mt-1 h-12 border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500">
                  <SelectValue placeholder="Select Field Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Earnings">Earnings</SelectItem>
                  <SelectItem value="Deductions">Deductions</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex space-x-4 mb-6">
            <Button
              onClick={handleAdd}
              className="bg-blue-600 text-white hover:bg-blue-700 px-6 py-3 rounded-md text-sm font-medium transition duration-200"
            >
              Add
            </Button>
            <Button
              onClick={() => selectedSalaryHead && handleEdit(selectedSalaryHead)}
              disabled={!selectedSalaryHead}
              className="bg-yellow-500 text-white hover:bg-yellow-600 px-6 py-3 rounded-md text-sm font-medium transition duration-200"
            >
              Modify
            </Button>
            <Button
              onClick={handleSubmit}
              className="bg-green-600 text-white hover:bg-green-700 px-6 py-3 rounded-md text-sm font-medium transition duration-200"
            >
              {isEditing ? "Update" : "Save"}
            </Button>
            <Button
              variant="outline"
              onClick={handleCancel}
              className="border-gray-300 text-gray-700 hover:bg-gray-100 px-6 py-3 rounded-md text-sm font-medium transition duration-200"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => selectedSalaryHead && handleDelete(selectedSalaryHead.id)}
              disabled={!selectedSalaryHead}
              className="bg-red-600 text-white hover:bg-red-700 px-6 py-3 rounded-md text-sm font-medium transition duration-200"
            >
              Delete
            </Button>
          </div>
          <div className="flex items-center space-x-2 mb-4">
            <Checkbox
              checked={showOnlySetupHeads}
              onCheckedChange={(checked) => setShowOnlySetupHeads(checked as boolean)}
              className="h-5 w-5 text-blue-600"
            />
            <Label className="text-sm font-medium text-gray-700">Show Only Salary Setup Heads</Label>
          </div>
          <Table className="w-full bg-white border border-gray-200 rounded-md shadow-sm">
            <TableHeader className="bg-gray-100">
              <TableRow>
                <TableHead className="p-3 text-sm font-semibold text-gray-700">S.N.</TableHead>
                <TableHead className="p-3 text-sm font-semibold text-gray-700">Description</TableHead>
                <TableHead className="p-3 text-sm font-semibold text-gray-700">Short Name</TableHead>
                <TableHead className="p-3 text-sm font-semibold text-gray-700">Form 16 Field</TableHead>
                <TableHead className="p-3 text-sm font-semibold text-gray-700">Field Type</TableHead>
                <TableHead className="p-3 text-sm font-semibold text-gray-700">ESI</TableHead>
                <TableHead className="p-3 text-sm font-semibold text-gray-700">Bonus</TableHead>
                <TableHead className="p-3 text-sm font-semibold text-gray-700">PT</TableHead>
                <TableHead className="p-3 text-sm font-semibold text-gray-700">LWF</TableHead>
                <TableHead className="p-3 text-sm font-semibold text-gray-700">Gratuity</TableHead>
                <TableHead className="p-3 text-sm font-semibold text-gray-700">Leave Encashment</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {salaryHeads.map((head) => (
                <TableRow
                  key={head.id}
                  onClick={() => setSelectedSalaryHead(head)}
                  className={`cursor-pointer hover:bg-gray-50 ${selectedSalaryHead?.id === head.id ? "bg-blue-50" : ""}`}
                >
                  <TableCell className="p-3 text-sm text-gray-600">{head.id}</TableCell>
                  <TableCell className="p-3 text-sm text-gray-600">{head.description}</TableCell>
                  <TableCell className="p-3 text-sm text-gray-600">{head.shortName}</TableCell>
                  <TableCell className="p-3 text-sm text-gray-600">{head.form16Field}</TableCell>
                  <TableCell className="p-3 text-sm text-gray-600">{head.fieldType}</TableCell>
                  <TableCell className="p-3 text-sm text-gray-600">{head.applicable.ESI ? "Yes" : "No"}</TableCell>
                  <TableCell className="p-3 text-sm text-gray-600">{head.applicable.Bonus ? "Yes" : "No"}</TableCell>
                  <TableCell className="p-3 text-sm text-gray-600">{head.applicable.PT ? "Yes" : "No"}</TableCell>
                  <TableCell className="p-3 text-sm text-gray-600">{head.applicable.LWF ? "Yes" : "No"}</TableCell>
                  <TableCell className="p-3 text-sm text-gray-600">{head.applicable.Gratuity ? "Yes" : "No"}</TableCell>
                  <TableCell className="p-3 text-sm text-gray-600">{head.applicable.LeaveEncashment ? "Yes" : "No"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-gray-800">Select Applicable Options</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                checked={form.applicable?.ESI || false}
                onCheckedChange={(checked) => handleApplicableChange("ESI", checked as boolean)}
                className="h-5 w-5 text-blue-600"
              />
              <Label className="text-sm font-medium text-gray-700">ESI</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                checked={form.applicable?.Bonus || false}
                onCheckedChange={(checked) => handleApplicableChange("Bonus", checked as boolean)}
                className="h-5 w-5 text-blue-600"
              />
              <Label className="text-sm font-medium text-gray-700">Bonus</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                checked={form.applicable?.PT || false}
                onCheckedChange={(checked) => handleApplicableChange("PT", checked as boolean)}
                className="h-5 w-5 text-blue-600"
              />
              <Label className="text-sm font-medium text-gray-700">PT</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                checked={form.applicable?.LWF || false}
                onCheckedChange={(checked) => handleApplicableChange("LWF", checked as boolean)}
                className="h-5 w-5 text-blue-600"
              />
              <Label className="text-sm font-medium text-gray-700">LWF</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                checked={form.applicable?.Gratuity || false}
                onCheckedChange={(checked) => handleApplicableChange("Gratuity", checked as boolean)}
                className="h-5 w-5 text-blue-600"
              />
              <Label className="text-sm font-medium text-gray-700">Gratuity</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                checked={form.applicable?.LeaveEncashment || false}
                onCheckedChange={(checked) => handleApplicableChange("LeaveEncashment", checked as boolean)}
                className="h-5 w-5 text-blue-600"
              />
              <Label className="text-sm font-medium text-gray-700">Leave Encashment</Label>
            </div>
          </div>
          <DialogFooter className="mt-6">
            <Button
              onClick={handleSubmit}
              className="bg-green-600 text-white hover:bg-green-700 px-6 py-3 rounded-md text-sm font-medium transition duration-200"
            >
              Confirm
            </Button>
            <Button
              variant="outline"
              onClick={handleCancel}
              className="border-gray-300 text-gray-700 hover:bg-gray-100 px-6 py-3 rounded-md text-sm font-medium transition duration-200"
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}