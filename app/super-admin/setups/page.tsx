
"use client"

import React, { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Trash2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { GlobalLayout } from "@/app/components/global-layout"

export default function SetupsPage() {
  const [openDialog, setOpenDialog] = useState<{ category: string; value?: string } | null>(null)
  const [branches, setBranches] = useState<string[]>(["Main Branch", "Branch A", "Branch B"])
  const [categories, setCategories] = useState<string[]>(["Full-Time", "Part-Time", "Contract"])
  const [designations, setDesignations] = useState<string[]>(["Manager", "Engineer", "Analyst"])
  const [departments, setDepartments] = useState<string[]>(["HR", "IT", "Finance"])
  const [levels, setLevels] = useState<string[]>(["Junior", "Mid", "Senior"])
  const [grades, setGrades] = useState<string[]>(["A1", "B2", "C3"])
  const [attendanceTypes, setAttendanceTypes] = useState<string[]>(["Biometric", "Manual", "App"])
  const [shifts, setShifts] = useState<string[]>(["Morning", "Afternoon", "Night"])

  const categoriesMap = {
    "Branch Detail": { state: branches, setState: setBranches },
    "Category": { state: categories, setState: setCategories },
    "Designation": { state: designations, setState: setDesignations },
    "Department": { state: departments, setState: setDepartments },
    "Level": { state: levels, setState: setLevels },
    "Grade": { state: grades, setState: setGrades },
    "Attendance Type": { state: attendanceTypes, setState: setAttendanceTypes },
    "Shift": { state: shifts, setState: setShifts },
  }

  const handleAdd = (category: string, value: string) => {
    if (value.trim()) {
      const { setState } = categoriesMap[category]
      setState((prev) => [...prev, value.trim()])
      setOpenDialog(null)
    }
  }

  const handleDelete = (category: string, index: number) => {
    if (confirm(`Are you sure you want to delete this item?`)) {
      const { state, setState } = categoriesMap[category]
      setState(state.filter((_, i) => i !== index))
    }
  }

  return (
    <GlobalLayout>
      <div className="min-h-screen bg-gradient-to-br from-gray-100 via-gray-200 to-gray-300 p-6 text-gray-900">
      <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-teal-500 mb-8">
        Setups Management
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {Object.entries(categoriesMap).map(([category, { state }]) => (
          <Card
            key={category}
            className="bg-white border border-gray-300 rounded-lg shadow-sm hover:shadow-md transition-shadow"
          >
            <CardHeader className="bg-blue-50 p-4 rounded-t-lg">
              <CardTitle className="text-lg font-semibold text-gray-900 flex justify-between items-center">
                {category}
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => setOpenDialog({ category, value: "" })}
                  className="bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                >
                  <Plus className="h-4 w-4 mr-2" /> Add
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              {state.length > 0 ? (
                <Table className="w-full">
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead className="text-gray-700">Item</TableHead>
                      <TableHead className="text-gray-700">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {state.map((item, index) => (
                      <TableRow
                        key={index}
                        className="hover:bg-gray-100 transition-colors"
                      >
                        <TableCell className="text-gray-800">{item}</TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(category, index)}
                            className="text-red-600 hover:text-red-700 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-gray-500 text-center py-3">No items yet.</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={openDialog !== null} onOpenChange={() => setOpenDialog(null)}>
        <DialogContent className="bg-white border border-gray-300 rounded-lg shadow-lg">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-gray-900">
              Add New {openDialog?.category}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-5 py-5">
            <div className="space-y-2">
              <Label htmlFor="new-item" className="text-gray-700">
                Value
              </Label>
              <Input
                id="new-item"
                value={openDialog?.value || ""}
                onChange={(e) => setOpenDialog({ ...openDialog!, value: e.target.value })}
                placeholder={`Enter new ${openDialog?.category.toLowerCase()}`}
                className="border-gray-300 bg-white focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <Button
              onClick={() => handleAdd(openDialog!.category, openDialog!.value || "")}
              className="w-full bg-blue-600 text-white hover:bg-blue-700 transition-colors"
            >
              Add
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      </div>
    </GlobalLayout>
  )
}