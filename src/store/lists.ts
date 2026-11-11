"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

/** آیتم کوچک برای لیست علاقه‌مندی / مقایسه */
export type CompactProduct = {
  id: string;
  slug: string;
  name: string;
  image: string;
  price: number;
  discountPrice?: number | null;
  rating?: number;
  reviewCount?: number;
  stock?: number;
};

type ListState<T extends { id: string }> = {
  items: T[];
  toggle: (item: T) => boolean; // true اگر اضافه شد
  remove: (id: string) => void;
  clear: () => void;
  has: (id: string) => boolean;
};

function createListStore<T extends { id: string }>(name: string, limit: number) {
  return create<ListState<T>>()(
    persist(
      (set, get) => ({
        items: [],

        toggle: (item) => {
          const exists = get().items.some((i) => i.id === item.id);
          if (exists) {
            set((s) => ({ items: s.items.filter((i) => i.id !== item.id) }));
            return false;
          }
          set((s) => ({ items: [item, ...s.items].slice(0, limit) }));
          return true;
        },

        remove: (id) => set((s) => ({ items: s.items.filter((i) => i.id !== id) })),
        clear: () => set({ items: [] }),
        has: (id) => get().items.some((i) => i.id === id),
      }),
      { name, storage: createJSONStorage(() => localStorage), partialize: (s) => ({ items: s.items }) },
    ),
  );
}

/** علاقه‌مندی‌ها (لیست دلخواه) */
export const useWishlist = createListStore<CompactProduct>("sarva-wishlist-v1", 200);

/** مقایسه محصولات (حداکثر ۴ قلم) */
export const useCompare = createListStore<CompactProduct>("sarva-compare-v1", 4);

/** بازدیدهای اخیر */
export const useRecentlyViewed = createListStore<CompactProduct>("sarva-recent-v1", 12);
