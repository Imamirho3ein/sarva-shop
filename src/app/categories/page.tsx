import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, LayoutGrid, PackageSearch } from "lucide-react";
import { getAllCategories } from "@/lib/services/catalog";
import { CategoryIcon } from "@/components/ui/category-icon";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { EmptyState } from "@/components/ui/misc";
import { toPersianDigits } from "@/lib/format";

export const metadata: Metadata = {
  title: `دسته‌بندی‌ها`,
  description:
    "همه دسته‌بندی‌های فروشگاه اینترنتی سَروا؛ کالای دیجیتال، خانه و آشپزخانه، مد و پوشاک، زیبایی و سلامت و بیشتر.",
};

export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  const categories = await getAllCategories();

  return (
    <div className="container-site py-4 lg:py-6">
      <div className="rounded-2xl border border-ink-100 bg-white px-4 py-4 shadow-xs sm:px-5">
        <Breadcrumb items={[{ label: "دسته‌بندی‌ها" }]} />
        <div className="mt-2.5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-xl font-black text-ink-900 sm:text-2xl">دسته‌بندی‌ها</h1>
            <p className="mt-1 max-w-3xl text-[12px] leading-6 text-ink-500 sm:text-[13px]">
              هر چیزی که نیاز دارید، در یک جای درست. برای دیدن محصولات هر دسته روی آن کلیک کنید.
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-lg bg-brand-50 px-3 py-1.5 text-[11px] font-extrabold text-brand-800">
            <LayoutGrid className="h-3.5 w-3.5" />
            {toPersianDigits(categories.length)} دسته اصلی
          </span>
        </div>
      </div>

      {categories.length === 0 ? (
        <div className="mt-4">
          <EmptyState
            icon={<PackageSearch className="h-7 w-7" />}
            title="دسته‌بندی‌ای ثبت نشده است"
            description="هنوز دسته‌بندی‌ای در فروشگاه ثبت نشده است. لطفاً بعداً دوباره سر بزنید."
          />
        </div>
      ) : (
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {categories.map((category) => (
            <div
              key={category.id}
              className="group flex flex-col rounded-2xl border border-ink-100 bg-white p-4 shadow-xs transition-all duration-200 hover:border-brand-200 hover:shadow-card"
            >
              <div className="flex items-start gap-3">
                <Link
                  href={`/category/${category.slug}`}
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-50 to-accent-50 text-brand-700 transition-colors group-hover:from-brand-100"
                >
                  <CategoryIcon name={category.icon} className="h-6 w-6" />
                </Link>
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/category/${category.slug}`}
                    className="block text-sm font-black text-ink-900 transition-colors hover:text-brand-800"
                  >
                    {category.name}
                  </Link>
                  <p className="mt-0.5 line-clamp-2 text-[11px] leading-5 text-ink-500">
                    {category.description ?? `خرید آنلاین ${category.name} از سَروا`}
                  </p>
                </div>
                <span className="shrink-0 rounded-lg bg-ink-50 px-2 py-1 text-[10px] font-bold text-ink-500">
                  {toPersianDigits(category.productCount ?? 0)} کالا
                </span>
              </div>

              {category.children && category.children.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5 border-t border-ink-100 pt-3">
                  {category.children.slice(0, 6).map((child) => (
                    <Link
                      key={child.id}
                      href={`/category/${child.slug}`}
                      className="rounded-lg bg-ink-50 px-2 py-1 text-[10px] font-bold text-ink-600 transition-colors hover:bg-brand-50 hover:text-brand-800"
                    >
                      {child.name}
                    </Link>
                  ))}
                  {category.children.length > 6 && (
                    <Link
                      href={`/category/${category.slug}`}
                      className="inline-flex items-center gap-0.5 rounded-lg px-2 py-1 text-[10px] font-extrabold text-brand-700 hover:underline"
                    >
                      +{toPersianDigits(category.children.length - 6)} مورد
                    </Link>
                  )}
                </div>
              )}

              <Link
                href={`/category/${category.slug}`}
                className="mt-3 inline-flex items-center gap-1 text-[11px] font-extrabold text-brand-700 hover:text-brand-900"
              >
                مشاهده محصولات
                <ArrowLeft className="h-3.5 w-3.5" />
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
