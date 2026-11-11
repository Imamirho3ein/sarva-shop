import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { ok, route } from "@/lib/api";
import { adminReviewSchema } from "@/lib/admin-validators";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

async function recalcProductRating(productId: string) {
  const agg = await prisma.review.aggregate({
    where: { productId, isApproved: true },
    _avg: { rating: true },
    _count: { _all: true },
  });
  await prisma.product.update({
    where: { id: productId },
    data: {
      rating: Number((agg._avg.rating ?? 0).toFixed(1)),
      reviewCount: agg._count._all,
    },
  });
}

/** تأیید/رد یا پاسخ به نظر */
export const PATCH = route(async (req: Request, ctx: Ctx) => {
  await requireAdmin();
  const { id } = await ctx.params;
  const input = adminReviewSchema.parse(await req.json());

  const current = await prisma.review.findUnique({
    where: { id },
    select: { productId: true },
  });
  if (!current) return ok({ updated: false });

  await prisma.review.update({
    where: { id },
    data: {
      ...(input.isApproved !== undefined ? { isApproved: input.isApproved } : {}),
      ...(input.reply !== undefined
        ? {
            reply: input.reply || null,
            replyAt: input.reply ? new Date() : null,
          }
        : {}),
    },
  });

  await recalcProductRating(current.productId);
  revalidatePath("/admin/reviews");
  revalidatePath("/account/reviews");
  revalidatePath("/products");
  return ok({ updated: true });
});

/** حذف نظر */
export const DELETE = route(async (_req: Request, ctx: Ctx) => {
  await requireAdmin();
  const { id } = await ctx.params;

  const current = await prisma.review.findUnique({
    where: { id },
    select: { productId: true },
  });
  if (!current) return ok({ deleted: false });

  await prisma.review.delete({ where: { id } });
  await recalcProductRating(current.productId);

  revalidatePath("/admin/reviews");
  revalidatePath("/account/reviews");
  revalidatePath("/products");
  return ok({ deleted: true });
});
