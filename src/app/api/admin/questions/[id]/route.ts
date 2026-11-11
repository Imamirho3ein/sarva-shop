import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { ok, route } from "@/lib/api";
import { adminQuestionSchema } from "@/lib/admin-validators";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

/** پاسخ به پرسش کاربران */
export const PATCH = route(async (req: Request, ctx: Ctx) => {
  await requireAdmin();
  const { id } = await ctx.params;
  const input = adminQuestionSchema.parse(await req.json());

  await prisma.question.update({
    where: { id },
    data: {
      answer: input.answer,
      answerAt: new Date(),
      ...(input.isApproved !== undefined ? { isApproved: input.isApproved } : {}),
    },
  });

  revalidatePath("/admin/questions");
  revalidatePath("/products");
  return ok({ updated: true });
});

export const DELETE = route(async (_req: Request, ctx: Ctx) => {
  await requireAdmin();
  const { id } = await ctx.params;
  await prisma.question.delete({ where: { id } });
  revalidatePath("/admin/questions");
  return ok({ deleted: true });
});
