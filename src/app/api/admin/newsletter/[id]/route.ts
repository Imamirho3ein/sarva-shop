import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { ok, route } from "@/lib/api";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

/** حذف مشترک خبرنامه */
export const DELETE = route(async (_req: Request, ctx: Ctx) => {
  await requireAdmin();
  const { id } = await ctx.params;

  await prisma.newsletterSubscriber.deleteMany({ where: { id } });
  revalidatePath("/admin/messages");
  return ok({ deleted: true });
});
