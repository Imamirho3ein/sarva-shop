import type { Metadata } from "next";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  NotificationsList,
  type NotificationItem,
} from "@/components/account/notifications-list";

export const metadata: Metadata = {
  title: `اعلان‌های من`,
  robots: { index: false, follow: false },
};

export default async function AccountNotificationsPage() {
  const session = await getSession();
  if (!session) return null;

  const rows = await prisma.notification.findMany({
    where: { userId: session.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const items: NotificationItem[] = rows.map((n) => ({
    id: n.id,
    title: n.title,
    body: n.body,
    link: n.link,
    type: n.type,
    isRead: n.isRead,
    createdAt: n.createdAt.toISOString(),
  }));

  return <NotificationsList initial={items} />;
}
