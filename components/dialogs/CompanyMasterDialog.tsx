"use client"
import React from "react"
import { CompanyInformationForm } from "./CompanyInformationForm"
import type { CompanyExtended } from "@/app/lib/types"

interface CompanyMasterDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  selectedCompany: CompanyExtended | null
  onUpdate: (formData: FormData) => void
  error: string | null
}

export function CompanyMasterDialog({ isOpen, onOpenChange, selectedCompany, onUpdate, error }: CompanyMasterDialogProps) {
  const handleUpdate = async (formData: FormData) => {
    onUpdate(formData)
  }

  if (!selectedCompany) {
    return (
      <CompanyInformationForm
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        onSubmit={handleUpdate}
        error={error}
        title="Company Master"
      />
    )
  }

  return (
    <CompanyInformationForm
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      onSubmit={handleUpdate}
      error={error}
      title="Company Master"
    />
  )
}