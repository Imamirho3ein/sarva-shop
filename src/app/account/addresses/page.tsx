import type { Metadata } from "next";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AddressManager } from "@/components/account/address-manager";
import type { AddressDTO } from "@/types";

export const metadata: Metadata = {
  title: `آدرس‌های من`,
  robots: { index: false, follow: false },
};

export default async function AccountAddressesPage() {
  const session = await getSession();
  if (!session) return null;

  const rows = await prisma.address.findMany({
    where: { userId: session.id },
    orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
  });

  const addresses: AddressDTO[] = rows.map((a) => ({
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

  return <AddressManager initial={addresses} />;
}
