"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, Scale, ShoppingCart, Eye, Check } from "lucide-react";
import { motion } from "framer-motion";
import { cn, discountPercent, stockState } from "@/lib/utils";
import { formatPrice, toPersianDigits } from "@/lib/format";
import { Badge, DiscountBadge } from "@/components/ui/badge";
import { Stars } from "@/components/ui/stars";
import { useCart } from "@/store/cart";
import { useCompare, useWishlist, type CompactProduct } from "@/store/lists";
import { useToast } from "@/components/ui/toast";
import type { ProductCardDTO } from "@/types";

/**
 * کارت محصول — پرکاربردترین کامپوننت فروشگاه.
 * نسخه‌ی Grid و نسخه‌ی افقی (اسلایدر) دارد.
 */

export function ProductCard({
  product,
  index = 0,
  layout = "grid",
  className,
}: {
  product: ProductCardDTO;
  index?: number;
  layout?: "grid" | "row";
  className?: string;
}) {
  const add = useCart((s) => s.add);
  const toggleWish = useWishlist((s) => s.toggle);
  const hasWish = useWishlist((s) => s.items.some((i) => i.id === product.id));
  const toggleCompare = useCompare((s) => s.toggle);
  const hasCompare = useCompare((s) => s.items.some((i) => i.id === product.id));
  const toast = useToast();
  const [imgOk, setImgOk] = React.useState(true);

  const percent = discountPercent(product.price, product.discountPrice);
  const state = stockState(product.stock);
  const compact = toCompact(product);

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.stock <= 0) {
      toast.warning("ناموجود", "این محصول در حال حاضر موجود نیست");
      return;
    }
    const res = add({
      productId: product.id,
      variantId: null,
      name: product.name,
      image: product.image,
      slug: product.slug,
      sku: product.sku ?? product.id,
      price: product.price,
      discountPrice: product.discountPrice,
      stock: product.stock,
      brandName: product.brandName,
    });
    if (res.ok) toast.success(res.message, product.name);
    else toast.warning(res.message);
  };

  const handleWish = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const added = toggleWish(compact);
    toast.push({
      kind: "success",
      title: added ? "به علاقه‌مندی‌ها اضافه شد" : "از علاقه‌مندی‌ها حذف شد",
      description: product.name,
    });
  };

  const handleCompare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const added = toggleCompare(compact);
    toast.push({
      kind: "info",
      title: added ? "به لیست مقایسه اضافه شد" : "از لیست مقایسه حذف شد",
      description: added ? `تا ${toPersianDigits(4)} محصول قابل مقایسه‌اند` : undefined,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: Math.min(index * 0.03, 0.3), ease: [0.22, 1, 0.36, 1] }}
      className={cn("group relative", className)}
    >
      <Link
        href={`/product/${product.slug}`}
        className={cn(
          "flex h-full flex-col overflow-hidden rounded-2xl border border-ink-100 bg-white transition-all duration-300",
          "hover:border-brand-200 hover:shadow-card",
          layout === "row" && "flex-row",
        )}
      >
        {/* تصویر */}
        <div
          className={cn(
            "relative shrink-0 overflow-hidden bg-ink-50",
            layout === "grid" ? "aspect-square" : "aspect-square w-28 sm:w-36",
          )}
        >
          {imgOk ? (
            <Image
              src={product.image}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
              className="object-contain p-3 transition-transform duration-500 group-hover:scale-105"
              onError={() => setImgOk(false)}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-brand-50 to-accent-50 text-3xl font-black text-brand-600">
              {product.name.slice(0, 1)}
            </div>
          )}

          {/* برچسب‌ها */}
          <div className="absolute top-2.5 right-2.5 flex flex-col items-start gap-1.5">
            {percent > 0 && <DiscountBadge percent={percent} />}
            {product.isNew && <Badge variant="solid" size="xs">جدید</Badge>}
            {product.isSpecial && <Badge variant="accent" size="xs">شگفت‌انگیز</Badge>}
            {state === "out" && <Badge variant="dark" size="xs">ناموجود</Badge>}
          </div>

          {/* اکشن‌های شناور */}
          <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 opacity-0 transition-all duration-300 translate-x-2 group-hover:translate-x-0 group-hover:opacity-100">
            <QuickAction
              active={hasWish}
              label="علاقه‌مندی"
              onClick={handleWish}
            >
              <Heart
                className={cn("h-4 w-4", hasWish && "fill-danger-500 text-danger-500")}
                strokeWidth={2.2}
              />
            </QuickAction>
            <QuickAction active={hasCompare} label="مقایسه" onClick={handleCompare}>
              <Scale className={cn("h-4 w-4", hasCompare && "text-brand-700")} strokeWidth={2.2} />
            </QuickAction>
          </div>

          {/* دکمه افزودن سریع */}
          <div className="absolute inset-x-0 bottom-0 translate-y-full p-2.5 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
            <button
              type="button"
              onClick={handleAdd}
              disabled={state === "out"}
              className="flex h-9 w-full items-center justify-center gap-1.5 rounded-xl bg-brand-700 text-xs font-extrabold text-white shadow-pop transition-colors hover:bg-brand-800 disabled:bg-ink-400"
            >
              <ShoppingCart className="h-4 w-4" strokeWidth={2.4} />
              {state === "out" ? "ناموجود" : "افزودن به سبد"}
            </button>
          </div>
        </div>

        {/* اطلاعات */}
        <div className="flex flex-1 flex-col gap-1.5 p-3 sm:p-4">
          {(product.brandName || product.categoryName) && (
            <p className="truncate text-[11px] font-bold text-ink-400">
              {product.brandName ?? product.categoryName}
            </p>
          )}

          <h3 className="line-clamp-2 min-h-[2.6em] text-[13px] font-extrabold leading-[1.6] text-ink-900 transition-colors group-hover:text-brand-800 sm:text-sm">
            {product.name}
          </h3>

          <div className="flex items-center gap-2">
            <Stars value={product.rating} size={13} />
            <span className="text-[11px] font-bold text-ink-400">
              ({toPersianDigits(product.reviewCount)})
            </span>
          </div>

          <div className="mt-auto flex flex-col gap-1 pt-1">
            <div className="flex items-baseline gap-2">
              <span className="text-[15px] font-black tabular text-ink-900 sm:text-base">
                {formatPrice(product.discountPrice ?? product.price, { unit: false })}
              </span>
              <span className="text-[11px] font-bold text-ink-400">تومان</span>
            </div>
            {percent > 0 && (
              <span className="text-[11px] font-bold text-ink-400 line-through tabular">
                {formatPrice(product.price, { unit: false })}
              </span>
            )}
            {layout === "grid" && (
              <div className="mt-1.5 flex items-center justify-between">
                <span
                  className={cn(
                    "text-[10px] font-bold",
                    state === "in" && "text-success-600",
                    state === "low" && "text-accent-600",
                    state === "out" && "text-ink-400",
                  )}
                >
                  {state === "in" && `موجود (${toPersianDigits(product.stock)})`}
                  {state === "low" && `تنها ${toPersianDigits(product.stock)} عدد`}
                  {state === "out" && "ناموجود"}
                </span>
                {product.soldCount > 0 && (
                  <span className="text-[10px] font-bold text-ink-400">
                    {toPersianDigits(product.soldCount)} فروش
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

function QuickAction({
  children,
  onClick,
  label,
  active,
}: {
  children: React.ReactNode;
  onClick: (e: React.MouseEvent) => void;
  label: string;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={cn(
        "flex h-8 w-8 items-center justify-center rounded-lg border border-ink-100 bg-white/95 text-ink-500 shadow-sm backdrop-blur transition-all duration-200 hover:scale-110 hover:text-ink-800",
        active && "border-danger-100 bg-danger-50",
      )}
    >
      {children}
    </button>
  );
}

function toCompact(p: ProductCardDTO): CompactProduct {
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    image: p.image,
    price: p.price,
    discountPrice: p.discountPrice,
    rating: p.rating,
    reviewCount: p.reviewCount,
    stock: p.stock,
  };
}

/** کارت حالت بارگذاری */
export function ProductCardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("overflow-hidden rounded-2xl border border-ink-100 bg-white", className)}>
      <div className="skeleton aspect-square w-full" />
      <div className="space-y-2 p-4">
        <div className="skeleton h-3 w-4/5 rounded" />
        <div className="skeleton h-3 w-3/5 rounded" />
        <div className="skeleton h-5 w-1/2 rounded" />
        <div className="skeleton h-9 w-full rounded-lg" />
      </div>
    </div>
  );
}

export function EmptyProductGraphic() {
  return (
    <span className="flex h-6 w-6 items-center justify-center rounded-md bg-brand-50 text-brand-700">
      <Eye className="h-3.5 w-3.5" />
    </span>
  );
}

export { Check };
