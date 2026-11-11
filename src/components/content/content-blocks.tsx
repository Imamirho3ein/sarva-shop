import * as React from "react";
import { cn } from "@/lib/utils";

/** کارت پایه برای بلوک‌های محتوایی */
export function ContentCard({
  id,
  title,
  description,
  icon,
  children,
  className,
  actions,
}: {
  id?: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  actions?: React.ReactNode;
}) {
  return (
    <section
      id={id}
      className={cn(
        "scroll-mt-24 rounded-2xl border border-ink-100 bg-white p-4 shadow-xs sm:p-5",
        className,
      )}
    >
      {(title || actions) && (
        <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
          <div className="flex items-start gap-2.5">
            {icon && (
              <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
                {icon}
              </span>
            )}
            <div>
              {title && <h2 className="text-sm font-black text-ink-900 sm:text-base">{title}</h2>}
              {description && (
                <p className="mt-1 text-[11px] leading-6 text-ink-500">{description}</p>
              )}
            </div>
          </div>
          {actions}
        </div>
      )}
      {children}
    </section>
  );
}

/** فهرست مراحل شماره‌دار */
export function Steps({
  steps,
  className,
}: {
  steps: { title: string; description: React.ReactNode }[];
  className?: string;
}) {
  return (
    <ol className={cn("relative space-y-4", className)}>
      {steps.map((step, index) => (
        <li key={step.title} className="relative flex gap-3">
          <span className="relative flex flex-col items-center">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-700 text-[11px] font-black text-white">
              {toFa(index + 1)}
            </span>
            {index < steps.length - 1 && (
              <span aria-hidden className="mt-1 w-px flex-1 bg-ink-100" />
            )}
          </span>
          <div className="pb-1">
            <p className="text-[13px] font-black text-ink-800">{step.title}</p>
            <p className="mt-1 text-[12px] leading-6 text-ink-500">{step.description}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}

/** بلوک‌های حقوقی شماره‌دار با لینک لنگر */
export function LegalSections({
  sections,
}: {
  sections: { id: string; title: string; body: React.ReactNode }[];
}) {
  return (
    <div className="space-y-3">
      {sections.map((section, index) => (
        <section
          key={section.id}
          id={section.id}
          className="scroll-mt-24 rounded-2xl border border-ink-100 bg-white p-4 shadow-xs sm:p-5"
        >
          <h2 className="flex items-start gap-2 text-[13px] font-black text-ink-900 sm:text-sm">
            <span className="flex h-6 min-w-6 items-center justify-center rounded-md bg-ink-100 px-1 text-[10px] font-black text-ink-500">
              {toFa(index + 1)}
            </span>
            {section.title}
          </h2>
          <div className="mt-2 space-y-2 text-[12px] leading-7 text-ink-600 sm:text-[13px]">
            {section.body}
          </div>
        </section>
      ))}
    </div>
  );
}

/** شبکه آمار کوتاه */
export function StatGrid({ items }: { items: { value: string; label: string }[] }) {
  return (
    <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
      {items.map((item) => (
        <div
          key={item.label}
          className="rounded-2xl border border-ink-100 bg-white p-3.5 text-center shadow-xs"
        >
          <p className="text-lg font-black text-brand-800">{item.value}</p>
          <p className="mt-0.5 text-[10px] font-medium text-ink-500">{item.label}</p>
        </div>
      ))}
    </div>
  );
}

function toFa(value: number) {
  return String(value).replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[Number(d)]);
}
