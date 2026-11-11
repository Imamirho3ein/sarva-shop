/**
 * اجرای PostgreSQL تعبیه‌شده برای محیط‌هایی که Docker ندارند.
 * این اسکریپت یک سرور واقعی PostgreSQL را در پوشه‌ی .pgdata راه می‌اندازد.
 *
 *   npm run db:local
 *
 * سپس در ترمینال دیگر:  npx prisma db push && npm run db:seed
 */
import EmbeddedPostgres from "embedded-postgres";
import { existsSync } from "node:fs";
import { join } from "node:path";

const DATA_DIR = join(process.cwd(), ".pgdata");
const PORT = Number(process.env.PG_PORT ?? 5432);
const USER = "sarva";
const PASSWORD = "sarva_secret";
const DB = "sarva_shop";

const log = (msg: string) => {
  if (process.env.DB_LOCAL_VERBOSE) console.log(msg);
};

const pg = new EmbeddedPostgres({
  databaseDir: DATA_DIR,
  port: PORT,
  user: USER,
  password: PASSWORD,
  persistent: true,
  authMethod: "password",
  autoRehydrateSymlinks: true,
  // UTF-8 برای پشتیبانی کامل از فارسی
  initdbFlags: ["--encoding=UTF8", "--locale=C"],
  onLog: log,
  onError: (e) => console.error("[postgres]", e),
});

async function main() {
  const initialized = existsSync(join(DATA_DIR, "PG_VERSION"));
  if (!initialized) {
    console.log("⏳ راه‌اندازی اولیه‌ی خوشه‌ی PostgreSQL…");
    await pg.initialise();
  }

  await pg.start();
  console.log(`✅ PostgreSQL روی پورت ${PORT} آماده است.`);

  try {
    await pg.createDatabase(DB);
    console.log(`✅ دیتابیس «${DB}» ساخته شد.`);
  } catch {
    console.log(`ℹ️  دیتابیس «${DB}» از قبل وجود دارد.`);
  }

  console.log(`\nDATABASE_URL="postgresql://${USER}:${PASSWORD}@localhost:${PORT}/${DB}?schema=public"\n`);
  console.log("برای توقف: Ctrl+C");

  const shutdown = async () => {
    console.log("\n⏹  در حال توقف PostgreSQL…");
    try {
      await pg.stop();
    } finally {
      process.exit(0);
    }
  };
  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);

  // زنده نگه‌داشتن فرآیند تا سرور در حال اجرا بماند
  setInterval(() => {}, 1 << 30);
}

main().catch(async (err) => {
  console.error("❌ خطا در اجرای دیتابیس محلی:", err);
  process.exit(1);
});
