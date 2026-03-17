const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
  const emp = await prisma.employee.findFirst({
    where: { deletedAt: null }
  });
  if (!emp) return console.log("No employee found");

  const company = await prisma.company.findFirst({
    where: { id: emp.companyId }
  });
  
  const policy = await prisma.leavePolicy.findFirst({
    where: { companyId: emp.companyId, isActive: true } // grab any active policy
  });

  if (!policy) return console.log("No leave policy found");

  console.log("Found policy:", policy.code);

  const date = new Date("2024-03-15");
  
  console.log("Upserting attendance...");
  const att = await prisma.attendance.upsert({
    where: { employeeId_date: { employeeId: emp.id, date } },
    update: { status: "ON_LEAVE", notes: policy.code, updatedBy: "test" },
    create: {
      companyId: emp.companyId,
      employeeId: emp.id,
      date,
      status: "ON_LEAVE",
      notes: policy.code,
      createdBy: "test",
    }
  });
  console.log("Upserted attendance:", att);

  await prisma.$disconnect();
}
test().catch(console.error);
