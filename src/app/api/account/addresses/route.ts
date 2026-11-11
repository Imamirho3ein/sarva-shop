import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";
import { addressSchema } from "@/lib/validators";
import { ok, route } from "@/lib/api";

export const dynamic = "force-dynamic";

/** فهرست آدرس‌های کاربر */
export const GET = route(async () => {
  const session = await requireSession();
  const addresses = await prisma.address.findMany({
    where: { userId: session.id },
    orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
  });
  return ok({ addresses });
});

/** افزودن آدرس جدید */
export const POST = route(async (req: Request) => {
  const session = await requireSession();
  const input = addressSchema.parse(await req.json());

  const count = await prisma.address.count({ where: { userId: session.id } });
  const makeDefault = input.isDefault || count === 0;

  const address = await prisma.$transaction(async (tx) => {
    if (makeDefault) {
      await tx.address.updateMany({
        where: { userId: session.id },
        data: { isDefault: false },
      });
    }
    return tx.address.create({
      data: {
        userId: session.id,
        label: input.label || "آدرس",
        receiverName: input.receiverName,
        receiverPhone: input.receiverPhone,
        province: input.province,
        city: input.city,
        postalCode: input.postalCode,
        address: input.address,
        isDefault: makeDefault,
      },
    });
  });

  return ok({ address }, { status: 201 });
});
