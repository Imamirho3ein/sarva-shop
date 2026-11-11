import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { CategoryManager, type CategoryRow } from "@/components/admin/category-manager";

export const metadata: Metadata = {
  title: "دسته‌بندی‌ها | پنل مدیریت",
  robots: { index: false, follow: false },
};

export default async function AdminCategoriesPage() {
  const rows = await prisma.category.findMany({
    orderBy: [{ order: "asc" }, { name: "asc" }],
    include: { _count: { select: { products: true } } },
  });

  const categories: CategoryRow[] = rows.map((row) => ({
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    image: row.image,
    parentId: row.parentId,
    icon: row.icon,
    order: row.order,
    isPopular: row.isPopular,
    isActive: row.isActive,
    productCount: row._count.products,
  }));

  return <CategoryManager rows={categories} />;
}
