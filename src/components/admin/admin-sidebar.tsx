"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BarChart3,
  BadgePercent,
  Boxes,
  FolderTree,
  Images,
  LayoutDashboard,
  LogOut,
  Mail,
  MessageSquare,
  Package,
  ShoppingBag,
  Star,
  Tags,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSession } from "@/lib/session-context";
import { useToast } from "@/components/ui/toast";

const NAV = [
  { href: "/admin", label: "داشبورد", icon: LayoutDashboard },
  { href: "/admin/orders", label: "سفارش‌ها", icon: ShoppingBag },
  { href: "/admin/products", label: "محصولات", icon: Package },
  { href: "/admin/categories", label: "دسته‌بندی‌ها", icon: FolderTree },
  { href: "/admin/brands", label: "برندها", icon: Tags },
  { href: "/admin/inventory", label: "انبار", icon: Boxes },
  { href: "/admin/coupons", label: "کد تخفیف", icon: BadgePercent },
  { href: "/admin/users", label: "کاربران", icon: Users },
  { href: "/admin/reviews", label: "نظرات", icon: Star },
  { href: "/admin/questions", label: "پرسش‌ها", icon: MessageSquare },
  { href: "/admin/banners", label: "بنرها", icon: Images },
  { href: "/admin/messages", label: "پیام‌ها", icon: Mail },
  { href: "/admin/reports", label: "گزارش فروش", icon: BarChart3 },
] as const;

function isActive(pathname: string, href: string) {
  return href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
}

export function AdminSidebar({ user }: { user: { name: string; email: string } }) {
  const pathname = usePathname();
  const router = useRouter();
  const toast = useToast();
  const { setSession } = useSession();
  const [loggingOut, setLoggingOut] = React.useState(false);

  const logout = async () => {
    setLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setSession(null);
      toast.success("خروج از پنل مدیریت انجام شد");
      router.push("/");
      router.refresh();
    } catch {
      toast.error("خطا در خروج", "لطفاً دوباره تلاش کنید.");
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <>
      <aside className="hidden lg:sticky lg:top-4 lg:block">
        <div className="overflow-hidden rounded-2xl border border-ink-800 bg-ink-900 text-white shadow-soft">
          <div className="border-b border-white/10 p-4">
            <Link href="/admin" className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-sm font-black">
                س
              </span>
              <div>
                <p className="text-sm font-black">پنل مدیریت سَروا</p>
                <p className="text-[10px] text-white/50">مدیریت فروشگاه</p>
              </div>
            </Link>
          </div>

          <nav className="grid gap-0.5 p-2">
            {NAV.map((item) => {
              const Icon = item.icon;
              const active = isActive(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 rounded-lg px-2.5 py-2 text-[11px] font-bold transition-colors",
                    active
                      ? "bg-brand-600 text-white shadow-sm"
                      : "text-white/65 hover:bg-white/10 hover:text-white",
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="border-t border-white/10 p-3">
            <p className="truncate text-[11px] font-bold text-white/80">{user.name}</p>
            <p dir="ltr" className="mt-0.5 truncate text-right text-[9px] text-white/40">
              {user.email}
            </p>
            <div className="mt-2 flex gap-1.5">
              <Link
                href="/"
                className="flex-1 rounded-lg bg-white/10 px-2 py-1.5 text-center text-[10px] font-bold text-white/80 transition-colors hover:bg-white/20"
              >
                فروشگاه
              </Link>
              <button
                type="button"
                onClick={logout}
                disabled={loggingOut}
                className="flex items-center justify-center gap-1 rounded-lg bg-danger-600/20 px-2 py-1.5 text-[10px] font-bold text-danger-300 transition-colors hover:bg-danger-600/30 disabled:opacity-60"
              >
                <LogOut className="h-3 w-3" />
                {loggingOut ? "خروج…" : "خروج"}
              </button>
            </div>
          </div>
        </div>
      </aside>

      <div className="lg:hidden">
        <div className="overflow-hidden rounded-2xl border border-ink-800 bg-ink-900 p-2 text-white">
          <div className="mb-1.5 flex items-center justify-between px-1">
            <p className="text-[11px] font-black">پنل مدیریت سَروا</p>
            <button
              type="button"
              onClick={logout}
              className="flex items-center gap-1 text-[10px] font-bold text-danger-300"
            >
              <LogOut className="h-3 w-3" />
              خروج
            </button>
          </div>
          <nav className="-mx-1 flex gap-1 overflow-x-auto px-1 pb-1">
            {NAV.map((item) => {
              const Icon = item.icon;
              const active = isActive(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex shrink-0 items-center gap-1 rounded-lg px-2.5 py-2 text-[10px] font-bold",
                    active
                      ? "bg-brand-600 text-white"
                      : "bg-white/5 text-white/65",
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </>
  );
}
