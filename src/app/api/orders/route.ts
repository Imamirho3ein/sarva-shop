import { createOrder } from "@/lib/services/orders";
import { createOrderSchema } from "@/lib/validators";
import { requireSession } from "@/lib/auth";
import { fail, ok, route } from "@/lib/api";

export const dynamic = "force-dynamic";

/** ثبت سفارش — همه قیمت‌ها در سرور بازمحاسبه می‌شوند. */
export const POST = route(async (req: Request) => {
  const session = await requireSession();
  const input = createOrderSchema.parse(await req.json());

  const result = await createOrder({
    userId: session.id,
    addressId: input.addressId,
    shippingMethod: input.shippingMethod,
    paymentMethod: input.paymentMethod,
    couponCode: input.couponCode || null,
    note: input.note || null,
    useWallet: input.useWallet,
    items: input.items,
  });

  if (!result.ok) return fail(result.message, result.status ?? 422);
  return ok(result, { status: 201 });
});
