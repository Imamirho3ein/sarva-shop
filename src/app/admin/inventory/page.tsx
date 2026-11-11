import type { Metadata } from "next";
import Link from "next/link";
import { Boxes, Filter, Search, TriangleAlert } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatPrice, toPersianDigits } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/ui/pagination";
import {
  InventoryTable,
  type InventoryRow,
} from "@/components/admin/inventory-table";
import type { Prisma } from "@prisma/client";

export const metadata: Metadata = {
  title: "انبار | پنل مدیریت",
  robots: { index: false, follow: false },
};

const PER_PAGE = 20;

export default async function AdminInventoryPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string; stock?: string; page?: string }>;
}) {
  const params = await searchParams;
  const q = (params.q ?? "").trim();
  const category = params.category ?? "";
  const stock = params.stock ?? "";
  const page = Math.max(1, Number(params.page) || 1);

  const where: Prisma.ProductWhereInput = {
    ...(q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" as const } },
            { sku: { contains: q, mode: "insensitive" as const } },
          ],
        }
      : {}),
    ...(category ? { categoryId: category } : {}),
    ...(stock === "out"
      ? { stock: 0 }
      : stock === "low"
        ? { stock: { gt: 0, lte: 5 } }
        : stock === "available"
          ? { stock: { gt: 5 } }
          : {}),
  };

  const [products, total, categories, allProducts] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy: [{ stock: "asc" }, { name: "asc" }],
      skip: (page - 1) * PER_PAGE,
      take: PER_PAGE,
      select: {
        id: true,
        name: true,
        slug: true,
        sku: true,
        stock: true,
        reservedStock: true,
        price: true,
        discountPrice: true,
        soldCount: true,
        category: { select: { name: true } },
        brand: { select: { name: true } },
      },
    }),
    prisma.product.count({ where }),
    prisma.category.findMany({
      orderBy: [{ order: "asc" }, { name: "asc" }],
      select: { id: true, name: true },
    }),
    prisma.product.findMany({
      select: { stock: true, reservedStock: true, price: true, discountPrice: true },
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));
  const inventoryValue = allProducts.reduce(
    (sum, p) => sum + (p.discountPrice && p.discountPrice > 0 ? p.discountPrice : p.price) * p.stock,
    0,
  );
  const outOfStock = allProducts.filter((p) => p.stock === 0).length;
  const lowStock = allProducts.filter((p) => p.stock > 0 && p.stock <= 5).length;
  const reserved = allProducts.reduce((sum, p) => sum + p.reservedStock, 0);

  const rows: InventoryRow[] = products.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    sku: p.sku,
    categoryName: p.category.name,
    brandName: p.brand?.name ?? null,
    stock: p.stock,
    reservedStock: p.reservedStock,
    price: p.price,
    discountPrice: p.discountPrice,
    soldCount: p.soldCount,
  }));

  const hrefBase = (() => {
    const query = new URLSearchParams();
    if (q) query.set("q", q);
    if (category) query.set("category", category);
    if (stock) query.set("stock", stock);
    query.set("page", "{page}");
    return `/admin/inventory?${query.toString()}`;
  })();

  const stats = [
    { label: "ارزش موجودی انبار", value: formatPrice(inventoryValue), tone: "text-brand-700" },
    { label: "کالای ناموجود", value: toPersianDigits(outOfStock), tone: "text-danger-600" },
    { label: "کالای کم‌موجود", value: toPersianDigits(lowStock), tone: "text-warning-600" },
    { label: "اقلام رزروشده", value: toPersianDigits(reserved), tone: "text-ink-700" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-ink-100 bg-white p-4 shadow-xs">
        <div>
          <h1 className="flex items-center gap-1.5 text-base font-black text-ink-900">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
              <Boxes className="h-4 w-4" />
            </span>
            مدیریت انبار
          </h1>
          <p className="mt-1 text-[11px] text-ink-500">
            موجودی، رزرو و قیمت محصولات را مستقیم ویرایش کنید. تغییرات با فیلدهای
            زردرنگ مشخص می‌شوند.
          </p>
        </div>
        <Link
          href="/admin/products"
          className="rounded-lg bg-ink-50 px-2.5 py-1.5 text-[10px] font-bold text-ink-600 hover:bg-ink-100"
        >
          مدیریت محصولات
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl border border-ink-100 bg-white p-3.5 shadow-xs"
          >
            <p className="text-[10px] font-medium text-ink-500">{stat.label}</p>
            <p className={`mt-1 text-sm font-black ${stat.tone}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      <form className="flex flex-wrap items-center gap-2 rounded-2xl border border-ink-100 bg-white p-3 shadow-xs">
        <div className="relative min-w-48 flex-1">
          <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
          <input
            name="q"
            defaultValue={q}
            placeholder="جستجوی نام یا SKU…"
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
        <select
          name="stock"
          defaultValue={stock}
          className="h-10 min-w-36 rounded-xl border border-ink-200 bg-white px-3 text-[12px] font-medium text-ink-700 focus:border-brand-600 focus:outline-none"
        >
          <option value="">همه موجودی‌ها</option>
          <option value="out">ناموجود</option>
          <option value="low">کم‌موجود (۱ تا ۵)</option>
          <option value="available">موجود (بیش از ۵)</option>
        </select>
        <Button type="submit" size="sm" variant="outline">
          <Filter className="h-3.5 w-3.5" />
          اعمال فیلتر
        </Button>
        {(q || category || stock) && (
          <Link
            href="/admin/inventory"
            className="text-[10px] font-bold text-ink-500 hover:text-danger-600"
          >
            حذف فیلترها
          </Link>
        )}
      </form>

      {lowStock > 0 && (
        <div className="flex items-center gap-2 rounded-xl border border-warning-100 bg-warning-100/40 px-3 py-2.5 text-[11px] text-warning-600">
          <TriangleAlert className="h-4 w-4 shrink-0" />
          {toPersianDigits(lowStock)} کالا موجودی کمتر از ۵ عدد دارد؛ برای جلوگیری از
          توقف فروش، موجودی را افزایش دهید.
        </div>
      )}

      <InventoryTable rows={rows} />

      <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-ink-100 bg-white p-3 shadow-xs">
        <p className="text-[10px] text-ink-500">
          نمایش {toPersianDigits(rows.length)} محصول از {toPersianDigits(total)} — صفحه{" "}
          {toPersianDigits(page)} از {toPersianDigits(totalPages)}
        </p>
        <Pagination page={page} totalPages={totalPages} hrefBase={hrefBase} />
      </div>
    </div>
  );
}
