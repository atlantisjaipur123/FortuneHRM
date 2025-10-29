'use client'

import { useState, useEffect } from 'react'
import { Plus, X, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react'
import { GlobalLayout } from '@/app/components/global-layout' // ✅ wrap in layout

/* -------------------------- Types -------------------------- */
type LeaveType =
  | 'Compensatory Off'
  | 'Privilege Leave'
  | 'Sick Leave'
  | 'Annual Leave'
  | 'Earned Leave'

const ALL_LEAVE_TYPES: LeaveType[] = [
  'Compensatory Off',
  'Privilege Leave',
  'Sick Leave',
  'Annual Leave',
  'Earned Leave',
]

/* -------------------------- Stepper Component -------------------------- */
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
            className={`w-10 h-10 rounded-full flex items-center justify-center font-medium text-sm
              ${
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

/* -------------------------- Main Page Component -------------------------- */
export default function LeavePolicyPage() {
  /* ---------- State ---------- */
  const [showModal, setShowModal] = useState(false)
  const [editId, setEditId] = useState<number | null>(null)
  const [policies, setPolicies] = useState([
    { id: 1, name: 'Single', applicable: 'Designation', status: 'Active' },
    { id: 2, name: 'Leave Policy', applicable: 'Company', status: 'Active' },
    { id: 3, name: 'ALL Leave', applicable: 'Company', status: 'Active' },
  ])

  /* ---------- Form State ---------- */
  const [step, setStep] = useState(1)
  const [policyName, setPolicyName] = useState('')
  const [description, setDescription] = useState('')
  const [selectedLeaves, setSelectedLeaves] = useState<LeaveType[]>([])
  const [applicability, setApplicability] = useState<
    'Company' | 'Designation'
  >('Company')
  const [advanceApplicability, setAdvanceApplicability] = useState<
    'None' | 'Employment type' | 'Employment status' | 'Branch' | 'Sub branch' | 'Region'
  >('None')

  /* ---------- Load edit data ---------- */
  useEffect(() => {
    if (editId) {
      const policy = policies.find((p) => p.id === editId)
      if (policy) {
        setPolicyName(policy.name)
        setDescription('Sample Description')
        setSelectedLeaves(['Compensatory Off'])
        setApplicability('Company')
        setAdvanceApplicability('None')
      }
    }
  }, [editId])

  /* ---------- Modal Controls ---------- */
  const openCreate = () => {
    resetForm()
    setEditId(null)
    setShowModal(true)
  }

  const openEdit = (id: number) => {
    setEditId(id)
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    resetForm()
  }

  const resetForm = () => {
    setStep(1)
    setPolicyName('')
    setDescription('')
    setSelectedLeaves([])
    setApplicability('Company')
    setAdvanceApplicability('None')
  }

  const nextStep = () => setStep((s) => Math.min(s + 1, 4))
  const prevStep = () => setStep((s) => Math.max(s - 1, 1))

  const stepsDef = [
    { number: 1, label: 'Add leave policy', completed: step > 1 },
    { number: 2, label: 'Applicability', completed: step > 2 },
    { number: 3, label: 'Advance applicability', completed: step > 3 },
    { number: 4, label: 'Review', completed: false },
  ]

  /* ---------- Save / Delete ---------- */
  const handleSave = () => {
    if (!policyName.trim()) return alert('Please enter a policy name.')

    if (editId) {
      setPolicies((prev) =>
        prev.map((p) =>
          p.id === editId
            ? { ...p, name: policyName, applicable: applicability }
            : p
        )
      )
    } else {
      const newPolicy = {
        id: Date.now(),
        name: policyName,
        applicable: applicability,
        status: 'Active',
      }
      setPolicies((prev) => [...prev, newPolicy])
    }

    closeModal()
  }

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this policy?')) {
      setPolicies((prev) => prev.filter((p) => p.id !== id))
    }
  }

  /* -------------------------- UI -------------------------- */
  return (
    <GlobalLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold">Leave Policy</h1>

          <button
            onClick={openCreate}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
          >
            <Plus className="w-5 h-5" />
            CREATE LEAVE POLICY
          </button>
        </div>

        {/* ---- Policy Table ---- */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full table-auto">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Applicable On
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {policies.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm">{p.name}</td>
                  <td className="px-4 py-3 text-sm">{p.applicable}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {p.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 flex gap-3">
                    <button
                      onClick={() => openEdit(p.id)}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(p.id)}
                      className="text-red-600 hover:text-red-800 text-sm font-medium flex items-center gap-1"
                    >
                      <Trash2 className="w-4 h-4" /> Delete
                    </button>
                  </td>
                </tr>
              ))}
              {policies.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="text-center py-6 text-gray-500 text-sm"
                  >
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
          <div className="bg-white w-full max-w-4xl rounded-lg shadow-xl flex flex-col max-h-screen">
            {/* Header */}
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-xl font-semibold text-gray-900">
                {editId ? 'Edit Leave Policy' : 'Create Leave Policy'}
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-700 transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Stepper */}
            <div className="px-6 pt-4">
              <Stepper current={step} steps={stepsDef} />
            </div>

            {/* Form */}
            <div className="flex-1 p-6 overflow-y-auto">
              {step === 1 && (
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Policy Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={policyName}
                      onChange={(e) => setPolicyName(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Enter policy name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Describe the policy"
                    />
                  </div>
                </div>
              )}
              {step === 2 && (
                <div className="space-y-5">
                  <p className="text-sm text-gray-600">
                    Choose where this policy will be applicable.
                  </p>
                  <div className="flex gap-8">
                    {['Company', 'Designation'].map((opt) => (
                      <label key={opt} className="flex items-center">
                        <input
                          type="radio"
                          name="applicability"
                          value={opt}
                          checked={applicability === opt}
                          onChange={() =>
                            setApplicability(opt as typeof applicability)
                          }
                          className="mr-2 h-4 w-4 text-green-600 focus:ring-green-500"
                        />
                        <span className="text-sm font-medium">{opt}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
              {step === 3 && (
                <div className="space-y-5">
                  <p className="text-sm text-gray-600">
                    Advance applicability (Optional)
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {[
                      'None',
                      'Employment type',
                      'Employment status',
                      'Branch',
                      'Sub branch',
                      'Region',
                    ].map((opt) => (
                      <label
                        key={opt}
                        className="flex items-center p-2 rounded hover:bg-gray-50 cursor-pointer"
                      >
                        <input
                          type="radio"
                          name="advance"
                          value={opt}
                          checked={advanceApplicability === opt}
                          onChange={() =>
                            setAdvanceApplicability(
                              opt as typeof advanceApplicability
                            )
                          }
                          className="mr-2 h-4 w-4 text-green-600 focus:ring-green-500"
                        />
                        <span className="text-sm">{opt}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
              {step === 4 && (
                <div className="space-y-4 text-sm">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded">
                    <div>
                      <strong className="block text-gray-700">
                        Policy Name:
                      </strong>
                      <p className="mt-1">{policyName || '-'}</p>
                    </div>
                    <div>
                      <strong className="block text-gray-700">
                        Applicability:
                      </strong>
                      <p className="mt-1">{applicability}</p>
                    </div>
                    <div>
                      <strong className="block text-gray-700">
                        Advance Applicability:
                      </strong>
                      <p className="mt-1">{advanceApplicability}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex justify-between items-center p-4 border-t bg-gray-50">
              <button
                onClick={prevStep}
                disabled={step === 1}
                className="flex items-center gap-1 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                <ChevronLeft className="w-4 h-4" />
                PREVIOUS
              </button>

              {step < 4 ? (
                <button
                  onClick={nextStep}
                  className="flex items-center gap-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition"
                >
                  NEXT
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={handleSave}
                  className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition font-medium"
                >
                  {editId ? 'UPDATE' : 'CREATE'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </GlobalLayout>
  )
}
