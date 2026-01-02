/**
 * Multi-Tenant API Utility
 * 
 * Automatically includes company ID from localStorage in all API requests.
 * Ensures strict tenant isolation for all API calls.
 */

type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH"

interface ApiOptions {
  method?: HttpMethod
  body?: any
  token?: string
  requireCompany?: boolean // If true, throws error if no company selected
}

/**
 * Get the currently selected company from localStorage
 */
function getSelectedCompany(): { id: string; name: string } | null {
  if (typeof window === "undefined") {
    return null
  }

  try {
    const stored = localStorage.getItem("selectedCompany")
    if (!stored) return null
    
    const company = JSON.parse(stored)
    if (company?.id && company?.name) {
      return company
    }
    return null
  } catch (error) {
    console.error("Failed to parse selected company:", error)
    return null
  }
}

/**
 * Main API utility function
 * 
 * @param endpoint - API endpoint (e.g., "/api/employees")
 * @param options - Request options
 * @returns Promise with response data
 * @throws Error if request fails or company is required but not selected
 */
export async function API(
  endpoint: string,
  options: ApiOptions = {}
): Promise<any> {
  const {
    method = "GET",
    body,
    token,
    requireCompany = true, // Default to requiring company for tenant isolation
  } = options

  // Get selected company
  const company = getSelectedCompany()

  // Validate company selection if required
  if (requireCompany && !company?.id) {
    throw new Error(
      "No company selected. Please select a company before making this request."
    )
  }

  // Build headers
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  }

  // Add authorization token if provided
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  // Add company ID header (CRITICAL for tenant isolation)
  if (company?.id) {
    headers["x-company-id"] = company.id
  }

  // Build request options
  const requestOptions: RequestInit = {
    method,
    headers,
  }

  // Add body for non-GET requests
  if (body && method !== "GET") {
    requestOptions.body = JSON.stringify(body)
  }

  // Make the request
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || ""
  const url = `${baseUrl}${endpoint}`

  try {
    const res = await fetch(url, requestOptions)

    // Handle non-JSON responses
    const contentType = res.headers.get("content-type")
    if (!contentType?.includes("application/json")) {
      const text = await res.text()
      if (!res.ok) {
        throw new Error(`Request failed with status ${res.status}`)
      }
      return await res.text()
    }

    const data = await res.json()

    if (!res.ok) {
      // Handle specific error cases
      if (res.status === 401) {
        throw new Error("Unauthorized. Please log in again.")
      }
      if (res.status === 403) {
        throw new Error("Access denied. You don't have permission for this action.")
      }
      if (res.status === 400 && data.error?.includes("company")) {
        throw new Error("Company validation failed. Please select a company.")
      }
      
      throw new Error(data.error || data.message || `Request failed with status ${res.status}`)
    }

    return data
  } catch (error) {
    // Re-throw known errors
    if (error instanceof Error) {
      throw error
    }
    // Handle network errors
    throw new Error("Network error. Please check your connection.")
  }
}

/**
 * Convenience methods for common HTTP verbs
 */
export const api = {
  get: (endpoint: string, options?: Omit<ApiOptions, "method">) =>
    API(endpoint, { ...options, method: "GET" }),
  
  post: (endpoint: string, body?: any, options?: Omit<ApiOptions, "method" | "body">) =>
    API(endpoint, { ...options, method: "POST", body }),
  
  put: (endpoint: string, body?: any, options?: Omit<ApiOptions, "method" | "body">) =>
    API(endpoint, { ...options, method: "PUT", body }),
  
  patch: (endpoint: string, body?: any, options?: Omit<ApiOptions, "method" | "body">) =>
    API(endpoint, { ...options, method: "PATCH", body }),
  
  delete: (endpoint: string, options?: Omit<ApiOptions, "method">) =>
    API(endpoint, { ...options, method: "DELETE" }),
}
