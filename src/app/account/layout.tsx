import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { AccountNav } from "@/components/account/account-nav";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AccountLayout({ children }: { children: ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/login?next=/account");

  const unread = await prisma.notification.count({
    where: { userId: session.id, isRead: false },
  });

  return (
    <div className="container-site py-4 lg:py-6">
      <Breadcrumb items={[{ label: "حساب کاربری" }]} />
      <div className="mt-3 grid gap-4 lg:grid-cols-[270px_minmax(0,1fr)] lg:items-start">
        <AccountNav
          user={{
            name: session.name,
            email: session.email,
            walletBalance: session.walletBalance,
          }}
          unread={unread}
        />
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
