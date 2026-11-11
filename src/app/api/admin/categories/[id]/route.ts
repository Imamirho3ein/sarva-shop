import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { fail, ok, route } from "@/lib/api";
import { adminCategorySchema } from "@/lib/admin-validators";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

export const PATCH = route(async (req: Request, ctx: Ctx) => {
  await requireAdmin();
  const { id } = await ctx.params;
  const input = adminCategorySchema.partial().parse(await req.json());

  if (input.parentId === id) {
    return fail("دسته‌بندی نمی‌تواند والد خودش باشد.", 422);
  }

  const category = await prisma.category.update({
    where: { id },
    data: {
      ...(input.name !== undefined ? { name: input.name } : {}),
      ...(input.slug ? { slug: input.slug } : {}),
      ...(input.description !== undefined
        ? { description: input.description || null }
        : {}),
      ...(input.image !== undefined ? { image: input.image || null } : {}),
      ...(input.parentId !== undefined ? { parentId: input.parentId || null } : {}),
      ...(input.icon !== undefined ? { icon: input.icon || null } : {}),
      ...(input.order !== undefined ? { order: input.order } : {}),
      ...(input.isPopular !== undefined ? { isPopular: input.isPopular } : {}),
      ...(input.isActive !== undefined ? { isActive: input.isActive } : {}),
    },
    select: { id: true },
  });

  revalidatePath("/admin/categories");
  revalidatePath("/categories");
  revalidatePath("/");
  return ok({ category });
});

export const DELETE = route(async (_req: Request, ctx: Ctx) => {
  await requireAdmin();
  const { id } = await ctx.params;

  const count = await prisma.product.count({ where: { categoryId: id } });
  if (count > 0) {
    return fail(
      "این دسته‌بندی محصول دارد و قابل حذف نیست. ابتدا محصولات را منتقل یا حذف کنید.",
      409,
    );
  }

  await prisma.category.delete({ where: { id } });
  revalidatePath("/admin/categories");
  revalidatePath("/categories");
  return ok({ deleted: true });
});
