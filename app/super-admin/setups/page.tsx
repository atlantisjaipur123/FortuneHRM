"use client"

import React, { useEffect, useState } from "react"
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
import { api } from "@/app/lib/api"

/* ---------------- TYPES ---------------- */

type SetupItem = {
  id: string
  name: string
}

type SetupData = {
  branches: SetupItem[]
  categories: SetupItem[]
  designations: SetupItem[]
  departments: SetupItem[]
  levels: SetupItem[]
  grades: SetupItem[]
  attendanceTypes: SetupItem[]
}

/* ---------------- CONFIG ---------------- */

const setupConfig = [
  { key: "branches", label: "Branch Detail", type: "branch" },
  { key: "categories", label: "Category", type: "category" },
  { key: "designations", label: "Designation", type: "designation" },
  { key: "departments", label: "Department", type: "department" },
  { key: "levels", label: "Level", type: "level" },
  { key: "grades", label: "Grade", type: "grade" },
  { key: "attendanceTypes", label: "Attendance Type", type: "attendanceType" },
] as const

/* ---------------- PAGE ---------------- */

export default function SetupsPage() {
  const [loading, setLoading] = useState(true)
  const [openDialog, setOpenDialog] = useState<{
    label: string
    type: string
    value: string
  } | null>(null)

  const [data, setData] = useState<SetupData>({
    branches: [],
    categories: [],
    designations: [],
    departments: [],
    levels: [],
    grades: [],
    attendanceTypes: [],
  })

  /* ---------- LOAD DATA ---------- */

  const loadSetups = async () => {
    try {
      setLoading(true)
      const res = await api.get("/api/setups")
      setData(res)
    } catch (err: any) {
      alert(err.message || "Failed to load setups")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadSetups()
  }, [])

  /* ---------- ADD ---------- */

  const handleAdd = async () => {
    if (!openDialog?.value.trim()) return

    try {
      await api.post("/api/setups", {
        type: openDialog.type,
        name: openDialog.value.trim(),
      })

      await loadSetups()
      setOpenDialog(null)
    } catch (err: any) {
      alert(err.message)
    }
  }

  /* ---------- DELETE ---------- */

  const handleDelete = async (type: string, id: string) => {
    if (!confirm("Are you sure?")) return

    try {
      await api.delete(`/api/setups?type=${type}&id=${id}`)
      await loadSetups()
    } catch (err: any) {
      alert(err.message)
    }
  }

  /* ---------- UI ---------- */

  return (
    <GlobalLayout>
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6">Setups Management</h1>

        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {setupConfig.map(({ key, label, type }) => {
              const items = data[key]

              return (
                <Card key={label}>
                  <CardHeader>
                    <CardTitle className="flex justify-between items-center">
                      {label}
                      <Button
                        size="sm"
                        onClick={() =>
                          setOpenDialog({ label, type, value: "" })
                        }
                      >
                        <Plus className="h-4 w-4 mr-1" /> Add
                      </Button>
                    </CardTitle>
                  </CardHeader>

                  <CardContent>
                    {items.length === 0 ? (
                      <p className="text-muted-foreground text-sm">
                        No items yet
                      </p>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead className="text-right">
                              Actions
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {items.map((item) => (
                            <TableRow key={item.id}>
                              <TableCell>{item.name}</TableCell>
                              <TableCell className="text-right">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    handleDelete(type, item.id)
                                  }
                                >
                                  <Trash2 className="h-4 w-4 text-red-600" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}

        {/* ---------- ADD DIALOG ---------- */}

        <Dialog open={!!openDialog} onOpenChange={() => setOpenDialog(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                Add New {openDialog?.label}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <Label>Name</Label>
                <Input
                  value={openDialog?.value || ""}
                  onChange={(e) =>
                    setOpenDialog((prev) =>
                      prev ? { ...prev, value: e.target.value } : prev
                    )
                  }
                />
              </div>

              <Button onClick={handleAdd} className="w-full">
                Add
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </GlobalLayout>
  )
}
