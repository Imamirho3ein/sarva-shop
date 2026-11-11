import * as React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * تیتر بخش صفحه‌ی اصلی — با لینک «مشاهده همه».
 */
export function SectionHeader({
  title,
  subtitle,
  href,
  hrefLabel = "مشاهده همه",
  icon,
  accent,
  className,
  children,
}: {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  href?: string;
  hrefLabel?: string;
  icon?: React.ReactNode;
  accent?: boolean;
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className={cn("mb-4 flex flex-wrap items-end justify-between gap-3", className)}>
      <div className="flex items-center gap-3">
        {icon && (
          <span
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-xl",
              accent ? "bg-accent-100 text-accent-600" : "bg-brand-50 text-brand-700",
            )}
          >
            {icon}
          </span>
        )}
        <div>
          <h2 className="text-lg font-black text-ink-900 sm:text-xl">{title}</h2>
          {subtitle && (
            <p className="mt-0.5 text-xs font-medium text-ink-500 sm:text-sm">{subtitle}</p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        {children}
        {href && (
          <Link
            href={href}
            className="group inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-sm font-bold text-brand-700 transition-colors hover:text-brand-900"
          >
            {hrefLabel}
            <ArrowLeft className="h-4 w-4 transition-transform duration-200 group-hover:-translate-x-1" />
          </Link>
        )}
      </div>
    </div>
  );
}

/** کارت ساده‌ی لینک‌دار برای دسته‌بندی‌ها و فوتر */
export function LinkCard({
  href,
  children,
  className,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "group block rounded-xl border border-ink-100 bg-white p-4 transition-all duration-200 hover:border-brand-300 hover:shadow-soft",
        className,
      )}
    >
      {children}
    </Link>
  );
}
