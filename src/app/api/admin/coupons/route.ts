import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { ok, route } from "@/lib/api";
import { adminCouponSchema } from "@/lib/admin-validators";

export const dynamic = "force-dynamic";

/** ایجاد کد تخفیف */
export const POST = route(async (req: Request) => {
  await requireAdmin();
  const input = adminCouponSchema.parse(await req.json());

  const coupon = await prisma.coupon.create({
    data: {
      code: input.code,
      type: input.type,
      value: input.value,
      minOrder: input.minOrder ?? 0,
      maxDiscount: input.maxDiscount ?? null,
      usageLimit: input.usageLimit ?? null,
      perUserLimit: input.perUserLimit ?? 1,
      startsAt: input.startsAt ?? null,
      expiresAt: input.expiresAt ?? null,
      description: input.description || null,
      isActive: input.isActive ?? true,
    },
    select: { id: true, code: true },
  });

  revalidatePath("/admin/coupons");
  return ok({ coupon });
});
