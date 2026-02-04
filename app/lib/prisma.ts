// lib/prisma.ts
import { PrismaClient } from "@prisma/client";

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

const prismaClientSingleton = () => {
  const client = new PrismaClient({
    log: process.env.NODE_ENV === "development"
      ? ["query", "info", "warn", "error"]
      : ["warn", "error"],  // In prod, reduce noise but keep warnings/errors
  });

  // Listen for Prisma engine errors (helpful for pool/connection issues)
  client.$on("error", (e) => {
    console.error("[Prisma Error Event]:", e);
  });

  // Optional: query logging in dev to see slow queries or connection usage
  // client.$on("query", (e) => {
  //   console.log("[Query]", e.query, "Duration:", e.duration, "ms");
  // });

  return client;
};

const prisma = global.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== "production") {
  global.prisma = prisma;
}

export { prisma };
export default prisma;