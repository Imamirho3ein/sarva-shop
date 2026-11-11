import type { Metadata } from "next";
import Link from "next/link";
import { MessageSquare, Search } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/ui/pagination";
import {
  QuestionModeration,
  type AdminQuestionRow,
} from "@/components/admin/question-moderation";
import { formatDate, toPersianDigits } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Prisma } from "@prisma/client";

export const metadata: Metadata = {
  title: "پرسش‌ها | پنل مدیریت",
  robots: { index: false, follow: false },
};

const PER_PAGE = 12;

const TABS = [
  { key: "open", label: "بدون پاسخ" },
  { key: "answered", label: "پاسخ داده‌شده" },
  { key: "all", label: "همه" },
];

export default async function AdminQuestionsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; q?: string; page?: string }>;
}) {
  const params = await searchParams;
  const tab = TABS.some((t) => t.key === params.tab) ? params.tab! : "open";
  const q = (params.q ?? "").trim();
  const page = Math.max(1, Number(params.page) || 1);

  const where: Prisma.QuestionWhereInput = {
    ...(tab === "open"
      ? { answer: null }
      : tab === "answered"
        ? { answer: { not: null } }
        : {}),
    ...(q
      ? {
          OR: [
            { body: { contains: q, mode: "insensitive" as const } },
            { answer: { contains: q, mode: "insensitive" as const } },
            { product: { name: { contains: q, mode: "insensitive" as const } } },
            { user: { name: { contains: q, mode: "insensitive" as const } } },
          ],
        }
      : {}),
  };

  const [questions, total, openCount, answeredCount] = await Promise.all([
    prisma.question.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PER_PAGE,
      take: PER_PAGE,
      include: {
        product: { select: { name: true, slug: true } },
        user: { select: { name: true, email: true } },
      },
    }),
    prisma.question.count({ where }),
    prisma.question.count({ where: { answer: null } }),
    prisma.question.count({ where: { answer: { not: null } } }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));

  const href = (nextPage: number, nextTab?: string) => {
    const query = new URLSearchParams();
    const t = nextTab ?? tab;
    if (t !== "open") query.set("tab", t);
    if (q) query.set("q", q);
    if (nextPage > 1) query.set("page", String(nextPage));
    const qs = query.toString();
    return qs ? `/admin/questions?${qs}` : "/admin/questions";
  };

  const hrefBase = (() => {
    const query = new URLSearchParams();
    if (tab !== "open") query.set("tab", tab);
    if (q) query.set("q", q);
    query.set("page", "{page}");
    return `/admin/questions?${query.toString()}`;
  })();

  const rows: AdminQuestionRow[] = questions.map((row) => ({
    id: row.id,
    body: row.body,
    answer: row.answer,
    answerAt: row.answerAt?.toISOString() ?? null,
    isApproved: row.isApproved,
    createdAt: row.createdAt.toISOString(),
    productName: row.product.name,
    productSlug: row.product.slug,
    userName: row.user.name,
    userEmail: row.user.email,
  }));

  const counts: Record<string, number> = {
    open: openCount,
    answered: answeredCount,
    all: openCount + answeredCount,
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-ink-100 bg-white p-4 shadow-xs">
        <div>
          <h1 className="flex items-center gap-1.5 text-base font-black text-ink-900">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
              <MessageSquare className="h-4 w-4" />
            </span>
            پرسش و پاسخ محصولات
          </h1>
          <p className="mt-1 text-[11px] text-ink-500">
            {toPersianDigits(openCount)} پرسش بدون پاسخ — آخرین بروزرسانی:{" "}
            {formatDate(new Date())}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-ink-100 bg-white p-3 shadow-xs">
        <div className="flex flex-wrap gap-1.5">
          {TABS.map((item) => (
            <Link
              key={item.key}
              href={href(1, item.key)}
              className={cn(
                "flex items-center gap-1.5 rounded-lg px-3 py-2 text-[11px] font-bold transition-colors",
                item.key === tab
                  ? "bg-brand-700 text-white"
                  : "bg-ink-50 text-ink-600 hover:bg-ink-100",
              )}
            >
              {item.label}
              <span
                className={cn(
                  "rounded-full px-1.5 py-0.5 text-[9px] font-black",
                  item.key === tab ? "bg-white/20 text-white" : "bg-white text-ink-500",
                )}
              >
                {toPersianDigits(counts[item.key] ?? 0)}
              </span>
            </Link>
          ))}
        </div>

        <form className="flex items-center gap-2">
          {tab !== "open" && <input type="hidden" name="tab" value={tab} />}
          <div className="relative min-w-48">
            <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
            <input
              name="q"
              defaultValue={q}
              placeholder="جستجوی متن، محصول یا کاربر…"
              className="h-10 w-full rounded-xl border border-ink-200 bg-white pr-9 pl-3 text-[12px] text-ink-900 placeholder:text-ink-400 focus:border-brand-600 focus:outline-none focus:ring-4 focus:ring-brand-600/10"
            />
          </div>
          <Button type="submit" size="sm" variant="outline">
            جستجو
          </Button>
          {q && (
            <Link
              href={href(1)}
              className="text-[10px] font-bold text-ink-500 hover:text-danger-600"
            >
              حذف
            </Link>
          )}
        </form>
      </div>

      <QuestionModeration rows={rows} />

      {totalPages > 1 && (
        <div className="flex items-center justify-center rounded-2xl border border-ink-100 bg-white p-3 shadow-xs">
          <Pagination page={page} totalPages={totalPages} hrefBase={hrefBase} />
        </div>
      )}
    </div>
  );
}
