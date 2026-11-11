import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";
import { userUpdateSchema } from "@/lib/validators";
import { fail, ok, route } from "@/lib/api";

export const dynamic = "force-dynamic";

/** ویرایش اطلاعات حساب کاربری */
export const PATCH = route(async (req: Request) => {
  const session = await requireSession();
  const input = userUpdateSchema.parse(await req.json());

  if (input.phone) {
    const exists = await prisma.user.findFirst({
      where: { phone: input.phone, NOT: { id: session.id } },
      select: { id: true },
    });
    if (exists) return fail("این شماره موبایل قبلاً برای حساب دیگری ثبت شده است.", 409);
  }

  if (input.email) {
    const exists = await prisma.user.findFirst({
      where: { email: input.email.toLowerCase(), NOT: { id: session.id } },
      select: { id: true },
    });
    if (exists) return fail("این ایمیل قبلاً برای حساب دیگری ثبت شده است.", 409);
  }

  const user = await prisma.user.update({
    where: { id: session.id },
    data: {
      ...(input.name !== undefined ? { name: input.name } : {}),
      ...(input.phone !== undefined ? { phone: input.phone } : {}),
      ...(input.email !== undefined ? { email: input.email.toLowerCase() } : {}),
    },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      walletBalance: true,
    },
  });

  return ok({ user });
});
