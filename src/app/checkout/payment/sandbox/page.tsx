import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { CircleAlert } from "lucide-react";
import { SandboxGateway } from "@/components/checkout/sandbox-gateway";
import { Button } from "@/components/ui/button";
import { getSession } from "@/lib/auth";
import { getSandboxTransaction } from "@/lib/services/orders";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: `درگاه پرداخت`,
  robots: { index: false, follow: false },
};

function InvalidCard() {
  return (
    <div className="mx-auto w-full max-w-lg rounded-2xl border border-ink-100 bg-white p-8 text-center shadow-soft">
      <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-danger-50 text-danger-600">
        <CircleAlert className="h-7 w-7" />
      </span>
      <h1 className="mt-4 text-lg font-black text-ink-900">تراکنش معتبر نیست</h1>
      <p className="mt-1.5 text-sm leading-6 text-ink-500">
        لینک این پرداخت منقضی شده یا متعلق به حساب شما نیست. لطفاً از صفحه سفارش‌های خود دوباره
        تلاش کنید.
      </p>
      <div className="mt-5 flex flex-wrap justify-center gap-2">
        <Button asChild>
          <Link href="/account/orders">سفارش‌های من</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/cart">بازگشت به سبد خرید</Link>
        </Button>
      </div>
    </div>
  );
}

export default async function SandboxPaymentPage({
  searchParams,
}: {
  searchParams: Promise<{ authority?: string }>;
}) {
  const { authority } = await searchParams;
  const session = await getSession();

  if (!session) {
    const next = `/checkout/payment/sandbox${
      authority ? `?authority=${encodeURIComponent(authority)}` : ""
    }`;
    redirect(`/login?next=${encodeURIComponent(next)}`);
  }

  const tx = authority ? await getSandboxTransaction(authority) : null;

  if (!tx || tx.order.userId !== session.id) {
    return (
      <div className="container-site py-10 lg:py-16">
        <InvalidCard />
      </div>
    );
  }

  return (
    <div className="container-site py-8 lg:py-12">
      <SandboxGateway
        authority={authority as string}
        orderNumber={tx.order.orderNumber}
        amount={tx.amount}
        alreadyPaid={tx.status === "SUCCESS"}
      />
    </div>
  );
}
