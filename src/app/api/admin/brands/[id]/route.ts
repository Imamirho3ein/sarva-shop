import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { fail, ok, route } from "@/lib/api";
import { adminBrandSchema } from "@/lib/admin-validators";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

export const PATCH = route(async (req: Request, ctx: Ctx) => {
  await requireAdmin();
  const { id } = await ctx.params;
  const input = adminBrandSchema.partial().parse(await req.json());

  const brand = await prisma.brand.update({
    where: { id },
    data: {
      ...(input.name !== undefined ? { name: input.name } : {}),
      ...(input.slug ? { slug: input.slug } : {}),
      ...(input.logo !== undefined ? { logo: input.logo || null } : {}),
      ...(input.country !== undefined ? { country: input.country || null } : {}),
      ...(input.description !== undefined
        ? { description: input.description || null }
        : {}),
      ...(input.isPopular !== undefined ? { isPopular: input.isPopular } : {}),
      ...(input.isActive !== undefined ? { isActive: input.isActive } : {}),
    },
    select: { id: true },
  });

  revalidatePath("/admin/brands");
  revalidatePath("/brands");
  revalidatePath("/");
  return ok({ brand });
});

export const DELETE = route(async (_req: Request, ctx: Ctx) => {
  await requireAdmin();
  const { id } = await ctx.params;

  const count = await prisma.product.count({ where: { brandId: id } });
  if (count > 0) {
    return fail(
      "این برند محصول دارد و قابل حذف نیست. ابتدا محصولات را از برند خارج کنید.",
      409,
    );
  }

  await prisma.brand.delete({ where: { id } });
  revalidatePath("/admin/brands");
  revalidatePath("/brands");
  return ok({ deleted: true });
});
