import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Filter, Search, ShoppingBag } from "lucide-react";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import {
  formatDate,
  formatDateTime,
  formatPrice,
  toPersianDigits,
} from "@/lib/format";
import { ORDER_STATUS_META, PAYMENT_METHOD_LABELS } from "@/lib/order-status";
import { OrderStatusBadge } from "@/components/account/order-status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/ui/pagination";
import { EmptyState } from "@/components/ui/misc";
import type { OrderStatusKey } from "@/types";

export const metadata: Metadata = {
  title: "سفارش‌ها | پنل مدیریت",
  robots: { index: false, follow: false },
};

const PER_PAGE = 15;
const STATUSES: OrderStatusKey[] = [
  "PENDING",
  "PAID",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELED",
  "REFUNDED",
];

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    status?: string;
    from?: string;
    to?: string;
    page?: string;
  }>;
}) {
  const params = await searchParams;
  const q = (params.q ?? "").trim();
  const status = (params.status ?? "").toUpperCase();
  const from = params.from ?? "";
  const to = params.to ?? "";
  const page = Math.max(1, Number(params.page) || 1);

  const where: Prisma.OrderWhereInput = {
    ...(status && STATUSES.includes(status as OrderStatusKey)
      ? { status: status as OrderStatusKey }
      : {}),
    ...(q
      ? {
          OR: [
            { orderNumber: { contains: q, mode: "insensitive" as const } },
            { receiverName: { contains: q, mode: "insensitive" as const } },
            { receiverPhone: { contains: q } },
            { user: { name: { contains: q, mode: "insensitive" as const } } },
            { user: { email: { contains: q, mode: "insensitive" as const } } },
          ],
        }
      : {}),
    ...(from || to
      ? {
          createdAt: {
            ...(from ? { gte: new Date(`${from}T00:00:00`) } : {}),
            ...(to ? { lte: new Date(`${to}T23:59:59`) } : {}),
          },
        }
      : {}),
  };

  const [orders, total, grouped] = await Promise.all([
    prisma.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PER_PAGE,
      take: PER_PAGE,
      include: {
        user: { select: { name: true, email: true } },
        _count: { select: { items: true } },
      },
    }),
    prisma.order.count({ where }),
    prisma.order.groupBy({ by: ["status"], _count: { _all: true } }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));
  const counts: Record<string, number> = {};
  for (const row of grouped) counts[row.status] = row._count._all;

  const href = (nextPage: number, nextStatus?: string) => {
    const query = new URLSearchParams();
    if (q) query.set("q", q);
    const s = nextStatus ?? status;
    if (s) query.set("status", s);
    if (from) query.set("from", from);
    if (to) query.set("to", to);
    if (nextPage > 1) query.set("page", String(nextPage));
    const qs = query.toString();
    return qs ? `/admin/orders?${qs}` : "/admin/orders";
  };

  const hrefBase = (() => {
    const query = new URLSearchParams();
    if (q) query.set("q", q);
    if (status) query.set("status", status);
    if (from) query.set("from", from);
    if (to) query.set("to", to);
    query.set("page", "{page}");
    return `/admin/orders?${query.toString()}`;
  })();

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-ink-100 bg-white p-4 shadow-xs">
        <div>
          <h1 className="flex items-center gap-1.5 text-base font-black text-ink-900">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
              <ShoppingBag className="h-4 w-4" />
            </span>
            مدیریت سفارش‌ها
          </h1>
          <p className="mt-1 text-[11px] text-ink-500">
            {toPersianDigits(total)} سفارش با فیلتر فعلی یافت شد.
          </p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {STATUSES.map((key) => (
            <Link
              key={key}
              href={href(1, key === status ? "" : key)}
              className={
                key === status
                  ? "rounded-lg bg-brand-700 px-2.5 py-1.5 text-[10px] font-bold text-white"
                  : "rounded-lg bg-ink-50 px-2.5 py-1.5 text-[10px] font-bold text-ink-600 transition-colors hover:bg-ink-100"
              }
            >
              {ORDER_STATUS_META[key].short}
              <span className="mr-1 text-[9px] opacity-70">
                {toPersianDigits(counts[key] ?? 0)}
              </span>
            </Link>
          ))}
        </div>
      </div>

      <form className="flex flex-wrap items-end gap-2 rounded-2xl border border-ink-100 bg-white p-3 shadow-xs">
        <div className="relative min-w-52 flex-1">
          <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
          <input
            name="q"
            defaultValue={q}
            placeholder="شماره سفارش، نام یا ایمیل مشتری…"
            className="h-10 w-full rounded-xl border border-ink-200 bg-white pr-9 pl-3 text-[12px] text-ink-900 placeholder:text-ink-400 focus:border-brand-600 focus:outline-none focus:ring-4 focus:ring-brand-600/10"
          />
        </div>
        <select
          name="status"
          defaultValue={status}
          className="h-10 min-w-36 rounded-xl border border-ink-200 bg-white px-3 text-[12px] font-medium text-ink-700 focus:border-brand-600 focus:outline-none"
        >
          <option value="">همه وضعیت‌ها</option>
          {STATUSES.map((key) => (
            <option key={key} value={key}>
              {ORDER_STATUS_META[key].label}
            </option>
          ))}
        </select>
        <div className="flex items-center gap-1.5">
          <input
            type="date"
            name="from"
            defaultValue={from}
            aria-label="از تاریخ"
            className="h-10 rounded-xl border border-ink-200 bg-white px-2 text-[11px] text-ink-700 focus:border-brand-600 focus:outline-none"
          />
          <span className="text-[10px] text-ink-400">تا</span>
          <input
            type="date"
            name="to"
            defaultValue={to}
            aria-label="تا تاریخ"
            className="h-10 rounded-xl border border-ink-200 bg-white px-2 text-[11px] text-ink-700 focus:border-brand-600 focus:outline-none"
          />
        </div>
        <Button type="submit" size="sm" variant="outline">
          <Filter className="h-3.5 w-3.5" />
          اعمال فیلتر
        </Button>
        {(q || status || from || to) && (
          <Link
            href="/admin/orders"
            className="text-[10px] font-bold text-ink-500 hover:text-danger-600"
          >
            حذف فیلترها
          </Link>
        )}
      </form>

      {orders.length === 0 ? (
        <EmptyState
          icon={<ShoppingBag className="h-8 w-8" />}
          title="سفارشی پیدا نشد"
          description="با تغییر فیلترها دوباره جستجو کنید."
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-right text-[11px]">
              <thead className="bg-ink-50 text-[9px] text-ink-500">
                <tr>
                  <th className="px-3 py-2.5 font-medium">شماره سفارش</th>
                  <th className="px-3 py-2.5 font-medium">مشتری</th>
                  <th className="px-3 py-2.5 font-medium">تاریخ</th>
                  <th className="px-3 py-2.5 font-medium">اقلام</th>
                  <th className="px-3 py-2.5 font-medium">مبلغ</th>
                  <th className="px-3 py-2.5 font-medium">پرداخت</th>
                  <th className="px-3 py-2.5 font-medium">وضعیت</th>
                  <th className="px-3 py-2.5 font-medium">عملیات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-ink-50/50">
                    <td className="px-3 py-2.5">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="font-black text-ink-800 hover:text-brand-700"
                      >
                        {toPersianDigits(order.orderNumber)}
                      </Link>
                      <p className="mt-0.5 text-[9px] text-ink-400">
                        {formatDateTime(order.createdAt)}
                      </p>
                    </td>
                    <td className="px-3 py-2.5">
                      <p className="font-bold text-ink-700">{order.user.name}</p>
                      <p dir="ltr" className="mt-0.5 text-right text-[9px] text-ink-400">
                        {order.user.email}
                      </p>
                    </td>
                    <td className="px-3 py-2.5 text-ink-500">
                      {formatDate(order.createdAt)}
                    </td>
                    <td className="px-3 py-2.5">
                      <Badge variant="outline" size="xs">
                        {toPersianDigits(order._count.items)} قلم
                      </Badge>
                    </td>
                    <td className="px-3 py-2.5 font-black text-ink-800">
                      {formatPrice(order.total)}
                    </td>
                    <td className="px-3 py-2.5 text-[10px] text-ink-500">
                      {PAYMENT_METHOD_LABELS[order.paymentMethod] ??
                        order.paymentMethod}
                    </td>
                    <td className="px-3 py-2.5">
                      <OrderStatusBadge status={order.status} size="xs" />
                    </td>
                    <td className="px-3 py-2.5">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="inline-flex h-8 items-center gap-1 rounded-lg px-2 text-[10px] font-bold text-brand-700 hover:bg-brand-50"
                      >
                        جزئیات
                        <ArrowLeft className="h-3 w-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-ink-100 p-3">
            <p className="text-[10px] text-ink-500">
              صفحه {toPersianDigits(page)} از {toPersianDigits(totalPages)}
            </p>
            <Pagination
              page={page}
              totalPages={totalPages}
              hrefBase={hrefBase}
            />
          </div>
        </div>
      )}
    </div>
  );
}
