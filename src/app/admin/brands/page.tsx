import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { BrandManager, type BrandRow } from "@/components/admin/brand-manager";

export const metadata: Metadata = {
  title: "برندها | پنل مدیریت",
  robots: { index: false, follow: false },
};

export default async function AdminBrandsPage() {
  const rows = await prisma.brand.findMany({
    orderBy: [{ isPopular: "desc" }, { name: "asc" }],
    include: { _count: { select: { products: true } } },
  });

  const brands: BrandRow[] = rows.map((row) => ({
    id: row.id,
    name: row.name,
    slug: row.slug,
    logo: row.logo,
    country: row.country,
    description: row.description,
    isPopular: row.isPopular,
    isActive: row.isActive,
    productCount: row._count.products,
  }));

  return <BrandManager rows={brands} />;
}
