"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { CartLine } from "@/lib/cart";

/**
 * سبد خرید — روی localStorage ذخیره می‌شود تا کاربر لاگین‌نشده هم بتواند خرید کند.
 * در آینده با `syncToServer` می‌توان آن را به سبد سمت سرور متصل کرد.
 */

type CartState = {
  lines: CartLine[];
  couponCode: string | null;
  add: (line: Omit<CartLine, "quantity">, quantity?: number) => { ok: boolean; message: string };
  setQuantity: (productId: string, variantId: string | null | undefined, qty: number) => void;
  remove: (productId: string, variantId?: string | null) => void;
  clear: () => void;
  setCoupon: (code: string | null) => void;
  removeCoupon: () => void;
};

const key = (productId: string, variantId?: string | null) =>
  `${productId}::${variantId ?? ""}`;

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      lines: [],
      couponCode: null,

      add: (line, quantity = 1) => {
        const lines = [...get().lines];
        const k = key(line.productId, line.variantId);
        const idx = lines.findIndex((l) => key(l.productId, l.variantId) === k);

        if (idx >= 0) {
          const next = lines[idx].quantity + quantity;
          if (next > line.stock) {
            return { ok: false, message: "بیش از موجودی انبار نمی‌توان اضافه کرد" };
          }
          lines[idx] = { ...lines[idx], quantity: next };
        } else {
          if (quantity > line.stock) {
            return { ok: false, message: "موجودی کافی نیست" };
          }
          lines.push({ ...line, quantity });
        }

        set({ lines });
        return { ok: true, message: "به سبد خرید اضافه شد" };
      },

      setQuantity: (productId, variantId, qty) => {
        set((s) => ({
          lines: s.lines
            .map((l) =>
              l.productId === productId && (l.variantId ?? null) === (variantId ?? null)
                ? { ...l, quantity: Math.min(Math.max(1, qty), Math.max(1, l.stock)) }
                : l,
            )
            .filter((l) => l.quantity > 0),
        }));
      },

      remove: (productId, variantId) => {
        set((s) => ({
          lines: s.lines.filter(
            (l) => !(l.productId === productId && (l.variantId ?? null) === (variantId ?? null)),
          ),
        }));
      },

      clear: () => set({ lines: [], couponCode: null }),
      setCoupon: (code) => set({ couponCode: code }),
      removeCoupon: () => set({ couponCode: null }),
    }),
    {
      name: "sarva-cart-v1",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ lines: s.lines, couponCode: s.couponCode }),
    },
  ),
);

/** انتخاب تعداد اقلام (HMR-safe) */
export const useCartCount = () =>
  useCart((s) => s.lines.reduce((n, l) => n + l.quantity, 0));

export const useCartLines = () => useCart((s) => s.lines);
