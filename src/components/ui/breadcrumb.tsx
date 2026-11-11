import * as React from "react";
import Link from "next/link";
import { ChevronLeft, Home } from "lucide-react";
import { cn } from "@/lib/utils";

export type Crumb = { label: string; href?: string };

/**
 * مسیر راهنما (Breadcrumb) — در RTL از راست به چپ حرکت می‌کند.
 */
export function Breadcrumb({
  items,
  className,
}: {
  items: Crumb[];
  className?: string;
}) {
  return (
    <nav
      aria-label="مسیر صفحه"
      className={cn(
        "flex flex-wrap items-center gap-1 text-[11px] font-medium text-ink-500",
        className,
      )}
    >
      <Link
        href="/"
        className="inline-flex items-center gap-1 rounded-md px-1 py-0.5 transition-colors hover:text-brand-700"
      >
        <Home className="h-3.5 w-3.5" />
        خانه
      </Link>
      {items.map((item, i) => {
        const last = i === items.length - 1;
        return (
          <span key={`${item.label}-${i}`} className="flex items-center gap-1">
            <ChevronLeft className="h-3 w-3 text-ink-300" aria-hidden />
            {item.href && !last ? (
              <Link
                href={item.href}
                className="rounded-md px-1 py-0.5 transition-colors hover:text-brand-700"
              >
                {item.label}
              </Link>
            ) : (
              <span className={cn("px-1 py-0.5", last && "font-bold text-ink-800")}>
                {item.label}
              </span>
            )}
          </span>
        );
      })}
    </nav>
  );
}
