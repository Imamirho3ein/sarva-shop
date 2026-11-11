"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, Scale, ShoppingCart, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Stars } from "@/components/ui/stars";
import { EmptyState } from "@/components/ui/misc";
import { useToast } from "@/components/ui/toast";
import { useCart } from "@/store/cart";
import { useCompare, useWishlist, type CompactProduct } from "@/store/lists";
import { formatPrice, toPersianDigits } from "@/lib/format";
import { discountPercent, stockState } from "@/lib/utils";

export function CompareView() {
  const items = useCompare((s) => s.items);
  const remove = useCompare((s) => s.remove);
  const clear = useCompare((s) => s.clear);
  const toggleWish = useWishlist((s) => s.toggle);
  const wishItems = useWishlist((s) => s.items);
  const add = useCart((s) => s.add);
  const toast = useToast();

  if (items.length === 0) {
    return (
      <EmptyState
        icon={<Scale className="h-7 w-7" />}
        title="لیست مقایسه خالی است"
        description="با کلیک روی آیکون مقایسه در کارت محصولات، حداکثر ۴ کالا را کنار هم بررسی کنید."
        action={
          <Button asChild>
            <Link href="/products">مشاهده محصولات</Link>
          </Button>
        }
      />
    );
  }

  const handleAdd = (product: CompactProduct) => {
    const res = add({
      productId: product.id,
      variantId: null,
      name: product.name,
      image: product.image,
      slug: product.slug,
      sku: product.id,
      price: product.price,
      discountPrice: product.discountPrice,
      stock: product.stock ?? 0,
    });
    if (res.ok) toast.success(res.message, product.name);
    else toast.warning(res.message);
  };

  const columns = `180px repeat(${items.length}, minmax(190px, 1fr))`;

  return (
    <div className="rounded-2xl border border-ink-100 bg-white shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-ink-100 p-3.5">
        <span className="text-xs font-extrabold text-ink-700">
          {toPersianDigits(items.length)} کالا در مقایسه
        </span>
        <Button variant="ghost" size="sm" onClick={clear} className="text-danger-600">
          <Trash2 className="h-4 w-4" />
          حذف همه
        </Button>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[720px]">
          {/* سربرگ */}
          <div
            className="grid items-stretch border-b border-ink-100 bg-ink-50/60"
            style={{ gridTemplateColumns: columns }}
          >
            <div className="flex items-center p-3 text-[11px] font-black text-ink-500">
              مشخصات کالا
            </div>
            {items.map((product) => (
              <div key={product.id} className="relative border-r border-ink-100 p-3">
                <button
                  type="button"
                  onClick={() => remove(product.id)}
                  aria-label="حذف از مقایسه"
                  className="absolute top-2 left-2 z-10 flex h-7 w-7 items-center justify-center rounded-lg bg-white text-ink-400 shadow-sm transition-colors hover:text-danger-600"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
                <Link href={`/product/${product.slug}`} className="group block">
                  <div className="relative aspect-square overflow-hidden rounded-xl bg-white">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      sizes="180px"
                      className="object-contain p-2 transition-transform group-hover:scale-105"
                    />
                  </div>
                  <p className="mt-2 line-clamp-2 min-h-[2.6em] text-[11px] font-extrabold leading-[1.6] text-ink-800 group-hover:text-brand-800">
                    {product.name}
                  </p>
                </Link>
              </div>
            ))}
          </div>

          <CompareRow label="قیمت" columns={columns}>
            {items.map((product) => {
              const percent = discountPercent(product.price, product.discountPrice);
              return (
                <div key={product.id} className="border-r border-ink-100 p-3">
                  <p className="text-sm font-black tabular text-ink-900">
                    {formatPrice(product.discountPrice ?? product.price)}
                  </p>
                  {percent > 0 && (
                    <p className="mt-0.5 text-[10px] font-bold text-ink-400">
                      <span className="line-through">{formatPrice(product.price, { unit: false })}</span>{" "}
                      <span className="text-danger-600">{toPersianDigits(percent)}٪ تخفیف</span>
                    </p>
                  )}
                </div>
              );
            })}
          </CompareRow>

          <CompareRow label="امتیاز کاربران" columns={columns}>
            {items.map((product) => (
              <div key={product.id} className="border-r border-ink-100 p-3">
                <div className="flex items-center gap-1.5">
                  <Stars value={product.rating ?? 0} size={13} />
                  <span className="text-[10px] font-bold text-ink-400">
                    ({toPersianDigits(product.reviewCount ?? 0)})
                  </span>
                </div>
              </div>
            ))}
          </CompareRow>

          <CompareRow label="موجودی" columns={columns}>
            {items.map((product) => {
              const state = stockState(product.stock ?? 0);
              return (
                <div key={product.id} className="border-r border-ink-100 p-3">
                  <span
                    className={
                      state === "out"
                        ? "text-[11px] font-bold text-danger-600"
                        : "text-[11px] font-bold text-success-600"
                    }
                  >
                    {state === "out" ? "ناموجود" : `موجود (${toPersianDigits(product.stock ?? 0)})`}
                  </span>
                </div>
              );
            })}
          </CompareRow>

          <CompareRow label="" columns={columns}>
            {items.map((product) => {
              const hasWish = wishItems.some((i) => i.id === product.id);
              return (
                <div key={product.id} className="flex flex-col gap-1.5 border-r border-ink-100 p-3">
                  <Button
                    size="sm"
                    onClick={() => handleAdd(product)}
                    disabled={(product.stock ?? 0) <= 0}
                  >
                    <ShoppingCart className="h-4 w-4" />
                    افزودن به سبد
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => toggleWish(product)}
                  >
                    <Heart className={hasWish ? "h-4 w-4 fill-danger-500 text-danger-500" : "h-4 w-4"} />
                    {hasWish ? "حذف از علاقه‌مندی" : "علاقه‌مندی"}
                  </Button>
                </div>
              );
            })}
          </CompareRow>
        </div>
      </div>
    </div>
  );
}

function CompareRow({
  label,
  columns,
  children,
}: {
  label: string;
  columns: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="grid items-stretch border-b border-ink-100 last:border-b-0"
      style={{ gridTemplateColumns: columns }}
    >
      <div className="flex items-center p-3 text-[11px] font-bold text-ink-500">{label}</div>
      {children}
    </div>
  );
}
