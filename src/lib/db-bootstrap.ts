import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { prisma } from "./prisma";

/**
 * آماده‌سازی خودکار دیتابیس در اولین اجرا روی سرور.
 *
 * در پلتفرم‌هایی مثل Runflare که دسترسی به ترمینال/کنسول اپ سخت است،
 * این ماژول هنگام شروع سرور (instrumentation) در پس‌زمینه اجرا می‌شود و:
 *   ۱. اگر دیتابیس کاملاً خالی باشد → `prisma db push` و سپس `prisma db seed`
 *   ۲. اگر جدول‌ها باشند اما جدول Product نباشد → فقط `prisma db push`
 *   ۳. اگر seed قبلی نصفه مانده باشد (محصولات کم و هیچ سفارشی ثبت نشده) → seed دوباره
 *   ۴. اگر فروشگاه آماده باشد → هیچ کاری نمی‌کند
 *
 * هیچ‌وقت داده‌ی یک فروشگاه واقعی (دارای سفارش) را پاک یا بازنویسی نمی‌کند و
 * خطاها فقط لاگ می‌شوند تا اجرای اپ متوقف نشود.
 *
 * غیرفعال‌سازی: متغیر محیطی `AUTO_DB_SETUP=0`
 */

const COMMAND_TIMEOUT_MS = 900_000;

/** حداقل تعداد محصول برای اینکه نصب را «کامل» بدانیم. */
const MIN_SEEDED_PRODUCTS = 10;
let inFlight: Promise<void> | null = null;

/** یک‌بار در طول عمر هر پروسه اجرا می‌شود. */
export function bootstrapDatabase(): Promise<void> {
  inFlight ??= runBootstrap().finally(() => {
    inFlight = null;
  });
  return inFlight;
}

async function countPublicTables(): Promise<number> {
  const rows = await prisma.$queryRaw<Array<{ count: number }>>`
    SELECT count(*)::int AS count
    FROM information_schema.tables
    WHERE table_schema = current_schema() AND table_type = 'BASE TABLE'
  `;
  return Number(rows[0]?.count ?? 0);
}

async function productTableExists(): Promise<boolean> {
  const rows = await prisma.$queryRaw<Array<{ exists: boolean }>>`
    SELECT EXISTS (
      SELECT 1 FROM information_schema.tables
      WHERE table_schema = current_schema() AND table_name = 'Product'
    ) AS exists
  `;
  return rows[0]?.exists === true;
}

async function countRows(table: "Product" | "Order"): Promise<number> {
  const rows = await prisma.$queryRawUnsafe<Array<{ count: number }>>(
    `SELECT count(*)::int AS count FROM "${table}"`,
  );
  return Number(rows[0]?.count ?? 0);
}

function runPrisma(args: string[]): Promise<void> {
  return new Promise((resolve, reject) => {
    const cliPath = join(process.cwd(), "node_modules", "prisma", "build", "index.js");
    const useLocalCli = existsSync(cliPath);
    const command = useLocalCli ? process.execPath : process.platform === "win32" ? "npx.cmd" : "npx";
    const commandArgs = useLocalCli ? [cliPath, ...args] : ["--no-install", "prisma", ...args];

    const child = spawn(command, commandArgs, {
      cwd: process.cwd(),
      env: process.env,
      stdio: ["ignore", "pipe", "pipe"],
    });

    let output = "";
    const collect = (chunk: Buffer) => {
      output = (output + chunk.toString()).slice(-4000);
    };
    child.stdout.on("data", collect);
    child.stderr.on("data", collect);

    const timer = setTimeout(() => {
      child.kill("SIGKILL");
      reject(new Error(`prisma ${args.join(" ")} بیش از ${COMMAND_TIMEOUT_MS / 1000} ثانیه طول کشید.`));
    }, COMMAND_TIMEOUT_MS);

    child.on("error", (error) => {
      clearTimeout(timer);
      reject(error);
    });

    child.on("close", (code) => {
      clearTimeout(timer);
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`prisma ${args.join(" ")} با کد ${code} خارج شد:\n${output}`));
      }
    });
  });
}

async function runBootstrap(): Promise<void> {
  if (process.env.AUTO_DB_SETUP === "0") return;

  if (!process.env.DATABASE_URL) {
    console.warn("[db-bootstrap] DATABASE_URL تنظیم نشده است؛ آماده‌سازی دیتابیس رد شد.");
    return;
  }

  let tables: number;
  try {
    tables = await countPublicTables();
  } catch (error) {
    console.error("[db-bootstrap] اتصال به دیتابیس برقرار نشد:", error);
    return;
  }

  try {
    if (!(await productTableExists())) {
      if (tables === 0) {
        console.warn("[db-bootstrap] دیتابیس خالی است؛ ساخت جدول‌ها و درج داده‌ی نمونه…");
        await runPrisma(["db", "push"]);
        await runPrisma(["db", "seed"]);
        console.log("[db-bootstrap] دیتابیس آماده شد (schema + seed).");
        return;
      }

      console.warn("[db-bootstrap] جدول‌ها وجود دارند اما جدول Product نیست؛ اجرای prisma db push…");
      await runPrisma(["db", "push"]);
      console.log("[db-bootstrap] schema با موفقیت همگام شد (بدون seed).");
      return;
    }

    const [products, orders] = await Promise.all([countRows("Product"), countRows("Order")]);
    if (products >= MIN_SEEDED_PRODUCTS) return;

    if (orders > 0) {
      console.warn(
        `[db-bootstrap] فقط ${products} محصول ثبت شده اما ${orders} سفارش وجود دارد؛ برای جلوگیری از پاک شدن داده‌ها seed اجرا نشد.`,
      );
      return;
    }

    console.warn(
      `[db-bootstrap] نصب ناقص است (${products} محصول، بدون سفارش)؛ اجرای مجدد seed…`,
    );
    await runPrisma(["db", "push"]);
    await runPrisma(["db", "seed"]);
    console.log("[db-bootstrap] نصب ناقص با موفقیت تکمیل شد.");
  } catch (error) {
    console.error("[db-bootstrap] آماده‌سازی خودکار دیتابیس ناموفق بود:", error);
  }
}
