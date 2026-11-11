import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";
import { reviewSchema } from "@/lib/validators";
import { fail, ok, route } from "@/lib/api";

export const dynamic = "force-dynamic";

/** ثبت نظر برای محصول */
export const POST = route(async (req: Request) => {
  const session = await requireSession();
  const input = reviewSchema.parse(await req.json());

  const product = await prisma.product.findUnique({
    where: { id: input.productId },
    select: { id: true },
  });
  if (!product) return fail("محصول پیدا نشد.", 404);

  const exists = await prisma.review.findUnique({
    where: { productId_userId: { productId: input.productId, userId: session.id } },
  });
  if (exists) return fail("شما قبلاً برای این محصول نظر ثبت کرده‌اید.", 409);

  const review = await prisma.$transaction(async (tx) => {
    const created = await tx.review.create({
      data: {
        productId: input.productId,
        userId: session.id,
        rating: input.rating,
        title: input.title?.trim() || "نظر کاربر",
        body: input.body,
        pros: input.pros?.trim() || null,
        cons: input.cons?.trim() || null,
        isRecommended: input.isRecommended ?? null,
        isApproved: true,
      },
    });

    const agg = await tx.review.aggregate({
      where: { productId: input.productId, isApproved: true },
      _avg: { rating: true },
      _count: true,
    });

    await tx.product.update({
      where: { id: input.productId },
      data: {
        rating: Math.round((agg._avg.rating ?? 0) * 10) / 10,
        reviewCount: agg._count,
      },
    });

    return created;
  });

  return ok({ review: { id: review.id } }, { status: 201 });
});
