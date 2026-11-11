"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  CheckCircle2,
  CircleAlert,
  Clock3,
  CreditCard,
  MapPin,
  Package,
  RefreshCcw,
  ShoppingBag,
  Truck,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDate, formatPrice, toPersianDigits } from "@/lib/format";
import { PAYMENT_METHOD_LABELS, SHIPPING_METHOD_LABELS } from "@/lib/order-status";
import { useCart } from "@/store/cart";
import type { OrderDetailDTO } from "@/types";

const FINALIZED = ["PAID", "PROCESSING", "SHIPPED", "DELIVERED"];

export function CheckoutResult({
  order,
  failed = false,
  message,
}: {
  order: OrderDetailDTO;
  failed?: boolean;
  message?: string;
}) {
  const clearCart = useCart((s) => s.clear);
  const [retrying, setRetrying] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const isFinalized = FINALIZED.includes(order.status);
  const isPending = order.status === "PENDING";
  const isCanceled = order.status === "CANCELED" || order.status === "REFUNDED";
  const showFailure = !isFinalized && (failed || isCanceled);

  // پس از پرداخت موفق، سبد خرید پاک می‌شود.
  React.useEffect(() => {
    if (isFinalized) clearCart();
  }, [isFinalized, clearCart]);

  const retryPayment = async () => {
    setError(null);
    setRetrying(true);
    try {
      const res = await fetch("/api/payments/retry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: order.id }),
      });
      const json = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        message?: string;
        data?: { redirectUrl?: string };
      };
      if (!res.ok || !json.ok || !json.data?.redirectUrl) {
        setError(json.message ?? "ایجاد تراکنش جدید انجام نشد.");
        return;
      }
      window.location.assign(json.data.redirectUrl);
    } catch {
      setError("خطای شبکه. لطفاً دوباره تلاش کنید.");
    } finally {
      setRetrying(false);
    }
  };

  const tone = showFailure
    ? {
        icon: <XCircle className="h-8 w-8" />,
        wrap: "bg-danger-100 text-danger-600",
        title: "پرداخت انجام نشد",
        text:
          message ||
          (isCanceled
            ? "این سفارش لغو شده است. مبلغی از حساب شما کسر نشده و موجودی کالاها آزاد شده است."
            : "پرداخت شما تکمیل نشد. می‌توانید دوباره تلاش کنید."),
      }
    : isFinalized
      ? {
          icon: <CheckCircle2 className="h-8 w-8" />,
          wrap: "bg-success-100 text-success-600",
          title: "سفارش شما با موفقیت ثبت شد",
          text: "پرداخت با موفقیت انجام شد و سفارش شما در صف پردازش قرار گرفت. جزئیات از طریق پیامک و پنل کاربری قابل پیگیری است.",
        }
      : {
          icon: <Clock3 className="h-8 w-8" />,
          wrap: "bg-warning-100 text-warning-500",
          title: "سفارش در انتظار پرداخت است",
          text: "سفارش شما ثبت شده اما پرداخت آن کامل نشده است. برای نهایی‌شدن، پرداخت را تکمیل کنید.",
        };

  return (
    <div className="mx-auto w-full max-w-3xl">
      <div className="overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-soft">
        <div className="border-b border-ink-100 p-5 text-center sm:p-7">
          <span
            className={`mx-auto flex h-16 w-16 items-center justify-center rounded-2xl ${tone.wrap}`}
          >
            {tone.icon}
          </span>
          <h1 className="mt-4 text-lg font-black text-ink-900 sm:text-xl">{tone.title}</h1>
          <p className="mx-auto mt-2 max-w-md text-[12px] leading-6 text-ink-500 sm:text-[13px]">
            {tone.text}
          </p>

          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            <Badge variant="outline" size="md">
              شماره سفارش: <span className="font-black">{toPersianDigits(order.orderNumber)}</span>
            </Badge>
            <Badge
              variant={isFinalized ? "success" : showFailure ? "danger" : "warning"}
              size="md"
            >
              {order.statusLabel}
            </Badge>
          </div>
          <p className="mt-2 text-[11px] text-ink-400">تاریخ ثبت: {formatDate(order.createdAt)}</p>

          {error && (
            <p className="mx-auto mt-3 max-w-md rounded-lg bg-danger-50 px-3 py-2 text-[11px] font-bold text-danger-600">
              {error}
            </p>
          )}

          <div className="mt-5 flex flex-wrap justify-center gap-2">
            {isPending && (
              <Button onClick={retryPayment} loading={retrying} disabled={retrying}>
                <RefreshCcw className="h-4 w-4" />
                پرداخت مجدد
              </Button>
            )}
            {showFailure && (
              <Button asChild>
                <Link href="/checkout">
                  <RefreshCcw className="h-4 w-4" />
                  تلاش دوباره برای خرید
                </Link>
              </Button>
            )}
            <Button asChild variant={isFinalized ? "primary" : "outline"}>
              <Link href={`/account/orders/${order.id}`}>
                <Package className="h-4 w-4" />
                پیگیری سفارش
              </Link>
            </Button>
            <Button asChild variant="ghost">
              <Link href="/products">
                <ShoppingBag className="h-4 w-4" />
                ادامه خرید
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid gap-4 p-5 sm:grid-cols-2 sm:p-6">
          <div className="rounded-xl border border-ink-100 p-3.5">
            <h2 className="flex items-center gap-1.5 text-[12px] font-black text-ink-900">
              <MapPin className="h-4 w-4 text-brand-700" />
              آدرس تحویل
            </h2>
            <p className="mt-1.5 text-[11px] font-bold leading-5 text-ink-700">
              {order.address.receiverName ?? "—"}
              {order.address.receiverPhone
                ? ` — ${toPersianDigits(order.address.receiverPhone)}`
                : ""}
            </p>
            <p className="mt-0.5 text-[11px] leading-5 text-ink-500">
              {[order.address.province, order.address.city, order.address.addressLine]
                .filter(Boolean)
                .join("، ") || "—"}
            </p>
          </div>

          <div className="rounded-xl border border-ink-100 p-3.5">
            <h2 className="flex items-center gap-1.5 text-[12px] font-black text-ink-900">
              <Truck className="h-4 w-4 text-brand-700" />
              ارسال و پرداخت
            </h2>
            <p className="mt-1.5 text-[11px] leading-5 text-ink-600">
              روش ارسال:{" "}
              <span className="font-bold text-ink-800">
                {SHIPPING_METHOD_LABELS[order.shippingMethod] ?? order.shippingMethod}
              </span>
            </p>
            <p className="mt-0.5 text-[11px] leading-5 text-ink-600">
              روش پرداخت:{" "}
              <span className="font-bold text-ink-800">
                {PAYMENT_METHOD_LABELS[order.paymentMethod] ?? order.paymentMethod}
              </span>
            </p>
            {order.trackingCode && (
              <p className="mt-0.5 text-[11px] leading-5 text-ink-600">
                کد رهگیری:{" "}
                <span className="font-bold text-ink-800">
                  {toPersianDigits(order.trackingCode)}
                </span>
              </p>
            )}
          </div>
        </div>

        <div className="border-t border-ink-100 p-5 sm:p-6">
          <h2 className="flex items-center gap-1.5 text-sm font-black text-ink-900">
            <CreditCard className="h-4 w-4 text-brand-700" />
            اقلام سفارش
          </h2>
          <ul className="mt-3 space-y-2">
            {order.items.map((item) => (
              <li key={item.id} className="flex items-center gap-2.5">
                <Link
                  href={`/product/${item.slug}`}
                  className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-ink-100 bg-ink-50"
                >
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    sizes="48px"
                    className="object-contain p-1"
                  />
                </Link>
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-1 text-[11px] font-bold text-ink-800">{item.name}</p>
                  <p className="mt-0.5 text-[10px] text-ink-500">
                    {toPersianDigits(item.quantity)} عدد ×{" "}
                    {formatPrice(item.unitPrice)}
                  </p>
                </div>
                <span className="text-[11px] font-black text-ink-900">
                  {formatPrice(item.total)}
                </span>
              </li>
            ))}
          </ul>

          <dl className="mt-4 space-y-2 border-t border-ink-100 pt-3 text-[11px]">
            <div className="flex items-center justify-between gap-2">
              <dt className="text-ink-500">مبلغ کالاها</dt>
              <dd className="font-bold text-ink-800">{formatPrice(order.subtotal)}</dd>
            </div>
            {order.discount > 0 && (
              <div className="flex items-center justify-between gap-2">
                <dt className="text-ink-500">تخفیف</dt>
                <dd className="font-bold text-danger-600">{formatPrice(order.discount)}−</dd>
              </div>
            )}
            <div className="flex items-center justify-between gap-2">
              <dt className="text-ink-500">هزینه ارسال</dt>
              <dd className="font-bold text-ink-800">
                {order.shippingFee === 0 ? (
                  <span className="text-success-600">رایگان</span>
                ) : (
                  formatPrice(order.shippingFee)
                )}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-2 border-t border-dashed border-ink-200 pt-2.5">
              <dt className="text-[12px] font-black text-ink-900">مبلغ نهایی</dt>
              <dd className="text-sm font-black text-brand-800">{formatPrice(order.total)}</dd>
            </div>
          </dl>
        </div>
      </div>

      <p className="mt-4 flex items-center justify-center gap-1.5 text-center text-[10px] leading-5 text-ink-400">
        <CircleAlert className="h-3.5 w-3.5" />
        در صورت بروز مشکل در پرداخت یا تحویل، با پشتیبانی سَروا در ارتباط باشید.
      </p>
    </div>
  );
}
