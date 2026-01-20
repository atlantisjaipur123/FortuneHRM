"use client"

import { useEffect, useState } from "react"
import { api } from "@/app/lib/api"

export function useCompanySetups() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get("/api/setups")
      .then((res) => {
        // Handle both formats: direct data or wrapped in { data: {...} }
        setData(res.data || res)
        setLoading(false)
      })
      .catch((err) => {
        console.error("Failed to load setups:", err)
        setLoading(false)
      })
  }, [])

  return {
    data,
    loading,
  }
}
