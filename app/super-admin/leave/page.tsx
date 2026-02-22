'use client'

import { useState, useEffect, useRef } from 'react'
import {
  Plus,
  X,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Edit3,
} from 'lucide-react'
import { GlobalLayout } from '@/app/components/global-layout'
import { useCompanySetups } from '@/hooks/useCompanySetups'
import { api } from '@/app/lib/api'

type Applicability = {
  all: boolean
  branches: string[]
  departments: string[]
  designations: string[]
  levels: string[]
  categories: string[]
  grades: string[]
  attendanceTypes: string[]
}

type LeaveConfig = {
  id: string
  name: string
  code: string
  description?: string
  applicability: Applicability
  status: 'Active' | 'Inactive'

  type: 'FULL_DAY' | 'HALF_DAY'
  payConsume: boolean
  leaveValue: number
  allowApply: boolean
  halfDay: boolean

  accrueRule: 'None' | 'Fixed' | 'Attendance'
  fixedDays: number
  fixedPeriod: 'Yearly' | 'Monthly'
  plPer: number
  plBasis: 'Attendance' | 'Performance' | ''
  minAttendance: number

  maxPerMonth: number
  availedFrom: string
  autoAllot: boolean

  restrictDays: number
  mandatoryDocDays: number

  allowEncash: boolean
  minEncash: number
  maxEncash: number

  cfOption: string
  cfMaxLimit: number

  // Optional: remove or mark as @deprecated
  totalPerYear?: number
}
/* -------------------------- Stepper -------------------------- */
function Stepper({
  current,
  steps,
}: {
  current: number
  steps: { number: number; label: string; completed: boolean }[]
}) {
  return (
    <div className="flex items-center justify-between mb-8">
      {steps.map((s, i) => (
        <div key={s.number} className="flex items-center flex-1">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center font-medium text-sm ${s.completed || s.number === current
              ? 'bg-green-600 text-white'
              : 'bg-gray-200 text-gray-600'
              }`}
          >
            {s.number}
          </div>
          <div className="ml-2 text-sm">{s.label}</div>
          {i < steps.length - 1 && (
            <div
              className={`flex-1 h-px mx-2 ${s.completed || s.number < current
                ? 'bg-green-600'
                : 'bg-gray-300'
                }`}
            />
          )}
        </div>
      ))}
    </div>
  )
}

const initialLeave: LeaveConfig = {
  id: '',
  name: '',
  code: '',
  description: '',
  applicability: { all: true, branches: [], departments: [], designations: [], levels: [], categories: [], grades: [], attendanceTypes: [] },
  status: 'Active',

  type: 'FULL_DAY',
  leaveValue: 1,
  payConsume: true,
  allowApply: true,
  halfDay: false,

  accrueRule: 'None',
  fixedDays: 0,
  fixedPeriod: 'Yearly',
  plPer: 0,
  plBasis: '',
  minAttendance: 0,

  maxPerMonth: 0,
  availedFrom: '1st',
  autoAllot: false,

  restrictDays: 0,
  mandatoryDocDays: 3,

  allowEncash: false,
  minEncash: 0,
  maxEncash: 0,

  cfOption: 'Lapse at the end of Year',
  cfMaxLimit: 0,

  totalPerYear: 0,
}

/* -------------------------- Main Page -------------------------- */
export default function LeavePage() {
  const { data: setups, loading: setupsLoading } = useCompanySetups();

  useEffect(() => {
    if (setups) {
      console.log("------- REAL DB SETUPS -------");
      console.log(setups);
      console.log("------------------------------");
    }
  }, [setups]);

  /* ---------- Leaves (from API) ---------- */
  const [leaves, setLeaves] = useState<LeaveConfig[]>([])
  const [loading, setLoading] = useState(true)
  /* ---------- Modal & Form ---------- */
  const [showModal, setShowModal] = useState(false)
  const [editLeaveId, setEditLeaveId] = useState<string | null>(null)

  const [step, setStep] = useState<number>(1)
  const [currentLeave, setCurrentLeave] = useState<LeaveConfig>(initialLeave)
  const [errors, setErrors] = useState({
    leaveName: '',
    leaveCode: '',
    applicability: '',
  })

  const branchSelectAllRef = useRef<HTMLInputElement>(null)
  const departmentSelectAllRef = useRef<HTMLInputElement>(null)
  const designationSelectAllRef = useRef<HTMLInputElement>(null)
  const levelSelectAllRef = useRef<HTMLInputElement>(null)
  const categorySelectAllRef = useRef<HTMLInputElement>(null)
  const gradeSelectAllRef = useRef<HTMLInputElement>(null)
  const attendanceTypeSelectAllRef = useRef<HTMLInputElement>(null)

  // Load data
  useEffect(() => {
    loadLeaves()
  }, [])

  useEffect(() => {
    if (branchSelectAllRef.current) {
      const app = currentLeave.applicability
      const allBranches = setups?.branches?.map((b: any) => b.name) || []
      const isAll = app.branches.length === allBranches.length && allBranches.every((id: string) => app.branches.includes(id))
      branchSelectAllRef.current.checked = isAll
      const isPartial = app.branches.length > 0 && !isAll
      branchSelectAllRef.current.indeterminate = isPartial
    }
    if (departmentSelectAllRef.current) {
      const app = currentLeave.applicability
      const allDepartments = setups?.departments?.map((d: any) => d.name) || []
      const isAll = app.departments.length === allDepartments.length && allDepartments.every((id: string) => app.departments.includes(id))
      departmentSelectAllRef.current.checked = isAll
      const isPartial = app.departments.length > 0 && !isAll
      departmentSelectAllRef.current.indeterminate = isPartial
    }
    if (designationSelectAllRef.current) {
      const app = currentLeave.applicability
      const allDesignations = setups?.designations?.map((d: any) => d.name) || []
      const isAll = app.designations.length === allDesignations.length && allDesignations.every((id: string) => app.designations.includes(id))
      designationSelectAllRef.current.checked = isAll
      const isPartial = app.designations.length > 0 && !isAll
      designationSelectAllRef.current.indeterminate = isPartial
    }
    if (levelSelectAllRef.current) {
      const app = currentLeave.applicability
      const allLevels = setups?.levels?.map((l: any) => l.name) || []
      const isAll = app.levels.length === allLevels.length && allLevels.every((id: string) => app.levels.includes(id))
      levelSelectAllRef.current.checked = isAll
      const isPartial = app.levels.length > 0 && !isAll
      levelSelectAllRef.current.indeterminate = isPartial
    }
    if (categorySelectAllRef.current) {
      const app = currentLeave.applicability
      const allCategories = setups?.categories?.map((c: any) => c.name) || []
      const isAll = app.categories.length === allCategories.length && allCategories.every((id: string) => app.categories.includes(id))
      categorySelectAllRef.current.checked = isAll
      const isPartial = app.categories.length > 0 && !isAll
      categorySelectAllRef.current.indeterminate = isPartial
    }
    if (gradeSelectAllRef.current) {
      const app = currentLeave.applicability
      const allGrades = setups?.grades?.map((g: any) => g.name) || []
      const isAll = app.grades.length === allGrades.length && allGrades.every((id: string) => app.grades.includes(id))
      gradeSelectAllRef.current.checked = isAll
      const isPartial = app.grades.length > 0 && !isAll
      gradeSelectAllRef.current.indeterminate = isPartial
    }
    if (attendanceTypeSelectAllRef.current) {
      const app = currentLeave.applicability
      const allAttendanceTypes = setups?.attendanceTypes?.map((a: any) => a.name) || []
      const isAll = app.attendanceTypes.length === allAttendanceTypes.length && allAttendanceTypes.every((id: string) => app.attendanceTypes.includes(id))
      attendanceTypeSelectAllRef.current.checked = isAll
      const isPartial = app.attendanceTypes.length > 0 && !isAll
      attendanceTypeSelectAllRef.current.indeterminate = isPartial
    }
  }, [currentLeave.applicability, setups])

  async function loadLeaves() {
    try {
      const json = await api.get('/api/leave')
      if (!json.success) {
        alert(json.error || 'Failed to load leave policies')
        return
      }
      setLeaves(json.policies)
    } catch (err) {
      console.error(err)
      alert('Network error while loading leave policies')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setStep(1)
    setCurrentLeave(initialLeave)
    setEditLeaveId(null)
    setErrors({ leaveName: '', leaveCode: '', applicability: '' })
  }

  const openCreate = () => {
    resetForm()
    setShowModal(true)
  }

  const openEdit = (id: string) => {
    let policy = leaves.find(p => p.id === id)

    if (!policy) return

    // Compat old applicability
    let app: any = policy.applicability
    if (app.type) {
      if (app.type === 'All') {
        app = { all: true, branches: [], departments: [], designations: [], levels: [], categories: [], grades: [], attendanceTypes: [] }
      } else {
        let key = ''
        if (app.type === 'Branch') key = 'branches'
        if (app.type === 'Department') key = 'departments'
        if (app.type === 'Designation') key = 'designations'
        if (app.type === 'Level') key = 'levels'
        if (app.type === 'Category') key = 'categories'
        if (app.type === 'Grade') key = 'grades'
        if (app.type === 'Attendance Type') key = 'attendanceTypes'
        app = { all: false, branches: [], departments: [], designations: [], levels: [], categories: [], grades: [], attendanceTypes: [], [key]: app.ids || [] }
      }
      policy = { ...policy, applicability: app }
    }

    setEditLeaveId(policy.id)
    setCurrentLeave(policy)
    setShowModal(true)
  }

  const closeModal = () => { setShowModal(false); resetForm() }

  const nextStep = () => {
    if (step === 1 && !validateLeave()) return
    if (step === 2 && !validateLeave()) return
    setStep(s => Math.min(s + 1, 3))
  }

  const prevStep = () => setStep(s => Math.max(s - 1, 1))

  const stepsDef = [
    { number: 1, label: 'Leave Rules', completed: step > 1 },
    { number: 2, label: 'Applicability', completed: step > 2 },
    { number: 3, label: 'Review', completed: false },
  ]

  /* ---------- Save ---------- */
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!validateLeave()) {
      setStep(1);
      return;
    }

    const payload = { ...currentLeave, id: editLeaveId || undefined };
    const method = payload.id ? 'patch' : 'post';

    setSaving(true);

    try {
      const json = await api[method]('/api/leave', payload);
      console.log("=== API RESPONSE ===", json);   // ← This will show exact error

      if (!json.success) {
        alert(`Save failed: ${json.error || 'Unknown error from server'}`);
        return;
      }

      // success
      if (method === 'post') {
        setLeaves(prev => [json.policy, ...prev]);
      } else {
        setLeaves(prev => prev.map(p => p.id === editLeaveId ? { ...p, ...payload, id: editLeaveId! } : p));
      }
      closeModal();
    } catch (err: any) {
      console.error("Full save error:", err);
      alert(`Failed to save leave: ${err.message || err}`);
    } finally {
      setSaving(false);
    }
  };

  const updateLeaveField = (field: keyof LeaveConfig, value: any) => {
    setCurrentLeave(prev => ({ ...prev, [field]: value }))
  }

  const handleAllChange = (checked: boolean) => {
    setCurrentLeave(prev => ({
      ...prev,
      applicability: { all: checked, branches: [], departments: [], designations: [], levels: [], categories: [], grades: [], attendanceTypes: [] }
    }))
    setErrors(prev => ({ ...prev, applicability: '' }))
  }

  const getApplicabilityKey = (type: 'Branch' | 'Department' | 'Designation' | 'Level' | 'Category' | 'Grade' | 'AttendanceType'): keyof Applicability => {
    const map: Record<string, keyof Applicability> = {
      Branch: 'branches',
      Department: 'departments',
      Designation: 'designations',
      Level: 'levels',
      Category: 'categories',
      Grade: 'grades',
      AttendanceType: 'attendanceTypes',
    }
    return map[type]
  }

  const toggleId = (type: 'Branch' | 'Department' | 'Designation' | 'Level' | 'Category' | 'Grade' | 'AttendanceType', id: string) => {
    setCurrentLeave(prev => {
      const app = prev.applicability
      const key = getApplicabilityKey(type)
      const ids = (app[key] as string[]) || []
      const newIds = ids.includes(id)
        ? ids.filter((x: string) => x !== id)
        : [...ids, id]
      return {
        ...prev,
        applicability: { ...app, all: false, [key]: newIds }
      }
    })
    setErrors(prev => ({ ...prev, applicability: '' }))
  }

  const handleSelectAll = (type: 'Branch' | 'Department' | 'Designation' | 'Level' | 'Category' | 'Grade' | 'AttendanceType', checked: boolean) => {
    setCurrentLeave(prev => {
      const app = prev.applicability
      const key = getApplicabilityKey(type)
      const allIds = getAllForType(type)
      const newIds = checked ? allIds : []
      return {
        ...prev,
        applicability: { ...app, all: false, [key]: newIds }
      }
    })
    setErrors(prev => ({ ...prev, applicability: '' }))
  }

  const getAllForType = (type: 'Branch' | 'Department' | 'Designation' | 'Level' | 'Category' | 'Grade' | 'AttendanceType') => {
    if (type === 'Branch') return setups?.branches?.map((b: any) => b.name) || []
    if (type === 'Department') return setups?.departments?.map((d: any) => d.name) || []
    if (type === 'Designation') return setups?.designations?.map((d: any) => d.name) || []
    if (type === 'Level') return setups?.levels?.map((l: any) => l.name) || []
    if (type === 'Category') return setups?.categories?.map((c: any) => c.name) || []
    if (type === 'Grade') return setups?.grades?.map((g: any) => g.name) || []
    if (type === 'AttendanceType') return setups?.attendanceTypes?.map((a: any) => a.name) || []
    return []
  }

  /* ---------- Delete ---------- */
  const handleDelete = async (id: string) => {
    if (!confirm('Delete this leave?')) return

    const old = leaves
    setLeaves(prev => prev.filter(p => p.id !== id))

    try {
      const json = await api.delete('/api/leave', { body: { id } })
      if (!json.success) throw new Error()
    } catch {
      setLeaves(old)
      alert('Delete failed')
    }
  }

  const validateLeave = () => {
    const newErrors = {
      leaveName: '',
      leaveCode: '',
      applicability: ''
    }

    if (!currentLeave.name.trim()) {
      newErrors.leaveName = 'Leave name is required'
    } else {
      const duplicateName = leaves.find(l => l.name.trim().toLowerCase() === currentLeave.name.trim().toLowerCase() && l.id !== editLeaveId)
      if (duplicateName) {
        newErrors.leaveName = 'Leave name already exists in the company'
      }
    }

    if (!currentLeave.code.trim()) {
      newErrors.leaveCode = 'Leave code is required'
    } else {
      const newApp = currentLeave.applicability
      const duplicateCode = leaves.find(l =>
        l.code.trim().toUpperCase() === currentLeave.code.trim().toUpperCase() &&
        l.id !== editLeaveId &&
        hasOverlappingApplicability(l.applicability, newApp)
      )
      if (duplicateCode) {
        const overlapDetails = getOverlapDetails(duplicateCode.applicability, newApp)
        newErrors.leaveCode = `Leave code already used in overlapping applicability: ${overlapDetails}`
      }
    }

    // Updated applicability check: Skip if all is true
    const app = currentLeave.applicability
    if (!app.all &&
      app.branches.length === 0 &&
      app.departments.length === 0 &&
      app.designations.length === 0 &&
      app.levels.length === 0 &&
      app.categories.length === 0 &&
      app.grades.length === 0 &&
      app.attendanceTypes.length === 0) {
      newErrors.applicability = 'At least one applicability must be selected'
    }

    setErrors(newErrors)

    return !newErrors.leaveName &&
      !newErrors.leaveCode &&
      !newErrors.applicability
  }

  // Helper functions (add these outside validateLeave)
  const hasOverlappingApplicability = (existing: Applicability, newApp: Applicability): boolean => {
    if (existing.all || newApp.all) return true; // Company-wide overlaps with anything

    return (
      arraysIntersect(existing.branches, newApp.branches) ||
      arraysIntersect(existing.departments, newApp.departments) ||
      arraysIntersect(existing.designations, newApp.designations) ||
      arraysIntersect(existing.levels, newApp.levels) ||
      arraysIntersect(existing.categories, newApp.categories) ||
      arraysIntersect(existing.grades, newApp.grades) ||
      arraysIntersect(existing.attendanceTypes, newApp.attendanceTypes)
    )
  }

  const getOverlapDetails = (existing: Applicability, newApp: Applicability): string => {
    const parts: string[] = []
    if (arraysIntersect(existing.branches, newApp.branches)) parts.push(`branches ${existing.branches.filter(id => newApp.branches.includes(id)).join(', ')}`)
    if (arraysIntersect(existing.departments, newApp.departments)) parts.push(`departments ${existing.departments.filter(id => newApp.departments.includes(id)).join(', ')}`)
    if (arraysIntersect(existing.designations, newApp.designations)) parts.push(`designations ${existing.designations.filter(id => newApp.designations.includes(id)).join(', ')}`)
    if (arraysIntersect(existing.levels, newApp.levels)) parts.push(`levels ${existing.levels.filter(id => newApp.levels.includes(id)).join(', ')}`)
    if (arraysIntersect(existing.categories, newApp.categories)) parts.push(`categories ${existing.categories.filter(id => newApp.categories.includes(id)).join(', ')}`)
    if (arraysIntersect(existing.grades, newApp.grades)) parts.push(`grades ${existing.grades.filter(id => newApp.grades.includes(id)).join(', ')}`)
    if (arraysIntersect(existing.attendanceTypes, newApp.attendanceTypes)) parts.push(`attendance types ${existing.attendanceTypes.filter(id => newApp.attendanceTypes.includes(id)).join(', ')}`)
    return parts.join('; ')
  }

  const arraysIntersect = (a: string[], b: string[]): boolean => {
    return a.some(id => b.includes(id))
  }
  return (
    <GlobalLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold">Leave</h1>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            <Plus className="w-5 h-5" /> CREATE LEAVE
          </button>
        </div>

        {/* ---------- Table ---------- */}
        {loading && (
          <div className="text-center py-6 text-gray-500 text-sm">
            Loading leaves...
          </div>
        )}

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full table-auto">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                  Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                  Code
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                  Applicability
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {leaves.map(p => {
                const app = p.applicability
                let appText = ''
                if (app.all) {
                  appText = 'All'
                } else {
                  const parts: string[] = []
                  if (app.branches?.length > 0) parts.push(`Branches: ${app.branches.join(', ')}`)
                  if (app.departments?.length > 0) parts.push(`Departments: ${app.departments.join(', ')}`)
                  if (app.levels?.length > 0) parts.push(`Levels: ${app.levels.join(', ')}`)
                  if (app.categories?.length > 0) parts.push(`Categories: ${app.categories.join(', ')}`)
                  appText = parts.join(' ; ')
                }
                return (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm">{p.name}</td>
                    <td className="px-4 py-3 text-sm">{p.code}</td>
                    <td className="px-4 py-3 text-sm">{appText || '-'}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {p.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 flex gap-3">
                      <button
                        onClick={() => openEdit(p.id)}
                        className="text-blue-600 hover:text-blue-800 flex items-center gap-1 text-sm"
                      >
                        <Edit3 className="w-4 h-4" /> Edit
                      </button>
                      <button
                        onClick={() => handleDelete(p.id)}
                        className="text-red-600 hover:text-red-800 flex items-center gap-1 text-sm"
                      >
                        <Trash2 className="w-4 h-4" /> Delete
                      </button>
                    </td>
                  </tr>
                )
              })}
              {!loading && leaves.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-6 text-gray-500 text-sm">
                    No leaves found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ====================== MODAL ====================== */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-5xl rounded-lg shadow-xl flex flex-col max-h-screen">
            {/* Header */}
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-xl font-semibold">
                {editLeaveId ? 'Edit Leave' : 'Create Leave'}
              </h2>
              <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Stepper */}
            <div className="px-6 pt-4">
              <Stepper current={step} steps={stepsDef} />
            </div>

            {/* Body */}
            <div className="flex-1 p-6 overflow-y-auto">
              {/* Step 1 – Leave Rules */}
              {step === 1 && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Leave Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={currentLeave.name}
                      onChange={e => {
                        const value = e.target.value
                        updateLeaveField('name', value)
                        if (value.trim()) {
                          setErrors(prev => ({ ...prev, leaveName: '' }))
                        }
                      }}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${errors.leaveName ? 'border-red-500' : ''}`}
                      placeholder="e.g. Sick Leave"
                    />
                    {errors.leaveName && (
                      <p className="text-red-500 text-xs mt-1">{errors.leaveName}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Leave Code <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={currentLeave.code}
                      onChange={e => {
                        const value = e.target.value
                        updateLeaveField('code', value)
                        if (value.trim()) {
                          setErrors(prev => ({ ...prev, leaveCode: '' }))
                        }
                      }}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${errors.leaveCode ? 'border-red-500' : ''}`}
                      placeholder="e.g. SL"
                    />
                    {errors.leaveCode && (
                      <p className="text-red-500 text-xs mt-1">{errors.leaveCode}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      value={currentLeave.description}
                      onChange={e => updateLeaveField('description', e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Optional"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <label className="block text-sm font-medium text-gray-700">
                        Leave Rules
                      </label>
                    </div>

                    <div className="space-y-6">
                      <div
                        className="p-4 bg-gray-50 rounded-lg border border-gray-200"
                      >
                        {/* Row 1: Type, Value */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <label className="block text-xs font-medium text-gray-600">
                              Leave Type
                            </label>
                            <select
                              value={currentLeave.type}
                              onChange={e => {
                                const type = e.target.value as 'FULL_DAY' | 'HALF_DAY'
                                updateLeaveField('type', type)
                                updateLeaveField('leaveValue', type === 'FULL_DAY' ? 1 : 0.5)
                              }}
                              className="mt-1 w-full px-3 py-1 border rounded text-sm"
                            >
                              <option value="FULL_DAY">Full Day</option>
                              <option value="HALF_DAY">Half Day</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-600">
                              Leave Value
                            </label>
                            <input
                              type="number"
                              value={currentLeave.leaveValue}
                              readOnly
                              className="mt-1 w-full px-3 py-1 border rounded text-sm bg-gray-50"
                            />
                          </div>
                        </div>

                        {/* Row 2: Checkboxes */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={currentLeave.payConsume ?? false}
                              onChange={e => updateLeaveField('payConsume', e.target.checked)}
                              className="h-4 w-4 text-green-600"
                            />
                            <label className="text-xs">1 Pay Leave Consume For 1 day Leave</label>
                          </div>
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={currentLeave.allowApply ?? true}
                              onChange={e => updateLeaveField('allowApply', e.target.checked)}
                              className="h-4 w-4 text-green-600"
                            />
                            <label className="text-xs">Allow Users to Apply Leaves</label>
                          </div>
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={currentLeave.halfDay ?? false}
                              onChange={e => updateLeaveField('halfDay', e.target.checked)}
                              className="h-4 w-4 text-green-600"
                            />
                            <label className="text-xs">Available for HalfDay Leave</label>
                          </div>
                        </div>

                        {/* Accrued Leave Rules */}
                        <div className="mb-4">
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Rules for Accrued Leave
                          </label>
                          <div className="flex flex-wrap gap-4 items-center">
                            <label className="flex items-center gap-1">
                              <input
                                type="radio"
                                name={`accrue`}
                                checked={currentLeave.accrueRule === 'None'}
                                onChange={() => updateLeaveField('accrueRule', 'None')}
                                className="h-4 w-4 text-green-600"
                              />
                              <span className="text-sm">None</span>
                            </label>

                            <label className="flex items-center gap-1">
                              <input
                                type="radio"
                                name={`accrue`}
                                checked={currentLeave.accrueRule === 'Fixed'}
                                onChange={() => updateLeaveField('accrueRule', 'Fixed')}
                                className="h-4 w-4 text-green-600"
                              />
                              <span className="text-sm">Fixed</span>
                            </label>

                            {currentLeave.accrueRule === 'Fixed' && (
                              <div className="flex items-center gap-2">
                                <input
                                  type="number"
                                  min="0"
                                  step="1"
                                  value={currentLeave.fixedDays ?? 0}
                                  onChange={e => updateLeaveField('fixedDays', Number(e.target.value))}
                                  className="w-20 px-2 py-1 border rounded text-sm"
                                />
                                <span className="text-sm">Days</span>
                                <select
                                  value={currentLeave.fixedPeriod ?? 'Yearly'}
                                  onChange={e => updateLeaveField('fixedPeriod', e.target.value)}
                                  className="px-2 py-1 border rounded text-sm"
                                >
                                  <option>Yearly</option>
                                  <option>Monthly</option>
                                </select>
                              </div>
                            )}

                            <label className="flex items-center gap-1">
                              <input
                                type="radio"
                                name={`accrue`}
                                checked={currentLeave.accrueRule === 'Attendance'}
                                onChange={() => updateLeaveField('accrueRule', 'Attendance')}
                                className="h-4 w-4 text-green-600"
                              />
                              <span className="text-sm">Attendance/Performance Basis</span>
                            </label>

                            {currentLeave.accrueRule === 'Attendance' && (
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="text-sm">1 PL =</span>
                                <input
                                  type="number"
                                  min="0"
                                  step="1"
                                  value={currentLeave.plPer ?? 0}
                                  onChange={e => updateLeaveField('plPer', Number(e.target.value))}
                                  className="w-20 px-2 py-1 border rounded text-sm"
                                />
                                <select
                                  value={currentLeave.plBasis ?? 'Select'}
                                  onChange={e => updateLeaveField('plBasis', e.target.value)}
                                  className="px-2 py-1 border rounded text-sm"
                                >
                                  <option>Select</option>
                                  <option>Attendance</option>
                                  <option>Performance</option>
                                </select>
                                <span className="text-sm">Minimum Attendance Required in year</span>
                                <input
                                  type="number"
                                  min="0"
                                  step="1"
                                  value={currentLeave.minAttendance ?? 0}
                                  onChange={e => updateLeaveField('minAttendance', Number(e.target.value))}
                                  className="w-20 px-2 py-1 border rounded text-sm"
                                />
                                <span className="text-sm">(0 means no limit)</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Max Leave & Availed From */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <label className="block text-xs font-medium text-gray-600">
                              Max Leave Can be availed
                            </label>
                            <div className="flex items-center gap-2">
                              <input
                                type="number"
                                min="0"
                                step="1"
                                value={currentLeave.maxPerMonth ?? 0}
                                onChange={e => updateLeaveField('maxPerMonth', Number(e.target.value))}
                                className="w-24 px-2 py-1 border rounded text-sm"
                              />
                              <span className="text-sm">in a Month (0 means no limit)</span>
                            </div>
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-600">
                              Leaves can be availed from
                            </label>
                            <div className="flex items-center gap-2">
                              <select
                                value={currentLeave.availedFrom ?? '1st'}
                                onChange={e => updateLeaveField('availedFrom', e.target.value)}
                                className="px-2 py-1 border rounded text-sm"
                              >
                                <option>1st</option>
                                <option>2nd</option>
                                <option>3rd</option>
                                <option>4th</option>
                                <option>5th</option>
                                <option>6th</option>
                                <option>7th</option>
                                <option>8th</option>
                                <option>9th</option>
                                <option>10th</option>
                                <option>11th</option>
                                <option>12th</option>
                              </select>
                              <span className="text-sm">Month of Joining Date</span>
                              <label className="flex items-center gap-1 ml-4">
                                <input
                                  type="checkbox"
                                  checked={currentLeave.autoAllot ?? false}
                                  onChange={e => updateLeaveField('autoAllot', e.target.checked)}
                                  className="h-4 w-4 text-green-600"
                                />
                                <span className="text-sm">Auto Allot Leave on pro-rata basis</span>
                              </label>
                            </div>
                          </div>
                        </div>

                        {/* Restrict & Mandatory Document */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <label className="block text-xs font-medium text-gray-600">
                              Restrict Leave Application, If total days are less than
                            </label>
                            <div className="flex items-center gap-2">
                              <input
                                type="number"
                                min="0"
                                step="1"
                                value={currentLeave.restrictDays ?? 0}
                                onChange={e => updateLeaveField('restrictDays', Number(e.target.value))}
                                className="w-24 px-2 py-1 border rounded text-sm"
                              />
                              <span className="text-sm">(0 means no limit)</span>
                            </div>
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-600">
                              Mandatory to upload document if leave days
                            </label>
                            <div className="flex items-center gap-2">
                              <input
                                type="number"
                                min="0"
                                step="1"
                                value={currentLeave.mandatoryDocDays ?? 0}
                                onChange={e => updateLeaveField('mandatoryDocDays', Number(e.target.value))}
                                className="w-24 px-2 py-1 border rounded text-sm"
                              />
                              <span className="text-sm">(0 means no limit)</span>
                            </div>
                          </div>
                        </div>

                        {/* Encash/Reimburse */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={currentLeave.allowEncash ?? false}
                              onChange={e => updateLeaveField('allowEncash', e.target.checked)}
                              className="h-4 w-4 text-green-600"
                            />
                            <label className="text-sm">Allow Encashment</label>
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-600">Min Encash</label>
                            <input
                              type="number"
                              min="0"
                              step="1"
                              value={currentLeave.minEncash ?? 0}
                              onChange={e => updateLeaveField('minEncash', Number(e.target.value))}
                              className="mt-1 w-full px-2 py-1 border rounded text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-600">Max Encash</label>
                            <input
                              type="number"
                              min="0"
                              step="1"
                              value={currentLeave.maxEncash ?? 0}
                              onChange={e => updateLeaveField('maxEncash', Number(e.target.value))}
                              className="mt-1 w-full px-2 py-1 border rounded text-sm"
                            />
                          </div>
                        </div>

                        {/* Carry Forward Options */}
                        <div className="mb-4">
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Carry Forward Options
                          </label>
                          <div className="space-y-1">
                            {[
                              'Carry Forward Balance to next year',
                              'Carry Forward Max Limit given below & Lapse Remaining',
                              'Carry Forward Max Limit given below & Reimburse Remaining',
                              'Reimburse all at the end of Year',
                              'Reimburse Max Limit given below & Lapse Remaining',
                              'Reimburse Max Limit given below & Carry Forward Remaining',
                              'Lapse at the end of Year',
                            ].map((opt, i) => (
                              <label key={i} className="flex items-center gap-2">
                                <input
                                  type="radio"
                                  name={`cf`}
                                  checked={currentLeave.cfOption === opt}
                                  onChange={() => updateLeaveField('cfOption', opt)}
                                  className="h-4 w-4 text-green-600"
                                />
                                <span className="text-sm">{opt}</span>
                              </label>
                            ))}
                          </div>
                          {currentLeave.cfOption?.includes('Max Limit') && (
                            <div className="mt-2 flex items-center gap-2">
                              <span className="text-sm">Maximum Limit:</span>
                              <input
                                type="number"
                                min="0"
                                step="1"
                                value={currentLeave.cfMaxLimit ?? 0}
                                onChange={e => updateLeaveField('cfMaxLimit', Number(e.target.value))}
                                className="w-24 px-2 py-1 border rounded text-sm"
                              />
                              <span className="text-sm">Days</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2 – Applicability */}
              {step === 2 && (
                <div className="space-y-6">
                  <p className="text-sm text-gray-600">
                    Choose where this leave will be applicable. Selections within a category use OR logic, while selections across different categories use AND logic.
                  </p>
                  {errors.applicability && (
                    <p className="text-red-500 text-xs mt-1 mb-4">{errors.applicability}</p>
                  )}

                  {setupsLoading ? (
                    <div className="text-center py-6 text-gray-500 text-sm">
                      Loading setups...
                    </div>
                  ) : (
                    <>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={currentLeave.applicability.all}
                          onChange={e => handleAllChange(e.target.checked)}
                          className="h-4 w-4 text-green-600 rounded border-gray-300 focus:ring-green-500"
                        />
                        <span className="font-medium text-gray-900">All (company-wide)</span>
                      </label>

                      {!currentLeave.applicability.all && (
                        <>
                          <div className="border-t pt-4">
                            <div className="font-medium text-gray-800 mb-2">Branches</div>
                            <label className="flex items-center gap-2 mb-2">
                              <input
                                type="checkbox"
                                ref={branchSelectAllRef}
                                onChange={e => handleSelectAll('Branch', e.target.checked)}
                                className="h-4 w-4 text-green-600 rounded border-gray-300 focus:ring-green-500"
                              />
                              <span className="text-sm text-gray-700">Select All</span>
                            </label>
                            <div className="flex flex-wrap gap-3">
                              {setups?.branches?.map((b: any) => (
                                <label key={b.id} className="flex items-center gap-2 cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={currentLeave.applicability.branches.includes(b.name)}
                                    onChange={() => toggleId('Branch', b.name)}
                                    className="h-4 w-4 text-green-600 rounded border-gray-300 focus:ring-green-500"
                                  />
                                  <span className="text-sm text-gray-700">{b.name}</span>
                                </label>
                              ))}
                            </div>
                          </div>

                          <div className="border-t pt-4">
                            <div className="font-medium text-gray-800 mb-2">Departments</div>
                            <label className="flex items-center gap-2 mb-2">
                              <input
                                type="checkbox"
                                ref={departmentSelectAllRef}
                                onChange={e => handleSelectAll('Department', e.target.checked)}
                                className="h-4 w-4 text-green-600 rounded border-gray-300 focus:ring-green-500"
                              />
                              <span className="text-sm text-gray-700">Select All</span>
                            </label>
                            <div className="flex flex-wrap gap-3">
                              {setups?.departments?.map((d: any) => (
                                <label key={d.id} className="flex items-center gap-2 cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={currentLeave.applicability.departments.includes(d.name)}
                                    onChange={() => toggleId('Department', d.name)}
                                    className="h-4 w-4 text-green-600 rounded border-gray-300 focus:ring-green-500"
                                  />
                                  <span className="text-sm text-gray-700">{d.name}</span>
                                </label>
                              ))}
                            </div>
                          </div>

                          <div className="border-t pt-4">
                            <div className="font-medium text-gray-800 mb-2">Designations</div>
                            <label className="flex items-center gap-2 mb-2">
                              <input
                                type="checkbox"
                                ref={designationSelectAllRef}
                                onChange={e => handleSelectAll('Designation', e.target.checked)}
                                className="h-4 w-4 text-green-600 rounded border-gray-300 focus:ring-green-500"
                              />
                              <span className="text-sm text-gray-700">Select All</span>
                            </label>
                            <div className="flex flex-wrap gap-3">
                              {setups?.designations?.map((d: any) => (
                                <label key={d.id} className="flex items-center gap-2 cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={currentLeave.applicability.designations.includes(d.name)}
                                    onChange={() => toggleId('Designation', d.name)}
                                    className="h-4 w-4 text-green-600 rounded border-gray-300 focus:ring-green-500"
                                  />
                                  <span className="text-sm text-gray-700">{d.name}</span>
                                </label>
                              ))}
                            </div>
                          </div>

                          <div className="border-t pt-4">
                            <div className="font-medium text-gray-800 mb-2">Levels</div>
                            <label className="flex items-center gap-2 mb-2">
                              <input
                                type="checkbox"
                                ref={levelSelectAllRef}
                                onChange={e => handleSelectAll('Level', e.target.checked)}
                                className="h-4 w-4 text-green-600 rounded border-gray-300 focus:ring-green-500"
                              />
                              <span className="text-sm text-gray-700">Select All</span>
                            </label>
                            <div className="flex flex-wrap gap-3">
                              {setups?.levels?.map((l: any) => (
                                <label key={l.id} className="flex items-center gap-2 cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={currentLeave.applicability.levels.includes(l.name)}
                                    onChange={() => toggleId('Level', l.name)}
                                    className="h-4 w-4 text-green-600 rounded border-gray-300 focus:ring-green-500"
                                  />
                                  <span className="text-sm text-gray-700">{l.name}</span>
                                </label>
                              ))}
                            </div>
                          </div>

                          <div className="border-t pt-4">
                            <div className="font-medium text-gray-800 mb-2">Categories</div>
                            <label className="flex items-center gap-2 mb-2">
                              <input
                                type="checkbox"
                                ref={categorySelectAllRef}
                                onChange={e => handleSelectAll('Category', e.target.checked)}
                                className="h-4 w-4 text-green-600 rounded border-gray-300 focus:ring-green-500"
                              />
                              <span className="text-sm text-gray-700">Select All</span>
                            </label>
                            <div className="flex flex-wrap gap-3">
                              {setups?.categories?.map((c: any) => (
                                <label key={c.id} className="flex items-center gap-2 cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={currentLeave.applicability.categories.includes(c.name)}
                                    onChange={() => toggleId('Category', c.name)}
                                    className="h-4 w-4 text-green-600 rounded border-gray-300 focus:ring-green-500"
                                  />
                                  <span className="text-sm text-gray-700">{c.name}</span>
                                </label>
                              ))}
                            </div>
                          </div>
                          <div className="border-t pt-4">
                            <div className="font-medium text-gray-800 mb-2">Grades</div>
                            <label className="flex items-center gap-2 mb-2">
                              <input
                                type="checkbox"
                                ref={gradeSelectAllRef}
                                onChange={e => handleSelectAll('Grade', e.target.checked)}
                                className="h-4 w-4 text-green-600 rounded border-gray-300 focus:ring-green-500"
                              />
                              <span className="text-sm text-gray-700">Select All</span>
                            </label>
                            <div className="flex flex-wrap gap-3">
                              {setups?.grades?.map((g: any) => (
                                <label key={g.id} className="flex items-center gap-2 cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={currentLeave.applicability.grades.includes(g.name)}
                                    onChange={() => toggleId('Grade', g.name)}
                                    className="h-4 w-4 text-green-600 rounded border-gray-300 focus:ring-green-500"
                                  />
                                  <span className="text-sm text-gray-700">{g.name}</span>
                                </label>
                              ))}
                            </div>
                          </div>
                          <div className="border-t pt-4">
                            <div className="font-medium text-gray-800 mb-2">Attendance Types</div>
                            <label className="flex items-center gap-2 mb-2">
                              <input
                                type="checkbox"
                                ref={attendanceTypeSelectAllRef}
                                onChange={e => handleSelectAll('AttendanceType', e.target.checked)}
                                className="h-4 w-4 text-green-600 rounded border-gray-300 focus:ring-green-500"
                              />
                              <span className="text-sm text-gray-700">Select All</span>
                            </label>
                            <div className="flex flex-wrap gap-3">
                              {setups?.attendanceTypes?.map((a: any) => (
                                <label key={a.id} className="flex items-center gap-2 cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={currentLeave.applicability.attendanceTypes.includes(a.name)}
                                    onChange={() => toggleId('AttendanceType', a.name)}
                                    className="h-4 w-4 text-green-600 rounded border-gray-300 focus:ring-green-500"
                                  />
                                  <span className="text-sm text-gray-700">{a.name}</span>
                                </label>
                              ))}
                            </div>
                          </div>
                        </>
                      )}
                    </>
                  )}
                </div>
              )}


              {/* Step 3 – Review */}
              {step === 3 && (
                <div className="space-y-4 text-sm">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded">
                    <div>
                      <strong className="block text-gray-700">Leave Name:</strong>
                      <p className="mt-1">{currentLeave.name || '-'}</p>
                    </div>
                    <div>
                      <strong className="block text-gray-700">Applicability:</strong>
                      <p className="mt-1">
                        {currentLeave.applicability.all
                          ? 'All'
                          : (() => {
                            const parts: string[] = []
                            if (currentLeave.applicability.branches.length > 0) parts.push(`Branches: ${currentLeave.applicability.branches.join(', ')}`)
                            if (currentLeave.applicability.departments.length > 0) parts.push(`Departments: ${currentLeave.applicability.departments.join(', ')}`)
                            if (currentLeave.applicability.designations.length > 0) parts.push(`Designations: ${currentLeave.applicability.designations.join(', ')}`)
                            if (currentLeave.applicability.levels.length > 0) parts.push(`Levels: ${currentLeave.applicability.levels.join(', ')}`)
                            if (currentLeave.applicability.categories.length > 0) parts.push(`Categories: ${currentLeave.applicability.categories.join(', ')}`)
                            if (currentLeave.applicability.grades.length > 0) parts.push(`Grades: ${currentLeave.applicability.grades.join(', ')}`)
                            if (currentLeave.applicability.attendanceTypes.length > 0) parts.push(`Attendance Types: ${currentLeave.applicability.attendanceTypes.join(', ')}`)
                            return parts.join(' ; ') || '—'
                          })()}
                      </p>
                    </div>
                  </div>

                  <div>
                    <strong className="block text-gray-700">Leave Code:</strong>
                    <p className="mt-1">{currentLeave.code || '-'}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex justify-between items-center p-4 border-t bg-gray-50">
              <button
                onClick={prevStep}
                disabled={step === 1}
                className="flex items-center gap-1 px-4 py-2 text-gray-700 bg-white border rounded-md hover:bg-gray-50 disabled:opacity-50"
              >
                <ChevronLeft className="w-4 h-4" /> PREVIOUS
              </button>

              {step < 3 ? (
                <button
                  onClick={nextStep}
                  className="flex items-center gap-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  NEXT <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 font-medium disabled:opacity-50"
                >
                  {editLeaveId ? 'UPDATE' : 'CREATE'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </GlobalLayout>
  )
}