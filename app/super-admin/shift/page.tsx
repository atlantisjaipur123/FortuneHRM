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
import { api } from "@/app/lib/api" // Use the provided api utility for all calls


interface WeeklyOffPattern {
  week: number;
  day: string;
  type: string;
  time: string | null;
}

interface FormData {
  code: string;
  color: string;
  name: string;
  startTime: string;
  endTime: string;
  breakTime: string;
  totalHours: string;
  firstHalfHours: string;
  firstHalfMinutes: string;
  secondHalfHours: string;
  secondHalfMinutes: string;
  checkInGrace: string;
  lateGrace: string;
  earlyGrace: string;
  halfDayHours: string;
  halfDayMinutes: string;
  fullDayHours: string;
  fullDayMinutes: string;
  noAttendanceHours: string;
  noAttendanceMinutes: string;
  halfDayAbsenceHours: string;
  halfDayAbsenceMinutes: string;
  noAttendanceCheckOutHours: string;
  noAttendanceCheckOutMinutes: string;
  shiftAllowance: boolean;
  restrictManagerBackdate: boolean;
  restrictHRBackdate: boolean;
  restrictManagerFuture: boolean;
  defineWeeklyOff: boolean;
  weeklyOffPattern: WeeklyOffPattern[];
  errors: Record<string, string>;
}

const enforceRange = (
  e: React.KeyboardEvent<HTMLInputElement>,
  min: number,
  max: number
) => {
  const input = e.currentTarget;
  const currentValue = input.value || "0";

  if (["Backspace", "Delete", "ArrowLeft", "ArrowRight", "Tab", "Enter"].includes(e.key)) {
    return;
  }

  if (e.key === "-" || e.key === "Minus") {
    e.preventDefault();
    return;
  }

  if (/[0-9]/.test(e.key)) {
    const selectionStart = input.selectionStart || 0;
    const selectionEnd = input.selectionEnd || 0;
    const newValue = currentValue.slice(0, selectionStart) + e.key + currentValue.slice(selectionEnd);
    const numValue = Number(newValue);
    if (numValue < min || numValue > max) {
      e.preventDefault();
    }
  }
};

const timeToMinutes = (time: string): number => {
  const [h, m] = (time || "00:00").split(":").map(Number);
  return (isNaN(h) ? 0 : h) * 60 + (isNaN(m) ? 0 : m);
};

const minutesToTime = (minutes: number): string => {
  const safeMinutes = isNaN(minutes) ? 0 : Math.max(0, minutes);
  const h = Math.floor(safeMinutes / 60);
  const m = safeMinutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
};

const addMinutesToTime = (time: string, minutesToAdd: number): string => {
  const total = timeToMinutes(time) + (isNaN(minutesToAdd) ? 0 : minutesToAdd);
  const h = Math.floor((total % (24 * 60)) / 60);
  const m = total % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
};

const clampValue = (value: string, min: number, max: number): string => {
  const num = Number(value);
  if (isNaN(num)) return "0";
  return String(Math.min(Math.max(num, min), max));
};

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
  const chartInstanceRef = useRef<Chart | null>(null);

  useEffect(() => {
    const canvas = chartRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }

    const safeWorking = isNaN(workingMinutes) ? 1 : Math.max(workingMinutes, 1);
    const safeCheckIn = isNaN(checkInMinutes) ? 0 : Math.min(checkInMinutes, safeWorking * 0.25);
    const safeCheckOut = isNaN(checkOutMinutes) ? 0 : Math.min(checkOutMinutes, safeWorking * 0.25);

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
            data: [safeWorking, safeCheckIn, safeCheckOut],
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
  const [formData, setFormData] = useState<FormData>({
    code: "",
    color: "#28a745",
    name: "",
    startTime: "09:00",
    endTime: "17:30",
    breakTime: "00:30",
    totalHours: "8",
    firstHalfHours: "4",
    firstHalfMinutes: "0",
    secondHalfHours: "4",
    secondHalfMinutes: "0",
    checkInGrace: "30",
    lateGrace: "10",
    earlyGrace: "10",
    halfDayHours: "4",
    halfDayMinutes: "0",
    fullDayHours: "8",
    fullDayMinutes: "0",
    noAttendanceHours: "2",
    noAttendanceMinutes: "0",
    halfDayAbsenceHours: "2",
    halfDayAbsenceMinutes: "0",
    noAttendanceCheckOutHours: "1",
    noAttendanceCheckOutMinutes: "0",
    shiftAllowance: true,
    restrictManagerBackdate: false,
    restrictHRBackdate: false,
    restrictManagerFuture: true,
    defineWeeklyOff: true,
    weeklyOffPattern: [
      { week: 1, day: "Sun", type: "Full day", time: null },
      { week: 2, day: "Sun", type: "Full day", time: null },
      { week: 3, day: "Sun", type: "Full day", time: null },
      { week: 4, day: "Sun", type: "Full day", time: null },
      { week: 5, day: "Sun", type: "Full day", time: null },
    ],
    errors: {} as Record<string, string>,
  });

  const reservedCodes = ["P", "A", "WO", "FL", "SW"];

  const fetchShifts = async () => {
    setLoading(true);
    try {
      const data = await api.get("/api/shift");
      setShifts(data.shifts || []);
    } catch (err: any) {
      console.error("Fetch shifts failed:", err);
      alert(err.message || "Failed to fetch shifts");
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
    const firstHalfMinutes = selectedShift.firstHalfDuration ?? 240;
    const secondHalfMinutes = selectedShift.secondHalfDuration ?? 240;
    const halfDayMinutes = selectedShift.halfDayThreshold ?? 240;
    const fullDayMinutes = selectedShift.fullDayThreshold ?? 480;
    const noAttendanceMinutes = selectedShift.noAttendanceThreshold ?? 120;
    const halfDayAbsenceMinutes = selectedShift.halfDayAbsenceThreshold ?? 120;
    const earlyCheckoutMinutes = selectedShift.earlyCheckoutThreshold ?? 60;

    setFormData({
      ...selectedShift,
      breakTime: minutesToTime(breakMinutes),
      firstHalfHours: String(Math.floor(firstHalfMinutes / 60)),
      firstHalfMinutes: String(firstHalfMinutes % 60),
      secondHalfHours: String(Math.floor(secondHalfMinutes / 60)),
      secondHalfMinutes: String(secondHalfMinutes % 60),
      checkInGrace: String(selectedShift.checkInGrace ?? 30),
      lateGrace: String(selectedShift.lateGrace ?? 10),
      earlyGrace: String(selectedShift.earlyGrace ?? 10),
      halfDayHours: String(Math.floor(halfDayMinutes / 60)),
      halfDayMinutes: String(halfDayMinutes % 60),
      fullDayHours: String(Math.floor(fullDayMinutes / 60)),
      fullDayMinutes: String(fullDayMinutes % 60),
      noAttendanceHours: String(Math.floor(noAttendanceMinutes / 60)),
      noAttendanceMinutes: String(noAttendanceMinutes % 60),
      halfDayAbsenceHours: String(Math.floor(halfDayAbsenceMinutes / 60)),
      halfDayAbsenceMinutes: String(halfDayAbsenceMinutes % 60),
      noAttendanceCheckOutHours: String(Math.floor(earlyCheckoutMinutes / 60)),
      noAttendanceCheckOutMinutes: String(earlyCheckoutMinutes % 60),
      defineWeeklyOff: selectedShift.defineWeeklyOff ?? true,
      weeklyOffPattern: Array.isArray(selectedShift.weeklyOffPattern) && selectedShift.weeklyOffPattern.length === 5
        ? selectedShift.weeklyOffPattern.map((p: WeeklyOffPattern) => ({ ...p, time: p.time === "" ? null : p.time })) // Added: Normalize loaded data to convert "" to null for type consistency
        : [
          { week: 1, day: "Sun", type: "Full day", time: null },
          { week: 2, day: "Sun", type: "Full day", time: null },
          { week: 3, day: "Sun", type: "Full day", time: null },
          { week: 4, day: "Sun", type: "Full day", time: null },
          { week: 5, day: "Sun", type: "Full day", time: null },
        ],
      errors: {} as Record<string, string>,
    });
  }, [selectedShift]);

  useEffect(() => {
    const firstHalf = Number(formData.firstHalfHours) * 60 + Number(formData.firstHalfMinutes);
    const secondHalf = Number(formData.secondHalfHours) * 60 + Number(formData.secondHalfMinutes);
    const breakMinutes = timeToMinutes(formData.breakTime);

    const totalWorkMinutes = firstHalf + secondHalf;
    const totalShiftMinutes = totalWorkMinutes + breakMinutes;

    const calculatedEndTime = addMinutesToTime(formData.startTime, totalShiftMinutes);

    setFormData((prev) => ({
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
    const errors: Record<string, string> = {};
    if (!formData.code) errors.code = "Shift code is required";
    if (reservedCodes.includes(formData.code)) errors.code = "Please don't use reserved codes P,A,WO,FL,SW.";
    if (!formData.name) errors.name = "Shift name is required";
    if (!formData.startTime.match(/^\d{2}:\d{2}$/)) errors.startTime = "Invalid start time format";
    if (!formData.endTime.match(/^\d{2}:\d{2}$/)) errors.endTime = "Invalid end time format";
    if (timeToMinutes(formData.startTime) >= timeToMinutes(formData.endTime)) errors.endTime = "End time must be after start time";
    // Add more validations as needed (e.g., graces < working hours)

    if (formData.defineWeeklyOff) {
      formData.weeklyOffPattern.forEach((pattern, index) => {
        if (pattern.type === "Time" && pattern.time && !pattern.time.match(/^\d{2}:\d{2}$/)) {
          errors[`weeklyOffPattern_${index}_time`] = `Invalid time format for week ${pattern.week}`;
        }
      });
    }

    return errors;
  };

  const mapFormToApiPayload = () => {
    const breakMinutes = timeToMinutes(formData.breakTime);
    const firstHalfMinutes = Number(formData.firstHalfHours) * 60 + Number(formData.firstHalfMinutes);
    const secondHalfMinutes = Number(formData.secondHalfHours) * 60 + Number(formData.secondHalfMinutes);
    const halfDayMinutes = Number(formData.halfDayHours) * 60 + Number(formData.halfDayMinutes);
    const fullDayMinutes = Number(formData.fullDayHours) * 60 + Number(formData.fullDayMinutes);
    const noAttendanceMinutes = Number(formData.noAttendanceHours) * 60 + Number(formData.noAttendanceMinutes);
    const halfDayAbsenceMinutes = Number(formData.halfDayAbsenceHours) * 60 + Number(formData.halfDayAbsenceMinutes);
    const earlyCheckoutMinutes = Number(formData.noAttendanceCheckOutHours) * 60 + Number(formData.noAttendanceCheckOutMinutes);

    return {
      name: formData.name,
      code: formData.code || null,
      color: formData.color,
      startTime: formData.startTime,
      endTime: formData.endTime,
      breakDuration: breakMinutes,
      workingHours: Number(formData.totalHours) || 0,
      firstHalfDuration: firstHalfMinutes,
      secondHalfDuration: secondHalfMinutes,
      checkInGrace: Number(formData.checkInGrace),
      lateGrace: Number(formData.lateGrace),
      earlyGrace: Number(formData.earlyGrace),
      halfDayThreshold: halfDayMinutes,
      fullDayThreshold: fullDayMinutes,
      noAttendanceThreshold: noAttendanceMinutes,
      halfDayAbsenceThreshold: halfDayAbsenceMinutes,
      earlyCheckoutThreshold: earlyCheckoutMinutes,
      shiftAllowance: formData.shiftAllowance,
      defineWeeklyOff: formData.defineWeeklyOff,
      weeklyOffPattern: formData.defineWeeklyOff ? formData.weeklyOffPattern : [],
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
      color: "#28a745",
      name: "",
      startTime: "09:00",
      endTime: "17:30",
      breakTime: "00:30",
      totalHours: "8",
      firstHalfHours: "4",
      firstHalfMinutes: "0",
      secondHalfHours: "4",
      secondHalfMinutes: "0",
      checkInGrace: "30",
      lateGrace: "10",
      earlyGrace: "10",
      halfDayHours: "4",
      halfDayMinutes: "0",
      fullDayHours: "8",
      fullDayMinutes: "0",
      noAttendanceHours: "2",
      noAttendanceMinutes: "0",
      halfDayAbsenceHours: "2",
      halfDayAbsenceMinutes: "0",
      noAttendanceCheckOutHours: "1",
      noAttendanceCheckOutMinutes: "0",
      shiftAllowance: true,
      restrictManagerBackdate: false,
      restrictHRBackdate: false,
      restrictManagerFuture: true,
      defineWeeklyOff: true,
      weeklyOffPattern: [
        { week: 1, day: "Sun", type: "Full day", time: null },
        { week: 2, day: "Sun", type: "Full day", time: null },
        { week: 3, day: "Sun", type: "Full day", time: null },
        { week: 4, day: "Sun", type: "Full day", time: null },
        { week: 5, day: "Sun", type: "Full day", time: null },
      ],
      errors: {} as Record<string, string>,
    });
    setStep(1);
    setIsPopupOpen(true);
  };

  const updateWeeklyPattern = (index: number, field: string, value: any) => {
    const newPattern = formData.weeklyOffPattern.map((p: WeeklyOffPattern, i: number) => { // Changed: Typed p as WeeklyOffPattern
      if (i === index) {
        const updated = { ...p, [field]: value };
        if (field === 'type') {
          updated.time = value === 'Full day' ? null : (p.time ?? "00:00");
        }
        return updated;
      }
      return p;
    });
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
          onClick={handleAddShift}
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
                <p className="text-sm text-gray-500">Active: {shift.isActive ? "Yes" : "No"}</p>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
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
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={async () => {
                      if (!confirm("Delete this shift?")) return;
                      try {
                        await api.delete("/api/shift", { body: { id: shift.id } });
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
                      {formData.errors?.name && <p className="text-red-500 text-sm mt-1">{formData.errors.name}</p>}
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
                          onChange={(e) => {
                            const val = clampValue(e.target.value, 0, 23);
                            setFormData({ ...formData, startTime: `${val.padStart(2, '0')}:${formData.startTime.split(':')[1] || '00'}` });
                          }}
                          onKeyDown={(e) => enforceRange(e, 0, 23)}
                          className="w-20"
                        />
                        <span className="self-center">:</span>
                        <Input
                          type="number"
                          min="0"
                          max="59"
                          value={formData.startTime.split(':')[1] || '00'}
                          onChange={(e) => {
                            const val = clampValue(e.target.value, 0, 59);
                            setFormData({ ...formData, startTime: `${formData.startTime.split(':')[0] || '09'}:${val.padStart(2, '0')}` });
                          }}
                          onKeyDown={(e) => enforceRange(e, 0, 59)}
                          className="w-20"
                        />
                      </div>
                      {formData.errors?.startTime && <p className="text-red-500 text-sm mt-1">{formData.errors.startTime}</p>}
                    </div>
                    <div>
                      <Label className="text-gray-700">How long is the first half?</Label>
                      <div className="flex space-x-2 mt-1">
                        <Input
                          type="number"
                          min="0"
                          max="23"
                          value={formData.firstHalfHours}
                          onChange={(e) => {
                            const val = clampValue(e.target.value, 0, 23);
                            setFormData({ ...formData, firstHalfHours: val });
                          }}
                          onKeyDown={(e) => enforceRange(e, 0, 23)}
                          className="w-20"
                        />
                        <Input
                          type="number"
                          min="0"
                          max="59"
                          value={formData.firstHalfMinutes}
                          onChange={(e) => {
                            const val = clampValue(e.target.value, 0, 59);
                            setFormData({ ...formData, firstHalfMinutes: val });
                          }}
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
                          onChange={(e) => {
                            const val = clampValue(e.target.value, 0, 23);
                            setFormData({ ...formData, secondHalfHours: val });
                          }}
                          onKeyDown={(e) => enforceRange(e, 0, 23)}
                          className="w-20"
                        />
                        <Input
                          type="number"
                          min="0"
                          max="59"
                          value={formData.secondHalfMinutes}
                          onChange={(e) => {
                            const val = clampValue(e.target.value, 0, 59);
                            setFormData({ ...formData, secondHalfMinutes: val });
                          }}
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
                        onChange={(e) => {
                          const val = clampValue(e.target.value, 0, 59);
                          setFormData({ ...formData, checkInGrace: val });
                        }}
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
                        onChange={(e) => {
                          const val = clampValue(e.target.value, 0, 59);
                          setFormData({ ...formData, lateGrace: val });
                        }}
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
                        onChange={(e) => {
                          const val = clampValue(e.target.value, 0, 59);
                          setFormData({ ...formData, earlyGrace: val });
                        }}
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
                          onChange={(e) => {
                            const val = clampValue(e.target.value, 0, 23);
                            setFormData({ ...formData, breakTime: `${val.padStart(2, '0')}:${formData.breakTime.split(':')[1] || '00'}` });
                          }}
                          onKeyDown={(e) => enforceRange(e, 0, 23)}
                          className="w-20"
                        />
                        <span className="self-center">:</span>
                        <Input
                          type="number"
                          min="0"
                          max="59"
                          value={formData.breakTime.split(':')[1] || '00'}
                          onChange={(e) => {
                            const val = clampValue(e.target.value, 0, 59);
                            setFormData({ ...formData, breakTime: `${formData.breakTime.split(':')[0] || '00'}:${val.padStart(2, '0')}` });
                          }}
                          onKeyDown={(e) => enforceRange(e, 0, 59)}
                          className="w-20"
                        />
                      </div>
                    </div>
                    <p className="text-gray-700">Total Hours: {formData.totalHours || "0.0"}</p>
                    <ReviewChart
                      workingMinutes={workingMinutes}
                      checkInMinutes={Number(formData.checkInGrace)}
                      checkOutMinutes={Number(formData.earlyGrace)}
                    />
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
                          onChange={(e) => {
                            const val = clampValue(e.target.value, 0, 23);
                            setFormData({ ...formData, halfDayHours: val });
                          }}
                          onKeyDown={(e) => enforceRange(e, 0, 23)}
                          className="w-20"
                        />
                        <Input
                          type="number"
                          min="0"
                          max="59"
                          value={formData.halfDayMinutes}
                          onChange={(e) => {
                            const val = clampValue(e.target.value, 0, 59);
                            setFormData({ ...formData, halfDayMinutes: val });
                          }}
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
                          onChange={(e) => {
                            const val = clampValue(e.target.value, 0, 23);
                            setFormData({ ...formData, fullDayHours: val });
                          }}
                          onKeyDown={(e) => enforceRange(e, 0, 23)}
                          className="w-20"
                        />
                        <Input
                          type="number"
                          min="0"
                          max="59"
                          value={formData.fullDayMinutes}
                          onChange={(e) => {
                            const val = clampValue(e.target.value, 0, 59);
                            setFormData({ ...formData, fullDayMinutes: val });
                          }}
                          onKeyDown={(e) => enforceRange(e, 0, 59)}
                          className="w-20"
                        />
                      </div>
                    </div>
                    <div>
                      <Label className="text-gray-700">If no attendance is recorded for
                        <Input
                          type="number"
                          min="0"
                          max="23"
                          value={formData.noAttendanceHours}
                          onChange={(e) => {
                            const val = clampValue(e.target.value, 0, 23);
                            setFormData({ ...formData, noAttendanceHours: val });
                          }}
                          onKeyDown={(e) => enforceRange(e, 0, 23)}
                          className="w-20 inline mx-1"
                        /> :
                        <Input
                          type="number"
                          min="0"
                          max="59"
                          value={formData.noAttendanceMinutes}
                          onChange={(e) => {
                            const val = clampValue(e.target.value, 0, 59);
                            setFormData({ ...formData, noAttendanceMinutes: val });
                          }}
                          onKeyDown={(e) => enforceRange(e, 0, 59)}
                          className="w-20 inline mx-1"
                        /> from shift start time then mark "Full day" as absent.
                      </Label>
                    </div>
                    <div>
                      <Label className="text-gray-700">If no attendance is recorded for
                        <Input
                          type="number"
                          min="0"
                          max="23"
                          value={formData.halfDayAbsenceHours}
                          onChange={(e) => {
                            const val = clampValue(e.target.value, 0, 23);
                            setFormData({ ...formData, halfDayAbsenceHours: val });
                          }}
                          onKeyDown={(e) => enforceRange(e, 0, 23)}
                          className="w-20 inline mx-1"
                        /> :
                        <Input
                          type="number"
                          min="0"
                          max="59"
                          value={formData.halfDayAbsenceMinutes}
                          onChange={(e) => {
                            const val = clampValue(e.target.value, 0, 59);
                            setFormData({ ...formData, halfDayAbsenceMinutes: val });
                          }}
                          onKeyDown={(e) => enforceRange(e, 0, 59)}
                          className="w-20 inline mx-1"
                        /> from shift start time then mark "Half day" as absent.
                      </Label>
                    </div>
                    <div>
                      <Label className="text-gray-700">If check out is recorded for
                        <Input
                          type="number"
                          min="0"
                          max="23"
                          value={formData.noAttendanceCheckOutHours}
                          onChange={(e) => {
                            const val = clampValue(e.target.value, 0, 23);
                            setFormData({ ...formData, noAttendanceCheckOutHours: val });
                          }}
                          onKeyDown={(e) => enforceRange(e, 0, 23)}
                          className="w-20 inline mx-1"
                        /> :
                        <Input
                          type="number"
                          min="0"
                          max="59"
                          value={formData.noAttendanceCheckOutMinutes}
                          onChange={(e) => {
                            const val = clampValue(e.target.value, 0, 59);
                            setFormData({ ...formData, noAttendanceCheckOutMinutes: val });
                          }}
                          onKeyDown={(e) => enforceRange(e, 0, 59)}
                          className="w-20 inline mx-1"
                        /> before shift end, mark second half as absent.
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        checked={formData.shiftAllowance}
                        onCheckedChange={(checked) => setFormData({ ...formData, shiftAllowance: !!checked })}
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
                        onCheckedChange={(checked) => setFormData({ ...formData, restrictManagerBackdate: !!checked })}
                      />
                      <Label htmlFor="restrict-manager-backdate" className="text-gray-700">Do you want to restrict managers from marking backdate attendance status?</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="restrict-hr-backdate"
                        checked={formData.restrictHRBackdate}
                        onCheckedChange={(checked) => setFormData({ ...formData, restrictHRBackdate: !!checked })}
                      />
                      <Label htmlFor="restrict-hr-backdate" className="text-gray-700">Do you want to restrict HR from marking backdate attendance status?</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="restrict-manager-future"
                        checked={formData.restrictManagerFuture}
                        onCheckedChange={(checked) => setFormData({ ...formData, restrictManagerFuture: !!checked })}
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
                        onCheckedChange={(checked) => setFormData({ ...formData, defineWeeklyOff: !!checked })}
                      />
                      <Label className="text-gray-700">Do you want to define weekly off for this shift? *</Label>
                    </div>
                    {formData.defineWeeklyOff && (
                      <>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Week</TableHead>
                              <TableHead>Day</TableHead>
                              <TableHead>Time</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {formData.weeklyOffPattern.map((row: WeeklyOffPattern, i: number) => ( // Changed: Typed row as WeeklyOffPattern
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
                                      value={row.time ?? ""}
                                      onChange={(e) => updateWeeklyPattern(i, 'time', e.target.value || null)}
                                      className="w-32"
                                    />
                                  )}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                        {/* Added: Display weekly off validation errors below the table */}
                        {Object.keys(formData.errors).filter(key => key.startsWith('weeklyOffPattern_')).map(key => (
                          <p key={key} className="text-red-500 text-sm mt-1">{formData.errors[key]}</p>
                        ))}
                      </>
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
                      <Button className="bg-green-600 text-white hover:bg-green-700" onClick={handleSave} disabled={loading}>Save</Button>
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