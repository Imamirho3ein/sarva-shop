import { cancelUserOrder } from "@/lib/services/orders";
import { requireSession } from "@/lib/auth";
import { fail, ok, route } from "@/lib/api";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

/** لغو سفارش توسط کاربر (فقط پیش از ارسال). */
export const POST = route(async (req: Request, ctx: Ctx) => {
  const session = await requireSession();
  const { id } = await ctx.params;
  const body = (await req.json().catch(() => ({}))) as { reason?: string };
  const reason = typeof body.reason === "string" ? body.reason.slice(0, 300) : undefined;

  const result = await cancelUserOrder(session.id, id, reason);
  if (!result.ok) return fail(result.message, 400);
  return ok({ canceled: true });
});
