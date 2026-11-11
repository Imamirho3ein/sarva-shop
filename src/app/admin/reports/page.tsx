import type { Metadata } from "next";
import Link from "next/link";
import {
  BadgePercent,
  BarChart3,
  CircleDollarSign,
  CreditCard,
  Package,
  ShoppingBag,
  TrendingUp,
  Users,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatPrice, toPersianDigits } from "@/lib/format";
import {
  ORDER_STATUS_META,
  PAYMENT_METHOD_LABELS,
} from "@/lib/order-status";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { OrderStatusKey } from "@/types";

export const metadata: Metadata = {
  title: "گزارش فروش | پنل مدیریت",
  robots: { index: false, follow: false },
};

const REVENUE_STATUSES: OrderStatusKey[] = [
  "PAID",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
];
const MONTHS = [
  "فروردین",
  "اردیبهشت",
  "خرداد",
  "تیر",
  "مرداد",
  "شهریور",
  "مهر",
  "آبان",
  "آذر",
  "دی",
  "بهمن",
  "اسفند",
];

function monthLabel(date: Date) {
  return `${MONTHS[date.getMonth()]} ${toPersianDigits(date.getFullYear())}`;
}

export default async function AdminReportsPage() {
  const since = new Date();
  since.setMonth(since.getMonth() - 5);
  since.setDate(1);
  since.setHours(0, 0, 0, 0);

  const [
    allOrders,
    recentOrders,
    statusGroups,
    paymentGroups,
    topItems,
    coupons,
    usersCount,
    productCount,
    lowStockCount,
  ] = await Promise.all([
    prisma.order.aggregate({
      where: { status: { in: REVENUE_STATUSES } },
      _sum: { total: true, discount: true },
      _count: { _all: true },
    }),
    prisma.order.findMany({
      where: { createdAt: { gte: since } },
      select: {
        createdAt: true,
        total: true,
        discount: true,
        status: true,
        paymentMethod: true,
      },
    }),
    prisma.order.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.order.groupBy({
      by: ["paymentMethod"],
      _count: { _all: true },
      _sum: { total: true },
    }),
    prisma.orderItem.groupBy({
      by: ["productId"],
      _sum: { total: true, quantity: true },
      orderBy: { _sum: { total: "desc" } },
      take: 8,
    }),
    prisma.coupon.findMany({
      orderBy: { usedCount: "desc" },
      take: 6,
      select: {
        id: true,
        code: true,
        type: true,
        value: true,
        usedCount: true,
        isActive: true,
      },
    }),
    prisma.user.count(),
    prisma.product.count(),
    prisma.product.count({ where: { stock: { lte: 5 } } }),
  ]);

  const statusCounts: Record<string, number> = {};
  for (const row of statusGroups) statusCounts[row.status] = row._count._all;
  const totalOrders = Object.values(statusCounts).reduce((s, n) => s + n, 0);

  const revenue = allOrders._sum.total ?? 0;
  const paidOrders = allOrders._count._all;
  const discountTotal = allOrders._sum.discount ?? 0;
  const aov = paidOrders > 0 ? Math.round(revenue / paidOrders) : 0;

  const months = Array.from({ length: 6 }).map((_, index) => {
    const date = new Date(since);
    date.setMonth(since.getMonth() + index);
    const start = new Date(date);
    const end = new Date(date);
    end.setMonth(date.getMonth() + 1);
    const monthOrders = recentOrders.filter(
      (o) => o.createdAt >= start && o.createdAt < end,
    );
    const revenueSum = monthOrders
      .filter((o) => REVENUE_STATUSES.includes(o.status as OrderStatusKey))
      .reduce((sum, o) => sum + o.total, 0);
    return {
      key: start.toISOString(),
      label: monthLabel(start),
      count: monthOrders.length,
      revenue: revenueSum,
      discount: monthOrders
        .filter((o) => REVENUE_STATUSES.includes(o.status as OrderStatusKey))
        .reduce((sum, o) => sum + o.discount, 0),
    };
  });
  const maxMonthRevenue = Math.max(1, ...months.map((m) => m.revenue));

  const productIds = topItems.map((i) => i.productId);
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
    select: {
      id: true,
      name: true,
      slug: true,
      category: { select: { name: true } },
      brand: { select: { name: true } },
    },
  });
  const productMap = new Map(products.map((p) => [p.id, p]));

  const categoryRevenue = new Map<string, { revenue: number; quantity: number }>();
  const brandRevenue = new Map<string, { revenue: number; quantity: number }>();
  for (const item of topItems) {
    const product = productMap.get(item.productId);
    if (!product) continue;
    const revenueValue = item._sum.total ?? 0;
    const quantityValue = item._sum.quantity ?? 0;
    const categoryName = product.category.name;
    const brandName = product.brand?.name ?? "بدون برند";
    const cat = categoryRevenue.get(categoryName) ?? { revenue: 0, quantity: 0 };
    cat.revenue += revenueValue;
    cat.quantity += quantityValue;
    categoryRevenue.set(categoryName, cat);
    const brand = brandRevenue.get(brandName) ?? { revenue: 0, quantity: 0 };
    brand.revenue += revenueValue;
    brand.quantity += quantityValue;
    brandRevenue.set(brandName, brand);
  }

  const topCategories = [...categoryRevenue.entries()]
    .sort((a, b) => b[1].revenue - a[1].revenue)
    .slice(0, 6);
  const topBrands = [...brandRevenue.entries()]
    .sort((a, b) => b[1].revenue - a[1].revenue)
    .slice(0, 6);

  const kpis = [
    {
      label: "درآمد کل",
      value: formatPrice(revenue),
      hint: `${toPersianDigits(paidOrders)} سفارش پرداخت‌شده`,
      icon: CircleDollarSign,
      tone: "bg-brand-50 text-brand-700",
    },
    {
      label: "میانگین سبد خرید",
      value: formatPrice(aov),
      hint: "به ازای هر سفارش موفق",
      icon: ShoppingBag,
      tone: "bg-accent-100 text-accent-700",
    },
    {
      label: "مجموع تخفیف",
      value: formatPrice(discountTotal),
      hint: "کد تخفیف و تخفیف محصول",
      icon: BadgePercent,
      tone: "bg-warning-100 text-warning-600",
    },
    {
      label: "کاربران / محصولات",
      value: `${toPersianDigits(usersCount)} / ${toPersianDigits(productCount)}`,
      hint: `${toPersianDigits(lowStockCount)} کالای کم‌موجود`,
      icon: Users,
      tone: "bg-success-100 text-success-600",
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3 rounded-2xl border border-ink-100 bg-white p-4 shadow-xs">
        <div>
          <h1 className="flex items-center gap-1.5 text-base font-black text-ink-900">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
              <BarChart3 className="h-4 w-4" />
            </span>
            گزارش فروش و درآمد
          </h1>
          <p className="mt-1 text-[11px] text-ink-500">
            خلاصه عملکرد ۶ ماه گذشته و آمار کلی فروشگاه. سفارش‌های لغوشده و
            بازگشت‌داده‌شده در درآمد محاسبه نمی‌شوند.
          </p>
        </div>
        <Badge variant="outline">
          مجموع سفارش‌ها: {toPersianDigits(totalOrders)}
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div
              key={kpi.label}
              className="rounded-2xl border border-ink-100 bg-white p-3.5 shadow-xs"
            >
              <span
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-lg",
                  kpi.tone,
                )}
              >
                <Icon className="h-4 w-4" />
              </span>
              <p className="mt-3 text-[10px] font-medium text-ink-500">{kpi.label}</p>
              <p className="mt-1 text-sm font-black text-ink-900">{kpi.value}</p>
              <p className="mt-0.5 text-[9px] text-ink-400">{kpi.hint}</p>
            </div>
          );
        })}
      </div>

      <section className="rounded-2xl border border-ink-100 bg-white p-4 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="flex items-center gap-1.5 text-sm font-black text-ink-900">
            <TrendingUp className="h-4 w-4 text-brand-700" />
            درآمد ماهانه ۶ ماه گذشته
          </h2>
          <Badge variant="brand" size="xs">
            مجموع {formatPrice(months.reduce((s, m) => s + m.revenue, 0))}
          </Badge>
        </div>

        <div className="mt-5 flex h-52 items-end justify-between gap-2 border-b border-dashed border-ink-200 pb-1">
          {months.map((month) => {
            const height = Math.max(
              4,
              Math.round((month.revenue / maxMonthRevenue) * 100),
            );
            return (
              <div
                key={month.key}
                className="group flex min-w-0 flex-1 flex-col items-center justify-end gap-1.5"
              >
                <span className="hidden text-[8px] font-bold text-ink-500 sm:block">
                  {formatPrice(month.revenue)}
                </span>
                <div
                  className="w-full max-w-14 rounded-t-lg bg-gradient-to-t from-brand-700 to-brand-400 transition-all group-hover:from-brand-800 group-hover:to-brand-500"
                  style={{ height: `${height}%` }}
                  title={`${month.label}: ${formatPrice(month.revenue)} — ${toPersianDigits(month.count)} سفارش`}
                />
                <span className="text-[9px] text-ink-400">{month.label}</span>
              </div>
            );
          })}
        </div>
        <p className="mt-2 text-[9px] text-ink-400">
          ارتفاع ستون‌ها بر اساس مبلغ سفارش‌های پرداخت‌شده محاسبه شده است.
        </p>
      </section>

      <div className="grid gap-4 xl:grid-cols-2">
        <section className="rounded-2xl border border-ink-100 bg-white p-4 shadow-xs">
          <h2 className="flex items-center gap-1.5 text-sm font-black text-ink-900">
            <Package className="h-4 w-4 text-brand-700" />
            پرفروش‌ترین محصولات (بر اساس مبلغ)
          </h2>
          {topItems.length === 0 ? (
            <p className="mt-3 text-[11px] text-ink-500">داده‌ای برای نمایش نیست.</p>
          ) : (
            <ol className="mt-3 space-y-2">
              {topItems.map((item, index) => {
                const product = productMap.get(item.productId);
                if (!product) return null;
                return (
                  <li key={item.productId} className="flex items-center gap-2">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-ink-100 text-[9px] font-black text-ink-500">
                      {toPersianDigits(index + 1)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <Link
                        href={`/product/${product.slug}`}
                        className="line-clamp-1 text-[11px] font-bold text-ink-700 hover:text-brand-700"
                      >
                        {product.name}
                      </Link>
                      <p className="mt-0.5 text-[9px] text-ink-400">
                        {product.category.name}
                        {product.brand?.name ? ` — ${product.brand.name}` : ""}
                      </p>
                    </div>
                    <div className="shrink-0 text-left">
                      <p className="text-[10px] font-black text-ink-800">
                        {formatPrice(item._sum.total ?? 0)}
                      </p>
                      <p className="mt-0.5 text-[9px] text-ink-400">
                        {toPersianDigits(item._sum.quantity ?? 0)} فروش
                      </p>
                    </div>
                  </li>
                );
              })}
            </ol>
          )}
        </section>

        <section className="rounded-2xl border border-ink-100 bg-white p-4 shadow-xs">
          <h2 className="flex items-center gap-1.5 text-sm font-black text-ink-900">
            <CreditCard className="h-4 w-4 text-brand-700" />
            وضعیت و روش پرداخت سفارش‌ها
          </h2>

          <div className="mt-3 space-y-2">
            {Object.entries(statusCounts)
              .sort((a, b) => b[1] - a[1])
              .map(([status, count]) => {
                const meta = ORDER_STATUS_META[status as OrderStatusKey];
                const percent = totalOrders
                  ? Math.round((count / totalOrders) * 100)
                  : 0;
                return (
                  <div key={status}>
                    <div className="flex items-center justify-between gap-2 text-[10px]">
                      <span className="text-ink-600">{meta?.label ?? status}</span>
                      <span className="font-black text-ink-800">
                        {toPersianDigits(count)} ({toPersianDigits(percent)}٪)
                      </span>
                    </div>
                    <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-ink-100">
                      <div
                        className={cn(
                          "h-full rounded-full",
                          status === "PENDING"
                            ? "bg-warning-500"
                            : status === "CANCELED"
                              ? "bg-danger-600"
                              : status === "DELIVERED"
                                ? "bg-success-600"
                                : "bg-brand-600",
                        )}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
          </div>

          <div className="mt-4 grid gap-2 border-t border-dashed border-ink-200 pt-3 sm:grid-cols-3">
            {paymentGroups.map((group) => (
              <div key={group.paymentMethod} className="rounded-xl bg-ink-50 p-2.5">
                <p className="text-[9px] text-ink-500">
                  {PAYMENT_METHOD_LABELS[group.paymentMethod] ?? group.paymentMethod}
                </p>
                <p className="mt-1 text-[11px] font-black text-ink-800">
                  {toPersianDigits(group._count._all)} سفارش
                </p>
                <p className="mt-0.5 text-[9px] text-ink-400">
                  {formatPrice(group._sum.total ?? 0)}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <section className="rounded-2xl border border-ink-100 bg-white p-4 shadow-xs">
          <h2 className="text-sm font-black text-ink-900">درآمد دسته‌بندی‌ها</h2>
          <ul className="mt-3 space-y-2">
            {topCategories.map(([name, value]) => (
              <li key={name} className="flex items-center justify-between gap-2">
                <span className="line-clamp-1 text-[11px] text-ink-600">{name}</span>
                <span className="shrink-0 text-[10px] font-black text-ink-800">
                  {formatPrice(value.revenue)}
                </span>
              </li>
            ))}
            {topCategories.length === 0 && (
              <li className="text-[11px] text-ink-400">داده‌ای موجود نیست.</li>
            )}
          </ul>
        </section>

        <section className="rounded-2xl border border-ink-100 bg-white p-4 shadow-xs">
          <h2 className="text-sm font-black text-ink-900">درآمد برندها</h2>
          <ul className="mt-3 space-y-2">
            {topBrands.map(([name, value]) => (
              <li key={name} className="flex items-center justify-between gap-2">
                <span className="line-clamp-1 text-[11px] text-ink-600">{name}</span>
                <span className="shrink-0 text-[10px] font-black text-ink-800">
                  {formatPrice(value.revenue)}
                </span>
              </li>
            ))}
            {topBrands.length === 0 && (
              <li className="text-[11px] text-ink-400">داده‌ای موجود نیست.</li>
            )}
          </ul>
        </section>

        <section className="rounded-2xl border border-ink-100 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-sm font-black text-ink-900">کدهای تخفیف</h2>
            <Link
              href="/admin/coupons"
              className="text-[10px] font-bold text-brand-700 hover:underline"
            >
              مدیریت
            </Link>
          </div>
          <ul className="mt-3 space-y-2">
            {coupons.map((coupon) => (
              <li key={coupon.id} className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p dir="ltr" className="truncate text-right text-[11px] font-black text-ink-800">
                    {coupon.code}
                  </p>
                  <p className="mt-0.5 text-[9px] text-ink-400">
                    {coupon.type === "PERCENT"
                      ? `${toPersianDigits(coupon.value)}٪`
                      : formatPrice(coupon.value)}
                    {coupon.isActive ? " — فعال" : " — غیرفعال"}
                  </p>
                </div>
                <Badge variant="outline" size="xs">
                  {toPersianDigits(coupon.usedCount)} استفاده
                </Badge>
              </li>
            ))}
            {coupons.length === 0 && (
              <li className="text-[11px] text-ink-400">کدی ثبت نشده است.</li>
            )}
          </ul>
        </section>
      </div>
    </div>
  );
}
