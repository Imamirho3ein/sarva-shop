import { applyCouponSchema } from "@/lib/validators";
import { validateCoupon } from "@/lib/services/coupons";
import { fail, ok, route } from "@/lib/api";

export const POST = route(async (req: Request) => {
  const body = await req.json();
  const input = applyCouponSchema.parse(body);

  const result = await validateCoupon(input.code, input.subtotal);
  if (!result.ok) return fail(result.message, 400);

  return ok(result.data);
});
