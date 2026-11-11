import * as React from "react";
import Link from "next/link";
import { SearchX, Sparkles } from "lucide-react";
import { ProductCard } from "@/components/product/product-card";
import { ProductFilters } from "@/components/catalog/filters";
import { CatalogToolbar } from "@/components/catalog/toolbar";
import { Pagination } from "@/components/ui/pagination";
import { Breadcrumb, type Crumb } from "@/components/ui/breadcrumb";
import { EmptyState } from "@/components/ui/misc";
import { Button } from "@/components/ui/button";
import { toPersianDigits } from "@/lib/format";
import { buildCatalogHref, buildCatalogPageHref, type CatalogParams } from "@/lib/catalog-params";
import type { Facets } from "@/lib/services/catalog";
import type { ProductCardDTO } from "@/types";

export type CatalogResult = {
  items: ProductCardDTO[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
};

/**
 * نمای مشترک فهرست محصولات: عنوان، فیلترها، مرتب‌سازی، شبکه محصولات و صفحه‌بندی.
 * در همه صفحات فهرست (محصولات، جستجو، دسته، برند و پیشنهادها) استفاده می‌شود.
 */
export function CatalogListing({
  basePath,
  title,
  description,
  breadcrumb,
  params,
  result,
  facets,
  badge,
  children,
  emptyTitle,
  emptyDescription,
}: {
  basePath: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  breadcrumb?: Crumb[];
  params: CatalogParams;
  result: CatalogResult;
  facets: Facets;
  badge?: React.ReactNode;
  children?: React.ReactNode;
  emptyTitle?: string;
  emptyDescription?: string;
}) {
  const hasFilters =
    params.brands.length > 0 ||
    params.attrs.length > 0 ||
    params.minPrice != null ||
    params.maxPrice != null ||
    params.rating != null ||
    params.inStock ||
    params.onSale;

  const hrefBase = buildCatalogPageHref(basePath, params);

  return (
    <div className="container-site py-4 lg:py-6">
      {/* سربرگ */}
      <div className="rounded-2xl border border-ink-100 bg-white px-4 py-3.5 shadow-xs sm:px-5">
        {breadcrumb && breadcrumb.length > 0 && <Breadcrumb items={breadcrumb} />}
        <div className="mt-2.5 flex flex-wrap items-end justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-xl font-black leading-8 text-ink-900 sm:text-2xl">{title}</h1>
            {description && (
              <p className="mt-1 max-w-3xl text-[12px] leading-6 text-ink-500 sm:text-[13px]">
                {description}
              </p>
            )}
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {badge}
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-ink-50 px-3 py-1.5 text-[11px] font-extrabold text-ink-600">
              <Sparkles className="h-3.5 w-3.5 text-brand-600" />
              {toPersianDigits(result.total)} کالا
            </span>
          </div>
        </div>
      </div>

      {children}

      {/* بدنه */}
      <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-start">
        <ProductFilters
          facets={facets}
          params={params}
          basePath={basePath}
          total={result.total}
        />

        <div className="min-w-0 flex-1">
          <CatalogToolbar
            total={result.total}
            params={params}
            basePath={basePath}
            facets={facets}
          />

          {result.items.length > 0 ? (
            <>
              <div className="mt-3 grid grid-cols-2 gap-2.5 sm:gap-3 md:grid-cols-3 xl:grid-cols-4">
                {result.items.map((product, i) => (
                  <ProductCard key={product.id} product={product} index={i} />
                ))}
              </div>

              <Pagination
                page={result.page}
                totalPages={result.totalPages}
                hrefBase={hrefBase}
                className="mt-7"
              />

              <p className="mt-3 text-center text-[11px] font-medium text-ink-400">
                نمایش {toPersianDigits((result.page - 1) * result.perPage + 1)} تا{" "}
                {toPersianDigits(Math.min(result.page * result.perPage, result.total))} از{" "}
                {toPersianDigits(result.total)} کالا
              </p>
            </>
          ) : (
            <div className="mt-3">
              <EmptyState
                icon={<SearchX className="h-7 w-7" />}
                title={emptyTitle ?? "کالایی با این مشخصات پیدا نشد"}
                description={
                  emptyDescription ??
                  "فیلترها را تغییر دهید یا عبارت دیگری جستجو کنید. می‌توانید همه فیلترها را حذف کنید و دوباره امتحان کنید."
                }
                action={
                  <div className="flex flex-wrap items-center justify-center gap-2">
                    {hasFilters && (
                      <Button asChild>
                        <Link
                          href={buildCatalogHref(basePath, {
                            ...params,
                            brands: [],
                            attrs: [],
                            minPrice: undefined,
                            maxPrice: undefined,
                            rating: undefined,
                            inStock: false,
                            onSale: false,
                            page: 1,
                          })}
                          scroll={false}
                        >
                          حذف همه فیلترها
                        </Link>
                      </Button>
                    )}
                    <Button asChild variant="outline">
                      <Link href="/products">مشاهده همه محصولات</Link>
                    </Button>
                  </div>
                }
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
