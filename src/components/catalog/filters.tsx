"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, RotateCcw, SlidersHorizontal, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatPrice, toPersianDigits } from "@/lib/format";
import { Checkbox, Switch } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Facets } from "@/lib/services/catalog";
import type { CatalogParams } from "@/lib/catalog-params";
import { buildCatalogHref } from "@/lib/catalog-params";

type Props = {
  facets: Facets;
  params: CatalogParams;
  basePath: string;
  total: number;
};

/**
 * فیلترهای پیشرفته فهرست محصولات — تغییر پارامترهای URL بدون رفرش.
 */
export function ProductFilters({ facets, params, basePath, total }: Props) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [minPrice, setMinPrice] = React.useState(params.minPrice ? String(params.minPrice) : "");
  const [maxPrice, setMaxPrice] = React.useState(params.maxPrice ? String(params.maxPrice) : "");

  React.useEffect(() => {
    setMinPrice(params.minPrice ? String(params.minPrice) : "");
    setMaxPrice(params.maxPrice ? String(params.maxPrice) : "");
  }, [params.minPrice, params.maxPrice]);

  const go = (overrides: Partial<CatalogParams>) => {
    router.push(buildCatalogHref(basePath, params, { ...overrides, page: 1 }), { scroll: false });
  };

  const toggleArray = (key: "brands" | "attrs", value: string | { key: string; value: string }, checked: boolean) => {
    if (key === "brands") {
      const v = value as string;
      const next = checked
        ? Array.from(new Set([...params.brands, v]))
        : params.brands.filter((b) => b !== v);
      go({ brands: next });
      return;
    }
    const a = value as { key: string; value: string };
    const token = `${a.key}|${a.value}`;
    const exists = params.attrs.some((x) => `${x.key}|${x.value}` === token);
    const next = checked
      ? exists
        ? params.attrs
        : [...params.attrs, a]
      : params.attrs.filter((x) => `${x.key}|${x.value}` !== token);
    go({ attrs: next });
  };

  const applyPrice = () => {
    const min = minPrice ? Number(minPrice.replace(/[^\d]/g, "")) : undefined;
    const max = maxPrice ? Number(maxPrice.replace(/[^\d]/g, "")) : undefined;
    go({ minPrice: min, maxPrice: max });
  };

  const hasFilters =
    params.brands.length > 0 ||
    params.attrs.length > 0 ||
    params.minPrice != null ||
    params.maxPrice != null ||
    params.rating != null ||
    params.inStock ||
    params.onSale;

  const reset = () => {
    router.push(buildCatalogHref(basePath, { ...params, brands: [], attrs: [], minPrice: undefined, maxPrice: undefined, rating: undefined, inStock: false, onSale: false, page: 1 }), {
      scroll: false,
    });
  };

  const content = (
    <div className="space-y-1">
      <div className="flex items-center justify-between gap-2 border-b border-ink-100 pb-3">
        <span className="flex items-center gap-1.5 text-sm font-black text-ink-900">
          <SlidersHorizontal className="h-4 w-4 text-brand-700" />
          فیلترها
        </span>
        {hasFilters && (
          <button
            type="button"
            onClick={reset}
            className="flex items-center gap-1 text-[11px] font-bold text-danger-600 hover:underline"
          >
            <RotateCcw className="h-3 w-3" />
            حذف همه
          </button>
        )}
      </div>

      {/* دسترسی‌ها */}
      <FilterGroup title="ویژگی‌ها">
        <div className="space-y-2.5">
          <Switch
            label="فقط کالاهای موجود"
            checked={params.inStock}
            onChange={(e) => go({ inStock: e.target.checked })}
          />
          <Switch
            label="فقط کالاهای تخفیف‌دار"
            checked={params.onSale}
            onChange={(e) => go({ onSale: e.target.checked })}
          />
        </div>
      </FilterGroup>

      {/* قیمت */}
      <FilterGroup title="محدوده قیمت (تومان)">
        <div className="space-y-2.5">
          <div className="flex items-center gap-2">
            <Input
              inputMode="numeric"
              placeholder={`از ${formatPrice(facets.priceRange.min, { unit: false })}`}
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              aria-label="حداقل قیمت"
              className="h-9 text-xs"
            />
            <span className="text-ink-300">—</span>
            <Input
              inputMode="numeric"
              placeholder={`تا ${formatPrice(facets.priceRange.max, { unit: false })}`}
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              aria-label="حداکثر قیمت"
              className="h-9 text-xs"
            />
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] font-medium text-ink-400">
              {formatPrice(facets.priceRange.min)} تا {formatPrice(facets.priceRange.max)}
            </span>
            <Button size="sm" type="button" onClick={applyPrice} className="h-8 px-3 text-[11px]">
              اعمال
            </Button>
          </div>
        </div>
      </FilterGroup>

      {/* امتیاز */}
      <FilterGroup title="امتیاز کاربران">
        <div className="space-y-1">
          {[4, 3, 2].map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => go({ rating: params.rating === r ? undefined : r })}
              className={cn(
                "flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-xs font-bold transition-colors",
                params.rating === r
                  ? "bg-brand-50 text-brand-800"
                  : "text-ink-600 hover:bg-ink-50",
              )}
            >
              <span className="flex items-center gap-1.5">
                <span className="text-warning-500">★</span>
                {toPersianDigits(r)} ستاره و بیشتر
              </span>
              {params.rating === r && <span className="text-brand-700">✓</span>}
            </button>
          ))}
        </div>
      </FilterGroup>

      {/* برندها */}
      {facets.brands.length > 0 && (
        <FilterGroup title="برند" defaultOpen>
          <div className="max-h-52 space-y-2 overflow-y-auto pl-1">
            {facets.brands.map((b) => (
              <div key={b.id} className="flex items-center justify-between gap-2">
                <Checkbox
                  label={<span className="text-xs">{b.name}</span>}
                  checked={params.brands.includes(b.slug)}
                  onChange={(e) => toggleArray("brands", b.slug, e.target.checked)}
                />
                <span className="text-[10px] font-bold text-ink-400 tabular">
                  {toPersianDigits(b.productCount)}
                </span>
              </div>
            ))}
          </div>
        </FilterGroup>
      )}

      {/* ویژگی‌ها */}
      {facets.attributes.map((group) => (
        <FilterGroup key={group.key} title={group.key}>
          <div className="space-y-2">
            {group.values.map((v) => {
              const checked = params.attrs.some((a) => a.key === group.key && a.value === v);
              return (
                <Checkbox
                  key={v}
                  label={<span className="text-xs">{v}</span>}
                  checked={checked}
                  onChange={(e) => toggleArray("attrs", { key: group.key, value: v }, e.target.checked)}
                />
              );
            })}
          </div>
        </FilterGroup>
      ))}
    </div>
  );

  return (
    <>
      {/* موبایل */}
      <div className="lg:hidden">
        <Button
          type="button"
          variant="outline"
          onClick={() => setOpen(true)}
          className="w-full justify-between"
        >
          <span className="flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4" />
            فیلترها
            {hasFilters && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-700 px-1 text-[10px] text-white">
                {toPersianDigits(
                  params.brands.length +
                    params.attrs.length +
                    (params.minPrice != null || params.maxPrice != null ? 1 : 0) +
                    (params.rating != null ? 1 : 0) +
                    (params.inStock ? 1 : 0) +
                    (params.onSale ? 1 : 0),
                )}
              </span>
            )}
          </span>
          <span className="text-xs text-ink-400">{toPersianDigits(total)} کالا</span>
        </Button>

        {open && (
          <div className="fixed inset-0 z-[70] flex">
            <div
              className="absolute inset-0 bg-ink-950/50 backdrop-blur-sm"
              onClick={() => setOpen(false)}
            />
            <div className="relative mr-auto flex h-full w-[min(22rem,88vw)] flex-col bg-white shadow-pop">
              <div className="flex items-center justify-between border-b border-ink-100 p-4">
                <span className="text-sm font-black text-ink-900">فیلترها</span>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-lg p-1.5 text-ink-500 hover:bg-ink-100"
                  aria-label="بستن"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4">{content}</div>
              <div className="border-t border-ink-100 p-4">
                <Button type="button" className="w-full" onClick={() => setOpen(false)}>
                  نمایش {toPersianDigits(total)} کالا
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* دسکتاپ */}
      <aside className="hidden w-64 shrink-0 lg:block">
        <div className="sticky top-36 rounded-2xl border border-ink-100 bg-white p-4 shadow-xs">
          {content}
        </div>
      </aside>
    </>
  );
}

function FilterGroup({
  title,
  children,
  defaultOpen = false,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  return (
    <details className="group border-b border-ink-100 py-3 last:border-b-0" open={defaultOpen}>
      <summary className="flex cursor-pointer list-none items-center justify-between text-[13px] font-extrabold text-ink-800 [&::-webkit-details-marker]:hidden">
        {title}
        <ChevronDown className="h-4 w-4 text-ink-400 transition-transform group-open:rotate-180" />
      </summary>
      <div className="pt-3">{children}</div>
    </details>
  );
}
