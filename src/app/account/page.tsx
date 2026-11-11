import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowLeft,
  Bell,
  Heart,
  MapPin,
  Package,
  ShoppingBag,
  Star,
  Wallet,
} from "lucide-react";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getUserOrderStats, listUserOrders } from "@/lib/services/orders";
import { formatDateTime, formatPrice, toPersianDigits } from "@/lib/format";
import { OrderStatusBadge } from "@/components/account/order-status-badge";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: `داشبورد حساب`,
  robots: { index: false, follow: false },
};

const STAT_CARDS = [
  { key: "total", label: "کل سفارش‌ها", icon: Package, tone: "bg-brand-50 text-brand-700" },
  { key: "pending", label: "در انتظار پرداخت", icon: ShoppingBag, tone: "bg-warning-100 text-warning-500" },
  { key: "delivered", label: "تحویل‌شده", icon: MapPin, tone: "bg-success-100 text-success-600" },
  { key: "spent", label: "مجموع خرید", icon: Wallet, tone: "bg-accent-100 text-accent-700" },
] as const;

export default async function AccountDashboardPage() {
  const session = await getSession();
  if (!session) return null;

  const [stats, recent, notifications, addressCount] = await Promise.all([
    getUserOrderStats(session.id),
    listUserOrders(session.id, { perPage: 4 }),
    prisma.notification.findMany({
      where: { userId: session.id },
      orderBy: { createdAt: "desc" },
      take: 3,
    }),
    prisma.address.count({ where: { userId: session.id } }),
  ]);

  const unread = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="space-y-4">
      {/* خوش‌آمد */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-l from-brand-800 to-brand-600 p-5 text-white shadow-soft sm:p-6">
        <div className="pointer-events-none absolute -left-10 -top-10 h-40 w-40 rounded-full bg-white/10" />
        <div className="pointer-events-none absolute -bottom-16 left-16 h-40 w-40 rounded-full bg-white/5" />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[11px] font-medium text-white/70">خوش آمدید</p>
            <h1 className="mt-1 text-lg font-black sm:text-xl">{session.name} عزیز</h1>
            <p className="mt-1.5 max-w-md text-[11px] leading-5 text-white/75">
              از این‌جا می‌توانید سفارش‌ها، آدرس‌ها، کیف پول و اعلان‌های خود را مدیریت کنید.
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:items-end">
            <div className="rounded-xl bg-white/10 px-3.5 py-2.5 backdrop-blur-sm">
              <p className="text-[10px] text-white/70">موجودی کیف پول</p>
              <p className="mt-0.5 text-sm font-black">{formatPrice(session.walletBalance)}</p>
            </div>
            <Link
              href="/account/wallet"
              className="inline-flex items-center gap-1 text-[10px] font-bold text-white/80 hover:text-white"
            >
              مشاهده کیف پول
              <ArrowLeft className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </section>

      {/* آمار */}
      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {STAT_CARDS.map((card) => {
          const Icon = card.icon;
          const value =
            card.key === "spent"
              ? formatPrice(stats.spent)
              : toPersianDigits(stats[card.key]);
          return (
            <div
              key={card.key}
              className="rounded-2xl border border-ink-100 bg-white p-3.5 shadow-xs"
            >
              <span
                className={`flex h-9 w-9 items-center justify-center rounded-lg ${card.tone}`}
              >
                <Icon className="h-4 w-4" />
              </span>
              <p className="mt-3 text-[10px] font-medium text-ink-500">{card.label}</p>
              <p className="mt-1 text-sm font-black text-ink-900">{value}</p>
            </div>
          );
        })}
      </section>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_300px]">
        {/* سفارش‌های اخیر */}
        <section className="rounded-2xl border border-ink-100 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-sm font-black text-ink-900">سفارش‌های اخیر</h2>
            <Link
              href="/account/orders"
              className="inline-flex items-center gap-1 text-[11px] font-bold text-brand-700 hover:underline"
            >
              همه سفارش‌ها
              <ArrowLeft className="h-3.5 w-3.5" />
            </Link>
          </div>

          {recent.items.length === 0 ? (
            <div className="mt-4 rounded-xl border border-dashed border-ink-200 p-6 text-center">
              <ShoppingBag className="mx-auto h-8 w-8 text-ink-300" />
              <p className="mt-2 text-[12px] font-bold text-ink-700">هنوز سفارشی ثبت نکرده‌اید</p>
              <p className="mt-1 text-[11px] text-ink-500">
                اولین سفارش خود را از فروشگاه ثبت کنید.
              </p>
              <Button asChild size="sm" className="mt-3">
                <Link href="/products">شروع خرید</Link>
              </Button>
            </div>
          ) : (
            <ul className="mt-3 divide-y divide-ink-100">
              {recent.items.map((order) => (
                <li key={order.id}>
                  <Link
                    href={`/account/orders/${order.id}`}
                    className="-mx-2 flex flex-wrap items-center justify-between gap-2 rounded-lg px-2 py-2.5 transition-colors hover:bg-ink-50"
                  >
                    <div className="min-w-0">
                      <p className="text-[12px] font-black text-ink-900">
                        سفارش {toPersianDigits(order.orderNumber)}
                      </p>
                      <p className="mt-0.5 text-[10px] text-ink-500">
                        {formatDateTime(order.createdAt)} — {toPersianDigits(order.itemCount)} کالا
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <OrderStatusBadge status={order.status} size="xs" />
                      <span className="text-[11px] font-black text-ink-900">
                        {formatPrice(order.total)}
                      </span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <div className="space-y-4">
          {/* اعلان‌ها */}
          <section className="rounded-2xl border border-ink-100 bg-white p-4 shadow-xs">
            <div className="flex items-center justify-between gap-2">
              <h2 className="flex items-center gap-1.5 text-sm font-black text-ink-900">
                <Bell className="h-4 w-4 text-brand-700" />
                اعلان‌ها
              </h2>
              {unread > 0 && (
                <span className="rounded-full bg-danger-600 px-1.5 py-0.5 text-[9px] font-black text-white">
                  {toPersianDigits(unread)} جدید
                </span>
              )}
            </div>
            {notifications.length === 0 ? (
              <p className="mt-3 text-[11px] text-ink-500">اعلانی برای نمایش نیست.</p>
            ) : (
              <ul className="mt-2 space-y-2">
                {notifications.map((n) => (
                  <li key={n.id} className="rounded-lg bg-ink-50 p-2.5">
                    <p className="text-[11px] font-bold leading-5 text-ink-800">{n.title}</p>
                    <p className="mt-0.5 line-clamp-2 text-[10px] leading-4 text-ink-500">
                      {n.body}
                    </p>
                  </li>
                ))}
              </ul>
            )}
            <Link
              href="/account/notifications"
              className="mt-2 inline-flex items-center gap-1 text-[10px] font-bold text-brand-700 hover:underline"
            >
              مشاهده همه
              <ArrowLeft className="h-3 w-3" />
            </Link>
          </section>

          {/* دسترسی سریع */}
          <section className="rounded-2xl border border-ink-100 bg-white p-4 shadow-xs">
            <h2 className="text-sm font-black text-ink-900">دسترسی سریع</h2>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <Link
                href="/account/addresses"
                className="flex flex-col gap-1.5 rounded-xl bg-ink-50 p-2.5 transition-colors hover:bg-brand-50"
              >
                <MapPin className="h-4 w-4 text-brand-700" />
                <span className="text-[10px] font-bold text-ink-700">
                  آدرس‌ها ({toPersianDigits(addressCount)})
                </span>
              </Link>
              <Link
                href="/account/wishlist"
                className="flex flex-col gap-1.5 rounded-xl bg-ink-50 p-2.5 transition-colors hover:bg-brand-50"
              >
                <Heart className="h-4 w-4 text-danger-600" />
                <span className="text-[10px] font-bold text-ink-700">علاقه‌مندی‌ها</span>
              </Link>
              <Link
                href="/account/reviews"
                className="flex flex-col gap-1.5 rounded-xl bg-ink-50 p-2.5 transition-colors hover:bg-brand-50"
              >
                <Star className="h-4 w-4 text-accent-600" />
                <span className="text-[10px] font-bold text-ink-700">نظرات من</span>
              </Link>
              <Link
                href="/account/profile"
                className="flex flex-col gap-1.5 rounded-xl bg-ink-50 p-2.5 transition-colors hover:bg-brand-50"
              >
                <Package className="h-4 w-4 text-brand-700" />
                <span className="text-[10px] font-bold text-ink-700">اطلاعات حساب</span>
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
