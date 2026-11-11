import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { fail, ok, route } from "@/lib/api";
import { adminCouponSchema } from "@/lib/admin-validators";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

export const PATCH = route(async (req: Request, ctx: Ctx) => {
  await requireAdmin();
  const { id } = await ctx.params;
  const input = adminCouponSchema.partial().parse(await req.json());

  const coupon = await prisma.coupon.update({
    where: { id },
    data: {
      ...(input.code ? { code: input.code } : {}),
      ...(input.type !== undefined ? { type: input.type } : {}),
      ...(input.value !== undefined ? { value: input.value } : {}),
      ...(input.minOrder !== undefined ? { minOrder: input.minOrder } : {}),
      ...(input.maxDiscount !== undefined
        ? { maxDiscount: input.maxDiscount ?? null }
        : {}),
      ...(input.usageLimit !== undefined
        ? { usageLimit: input.usageLimit ?? null }
        : {}),
      ...(input.perUserLimit !== undefined
        ? { perUserLimit: input.perUserLimit }
        : {}),
      ...(input.startsAt !== undefined ? { startsAt: input.startsAt ?? null } : {}),
      ...(input.expiresAt !== undefined
        ? { expiresAt: input.expiresAt ?? null }
        : {}),
      ...(input.description !== undefined
        ? { description: input.description || null }
        : {}),
      ...(input.isActive !== undefined ? { isActive: input.isActive } : {}),
    },
    select: { id: true },
  });

  revalidatePath("/admin/coupons");
  return ok({ coupon });
});

export const DELETE = route(async (_req: Request, ctx: Ctx) => {
  await requireAdmin();
  const { id } = await ctx.params;

  const used = await prisma.order.count({ where: { couponId: id } });
  if (used > 0) {
    return fail(
      "این کد در سفارش‌های ثبت‌شده استفاده شده است؛ برای توقف استفاده آن را غیرفعال کنید.",
      409,
    );
  }

  await prisma.coupon.delete({ where: { id } });
  revalidatePath("/admin/coupons");
  return ok({ deleted: true });
});
