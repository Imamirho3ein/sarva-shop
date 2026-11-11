import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { CircleAlert } from "lucide-react";
import { CheckoutResult } from "@/components/checkout/checkout-result";
import { Button } from "@/components/ui/button";
import { getSession } from "@/lib/auth";
import { getOrderByNumberForUser } from "@/lib/services/orders";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: `نتیجه سفارش`,
  robots: { index: false, follow: false },
};

export default async function CheckoutResultPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string; failed?: string; message?: string }>;
}) {
  const sp = await searchParams;
  const session = await getSession();
  const orderNumber = sp.order?.trim();

  if (!session) {
    const next = `/checkout/result${orderNumber ? `?order=${encodeURIComponent(orderNumber)}` : ""}`;
    redirect(`/login?next=${encodeURIComponent(next)}`);
  }

  const order = orderNumber
    ? await getOrderByNumberForUser(session.id, orderNumber)
    : null;

  if (!order) {
    return (
      <div className="container-site py-10 lg:py-16">
        <div className="mx-auto w-full max-w-lg rounded-2xl border border-ink-100 bg-white p-8 text-center shadow-soft">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-warning-100 text-warning-500">
            <CircleAlert className="h-7 w-7" />
          </span>
          <h1 className="mt-4 text-lg font-black text-ink-900">سفارش پیدا نشد</h1>
          <p className="mt-1.5 text-sm leading-6 text-ink-500">
            سفارشی با این شماره در حساب کاربری شما ثبت نشده است. می‌توانید از پنل کاربری،
            سفارش‌های خود را بررسی کنید.
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            <Button asChild>
              <Link href="/account/orders">سفارش‌های من</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/products">ادامه خرید</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-site py-6 lg:py-10">
      <CheckoutResult order={order} failed={sp.failed === "1"} message={sp.message} />
    </div>
  );
}
