import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";
import { fail, ok, route } from "@/lib/api";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

/** خوانده‌شدن یک اعلان */
export const PATCH = route(async (_req: Request, ctx: Ctx) => {
  const session = await requireSession();
  const { id } = await ctx.params;

  const notification = await prisma.notification.findFirst({
    where: { id, userId: session.id },
    select: { id: true },
  });
  if (!notification) return fail("اعلان پیدا نشد.", 404);

  await prisma.notification.update({
    where: { id },
    data: { isRead: true },
  });

  return ok({ updated: true });
});
