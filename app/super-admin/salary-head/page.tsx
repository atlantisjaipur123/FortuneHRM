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
import { DragDropContext, Droppable, Draggable, DropResult } from "react-beautiful-dnd";
import { GlobalLayout } from "@/app/components/global-layout";

interface SalaryHead {
  id: number;
  description: string;
  shortName: string;
  form16Field: string;
  fieldType: "Earnings" | "Deductions";
  applicable: { ESI: boolean; Bonus: boolean; PT: boolean; LWF: boolean; Gratuity: boolean; LeaveEncashment: boolean; PF: boolean };
}

const initialSalaryHeads: SalaryHead[] = [
  { id: 1, description: "BASIC SALARY", shortName: "", form16Field: "Salary u/s 17(1)", fieldType: "Earnings", applicable: { ESI: false, Bonus: false, PT: false, LWF: false, Gratuity: false, LeaveEncashment: false, PF: false } },
  { id: 2, description: "DEARNESS ALLOWANCE", shortName: "WANCE", form16Field: "Salary u/s 17(1)", fieldType: "Earnings", applicable: { ESI: false, Bonus: false, PT: false, LWF: false, Gratuity: false, LeaveEncashment: false, PF: false } },
  { id: 3, description: "BONUS", shortName: "", form16Field: "Bonus", fieldType: "Earnings", applicable: { ESI: false, Bonus: true, PT: false, LWF: false, Gratuity: false, LeaveEncashment: false, PF: false } },
  { id: 4, description: "FEES & COMMISSION", shortName: "SION", form16Field: "Salary u/s 17(1)", fieldType: "Earnings", applicable: { ESI: false, Bonus: false, PT: false, LWF: false, Gratuity: false, LeaveEncashment: false, PF: false } },
  { id: 5, description: "OVERTIME", shortName: "", form16Field: "Salary u/s 17(1)", fieldType: "Earnings", applicable: { ESI: false, Bonus: false, PT: false, LWF: false, Gratuity: false, LeaveEncashment: false, PF: false } },
  { id: 6, description: "ADVANCE SALARY", shortName: "Y", form16Field: "Salary u/s 17(1)", fieldType: "Earnings", applicable: { ESI: false, Bonus: false, PT: false, LWF: false, Gratuity: false, LeaveEncashment: false, PF: false } },
  { id: 7, description: "ACCOMMODATION", shortName: "N", form16Field: "Perquisites u/s 17(2)", fieldType: "Earnings", applicable: { ESI: false, Bonus: false, PT: false, LWF: false, Gratuity: false, LeaveEncashment: false, PF: false } },
  { id: 8, description: "CAR/OTHER AUTOMOTIVE", shortName: "OMOTIVE", form16Field: "Perquisites u/s 17(2)", fieldType: "Earnings", applicable: { ESI: false, Bonus: false, PT: false, LWF: false, Gratuity: false, LeaveEncashment: false, PF: false } },
  { id: 9, description: "SWEEPER, GARDENER, WATCHMAN OR", shortName: "ENER, WATCHMAN OR", form16Field: "Perquisites u/s 17(2)", fieldType: "Earnings", applicable: { ESI: false, Bonus: false, PT: false, LWF: false, Gratuity: false, LeaveEncashment: false, PF: false } },
  { id: 10, description: "GAS, ELECTRICITY, WATER", shortName: "Y, WATER", form16Field: "Perquisites u/s 17(2)", fieldType: "Earnings", applicable: { ESI: false, Bonus: false, PT: false, LWF: false, Gratuity: false, LeaveEncashment: false, PF: false } },
  { id: 11, description: "INTEREST FREE OR CONCESSIONAL LOANS", shortName: "OR CONCESSIONAL LOANS", form16Field: "Perquisites u/s 17(2)", fieldType: "Earnings", applicable: { ESI: false, Bonus: false, PT: false, LWF: false, Gratuity: false, LeaveEncashment: false, PF: false } },
  { id: 12, description: "HOLIDAY EXPENSES", shortName: "SES", form16Field: "Perquisites u/s 17(2)", fieldType: "Earnings", applicable: { ESI: false, Bonus: false, PT: false, LWF: false, Gratuity: false, LeaveEncashment: false, PF: false } },
];

const initialForm16Fields = [
  "Salary u/s 17(1)",
  "Perquisites u/s 17(2)",
  "Bonus"
];

export default function SalaryHeadPage() {
  const [salaryHeads, setSalaryHeads] = useState<SalaryHead[]>(initialSalaryHeads);
  const [form16Fields, setForm16Fields] = useState<string[]>(initialForm16Fields);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Partial<SalaryHead>>({});
  const [selectedSalaryHead, setSelectedSalaryHead] = useState<SalaryHead | null>(null);
  const [showOnlySetupHeads, setShowOnlySetupHeads] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [newForm16Field, setNewForm16Field] = useState("");
  const [showNewFieldInput, setShowNewFieldInput] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [fieldToDelete, setFieldToDelete] = useState<string | null>(null);

  const handleSubmit = () => {
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
    setShowNewFieldInput(false);
    setNewForm16Field("");
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
    setShowNewFieldInput(false);
    setNewForm16Field("");
    setDeleteDialogOpen(false);
    setFieldToDelete(null);
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
      applicable: { ...(form.applicable || { ESI: false, Bonus: false, PT: false, LWF: false, Gratuity: false, LeaveEncashment: false, PF: false }), [field]: value },
    });
  };

  const handleForm16FieldChange = (value: string) => {
    if (value === "create_new") {
      setShowNewFieldInput(true);
    } else {
      setForm({ ...form, form16Field: value });
      setShowNewFieldInput(false);
      setNewForm16Field("");
    }
  };

  const handleNewForm16FieldSubmit = () => {
    if (newForm16Field.trim() && !form16Fields.includes(newForm16Field.trim())) {
      setForm16Fields([...form16Fields, newForm16Field.trim()]);
      setForm({ ...form, form16Field: newForm16Field.trim() });
      setShowNewFieldInput(false);
      setNewForm16Field("");
    } else if (form16Fields.includes(newForm16Field.trim())) {
      alert("This Form 16 field already exists");
    } else {
      alert("Please enter a valid Form 16 field name");
    }
  };

  const handleDeleteForm16Field = (field: string) => {
    if (salaryHeads.some((head) => head.form16Field === field)) {
      alert("Cannot delete this Form 16 field as it is used by existing salary heads.");
      return;
    }
    setFieldToDelete(field);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteForm16Field = () => {
    if (fieldToDelete) {
      setForm16Fields(form16Fields.filter((field) => field !== fieldToDelete));
      if (form.form16Field === fieldToDelete) {
        setForm({ ...form, form16Field: "" });
      }
      setDeleteDialogOpen(false);
      setFieldToDelete(null);
    }
  };

  const handleDragEnd = (result: DropResult) => {
    console.log("Drag end result:", result); // Debug output
    if (!result.destination) return;

    const reorderedSalaryHeads = Array.from(salaryHeads);
    const [movedItem] = reorderedSalaryHeads.splice(result.source.index, 1);
    reorderedSalaryHeads.splice(result.destination.index, 0, movedItem);

    setSalaryHeads(reorderedSalaryHeads);
    if (selectedSalaryHead) {
      const updatedSelected = reorderedSalaryHeads.find((head) => head.id === selectedSalaryHead.id);
      setSelectedSalaryHead(updatedSelected || null);
    }
  };

  return (
    <GlobalLayout>
      <div className="space-y-6">
      <Card>
        <CardHeader className="p-4">
          <CardTitle className="text-xl font-semibold">Salary Heads Management</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
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
                onValueChange={handleForm16FieldChange}
              >
                <SelectTrigger className="mt-1 h-12 border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500">
                  <SelectValue placeholder="Select Form 16 Field" />
                </SelectTrigger>
                <SelectContent>
                  {form16Fields.map((field) => (
                    <div key={field} className="flex items-center justify-between px-2 py-1">
                      <SelectItem value={field} className="flex-1">{field}</SelectItem>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteForm16Field(field)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Delete
                      </Button>
                    </div>
                  ))}
                  <SelectItem value="create_new">Create New</SelectItem>
                </SelectContent>
              </Select>
              {showNewFieldInput && (
                <div className="mt-2">
                  <Input
                    value={newForm16Field}
                    onChange={(e) => setNewForm16Field(e.target.value)}
                    placeholder="Enter new Form 16 field"
                    className="h-12 border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                  <Button
                    onClick={handleNewForm16FieldSubmit}
                    className="mt-2 bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-md text-sm font-medium transition duration-200"
                  >
                    Add New Field
                  </Button>
                </div>
              )}
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
              className="h-6 w-6 text-blue-600 border-2 border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            />
            <Label className="text-sm font-medium text-gray-700">Show Only Salary Setup Heads</Label>
          </div>
          <DragDropContext onDragEnd={handleDragEnd}>
            <div className="rounded-md border overflow-x-auto">
              <Table className="w-full">
                <TableHeader>
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
                    <TableHead className="p-3 text-sm font-semibold text-gray-700">PF</TableHead>
                  </TableRow>
                </TableHeader>
                <Droppable droppableId="salaryHeads">
                  {(provided: any) => (
                    <TableBody ref={provided.innerRef} {...provided.droppableProps}>
                      {salaryHeads.map((head, index) => (
                        <Draggable key={head.id.toString()} draggableId={head.id.toString()} index={index}>
                          {(provided: any) => (
                            <TableRow
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              onClick={() => setSelectedSalaryHead(head)}
                              className={`cursor-pointer hover:bg-muted ${selectedSalaryHead?.id === head.id ? "bg-primary/5" : ""}`}
                            >
                              <TableCell className="p-3 text-sm">{index + 1}</TableCell>
                              <TableCell className="p-3 text-sm">{head.description}</TableCell>
                              <TableCell className="p-3 text-sm">{head.shortName}</TableCell>
                              <TableCell className="p-3 text-sm">{head.form16Field}</TableCell>
                              <TableCell className="p-3 text-sm">{head.fieldType}</TableCell>
                              <TableCell className="p-3 text-sm">{head.applicable.ESI ? "Yes" : "No"}</TableCell>
                              <TableCell className="p-3 text-sm">{head.applicable.Bonus ? "Yes" : "No"}</TableCell>
                              <TableCell className="p-3 text-sm">{head.applicable.PT ? "Yes" : "No"}</TableCell>
                              <TableCell className="p-3 text-sm">{head.applicable.LWF ? "Yes" : "No"}</TableCell>
                              <TableCell className="p-3 text-sm">{head.applicable.Gratuity ? "Yes" : "No"}</TableCell>
                              <TableCell className="p-3 text-sm">{head.applicable.LeaveEncashment ? "Yes" : "No"}</TableCell>
                              <TableCell className="p-3 text-sm">{head.applicable.PF ? "Yes" : "No"}</TableCell>
                            </TableRow>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </TableBody>
                  )}
                </Droppable>
              </Table>
            </div>
          </DragDropContext>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-gray-800">Select Applicable Options</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="flex items-center space-x-3">
              <Checkbox
                checked={form.applicable?.ESI || false}
                onCheckedChange={(checked) => handleApplicableChange("ESI", checked as boolean)}
                className="h-6 w-6 text-blue-600 border-2 border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
              <Label className="text-sm font-medium text-gray-700">ESI</Label>
            </div>
            <div className="flex items-center space-x-3">
              <Checkbox
                checked={form.applicable?.Bonus || false}
                onCheckedChange={(checked) => handleApplicableChange("Bonus", checked as boolean)}
                className="h-6 w-6 text-blue-600 border-2 border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
              <Label className="text-sm font-medium text-gray-700">Bonus</Label>
            </div>
            <div className="flex items-center space-x-3">
              <Checkbox
                checked={form.applicable?.PT || false}
                onCheckedChange={(checked) => handleApplicableChange("PT", checked as boolean)}
                className="h-6 w-6 text-blue-600 border-2 border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
              <Label className="text-sm font-medium text-gray-700">PT</Label>
            </div>
            <div className="flex items-center space-x-3">
              <Checkbox
                checked={form.applicable?.LWF || false}
                onCheckedChange={(checked) => handleApplicableChange("LWF", checked as boolean)}
                className="h-6 w-6 text-blue-600 border-2 border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
              <Label className="text-sm font-medium text-gray-700">LWF</Label>
            </div>
            <div className="flex items-center space-x-3">
              <Checkbox
                checked={form.applicable?.Gratuity || false}
                onCheckedChange={(checked) => handleApplicableChange("Gratuity", checked as boolean)}
                className="h-6 w-6 text-blue-600 border-2 border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
              <Label className="text-sm font-medium text-gray-700">Gratuity</Label>
            </div>
            <div className="flex items-center space-x-3">
              <Checkbox
                checked={form.applicable?.LeaveEncashment || false}
                onCheckedChange={(checked) => handleApplicableChange("LeaveEncashment", checked as boolean)}
                className="h-6 w-6 text-blue-600 border-2 border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
              <Label className="text-sm font-medium text-gray-700">Leave Encashment</Label>
            </div>
            <div className="flex items-center space-x-3">
              <Checkbox
                checked={form.applicable?.PF || false}
                onCheckedChange={(checked) => handleApplicableChange("PF", checked as boolean)}
                className="h-6 w-6 text-blue-600 border-2 border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
              <Label className="text-sm font-medium text-gray-700">PF</Label>
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

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="max-w-md p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-gray-800">Confirm Deletion</DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            <p className="text-sm text-gray-600">Are you sure you want to delete the Form 16 field "{fieldToDelete}"?</p>
          </div>
          <DialogFooter className="mt-6">
            <Button
              onClick={confirmDeleteForm16Field}
              className="bg-red-600 text-white hover:bg-red-700 px-6 py-3 rounded-md text-sm font-medium transition duration-200"
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
    </GlobalLayout>
  );
}