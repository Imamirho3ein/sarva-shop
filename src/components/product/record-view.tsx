"use client";

import * as React from "react";
import { useRecentlyViewed, type CompactProduct } from "@/store/lists";

/**
 * ثبت بازدید محصول در حافظه محلی (برای بخش «بازدیدهای اخیر»).
 */
export function RecordView({ product }: { product: CompactProduct }) {
  React.useEffect(() => {
    const state = useRecentlyViewed.getState();
    if (!state.items.some((i) => i.id === product.id)) {
      state.toggle(product);
    }
    // فقط یک‌بار در هر بازدید ثبت می‌شود.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product.id]);

  return null;
}
