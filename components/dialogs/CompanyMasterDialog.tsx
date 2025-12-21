"use client"
import type { CompanyExtended } from "@/app/lib/types"
import { CompanyInformationForm } from "./CompanyInformationForm"

interface CompanyMasterDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  company: CompanyExtended | null
  onSubmit: (formData: FormData) => void
}

export function CompanyMasterDialog({ isOpen, onOpenChange, company, onSubmit }: CompanyMasterDialogProps) {
  const handleUpdate = async (formData: FormData) => {
    await onSubmit(formData)
  }

  return (
    <CompanyInformationForm
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      onSubmit={handleUpdate}
      error={null}
      title="Company Master"
    />
  )
}
