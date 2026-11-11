"use client";

import * as React from "react";
import { KeyRound, Save, ShieldCheck, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { useSession } from "@/lib/session-context";

function normalizePhone(value: string) {
  let d = value.replace(/[^\d]/g, "");
  if (d.startsWith("0098")) d = d.slice(4);
  else if (d.startsWith("+98")) d = d.slice(3);
  else if (d.startsWith("98")) d = d.slice(2);
  if (d.length === 10 && d.startsWith("9")) d = `0${d}`;
  return d;
}

export function ProfileForm({
  initial,
}: {
  initial: { name: string; email: string; phone: string | null };
}) {
  const toast = useToast();
  const { refresh } = useSession();

  const [form, setForm] = React.useState({
    name: initial.name,
    email: initial.email,
    phone: initial.phone ?? "",
  });
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const [pass, setPass] = React.useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [changing, setChanging] = React.useState(false);
  const [passError, setPassError] = React.useState<string | null>(null);

  const saveInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const phone = normalizePhone(form.phone);
    if (form.name.trim().length < 3) return setError("نام و نام خانوادگی را کامل وارد کنید.");
    if (!/^09\d{9}$/.test(phone)) return setError("شماره موبایل باید با ۰۹ شروع شود و ۱۱ رقم باشد.");

    setSaving(true);
    try {
      const res = await fetch("/api/account/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.name.trim(), phone }),
      });
      const json = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        message?: string;
        errors?: Record<string, string>;
        data?: { user: { name: string; email: string; phone: string | null } };
      };
      if (!res.ok || !json.ok) {
        setError(json.message ?? Object.values(json.errors ?? {})[0] ?? "ذخیره اطلاعات انجام نشد.");
        return;
      }
      toast.success("اطلاعات حساب به‌روزرسانی شد");
      if (json.data?.user) {
        setForm((f) => ({ ...f, name: json.data!.user.name, phone: json.data!.user.phone ?? "" }));
      }
      await refresh();
    } catch {
      setError("خطای شبکه. لطفاً دوباره تلاش کنید.");
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassError(null);

    if (pass.newPassword.length < 8) return setPassError("رمز عبور جدید حداقل ۸ کاراکتر باشد.");
    if (!/[A-Za-z]/.test(pass.newPassword)) {
      return setPassError("رمز عبور جدید باید حداقل یک حرف انگلیسی داشته باشد.");
    }
    if (pass.newPassword !== pass.confirmPassword) {
      return setPassError("تکرار رمز عبور جدید یکسان نیست.");
    }

    setChanging(true);
    try {
      const res = await fetch("/api/account/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pass),
      });
      const json = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        message?: string;
        errors?: Record<string, string>;
      };
      if (!res.ok || !json.ok) {
        setPassError(json.message ?? Object.values(json.errors ?? {})[0] ?? "تغییر رمز انجام نشد.");
        return;
      }
      toast.success("رمز عبور تغییر کرد", "از این پس با رمز جدید وارد شوید.");
      setPass({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch {
      setPassError("خطای شبکه. لطفاً دوباره تلاش کنید.");
    } finally {
      setChanging(false);
    }
  };

  return (
    <div className="space-y-4">
      <form
        onSubmit={saveInfo}
        className="rounded-2xl border border-ink-100 bg-white p-4 shadow-xs sm:p-5"
      >
        <h2 className="flex items-center gap-1.5 text-sm font-black text-ink-900">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
            <User className="h-4 w-4" />
          </span>
          اطلاعات شخصی
        </h2>
        <p className="mt-1 text-[11px] text-ink-500">
          نام و شماره تماس برای اطلاع‌رسانی سفارش‌ها و ارسال استفاده می‌شود.
        </p>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <Input
            label="نام و نام خانوادگی"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            autoComplete="name"
          />
          <Input
            label="شماره موبایل"
            value={form.phone}
            onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
            inputMode="tel"
            dir="ltr"
            placeholder="09123456789"
            autoComplete="tel"
          />
          <div className="sm:col-span-2">
            <Input
              label="ایمیل"
              value={form.email}
              disabled
              dir="ltr"
              className="text-left"
            />
            <p className="mt-1 text-[10px] text-ink-400">
              ایمیل حساب قابل تغییر نیست؛ برای تغییر با پشتیبانی تماس بگیرید.
            </p>
          </div>
        </div>

        {error && (
          <p role="alert" className="mt-3 rounded-lg bg-danger-50 px-3 py-2 text-[11px] font-bold text-danger-600">
            {error}
          </p>
        )}

        <div className="mt-4">
          <Button type="submit" loading={saving} disabled={saving}>
            <Save className="h-4 w-4" />
            ذخیره تغییرات
          </Button>
        </div>
      </form>

      <form
        onSubmit={changePassword}
        className="rounded-2xl border border-ink-100 bg-white p-4 shadow-xs sm:p-5"
      >
        <h2 className="flex items-center gap-1.5 text-sm font-black text-ink-900">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
            <KeyRound className="h-4 w-4" />
          </span>
          تغییر رمز عبور
        </h2>
        <p className="mt-1 text-[11px] text-ink-500">
          رمز جدید باید حداقل ۸ کاراکتر و شامل حرف انگلیسی باشد.
        </p>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Input
              label="رمز عبور فعلی"
              type="password"
              value={pass.currentPassword}
              onChange={(e) => setPass((p) => ({ ...p, currentPassword: e.target.value }))}
              autoComplete="current-password"
            />
          </div>
          <Input
            label="رمز عبور جدید"
            type="password"
            value={pass.newPassword}
            onChange={(e) => setPass((p) => ({ ...p, newPassword: e.target.value }))}
            autoComplete="new-password"
          />
          <Input
            label="تکرار رمز عبور جدید"
            type="password"
            value={pass.confirmPassword}
            onChange={(e) => setPass((p) => ({ ...p, confirmPassword: e.target.value }))}
            autoComplete="new-password"
          />
        </div>

        {passError && (
          <p role="alert" className="mt-3 rounded-lg bg-danger-50 px-3 py-2 text-[11px] font-bold text-danger-600">
            {passError}
          </p>
        )}

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Button type="submit" loading={changing} disabled={changing}>
            <ShieldCheck className="h-4 w-4" />
            تغییر رمز عبور
          </Button>
          <span className="text-[10px] text-ink-400">
            آخرین به‌روزرسانی اطلاعات: همین حالا
          </span>
        </div>
      </form>

      <p className="rounded-xl bg-ink-50 px-3 py-2 text-[10px] leading-5 text-ink-500">
        نشست شما پس از تغییر اطلاعات همچنان فعال می‌ماند. برای امنیت بیشتر، رمز عبور را در
        دستگاه‌های عمومی ذخیره نکنید.
      </p>
    </div>
  );
}
