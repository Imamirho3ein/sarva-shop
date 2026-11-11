"use client";

import * as React from "react";
import Link from "next/link";
import { Home, RefreshCcw, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    // در محیط توسعه، جزئیات خطا در کنسول مرورگر قابل مشاهده است.
    if (process.env.NODE_ENV === "development") {
      console.error(error);
    }
  }, [error]);

  return (
    <div className="container-site py-10 lg:py-16">
      <div className="mx-auto max-w-lg rounded-2xl border border-ink-100 bg-white p-6 text-center shadow-xs sm:p-8">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-danger-100 text-danger-600">
          <TriangleAlert className="h-7 w-7" />
        </span>
        <h1 className="mt-4 text-lg font-black text-ink-900 sm:text-xl">
          خطایی رخ داد
        </h1>
        <p className="mt-2 text-[12px] leading-7 text-ink-500">
          متأسفانه در پردازش درخواست شما مشکلی پیش آمد. می‌توانید دوباره تلاش کنید؛ اگر
          مشکل ادامه داشت، چند دقیقه بعد سر بزنید یا با پشتیبانی تماس بگیرید.
        </p>

        {error.digest && (
          <p
            dir="ltr"
            className="mt-3 rounded-lg bg-ink-50 px-3 py-2 text-center text-[10px] text-ink-400"
          >
            کد خطا: {error.digest}
          </p>
        )}

        <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
          <Button type="button" onClick={reset}>
            <RefreshCcw className="h-4 w-4" />
            تلاش دوباره
          </Button>
          <Button asChild variant="outline">
            <Link href="/">
              <Home className="h-4 w-4" />
              صفحه اصلی
            </Link>
          </Button>
          <Button asChild variant="ghost">
            <Link href="/contact">تماس با پشتیبانی</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
