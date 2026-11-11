import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { ok, route } from "@/lib/api";
import { adminInventorySchema } from "@/lib/admin-validators";

export const dynamic = "force-dynamic";

/** به‌روزرسانی موجودی، رزرو و قیمت محصول از صفحه انبار */
export const PATCH = route(async (req: Request) => {
  await requireAdmin();
  const input = adminInventorySchema.parse(await req.json());

  const product = await prisma.product.update({
    where: { id: input.id },
    data: {
      ...(input.stock !== undefined ? { stock: input.stock } : {}),
      ...(input.reservedStock !== undefined
        ? { reservedStock: input.reservedStock }
        : {}),
      ...(input.price !== undefined ? { price: input.price } : {}),
      ...(input.discountPrice !== undefined
        ? {
            discountPrice:
              input.discountPrice && input.discountPrice > 0
                ? input.discountPrice
                : null,
          }
        : {}),
    },
    select: { id: true, stock: true, reservedStock: true, price: true, discountPrice: true },
  });

  revalidatePath("/admin/inventory");
  revalidatePath("/admin/products");
  revalidatePath("/products");
  return ok({ product });
});
