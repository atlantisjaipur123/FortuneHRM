const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const experiences = await prisma.experience.findMany();
  console.log("Experiences in DB:", experiences.length);
  if (experiences.length > 0) {
    console.log(experiences[0]);
  }
}

check().catch(console.error).finally(() => prisma.$disconnect());
