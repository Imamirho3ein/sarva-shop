import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MessageSquare, ShieldCheck, Sparkles } from "lucide-react";
import { ProductGallery } from "@/components/product/product-gallery";
import { PurchasePanel } from "@/components/product/purchase-panel";
import { ProductTabs } from "@/components/product/product-tabs";
import { RecordView } from "@/components/product/record-view";
import { ProductRail } from "@/components/home/product-rail";
import { SectionHeader } from "@/components/ui/section";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { getProductBySlug, incrementProductView } from "@/lib/services/catalog";
import { discountPercent } from "@/lib/utils";
import { formatPrice } from "@/lib/format";
import { SITE_URL } from "@/lib/constants";

export const dynamic = "force-dynamic";

type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "محصول یافت نشد" };

  const description = (product.shortDesc ?? product.description)
    .replace(/\s+/g, " ")
    .slice(0, 160);

  return {
    title: `${product.name}`,
    description,
    openGraph: {
      title: product.name,
      description,
      images: [{ url: product.image }],
      type: "website",
    },
  };
}

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  await incrementProductView(product.id);

  const discount = discountPercent(product.price, product.discountPrice);
  const unitPrice =
    product.discountPrice && product.discountPrice < product.price
      ? product.discountPrice
      : product.price;

  const breadcrumb = [
    ...(product.categoryName && product.categorySlug
      ? [{ label: product.categoryName, href: `/category/${product.categorySlug}` }]
      : []),
    { label: product.name },
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: product.images.map((i) => `${SITE_URL}${i}`),
    description: product.shortDesc ?? product.description.slice(0, 300),
    sku: product.sku,
    brand: product.brandName ? { "@type": "Brand", name: product.brandName } : undefined,
    aggregateRating:
      product.reviewCount > 0
        ? {
            "@type": "AggregateRating",
            ratingValue: product.rating,
            reviewCount: product.reviewCount,
          }
        : undefined,
    offers: {
      "@type": "Offer",
      priceCurrency: "IRR",
      price: unitPrice * 10,
      availability:
        product.stock > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      url: `${SITE_URL}/product/${product.slug}`,
    },
  };

  return (
    <div className="container-site py-4 lg:py-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Breadcrumb items={breadcrumb} className="mb-3" />

      <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,430px)_minmax(0,1fr)] xl:grid-cols-[minmax(0,470px)_minmax(0,1fr)]">
        <div className="lg:sticky lg:top-36">
          <ProductGallery
            images={product.images}
            name={product.name}
            discount={discount}
            isNew={product.isNew}
            isSpecial={product.isSpecial}
          />
        </div>

        <PurchasePanel product={product} />
      </div>

      <ProductTabs product={product} />

      {product.similar.length > 0 && (
        <section className="mt-8">
          <SectionHeader
            title="محصولات مشابه"
            subtitle="کالاهایی در همین دسته‌بندی که ممکن است بپسندید"
            href={
              product.categorySlug
                ? `/category/${product.categorySlug}?sort=bestselling`
                : "/products"
            }
            icon={<Sparkles className="h-5 w-5" />}
          />
          <ProductRail products={product.similar} />
        </section>
      )}

      {product.related.length > 0 && (
        <section className="mt-8">
          <SectionHeader
            title="محصولات مرتبط"
            subtitle="پیشنهادهایی بر اساس برند و بازدید کاربران"
            href="/products?sort=popular"
            icon={<ShieldCheck className="h-5 w-5" />}
          />
          <ProductRail products={product.related} />
        </section>
      )}

      <section className="mt-8 rounded-2xl border border-brand-100 bg-brand-50/50 p-4 sm:p-5">
        <h2 className="flex items-center gap-2 text-sm font-black text-brand-900">
          <MessageSquare className="h-4.5 w-4.5" />
          خرید مطمئن از سَروا
        </h2>
        <p className="mt-1.5 max-w-4xl text-[12px] leading-6 text-brand-900/70">
          قیمت این کالا {formatPrice(unitPrice)} است و با ضمانت اصالت، امکان بازگشت تا ۷ روز و
          پشتیبانی ۲۴ ساعته عرضه می‌شود. پیش از خرید، مشخصات فنی و نظرات کاربران را بررسی کنید.
        </p>
      </section>

      <RecordView
        product={{
          id: product.id,
          slug: product.slug,
          name: product.name,
          image: product.image,
          price: product.price,
          discountPrice: product.discountPrice,
          rating: product.rating,
          reviewCount: product.reviewCount,
          stock: product.stock,
        }}
      />
    </div>
  );
}
