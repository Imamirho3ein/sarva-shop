import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { ProductForm } from "@/components/admin/product-form";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "محصول جدید | پنل مدیریت",
  robots: { index: false, follow: false },
};

export default async function AdminNewProductPage() {
  const [categories, brands] = await Promise.all([
    prisma.category.findMany({
      orderBy: [{ order: "asc" }, { name: "asc" }],
      select: { id: true, name: true, parentId: true },
    }),
    prisma.brand.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);

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
        <div>
          <h1 className="text-base font-black text-ink-900">محصول جدید</h1>
          <p className="mt-1 text-[11px] text-ink-500">
            اطلاعات محصول را وارد کنید؛ نامک و تصویر شاخص اختیاری است.
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href="/admin/products">
              <ArrowRight className="h-3.5 w-3.5" />
              بازگشت
            </Link>
          </Button>
          <Button asChild size="sm" variant="ghost">
            <Link href="/admin/inventory">
              <Plus className="h-4 w-4" />
              مدیریت انبار
            </Link>
          </Button>
        </div>
      </div>

      <ProductForm categories={categoryOptions} brands={brands.map((b) => ({ value: b.id, label: b.name }))} />
    </div>
  );
}
