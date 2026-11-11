import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { CouponManager, type CouponRow } from "@/components/admin/coupon-manager";

export const metadata: Metadata = {
  title: "کدهای تخفیف | پنل مدیریت",
  robots: { index: false, follow: false },
};

export default async function AdminCouponsPage() {
  const rows = await prisma.coupon.findMany({ orderBy: { createdAt: "desc" } });

  const coupons: CouponRow[] = rows.map((row) => ({
    id: row.id,
    code: row.code,
    type: row.type,
    value: row.value,
    minOrder: row.minOrder,
    maxDiscount: row.maxDiscount,
    usageLimit: row.usageLimit,
    usedCount: row.usedCount,
    perUserLimit: row.perUserLimit,
    startsAt: row.startsAt?.toISOString() ?? null,
    expiresAt: row.expiresAt?.toISOString() ?? null,
    description: row.description,
    isActive: row.isActive,
  }));

  return <CouponManager rows={coupons} />;
}
