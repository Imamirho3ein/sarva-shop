"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FolderTree, Pencil, Plus, Save } from "lucide-react";
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
import { toPersianDigits } from "@/lib/format";

export type CategoryRow = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  parentId: string | null;
  icon: string | null;
  order: number;
  isPopular: boolean;
  isActive: boolean;
  productCount: number;
};

const EMPTY = {
  name: "",
  slug: "",
  description: "",
  image: "",
  parentId: "",
  icon: "",
  order: 0,
  isPopular: false,
  isActive: true,
};

export function CategoryManager({ rows }: { rows: CategoryRow[] }) {
  const router = useRouter();
  const toast = useToast();
  const [open, setOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<CategoryRow | null>(null);
  const [form, setForm] = React.useState({ ...EMPTY });
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const openCreate = () => {
    setEditing(null);
    setForm({ ...EMPTY });
    setError(null);
    setOpen(true);
  };

  const openEdit = (row: CategoryRow) => {
    setEditing(row);
    setForm({
      name: row.name,
      slug: row.slug,
      description: row.description ?? "",
      image: row.image ?? "",
      parentId: row.parentId ?? "",
      icon: row.icon ?? "",
      order: row.order,
      isPopular: row.isPopular,
      isActive: row.isActive,
    });
    setError(null);
    setOpen(true);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (form.name.trim().length < 2) return setError("نام دسته‌بندی را وارد کنید.");

    setSaving(true);
    try {
      const res = await fetch(
        editing ? `/api/admin/categories/${editing.id}` : "/api/admin/categories",
        {
          method: editing ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: form.name.trim(),
            slug: form.slug.trim(),
            description: form.description.trim(),
            image: form.image.trim(),
            parentId: form.parentId || null,
            icon: form.icon.trim(),
            order: Number(form.order) || 0,
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
        setError(json.message ?? "ذخیره دسته‌بندی انجام نشد.");
        return;
      }
      toast.success(editing ? "دسته‌بندی ویرایش شد" : "دسته‌بندی ایجاد شد");
      setOpen(false);
      router.refresh();
    } catch {
      setError("خطای شبکه. لطفاً دوباره تلاش کنید.");
    } finally {
      setSaving(false);
    }
  };

  const parentOptions = rows
    .filter((r) => r.id !== editing?.id && !r.parentId)
    .map((r) => ({ value: r.id, label: r.name }));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-ink-100 bg-white p-4 shadow-xs">
        <div>
          <h1 className="flex items-center gap-1.5 text-base font-black text-ink-900">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
              <FolderTree className="h-4 w-4" />
            </span>
            دسته‌بندی‌ها
          </h1>
          <p className="mt-1 text-[11px] text-ink-500">
            {toPersianDigits(rows.length)} دسته‌بندی در فروشگاه ثبت شده است.
          </p>
        </div>
        <Button size="sm" onClick={openCreate}>
          <Plus className="h-4 w-4" />
          دسته‌بندی جدید
        </Button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-right text-[11px]">
            <thead className="bg-ink-50 text-[9px] text-ink-500">
              <tr>
                <th className="px-3 py-2.5 font-medium">نام</th>
                <th className="px-3 py-2.5 font-medium">نامک</th>
                <th className="px-3 py-2.5 font-medium">والد</th>
                <th className="px-3 py-2.5 font-medium">محصولات</th>
                <th className="px-3 py-2.5 font-medium">وضعیت</th>
                <th className="px-3 py-2.5 font-medium">عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {rows.map((row) => {
                const parent = rows.find((r) => r.id === row.parentId);
                return (
                  <tr key={row.id} className="hover:bg-ink-50/50">
                    <td className="px-3 py-2.5 font-bold text-ink-800">{row.name}</td>
                    <td dir="ltr" className="px-3 py-2.5 text-right text-[10px] text-ink-400">
                      {row.slug}
                    </td>
                    <td className="px-3 py-2.5 text-ink-500">{parent?.name ?? "—"}</td>
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
                          href={`/category/${row.slug}`}
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
                          endpoint={`/api/admin/categories/${row.id}`}
                          itemName={row.name}
                          label=""
                          description="حذف دسته‌بندی فقط وقتی ممکن است که محصولی در آن وجود نداشته باشد."
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-ink-400">
                    دسته‌بندی‌ای ثبت نشده است.
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
              {editing ? `ویرایش «${editing.name}»` : "دسته‌بندی جدید"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={submit} id="category-form" className="contents">
            <DialogBody className="space-y-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <Input
                  label="نام دسته‌بندی"
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
                <Select
                  label="دسته والد"
                  options={parentOptions}
                  placeholder="بدون والد (سطح اول)"
                  value={form.parentId}
                  onChange={(e) => setForm((f) => ({ ...f, parentId: e.target.value }))}
                />
                <Input
                  label="ترتیب نمایش"
                  type="number"
                  value={form.order}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, order: Number(e.target.value) }))
                  }
                />
              </div>
              <Input
                label="آدرس تصویر — اختیاری"
                value={form.image}
                onChange={(e) => setForm((f) => ({ ...f, image: e.target.value }))}
                dir="ltr"
                className="text-left"
              />
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
                  label="دسته محبوب"
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
                {editing ? "ذخیره تغییرات" : "ایجاد دسته‌بندی"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
