import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { fail, ok, route } from "@/lib/api";
import { adminProductSchema } from "@/lib/admin-validators";
import { slugify } from "@/lib/utils";

export const dynamic = "force-dynamic";

function normalizeDiscount(price: number, discountPrice?: number | null) {
  if (!discountPrice) return null;
  return discountPrice > 0 && discountPrice < price ? discountPrice : null;
}

/** ایجاد محصول جدید */
export const POST = route(async (req: Request) => {
  await requireAdmin();
  const input = adminProductSchema.parse(await req.json());

  if (input.discountPrice && input.discountPrice >= input.price) {
    return fail("قیمت با تخفیف باید کمتر از قیمت اصلی باشد.", 422);
  }

  const baseSlug = slugify(input.slug || input.name) || `product-${Date.now()}`;
  const slugExists = await prisma.product.findUnique({
    where: { slug: baseSlug },
    select: { id: true },
  });
  const slug = slugExists ? `${baseSlug}-${Date.now().toString(36).slice(-4)}` : baseSlug;

  const product = await prisma.product.create({
    data: {
      name: input.name,
      slug,
      sku: input.sku,
      description: input.description,
      shortDesc: input.shortDesc || null,
      price: input.price,
      discountPrice: normalizeDiscount(input.price, input.discountPrice),
      stock: input.stock,
      categoryId: input.categoryId,
      brandId: input.brandId || null,
      warranty: input.warranty || null,
      isFeatured: input.isFeatured ?? false,
      isNew: input.isNew ?? false,
      isSpecial: input.isSpecial ?? false,
      specialEndsAt: input.specialEndsAt ?? null,
      ...(input.image
        ? {
            images: {
              create: [{ url: input.image, alt: input.imageAlt || input.name, order: 0 }],
            },
          }
        : {}),
    },
    select: { id: true, slug: true },
  });

  revalidatePath("/admin/products");
  revalidatePath("/products");
  revalidatePath("/");
  return ok({ product });
});
