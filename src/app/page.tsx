import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  BadgePercent,
  Clock3,
  Flame,
  Gift,
  Headphones,
  ShieldCheck,
  Sparkles,
  Store,
  Truck,
  Zap,
} from "lucide-react";
import { getHomeData } from "@/lib/services/catalog";
import { SITE_NAME } from "@/lib/constants";
import { formatPrice, toPersianDigits } from "@/lib/format";
import { HeroSlider } from "@/components/home/hero-slider";
import { Countdown } from "@/components/home/countdown";
import { ProductRail } from "@/components/home/product-rail";
import { CategoryIcon } from "@/components/ui/category-icon";
import { SectionHeader } from "@/components/ui/section";
import { EmptyState } from "@/components/ui/misc";
import type { ProductCardDTO } from "@/types";

export const metadata: Metadata = {
  title: `${SITE_NAME} | فروشگاه اینترنتی مدرن`,
  description:
    "خرید آنلاین از فروشگاه اینترنتی سَروا؛ کالای دیجیتال، خانه و آشپزخانه، مد و پوشاک، زیبایی و سلامت با ضمانت اصالت، ارسال سریع و ۷ روز بازگشت کالا.",
};

export const revalidate = 120;

const TRUST = [
  { icon: Truck, title: "ارسال سریع", desc: "تحویل ۲۴ ساعته در تهران" },
  { icon: ShieldCheck, title: "ضمانت اصالت", desc: "تضمین اورجینال بودن کالا" },
  { icon: BadgePercent, title: "بهترین قیمت", desc: "تضمین ارزان‌ترین قیمت" },
  { icon: Headphones, title: "پشتیبانی ۲۴/۷", desc: "همیشه در کنار شما" },
];

export default async function HomePage() {
  let data: Awaited<ReturnType<typeof getHomeData>> | null = null;
  try {
    data = await getHomeData();
  } catch {
    data = null;
  }

  if (!data) {
    return (
      <div className="container-site py-16">
        <EmptyState
          icon={<Store className="h-7 w-7" />}
          title="در حال آماده‌سازی فروشگاه"
          description="اتصال به پایگاه داده برقرار نیست. لطفاً پس از راه‌اندازی دیتابیس صفحه را دوباره بارگذاری کنید."
        />
      </div>
    );
  }

  const {
    banners,
    categories,
    bestsellers,
    newest,
    specials,
    deals,
    featured,
    brands,
  } = data;

  const specialEnd = specials
    .map((p) => (p.specialEndsAt ? new Date(p.specialEndsAt).getTime() : 0))
    .filter((t) => t > Date.now())
    .sort((a, b) => a - b)[0];

  return (
    <div className="pb-4">
      {/* ---------------- بنر اصلی ---------------- */}
      <section className="container-site pt-4 lg:pt-6">
        <div className="grid gap-4 lg:grid-cols-[1fr_300px]">
          <HeroSlider banners={banners} />

          <div className="hidden flex-col gap-4 lg:flex">
            <Link
              href="/special-offers"
              className="group relative flex flex-1 flex-col justify-between overflow-hidden rounded-2xl bg-gradient-to-br from-accent-500 to-accent-700 p-5 text-white shadow-soft"
            >
              <span className="absolute -left-8 -top-8 h-32 w-32 rounded-full bg-white/10" />
              <span className="absolute -bottom-10 -right-6 h-28 w-28 rounded-full bg-white/10" />
              <div className="relative">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-2.5 py-1 text-[10px] font-black backdrop-blur">
                  <Zap className="h-3 w-3" />
                  پیشنهاد امروز
                </span>
                <p className="mt-3 text-lg font-black leading-7">تا ۴۰٪ تخفیف روی منتخب کالاها</p>
                <p className="mt-1 text-xs text-white/80">فرصت محدود؛ همین حالا خرید کنید.</p>
              </div>
              <span className="relative mt-4 inline-flex items-center gap-1 text-xs font-extrabold">
                مشاهده پیشنهادها
                <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
              </span>
            </Link>

            <Link
              href="/brands"
              className="group flex items-center gap-4 rounded-2xl border border-ink-100 bg-white p-5 shadow-xs transition-shadow hover:shadow-soft"
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
                <Gift className="h-6 w-6" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-black text-ink-900">برندهای معتبر جهانی</span>
                <span className="mt-0.5 block text-xs text-ink-500">
                  {toPersianDigits(brands.length)} برند برگزیده
                </span>
              </span>
              <ArrowLeft className="h-4 w-4 text-ink-300 transition-transform group-hover:-translate-x-1 group-hover:text-brand-600" />
            </Link>
          </div>
        </div>

        {/* نوار اعتماد */}
        <div className="mt-4 grid grid-cols-2 gap-2 rounded-2xl border border-ink-100 bg-white p-2 shadow-xs sm:grid-cols-4 sm:gap-0 sm:divide-x sm:divide-x-reverse sm:divide-ink-100 sm:p-0">
          {TRUST.map((t) => (
            <div key={t.title} className="flex items-center gap-2.5 rounded-xl p-2.5 sm:justify-center sm:px-4 sm:py-4">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
                <t.icon className="h-4.5 w-4.5" strokeWidth={2.2} />
              </span>
              <span className="min-w-0">
                <span className="block text-[12px] font-extrabold text-ink-900">{t.title}</span>
                <span className="block truncate text-[10px] font-medium text-ink-500 sm:text-[11px]">
                  {t.desc}
                </span>
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ---------------- دسته‌بندی‌های محبوب ---------------- */}
      <section className="container-site mt-8">
        <SectionHeader
          title="دسته‌بندی‌های محبوب"
          subtitle="هر چیزی که نیاز دارید، در یک جای درست"
          href="/categories"
          icon={<Sparkles className="h-5 w-5" />}
        />
        <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4 lg:grid-cols-8">
          {categories.map((c) => (
            <Link
              key={c.id}
              href={`/category/${c.slug}`}
              className="group flex flex-col items-center gap-2.5 rounded-2xl border border-ink-100 bg-white p-3 text-center transition-all duration-200 hover:-translate-y-1 hover:border-brand-200 hover:shadow-card sm:p-4"
            >
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-50 to-accent-50 text-brand-700 transition-colors group-hover:from-brand-100">
                <CategoryIcon name={c.icon} className="h-7 w-7" />
              </span>
              <span className="text-[11px] font-extrabold leading-4 text-ink-800 group-hover:text-brand-800 sm:text-xs">
                {c.name}
              </span>
              {c.productCount !== undefined && (
                <span className="text-[10px] font-bold text-ink-400">
                  {toPersianDigits(c.productCount)} کالا
                </span>
              )}
            </Link>
          ))}
        </div>
      </section>

      {/* ---------------- شگفت‌انگیزها ---------------- */}
      {specials.length > 0 && (
        <section className="container-site mt-9">
          <div className="overflow-hidden rounded-2xl border border-accent-200 bg-white shadow-sm">
            <div className="flex flex-col gap-3 bg-gradient-to-l from-accent-600 via-accent-500 to-accent-400 p-4 text-white sm:flex-row sm:items-center sm:justify-between sm:p-5">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 backdrop-blur">
                  <Flame className="h-6 w-6" />
                </span>
                <div>
                  <h2 className="text-base font-black sm:text-lg">پیشنهادهای شگفت‌انگیز</h2>
                  <p className="mt-0.5 flex items-center gap-1 text-[11px] font-medium text-white/85">
                    <Clock3 className="h-3.5 w-3.5" />
                    فرصت محدود — تا پایان شمارش معکوس
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="hidden text-xs font-bold text-white/85 sm:block">پایان پیشنهاد:</span>
                <Countdown endsAt={specialEnd ? new Date(specialEnd).toISOString() : null} />
                <Link
                  href="/special-offers"
                  className="hidden h-9 items-center gap-1 rounded-lg bg-white/20 px-3 text-xs font-extrabold backdrop-blur transition-colors hover:bg-white/30 sm:flex"
                >
                  همه
                  <ArrowLeft className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
            <div className="p-3 sm:p-4">
              <ProductRail products={specials} />
            </div>
          </div>
        </section>
      )}

      {/* ---------------- پرفروش‌ترین‌ها ---------------- */}
      <section className="container-site mt-9">
        <SectionHeader
          title="پرفروش‌ترین‌ها"
          subtitle="انتخاب میلیون‌ها خریدار سَروا"
          href="/products?sort=bestselling"
          icon={<Flame className="h-5 w-5" />}
        />
        <ProductRail products={bestsellers} />
      </section>

      {/* ---------------- بنرهای میانی ---------------- */}
      <section className="container-site mt-9 grid gap-3 md:grid-cols-2">
        <Link
          href="/category/home-kitchen"
          className="group relative flex min-h-28 items-center justify-between overflow-hidden rounded-2xl bg-gradient-to-l from-brand-800 to-brand-600 p-5 text-white shadow-soft"
        >
          <span className="absolute -left-6 -top-8 h-36 w-36 rounded-full bg-white/10" />
          <div className="relative">
            <p className="text-[11px] font-bold text-white/70">خانه‌ای زیباتر</p>
            <p className="mt-1 text-lg font-black">تا ۳۵٪ تخفیف لوازم آشپزخانه</p>
            <span className="mt-2 inline-flex items-center gap-1 text-xs font-extrabold">
              خرید کنید
              <ArrowLeft className="h-3.5 w-3.5" />
            </span>
          </div>
          <span className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15 text-white backdrop-blur">
            <Store className="h-8 w-8" />
          </span>
        </Link>
        <Link
          href="/category/fashion"
          className="group relative flex min-h-28 items-center justify-between overflow-hidden rounded-2xl bg-gradient-to-l from-rose-700 to-rose-500 p-5 text-white shadow-soft"
        >
          <span className="absolute -left-6 -bottom-8 h-36 w-36 rounded-full bg-white/10" />
          <div className="relative">
            <p className="text-[11px] font-bold text-white/70">کالکشن جدید</p>
            <p className="mt-1 text-lg font-black">مد و پوشاک پاییز ۱۴۰۴</p>
            <span className="mt-2 inline-flex items-center gap-1 text-xs font-extrabold">
              مشاهده کالکشن
              <ArrowLeft className="h-3.5 w-3.5" />
            </span>
          </div>
          <span className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15 text-white backdrop-blur">
            <Sparkles className="h-8 w-8" />
          </span>
        </Link>
      </section>

      {/* ---------------- جدیدترین‌ها ---------------- */}
      <section className="container-site mt-9">
        <SectionHeader
          title="جدیدترین محصولات"
          subtitle="تازه رسیده‌های سَروا"
          href="/products?sort=newest"
          icon={<Sparkles className="h-5 w-5" />}
        />
        <ProductRail products={newest} />
      </section>

      {/* ---------------- تخفیف‌دارها ---------------- */}
      {deals.length > 0 && (
        <section className="container-site mt-9">
          <SectionHeader
            title="منتخب با تخفیف"
            subtitle="بهترین قیمت‌ها با تخفیف واقعی"
            href="/products?onSale=1"
            icon={<BadgePercent className="h-5 w-5" />}
            accent
          />
          <ProductRail products={deals} />
        </section>
      )}

      {/* ---------------- پیشنهاد ویژه بر اساس امتیاز ---------------- */}
      {featured.length > 0 && (
        <section className="container-site mt-9">
          <div className="rounded-2xl border border-ink-100 bg-white p-4 shadow-xs sm:p-5">
            <SectionHeader
              title="منتخب سَروا"
              subtitle="محصولاتی که تیم ما پیشنهاد می‌کند"
              href="/products?sort=rating"
              icon={<ShieldCheck className="h-5 w-5" />}
              className="mb-3"
            />
            <div className="product-grid">
              {featured.slice(0, 5).map((p, i) => (
                <FeaturedTile key={p.id} product={p} index={i} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ---------------- برندها ---------------- */}
      {brands.length > 0 && (
        <section className="container-site mt-9">
          <SectionHeader
            title="برندهای محبوب"
            subtitle="از برندهای معتبر و شناخته‌شده خرید کنید"
            href="/brands"
            icon={<Gift className="h-5 w-5" />}
          />
          <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4 lg:grid-cols-8">
            {brands.slice(0, 8).map((b) => (
              <Link
                key={b.id}
                href={`/brands/${b.slug}`}
                className="group flex flex-col items-center gap-2 rounded-2xl border border-ink-100 bg-white p-3 transition-all duration-200 hover:border-brand-200 hover:shadow-soft"
              >
                <span className="relative h-12 w-full">
                  {b.logo ? (
                    <Image
                      src={b.logo}
                      alt={b.name}
                      fill
                      sizes="120px"
                      className="object-contain opacity-80 transition-opacity group-hover:opacity-100"
                    />
                  ) : (
                    <span className="flex h-full items-center justify-center text-sm font-black text-ink-400">
                      {b.name}
                    </span>
                  )}
                </span>
                <span className="text-[11px] font-extrabold text-ink-700">{b.name}</span>
                <span className="text-[10px] font-medium text-ink-400">
                  {toPersianDigits(b.productCount ?? 0)} کالا
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ---------------- درباره سَروا ---------------- */}
      <section className="container-site mt-10">
        <div className="rounded-2xl border border-ink-100 bg-white p-5 shadow-xs sm:p-7">
          <h2 className="text-lg font-black text-ink-900">خرید آنلاین از سَروا؛ ساده، مطمئن، سریع</h2>
          <div className="mt-3 grid gap-4 text-[13px] leading-7 text-ink-500 md:grid-cols-2">
            <p>
              سَروا یک فروشگاه اینترنتی مدرن است که با هدف ساده‌تر کردن خرید آنلاین طراحی شده است. از
              کالای دیجیتال و لوازم خانه تا مد و پوشاک و محصولات زیبایی، همه‌چیز را با ضمانت اصالت،
              قیمت شفاف و ارسال سریع در اختیار شما قرار می‌دهیم.
            </p>
            <p>
              تمام سفارش‌ها پیش از ارسال بررسی می‌شوند و در صورت نارضایتی تا ۷ روز امکان بازگشت کالا
              وجود دارد. تیم پشتیبانی سَروا در تمام ساعات شبانه‌روز آماده پاسخ‌گویی به سؤالات شماست تا
              تجربه‌ای آرام و مطمئن داشته باشید.
            </p>
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            {["ضمانت اصالت کالا", "ارسال رایگان بالای ۵ میلیون تومان", "۷ روز ضمانت بازگشت", "پرداخت امن"].map(
              (t) => (
                <span
                  key={t}
                  className="rounded-lg bg-brand-50 px-3 py-1.5 text-[11px] font-bold text-brand-800"
                >
                  {t}
                </span>
              ),
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

function FeaturedTile({ product, index }: { product: ProductCardDTO; index: number }) {
  return (
    <Link
      href={`/product/${product.slug}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-ink-100 bg-white transition-all hover:border-brand-200 hover:shadow-soft"
    >
      <span className="relative aspect-square bg-ink-50">
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 50vw, 20vw"
          className="object-contain p-3 transition-transform duration-500 group-hover:scale-105"
        />
      </span>
      <span className="flex flex-1 flex-col gap-1 p-3">
        <span className="line-clamp-2 min-h-[2.6em] text-[12px] font-extrabold leading-[1.6] text-ink-800">
          {product.name}
        </span>
        <span className="mt-auto pt-1 text-sm font-black text-brand-700 tabular">
          {formatPrice(product.discountPrice ?? product.price)}
        </span>
      </span>
      <span className="sr-only">{index}</span>
    </Link>
  );
}
