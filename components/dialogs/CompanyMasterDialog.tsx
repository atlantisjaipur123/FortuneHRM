"use client"
import { useState } from "react"
import type { CompanyExtended } from "@/app/lib/types"
import { CompanyInformationForm } from "./CompanyInformationForm"

interface CompanyMasterDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  company: CompanyExtended | null
  mode: "view" | "edit"
  onSubmit: (formData: FormData) => Promise<void>
}

export function CompanyMasterDialog({
  isOpen,
  onOpenChange,
  company,
  mode,
  onSubmit,
}: CompanyMasterDialogProps) {

  const [error, setError] = useState<string | null>(null)

  const handleUpdate = async (formData: FormData) => {
    setError(null)

    try {
      await onSubmit(formData)
      onOpenChange(false) // ✅ CLOSE ONLY ON SUCCESS
    } catch (err: any) {
      console.error(err)
      setError(
        err?.message ||
        "Unable to save company. Please fix the highlighted fields."
      )
      // ❌ DO NOT close dialog
    }
  }

  return (
    <CompanyInformationForm
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      initialData={company}
      mode={mode}              // "view" or "edit"
      onSubmit={handleUpdate}
      error={error}
      title={mode === "view" ? "View Company Details" : "Edit Company"}
    />

  )
}
