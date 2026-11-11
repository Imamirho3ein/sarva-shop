import * as React from "react";
import Link from "next/link";
import { CalendarDays, FileText, ScrollText } from "lucide-react";
import { PageHeader } from "@/components/content/page-header";
import { LegalSections } from "@/components/content/content-blocks";
import { Badge } from "@/components/ui/badge";

export type LegalSection = { id: string; title: string; body: React.ReactNode };

/**
 * قالب مشترک صفحات حقوقی: سربرگ + فهرست چسبان + بخش‌های شماره‌دار.
 */
export function LegalPage({
  eyebrow,
  title,
  description,
  icon,
  sections,
  updatedAt,
  intro,
}: {
  eyebrow?: string;
  title: string;
  description: string;
  icon?: React.ReactNode;
  sections: LegalSection[];
  updatedAt: string;
  intro?: React.ReactNode;
}) {
  return (
    <div className="container-site space-y-4 py-4 lg:py-6">
      <PageHeader
        eyebrow={eyebrow ?? "اسناد و قوانین"}
        title={title}
        description={description}
        crumbs={[{ label: title }]}
        icon={icon ?? <ScrollText className="h-6 w-6" />}
        meta={
          <Badge variant="outline">
            <CalendarDays className="h-3 w-3" />
            آخرین به‌روزرسانی: {updatedAt}
          </Badge>
        }
      />

      <div className="grid gap-4 lg:grid-cols-[240px_1fr]">
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <nav
            aria-label="فهرست بخش‌ها"
            className="overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-xs"
          >
            <p className="flex items-center gap-1.5 border-b border-ink-100 bg-ink-50/60 px-3 py-2.5 text-[11px] font-black text-ink-800">
              <FileText className="h-3.5 w-3.5 text-brand-700" />
              فهرست بخش‌ها
            </p>
            <ol className="max-h-[60vh] space-y-0.5 overflow-y-auto p-2">
              {sections.map((section, index) => (
                <li key={section.id}>
                  <Link
                    href={`#${section.id}`}
                    className="flex items-start gap-2 rounded-lg px-2 py-1.5 text-[11px] leading-5 text-ink-600 transition-colors hover:bg-brand-50 hover:text-brand-800"
                  >
                    <span className="mt-0.5 text-[9px] font-black text-ink-300">
                      {String(index + 1).replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[Number(d)])}
                    </span>
                    {section.title}
                  </Link>
                </li>
              ))}
            </ol>
          </nav>
        </aside>

        <div className="space-y-3">
          {intro && (
            <div className="rounded-2xl border border-brand-100 bg-brand-50/60 p-4 text-[12px] leading-7 text-brand-900/80">
              {intro}
            </div>
          )}
          <LegalSections sections={sections} />
        </div>
      </div>
    </div>
  );
}
