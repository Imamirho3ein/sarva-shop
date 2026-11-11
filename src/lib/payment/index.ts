import "server-only";

/**
 * لایه‌ی انتزاعی درگاه پرداخت.
 * امروز با sandbox شبیه‌سازی می‌شود؛ برای اتصال به درگاه واقعی
 * کافی است پیاده‌سازی جدیدی بسازید و در `paymentProviders` ثبت کنید.
 */

export type PaymentRequest = {
  orderId: string;
  orderNumber: string;
  amount: number; // تومان
  callbackUrl: string;
  description?: string;
  email?: string;
  mobile?: string;
};

export type PaymentStartResult = {
  ok: boolean;
  authority?: string;
  /** آدرسی که کاربر باید به آن هدایت شود (درگاه یا صفحه‌ی شبیه‌ساز) */
  redirectUrl?: string;
  message?: string;
};

export type PaymentVerifyResult = {
  ok: boolean;
  status: "SUCCESS" | "FAILED";
  refId?: string;
  cardPan?: string;
  message?: string;
};

export interface PaymentProvider {
  readonly key: string;
  readonly title: string;
  start(req: PaymentRequest): Promise<PaymentStartResult>;
  verify(authority: string, amount: number): Promise<PaymentVerifyResult>;
}

// -------------------------- پیاده‌سازی Sandbox ----------------------------

type SandboxRecord = {
  amount: number;
  orderNumber: string;
  status: "PENDING" | "SUCCESS" | "FAILED";
  cardPan?: string;
  refId?: string;
};

/** ذخیره‌ساز موقت در حافظه‌ی فرآیند — برای محصول واقعی به دیتابیس منتقل شود */
const sandboxStore = new Map<string, SandboxRecord>();

export class SandboxPaymentProvider implements PaymentProvider {
  readonly key = "sandbox";
  readonly title = "درگاه آزمایشی سَروا";

  async start(req: PaymentRequest): Promise<PaymentStartResult> {
    const authority = `SBOX${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`.toUpperCase();
    sandboxStore.set(authority, {
      amount: req.amount,
      orderNumber: req.orderNumber,
      status: "PENDING",
    });
    const url = new URL("/checkout/payment/sandbox", req.callbackUrl || "http://localhost:3000");
    url.searchParams.set("authority", authority);
    // مسیر نسبی برگردانده می‌شود تا در هر دامنه/پورت/پراکسی درست کار کند.
    return { ok: true, authority, redirectUrl: `${url.pathname}${url.search}` };
  }

  async verify(authority: string, amount: number): Promise<PaymentVerifyResult> {
    // در حالت توسعه ممکن است ماژول در chunkهای جدا بارگذاری شود و Map محلی خالی باشد؛
    // بنابراین اگر رکورد نبود، با مبلغ ذخیره‌شده در دیتابیس (همین amount) تراکنش را معتبر می‌دانیم.
    const rec =
      sandboxStore.get(authority) ??
      (authority.startsWith("SBOX")
        ? (sandboxStore.set(authority, { amount, orderNumber: "", status: "PENDING" }),
          sandboxStore.get(authority))
        : undefined);
    if (!rec) return { ok: false, status: "FAILED", message: "تراکنش یافت نشد" };
    if (rec.status === "SUCCESS") {
      return { ok: true, status: "SUCCESS", refId: rec.refId, cardPan: rec.cardPan };
    }
    if (rec.amount !== amount) {
      rec.status = "FAILED";
      return { ok: false, status: "FAILED", message: "مبلغ پرداختی با سفارش یکسان نیست" };
    }
    rec.status = "SUCCESS";
    rec.refId = `${Date.now().toString().slice(-10)}`;
    rec.cardPan = `6037${"•".repeat(10)}${Math.floor(1000 + Math.random() * 9000)}`;
    return { ok: true, status: "SUCCESS", refId: rec.refId, cardPan: rec.cardPan };
  }

  /** فقط برای تست‌ها */
  fail(authority: string) {
    const rec = sandboxStore.get(authority);
    if (rec) rec.status = "FAILED";
  }

  peek(authority: string) {
    return sandboxStore.get(authority);
  }
}

// ------------------------------ رجیستری ----------------------------------

const paymentProviders: Record<string, PaymentProvider> = {
  sandbox: new SandboxPaymentProvider(),
};

export function getPaymentProvider(key?: string | null): PaymentProvider {
  return paymentProviders[key ?? "sandbox"] ?? paymentProviders.sandbox;
}

export function listPaymentProviders(): PaymentProvider[] {
  return Object.values(paymentProviders);
}

export const sandbox = paymentProviders.sandbox as SandboxPaymentProvider;
