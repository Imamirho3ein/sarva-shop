import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { BadgeCheck, Globe2, PackageSearch } from "lucide-react";
import { CatalogListing } from "@/components/catalog/listing";
import { getBrandBySlug, getFacets, listProducts } from "@/lib/services/catalog";
import { parseCatalogParams, toProductQuery } from "@/lib/catalog-params";
import { toPersianDigits } from "@/lib/format";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const brand = await getBrandBySlug(slug);
  if (!brand) return { title: "برند یافت نشد" };

  return {
    title: `محصولات ${brand.name}`,
    description:
      brand.description ??
      `خرید محصولات ${brand.name} از فروشگاه اینترنتی سَروا با ضمانت اصالت و ارسال سریع.`,
  };
}

export default async function BrandPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const brand = await getBrandBySlug(slug);
  if (!brand) notFound();

  const catalogParams = parseCatalogParams(await searchParams);

  const [result, globalFacets] = await Promise.all([
    listProducts(
      toProductQuery(catalogParams, {
        brands: [brand.slug],
        perPage: 16,
      }),
    ),
    getFacets(),
  ]);

  // در صفحه برند، فیلتر برند معنا ندارد؛ بقیه فیلترها حفظ می‌شوند.
  const facets = { ...globalFacets, brands: [] };

  return (
    <CatalogListing
      basePath={`/brands/${brand.slug}`}
      title={
        <span className="flex flex-wrap items-center gap-2">
          <PackageSearch className="h-5 w-5 text-brand-700" />
          محصولات {brand.name}
        </span>
      }
      description={
        brand.description ??
        `همه محصولات ${brand.name} با گارانتی معتبر، ضمانت اصالت و امکان بازگشت تا ۷ روز.`
      }
      breadcrumb={[{ label: "برندها", href: "/brands" }, { label: brand.name }]}
      params={catalogParams}
      result={result}
      facets={facets}
    >
      <div className="mt-3 flex flex-col items-start gap-4 rounded-2xl border border-ink-100 bg-white p-4 shadow-xs sm:flex-row sm:items-center">
        <span className="relative flex h-20 w-20 shrink-0 items-center justify-center rounded-xl bg-ink-50 p-2.5">
          {brand.logo ? (
            <Image
              src={brand.logo}
              alt={brand.name}
              fill
              sizes="80px"
              className="object-contain p-2.5"
            />
          ) : (
            <span className="text-sm font-black text-ink-400">{brand.name}</span>
          )}
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="flex items-center gap-1.5 text-base font-black text-ink-900">
            {brand.name}
            {brand.isPopular && (
              <BadgeCheck className="h-4 w-4 text-brand-600" strokeWidth={2.4} />
            )}
          </h2>
          <p className="mt-1 line-clamp-2 text-[12px] leading-6 text-ink-500">
            {brand.description ?? `فروشگاه سَروا نماینده فروش محصولات ${brand.name} است.`}
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {brand.country && (
            <span className="inline-flex items-center gap-1 rounded-lg bg-ink-50 px-2.5 py-1.5 text-[11px] font-bold text-ink-600">
              <Globe2 className="h-3.5 w-3.5" />
              {brand.country}
            </span>
          )}
          <span className="inline-flex items-center gap-1 rounded-lg bg-brand-50 px-2.5 py-1.5 text-[11px] font-extrabold text-brand-800">
            {toPersianDigits(brand._count.products)} کالا
          </span>
        </div>
      </div>
    </CatalogListing>
  );
}
