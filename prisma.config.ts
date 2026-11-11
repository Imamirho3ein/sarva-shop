import "dotenv/config";
import { defineConfig, env } from "prisma/config";

/**
 * پیکربندی Prisma 7 — آدرس اتصال از اینجا به CLI داده می‌شود.
 * مستندات: https://pris.ly/d/config-datasource
 */
export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: env("DATABASE_URL"),
  },
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
});
