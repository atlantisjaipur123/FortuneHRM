// app/core/timeoffice/shift-rotation/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Edit, Download } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { GlobalLayout } from "@/app/components/global-layout";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

interface WeekShift {
  week: number;
  shifts: string[];
}

interface ShiftRotationPolicy {
  id: string;
  name: string;
  type: "Fix" | "Rotational" | "Custom";
  applicableOn: string;
  status: "Active" | "Inactive";
  weeks: WeekShift[];
  advanceApplicability: string;
  differentShifts: boolean;
}

interface FormData {
  name: string;
  type: "Fix" | "Rotational" | "Custom";
  differentShifts: boolean;
  weeks: WeekShift[];
  advanceApplicability: string;
}

const shiftOptions = ["Morning", "Afternoon", "Night", "Off"];
const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function ShiftRotationModal({
  policy,
  onSave,
  onClose,
}: {
  policy?: ShiftRotationPolicy | null;
  onSave: (data: FormData) => void;
  onClose: () => void;
}) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormData>({
    name: policy?.name || "Rotational",
    type: policy?.type || "Rotational",
    differentShifts: policy?.differentShifts ?? false,
    weeks:
      policy?.weeks?.length === 5
        ? policy.weeks
        : Array.from({ length: 5 }, (_, i) => ({
            week: i + 1,
            shifts: Array(7).fill("Morning"),
          })),
    advanceApplicability: policy?.advanceApplicability || "None",
  });

  // Sync all weeks when differentShifts = false
  useEffect(() => {
    if (!form.differentShifts && form.weeks.length === 5) {
      const baseShifts = form.weeks[0].shifts;
      let needsUpdate = false;

      for (let i = 1; i < form.weeks.length; i++) {
        if (JSON.stringify(form.weeks[i].shifts) !== JSON.stringify(baseShifts)) {
          needsUpdate = true;
          break;
        }
      }

      if (needsUpdate) {
        setForm((prev) => ({
          ...prev,
          weeks: prev.weeks.map((w) => ({ ...w, shifts: [...baseShifts] })),
        }));
      }
    }
  }, [form.differentShifts]);

  const set = (key: keyof FormData, value: any) =>
    setForm((p) => ({ ...p, [key]: value }));

  const updateWeekShift = (week: number, dayIndex: number, value: string) => {
    setForm((prev) => {
      const newWeeks = prev.weeks.map((w) =>
        w.week === week
          ? {
              ...w,
              shifts: w.shifts.map((s, i) => (i === dayIndex ? value : s)),
            }
          : w
      );

      if (!prev.differentShifts) {
        const base = newWeeks.find((w) => w.week === 1)?.shifts || [];
        return {
          ...prev,
          weeks: newWeeks.map((w) => ({ ...w, shifts: [...base] })),
        };
      }

      return { ...prev, weeks: newWeeks };
    });
  };

  const next = () => {
    if (step === 1 && !form.name.trim()) return;
    if (step < 5) setStep((s) => s + 1);
  };
  const prev = () => step > 1 && setStep((s) => s - 1);

  const save = () => {
    onSave(form);
    onClose();
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {policy ? "Edit" : "Create"} Shift Rotation Policy
          </DialogTitle>
        </DialogHeader>

        {/* Step Indicators */}
        <div className="flex justify-center gap-2 py-4 border-b">
          {[1, 2, 3, 4, 5].map((n) => (
            <div
              key={n}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step >= n ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-600"
              }`}
            >
              {n}
            </div>
          ))}
        </div>

        <div className="space-y-6 py-4">
          {/* Step 1: Basic */}
          {step === 1 && (
            <>
              <h3 className="font-medium">1. Basic</h3>
              <div className="space-y-4">
                <div>
                  <Label>Rule name *</Label>
                  <Input
                    value={form.name}
                    onChange={(e) => set("name", e.target.value)}
                    placeholder="e.g., Monthly Rotational"
                  />
                </div>
                <div>
                  <Label>Assign last assigned shift</Label>
                  <RadioGroup
                    value={form.type}
                    onValueChange={(v) => set("type", v as any)}
                    className="flex gap-6 mt-2"
                  >
                    <div className="flex items-center">
                      <RadioGroupItem value="Fix" />
                      <Label className="ml-2">Fix</Label>
                    </div>
                    <div className="flex items-center">
                      <RadioGroupItem value="Rotational" />
                      <Label className="ml-2">Shift rotation</Label>
                    </div>
                    <div className="flex items-center">
                      <RadioGroupItem value="Custom" />
                      <Label className="ml-2">Custom</Label>
                    </div>
                  </RadioGroup>
                </div>
                <div>
                  <Label>Do you have different shifts for different weeks?</Label>
                  <RadioGroup
                    value={form.differentShifts ? "Yes" : "No"}
                    onValueChange={(v) => set("differentShifts", v === "Yes")}
                    className="flex gap-6 mt-2"
                  >
                    <div className="flex items-center">
                      <RadioGroupItem value="No" />
                      <Label className="ml-2">No</Label>
                    </div>
                    <div className="flex items-center">
                      <RadioGroupItem value="Yes" />
                      <Label className="ml-2">Yes</Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>
            </>
          )}

          {/* Step 2: Map Shift */}
          {step === 2 && (
            <>
              <h3 className="font-medium">2. Map Shift</h3>
              <p className="text-sm text-gray-600 mb-3">
                {form.differentShifts
                  ? "Set shifts for each week (5-week cycle)"
                  : "Set one shift pattern (applies to all weeks)"}
              </p>

              <div className="overflow-x-auto border rounded-md">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-gray-50 border-b">
                      <th className="px-3 py-2 text-left font-medium">Week</th>
                      {days.map((d) => (
                        <th key={d} className="px-2 py-2 text-left font-medium">{d}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {form.weeks.map((week) => (
                      <tr key={week.week} className="border-b hover:bg-gray-50">
                        <td className="px-3 py-2 font-medium">Week {week.week}</td>
                        {week.shifts.map((shift, i) => (
                          <td key={i} className="px-1 py-1">
                            <select
                              value={shift}
                              onChange={(e) => updateWeekShift(week.week, i, e.target.value)}
                              disabled={!form.differentShifts && week.week > 1}
                              className="w-full p-1 text-xs border rounded bg-white disabled:bg-gray-100"
                            >
                              {shiftOptions.map((opt) => (
                                <option key={opt} value={opt}>{opt}</option>
                              ))}
                            </select>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {form.differentShifts && (
                <p className="text-xs text-gray-500 mt-2">
                  Cycle: Week 1 to Week 2 to Week 3 to Week 4 to Week 5 to Week 1 (repeats)
                </p>
              )}
            </>
          )}

          {/* Step 3: Applicability */}
          {step === 3 && (
            <>
              <h3 className="font-medium">3. Applicability</h3>
              <p className="text-sm text-gray-600 mb-3">Select any one</p>
              <RadioGroup
                value={form.advanceApplicability === "None" ? "Company" : form.advanceApplicability}
                onValueChange={(v) => set("advanceApplicability", v)}
                className="space-y-2"
              >
                {["Company", "Business Unit", "Designation", "Grade", "Department", "Sub Department", "Level", "Employee"].map((opt) => (
                  <div key={opt} className="flex items-center">
                    <RadioGroupItem value={opt} />
                    <Label className="ml-2">{opt}</Label>
                  </div>
                ))}
              </RadioGroup>

              {form.advanceApplicability === "Department" && (
                <div className="mt-4 p-3 bg-gray-50 rounded-md">
                  <Label>Select Departments</Label>
                  <div className="grid grid-cols-3 gap-2 mt-2 text-sm">
                    {["Research", "Production", "Sales", "IT", "Finance", "HR", "Marketing", "Support", "Legal"].map((dept) => (
                      <label key={dept} className="flex items-center">
                        <Checkbox />
                        <span className="ml-2">{dept}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {/* Step 4: Advance Applicability */}
          {step === 4 && (
            <>
              <h3 className="font-medium">4. Advance Applicability (Optional)</h3>
              <p className="text-sm text-gray-600 mb-3">
                What would you like to set your advance applicability on?
              </p>
              <RadioGroup
                value={form.advanceApplicability}
                onValueChange={(v) => set("advanceApplicability", v)}
              >
                {["None", "Employment Type", "Employment Status", "Branch", "Sub Branch", "Region"].map((opt) => (
                  <div key={opt} className="flex items-center">
                    <RadioGroupItem value={opt} />
                    <Label className="ml-2">{opt}</Label>
                  </div>
                ))}
              </RadioGroup>
            </>
          )}

          {/* Step 5: Review */}
          {step === 5 && (
            <>
              <h3 className="font-medium">5. Review</h3>
              <div className="space-y-3 text-sm">
                <p><strong>Name:</strong> {form.name}</p>
                <p><strong>Type:</strong> {form.type}</p>
                <p><strong>Different Shifts:</strong> {form.differentShifts ? "Yes (5-week cycle)" : "No (same every week)"}</p>
                <p><strong>Advance Applicability:</strong> {form.advanceApplicability}</p>
                <div className="mt-4">
                  <strong>Shift Pattern:</strong>
                  <table className="mt-2 w-full text-xs border">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="border p-1">Week</th>
                        {days.map((d) => <th key={d} className="border p-1">{d}</th>)}
                      </tr>
                    </thead>
                    <tbody>
                      {form.weeks.map((w) => (
                        <tr key={w.week}>
                          <td className="border p-1 font-medium">Week {w.week}</td>
                          {w.shifts.map((s, i) => (
                            <td key={i} className="border p-1 text-center">{s}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="flex justify-between items-center pt-4 border-t">
          <Button variant="outline" onClick={prev} disabled={step === 1}>
            Previous
          </Button>
          <Button onClick={step === 5 ? save : next} className="bg-green-600 hover:bg-green-700">
            {step === 5 ? (policy ? "Update" : "Save") : "Next"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function ShiftRotationPage() {
  const [policies, setPolicies] = useState<ShiftRotationPolicy[]>([
    {
      id: "1",
      name: "Fix Monthly",
      type: "Fix",
      applicableOn: "Company",
      status: "Active",
      weeks: Array.from({ length: 5 }, (_, i) => ({
        week: i + 1,
        shifts: Array(7).fill("Morning"),
      })),
      advanceApplicability: "None",
      differentShifts: false,
    },
    {
      id: "2",
      name: "Rotational Monthly",
      type: "Rotational",
      applicableOn: "Department",
      status: "Active",
      weeks: Array.from({ length: 5 }, (_, i) => ({
        week: i + 1,
        shifts: Array(7).fill("Morning"),
      })),
      advanceApplicability: "None",
      differentShifts: true,
    },
  ]);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState<ShiftRotationPolicy | null>(null);

  const openCreate = () => {
    setEditingPolicy(null);
    setModalOpen(true);
  };

  const openEdit = (policy: ShiftRotationPolicy) => {
    setEditingPolicy(policy);
    setModalOpen(true);
  };

  const handleSave = (data: FormData) => {
    if (editingPolicy) {
      setPolicies((prev) =>
        prev.map((p) =>
          p.id === editingPolicy.id
            ? {
                ...p,
                ...data,
                applicableOn: data.advanceApplicability === "None" ? "Company" : data.advanceApplicability,
              }
            : p
        )
      );
    } else {
      const newPolicy: ShiftRotationPolicy = {
        id: Date.now().toString(),
        name: data.name,
        type: data.type,
        applicableOn: data.advanceApplicability === "None" ? "Company" : data.advanceApplicability,
        status: "Active",
        weeks: data.weeks,
        advanceApplicability: data.advanceApplicability,
        differentShifts: data.differentShifts,
      };
      setPolicies((prev) => [...prev, newPolicy]);
    }
    setModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm("Delete this shift rotation policy?")) {
      setPolicies((prev) => prev.filter((p) => p.id !== id));
    }
  };

  const exportPolicy = (policy: ShiftRotationPolicy) => {
    const rows = [
      { Name: policy.name, Type: policy.type, "Applicable On": policy.applicableOn, Status: policy.status },
      {},
      ...policy.weeks.flatMap((w) => [
        {
          Week: w.week,
          Mon: w.shifts[0],
          Tue: w.shifts[1],
          Wed: w.shifts[2],
          Thu: w.shifts[3],
          Fri: w.shifts[4],
          Sat: w.shifts[5],
          Sun: w.shifts[6],
        },
      ]),
    ];

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Shift Rotation");
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    saveAs(new Blob([excelBuffer]), `${policy.name.replace(/ /g, "_")}.xlsx`);
  };

  return (
    <GlobalLayout>
      <div className="min-h-screen bg-gradient-to-br from-gray-100 via-gray-200 to-gray-300 p-6">
        <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-teal-500 mb-8">
          Shift Rotation
        </h1>

        <Card className="bg-white border border-gray-300 rounded-lg shadow-sm">
          <CardHeader className="bg-blue-50 p-4 rounded-t-lg flex justify-between items-center">
            <CardTitle className="text-lg font-semibold text-gray-900">
              Shift Rotation Policies
            </CardTitle>
            <Button onClick={openCreate} className="bg-green-600 text-white hover:bg-green-700">
              <Plus className="h-4 w-4 mr-2" /> NEW POLICY
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead>NAME</TableHead>
                  <TableHead>TYPE</TableHead>
                  <TableHead>APPLICABLE ON</TableHead>
                  <TableHead>STATUS</TableHead>
                  <TableHead>ACTION</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {policies.map((policy) => (
                  <TableRow key={policy.id} className="hover:bg-gray-50">
                    <TableCell className="font-medium">{policy.name}</TableCell>
                    <TableCell>{policy.type}</TableCell>
                    <TableCell>{policy.applicableOn}</TableCell>
                    <TableCell>
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                        {policy.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" onClick={() => openEdit(policy)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => exportPolicy(policy)}>
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(policy.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {policies.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-gray-500 py-8">
                      No shift rotation policies found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {modalOpen && (
          <ShiftRotationModal
            policy={editingPolicy}
            onSave={handleSave}
            onClose={() => setModalOpen(false)}
          />
        )}
      </div>
    </GlobalLayout>
  );
}