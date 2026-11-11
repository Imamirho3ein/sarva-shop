import type { Metadata } from "next";
import { CatalogListing } from "@/components/catalog/listing";
import { getFacets, listProducts } from "@/lib/services/catalog";
import { parseCatalogParams, toProductQuery } from "@/lib/catalog-params";

export const metadata: Metadata = {
  title: `همه محصولات`,
  description:
    "فهرست کامل محصولات فروشگاه اینترنتی سَروا؛ جستجو و خرید کالای دیجیتال، خانه و آشپزخانه، مد و پوشاک، زیبایی و سلامت با بهترین قیمت.",
};

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ProductsPage({ searchParams }: PageProps) {
  const params = parseCatalogParams(await searchParams);

  const [result, facets] = await Promise.all([
    listProducts(toProductQuery(params, { perPage: 16 })),
    getFacets(),
  ]);

  return (
    <CatalogListing
      basePath="/products"
      title="همه محصولات"
      description="با استفاده از فیلترهای هوشمند، دقیقاً همان کالایی را پیدا کنید که می‌خواهید."
      breadcrumb={[{ label: "همه محصولات" }]}
      params={params}
      result={result}
      facets={facets}
    />
  );
}
