"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

/**
 * وضعیت UI مشترک: منوی موبایل، پنل جستجو، پنل مقایسه.
 * برای همگام‌سازی با سرور در آینده، اکشن‌های مربوطه اینجا اضافه شوند.
 */

type UIState = {
  mobileMenuOpen: boolean;
  searchOpen: boolean;
  compareOpen: boolean;
  setMobileMenu: (v: boolean) => void;
  setSearch: (v: boolean) => void;
  setCompare: (v: boolean) => void;
  recentSearches: string[];
  pushSearch: (q: string) => void;
  clearSearches: () => void;
};

export const useUI = create<UIState>()(
  persist(
    (set) => ({
      mobileMenuOpen: false,
      searchOpen: false,
      compareOpen: false,
      setMobileMenu: (v) => set({ mobileMenuOpen: v }),
      setSearch: (v) => set({ searchOpen: v }),
      setCompare: (v) => set({ compareOpen: v }),
      recentSearches: [],
      pushSearch: (q) =>
        set((s) => ({
          recentSearches: [q, ...s.recentSearches.filter((x) => x !== q)].slice(0, 8),
        })),
      clearSearches: () => set({ recentSearches: [] }),
    }),
    {
      name: "sarva-ui-v1",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ recentSearches: s.recentSearches }),
    },
  ),
);
