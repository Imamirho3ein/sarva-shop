import { prisma } from "@/lib/prisma";
import { hashPassword, requireSession, verifyPassword } from "@/lib/auth";
import { changePasswordSchema } from "@/lib/validators";
import { fail, ok, route } from "@/lib/api";

export const dynamic = "force-dynamic";

/** تغییر رمز عبور */
export const POST = route(async (req: Request) => {
  const session = await requireSession();
  const input = changePasswordSchema.parse(await req.json());

  const user = await prisma.user.findUnique({
    where: { id: session.id },
    select: { passwordHash: true },
  });
  if (!user) return fail("کاربر پیدا نشد.", 404);

  const valid = await verifyPassword(input.currentPassword, user.passwordHash);
  if (!valid) return fail("رمز عبور فعلی نادرست است.", 400);

  const passwordHash = await hashPassword(input.newPassword);
  await prisma.user.update({
    where: { id: session.id },
    data: { passwordHash },
  });

  return ok({ changed: true });
});
