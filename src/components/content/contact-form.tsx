"use client";

import * as React from "react";
import { CheckCircle2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";

const SUBJECTS = [
  { value: "general", label: "پرسش عمومی" },
  { value: "order", label: "پیگیری سفارش" },
  { value: "product", label: "سؤال درباره محصول" },
  { value: "payment", label: "پرداخت و کیف پول" },
  { value: "partnership", label: "همکاری و فروشندگی" },
  { value: "other", label: "سایر موضوعات" },
];

type Errors = Record<string, string>;

export function ContactForm() {
  const toast = useToast();
  const [sending, setSending] = React.useState(false);
  const [sent, setSent] = React.useState(false);
  const [errors, setErrors] = React.useState<Errors>({});
  const [form, setForm] = React.useState({
    name: "",
    email: "",
    phone: "",
    subject: "general",
    message: "",
  });

  const update = (key: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: "" }));
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSending(true);
    setErrors({});

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        message?: string;
        errors?: Errors;
      };

      if (!res.ok || !json.ok) {
        if (json.errors) setErrors(json.errors);
        toast.error("پیام ارسال نشد", json.message ?? "لطفاً اطلاعات را بررسی کنید.");
        return;
      }

      setSent(true);
      setForm({ name: "", email: "", phone: "", subject: "general", message: "" });
      toast.success("پیام شما ثبت شد", "تیم پشتیبانی سَروا در اولین فرصت پاسخ می‌دهد.");
    } catch {
      toast.error("خطای شبکه", "اتصال اینترنت را بررسی و دوباره تلاش کنید.");
    } finally {
      setSending(false);
    }
  };

  if (sent) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-success-100 bg-success-100/30 px-5 py-10 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-success-600 shadow-xs">
          <CheckCircle2 className="h-7 w-7" />
        </span>
        <h3 className="mt-3 text-base font-black text-ink-900">پیام شما دریافت شد</h3>
        <p className="mt-1.5 max-w-sm text-[12px] leading-6 text-ink-500">
          همکاران ما پیام شما را بررسی می‌کنند و در سریع‌ترین زمان، در ساعات کاری، پاسخ
          می‌دهند. شماره پیگیری از طریق ایمیل برای شما ارسال شد.
        </p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="mt-4"
          onClick={() => setSent(false)}
        >
          ارسال پیام جدید
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="grid gap-3 sm:grid-cols-2">
      <Input
        label="نام و نام خانوادگی"
        value={form.name}
        onChange={(e) => update("name", e.target.value)}
        placeholder="مثلاً سارا محمدی"
        invalid={Boolean(errors.name)}
        autoComplete="name"
        required
      />
      <Input
        label="ایمیل"
        type="email"
        dir="ltr"
        value={form.email}
        onChange={(e) => update("email", e.target.value)}
        placeholder="you@example.com"
        invalid={Boolean(errors.email)}
        autoComplete="email"
        required
      />
      <Input
        label="شماره موبایل (اختیاری)"
        dir="ltr"
        value={form.phone}
        onChange={(e) => update("phone", e.target.value)}
        placeholder="09xxxxxxxxx"
        invalid={Boolean(errors.phone)}
        autoComplete="tel"
      />
      <div>
        <label
          htmlFor="contact-subject"
          className="mb-1.5 block text-[11px] font-bold text-ink-600"
        >
          موضوع پیام
        </label>
        <select
          id="contact-subject"
          value={form.subject}
          onChange={(e) => update("subject", e.target.value)}
          className="h-11 w-full rounded-xl border border-ink-200 bg-white px-3 text-sm text-ink-900 focus:border-brand-600 focus:outline-none focus:ring-4 focus:ring-brand-600/10"
        >
          {SUBJECTS.map((subject) => (
            <option key={subject.value} value={subject.value}>
              {subject.label}
            </option>
          ))}
        </select>
      </div>
      <div className="sm:col-span-2">
        <Textarea
          label="متن پیام"
          rows={5}
          value={form.message}
          onChange={(e) => update("message", e.target.value)}
          placeholder="جزئیات درخواست یا پرسش خود را بنویسید…"
          invalid={Boolean(errors.message)}
          required
        />
        {(errors.message || errors.name || errors.email) && (
          <p className="mt-1.5 text-[10px] font-bold text-danger-600">
            {errors.message || errors.name || errors.email}
          </p>
        )}
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2 sm:col-span-2">
        <p className="text-[10px] leading-5 text-ink-400">
          با ارسال این فرم، با{" "}
          <a
            href="/privacy"
            className="font-bold text-brand-700 hover:underline"
          >
            سیاست حریم خصوصی
          </a>{" "}
          سَروا موافقت می‌کنید.
        </p>
        <Button type="submit" loading={sending} disabled={sending}>
          {!sending && <Send className="h-4 w-4" />}
          ارسال پیام
        </Button>
      </div>
    </form>
  );
}
