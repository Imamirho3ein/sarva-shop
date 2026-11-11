"use client";

import * as React from "react";
import { HelpCircle, Search, X } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { EmptyState } from "@/components/ui/misc";

export type FaqEntry = { question: string; answer: string };
export type FaqGroup = { title: string; items: FaqEntry[] };

export function FaqAccordion({ groups }: { groups: FaqGroup[] }) {
  const [query, setQuery] = React.useState("");
  const normalized = query.trim();

  const filtered = React.useMemo(() => {
    if (!normalized) return groups;
    return groups
      .map((group) => ({
        ...group,
        items: group.items.filter(
          (item) =>
            item.question.includes(normalized) || item.answer.includes(normalized),
        ),
      }))
      .filter((group) => group.items.length > 0);
  }, [groups, normalized]);

  const total = filtered.reduce((sum, group) => sum + group.items.length, 0);

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-ink-100 bg-white p-3 shadow-xs">
        <div className="relative">
          <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="جستجو در پرسش‌های متداول…"
            className="h-11 w-full rounded-xl border border-ink-200 bg-white pr-10 pl-10 text-[13px] text-ink-900 placeholder:text-ink-400 focus:border-brand-600 focus:outline-none focus:ring-4 focus:ring-brand-600/10"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="پاک کردن جستجو"
              className="absolute left-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg text-ink-400 hover:bg-ink-100 hover:text-ink-700"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <p className="mt-2 text-[10px] font-medium text-ink-400">
          {normalized
            ? `${total.toLocaleString("fa-IR")} نتیجه برای «${normalized}»`
            : "پاسخ پرتکرارترین پرسش‌های مشتریان سَروا"}
        </p>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<HelpCircle className="h-7 w-7" />}
          title="پاسخی پیدا نشد"
          description="عبارت دیگری را جستجو کنید یا از طریق فرم تماس با ما، پرسش خود را ثبت کنید."
        />
      ) : (
        filtered.map((group) => (
          <section
            key={group.title}
            className="overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-xs"
          >
            <h2 className="border-b border-ink-100 bg-ink-50/60 px-4 py-2.5 text-[12px] font-black text-ink-800">
              {group.title}
            </h2>
            <Accordion type="multiple" className="px-4">
              {group.items.map((item, index) => (
                <AccordionItem
                  key={`${group.title}-${index}`}
                  value={`${group.title}-${index}`}
                  className="group"
                >
                  <AccordionTrigger className="text-[12px] sm:text-[13px]">
                    {item.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-[12px] leading-7 text-ink-500">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </section>
        ))
      )}
    </div>
  );
}
