import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { ok, route } from "@/lib/api";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

const patchSchema = z.object({ isRead: z.boolean() });

/** علامت‌گذاری پیام تماس به‌عنوان خوانده‌شده / خوانده‌نشده */
export const PATCH = route(async (req: Request, ctx: Ctx) => {
  await requireAdmin();
  const { id } = await ctx.params;
  const input = patchSchema.parse(await req.json());

  const existing = await prisma.contactMessage.findUnique({
    where: { id },
    select: { id: true },
  });
  if (!existing) return ok({ updated: false });

  await prisma.contactMessage.update({
    where: { id },
    data: { isRead: input.isRead },
  });

  revalidatePath("/admin/messages");
  return ok({ updated: true });
});

/** حذف پیام تماس */
export const DELETE = route(async (_req: Request, ctx: Ctx) => {
  await requireAdmin();
  const { id } = await ctx.params;

  await prisma.contactMessage.deleteMany({ where: { id } });
  revalidatePath("/admin/messages");
  return ok({ deleted: true });
});
