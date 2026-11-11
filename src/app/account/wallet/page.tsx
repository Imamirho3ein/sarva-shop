import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Gift,
  ReceiptText,
  RefreshCcw,
  ShieldCheck,
  Wallet,
} from "lucide-react";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDateTime, formatPrice, toPersianDigits } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/misc";

export const metadata: Metadata = {
  title: `کیف پول`,
  robots: { index: false, follow: false },
};

const TX_META: Record<
  string,
  { label: string; icon: typeof Wallet; tone: string; badge: "success" | "danger" | "brand" | "accent" | "outline" }
> = {
  DEPOSIT: {
    label: "واریز",
    icon: ArrowDownLeft,
    tone: "bg-success-100 text-success-600",
    badge: "success",
  },
  WITHDRAW: {
    label: "برداشت",
    icon: ArrowUpRight,
    tone: "bg-danger-100 text-danger-600",
    badge: "danger",
  },
  PURCHASE: {
    label: "خرید",
    icon: ReceiptText,
    tone: "bg-brand-50 text-brand-700",
    badge: "brand",
  },
  REFUND: {
    label: "بازگشت وجه",
    icon: RefreshCcw,
    tone: "bg-accent-100 text-accent-700",
    badge: "accent",
  },
  GIFT: {
    label: "هدیه",
    icon: Gift,
    tone: "bg-accent-100 text-accent-700",
    badge: "accent",
  },
};

export default async function AccountWalletPage() {
  const session = await getSession();
  if (!session) return null;

  const transactions = await prisma.walletTransaction.findMany({
    where: { userId: session.id },
    orderBy: { createdAt: "desc" },
    take: 60,
  });

  const totalIn = transactions
    .filter((t) => t.amount > 0)
    .reduce((sum, t) => sum + t.amount, 0);
  const totalOut = transactions
    .filter((t) => t.amount < 0)
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  return (
    <div className="space-y-4">
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-l from-brand-800 via-brand-700 to-brand-600 p-5 text-white shadow-soft sm:p-6">
        <div className="pointer-events-none absolute -left-10 -top-16 h-44 w-44 rounded-full bg-white/10" />
        <div className="pointer-events-none absolute -bottom-20 left-20 h-44 w-44 rounded-full bg-white/5" />
        <div className="relative">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="flex items-center gap-1.5 text-[11px] font-medium text-white/75">
                <Wallet className="h-4 w-4" />
                موجودی کیف پول سَروا
              </p>
              <p className="mt-2 text-2xl font-black tracking-tight">
                {formatPrice(session.walletBalance)}
              </p>
              <p className="mt-1 text-[10px] leading-5 text-white/65">
                مبلغ کیف پول در پرداخت سفارش‌های بعدی قابل استفاده است.
              </p>
            </div>
            <div className="rounded-xl bg-white/10 px-3.5 py-2.5 backdrop-blur-sm">
              <p className="flex items-center gap-1 text-[10px] text-white/70">
                <ShieldCheck className="h-3.5 w-3.5" />
                پرداخت امن
              </p>
              <p className="mt-1 text-[10px] leading-5 text-white/80">
                تمام تراکنش‌ها در سامانه ثبت می‌شود.
              </p>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2 sm:max-w-md">
            <div className="rounded-xl bg-white/10 p-3 backdrop-blur-sm">
              <p className="text-[9px] text-white/65">مجموع واریزها</p>
              <p className="mt-0.5 text-[12px] font-black">
                {formatPrice(totalIn)}
              </p>
            </div>
            <div className="rounded-xl bg-white/10 p-3 backdrop-blur-sm">
              <p className="text-[9px] text-white/65">مجموع برداشت‌ها</p>
              <p className="mt-0.5 text-[12px] font-black">
                {formatPrice(totalOut)}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-ink-100 bg-white p-4 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-black text-ink-900">تاریخچه تراکنش‌ها</h2>
            <p className="mt-0.5 text-[10px] text-ink-500">
              {toPersianDigits(transactions.length)} تراکنش اخیر
            </p>
          </div>
          <Link
            href="/account/orders"
            className="rounded-lg bg-ink-50 px-2.5 py-1.5 text-[10px] font-bold text-ink-600 transition-colors hover:bg-brand-50 hover:text-brand-700"
          >
            سفارش‌های من
          </Link>
        </div>

        {transactions.length === 0 ? (
          <div className="mt-3">
            <EmptyState
              icon={<Wallet className="h-8 w-8" />}
              title="هنوز تراکنشی ثبت نشده است"
              description="با پرداخت سفارش‌ها یا بازگشت وجه، تراکنش‌ها در این بخش نمایش داده می‌شود."
              className="border-0 bg-transparent py-8"
            />
          </div>
        ) : (
          <ul className="mt-3 divide-y divide-ink-100">
            {transactions.map((tx) => {
              const meta = TX_META[tx.type] ?? TX_META.DEPOSIT;
              const Icon = meta.icon;
              const positive = tx.amount > 0;
              return (
                <li key={tx.id} className="flex items-center gap-3 py-3">
                  <span
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${meta.tone}`}
                  >
                    <Icon className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <p className="text-[11px] font-black text-ink-800">
                        {meta.label}
                      </p>
                      <Badge variant={meta.badge} size="xs">
                        {positive ? "افزایش موجودی" : "کاهش موجودی"}
                      </Badge>
                    </div>
                    <p className="mt-0.5 line-clamp-1 text-[10px] text-ink-500">
                      {tx.description}
                    </p>
                    <p className="mt-0.5 text-[9px] text-ink-400">
                      {formatDateTime(tx.createdAt)}
                    </p>
                  </div>
                  <div className="shrink-0 text-left">
                    <p
                      className={`text-[11px] font-black ${
                        positive ? "text-success-600" : "text-danger-600"
                      }`}
                    >
                      {positive ? "+" : "−"}
                      {formatPrice(Math.abs(tx.amount))}
                    </p>
                    <p className="mt-0.5 text-[9px] text-ink-400">
                      مانده: {formatPrice(tx.balanceAfter)}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <div className="rounded-2xl border border-dashed border-ink-200 bg-ink-50/60 p-4 text-[10px] leading-5 text-ink-500">
        بازگشت وجه سفارش‌های لغوشده به کیف پول انجام می‌شود. در صورت مشاهده
        مغایرت، لطفاً از طریق{" "}
        <Link href="/contact" className="font-bold text-brand-700 hover:underline">
          تماس با پشتیبانی
        </Link>{" "}
        با ذکر شماره سفارش پیگیری کنید.
      </div>
    </div>
  );
}
