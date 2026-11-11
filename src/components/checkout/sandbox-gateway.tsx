"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, CreditCard, Lock, ShieldCheck, TriangleAlert, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatPrice, toPersianDigits } from "@/lib/format";

/**
 * درگاه پرداخت آزمایشی — دقیقاً مثل یک درگاه واقعی، اما بدون تراکنش مالی.
 * تأیید یا لغو پرداخت از طریق API سرور انجام می‌شود تا وضعیت سفارش در دیتابیس به‌روز شود.
 */
export function SandboxGateway({
  authority,
  orderNumber,
  amount,
  alreadyPaid = false,
}: {
  authority: string;
  orderNumber: string;
  amount: number;
  alreadyPaid?: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = React.useState<"success" | "fail" | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const decide = async (success: boolean) => {
    setError(null);
    setLoading(success ? "success" : "fail");
    try {
      const res = await fetch("/api/payments/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ authority, success }),
      });
      const json = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        message?: string;
        orderNumber?: string;
        data?: { orderNumber?: string };
      };

      const number = json.data?.orderNumber ?? json.orderNumber ?? orderNumber;

      if (res.ok && json.ok) {
        router.replace(`/checkout/result?order=${encodeURIComponent(number)}`);
        return;
      }

      if (!success) {
        router.replace(
          `/checkout/result?order=${encodeURIComponent(number)}&failed=1&message=${encodeURIComponent(
            json.message ?? "پرداخت لغو شد.",
          )}`,
        );
        return;
      }

      setError(json.message ?? "پرداخت انجام نشد. لطفاً دوباره تلاش کنید.");
    } catch {
      setError("خطای شبکه در ارتباط با درگاه. لطفاً دوباره تلاش کنید.");
    } finally {
      setLoading(null);
    }
  };

  if (alreadyPaid) {
    return (
      <div className="mx-auto w-full max-w-lg rounded-2xl border border-ink-100 bg-white p-6 text-center shadow-soft">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-success-100 text-success-600">
          <CheckCircle2 className="h-7 w-7" />
        </span>
        <h1 className="mt-4 text-lg font-black text-ink-900">این تراکنش قبلاً پرداخت شده است</h1>
        <p className="mt-1.5 text-sm text-ink-500">
          سفارش {toPersianDigits(orderNumber)} با موفقیت پرداخت شده است.
        </p>
        <Button
          className="mt-5"
          onClick={() =>
            router.replace(`/checkout/result?order=${encodeURIComponent(orderNumber)}`)
          }
        >
          مشاهده نتیجه سفارش
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-lg overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-soft">
      {/* سربرگ درگاه */}
      <div className="bg-gradient-to-l from-brand-800 to-brand-600 p-5 text-white">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/15">
              <CreditCard className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-black">درگاه پرداخت آزمایشی سَروا</p>
              <p className="mt-0.5 text-[10px] text-white/70">Sandbox Payment Gateway</p>
            </div>
          </div>
          <span className="rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-bold">
            امن
          </span>
        </div>
      </div>

      <div className="p-5">
        <div className="rounded-xl bg-ink-50 p-4">
          <dl className="space-y-3 text-[12px]">
            <div className="flex items-center justify-between gap-2">
              <dt className="text-ink-500">پذیرنده</dt>
              <dd className="font-black text-ink-900">فروشگاه سَروا</dd>
            </div>
            <div className="flex items-center justify-between gap-2">
              <dt className="text-ink-500">شماره سفارش</dt>
              <dd className="font-bold text-ink-800">{toPersianDigits(orderNumber)}</dd>
            </div>
            <div className="flex items-center justify-between gap-2 border-t border-dashed border-ink-200 pt-3">
              <dt className="text-ink-500">مبلغ قابل پرداخت</dt>
              <dd className="text-base font-black text-brand-800">{formatPrice(amount)}</dd>
            </div>
          </dl>
        </div>

        <div className="mt-3 flex items-start gap-2 rounded-lg bg-warning-100 px-3 py-2.5 text-[11px] leading-5 text-warning-500">
          <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" />
          <span>
            این یک درگاه شبیه‌سازی‌شده برای نمایش و آزمایش است. هیچ اطلاعات بانکی واقعی دریافت
            نمی‌شود و مبلغی از حساب شما کسر نخواهد شد.
          </span>
        </div>

        {error && (
          <p
            role="alert"
            className="mt-3 rounded-lg bg-danger-50 px-3 py-2 text-[11px] font-bold leading-5 text-danger-600"
          >
            {error}
          </p>
        )}

        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          <Button
            type="button"
            size="lg"
            onClick={() => decide(true)}
            loading={loading === "success"}
            disabled={Boolean(loading)}
          >
            <CheckCircle2 className="h-4 w-4" />
            پرداخت موفق
          </Button>
          <Button
            type="button"
            size="lg"
            variant="outline"
            onClick={() => decide(false)}
            loading={loading === "fail"}
            disabled={Boolean(loading)}
            className="text-danger-600 hover:border-danger-200 hover:bg-danger-50"
          >
            <XCircle className="h-4 w-4" />
            انصراف از پرداخت
          </Button>
        </div>

        <p className="mt-4 flex items-center justify-center gap-1.5 text-[10px] text-ink-400">
          <Lock className="h-3.5 w-3.5" />
          شناسه تراکنش: <span dir="ltr" className="font-mono">{authority}</span>
        </p>
        <p className="mt-1 flex items-center justify-center gap-1.5 text-[10px] text-ink-400">
          <ShieldCheck className="h-3.5 w-3.5 text-brand-700" />
          تأیید نهایی توسط سرور سَروا انجام می‌شود.
        </p>
      </div>
    </div>
  );
}
