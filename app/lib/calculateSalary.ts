/**
 * Professional Salary Calculation Engine
 * 
 * This function calculates employee salary breakdown based on:
 * 1. Salary mode (CTC/Gross)
 * 2. Input monthly amount
 * 3. Selected salary heads with their rules (percentage/fixed, applicableFor)
 * 4. PF/ESI/Gratuity calculations based on applicableFor flags
 * 5. Special Allowance as balancing head
 */

export interface SalaryHead {
  id: string;
  name: string;
  shortName: string | null;
  fieldType: string; // "Earnings" | "Deductions"
  isPercentage: boolean;
  value: number | null;
  percentageOf: string | null; // "CTC" | "GROSS" | "Amount" | shortName of another head
  applicableFor: {
    PF?: boolean;
    ESI?: boolean;
    Gratuity?: boolean;
    Bonus?: boolean;
    PT?: boolean;
    LWF?: boolean;
    LeaveEncashment?: boolean;
  } | null;
  isSystem?: boolean;
  systemCode?: string | null;
}

export interface PFRule {
  empShareAc1?: number | null; // Employee share percentage
  erShareAc2?: number | null; // Employer share A/c2
  epsAc21?: number | null; // EPS A/c21
  edliChargesAc21?: number | null; // EDLI charges
  adminChargesAc10?: number | null; // Admin charges
  pfWageCeiling?: number | null; // PF wage ceiling
  isActive?: boolean;
}

export interface ESIRule {
  empShare?: number | null; // Employee share percentage
  employerShare?: number | null; // Employer share percentage
  esiWageCeiling?: number | null; // ESI wage ceiling
  isActive?: boolean;
}

export interface CalculatedRow {
  id: string;
  name: string;
  type: string;
  formula: string;
  baseAmount: number; // Amount before deductions
  monthly: number; // Net amount after employee deductions
  annual: number; // Annual net amount
  pfEmployee: number;
  pfEmployer: number;
  esiEmployee: number;
  esiEmployer: number;
  gratuityEmployer: number;
  isSpecialAllowance?: boolean;
}

export interface CalculationResult {
  rows: CalculatedRow[];
  totals: {
    totalMonthly: number;
    totalAnnual: number;
    totalPfEmployee: number;
    totalPfEmployer: number;
    totalEsiEmployee: number;
    totalEsiEmployer: number;
    totalGratuityEmployer: number;
    netInHand: number; // Total monthly - employee deductions
    ctc: number; // Total monthly + employer contributions
  };
}

export function calculateSalary({
  mode,
  inputAmount,
  heads,
  selectedHeadIds,
  pfRule,
  esiRule,
}: {
  mode: "CTC" | "GROSS";
  inputAmount: number;
  heads: SalaryHead[];
  selectedHeadIds: string[];
  pfRule: PFRule | null;
  esiRule: ESIRule | null;
}): CalculationResult {
  // Step 1: Filter selected heads (excluding Special Allowance for now)
  const selectedHeads = heads.filter(
    (h) => selectedHeadIds.includes(h.id) && h.systemCode !== "SPECIAL_ALLOWANCE"
  );

  // Find Special Allowance head
  const specialAllowanceHead = heads.find(
    (h) => h.systemCode === "SPECIAL_ALLOWANCE"
  );

  // Step 2: Create a map of head amounts for percentage calculations
  const headAmounts: Map<string, number> = new Map();
  const rows: CalculatedRow[] = [];
  
  // Track total allocated amount (excluding Special Allowance)
  let totalAllocated = 0;

  // Step 3: Process each head sequentially
  for (const head of selectedHeads) {
    let baseAmount = 0;

    // Calculate base amount based on percentage or fixed
    if (head.isPercentage) {
      const percentageValue = Number(head.value || 0);
      const percentageOf = head.percentageOf || "Amount";

      if (percentageOf === "CTC" || percentageOf === "GROSS" || percentageOf === "Amount") {
        // Percentage of input amount (CTC/Gross)
        baseAmount = (inputAmount * percentageValue) / 100;
      } else {
        // Percentage of another head's shortName
        // Find the head by shortName
        const baseHead = selectedHeads.find((h) => h.shortName === percentageOf);
        if (baseHead && headAmounts.has(baseHead.id)) {
          const baseHeadAmount = headAmounts.get(baseHead.id)!;
          baseAmount = (baseHeadAmount * percentageValue) / 100;
        } else {
          // Fallback to input amount if base head not found
          baseAmount = (inputAmount * percentageValue) / 100;
        }
      }
    } else {
      // Fixed amount
      baseAmount = Number(head.value || 0);
    }

    // Store the base amount for this head (for other heads to reference)
    headAmounts.set(head.id, baseAmount);

    // Step 4: Calculate PF, ESI, Gratuity based on applicableFor
    const applicableFor = head.applicableFor || {};
    let pfEmployee = 0;
    let pfEmployer = 0;
    let esiEmployee = 0;
    let esiEmployer = 0;
    let gratuityEmployer = 0;

    // PF Calculation
    if (applicableFor.PF && pfRule?.isActive) {
      const pfWageCeiling = pfRule.pfWageCeiling || Infinity;
      const pfBase = Math.min(baseAmount, pfWageCeiling);
      
      // Employee PF (A/c1)
      if (pfRule.empShareAc1) {
        pfEmployee = (pfBase * pfRule.empShareAc1) / 100;
      }
      
      // Employer PF (A/c2 + EPS A/c21 + EDLI A/c21 + Admin A/c10)
      if (pfRule.erShareAc2) {
        pfEmployer += (pfBase * pfRule.erShareAc2) / 100;
      }
      if (pfRule.epsAc21) {
        pfEmployer += (pfBase * pfRule.epsAc21) / 100;
      }
      if (pfRule.edliChargesAc21) {
        pfEmployer += (pfBase * pfRule.edliChargesAc21) / 100;
      }
      if (pfRule.adminChargesAc10) {
        pfEmployer += (pfBase * pfRule.adminChargesAc10) / 100;
      }
    }

    // ESI Calculation
    // Note: ESI wage ceiling check will be done after all heads are calculated
    // For now, calculate per head - we'll validate total gross later
    if (applicableFor.ESI && esiRule?.isActive) {
      const esiWageCeiling = esiRule.esiWageCeiling || Infinity;
      
      // ESI is applicable only if total gross is within ceiling
      // We'll validate this in the final step, but calculate per head for now
      if (inputAmount <= esiWageCeiling) {
        if (esiRule.empShare) {
          esiEmployee = (baseAmount * esiRule.empShare) / 100;
        }
        if (esiRule.employerShare) {
          esiEmployer = (baseAmount * esiRule.employerShare) / 100;
        }
      }
    }

    // Gratuity Calculation (Employer only)
    if (applicableFor.Gratuity) {
      // Gratuity = (15/26) * Basic per year / 12 months
      // Assuming baseAmount is monthly, gratuity per month = (15/26) * baseAmount / 12
      // Simplified: gratuity per month = baseAmount * (15/26) / 12
      gratuityEmployer = (baseAmount * 15) / 26 / 12;
    }

    // Net amount after employee deductions
    const netAmount = baseAmount - pfEmployee - esiEmployee;

    // Add to total allocated
    totalAllocated += baseAmount;

    // Create row
    rows.push({
      id: head.id,
      name: head.name,
      type: head.fieldType,
      formula: head.isPercentage
        ? `${head.value || 0}% of ${head.percentageOf || "Amount"}`
        : `Fixed ₹${head.value || 0}`,
      baseAmount,
      monthly: netAmount,
      annual: netAmount * 12,
      pfEmployee,
      pfEmployer,
      esiEmployee,
      esiEmployer,
      gratuityEmployer,
    });
  }

  // Step 5: Calculate Special Allowance (balancing head)
  const balance = inputAmount - totalAllocated;
  
  if (specialAllowanceHead && selectedHeadIds.includes(specialAllowanceHead.id)) {
    // Special Allowance is the balancing amount
    const specialAllowanceAmount = balance;
    headAmounts.set(specialAllowanceHead.id, specialAllowanceAmount);

    // Calculate PF/ESI/Gratuity for Special Allowance
    const applicableFor = specialAllowanceHead.applicableFor || {};
    let pfEmployee = 0;
    let pfEmployer = 0;
    let esiEmployee = 0;
    let esiEmployer = 0;
    let gratuityEmployer = 0;

    if (applicableFor.PF && pfRule?.isActive) {
      const pfWageCeiling = pfRule.pfWageCeiling || Infinity;
      const pfBase = Math.min(specialAllowanceAmount, pfWageCeiling);
      
      if (pfRule.empShareAc1) {
        pfEmployee = (pfBase * pfRule.empShareAc1) / 100;
      }
      
      if (pfRule.erShareAc2) {
        pfEmployer += (pfBase * pfRule.erShareAc2) / 100;
      }
      if (pfRule.epsAc21) {
        pfEmployer += (pfBase * pfRule.epsAc21) / 100;
      }
      if (pfRule.edliChargesAc21) {
        pfEmployer += (pfBase * pfRule.edliChargesAc21) / 100;
      }
      if (pfRule.adminChargesAc10) {
        pfEmployer += (pfBase * pfRule.adminChargesAc10) / 100;
      }
    }

    if (applicableFor.ESI && esiRule?.isActive) {
      const esiWageCeiling = esiRule.esiWageCeiling || Infinity;
      if (inputAmount <= esiWageCeiling) {
        if (esiRule.empShare) {
          esiEmployee = (specialAllowanceAmount * esiRule.empShare) / 100;
        }
        if (esiRule.employerShare) {
          esiEmployer = (specialAllowanceAmount * esiRule.employerShare) / 100;
        }
      }
    }

    if (applicableFor.Gratuity) {
      gratuityEmployer = (specialAllowanceAmount * 15) / 26 / 12;
    }

    const netAmount = specialAllowanceAmount - pfEmployee - esiEmployee;

    // Add Special Allowance row (insert at the end)
    rows.push({
      id: specialAllowanceHead.id,
      name: specialAllowanceHead.name,
      type: specialAllowanceHead.fieldType,
      formula: "Balance",
      baseAmount: specialAllowanceAmount,
      monthly: netAmount,
      annual: netAmount * 12,
      pfEmployee,
      pfEmployer,
      esiEmployee,
      esiEmployer,
      gratuityEmployer,
      isSpecialAllowance: true,
    });
  }

  // Step 6: Calculate totals and validate ESI
  const totalGross = rows.reduce((sum, r) => sum + r.baseAmount, 0);
  
  // Recalculate ESI if total gross exceeds ceiling
  if (esiRule?.isActive && esiRule.esiWageCeiling) {
    if (totalGross > esiRule.esiWageCeiling) {
      // ESI not applicable - zero out all ESI calculations
      rows.forEach((row) => {
        row.esiEmployee = 0;
        row.esiEmployer = 0;
      });
    }
  }

  const totals = {
    totalMonthly: rows.reduce((sum, r) => sum + r.monthly, 0),
    totalAnnual: rows.reduce((sum, r) => sum + r.annual, 0),
    totalPfEmployee: rows.reduce((sum, r) => sum + r.pfEmployee, 0),
    totalPfEmployer: rows.reduce((sum, r) => sum + r.pfEmployer, 0),
    totalEsiEmployee: rows.reduce((sum, r) => sum + r.esiEmployee, 0),
    totalEsiEmployer: rows.reduce((sum, r) => sum + r.esiEmployer, 0),
    totalGratuityEmployer: rows.reduce((sum, r) => sum + r.gratuityEmployer, 0),
    netInHand: rows.reduce((sum, r) => sum + r.monthly, 0), // Already net after deductions
    ctc: totalGross + 
         rows.reduce((sum, r) => sum + r.pfEmployer, 0) + 
         rows.reduce((sum, r) => sum + r.esiEmployer, 0) + 
         rows.reduce((sum, r) => sum + r.gratuityEmployer, 0),
  };

  return {
    rows,
    totals,
  };
}

/* ------------------------------------------------------------------
   SERVER-SIDE: Calculate and Save Employee Salary
   This version works with Prisma transactions and saves to database
-------------------------------------------------------------------*/
import { Prisma } from "@prisma/client";

export async function calculateEmployeeSalary({
  tx,
  companyId,
  employeeId,
  salary,
}: {
  tx: Prisma.TransactionClient;
  companyId: string;
  employeeId: string;
  salary: {
    mode: "CTC" | "GROSS";
    inputAmount: number;
    selectedHeadIds: string[];
  };
}) {
  // 1️⃣ Fetch salary heads
  const heads = await tx.salaryHead.findMany({
    where: {
      companyId,
      id: { in: salary.selectedHeadIds },
    },
  });

  if (heads.length === 0) {
    throw new Error("No salary heads selected");
  }

  // 2️⃣ Fetch PF / ESI rules
  const pfRule = await tx.pFESIRate.findFirst({
    where: { companyId, rateType: "PF", isActive: true },
    orderBy: { effectiveFrom: "desc" },
  });

  const esiRule = await tx.pFESIRate.findFirst({
    where: { companyId, rateType: "ESI", isActive: true },
    orderBy: { effectiveFrom: "desc" },
  });

  // 3️⃣ Use client-side calculation function
  const calculationResult = calculateSalary({
    mode: salary.mode,
    inputAmount: salary.inputAmount,
    heads: heads.map((h: any) => ({
      id: h.id,
      name: h.name,
      shortName: h.shortName,
      fieldType: h.fieldType,
      isPercentage: h.isPercentage,
      value: h.value,
      percentageOf: h.percentageOf || h.calcBase,
      applicableFor: (h.applicableFor as any) || {},
      isSystem: h.isSystem,
      systemCode: h.systemCode,
    })),
    selectedHeadIds: salary.selectedHeadIds,
    pfRule: pfRule ? {
      empShareAc1: pfRule.empShareAc1,
      erShareAc2: pfRule.erShareAc2,
      epsAc21: pfRule.epsAc21,
      edliChargesAc21: pfRule.edliChargesAc21,
      adminChargesAc10: pfRule.adminChargesAc10,
      pfWageCeiling: pfRule.pfWageCeiling,
      isActive: pfRule.isActive,
    } : null,
    esiRule: esiRule ? {
      empShare: esiRule.empShare,
      employerShare: esiRule.employerShare,
      esiWageCeiling: esiRule.esiWageCeiling,
      isActive: esiRule.isActive,
    } : null,
  });

  // 4️⃣ Save salary breakdown to database
  const salaryHeadRows = calculationResult.rows.map((row) => ({
    companyId,
    employeeId,
    salaryHeadId: row.id,
    headName: row.name,
    headType: row.type === "Earnings" ? "EARNING" : "DEDUCTION",
    baseAmount: row.baseAmount,
    netAmount: row.monthly,
    pfEmployee: row.pfEmployee,
    pfEmployer: row.pfEmployer,
    esiEmployee: row.esiEmployee,
    esiEmployer: row.esiEmployer,
    gratuityEmployer: row.gratuityEmployer,
  }));

  await (tx as any).employeeSalaryHead.createMany({
    data: salaryHeadRows,
  });

  // 5️⃣ Save salary config
  const salaryConfig = await (tx as any).employeeSalaryConfig.create({
    data: {
      companyId,
      employeeId,
      salaryMode: salary.mode,
      inputAmount: salary.inputAmount,
      grossSalary: calculationResult.totals.totalMonthly + calculationResult.totals.totalPfEmployee + calculationResult.totals.totalEsiEmployee,
      netSalary: calculationResult.totals.netInHand,
      annualCtc: calculationResult.totals.ctc * 12,
      pfRuleSnapshot: pfRule || {},
      esiRuleSnapshot: esiRule || {},
      gratuityRuleSnapshot: { formula: "15/26 * Basic / 12" },
    },
  });

  return salaryConfig;
}
