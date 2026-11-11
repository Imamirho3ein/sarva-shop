"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { BadgePercent, Pencil, Plus, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
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
import { formatDate, formatPrice, toPersianDigits } from "@/lib/format";

export type CouponRow = {
  id: string;
  code: string;
  type: "PERCENT" | "FIXED";
  value: number;
  minOrder: number;
  maxDiscount: number | null;
  usageLimit: number | null;
  usedCount: number;
  perUserLimit: number;
  startsAt: string | null;
  expiresAt: string | null;
  description: string | null;
  isActive: boolean;
};

const EMPTY = {
  code: "",
  type: "PERCENT" as "PERCENT" | "FIXED",
  value: 10,
  minOrder: 0,
  maxDiscount: "" as number | "",
  usageLimit: "" as number | "",
  perUserLimit: 1,
  startsAt: "",
  expiresAt: "",
  description: "",
  isActive: true,
};

function toDateInput(value: string | null) {
  if (!value) return "";
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? "" : d.toISOString().slice(0, 10);
}

export function CouponManager({ rows }: { rows: CouponRow[] }) {
  const router = useRouter();
  const toast = useToast();
  const [open, setOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<CouponRow | null>(null);
  const [form, setForm] = React.useState({ ...EMPTY });
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const openCreate = () => {
    setEditing(null);
    setForm({ ...EMPTY });
    setError(null);
    setOpen(true);
  };

  const openEdit = (row: CouponRow) => {
    setEditing(row);
    setForm({
      code: row.code,
      type: row.type,
      value: row.value,
      minOrder: row.minOrder,
      maxDiscount: row.maxDiscount ?? "",
      usageLimit: row.usageLimit ?? "",
      perUserLimit: row.perUserLimit,
      startsAt: toDateInput(row.startsAt),
      expiresAt: toDateInput(row.expiresAt),
      description: row.description ?? "",
      isActive: row.isActive,
    });
    setError(null);
    setOpen(true);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (form.code.trim().length < 3) return setError("کد تخفیف حداقل ۳ کاراکتر باشد.");
    if (!form.value || form.value <= 0) return setError("مقدار تخفیف را وارد کنید.");
    if (form.type === "PERCENT" && form.value > 100) {
      return setError("درصد تخفیف نمی‌تواند بیشتر از ۱۰۰ باشد.");
    }

    setSaving(true);
    try {
      const res = await fetch(
        editing ? `/api/admin/coupons/${editing.id}` : "/api/admin/coupons",
        {
          method: editing ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            code: form.code.trim(),
            type: form.type,
            value: Number(form.value),
            minOrder: Number(form.minOrder) || 0,
            maxDiscount: form.maxDiscount === "" ? null : Number(form.maxDiscount),
            usageLimit: form.usageLimit === "" ? null : Number(form.usageLimit),
            perUserLimit: Number(form.perUserLimit) || 1,
            startsAt: form.startsAt ? new Date(form.startsAt).toISOString() : null,
            expiresAt: form.expiresAt ? new Date(form.expiresAt).toISOString() : null,
            description: form.description.trim(),
            isActive: form.isActive,
          }),
        },
      );
      const json = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        message?: string;
      };
      if (!res.ok || !json.ok) {
        setError(json.message ?? "ذخیره کد تخفیف انجام نشد.");
        return;
      }
      toast.success(editing ? "کد تخفیف ویرایش شد" : "کد تخفیف ایجاد شد");
      setOpen(false);
      router.refresh();
    } catch {
      setError("خطای شبکه. لطفاً دوباره تلاش کنید.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-ink-100 bg-white p-4 shadow-xs">
        <div>
          <h1 className="flex items-center gap-1.5 text-base font-black text-ink-900">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent-100 text-accent-700">
              <BadgePercent className="h-4 w-4" />
            </span>
            کدهای تخفیف
          </h1>
          <p className="mt-1 text-[11px] text-ink-500">
            {toPersianDigits(rows.length)} کد ثبت شده است.
          </p>
        </div>
        <Button size="sm" onClick={openCreate}>
          <Plus className="h-4 w-4" />
          کد تخفیف جدید
        </Button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-right text-[11px]">
            <thead className="bg-ink-50 text-[9px] text-ink-500">
              <tr>
                <th className="px-3 py-2.5 font-medium">کد</th>
                <th className="px-3 py-2.5 font-medium">تخفیف</th>
                <th className="px-3 py-2.5 font-medium">حداقل سفارش</th>
                <th className="px-3 py-2.5 font-medium">استفاده</th>
                <th className="px-3 py-2.5 font-medium">اعتبار</th>
                <th className="px-3 py-2.5 font-medium">وضعیت</th>
                <th className="px-3 py-2.5 font-medium">عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {rows.map((row) => {
                const expired =
                  row.expiresAt && new Date(row.expiresAt).getTime() < Date.now();
                const full =
                  row.usageLimit !== null && row.usedCount >= row.usageLimit;
                return (
                  <tr key={row.id} className="hover:bg-ink-50/50">
                    <td className="px-3 py-2.5">
                      <p dir="ltr" className="text-right font-black text-ink-800">
                        {row.code}
                      </p>
                      {row.description && (
                        <p className="mt-0.5 line-clamp-1 text-[9px] text-ink-400">
                          {row.description}
                        </p>
                      )}
                    </td>
                    <td className="px-3 py-2.5 font-bold text-brand-800">
                      {row.type === "PERCENT"
                        ? `${toPersianDigits(row.value)}٪`
                        : formatPrice(row.value)}
                      {row.maxDiscount ? (
                        <span className="mr-1 text-[9px] font-medium text-ink-400">
                          (سقف {formatPrice(row.maxDiscount)})
                        </span>
                      ) : null}
                    </td>
                    <td className="px-3 py-2.5 text-ink-600">
                      {row.minOrder > 0 ? formatPrice(row.minOrder) : "—"}
                    </td>
                    <td className="px-3 py-2.5 text-ink-600">
                      {toPersianDigits(row.usedCount)}
                      {row.usageLimit ? ` / ${toPersianDigits(row.usageLimit)}` : ""}
                    </td>
                    <td className="px-3 py-2.5 text-[10px] text-ink-500">
                      {row.expiresAt ? formatDate(row.expiresAt) : "بدون انقضا"}
                    </td>
                    <td className="px-3 py-2.5">
                      <Badge
                        variant={
                          !row.isActive || expired || full ? "default" : "success"
                        }
                        size="xs"
                      >
                        {!row.isActive
                          ? "غیرفعال"
                          : expired
                            ? "منقضی"
                            : full
                              ? "تکمیل ظرفیت"
                              : "فعال"}
                      </Badge>
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => openEdit(row)}
                          className="inline-flex h-8 items-center gap-1 rounded-lg px-2 text-[10px] font-bold text-brand-700 hover:bg-brand-50"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                          ویرایش
                        </button>
                        <DeleteButton
                          endpoint={`/api/admin/coupons/${row.id}`}
                          itemName={row.code}
                          label=""
                          description="حذف کد تخفیف. اگر در سفارشی استفاده شده باشد، فقط می‌توانید آن را غیرفعال کنید."
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-ink-400">
                    کد تخفیفی ثبت نشده است.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent size="md">
          <DialogHeader>
            <DialogTitle>
              {editing ? `ویرایش «${editing.code}»` : "کد تخفیف جدید"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={submit} id="coupon-form" className="contents">
            <DialogBody className="space-y-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <Input
                  label="کد تخفیف"
                  value={form.code}
                  onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
                  dir="ltr"
                  className="text-left uppercase"
                  placeholder="SARVA20"
                />
                <Select
                  label="نوع تخفیف"
                  options={[
                    { value: "PERCENT", label: "درصدی" },
                    { value: "FIXED", label: "مبلغ ثابت" },
                  ]}
                  value={form.type}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, type: e.target.value as "PERCENT" | "FIXED" }))
                  }
                />
                <Input
                  label={form.type === "PERCENT" ? "درصد تخفیف" : "مبلغ تخفیف (تومان)"}
                  type="number"
                  min={1}
                  value={form.value}
                  onChange={(e) => setForm((f) => ({ ...f, value: Number(e.target.value) }))}
                />
                <Input
                  label="حداقل مبلغ سفارش (تومان)"
                  type="number"
                  min={0}
                  value={form.minOrder}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, minOrder: Number(e.target.value) }))
                  }
                />
                <Input
                  label="سقف تخفیف (تومان) — اختیاری"
                  type="number"
                  min={0}
                  value={form.maxDiscount}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      maxDiscount: e.target.value === "" ? "" : Number(e.target.value),
                    }))
                  }
                />
                <Input
                  label="سقف کل استفاده — اختیاری"
                  type="number"
                  min={1}
                  value={form.usageLimit}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      usageLimit: e.target.value === "" ? "" : Number(e.target.value),
                    }))
                  }
                />
                <Input
                  label="محدودیت هر کاربر"
                  type="number"
                  min={1}
                  value={form.perUserLimit}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, perUserLimit: Number(e.target.value) }))
                  }
                />
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    label="شروع"
                    type="date"
                    value={form.startsAt}
                    onChange={(e) => setForm((f) => ({ ...f, startsAt: e.target.value }))}
                  />
                  <Input
                    label="پایان"
                    type="date"
                    value={form.expiresAt}
                    onChange={(e) => setForm((f) => ({ ...f, expiresAt: e.target.value }))}
                  />
                </div>
              </div>
              <Textarea
                label="توضیح کوتاه — اختیاری"
                rows={2}
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              />
              <Checkbox
                label="فعال"
                checked={form.isActive}
                onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
              />
              {error && (
                <p className="rounded-lg bg-danger-50 px-3 py-2 text-[11px] font-bold text-danger-600">
                  {error}
                </p>
              )}
            </DialogBody>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
                انصراف
              </Button>
              <Button type="submit" loading={saving} disabled={saving}>
                <Save className="h-4 w-4" />
                {editing ? "ذخیره تغییرات" : "ایجاد کد"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
