"use client";

import { useState, useEffect, useMemo } from "react";
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
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "react-beautiful-dnd";
import { GlobalLayout } from "@/app/components/global-layout"; // Fixed: Default import
import { GripVertical, Plus, Trash2, Edit, Calculator } from "lucide-react";

interface SalaryHead {
  sno: number;
  id: number;
  description: string;
  shortName: string;
  form16Field: string;
  group: string;
  type: "Regular" | "Adhoc";
  fieldType: "Earnings" | "Deductions";
  active: boolean;
  amountType: "Fixed" | "Percentage";
  percentBase: "Amount" | "Gross" | "TakeHome" | string;
  value: number;
  frequency: "Monthly" | "Annually";
  applicable: {
    ESI: boolean;
    Bonus: boolean;
    PT: boolean;
    LWF: boolean;
    Gratuity: boolean;
    LeaveEncashment: boolean;
    PF: boolean;
  };
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
  sno: 0,
  id: 0,
  description: "",
  shortName: "",
  form16Field: "Salary u/s 17(1)",
  group: "Standard",
  type: "Regular",
  fieldType: "Earnings",
  active: true,
  amountType: "Percentage",
  percentBase: "Amount",
  value: 0,
  frequency: "Monthly",
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

  const [inputAmount, setInputAmount] = useState(100000);
  const [baseType, setBaseType] = useState<"Amount" | "Gross" | "TakeHome">("Amount");
  const [frequency, setFrequency] = useState<"Monthly" | "Annually">("Monthly");

  // Load from localStorage
  useEffect(() => {
    const savedHeads = localStorage.getItem("salaryHeadsV3");
    const savedFields = localStorage.getItem("form16Fields");
    const savedGroups = localStorage.getItem("salaryGroups");

    if (savedHeads) {
      setSalaryHeads(JSON.parse(savedHeads));
    } else {
      const defaults: SalaryHead[] = [
        {
          sno: 1,
          id: 1,
          description: "BASIC SALARY",
          shortName: "BASIC",
          form16Field: "Salary u/s 17(1)",
          group: "Standard",
          type: "Regular",
          fieldType: "Earnings",
          active: true,
          amountType: "Percentage",
          percentBase: "Amount",
          value: 40,
          frequency: "Monthly",
          applicable: { ESI: true, Bonus: true, PT: true, LWF: true, Gratuity: true, LeaveEncashment: true, PF: true },
        },
        {
          sno: 2,
          id: 2,
          description: "DEARNESS ALLOWANCE",
          shortName: "DA",
          form16Field: "Salary u/s 17(1)",
          group: "Standard",
          type: "Regular",
          fieldType: "Earnings",
          active: true,
          amountType: "Percentage",
          percentBase: "BASIC",
          value: 50,
          frequency: "Monthly",
          applicable: { ESI: true, Bonus: true, PT: true, LWF: true, Gratuity: false, LeaveEncashment: true, PF: true },
        },
        {
          sno: 3,
          id: 3,
          description: "HOUSE RENT ALLOWANCE",
          shortName: "HRA",
          form16Field: "Salary u/s 17(1)",
          group: "Allowances",
          type: "Regular",
          fieldType: "Earnings",
          active: true,
          amountType: "Percentage",
          percentBase: "BASIC",
          value: 50,
          frequency: "Monthly",
          applicable: { ESI: false, Bonus: false, PT: false, LWF: false, Gratuity: false, LeaveEncashment: false, PF: false },
        },
        {
          sno: 4,
          id: 4,
          description: "ADDITIONAL HEAD",
          shortName: "ADD",
          form16Field: "Salary u/s 17(1)",
          group: "Standard",
          type: "Adhoc",
          fieldType: "Earnings",
          active: true,
          amountType: "Percentage",
          percentBase: "Amount",
          value: 10,
          frequency: "Monthly",
          applicable: { ESI: false, Bonus: false, PT: false, LWF: false, Gratuity: false, LeaveEncashment: false, PF: false },
        },
      ];
      setSalaryHeads(defaults);
      localStorage.setItem("salaryHeadsV3", JSON.stringify(defaults));
    }

    if (savedFields) setForm16Fields(JSON.parse(savedFields));
    if (savedGroups) setGroups(JSON.parse(savedGroups));
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (salaryHeads.length > 0) {
      localStorage.setItem("salaryHeadsV3", JSON.stringify(salaryHeads));
    }
    localStorage.setItem("form16Fields", JSON.stringify(form16Fields));
    localStorage.setItem("salaryGroups", JSON.stringify(groups));
  }, [salaryHeads, form16Fields, groups]);

  // Calculation Engine
  const { calculatedValues, grossSalary, takeHome, additionalAmount } = useMemo(() => {
    const values: Record<string, number> = { Amount: inputAmount };
    const visited = new Set<string>();

    const calc = (shortName: string): number => {
      if (values[shortName] !== undefined) return values[shortName];
      if (visited.has(shortName)) return 0;
      visited.add(shortName);

      const head = salaryHeads.find(h => h.shortName === shortName && h.active);
      if (!head) return 0;

      let baseValue = 0;
      if (head.percentBase === "Amount") baseValue = inputAmount;
      else if (head.percentBase === "Gross") baseValue = grossSalary || 0;
      else if (head.percentBase === "TakeHome") baseValue = takeHome || 0;
      else baseValue = calc(head.percentBase) || 0;

      let result = head.amountType === "Fixed" ? head.value : (baseValue * head.value) / 100;
      if (head.frequency === "Annually") result /= 12;

      values[shortName] = result;
      return result;
    };

    salaryHeads.filter(h => h.active).forEach(h => calc(h.shortName));

    const grossSalary = salaryHeads
      .filter(h => h.active && h.fieldType === "Earnings")
      .reduce((sum, h) => sum + (values[h.shortName] || 0), 0);

    const totalDeductions = salaryHeads
      .filter(h => h.active && h.fieldType === "Deductions")
      .reduce((sum, h) => sum + (values[h.shortName] || 0), 0);

    const takeHome = grossSalary - totalDeductions;

    values["Gross"] = grossSalary;
    values["TakeHome"] = takeHome;

    salaryHeads.filter(h => h.active && (h.percentBase === "Gross" || h.percentBase === "TakeHome")).forEach(h => calc(h.shortName));

    let target = baseType === "Gross" ? grossSalary : baseType === "TakeHome" ? takeHome : inputAmount;
    const totalActiveEarnings = salaryHeads
      .filter(h => h.active && h.fieldType === "Earnings" && h.shortName !== "ADD")
      .reduce((sum, h) => sum + (values[h.shortName] || 0), 0);

    const additionalAmount = Math.max(0, target - totalActiveEarnings);

    const addHead = salaryHeads.find(h => h.shortName === "ADD");
    if (addHead && addHead.active) {
      values["ADD"] = additionalAmount;
    }

    return { calculatedValues: values, grossSalary, takeHome, additionalAmount };
  }, [salaryHeads, inputAmount, baseType]);

  const handleOpenDialog = (head?: SalaryHead) => {
    if (head) {
      setForm(head);
      setIsEditing(true);
    } else {
      setForm({
        ...defaultForm,
        sno: Math.max(...salaryHeads.map(h => h.sno), 0) + 1,
        frequency,
      });
      setIsEditing(false);
    }
    setOpen(true);
  };

  const handleSubmit = () => {
    if (!form.description || !form.shortName || form.value === undefined || !form.group || !form.type) {
      alert("Fill all required fields");
      return;
    }

    if (isEditing && form.id) {
      setSalaryHeads(prev => prev.map(h => h.id === form.id ? form : h));
    } else {
      setSalaryHeads(prev => [...prev, { ...form, id: Date.now() }]);
    }

    setOpen(false);
    setForm(defaultForm);
  };

  const handleDelete = (id: number) => {
    if (confirm("Delete permanently?")) {
      setSalaryHeads(prev => prev.filter(h => h.id !== id));
    }
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const items = Array.from(salaryHeads);
    const [moved] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, moved);
    setSalaryHeads(items);
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
            {/* Input Controls */}
            <div className="grid grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
              <div>
                <Label>Base Type</Label>
                <Select value={baseType} onValueChange={(v: any) => setBaseType(v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Amount">CTC</SelectItem>
                    <SelectItem value="Gross">Gross Salary</SelectItem>
                    <SelectItem value="TakeHome">Take Home (In Hand)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Amount ({frequency})</Label>
                <Input
                  type="number"
                  value={inputAmount}
                  onChange={(e) => setInputAmount(parseFloat(e.target.value) || 0)}
                />
              </div>
              <div>
                <Label>Frequency</Label>
                <Select value={frequency} onValueChange={(v: any) => setFrequency(v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Monthly">Monthly</SelectItem>
                    <SelectItem value="Annually">Annually</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button onClick={() => setInputAmount(prev => prev + 0)} className="w-full">
                  <Calculator className="w-4 h-4 mr-2" /> Calculate
                </Button>
              </div>
            </div>

            {/* Summary */}
            <div className="grid grid-cols-4 gap-4 text-center">
              <div className="bg-blue-100 p-4 rounded">
                <p className="text-sm text-gray-600">CTC</p>
                <p className="text-2xl font-bold">₹{inputAmount.toLocaleString()}</p>
              </div>
              <div className="bg-green-100 p-4 rounded">
                <p className="text-sm text-gray-600">Gross Salary</p>
                <p className="text-2xl font-bold">₹{grossSalary.toLocaleString()}</p>
              </div>
              <div className="bg-purple-100 p-4 rounded">
                <p className="text-sm text-gray-600">Take Home</p>
                <p className="text-2xl font-bold">₹{takeHome.toLocaleString()}</p>
              </div>
              <div className="bg-yellow-100 p-4 rounded">
                <p className="text-sm text-gray-600">Additional Head</p>
                <p className="text-2xl font-bold text-green-600">₹{additionalAmount.toLocaleString()}</p>
              </div>
            </div>

            <Button onClick={() => handleOpenDialog()}>
              <Plus className="w-4 h-4 mr-2" /> Add Salary Head
            </Button>

            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="heads">
                {(provided) => (
                  <div {...provided.droppableProps} ref={provided.innerRef} className="rounded-lg border overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-10"></TableHead>
                          <TableHead>S.No</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead>Short</TableHead>
                          <TableHead>Group</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Field Type</TableHead>
                          <TableHead>Calc</TableHead>
                          <TableHead>Value</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Freq</TableHead>
                          <TableHead>Active</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {salaryHeads.map((head, index) => (
                          <Draggable key={head.id} draggableId={head.id.toString()} index={index}>
                            {(provided, snapshot) => (
                              <TableRow
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                className={`${snapshot.isDragging ? "bg-blue-50" : ""} ${!head.active ? "opacity-50" : ""} ${head.shortName === "ADD" ? "bg-green-50 font-medium" : ""}`}
                              >
                                <TableCell>
                                  <div {...provided.dragHandleProps} className="cursor-grab">
                                    <GripVertical className="w-5 h-5 text-gray-400" />
                                  </div>
                                </TableCell>
                                <TableCell className="font-bold">{head.sno}</TableCell>
                                <TableCell>{head.description}</TableCell>
                                <TableCell>{head.shortName}</TableCell>
                                <TableCell>{head.group}</TableCell>
                                <TableCell>
                                  <span className={`px-2 py-1 rounded text-xs font-medium ${head.type === "Regular" ? "bg-blue-100 text-blue-800" : "bg-orange-100 text-orange-800"}`}>
                                    {head.type}
                                  </span>
                                </TableCell>
                                <TableCell>{head.fieldType}</TableCell>
                                <TableCell>
                                  {head.amountType === "Fixed" ? "Fixed" : `${head.value}% of ${head.percentBase}`}
                                </TableCell>
                                <TableCell>₹{head.value.toLocaleString()}</TableCell>
                                <TableCell className="font-semibold text-green-600">
                                  ₹{(calculatedValues[head.shortName] || 0).toLocaleString()}
                                  {head.shortName === "ADD" && " (Auto)"}
                                </TableCell>
                                <TableCell>{head.frequency}</TableCell>
                                <TableCell>
                                  <Switch
                                    checked={head.active}
                                    onCheckedChange={(v) => setSalaryHeads(prev => prev.map(h => h.id === head.id ? { ...h, active: v } : h))}
                                  />
                                </TableCell>
                                <TableCell>
                                  <div className="flex gap-2">
                                    <Button size="sm" variant="ghost" onClick={() => handleOpenDialog(head)}>
                                      <Edit className="w-4 h-4" />
                                    </Button>
                                    <Button size="sm" variant="ghost" onClick={() => handleDelete(head.id)}>
                                      <Trash2 className="w-4 h-4 text-red-600" />
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          </CardContent>
        </Card>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{isEditing ? "Edit" : "Add"} Salary Head</DialogTitle>
            </DialogHeader>

            <div className="grid grid-cols-2 gap-6 py-4">
              <div>
                <Label>Description *</Label>
                <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Basic Salary" />
              </div>
              <div>
                <Label>Short Name *</Label>
                <Input value={form.shortName} onChange={(e) => setForm({ ...form, shortName: e.target.value.toUpperCase() })} placeholder="BASIC" />
              </div>

              {/* Group Dropdown */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Group *</Label>
                  <Button size="sm" variant="ghost" onClick={() => setShowNewGroupInput(!showNewGroupInput)}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <Select value={form.group} onValueChange={(v) => setForm({ ...form, group: v })}>
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
                <Select value={form.type} onValueChange={(v: "Regular" | "Adhoc") => setForm({ ...form, type: v })}>
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
                <Select value={form.form16Field} onValueChange={(v) => setForm({ ...form, form16Field: v })}>
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
                <Select value={form.fieldType} onValueChange={(v: any) => setForm({ ...form, fieldType: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Earnings">Earnings</SelectItem>
                    <SelectItem value="Deductions">Deductions</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Amount Type</Label>
                <Select value={form.amountType} onValueChange={(v: any) => setForm({ ...form, amountType: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Fixed">Fixed</SelectItem>
                    <SelectItem value="Percentage">Percentage</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {form.amountType === "Percentage" && (
                <div>
                  <Label>% of</Label>
                  <Select value={form.percentBase} onValueChange={(v) => setForm({ ...form, percentBase: v })}>
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

              <div>
                <Label>Value *</Label>
                <Input
                  type="number"
                  value={form.value}
                  onChange={(e) => setForm({ ...form, value: parseFloat(e.target.value) || 0 })}
                />
              </div>

              <div>
                <Label>Frequency</Label>
                <Select value={form.frequency} onValueChange={(v: any) => setForm({ ...form, frequency: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Monthly">Monthly</SelectItem>
                    <SelectItem value="Annually">Annually</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="border-t pt-6 mt-6">
              <Label className="text-lg font-semibold">Applicable For (Statutory Components)</Label>
              <div className="grid grid-cols-3 gap-6 mt-4">
                {Object.keys(form.applicable).map((key) => (
                  <div key={key} className="flex items-center space-x-3 bg-gray-50 p-3 rounded-lg">
                    <Checkbox
                      id={key}
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