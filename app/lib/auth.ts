// lib/auth.ts
export function requireSuperAdmin() {
  // Simulate authentication (replace with real logic)
  if (!true) throw new Error("Unauthorized");
}

export function getCompanyById(id: string): Company | null {
  const mockCompanies: Company[] = [
    {
      id: "1",
      name: "TechCorp",
      adminName: "Alice Johnson",
      createdAt: "2023-01-15",
      status: "active",
      nature: "Technology",
      address: "123 Tech Street, Silicon Valley",
      pan: "ABCDE1234F",
      gstin: "23ABCDE1234F1Z5",
      tan: "DEL12345A",
    },
    {
      id: "2",
      name: "HealthInc",
      adminName: "Bob Smith",
      createdAt: "2023-02-20",
      status: "inactive",
      nature: "Healthcare",
      address: "456 Health Road, MedCity",
      pan: "FGHIJ5678K",
      tan: "MUM56789B",
    },
  ];
  return mockCompanies.find(c => c.id === id) || null;
}

// Define Type
export type Company = {
  id: string
  name: string
  adminName: string
  createdAt: string
  status: "active" | "inactive"
  nature: string
  address: string
  pan: string
  gstin?: string
  tan?: string
}