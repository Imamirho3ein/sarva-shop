import type { Metadata } from "next";
import Link from "next/link";
import {
  BadgePercent,
  Building2,
  FolderTree,
  Heart,
  Home,
  Info,
  LayoutGrid,
  Map,
  MessageCircleQuestion,
  Package,
  Scale,
  ScrollText,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Store,
  Tags,
  UserRound,
} from "lucide-react";
import { PageHeader } from "@/components/content/page-header";
import { getAllBrands, getAllCategories } from "@/lib/services/catalog";
import { SITE_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: "نقشه سایت",
  description:
    "فهرست همه صفحات فروشگاه سَروا: دسته‌بندی‌ها، برندها، محصولات ویژه، حساب کاربری و صفحات راهنما و قوانین.",
};

const MAIN_LINKS = [
  { href: "/", label: "صفحه اصلی", icon: Home },
  { href: "/categories", label: "همه دسته‌بندی‌ها", icon: LayoutGrid },
  { href: "/products", label: "همه محصولات", icon: Package },
  { href: "/special-offers", label: "پیشنهادهای شگفت‌انگیز", icon: Sparkles },
  { href: "/brands", label: "برندها", icon: Tags },
  { href: "/compare", label: "مقایسه محصولات", icon: Scale },
  { href: "/cart", label: "سبد خرید", icon: ShoppingBag },
];

const ACCOUNT_LINKS = [
  { href: "/account", label: "پیشخوان حساب", icon: UserRound },
  { href: "/account/orders", label: "سفارش‌های من", icon: ShoppingBag },
  { href: "/account/addresses", label: "آدرس‌ها", icon: Store },
  { href: "/account/wishlist", label: "علاقه‌مندی‌ها", icon: Heart },
  { href: "/login", label: "ورود", icon: ShieldCheck },
  { href: "/register", label: "ثبت‌نام", icon: UserRound },
];

const HELP_LINKS = [
  { href: "/about", label: "درباره سَروا", icon: Info },
  { href: "/contact", label: "تماس با ما", icon: MessageCircleQuestion },
  { href: "/faq", label: "پرسش‌های متداول", icon: MessageCircleQuestion },
  { href: "/shipping", label: "روش‌های ارسال", icon: Package },
  { href: "/returns", label: "شرایط بازگشت کالا", icon: BadgePercent },
  { href: "/careers", label: "فرصت‌های شغلی", icon: Building2 },
  { href: "/partners", label: "همکاری با ما", icon: Building2 },
  { href: "/affiliate", label: "همکاری در فروش", icon: BadgePercent },
  { href: "/terms", label: "قوانین و مقررات", icon: ScrollText },
  { href: "/privacy", label: "حریم خصوصی", icon: ShieldCheck },
  { href: "/disclaimer", label: "سلب مسئولیت", icon: ScrollText },
];

export default async function SitemapPage() {
  let categories: { id: string; name: string; slug: string }[] = [];
  let brands: { id: string; name: string; slug: string }[] = [];

  try {
    const [categoryList, brandList] = await Promise.all([
      getAllCategories(),
      getAllBrands(),
    ]);
    categories = categoryList.map((category) => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
    }));
    brands = brandList.map((brand) => ({
      id: brand.id,
      name: brand.name,
      slug: brand.slug,
    }));
  } catch {
    // پایگاه داده در دسترس نیست؛ فهرست صفحات ثابت نمایش داده می‌شود.
  }

  return (
    <div className="container-site space-y-4 py-4 lg:py-6">
      <PageHeader
        eyebrow="راهنمای سایت"
        title="نقشه سایت"
        description={`همه مسیرهای مهم ${SITE_NAME} در یک صفحه؛ از دسته‌بندی محصولات تا صفحات قوانین و پشتیبانی.`}
        crumbs={[{ label: "نقشه سایت" }]}
        icon={<Map className="h-6 w-6" />}
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <section className="rounded-2xl border border-ink-100 bg-white p-4 shadow-xs">
          <h2 className="flex items-center gap-1.5 text-sm font-black text-ink-900">
            <Home className="h-4 w-4 text-brand-700" />
            صفحات اصلی
          </h2>
          <ul className="mt-3 grid gap-1">
            {MAIN_LINKS.map((link) => {
              const Icon = link.icon;
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-[11px] font-medium text-ink-600 hover:bg-brand-50 hover:text-brand-800"
                  >
                    <Icon className="h-3.5 w-3.5 text-ink-400" />
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>

        <section className="rounded-2xl border border-ink-100 bg-white p-4 shadow-xs">
          <h2 className="flex items-center gap-1.5 text-sm font-black text-ink-900">
            <FolderTree className="h-4 w-4 text-brand-700" />
            دسته‌بندی‌ها
          </h2>
          {categories.length === 0 ? (
            <p className="mt-3 text-[11px] text-ink-400">دسته‌بندی فعالی ثبت نشده است.</p>
          ) : (
            <ul className="mt-3 grid gap-1">
              {categories.map((category) => (
                <li key={category.id}>
                  <Link
                    href={`/category/${category.slug}`}
                    className="flex items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-[11px] font-medium text-ink-600 hover:bg-brand-50 hover:text-brand-800"
                  >
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
          )}
          <Link
            href="/categories"
            className="mt-2 inline-block text-[10px] font-bold text-brand-700 hover:underline"
          >
            مشاهده همه دسته‌بندی‌ها
          </Link>
        </section>

        <section className="rounded-2xl border border-ink-100 bg-white p-4 shadow-xs">
          <h2 className="flex items-center gap-1.5 text-sm font-black text-ink-900">
            <Tags className="h-4 w-4 text-brand-700" />
            برندها
          </h2>
          {brands.length === 0 ? (
            <p className="mt-3 text-[11px] text-ink-400">برندی ثبت نشده است.</p>
          ) : (
            <ul className="mt-3 grid gap-1">
              {brands.slice(0, 18).map((brand) => (
                <li key={brand.id}>
                  <Link
                    href={`/brands/${brand.slug}`}
                    className="flex items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-[11px] font-medium text-ink-600 hover:bg-brand-50 hover:text-brand-800"
                  >
                    {brand.name}
                  </Link>
                </li>
              ))}
            </ul>
          )}
          <Link
            href="/brands"
            className="mt-2 inline-block text-[10px] font-bold text-brand-700 hover:underline"
          >
            مشاهده همه برندها
          </Link>
        </section>

        <section className="rounded-2xl border border-ink-100 bg-white p-4 shadow-xs">
          <h2 className="flex items-center gap-1.5 text-sm font-black text-ink-900">
            <UserRound className="h-4 w-4 text-brand-700" />
            حساب کاربری
          </h2>
          <ul className="mt-3 grid gap-1">
            {ACCOUNT_LINKS.map((link) => {
              const Icon = link.icon;
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-[11px] font-medium text-ink-600 hover:bg-brand-50 hover:text-brand-800"
                  >
                    <Icon className="h-3.5 w-3.5 text-ink-400" />
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>

        <section className="rounded-2xl border border-ink-100 bg-white p-4 shadow-xs md:col-span-2 xl:col-span-2">
          <h2 className="flex items-center gap-1.5 text-sm font-black text-ink-900">
            <Info className="h-4 w-4 text-brand-700" />
            راهنما، همکاری و قوانین
          </h2>
          <ul className="mt-3 grid gap-1 sm:grid-cols-2">
            {HELP_LINKS.map((link) => {
              const Icon = link.icon;
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-[11px] font-medium text-ink-600 hover:bg-brand-50 hover:text-brand-800"
                  >
                    <Icon className="h-3.5 w-3.5 text-ink-400" />
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      </div>

      <p className="rounded-2xl border border-ink-100 bg-ink-50/60 px-4 py-3 text-[10px] leading-6 text-ink-500">
        این صفحه برای راهنمایی کاربران است. نسخه ماشین‌خوان نقشه سایت از مسیر{" "}
        <Link href="/sitemap.xml" className="font-bold text-brand-700 hover:underline">
          sitemap.xml
        </Link>{" "}
        در دسترس موتورهای جستجو قرار می‌گیرد.
      </p>
    </div>
  );
}
