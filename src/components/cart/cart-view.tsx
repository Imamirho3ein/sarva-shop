"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  BadgePercent,
  Check,
  Minus,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Tag,
  Trash2,
  Truck,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatPrice, toPersianDigits } from "@/lib/format";
import { FREE_SHIPPING_THRESHOLD } from "@/lib/shipping";
import { applyCouponValue, lineTotal, type CartLine } from "@/lib/cart";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/misc";
import { useToast } from "@/components/ui/toast";
import { useCart } from "@/store/cart";

type CouponMeta = {
  code: string;
  type: "PERCENT" | "FIXED";
  value: number;
  minOrder?: number | null;
  maxDiscount?: number | null;
};

const ESTIMATED_SHIPPING = 89_000;

export function CartView() {
  const lines = useCart((s) => s.lines);
  const setQuantity = useCart((s) => s.setQuantity);
  const remove = useCart((s) => s.remove);
  const setCouponCode = useCart((s) => s.setCoupon);
  const removeCoupon = useCart((s) => s.removeCoupon);
  const toast = useToast();

  const [coupon, setCoupon] = React.useState<CouponMeta | null>(null);
  const [code, setCode] = React.useState("");
  const [checking, setChecking] = React.useState(false);

  const subtotal = lines.reduce((sum, l) => sum + l.price * l.quantity, 0);
  const payable = lines.reduce((sum, l) => sum + lineTotal(l), 0);
  const productDiscount = Math.max(0, subtotal - payable);

  const couponDiscount = React.useMemo(() => {
    if (!coupon) return 0;
    if (coupon.minOrder && payable < coupon.minOrder) return 0;
    return Math.min(applyCouponValue(coupon, payable), payable);
  }, [coupon, payable]);

  const afterDiscount = Math.max(0, payable - couponDiscount);
  const shippingFee = afterDiscount >= FREE_SHIPPING_THRESHOLD ? 0 : ESTIMATED_SHIPPING;
  const total = afterDiscount + shippingFee;
  const remainingForFree = Math.max(0, FREE_SHIPPING_THRESHOLD - afterDiscount);

  const apply = async () => {
    const trimmed = code.trim();
    if (!trimmed) {
      toast.warning("کد تخفیف را وارد کنید");
      return;
    }
    setChecking(true);
    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: trimmed, subtotal: payable }),
      });
      const json = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        message?: string;
        data?: { coupon: CouponMeta; discount: number };
      };

      if (!res.ok || !json.ok || !json.data) {
        setCoupon(null);
        removeCoupon();
        toast.error("کد تخفیف معتبر نیست", json.message);
        return;
      }

      setCoupon(json.data.coupon);
      setCouponCode(json.data.coupon.code);
      setCode("");
      toast.success("کد تخفیف اعمال شد", `تخفیف: ${formatPrice(json.data.discount)}`);
    } catch {
      toast.error("خطای شبکه", "لطفاً دوباره تلاش کنید.");
    } finally {
      setChecking(false);
    }
  };

  const clearCoupon = () => {
    setCoupon(null);
    setCode("");
    removeCoupon();
    toast.info("کد تخفیف حذف شد");
  };

  const clearUnavailable = () => {
    lines.filter((l) => l.stock <= 0).forEach((l) => remove(l.productId, l.variantId));
    toast.info("کالاهای ناموجود از سبد حذف شدند");
  };

  if (lines.length === 0) {
    return (
      <EmptyState
        icon={<ShoppingBag className="h-7 w-7" />}
        title="سبد خرید شما خالی است"
        description="می‌توانید از فهرست محصولات یا پیشنهادهای شگفت‌انگیز شروع کنید و کالاهای مورد علاقه‌تان را به سبد اضافه کنید."
        action={
          <div className="flex flex-wrap items-center justify-center gap-2">
            <Button asChild>
              <Link href="/products">شروع خرید</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/special-offers">پیشنهادهای شگفت‌انگیز</Link>
            </Button>
          </div>
        }
      />
    );
  }

  const hasUnavailable = lines.some((l) => l.stock <= 0);

  return (
    <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
      {/* اقلام سبد */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between rounded-2xl border border-ink-100 bg-white p-3.5 shadow-xs">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
              <ShoppingBag className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-black text-ink-900">سبد خرید شما</p>
              <p className="mt-0.5 text-[10px] font-medium text-ink-400">
                {toPersianDigits(lines.reduce((n, l) => n + l.quantity, 0))} کالا در سبد
              </p>
            </div>
          </div>
          {hasUnavailable && (
            <button
              type="button"
              onClick={clearUnavailable}
              className="flex items-center gap-1 text-[11px] font-bold text-danger-600 hover:underline"
            >
              <Trash2 className="h-3.5 w-3.5" />
              حذف ناموجودها
            </button>
          )}
        </div>

        {lines.map((line) => (
          <CartLineRow
            key={`${line.productId}-${line.variantId ?? ""}`}
            line={line}
            onQty={(qty) => setQuantity(line.productId, line.variantId, qty)}
            onRemove={() => {
              remove(line.productId, line.variantId);
              toast.info("کالا از سبد حذف شد", line.name);
            }}
          />
        ))}

        <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-brand-100 bg-brand-50/60 p-3.5">
          <p className="flex items-center gap-1.5 text-[11px] font-bold text-brand-900">
            <Truck className="h-4 w-4" />
            {remainingForFree > 0 ? (
              <>
                با خرید {formatPrice(remainingForFree)} دیگر، ارسال شما رایگان می‌شود.
              </>
            ) : (
              <>ارسال سفارش شما رایگان است. 🎉</>
            )}
          </p>
          <Link
            href="/products"
            className="inline-flex items-center gap-1 text-[11px] font-extrabold text-brand-700 hover:text-brand-900"
          >
            ادامه خرید
            <ArrowLeft className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      {/* خلاصه سفارش */}
      <aside className="rounded-2xl border border-ink-100 bg-white p-4 shadow-xs lg:sticky lg:top-36">
        <h2 className="text-sm font-black text-ink-900">خلاصه سفارش</h2>

        <div className="mt-3 space-y-2.5 border-b border-ink-100 pb-3 text-[12px]">
          <Row label="قیمت کالاها" value={formatPrice(subtotal)} />
          {productDiscount > 0 && (
            <Row
              label="تخفیف کالاها"
              value={`− ${formatPrice(productDiscount)}`}
              valueClass="text-danger-600"
            />
          )}
          {coupon && couponDiscount > 0 && (
            <Row
              label={`کد تخفیف (${coupon.code})`}
              value={`− ${formatPrice(couponDiscount)}`}
              valueClass="text-danger-600"
              onRemove={clearCoupon}
            />
          )}
          <Row
            label="هزینه ارسال (تخمینی)"
            value={shippingFee === 0 ? "رایگان" : formatPrice(shippingFee)}
            valueClass={shippingFee === 0 ? "text-success-600" : undefined}
          />
        </div>

        <div className="mt-3 flex items-baseline justify-between">
          <span className="text-xs font-extrabold text-ink-700">مبلغ قابل پرداخت</span>
          <span className="text-lg font-black tabular text-ink-900">{formatPrice(total)}</span>
        </div>

        {/* کد تخفیف */}
        <div className="mt-3 rounded-xl border border-ink-100 bg-ink-50/60 p-3">
          <label className="mb-1.5 flex items-center gap-1 text-[11px] font-extrabold text-ink-700">
            <Tag className="h-3.5 w-3.5 text-brand-700" />
            کد تخفیف دارید؟
          </label>
          {coupon ? (
            <div className="flex items-center justify-between rounded-lg border border-success-200 bg-success-50 px-2.5 py-1.5">
              <span className="flex items-center gap-1 text-[11px] font-extrabold text-success-700">
                <Check className="h-3.5 w-3.5" />
                {coupon.code} اعمال شد
              </span>
              <button
                type="button"
                onClick={clearCoupon}
                aria-label="حذف کد تخفیف"
                className="text-ink-400 hover:text-danger-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2">
                <Input
                  placeholder="مثلاً SARVA10"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      apply();
                    }
                  }}
                  className="h-9 flex-1 text-xs"
                  aria-label="کد تخفیف"
                />
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={apply}
                  loading={checking}
                  disabled={checking}
                  className="h-9"
                >
                  اعمال
                </Button>
              </div>
              <p className="mt-1.5 text-[10px] font-medium text-ink-400">
                کدهای نمونه: SARVA10 / WELCOME / DIGITAL15
              </p>
            </>
          )}
        </div>

        <Button asChild size="lg" className="mt-3 w-full">
          <Link href="/checkout">
            ادامه و پرداخت
            <ArrowLeft className="h-4.5 w-4.5" />
          </Link>
        </Button>

        <p className="mt-2.5 flex items-start gap-1.5 text-[10px] leading-5 text-ink-400">
          <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-600" />
          پرداخت امن، ضمانت اصالت کالا و امکان بازگشت تا ۷ روز. هزینه نهایی ارسال در مرحله پرداخت
          بر اساس روش انتخابی محاسبه می‌شود.
        </p>
      </aside>
    </div>
  );
}

function CartLineRow({
  line,
  onQty,
  onRemove,
}: {
  line: CartLine;
  onQty: (qty: number) => void;
  onRemove: () => void;
}) {
  const unit = line.discountPrice && line.discountPrice < line.price ? line.discountPrice : line.price;
  const hasDiscount = line.discountPrice != null && line.discountPrice < line.price;
  const out = line.stock <= 0;

  return (
    <div
      className={cn(
        "flex gap-3 rounded-2xl border border-ink-100 bg-white p-3 shadow-xs",
        out && "border-danger-100 bg-danger-50/30",
      )}
    >
      <Link
        href={`/product/${line.slug}`}
        className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-ink-100 bg-white sm:h-24 sm:w-24"
      >
        <Image src={line.image} alt={line.name} fill sizes="96px" className="object-contain p-1.5" />
      </Link>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-2">
          <Link
            href={`/product/${line.slug}`}
            className="line-clamp-2 text-[12px] font-extrabold leading-5 text-ink-800 transition-colors hover:text-brand-800 sm:text-[13px]"
          >
            {line.name}
          </Link>
          <button
            type="button"
            onClick={onRemove}
            aria-label="حذف از سبد خرید"
            className="shrink-0 rounded-lg p-1 text-ink-400 transition-colors hover:bg-danger-50 hover:text-danger-600"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-1 flex flex-wrap items-center gap-2 text-[10px] font-medium text-ink-400">
          {line.brandName && <span>{line.brandName}</span>}
          <span className="h-2.5 w-px bg-ink-200" aria-hidden />
          <span>کد: {toPersianDigits(line.sku)}</span>
          {out ? (
            <span className="font-bold text-danger-600">ناموجود</span>
          ) : line.stock <= 5 ? (
            <span className="font-bold text-accent-600">
              تنها {toPersianDigits(line.stock)} عدد باقی مانده
            </span>
          ) : null}
        </div>

        <div className="mt-auto flex flex-wrap items-end justify-between gap-2 pt-2">
          <div className="flex flex-col">
            <span className="text-sm font-black tabular text-ink-900">
              {formatPrice(unit * line.quantity)}
            </span>
            <div className="flex items-center gap-1.5 text-[10px] font-medium text-ink-400">
              <span>{formatPrice(unit, { unit: false })} تومان ×</span>
              <span>{toPersianDigits(line.quantity)}</span>
              {hasDiscount && (
                <span className="line-through">{formatPrice(line.price, { unit: false })}</span>
              )}
            </div>
          </div>

          <div className="flex h-9 items-center overflow-hidden rounded-lg border border-ink-200 bg-white">
            <button
              type="button"
              onClick={() => onQty(line.quantity - 1)}
              disabled={line.quantity <= 1}
              aria-label="کاهش تعداد"
              className="flex h-full w-9 items-center justify-center text-ink-500 transition-colors hover:text-brand-700 disabled:opacity-40"
            >
              <Minus className="h-3.5 w-3.5" />
            </button>
            <span className="min-w-8 text-center text-xs font-black tabular text-ink-900">
              {toPersianDigits(line.quantity)}
            </span>
            <button
              type="button"
              onClick={() => onQty(line.quantity + 1)}
              disabled={line.quantity >= Math.max(1, line.stock)}
              aria-label="افزایش تعداد"
              className="flex h-full w-9 items-center justify-center text-ink-500 transition-colors hover:text-brand-700 disabled:opacity-40"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  valueClass,
  onRemove,
}: {
  label: string;
  value: string;
  valueClass?: string;
  onRemove?: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="flex items-center gap-1 text-ink-500">
        {label}
        {onRemove && (
          <button
            type="button"
            onClick={onRemove}
            aria-label="حذف تخفیف"
            className="text-ink-400 hover:text-danger-600"
          >
            <X className="h-3 w-3" />
          </button>
        )}
      </span>
      <span className={cn("font-extrabold tabular text-ink-800", valueClass)}>{value}</span>
    </div>
  );
}

/** کارت کوچک تخفیف در نوار بالای سبد (اختیاری) */
export function CartDiscountHint() {
  return (
    <span className="inline-flex items-center gap-1 rounded-lg bg-accent-50 px-2 py-1 text-[10px] font-bold text-accent-600">
      <BadgePercent className="h-3 w-3" />
      تا ۴۰٪ تخفیف
    </span>
  );
}
