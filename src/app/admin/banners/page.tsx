import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { BannerManager, type BannerRow } from "@/components/admin/banner-manager";

export const metadata: Metadata = {
  title: "بنرها | پنل مدیریت",
  robots: { index: false, follow: false },
};

export default async function AdminBannersPage() {
  const rows = await prisma.banner.findMany({
    orderBy: [{ order: "asc" }, { createdAt: "desc" }],
  });

  const banners: BannerRow[] = rows.map((row) => ({
    id: row.id,
    title: row.title,
    subtitle: row.subtitle,
    image: row.image,
    link: row.link,
    badge: row.badge,
    theme: row.theme,
    order: row.order,
    isActive: row.isActive,
    startsAt: row.startsAt?.toISOString() ?? null,
    endsAt: row.endsAt?.toISOString() ?? null,
  }));

  return <BannerManager rows={banners} />;
}
