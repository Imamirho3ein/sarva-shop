"use client";

import * as React from "react";
import { CheckCircle2, Send } from "lucide-react";

export function NewsletterForm() {
  const [email, setEmail] = React.useState("");
  const [status, setStatus] = React.useState<"idle" | "loading" | "done" | "error">("idle");
  const [message, setMessage] = React.useState("");

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setStatus("loading");
    setMessage("");

    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source: "footer" }),
      });
      const json = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        message?: string;
      };
      if (!res.ok || !json.ok) {
        setStatus("error");
        setMessage(json.message ?? "ثبت ایمیل انجام نشد.");
        return;
      }
      setStatus("done");
      setMessage("عضویت شما ثبت شد؛ از این پس تخفیف‌ها را زودتر می‌بینید.");
      setEmail("");
    } catch {
      setStatus("error");
      setMessage("خطای شبکه؛ دوباره تلاش کنید.");
    }
  };

  if (status === "done") {
    return (
      <div className="flex max-w-md items-start gap-2 rounded-xl border border-success-100 bg-success-100/40 px-3 py-2.5">
        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success-600" />
        <p className="text-[11px] font-bold leading-5 text-success-600">{message}</p>
      </div>
    );
  }

  return (
    <div className="max-w-md">
      <form onSubmit={submit} className="flex gap-2">
        <input
          type="email"
          required
          value={email}
          onChange={(event) => {
            setEmail(event.target.value);
            if (status === "error") setStatus("idle");
          }}
          name="email"
          dir="ltr"
          placeholder="you@example.com"
          aria-label="ایمیل خبرنامه"
          className="h-11 min-w-0 flex-1 rounded-xl border border-ink-200 bg-white px-3 text-left text-sm text-ink-900 placeholder:text-ink-400 focus:border-brand-600 focus:outline-none focus:ring-4 focus:ring-brand-600/10"
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className="inline-flex h-11 shrink-0 items-center gap-1.5 rounded-xl bg-ink-900 px-4 text-sm font-extrabold text-white transition-colors hover:bg-ink-800 disabled:opacity-60"
        >
          {status === "loading" ? (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
          ) : (
            <Send className="h-4 w-4" />
          )}
          عضویت
        </button>
      </form>
      {status === "error" && (
        <p className="mt-1.5 text-[10px] font-bold text-danger-600">{message}</p>
      )}
    </div>
  );
}
