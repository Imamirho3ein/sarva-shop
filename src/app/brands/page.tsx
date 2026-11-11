import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Award, Globe2, PackageSearch } from "lucide-react";
import { getAllBrands } from "@/lib/services/catalog";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { EmptyState } from "@/components/ui/misc";
import { toPersianDigits } from "@/lib/format";

export const metadata: Metadata = {
  title: `برندها`,
  description:
    "همه برندهای معتبر و محبوب فروشگاه سَروا؛ از کالای دیجیتال و لوازم خانه تا مد و پوشاک و زیبایی.",
};

export const dynamic = "force-dynamic";

export default async function BrandsPage() {
  const brands = await getAllBrands();

  return (
    <div className="container-site py-4 lg:py-6">
      <div className="rounded-2xl border border-ink-100 bg-white px-4 py-4 shadow-xs sm:px-5">
        <Breadcrumb items={[{ label: "برندها" }]} />
        <div className="mt-2.5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-xl font-black text-ink-900 sm:text-2xl">برندهای سَروا</h1>
            <p className="mt-1 max-w-3xl text-[12px] leading-6 text-ink-500 sm:text-[13px]">
              از برندهای معتبر و شناخته‌شده خرید کنید؛ همه کالاها با ضمانت اصالت و گارانتی معتبر
              عرضه می‌شوند.
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-lg bg-brand-50 px-3 py-1.5 text-[11px] font-extrabold text-brand-800">
            <Award className="h-3.5 w-3.5" />
            {toPersianDigits(brands.length)} برند فعال
          </span>
        </div>
      </div>

      {brands.length === 0 ? (
        <div className="mt-4">
          <EmptyState
            icon={<PackageSearch className="h-7 w-7" />}
            title="برندی ثبت نشده است"
            description="هنوز برندی در فروشگاه ثبت نشده است. لطفاً بعداً دوباره سر بزنید."
          />
        </div>
      ) : (
        <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3 md:grid-cols-4 xl:grid-cols-6">
          {brands.map((brand) => (
            <Link
              key={brand.id}
              href={`/brands/${brand.slug}`}
              className="group flex flex-col items-center gap-3 rounded-2xl border border-ink-100 bg-white p-4 text-center shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-card"
            >
              <span className="relative flex h-16 w-full items-center justify-center rounded-xl bg-ink-50 p-3">
                {brand.logo ? (
                  <Image
                    src={brand.logo}
                    alt={brand.name}
                    fill
                    sizes="140px"
                    className="object-contain p-3 opacity-80 transition-opacity group-hover:opacity-100"
                  />
                ) : (
                  <span className="text-base font-black text-ink-400">{brand.name}</span>
                )}
              </span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-extrabold text-ink-800 group-hover:text-brand-800">
                  {brand.name}
                </span>
                <span className="mt-1 flex items-center justify-center gap-2 text-[10px] font-medium text-ink-400">
                  <span>{toPersianDigits(brand.productCount ?? 0)} کالا</span>
                  {brand.country && (
                    <>
                      <span className="h-2.5 w-px bg-ink-200" aria-hidden />
                      <span className="inline-flex items-center gap-0.5">
                        <Globe2 className="h-3 w-3" />
                        {brand.country}
                      </span>
                    </>
                  )}
                </span>
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
