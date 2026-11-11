/**
 * ابزارهای ناوبری مشترک بین سرور و کلاینت.
 * این فایل نباید "use client" داشته باشد تا Server Componentها بتوانند
 * مستقیماً از آن استفاده کنند.
 */

/** فقط مسیرهای داخلی امن را می‌پذیرد و از open-redirect جلوگیری می‌کند. */
export function safeNext(next?: string | string[] | null): string {
  const value = Array.isArray(next) ? next[0] : next;
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "/";
  return value;
}
