"use client";

import { useState } from "react";
import * as XLSX from "xlsx";
import * as FileSaver from "file-saver";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import AddEmployee from "@/components/add-employee"; // Imported component
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

// --- Interfaces (No Changes) ---
interface Address {
  flat?: string;
  building?: string;
  area?: string;
  road?: string;
  city?: string;
  pin?: string;
  district?: string;
  state?: string;
}

interface FamilyMember {
  name?: string;
  address?: string;
  relationship?: string;
  dobAge?: string;
  residingWith?: boolean;
  district?: string;
  state?: string;
  remark?: string;
  aadhar?: string;
}

interface Nominee {
  name?: string;
  address?: string;
  district?: string;
  state?: string;
  pin?: string;
  relationship?: string;
  dobAge?: string;
  gratuityProportion?: string;
  maritalStatus?: string;
  remark?: string;
}

interface Experience {
  companyName?: string;
  location?: string;
  designation?: string;
  from?: string;
  to?: string;
  remark?: string;
}

interface Asset {
  particular?: string;
  remark?: string;
}

interface Education {
  qualification?: string;
  universityCollege?: string;
  subject?: string;
  year?: string;
  percentage?: string;
}

interface Employee {
  id: number;
  code: string;
  name: string;
  fatherHusbandName: string;
  pan: string;
  dob: string;
  doj: string;
  dor: string;
  uan: string;
  pfAcNo: string;
  permanentAddress: Address;
  email: string;
  nasscomRegNo: string;
  gender: string;
  maritalStatus: string;
  fathersName: string;
  mothersName: string;
  caste: string;
  bloodGroup: string;
  nationality: string;
  religion: string;
  dateOfMarriage: string;
  noOfDependent: string;
  spouse: string;
  stdCode: string;
  phone: string;
  mobile: string;
  internalId: string;
  noticePeriodMonths: string;
  probationPeriodMonths: string;
  confirmationDate: string;
  resigLetterDate: string;
  resigDateLwd: string;
  resignationReason: string;
  appraisalDate: string;
  dateOfDeath: string;
  commitmentCompletionDate: string;
  identityMark: string;
  reimbursementApplicable: boolean;
  correspondenceAddress: Address;
  photo: string;
  bankName: string;
  bankBranch: string;
  bankIfsc: string;
  bankAddress: string;
  nameAsPerAc: string;
  salaryAcNumber: string;
  paymentMode: string;
  acType: string;
  bankRefNo: string;
  wardCircleRange: string;
  licPolicyNo: string;
  policyTerm: string;
  licId: string;
  annualRenewableDate: string;
  hraApplicable: boolean;
  bonusApplicable: boolean;
  gratuityApplicable: boolean;
  lwfApplicable: boolean;
  pfApplicable: boolean;
  physicallyHandicap: string;
  educationalQual: string;
  registeredInPmrpy: boolean;
  previousPfNo: string;
  pfJoiningDate: string;
  pfLastDate: string;
  salaryForPfOption: string;
  salaryForPf: string;
  minAmtPf: string;
  pensionAppl: boolean;
  pensionJoiningDate: string;
  pensionOnHigherWages: boolean;
  noLimit: boolean;
  esiApplicable: boolean;
  esiJoiningDate: string;
  esiNo: string;
  esiLastDate: string;
  salaryForEsiOption: string;
  salaryForEsi: string;
  minAmtEsiContribution: string;
  dispensaryOrPanel: string;
  recruitmentAgency: string;
  bankMandate: string;
  employmentStatus: string;
  lapTops: string;
  companyVehicle: string;
  corpCreditCardNo: string;
  transportRoute: string;
  workLocation: string;
  companyAssets: Asset[];
  educationalQualifications: Education[];
  reasonForLeaving: string;
  service: string;
  remarks: string;
  family: FamilyMember[];
  nominees: Nominee[];
  witnesses: Nominee[];
  previousYears: string;
  previousMonths: string;
  experiences: Experience[];
  branch: string;
  category: string;
  designation: string;
  department: string;
  scale: string;
  ptGroup: string;
  shift: string;
}

const initialEmployees: Employee[] = [
  {
    id: 1,
    code: "AJ502",
    name: "ASHISH CHOUDHARY",
    fatherHusbandName: "SHANKAR LAL CHOUDHARY",
    pan: "CCEPC7570F",
    dob: "1991-01-10",
    doj: "2020-12-22",
    dor: "",
    uan: "101453128899",
    pfAcNo: "RJRAJ223938160000010026",
    permanentAddress: {},
    email: "",
    nasscomRegNo: "",
    gender: "",
    maritalStatus: "",
    fathersName: "",
    mothersName: "",
    caste: "",
    bloodGroup: "",
    nationality: "",
    religion: "",
    dateOfMarriage: "",
    noOfDependent: "",
    spouse: "",
    stdCode: "",
    phone: "",
    mobile: "",
    internalId: "",
    noticePeriodMonths: "",
    probationPeriodMonths: "",
    confirmationDate: "",
    resigLetterDate: "",
    resigDateLwd: "",
    resignationReason: "",
    appraisalDate: "",
    dateOfDeath: "",
    commitmentCompletionDate: "",
    identityMark: "",
    reimbursementApplicable: false,
    correspondenceAddress: {},
    photo: "",
    bankName: "",
    bankBranch: "",
    bankIfsc: "",
    bankAddress: "",
    nameAsPerAc: "",
    salaryAcNumber: "",
    paymentMode: "",
    acType: "",
    bankRefNo: "",
    wardCircleRange: "",
    licPolicyNo: "",
    policyTerm: "",
    licId: "",
    annualRenewableDate: "",
    hraApplicable: false,
    bonusApplicable: false,
    gratuityApplicable: false,
    lwfApplicable: false,
    pfApplicable: false,
    physicallyHandicap: "",
    educationalQual: "",
    registeredInPmrpy: false,
    previousPfNo: "",
    pfJoiningDate: "",
    pfLastDate: "",
    salaryForPfOption: "",
    salaryForPf: "",
    minAmtPf: "",
    pensionAppl: false,
    pensionJoiningDate: "",
    pensionOnHigherWages: false,
    noLimit: false,
    esiApplicable: false,
    esiJoiningDate: "",
    esiNo: "",
    esiLastDate: "",
    salaryForEsiOption: "",
    salaryForEsi: "",
    minAmtEsiContribution: "",
    dispensaryOrPanel: "",
    recruitmentAgency: "",
    bankMandate: "",
    employmentStatus: "",
    lapTops: "",
    companyVehicle: "",
    corpCreditCardNo: "",
    transportRoute: "",
    workLocation: "",
    companyAssets: [],
    educationalQualifications: [],
    reasonForLeaving: "",
    service: "",
    remarks: "",
    family: [],
    nominees: [],
    witnesses: [],
    previousYears: "",
    previousMonths: "",
    experiences: [],
    branch: "",
    category: "",
    designation: "",
    department: "",
    scale: "",
    ptGroup: "",
    shift: "",
  },
];

export default function EmployeeDetailsPage() {
  const [employees, setEmployees] = useState<Employee[]>(initialEmployees);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Partial<Employee>>({});
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [showAllEmployees, setShowAllEmployees] = useState(true);
  const [includeResigned, setIncludeResigned] = useState(false);
  const [branchFilter, setBranchFilter] = useState("ALL");
  const [showImportModal, setShowImportModal] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const handleSubmit = (updatedEmployee: Partial<Employee>) => {
    if (updatedEmployee.id) {
      setEmployees(
        employees.map((emp) =>
          emp.id === updatedEmployee.id ? { ...emp, ...updatedEmployee } as Employee : emp
        )
      );
    } else {
      const newId = employees.reduce((maxId, emp) => Math.max(emp.id, maxId), 0) + 1;
      setEmployees([...employees, { ...updatedEmployee, id: newId } as Employee]);
    }
    setOpen(false);
    setForm({});
  };

  const handleEdit = (employee: Employee) => {
    setForm(employee);
    setOpen(true);
  };

  const handleDelete = (id: number) => {
    setEmployees(employees.filter((emp) => emp.id !== id));
  };

  const handleChange = (field: keyof Employee, value: any) => {
    setForm({ ...form, [field]: value });
  };

  const handleNestedChange = (nestedField: keyof Employee, subField: string, value: any) => {
    setForm({
      ...form,
      [nestedField]: { ...(form[nestedField] as object), [subField]: value },
    });
  };

  const handleArrayAdd = (arrayField: keyof Employee) => {
    setForm({
      ...form,
      [arrayField]: [...(form[arrayField] as any[] || []), {}],
    });
  };

  const handleArrayDelete = (arrayField: keyof Employee, index: number) => {
    const newArray = (form[arrayField] as any[]).filter((_, i) => i !== index);
    setForm({ ...form, [arrayField]: newArray });
  };

  const handleArrayChange = (
    arrayField: keyof Employee,
    index: number,
    subField: string,
    value: any
  ) => {
    const newArray = [...(form[arrayField] as any[] || [])];
    newArray[index] = { ...newArray[index], [subField]: value };
    setForm({ ...form, [arrayField]: newArray });
  };

  const normalizeHeader = (header: string) => {
    if (typeof header !== "string") return "";
    return header.toLowerCase().replace(/\s+/g, "").trim();
  };

  const handleImport = () => {
    if (!file) return alert("Please select a file.");

    const reader = new FileReader();
    reader.onload = (e) => {
      const data = e.target?.result;
      if (!data) return;

      const workbook = XLSX.read(data, { type: "binary" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const importedData = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as string[][];

      if (importedData.length < 2) {
        return alert("The file is empty or contains only a header row.");
      }

      const headers = importedData[0].map(normalizeHeader);
      const lastId = employees.reduce((maxId, emp) => Math.max(emp.id, maxId), 0);

      const importedEmployees = importedData
        .slice(1)
        .map((row) => {
          const employee: { [key: string]: any } = {};
          headers.forEach((header, index) => {
            if (header) {
              employee[header] = row[index] || "";
            }
          });

          const toBoolean = (value: any) => value === "true" || value === true;

          return {
            code: employee.code,
            name: employee.name,
            fatherHusbandName: employee.fathershusbandsname,
            pan: employee.pan,
            dob: employee.dob,
            doj: employee.doj,
            dor: employee.dor,
            uan: employee.uan,
            pfAcNo: employee.pfacno,
            permanentAddress: {},
            email: employee.email,
            nasscomRegNo: employee.nasscomregno,
            gender: employee.gender,
            maritalStatus: employee.maritalstatus,
            fathersName: employee.fathersname,
            mothersName: employee.mothersname,
            caste: employee.caste,
            bloodGroup: employee.bloodgroup,
            nationality: employee.nationality,
            religion: employee.religion,
            dateOfMarriage: employee.dateofmarriage,
            noOfDependent: employee.noofdependent,
            spouse: employee.spouse,
            stdCode: employee.stdcode,
            phone: employee.phone,
            mobile: employee.mobile,
            internalId: employee.internalid,
            noticePeriodMonths: employee.noticeperiodmonths,
            probationPeriodMonths: employee.probationperiodmonths,
            confirmationDate: employee.confirmationdate,
            resigLetterDate: employee.resigletterdate,
            resigDateLwd: employee.resigdatelwd,
            resignationReason: employee.resignationreason,
            appraisalDate: employee.appraisaldate,
            dateOfDeath: employee.dateofdeath,
            commitmentCompletionDate: employee.commitmentcompletiondate,
            identityMark: employee.identitymark,
            reimbursementApplicable: toBoolean(employee.reimbursementapplicable),
            correspondenceAddress: {},
            photo: employee.photo,
            bankName: employee.bankname,
            bankBranch: employee.bankbranch,
            bankIfsc: employee.bankifsc,
            bankAddress: employee.bankaddress,
            nameAsPerAc: employee.nameasperac,
            salaryAcNumber: employee.salaryacnumber,
            paymentMode: employee.paymentmode,
            acType: employee.actype,
            bankRefNo: employee.bankrefno,
            wardCircleRange: employee.wardcirclerange,
            licPolicyNo: employee.licpolicyno,
            policyTerm: employee.policyterm,
            licId: employee.licid,
            annualRenewableDate: employee.annualrenewabledate,
            hraApplicable: toBoolean(employee.hraapplicable),
            bonusApplicable: toBoolean(employee.bonusapplicable),
            gratuityApplicable: toBoolean(employee.gratuityapplicable),
            lwfApplicable: toBoolean(employee.lwfapplicable),
            pfApplicable: toBoolean(employee.pfapplicable),
            physicallyHandicap: employee.physicallyhandicap,
            educationalQual: employee.educationalqual,
            registeredInPmrpy: toBoolean(employee.registeredinpmrpy),
            previousPfNo: employee.previouspfno,
            pfJoiningDate: employee.pfjoiningdate,
            pfLastDate: employee.pflastdate,
            salaryForPfOption: employee.salaryforpfoption,
            salaryForPf: employee.salaryforpf,
            minAmtPf: employee.minamtpf,
            pensionAppl: toBoolean(employee.pensionappl),
            pensionJoiningDate: employee.pensionjoiningdate,
            pensionOnHigherWages: toBoolean(employee.pensiononhigherwages),
            noLimit: toBoolean(employee.nolimit),
            esiApplicable: toBoolean(employee.esiapplicable),
            esiJoiningDate: employee.esijoiningdate,
            esiNo: employee.esino,
            esiLastDate: employee.esilastdate,
            salaryForEsiOption: employee.salaryforesioption,
            salaryForEsi: employee.salaryforesi,
            minAmtEsiContribution: employee.minamtesicontribution,
            dispensaryOrPanel: employee.dispensaryorpanel,
            recruitmentAgency: employee.recruitmentagency,
            bankMandate: employee.bankmandate,
            employmentStatus: employee.employmentstatus,
            lapTops: employee.laptops,
            companyVehicle: employee.companyvehicle,
            corpCreditCardNo: employee.corpcreditcardno,
            transportRoute: employee.transportroute,
            workLocation: employee.worklocation,
            companyAssets: [],
            educationalQualifications: [],
            reasonForLeaving: employee.reasonforleaving,
            service: employee.service,
            remarks: employee.remarks,
            family: [],
            nominees: [],
            witnesses: [],
            previousYears: "",
            previousMonths: "",
            experiences: [],
            branch: employee.branch,
            category: employee.category,
            designation: employee.designation,
            department: employee.department,
            scale: employee.scale,
            ptGroup: employee.ptgroup,
            shift: employee.shift,
          };
        })
        .filter((emp) => emp.code && emp.name && emp.doj);

      if (importedEmployees.length === 0) {
        alert(
          "Import failed. No valid employee rows found. Please ensure 'code', 'name', and 'doj' columns exist and have values."
        );
        return;
      }

      const newEmployees = importedEmployees.map((emp, index) => ({
        ...emp,
        id: lastId + index + 1,
      })) as Employee[];

      setEmployees((prevEmployees) => [...prevEmployees, ...newEmployees]);
      setShowImportModal(false);
      setFile(null);
      alert(`${newEmployees.length} employees imported successfully!`);
    };
    reader.readAsBinaryString(file);
  };

  const exportToExcel = () => {
    const fileType =
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";
    const fileExtension = ".xlsx";
    const ws = XLSX.utils.json_to_sheet(
      employees.map((emp) => ({
        Code: emp.code,
        Name: emp.name,
        "Father's/Husband's Name": emp.fatherHusbandName,
        PAN: emp.pan,
        DOB: emp.dob,
        DOJ: emp.doj,
        DOR: emp.dor,
        UAN: emp.uan,
        "PF A/c No.": emp.pfAcNo,
        Email: emp.email,
        "NASSCOM Reg No.": emp.nasscomRegNo,
        Gender: emp.gender,
        "Marital Status": emp.maritalStatus,
        "Father's Name": emp.fathersName,
        "Mother's Name": emp.mothersName,
        Caste: emp.caste,
        "Blood Group": emp.bloodGroup,
        Nationality: emp.nationality,
        Religion: emp.religion,
        "Date of Marriage": emp.dateOfMarriage,
        "No. of Dependent": emp.noOfDependent,
        Spouse: emp.spouse,
        "STD Code": emp.stdCode,
        Phone: emp.phone,
        Mobile: emp.mobile,
        "Internal ID": emp.internalId,
        "Notice Period Months": emp.noticePeriodMonths,
        "Probation Period Months": emp.probationPeriodMonths,
        "Confirmation Date": emp.confirmationDate,
        "Resig. Letter Date": emp.resigLetterDate,
        "Resig. Date L.W.D.": emp.resigDateLwd,
        "Resignation Reason": emp.resignationReason,
        "Appraisal Date": emp.appraisalDate,
        "Date of Death": emp.dateOfDeath,
        "Commitment Completion Date": emp.commitmentCompletionDate,
        "Identity Mark": emp.identityMark,
        "Reimbursement Applicable": emp.reimbursementApplicable,
        Photo: emp.photo,
        "Bank Name": emp.bankName,
        "Bank Branch": emp.bankBranch,
        "Bank IFSC": emp.bankIfsc,
        "Bank Address": emp.bankAddress,
        "Name as per A/c": emp.nameAsPerAc,
        "Salary A/c Number": emp.salaryAcNumber,
        "Payment Mode": emp.paymentMode,
        "A/c Type": emp.acType,
        "Bank Ref No.": emp.bankRefNo,
        "Ward/Circle/Range": emp.wardCircleRange,
        "LIC Policy No.": emp.licPolicyNo,
        "Policy Term": emp.policyTerm,
        "LIC ID": emp.licId,
        "Annual Renewable Date": emp.annualRenewableDate,
        "HRA Applicable": emp.hraApplicable,
        "Bonus Applicable": emp.bonusApplicable,
        "Gratuity Applicable": emp.gratuityApplicable,
        "LWF Applicable": emp.lwfApplicable,
        "PF Applicable": emp.pfApplicable,
        "Physically Handicap": emp.physicallyHandicap,
        "Educational Qual.": emp.educationalQual,
        "Registered in PMRPY": emp.registeredInPmrpy,
        "Previous PF No.": emp.previousPfNo,
        "PF Joining Date": emp.pfJoiningDate,
        "PF Last Date": emp.pfLastDate,
        "Salary For PF Option": emp.salaryForPfOption,
        "Salary For PF": emp.salaryForPf,
        "Min. Amt PF": emp.minAmtPf,
        "Pension Appl.": emp.pensionAppl,
        "Pension Joining Date": emp.pensionJoiningDate,
        "Pension on Higher Wages": emp.pensionOnHigherWages,
        "No Limit": emp.noLimit,
        "ESI Applicable": emp.esiApplicable,
        "ESI Joining Date": emp.esiJoiningDate,
        "ESI No.": emp.esiNo,
        "ESI Last Date": emp.esiLastDate,
        "Salary For ESI Option": emp.salaryForEsiOption,
        "Salary For ESI": emp.salaryForEsi,
        "Min. Amt ESI Contribution": emp.minAmtEsiContribution,
        "Dispensary / Panel System": emp.dispensaryOrPanel,
        "Recruitment Agency": emp.recruitmentAgency,
        "Bank Mandate": emp.bankMandate,
        "Employment Status": emp.employmentStatus,
        "Lap Tops": emp.lapTops,
        "Company Vehicle": emp.companyVehicle,
        "Corp. Credit Card No.": emp.corpCreditCardNo,
        "Transport Route": emp.transportRoute,
        "Work Location": emp.workLocation,
        "Reason For Leaving": emp.reasonForLeaving,
        Service: emp.service,
        Remarks: emp.remarks,
        Branch: emp.branch,
        Category: emp.category,
        Designation: emp.designation,
        Department: emp.department,
        Scale: emp.scale,
        "PT Group": emp.ptGroup,
        Shift: emp.shift,
      }))
    );
    const wb = { Sheets: { data: ws }, SheetNames: ["data"] };
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const data = new Blob([excelBuffer], { type: fileType });
    FileSaver.saveAs(data, "employees" + fileExtension);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  return (
    <div className="p-4 sm:p-6">
      <Card>
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center sm:justify-between gap-4">
          <CardTitle className="text-lg sm:text-2xl">Employee Details</CardTitle>
          <div className="flex gap-2 flex-wrap">
            <Button onClick={() => setShowImportModal(true)} variant="outline">
              Import
            </Button>
            <Button onClick={exportToExcel} variant="outline">
              Export
            </Button>
            <Button onClick={() => setOpen(true)}>+ Add Employee</Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 mb-4">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="showAll"
                  checked={showAllEmployees}
                  onCheckedChange={(checked) => setShowAllEmployees(checked === true)}
                />
                <Label htmlFor="showAll">Show All Employees</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="includeResigned"
                  checked={includeResigned}
                  onCheckedChange={(checked) => setIncludeResigned(checked === true)}
                />
                <Label htmlFor="includeResigned">Include Resigned Employees</Label>
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>S.N.</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Father's/Husband's</TableHead>
                  <TableHead>PAN</TableHead>
                  <TableHead>DOB</TableHead>
                  <TableHead>DOJ</TableHead>
                  <TableHead>DOR</TableHead>
                  <TableHead>UAN</TableHead>
                  <TableHead>PF A/c No.</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {employees.map((emp, index) => (
                  <TableRow key={emp.id}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{emp.code}</TableCell>
                    <TableCell>{emp.name}</TableCell>
                    <TableCell>{emp.fatherHusbandName}</TableCell>
                    <TableCell>{emp.pan}</TableCell>
                    <TableCell>{emp.dob}</TableCell>
                    <TableCell>{emp.doj}</TableCell>
                    <TableCell>{emp.dor}</TableCell>
                    <TableCell>{emp.uan}</TableCell>
                    <TableCell>{emp.pfAcNo}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(emp);
                          }}
                          size="sm"
                          variant="outline"
                        >
                          Modify
                        </Button>
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(emp.id);
                          }}
                          variant="destructive"
                          size="sm"
                        >
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto p-6">
          <AddEmployee
            employee={form as Employee}
            onSubmit={handleSubmit}
            onCancel={() => {
              setForm({});
              setOpen(false);
            }}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={showImportModal} onOpenChange={setShowImportModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Import Employees from Excel</DialogTitle>
          </DialogHeader>
          <div>
            <p className="text-sm text-muted-foreground">
              Upload an .xlsx file. The import will proceed even with missing
              columns, but will skip any rows that don't have a value for **code**,
              **name**, and **doj**.
            </p>
            <div className="mt-4">
              <Label htmlFor="excel-file">Select Excel File</Label>
              <Input
                id="excel-file"
                type="file"
                accept=".xlsx, .xls"
                onChange={handleFileChange}
                className="mt-2"
              />
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button onClick={handleImport} disabled={!file}>
              Import
            </Button>
            <Button variant="outline" onClick={() => setShowImportModal(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}