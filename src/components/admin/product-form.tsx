"use client";

import * as React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ImageIcon, Plus, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/toast";
import { formatPrice } from "@/lib/format";

export type ProductFormValues = {
  id?: string;
  name: string;
  slug: string;
  sku: string;
  description: string;
  shortDesc: string;
  price: number;
  discountPrice: number | null;
  stock: number;
  categoryId: string;
  brandId: string | null;
  warranty: string | null;
  isFeatured: boolean;
  isNew: boolean;
  isSpecial: boolean;
  specialEndsAt: string | null;
  image: string | null;
};

type Option = { value: string; label: string };

const EMPTY: ProductFormValues = {
  name: "",
  slug: "",
  sku: "",
  description: "",
  shortDesc: "",
  price: 0,
  discountPrice: null,
  stock: 0,
  categoryId: "",
  brandId: null,
  warranty: "",
  isFeatured: false,
  isNew: false,
  isSpecial: false,
  specialEndsAt: null,
  image: "",
};

function toDateInput(value: string | null) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
}

export function ProductForm({
  initial,
  categories,
  brands,
}: {
  initial?: ProductFormValues | null;
  categories: Option[];
  brands: Option[];
}) {
  const router = useRouter();
  const toast = useToast();
  const [form, setForm] = React.useState<ProductFormValues>(initial ?? EMPTY);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const set = <K extends keyof ProductFormValues>(
    key: K,
    value: ProductFormValues[K],
  ) => setForm((f) => ({ ...f, [key]: value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (form.name.trim().length < 3) return setError("نام محصول را کامل وارد کنید.");
    if (!form.categoryId) return setError("دسته‌بندی محصول را انتخاب کنید.");
    if (!form.price || form.price <= 0) return setError("قیمت محصول را وارد کنید.");
    if (!form.sku.trim()) return setError("کد SKU محصول را وارد کنید.");
    if (
      form.discountPrice &&
      form.discountPrice > 0 &&
      form.discountPrice >= form.price
    ) {
      return setError("قیمت با تخفیف باید کمتر از قیمت اصلی باشد.");
    }

    const payload = {
      name: form.name.trim(),
      slug: form.slug.trim(),
      sku: form.sku.trim(),
      description: form.description.trim(),
      shortDesc: form.shortDesc.trim(),
      price: Number(form.price) || 0,
      discountPrice:
        form.discountPrice && Number(form.discountPrice) > 0
          ? Number(form.discountPrice)
          : null,
      stock: Number(form.stock) || 0,
      categoryId: form.categoryId,
      brandId: form.brandId || null,
      warranty: form.warranty?.trim() || "",
      isFeatured: form.isFeatured,
      isNew: form.isNew,
      isSpecial: form.isSpecial,
      specialEndsAt: form.specialEndsAt
        ? new Date(form.specialEndsAt).toISOString()
        : null,
      image: form.image?.trim() || "",
    };

    setSaving(true);
    try {
      const res = await fetch(
        form.id ? `/api/admin/products/${form.id}` : "/api/admin/products",
        {
          method: form.id ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      const json = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        message?: string;
        errors?: Record<string, string>;
      };
      if (!res.ok || !json.ok) {
        setError(
          json.message ??
            Object.values(json.errors ?? {})[0] ??
            "ذخیره محصول انجام نشد.",
        );
        return;
      }
      toast.success(
        form.id ? "محصول به‌روزرسانی شد" : "محصول جدید ایجاد شد",
        form.name,
      );
      router.push("/admin/products");
      router.refresh();
    } catch {
      setError("خطای شبکه. لطفاً دوباره تلاش کنید.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_300px] xl:items-start">
        <div className="space-y-4">
          <section className="rounded-2xl border border-ink-100 bg-white p-4 shadow-xs">
            <h2 className="text-sm font-black text-ink-900">اطلاعات اصلی</h2>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Input
                  label="نام محصول"
                  value={form.name}
                  onChange={(e) => set("name", e.target.value)}
                  placeholder="مثال: هندزفری بی‌سیم سَروا مدل Air"
                />
              </div>
              <Input
                label="نامک (slug) — اختیاری"
                value={form.slug}
                onChange={(e) => set("slug", e.target.value)}
                placeholder="در صورت خالی بودن خودکار ساخته می‌شود"
                dir="ltr"
                className="text-left"
              />
              <Input
                label="کد SKU"
                value={form.sku}
                onChange={(e) => set("sku", e.target.value)}
                placeholder="SKU-1001"
                dir="ltr"
                className="text-left"
              />
              <Select
                label="دسته‌بندی"
                options={categories}
                placeholder="انتخاب دسته‌بندی"
                value={form.categoryId}
                onChange={(e) => set("categoryId", e.target.value)}
              />
              <Select
                label="برند — اختیاری"
                options={brands}
                placeholder="بدون برند"
                value={form.brandId ?? ""}
                onChange={(e) => set("brandId", e.target.value || null)}
              />
            </div>
          </section>

          <section className="rounded-2xl border border-ink-100 bg-white p-4 shadow-xs">
            <h2 className="text-sm font-black text-ink-900">قیمت و موجودی</h2>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <Input
                label="قیمت اصلی (تومان)"
                type="number"
                min={0}
                step={1000}
                value={form.price || ""}
                onChange={(e) => set("price", Number(e.target.value))}
                dir="ltr"
                className="text-left"
              />
              <Input
                label="قیمت با تخفیف (تومان) — اختیاری"
                type="number"
                min={0}
                step={1000}
                value={form.discountPrice ?? ""}
                onChange={(e) =>
                  set(
                    "discountPrice",
                    e.target.value ? Number(e.target.value) : null,
                  )
                }
                dir="ltr"
                className="text-left"
              />
              <Input
                label="موجودی انبار"
                type="number"
                min={0}
                value={form.stock}
                onChange={(e) => set("stock", Number(e.target.value))}
              />
              <Input
                label="گارانتی"
                value={form.warranty ?? ""}
                onChange={(e) => set("warranty", e.target.value)}
                placeholder="مثال: ۱۸ ماه گارانتی سَروا"
              />
            </div>
          </section>

          <section className="rounded-2xl border border-ink-100 bg-white p-4 shadow-xs">
            <h2 className="text-sm font-black text-ink-900">تصویر و توضیحات</h2>
            <div className="mt-3 space-y-3">
              <Input
                label="آدرس تصویر شاخص"
                value={form.image ?? ""}
                onChange={(e) => set("image", e.target.value)}
                placeholder="/images/products/example.svg"
                dir="ltr"
                className="text-left"
              />
              <Input
                label="توضیح کوتاه"
                value={form.shortDesc}
                onChange={(e) => set("shortDesc", e.target.value)}
                placeholder="یک جمله جذاب درباره محصول"
              />
              <Textarea
                label="توضیحات کامل"
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
                rows={6}
                placeholder="مشخصات و مزایای محصول را کامل بنویسید…"
              />
            </div>
          </section>
        </div>

        <div className="space-y-4">
          <section className="rounded-2xl border border-ink-100 bg-white p-4 shadow-xs">
            <h2 className="text-sm font-black text-ink-900">پیش‌نمایش تصویر</h2>
            <div className="relative mt-3 aspect-square overflow-hidden rounded-xl border border-ink-100 bg-ink-50">
              {form.image ? (
                <Image
                  src={form.image}
                  alt={form.name || "پیش‌نمایش محصول"}
                  fill
                  sizes="280px"
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full flex-col items-center justify-center gap-2 text-ink-300">
                  <ImageIcon className="h-10 w-10" />
                  <span className="text-[10px]">تصویری انتخاب نشده است</span>
                </div>
              )}
            </div>
            {form.price > 0 && (
              <div className="mt-3 rounded-xl bg-ink-50 p-3">
                <p className="text-[10px] text-ink-500">قیمت نمایشی برای مشتری</p>
                <p className="mt-1 text-sm font-black text-ink-900">
                  {formatPrice(
                    form.discountPrice && form.discountPrice > 0
                      ? form.discountPrice
                      : form.price,
                  )}
                </p>
              </div>
            )}
          </section>

          <section className="rounded-2xl border border-ink-100 bg-white p-4 shadow-xs">
            <h2 className="text-sm font-black text-ink-900">وضعیت نمایش</h2>
            <div className="mt-3 space-y-3">
              <Checkbox
                label="محصول ویژه (نمایش در بخش ویژه)"
                checked={form.isFeatured}
                onChange={(e) => set("isFeatured", e.target.checked)}
              />
              <Checkbox
                label="محصول جدید"
                checked={form.isNew}
                onChange={(e) => set("isNew", e.target.checked)}
              />
              <Checkbox
                label="پیشنهاد شگفت‌انگیز"
                checked={form.isSpecial}
                onChange={(e) => set("isSpecial", e.target.checked)}
              />
              <Input
                label="پایان تخفیف ویژه — اختیاری"
                type="date"
                value={toDateInput(form.specialEndsAt)}
                onChange={(e) =>
                  set(
                    "specialEndsAt",
                    e.target.value
                      ? new Date(e.target.value).toISOString()
                      : null,
                  )
                }
              />
            </div>
          </section>
        </div>
      </div>

      {error && (
        <p
          role="alert"
          className="rounded-xl bg-danger-50 px-3 py-2 text-[11px] font-bold text-danger-600"
        >
          {error}
        </p>
      )}

      <div className="sticky bottom-3 flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-ink-100 bg-white/95 p-3 shadow-soft backdrop-blur">
        <p className="hidden text-[10px] text-ink-400 sm:block">
          تغییرات پس از ذخیره بلافاصله در فروشگاه اعمال می‌شود.
        </p>
        <div className="flex w-full gap-2 sm:w-auto">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/admin/products")}
            disabled={saving}
            className="flex-1 sm:flex-none"
          >
            انصراف
          </Button>
          <Button type="submit" loading={saving} disabled={saving} className="flex-1 sm:flex-none">
            {form.id ? <Save className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            {form.id ? "ذخیره تغییرات" : "ایجاد محصول"}
          </Button>
        </div>
      </div>
    </form>
  );
}
