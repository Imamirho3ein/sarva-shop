/**
 * محاسبه‌ی هزینه ارسال — معماری قابل توسعه.
 * برای افزودن شرکت حمل‌ونقل جدید، فقط یک ShippingCarrier دیگر ثبت کنید.
 */

export type ShippingKey = "POST" | "COURIER" | "EXPRESS" | "PICKUP";

export type ShippingOption = {
  key: ShippingKey;
  title: string;
  description: string;
  fee: number;
  eta: string; // بازه تحویل
  icon: string; // نام آیکون
  enabled: boolean;
};

export type ShippingContext = {
  subtotal: number;
  province?: string;
  city?: string;
};

/** آستانه ارسال رایگان */
export const FREE_SHIPPING_THRESHOLD = 5_000_000;
export const FREE_SHIPPING_FEE = 0;

type Carrier = (ctx: ShippingContext) => ShippingOption[];

const baseOptions: Carrier = () => [
  {
    key: "POST",
    title: "پست پیشتاز",
    description: "تحویل توسط اداره پست به آدرس گیرنده",
    fee: 89_000,
    eta: "۲ تا ۴ روز کاری",
    icon: "Package",
    enabled: true,
  },
  {
    key: "COURIER",
    title: "پیک سَروا",
    description: "ارسال سریع با پیک در شهرهای بزرگ",
    fee: 149_000,
    eta: "۱ تا ۲ روز کاری",
    icon: "Bike",
    enabled: true,
  },
  {
    key: "EXPRESS",
    title: "ارسال فوری",
    description: "همان روز برای سفارش‌های قبل از ساعت ۱۵",
    fee: 289_000,
    eta: "همان روز",
    icon: "Zap",
    enabled: true,
  },
  {
    key: "PICKUP",
    title: "تحویل حضوری",
    description: "دریافت از مرکز پردازش سَروا",
    fee: 0,
    eta: "آماده در ۳ ساعت",
    icon: "Store",
    enabled: true,
  },
];

const carriers: Record<string, Carrier> = {
  standard: baseOptions,
};

/** لیست روش‌های ارسال با اعمال تخفیف/رایگان‌شدن */
export function getShippingOptions(ctx: ShippingContext): ShippingOption[] {
  const run = carriers.standard ?? baseOptions;
  const free = ctx.subtotal >= FREE_SHIPPING_THRESHOLD;

  return run(ctx)
    .filter((o) => o.enabled)
    .map((o) => ({
      ...o,
      fee: o.key === "PICKUP" ? 0 : free ? FREE_SHIPPING_FEE : o.fee,
      description: free && o.key !== "PICKUP" ? `${o.description} — ارسال رایگان` : o.description,
    }));
}

export function findShippingOption(
  key: string,
  ctx: ShippingContext,
): ShippingOption | undefined {
  return getShippingOptions(ctx).find((o) => o.key === key);
}

/** هزینه ارسال پیش‌فرض */
export default function shippingFee(key: string, ctx: ShippingContext): number {
  return findShippingOption(key, ctx)?.fee ?? getShippingOptions(ctx)[0]?.fee ?? 0;
}
