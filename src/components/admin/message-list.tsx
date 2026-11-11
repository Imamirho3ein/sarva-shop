"use client";

import * as React from "react";
import { Mail, MailOpen } from "lucide-react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import { DeleteButton } from "@/components/admin/delete-button";
import { formatDateTime, toPersianDigits } from "@/lib/format";

export type ContactRow = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string;
  message: string;
  isRead: boolean;
  createdAt: string;
};

export type SubscriberRow = {
  id: string;
  email: string;
  source: string | null;
  isActive: boolean;
  createdAt: string;
};

export const SUBJECT_LABELS: Record<string, string> = {
  general: "پرسش عمومی",
  order: "پیگیری سفارش",
  product: "درباره محصول",
  payment: "پرداخت و کیف پول",
  partnership: "همکاری و فروشندگی",
  other: "سایر",
};

export function MessageList({ rows }: { rows: ContactRow[] }) {
  const router = useRouter();
  const toast = useToast();
  const [busyId, setBusyId] = React.useState<string | null>(null);

  const toggleRead = async (row: ContactRow) => {
    setBusyId(row.id);
    try {
      const res = await fetch(`/api/admin/messages/${row.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isRead: !row.isRead }),
      });
      const json = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        message?: string;
      };
      if (!res.ok || !json.ok) {
        toast.error("تغییر وضعیت انجام نشد", json.message);
        return;
      }
      toast.success(row.isRead ? "پیام خوانده‌نشده شد" : "پیام خوانده شد");
      router.refresh();
    } catch {
      toast.error("خطای شبکه");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <ul className="space-y-2.5">
      {rows.map((row) => (
        <li
          key={row.id}
          className={
            row.isRead
              ? "rounded-2xl border border-ink-100 bg-white p-4 shadow-xs"
              : "rounded-2xl border-r-4 border-brand-500 border-y border-l border-ink-100 bg-white p-4 shadow-xs"
          }
        >
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="flex flex-wrap items-center gap-1.5 text-[12px] font-black text-ink-900">
                {row.name}
                <Badge
                  variant={row.subject === "partnership" ? "accent" : "outline"}
                  size="xs"
                >
                  {SUBJECT_LABELS[row.subject] ?? row.subject}
                </Badge>
                {!row.isRead && (
                  <Badge variant="brand" size="xs">
                    جدید
                  </Badge>
                )}
              </p>
              <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-ink-500">
                <span dir="ltr" className="text-right">
                  {row.email}
                </span>
                {row.phone && (
                  <span dir="ltr" className="text-right">
                    {row.phone}
                  </span>
                )}
                <span className="text-ink-400">{formatDateTime(row.createdAt)}</span>
              </p>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => toggleRead(row)}
                disabled={busyId === row.id}
                className={
                  row.isRead
                    ? "inline-flex h-8 items-center gap-1 rounded-lg px-2 text-[10px] font-bold text-ink-500 hover:bg-ink-100 disabled:opacity-50"
                    : "inline-flex h-8 items-center gap-1 rounded-lg px-2 text-[10px] font-bold text-brand-700 hover:bg-brand-50 disabled:opacity-50"
                }
              >
                {row.isRead ? (
                  <Mail className="h-3.5 w-3.5" />
                ) : (
                  <MailOpen className="h-3.5 w-3.5" />
                )}
                {row.isRead ? "خوانده‌نشده" : "خوانده شد"}
              </button>
              <DeleteButton
                endpoint={`/api/admin/messages/${row.id}`}
                itemName={`پیام ${row.name}`}
                label=""
                description="حذف کامل پیام تماس. این عملیات قابل بازگشت نیست."
              />
            </div>
          </div>

          <p className="mt-2.5 whitespace-pre-line rounded-xl bg-ink-50 px-3 py-2.5 text-[11px] leading-6 text-ink-700">
            {row.message}
          </p>

          <div className="mt-2.5 flex flex-wrap gap-1.5 border-t border-ink-100 pt-2">
            <a
              href={`mailto:${row.email}?subject=${encodeURIComponent(
                `پاسخ سَروا — ${SUBJECT_LABELS[row.subject] ?? "پیام شما"}`,
              )}`}
              className="inline-flex h-8 items-center gap-1 rounded-lg px-2 text-[10px] font-bold text-brand-700 hover:bg-brand-50"
            >
              <Mail className="h-3.5 w-3.5" />
              پاسخ با ایمیل
            </a>
            <a
              href={`/admin/orders?q=${encodeURIComponent(row.email)}`}
              className="inline-flex h-8 items-center gap-1 rounded-lg px-2 text-[10px] font-bold text-ink-500 hover:bg-ink-100"
            >
              سفارش‌های این کاربر
            </a>
          </div>
        </li>
      ))}
      {rows.length === 0 && (
        <li className="rounded-2xl border border-dashed border-ink-200 bg-white p-8 text-center text-[12px] text-ink-400">
          پیامی با این فیلتر پیدا نشد.
        </li>
      )}
    </ul>
  );
}

export function SubscriberList({ rows }: { rows: SubscriberRow[] }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[620px] text-right text-[11px]">
          <thead className="bg-ink-50 text-[9px] text-ink-500">
            <tr>
              <th className="px-3 py-2.5 font-medium">ایمیل</th>
              <th className="px-3 py-2.5 font-medium">منبع</th>
              <th className="px-3 py-2.5 font-medium">وضعیت</th>
              <th className="px-3 py-2.5 font-medium">تاریخ عضویت</th>
              <th className="px-3 py-2.5 font-medium">عملیات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-100">
            {rows.map((row) => (
              <tr key={row.id} className="hover:bg-ink-50/50">
                <td dir="ltr" className="px-3 py-2.5 text-right font-bold text-ink-800">
                  {row.email}
                </td>
                <td className="px-3 py-2.5 text-ink-500">
                  {row.source === "footer" ? "فوتر سایت" : row.source ?? "—"}
                </td>
                <td className="px-3 py-2.5">
                  <Badge variant={row.isActive ? "success" : "danger"} size="xs">
                    {row.isActive ? "فعال" : "غیرفعال"}
                  </Badge>
                </td>
                <td className="px-3 py-2.5 text-[10px] text-ink-500">
                  {formatDateTime(row.createdAt)}
                </td>
                <td className="px-3 py-2.5">
                  <DeleteButton
                    endpoint={`/api/admin/newsletter/${row.id}`}
                    itemName={`عضویت ${row.email}`}
                    label=""
                    description="حذف این ایمیل از فهرست خبرنامه. این عملیات قابل بازگشت نیست."
                  />
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={5} className="py-8 text-center text-ink-400">
                  مشترکی با این فیلتر پیدا نشد.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <p className="border-t border-ink-100 px-3 py-2 text-[9px] text-ink-400">
        مجموع {toPersianDigits(rows.length)} ردیف در این صفحه
      </p>
    </div>
  );
}
