"use client"

import React, { useState, useEffect, useMemo } from "react"
import * as XLSX from "xlsx"
import * as FileSaver from "file-saver"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ScrollArea } from "@/components/ui/scroll-area"
import { GlobalLayout } from "@/app/components/global-layout"
import { ChevronLeft, ChevronRight, Download, Save, CheckCircle } from "lucide-react"
import { api } from "@/app/lib/api"
import { toast } from "@/hooks/use-toast"

export default function PayrollPage() {
  const currentDate = new Date()
  const [selectedMonth, setSelectedMonth] = useState<string>((currentDate.getMonth() + 1).toString().padStart(2, "0"))
  const [selectedYear, setSelectedYear] = useState<string>(currentDate.getFullYear().toString())

  const [records, setRecords] = useState<any[]>([])
  const [salaryHeads, setSalaryHeads] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const monthLabel = useMemo(() => {
    const date = new Date(parseInt(selectedYear), parseInt(selectedMonth) - 1)
    return date.toLocaleString('default', { month: 'long', year: 'numeric' })
  }, [selectedMonth, selectedYear])

  const goToPrevMonth = () => {
    let m = parseInt(selectedMonth) - 1
    let y = parseInt(selectedYear)
    if (m < 1) { m = 12; y-- }
    setSelectedMonth(m.toString().padStart(2, "0"))
    setSelectedYear(y.toString())
  }

  const goToNextMonth = () => {
    let m = parseInt(selectedMonth) + 1
    let y = parseInt(selectedYear)
    if (m > 12) { m = 1; y++ }
    setSelectedMonth(m.toString().padStart(2, "0"))
    setSelectedYear(y.toString())
  }

  const loadPayroll = async () => {
    setLoading(true)
    try {
      const res = await api.get(`/api/payroll?month=${selectedMonth}&year=${selectedYear}`)
      if (res.success) {
        setRecords(res.records || [])
        setSalaryHeads(res.salaryHeads || [])
      } else {
        toast({ title: "Error", description: res.error || "Failed to load payroll", variant: "destructive" })
      }
    } catch (e: any) {
      toast({ title: "Error", description: e.message || "Failed to load payroll", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPayroll()
  }, [selectedMonth, selectedYear])

  const savePayroll = async () => {
    if (!records || records.length === 0) return;
    setSaving(true);
    try {
      const res = await api.post("/api/payroll", {
        records,
        month: selectedMonth,
        year: selectedYear
      });
      if (res.success) {
        toast({ title: "Success", description: res.message || "Payroll saved successfully" });
        loadPayroll(); // Reload to get the saved status
      } else {
        toast({ title: "Error", description: res.error || "Failed to save payroll", variant: "destructive" });
      }
    } catch (e: any) {
      toast({ title: "Error", description: e.message || "Failed to save payroll", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }

  const exportToExcel = () => {
    const rows = records.map((rec, index) => {
      const row: any = {
        'S.No': index + 1,
        'Code': rec.code,
        'Employee Name': rec.name,
        'Days in Month': rec.daysInMonth,
        'Working Days': rec.totalWorkingDays,
      }
      salaryHeads.forEach(head => {
        row[head] = Math.round(rec.heads[head] || 0)
      })
      row['Gross Amount'] = Math.round(rec.grossAmount)
      row['PF (Employee)'] = Math.round(rec.pfEmployee)
      row['ESI (Employee)'] = Math.round(rec.esiEmployee)
      row['PF (Employer)'] = Math.round(rec.pfEmployer)
      row['ESI (Employer)'] = Math.round(rec.esiEmployer)
      row['Gratuity'] = Math.round(rec.gratuity)
      row['Net Payable'] = Math.round(rec.netPay)
      row['Total (CTC/Mo)'] = Math.round(rec.totalCTC)
      return row
    })
    const ws = XLSX.utils.json_to_sheet(rows)
    const wb = { Sheets: { Payroll: ws }, SheetNames: ['Payroll'] }
    const buf = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
    FileSaver.saveAs(
      new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }),
      `payroll_${selectedMonth}_${selectedYear}.xlsx`
    )
  }

  const fmt = (val: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(Math.round(val || 0));
  }

  return (
    <GlobalLayout>
      <div className="min-h-screen bg-gradient-to-br from-gray-100 via-gray-200 to-gray-300 p-6 text-gray-900">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-teal-500">
            Payroll Calculation
          </h1>
          <div className="flex items-center gap-3 bg-white rounded-xl shadow-sm border border-gray-200 px-4 py-2">
            <Button onClick={goToPrevMonth} variant="ghost" size="sm" className="h-8 w-8 p-0">
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <span className="text-lg font-semibold text-gray-800 min-w-[160px] text-center">
              {monthLabel}
            </span>
            <Button onClick={goToNextMonth} variant="ghost" size="sm" className="h-8 w-8 p-0">
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <Card className="bg-white border border-gray-300 rounded-lg shadow-sm mb-6">
          <CardHeader className="bg-blue-50 p-4 rounded-t-lg">
             <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold text-gray-900">
                    Payroll Sheet — {monthLabel}
                </CardTitle>
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                      <Label className="text-sm font-semibold text-gray-700">Month:</Label>
                      <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                      <SelectTrigger className="w-[120px] bg-white border-gray-300">
                          <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                          {Array.from({ length: 12 }, (_, i) => (
                          <SelectItem key={i} value={(i + 1).toString().padStart(2, "0")}>
                              {new Date(0, i).toLocaleString("default", { month: "long" })}
                          </SelectItem>
                          ))}
                      </SelectContent>
                      </Select>
                  </div>
                  <div className="flex items-center gap-2">
                      <Label className="text-sm font-semibold text-gray-700">Year:</Label>
                      <Select value={selectedYear} onValueChange={setSelectedYear}>
                      <SelectTrigger className="w-[100px] bg-white border-gray-300">
                          <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                          {Array.from({ length: 10 }, (_, i) => (
                          <SelectItem key={i} value={(currentDate.getFullYear() - 5 + i).toString()}>
                              {currentDate.getFullYear() - 5 + i}
                          </SelectItem>
                          ))}
                      </SelectContent>
                      </Select>
                  </div>
                  <Button onClick={savePayroll} disabled={loading || saving} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white">
                      <Save className="h-4 w-4" /> {saving ? "Saving..." : "Save Payroll"}
                  </Button>
                  <Button
                    onClick={exportToExcel}
                    variant="outline"
                    className="flex items-center gap-2 bg-white hover:bg-green-50 border-green-300 text-green-700"
                  >
                    <Download className="h-4 w-4" />
                    Export to Excel
                  </Button>
                </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
             <div className="w-full h-[65vh] overflow-auto">
                <Table>
                    <TableHeader className="sticky top-0 z-10 bg-gray-100 shadow-sm border-b border-gray-200">
                        <TableRow>
                            <TableHead className="py-3 px-4 text-center font-bold text-gray-700 min-w-[60px]">S.No</TableHead>
                            <TableHead className="py-3 px-4 font-bold text-gray-700 min-w-[100px]">Code</TableHead>
                            <TableHead className="py-3 px-4 font-bold text-gray-700 min-w-[180px]">Employee Name</TableHead>
                            <TableHead className="py-3 px-4 text-center font-bold text-gray-700 min-w-[80px]">Days</TableHead>
                            <TableHead className="py-3 px-4 text-center font-bold text-gray-700 min-w-[100px] border-r border-gray-200">Worked</TableHead>
                            {salaryHeads.map(head => (
                                <TableHead key={head} className="py-3 px-4 text-right font-bold text-gray-700 min-w-[120px]">{head}</TableHead>
                            ))}
                            <TableHead className="py-3 px-4 text-right font-bold text-gray-900 bg-gray-200 min-w-[120px]">Gross Salary</TableHead>
                            <TableHead className="py-3 px-4 text-right font-bold text-gray-700 min-w-[120px] border-l border-gray-200">PF (Emp)</TableHead>
                            <TableHead className="py-3 px-4 text-right font-bold text-gray-700 min-w-[120px]">ESI (Emp)</TableHead>
                            <TableHead className="py-3 px-4 text-right font-bold text-gray-700 min-w-[120px]">PF (Employer)</TableHead>
                            <TableHead className="py-3 px-4 text-right font-bold text-gray-700 min-w-[120px]">ESI (Employer)</TableHead>
                            <TableHead className="py-3 px-4 text-right font-bold text-gray-700 min-w-[120px]">Gratuity</TableHead>
                            <TableHead className="py-3 px-4 text-right font-extrabold text-green-700 min-w-[140px] bg-green-50">Net Payable</TableHead>
                            <TableHead className="py-3 px-4 text-right font-extrabold text-blue-800 min-w-[140px] bg-blue-50">Total (CTC/Mo)</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={14 + salaryHeads.length} className="text-center py-16 text-gray-500">
                                    <div className="flex flex-col items-center gap-3">
                                        <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
                                        <p className="font-medium text-lg">Calculating exact payroll payouts...</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : records.length > 0 ? (
                            records.map((rec, idx) => (
                                <TableRow key={rec.id} className="hover:bg-gray-50/80 border-b border-gray-100 transition-colors">
                                    <TableCell className="text-center text-gray-600 border-r border-gray-100">
                                        {rec.isSaved && <CheckCircle className="inline h-4 w-4 text-green-500 mr-1" />}
                                        {idx + 1}
                                    </TableCell>
                                    <TableCell className="font-semibold text-gray-800 border-r border-gray-100">{rec.code}</TableCell>
                                    <TableCell className="font-semibold text-gray-900 border-r border-gray-100">{rec.name}</TableCell>
                                    <TableCell className="text-center font-medium text-gray-600 bg-gray-50/50">{rec.daysInMonth}</TableCell>
                                    <TableCell className="text-center font-bold text-blue-700 bg-blue-50/50 border-r border-gray-200">{rec.totalWorkingDays}</TableCell>
                                    {salaryHeads.map(head => (
                                        <TableCell key={head} className="text-right text-gray-700 font-medium">
                                            {fmt(rec.heads[head])}
                                        </TableCell>
                                    ))}
                                    <TableCell className="text-right font-bold text-gray-900 bg-gray-100">{fmt(rec.grossAmount)}</TableCell>
                                    <TableCell className="text-right text-orange-700 font-medium border-l border-gray-200 bg-orange-50/20">{fmt(rec.pfEmployee)}</TableCell>
                                    <TableCell className="text-right text-orange-700 font-medium bg-orange-50/20">{fmt(rec.esiEmployee)}</TableCell>
                                    <TableCell className="text-right text-purple-700 font-medium bg-purple-50/20">{fmt(rec.pfEmployer)}</TableCell>
                                    <TableCell className="text-right text-purple-700 font-medium bg-purple-50/20">{fmt(rec.esiEmployer)}</TableCell>
                                    <TableCell className="text-right text-teal-700 font-medium bg-teal-50/20">{fmt(rec.gratuity)}</TableCell>
                                    <TableCell className="text-right font-bold text-green-700 bg-green-50 text-lg">
                                        {fmt(rec.netPay)}
                                    </TableCell>
                                    <TableCell className="text-right font-bold text-blue-800 bg-blue-50 text-lg">
                                        {fmt(rec.totalCTC)}
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                             <TableRow>
                                <TableCell colSpan={14 + salaryHeads.length} className="text-center py-12 text-gray-500 font-medium text-lg">
                                    No payroll records found for this period.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
             </div>
          </CardContent>
        </Card>
      </div>
    </GlobalLayout>
  )
}
