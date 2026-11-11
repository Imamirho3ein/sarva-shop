"use client";

import * as React from "react";
import { create } from "zustand";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, Info, TriangleAlert, XCircle, X } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * سیستم Toast سبک — بدون وابستگی خارجی سنگین.
 * استفاده:
 *   const toast = useToast();
 *   toast.success("به سبد خرید اضافه شد");
 */

type ToastKind = "success" | "error" | "info" | "warning";

export type ToastItem = {
  id: number;
  kind: ToastKind;
  title: string;
  description?: string;
};

type ToastState = {
  items: ToastItem[];
  push: (t: Omit<ToastItem, "id">) => void;
  dismiss: (id: number) => void;
};

let seq = 0;

export const useToastStore = create<ToastState>((set) => ({
  items: [],
  push: (t) => {
    const id = ++seq;
    set((s) => ({ items: [...s.items, { ...t, id }] }));
    setTimeout(() => {
      set((s) => ({ items: s.items.filter((i) => i.id !== id) }));
    }, 4200);
  },
  dismiss: (id) => set((s) => ({ items: s.items.filter((i) => i.id !== id) })),
}));

const ICONS: Record<ToastKind, React.ReactNode> = {
  success: <CheckCircle2 className="h-5 w-5 text-success-600" />,
  error: <XCircle className="h-5 w-5 text-danger-600" />,
  warning: <TriangleAlert className="h-5 w-5 text-warning-500" />,
  info: <Info className="h-5 w-5 text-brand-600" />,
};

const ACCENT: Record<ToastKind, string> = {
  success: "border-r-success-500",
  error: "border-r-danger-500",
  warning: "border-r-warning-500",
  info: "border-r-brand-500",
};

export function useToast() {
  const push = useToastStore((s) => s.push);
  return React.useMemo(
    () => ({
      push,
      success: (title: string, description?: string) => push({ kind: "success", title, description }),
      error: (title: string, description?: string) => push({ kind: "error", title, description }),
      info: (title: string, description?: string) => push({ kind: "info", title, description }),
      warning: (title: string, description?: string) => push({ kind: "warning", title, description }),
    }),
    [push],
  );
}

/** ارائه‌دهنده‌ی Toast — در layout ریشه قرار می‌گیرد */
export function Toaster() {
  const items = useToastStore((s) => s.items);
  const dismiss = useToastStore((s) => s.dismiss);

  return (
    <div
      className="pointer-events-none fixed bottom-4 left-4 z-[100] flex w-[min(24rem,calc(100vw-2rem))] flex-col gap-2.5"
      aria-live="polite"
      role="region"
    >
      <AnimatePresence initial={false}>
        {items.map((t) => (
          <motion.div
            key={t.id}
            layout
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
            className={cn(
              "pointer-events-auto flex items-start gap-3 rounded-xl border border-ink-100 border-r-4 bg-white p-3.5 shadow-pop",
              ACCENT[t.kind],
            )}
          >
            <span className="mt-0.5 shrink-0">{ICONS[t.kind]}</span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-extrabold text-ink-900">{t.title}</p>
              {t.description && (
                <p className="mt-0.5 text-xs leading-5 text-ink-500">{t.description}</p>
              )}
            </div>
            <button
              type="button"
              onClick={() => dismiss(t.id)}
              className="shrink-0 rounded-md p-1 text-ink-400 transition-colors hover:bg-ink-100 hover:text-ink-700"
              aria-label="بستن"
            >
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
