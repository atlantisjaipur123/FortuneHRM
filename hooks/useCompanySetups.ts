"use client"

import { useEffect, useState } from "react"
import { api } from "@/app/lib/api"

// 🌍 Global cache (shared across entire app)
let setupsCache: any = null
let pendingRequest: Promise<any> | null = null

export function useCompanySetups() {
  const [data, setData] = useState<any>(setupsCache)
  const [loading, setLoading] = useState(!setupsCache)

  useEffect(() => {
    // If already cached → instant render
    if (setupsCache) {
      setData(setupsCache)
      setLoading(false)
      return
    }

    // Prevent multiple parallel API calls
    if (!pendingRequest) {
      pendingRequest = api.get("/api/setups").then((res) => {
        const result = res.data || res
        setupsCache = result
        return result
      })
    }

    pendingRequest
      .then((result) => {
        setData(result)
        setLoading(false)
      })
      .catch((err) => {
        console.error("Failed to load setups:", err)
        setLoading(false)
      })
  }, [])

  return { data, loading }
}
