"use client"
import React from "react"
import { CompanyInformationForm } from "./CompanyInformationForm"

interface CreateCompanyDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onCreate: (formData: FormData) => Promise<void>
  error: string | null
}

export function CreateCompanyDialog({ isOpen, onOpenChange, onCreate, error }: CreateCompanyDialogProps) {
  return (
    <CompanyInformationForm
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      onSubmit={onCreate}
      error={error}
      title="Create New Company"
    />
  )
}