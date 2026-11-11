"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { RefreshCcw, TriangleAlert, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

export function OrderActions({
  orderId,
  status,
}: {
  orderId: string;
  status: string;
}) {
  const router = useRouter();
  const toast = useToast();
  const [retrying, setRetrying] = React.useState(false);
  const [canceling, setCanceling] = React.useState(false);
  const [confirm, setConfirm] = React.useState(false);

  const canRetry = status === "PENDING";
  const canCancel = ["PENDING", "PAID", "PROCESSING"].includes(status);

  const retry = async () => {
    setRetrying(true);
    try {
      const res = await fetch("/api/payments/retry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      });
      const json = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        message?: string;
        data?: { redirectUrl?: string };
      };
      if (!res.ok || !json.ok || !json.data?.redirectUrl) {
        toast.error("پرداخت مجدد انجام نشد", json.message);
        return;
      }
      window.location.assign(json.data.redirectUrl);
    } catch {
      toast.error("خطای شبکه", "لطفاً دوباره تلاش کنید.");
    } finally {
      setRetrying(false);
    }
  };

  const cancel = async () => {
    setCanceling(true);
    try {
      const res = await fetch(`/api/orders/${orderId}/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: "لغو توسط کاربر از پنل کاربری" }),
      });
      const json = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        message?: string;
      };
      if (!res.ok || !json.ok) {
        toast.error("لغو سفارش انجام نشد", json.message);
        return;
      }
      toast.success("سفارش لغو شد", "موجودی کالاها آزاد شد.");
      setConfirm(false);
      router.refresh();
    } catch {
      toast.error("خطای شبکه", "لطفاً دوباره تلاش کنید.");
    } finally {
      setCanceling(false);
    }
  };

  if (!canRetry && !canCancel) return null;

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {canRetry && (
          <Button onClick={retry} loading={retrying} disabled={retrying}>
            <RefreshCcw className="h-4 w-4" />
            پرداخت مجدد
          </Button>
        )}
        {canCancel && !confirm && (
          <Button
            variant="outline"
            onClick={() => setConfirm(true)}
            disabled={canceling}
            className="text-danger-600 hover:border-danger-200 hover:bg-danger-50"
          >
            <XCircle className="h-4 w-4" />
            لغو سفارش
          </Button>
        )}
      </div>

      {confirm && (
        <div className="rounded-xl border border-danger-200 bg-danger-50 p-3">
          <p className="flex items-start gap-1.5 text-[12px] font-bold leading-5 text-danger-700">
            <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" />
            آیا از لغو این سفارش مطمئن هستید؟ در صورت پرداخت، مبلغ به کیف پول شما بازمی‌گردد.
          </p>
          <div className="mt-2.5 flex gap-2">
            <Button
              size="sm"
              variant="danger"
              onClick={cancel}
              loading={canceling}
              disabled={canceling}
            >
              بله، لغو شود
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setConfirm(false)}
              disabled={canceling}
            >
              انصراف
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
