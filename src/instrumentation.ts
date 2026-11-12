/**
 * کدهای زمان راه‌اندازی سرور Next.js.
 * در محیط Node و فقط یک‌بار برای هر پروسه اجرا می‌شود.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  if (process.env.NEXT_PHASE === "phase-production-build") return;

  // عمداً await نمی‌کنیم تا شروع سرور و healthcheck پلتفرم معطل نشود.
  import("./lib/db-bootstrap")
    .then((module) => module.bootstrapDatabase())
    .catch((error) => {
      console.error("[db-bootstrap] خطای غیرمنتظره:", error);
    });
}
