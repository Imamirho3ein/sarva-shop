import "server-only";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

/**
 * کلاینت Prisma 7 با درایور آداپتر PostgreSQL.
 * یک نمونه‌ی مشترک در توسعه تا HMR اتصال‌ها را چند برابر نکند.
 */

const connectionString =
  process.env.DATABASE_URL ??
  "postgresql://sarva:sarva_secret@localhost:5432/sarva_shop?schema=public";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function createClient() {
  const adapter = new PrismaPg({ connectionString });
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });
}

export const prisma = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
