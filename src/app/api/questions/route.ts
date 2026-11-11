import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";
import { questionSchema } from "@/lib/validators";
import { fail, ok, route } from "@/lib/api";

export const dynamic = "force-dynamic";

/** ثبت پرسش برای محصول */
export const POST = route(async (req: Request) => {
  const session = await requireSession();
  const input = questionSchema.parse(await req.json());

  const product = await prisma.product.findUnique({
    where: { id: input.productId },
    select: { id: true },
  });
  if (!product) return fail("محصول پیدا نشد.", 404);

  const question = await prisma.question.create({
    data: {
      productId: input.productId,
      userId: session.id,
      body: input.body,
      isApproved: true,
    },
  });

  return ok({ question: { id: question.id } }, { status: 201 });
});
