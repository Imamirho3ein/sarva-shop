import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { fail, ok, route } from "@/lib/api";
import { orderStatusSchema } from "@/lib/validators";
import { adminChangeOrderStatus } from "@/lib/services/orders";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

/** تغییر وضعیت سفارش از پنل مدیریت */
export const PATCH = route(async (req: Request, ctx: Ctx) => {
  await requireAdmin();
  const { id } = await ctx.params;
  const input = orderStatusSchema.parse(await req.json());

  const result = await adminChangeOrderStatus(id, input.status, {
    trackingCode: input.trackingCode || null,
    note: input.note || null,
  });
  if (!result.ok) return fail(result.message, result.status ?? 422);

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${id}`);
  revalidatePath("/account/orders");
  revalidatePath(`/account/orders/${id}`);
  revalidatePath("/admin");
  return ok({ updated: true });
});
