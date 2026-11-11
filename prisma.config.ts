import "dotenv/config";
import { defineConfig } from "prisma/config";

/**
 * پیکربندی Prisma 7 — آدرس اتصال از اینجا به CLI داده می‌شود.
 * مستندات: https://pris.ly/d/config-datasource
 *
 * نکته‌ی استقرار: `prisma generate` در زمان نصب اجرا می‌شود و به دیتابیس
 * وصل نمی‌شود؛ بنابراین اگر `DATABASE_URL` هنوز تنظیم نشده باشد از یک
 * آدرس جای‌نگهدار استفاده می‌کنیم تا بیلد متوقف نشود. دستورات دیتابیس
 * (`db push`، `db seed` و …) به مقدار واقعی نیاز دارند.
 */
const databaseUrl =
  process.env.DATABASE_URL ?? "postgresql://sarva:sarva@localhost:5432/sarva_shop?schema=public";

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: databaseUrl,
  },
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
});
