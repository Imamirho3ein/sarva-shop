import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { LayoutGrid } from "lucide-react";
import { CatalogListing } from "@/components/catalog/listing";
import { CategoryIcon } from "@/components/ui/category-icon";
import { getCategoryBySlug, listProducts } from "@/lib/services/catalog";
import { parseCatalogParams, toProductQuery } from "@/lib/catalog-params";
import { toPersianDigits } from "@/lib/format";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) return { title: "دسته‌بندی یافت نشد" };

  return {
    title: `${category.name}`,
    description:
      category.description ??
      `خرید آنلاین ${category.name} از فروشگاه اینترنتی سَروا با ضمانت اصالت، ارسال سریع و بهترین قیمت.`,
  };
}

export default async function CategoryPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) notFound();

  const catalogParams = parseCatalogParams(await searchParams);

  const result = await listProducts(
    toProductQuery(catalogParams, {
      categoryIds: category.childrenIds,
      perPage: 16,
    }),
  );

  const facets = {
    brands: category.brands,
    priceRange: category.priceRange,
    attributes: category.attributes,
  };

  const breadcrumb = [
    ...(category.parent
      ? [{ label: category.parent.name, href: `/category/${category.parent.slug}` }]
      : []),
    { label: category.name },
  ];

  return (
    <CatalogListing
      basePath={`/category/${category.slug}`}
      title={category.name}
      description={
        category.description ??
        `خرید ${category.name} با ضمانت اصالت کالا، ارسال سریع و امکان بازگشت تا ۷ روز.`
      }
      breadcrumb={breadcrumb}
      params={catalogParams}
      result={result}
      facets={facets}
    >
      {(category.parent || category.children.length > 0) && (
        <div className="no-scrollbar mt-3 flex items-center gap-2 overflow-x-auto rounded-2xl border border-ink-100 bg-white p-2.5 shadow-xs">
          {category.parent && (
            <Link
              href={`/category/${category.parent.slug}`}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] font-bold text-ink-600 transition-colors hover:bg-ink-50 hover:text-brand-800"
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              همه {category.parent.name}
            </Link>
          )}
          <Link
            href={`/category/${category.slug}`}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-brand-50 px-2.5 py-1.5 text-[11px] font-extrabold text-brand-800 ring-1 ring-inset ring-brand-100"
          >
            <CategoryIcon name={category.icon} className="h-3.5 w-3.5" />
            همه {category.name}
            <span className="text-[10px] font-bold text-brand-600">
              {toPersianDigits(category.productCount)}
            </span>
          </Link>
          {category.children.map((child) => (
            <Link
              key={child.id}
              href={`/category/${child.slug}`}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] font-bold text-ink-600 transition-colors hover:bg-ink-50 hover:text-brand-800"
            >
              <CategoryIcon name={child.icon} className="h-3.5 w-3.5 text-ink-400" />
              {child.name}
            </Link>
          ))}
        </div>
      )}
    </CatalogListing>
  );
}
