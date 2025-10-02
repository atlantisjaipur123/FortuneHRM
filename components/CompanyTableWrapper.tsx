// components/CompanyTableWrapper.tsx
"use client"

import CompanyTable from "@/components/CompanyTable"

export default function CompanyTableWrapper({ companies }: { companies: any[] }) {
  return <CompanyTable companies={companies} />;
}
