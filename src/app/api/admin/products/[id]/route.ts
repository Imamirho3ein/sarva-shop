import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { fail, ok, route } from "@/lib/api";
import { adminProductSchema } from "@/lib/admin-validators";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

/** ویرایش محصول */
export const PATCH = route(async (req: Request, ctx: Ctx) => {
  await requireAdmin();
  const { id } = await ctx.params;
  const input = adminProductSchema.partial().parse(await req.json());

  const current = await prisma.product.findUnique({
    where: { id },
    select: { id: true, price: true, slug: true },
  });
  if (!current) return fail("محصول پیدا نشد.", 404);

  if (
    input.discountPrice &&
    input.discountPrice >= (input.price ?? current.price)
  ) {
    return fail("قیمت با تخفیف باید کمتر از قیمت اصلی باشد.", 422);
  }

  await prisma.$transaction(async (db) => {
    await db.product.update({
      where: { id },
      data: {
        ...(input.name !== undefined ? { name: input.name } : {}),
        ...(input.slug ? { slug: input.slug } : {}),
        ...(input.sku !== undefined ? { sku: input.sku } : {}),
        ...(input.description !== undefined ? { description: input.description } : {}),
        ...(input.shortDesc !== undefined ? { shortDesc: input.shortDesc || null } : {}),
        ...(input.price !== undefined ? { price: input.price } : {}),
        ...(input.discountPrice !== undefined
          ? { discountPrice: input.discountPrice && input.discountPrice > 0 ? input.discountPrice : null }
          : {}),
        ...(input.stock !== undefined ? { stock: input.stock } : {}),
        ...(input.categoryId !== undefined ? { categoryId: input.categoryId } : {}),
        ...(input.brandId !== undefined ? { brandId: input.brandId || null } : {}),
        ...(input.warranty !== undefined ? { warranty: input.warranty || null } : {}),
        ...(input.isFeatured !== undefined ? { isFeatured: input.isFeatured } : {}),
        ...(input.isNew !== undefined ? { isNew: input.isNew } : {}),
        ...(input.isSpecial !== undefined ? { isSpecial: input.isSpecial } : {}),
        ...(input.specialEndsAt !== undefined
          ? { specialEndsAt: input.specialEndsAt ?? null }
          : {}),
      },
    });

    if (input.image !== undefined) {
      await db.productImage.deleteMany({ where: { productId: id } });
      if (input.image) {
        await db.productImage.create({
          data: {
            productId: id,
            url: input.image,
            alt: input.imageAlt || input.name || current.slug,
            order: 0,
          },
        });
      }
    }
  });

  revalidatePath("/admin/products");
  revalidatePath("/products");
  revalidatePath(`/product/${current.slug}`);
  revalidatePath("/");
  return ok({ updated: true });
});

/** حذف محصول */
export const DELETE = route(async (_req: Request, ctx: Ctx) => {
  await requireAdmin();
  const { id } = await ctx.params;

  const orderItems = await prisma.orderItem.count({ where: { productId: id } });
  if (orderItems > 0) {
    return fail(
      "این محصول در سفارش‌های ثبت‌شده استفاده شده و قابل حذف نیست. آن را غیرفعال یا ناموجود کنید.",
      409,
    );
  }

  await prisma.product.delete({ where: { id } });

  revalidatePath("/admin/products");
  revalidatePath("/products");
  revalidatePath("/");
  return ok({ deleted: true });
});
