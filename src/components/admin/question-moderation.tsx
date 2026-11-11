"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, MessageSquareReply, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";
import { DeleteButton } from "@/components/admin/delete-button";
import { formatDateTime } from "@/lib/format";

export type AdminQuestionRow = {
  id: string;
  body: string;
  answer: string | null;
  answerAt: string | null;
  isApproved: boolean;
  createdAt: string;
  productName: string;
  productSlug: string;
  userName: string;
  userEmail: string;
};

export function QuestionModeration({ rows }: { rows: AdminQuestionRow[] }) {
  const router = useRouter();
  const toast = useToast();
  const [target, setTarget] = React.useState<AdminQuestionRow | null>(null);
  const [answer, setAnswer] = React.useState("");
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const open = (row: AdminQuestionRow) => {
    setTarget(row);
    setAnswer(row.answer ?? "");
    setError(null);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!target) return;
    if (answer.trim().length < 2) {
      setError("متن پاسخ را وارد کنید.");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`/api/admin/questions/${target.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answer: answer.trim(), isApproved: true }),
      });
      const json = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        message?: string;
      };
      if (!res.ok || !json.ok) {
        setError(json.message ?? "ثبت پاسخ انجام نشد.");
        return;
      }
      toast.success("پاسخ ثبت شد", target.productName);
      setTarget(null);
      router.refresh();
    } catch {
      setError("خطای شبکه. لطفاً دوباره تلاش کنید.");
    } finally {
      setSaving(false);
    }
  };

  const approve = async (row: AdminQuestionRow) => {
    try {
      const res = await fetch(`/api/admin/questions/${row.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          answer: row.answer ?? "پاسخ توسط تیم پشتیبانی ثبت خواهد شد.",
          isApproved: true,
        }),
      });
      const json = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        message?: string;
      };
      if (!res.ok || !json.ok) {
        toast.error("عملیات انجام نشد", json.message);
        return;
      }
      toast.success("پرسش تأیید و منتشر شد");
      router.refresh();
    } catch {
      toast.error("خطای شبکه");
    }
  };

  return (
    <>
      <ul className="space-y-2.5">
        {rows.map((row) => (
          <li
            key={row.id}
            className="rounded-2xl border border-ink-100 bg-white p-4 shadow-xs"
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="min-w-0">
                <Link
                  href={`/product/${row.productSlug}`}
                  target="_blank"
                  className="line-clamp-1 text-[12px] font-black text-ink-900 hover:text-brand-700"
                >
                  {row.productName}
                </Link>
                <p className="mt-0.5 text-[10px] text-ink-500">
                  {row.userName}
                  <span dir="ltr" className="mr-1 text-ink-400">
                    ({row.userEmail})
                  </span>
                </p>
              </div>
              <div className="flex items-center gap-1.5">
                <Badge variant={row.answer ? "success" : "warning"} size="xs">
                  {row.answer ? "پاسخ داده شده" : "بدون پاسخ"}
                </Badge>
                {!row.isApproved && (
                  <Badge variant="danger" size="xs">
                    منتشرنشده
                  </Badge>
                )}
                <span className="text-[9px] text-ink-400">
                  {formatDateTime(row.createdAt)}
                </span>
              </div>
            </div>

            <p className="mt-2 rounded-xl bg-ink-50 px-3 py-2 text-[11px] leading-6 text-ink-700">
              {row.body}
            </p>

            {row.answer && (
              <div className="mt-2 rounded-xl border-r-2 border-brand-400 bg-brand-50/60 px-3 py-2">
                <p className="text-[9px] font-black text-brand-800">
                  پاسخ سَروا
                  {row.answerAt && (
                    <span className="mr-1 font-medium text-brand-600">
                      — {formatDateTime(row.answerAt)}
                    </span>
                  )}
                </p>
                <p className="mt-0.5 text-[10px] leading-5 text-ink-600">
                  {row.answer}
                </p>
              </div>
            )}

            <div className="mt-3 flex flex-wrap items-center gap-1 border-t border-ink-100 pt-2">
              <button
                type="button"
                onClick={() => open(row)}
                className="inline-flex h-8 items-center gap-1 rounded-lg px-2 text-[10px] font-bold text-brand-700 hover:bg-brand-50"
              >
                <MessageSquareReply className="h-3.5 w-3.5" />
                {row.answer ? "ویرایش پاسخ" : "پاسخ به پرسش"}
              </button>
              {!row.isApproved && (
                <button
                  type="button"
                  onClick={() => approve(row)}
                  className="inline-flex h-8 items-center gap-1 rounded-lg px-2 text-[10px] font-bold text-success-600 hover:bg-success-100/60"
                >
                  <Check className="h-3.5 w-3.5" />
                  تأیید انتشار
                </button>
              )}
              <DeleteButton
                endpoint={`/api/admin/questions/${row.id}`}
                itemName="پرسش"
                label=""
                description="حذف کامل پرسش کاربر. این عملیات قابل بازگشت نیست."
              />
            </div>
          </li>
        ))}
        {rows.length === 0 && (
          <li className="rounded-2xl border border-dashed border-ink-200 bg-white p-8 text-center text-[12px] text-ink-400">
            پرسشی با این فیلتر پیدا نشد.
          </li>
        )}
      </ul>

      <Dialog open={target !== null} onOpenChange={(value) => !value && setTarget(null)}>
        <DialogContent size="md">
          <DialogHeader>
            <DialogTitle>پاسخ به پرسش مشتری</DialogTitle>
          </DialogHeader>
          <form onSubmit={submit} className="contents">
            <DialogBody className="space-y-3">
              {target && (
                <div className="rounded-xl bg-ink-50 p-3 text-[11px] leading-6 text-ink-700">
                  {target.body}
                </div>
              )}
              <Textarea
                label="متن پاسخ"
                rows={4}
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="پاسخ رسمی فروشگاه سَروا…"
              />
              {error && (
                <p className="rounded-lg bg-danger-50 px-3 py-2 text-[11px] font-bold text-danger-600">
                  {error}
                </p>
              )}
            </DialogBody>
            <DialogFooter>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setTarget(null)}
                disabled={saving}
              >
                انصراف
              </Button>
              <Button type="submit" loading={saving} disabled={saving}>
                <Save className="h-4 w-4" />
                ثبت پاسخ
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
