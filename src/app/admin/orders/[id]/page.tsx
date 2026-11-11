import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowRight,
  CalendarDays,
  CreditCard,
  MapPin,
  Package,
  ReceiptText,
  Truck,
  User,
  Wallet,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import {
  formatDateLong,
  formatDateTime,
  formatPrice,
  toPersianDigits,
} from "@/lib/format";
import {
  ORDER_STATUS_META,
  PAYMENT_METHOD_LABELS,
  SHIPPING_METHOD_LABELS,
} from "@/lib/order-status";
import { OrderStatusBadge } from "@/components/account/order-status-badge";
import { OrderStatusForm } from "@/components/admin/order-status-form";
import { Badge } from "@/components/ui/badge";
import type { OrderStatusKey } from "@/types";

export const metadata: Metadata = {
  title: "جزئیات سفارش | پنل مدیریت",
  robots: { index: false, follow: false },
};

type Params = { params: Promise<{ id: string }> };

const PAYMENT_STATUS_LABELS: Record<string, string> = {
  PENDING: "در انتظار پرداخت",
  SUCCESS: "موفق",
  PAID: "پرداخت‌شده",
  FAILED: "ناموفق",
  CANCELED: "لغو‌شده",
  REFUNDED: "بازگشت‌داده‌شده",
};

const TIMELINE_DOT: Record<string, string> = {
  PENDING: "bg-warning-500 ring-warning-100",
  PAID: "bg-success-600 ring-success-100",
  PROCESSING: "bg-brand-600 ring-brand-100",
  SHIPPED: "bg-brand-700 ring-brand-100",
  DELIVERED: "bg-success-600 ring-success-100",
  CANCELED: "bg-danger-600 ring-danger-100",
  REFUNDED: "bg-ink-500 ring-ink-100",
};

export default async function AdminOrderDetailPage({ params }: Params) {
  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, name: true, email: true, phone: true } },
      items: true,
      payment: true,
      timeline: { orderBy: { createdAt: "asc" } },
    },
  });

  if (!order) notFound();

  const address = [
    order.province,
    order.city,
    order.addressLine,
  ]
    .filter(Boolean)
    .join("، ");

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Link
          href="/admin/orders"
          className="inline-flex items-center gap-1 text-[11px] font-bold text-ink-500 transition-colors hover:text-brand-700"
        >
          <ArrowRight className="h-3.5 w-3.5" />
          بازگشت به سفارش‌ها
        </Link>
        <OrderStatusBadge status={order.status} size="md" />
      </div>

      <div className="flex flex-wrap items-start justify-between gap-4 rounded-2xl border border-ink-100 bg-white p-4 shadow-xs sm:p-5">
        <div>
          <p className="text-[10px] font-medium text-ink-500">شماره سفارش</p>
          <h1 className="mt-1 flex items-center gap-1.5 text-lg font-black text-ink-900">
            <ReceiptText className="h-5 w-5 text-brand-700" />
            {toPersianDigits(order.orderNumber)}
          </h1>
          <p className="mt-1.5 flex items-center gap-1 text-[10px] text-ink-500">
            <CalendarDays className="h-3.5 w-3.5" />
            {formatDateTime(order.createdAt)}
          </p>
        </div>
        <div className="text-left sm:text-right">
          <p className="text-[10px] font-medium text-ink-500">مبلغ کل</p>
          <p className="mt-1 text-base font-black text-ink-900">
            {formatPrice(order.total)}
          </p>
          {order.paidAt && (
            <p className="mt-1 text-[10px] text-success-600">
              پرداخت در {formatDateLong(order.paidAt)}
            </p>
          )}
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px] xl:items-start">
        <div className="space-y-4">
          <section className="rounded-2xl border border-ink-100 bg-white p-4 shadow-xs">
            <h2 className="flex items-center gap-1.5 text-sm font-black text-ink-900">
              <Package className="h-4 w-4 text-brand-700" />
              اقلام سفارش
              <span className="text-[10px] font-medium text-ink-400">
                ({toPersianDigits(order.items.reduce((s, i) => s + i.quantity, 0))}{" "}
                کالا)
              </span>
            </h2>

            <ul className="mt-3 divide-y divide-ink-100">
              {order.items.map((item) => (
                <li key={item.id} className="flex gap-3 py-3 first:pt-0 last:pb-0">
                  <span className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-ink-100 bg-ink-50">
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        sizes="56px"
                        className="object-cover"
                      />
                    ) : null}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-2 text-[12px] font-bold leading-5 text-ink-800">
                      {item.name}
                    </p>
                    <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[10px] text-ink-500">
                      {item.sku && (
                        <span dir="ltr" className="text-ink-400">
                          {item.sku}
                        </span>
                      )}
                      <span className="h-2.5 w-px bg-ink-200" />
                      <span>
                        {toPersianDigits(item.quantity)} ×{" "}
                        {formatPrice(item.unitPrice)}
                      </span>
                    </div>
                  </div>
                  <span className="shrink-0 text-[11px] font-black text-ink-900">
                    {formatPrice(item.total)}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-2xl border border-ink-100 bg-white p-4 shadow-xs">
            <h2 className="text-sm font-black text-ink-900">زمان‌بندی سفارش</h2>
            {order.timeline.length === 0 ? (
              <p className="mt-2 text-[11px] text-ink-500">
                رویدادی برای این سفارش ثبت نشده است.
              </p>
            ) : (
              <ol className="mt-3">
                {order.timeline.map((event, index) => (
                  <li key={event.id} className="relative flex gap-3 pb-4 last:pb-0">
                    {index < order.timeline.length - 1 && (
                      <span className="absolute right-[5px] top-4 h-full w-px bg-ink-200" />
                    )}
                    <span
                      className={`relative z-10 mt-1 h-2.5 w-2.5 shrink-0 rounded-full ring-4 ${
                        TIMELINE_DOT[event.status] ?? "bg-ink-400 ring-ink-100"
                      }`}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center justify-between gap-1">
                        <p className="text-[11px] font-black text-ink-800">
                          {event.title}
                        </p>
                        <span className="text-[9px] text-ink-400">
                          {formatDateTime(event.createdAt)}
                        </span>
                      </div>
                      {event.note && (
                        <p className="mt-0.5 text-[10px] leading-5 text-ink-500">
                          {event.note}
                        </p>
                      )}
                      <p className="mt-0.5 text-[9px] text-ink-400">
                        ثبت توسط{" "}
                        {event.actor === "admin"
                          ? "مدیر"
                          : event.actor === "user"
                            ? "کاربر"
                            : "سیستم"}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </section>
        </div>

        <div className="space-y-4">
          <OrderStatusForm
            orderId={order.id}
            status={order.status as OrderStatusKey}
            trackingCode={order.trackingCode}
          />

          <section className="rounded-2xl border border-ink-100 bg-white p-4 shadow-xs">
            <h2 className="flex items-center gap-1.5 text-sm font-black text-ink-900">
              <User className="h-4 w-4 text-brand-700" />
              مشتری
            </h2>
            <div className="mt-2 space-y-1 text-[11px] leading-5">
              <Link
                href={`/admin/users?q=${encodeURIComponent(order.user.email)}`}
                className="font-black text-ink-800 hover:text-brand-700"
              >
                {order.user.name}
              </Link>
              <p dir="ltr" className="text-right text-[10px] text-ink-500">
                {order.user.email}
              </p>
              {order.user.phone && (
                <p className="text-[10px] text-ink-500" dir="ltr">
                  {order.user.phone}
                </p>
              )}
            </div>
          </section>

          <section className="rounded-2xl border border-ink-100 bg-white p-4 shadow-xs">
            <h2 className="text-sm font-black text-ink-900">صورت‌حساب</h2>
            <dl className="mt-3 space-y-2 text-[11px]">
              <div className="flex items-center justify-between gap-2">
                <dt className="text-ink-500">جمع کالاها</dt>
                <dd className="font-bold text-ink-800">
                  {formatPrice(order.subtotal)}
                </dd>
              </div>
              {order.discount > 0 && (
                <div className="flex items-center justify-between gap-2 text-success-600">
                  <dt>
                    تخفیف
                    {order.couponCode ? ` (${order.couponCode})` : ""}
                  </dt>
                  <dd className="font-bold">−{formatPrice(order.discount)}</dd>
                </div>
              )}
              <div className="flex items-center justify-between gap-2">
                <dt className="text-ink-500">هزینه ارسال</dt>
                <dd className="font-bold text-ink-800">
                  {order.shippingFee === 0
                    ? "رایگان"
                    : formatPrice(order.shippingFee)}
                </dd>
              </div>
              <div className="mt-1 flex items-center justify-between gap-2 border-t border-dashed border-ink-200 pt-2.5">
                <dt className="text-[12px] font-black text-ink-900">
                  مبلغ قابل پرداخت
                </dt>
                <dd className="text-[13px] font-black text-brand-800">
                  {formatPrice(order.total)}
                </dd>
              </div>
            </dl>

            <div className="mt-3 space-y-2 rounded-xl bg-ink-50 p-3 text-[10px]">
              <p className="flex items-center justify-between gap-2">
                <span className="flex items-center gap-1 text-ink-500">
                  <CreditCard className="h-3.5 w-3.5" />
                  روش پرداخت
                </span>
                <span className="font-bold text-ink-800">
                  {PAYMENT_METHOD_LABELS[order.paymentMethod] ??
                    order.paymentMethod}
                </span>
              </p>
              <p className="flex items-center justify-between gap-2">
                <span className="flex items-center gap-1 text-ink-500">
                  <Truck className="h-3.5 w-3.5" />
                  روش ارسال
                </span>
                <span className="font-bold text-ink-800">
                  {SHIPPING_METHOD_LABELS[order.shippingMethod] ??
                    order.shippingMethod}
                </span>
              </p>
              {order.payment && (
                <>
                  <p className="flex items-center justify-between gap-2">
                    <span className="flex items-center gap-1 text-ink-500">
                      <Wallet className="h-3.5 w-3.5" />
                      وضعیت پرداخت
                    </span>
                    <span className="font-bold text-ink-800">
                      {PAYMENT_STATUS_LABELS[order.payment.status] ??
                        order.payment.status}
                    </span>
                  </p>
                  {order.payment.refId && (
                    <p className="flex items-center justify-between gap-2">
                      <span className="text-ink-500">کد پیگیری</span>
                      <span dir="ltr" className="font-bold text-ink-800">
                        {order.payment.refId}
                      </span>
                    </p>
                  )}
                  {order.payment.gateway && (
                    <p className="flex items-center justify-between gap-2">
                      <span className="text-ink-500">درگاه</span>
                      <span dir="ltr" className="font-bold text-ink-800">
                        {order.payment.gateway}
                      </span>
                    </p>
                  )}
                </>
              )}
            </div>
          </section>

          <section className="rounded-2xl border border-ink-100 bg-white p-4 shadow-xs">
            <h2 className="flex items-center gap-1.5 text-sm font-black text-ink-900">
              <MapPin className="h-4 w-4 text-brand-700" />
              آدرس تحویل
            </h2>
            {address ? (
              <div className="mt-2 space-y-1 text-[11px] leading-5">
                <p className="font-bold text-ink-800">
                  {order.receiverName ?? "—"}
                  {order.receiverPhone && (
                    <span className="mr-1 font-medium text-ink-400">
                      — {toPersianDigits(order.receiverPhone)}
                    </span>
                  )}
                </p>
                <p className="text-ink-500">{address}</p>
                {order.postalCode && (
                  <p className="text-[10px] text-ink-400">
                    کد پستی: {toPersianDigits(order.postalCode)}
                  </p>
                )}
                {order.addressLabel && (
                  <Badge variant="outline" size="xs">
                    {order.addressLabel}
                  </Badge>
                )}
              </div>
            ) : (
              <p className="mt-2 text-[11px] text-ink-500">آدرسی ثبت نشده است.</p>
            )}

            {order.trackingCode && (
              <div className="mt-3 rounded-lg border border-brand-100 bg-brand-50 p-2.5">
                <p className="text-[10px] font-bold text-brand-800">
                  کد رهگیری مرسوله
                </p>
                <p dir="ltr" className="mt-0.5 text-[11px] font-black text-brand-900">
                  {order.trackingCode}
                </p>
              </div>
            )}

            {order.note && (
              <div className="mt-3 rounded-lg bg-warning-100/50 p-2.5">
                <p className="text-[10px] font-bold text-warning-600">
                  یادداشت سفارش
                </p>
                <p className="mt-0.5 text-[10px] leading-5 text-ink-600">
                  {order.note}
                </p>
              </div>
            )}

            {order.cancelReason && (
              <div className="mt-3 rounded-lg bg-danger-50 p-2.5">
                <p className="text-[10px] font-bold text-danger-600">
                  دلیل لغو
                </p>
                <p className="mt-0.5 text-[10px] leading-5 text-ink-600">
                  {order.cancelReason}
                </p>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
