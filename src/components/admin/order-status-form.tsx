"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeftRight, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { useToast } from "@/components/ui/toast";
import { ORDER_STATUS_META } from "@/lib/order-status";
import type { OrderStatusKey } from "@/types";

const TRANSITIONS: Record<OrderStatusKey, OrderStatusKey[]> = {
  PENDING: ["CANCELED"],
  PAID: ["PROCESSING", "CANCELED", "REFUNDED"],
  PROCESSING: ["SHIPPED", "CANCELED", "REFUNDED"],
  SHIPPED: ["DELIVERED"],
  DELIVERED: ["REFUNDED"],
  CANCELED: [],
  REFUNDED: [],
};

export function OrderStatusForm({
  orderId,
  status,
  trackingCode,
}: {
  orderId: string;
  status: OrderStatusKey;
  trackingCode: string | null;
}) {
  const router = useRouter();
  const toast = useToast();
  const options = TRANSITIONS[status] ?? [];
  const [nextStatus, setNextStatus] = React.useState<string>(
    options[0] ?? "",
  );
  const [tracking, setTracking] = React.useState(trackingCode ?? "");
  const [note, setNote] = React.useState("");
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!nextStatus) return setError("وضعیت بعدی را انتخاب کنید.");

    setSaving(true);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: nextStatus,
          trackingCode: tracking.trim(),
          note: note.trim(),
        }),
      });
      const json = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        message?: string;
        errors?: Record<string, string>;
      };
      if (!res.ok || !json.ok) {
        setError(
          json.message ??
            Object.values(json.errors ?? {})[0] ??
            "تغییر وضعیت انجام نشد.",
        );
        return;
      }
      toast.success(
        "وضعیت سفارش به‌روزرسانی شد",
        ORDER_STATUS_META[nextStatus as OrderStatusKey]?.label,
      );
      setNote("");
      router.refresh();
    } catch {
      setError("خطای شبکه. لطفاً دوباره تلاش کنید.");
    } finally {
      setSaving(false);
    }
  };

  if (options.length === 0) {
    return (
      <section className="rounded-2xl border border-ink-100 bg-white p-4 shadow-xs">
        <h2 className="text-sm font-black text-ink-900">تغییر وضعیت</h2>
        <p className="mt-2 text-[11px] leading-5 text-ink-500">
          این سفارش در وضعیت «{ORDER_STATUS_META[status]?.label}» قرار دارد و تغییر
          وضعیت بعدی برای آن ممکن نیست.
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-ink-100 bg-white p-4 shadow-xs">
      <h2 className="flex items-center gap-1.5 text-sm font-black text-ink-900">
        <ArrowLeftRight className="h-4 w-4 text-brand-700" />
        تغییر وضعیت سفارش
      </h2>
      <p className="mt-1 text-[10px] leading-5 text-ink-500">
        وضعیت فعلی: {ORDER_STATUS_META[status]?.label}
      </p>

      <form onSubmit={submit} className="mt-3 space-y-3">
        <Select
          label="وضعیت بعدی"
          options={options.map((key) => ({
            value: key,
            label: ORDER_STATUS_META[key]?.label ?? key,
          }))}
          value={nextStatus}
          onChange={(e) => setNextStatus(e.target.value)}
        />
        <Input
          label="کد رهگیری مرسوله — اختیاری"
          value={tracking}
          onChange={(e) => setTracking(e.target.value)}
          dir="ltr"
          className="text-left"
          placeholder="برای ارسال سفارش"
        />
        <Textarea
          label="یادداشت / دلیل — اختیاری"
          rows={2}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="در روند سفارش و اعلان کاربر نمایش داده می‌شود."
        />
        {error && (
          <p className="rounded-lg bg-danger-50 px-3 py-2 text-[11px] font-bold text-danger-600">
            {error}
          </p>
        )}
        <Button type="submit" loading={saving} disabled={saving} className="w-full">
          <Save className="h-4 w-4" />
          ثبت تغییر وضعیت
        </Button>
      </form>
    </section>
  );
}
