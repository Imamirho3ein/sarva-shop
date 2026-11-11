"use client";

import * as React from "react";
import Link from "next/link";
import {
  BadgePercent,
  Bell,
  CheckCheck,
  Info,
  Package,
  ChevronLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/misc";
import { useToast } from "@/components/ui/toast";
import { formatDateTime, toPersianDigits } from "@/lib/format";

export type NotificationItem = {
  id: string;
  title: string;
  body: string;
  link: string | null;
  type: string;
  isRead: boolean;
  createdAt: string;
};

const ICONS: Record<string, React.ReactNode> = {
  order: <Package className="h-4 w-4" />,
  promo: <BadgePercent className="h-4 w-4" />,
  system: <Bell className="h-4 w-4" />,
  info: <Info className="h-4 w-4" />,
};

export function NotificationsList({ initial }: { initial: NotificationItem[] }) {
  const toast = useToast();
  const [items, setItems] = React.useState(initial);
  const [marking, setMarking] = React.useState(false);
  const unread = items.filter((i) => !i.isRead).length;

  const markAll = async () => {
    if (unread === 0) return;
    setMarking(true);
    try {
      const res = await fetch("/api/account/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ all: true }),
      });
      const json = (await res.json().catch(() => ({}))) as { ok?: boolean; message?: string };
      if (!res.ok || !json.ok) {
        toast.error("علامت‌گذاری انجام نشد", json.message);
        return;
      }
      setItems((prev) => prev.map((i) => ({ ...i, isRead: true })));
      toast.success("همه اعلان‌ها خوانده‌شده شدند");
    } catch {
      toast.error("خطای شبکه", "لطفاً دوباره تلاش کنید.");
    } finally {
      setMarking(false);
    }
  };

  const markOne = async (id: string) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, isRead: true } : i)));
    try {
      await fetch(`/api/account/notifications/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isRead: true }),
      });
    } catch {
      // خطای علامت‌گذاری نباید مانع مطالعه اعلان شود.
    }
  };

  if (items.length === 0) {
    return (
      <EmptyState
        icon={<Bell className="h-8 w-8" />}
        title="اعلانی ندارید"
        description="اطلاع‌رسانی‌های سفارش‌ها، تخفیف‌ها و مناسبت‌ها اینجا نمایش داده می‌شود."
        action={
          <Button asChild variant="outline">
            <Link href="/products">مشاهده محصولات</Link>
          </Button>
        }
      />
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-ink-100 bg-white p-4 shadow-xs">
        <div>
          <h2 className="text-sm font-black text-ink-900">اعلان‌های من</h2>
          <p className="mt-0.5 text-[11px] text-ink-500">
            {unread > 0
              ? `${toPersianDigits(unread)} اعلان خوانده‌نشده دارید.`
              : "همه اعلان‌ها خوانده شده‌اند."}
          </p>
        </div>
        {unread > 0 && (
          <Button size="sm" variant="outline" onClick={markAll} loading={marking}>
            <CheckCheck className="h-4 w-4" />
            خواندن همه
          </Button>
        )}
      </div>

      <ul className="space-y-2">
        {items.map((item) => {
          const content = (
            <>
              <span
                className={cn(
                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
                  item.isRead ? "bg-ink-100 text-ink-500" : "bg-brand-50 text-brand-700",
                )}
              >
                {ICONS[item.type] ?? ICONS.info}
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-start justify-between gap-2">
                  <span
                    className={cn(
                      "text-[12px] leading-5",
                      item.isRead ? "font-bold text-ink-700" : "font-black text-ink-900",
                    )}
                  >
                    {item.title}
                  </span>
                  {!item.isRead && (
                    <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-danger-600" />
                  )}
                </span>
                <span className="mt-0.5 block text-[11px] leading-5 text-ink-500">
                  {item.body}
                </span>
                <span className="mt-1 block text-[10px] text-ink-400">
                  {formatDateTime(item.createdAt)}
                </span>
              </span>
              {item.link && (
                <ChevronLeft className="mt-2 h-4 w-4 shrink-0 self-start text-ink-300" />
              )}
            </>
          );

          return (
            <li key={item.id}>
              {item.link ? (
                <Link
                  href={item.link}
                  onClick={() => markOne(item.id)}
                  className={cn(
                    "flex items-start gap-2.5 rounded-2xl border bg-white p-3.5 transition-colors hover:border-brand-200",
                    item.isRead ? "border-ink-100" : "border-brand-100 bg-brand-50/30",
                  )}
                >
                  {content}
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={() => markOne(item.id)}
                  className={cn(
                    "flex w-full items-start gap-2.5 rounded-2xl border bg-white p-3.5 text-right transition-colors hover:border-brand-200",
                    item.isRead ? "border-ink-100" : "border-brand-100 bg-brand-50/30",
                  )}
                >
                  {content}
                </button>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
