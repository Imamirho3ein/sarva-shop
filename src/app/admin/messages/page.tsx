import type { Metadata } from "next";
import Link from "next/link";
import { Mail, Search, Send } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/ui/pagination";
import {
  MessageList,
  SubscriberList,
  type ContactRow,
  type SubscriberRow,
} from "@/components/admin/message-list";
import { toPersianDigits } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Prisma } from "@prisma/client";

export const metadata: Metadata = {
  title: "پیام‌ها | پنل مدیریت",
  robots: { index: false, follow: false },
};

const PER_PAGE = 15;

const TABS = [
  { key: "inbox", label: "پیام‌های تماس" },
  { key: "newsletter", label: "خبرنامه" },
];

export default async function AdminMessagesPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; q?: string; page?: string }>;
}) {
  const params = await searchParams;
  const tab = TABS.some((t) => t.key === params.tab) ? params.tab! : "inbox";
  const q = (params.q ?? "").trim();
  const page = Math.max(1, Number(params.page) || 1);

  const contactWhere: Prisma.ContactMessageWhereInput = q
    ? {
        OR: [
          { name: { contains: q, mode: "insensitive" as const } },
          { email: { contains: q, mode: "insensitive" as const } },
          { phone: { contains: q } },
          { message: { contains: q, mode: "insensitive" as const } },
        ],
      }
    : {};
  const subscriberWhere: Prisma.NewsletterSubscriberWhereInput = q
    ? { email: { contains: q, mode: "insensitive" as const } }
    : {};

  const [messages, subscribers, totalMessages, unreadCount, subscriberCount, totalSubscribers] =
    await Promise.all([
      tab === "inbox"
        ? prisma.contactMessage.findMany({
            where: contactWhere,
            orderBy: { createdAt: "desc" },
            skip: (page - 1) * PER_PAGE,
            take: PER_PAGE,
          })
        : Promise.resolve([]),
      tab === "newsletter"
        ? prisma.newsletterSubscriber.findMany({
            where: subscriberWhere,
            orderBy: { createdAt: "desc" },
            skip: (page - 1) * PER_PAGE,
            take: PER_PAGE,
          })
        : Promise.resolve([]),
      prisma.contactMessage.count(),
      prisma.contactMessage.count({ where: { isRead: false } }),
      prisma.newsletterSubscriber.count(),
      prisma.newsletterSubscriber.count({ where: subscriberWhere }),
    ]);

  const contactRows: ContactRow[] = messages.map((message) => ({
    id: message.id,
    name: message.name,
    email: message.email,
    phone: message.phone,
    subject: message.subject,
    message: message.message,
    isRead: message.isRead,
    createdAt: message.createdAt.toISOString(),
  }));

  const subscriberRows: SubscriberRow[] = subscribers.map((subscriber) => ({
    id: subscriber.id,
    email: subscriber.email,
    source: subscriber.source,
    isActive: subscriber.isActive,
    createdAt: subscriber.createdAt.toISOString(),
  }));

  const total = tab === "inbox" ? totalMessages : totalSubscribers;
  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));

  const href = (nextPage: number, nextTab?: string) => {
    const query = new URLSearchParams();
    const t = nextTab ?? tab;
    if (t !== "inbox") query.set("tab", t);
    if (q) query.set("q", q);
    if (nextPage > 1) query.set("page", String(nextPage));
    const qs = query.toString();
    return qs ? `/admin/messages?${qs}` : "/admin/messages";
  };

  const hrefBase = (() => {
    const query = new URLSearchParams();
    if (tab !== "inbox") query.set("tab", tab);
    if (q) query.set("q", q);
    query.set("page", "{page}");
    return `/admin/messages?${query.toString()}`;
  })();

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-ink-100 bg-white p-4 shadow-xs">
        <div>
          <h1 className="flex items-center gap-1.5 text-base font-black text-ink-900">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
              <Mail className="h-4 w-4" />
            </span>
            پیام‌ها و خبرنامه
          </h1>
          <p className="mt-1 text-[11px] text-ink-500">
            {toPersianDigits(unreadCount)} پیام خوانده‌نشده از{" "}
            {toPersianDigits(totalMessages)} پیام —{" "}
            {toPersianDigits(subscriberCount)} مشترک خبرنامه
          </p>
        </div>
        {unreadCount > 0 && (
          <Link
            href="/admin/messages"
            className="rounded-lg bg-brand-50 px-2.5 py-1.5 text-[10px] font-bold text-brand-700 hover:bg-brand-100"
          >
            {toPersianDigits(unreadCount)} پیام جدید
          </Link>
        )}
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
              {item.key === "newsletter" ? (
                <Send className="h-3.5 w-3.5" />
              ) : (
                <Mail className="h-3.5 w-3.5" />
              )}
              {item.label}
              <span
                className={cn(
                  "rounded-full px-1.5 py-0.5 text-[9px] font-black",
                  item.key === tab ? "bg-white/20 text-white" : "bg-white text-ink-500",
                )}
              >
                {toPersianDigits(
                  item.key === "newsletter" ? subscriberCount : totalMessages,
                )}
              </span>
            </Link>
          ))}
        </div>

        <form className="flex items-center gap-2">
          {tab !== "inbox" && <input type="hidden" name="tab" value={tab} />}
          <div className="relative min-w-48">
            <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
            <input
              name="q"
              defaultValue={q}
              placeholder={
                tab === "newsletter" ? "جستجوی ایمیل…" : "جستجوی نام، ایمیل یا متن…"
              }
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

      {tab === "inbox" ? (
        <MessageList rows={contactRows} />
      ) : (
        <SubscriberList rows={subscriberRows} />
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center rounded-2xl border border-ink-100 bg-white p-3 shadow-xs">
          <Pagination page={page} totalPages={totalPages} hrefBase={hrefBase} />
        </div>
      )}
    </div>
  );
}
