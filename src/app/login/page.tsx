import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { BadgeCheck, Lock, ShieldCheck, Truck } from "lucide-react";
import { LoginForm } from "@/components/auth/auth-forms";
import { safeNext } from "@/lib/navigation";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { getSession } from "@/lib/auth";

export const metadata: Metadata = {
  title: `ورود به حساب`,
  description: "ورود به حساب کاربری فروشگاه اینترنتی سَروا برای پیگیری سفارش‌ها و خرید سریع‌تر.",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function LoginPage({ searchParams }: PageProps) {
  const session = await getSession();
  const sp = await searchParams;
  const next = safeNext(sp.next);

  if (session) redirect(next);

  return (
    <div className="container-site py-4 lg:py-8">
      <Breadcrumb items={[{ label: "ورود" }]} className="mb-3" />

      <div className="mx-auto grid max-w-4xl overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-xs lg:grid-cols-[1fr_360px]">
        <div className="p-5 sm:p-7">
          <h1 className="text-xl font-black text-ink-900 sm:text-2xl">ورود به حساب کاربری</h1>
          <p className="mt-1 text-[12px] leading-6 text-ink-500">
            برای پیگیری سفارش‌ها، ذخیره علاقه‌مندی‌ها و پرداخت سریع‌تر وارد شوید.
          </p>

          <div className="mt-5">
            <LoginForm next={next} />
          </div>
        </div>

        <aside className="hidden flex-col justify-between bg-gradient-to-br from-brand-800 via-brand-700 to-brand-900 p-6 text-white lg:flex">
          <div>
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/15 backdrop-blur">
              <Lock className="h-6 w-6" />
            </span>
            <h2 className="mt-4 text-lg font-black leading-8">خرید امن و سریع از سَروا</h2>
            <p className="mt-1.5 text-[12px] leading-6 text-white/80">
              با ورود به حساب، اطلاعات آدرس و سفارش‌های شما ذخیره می‌شود تا در خریدهای بعدی در
              چند ثانیه سفارش خود را ثبت کنید.
            </p>
          </div>

          <ul className="mt-6 space-y-3 text-[12px] font-medium text-white/90">
            <li className="flex items-start gap-2">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-brand-200" />
              پرداخت امن با درگاه بانکی و رمز دوم
            </li>
            <li className="flex items-start gap-2">
              <Truck className="mt-0.5 h-4 w-4 shrink-0 text-brand-200" />
              ارسال سریع به سراسر کشور
            </li>
            <li className="flex items-start gap-2">
              <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-brand-200" />
              ضمانت اصالت کالا و بازگشت ۷ روزه
            </li>
          </ul>

          <p className="mt-6 text-[10px] leading-5 text-white/60">
            ورود شما به منزله پذیرش{" "}
            <Link href="/terms" className="underline hover:text-white">
              قوانین و مقررات
            </Link>{" "}
            سَروا است.
          </p>
        </aside>
      </div>
    </div>
  );
}
