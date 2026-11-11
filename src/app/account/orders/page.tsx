import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Package, ReceiptText, ShoppingBag } from "lucide-react";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { listUserOrders } from "@/lib/services/orders";
import { formatDateTime, formatPrice, toPersianDigits } from "@/lib/format";
import { ORDER_STATUS_META } from "@/lib/order-status";
import { cn } from "@/lib/utils";
import { OrderStatusBadge } from "@/components/account/order-status-badge";
import { Pagination } from "@/components/ui/pagination";
import { EmptyState } from "@/components/ui/misc";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { OrderStatusKey } from "@/types";

export const metadata: Metadata = {
  title: `سفارش‌های من`,
  robots: { index: false, follow: false },
};

const TABS: { key: string; label: string }[] = [
  { key: "ALL", label: "همه" },
  { key: "PENDING", label: "در انتظار پرداخت" },
  { key: "PAID", label: "پرداخت‌شده" },
  { key: "PROCESSING", label: "در حال پردازش" },
  { key: "SHIPPED", label: "ارسال‌شده" },
  { key: "DELIVERED", label: "تحویل‌شده" },
  { key: "CANCELED", label: "لغو‌شده" },
];

export default async function AccountOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; page?: string }>;
}) {
  const session = await getSession();
  if (!session) return null;

  const params = await searchParams;
  const status = (params.status ?? "ALL").toUpperCase();
  const activeTab = TABS.some((t) => t.key === status) ? status : "ALL";
  const page = Math.max(1, Number(params.page) || 1);

  const [result, grouped] = await Promise.all([
    listUserOrders(session.id, { status: activeTab, page, perPage: 8 }),
    prisma.order.groupBy({
      by: ["status"],
      where: { userId: session.id },
      _count: { _all: true },
    }),
  ]);

  const counts: Record<string, number> = {};
  let totalAll = 0;
  for (const row of grouped) {
    counts[row.status] = row._count._all;
    totalAll += row._count._all;
  }
  counts.ALL = totalAll;

  const href = (nextPage: number, nextTab: string) => {
    const query = new URLSearchParams();
    if (nextTab !== "ALL") query.set("status", nextTab);
    if (nextPage > 1) query.set("page", String(nextPage));
    const qs = query.toString();
    return qs ? `/account/orders?${qs}` : "/account/orders";
  };

  const buildHref = href;

  const hrefBase = (() => {
    const query = new URLSearchParams();
    if (activeTab !== "ALL") query.set("status", activeTab);
    query.set("page", "{page}");
    return `/account/orders?${query.toString()}`;
  })();

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-ink-100 bg-white p-4 shadow-xs">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="flex items-center gap-1.5 text-base font-black text-ink-900">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
                <ReceiptText className="h-4 w-4" />
              </span>
              سفارش‌های من
            </h1>
            <p className="mt-1 text-[11px] leading-5 text-ink-500">
              وضعیت سفارش‌ها را پیگیری کنید، جزئیات را ببینید و در صورت نیاز پرداخت
              یا لغو کنید.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="rounded-xl bg-ink-50 px-3 py-2 text-center">
              <p className="text-[9px] font-medium text-ink-500">کل سفارش‌ها</p>
              <p className="mt-0.5 text-sm font-black text-ink-900">
                {toPersianDigits(totalAll)}
              </p>
            </div>
            <div className="rounded-xl bg-warning-100/60 px-3 py-2 text-center">
              <p className="text-[9px] font-medium text-warning-600">در انتظار پرداخت</p>
              <p className="mt-0.5 text-sm font-black text-warning-600">
                {toPersianDigits(counts.PENDING ?? 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="-mx-1 mt-4 flex gap-1.5 overflow-x-auto pb-1">
          {TABS.map((tab) => {
            const active = tab.key === activeTab;
            const count = counts[tab.key] ?? 0;
            return (
              <Link
                key={tab.key}
                href={buildHref(1, tab.key)}
                className={cn(
                  "flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-[11px] font-bold transition-colors",
                  active
                    ? "bg-brand-700 text-white shadow-sm"
                    : "bg-ink-50 text-ink-600 hover:bg-ink-100 hover:text-ink-900",
                )}
              >
                {tab.label}
                <span
                  className={cn(
                    "rounded-full px-1.5 py-0.5 text-[9px] font-black",
                    active ? "bg-white/20 text-white" : "bg-white text-ink-500",
                  )}
                >
                  {toPersianDigits(count)}
                </span>
              </Link>
            );
          })}
        </div>
      </div>

      {result.items.length === 0 ? (
        <EmptyState
          icon={<ShoppingBag className="h-8 w-8" />}
          title={
            activeTab === "ALL"
              ? "هنوز سفارشی ثبت نکرده‌اید"
              : "سفارشی در این وضعیت نیست"
          }
          description={
            activeTab === "ALL"
              ? "محصولات موردعلاقه خود را انتخاب کنید و اولین سفارش خود را ثبت کنید."
              : "با انتخاب تب «همه» می‌توانید همه سفارش‌های خود را ببینید."
          }
          action={
            <Button asChild>
              <Link href="/products">شروع خرید</Link>
            </Button>
          }
        />
      ) : (
        <>
          <ul className="space-y-2.5">
            {result.items.map((order) => (
              <li key={order.id}>
                <Link
                  href={`/account/orders/${order.id}`}
                  className="group block rounded-2xl border border-ink-100 bg-white p-4 shadow-xs transition-all hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-sm"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-ink-50 text-ink-500 transition-colors group-hover:bg-brand-50 group-hover:text-brand-700">
                        <Package className="h-4 w-4" />
                      </span>
                      <div>
                        <p className="text-[12px] font-black text-ink-900">
                          سفارش {toPersianDigits(order.orderNumber)}
                        </p>
                        <p className="mt-0.5 text-[10px] text-ink-500">
                          {formatDateTime(order.createdAt)}
                        </p>
                      </div>
                    </div>
                    <OrderStatusBadge status={order.status} size="xs" />
                  </div>

                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-dashed border-ink-100 pt-3">
                    <div className="flex items-center gap-3 text-[10px] text-ink-500">
                      <span>{toPersianDigits(order.itemCount)} کالا</span>
                      <span className="h-3 w-px bg-ink-200" />
                      <span>
                        {ORDER_STATUS_META[order.status as OrderStatusKey]?.short ??
                          order.statusLabel}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[12px] font-black text-ink-900">
                        {formatPrice(order.total)}
                      </span>
                      <ArrowLeft className="h-3.5 w-3.5 text-ink-400 transition-transform group-hover:-translate-x-0.5 group-hover:text-brand-700" />
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>

          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-ink-100 bg-white p-3 shadow-xs">
            <p className="text-[10px] text-ink-500">
              نمایش {toPersianDigits(result.items.length)} سفارش از{" "}
              {toPersianDigits(result.total)} مورد
            </p>
            <Pagination
              page={result.page}
              totalPages={result.totalPages}
              hrefBase={hrefBase}
            />
          </div>
        </>
      )}

      <div className="rounded-2xl border border-dashed border-ink-200 bg-ink-50/60 p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-[11px] leading-5 text-ink-600">
            سؤالی درباره سفارش‌ها دارید؟ پشتیبانی سَروا از طریق بخش تماس با ما پاسخگوی
            شماست.
          </p>
          <Badge variant="outline">
            <Link href="/contact">تماس با پشتیبانی</Link>
          </Badge>
        </div>
      </div>
    </div>
  );
}
