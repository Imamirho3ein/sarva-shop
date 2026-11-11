import { getOrderDetail } from "@/lib/services/orders";
import { requireSession } from "@/lib/auth";
import { fail, ok, route } from "@/lib/api";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

export const GET = route(async (_req: Request, ctx: Ctx) => {
  const session = await requireSession();
  const { id } = await ctx.params;
  const order = await getOrderDetail(session.id, id);
  if (!order) return fail("سفارش پیدا نشد.", 404);
  return ok({ order });
});
