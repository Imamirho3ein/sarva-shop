import type { Metadata } from "next";
import Link from "next/link";
import { BadgePercent, Flame, Timer } from "lucide-react";
import { CatalogListing } from "@/components/catalog/listing";
import { Countdown } from "@/components/home/countdown";
import {
  getFacets,
  getNextSpecialEnd,
  listProducts,
} from "@/lib/services/catalog";
import { parseCatalogParams, toProductQuery } from "@/lib/catalog-params";

export const metadata: Metadata = {
  title: `پیشنهادهای شگفت‌انگیز`,
  description:
    "تخفیف‌های ویژه و پیشنهادهای شگفت‌انگیز فروشگاه سَروا؛ فرصت محدود برای خرید با بهترین قیمت.",
};

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function SpecialOffersPage({ searchParams }: PageProps) {
  const params = parseCatalogParams(await searchParams);

  const [result, facets, endsAt] = await Promise.all([
    listProducts(toProductQuery(params, { onSale: true, perPage: 16 })),
    getFacets(),
    getNextSpecialEnd(),
  ]);

  return (
    <CatalogListing
      basePath="/special-offers"
      title={
        <span className="flex flex-wrap items-center gap-2">
          <Flame className="h-6 w-6 text-accent-500" />
          پیشنهادهای شگفت‌انگیز
        </span>
      }
      description="تخفیف‌های واقعی روی منتخب کالاها؛ فرصت محدود است، پس تا تمام نشده خرید کنید."
      breadcrumb={[{ label: "پیشنهادهای شگفت‌انگیز" }]}
      params={params}
      result={result}
      facets={facets}
      badge={
        <span className="inline-flex items-center gap-1 rounded-lg bg-accent-100 px-2.5 py-1.5 text-[11px] font-extrabold text-accent-700">
          <BadgePercent className="h-3.5 w-3.5" />
          تخفیف ویژه
        </span>
      }
    >
      <div className="mt-3 flex flex-col items-start justify-between gap-3 overflow-hidden rounded-2xl bg-gradient-to-l from-accent-600 via-accent-500 to-accent-400 p-4 text-white shadow-soft sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/15 backdrop-blur">
            <Timer className="h-6 w-6" />
          </span>
          <div>
            <h2 className="text-sm font-black sm:text-base">فرصت محدود تخفیف‌ها</h2>
            <p className="mt-0.5 text-[11px] font-medium text-white/85">
              پس از پایان شمارش معکوس، قیمت‌ها به حالت عادی بازمی‌گردند.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {endsAt ? (
            <Countdown endsAt={endsAt} compact />
          ) : (
            <span className="rounded-lg bg-white/15 px-3 py-1.5 text-[11px] font-bold backdrop-blur">
              پیشنهادهای فعال فروشگاه
            </span>
          )}
          <Link
            href="/products?onSale=1"
            className="hidden h-9 items-center gap-1 rounded-lg bg-white/20 px-3 text-[11px] font-extrabold backdrop-blur transition-colors hover:bg-white/30 sm:flex"
          >
            همه تخفیف‌ها
          </Link>
        </div>
      </div>
    </CatalogListing>
  );
}
