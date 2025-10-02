"use client";

import { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Eye, Edit, Ban, CheckCircle, MoreHorizontal } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

interface Company {
  id: string;
  name: string;
  status: string;
  createdAt: string;
  code?: string;
  flat?: string;
  road?: string;
  city?: string;
  pin?: string;
  state?: string;
  pan?: string;
  tan?: string;
  gstin?: string;
  cin?: string;
  email?: string;
  phone?: string;
  stdCode?: string;
  nature?: string;
  address?: string;
  typeOfCompany?: string;
  pfRegionalOffice?: string;
  pensionCoverageDate?: string;
  esiLocalOffice?: string;
  ptoCircleNo?: string;
  website?: string;
  defaultAttendance?: string;
  companyVisibility?: string;
  apName?: string;
  apDob?: string;
  apSex?: string;
  apPremise?: string;
  apArea?: string;
  apPin?: string;
  apState?: string;
  apStd?: string;
  apPhone?: string;
  apDesignation?: string;
  apFatherName?: string;
  apFlat?: string;
  apRoad?: string;
  apCity?: string;
  apEmail?: string;
  apPan?: string;
  deductorType?: string;
  paoCode?: string;
  ministryName?: string;
  ministryIfOthers?: string;
  tdsCircle?: string;
  ain?: string;
  ddoCode?: string;
  ddoRegNo?: string;
  tanRegNo?: string;
  lwfRegNo?: string;
  branchDivision?: string;
}

interface CompanyTableProps {
  companies: Company[];
}

export default function CompanyTable({ companies }: CompanyTableProps) {
  const [recentCompany, setRecentCompany] = useState<{ name: string } | null>(null);

  useEffect(() => {
    const companyData = localStorage.getItem("companyData");
    if (companyData) {
      try {
        const parsedData = JSON.parse(companyData);
        setRecentCompany({ name: parsedData.name });
        if (parsedData.name) {
          toast({
            title: "Company Created",
            description: `Successfully created company: ${parsedData.name}`,
            duration: 5000,
          });
        }
      } catch (e) {
        console.error("Failed to parse companyData from localStorage:", e);
      }
    }
  }, []);

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Company Name</TableHead>
          <TableHead>Code</TableHead>
          <TableHead>PAN</TableHead>
          <TableHead>TAN</TableHead>
          <TableHead>GSTIN</TableHead>
          <TableHead>Authorized Person</TableHead>
          <TableHead>Contact</TableHead>
          <TableHead>Registration Date</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {companies.length === 0 ? (
          <TableRow>
            <TableCell colSpan={10} className="text-center text-muted-foreground py-8">
              No companies registered yet
            </TableCell>
          </TableRow>
        ) : (
          companies.map((company) => (
            <TableRow
              key={company.id}
              className={recentCompany?.name === company.name ? "bg-primary/10" : ""}
            >
              <TableCell className="font-medium">
                {company.name}
                {recentCompany?.name === company.name && (
                  <CheckCircle className="inline-block ml-2 h-4 w-4 text-green-500" />
                )}
              </TableCell>
              <TableCell>{company.code || '—'}</TableCell>
              <TableCell>{company.pan || '—'}</TableCell>
              <TableCell>{company.tan || '—'}</TableCell>
              <TableCell>{company.gstin || '—'}</TableCell>
              <TableCell>
                <div>
                  <p className="font-medium">{company.apName || '—'}</p>
                  <p className="text-sm text-muted-foreground">
                    {company.apDesignation || '—'}
                  </p>
                </div>
              </TableCell>
              <TableCell>
                <div>
                  <p className="text-sm">{company.email || '—'}</p>
                  <p className="text-sm text-muted-foreground">
                    {company.stdCode && company.phone ? `${company.stdCode}-${company.phone}` : '—'}
                  </p>
                </div>
              </TableCell>
              <TableCell>{new Date(company.createdAt).toLocaleDateString()}</TableCell>
              <TableCell>
                <Badge variant={company.status === "active" ? "default" : "secondary"}>
                  {company.status}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Eye className="mr-2 h-4 w-4" />
                      View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit Company
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive">
                      <Ban className="mr-2 h-4 w-4" />
                      {company.status === "active" ? "Suspend" : "Activate"}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}