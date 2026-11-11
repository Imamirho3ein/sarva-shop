import "server-only";
import { prisma } from "@/lib/prisma";
import { applyCouponValue } from "@/lib/cart";
import { formatPrice } from "@/lib/format";

export type CouponPreview = {
  coupon: {
    code: string;
    type: "PERCENT" | "FIXED";
    value: number;
    minOrder: number;
    maxDiscount: number | null;
    description: string | null;
  };
  discount: number;
};

export type CouponValidation =
  | { ok: true; data: CouponPreview }
  | { ok: false; message: string };

/**
 * اعتبارسنجی کد تخفیف برای مبلغ مشخصی از سبد خرید.
 * قوانین: فعال بودن، بازه زمانی، سقف استفاده و حداقل مبلغ سفارش.
 */
export async function validateCoupon(code: string, subtotal: number): Promise<CouponValidation> {
  const normalized = code.trim().toUpperCase();
  const coupon = await prisma.coupon.findUnique({ where: { code: normalized } });

  if (!coupon || !coupon.isActive) {
    return { ok: false, message: "کد تخفیف معتبر نیست." };
  }

  const now = new Date();
  if (coupon.startsAt && coupon.startsAt > now) {
    return { ok: false, message: "این کد تخفیف هنوز فعال نشده است." };
  }
  if (coupon.expiresAt && coupon.expiresAt < now) {
    return { ok: false, message: "این کد تخفیف منقضی شده است." };
  }
  if (coupon.usageLimit != null && coupon.usedCount >= coupon.usageLimit) {
    return { ok: false, message: "ظرفیت استفاده از این کد تخفیف تکمیل شده است." };
  }
  if (subtotal < coupon.minOrder) {
    return {
      ok: false,
      message: `حداقل مبلغ سفارش برای این کد ${formatPrice(coupon.minOrder)} است.`,
    };
  }

  const discount = applyCouponValue(
    {
      type: coupon.type,
      value: coupon.value,
      maxDiscount: coupon.maxDiscount,
      minOrder: coupon.minOrder,
    },
    subtotal,
  );

  if (discount <= 0) {
    return { ok: false, message: "این کد تخفیف برای سفارش شما قابل استفاده نیست." };
  }

  return {
    ok: true,
    data: {
      coupon: {
        code: coupon.code,
        type: coupon.type,
        value: coupon.value,
        minOrder: coupon.minOrder,
        maxDiscount: coupon.maxDiscount,
        description: coupon.description,
      },
      discount,
    },
  };
}
