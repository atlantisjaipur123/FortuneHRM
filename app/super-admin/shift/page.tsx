"use client"

import React, { useState, useEffect, useRef } from "react"
import Chart from "chart.js/auto"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { GlobalLayout } from "@/app/components/global-layout"
import { api, API } from "@/app/lib/api"
const enforceRange = (
  e: React.KeyboardEvent<HTMLInputElement>,
  min: number,
  max: number
) => {
  const input = e.currentTarget;
  const currentValue = input.value || "0";

  // Allow control keys
  if (["Backspace", "Delete", "ArrowLeft", "ArrowRight", "Tab", "Enter"].includes(e.key)) {
    return;
  }

  // Block minus key completely (no negatives)
  if (e.key === "-" || e.key === "Minus") {
    e.preventDefault();
    return;
  }

  // If it's a digit
  if (/[0-9]/.test(e.key)) {
    const selectionStart = input.selectionStart || 0;
    const selectionEnd = input.selectionEnd || 0;
    const newValue = currentValue.slice(0, selectionStart) + e.key + currentValue.slice(selectionEnd);

    const numValue = Number(newValue);

    // Block if new value is out of range
    if (numValue < min || numValue > max) {
      e.preventDefault();
    }
  }
};

const timeToMinutes = (time: string) => {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
};

const addMinutesToTime = (time: string, minutesToAdd: number) => {
  const total = timeToMinutes(time) + minutesToAdd;
  const h = Math.floor((total % (24 * 60)) / 60);
  const m = total % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
};





// Chart.js integration for Review preview
const ReviewChart = ({
  workingMinutes,
  checkInMinutes,
  checkOutMinutes,
}: {
  workingMinutes: number;
  checkInMinutes: number;
  checkOutMinutes: number;
}) => {
  const chartRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstanceRef = useRef<any>(null);


  useEffect(() => {
    const canvas = chartRef.current;
    if (!canvas) return;
  
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
  
    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
      chartInstanceRef.current = null;
    }
  
    // ✅ MOVE CALCULATIONS OUTSIDE OBJECT
    const shift = Math.max(workingMinutes, 1);
    const checkIn = Math.min(checkInMinutes, shift * 0.25);
    const checkOut = Math.min(checkOutMinutes, shift * 0.25);
  
    chartInstanceRef.current = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: [
          "Working Duration",
          "Check-in Grace Window",
          "Early Check-out Window",
        ],
        datasets: [
          {
            data: [shift, checkIn, checkOut],
            backgroundColor: ["#a855f7", "#06b6d4", "#fbbf24"],
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: "bottom" },
        },
      },
    });
  
    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
        chartInstanceRef.current = null;
      }
    };
  }, [workingMinutes, checkInMinutes, checkOutMinutes]);
  return <canvas ref={chartRef} className="p-4 bg-gray-50 rounded-lg w-full" />;
};

  
  

export default function ShiftPage() {
  const [shifts, setShifts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);


  const [selectedShift, setSelectedShift] = useState<any>(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<any>({
    code: "", color: "#28a745", name: "", startTime: "09:00", endTime: "17:30", breakTime: "00:30", totalHours: "8",
    firstHalfHours: "4", firstHalfMinutes: "0", secondHalfHours: "4", secondHalfMinutes: "15",
    checkInGrace: "30", lateGrace: "10", earlyGrace: "10",
    halfDayHours: "4", halfDayMinutes: "0", fullDayHours: "8", fullDayMinutes: "0",
    noAttendanceHours: "2", noAttendanceMinutes: "0", noAttendanceCheckOutHours: "1", noAttendanceCheckOutMinutes: "0",
    shiftAllowance: true, restrictManagerBackdate: false, restrictHRBackdate: false, restrictManagerFuture: true,
    defineWeeklyOff: true, weeklyOffPattern: [{ week: 1, day: "Sun", type: "Full day", time: "" }],
    errors: {},
  });

  const reservedCodes = ["P", "A", "VO", "FL", "SW"];
  const fetchShifts = async () => {
    setLoading(true);
    try {
      const data = await api.get("/api/shift");
      setShifts(data.shifts || []);
    } catch (err) {
      console.error("Fetch shifts failed:", err);
      setShifts([]);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchShifts();
  }, []);
  
  

  useEffect(() => {
    if (!selectedShift) return;
  
    const breakMinutes = selectedShift.breakDuration ?? 0;
    const bh = Math.floor(breakMinutes / 60);
    const bm = breakMinutes % 60;
  
    setFormData({
      ...selectedShift,
  
      // UI-derived fields
      breakTime: `${String(bh).padStart(2, "0")}:${String(bm).padStart(2, "0")}`,
  
      checkInGrace: String(selectedShift.checkInAllowedFrom ?? 0),
      earlyGrace: String(selectedShift.checkOutAllowedFrom ?? 0),
  
      startTime: selectedShift.startTime ?? "00:00",
      endTime: selectedShift.endTime ?? "00:00",

      defineWeeklyOff: selectedShift.defineWeeklyOff ?? true,
      weeklyOffPattern: Array.isArray(selectedShift.weeklyOffPattern)
      ? selectedShift.weeklyOffPattern
      : [{ week: 1, day: "Sun", type: "Full day", time: "" }],

  
      errors: {},
    });
  }, [selectedShift]);
  

  // Auto-calculate total hours based on start, end, and break times
  useEffect(() => {
    const firstHalf =
      Number(formData.firstHalfHours) * 60 +
      Number(formData.firstHalfMinutes);
  
    const secondHalf =
      Number(formData.secondHalfHours) * 60 +
      Number(formData.secondHalfMinutes);
  
    const [bh, bm] = formData.breakTime.split(":").map(Number);
    const breakMinutes = bh * 60 + bm;
  
    const totalWorkMinutes = firstHalf + secondHalf;
    const totalShiftMinutes = totalWorkMinutes + breakMinutes;
  
    const calculatedEndTime = addMinutesToTime(
      formData.startTime,
      totalShiftMinutes
    );
  
    setFormData((prev: any) => ({
      ...prev,
      endTime: calculatedEndTime,
      totalHours: (totalWorkMinutes / 60).toFixed(2),
    }));
  }, [
    formData.startTime,
    formData.firstHalfHours,
    formData.firstHalfMinutes,
    formData.secondHalfHours,
    formData.secondHalfMinutes,
    formData.breakTime,
  ]);
  
  
  

  const validateForm = () => {
    const errors: any = {};
    if (!formData.code) errors.code = "Shift code is required";
    if (reservedCodes.includes(formData.code)) errors.code = "Please don't use reserved codes P,A,WO,FL,SW.";
    if (!formData.name) errors.name = "Shift name is required";
    return errors;
  };
  const mapFormToApiPayload = () => {
    const [bh, bm] = formData.breakTime.split(":").map(Number);
  
    return {
      name: formData.name,
      code: formData.code || null,
      startTime: formData.startTime,
      endTime: formData.endTime,
      breakDuration: bh * 60 + bm,
      workingHours: Number(formData.totalHours),
      checkInAllowedFrom: Number(formData.checkInGrace),
      checkOutAllowedFrom: Number(formData.earlyGrace),

      shiftAllowance: formData.shiftAllowance,
      weeklyOffPattern: formData.defineWeeklyOff
        ? formData.weeklyOffPattern
        : [],
      restrictManagerBackdate: formData.restrictManagerBackdate,
      restrictHRBackdate: formData.restrictHRBackdate,
      restrictManagerFuture: formData.restrictManagerFuture,

    
      isActive: true,
    };
  };
  


  const handleSave = async () => {
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormData({ ...formData, errors });
      return;
    }
  
    setLoading(true);
  
    try {
      const payload = selectedShift
        ? { id: selectedShift.id, ...mapFormToApiPayload() }
        : mapFormToApiPayload();

      if (selectedShift) {
        await api.patch("/api/shift", payload);
      } else {
        await api.post("/api/shift", payload);
      }
    
      // ✅ SUCCESS PATH
      setIsPopupOpen(false);
      setSelectedShift(null);
      setStep(1);
      await fetchShifts();
    
    } catch (err: any) {
      console.error("Save shift failed:", err);
      alert(err.message || "Failed to save shift");
    } finally {
      setLoading(false);
    }
    
  };
  const handleAddShift = () => {
    setSelectedShift(null);
  
    setFormData({
      code: "",
      name: "",
      color: "#28a745",
  
      startTime: "00:00",
      endTime: "00:00",
      breakTime: "00:00",
  
      checkInGrace: "0",
      earlyGrace: "0",
  
      totalHours: "0",
  
      weeklyOffPattern: [{ week: 1, day: "Sun", type: "Full day", time: "" }],
  
      errors: {},
    });
  
    setStep(1);
    setIsPopupOpen(true);
  };
  
  

  const updateWeeklyPattern = (index: number, field: string, value: any) => {
    const newPattern = formData.weeklyOffPattern.map((p: any, i: number) =>
      i === index ? { ...p, [field]: value } : p
    );
    setFormData({ ...formData, weeklyOffPattern: newPattern });
  };

  const handleNavigation = (direction: string) => {
    if (direction === "next" && step < 6) setStep(step + 1);
    if (direction === "prev" && step > 1) setStep(step - 1);
  };
  const workingMinutes =
  Number(formData.firstHalfHours) * 60 +
  Number(formData.firstHalfMinutes) +
  Number(formData.secondHalfHours) * 60 +
  Number(formData.secondHalfMinutes);


  return (
    <GlobalLayout>
      <div className="min-h-screen bg-white p-6 text-gray-900">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Shift</h1>
        {loading && (
            <p className="text-sm text-gray-500 mb-4">
              Loading shifts…
            </p>
          )}
        <Button
          variant="default"
          onClick={() => { handleAddShift(); }}
          className="bg-green-600 text-white hover:bg-green-700 mb-6"
        >
          <Plus className="h-4 w-4 mr-2" /> Add Shift
        </Button>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {shifts.map((shift: any) => (
            <Card key={shift.id} className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md">
              <CardHeader className="p-4">
                <div className="h-2 mb-2" style={{ backgroundColor: shift.color }}></div>
                <CardTitle className="text-lg font-semibold">{shift.code}</CardTitle>
                <p className="text-gray-600">{shift.name}</p>
                <p className="text-sm text-gray-500">Active: {shift.active ? "Yes" : "No"}</p>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  {/* EDIT */}
                  <Button
                    size="sm"
                    className="flex-1 bg-blue-600 text-white hover:bg-blue-700"
                    onClick={() => {
                      setSelectedShift(shift);
                      setIsPopupOpen(true);
                    }}
                  >
                    Edit
                  </Button>

                  {/* DELETE */}
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={async () => {
                      if (!confirm("Delete this shift?")) return;

                      try {
                        await API("/api/shift", { method: "DELETE", body: { id: shift.id } });
                        fetchShifts();
                      } catch (err: any) {
                        console.error("Delete shift failed:", err);
                        alert(err.message || "Failed to delete shift");
                      }
                    }}
                  >
                    Delete
                  </Button>
                </div>
              </CardContent>

            </Card>
          ))}
        </div>

        <Dialog open={isPopupOpen} onOpenChange={setIsPopupOpen}>
          <DialogContent className="max-w-4xl max-h-[80vh] w-full sm:w-3/4 md:w-1/2 lg:w-2/3 flex flex-col overflow-hidden">
            <DialogHeader className="border-b pb-2">
              <DialogTitle className="text-xl font-semibold text-gray-800">
                {selectedShift ? "Edit Shift" : "New Shift"}
              </DialogTitle>
            </DialogHeader>
            <div className="flex flex-1 overflow-hidden">
              {/* Internal Sidebar */}
              <div className="w-1/4 pr-4 border-r border-gray-200 overflow-y-auto">
                <nav className="space-y-4 p-2">
                  <button onClick={() => setStep(1)} className={`block w-full text-left ${step === 1 ? 'text-green-600 font-semibold' : 'text-gray-600'}`}>Basic</button>
                  <button onClick={() => setStep(2)} className={`block w-full text-left ${step === 2 ? 'text-green-600 font-semibold' : 'text-gray-600'}`}>Timings</button>
                  <button onClick={() => setStep(3)} className={`block w-full text-left ${step === 3 ? 'text-green-600 font-semibold' : 'text-gray-600'}`}>Absence Criteria</button>
                  <button onClick={() => setStep(4)} className={`block w-full text-left ${step === 4 ? 'text-green-600 font-semibold' : 'text-gray-600'}`}>Advance</button>
                  <button onClick={() => setStep(5)} className={`block w-full text-left ${step === 5 ? 'text-green-600 font-semibold' : 'text-gray-600'}`}>Weekly Off</button>
                  <button onClick={() => setStep(6)} className={`block w-full text-left ${step === 6 ? 'text-green-600 font-semibold' : 'text-gray-600'}`}>Review</button>
                </nav>
                <div className="flex space-x-2 mt-4 p-2">
                  {[1, 2, 3, 4, 5, 6].map(s => (
                    <span key={s} className={`w-3 h-3 rounded-full ${step >= s ? 'bg-green-600' : 'bg-gray-300'}`} />
                  ))}
                </div>
              </div>
              {/* Form Content */}
              <div className="w-3/4 p-4 overflow-y-auto">
                {step === 1 && (
                  <div className="space-y-4">
                    <div>
                      <Label className="text-gray-700">Shift code *</Label>
                      <Input
                        value={formData.code}
                        onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                        placeholder="MOR"
                        className="mt-1"
                      />
                      {formData.errors?.code && <p className="text-red-500 text-sm mt-1">{formData.errors.code}</p>}
                      {reservedCodes.includes(formData.code) && (
                        <p className="bg-blue-100 text-blue-700 text-sm p-2 mt-1 rounded">Please don't use reserved codes P,A,WO,FL,SW.</p>
                      )}
                    </div>
                    <div>
                      <Label className="text-gray-700">Shift colour *</Label>
                      <Input
                        type="color"
                        value={formData.color}
                        onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                        className="mt-1 h-10"
                      />
                    </div>
                    <div>
                      <Label className="text-gray-700">Shift name *</Label>
                      <Input
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Morning"
                        className="mt-1"
                      />
                    </div>
                  </div>
                )}
                {step === 2 && (
                  <div className="space-y-4">
                    <div>
                      <Label className="text-gray-700">What time does the shift start? (24 hr format)</Label>
                      <div className="flex space-x-2 mt-1">
                        <Input
                          type="number"
                          min="0"
                          max="23"
                          value={formData.startTime.split(':')[0] || '09'}
                          onChange={(e) => setFormData({ ...formData, startTime: `${e.target.value.padStart(2, '0')}:${formData.startTime.split(':')[1] || '00'}` })}
                          onKeyDown={(e) => enforceRange(e, 0, 23)}
                          className="w-20"
                        />
                        <span className="self-center">:</span>
                        <Input
                          type="number"
                          min="0"
                          max="59"
                          value={formData.startTime.split(':')[1] || '00'}
                          onChange={(e) => setFormData({ ...formData, startTime: `${formData.startTime.split(':')[0] || '09'}:${e.target.value.padStart(2, '0')}` })}
                          onKeyDown={(e) => enforceRange(e, 0, 59)}
                          className="w-20"
                        />
                      </div>
                    </div>
                    <div>
                      <Label className="text-gray-700">How long is the first half?</Label>
                      <div className="flex space-x-2 mt-1">
                        <Input
                          type="number"
                          min="0"
                          max="23"
                          value={formData.firstHalfHours}
                          onChange={(e) => setFormData({ ...formData, firstHalfHours: e.target.value })}
                          onKeyDown={(e) => enforceRange(e, 0, 23)}
                          className="w-20"
                        />
                        <Input
                          type="number"
                          min="0"
                          max="59"
                          value={formData.firstHalfMinutes}
                          onChange={(e) => setFormData({ ...formData, firstHalfMinutes: e.target.value })}
                          onKeyDown={(e) => enforceRange(e, 0, 59)}
                          className="w-20"
                        />
                      </div>
                    </div>
                    <div>
                      <Label className="text-gray-700">How long is the second half?</Label>
                      <div className="flex space-x-2 mt-1">
                        <Input
                          type="number"
                          min="0"
                          max="23"
                          value={formData.secondHalfHours}
                          onChange={(e) => setFormData({ ...formData, secondHalfHours: e.target.value })}
                          onKeyDown={(e) => enforceRange(e, 0, 23)}
                          className="w-20"
                        />
                        <Input
                          type="number"
                          min="0"
                          max="59"
                          value={formData.secondHalfMinutes}
                          onChange={(e) => setFormData({ ...formData, secondHalfMinutes: e.target.value })}
                          onKeyDown={(e) => enforceRange(e, 0, 59)}
                          className="w-20"
                        />
                      </div>
                    </div>
                    <div>
                      <Label className="text-gray-700">How many minutes before the shift starts is the check-in allowed?</Label>
                      <Input
                        type="number"
                        min="0"
                        max="59"
                        value={formData.checkInGrace}
                        onChange={(e) => setFormData({ ...formData, checkInGrace: e.target.value })}
                        onKeyDown={(e) => enforceRange(e, 0, 59)}
                        className="mt-1 w-20"
                      />
                    </div>
                    <div>
                      <Label className="text-gray-700">Grace time to come late</Label>
                      <Input
                        type="number"
                        min="0"
                        max="59"
                        value={formData.lateGrace}
                        onChange={(e) => setFormData({ ...formData, lateGrace: e.target.value })}
                        onKeyDown={(e) => enforceRange(e, 0, 59)}
                        className="mt-1 w-20"
                      />
                    </div>
                    <div>
                      <Label className="text-gray-700">Grace time to go early</Label>
                      <Input
                        type="number"
                        min="0"
                        max="59"
                        value={formData.earlyGrace}
                        onChange={(e) => setFormData({ ...formData, earlyGrace: e.target.value })}
                        onKeyDown={(e) => enforceRange(e, 0, 59)}
                        className="mt-1 w-20"
                      />
                    </div>
                    <div>
                      <Label className="text-gray-700">Break Time</Label>
                      <div className="flex space-x-2 mt-1">
                        <Input
                          type="number"
                          min="0"
                          max="23"
                          value={formData.breakTime.split(':')[0] || '00'}
                          onChange={(e) => setFormData({ ...formData, breakTime: `${e.target.value.padStart(2, '0')}:${formData.breakTime.split(':')[1] || '00'}` })}
                          onKeyDown={(e) => enforceRange(e, 0, 23)}
                          className="w-20"
                        />
                        <span className="self-center">:</span>
                        <Input
                          type="number"
                          min="0"
                          max="59"
                          value={formData.breakTime.split(':')[1] || '00'}
                          onChange={(e) => setFormData({ ...formData, breakTime: `${formData.breakTime.split(':')[0] || '00'}:${e.target.value.padStart(2, '0')}` })}
                          onKeyDown={(e) => enforceRange(e, 0, 59)}
                          className="w-20"
                        />
                      </div>
                    </div>
                    <p className="text-gray-700">Total Hours: {formData.totalHours || "0.0"}</p>
                    <ReviewChart workingMinutes={workingMinutes}
                    checkInMinutes={Number(formData.checkInGrace)}
                    checkOutMinutes={Number(formData.earlyGrace)}/>
                  </div>
                )}
                {step === 3 && (
                  <div className="space-y-4">
                    <div>
                      <Label className="text-gray-700">What is the minimum no. of hrs required for half day?</Label>
                      <div className="flex space-x-2 mt-1">
                        <Input
                          type="number"
                          min="0"
                          max="23"
                          value={formData.halfDayHours}
                          onChange={(e) => setFormData({ ...formData, halfDayHours: e.target.value })}
                          onKeyDown={(e) => enforceRange(e, 0, 23)}
                          className="w-20"
                        />
                        <Input
                          type="number"
                          min="0"
                          max="59"
                          value={formData.halfDayMinutes}
                          onChange={(e) => setFormData({ ...formData, halfDayMinutes: e.target.value })}
                          onKeyDown={(e) => enforceRange(e, 0, 59)}
                          className="w-20"
                        />
                      </div>
                    </div>
                    <div>
                      <Label className="text-gray-700">What is the minimum no. of hrs required for full day?</Label>
                      <div className="flex space-x-2 mt-1">
                        <Input
                          type="number"
                          min="0"
                          max="23"
                          value={formData.fullDayHours}
                          onChange={(e) => setFormData({ ...formData, fullDayHours: e.target.value })}
                          onKeyDown={(e) => enforceRange(e, 0, 23)}
                          className="w-20"
                        />
                        <Input
                          type="number"
                          min="0"
                          max="59"
                          value={formData.fullDayMinutes}
                          onChange={(e) => setFormData({ ...formData, fullDayMinutes: e.target.value })}
                          onKeyDown={(e) => enforceRange(e, 0, 59)}
                          className="w-20"
                        />
                      </div>
                    </div>
                    <div>
                      <Label className="text-gray-700">If no attendance is recorded for <Input type="number" min="0" max="23" value={formData.noAttendanceHours} onKeyDown={(e) => enforceRange(e, 0, 23)} onChange={(e) => setFormData({ ...formData, noAttendanceHours: e.target.value })} className="w-20 inline" /> <Input type="number" min="0" max="59" value={formData.noAttendanceMinutes} onKeyDown={(e) => enforceRange(e, 0, 59)} onChange={(e) => setFormData({ ...formData, noAttendanceMinutes: e.target.value })} className="w-20 inline" /> from shift start time then mark "Full day" as absent.</Label>
                    </div>
                    <div>
                      <Label className="text-gray-700">If no attendance is recorded for <Input type="number" min="0" max= "23" value={formData.noAttendanceHours} onKeyDown={(e) => enforceRange(e, 0, 23)} onChange={(e) => setFormData({ ...formData, noAttendanceHours: e.target.value })} className="w-20 inline" /> <Input type="number" min ="0" max="59" value={formData.noAttendanceMinutes} onKeyDown={(e) => enforceRange(e, 0, 59)} onChange={(e) => setFormData({ ...formData, noAttendanceMinutes: e.target.value })} className="w-20 inline"/> from shift start time then mark "Half day" as absent.</Label>
                    </div>
                    <div>
                      <Label className="text-gray-700">If check out is recorded for <Input type="number" min="0" max= "23" value={formData.noAttendanceCheckOutHours} onKeyDown={(e) => enforceRange(e, 0, 23)} onChange={(e) => setFormData({ ...formData, noAttendanceCheckOutHours: e.target.value })} className="w-20 inline" /> <Input type="number" min ="0" max="59" value={formData.noAttendanceCheckOutMinutes} onKeyDown={(e) => enforceRange(e, 0, 59)} onChange={(e) => setFormData({ ...formData, noAttendanceCheckOutMinutes: e.target.value })} className="w-20 inline" /> before shift end, mark second half as absent.</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        checked={formData.shiftAllowance}
                        onCheckedChange={(checked) => setFormData({ ...formData, shiftAllowance: checked })}
                      />
                      <Label className="text-gray-700">Shift allowance *</Label>
                    </div>
                  </div>
                )}
                {step === 4 && (
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="restrict-manager-backdate"
                        checked={formData.restrictManagerBackdate}
                        onCheckedChange={(checked) => setFormData({ ...formData, restrictManagerBackdate: checked })}
                      />
                      <Label htmlFor="restrict-manager-backdate" className="text-gray-700">Do you want to restrict managers from marking backdate attendance status?</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="restrict-hr-backdate"
                        checked={formData.restrictHRBackdate}
                        onCheckedChange={(checked) => setFormData({ ...formData, restrictHRBackdate: checked })}
                      />
                      <Label htmlFor="restrict-hr-backdate" className="text-gray-700">Do you want to restrict HR from marking backdate attendance status?</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="restrict-manager-future"
                        checked={formData.restrictManagerFuture}
                        onCheckedChange={(checked) => setFormData({ ...formData, restrictManagerFuture: checked })}
                      />
                      <Label htmlFor="restrict-manager-future" className="text-gray-700">Do you want to restrict manager from marking future attendance status?</Label>
                    </div>
                  </div>
                )}
                {step === 5 && (
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        checked={formData.defineWeeklyOff}
                        onCheckedChange={(checked) => setFormData({ ...formData, defineWeeklyOff: checked })}
                      />
                      <Label className="text-gray-700">Do you want to define weekly off for this shift? *</Label>
                    </div>
                    {formData.defineWeeklyOff && (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Week</TableHead>
                            <TableHead>Day</TableHead>
                            <TableHead>Time</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {(formData.weeklyOffPattern ??[]).map((row: any, i: number) => (
                            <TableRow key={i}>
                              <TableCell>{row.week}</TableCell>
                              <TableCell>
                                <select
                                  value={row.day}
                                  onChange={(e) => updateWeeklyPattern(i, 'day', e.target.value)}
                                  className="border p-1 rounded w-full"
                                >
                                  <option value="Sun">Sun</option>
                                  <option value="Mon">Mon</option>
                                  <option value="Tue">Tue</option>
                                  <option value="Wed">Wed</option>
                                  <option value="Thu">Thu</option>
                                  <option value="Fri">Fri</option>
                                  <option value="Sat">Sat</option>
                                </select>
                              </TableCell>
                              <TableCell>
                                <select
                                  value={row.type}
                                  onChange={(e) => updateWeeklyPattern(i, 'type', e.target.value)}
                                  className="border p-1 rounded mr-2 w-32"
                                >
                                  <option value="Full day">Full day</option>
                                  <option value="Time">Time</option>
                                </select>
                                {row.type === "Time" && (
                                  <Input
                                    type="time"
                                    value={row.time}
                                    onChange={(e) => updateWeeklyPattern(i, 'time', e.target.value)}
                                    className="w-32"
                                  />
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </div>
                )}
                {step === 6 && (
                  <div>
                    <ReviewChart
                      workingMinutes={workingMinutes}
                      checkInMinutes={Number(formData.checkInGrace)}
                      checkOutMinutes={Number(formData.earlyGrace)}
                    />

                    <div className="flex justify-between mt-6">
                      <Button variant="outline" onClick={() => handleNavigation("prev")} disabled={false}>Previous</Button>
                      <Button className="bg-green-600 text-white hover:bg-green-700" onClick={handleSave}>Save</Button>
                    </div>
                  </div>
                )}
                {step < 6 && (
                  <div className="flex justify-between mt-6">
                    <Button variant="outline" onClick={() => handleNavigation("prev")} disabled={step === 1}>Previous</Button>
                    <Button className="bg-green-600 text-white hover:bg-green-700" onClick={() => handleNavigation("next")}>Next</Button>
                  </div>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </GlobalLayout>
  );
}
