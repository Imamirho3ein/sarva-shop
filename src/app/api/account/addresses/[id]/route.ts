import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";
import { addressSchema } from "@/lib/validators";
import { fail, ok, route } from "@/lib/api";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

/** ویرایش آدرس */
export const PATCH = route(async (req: Request, ctx: Ctx) => {
  const session = await requireSession();
  const { id } = await ctx.params;

  const existing = await prisma.address.findFirst({ where: { id, userId: session.id } });
  if (!existing) return fail("آدرس پیدا نشد.", 404);

  const input = addressSchema.parse(await req.json());

  const address = await prisma.$transaction(async (tx) => {
    if (input.isDefault) {
      await tx.address.updateMany({
        where: { userId: session.id },
        data: { isDefault: false },
      });
    }
    return tx.address.update({
      where: { id },
      data: {
        ...(input.label !== undefined ? { label: input.label } : {}),
        ...(input.receiverName !== undefined ? { receiverName: input.receiverName } : {}),
        ...(input.receiverPhone !== undefined ? { receiverPhone: input.receiverPhone } : {}),
        ...(input.province !== undefined ? { province: input.province } : {}),
        ...(input.city !== undefined ? { city: input.city } : {}),
        ...(input.postalCode !== undefined ? { postalCode: input.postalCode } : {}),
        ...(input.address !== undefined ? { address: input.address } : {}),
        ...(input.isDefault !== undefined ? { isDefault: input.isDefault } : {}),
      },
    });
  });

  return ok({ address });
});

/** حذف آدرس */
export const DELETE = route(async (_req: Request, ctx: Ctx) => {
  const session = await requireSession();
  const { id } = await ctx.params;

  const existing = await prisma.address.findFirst({ where: { id, userId: session.id } });
  if (!existing) return fail("آدرس پیدا نشد.", 404);

  await prisma.address.delete({ where: { id } });

  // اگر آدرس پیش‌فرض حذف شد، یکی دیگر را پیش‌فرض کن.
  if (existing.isDefault) {
    const next = await prisma.address.findFirst({
      where: { userId: session.id },
      orderBy: { createdAt: "desc" },
    });
    if (next) {
      await prisma.address.update({ where: { id: next.id }, data: { isDefault: true } });
    }
  }

  return ok({ deleted: true });
});
