import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Search } from "lucide-react";
import { CatalogListing } from "@/components/catalog/listing";
import { getFacets, listProducts } from "@/lib/services/catalog";
import { parseCatalogParams, toProductQuery } from "@/lib/catalog-params";

export const metadata: Metadata = {
  title: `جستجوی محصولات`,
  robots: { index: false, follow: true },
};

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function SearchPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const params = parseCatalogParams(sp);

  if (!params.q) redirect("/products");

  const [result, facets] = await Promise.all([
    listProducts(toProductQuery(params, { perPage: 16 })),
    getFacets(),
  ]);

  return (
    <CatalogListing
      basePath="/search"
      title={
        <span className="flex flex-wrap items-center gap-2">
          <Search className="h-5 w-5 text-brand-700" />
          نتایج جستجو برای «{params.q}»
        </span>
      }
      description="نتایج بر اساس ارتباط با عبارت جستجو، محبوبیت و موجودی مرتب شده‌اند."
      breadcrumb={[{ label: "جستجو" }, { label: params.q }]}
      params={params}
      result={result}
      facets={facets}
      emptyTitle="نتیجه‌ای برای جستجوی شما پیدا نشد"
      emptyDescription="املای عبارت را بررسی کنید یا از کلمات کلی‌تر استفاده کنید. همچنین می‌توانید فیلترها را حذف کنید."
    />
  );
}
