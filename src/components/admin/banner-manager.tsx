"use client";

import * as React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Images, Pencil, Plus, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { formatDate, toPersianDigits } from "@/lib/format";

export type BannerRow = {
  id: string;
  title: string;
  subtitle: string | null;
  image: string;
  link: string | null;
  badge: string | null;
  theme: string;
  order: number;
  isActive: boolean;
  startsAt: string | null;
  endsAt: string | null;
};

const THEME_LABELS: Record<string, string> = {
  light: "روشن",
  dark: "تیره",
  brand: "برند",
  accent: "نارنجی",
};

const EMPTY = {
  title: "",
  subtitle: "",
  image: "",
  link: "",
  badge: "",
  theme: "light",
  order: 0,
  isActive: true,
  startsAt: "",
  endsAt: "",
};

function toDateInput(value: string | null) {
  if (!value) return "";
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? "" : d.toISOString().slice(0, 10);
}

export function BannerManager({ rows }: { rows: BannerRow[] }) {
  const router = useRouter();
  const toast = useToast();
  const [open, setOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<BannerRow | null>(null);
  const [form, setForm] = React.useState({ ...EMPTY });
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const openCreate = () => {
    setEditing(null);
    setForm({ ...EMPTY });
    setError(null);
    setOpen(true);
  };

  const openEdit = (row: BannerRow) => {
    setEditing(row);
    setForm({
      title: row.title,
      subtitle: row.subtitle ?? "",
      image: row.image,
      link: row.link ?? "",
      badge: row.badge ?? "",
      theme: row.theme,
      order: row.order,
      isActive: row.isActive,
      startsAt: toDateInput(row.startsAt),
      endsAt: toDateInput(row.endsAt),
    });
    setError(null);
    setOpen(true);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (form.title.trim().length < 2) return setError("عنوان بنر را وارد کنید.");
    if (!form.image.trim()) return setError("آدرس تصویر بنر را وارد کنید.");

    setSaving(true);
    try {
      const res = await fetch(
        editing ? `/api/admin/banners/${editing.id}` : "/api/admin/banners",
        {
          method: editing ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: form.title.trim(),
            subtitle: form.subtitle.trim(),
            image: form.image.trim(),
            link: form.link.trim(),
            badge: form.badge.trim(),
            theme: form.theme,
            order: Number(form.order) || 0,
            isActive: form.isActive,
            startsAt: form.startsAt ? new Date(form.startsAt).toISOString() : null,
            endsAt: form.endsAt ? new Date(form.endsAt).toISOString() : null,
          }),
        },
      );
      const json = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        message?: string;
      };
      if (!res.ok || !json.ok) {
        setError(json.message ?? "ذخیره بنر انجام نشد.");
        return;
      }
      toast.success(editing ? "بنر ویرایش شد" : "بنر ایجاد شد");
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
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
              <Images className="h-4 w-4" />
            </span>
            بنرها و اسلایدرها
          </h1>
          <p className="mt-1 text-[11px] text-ink-500">
            {toPersianDigits(rows.length)} بنر ثبت شده است.
          </p>
        </div>
        <Button size="sm" onClick={openCreate}>
          <Plus className="h-4 w-4" />
          بنر جدید
        </Button>
      </div>

      {rows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-ink-200 bg-white p-10 text-center">
          <Images className="mx-auto h-8 w-8 text-ink-300" />
          <p className="mt-2 text-[12px] font-bold text-ink-700">بنری ثبت نشده است</p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {rows.map((row) => (
            <div
              key={row.id}
              className="overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-xs"
            >
              <div className="relative aspect-[2/1] bg-ink-50">
                <Image
                  src={row.image}
                  alt={row.title}
                  fill
                  sizes="(max-width: 640px) 100vw, 33vw"
                  className="object-cover"
                />
                {row.badge && (
                  <span className="absolute right-2 top-2 rounded-md bg-danger-600 px-2 py-1 text-[9px] font-black text-white">
                    {row.badge}
                  </span>
                )}
              </div>
              <div className="p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="line-clamp-1 text-[12px] font-black text-ink-900">
                      {row.title}
                    </p>
                    <p className="mt-0.5 line-clamp-1 text-[10px] text-ink-500">
                      {row.subtitle ?? "بدون زیرعنوان"}
                    </p>
                  </div>
                  <Badge variant={row.isActive ? "success" : "default"} size="xs">
                    {row.isActive ? "فعال" : "غیرفعال"}
                  </Badge>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[9px] text-ink-400">
                  <Badge variant="outline" size="xs">
                    {THEME_LABELS[row.theme] ?? row.theme}
                  </Badge>
                  <span>ترتیب {toPersianDigits(row.order)}</span>
                  <span className="h-2.5 w-px bg-ink-200" />
                  <span>
                    {row.endsAt ? `تا ${formatDate(row.endsAt)}` : "بدون انقضا"}
                  </span>
                </div>
                <div className="mt-2 flex items-center justify-between gap-1 border-t border-ink-100 pt-2">
                  <button
                    type="button"
                    onClick={() => openEdit(row)}
                    className="inline-flex h-8 items-center gap-1 rounded-lg px-2 text-[10px] font-bold text-brand-700 hover:bg-brand-50"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    ویرایش
                  </button>
                  <DeleteButton
                    endpoint={`/api/admin/banners/${row.id}`}
                    itemName={row.title}
                    label=""
                    description="حذف بنر از اسلایدر فروشگاه."
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent size="md">
          <DialogHeader>
            <DialogTitle>{editing ? `ویرایش «${editing.title}»` : "بنر جدید"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={submit} id="banner-form" className="contents">
            <DialogBody className="space-y-3">
              <Input
                label="عنوان"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              />
              <Input
                label="زیرعنوان — اختیاری"
                value={form.subtitle}
                onChange={(e) => setForm((f) => ({ ...f, subtitle: e.target.value }))}
              />
              <Input
                label="آدرس تصویر"
                value={form.image}
                onChange={(e) => setForm((f) => ({ ...f, image: e.target.value }))}
                dir="ltr"
                className="text-left"
                placeholder="/images/banners/main-1.svg"
              />
              {form.image && (
                <div className="relative aspect-[3/1] overflow-hidden rounded-xl border border-ink-100 bg-ink-50">
                  <Image
                    src={form.image}
                    alt="پیش‌نمایش بنر"
                    fill
                    sizes="480px"
                    className="object-cover"
                  />
                </div>
              )}
              <div className="grid gap-3 sm:grid-cols-2">
                <Input
                  label="لینک — اختیاری"
                  value={form.link}
                  onChange={(e) => setForm((f) => ({ ...f, link: e.target.value }))}
                  dir="ltr"
                  className="text-left"
                  placeholder="/special-offers"
                />
                <Input
                  label="برچسب — اختیاری"
                  value={form.badge}
                  onChange={(e) => setForm((f) => ({ ...f, badge: e.target.value }))}
                  placeholder="تخفیف ویژه"
                />
                <Select
                  label="تم"
                  options={Object.entries(THEME_LABELS).map(([value, label]) => ({
                    value,
                    label,
                  }))}
                  value={form.theme}
                  onChange={(e) => setForm((f) => ({ ...f, theme: e.target.value }))}
                />
                <Input
                  label="ترتیب نمایش"
                  type="number"
                  value={form.order}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, order: Number(e.target.value) }))
                  }
                />
                <Input
                  label="شروع — اختیاری"
                  type="date"
                  value={form.startsAt}
                  onChange={(e) => setForm((f) => ({ ...f, startsAt: e.target.value }))}
                />
                <Input
                  label="پایان — اختیاری"
                  type="date"
                  value={form.endsAt}
                  onChange={(e) => setForm((f) => ({ ...f, endsAt: e.target.value }))}
                />
              </div>
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
                {editing ? "ذخیره تغییرات" : "ایجاد بنر"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
