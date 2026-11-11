import { retryPayment } from "@/lib/services/orders";
import { requireSession } from "@/lib/auth";
import { fail, ok, route } from "@/lib/api";

export const dynamic = "force-dynamic";

/** ایجاد مجدد تراکنش برای سفارش در انتظار پرداخت. */
export const POST = route(async (req: Request) => {
  const session = await requireSession();
  const body = (await req.json().catch(() => ({}))) as { orderId?: string };
  if (!body.orderId) return fail("شناسه سفارش ارسال نشده است.", 400);

  const result = await retryPayment(session.id, body.orderId);
  if (!result.ok) return fail(result.message, 400);
  return ok(result);
});
