'use client'

import { useState, useEffect } from 'react'
import {
  Plus,
  X,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Edit3,
} from 'lucide-react'
import { GlobalLayout } from '@/app/components/global-layout'

type LeaveTypeConfig = {
  id: string
  name: string
  code?: string
  type?: 'Full Day' | 'Half Day'
  payConsume?: boolean
  allowApply?: boolean
  halfDay?: boolean

  // Accrued rules
  accrueRule?: 'None' | 'Fixed' | 'Attendance'
  fixedDays?: number
  fixedPeriod?: 'Yearly' | 'Monthly'
  plPer?: number
  plBasis?: string
  minAttendance?: number

  // Limits
  maxPerMonth?: number
  availedFrom?: string
  autoAllot?: boolean
  restrictDays?: number
  mandatoryDocDays?: number

  // Encash / Reimburse
  allowEncash?: boolean
  minEncash?: number
  maxEncash?: number

  // Carry-forward
  cfOption?: string
  cfMaxLimit?: number

  // Legacy (kept for compatibility)
  totalPerYear?: number
}

type Applicability =
  | { type: 'All' }
  | { type: 'Branch'; ids: string[] }
  | { type: 'Department'; ids: string[] }
  | { type: 'Level'; ids: string[] }

type LeavePolicy = {
  name: string
  description?: string
  applicability: Applicability
  leaveTypes: LeaveTypeConfig[]
  status: 'Active' | 'Inactive'
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
            className={`w-10 h-10 rounded-full flex items-center justify-center font-medium text-sm ${
              s.completed || s.number === current
                ? 'bg-green-600 text-white'
                : 'bg-gray-200 text-gray-600'
            }`}
          >
            {s.number}
          </div>
          <div className="ml-2 text-sm">{s.label}</div>
          {i < steps.length - 1 && (
            <div
              className={`flex-1 h-px mx-2 ${
                s.completed || s.number < current
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

/* -------------------------- Main Page -------------------------- */
export default function LeavePolicyPage() {
  /* ---------- Policies (from API) ---------- */
const [policies, setPolicies] = useState<LeavePolicy[]>([])
const [loading, setLoading] = useState(true)


  /* ---------- Modal & Form ---------- */
  const [showModal, setShowModal] = useState(false)
  const [editPolicyName, setEditPolicyName] = useState<string | null>(null)

  const [step, setStep] = useState(1)

  const [policyName, setPolicyName] = useState('')
  const [description, setDescription] = useState('')
  const [applicability, setApplicability] = useState<Applicability>({ type: 'All' })
  const [leaveTypes, setLeaveTypes] = useState<LeaveTypeConfig[]>([])

  // Load edit data
  useEffect(() => {
    const fetchPolicies = async () => {
      try {
        const res = await fetch('/api/leave',{
          credentials: 'include',
        })
        const json = await res.json()
  
        if (!res.ok) {
          alert(json.error || 'Failed to load leave policies')
          return
        }
  
        setPolicies(json.data)
      } catch (err) {
        console.error(err)
        alert('Network error while loading leave policies')
      } finally {
        setLoading(false)
      }
    }
  
    fetchPolicies()
  }, [])
  

  const resetForm = () => {
    setStep(1)
    setPolicyName('')
    setDescription('')
    setApplicability({ type: 'All' })
    setLeaveTypes([])
    setEditPolicyName(null)
  }

  const openCreate = () => { resetForm(); setShowModal(true) }
  const openEdit = (name: string) => {
    const policy = policies.find(p => p.name === name)
    if (!policy) return
  
    setEditPolicyName(policy.name)
    setPolicyName(policy.name)
    setDescription(policy.description || '')
    setApplicability(policy.applicability)
    setLeaveTypes(
      policy.leaveTypes.map(lt => ({
        ...lt,
        id: lt.id || crypto.randomUUID(),
      }))
    )
    
    setShowModal(true)
  }
  
  
  const closeModal = () => { setShowModal(false); resetForm() }

  const nextStep = () => setStep(s => Math.min(s + 1, 3))
  const prevStep = () => setStep(s => Math.max(s - 1, 1))

  const stepsDef = [
    { number: 1, label: 'Leave Types & Rules', completed: step > 1 },
    { number: 2, label: 'Applicability', completed: step > 2 },
    { number: 3, label: 'Review', completed: false },
  ]

  /* ---------- Save ---------- */
  const handleSave = async () => {
    if (!policyName.trim()) return alert('Policy name is required.')
    if (leaveTypes.length === 0) return alert('Add at least one leave type.')
  
    try {
      const res = await fetch('/api/leave', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: policyName,
          description,
          applicability,
          leaveTypes,
          ...(editPolicyName && { originalPolicyName: editPolicyName }),
        }),
      })
  
      const json = await res.json()
      if (!res.ok) {
        alert(json.error || 'Failed to save policy')
        return
      }
  
      // reload list
      const refresh = await fetch('/api/leave',{
        credentials: 'include',
      })
      const refreshed = await refresh.json()
      setPolicies(refreshed.data)
  
      closeModal()
    } catch (err) {
      console.error(err)
      alert('Network error while saving')
    }
  }
  

  /* ---------- Leave Type Helpers ---------- */
  const addLeaveType = () => {
    setLeaveTypes(prev => [
      ...prev,
      {
        id: crypto.randomUUID(),
        name: '',
        code: '',
        type: 'Full Day',
        payConsume: false,
        allowApply: true,
        halfDay: false,
        accrueRule: 'None',
        fixedDays: 0,
        fixedPeriod: 'Yearly',
        plPer: 0,
        plBasis: 'Select',
        minAttendance: 0,
        maxPerMonth: 0,
        availedFrom: '1st',
        autoAllot: false,
        restrictDays: 0,
        mandatoryDocDays: 0,
        allowEncash: false,
        minEncash: 0,
        maxEncash: 0,
        cfOption: 'Lapse at the end of Year',
        cfMaxLimit: 0,
        totalPerYear: 0,
      },
    ])
  }

  const updateLeaveType = (
    id: string,
    field: keyof LeaveTypeConfig,
    value: any
  ) => {
    setLeaveTypes(prev =>
      prev.map(lt => (lt.id === id ? { ...lt, [field]: value } : lt))
    )
  }
  
  const removeLeaveType = (id: string) => {
    setLeaveTypes(prev => prev.filter(lt => lt.id !== id))
  }
  

  /* ---------- Delete ---------- */
  const handleDelete = async (name: string) => {
    if (!confirm('Delete this policy?')) return
  
    const res = await fetch('/api/leave', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ policyName: name }),
      credentials: 'include',
    })
  
    const json = await res.json()
    if (!res.ok) {
      alert(json.error || 'Delete failed')
      return
    }
  
    setPolicies(prev => prev.filter(p => p.name !== name))
  }
  

  /* ---------- Applicability Helpers ---------- */
  const toggleApplicability = (type: Applicability['type']) => {
    if (type === 'All') {
      setApplicability({ type: 'All' })
    } else {
      setApplicability({ type, ids: [] })
    }
  }
  
  const toggleId = (id: string) => {
    if (applicability.type === 'All') return
    setApplicability(prev => {
      if (prev.type === 'All') return prev
      return {
        ...prev,
        ids: prev.ids.includes(id)
          ? prev.ids.filter((x: string) => x !== id)
          : [...prev.ids, id],
      }
    })
  }
  

  // Demo data (replace with API)
  const branches = ['HQ', 'North', 'South', 'East', 'West']
  const departments = ['HR', 'IT', 'Finance', 'Sales', 'Marketing']
  const levels = ['L1', 'L2', 'L3', 'L4', 'L5']

  return (
    <GlobalLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold">Leave Policy</h1>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            <Plus className="w-5 h-5" /> CREATE LEAVE POLICY
          </button>
        </div>

        {/* ---------- Table ---------- */}
        {loading && (
          <div className="text-center py-6 text-gray-500 text-sm">
            Loading leave policies...
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
                  Leave Types
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
              {policies.map(p => {
                const appText =
                  p.applicability.type === 'All'
                    ? 'All'
                    : `${p.applicability.type}: ${p.applicability.ids.join(', ') || '—'}`
                return (
                  <tr key={p.name} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm">{p.name}</td>
                    <td className="px-4 py-3 text-sm">
                      {p.leaveTypes.map(lt => lt.name).join(', ')}
                    </td>
                    <td className="px-4 py-3 text-sm">{appText}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {p.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 flex gap-3">
                      <button
                        onClick={() => openEdit(p.name)}
                        className="text-blue-600 hover:text-blue-800 flex items-center gap-1 text-sm"
                      >
                        <Edit3 className="w-4 h-4" /> Edit
                      </button>
                      <button
                        onClick={() => handleDelete(p.name)}
                        className="text-red-600 hover:text-red-800 flex items-center gap-1 text-sm"
                      >
                        <Trash2 className="w-4 h-4" /> Delete
                      </button>
                    </td>
                  </tr>
                )
              })}
              {!loading && policies.length === 0 && (

                <tr>
                  <td colSpan={5} className="text-center py-6 text-gray-500 text-sm">
                    No leave policies found.
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
                {editPolicyName ? 'Edit Leave Policy' : 'Create Leave Policy'}
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
              {/* Step 1 – Leave Types & Rules */}
              {step === 1 && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Policy Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={policyName}
                      onChange={e => setPolicyName(e.target.value)}
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="e.g. Standard Leave Policy"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      value={description}
                      onChange={e => setDescription(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Optional"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <label className="block text-sm font-medium text-gray-700">
                        Leave Types & Rules
                      </label>
                      <button
                        onClick={addLeaveType}
                        className="text-green-600 hover:text-green-700 text-sm font-medium flex items-center gap-1"
                      >
                        <Plus className="w-4 h-4" /> Add Type
                      </button>
                    </div>

                    <div className="space-y-6">
                      {leaveTypes.map(lt => (
                        <div
                          key={lt.id}
                          className="p-4 bg-gray-50 rounded-lg border border-gray-200"
                        >
                          {/* Row 1: Name, Code, Type */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <div>
                              <label className="block text-xs font-medium text-gray-600">
                                Leave Name <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="text"
                                placeholder="e.g. Sick Leave"
                                value={lt.name}
                                onChange={e => updateLeaveType(lt.id, 'name', e.target.value)}
                                className="mt-1 w-full px-3 py-1 border rounded text-sm"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-600">
                                Leave Code
                              </label>
                              <input
                                type="text"
                                placeholder="e.g. SL"
                                value={lt.code ?? ''}
                                onChange={e => updateLeaveType(lt.id, 'code', e.target.value)}
                                className="mt-1 w-full px-3 py-1 border rounded text-sm"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-600">
                                Leave Type
                              </label>
                              <select
                                value={lt.type ?? 'Full Day'}
                                onChange={e => updateLeaveType(lt.id, 'type', e.target.value)}
                                className="mt-1 w-full px-3 py-1 border rounded text-sm"
                              >
                                <option>Full Day</option>
                                <option>Half Day</option>
                              </select>
                            </div>
                          </div>

                          {/* Row 2: Checkboxes */}
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={lt.payConsume ?? false}
                                onChange={e => updateLeaveType(lt.id, 'payConsume', e.target.checked)}
                                className="h-4 w-4 text-green-600"
                              />
                              <label className="text-xs">1 Pay Leave Consume For 1 day Leave</label>
                            </div>
                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={lt.allowApply ?? true}
                                onChange={e => updateLeaveType(lt.id, 'allowApply', e.target.checked)}
                                className="h-4 w-4 text-green-600"
                              />
                              <label className="text-xs">Allow Users to Apply Leaves</label>
                            </div>
                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={lt.halfDay ?? false}
                                onChange={e => updateLeaveType(lt.id, 'halfDay', e.target.checked)}
                                className="h-4 w-4 text-green-600"
                              />
                              <label className="text-xs">Available for HalfDay Leave</label>
                            </div>
                            <div className="flex justify-end">
                              <button
                                onClick={() => removeLeaveType(lt.id)}
                                className="text-red-600 hover:text-red-800"
                              >
                                <Trash2 className="w-5 h-5" />
                              </button>
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
                                  name={`accrue_${lt.id}`}
                                  checked={lt.accrueRule === 'None'}
                                  onChange={() => updateLeaveType(lt.id, 'accrueRule', 'None')}
                                  className="h-4 w-4 text-green-600"
                                />
                                <span className="text-sm">None</span>
                              </label>

                              <label className="flex items-center gap-1">
                                <input
                                  type="radio"
                                  name={`accrue_${lt.id}`}
                                  checked={lt.accrueRule === 'Fixed'}
                                  onChange={() => updateLeaveType(lt.id, 'accrueRule', 'Fixed')}
                                  className="h-4 w-4 text-green-600"
                                />
                                <span className="text-sm">Fixed</span>
                              </label>

                              {lt.accrueRule === 'Fixed' && (
                                <div className="flex items-center gap-2">
                                  <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={lt.fixedDays ?? 0}
                                    onChange={e => updateLeaveType(lt.id, 'fixedDays', Number(e.target.value))}
                                    className="w-20 px-2 py-1 border rounded text-sm"
                                  />
                                  <span className="text-sm">Days</span>
                                  <select
                                    value={lt.fixedPeriod ?? 'Yearly'}
                                    onChange={e => updateLeaveType(lt.id, 'fixedPeriod', e.target.value)}
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
                                  name={`accrue_${lt.id}`}
                                  checked={lt.accrueRule === 'Attendance'}
                                  onChange={() => updateLeaveType(lt.id, 'accrueRule', 'Attendance')}
                                  className="h-4 w-4 text-green-600"
                                />
                                <span className="text-sm">Attendance/Performance Basis</span>
                              </label>

                              {lt.accrueRule === 'Attendance' && (
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="text-sm">1 PL =</span>
                                  <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={lt.plPer ?? 0}
                                    onChange={e => updateLeaveType(lt.id, 'plPer', Number(e.target.value))}
                                    className="w-20 px-2 py-1 border rounded text-sm"
                                  />
                                  <select
                                    value={lt.plBasis ?? 'Select'}
                                    onChange={e => updateLeaveType(lt.id, 'plBasis', e.target.value)}
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
                                    step="0.01"
                                    value={lt.minAttendance ?? 0}
                                    onChange={e => updateLeaveType(lt.id, 'minAttendance', Number(e.target.value))}
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
                                  step="0.01"
                                  value={lt.maxPerMonth ?? 0}
                                  onChange={e => updateLeaveType(lt.id, 'maxPerMonth', Number(e.target.value))}
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
                                  value={lt.availedFrom ?? '1st'}
                                  onChange={e => updateLeaveType(lt.id, 'availedFrom', e.target.value)}
                                  className="px-2 py-1 border rounded text-sm"
                                >
                                  <option>1st</option>
                                  <option>2nd</option>
                                  <option>3rd</option>
                                  <option>4th</option>
                                  <option>5th</option>
                                </select>
                                <span className="text-sm">Month of Joining Date</span>
                                <label className="flex items-center gap-1 ml-4">
                                  <input
                                    type="checkbox"
                                    checked={lt.autoAllot ?? false}
                                    onChange={e => updateLeaveType(lt.id, 'autoAllot', e.target.checked)}
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
                                  step="0.01"
                                  value={lt.restrictDays ?? 0}
                                  onChange={e => updateLeaveType(lt.id, 'restrictDays', Number(e.target.value))}
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
                                  step="0.01"
                                  value={lt.mandatoryDocDays ?? 0}
                                  onChange={e => updateLeaveType(lt.id, 'mandatoryDocDays', Number(e.target.value))}
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
                                checked={lt.allowEncash ?? false}
                                onChange={e => updateLeaveType(lt.id, 'allowEncash', e.target.checked)}
                                className="h-4 w-4 text-green-600"
                              />
                              <label className="text-sm">Allow</label>
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-600">MinLimit</label>
                              <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={lt.minEncash ?? 0}
                                onChange={e => updateLeaveType(lt.id, 'minEncash', Number(e.target.value))}
                                className="mt-1 w-full px-2 py-1 border rounded text-sm"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-600">MaxLimit</label>
                              <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={lt.maxEncash ?? 0}
                                onChange={e => updateLeaveType(lt.id, 'maxEncash', Number(e.target.value))}
                                className="mt-1 w-full px-2 py-1 border rounded text-sm"
                              />
                            </div>
                          </div>

                          {/* Carry Forward Options */}
                          <div className="mb-4">
                            <label className="block text-xs font-medium text-gray-600 mb-1">
                              CF Options Available
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
                                    name={`cf_${lt.id}`}
                                    checked={lt.cfOption === opt}
                                    onChange={() => updateLeaveType(lt.id, 'cfOption', opt)}
                                    className="h-4 w-4 text-green-600"
                                  />
                                  <span className="text-sm">{opt}</span>
                                </label>
                              ))}
                            </div>
                            {lt.cfOption?.includes('Max Limit') && (
                              <div className="mt-2 flex items-center gap-2">
                                <span className="text-sm">Maximum Limit:</span>
                                <input
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  value={lt.cfMaxLimit ?? 0}
                                  onChange={e => updateLeaveType(lt.id, 'cfMaxLimit', Number(e.target.value))}
                                  className="w-24 px-2 py-1 border rounded text-sm"
                                />
                                <span className="text-sm">Days</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                      {leaveTypes.length === 0 && (
                        <p className="text-gray-500 text-sm">
                          No leave types added yet.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2 – Applicability */}
              {step === 2 && (
                <div className="space-y-6">
                  <p className="text-sm text-gray-600">
                    Choose where this policy will be applicable.
                  </p>

                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="app"
                      checked={applicability.type === 'All'}
                      onChange={() => toggleApplicability('All')}
                      className="h-4 w-4 text-green-600"
                    />
                    <span className="font-medium">All (company-wide)</span>
                  </label>

                  <div>
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="app"
                        checked={applicability.type === 'Branch'}
                        onChange={() => toggleApplicability('Branch')}
                        className="h-4 w-4 text-green-600"
                      />
                      <span className="font-medium">Branch</span>
                    </label>
                    {applicability.type === 'Branch' && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {branches.map(b => (
                          <label key={b} className="flex items-center gap-1 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={applicability.ids.includes(b)}
                              onChange={() => toggleId(b)}
                              className="h-4 w-4 text-green-600"
                            />
                            <span className="text-sm">{b}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="app"
                        checked={applicability.type === 'Department'}
                        onChange={() => toggleApplicability('Department')}
                        className="h-4 w-4 text-green-600"
                      />
                      <span className="font-medium">Department</span>
                    </label>
                    {applicability.type === 'Department' && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {departments.map(d => (
                          <label key={d} className="flex items-center gap-1 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={applicability.ids.includes(d)}
                              onChange={() => toggleId(d)}
                              className="h-4 w-4 text-green-600"
                            />
                            <span className="text-sm">{d}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="app"
                        checked={applicability.type === 'Level'}
                        onChange={() => toggleApplicability('Level')}
                        className="h-4 w-4 text-green-600"
                      />
                      <span className="font-medium">Level</span>
                    </label>
                    {applicability.type === 'Level' && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {levels.map(l => (
                          <label key={l} className="flex items-center gap-1 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={applicability.ids.includes(l)}
                              onChange={() => toggleId(l)}
                              className="h-4 w-4 text-green-600"
                            />
                            <span className="text-sm">{l}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Step 3 – Review */}
              {step === 3 && (
                <div className="space-y-4 text-sm">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded">
                    <div>
                      <strong className="block text-gray-700">Policy Name:</strong>
                      <p className="mt-1">{policyName || '-'}</p>
                    </div>
                    <div>
                      <strong className="block text-gray-700">Applicability:</strong>
                      <p className="mt-1">
                        {applicability.type === 'All'
                          ? 'All'
                          : `${applicability.type}: ${
                              (applicability as { ids: string[] }).ids.length
                                ? applicability.ids.join(', ')
                                : '—'
                            }`}
                      </p>
                    </div>
                  </div>

                  <div>
                    <strong className="block text-gray-700">Leave Types:</strong>
                    <ul className="mt-2 space-y-1">
                      {leaveTypes.map(lt => (
                        <li key={lt.id} className="flex justify-between text-sm">
                          <span>{lt.name || '(no name)'}</span>
                          <span className="text-gray-600">
                            Code: {lt.code || '-'}, Max/Month: {lt.maxPerMonth ?? 0}
                          </span>
                        </li>
                      ))}
                    </ul>
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
                  className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 font-medium"
                >
                  {editPolicyName ? 'UPDATE' : 'CREATE'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </GlobalLayout>
  )
}