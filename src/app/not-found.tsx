import Link from "next/link";
import {
  ArrowLeft,
  Compass,
  Home,
  PackageSearch,
  Search,
  ShoppingBag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SITE_NAME } from "@/lib/constants";

export default function NotFound() {
  return (
    <div className="container-site py-8 lg:py-14">
      <div className="mx-auto max-w-2xl overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-xs">
        <div className="relative overflow-hidden border-b border-ink-100 bg-gradient-to-l from-brand-50 via-white to-white px-6 py-10 text-center">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-10 -top-16 h-44 w-44 rounded-full bg-brand-100/60 blur-2xl"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-16 -left-6 h-40 w-40 rounded-full bg-accent-100/50 blur-2xl"
          />
          <p className="relative text-6xl font-black leading-none text-brand-700 sm:text-7xl">
            ۴۰۴
          </p>
          <h1 className="relative mt-3 text-xl font-black text-ink-900 sm:text-2xl">
            این صفحه پیدا نشد
          </h1>
          <p className="relative mx-auto mt-2 max-w-md text-[12px] leading-7 text-ink-500 sm:text-[13px]">
            شاید آدرس عوض شده باشد یا محصول موردنظر از فروشگاه حذف شده است. نگران
            نباشید؛ از مسیرهای زیر ادامه دهید.
          </p>
        </div>

        <div className="p-5 sm:p-6">
          <form action="/search" className="flex gap-2">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
              <input
                type="search"
                name="q"
                placeholder="جستجوی محصول در سَروا…"
                aria-label="جستجوی محصول"
                className="h-11 w-full rounded-xl border border-ink-200 bg-white pr-10 pl-3 text-[13px] text-ink-900 placeholder:text-ink-400 focus:border-brand-600 focus:outline-none focus:ring-4 focus:ring-brand-600/10"
              />
            </div>
            <Button type="submit" className="shrink-0">
              جستجو
            </Button>
          </form>

          <div className="mt-5 grid gap-2 sm:grid-cols-2">
            {[
              {
                href: "/",
                label: "صفحه اصلی",
                text: "بازگشت به خانه",
                icon: Home,
              },
              {
                href: "/products",
                label: "همه محصولات",
                text: "مشاهده فهرست کامل",
                icon: ShoppingBag,
              },
              {
                href: "/categories",
                label: "دسته‌بندی‌ها",
                text: "پیدا کردن دسته موردنظر",
                icon: Compass,
              },
              {
                href: "/special-offers",
                label: "پیشنهادهای ویژه",
                text: "تخفیف‌های فعال",
                icon: PackageSearch,
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="group flex items-center gap-2.5 rounded-xl border border-ink-100 p-3 transition-colors hover:border-brand-200 hover:bg-brand-50/40"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[11px] font-black text-ink-800">
                      {item.label}
                    </span>
                    <span className="block text-[10px] text-ink-500">{item.text}</span>
                  </span>
                  <ArrowLeft className="h-3.5 w-3.5 text-ink-300 transition-transform group-hover:-translate-x-0.5" />
                </Link>
              );
            })}
          </div>

          <p className="mt-4 text-center text-[10px] text-ink-400">
            اگر مطمئن هستید این یک خطاست، با{" "}
            <Link href="/contact" className="font-bold text-brand-700 hover:underline">
              پشتیبانی {SITE_NAME}
            </Link>{" "}
            تماس بگیرید.
          </p>
        </div>
      </div>
    </div>
  );
}
