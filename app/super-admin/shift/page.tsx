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

// Chart.js integration for Review preview
const ReviewChart = () => {
  const chartRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstanceRef = useRef<any>(null);

  useEffect(() => {
    const canvas = chartRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Destroy previous instance if present (prevents "Chart is already initialized" or duplicate instances)
    if (chartInstanceRef.current) {
      try {
        chartInstanceRef.current.destroy();
      } catch (e) {
        // ignore destroy errors
      }
      chartInstanceRef.current = null;
    }

    chartInstanceRef.current = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: ["Shift time", "Check in allowed from", "Check out allowed from"],
        datasets: [{
          data: [480, 40, 10],
          backgroundColor: ["#a855f7", "#06b6d4", "#fbbf24"]
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: "bottom" }
        }
      }
    });

    return () => {
      if (chartInstanceRef.current) {
        try {
          chartInstanceRef.current.destroy();
        } catch (e) {
          // ignore
        }
        chartInstanceRef.current = null;
      }
    };
  }, []); // empty deps to initialize once per mount

  return <canvas ref={chartRef} className="p-4 bg-gray-50 rounded-lg w-full" />;
};

export default function ShiftPage() {
  const [shifts, setShifts] = useState([
    { id: 1, code: "MOR", color: "#28a745", name: "Morning", startTime: "09:00", endTime: "17:30", breakTime: "00:30", totalHours: "8", active: true },
    { id: 2, code: "EVE", color: "#ff6347", name: "Evening", startTime: "17:00", endTime: "01:00", breakTime: "00:30", totalHours: "7.5", active: false },
  ]);
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

  useEffect(() => {
    if (selectedShift) {
      setFormData({
        ...selectedShift,
        firstHalfHours: "4", firstHalfMinutes: "0", secondHalfHours: "4", secondHalfMinutes: "15",
        checkInGrace: "30", lateGrace: "10", earlyGrace: "10",
        halfDayHours: "4", halfDayMinutes: "0", fullDayHours: "8", fullDayMinutes: "0",
        noAttendanceHours: "2", noAttendanceMinutes: "0", noAttendanceCheckOutHours: "1", noAttendanceCheckOutMinutes: "0",
        shiftAllowance: true, restrictManagerBackdate: false, restrictHRBackdate: false, restrictManagerFuture: true,
        defineWeeklyOff: true, weeklyOffPattern: [{ week: 1, day: "Sun", type: "Full day", time: "" }],
        errors: {},
      });
    } else {
      setFormData({
        code: "", color: "#28a745", name: "", startTime: "09:00", endTime: "17:30", breakTime: "00:30", totalHours: "8",
        firstHalfHours: "4", firstHalfMinutes: "0", secondHalfHours: "4", secondHalfMinutes: "15",
        checkInGrace: "30", lateGrace: "10", earlyGrace: "10",
        halfDayHours: "4", halfDayMinutes: "0", fullDayHours: "8", fullDayMinutes: "0",
        noAttendanceHours: "2", noAttendanceMinutes: "0", noAttendanceCheckOutHours: "1", noAttendanceCheckOutMinutes: "0",
        shiftAllowance: true, restrictManagerBackdate: false, restrictHRBackdate: false, restrictManagerFuture: true,
        defineWeeklyOff: true, weeklyOffPattern: [{ week: 1, day: "Sun", type: "Full day", time: "" }],
        errors: {},
      });
    }
  }, [selectedShift]);

  // Auto-calculate total hours based on start, end, and break times
  useEffect(() => {
    if (formData.startTime && formData.endTime && formData.breakTime) {
      const start = new Date(`2023-01-01T${formData.startTime}`);
      const end = new Date(`2023-01-01T${formData.endTime}`);
      let diff = (end.getTime() - start.getTime()) / (1000 * 60 * 60); // hours
      if (diff < 0) diff += 24; // Handle overnight shifts
      const [breakHours, breakMinutes] = formData.breakTime.split(':').map(Number);
      const breakH = breakHours + breakMinutes / 60;
      diff -= breakH;
      setFormData((prev: any) => ({ ...prev, totalHours: diff > 0 ? diff.toFixed(1) : "0.0" }));
    }
  }, [formData.startTime, formData.endTime, formData.breakTime]);

  const validateForm = () => {
    const errors: any = {};
    if (!formData.code) errors.code = "Shift code is required";
    if (reservedCodes.includes(formData.code)) errors.code = "Please don't use reserved codes P,A,WO,FL,SW.";
    if (!formData.name) errors.name = "Shift name is required";
    return errors;
  };

  const handleSave = () => {
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormData({ ...formData, errors });
      return;
    }
    if (selectedShift) {
      setShifts(shifts.map((s: any) => s.id === selectedShift.id ? { ...formData, id: s.id, active: s.active } : s));
    } else {
      setShifts([...shifts, { ...formData, id: shifts.length + 1, active: true }]);
    }
    setIsPopupOpen(false);
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

  return (
    <GlobalLayout>
      <div className="min-h-screen bg-white p-6 text-gray-900">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Shift</h1>
        <Button
          variant="default"
          onClick={() => { setSelectedShift(null); setIsPopupOpen(true); }}
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
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => { setSelectedShift(shift); setIsPopupOpen(true); }}
                  className="w-full bg-blue-600 text-white hover:bg-blue-700"
                >
                  Edit
                </Button>
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
                          className="w-20"
                        />
                        <span className="self-center">:</span>
                        <Input
                          type="number"
                          min="0"
                          max="59"
                          value={formData.startTime.split(':')[1] || '00'}
                          onChange={(e) => setFormData({ ...formData, startTime: `${formData.startTime.split(':')[0] || '09'}:${e.target.value.padStart(2, '0')}` })}
                          className="w-20"
                        />
                      </div>
                    </div>
                    <div>
                      <Label className="text-gray-700">How long is the first half?</Label>
                      <div className="flex space-x-2 mt-1">
                        <Input
                          type="number"
                          value={formData.firstHalfHours}
                          onChange={(e) => setFormData({ ...formData, firstHalfHours: e.target.value })}
                          className="w-20"
                        />
                        <Input
                          type="number"
                          value={formData.firstHalfMinutes}
                          onChange={(e) => setFormData({ ...formData, firstHalfMinutes: e.target.value })}
                          className="w-20"
                        />
                      </div>
                    </div>
                    <div>
                      <Label className="text-gray-700">How long is the second half?</Label>
                      <div className="flex space-x-2 mt-1">
                        <Input
                          type="number"
                          value={formData.secondHalfHours}
                          onChange={(e) => setFormData({ ...formData, secondHalfHours: e.target.value })}
                          className="w-20"
                        />
                        <Input
                          type="number"
                          value={formData.secondHalfMinutes}
                          onChange={(e) => setFormData({ ...formData, secondHalfMinutes: e.target.value })}
                          className="w-20"
                        />
                      </div>
                    </div>
                    <div>
                      <Label className="text-gray-700">How many minutes before the shift starts is the check-in allowed?</Label>
                      <Input
                        type="number"
                        value={formData.checkInGrace}
                        onChange={(e) => setFormData({ ...formData, checkInGrace: e.target.value })}
                        className="mt-1 w-20"
                      />
                    </div>
                    <div>
                      <Label className="text-gray-700">Grace time to come late</Label>
                      <Input
                        type="number"
                        value={formData.lateGrace}
                        onChange={(e) => setFormData({ ...formData, lateGrace: e.target.value })}
                        className="mt-1 w-20"
                      />
                    </div>
                    <div>
                      <Label className="text-gray-700">Grace time to go early</Label>
                      <Input
                        type="number"
                        value={formData.earlyGrace}
                        onChange={(e) => setFormData({ ...formData, earlyGrace: e.target.value })}
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
                          className="w-20"
                        />
                        <span className="self-center">:</span>
                        <Input
                          type="number"
                          min="0"
                          max="59"
                          value={formData.breakTime.split(':')[1] || '00'}
                          onChange={(e) => setFormData({ ...formData, breakTime: `${formData.breakTime.split(':')[0] || '00'}:${e.target.value.padStart(2, '0')}` })}
                          className="w-20"
                        />
                      </div>
                    </div>
                    <p className="text-gray-700">Total Hours: {formData.totalHours || "0.0"}</p>
                    <ReviewChart />
                  </div>
                )}
                {step === 3 && (
                  <div className="space-y-4">
                    <div>
                      <Label className="text-gray-700">What is the minimum no. of hrs required for half day?</Label>
                      <div className="flex space-x-2 mt-1">
                        <Input
                          type="number"
                          value={formData.halfDayHours}
                          onChange={(e) => setFormData({ ...formData, halfDayHours: e.target.value })}
                          className="w-20"
                        />
                        <Input
                          type="number"
                          value={formData.halfDayMinutes}
                          onChange={(e) => setFormData({ ...formData, halfDayMinutes: e.target.value })}
                          className="w-20"
                        />
                      </div>
                    </div>
                    <div>
                      <Label className="text-gray-700">What is the minimum no. of hrs required for full day?</Label>
                      <div className="flex space-x-2 mt-1">
                        <Input
                          type="number"
                          value={formData.fullDayHours}
                          onChange={(e) => setFormData({ ...formData, fullDayHours: e.target.value })}
                          className="w-20"
                        />
                        <Input
                          type="number"
                          value={formData.fullDayMinutes}
                          onChange={(e) => setFormData({ ...formData, fullDayMinutes: e.target.value })}
                          className="w-20"
                        />
                      </div>
                    </div>
                    <div>
                      <Label className="text-gray-700">If no attendance is recorded for <Input type="number" value={formData.noAttendanceHours} onChange={(e) => setFormData({ ...formData, noAttendanceHours: e.target.value })} className="w-12 inline" /> <Input type="number" value={formData.noAttendanceMinutes} onChange={(e) => setFormData({ ...formData, noAttendanceMinutes: e.target.value })} className="w-12 inline" /> from shift start time then mark "Full day" as absent.</Label>
                    </div>
                    <div>
                      <Label className="text-gray-700">If no attendance is recorded for <Input type="number" value="4" className="w-12 inline" readOnly /> <Input type="number" value="0" className="w-12 inline" readOnly /> from shift start time then mark "Half day" as absent.</Label>
                    </div>
                    <div>
                      <Label className="text-gray-700">If check out is recorded for <Input type="number" value={formData.noAttendanceCheckOutHours} onChange={(e) => setFormData({ ...formData, noAttendanceCheckOutHours: e.target.value })} className="w-12 inline" /> <Input type="number" value={formData.noAttendanceCheckOutMinutes} onChange={(e) => setFormData({ ...formData, noAttendanceCheckOutMinutes: e.target.value })} className="w-12 inline" /> before shift end, mark second half as absent.</Label>
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
                          {formData.weeklyOffPattern.map((row: any, i: number) => (
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
                    <ReviewChart />
                    <div className="flex justify-between mt-6">
                      <Button variant="outline" onClick={() => handleNavigation("prev")} disabled={step === 1}>Previous</Button>
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
