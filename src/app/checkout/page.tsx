import type { Metadata } from "next";
import { CheckoutFlow } from "@/components/checkout/checkout-flow";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { AddressDTO } from "@/types";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: `تسویه حساب`,
  description: "تکمیل سفارش، انتخاب آدرس، روش ارسال و پرداخت امن در سَروا.",
  robots: { index: false, follow: false },
};

export default async function CheckoutPage() {
  const session = await getSession();

  let addresses: AddressDTO[] = [];
  if (session) {
    const rows = await prisma.address.findMany({
      where: { userId: session.id },
      orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
    });
    addresses = rows.map((a) => ({
      id: a.id,
      label: a.label,
      receiverName: a.receiverName,
      receiverPhone: a.receiverPhone,
      province: a.province,
      city: a.city,
      postalCode: a.postalCode,
      address: a.address,
      isDefault: a.isDefault,
    }));
  }

  return (
    <div className="container-site pb-24 pt-4 lg:pb-10 lg:pt-6">
      <Breadcrumb items={[{ label: "سبد خرید", href: "/cart" }, { label: "تسویه حساب" }]} />
      <div className="mt-3">
        <CheckoutFlow
          user={
            session
              ? {
                  id: session.id,
                  name: session.name,
                  email: session.email,
                  phone: session.phone,
                  walletBalance: session.walletBalance,
                }
              : null
          }
          addresses={addresses}
        />
      </div>
    </div>
  );
}
