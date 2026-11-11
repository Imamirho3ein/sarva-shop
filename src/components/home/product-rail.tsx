"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { ProductCard } from "@/components/product/product-card";
import type { ProductCardDTO } from "@/types";

/**
 * ریل افقی محصولات — در موبایل کشویی و در دسکتاپ با دکمه‌های پیمایش.
 */
export function ProductRail({
  products,
  className,
  itemClassName,
}: {
  products: ProductCardDTO[];
  className?: string;
  itemClassName?: string;
}) {
  const ref = React.useRef<HTMLDivElement>(null);

  const scroll = (dir: number) => {
    const el = ref.current;
    if (!el) return;
    const amount = Math.max(280, el.clientWidth * 0.8);
    // RTL: scrollLeft منفی است
    el.scrollBy({ left: dir * amount, behavior: "smooth" });
  };

  if (!products.length) return null;

  return (
    <div className={cn("relative", className)}>
      <div
        ref={ref}
        className="no-scrollbar -mx-1 flex snap-x snap-mandatory gap-3 overflow-x-auto px-1 pb-1"
      >
        {products.map((p, i) => (
          <div
            key={`${p.id}-${i}`}
            className={cn(
              "w-[47%] shrink-0 snap-start sm:w-[31%] md:w-[23.5%] xl:w-[19%]",
              itemClassName,
            )}
          >
            <ProductCard product={p} index={i} />
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={() => scroll(1)}
        aria-label="محصولات بعدی"
        className="absolute -right-3 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-ink-100 bg-white text-ink-600 shadow-card transition-all hover:text-brand-700 lg:flex"
      >
        <ChevronRight className="h-5 w-5" />
      </button>
      <button
        type="button"
        onClick={() => scroll(-1)}
        aria-label="محصولات قبلی"
        className="absolute -left-3 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-ink-100 bg-white text-ink-600 shadow-card transition-all hover:text-brand-700 lg:flex"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
    </div>
  );
}
