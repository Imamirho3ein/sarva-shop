import * as React from "react";
import { Breadcrumb, type Crumb } from "@/components/ui/breadcrumb";
import { cn } from "@/lib/utils";

/**
 * سربرگ مشترک صفحات محتوایی (درباره ما، قوانین، پرسش‌های متداول و …)
 */
export function PageHeader({
  eyebrow,
  title,
  description,
  crumbs,
  icon,
  meta,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description?: React.ReactNode;
  crumbs: Crumb[];
  icon?: React.ReactNode;
  meta?: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <header className="relative overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-xs">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-gradient-to-l from-brand-50/80 via-white to-white"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -left-20 -top-24 h-56 w-56 rounded-full bg-brand-100/50 blur-2xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-24 right-10 h-48 w-48 rounded-full bg-accent-100/40 blur-2xl"
      />

      <div className="relative px-4 py-5 sm:px-6 sm:py-7">
        <Breadcrumb items={crumbs} />

        <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
          <div className="flex min-w-0 items-start gap-3.5">
            {icon && (
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-700 text-white shadow-sm shadow-brand-900/10">
                {icon}
              </span>
            )}
            <div className="min-w-0">
              {eyebrow && (
                <p className="text-[10px] font-black uppercase tracking-wide text-brand-700">
                  {eyebrow}
                </p>
              )}
              <h1 className="mt-0.5 text-xl font-black text-ink-900 sm:text-2xl lg:text-[28px]">
                {title}
              </h1>
              {description && (
                <p className="mt-1.5 max-w-3xl text-[12px] leading-7 text-ink-500 sm:text-[13px]">
                  {description}
                </p>
              )}
            </div>
          </div>

          {(meta || actions) && (
            <div className="flex flex-wrap items-center gap-2">
              {meta}
              {actions}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

/** عنوان بخش داخلی صفحات محتوایی */
export function ContentSectionTitle({
  title,
  description,
  icon,
  className,
}: {
  title: React.ReactNode;
  description?: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex items-start gap-2.5", className)}>
      {icon && (
        <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
          {icon}
        </span>
      )}
      <div>
        <h2 className="text-base font-black text-ink-900 sm:text-lg">{title}</h2>
        {description && (
          <p className="mt-1 text-[12px] leading-6 text-ink-500">{description}</p>
        )}
      </div>
    </div>
  );
}

/** بدنه متنی استاندارد برای صفحات حقوقی و راهنما */
export function Prose({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "space-y-3 text-[13px] leading-8 text-ink-600",
        "[&_a]:font-bold [&_a]:text-brand-700 [&_a:hover]:underline",
        "[&_strong]:font-black [&_strong]:text-ink-800",
        "[&_ul]:list-disc [&_ul]:space-y-1.5 [&_ul]:pr-5",
        "[&_ol]:list-decimal [&_ol]:space-y-1.5 [&_ol]:pr-5",
        "[&_li]:marker:text-brand-500",
        className,
      )}
    >
      {children}
    </div>
  );
}
