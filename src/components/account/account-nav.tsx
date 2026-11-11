"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Bell,
  Heart,
  LayoutDashboard,
  LogOut,
  MapPin,
  Package,
  Star,
  User,
  Wallet,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatPrice, toPersianDigits } from "@/lib/format";
import { useSession } from "@/lib/session-context";
import { useToast } from "@/components/ui/toast";

const NAV_ITEMS = [
  { href: "/account", label: "داشبورد", icon: LayoutDashboard },
  { href: "/account/orders", label: "سفارش‌های من", icon: Package },
  { href: "/account/addresses", label: "آدرس‌های من", icon: MapPin },
  { href: "/account/wishlist", label: "علاقه‌مندی‌ها", icon: Heart },
  { href: "/account/reviews", label: "نظرات من", icon: Star },
  { href: "/account/notifications", label: "اعلان‌ها", icon: Bell },
  { href: "/account/wallet", label: "کیف پول", icon: Wallet },
  { href: "/account/profile", label: "اطلاعات حساب", icon: User },
] as const;

export function AccountNav({
  user,
  unread = 0,
}: {
  user: { name: string; email: string; walletBalance: number };
  unread?: number;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const toast = useToast();
  const { setSession } = useSession();
  const [loggingOut, setLoggingOut] = React.useState(false);

  const isActive = (href: string) =>
    href === "/account" ? pathname === "/account" : pathname.startsWith(href);

  const logout = async () => {
    setLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setSession(null);
      toast.success("خروج انجام شد", "به امید دیدار");
      router.push("/");
      router.refresh();
    } catch {
      toast.error("خطا در خروج", "لطفاً دوباره تلاش کنید.");
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <aside className="lg:sticky lg:top-24">
      <div className="overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-xs">
        <div className="flex items-center gap-3 border-b border-ink-100 bg-gradient-to-l from-brand-50 to-white p-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-700 text-lg font-black text-white">
            {user.name.trim().charAt(0) || "س"}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-black text-ink-900">{user.name}</p>
            <p dir="ltr" className="mt-0.5 truncate text-right text-[11px] text-ink-500">
              {user.email}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between gap-2 border-b border-ink-100 px-4 py-3">
          <div>
            <p className="text-[10px] font-medium text-ink-500">موجودی کیف پول</p>
            <p className="mt-0.5 text-xs font-black text-ink-900">
              {formatPrice(user.walletBalance)}
            </p>
          </div>
          <Link
            href="/account/wallet"
            className="rounded-lg bg-brand-50 px-2.5 py-1.5 text-[10px] font-bold text-brand-800 transition-colors hover:bg-brand-100"
          >
            مشاهده
          </Link>
        </div>

        <nav className="grid grid-cols-2 gap-1 p-2 sm:grid-cols-4 lg:grid-cols-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative flex items-center gap-2 rounded-xl px-2.5 py-2.5 text-[12px] font-bold transition-colors",
                  active
                    ? "bg-brand-700 text-white shadow-sm"
                    : "text-ink-600 hover:bg-ink-100 hover:text-ink-900",
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="truncate">{item.label}</span>
                {item.href === "/account/notifications" && unread > 0 && (
                  <span
                    className={cn(
                      "mr-auto flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[9px] font-black",
                      active ? "bg-white text-brand-800" : "bg-danger-600 text-white",
                    )}
                  >
                    {toPersianDigits(unread > 99 ? 99 : unread)}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-ink-100 p-2">
          <button
            type="button"
            onClick={logout}
            disabled={loggingOut}
            className="flex w-full items-center gap-2 rounded-xl px-2.5 py-2.5 text-[12px] font-bold text-danger-600 transition-colors hover:bg-danger-50 disabled:opacity-60"
          >
            <LogOut className="h-4 w-4" />
            {loggingOut ? "در حال خروج…" : "خروج از حساب"}
          </button>
        </div>
      </div>

      <Link
        href="/products"
        className="mt-3 flex items-center justify-center gap-1.5 rounded-xl border border-dashed border-ink-200 px-3 py-2.5 text-[11px] font-bold text-ink-500 transition-colors hover:border-brand-300 hover:text-brand-700"
      >
        بازگشت به فروشگاه
      </Link>
    </aside>
  );
}
