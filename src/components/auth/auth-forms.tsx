"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Lock, Mail, Phone } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/toast";
import { useSession } from "@/lib/session-context";
import { safeNext } from "@/lib/navigation";



export function LoginForm({
  next = "/",
  onSuccess,
  showRegisterLink = true,
  compact = false,
}: {
  next?: string;
  onSuccess?: () => void;
  showRegisterLink?: boolean;
  compact?: boolean;
}) {
  const router = useRouter();
  const toast = useToast();
  const { refresh } = useSession();

  const [identifier, setIdentifier] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [remember, setRemember] = React.useState(true);
  const [showPass, setShowPass] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (identifier.trim().length < 3 || password.length < 1) {
      setError("ایمیل/شماره موبایل و رمز عبور را وارد کنید.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: identifier.trim(), password, remember }),
      });
      const json = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        message?: string;
        data?: { user?: { name?: string } };
      };

      if (!res.ok || !json.ok) {
        setError(json.message ?? "ورود انجام نشد. اطلاعات را بررسی کنید.");
        return;
      }

      await refresh();
      toast.success("خوش آمدید", json.data?.user?.name);
      onSuccess?.();
      router.push(safeNext(next));
      router.refresh();
    } catch {
      setError("خطای شبکه. لطفاً دوباره تلاش کنید.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-3">
      <Input
        label={compact ? undefined : "ایمیل یا شماره موبایل"}
        icon={<Mail className="h-4 w-4" />}
        type="text"
        autoComplete="username"
        placeholder="ایمیل یا شماره موبایل"
        value={identifier}
        onChange={(e) => setIdentifier(e.target.value)}
        invalid={Boolean(error)}
        aria-label="ایمیل یا شماره موبایل"
      />

      <div className="relative">
        <Input
          label={compact ? undefined : "رمز عبور"}
          icon={<Lock className="h-4 w-4" />}
          type={showPass ? "text" : "password"}
          autoComplete="current-password"
          placeholder="رمز عبور"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          invalid={Boolean(error)}
          aria-label="رمز عبور"
        />
        <button
          type="button"
          onClick={() => setShowPass((v) => !v)}
          aria-label={showPass ? "پنهان کردن رمز عبور" : "نمایش رمز عبور"}
          className="absolute left-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-ink-400 transition-colors hover:text-ink-700"
        >
          {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>

      {error && (
        <p role="alert" className="rounded-lg bg-danger-50 px-3 py-2 text-[11px] font-bold text-danger-600">
          {error}
        </p>
      )}

      <div className="flex items-center justify-between gap-2">
        <Checkbox
          label={<span className="text-[11px]">مرا به خاطر بسپار</span>}
          checked={remember}
          onChange={(e) => setRemember(e.target.checked)}
        />
        <Link href="/contact" className="text-[11px] font-bold text-brand-700 hover:underline">
          رمز عبور را فراموش کرده‌اید؟
        </Link>
      </div>

      <Button type="submit" size="lg" loading={loading} disabled={loading} className="w-full">
        ورود به حساب
      </Button>

      <p className="rounded-lg bg-brand-50 px-3 py-2 text-[10px] font-medium leading-5 text-brand-900/80">
        حساب نمونه: <span className="font-black">sara@example.com</span> — رمز:{" "}
        <span className="font-black">User@12345</span>
      </p>

      {showRegisterLink && (
        <p className="text-center text-[11px] font-medium text-ink-500">
          حساب کاربری ندارید؟{" "}
          <Link
            href={`/register?next=${encodeURIComponent(safeNext(next))}`}
            className="font-extrabold text-brand-700 hover:underline"
          >
            ثبت‌نام کنید
          </Link>
        </p>
      )}
    </form>
  );
}

export function RegisterForm({
  next = "/",
  onSuccess,
  compact = false,
}: {
  next?: string;
  onSuccess?: () => void;
  compact?: boolean;
}) {
  const router = useRouter();
  const toast = useToast();
  const { refresh } = useSession();

  const [form, setForm] = React.useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [acceptTerms, setAcceptTerms] = React.useState(false);
  const [showPass, setShowPass] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (form.name.trim().length < 3) return setError("نام و نام خانوادگی را وارد کنید.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email.trim()))
      return setError("ایمیل معتبر وارد کنید.");
    if (!/^09\d{9}$/.test(form.phone.replace(/[^\d]/g, "")))
      return setError("شماره موبایل باید با ۰۹ شروع شود و ۱۱ رقم باشد.");
    if (form.password.length < 8 || !/[A-Za-z]/.test(form.password))
      return setError("رمز عبور باید حداقل ۸ کاراکتر و شامل حروف انگلیسی باشد.");
    if (form.password !== form.confirmPassword) return setError("تکرار رمز عبور مطابقت ندارد.");
    if (!acceptTerms) return setError("پذیرش قوانین و مقررات الزامی است.");

    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          password: form.password,
          confirmPassword: form.confirmPassword,
          acceptTerms: true,
        }),
      });
      const json = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        message?: string;
        data?: { user?: { name?: string } };
      };

      if (!res.ok || !json.ok) {
        setError(json.message ?? "ثبت‌نام انجام نشد.");
        return;
      }

      await refresh();
      toast.success("حساب شما ساخته شد", "۱۰۰ هزار تومان هدیه به کیف پول شما اضافه شد.");
      onSuccess?.();
      router.push(safeNext(next));
      router.refresh();
    } catch {
      setError("خطای شبکه. لطفاً دوباره تلاش کنید.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-3">
      <Input
        label={compact ? undefined : "نام و نام خانوادگی"}
        placeholder="مثلاً سارا احمدی"
        autoComplete="name"
        value={form.name}
        onChange={set("name")}
        aria-label="نام و نام خانوادگی"
      />
      <Input
        label={compact ? undefined : "ایمیل"}
        icon={<Mail className="h-4 w-4" />}
        type="email"
        placeholder="example@email.com"
        autoComplete="email"
        value={form.email}
        onChange={set("email")}
        aria-label="ایمیل"
        dir="ltr"
      />
      <Input
        label={compact ? undefined : "شماره موبایل"}
        icon={<Phone className="h-4 w-4" />}
        type="tel"
        placeholder="09123456789"
        autoComplete="tel"
        value={form.phone}
        onChange={set("phone")}
        aria-label="شماره موبایل"
        dir="ltr"
      />
      <div className="relative">
        <Input
          label={compact ? undefined : "رمز عبور"}
          icon={<Lock className="h-4 w-4" />}
          type={showPass ? "text" : "password"}
          placeholder="حداقل ۸ کاراکتر شامل حروف انگلیسی"
          autoComplete="new-password"
          value={form.password}
          onChange={set("password")}
          aria-label="رمز عبور"
        />
        <button
          type="button"
          onClick={() => setShowPass((v) => !v)}
          aria-label={showPass ? "پنهان کردن رمز عبور" : "نمایش رمز عبور"}
          className="absolute left-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-ink-400 transition-colors hover:text-ink-700"
        >
          {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
      <Input
        label={compact ? undefined : "تکرار رمز عبور"}
        icon={<Lock className="h-4 w-4" />}
        type={showPass ? "text" : "password"}
        placeholder="رمز عبور را دوباره وارد کنید"
        autoComplete="new-password"
        value={form.confirmPassword}
        onChange={set("confirmPassword")}
        aria-label="تکرار رمز عبور"
      />

      {error && (
        <p role="alert" className="rounded-lg bg-danger-50 px-3 py-2 text-[11px] font-bold text-danger-600">
          {error}
        </p>
      )}

      <Checkbox
        label={
          <span className="text-[11px] leading-5">
            <Link href="/terms" className="font-bold text-brand-700 hover:underline">
              قوانین و مقررات
            </Link>{" "}
            و{" "}
            <Link href="/privacy" className="font-bold text-brand-700 hover:underline">
              سیاست حفظ حریم خصوصی
            </Link>{" "}
            را می‌پذیرم.
          </span>
        }
        checked={acceptTerms}
        onChange={(e) => setAcceptTerms(e.target.checked)}
      />

      <Button type="submit" size="lg" loading={loading} disabled={loading} className="w-full">
        ساخت حساب کاربری
      </Button>

      <p className="text-center text-[11px] font-medium text-ink-500">
        قبلاً ثبت‌نام کرده‌اید؟{" "}
        <Link
          href={`/login?next=${encodeURIComponent(safeNext(next))}`}
          className="font-extrabold text-brand-700 hover:underline"
        >
          وارد شوید
        </Link>
      </p>
    </form>
  );
}
