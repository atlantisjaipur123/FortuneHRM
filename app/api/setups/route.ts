// app/api/setups/route.ts   (or wherever this file lives)

import { NextResponse } from 'next/server';
import { withCompany } from '@/app/lib/api-helpers';
import { prisma } from '@/app/lib/prisma';

// Helper to retry a function on pool timeout
async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries = 2,
  delayMs = 800
): Promise<T> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= maxRetries + 1; attempt++) {
    try {
      return await fn();
    } catch (err: any) {
      lastError = err;
      if (
        attempt < maxRetries + 1 &&
        (err?.message?.includes('Timed out fetching') ||
          err?.message?.includes('connection') ||
          err?.code === 'P2024' ||
          err?.cause?.code === 10054)
      ) {
        console.warn(`Prisma retry ${attempt}/${maxRetries} after:`, err.message);
        await new Promise((r) => setTimeout(r, delayMs * attempt));
        continue;
      }
      throw err;
    }
  }

  throw lastError;
}

// GET all setups for selected company
export async function GET() {
  return withCompany(async (companyId) => {
    try {
      // Sequential loading to reduce peak connection pressure
      const branches = await withRetry(() =>
        prisma.branch.findMany({
          where: { companyId },
          orderBy: { name: 'asc' },
        })
      );

      const departments = await withRetry(() =>
        prisma.department.findMany({
          where: { companyId },
          orderBy: { name: 'asc' },
        })
      );

      const designations = await withRetry(() =>
        prisma.designation.findMany({
          where: { companyId },
          orderBy: { name: 'asc' },
        })
      );

      const categories = await withRetry(() =>
        prisma.employeeCategory.findMany({
          where: { companyId },
          orderBy: { name: 'asc' },
        })
      );

      const levels = await withRetry(() =>
        prisma.level.findMany({
          where: { companyId },
          orderBy: { name: 'asc' },
        })
      );

      const grades = await withRetry(() =>
        prisma.grade.findMany({
          where: { companyId },
          orderBy: { name: 'asc' },
        })
      );

      const attendanceTypes = await withRetry(() =>
        prisma.attendanceTypeConfig.findMany({
          where: { companyId },
          orderBy: { name: 'asc' },
        })
      );

      const shifts = await withRetry(() =>
        prisma.shift.findMany({
          where: { companyId },
          orderBy: { name: 'asc' },
        })
      );

      // ptGroups from employees
      const employeesWithPtGroup = await withRetry(() =>
        prisma.employee.findMany({
          where: {
            companyId,
            ptGroup: { not: null },
            deletedAt: null,
          },
          select: { ptGroup: true },
        })
      );

      const uniquePtGroups = Array.from(
        new Set(employeesWithPtGroup.map((emp) => emp.ptGroup).filter(Boolean))
      );
      const ptGroups = uniquePtGroups
        .map((ptGroup) => ({ id: ptGroup!, name: ptGroup! }))
        .sort((a, b) => a.name.localeCompare(b.name));

      return NextResponse.json({
        branches,
        departments,
        designations,
        categories,
        levels,
        grades,
        attendanceTypes,
        shifts,
        ptGroups,
      });
    } catch (error: any) {
      console.error('GET /setups failed:', error);
      return NextResponse.json(
        { error: 'Failed to load setup data', details: error.message },
        { status: 500 }
      );
    }
  });
}

// ADD setup item  (unchanged except better error logging)
export async function POST(req: Request) {
  return withCompany(async (companyId) => {
    const { type, name } = await req.json();

    if (!type || !name?.trim()) {
      return NextResponse.json({ error: 'Type and name required' }, { status: 400 });
    }

    const models = {
      branch: prisma.branch,
      department: prisma.department,
      designation: prisma.designation,
      category: prisma.employeeCategory,
      level: prisma.level,
      grade: prisma.grade,
      attendanceType: prisma.attendanceTypeConfig,
    } as const;

    const model = models[type as keyof typeof models];
    if (!model) {
      return NextResponse.json({ error: 'Invalid setup type' }, { status: 400 });
    }

    try {
      let created;

      if (type === 'branch') {
        const code = name.trim().toUpperCase().replace(/\s+/g, '_').substring(0, 50);
        created = await model.create({
          data: {
            name: name.trim(),
            companyId,
            code,
            isHeadOffice: false,
          },
        });
      } else {
        created = await model.create({
          data: { name: name.trim(), companyId },
        });
      }

      return NextResponse.json(created);
    } catch (error: any) {
      console.error('POST setup error:', error);
      if (error.code === 'P2002') {
        return NextResponse.json(
          { error: `${name.trim()} already exists for this company` },
          { status: 409 }
        );
      }
      return NextResponse.json(
        { error: error.message || 'Failed to create setup item' },
        { status: 500 }
      );
    }
  });
}

// DELETE setup item  (unchanged except logging)
export async function DELETE(req: Request) {
  return withCompany(async (companyId) => {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const type = searchParams.get('type');

    if (!id || !type) {
      return NextResponse.json({ error: 'Missing id or type' }, { status: 400 });
    }

    const models = {
      branch: prisma.branch,
      department: prisma.department,
      designation: prisma.designation,
      category: prisma.employeeCategory,
      level: prisma.level,
      grade: prisma.grade,
      attendanceType: prisma.attendanceTypeConfig,
    } as const;

    const model = models[type as keyof typeof models];
    if (!model) {
      return NextResponse.json({ error: 'Invalid setup type' }, { status: 400 });
    }

    try {
      const record = await model.findFirst({
        where: { id, companyId },
      });

      if (!record) {
        return NextResponse.json(
          { error: 'Record not found or does not belong to this company' },
          { status: 404 }
        );
      }

      await model.delete({ where: { id } });

      return NextResponse.json({ success: true });
    } catch (error: any) {
      console.error('DELETE setup error:', error);
      if (error.code === 'P2025') {
        return NextResponse.json({ error: 'Record not found' }, { status: 404 });
      }
      return NextResponse.json(
        { error: error.message || 'Failed to delete setup item' },
        { status: 500 }
      );
    }
  });
}