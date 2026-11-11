import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";
import { ok, route } from "@/lib/api";

export const dynamic = "force-dynamic";

/** خواندن همه اعلان‌های کاربر */
export const PATCH = route(async (req: Request) => {
  const session = await requireSession();
  const body = (await req.json().catch(() => ({}))) as { all?: boolean };

  if (body.all) {
    await prisma.notification.updateMany({
      where: { userId: session.id, isRead: false },
      data: { isRead: true },
    });
    return ok({ updated: true });
  }

  return ok({ updated: false });
});
