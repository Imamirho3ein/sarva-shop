import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowLeft,
  Boxes,
  CircleDollarSign,
  Package,
  ShoppingBag,
  TrendingUp,
  TriangleAlert,
  Users,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatDate, formatDateLong, formatPrice, toPersianDigits } from "@/lib/format";
import { ORDER_STATUS_META, orderStatusLabel } from "@/lib/order-status";
import { OrderStatusBadge } from "@/components/account/order-status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { OrderStatusKey } from "@/types";

export const metadata: Metadata = {
  title: "داشبورد مدیریت",
  robots: { index: false, follow: false },
};

const REVENUE_STATUSES: OrderStatusKey[] = ["PAID", "PROCESSING", "SHIPPED", "DELIVERED"];

export default async function AdminDashboardPage() {
  const since = new Date();
  since.setDate(since.getDate() - 6);
  since.setHours(0, 0, 0, 0);

  const [
    ordersCount,
    revenueAgg,
    usersCount,
    productsCount,
    lowStock,
    statusGroups,
    recentOrders,
    topProducts,
    weekOrders,
    latestUsers,
  ] = await Promise.all([
    prisma.order.count(),
    prisma.order.aggregate({
      where: { status: { in: REVENUE_STATUSES } },
      _sum: { total: true },
    }),
    prisma.user.count({ where: { role: "USER" } }),
    prisma.product.count(),
    prisma.product.findMany({
      where: { stock: { lte: 5 } },
      orderBy: { stock: "asc" },
      take: 6,
      select: { id: true, name: true, slug: true, stock: true, price: true },
    }),
    prisma.order.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 6,
      include: {
        user: { select: { name: true, email: true } },
        items: { select: { quantity: true } },
      },
    }),
    prisma.product.findMany({
      orderBy: { soldCount: "desc" },
      take: 5,
      select: { id: true, name: true, slug: true, soldCount: true, price: true },
    }),
    prisma.order.findMany({
      where: { createdAt: { gte: since } },
      select: { createdAt: true, total: true, status: true },
    }),
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 4,
      select: { id: true, name: true, email: true, createdAt: true },
    }),
  ]);

  const revenue = revenueAgg._sum.total ?? 0;
  const statusCounts: Record<string, number> = {};
  for (const row of statusGroups) statusCounts[row.status] = row._count._all;
  const pending = statusCounts.PENDING ?? 0;

  const days = Array.from({ length: 7 }).map((_, index) => {
    const date = new Date(since);
    date.setDate(since.getDate() + index);
    const end = new Date(date);
    end.setDate(date.getDate() + 1);
    const dayOrders = weekOrders.filter(
      (o) => o.createdAt >= date && o.createdAt < end,
    );
    const dayRevenue = dayOrders
      .filter((o) => REVENUE_STATUSES.includes(o.status as OrderStatusKey))
      .reduce((sum, o) => sum + o.total, 0);
    return { date, count: dayOrders.length, revenue: dayRevenue };
  });
  const maxRevenue = Math.max(1, ...days.map((d) => d.revenue));

  const stats = [
    {
      label: "درآمد کل",
      value: formatPrice(revenue),
      icon: CircleDollarSign,
      tone: "bg-brand-50 text-brand-700",
      hint: "سفارش‌های پرداخت‌شده",
    },
    {
      label: "کل سفارش‌ها",
      value: toPersianDigits(ordersCount),
      icon: ShoppingBag,
      tone: "bg-accent-100 text-accent-700",
      hint: `${toPersianDigits(pending)} در انتظار پرداخت`,
    },
    {
      label: "کاربران",
      value: toPersianDigits(usersCount),
      icon: Users,
      tone: "bg-success-100 text-success-600",
      hint: "حساب‌های فعال",
    },
    {
      label: "محصولات",
      value: toPersianDigits(productsCount),
      icon: Package,
      tone: "bg-warning-100 text-warning-500",
      hint: `${toPersianDigits(lowStock.length)} کالای کم‌موجود`,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3 rounded-2xl border border-ink-100 bg-white p-4 shadow-xs">
        <div>
          <h1 className="text-base font-black text-ink-900">داشبورد مدیریت</h1>
          <p className="mt-1 text-[11px] text-ink-500">
            {formatDateLong(new Date())} — نمای کلی فروش و فعالیت فروشگاه
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild size="sm" variant="outline">
            <Link href="/admin/orders">
              سفارش‌ها
              <ArrowLeft className="h-3.5 w-3.5" />
            </Link>
          </Button>
          <Button asChild size="sm">
            <Link href="/admin/products/new">
              <Package className="h-4 w-4" />
              محصول جدید
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="rounded-2xl border border-ink-100 bg-white p-3.5 shadow-xs"
            >
              <span
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-lg",
                  stat.tone,
                )}
              >
                <Icon className="h-4 w-4" />
              </span>
              <p className="mt-3 text-[10px] font-medium text-ink-500">{stat.label}</p>
              <p className="mt-1 text-sm font-black text-ink-900">{stat.value}</p>
              <p className="mt-0.5 text-[9px] text-ink-400">{stat.hint}</p>
            </div>
          );
        })}
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px] xl:items-start">
        <div className="space-y-4">
          <section className="rounded-2xl border border-ink-100 bg-white p-4 shadow-xs">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="flex items-center gap-1.5 text-sm font-black text-ink-900">
                <TrendingUp className="h-4 w-4 text-brand-700" />
                فروش ۷ روز گذشته
              </h2>
              <Badge variant="brand" size="xs">
                مجموع {formatPrice(days.reduce((s, d) => s + d.revenue, 0))}
              </Badge>
            </div>

            <div className="mt-4 flex h-44 items-end justify-between gap-2 border-b border-dashed border-ink-200 pb-1">
              {days.map((day) => {
                const height = Math.max(6, Math.round((day.revenue / maxRevenue) * 100));
                return (
                  <div
                    key={day.date.toISOString()}
                    className="group flex min-w-0 flex-1 flex-col items-center justify-end gap-1.5"
                  >
                    <span className="hidden text-[8px] font-bold text-ink-500 sm:block">
                      {toPersianDigits(day.count)}
                    </span>
                    <div
                      className="w-full max-w-12 rounded-t-lg bg-gradient-to-t from-brand-700 to-brand-400 transition-all group-hover:from-brand-800 group-hover:to-brand-500"
                      style={{ height: `${height}%` }}
                      title={`${formatPrice(day.revenue)} — ${toPersianDigits(day.count)} سفارش`}
                    />
                    <span className="text-[9px] text-ink-400">{formatDate(day.date)}</span>
                  </div>
                );
              })}
            </div>
            <p className="mt-2 text-[9px] text-ink-400">
              ارتفاع ستون‌ها بر اساس مبلغ سفارش‌های پرداخت‌شده است.
            </p>
          </section>

          <section className="rounded-2xl border border-ink-100 bg-white p-4 shadow-xs">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-sm font-black text-ink-900">سفارش‌های اخیر</h2>
              <Link
                href="/admin/orders"
                className="inline-flex items-center gap-1 text-[10px] font-bold text-brand-700 hover:underline"
              >
                همه سفارش‌ها
                <ArrowLeft className="h-3 w-3" />
              </Link>
            </div>

            <div className="mt-2 overflow-x-auto">
              <table className="w-full text-right text-[11px]">
                <thead>
                  <tr className="border-b border-ink-100 text-[9px] text-ink-400">
                    <th className="py-2 font-medium">شماره</th>
                    <th className="py-2 font-medium">مشتری</th>
                    <th className="py-2 font-medium">مبلغ</th>
                    <th className="py-2 font-medium">وضعیت</th>
                    <th className="py-2 font-medium">تاریخ</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => (
                    <tr key={order.id} className="border-b border-ink-50 last:border-0">
                      <td className="py-2">
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="font-black text-ink-800 hover:text-brand-700"
                        >
                          {toPersianDigits(order.orderNumber)}
                        </Link>
                      </td>
                      <td className="max-w-32 truncate py-2 text-ink-600">
                        {order.user.name}
                      </td>
                      <td className="py-2 font-bold text-ink-800">
                        {formatPrice(order.total)}
                      </td>
                      <td className="py-2">
                        <OrderStatusBadge status={order.status} size="xs" />
                      </td>
                      <td className="py-2 text-ink-400">{formatDate(order.createdAt)}</td>
                    </tr>
                  ))}
                  {recentOrders.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-ink-400">
                        سفارشی ثبت نشده است.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        <div className="space-y-4">
          <section className="rounded-2xl border border-ink-100 bg-white p-4 shadow-xs">
            <h2 className="text-sm font-black text-ink-900">وضعیت سفارش‌ها</h2>
            <ul className="mt-2 space-y-1.5">
              {(["PENDING", "PAID", "PROCESSING", "SHIPPED", "DELIVERED"] as const).map(
                (status) => {
                  const count = statusCounts[status] ?? 0;
                  const total = Math.max(1, ordersCount);
                  return (
                    <li key={status}>
                      <div className="flex items-center justify-between gap-2 text-[10px]">
                        <span className="text-ink-600">
                          {ORDER_STATUS_META[status].label}
                        </span>
                        <span className="font-black text-ink-800">
                          {toPersianDigits(count)}
                        </span>
                      </div>
                      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-ink-100">
                        <div
                          className={cn(
                            "h-full rounded-full",
                            status === "PENDING"
                              ? "bg-warning-500"
                              : status === "DELIVERED"
                                ? "bg-success-600"
                                : "bg-brand-600",
                          )}
                          style={{ width: `${Math.round((count / total) * 100)}%` }}
                        />
                      </div>
                    </li>
                  );
                },
              )}
            </ul>
          </section>

          <section className="rounded-2xl border border-ink-100 bg-white p-4 shadow-xs">
            <div className="flex items-center justify-between gap-2">
              <h2 className="flex items-center gap-1.5 text-sm font-black text-ink-900">
                <TriangleAlert className="h-4 w-4 text-warning-500" />
                کم‌موجودها
              </h2>
              <Link
                href="/admin/inventory"
                className="text-[10px] font-bold text-brand-700 hover:underline"
              >
                انبار
              </Link>
            </div>
            {lowStock.length === 0 ? (
              <p className="mt-2 text-[10px] text-ink-500">موجودی همه کالاها مناسب است.</p>
            ) : (
              <ul className="mt-2 space-y-2">
                {lowStock.map((product) => (
                  <li key={product.id} className="flex items-center justify-between gap-2">
                    <Link
                      href={`/product/${product.slug}`}
                      className="line-clamp-1 text-[10px] font-bold text-ink-700 hover:text-brand-700"
                    >
                      {product.name}
                    </Link>
                    <Badge
                      variant={product.stock === 0 ? "danger" : "warning"}
                      size="xs"
                    >
                      {product.stock === 0
                        ? "ناموجود"
                        : `${toPersianDigits(product.stock)} عدد`}
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="rounded-2xl border border-ink-100 bg-white p-4 shadow-xs">
            <div className="flex items-center justify-between gap-2">
              <h2 className="flex items-center gap-1.5 text-sm font-black text-ink-900">
                <Boxes className="h-4 w-4 text-brand-700" />
                پرفروش‌ترین‌ها
              </h2>
            </div>
            <ul className="mt-2 space-y-2">
              {topProducts.map((product, index) => (
                <li key={product.id} className="flex items-center gap-2">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-ink-100 text-[9px] font-black text-ink-500">
                    {toPersianDigits(index + 1)}
                  </span>
                  <Link
                    href={`/product/${product.slug}`}
                    className="line-clamp-1 flex-1 text-[10px] font-bold text-ink-700 hover:text-brand-700"
                  >
                    {product.name}
                  </Link>
                  <span className="text-[9px] font-bold text-ink-400">
                    {toPersianDigits(product.soldCount)} فروش
                  </span>
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-2xl border border-ink-100 bg-white p-4 shadow-xs">
            <h2 className="text-sm font-black text-ink-900">کاربران جدید</h2>
            <ul className="mt-2 space-y-2">
              {latestUsers.map((user) => (
                <li key={user.id} className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-[10px] font-bold text-ink-700">
                      {user.name}
                    </p>
                    <p dir="ltr" className="truncate text-right text-[9px] text-ink-400">
                      {user.email}
                    </p>
                  </div>
                  <span className="shrink-0 text-[9px] text-ink-400">
                    {formatDate(user.createdAt)}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
