import { requireSuperAdmin, getCompanyById } from "@/app/lib/auth"
import { CompanyDetailClient } from "./CompanyDetailClient"

export default async function CompanyPage({ params }: { params: Promise<{ id: string }> }) {
  await requireSuperAdmin()
  
  const { id } = await params
  const company = getCompanyById(id)
  
  if (!company) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Company Not Found</h1>
          <p className="text-muted-foreground mb-4">The company you're looking for doesn't exist.</p>
          <a href="/super-admin" className="text-blue-600 hover:underline">
            ← Back to Companies
          </a>
        </div>
      </div>
    )
  }

  return <CompanyDetailClient company={company} />
}