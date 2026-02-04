"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { GlobalLayout } from "@/app/components/global-layout";
import { Plus, Trash2, Edit } from "lucide-react";
import { api, API } from "@/app/lib/api";


interface SalaryHead {
  sno: number;
  id: string;

  description: string;
  shortName: string;

  value?: number;

  form16Field: string;
  group: string;
  type: "Regular" | "Adhoc";
  fieldType: "Earnings" | "Deductions";

  active: boolean;

  amountType: "Fixed" | "Percentage";
  percentBase: "Amount" | "Gross" | "TakeHome" | string;

  applicable: {
    ESI: boolean;
    Bonus: boolean;
    PT: boolean;
    LWF: boolean;
    Gratuity: boolean;
    LeaveEncashment: boolean;
    PF: boolean;
  };
  isSystem?: boolean;
  systemCode?: string;
}


const defaultForm16Fields = [
  "Salary u/s 17(1)",
  "Perquisites u/s 17(2)",
  "Bonus",
  "Allowance",
  "Deductions u/s 16",
  "Other Income",
];

const defaultGroups = ["Standard", "Allowances", "Reimbursements", "Deductions"];

const defaultForm: SalaryHead = {
  id: "",
  sno: 0,
  description: "",
  shortName: "",
  form16Field: "Salary u/s 17(1)",
  group: "Standard",
  type: "Regular",
  fieldType: "Earnings",
  active: true,
  amountType: "Percentage",
  percentBase: "Amount",
  applicable: {
    ESI: false,
    Bonus: false,
    PT: false,
    LWF: false,
    Gratuity: false,
    LeaveEncashment: false,
    PF: false,
  },
};

export default function SalaryHeadPage() {
  const [salaryHeads, setSalaryHeads] = useState<SalaryHead[]>([]);
  const [form16Fields, setForm16Fields] = useState<string[]>(defaultForm16Fields);
  const [groups, setGroups] = useState<string[]>(defaultGroups);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<SalaryHead>(defaultForm);
  const [isEditing, setIsEditing] = useState(false);
  const [newForm16Field, setNewForm16Field] = useState("");
  const [showNewFieldInput, setShowNewFieldInput] = useState(false);
  const [newGroup, setNewGroup] = useState("");
  const [showNewGroupInput, setShowNewGroupInput] = useState(false);
  const isSystemHead = form.isSystem === true;


  useEffect(() => {
    async function loadSalaryHeads() {
      try {
        const res = await api.get("/api/salary-head");

        const heads: SalaryHead[] = (res.salaryHeads || []).map(
          (h: any, index: number) => ({
            id: h.id,
            sno: index + 1,
            description: h.name,
            shortName: h.shortName || "",
            form16Field: h.form16Field || "Salary u/s 17(1)",
            group: "Standard",
            type: "Regular",
            fieldType: h.fieldType || "Earnings",
            active: h.isActive,
            value: h.value || 0,
            amountType: h.isPercentage ? "Percentage" : "Fixed",
            percentBase: h.percentageOf || "Amount",
            applicable: (h.applicableFor && typeof h.applicableFor === 'object') ? h.applicableFor : {
              ESI: false,
              Bonus: false,
              PT: false,
              LWF: false,
              Gratuity: false,
              LeaveEncashment: false,
              PF: false,

            },
            isSystem: h.isSystem,
            systemCode: h.systemCode || "",
          })
        );


        setSalaryHeads(heads);
      } catch (error) {
        console.error("Failed to load salary heads", error);
        alert("Failed to load salary heads");
      }
    }

    loadSalaryHeads();
  }, []);





  const handleOpenDialog = (head?: SalaryHead) => {
    if (head) {
      setForm(head);
      setIsEditing(true);
    } else {
      setForm({
        ...defaultForm,
        sno: Math.max(...salaryHeads.map(h => h.sno), 0) + 1,
      });
      setIsEditing(false);
    }
    setOpen(true);
  };


  const handleSubmit = async () => {
    if (!form.description || !form.shortName) {
      alert("Fill all required fields");
      return;
    }

    const payload = {
      name: form.description,
      shortName: form.shortName,
      fieldType: form.fieldType,

      isPercentage: form.amountType === "Percentage",
      percentageOf:
        form.amountType === "Percentage" ? form.percentBase : null,

      value: form.value, // ✅ ADD THIS

      form16Field: form.form16Field,
      applicableFor: form.applicable,
    };


    try {
      if (isEditing && form.id) {
        await api.put("/api/salary-head", {
          id: form.id,
          active: form.active,
          ...payload,
        });
      } else {
        await api.post("/api/salary-head", payload);
      }

      // reload from backend
      const res = await api.get("/api/salary-head");

      const heads: SalaryHead[] = (res.salaryHeads || []).map(
        (h: any, index: number) => ({
          id: h.id,
          sno: index + 1,
          description: h.name,
          shortName: h.shortName || "",
          form16Field: h.form16Field || "Salary u/s 17(1)",
          group: "Standard",
          type: "Regular",
          fieldType: h.fieldType || "Earnings",
          active: h.isActive,
          amountType: h.isPercentage ? "Percentage" : "Fixed",
          percentBase: h.percentageOf || "Amount",
          applicable: (h.applicableFor && typeof h.applicableFor === 'object') ? h.applicableFor : {},
          isSystem: h.isSystem,
          systemCode: h.systemCode || "",
        })
      );

      setSalaryHeads(heads);
      setOpen(false);
      setForm(defaultForm);
    } catch (err: any) {
      console.error("Failed to save salary head", err);
      alert(err.message || "Failed to save salary head");
    }
  };



  const handleDelete = async (id: string) => {
    if (!confirm("Delete permanently?")) return;

    try {
      await API("/api/salary-head", { method: "DELETE", body: { id } });

      const res = await api.get("/api/salary-head");

      const heads: SalaryHead[] = (res.salaryHeads || []).map((h: any, index: number) => ({
        id: h.id,
        sno: index + 1,
        description: h.name,
        shortName: h.shortName || "",
        form16Field: h.form16Field || "Salary u/s 17(1)",
        group: "Standard",
        type: "Regular",
        fieldType: h.fieldType || "Earnings",
        active: h.isActive,
        amountType: h.isPercentage ? "Percentage" : "Fixed",
        percentBase: h.percentageOf || "Amount",
        applicable: (h.applicableFor && typeof h.applicableFor === 'object') ? h.applicableFor : {},
        isSystem: h.isSystem,
        systemCode: h.systemCode || "",
      }));

      setSalaryHeads(heads);
    } catch (err: any) {
      console.error("Delete failed", err);
      alert(err.message || "Failed to delete salary head");
    }
  };



  const addForm16Field = () => {
    if (newForm16Field.trim() && !form16Fields.includes(newForm16Field.trim())) {
      setForm16Fields(prev => [...prev, newForm16Field.trim()]);
      setForm({ ...form, form16Field: newForm16Field.trim() });
      setNewForm16Field("");
      setShowNewFieldInput(false);
    }
  };

  const deleteForm16Field = (field: string) => {
    if (confirm(`Delete "${field}" from Form 16 fields?`)) {
      setForm16Fields(prev => prev.filter(f => f !== field));
    }
  };

  const addGroup = () => {
    if (newGroup.trim() && !groups.includes(newGroup.trim())) {
      setGroups(prev => [...prev, newGroup.trim()]);
      setForm({ ...form, group: newGroup.trim() });
      setNewGroup("");
      setShowNewGroupInput(false);
    }
  };

  const deleteGroup = (group: string) => {
    if (confirm(`Delete group "${group}"?`)) {
      setGroups(prev => prev.filter(g => g !== group));
      setSalaryHeads(prev => prev.map(h => h.group === group ? { ...h, group: "Standard" } : h));
    }
  };

  return (
    <GlobalLayout>
      <div className="space-y-6 p-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Salary Heads Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Add Salary Head Button */}
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="w-4 h-4 mr-2" /> Add Salary Head
            </Button>

            {/* Salary Heads Table */}
            <div className="rounded-lg border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>S.No</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Short</TableHead>
                    <TableHead>Group</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Field Type</TableHead>
                    <TableHead>Active</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {salaryHeads.map((head) => (
                    <TableRow
                      key={head.id}
                      className={!head.active ? "opacity-50" : ""}
                    >
                      <TableCell className="font-bold">{head.sno}</TableCell>
                      <TableCell>
                        {head.description}
                        {head.isSystem && (
                          <span className="ml-2 px-2 py-0.5 text-xs rounded bg-gray-200">
                            System
                          </span>
                        )}
                      </TableCell>

                      <TableCell>{head.shortName}</TableCell>
                      <TableCell>{head.group}</TableCell>

                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${head.type === "Regular"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-orange-100 text-orange-800"
                            }`}
                        >
                          {head.type}
                        </span>
                      </TableCell>

                      <TableCell>{head.fieldType}</TableCell>

                      <TableCell>
                        <Switch
                          checked={head.active}
                          onCheckedChange={async (v) => {
                            try {
                              await api.put("/api/salary-head", {
                                id: head.id,
                                active: v
                              })
                              setSalaryHeads((prev) =>
                                prev.map((h) =>
                                  h.id === head.id ? { ...h, active: v } : h
                                )
                              );
                            } catch (err) {
                              alert("Failed to update status");
                            }
                          }}
                        />

                      </TableCell>

                      <TableCell>
                        <div className="flex gap-2 items-center">
                          {/* Edit is always allowed */}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleOpenDialog(head)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>

                          {/* Delete ONLY if not system head */}
                          {!head.isSystem ? (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDelete(head.id)}
                            >
                              <Trash2 className="w-4 h-4 text-red-600" />
                            </Button>
                          ) : (
                            <span className="text-xs text-gray-400 select-none">
                              System
                            </span>
                          )}
                        </div>
                      </TableCell>

                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

          </CardContent>
        </Card>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{isEditing ? "Edit" : "Add"} Salary Head</DialogTitle>
            </DialogHeader>
            {form.isSystem && (
              <p className="text-sm text-gray-500 mt-1">
                This is a system salary head. Only the name can be edited.
              </p>
            )}


            <div className="grid grid-cols-2 gap-6 py-4">
              <div>
                <Label>Description *</Label>
                <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Basic Salary" />
              </div>
              <div>
                <Label>Short Name *</Label>
                <Input
                  value={form.shortName}
                  disabled={isSystemHead}
                  onChange={(e) =>
                    setForm({ ...form, shortName: e.target.value.toUpperCase() })
                  }
                />

              </div>

              {/* Group Dropdown */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Group *</Label>
                  <Button size="sm" variant="ghost" onClick={() => setShowNewGroupInput(!showNewGroupInput)}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <Select
                  value={form.group}
                  disabled={form.isSystem === true}
                  onValueChange={(v) => setForm({ ...form, group: v })}
                >

                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {groups.map((group) => (
                      <SelectItem key={group} value={group}>
                        <div className="flex items-center justify-between w-full">
                          <span>{group}</span>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="ml-2"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteGroup(group);
                            }}
                          >
                            <Trash2 className="w-3 h-3 text-red-500" />
                          </Button>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {showNewGroupInput && (
                  <div className="flex gap-2 mt-2">
                    <Input
                      placeholder="New group"
                      value={newGroup}
                      onChange={(e) => setNewGroup(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && addGroup()}
                    />
                    <Button size="sm" onClick={addGroup}>Add</Button>
                  </div>
                )}
              </div>

              {/* Type Dropdown */}
              <div>
                <Label>Type *</Label>
                <Select
                  value={form.type}
                  disabled={isSystemHead}
                  onValueChange={(v: "Regular" | "Adhoc") => setForm({ ...form, type: v })}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Regular">Regular</SelectItem>
                    <SelectItem value="Adhoc">Adhoc</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Form 16 Field */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Form 16 Field *</Label>
                  <Button size="sm" variant="ghost" onClick={() => setShowNewFieldInput(!showNewFieldInput)}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <Select
                  value={form.form16Field}
                  disabled={isSystemHead}
                  onValueChange={(v) => setForm({ ...form, form16Field: v })}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {form16Fields.map((field) => (
                      <SelectItem key={field} value={field}>
                        <div className="flex items-center justify-between w-full">
                          <span>{field}</span>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="ml-2"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteForm16Field(field);
                            }}
                          >
                            <Trash2 className="w-3 h-3 text-red-500" />
                          </Button>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {showNewFieldInput && (
                  <div className="flex gap-2 mt-2">
                    <Input
                      placeholder="New Form 16 field"
                      value={newForm16Field}
                      onChange={(e) => setNewForm16Field(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && addForm16Field()}
                    />
                    <Button size="sm" onClick={addForm16Field}>Add</Button>
                  </div>
                )}
              </div>

              <div>
                <Label>Field Type</Label>
                <Select
                  value={form.fieldType}
                  disabled={isSystemHead}
                  onValueChange={(v: any) => setForm({ ...form, fieldType: v })}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Earnings">Earnings</SelectItem>
                    <SelectItem value="Deductions">Deductions</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-3 mt-2">
                <Label>Active</Label>
                <Switch
                  checked={form.active}
                  disabled={isSystemHead}
                  onCheckedChange={(v) =>
                    setForm({ ...form, active: v })
                  }
                />
              </div>


              <div>
                <Label>Amount Type</Label>
                <Select
                  value={form.amountType}
                  disabled={isSystemHead}
                  onValueChange={(v: any) => setForm({ ...form, amountType: v })}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Fixed">Fixed</SelectItem>
                    <SelectItem value="Percentage">Percentage</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {/* Amount / Percentage Value */}
              <div>
                <Label>
                  {form.amountType === "Fixed"
                    ? "Amount (Monthly)"
                    : "Percentage (%)"}
                </Label>

                <Input
                  type="number"
                  min={0}
                  disabled={isSystemHead}
                  value={form.value ?? ""}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      value: Number(e.target.value),
                    })
                  }
                  placeholder={
                    form.amountType === "Fixed"
                      ? "Enter amount"
                      : "Enter percentage"
                  }
                />

              </div>


              {form.amountType === "Percentage" && (
                <div>
                  <Label>% of</Label>
                  <Select
                    value={form.percentBase}
                    disabled={isSystemHead}
                    onValueChange={(v) => setForm({ ...form, percentBase: v })}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Amount">CTC (Amount)</SelectItem>
                      <SelectItem value="Gross">Gross Salary</SelectItem>
                      <SelectItem value="TakeHome">Take Home</SelectItem>
                      {salaryHeads
                        .filter(h => h.shortName !== form.shortName)
                        .map(h => (
                          <SelectItem key={h.id} value={h.shortName}>
                            {h.shortName} ({h.description})
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            <div className="border-t pt-6 mt-6">
              <Label className="text-lg font-semibold">Applicable For (Statutory Components)</Label>
              <div className="grid grid-cols-3 gap-6 mt-4">
                {Object.keys(form.applicable).map((key) => (
                  <div key={key} className="flex items-center space-x-3 bg-gray-50 p-3 rounded-lg">
                    <Checkbox
                      id={key}
                      disabled={isSystemHead}
                      checked={form.applicable[key as keyof typeof form.applicable]}
                      onCheckedChange={(v) =>
                        setForm({
                          ...form,
                          applicable: { ...form.applicable, [key]: v },
                        })
                      }
                    />
                    <Label htmlFor={key} className="text-sm font-medium cursor-pointer">
                      {key}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <DialogFooter className="mt-8">
              <Button onClick={handleSubmit} className="bg-green-600 hover:bg-green-700">
                {isEditing ? "Update" : "Save"}
              </Button>
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </GlobalLayout>
  );
}