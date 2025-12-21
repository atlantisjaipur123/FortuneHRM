# Multi-Tenant Implementation Guide

## 🔹 Overview

This application implements **strict multi-tenant isolation** where each company is a tenant and all data is isolated per company. This guide explains how to use the multi-tenant system correctly.

---

## 🔹 Core Components

### 1. Company Context (`app/context/company-context.tsx`)

**Purpose**: Manages the selected company state globally across the application.

**Usage**:
```tsx
import { useCompany } from "@/app/context/company-context"

function MyComponent() {
  const { company, setCompany } = useCompany()
  
  // company: { id: string; name: string } | null
  // setCompany: (company | null) => void
}
```

**Features**:
- Automatically persists to `localStorage`
- Restores on page refresh
- Syncs across browser tabs
- Triggers `router.refresh()` on company change

---

### 2. API Utility (`app/lib/api.ts`)

**Purpose**: Automatically includes company ID in all API requests.

**Usage**:
```tsx
import { api } from "@/app/lib/api"

// GET request
const data = await api.get("/api/employees")

// POST request
const result = await api.post("/api/employees", {
  name: "John Doe",
  email: "john@example.com"
})

// Custom options
const data = await api.get("/api/public-data", {
  requireCompany: false // Allow requests without company
})
```

**Features**:
- Automatically reads company from `localStorage`
- Adds `x-company-id` header to all requests
- Validates company selection by default
- Provides convenient HTTP method helpers

---

### 3. Backend Helpers (`app/lib/getCompanyid.ts`)

**Purpose**: Extract and validate company ID in API routes.

**Usage**:
```tsx
import { getCompanyId, validateCompanyId } from "@/app/lib/getCompanyid"

export async function GET(request: NextRequest) {
  // Extract company ID from headers
  const companyId = getCompanyId() // Throws if missing
  
  // Validate company exists
  const company = await validateCompanyId(companyId, prisma)
  
  // Use companyId in queries
  const data = await prisma.employee.findMany({
    where: { companyId, deletedAt: null }
  })
}
```

---

### 4. API Route Helper (`app/lib/api-helpers.ts`)

**Purpose**: Wrapper for API routes that handles authentication and company validation automatically.

**Usage**:
```tsx
import { withCompany, withCompanyFilter } from "@/app/lib/api-helpers"

export async function GET(request: NextRequest) {
  return withCompany(async (companyId, company, session) => {
    // companyId is guaranteed to be valid
    // company object is guaranteed to exist
    // session is guaranteed to be authenticated
    
    const employees = await prisma.employee.findMany({
      where: {
        ...withCompanyFilter(companyId), // Always use this helper
        // ... other filters
      }
    })
    
    return NextResponse.json({ data: employees })
  })
}
```

---

### 5. Company Guard Component (`app/components/company-guard.tsx`)

**Purpose**: Blocks page rendering if no company is selected.

**Usage**:
```tsx
import { CompanyGuard } from "@/app/components/company-guard"

export default function EmployeesPage() {
  return (
    <CompanyGuard>
      <div>
        {/* Your page content - only renders if company is selected */}
      </div>
    </CompanyGuard>
  )
}
```

**Hook Alternative**:
```tsx
import { useCompanyGuard } from "@/app/components/company-guard"

function MyComponent() {
  const { hasCompany, company, requireCompany } = useCompanyGuard()
  
  if (!hasCompany) {
    return <div>No company selected</div>
  }
  
  // Or throw error if company required
  const validatedCompany = requireCompany()
}
```

---

## 🔹 Implementation Rules

### ✅ DO

1. **Always use `withCompanyFilter(companyId)` in Prisma queries**
   ```tsx
   const data = await prisma.employee.findMany({
     where: {
       ...withCompanyFilter(companyId),
       // other filters
     }
   })
   ```

2. **Always get companyId from headers, never from request body**
   ```tsx
   // ✅ CORRECT
   const companyId = getCompanyId() // From header
   
   // ❌ WRONG
   const companyId = body.companyId // From body - NEVER DO THIS
   ```

3. **Use `CompanyGuard` on all tenant-specific pages**
   ```tsx
   export default function EmployeesPage() {
     return (
       <CompanyGuard>
         <EmployeesContent />
       </CompanyGuard>
     )
   }
   ```

4. **Use `api` utility for all frontend API calls**
   ```tsx
   // ✅ CORRECT
   const data = await api.get("/api/employees")
   
   // ❌ WRONG
   const res = await fetch("/api/employees") // Missing company header
   ```

### ❌ DON'T

1. **Never trust client-sent companyId in request body**
2. **Never query without companyId filter**
3. **Never hardcode companyId**
4. **Never use URL params for companyId**
5. **Never store companyId in cookies**

---

## 🔹 Example: Complete API Route

```tsx
import { NextRequest, NextResponse } from "next/server"
import { withCompany, withCompanyFilter } from "@/app/lib/api-helpers"
import { prisma } from "@/app/lib/prisma"

export async function GET(request: NextRequest) {
  return withCompany(async (companyId, company, session) => {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search") || ""
    
    const data = await prisma.employee.findMany({
      where: {
        ...withCompanyFilter(companyId), // CRITICAL
        ...(search && {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { email: { contains: search, mode: "insensitive" } },
          ]
        })
      },
      select: {
        id: true,
        name: true,
        email: true,
        // Never include companyId in response
      }
    })
    
    return NextResponse.json({ data })
  })
}

export async function POST(request: NextRequest) {
  return withCompany(async (companyId, company, session) => {
    const body = await request.json()
    
    // Create - companyId from header, NOT body
    const result = await prisma.employee.create({
      data: {
        ...body,
        companyId: companyId, // From header
        createdBy: session.id,
      }
    })
    
    return NextResponse.json({ data: result }, { status: 201 })
  })
}
```

---

## 🔹 Example: Protected Page

```tsx
"use client"

import { CompanyGuard } from "@/app/components/company-guard"
import { useCompany } from "@/app/context/company-context"
import { api } from "@/app/lib/api"
import { useEffect, useState } from "react"

export default function EmployeesPage() {
  return (
    <CompanyGuard>
      <EmployeesContent />
    </CompanyGuard>
  )
}

function EmployeesContent() {
  const { company } = useCompany()
  const [employees, setEmployees] = useState([])
  
  useEffect(() => {
    // API automatically includes company ID
    api.get("/api/employees")
      .then(setEmployees)
      .catch(console.error)
  }, [company?.id]) // Refresh when company changes
  
  return (
    <div>
      <h1>Employees - {company?.name}</h1>
      {/* Render employees */}
    </div>
  )
}
```

---

## 🔹 Testing Multi-Tenant Isolation

1. **Select Company A** → Verify only Company A's data appears
2. **Switch to Company B** → Verify data updates to Company B's data
3. **Check Network Tab** → Verify `x-company-id` header in all requests
4. **Check Database** → Verify queries include `companyId` filter
5. **Test Without Company** → Verify guard blocks access

---

## 🔹 Security Checklist

- [ ] All API routes use `withCompany` wrapper
- [ ] All Prisma queries include `withCompanyFilter(companyId)`
- [ ] No API route accepts `companyId` in request body
- [ ] All tenant-specific pages use `CompanyGuard`
- [ ] All frontend API calls use `api` utility
- [ ] Company ID never exposed in API responses
- [ ] Company validation happens in every route

---

## 🔹 Troubleshooting

### "Company ID is required" error
- Ensure company is selected in UI
- Check `localStorage` has `selectedCompany` key
- Verify `CompanyProvider` wraps your app

### Data from wrong company appears
- Check API route uses `withCompanyFilter(companyId)`
- Verify `x-company-id` header is sent
- Check Prisma query includes `companyId` filter

### Company selection not persisting
- Check `CompanyProvider` is in root layout
- Verify `localStorage` is enabled
- Check browser console for errors

---

## 🔹 Migration Checklist

When adding a new tenant-specific feature:

1. ✅ Wrap page with `CompanyGuard`
2. ✅ Use `api` utility for API calls
3. ✅ Use `withCompany` wrapper in API route
4. ✅ Use `withCompanyFilter` in Prisma queries
5. ✅ Never accept `companyId` in request body
6. ✅ Test with multiple companies
7. ✅ Verify data isolation

---

## 🔹 Summary

The multi-tenant system ensures:
- ✅ **One database** - All companies share the same database
- ✅ **Many companies** - Each company is a separate tenant
- ✅ **Zero data leakage** - Strict isolation enforced at every layer
- ✅ **Clean UX** - Seamless company switching
- ✅ **Predictable APIs** - Consistent patterns throughout

