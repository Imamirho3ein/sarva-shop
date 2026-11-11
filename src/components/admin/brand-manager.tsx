"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Pencil, Plus, Save, Tags } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
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
import { toPersianDigits } from "@/lib/format";

export type BrandRow = {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  country: string | null;
  description: string | null;
  isPopular: boolean;
  isActive: boolean;
  productCount: number;
};

const EMPTY = {
  name: "",
  slug: "",
  logo: "",
  country: "",
  description: "",
  isPopular: false,
  isActive: true,
};

export function BrandManager({ rows }: { rows: BrandRow[] }) {
  const router = useRouter();
  const toast = useToast();
  const [open, setOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<BrandRow | null>(null);
  const [form, setForm] = React.useState({ ...EMPTY });
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const openCreate = () => {
    setEditing(null);
    setForm({ ...EMPTY });
    setError(null);
    setOpen(true);
  };

  const openEdit = (row: BrandRow) => {
    setEditing(row);
    setForm({
      name: row.name,
      slug: row.slug,
      logo: row.logo ?? "",
      country: row.country ?? "",
      description: row.description ?? "",
      isPopular: row.isPopular,
      isActive: row.isActive,
    });
    setError(null);
    setOpen(true);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (form.name.trim().length < 2) return setError("نام برند را وارد کنید.");

    setSaving(true);
    try {
      const res = await fetch(
        editing ? `/api/admin/brands/${editing.id}` : "/api/admin/brands",
        {
          method: editing ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: form.name.trim(),
            slug: form.slug.trim(),
            logo: form.logo.trim(),
            country: form.country.trim(),
            description: form.description.trim(),
            isPopular: form.isPopular,
            isActive: form.isActive,
          }),
        },
      );
      const json = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        message?: string;
      };
      if (!res.ok || !json.ok) {
        setError(json.message ?? "ذخیره برند انجام نشد.");
        return;
      }
      toast.success(editing ? "برند ویرایش شد" : "برند ایجاد شد");
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
              <Tags className="h-4 w-4" />
            </span>
            برندها
          </h1>
          <p className="mt-1 text-[11px] text-ink-500">
            {toPersianDigits(rows.length)} برند ثبت شده است.
          </p>
        </div>
        <Button size="sm" onClick={openCreate}>
          <Plus className="h-4 w-4" />
          برند جدید
        </Button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[620px] text-right text-[11px]">
            <thead className="bg-ink-50 text-[9px] text-ink-500">
              <tr>
                <th className="px-3 py-2.5 font-medium">نام</th>
                <th className="px-3 py-2.5 font-medium">نامک</th>
                <th className="px-3 py-2.5 font-medium">کشور</th>
                <th className="px-3 py-2.5 font-medium">محصولات</th>
                <th className="px-3 py-2.5 font-medium">وضعیت</th>
                <th className="px-3 py-2.5 font-medium">عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {rows.map((row) => (
                <tr key={row.id} className="hover:bg-ink-50/50">
                  <td className="px-3 py-2.5 font-bold text-ink-800">{row.name}</td>
                  <td dir="ltr" className="px-3 py-2.5 text-right text-[10px] text-ink-400">
                    {row.slug}
                  </td>
                  <td className="px-3 py-2.5 text-ink-500">{row.country ?? "—"}</td>
                  <td className="px-3 py-2.5">
                    <Badge variant="outline" size="xs">
                      {toPersianDigits(row.productCount)}
                    </Badge>
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="flex flex-wrap gap-1">
                      <Badge variant={row.isActive ? "success" : "default"} size="xs">
                        {row.isActive ? "فعال" : "غیرفعال"}
                      </Badge>
                      {row.isPopular && (
                        <Badge variant="accent" size="xs">
                          محبوب
                        </Badge>
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="flex flex-wrap items-center gap-1">
                      <Link
                        href={`/brands/${row.slug}`}
                        target="_blank"
                        className="inline-flex h-8 items-center rounded-lg px-2 text-[10px] font-bold text-ink-500 hover:bg-ink-100"
                      >
                        نمایش
                      </Link>
                      <button
                        type="button"
                        onClick={() => openEdit(row)}
                        className="inline-flex h-8 items-center gap-1 rounded-lg px-2 text-[10px] font-bold text-brand-700 hover:bg-brand-50"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        ویرایش
                      </button>
                      <DeleteButton
                        endpoint={`/api/admin/brands/${row.id}`}
                        itemName={row.name}
                        label=""
                        description="حذف برند فقط وقتی ممکن است که محصولی به آن وابسته نباشد."
                      />
                    </div>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-ink-400">
                    برندی ثبت نشده است.
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
            <DialogTitle>{editing ? `ویرایش «${editing.name}»` : "برند جدید"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={submit} id="brand-form" className="contents">
            <DialogBody className="space-y-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <Input
                  label="نام برند"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                />
                <Input
                  label="نامک (slug)"
                  value={form.slug}
                  onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                  dir="ltr"
                  className="text-left"
                  placeholder="خودکار"
                />
                <Input
                  label="کشور"
                  value={form.country}
                  onChange={(e) => setForm((f) => ({ ...f, country: e.target.value }))}
                />
                <Input
                  label="آدرس لوگو — اختیاری"
                  value={form.logo}
                  onChange={(e) => setForm((f) => ({ ...f, logo: e.target.value }))}
                  dir="ltr"
                  className="text-left"
                />
              </div>
              <Textarea
                label="توضیحات — اختیاری"
                rows={3}
                value={form.description}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
              />
              <div className="flex flex-wrap gap-4">
                <Checkbox
                  label="برند محبوب"
                  checked={form.isPopular}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, isPopular: e.target.checked }))
                  }
                />
                <Checkbox
                  label="فعال"
                  checked={form.isActive}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, isActive: e.target.checked }))
                  }
                />
              </div>
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
                {editing ? "ذخیره تغییرات" : "ایجاد برند"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
