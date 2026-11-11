"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { MapPin, Plus } from "lucide-react";
import { Input, Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import type { AddressDTO } from "@/types";

const emptyForm = {
  label: "خانه",
  receiverName: "",
  receiverPhone: "",
  province: "",
  city: "",
  postalCode: "",
  address: "",
  isDefault: false,
};

/**
 * فرم افزودن/ویرایش آدرس — مشترک بین تسویه‌حساب و پنل کاربری.
 */
export function AddressForm({
  initial,
  addressId,
  onSaved,
  onCancel,
  submitLabel,
}: {
  initial?: AddressDTO | null;
  addressId?: string | null;
  onSaved: (address: AddressDTO) => void;
  onCancel?: () => void;
  submitLabel?: string;
}) {
  const toast = useToast();
  const router = useRouter();
  const [form, setForm] = React.useState(() => ({
    ...emptyForm,
    ...(initial
      ? {
          label: initial.label,
          receiverName: initial.receiverName,
          receiverPhone: initial.receiverPhone,
          province: initial.province,
          city: initial.city,
          postalCode: initial.postalCode,
          address: initial.address,
          isDefault: initial.isDefault,
        }
      : {}),
  }));
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const set =
    (key: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const phone = form.receiverPhone.replace(/[^\d]/g, "");
    const postal = form.postalCode.replace(/[^\d]/g, "");

    if (form.receiverName.trim().length < 3) return setError("نام تحویل‌گیرنده را وارد کنید.");
    if (!/^09\d{9}$/.test(phone)) return setError("شماره موبایل باید با ۰۹ شروع شود و ۱۱ رقم باشد.");
    if (form.province.trim().length < 2) return setError("استان را وارد کنید.");
    if (form.city.trim().length < 2) return setError("شهر را وارد کنید.");
    if (postal.length !== 10) return setError("کد پستی باید ۱۰ رقم باشد.");
    if (form.address.trim().length < 10) return setError("نشانی را کامل‌تر وارد کنید.");

    setSaving(true);
    try {
      const res = await fetch(
        addressId ? `/api/account/addresses/${addressId}` : "/api/account/addresses",
        {
          method: addressId ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            label: form.label.trim() || "آدرس",
            receiverName: form.receiverName.trim(),
            receiverPhone: phone,
            province: form.province.trim(),
            city: form.city.trim(),
            postalCode: postal,
            address: form.address.trim(),
            isDefault: form.isDefault,
          }),
        },
      );
      const json = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        message?: string;
        errors?: Record<string, string>;
        data?: { address: AddressDTO };
      };

      if (!res.ok || !json.ok || !json.data) {
        setError(
          json.message ??
            Object.values(json.errors ?? {})[0] ??
            "ذخیره آدرس انجام نشد. اطلاعات را بررسی کنید.",
        );
        return;
      }

      toast.success(addressId ? "آدرس ویرایش شد" : "آدرس جدید ذخیره شد");
      onSaved(json.data.address);
      router.refresh();
      if (!addressId) setForm(emptyForm);
    } catch {
      setError("خطای شبکه. لطفاً دوباره تلاش کنید.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form
      onSubmit={submit}
      className="rounded-2xl border border-ink-100 bg-white p-4 shadow-xs sm:p-5"
    >
      <h3 className="flex items-center gap-1.5 text-sm font-black text-ink-900">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
          {addressId ? <MapPin className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
        </span>
        {addressId ? "ویرایش آدرس" : "افزودن آدرس جدید"}
      </h3>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <Input
          label="نام تحویل‌گیرنده"
          placeholder="مثلاً سارا احمدی"
          value={form.receiverName}
          onChange={set("receiverName")}
          autoComplete="name"
        />
        <Input
          label="شماره موبایل"
          placeholder="09123456789"
          value={form.receiverPhone}
          onChange={set("receiverPhone")}
          inputMode="tel"
          dir="ltr"
          autoComplete="tel"
        />
        <Input
          label="استان"
          placeholder="مثلاً تهران"
          value={form.province}
          onChange={set("province")}
        />
        <Input
          label="شهر"
          placeholder="مثلاً تهران"
          value={form.city}
          onChange={set("city")}
        />
        <Input
          label="کد پستی"
          placeholder="۱۰ رقم"
          value={form.postalCode}
          onChange={set("postalCode")}
          inputMode="numeric"
          dir="ltr"
        />
        <Input
          label="عنوان آدرس"
          placeholder="خانه، محل کار، ..."
          value={form.label}
          onChange={set("label")}
        />
      </div>

      <div className="mt-3">
        <span className="mb-1.5 block text-[13px] font-bold text-ink-700">نشانی کامل</span>
        <Textarea
          value={form.address}
          onChange={set("address")}
          rows={3}
          placeholder="خیابان، کوچه، پلاک، واحد…"
        />
      </div>

      <label className="mt-3 flex cursor-pointer items-center gap-2 text-[12px] font-medium text-ink-600">
        <input
          type="checkbox"
          checked={form.isDefault}
          onChange={(e) => setForm((f) => ({ ...f, isDefault: e.target.checked }))}
          className="h-4 w-4 rounded border-ink-300 text-brand-700 focus:ring-brand-600"
        />
        این آدرس به‌عنوان آدرس پیش‌فرض ذخیره شود
      </label>

      {error && (
        <p role="alert" className="mt-3 rounded-lg bg-danger-50 px-3 py-2 text-[11px] font-bold text-danger-600">
          {error}
        </p>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Button type="submit" loading={saving} disabled={saving}>
          {submitLabel ?? (addressId ? "ذخیره تغییرات" : "ذخیره آدرس")}
        </Button>
        {onCancel && (
          <Button type="button" variant="ghost" onClick={onCancel} disabled={saving}>
            انصراف
          </Button>
        )}
      </div>
    </form>
  );
}
