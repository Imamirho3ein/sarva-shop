import type { OrderStatusKey } from "@/types";

/**
 * فراداده وضعیت سفارش — مشترک بین سرور و کلاینت.
 * رنگ‌ها با توکن‌های طراحی سایت هماهنگ هستند.
 */
export const ORDER_STATUS_META: Record<
  OrderStatusKey,
  { label: string; short: string; tone: "warning" | "success" | "info" | "brand" | "danger" | "neutral"; description: string }
> = {
  PENDING: {
    label: "در انتظار پرداخت",
    short: "در انتظار پرداخت",
    tone: "warning",
    description: "سفارش ثبت شده است اما پرداخت آن هنوز کامل نشده است.",
  },
  PAID: {
    label: "پرداخت شده",
    short: "پرداخت شده",
    tone: "success",
    description: "پرداخت سفارش با موفقیت انجام شده و در صف پردازش قرار دارد.",
  },
  PROCESSING: {
    label: "در حال پردازش",
    short: "در حال پردازش",
    tone: "info",
    description: "سفارش شما در حال آماده‌سازی و بسته‌بندی است.",
  },
  SHIPPED: {
    label: "ارسال شده",
    short: "ارسال شده",
    tone: "brand",
    description: "سفارش تحویل شرکت حمل شده و در راه است.",
  },
  DELIVERED: {
    label: "تحویل شده",
    short: "تحویل شده",
    tone: "success",
    description: "سفارش با موفقیت به شما تحویل داده شده است.",
  },
  CANCELED: {
    label: "لغو شده",
    short: "لغو شده",
    tone: "danger",
    description: "این سفارش لغو شده است.",
  },
  REFUNDED: {
    label: "بازگشت وجه",
    short: "بازگشت وجه",
    tone: "neutral",
    description: "وجه این سفارش به شما بازگردانده شده است.",
  },
};

export const PAYMENT_METHOD_LABELS: Record<string, string> = {
  ONLINE: "پرداخت اینترنتی",
  WALLET: "کیف پول سَروا",
  COD: "پرداخت در محل",
};

export const SHIPPING_METHOD_LABELS: Record<string, string> = {
  POST: "پست پیشتاز",
  COURIER: "پیک شهر",
  EXPRESS: "ارسال فوری",
  PICKUP: "تحویل حضوری",
};

export function orderStatusLabel(status: string): string {
  return ORDER_STATUS_META[status as OrderStatusKey]?.label ?? status;
}

export function orderStatusTone(
  status: string,
): "warning" | "success" | "info" | "brand" | "danger" | "neutral" {
  return ORDER_STATUS_META[status as OrderStatusKey]?.tone ?? "neutral";
}
