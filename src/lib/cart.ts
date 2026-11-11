/**
 * محاسبات سبد خرید — تنها منبع حقیقت برای مبالغ.
 * هم در سمت کلاینت (zustand) و هم در سرور (سفارش‌گذاری) استفاده می‌شود.
 */

export type CartLine = {
  productId: string;
  variantId?: string | null;
  name: string;
  image: string;
  slug: string;
  sku: string;
  price: number; // قیمت اصلی
  discountPrice?: number | null;
  quantity: number;
  stock: number;
  brandName?: string | null;
};

export type CouponResult = {
  valid: boolean;
  code?: string;
  message?: string;
  discount?: number;
  type?: "PERCENT" | "FIXED";
  value?: number;
};

export type CartTotals = {
  lines: number;
  subtotal: number; // مجموع قیمت اصلی (بدون تخفیف)
  productDiscount: number; // تخفیف خود محصولات
  couponDiscount: number; // تخفیف کد تخفیف
  discount: number; // مجموع تخفیف‌ها
  shippingFee: number;
  total: number;
};

export function lineUnitPrice(line: CartLine): number {
  return line.discountPrice && line.discountPrice < line.price
    ? line.discountPrice
    : line.price;
}

export function lineTotal(line: CartLine): number {
  return lineUnitPrice(line) * line.quantity;
}

/** قیمت اصلی (بدون تخفیف محصول) برای هر خط */
export function lineOriginalTotal(line: CartLine): number {
  return line.price * line.quantity;
}

export function clampQuantity(line: CartLine, qty: number): number {
  const max = Math.max(0, line.stock || 0);
  if (max <= 0) return 0;
  return Math.min(Math.max(1, Math.floor(qty)), max);
}

/** محاسبه‌ی کل سبد */
export function computeTotals(lines: CartLine[], coupon: CouponResult | null, shippingFee = 0): CartTotals {
  const subtotal = lines.reduce((s, l) => s + lineOriginalTotal(l), 0);
  const withDiscount = lines.reduce((s, l) => s + lineTotal(l), 0);
  const productDiscount = Math.max(0, subtotal - withDiscount);

  let couponDiscount = 0;
  if (coupon?.valid && coupon.discount) {
    couponDiscount = Math.min(coupon.discount, withDiscount);
  }

  const discount = productDiscount + couponDiscount;
  const total = Math.max(0, withDiscount - couponDiscount) + shippingFee;

  return {
    lines: lines.length,
    subtotal,
    productDiscount,
    couponDiscount,
    discount,
    shippingFee,
    total,
  };
}

/** تعداد کل اقلام */
export function totalQuantity(lines: CartLine[]): number {
  return lines.reduce((s, l) => s + l.quantity, 0);
}

/** اعمال کد تخفیف روی مبلغ */
export function applyCouponValue(
  coupon: { type: "PERCENT" | "FIXED"; value: number; maxDiscount?: number | null; minOrder?: number | null },
  amount: number,
): number {
  if (amount <= 0) return 0;
  const raw = coupon.type === "PERCENT" ? Math.round((amount * coupon.value) / 100) : coupon.value;
  const capped = coupon.maxDiscount ? Math.min(raw, coupon.maxDiscount) : raw;
  return Math.max(0, Math.min(capped, amount));
}
