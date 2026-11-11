import "server-only";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { applyCouponValue } from "@/lib/cart";
import { formatPrice } from "@/lib/format";
import { SITE_URL } from "@/lib/constants";
import { findShippingOption, type ShippingKey } from "@/lib/shipping";
import { getPaymentProvider } from "@/lib/payment";
import { ORDER_STATUS_META, orderStatusLabel } from "@/lib/order-status";
import type {
  OrderDetailDTO,
  OrderStatusKey,
  OrderSummaryDTO,
} from "@/types";

/**
 * سرویس سفارش‌ها — تمام محاسبات قیمت، موجودی، کد تخفیف و کیف پول در سرور
 * و داخل تراکنش دیتابیس انجام می‌شود. هرگز به قیمت ارسالی از کلاینت اعتماد نمی‌کنیم.
 */

export type CreateOrderItemInput = {
  productId: string;
  variantId?: string | null;
  quantity: number;
};

export type CreateOrderInput = {
  userId: string;
  addressId: string;
  shippingMethod: ShippingKey;
  paymentMethod: "ONLINE" | "WALLET" | "COD";
  couponCode?: string | null;
  note?: string | null;
  useWallet?: boolean;
  items: CreateOrderItemInput[];
};

export type CreateOrderResult =
  | {
      ok: true;
      orderId: string;
      orderNumber: string;
      total: number;
      status: OrderStatusKey;
      requiresPayment: boolean;
      redirectUrl?: string;
      walletPaid: number;
    }
  | { ok: false; message: string; status?: number };

class OrderFailure extends Error {
  status: number;
  constructor(message: string, status = 422) {
    super(message);
    this.status = status;
  }
}

type PricedLine = {
  productId: string;
  variantId: string | null;
  name: string;
  image: string;
  slug: string;
  sku: string;
  price: number;
  unitPrice: number;
  quantity: number;
  total: number;
  variantName: string | null;
};

function orderNumber(): string {
  const stamp = Date.now().toString(36).toUpperCase().slice(-7);
  const rand = Math.floor(100 + Math.random() * 900);
  return `SV-${stamp}${rand}`;
}

function asStatus(value: string): OrderStatusKey {
  return (ORDER_STATUS_META[value as OrderStatusKey] ? value : "PENDING") as OrderStatusKey;
}

function fail(message: string, status = 422): CreateOrderResult {
  return { ok: false, message, status };
}

function notificationBody(orderNo: string, total: number) {
  return `سفارش ${orderNo} به مبلغ ${formatPrice(total)} ثبت شد.`;
}

// --------------------------------- ایجاد سفارش --------------------------------

export async function createOrder(input: CreateOrderInput): Promise<CreateOrderResult> {
  if (!input.items.length) return fail("سبد خرید شما خالی است.");

  const address = await prisma.address.findFirst({
    where: { id: input.addressId, userId: input.userId },
  });
  if (!address) return fail("آدرس انتخاب‌شده پیدا نشد. لطفاً آدرس را دوباره انتخاب کنید.");

  // ادغام اقلام تکراری
  const merged = new Map<string, CreateOrderItemInput>();
  for (const item of input.items) {
    if (!item.quantity || item.quantity < 1) continue;
    const key = `${item.productId}::${item.variantId ?? ""}`;
    const prev = merged.get(key);
    merged.set(key, {
      productId: item.productId,
      variantId: item.variantId ?? null,
      quantity: (prev?.quantity ?? 0) + Math.min(99, Math.floor(item.quantity)),
    });
  }

  const wanted = [...merged.values()];
  if (!wanted.length) return fail("سبد خرید شما خالی است.");

  const productIds = [...new Set(wanted.map((i) => i.productId))];
  const variantIds = [...new Set(wanted.map((i) => i.variantId).filter(Boolean))] as string[];

  const [products, variants] = await Promise.all([
    prisma.product.findMany({
      where: { id: { in: productIds } },
      select: {
        id: true,
        name: true,
        slug: true,
        sku: true,
        price: true,
        discountPrice: true,
        stock: true,
        images: { select: { url: true }, orderBy: { order: "asc" }, take: 1 },
      },
    }),
    variantIds.length
      ? prisma.productVariant.findMany({
          where: { id: { in: variantIds }, isActive: true },
        })
      : Promise.resolve([]),
  ]);

  const productMap = new Map(products.map((p) => [p.id, p]));
  const variantMap = new Map(variants.map((v) => [v.id, v]));

  const lines: PricedLine[] = [];

  for (const item of wanted) {
    const product = productMap.get(item.productId);
    if (!product) return fail("یکی از کالاهای سبد خرید دیگر موجود نیست.", 404);

    const variant = item.variantId ? variantMap.get(item.variantId) : null;
    if (item.variantId && (!variant || variant.productId !== product.id)) {
      return fail(`تنوع انتخابی برای «${product.name}» پیدا نشد.`, 404);
    }

    const stock = variant ? variant.stock : product.stock;
    if (stock < item.quantity) {
      return fail(
        `موجودی «${product.name}» کافی نیست. فقط ${stock} عدد در انبار موجود است.`,
        409,
      );
    }

    const basePrice = product.price;
    const discounted =
      product.discountPrice != null && product.discountPrice < product.price
        ? product.discountPrice
        : product.price;
    const unitPrice = variant?.price != null ? variant.price : discounted;

    lines.push({
      productId: product.id,
      variantId: variant?.id ?? null,
      name: variant ? `${product.name} — ${variant.name}` : product.name,
      image: product.images[0]?.url ?? "/images/placeholder.svg",
      slug: product.slug,
      sku: variant?.sku ?? product.sku,
      price: basePrice,
      unitPrice,
      quantity: item.quantity,
      total: unitPrice * item.quantity,
      variantName: variant?.name ?? null,
    });
  }

  const subtotal = lines.reduce((sum, l) => sum + l.price * l.quantity, 0);
  const payable = lines.reduce((sum, l) => sum + l.total, 0);
  const productDiscount = Math.max(0, subtotal - payable);

  // کد تخفیف
  let couponId: string | null = null;
  let couponCode: string | null = null;
  let couponDiscount = 0;

  if (input.couponCode?.trim()) {
    const code = input.couponCode.trim().toUpperCase();
    const coupon = await prisma.coupon.findUnique({ where: { code } });
    const now = new Date();

    if (!coupon || !coupon.isActive) {
      return fail("کد تخفیف معتبر نیست.");
    }
    if (coupon.startsAt && coupon.startsAt > now) {
      return fail("این کد تخفیف هنوز فعال نشده است.");
    }
    if (coupon.expiresAt && coupon.expiresAt < now) {
      return fail("این کد تخفیف منقضی شده است.");
    }
    if (coupon.usageLimit != null && coupon.usedCount >= coupon.usageLimit) {
      return fail("ظرفیت استفاده از این کد تخفیف تکمیل شده است.");
    }
    if (payable < coupon.minOrder) {
      return fail(`حداقل مبلغ سفارش برای این کد ${formatPrice(coupon.minOrder)} است.`);
    }

    const usedBefore = await prisma.order.count({
      where: {
        userId: input.userId,
        couponId: coupon.id,
        status: { not: "CANCELED" },
      },
    });
    if (usedBefore >= coupon.perUserLimit) {
      return fail("شما قبلاً از این کد تخفیف استفاده کرده‌اید.");
    }

    couponDiscount = applyCouponValue(
      {
        type: coupon.type,
        value: coupon.value,
        maxDiscount: coupon.maxDiscount,
        minOrder: coupon.minOrder,
      },
      payable,
    );

    if (couponDiscount <= 0) {
      return fail("این کد تخفیف برای سفارش شما قابل استفاده نیست.");
    }

    couponId = coupon.id;
    couponCode = coupon.code;
  }

  const afterCoupon = Math.max(0, payable - couponDiscount);
  const shipping = findShippingOption(input.shippingMethod, { subtotal: afterCoupon });
  if (!shipping) return fail("روش ارسال انتخاب‌شده معتبر نیست.");
  const shippingFee = shipping.fee;
  const total = afterCoupon + shippingFee;

  // کیف پول: فقط پرداخت کامل با کیف پول پشتیبانی می‌شود.
  const user = await prisma.user.findUnique({
    where: { id: input.userId },
    select: { walletBalance: true, name: true },
  });
  if (!user) return fail("کاربر یافت نشد.", 401);

  const wantsWallet = input.paymentMethod === "WALLET" || Boolean(input.useWallet);
  if (input.paymentMethod === "WALLET" && user.walletBalance < total) {
    return fail(
      `موجودی کیف پول شما کافی نیست. موجودی فعلی ${formatPrice(user.walletBalance)} است.`,
      409,
    );
  }
  const walletPaid = wantsWallet && user.walletBalance >= total ? total : 0;

  if (input.paymentMethod === "WALLET" && walletPaid < total) {
    return fail("موجودی کیف پول شما برای پرداخت این سفارش کافی نیست.", 409);
  }

  const isPaidNow = total === 0 || (walletPaid === total && total > 0);
  const requiresOnline = input.paymentMethod === "ONLINE" && !isPaidNow && total > 0;

  const status: OrderStatusKey = isPaidNow
    ? "PAID"
    : input.paymentMethod === "COD"
      ? "PROCESSING"
      : "PENDING";

  const number = orderNumber();
  const note = input.note?.trim() || null;
  const now = new Date();

  let createdId = "";
  let createdNumber = number;

  try {
    await prisma.$transaction(async (tx) => {
      // موجودی را رزرو کن (تغییر اتمی برای جلوگیری از فروش بیش از موجودی)
      for (const line of lines) {
        if (line.variantId) {
          const vr = await tx.productVariant.updateMany({
            where: { id: line.variantId, stock: { gte: line.quantity } },
            data: { stock: { decrement: line.quantity } },
          });
          if (vr.count === 0) {
            throw new OrderFailure(`موجودی «${line.name}» در این لحظه تغییر کرد.`, 409);
          }
        }
        const pr = await tx.product.updateMany({
          where: { id: line.productId, stock: { gte: line.quantity } },
          data: {
            stock: { decrement: line.quantity },
            reservedStock: { increment: line.quantity },
          },
        });
        if (pr.count === 0) {
          throw new OrderFailure(`موجودی «${line.name}» در این لحظه تغییر کرد.`, 409);
        }
      }

      // اگر همین حالا پرداخت شده یا پرداخت در محل است، موجودی را قطعی کن.
      const finalizedNow = isPaidNow || input.paymentMethod === "COD";
      if (finalizedNow) {
        for (const line of lines) {
          await tx.product.updateMany({
            where: { id: line.productId, reservedStock: { gte: line.quantity } },
            data: {
              reservedStock: { decrement: line.quantity },
              soldCount: { increment: line.quantity },
            },
          });
        }
      }

      // کسر از کیف پول (موجودی به‌صورت اتمی بررسی می‌شود)
      let walletBalanceAfter = user.walletBalance;
      if (walletPaid > 0) {
        const wr = await tx.user.updateMany({
          where: { id: input.userId, walletBalance: { gte: walletPaid } },
          data: { walletBalance: { decrement: walletPaid } },
        });
        if (wr.count === 0) {
          throw new OrderFailure("موجودی کیف پول شما کافی نیست.", 409);
        }
        const updated = await tx.user.findUnique({
          where: { id: input.userId },
          select: { walletBalance: true },
        });
        walletBalanceAfter = updated?.walletBalance ?? user.walletBalance - walletPaid;
      }

      const order = await tx.order.create({
        data: {
          orderNumber: number,
          userId: input.userId,
          status,
          paymentMethod: input.paymentMethod,
          shippingMethod: input.shippingMethod,
          subtotal,
          discount: productDiscount + couponDiscount,
          shippingFee,
          total,
          couponId,
          couponCode,
          addressLabel: address.label,
          receiverName: address.receiverName,
          receiverPhone: address.receiverPhone,
          province: address.province,
          city: address.city,
          postalCode: address.postalCode,
          addressLine: address.address,
          note,
          paidAt: isPaidNow ? now : null,
          items: {
            create: lines.map((l) => ({
              productId: l.productId,
              variantId: l.variantId,
              name: l.name,
              image: l.image,
              sku: l.sku,
              unitPrice: l.unitPrice,
              quantity: l.quantity,
              total: l.total,
            })),
          },
          timeline: {
            create: [
              {
                status: "PENDING",
                title: "ثبت سفارش",
                note: input.paymentMethod === "COD" ? "پرداخت در محل هنگام تحویل" : null,
                actor: "user",
              },
              ...(isPaidNow
                ? [
                    {
                      status: "PAID",
                      title: "پرداخت موفق",
                      note: `پرداخت با کیف پول — ${formatPrice(total)}`,
                      actor: "system",
                    },
                  ]
                : []),
            ],
          },
        },
      });

      createdId = order.id;
      createdNumber = order.orderNumber;

      // کد تخفیف فقط هنگام پرداخت موفق (یا پرداخت در محل) مصرف می‌شود.
      if (couponId && (isPaidNow || input.paymentMethod === "COD")) {
        await tx.coupon.update({
          where: { id: couponId },
          data: { usedCount: { increment: 1 } },
        });
      }

      if (walletPaid > 0) {
        await tx.walletTransaction.create({
          data: {
            userId: input.userId,
            type: "PURCHASE",
            amount: -walletPaid,
            balanceAfter: walletBalanceAfter,
            description: `پرداخت سفارش ${number}`,
            orderId: order.id,
          },
        });
      }

      if (walletPaid > 0) {
        await tx.paymentTransaction.create({
          data: {
            orderId: order.id,
            gateway: "wallet",
            amount: total,
            status: "SUCCESS",
            refId: `WLT${Date.now().toString().slice(-10)}`,
            message: "پرداخت با کیف پول سَروا",
          },
        });
      } else if (requiresOnline) {
        await tx.paymentTransaction.create({
          data: {
            orderId: order.id,
            gateway: "sandbox",
            amount: total,
            status: "PENDING",
            message: "در انتظار پرداخت اینترنتی",
          },
        });
      }

      await tx.notification.create({
        data: {
          userId: input.userId,
          title: orderStatusLabel(status),
          body: notificationBody(number, total),
          link: `/account/orders/${order.id}`,
          type: "order",
        },
      });
    });
  } catch (err) {
    if (err instanceof OrderFailure) return fail(err.message, err.status);
    throw err;
  }

  let redirectUrl: string | undefined;
  if (requiresOnline) {
    const provider = getPaymentProvider("sandbox");
    const start = await provider.start({
      orderId: createdId,
      orderNumber: createdNumber,
      amount: total,
      callbackUrl: SITE_URL,
      description: `پرداخت سفارش ${createdNumber}`,
    });

    if (!start.ok || !start.authority) {
      await markOrderFailed(createdId, start.message ?? "اتصال به درگاه پرداخت برقرار نشد.");
      return fail("اتصال به درگاه پرداخت برقرار نشد. لطفاً دوباره تلاش کنید.", 502);
    }

    await prisma.paymentTransaction.update({
      where: { orderId: createdId },
      data: { authority: start.authority, status: "PENDING", message: "در انتظار پرداخت" },
    });
    redirectUrl = start.redirectUrl;
  }

  return {
    ok: true,
    orderId: createdId,
    orderNumber: createdNumber,
    total,
    status,
    requiresPayment: requiresOnline,
    redirectUrl,
    walletPaid,
  };
}

// ------------------------------- تأیید پرداخت --------------------------------

export type VerifyPaymentResult =
  | { ok: true; orderId: string; orderNumber: string; status: "SUCCESS" }
  | { ok: false; message: string; orderId?: string; orderNumber?: string };

export async function verifyPayment(authority: string): Promise<VerifyPaymentResult> {
  const tx = await prisma.paymentTransaction.findUnique({
    where: { authority },
    include: {
      order: {
        include: { items: true },
      },
    },
  });

  if (!tx) return { ok: false, message: "تراکنش پرداخت پیدا نشد." };

  if (tx.status === "SUCCESS") {
    return {
      ok: true,
      orderId: tx.orderId,
      orderNumber: tx.order.orderNumber,
      status: "SUCCESS",
    };
  }

  if (tx.order.status === "CANCELED") {
    return {
      ok: false,
      message: "این سفارش لغو شده است.",
      orderId: tx.orderId,
      orderNumber: tx.order.orderNumber,
    };
  }

  const provider = getPaymentProvider(tx.gateway);
  const result = await provider.verify(authority, tx.amount);

  if (!result.ok || result.status !== "SUCCESS") {
    await prisma.paymentTransaction.update({
      where: { id: tx.id },
      data: {
        status: "FAILED",
        message: result.message ?? "پرداخت ناموفق بود",
      },
    });
    await cancelOrderInternal(tx.orderId, result.message ?? "پرداخت ناموفق بود", "system", {
      onlyPending: true,
    });
    return {
      ok: false,
      message: result.message ?? "پرداخت ناموفق بود.",
      orderId: tx.orderId,
      orderNumber: tx.order.orderNumber,
    };
  }

  const now = new Date();

  try {
    await prisma.$transaction(async (db) => {
      await db.paymentTransaction.update({
        where: { id: tx.id },
        data: {
          status: "SUCCESS",
          refId: result.refId,
          cardPan: result.cardPan,
          message: "پرداخت موفق",
        },
      });

      const current = await db.order.findUnique({ where: { id: tx.orderId } });

      // ممکن است همزمان لغو شده باشد.
      if (!current || current.status === "CANCELED") {
        throw new OrderFailure("سفارش لغو شده است.", 409);
      }

      await db.order.update({
        where: { id: tx.orderId },
        data: {
          status: "PAID",
          paidAt: now,
          timeline: {
            create: {
              status: "PAID",
              title: "پرداخت موفق",
              note: `کد پیگیری پرداخت: ${result.refId ?? "—"}`,
              actor: "system",
            },
          },
        },
      });

      for (const item of tx.order.items) {
        await db.product.updateMany({
          where: { id: item.productId, reservedStock: { gte: item.quantity } },
          data: {
            reservedStock: { decrement: item.quantity },
            soldCount: { increment: item.quantity },
          },
        });
      }

      if (tx.order.couponId) {
        await db.coupon.update({
          where: { id: tx.order.couponId },
          data: { usedCount: { increment: 1 } },
        });
      }

      await db.notification.create({
        data: {
          userId: tx.order.userId,
          title: "پرداخت موفق",
          body: `پرداخت سفارش ${tx.order.orderNumber} با موفقیت انجام شد.`,
          link: `/account/orders/${tx.orderId}`,
          type: "order",
        },
      });
    });
  } catch (err) {
    if (err instanceof OrderFailure) {
      return {
        ok: false,
        message: err.message,
        orderId: tx.orderId,
        orderNumber: tx.order.orderNumber,
      };
    }
    throw err;
  }

  return {
    ok: true,
    orderId: tx.orderId,
    orderNumber: tx.order.orderNumber,
    status: "SUCCESS",
  };
}

/** پرداخت را ناموفق اعلام کن (مثلاً انصراف کاربر در درگاه). */
export async function failPayment(authority: string): Promise<VerifyPaymentResult> {
  const tx = await prisma.paymentTransaction.findUnique({
    where: { authority },
    include: { order: true },
  });
  if (!tx) return { ok: false, message: "تراکنش پرداخت پیدا نشد." };

  const provider = getPaymentProvider(tx.gateway);
  if (provider instanceof Object && "fail" in provider) {
    (provider as { fail?: (a: string) => void }).fail?.(authority);
  }

  await prisma.paymentTransaction.update({
    where: { id: tx.id },
    data: { status: "FAILED", message: "پرداخت توسط کاربر لغو شد" },
  });

  await cancelOrderInternal(tx.orderId, "انصراف از پرداخت", "user", { onlyPending: true });

  return {
    ok: false,
    message: "پرداخت لغو شد.",
    orderId: tx.orderId,
    orderNumber: tx.order.orderNumber,
  };
}

/** تلاش دوباره برای پرداخت یک سفارش در انتظار پرداخت. */
export async function retryPayment(
  userId: string,
  orderId: string,
): Promise<{ ok: true; redirectUrl: string } | { ok: false; message: string }> {
  const order = await prisma.order.findFirst({
    where: { id: orderId, userId },
    include: { payment: true },
  });
  if (!order) return { ok: false, message: "سفارش پیدا نشد." };
  if (order.status !== "PENDING") {
    return { ok: false, message: "این سفارش در وضعیت قابل پرداخت نیست." };
  }

  const provider = getPaymentProvider("sandbox");
  const start = await provider.start({
    orderId: order.id,
    orderNumber: order.orderNumber,
    amount: order.total,
    callbackUrl: SITE_URL,
    description: `پرداخت سفارش ${order.orderNumber}`,
  });
  if (!start.ok || !start.authority || !start.redirectUrl) {
    return { ok: false, message: start.message ?? "اتصال به درگاه پرداخت برقرار نشد." };
  }

  await prisma.paymentTransaction.upsert({
    where: { orderId: order.id },
    create: {
      orderId: order.id,
      gateway: "sandbox",
      amount: order.total,
      status: "PENDING",
      authority: start.authority,
      message: "در انتظار پرداخت",
    },
    update: {
      gateway: "sandbox",
      amount: order.total,
      status: "PENDING",
      authority: start.authority,
      message: "در انتظار پرداخت",
      refId: null,
      cardPan: null,
    },
  });

  return { ok: true, redirectUrl: start.redirectUrl };
}

/** اطلاعات تراکنش برای نمایش صفحه درگاه آزمایشی. */
export async function getSandboxTransaction(authority: string) {
  return prisma.paymentTransaction.findUnique({
    where: { authority },
    include: {
      order: {
        select: {
          id: true,
          orderNumber: true,
          total: true,
          status: true,
          userId: true,
        },
      },
    },
  });
}

// --------------------------------- لغو سفارش ---------------------------------

export async function cancelUserOrder(
  userId: string,
  orderId: string,
  reason?: string,
): Promise<{ ok: true } | { ok: false; message: string }> {
  const order = await prisma.order.findFirst({ where: { id: orderId, userId } });
  if (!order) return { ok: false, message: "سفارش پیدا نشد." };
  if (!["PENDING", "PAID", "PROCESSING"].includes(order.status)) {
    return { ok: false, message: "این سفارش در وضعیت فعلی قابل لغو نیست." };
  }

  return cancelOrderInternal(orderId, reason ?? "لغو توسط کاربر", "user");
}

async function markOrderFailed(orderId: string, message: string) {
  await prisma.paymentTransaction.updateMany({
    where: { orderId },
    data: { status: "FAILED", message },
  });
  await cancelOrderInternal(orderId, message, "system", { onlyPending: true });
}

type CancelOptions = { onlyPending?: boolean };

async function cancelOrderInternal(
  orderId: string,
  reason: string,
  actor: "user" | "admin" | "system",
  opts: CancelOptions = {},
): Promise<{ ok: true } | { ok: false; message: string }> {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true, payment: true },
  });
  if (!order) return { ok: false, message: "سفارش پیدا نشد." };
  if (order.status === "CANCELED") return { ok: true };
  if (opts.onlyPending && order.status !== "PENDING") {
    return { ok: false, message: "وضعیت سفارش تغییر کرده است." };
  }

  const wasFinalized = order.status !== "PENDING";
  const now = new Date();

  await prisma.$transaction(async (db) => {
    // بازگرداندن موجودی
    for (const item of order.items) {
      await db.product.update({
        where: { id: item.productId },
        data: {
          stock: { increment: item.quantity },
          ...(wasFinalized ? {} : { reservedStock: { decrement: item.quantity } }),
        },
      });
      if (item.variantId) {
        await db.productVariant.update({
          where: { id: item.variantId },
          data: { stock: { increment: item.quantity } },
        });
      }
    }

    // اصلاح شمارنده فروش برای سفارش‌های پرداخت‌شده
    if (wasFinalized) {
      for (const item of order.items) {
        await db.product.updateMany({
          where: { id: item.productId, soldCount: { gte: item.quantity } },
          data: { soldCount: { decrement: item.quantity } },
        });
      }
    }

    // بازگشت وجه کیف پول
    if (order.payment?.gateway === "wallet" && order.payment.status === "SUCCESS") {
      const user = await db.user.update({
        where: { id: order.userId },
        data: { walletBalance: { increment: order.total } },
        select: { walletBalance: true },
      });
      await db.walletTransaction.create({
        data: {
          userId: order.userId,
          type: "REFUND",
          amount: order.total,
          balanceAfter: user.walletBalance,
          description: `بازگشت وجه سفارش ${order.orderNumber}`,
        },
      });
      await db.paymentTransaction.update({
        where: { id: order.payment.id },
        data: { status: "REFUNDED", message: "بازگشت وجه به کیف پول" },
      });
    } else if (order.payment && order.payment.status === "PENDING") {
      await db.paymentTransaction.update({
        where: { id: order.payment.id },
        data: { status: "FAILED", message: reason },
      });
    }

    // اگر کد تخفیف مصرف شده بود، آزاد شود.
    if (order.couponId && wasFinalized) {
      await db.coupon.updateMany({
        where: { id: order.couponId, usedCount: { gte: 1 } },
        data: { usedCount: { decrement: 1 } },
      });
    }

    await db.order.update({
      where: { id: order.id },
      data: {
        status: "CANCELED",
        canceledAt: now,
        cancelReason: reason,
        timeline: {
          create: {
            status: "CANCELED",
            title: "لغو سفارش",
            note: reason,
            actor,
          },
        },
      },
    });

    await db.notification.create({
      data: {
        userId: order.userId,
        title: "سفارش لغو شد",
        body: `سفارش ${order.orderNumber} لغو شد. ${reason}`,
        link: `/account/orders/${order.id}`,
        type: "order",
      },
    });
  });

  return { ok: true };
}

// ------------------------------ خواندن سفارش‌ها ------------------------------

const orderInclude = {
  items: {
    include: {
      product: { select: { slug: true } },
      variant: { select: { name: true } },
    },
  },
  payment: true,
  timeline: { orderBy: { createdAt: "asc" as const } },
} satisfies Prisma.OrderInclude;

type OrderWithRelations = Prisma.OrderGetPayload<{ include: typeof orderInclude }>;

function toSummary(order: {
  id: string;
  orderNumber: string;
  status: string;
  total: number;
  createdAt: Date;
  items: { quantity: number }[];
}): OrderSummaryDTO {
  return {
    id: order.id,
    orderNumber: order.orderNumber,
    status: asStatus(order.status),
    total: order.total,
    itemCount: order.items.reduce((n, i) => n + i.quantity, 0),
    createdAt: order.createdAt.toISOString(),
    statusLabel: orderStatusLabel(order.status),
  };
}

function toDetail(order: OrderWithRelations): OrderDetailDTO {
  // مبلغ اولیه اقلام (قبل از تخفیف کالاها) در subtotal ذخیره شده است.
  const itemsTotal = order.items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const productDiscount = Math.max(0, order.subtotal - itemsTotal);
  const couponDiscount = Math.max(0, order.discount - productDiscount);
  return {
    ...toSummary(order),
    subtotal: order.subtotal,
    discount: order.discount,
    productDiscount,
    couponDiscount,
    shippingFee: order.shippingFee,
    couponCode: order.couponCode,
    paymentMethod: order.paymentMethod,
    shippingMethod: order.shippingMethod,
    trackingCode: order.trackingCode,
    note: order.note,
    paidAt: order.paidAt?.toISOString() ?? null,
    shippedAt: order.shippedAt?.toISOString() ?? null,
    deliveredAt: order.deliveredAt?.toISOString() ?? null,
    canceledAt: order.canceledAt?.toISOString() ?? null,
    cancelReason: order.cancelReason,
    address: {
      label: order.addressLabel,
      receiverName: order.receiverName,
      receiverPhone: order.receiverPhone,
      province: order.province,
      city: order.city,
      postalCode: order.postalCode,
      addressLine: order.addressLine,
    },
    items: order.items.map((item) => ({
      id: item.id,
      productId: item.productId,
      slug: item.product.slug,
      name: item.name,
      image: item.image ?? "/images/placeholder.svg",
      sku: item.sku,
      variantName: item.variant?.name ?? null,
      unitPrice: item.unitPrice,
      quantity: item.quantity,
      total: item.total,
    })),
    timeline: order.timeline.map((event) => ({
      id: event.id,
      status: event.status,
      title: event.title,
      note: event.note,
      actor: event.actor,
      createdAt: event.createdAt.toISOString(),
    })),
    payment: order.payment
      ? {
          gateway: order.payment.gateway,
          status: order.payment.status,
          refId: order.payment.refId,
          cardPan: order.payment.cardPan,
          amount: order.payment.amount,
          message: order.payment.message,
        }
      : null,
  };
}

// ------------------------------ تغییر وضعیت توسط مدیر ------------------------------

const ADMIN_TRANSITIONS: Record<OrderStatusKey, OrderStatusKey[]> = {
  PENDING: ["CANCELED"],
  PAID: ["PROCESSING", "CANCELED", "REFUNDED"],
  PROCESSING: ["SHIPPED", "CANCELED", "REFUNDED"],
  SHIPPED: ["DELIVERED"],
  DELIVERED: ["REFUNDED"],
  CANCELED: [],
  REFUNDED: [],
};

export type AdminOrderStatusResult =
  | { ok: true }
  | { ok: false; message: string; status?: number };

/**
 * تغییر وضعیت سفارش از پنل مدیریت همراه با اثرات جانبی:
 * لغو سفارش موجودی را آزاد می‌کند، ارسال/تحویل زمان ثبت می‌کند
 * و بازگشت وجه برای پرداخت‌های کیف پولی مبلغ را به کیف پول برمی‌گرداند.
 */
export async function adminChangeOrderStatus(
  orderId: string,
  nextStatus: OrderStatusKey,
  opts: { trackingCode?: string | null; note?: string | null } = {},
): Promise<AdminOrderStatusResult> {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { payment: true },
  });
  if (!order) return { ok: false, message: "سفارش پیدا نشد.", status: 404 };
  if (order.status === nextStatus) return { ok: true };

  const note = opts.note?.trim() || null;
  const trackingCode = opts.trackingCode?.trim() || null;

  if (nextStatus === "CANCELED") {
    if (!["PENDING", "PAID", "PROCESSING"].includes(order.status)) {
      return {
        ok: false,
        message: "در وضعیت فعلی امکان لغو سفارش وجود ندارد.",
      };
    }
    const reason = note || "لغو توسط مدیر فروشگاه";
    return cancelOrderInternal(orderId, reason, "admin");
  }

  const allowed = ADMIN_TRANSITIONS[order.status] ?? [];
  if (!allowed.includes(nextStatus)) {
    return {
      ok: false,
      message: `تغییر وضعیت از «${orderStatusLabel(order.status)}» به «${orderStatusLabel(nextStatus)}» مجاز نیست.`,
    };
  }

  const now = new Date();
  const meta = ORDER_STATUS_META[nextStatus];

  await prisma.$transaction(async (db) => {
    if (nextStatus === "REFUNDED") {
      if (order.payment?.status === "SUCCESS") {
        if (order.payment.gateway === "wallet") {
          const user = await db.user.update({
            where: { id: order.userId },
            data: { walletBalance: { increment: order.total } },
            select: { walletBalance: true },
          });
          await db.walletTransaction.create({
            data: {
              userId: order.userId,
              type: "REFUND",
              amount: order.total,
              balanceAfter: user.walletBalance,
              description: `بازگشت وجه سفارش ${order.orderNumber}`,
            },
          });
        }
        await db.paymentTransaction.update({
          where: { id: order.payment.id },
          data: {
            status: "REFUNDED",
            message: note || "بازگشت وجه توسط پشتیبانی",
          },
        });
      }
    }

    await db.order.update({
      where: { id: order.id },
      data: {
        status: nextStatus,
        ...(trackingCode ? { trackingCode } : {}),
        ...(nextStatus === "SHIPPED" && !order.shippedAt ? { shippedAt: now } : {}),
        ...(nextStatus === "DELIVERED" && !order.deliveredAt
          ? { deliveredAt: now }
          : {}),
        timeline: {
          create: {
            status: nextStatus,
            title: meta?.label ?? orderStatusLabel(nextStatus),
            note: note ?? meta?.description ?? null,
            actor: "admin",
          },
        },
      },
    });

    await db.notification.create({
      data: {
        userId: order.userId,
        title: `وضعیت سفارش ${order.orderNumber} تغییر کرد`,
        body: `${meta?.label ?? orderStatusLabel(nextStatus)}${
          trackingCode ? ` — کد رهگیری: ${trackingCode}` : ""
        }`,
        link: `/account/orders/${order.id}`,
        type: "order",
      },
    });
  });

  return { ok: true };
}

export async function listUserOrders(
  userId: string,
  options: { status?: string; page?: number; perPage?: number } = {},
): Promise<{ items: OrderSummaryDTO[]; total: number; page: number; perPage: number; totalPages: number }> {
  const page = Math.max(1, options.page ?? 1);
  const perPage = Math.min(20, Math.max(1, options.perPage ?? 8));
  const where = {
    userId,
    ...(options.status && options.status !== "ALL"
      ? { status: options.status as OrderStatusKey }
      : {}),
  };

  const [rows, total] = await Promise.all([
    prisma.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * perPage,
      take: perPage,
      select: {
        id: true,
        orderNumber: true,
        status: true,
        total: true,
        createdAt: true,
        items: { select: { quantity: true } },
      },
    }),
    prisma.order.count({ where }),
  ]);

  return {
    items: rows.map(toSummary),
    total,
    page,
    perPage,
    totalPages: Math.max(1, Math.ceil(total / perPage)),
  };
}

export async function getOrderDetail(
  userId: string,
  orderId: string,
): Promise<OrderDetailDTO | null> {
  const order = await prisma.order.findFirst({
    where: { id: orderId, userId },
    include: orderInclude,
  });
  return order ? toDetail(order) : null;
}

export async function getOrderByNumberForUser(
  userId: string,
  orderNumber: string,
): Promise<OrderDetailDTO | null> {
  const order = await prisma.order.findFirst({
    where: { orderNumber, userId },
    include: orderInclude,
  });
  return order ? toDetail(order) : null;
}

export async function getUserOrderStats(userId: string) {
  const [total, pending, delivered, spent] = await Promise.all([
    prisma.order.count({ where: { userId } }),
    prisma.order.count({ where: { userId, status: "PENDING" } }),
    prisma.order.count({ where: { userId, status: "DELIVERED" } }),
    prisma.order.aggregate({
      where: { userId, status: { in: ["PAID", "PROCESSING", "SHIPPED", "DELIVERED"] } },
      _sum: { total: true },
    }),
  ]);
  return {
    total,
    pending,
    delivered,
    spent: spent._sum.total ?? 0,
  };
}
