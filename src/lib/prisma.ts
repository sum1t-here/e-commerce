import { PrismaClient } from "@prisma/client";

declare global {
  // Declare a type-safe global variable for Prisma client
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

const prisma = global.prisma || new PrismaClient();

// Avoid multiple Prisma client instances in development mode
if (process.env.NODE_ENV !== "production") {
  global.prisma = prisma;
}

export default prisma;
