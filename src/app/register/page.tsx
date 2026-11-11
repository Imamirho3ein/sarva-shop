import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { BadgeCheck, Gift, ShieldCheck, Wallet } from "lucide-react";
import { RegisterForm } from "@/components/auth/auth-forms";
import { safeNext } from "@/lib/navigation";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { getSession } from "@/lib/auth";

export const metadata: Metadata = {
  title: `ثبت‌نام`,
  description:
    "ساخت حساب کاربری در فروشگاه اینترنتی سَروا؛ ۱۰۰ هزار تومان هدیه کیف پول و خرید سریع‌تر.",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function RegisterPage({ searchParams }: PageProps) {
  const session = await getSession();
  const sp = await searchParams;
  const next = safeNext(sp.next);

  if (session) redirect(next);

  return (
    <div className="container-site py-4 lg:py-8">
      <Breadcrumb items={[{ label: "ثبت‌نام" }]} className="mb-3" />

      <div className="mx-auto grid max-w-4xl overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-xs lg:grid-cols-[1fr_360px]">
        <div className="p-5 sm:p-7">
          <h1 className="text-xl font-black text-ink-900 sm:text-2xl">ساخت حساب کاربری</h1>
          <p className="mt-1 text-[12px] leading-6 text-ink-500">
            با ثبت‌نام، ۱۰۰ هزار تومان هدیه به کیف پول شما اضافه می‌شود.
          </p>

          <div className="mt-5">
            <RegisterForm next={next} />
          </div>
        </div>

        <aside className="hidden flex-col justify-between bg-gradient-to-br from-accent-600 via-accent-500 to-accent-700 p-6 text-white lg:flex">
          <div>
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/15 backdrop-blur">
              <Gift className="h-6 w-6" />
            </span>
            <h2 className="mt-4 text-lg font-black leading-8">عضویت در باشگاه مشتریان سَروا</h2>
            <p className="mt-1.5 text-[12px] leading-6 text-white/85">
              با هر خرید امتیاز بگیرید، از تخفیف‌های اختصاصی باخبر شوید و سفارش‌هایتان را ساده‌تر
              پیگیری کنید.
            </p>
          </div>

          <ul className="mt-6 space-y-3 text-[12px] font-medium text-white/90">
            <li className="flex items-start gap-2">
              <Wallet className="mt-0.5 h-4 w-4 shrink-0" />
              ۱۰۰ هزار تومان هدیه کیف پول
            </li>
            <li className="flex items-start gap-2">
              <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0" />
              تخفیف‌های ویژه اعضا
            </li>
            <li className="flex items-start gap-2">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
              ضمانت اصالت کالا و بازگشت ۷ روزه
            </li>
          </ul>

          <p className="mt-6 text-[10px] leading-5 text-white/70">
            ثبت‌نام در سَروا به منزله پذیرش قوانین و مقررات فروشگاه است.
          </p>
        </aside>
      </div>
    </div>
  );
}
