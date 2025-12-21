"use client"

import React, { createContext, useContext, useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"

export type SelectedCompany = {
  id: string
  name: string
}

type CompanyContextType = {
  company: SelectedCompany | null
  setCompany: (company: SelectedCompany | null) => void
  isReady: boolean // Indicates if context has loaded from localStorage
}

const CompanyContext = createContext<CompanyContextType | undefined>(undefined)

export function CompanyProvider({ children }: { children: React.ReactNode }) {
  const [company, setCompanyState] = useState<SelectedCompany | null>(null)
  const [isReady, setIsReady] = useState(false)
  const router = useRouter()

  // Restore company from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem("selectedCompany")
      if (stored) {
        const parsed = JSON.parse(stored)
        // Validate structure
        if (parsed?.id && parsed?.name) {
          setCompanyState(parsed)
        } else {
          // Invalid data, clear it
          localStorage.removeItem("selectedCompany")
        }
      }
    } catch (error) {
      console.error("Failed to parse stored company:", error)
      localStorage.removeItem("selectedCompany")
    } finally {
      setIsReady(true)
    }
  }, [])

  // Sync localStorage with state changes (for cross-tab sync)
  useEffect(() => {
    if (!isReady) return

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "selectedCompany") {
        if (e.newValue) {
          try {
            const parsed = JSON.parse(e.newValue)
            if (parsed?.id && parsed?.name) {
              setCompanyState(parsed)
            }
          } catch (error) {
            console.error("Failed to parse company from storage event:", error)
          }
        } else {
          setCompanyState(null)
        }
      }
    }

    window.addEventListener("storage", handleStorageChange)
    return () => window.removeEventListener("storage", handleStorageChange)
  }, [isReady])

  const setCompany = useCallback((newCompany: SelectedCompany | null) => {
    setCompanyState(newCompany)
    
    if (newCompany) {
      // Validate before storing
      if (newCompany.id && newCompany.name) {
        localStorage.setItem("selectedCompany", JSON.stringify(newCompany))
        // Trigger a lightweight refresh to update server components
        router.refresh()
      } else {
        console.error("Invalid company data:", newCompany)
        localStorage.removeItem("selectedCompany")
      }
    } else {
      localStorage.removeItem("selectedCompany")
      router.refresh()
    }
  }, [router])

  return (
    <CompanyContext.Provider value={{ company, setCompany, isReady }}>
      {children}
    </CompanyContext.Provider>
  )
}

export function useCompany() {
  const ctx = useContext(CompanyContext)
  if (!ctx) {
    throw new Error("useCompany must be used inside CompanyProvider")
  }
  return ctx
}
