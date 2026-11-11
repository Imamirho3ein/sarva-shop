import { failPayment, getSandboxTransaction, verifyPayment } from "@/lib/services/orders";
import { requireSession } from "@/lib/auth";
import { fail, ok, route } from "@/lib/api";

export const dynamic = "force-dynamic";

/**
 * تأیید یا لغو پرداخت. این مسیر پس از بازگشت از درگاه (یا در صفحه درگاه آزمایشی)
 * فراخوانی می‌شود. مبلغ و وضعیت از تراکنش ذخیره‌شده خوانده می‌شود.
 */
export const POST = route(async (req: Request) => {
  const session = await requireSession();
  const body = (await req.json().catch(() => ({}))) as {
    authority?: string;
    success?: boolean;
  };

  const authority = body.authority?.trim();
  if (!authority) return fail("شناسه تراکنش ارسال نشده است.", 400);

  const tx = await getSandboxTransaction(authority);
  if (!tx) return fail("تراکنش پرداخت پیدا نشد.", 404);
  if (tx.order.userId !== session.id) return fail("این تراکنش متعلق به شما نیست.", 403);

  const result =
    body.success === false ? await failPayment(authority) : await verifyPayment(authority);

  if (!result.ok) {
    return fail(result.message, 402, {
      orderId: result.orderId,
      orderNumber: result.orderNumber,
    });
  }

  return ok({
    orderId: result.orderId,
    orderNumber: result.orderNumber,
    status: result.status,
  });
});
