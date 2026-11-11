"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, MessageSquareReply, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";
import { Badge } from "@/components/ui/badge";
import { Stars } from "@/components/ui/stars";
import { DeleteButton } from "@/components/admin/delete-button";
import { formatDateTime, toPersianDigits } from "@/lib/format";

export type AdminReviewRow = {
  id: string;
  rating: number;
  title: string;
  body: string;
  pros: string | null;
  cons: string | null;
  isApproved: boolean;
  isRecommended: boolean | null;
  reply: string | null;
  replyAt: string | null;
  createdAt: string;
  productId: string;
  productName: string;
  productSlug: string;
  userName: string;
  userEmail: string;
};

export function ReviewModeration({ rows }: { rows: AdminReviewRow[] }) {
  const router = useRouter();
  const toast = useToast();
  const [busyId, setBusyId] = React.useState<string | null>(null);
  const [replyTarget, setReplyTarget] = React.useState<AdminReviewRow | null>(null);
  const [reply, setReply] = React.useState("");
  const [savingReply, setSavingReply] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const patch = async (
    id: string,
    body: { isApproved?: boolean; reply?: string },
  ) => {
    const res = await fetch(`/api/admin/reviews/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const json = (await res.json().catch(() => ({}))) as {
      ok?: boolean;
      message?: string;
    };
    if (!res.ok || !json.ok) throw new Error(json.message ?? "عملیات انجام نشد.");
  };

  const toggleApproval = async (row: AdminReviewRow) => {
    setBusyId(row.id);
    try {
      await patch(row.id, { isApproved: !row.isApproved });
      toast.success(
        row.isApproved ? "نظر از انتشار خارج شد" : "نظر تأیید و منتشر شد",
        row.productName,
      );
      router.refresh();
    } catch (err) {
      toast.error("عملیات انجام نشد", err instanceof Error ? err.message : undefined);
    } finally {
      setBusyId(null);
    }
  };

  const openReply = (row: AdminReviewRow) => {
    setReplyTarget(row);
    setReply(row.reply ?? "");
    setError(null);
  };

  const submitReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyTarget) return;
    if (reply.trim().length < 2) {
      setError("متن پاسخ را وارد کنید.");
      return;
    }
    setSavingReply(true);
    try {
      await patch(replyTarget.id, { reply: reply.trim(), isApproved: true });
      toast.success("پاسخ ثبت شد", replyTarget.productName);
      setReplyTarget(null);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "ثبت پاسخ انجام نشد.");
    } finally {
      setSavingReply(false);
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
              <div className="flex flex-wrap items-center gap-1.5">
                <Badge variant={row.isApproved ? "success" : "warning"} size="xs">
                  {row.isApproved ? "منتشرشده" : "در انتظار تأیید"}
                </Badge>
                {row.isRecommended === true && (
                  <Badge variant="brand" size="xs">
                    پیشنهاد می‌کند
                  </Badge>
                )}
                {row.isRecommended === false && (
                  <Badge variant="danger" size="xs">
                    پیشنهاد نمی‌کند
                  </Badge>
                )}
                <span className="text-[9px] text-ink-400">
                  {formatDateTime(row.createdAt)}
                </span>
              </div>
            </div>

            <div className="mt-2 flex items-center gap-2">
              <Stars value={row.rating} size={13} />
              <span className="text-[10px] font-bold text-ink-600">
                {toPersianDigits(row.rating)} از {toPersianDigits(5)}
              </span>
            </div>

            <p className="mt-1.5 text-[12px] font-black text-ink-800">{row.title}</p>
            <p className="mt-1 text-[11px] leading-6 text-ink-600">{row.body}</p>

            {(row.pros || row.cons) && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {row.pros && (
                  <Badge variant="success" size="xs">
                    مزیت: {row.pros}
                  </Badge>
                )}
                {row.cons && (
                  <Badge variant="danger" size="xs">
                    عیب: {row.cons}
                  </Badge>
                )}
              </div>
            )}

            {row.reply && (
              <div className="mt-2.5 rounded-xl border-r-2 border-brand-400 bg-brand-50/60 px-3 py-2">
                <p className="text-[9px] font-black text-brand-800">
                  پاسخ سَروا
                  {row.replyAt && (
                    <span className="mr-1 font-medium text-brand-600">
                      — {formatDateTime(row.replyAt)}
                    </span>
                  )}
                </p>
                <p className="mt-0.5 text-[10px] leading-5 text-ink-600">{row.reply}</p>
              </div>
            )}

            <div className="mt-3 flex flex-wrap items-center gap-1 border-t border-ink-100 pt-2">
              <button
                type="button"
                onClick={() => toggleApproval(row)}
                disabled={busyId === row.id}
                className={
                  row.isApproved
                    ? "inline-flex h-8 items-center gap-1 rounded-lg px-2 text-[10px] font-bold text-warning-600 hover:bg-warning-100/60 disabled:opacity-50"
                    : "inline-flex h-8 items-center gap-1 rounded-lg px-2 text-[10px] font-bold text-success-600 hover:bg-success-100/60 disabled:opacity-50"
                }
              >
                {row.isApproved ? (
                  <X className="h-3.5 w-3.5" />
                ) : (
                  <Check className="h-3.5 w-3.5" />
                )}
                {row.isApproved ? "لغو انتشار" : "تأیید و انتشار"}
              </button>
              <button
                type="button"
                onClick={() => openReply(row)}
                className="inline-flex h-8 items-center gap-1 rounded-lg px-2 text-[10px] font-bold text-brand-700 hover:bg-brand-50"
              >
                <MessageSquareReply className="h-3.5 w-3.5" />
                {row.reply ? "ویرایش پاسخ" : "پاسخ"}
              </button>
              <DeleteButton
                endpoint={`/api/admin/reviews/${row.id}`}
                itemName={`نظر «${row.title}»`}
                label=""
                description="حذف کامل نظر و بازمحاسبه امتیاز محصول. این عملیات قابل بازگشت نیست."
              />
            </div>
          </li>
        ))}
        {rows.length === 0 && (
          <li className="rounded-2xl border border-dashed border-ink-200 bg-white p-8 text-center text-[12px] text-ink-400">
            نظری با این فیلتر پیدا نشد.
          </li>
        )}
      </ul>

      <Dialog
        open={replyTarget !== null}
        onOpenChange={(open) => !open && setReplyTarget(null)}
      >
        <DialogContent size="md">
          <DialogHeader>
            <DialogTitle>پاسخ به نظر مشتری</DialogTitle>
          </DialogHeader>
          <form onSubmit={submitReply} className="contents">
            <DialogBody className="space-y-3">
              {replyTarget && (
                <div className="rounded-xl bg-ink-50 p-3 text-[11px] leading-5 text-ink-600">
                  <p className="font-black text-ink-800">{replyTarget.title}</p>
                  <p className="mt-1">{replyTarget.body}</p>
                </div>
              )}
              <Textarea
                label="متن پاسخ"
                rows={4}
                value={reply}
                onChange={(e) => setReply(e.target.value)}
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
                onClick={() => setReplyTarget(null)}
                disabled={savingReply}
              >
                انصراف
              </Button>
              <Button type="submit" loading={savingReply} disabled={savingReply}>
                <Save className="h-4 w-4" />
                ثبت پاسخ و تأیید نظر
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
