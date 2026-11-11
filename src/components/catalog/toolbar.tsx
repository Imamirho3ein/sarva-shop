"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowDownUp, X } from "lucide-react";
import { Select } from "@/components/ui/select";
import { formatPrice, toPersianDigits } from "@/lib/format";
import { buildCatalogHref, type CatalogParams } from "@/lib/catalog-params";
import type { Facets } from "@/lib/services/catalog";

const SORT_OPTIONS = [
  { value: "newest", label: "جدیدترین" },
  { value: "bestselling", label: "پرفروش‌ترین" },
  { value: "popular", label: "محبوب‌ترین" },
  { value: "cheapest", label: "ارزان‌ترین" },
  { value: "expensive", label: "گران‌ترین" },
  { value: "rating", label: "بالاترین امتیاز" },
  { value: "oldest", label: "قدیمی‌ترین" },
];

type Chip = { key: string; label: string; href: string };

/**
 * نوار مرتب‌سازی و فیلترهای فعال بالای فهرست محصولات.
 */
export function CatalogToolbar({
  total,
  params,
  basePath,
  facets,
}: {
  total: number;
  params: CatalogParams;
  basePath: string;
  facets: Facets;
}) {
  const router = useRouter();
  const brandNames = React.useMemo(
    () => new Map(facets.brands.map((b) => [b.slug, b.name])),
    [facets.brands],
  );

  const chips: Chip[] = [];

  for (const slug of params.brands) {
    chips.push({
      key: `brand-${slug}`,
      label: brandNames.get(slug) ?? slug,
      href: buildCatalogHref(basePath, params, {
        brands: params.brands.filter((b) => b !== slug),
        page: 1,
      }),
    });
  }

  for (const attr of params.attrs) {
    const token = `${attr.key}|${attr.value}`;
    chips.push({
      key: `attr-${token}`,
      label: `${attr.key}: ${attr.value}`,
      href: buildCatalogHref(basePath, params, {
        attrs: params.attrs.filter((a) => `${a.key}|${a.value}` !== token),
        page: 1,
      }),
    });
  }

  if (params.minPrice != null || params.maxPrice != null) {
    const label =
      params.minPrice != null && params.maxPrice != null
        ? `${formatPrice(params.minPrice)} تا ${formatPrice(params.maxPrice)}`
        : params.minPrice != null
          ? `بیش از ${formatPrice(params.minPrice)}`
          : `کمتر از ${formatPrice(params.maxPrice ?? 0)}`;
    chips.push({
      key: "price",
      label,
      href: buildCatalogHref(basePath, params, {
        minPrice: undefined,
        maxPrice: undefined,
        page: 1,
      }),
    });
  }

  if (params.rating != null) {
    chips.push({
      key: "rating",
      label: `امتیاز ${toPersianDigits(params.rating)} ستاره و بیشتر`,
      href: buildCatalogHref(basePath, params, { rating: undefined, page: 1 }),
    });
  }

  if (params.inStock) {
    chips.push({
      key: "inStock",
      label: "فقط کالاهای موجود",
      href: buildCatalogHref(basePath, params, { inStock: false, page: 1 }),
    });
  }

  if (params.onSale) {
    chips.push({
      key: "onSale",
      label: "فقط کالاهای تخفیف‌دار",
      href: buildCatalogHref(basePath, params, { onSale: false, page: 1 }),
    });
  }

  return (
    <div className="rounded-xl border border-ink-100 bg-white p-2.5 shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5">
          <span className="shrink-0 text-[11px] font-bold text-ink-500">
            {toPersianDigits(total)} کالا
          </span>
          {chips.length > 0 && (
            <span className="mx-1 hidden h-4 w-px bg-ink-200 sm:block" aria-hidden />
          )}
          {chips.map((chip) => (
            <Link
              key={chip.key}
              href={chip.href}
              scroll={false}
              className="group inline-flex max-w-56 items-center gap-1 rounded-lg bg-brand-50 px-2 py-1 text-[10px] font-bold text-brand-800 ring-1 ring-inset ring-brand-100 transition-colors hover:bg-brand-100"
              title="حذف این فیلتر"
            >
              <span className="truncate">{chip.label}</span>
              <X className="h-3 w-3 shrink-0 text-brand-500 transition-colors group-hover:text-brand-800" />
            </Link>
          ))}
          {chips.length > 1 && (
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
              className="text-[10px] font-bold text-danger-600 hover:underline"
            >
              حذف همه
            </Link>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          <span className="hidden items-center gap-1 text-[11px] font-bold text-ink-400 sm:flex">
            <ArrowDownUp className="h-3.5 w-3.5" />
            مرتب‌سازی:
          </span>
          <Select
            aria-label="مرتب‌سازی محصولات"
            options={SORT_OPTIONS}
            value={params.sort}
            onChange={(e) => {
              router.push(
                buildCatalogHref(basePath, params, {
                  sort: e.target.value as CatalogParams["sort"],
                  page: 1,
                }),
                { scroll: false },
              );
            }}
            className="h-9 w-36 rounded-lg text-xs"
          />
        </div>
      </div>
    </div>
  );
}
