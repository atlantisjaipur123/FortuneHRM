"use client"

import CompanyTable from "./CompanyTable"

export default function CompanyTableWrapper({ companies }: { companies: any[] }) {
  return <CompanyTable companies={companies} />;
}
