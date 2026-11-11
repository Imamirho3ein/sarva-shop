"use client";

import * as React from "react";
import Link from "next/link";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { paginationRange } from "@/lib/utils";
import { toPersianDigits } from "@/lib/format";

/**
 * صفحه‌بندی — در RTL جهت فلش‌ها برعکس می‌شود.
 *
 * در Server Componentها نمی‌توان تابع به کلاینت پاس داد؛ بنابراین علاوه بر
 * `hrefBuilder` (برای مصرف در Client Componentها) می‌توانید یک الگوی رشته‌ای
 * با جای‌نگهدار `{page}` بدهید: `hrefBase="/products?page={page}"`.
 */
export function Pagination({
  page,
  totalPages,
  hrefBuilder,
  hrefBase,
  className,
}: {
  page: number;
  totalPages: number;
  hrefBuilder?: (page: number) => string;
  hrefBase?: string;
  className?: string;
}) {
  if (totalPages <= 1) return null;
  const items = paginationRange(page, totalPages);

  const makeHref = (target: number) => {
    if (hrefBuilder) return hrefBuilder(target);
    if (hrefBase) {
      const value = String(target);
      return hrefBase.includes("{page}")
        ? hrefBase.replace("{page}", value)
        : `${hrefBase}${hrefBase.includes("?") ? "&" : "?"}page=${value}`;
    }
    return "#";
  };

  return (
    <nav
      aria-label="صفحه‌بندی"
      className={cn("flex items-center justify-center gap-1.5", className)}
    >
      <StepLink
        href={makeHref(page - 1)}
        disabled={page <= 1}
        label="قبلی"
        icon={<ChevronRight className="h-4 w-4" />}
      />

      {items.map((it, i) =>
        it === "…" ? (
          <span key={`e${i}`} className="px-1.5 text-ink-400">
            …
          </span>
        ) : (
          <Link
            key={it}
            href={makeHref(it)}
            aria-current={it === page ? "page" : undefined}
            className={cn(
              "h-10 min-w-10 rounded-xl px-2 text-sm font-bold transition-all duration-200",
              it === page
                ? "bg-brand-700 text-white shadow-sm"
                : "border border-ink-200 bg-white text-ink-600 hover:border-brand-300 hover:text-brand-700",
            )}
          >
            {toPersianDigits(it)}
          </Link>
        ),
      )}

      <StepLink
        href={makeHref(page + 1)}
        disabled={page >= totalPages}
        label="بعدی"
        icon={<ChevronLeft className="h-4 w-4" />}
      />
    </nav>
  );
}

function StepLink({
  href,
  disabled,
  label,
  icon,
}: {
  href: string;
  disabled: boolean;
  label: string;
  icon: React.ReactNode;
}) {
  const cls = cn(
    "flex h-10 items-center gap-1 rounded-xl px-3 text-sm font-bold transition-all duration-200",
    disabled
      ? "pointer-events-none bg-ink-50 text-ink-300"
      : "border border-ink-200 bg-white text-ink-600 hover:border-brand-300 hover:text-brand-700",
  );
  return disabled ? (
    <span className={cls} aria-disabled>
      {icon}
      {label}
    </span>
  ) : (
    <Link href={href} className={cls}>
      {icon}
      {label}
    </Link>
  );
}

/** دکمه «نمایش بیشتر» */
export function LoadMore({
  onClick,
  loading,
  hasMore,
  label = "نمایش محصولات بیشتر",
}: {
  onClick: () => void;
  loading?: boolean;
  hasMore: boolean;
  label?: string;
}) {
  if (!hasMore && !loading) return null;
  return (
    <div className="mt-8 flex justify-center">
      <button
        type="button"
        onClick={onClick}
        disabled={loading}
        className="h-12 min-w-56 rounded-xl border border-ink-200 bg-white px-6 text-sm font-extrabold text-ink-700 transition-all duration-200 hover:border-brand-400 hover:text-brand-700 disabled:opacity-60"
      >
        {loading ? (
          <span className="inline-flex items-center gap-2">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
            در حال بارگذاری…
          </span>
        ) : (
          label
        )}
      </button>
    </div>
  );
}
