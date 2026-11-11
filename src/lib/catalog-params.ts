import { toEnglishDigits } from "@/lib/format";
import type { ProductQuery } from "@/lib/services/catalog";

export type RawSearchParams = Record<string, string | string[] | undefined>;

function first(v: string | string[] | undefined): string | undefined {
  return Array.isArray(v) ? v[0] : v;
}

function all(v: string | string[] | undefined): string[] {
  if (!v) return [];
  return (Array.isArray(v) ? v : [v]).filter(Boolean);
}

function num(v: string | undefined): number | undefined {
  if (!v) return undefined;
  const n = Number(toEnglishDigits(v).replace(/[^\d.]/g, ""));
  return Number.isFinite(n) ? n : undefined;
}

export type CatalogParams = {
  q?: string;
  brands: string[];
  attrs: { key: string; value: string }[];
  minPrice?: number;
  maxPrice?: number;
  rating?: number;
  inStock: boolean;
  onSale: boolean;
  sort: NonNullable<ProductQuery["sort"]>;
  page: number;
};

const SORTS = ["newest", "oldest", "cheapest", "expensive", "popular", "bestselling", "rating"] as const;

export function parseCatalogParams(sp: RawSearchParams): CatalogParams {
  const sortRaw = first(sp.sort) as CatalogParams["sort"] | undefined;
  const sort = sortRaw && (SORTS as readonly string[]).includes(sortRaw) ? sortRaw : "newest";

  const attrs = all(sp.attr)
    .map((raw) => {
      const idx = raw.indexOf("|");
      if (idx <= 0) return null;
      return { key: raw.slice(0, idx), value: raw.slice(idx + 1) };
    })
    .filter((a): a is { key: string; value: string } => a !== null);

  return {
    q: first(sp.q)?.trim() || undefined,
    brands: all(sp.brand),
    attrs,
    minPrice: num(first(sp.minPrice)),
    maxPrice: num(first(sp.maxPrice)),
    rating: num(first(sp.rating)),
    inStock: first(sp.inStock) === "1",
    onSale: first(sp.onSale) === "1",
    sort,
    page: Math.max(1, num(first(sp.page)) ?? 1),
  };
}

export function toProductQuery(p: CatalogParams, extra: Partial<ProductQuery> = {}): ProductQuery {
  return {
    q: p.q,
    brands: p.brands,
    attributes: p.attrs,
    minPrice: p.minPrice,
    maxPrice: p.maxPrice,
    rating: p.rating,
    inStock: p.inStock,
    onSale: p.onSale,
    sort: p.sort,
    page: p.page,
    ...extra,
  };
}

/** ساخت آدرس با حفظ فیلترهای فعال */
export function buildCatalogHref(
  basePath: string,
  p: CatalogParams,
  overrides: Partial<CatalogParams> & { page?: number } = {},
): string {
  const merged = { ...p, ...overrides };
  const sp = new URLSearchParams();

  if (merged.q) sp.set("q", merged.q);
  for (const b of merged.brands) sp.append("brand", b);
  for (const a of merged.attrs) sp.append("attr", `${a.key}|${a.value}`);
  if (merged.minPrice != null) sp.set("minPrice", String(merged.minPrice));
  if (merged.maxPrice != null) sp.set("maxPrice", String(merged.maxPrice));
  if (merged.rating != null) sp.set("rating", String(merged.rating));
  if (merged.inStock) sp.set("inStock", "1");
  if (merged.onSale) sp.set("onSale", "1");
  if (merged.sort && merged.sort !== "newest") sp.set("sort", merged.sort);
  if (merged.page && merged.page > 1) sp.set("page", String(merged.page));

  const qs = sp.toString();
  return qs ? `${basePath}?${qs}` : basePath;
}

/**
 * آدرس پایه صفحه‌بندی با جای‌نگهدار `{page}`؛ برای استفاده در Server Componentها
 * که نمی‌توانند تابع به کلاینت پاس دهند.
 */
export function buildCatalogPageHref(basePath: string, p: CatalogParams): string {
  const href = buildCatalogHref(basePath, p, { page: 1 });
  return `${href}${href.includes("?") ? "&" : "?"}page={page}`;
}

