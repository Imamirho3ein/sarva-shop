"use client";

import * as React from "react";
import Link from "next/link";
import { Heart, Trash2 } from "lucide-react";
import { useWishlist, type CompactProduct } from "@/store/lists";
import { ProductCard } from "@/components/product/product-card";
import { EmptyState } from "@/components/ui/misc";
import { Button } from "@/components/ui/button";
import { toPersianDigits } from "@/lib/format";
import type { ProductCardDTO } from "@/types";

function toCard(product: CompactProduct): ProductCardDTO {
  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    image: product.image,
    price: product.price,
    discountPrice: product.discountPrice ?? null,
    rating: product.rating ?? 0,
    reviewCount: product.reviewCount ?? 0,
    soldCount: 0,
    stock: product.stock ?? 0,
  };
}

export function WishlistView() {
  const items = useWishlist((s) => s.items);
  const clear = useWishlist((s) => s.clear);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="skeleton h-72 rounded-2xl" />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <EmptyState
        icon={<Heart className="h-8 w-8" />}
        title="لیست علاقه‌مندی‌های شما خالی است"
        description="محصولات موردعلاقه خود را با زدن قلب روی کارت محصول ذخیره کنید تا بعداً راحت‌تر پیدایشان کنید."
        action={
          <Button asChild>
            <Link href="/products">مشاهده محصولات</Link>
          </Button>
        }
      />
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-ink-100 bg-white p-4 shadow-xs">
        <div>
          <h2 className="text-sm font-black text-ink-900">علاقه‌مندی‌های من</h2>
          <p className="mt-0.5 text-[11px] text-ink-500">
            {toPersianDigits(items.length)} کالا ذخیره شده است.
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => clear()}
          className="text-danger-600 hover:bg-danger-50"
        >
          <Trash2 className="h-4 w-4" />
          پاک کردن همه
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item, index) => (
          <ProductCard key={item.id} product={toCard(item)} index={index} />
        ))}
      </div>
    </div>
  );
}
