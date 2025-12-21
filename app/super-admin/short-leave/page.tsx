// app/core/timeoffice/short-leave/page.tsx
"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Edit } from "lucide-react";
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
import { GlobalLayout } from "@/app/components/global-layout";

interface ShortLeavePolicy {
  id: string;
  name: string;
  applicableOn: string;
  status: "Active" | "Inactive";
  totalHours: number;
  totalMinutes: number;
  minHours: number;
  minMinutes: number;
  maxHours: number;
  maxMinutes: number;
  deductBalance: boolean;
  allowBackdated: boolean;
  advanceApplicability: string;
}

interface FormData {
  name: string;
  totalHours: number;
  totalMinutes: number;
  minHours: number;
  minMinutes: number;
  maxHours: number;
  maxMinutes: number;
  deductBalance: boolean;
  allowBackdated: boolean;
  advanceApplicability: string;
}

function ShortLeaveModal({
  policy,
  onSave,
  onClose,
}: {
  policy?: ShortLeavePolicy | null;
  onSave: (data: FormData) => void;
  onClose: () => void;
}) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormData>({
    name: policy?.name || "Short Leave",
    totalHours: policy?.totalHours || 2,
    totalMinutes: policy?.totalMinutes || 0,
    minHours: policy?.minHours || 1,
    minMinutes: policy?.minMinutes || 0,
    maxHours: policy?.maxHours || 1,
    maxMinutes: policy?.maxMinutes || 0,
    deductBalance: policy?.deductBalance ?? true,
    allowBackdated: policy?.allowBackdated ?? true,
    advanceApplicability: policy?.advanceApplicability || "None",
  });

  const set = (key: keyof FormData, value: any) =>
    setForm((p) => ({ ...p, [key]: value }));

  const next = () => {
    if (step === 1 && !form.name) return;
    if (step < 4) setStep((s) => s + 1);
  };
  const prev = () => step > 1 && setStep((s) => s - 1);

  const save = () => {
    onSave(form);
    onClose();
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {policy ? "Edit" : "Create"} Short Leave Policy
          </DialogTitle>
        </DialogHeader>

        {/* Step Indicators */}
        <div className="flex justify-center gap-2 py-4 border-b">
          {[1, 2, 3, 4].map((n) => (
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
          {/* Step 1 */}
          {step === 1 && (
            <>
              <h3 className="font-medium">1. Add Leave Types</h3>
              <div className="space-y-4">
                <div>
                  <Label>Policy Name *</Label>
                  <Input
                    value={form.name}
                    onChange={(e) => set("name", e.target.value)}
                    placeholder="Enter policy name"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Total Hours *</Label>
                    <Input
                      type="number"
                      min={0}
                      value={form.totalHours}
                      onChange={(e) => set("totalHours", +e.target.value || 0)}
                    />
                  </div>
                  <div>
                    <Label>Minutes</Label>
                    <Input
                      type="number"
                      min={0}
                      max={59}
                      value={form.totalMinutes}
                      onChange={(e) => set("totalMinutes", +e.target.value || 0)}
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Step 2 */}
          {step === 2 && (
            <>
              <h3 className="font-medium">2. Applicability</h3>
              <p className="text-sm text-gray-600">Short leave is applicable on</p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Days *</Label>
                  <Input type="number" value={2} readOnly className="bg-gray-100" />
                </div>
                <div>
                  <Label>Duration</Label>
                  <div className="flex gap-2">
                    <span className="px-3 py-2 bg-gray-100 rounded-md text-sm">
                      {form.totalHours}h
                    </span>
                    <span className="px-3 py-2 bg-gray-100 rounded-md text-sm">
                      {form.totalMinutes}m
                    </span>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Step 3 */}
          {step === 3 && (
            <>
              <h3 className="font-medium">3. Advance Applicability (Optional)</h3>
              <p className="text-sm text-gray-600 mb-3">Set advance applicability on</p>
              <div className="space-y-2">
                {[
                  "None",
                  "Employment Type",
                  "Employment Status",
                  "Branch",
                  "Sub Branch",
                  "Region",
                ].map((opt) => (
                  <label key={opt} className="flex items-center">
                    <input
                      type="radio"
                      name="advance"
                      checked={form.advanceApplicability === opt}
                      onChange={() => set("advanceApplicability", opt)}
                      className="mr-2"
                    />
                    <span className="text-sm">{opt}</span>
                  </label>
                ))}
              </div>

              <div className="grid grid-cols-4 gap-3 mt-5">
                {["Minimum", "Maximum"].map((lbl, i) => (
                  <div key={lbl}>
                    <Label>{lbl} Hours *</Label>
                    <Input
                      type="number"
                      min={0}
                      value={i === 0 ? form.minHours : form.maxHours}
                      onChange={(e) =>
                        set(i === 0 ? "minHours" : "maxHours", +e.target.value || 0)
                      }
                    />
                  </div>
                ))}
                {["Minutes *", "Minutes *"].map((lbl, i) => (
                  <div key={lbl}>
                    <Label>{lbl}</Label>
                    <Input
                      type="number"
                      min={0}
                      max={59}
                      value={i === 0 ? form.minMinutes : form.maxMinutes}
                      onChange={(e) =>
                        set(i === 0 ? "minMinutes" : "maxMinutes", +e.target.value || 0)
                      }
                    />
                  </div>
                ))}
              </div>

              <div className="mt-5 space-y-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={form.deductBalance}
                    onChange={(e) => set("deductBalance", e.target.checked)}
                    className="mr-2"
                  />
                  <span className="text-sm">Deduct from leave balance when applied</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={form.allowBackdated}
                    onChange={(e) => set("allowBackdated", e.target.checked)}
                    className="mr-2"
                  />
                  <span className="text-sm">Allow backdated short leave</span>
                </label>
              </div>
            </>
          )}

          {/* Step 4 */}
          {step === 4 && (
            <>
              <h3 className="font-medium">4. Review</h3>
              <div className="space-y-2 text-sm">
                <p><strong>Name:</strong> {form.name}</p>
                <p><strong>Total:</strong> {form.totalHours}h {form.totalMinutes}m</p>
                <p><strong>Min:</strong> {form.minHours}h {form.minMinutes}m</p>
                <p><strong>Max:</strong> {form.maxHours}h {form.maxMinutes}m</p>
                <p><strong>Advance:</strong> {form.advanceApplicability}</p>
                <p><strong>Deduct:</strong> {form.deductBalance ? "Yes" : "No"}</p>
                <p><strong>Backdated:</strong> {form.allowBackdated ? "Yes" : "No"}</p>
              </div>
            </>
          )}
        </div>

        <div className="flex justify-between items-center pt-4 border-t">
          <Button
            variant="outline"
            onClick={prev}
            disabled={step === 1}
          >
            Previous
          </Button>
          <Button
            onClick={step === 4 ? save : next}
            className="bg-green-600 hover:bg-green-700"
          >
            {step === 4 ? (policy ? "Update" : "Save") : "Next"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function ShortLeavePage() {
  const [policies, setPolicies] = useState<ShortLeavePolicy[]>([
    {
      id: "1",
      name: "Short Leave",
      applicableOn: "Company",
      status: "Active",
      totalHours: 2,
      totalMinutes: 0,
      minHours: 1,
      minMinutes: 0,
      maxHours: 1,
      maxMinutes: 0,
      deductBalance: true,
      allowBackdated: true,
      advanceApplicability: "None",
    },
  ]);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState<ShortLeavePolicy | null>(null);

  const openCreate = () => {
    setEditingPolicy(null);
    setModalOpen(true);
  };

  const openEdit = (policy: ShortLeavePolicy) => {
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
      const newPolicy: ShortLeavePolicy = {
        id: Date.now().toString(),
        name: data.name,
        applicableOn: data.advanceApplicability === "None" ? "Company" : data.advanceApplicability,
        status: "Active",
        ...data,
      };
      setPolicies((prev) => [...prev, newPolicy]);
    }
    setModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this policy?")) {
      setPolicies((prev) => prev.filter((p) => p.id !== id));
    }
  };

  return (
    <GlobalLayout>
      <div className="min-h-screen bg-gradient-to-br from-gray-100 via-gray-200 to-gray-300 p-6">
        <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-teal-500 mb-8">
          Short Leave Policy
        </h1>

        <Card className="bg-white border border-gray-300 rounded-lg shadow-sm">
          <CardHeader className="bg-blue-50 p-4 rounded-t-lg flex justify-between items-center">
            <CardTitle className="text-lg font-semibold text-gray-900">
              Short Leave Policies
            </CardTitle>
            <Button
              onClick={openCreate}
              className="bg-green-600 text-white hover:bg-green-700"
            >
              <Plus className="h-4 w-4 mr-2" /> CREATE SHORT LEAVE POLICY
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="text-gray-700">NAME</TableHead>
                  <TableHead className="text-gray-700">APPLICABLE ON</TableHead>
                  <TableHead className="text-gray-700">STATUS</TableHead>
                  <TableHead className="text-gray-700">ACTION</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {policies.map((policy) => (
                  <TableRow key={policy.id} className="hover:bg-gray-50">
                    <TableCell className="font-medium">{policy.name}</TableCell>
                    <TableCell>{policy.applicableOn}</TableCell>
                    <TableCell>
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                        {policy.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEdit(policy)}
                          className="text-indigo-600 hover:text-indigo-800"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(policy.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {policies.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-gray-500 py-8">
                      No short leave policies found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {modalOpen && (
          <ShortLeaveModal
            policy={editingPolicy}
            onSave={handleSave}
            onClose={() => setModalOpen(false)}
          />
        )}
      </div>
    </GlobalLayout>
  );
}