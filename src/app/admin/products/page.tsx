import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ExternalLink, Pencil, Plus, Search } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatPrice, toPersianDigits } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/ui/pagination";
import { EmptyState } from "@/components/ui/misc";
import { DeleteButton } from "@/components/admin/delete-button";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "محصولات | پنل مدیریت",
  robots: { index: false, follow: false },
};

const PER_PAGE = 12;

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string; page?: string }>;
}) {
  const params = await searchParams;
  const q = (params.q ?? "").trim();
  const category = params.category ?? "";
  const page = Math.max(1, Number(params.page) || 1);

  const where = {
    ...(q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" as const } },
            { sku: { contains: q, mode: "insensitive" as const } },
          ],
        }
      : {}),
    ...(category ? { categoryId: category } : {}),
  };

  const [products, total, categories] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PER_PAGE,
      take: PER_PAGE,
      include: {
        category: { select: { name: true } },
        brand: { select: { name: true } },
        images: { orderBy: { order: "asc" }, take: 1 },
      },
    }),
    prisma.product.count({ where }),
    prisma.category.findMany({
      orderBy: [{ order: "asc" }, { name: "asc" }],
      select: { id: true, name: true },
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));

  const hrefBase = (() => {
    const query = new URLSearchParams();
    if (q) query.set("q", q);
    if (category) query.set("category", category);
    query.set("page", "{page}");
    return `/admin/products?${query.toString()}`;
  })();

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-ink-100 bg-white p-4 shadow-xs">
        <div>
          <h1 className="text-base font-black text-ink-900">مدیریت محصولات</h1>
          <p className="mt-1 text-[11px] text-ink-500">
            {toPersianDigits(total)} محصول ثبت شده است.
          </p>
        </div>
        <Button asChild size="sm">
          <Link href="/admin/products/new">
            <Plus className="h-4 w-4" />
            محصول جدید
          </Link>
        </Button>
      </div>

      <form className="flex flex-wrap items-center gap-2 rounded-2xl border border-ink-100 bg-white p-3 shadow-xs">
        <div className="relative min-w-48 flex-1">
          <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
          <input
            name="q"
            defaultValue={q}
            placeholder="جستجو بر اساس نام یا SKU…"
            className="h-10 w-full rounded-xl border border-ink-200 bg-white pr-9 pl-3 text-[12px] text-ink-900 placeholder:text-ink-400 focus:border-brand-600 focus:outline-none focus:ring-4 focus:ring-brand-600/10"
          />
        </div>
        <select
          name="category"
          defaultValue={category}
          className="h-10 min-w-40 rounded-xl border border-ink-200 bg-white px-3 text-[12px] font-medium text-ink-700 focus:border-brand-600 focus:outline-none"
        >
          <option value="">همه دسته‌بندی‌ها</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <Button type="submit" size="sm" variant="outline">
          اعمال فیلتر
        </Button>
        {(q || category) && (
          <Link
            href="/admin/products"
            className="text-[10px] font-bold text-ink-500 hover:text-danger-600"
          >
            حذف فیلترها
          </Link>
        )}
      </form>

      {products.length === 0 ? (
        <EmptyState
          title="محصولی پیدا نشد"
          description="با تغییر فیلترها دوباره جستجو کنید یا محصول جدیدی ایجاد کنید."
          action={
            <Button asChild>
              <Link href="/admin/products/new">ایجاد محصول</Link>
            </Button>
          }
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-right text-[11px]">
              <thead className="bg-ink-50 text-[9px] text-ink-500">
                <tr>
                  <th className="px-3 py-2.5 font-medium">محصول</th>
                  <th className="px-3 py-2.5 font-medium">دسته / برند</th>
                  <th className="px-3 py-2.5 font-medium">قیمت</th>
                  <th className="px-3 py-2.5 font-medium">موجودی</th>
                  <th className="px-3 py-2.5 font-medium">وضعیت</th>
                  <th className="px-3 py-2.5 font-medium">عملیات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {products.map((product) => {
                  const image = product.images[0]?.url;
                  return (
                    <tr key={product.id} className="hover:bg-ink-50/50">
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-2.5">
                          <span className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-ink-100 bg-ink-50">
                            {image ? (
                              <Image
                                src={image}
                                alt={product.name}
                                fill
                                sizes="40px"
                                className="object-cover"
                              />
                            ) : null}
                          </span>
                          <div className="min-w-0">
                            <Link
                              href={`/admin/products/${product.id}`}
                              className="line-clamp-1 font-black text-ink-800 hover:text-brand-700"
                            >
                              {product.name}
                            </Link>
                            <p dir="ltr" className="mt-0.5 text-right text-[9px] text-ink-400">
                              {product.sku}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-2.5">
                        <p className="text-ink-700">{product.category.name}</p>
                        <p className="mt-0.5 text-[9px] text-ink-400">
                          {product.brand?.name ?? "بدون برند"}
                        </p>
                      </td>
                      <td className="px-3 py-2.5">
                        <p className="font-bold text-ink-800">
                          {formatPrice(
                            product.discountPrice && product.discountPrice > 0
                              ? product.discountPrice
                              : product.price,
                          )}
                        </p>
                        {product.discountPrice && product.discountPrice > 0 && (
                          <p className="mt-0.5 text-[9px] text-ink-400 line-through">
                            {formatPrice(product.price)}
                          </p>
                        )}
                      </td>
                      <td className="px-3 py-2.5">
                        <Badge
                          variant={
                            product.stock === 0
                              ? "danger"
                              : product.stock <= 5
                                ? "warning"
                                : "success"
                          }
                          size="xs"
                        >
                          {product.stock === 0
                            ? "ناموجود"
                            : `${toPersianDigits(product.stock)} عدد`}
                        </Badge>
                      </td>
                      <td className="px-3 py-2.5">
                        <div className="flex flex-wrap gap-1">
                          {product.isSpecial && (
                            <Badge variant="danger" size="xs">
                              شگفت‌انگیز
                            </Badge>
                          )}
                          {product.isFeatured && (
                            <Badge variant="brand" size="xs">
                              ویژه
                            </Badge>
                          )}
                          {product.isNew && (
                            <Badge variant="accent" size="xs">
                              جدید
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-2.5">
                        <div className="flex flex-wrap items-center gap-1">
                          <Link
                            href={`/admin/products/${product.id}`}
                            className="inline-flex h-8 items-center gap-1 rounded-lg px-2 text-[10px] font-bold text-brand-700 transition-colors hover:bg-brand-50"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                            ویرایش
                          </Link>
                          <Link
                            href={`/product/${product.slug}`}
                            target="_blank"
                            className="inline-flex h-8 items-center gap-1 rounded-lg px-2 text-[10px] font-bold text-ink-500 transition-colors hover:bg-ink-100"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                            نمایش
                          </Link>
                          <DeleteButton
                            endpoint={`/api/admin/products/${product.id}`}
                            itemName={product.name}
                            label=""
                            description="حذف محصول از فروشگاه. در صورت استفاده در سفارش، حذف انجام نمی‌شود."
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className={cn("flex flex-wrap items-center justify-between gap-2 border-t border-ink-100 p-3")}>
            <p className="text-[10px] text-ink-500">
              صفحه {toPersianDigits(page)} از {toPersianDigits(totalPages)}
            </p>
            <Pagination page={page} totalPages={totalPages} hrefBase={hrefBase} />
          </div>
        </div>
      )}
    </div>
  );
}
