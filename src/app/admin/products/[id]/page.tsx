import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, ExternalLink } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { ProductForm } from "@/components/admin/product-form";
import { DeleteButton } from "@/components/admin/delete-button";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "ویرایش محصول | پنل مدیریت",
  robots: { index: false, follow: false },
};

type Params = { params: Promise<{ id: string }> };

export default async function AdminEditProductPage({ params }: Params) {
  const { id } = await params;

  const [product, categories, brands] = await Promise.all([
    prisma.product.findUnique({
      where: { id },
      include: { images: { orderBy: { order: "asc" }, take: 1 } },
    }),
    prisma.category.findMany({
      orderBy: [{ order: "asc" }, { name: "asc" }],
      select: { id: true, name: true, parentId: true },
    }),
    prisma.brand.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  if (!product) notFound();

  const categoryOptions = categories.map((category) => {
    const parent = category.parentId
      ? categories.find((c) => c.id === category.parentId)
      : null;
    return {
      value: category.id,
      label: parent ? `${parent.name} / ${category.name}` : category.name,
    };
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-ink-100 bg-white p-4 shadow-xs">
        <div className="min-w-0">
          <h1 className="line-clamp-1 text-base font-black text-ink-900">
            ویرایش: {product.name}
          </h1>
          <p className="mt-1 text-[11px] text-ink-500">
            کد کالا: <span dir="ltr">{product.sku}</span>
          </p>
        </div>
        <div className="flex items-center gap-1">
          <Button asChild variant="ghost" size="sm">
            <Link href={`/product/${product.slug}`} target="_blank">
              <ExternalLink className="h-3.5 w-3.5" />
              مشاهده
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href="/admin/products">
              <ArrowRight className="h-3.5 w-3.5" />
              بازگشت
            </Link>
          </Button>
          <DeleteButton
            endpoint={`/api/admin/products/${product.id}`}
            itemName="محصول"
            redirectTo="/admin/products"
            description="حذف محصول از فروشگاه. اگر محصول در سفارشی استفاده شده باشد، حذف انجام نمی‌شود."
          />
        </div>
      </div>

      <ProductForm
        initial={{
          id: product.id,
          name: product.name,
          slug: product.slug,
          sku: product.sku,
          description: product.description,
          shortDesc: product.shortDesc ?? "",
          price: product.price,
          discountPrice: product.discountPrice,
          stock: product.stock,
          categoryId: product.categoryId,
          brandId: product.brandId,
          warranty: product.warranty,
          isFeatured: product.isFeatured,
          isNew: product.isNew,
          isSpecial: product.isSpecial,
          specialEndsAt: product.specialEndsAt?.toISOString() ?? null,
          image: product.images[0]?.url ?? null,
        }}
        categories={categoryOptions}
        brands={brands.map((b) => ({ value: b.id, label: b.name }))}
      />
    </div>
  );
}
