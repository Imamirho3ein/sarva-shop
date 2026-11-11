import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { fail, ok, route } from "@/lib/api";
import { adminCategorySchema } from "@/lib/admin-validators";
import { slugify } from "@/lib/utils";

export const dynamic = "force-dynamic";

/** ایجاد دسته‌بندی */
export const POST = route(async (req: Request) => {
  await requireAdmin();
  const input = adminCategorySchema.parse(await req.json());

  const base = slugify(input.slug || input.name) || `cat-${Date.now()}`;
  const exists = await prisma.category.findUnique({
    where: { slug: base },
    select: { id: true },
  });
  const slug = exists ? `${base}-${Date.now().toString(36).slice(-4)}` : base;

  const category = await prisma.category.create({
    data: {
      name: input.name,
      slug,
      description: input.description || null,
      image: input.image || null,
      parentId: input.parentId || null,
      icon: input.icon || null,
      order: input.order ?? 0,
      isPopular: input.isPopular ?? false,
      isActive: input.isActive ?? true,
    },
    select: { id: true, slug: true },
  });

  revalidatePath("/admin/categories");
  revalidatePath("/categories");
  revalidatePath("/");
  return ok({ category });
});
