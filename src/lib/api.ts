import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { AuthError } from "@/lib/auth";
import { formatZodError } from "@/lib/validators";

/** پاسخ موفق استاندارد */
export function ok<T>(data: T, init?: ResponseInit) {
  return NextResponse.json({ ok: true, data }, init);
}

/** پاسخ خطا استاندارد */
export function fail(message: string, status = 400, extra?: Record<string, unknown>) {
  return NextResponse.json({ ok: false, message, ...extra }, { status });
}

/** تبدیل خطاهای شناخته‌شده به پاسخ HTTP */
export function toErrorResponse(err: unknown) {
  if (err instanceof AuthError) {
    return fail(err.message, err.status);
  }
  if (err instanceof ZodError) {
    return fail("اطلاعات ورودی معتبر نیست", 422, { errors: formatZodError(err) });
  }
  if (err instanceof Error) {
    if (err.message.includes("Unique constraint")) {
      return fail("این مقدار قبلاً ثبت شده است", 409);
    }
    return fail(err.message || "خطای سرور", 500);
  }
  return fail("خطای ناشناخته", 500);
}

/** پوشش امن برای route handlers */
export function route<T extends unknown[]>(
  fn: (...args: T) => Promise<Response>,
): (...args: T) => Promise<Response> {
  return async (...args: T) => {
    try {
      return await fn(...args);
    } catch (err) {
      if (process.env.NODE_ENV === "development") console.error(err);
      return toErrorResponse(err);
    }
  };
}
