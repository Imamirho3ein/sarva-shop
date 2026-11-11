"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import {
  Search,
  ShoppingCart,
  User,
  Heart,
  Scale,
  Menu,
  X,
  ChevronDown,
  Bell,
  LogOut,
  LayoutDashboard,
  Package,
  Wallet,
  MapPin,
  Star,
  Sparkles,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { formatPrice, toPersianDigits } from "@/lib/format";
import { truncate } from "@/lib/utils";
import { SITE_NAME, NAV_LINKS } from "@/lib/constants";
import { useCart } from "@/store/cart";
import { useCompare } from "@/store/lists";
import { useSession } from "@/lib/session-context";
import { useToast } from "@/components/ui/toast";
import type { CategoryDTO } from "@/types";

type SuggestItem = {
  id: string;
  slug: string;
  name: string;
  image: string;
  price: number;
  discountPrice?: number | null;
};

export function Header({ categories }: { categories: CategoryDTO[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const count = useCart((s) => s.lines.reduce((n, l) => n + l.quantity, 0));
  const compareCount = useCompare((s) => s.items.length);
  const { session, loading } = useSession();
  const toast = useToast();

  const [query, setQuery] = React.useState("");
  const [open, setOpen] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [catOpen, setCatOpen] = React.useState(false);
  const [userOpen, setUserOpen] = React.useState(false);
  const [suggestions, setSuggestions] = React.useState<SuggestItem[]>([]);
  const [searching, setSearching] = React.useState(false);

  const boxRef = React.useRef<HTMLDivElement>(null);
  const debounce = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  // بستن پنل‌ها با کلیک بیرون
  React.useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  // بستن منوی موبایل با تغییر مسیر
  React.useEffect(() => {
    setMobileOpen(false);
    setUserOpen(false);
    setCatOpen(false);
  }, [pathname]);

  // پیشنهاد جستجو هنگام تایپ
  React.useEffect(() => {
    if (debounce.current) clearTimeout(debounce.current);
    if (query.trim().length < 2) {
      setSuggestions([]);
      setSearching(false);
      return;
    }
    setSearching(true);
    debounce.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search/suggest?q=${encodeURIComponent(query.trim())}`);
        if (!res.ok) return;
        const data = await res.json();
        setSuggestions(data.items ?? []);
      } catch {
        /* بی‌صدا */
      } finally {
        setSearching(false);
      }
    }, 260);
    return () => {
      if (debounce.current) clearTimeout(debounce.current);
    };
  }, [query]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    setOpen(false);
    router.push(`/search?q=${encodeURIComponent(q)}`);
  };

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    toast.success("خارج شدید", "تا دفعه بعد");
    router.refresh();
    router.push("/");
  };

  return (
    <header className="sticky top-0 z-50 border-b border-ink-100 bg-white/85 backdrop-blur-xl supports-[backdrop-filter]:bg-white/70">
      {/* نوار ابزار بالا */}
      <div className="hidden border-b border-ink-100/80 bg-ink-950 text-white lg:block">
        <div className="container-site flex h-9 items-center justify-between text-[11px] font-bold">
          <div className="flex items-center gap-5">
            <span className="text-ink-300">ارسال رایگان برای سفارش‌های بالای {toPersianDigits("۵٬۰۰۰")} تومان</span>
            <span className="h-3 w-px bg-ink-700" />
            <Link href="/shipping" className="text-ink-300 transition-colors hover:text-white">
              روش‌های ارسال
            </Link>
            <Link href="/faq" className="text-ink-300 transition-colors hover:text-white">
              پرسش‌های متداول
            </Link>
          </div>
          <div className="flex items-center gap-5">
            <Link href="/contact" className="text-ink-300 transition-colors hover:text-white">
              پشتیبانی: ۰۲۱-۹۱۰۰۰۰۰۰
            </Link>
            <span className="text-ink-600">|</span>
            <span className="text-ink-300">تهران، ایران</span>
          </div>
        </div>
      </div>

      {/* ردیف اصلی */}
      <div className="container-site flex h-16 items-center gap-3 lg:h-[72px] lg:gap-5">
        {/* لوگو */}
        <Link href="/" className="flex shrink-0 items-center gap-2.5" aria-label={SITE_NAME}>
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-600 to-brand-800 text-lg font-black text-white shadow-soft">
            س
          </span>
          <span className="hidden flex-col leading-none sm:flex">
            <span className="text-lg font-black text-ink-900">{SITE_NAME}</span>
            <span className="text-[10px] font-bold text-ink-400">فروشگاه اینترنتی</span>
          </span>
        </Link>

        {/* دکمه منو (موبایل) */}
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-ink-200 text-ink-700 lg:hidden"
          aria-label="منو"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* جستجو */}
        <div ref={boxRef} className="relative flex-1 lg:max-w-2xl">
          <form onSubmit={submit} role="search">
            <div
              className={cn(
                "flex h-11 items-center gap-2 rounded-xl border bg-ink-50/70 px-3 transition-all duration-200",
                open
                  ? "border-brand-500 bg-white shadow-soft ring-4 ring-brand-600/10"
                  : "border-ink-200 hover:border-ink-300",
              )}
            >
              <Search className="h-4.5 w-4.5 shrink-0 text-ink-400" strokeWidth={2.4} />
              <input
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setOpen(true);
                }}
                onFocus={() => setOpen(true)}
                placeholder="جستجو در میان هزاران محصول…"
                aria-label="جستجوی محصول"
                className="h-full w-full bg-transparent text-sm font-medium text-ink-900 placeholder:text-ink-400 focus:outline-none"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="rounded-md p-1 text-ink-400 hover:text-ink-700"
                  aria-label="پاک کردن"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
              <button
                type="submit"
                className="h-8 shrink-0 rounded-lg bg-brand-700 px-3.5 text-xs font-extrabold text-white transition-colors hover:bg-brand-800"
              >
                جستجو
              </button>
            </div>
          </form>

          {/* پیشنهادها */}
          <AnimatePresence>
            {open && (query.trim().length >= 2 || suggestions.length > 0) && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.18 }}
                className="absolute inset-x-0 top-[calc(100%+8px)] overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-pop"
              >
                <div className="max-h-[24rem] overflow-y-auto">
                  {searching && suggestions.length === 0 && (
                    <div className="space-y-2 p-3">
                      {[0, 1, 2].map((i) => (
                        <div key={i} className="flex items-center gap-3">
                          <div className="skeleton h-11 w-11 rounded-lg" />
                          <div className="flex-1 space-y-1.5">
                            <div className="skeleton h-3 w-3/4 rounded" />
                            <div className="skeleton h-3 w-1/4 rounded" />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {!searching && suggestions.length === 0 && (
                    <div className="p-5 text-center text-sm text-ink-500">
                      نتیجه‌ای برای «{truncate(query, 30)}» پیدا نشد
                    </div>
                  )}

                  {suggestions.map((s) => (
                    <Link
                      key={s.id}
                      href={`/product/${s.slug}`}
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-3 border-b border-ink-50 px-3 py-2.5 transition-colors last:border-b-0 hover:bg-brand-50/60"
                    >
                      <span className="relative h-11 w-11 shrink-0 overflow-hidden rounded-lg bg-ink-50">
                        <Image
                          src={s.image}
                          alt={s.name}
                          fill
                          sizes="44px"
                          className="object-contain p-1"
                        />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[13px] font-bold text-ink-800">
                          {s.name}
                        </span>
                        <span className="mt-0.5 block text-xs font-black text-brand-700 tabular">
                          {formatPrice(s.discountPrice ?? s.price)}
                        </span>
                      </span>
                      <ChevronDown className="h-4 w-4 -rotate-90 text-ink-300" />
                    </Link>
                  ))}
                </div>

                <Link
                  href={`/search?q=${encodeURIComponent(query.trim())}`}
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-center gap-2 border-t border-ink-100 bg-ink-50/60 py-2.5 text-xs font-extrabold text-brand-700 transition-colors hover:bg-brand-50"
                >
                  <Search className="h-3.5 w-3.5" />
                  مشاهده همه نتایج برای «{truncate(query, 24)}»
                </Link>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* اکشن‌ها */}
        <div className="flex items-center gap-1 sm:gap-2">
          <Link
            href={session ? "/account/wishlist" : "/login?next=/account/wishlist"}
            className="relative hidden h-10 w-10 items-center justify-center rounded-xl text-ink-600 transition-colors hover:bg-ink-100 hover:text-ink-900 sm:flex"
            aria-label="علاقه‌مندی‌ها"
          >
            <Heart className="h-5 w-5" />
          </Link>

          <Link
            href="/compare"
            className="relative hidden h-10 w-10 items-center justify-center rounded-xl text-ink-600 transition-colors hover:bg-ink-100 hover:text-ink-900 sm:flex"
            aria-label="مقایسه"
          >
            <Scale className="h-5 w-5" />
            {compareCount > 0 && (
              <span className="absolute -top-0.5 -left-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent-500 px-1 text-[9px] font-black text-white">
                {toPersianDigits(compareCount)}
              </span>
            )}
          </Link>

          {/* حساب کاربری */}
          <div className="relative" onMouseLeave={() => setUserOpen(false)}>
            <button
              type="button"
              onMouseEnter={() => setUserOpen(true)}
              onClick={() => setUserOpen((v) => !v)}
              className="flex h-10 items-center gap-2 rounded-xl px-2 text-ink-700 transition-colors hover:bg-ink-100"
              aria-label="حساب کاربری"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
                <User className="h-4 w-4" strokeWidth={2.4} />
              </span>
              <span className="hidden flex-col items-start leading-tight md:flex">
                {loading ? (
                  <span className="skeleton h-3 w-16 rounded" />
                ) : session ? (
                  <>
                    <span className="text-[10px] font-bold text-ink-400">حساب من</span>
                    <span className="max-w-24 truncate text-xs font-extrabold text-ink-900">
                      {session.name.split(" ")[0]}
                    </span>
                  </>
                ) : (
                  <>
                    <span className="text-[10px] font-bold text-ink-400">خوش آمدید</span>
                    <span className="text-xs font-extrabold text-ink-900">ورود | ثبت‌نام</span>
                  </>
                )}
              </span>
            </button>

            <AnimatePresence>
              {userOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.16 }}
                  onMouseEnter={() => setUserOpen(true)}
                  className="absolute left-0 top-[calc(100%+8px)] w-60 overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-pop"
                >
                  {session ? (
                    <>
                      <div className="border-b border-ink-100 bg-ink-50/70 p-4">
                        <p className="truncate text-sm font-extrabold text-ink-900">{session.name}</p>
                        <p className="mt-0.5 truncate text-xs text-ink-500">{session.email}</p>
                        <p className="mt-2 text-xs font-black text-brand-700 tabular">
                          کیف پول: {formatPrice(session.walletBalance)}
                        </p>
                      </div>
                      <nav className="p-1.5">
                        <UserMenuLink href="/account" icon={<User className="h-4 w-4" />}>
                          اطلاعات حساب
                        </UserMenuLink>
                        <UserMenuLink href="/account/orders" icon={<Package className="h-4 w-4" />}>
                          سفارش‌های من
                        </UserMenuLink>
                        <UserMenuLink href="/account/addresses" icon={<MapPin className="h-4 w-4" />}>
                          آدرس‌ها
                        </UserMenuLink>
                        <UserMenuLink href="/account/wishlist" icon={<Heart className="h-4 w-4" />}>
                          علاقه‌مندی‌ها
                        </UserMenuLink>
                        <UserMenuLink href="/account/reviews" icon={<Star className="h-4 w-4" />}>
                          نظرات من
                        </UserMenuLink>
                        <UserMenuLink href="/account/wallet" icon={<Wallet className="h-4 w-4" />}>
                          کیف پول
                        </UserMenuLink>
                        <UserMenuLink href="/account/notifications" icon={<Bell className="h-4 w-4" />}>
                          اعلان‌ها
                        </UserMenuLink>
                        {session.role === "ADMIN" && (
                          <UserMenuLink href="/admin" icon={<LayoutDashboard className="h-4 w-4" />}>
                            پنل مدیریت
                          </UserMenuLink>
                        )}
                        <button
                          type="button"
                          onClick={logout}
                          className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-right text-[13px] font-bold text-danger-600 transition-colors hover:bg-danger-50"
                        >
                          <LogOut className="h-4 w-4" />
                          خروج از حساب
                        </button>
                      </nav>
                    </>
                  ) : (
                    <div className="p-4">
                      <p className="text-sm font-extrabold text-ink-900">حساب کاربری ندارید؟</p>
                      <p className="mt-1 text-xs leading-5 text-ink-500">
                        برای ثبت سفارش، پیگیری و ذخیره علاقه‌مندی‌ها وارد شوید.
                      </p>
                      <Link
                        href="/login"
                        className="mt-3 flex h-10 items-center justify-center rounded-xl bg-brand-700 text-sm font-extrabold text-white transition-colors hover:bg-brand-800"
                      >
                        ورود | ثبت‌نام
                      </Link>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* سبد خرید */}
          <Link
            href="/cart"
            className="relative flex h-10 items-center gap-2 rounded-xl bg-brand-50 px-2.5 text-brand-800 transition-all hover:bg-brand-100"
            aria-label="سبد خرید"
          >
            <span className="relative">
              <ShoppingCart className="h-5 w-5" strokeWidth={2.3} />
              {count > 0 && (
                <span className="absolute -top-2 -left-2.5 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-accent-500 px-1 text-[9px] font-black text-white shadow-sm">
                  {toPersianDigits(count)}
                </span>
              )}
            </span>
            <span className="hidden flex-col items-start leading-tight sm:flex">
              <span className="text-[10px] font-bold text-brand-600">سبد خرید</span>
              <span className="text-xs font-extrabold tabular">
                {count > 0 ? `${toPersianDigits(count)} کالا` : "خالی"}
              </span>
            </span>
          </Link>
        </div>
      </div>

      {/* منوی دسته‌بندی */}
      <div className="hidden border-t border-ink-100 lg:block">
        <div className="container-site flex h-11 items-center gap-1 overflow-x-auto no-scrollbar">
          <div
            className="relative"
            onMouseEnter={() => setCatOpen(true)}
            onMouseLeave={() => setCatOpen(false)}
          >
            <button
              type="button"
              onClick={() => setCatOpen((v) => !v)}
              className="flex h-full items-center gap-2 rounded-t-lg bg-brand-700 px-4 text-[13px] font-extrabold text-white"
            >
              <Menu className="h-4 w-4" strokeWidth={2.5} />
              دسته‌بندی کالاها
              <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", catOpen && "rotate-180")} />
            </button>

            <AnimatePresence>
              {catOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 4 }}
                  transition={{ duration: 0.16 }}
                  className="absolute right-0 top-full z-50 grid w-[46rem] grid-cols-2 gap-1 rounded-b-2xl rounded-tl-2xl border border-ink-100 bg-white p-3 shadow-pop"
                >
                  {categories.map((c) => (
                    <Link
                      key={c.id}
                      href={`/category/${c.slug}`}
                      className="group flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-brand-50"
                    >
                      <span className="text-[13px] font-bold text-ink-800 group-hover:text-brand-800">
                        {c.name}
                      </span>
                      <span className="flex items-center gap-1.5">
                        {c.productCount !== undefined && (
                          <span className="rounded-md bg-ink-100 px-1.5 py-0.5 text-[10px] font-bold text-ink-500 tabular">
                            {toPersianDigits(c.productCount)}
                          </span>
                        )}
                        <ChevronDown className="h-3.5 w-3.5 -rotate-90 text-ink-300 group-hover:text-brand-600" />
                      </span>
                    </Link>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {NAV_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                "whitespace-nowrap rounded-lg px-3 py-1.5 text-[13px] font-bold transition-colors",
                pathname === l.href
                  ? "text-brand-800"
                  : "text-ink-600 hover:bg-ink-100 hover:text-ink-900",
              )}
            >
              {l.label}
            </Link>
          ))}

          <span className="mr-auto flex items-center gap-1.5 text-[12px] font-black text-accent-600">
            <Sparkles className="h-4 w-4" />
            <Link href="/special-offers">پیشنهاد شگفت‌انگیز امروز</Link>
          </span>
        </div>
      </div>

      {/* منوی موبایل */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-ink-950/50 backdrop-blur-sm lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 26, stiffness: 240 }}
              className="fixed inset-y-0 right-0 z-50 flex w-[min(20rem,85vw)] flex-col bg-white shadow-pop lg:hidden"
            >
              <div className="flex h-16 items-center justify-between border-b border-ink-100 px-4">
                <span className="text-base font-black text-ink-900">منو</span>
                <button
                  type="button"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-lg p-2 text-ink-500 hover:bg-ink-100"
                  aria-label="بستن"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-3">
                {!session && !loading && (
                  <Link
                    href="/login"
                    className="mb-3 flex h-11 items-center justify-center rounded-xl bg-brand-700 text-sm font-extrabold text-white"
                  >
                    ورود | ثبت‌نام
                  </Link>
                )}
                {session && (
                  <div className="mb-3 rounded-xl bg-ink-50 p-3">
                    <p className="text-sm font-extrabold text-ink-900">{session.name}</p>
                    <p className="mt-0.5 text-xs text-ink-500">{session.email}</p>
                  </div>
                )}

                <p className="mb-2 px-2 text-[11px] font-black text-ink-400">دسته‌بندی‌ها</p>
                <nav className="mb-3 space-y-0.5">
                  {categories.map((c) => (
                    <Link
                      key={c.id}
                      href={`/category/${c.slug}`}
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-bold text-ink-700 hover:bg-brand-50 hover:text-brand-800"
                    >
                      {c.name}
                      <ChevronDown className="h-4 w-4 -rotate-90 text-ink-300" />
                    </Link>
                  ))}
                </nav>

                <p className="mb-2 px-2 text-[11px] font-black text-ink-400">صفحات</p>
                <nav className="space-y-0.5">
                  {NAV_LINKS.map((l) => (
                    <Link
                      key={l.href}
                      href={l.href}
                      onClick={() => setMobileOpen(false)}
                      className="block rounded-lg px-3 py-2.5 text-sm font-bold text-ink-700 hover:bg-ink-100"
                    >
                      {l.label}
                    </Link>
                  ))}
                  {session && (
                    <Link
                      href="/account"
                      onClick={() => setMobileOpen(false)}
                      className="block rounded-lg px-3 py-2.5 text-sm font-bold text-ink-700 hover:bg-ink-100"
                    >
                      پنل کاربری
                    </Link>
                  )}
                </nav>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}

function UserMenuLink({
  href,
  icon,
  children,
}: {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-[13px] font-bold text-ink-700 transition-colors hover:bg-brand-50 hover:text-brand-800"
    >
      <span className="text-ink-400">{icon}</span>
      {children}
    </Link>
  );
}
