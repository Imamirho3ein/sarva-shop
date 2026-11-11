"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  BadgePercent,
  Banknote,
  Bike,
  Check,
  CheckCircle2,
  ChevronLeft,
  CreditCard,
  Lock,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Store,
  Tag,
  Truck,
  Wallet,
  X,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatPrice, toPersianDigits } from "@/lib/format";
import { applyCouponValue, lineTotal } from "@/lib/cart";
import { getShippingOptions, type ShippingKey } from "@/lib/shipping";
import { useCart } from "@/store/cart";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/misc";
import { useToast } from "@/components/ui/toast";
import { AddressForm } from "@/components/checkout/address-form";
import { LoginForm, RegisterForm } from "@/components/auth/auth-forms";
import type { AddressDTO } from "@/types";

export type CheckoutUser = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  walletBalance: number;
};

type PaymentMethod = "ONLINE" | "WALLET" | "COD";
type StepKey = "auth" | "address" | "shipping" | "payment" | "review";

type CouponMeta = {
  code: string;
  type: "PERCENT" | "FIXED";
  value: number;
  minOrder: number;
  maxDiscount: number | null;
  description?: string | null;
};

const STEP_LIST: { key: StepKey; title: string }[] = [
  { key: "auth", title: "ورود" },
  { key: "address", title: "آدرس" },
  { key: "shipping", title: "ارسال" },
  { key: "payment", title: "پرداخت" },
  { key: "review", title: "بازبینی" },
];

const SHIPPING_ICONS: Record<ShippingKey, React.ComponentType<{ className?: string }>> = {
  POST: Truck,
  COURIER: Bike,
  EXPRESS: Zap,
  PICKUP: Store,
};

const PAYMENT_LABELS: Record<PaymentMethod, string> = {
  ONLINE: "پرداخت اینترنتی",
  WALLET: "کیف پول سَروا",
  COD: "پرداخت در محل",
};

function Stepper({
  steps,
  current,
  onSelect,
}: {
  steps: typeof STEP_LIST;
  current: StepKey;
  onSelect: (key: StepKey) => void;
}) {
  const currentIndex = steps.findIndex((s) => s.key === current);
  return (
    <ol className="flex flex-wrap items-center gap-x-1.5 gap-y-2">
      {steps.map((s, i) => {
        const done = i < currentIndex;
        const active = i === currentIndex;
        return (
          <li key={s.key} className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => done && onSelect(s.key)}
              disabled={!done}
              aria-current={active ? "step" : undefined}
              className={cn(
                "flex items-center gap-2 rounded-full border px-2.5 py-1.5 text-[11px] font-bold transition-colors sm:px-3 sm:text-xs",
                active
                  ? "border-brand-700 bg-brand-700 text-white shadow-sm"
                  : done
                    ? "border-brand-200 bg-brand-50 text-brand-800 hover:bg-brand-100"
                    : "border-ink-200 bg-white text-ink-400",
                done && "cursor-pointer",
              )}
            >
              <span
                className={cn(
                  "flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-black",
                  active
                    ? "bg-white/20 text-white"
                    : done
                      ? "bg-brand-700 text-white"
                      : "bg-ink-100 text-ink-500",
                )}
              >
                {done ? <Check className="h-3 w-3" strokeWidth={3} /> : toPersianDigits(i + 1)}
              </span>
              {s.title}
            </button>
            {i < steps.length - 1 && <span className="hidden h-px w-4 bg-ink-200 sm:block" />}
          </li>
        );
      })}
    </ol>
  );
}

function AuthStep() {
  const [mode, setMode] = React.useState<"login" | "register">("login");
  return (
    <section className="rounded-2xl border border-ink-100 bg-white p-4 shadow-xs sm:p-6">
      <div className="flex items-center gap-2.5">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
          <Lock className="h-5 w-5" />
        </span>
        <div>
          <h2 className="text-sm font-black text-ink-900">ورود یا ثبت‌نام</h2>
          <p className="mt-0.5 text-[11px] text-ink-500">
            برای تکمیل سفارش و پیگیری آن، ابتدا وارد حساب کاربری خود شوید.
          </p>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-1 rounded-xl bg-ink-100 p-1">
        <button
          type="button"
          onClick={() => setMode("login")}
          className={cn(
            "h-9 rounded-lg text-xs font-bold transition-colors",
            mode === "login" ? "bg-white text-ink-900 shadow-xs" : "text-ink-500 hover:text-ink-700",
          )}
        >
          ورود
        </button>
        <button
          type="button"
          onClick={() => setMode("register")}
          className={cn(
            "h-9 rounded-lg text-xs font-bold transition-colors",
            mode === "register" ? "bg-white text-ink-900 shadow-xs" : "text-ink-500 hover:text-ink-700",
          )}
        >
          ثبت‌نام
        </button>
      </div>

      <div className="mx-auto mt-5 w-full max-w-md">
        {mode === "login" ? (
          <LoginForm next="/checkout" compact showRegisterLink={false} />
        ) : (
          <RegisterForm next="/checkout" compact />
        )}
      </div>

      <p className="mt-5 rounded-lg bg-ink-50 px-3 py-2 text-center text-[11px] leading-5 text-ink-500">
        اطلاعات حساب شما محفوظ است و فقط برای ثبت و پیگیری سفارش استفاده می‌شود.
      </p>
    </section>
  );
}

function SummaryBlock({
  title,
  onEdit,
  children,
}: {
  title: string;
  onEdit: () => void;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-ink-100 bg-white p-4 shadow-xs">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-black text-ink-900">{title}</h3>
        <button
          type="button"
          onClick={onEdit}
          className="text-[11px] font-bold text-brand-700 hover:underline"
        >
          ویرایش
        </button>
      </div>
      <div className="mt-2 text-[12px] leading-6 text-ink-600">{children}</div>
    </section>
  );
}

export function CheckoutFlow({
  user,
  addresses: initialAddresses,
}: {
  user: CheckoutUser | null;
  addresses: AddressDTO[];
}) {
  const router = useRouter();
  const toast = useToast();

  const lines = useCart((s) => s.lines);
  const clearCart = useCart((s) => s.clear);
  const setStoreCoupon = useCart((s) => s.setCoupon);
  const removeStoreCoupon = useCart((s) => s.removeCoupon);

  const steps = React.useMemo(
    () => (user ? STEP_LIST.filter((s) => s.key !== "auth") : STEP_LIST),
    [user],
  );

  const [mounted, setMounted] = React.useState(false);
  const [redirecting, setRedirecting] = React.useState(false);
  const [step, setStep] = React.useState<StepKey>(user ? "address" : "auth");
  const [addresses, setAddresses] = React.useState<AddressDTO[]>(initialAddresses);
  const [addressId, setAddressId] = React.useState(
    () => initialAddresses.find((a) => a.isDefault)?.id ?? initialAddresses[0]?.id ?? "",
  );
  const [showAddressForm, setShowAddressForm] = React.useState(initialAddresses.length === 0);
  const [shipping, setShipping] = React.useState<ShippingKey>("POST");
  const [payment, setPayment] = React.useState<PaymentMethod>("ONLINE");
  const [note, setNote] = React.useState("");
  const [acceptTerms, setAcceptTerms] = React.useState(false);
  const [coupon, setCoupon] = React.useState<CouponMeta | null>(null);
  const [code, setCode] = React.useState("");
  const [checkingCoupon, setCheckingCoupon] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // ------------------------------ محاسبات سبد ------------------------------
  const subtotal = lines.reduce((sum, l) => sum + l.price * l.quantity, 0);
  const payable = lines.reduce((sum, l) => sum + lineTotal(l), 0);
  const productDiscount = Math.max(0, subtotal - payable);
  const itemCount = lines.reduce((sum, l) => sum + l.quantity, 0);

  const couponEligible = Boolean(coupon && (!coupon.minOrder || payable >= coupon.minOrder));
  const couponDiscount =
    coupon && couponEligible ? Math.min(applyCouponValue(coupon, payable), payable) : 0;
  const afterCoupon = Math.max(0, payable - couponDiscount);

  const shippingOptions = React.useMemo(
    () => getShippingOptions({ subtotal: afterCoupon }),
    [afterCoupon],
  );
  const shippingOption =
    shippingOptions.find((o) => o.key === shipping) ?? shippingOptions[0];
  const shippingFee = shippingOption?.fee ?? 0;
  const total = afterCoupon + shippingFee;

  const walletBalance = user?.walletBalance ?? 0;
  const canUseWallet = walletBalance >= total;

  React.useEffect(() => {
    setMounted(true);
    const saved = useCart.getState().couponCode;
    if (saved) setCode(saved);
  }, []);

  // اعتبارسنجی کد تخفیف ذخیره‌شده (یک بار پس از اتصال به localStorage)
  React.useEffect(() => {
    if (!mounted) return;
    const saved = useCart.getState().couponCode;
    if (!saved || payable <= 0) return;

    let cancelled = false;
    (async () => {
      setCheckingCoupon(true);
      try {
        const res = await fetch("/api/coupons/validate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code: saved, subtotal: payable }),
        });
        const json = (await res.json().catch(() => ({}))) as {
          ok?: boolean;
          message?: string;
          data?: { coupon: CouponMeta; discount: number };
        };
        if (cancelled) return;
        if (res.ok && json.ok && json.data) {
          setCoupon(json.data.coupon);
          setCode(json.data.coupon.code);
        } else {
          setCoupon(null);
          setCode("");
          removeStoreCoupon();
        }
      } catch {
        if (!cancelled) setCoupon(null);
      } finally {
        if (!cancelled) setCheckingCoupon(false);
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted]);

  // -------------------------------- اکشن‌ها --------------------------------

  const applyCoupon = async () => {
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) {
      toast.warning("کد تخفیف را وارد کنید.");
      return;
    }
    setCheckingCoupon(true);
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
        removeStoreCoupon();
        toast.error("کد تخفیف اعمال نشد", json.message ?? "کد تخفیف معتبر نیست.");
        return;
      }

      setCoupon(json.data.coupon);
      setCode(json.data.coupon.code);
      setStoreCoupon(json.data.coupon.code);
      toast.success("کد تخفیف اعمال شد", `تخفیف ${formatPrice(json.data.discount)}`);
    } catch {
      toast.error("خطای شبکه", "لطفاً دوباره تلاش کنید.");
    } finally {
      setCheckingCoupon(false);
    }
  };

  const removeCoupon = () => {
    setCoupon(null);
    setCode("");
    removeStoreCoupon();
  };

  const goToStep = (key: StepKey) => {
    setError(null);
    setStep(key);
  };

  const goNext = () => {
    setError(null);
    if (step === "auth") return;
    if (step === "address") {
      if (!addressId) {
        setError("آدرس تحویل را انتخاب کنید یا آدرس جدیدی اضافه کنید.");
        return;
      }
      setStep("shipping");
      return;
    }
    if (step === "shipping") {
      setStep("payment");
      return;
    }
    if (step === "payment") {
      if (payment === "WALLET" && !canUseWallet) {
        setError("موجودی کیف پول شما برای پرداخت این سفارش کافی نیست.");
        return;
      }
      setStep("review");
      return;
    }
    void submitOrder();
  };

  const goBack = () => {
    setError(null);
    const index = steps.findIndex((s) => s.key === step);
    if (index > 0) setStep(steps[index - 1].key);
  };

  const submitOrder = async () => {
    setError(null);
    if (!user) {
      setStep("auth");
      return;
    }
    if (!lines.length) {
      setError("سبد خرید شما خالی است.");
      return;
    }
    if (!addressId) {
      setError("آدرس تحویل را انتخاب کنید.");
      setStep("address");
      return;
    }
    if (payment === "WALLET" && !canUseWallet) {
      setError("موجودی کیف پول شما برای پرداخت این سفارش کافی نیست.");
      setStep("payment");
      return;
    }
    if (!acceptTerms) {
      setError("برای ثبت سفارش، قوانین و شرایط فروش را بپذیرید.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          addressId,
          shippingMethod: shipping,
          paymentMethod: payment,
          couponCode: coupon?.code ?? undefined,
          note: note.trim() || undefined,
          items: lines.map((l) => ({
            productId: l.productId,
            variantId: l.variantId ?? null,
            quantity: l.quantity,
          })),
        }),
      });

      const json = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        message?: string;
        data?: {
          orderId: string;
          orderNumber: string;
          total: number;
          requiresPayment: boolean;
          redirectUrl?: string;
        };
      };

      if (!res.ok || !json.ok || !json.data) {
        setError(json.message ?? "ثبت سفارش انجام نشد. لطفاً دوباره تلاش کنید.");
        return;
      }

      const data = json.data;

      if (data.requiresPayment && data.redirectUrl) {
        setRedirecting(true);
        window.location.assign(data.redirectUrl);
        return;
      }

      setRedirecting(true);
      clearCart();
      router.push(`/checkout/result?order=${encodeURIComponent(data.orderNumber)}`);
    } catch {
      setError("خطای شبکه. لطفاً اتصال خود را بررسی و دوباره تلاش کنید.");
    } finally {
      setSubmitting(false);
    }
  };

  if (redirecting) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 rounded-2xl border border-ink-100 bg-white p-10 text-center shadow-xs">
        <span className="h-9 w-9 animate-spin rounded-full border-[3px] border-brand-200 border-t-brand-700" />
        <p className="text-sm font-bold text-ink-800">در حال انتقال…</p>
        <p className="text-[12px] text-ink-500">
          لطفاً چند لحظه صبر کنید. اگر انتقال انجام نشد، صفحه را دوباره بارگذاری کنید.
        </p>
      </div>
    );
  }

  if (mounted && !lines.length) {
    return (
      <EmptyState
        icon={<ShoppingBag className="h-8 w-8" />}
        title="سبد خرید شما خالی است"
        description="برای تسویه حساب ابتدا کالایی به سبد خرید اضافه کنید."
        action={
          <Button asChild>
            <Link href="/products">مشاهده محصولات</Link>
          </Button>
        }
      />
    );
  }

  const stepIndex = steps.findIndex((s) => s.key === step);
  const selectedAddress = addresses.find((a) => a.id === addressId) ?? null;

  const heading: Record<StepKey, { title: string; description: string }> = {
    auth: {
      title: "ورود یا ثبت‌نام",
      description: "برای ادامه فرآیند خرید وارد حساب کاربری خود شوید.",
    },
    address: {
      title: "آدرس تحویل",
      description: "آدرس و گیرنده سفارش را مشخص کنید.",
    },
    shipping: {
      title: "روش ارسال",
      description: "نحوه و زمان تحویل سفارش را انتخاب کنید.",
    },
    payment: {
      title: "روش پرداخت",
      description: "یکی از روش‌های پرداخت را انتخاب کنید.",
    },
    review: {
      title: "بازبینی سفارش",
      description: "اطلاعات سفارش را بررسی و آن را نهایی کنید.",
    },
  };

  return (
    <div>
      {/* سربرگ و مراحل */}
      <div className="rounded-2xl border border-ink-100 bg-white p-4 shadow-xs sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2.5">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
              <CreditCard className="h-5 w-5" />
            </span>
            <div>
              <h1 className="text-xl font-black text-ink-900 sm:text-2xl">تسویه حساب</h1>
              <p className="mt-0.5 text-[12px] text-ink-500">
                سفارش خود را در چند مرحله ساده نهایی کنید.
              </p>
            </div>
          </div>
          <Link
            href="/cart"
            className="inline-flex items-center gap-1.5 self-start rounded-lg px-2 py-1.5 text-xs font-bold text-ink-600 transition-colors hover:bg-ink-100 hover:text-ink-900"
          >
            <ShoppingBag className="h-4 w-4" />
            بازگشت به سبد خرید
          </Link>
        </div>
        <div className="mt-4 border-t border-ink-100 pt-4">
          <Stepper steps={steps} current={step} onSelect={goToStep} />
        </div>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
        <div className="min-w-0 space-y-4">
          {step !== "auth" && (
            <div className="rounded-2xl border border-ink-100 bg-white p-4 shadow-xs sm:p-5">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <h2 className="text-sm font-black text-ink-900 sm:text-base">
                    {heading[step].title}
                  </h2>
                  <p className="mt-0.5 text-[11px] text-ink-500 sm:text-[12px]">
                    {heading[step].description}
                  </p>
                </div>
                <span className="shrink-0 rounded-full bg-ink-100 px-2 py-0.5 text-[10px] font-bold text-ink-500">
                  مرحله {toPersianDigits(stepIndex + 1)} از {toPersianDigits(steps.length)}
                </span>
              </div>

              {/* ----------------------------- آدرس ----------------------------- */}
              {step === "address" && (
                <div className="mt-4 space-y-3">
                  {addresses.length > 0 && (
                    <div className="space-y-2">
                      {addresses.map((a) => {
                        const selected = a.id === addressId;
                        return (
                          <button
                            key={a.id}
                            type="button"
                            onClick={() => setAddressId(a.id)}
                            className={cn(
                              "relative flex w-full gap-2.5 rounded-xl border p-3 text-right transition-all",
                              selected
                                ? "border-brand-600 bg-brand-50/50 ring-1 ring-brand-600"
                                : "border-ink-200 bg-white hover:border-ink-300",
                            )}
                          >
                            <span
                              aria-hidden
                              className={cn(
                                "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2",
                                selected ? "border-brand-700" : "border-ink-300",
                              )}
                            >
                              <span
                                className={cn(
                                  "h-2.5 w-2.5 rounded-full transition-transform",
                                  selected ? "scale-100 bg-brand-700" : "scale-0",
                                )}
                              />
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className="flex flex-wrap items-center gap-2">
                                <span className="text-xs font-black text-ink-900">{a.label}</span>
                                {a.isDefault && (
                                  <Badge variant="brand" size="xs">
                                    پیش‌فرض
                                  </Badge>
                                )}
                              </span>
                              <span className="mt-1 block text-[12px] font-bold text-ink-800">
                                {a.receiverName} — {toPersianDigits(a.receiverPhone)}
                              </span>
                              <span className="mt-0.5 block text-[11px] leading-5 text-ink-500">
                                {a.province}، {a.city}، {a.address}
                              </span>
                              <span className="mt-0.5 block text-[10px] text-ink-400">
                                کد پستی: {toPersianDigits(a.postalCode)}
                              </span>
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {!showAddressForm ? (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setShowAddressForm(true)}
                    >
                      <Plus className="h-4 w-4" />
                      افزودن آدرس جدید
                    </Button>
                  ) : (
                    <AddressForm
                      onSaved={(address) => {
                        setAddresses((prev) => [
                          address,
                          ...prev.map((a) => ({
                            ...a,
                            isDefault: address.isDefault ? false : a.isDefault,
                          })),
                        ]);
                        setAddressId(address.id);
                        setShowAddressForm(false);
                      }}
                      onCancel={
                        addresses.length > 0 ? () => setShowAddressForm(false) : undefined
                      }
                    />
                  )}
                </div>
              )}

              {/* ----------------------------- ارسال ----------------------------- */}
              {step === "shipping" && (
                <div className="mt-4 space-y-2">
                  {shippingOptions.map((o) => {
                    const Icon = SHIPPING_ICONS[o.key];
                    const selected = shipping === o.key;
                    return (
                      <button
                        key={o.key}
                        type="button"
                        onClick={() => setShipping(o.key)}
                        className={cn(
                          "flex w-full items-start gap-3 rounded-xl border p-3 text-right transition-all",
                          selected
                            ? "border-brand-600 bg-brand-50/50 ring-1 ring-brand-600"
                            : "border-ink-200 bg-white hover:border-ink-300",
                        )}
                      >
                        <span
                          className={cn(
                            "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
                            selected ? "bg-brand-700 text-white" : "bg-ink-100 text-ink-500",
                          )}
                        >
                          <Icon className="h-5 w-5" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="flex flex-wrap items-center justify-between gap-2">
                            <span className="text-[13px] font-black text-ink-900">{o.title}</span>
                            <span className="text-xs font-black text-brand-700">
                              {o.fee === 0 ? "رایگان" : formatPrice(o.fee)}
                            </span>
                          </span>
                          <span className="mt-0.5 block text-[11px] leading-5 text-ink-500">
                            {o.description}
                          </span>
                          <span className="mt-1.5 inline-flex items-center gap-1 rounded-md bg-ink-100 px-1.5 py-0.5 text-[10px] font-bold text-ink-600">
                            زمان تحویل: {o.eta}
                          </span>
                        </span>
                      </button>
                    );
                  })}
                  {shippingFee === 0 && (
                    <p className="flex items-center gap-1.5 rounded-lg bg-success-100 px-3 py-2 text-[11px] font-bold text-success-600">
                      <CheckCircle2 className="h-4 w-4" />
                      سفارش شما مشمول ارسال رایگان است.
                    </p>
                  )}
                </div>
              )}

              {/* ------------------------- پرداخت ------------------------- */}
              {step === "payment" && (
                <div className="mt-4 space-y-2">
                  <button
                    type="button"
                    onClick={() => setPayment("ONLINE")}
                    className={cn(
                      "flex w-full items-start gap-3 rounded-xl border p-3 text-right transition-all",
                      payment === "ONLINE"
                        ? "border-brand-600 bg-brand-50/50 ring-1 ring-brand-600"
                        : "border-ink-200 bg-white hover:border-ink-300",
                    )}
                  >
                    <span
                      className={cn(
                        "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
                        payment === "ONLINE" ? "bg-brand-700 text-white" : "bg-ink-100 text-ink-500",
                      )}
                    >
                      <CreditCard className="h-5 w-5" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-center gap-2">
                        <span className="text-[13px] font-black text-ink-900">پرداخت اینترنتی</span>
                        <Badge variant="accent" size="xs">
                          درگاه آزمایشی
                        </Badge>
                      </span>
                      <span className="mt-0.5 block text-[11px] leading-5 text-ink-500">
                        انتقال به درگاه پرداخت امن برای پرداخت مبلغ سفارش.
                      </span>
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => canUseWallet && setPayment("WALLET")}
                    disabled={!canUseWallet}
                    className={cn(
                      "flex w-full items-start gap-3 rounded-xl border p-3 text-right transition-all",
                      payment === "WALLET"
                        ? "border-brand-600 bg-brand-50/50 ring-1 ring-brand-600"
                        : "border-ink-200 bg-white hover:border-ink-300",
                      !canUseWallet && "cursor-not-allowed opacity-60",
                    )}
                  >
                    <span
                      className={cn(
                        "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
                        payment === "WALLET" ? "bg-brand-700 text-white" : "bg-ink-100 text-ink-500",
                      )}
                    >
                      <Wallet className="h-5 w-5" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-[13px] font-black text-ink-900">کیف پول سَروا</span>
                        <span className="text-[11px] font-bold text-ink-500">
                          موجودی: {formatPrice(walletBalance)}
                        </span>
                      </span>
                      <span className="mt-0.5 block text-[11px] leading-5 text-ink-500">
                        {canUseWallet
                          ? "پرداخت کامل مبلغ سفارش از موجودی کیف پول."
                          : `موجودی کافی نیست؛ ${formatPrice(Math.max(0, total - walletBalance))} دیگر لازم است.`}
                      </span>
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPayment("COD")}
                    className={cn(
                      "flex w-full items-start gap-3 rounded-xl border p-3 text-right transition-all",
                      payment === "COD"
                        ? "border-brand-600 bg-brand-50/50 ring-1 ring-brand-600"
                        : "border-ink-200 bg-white hover:border-ink-300",
                    )}
                  >
                    <span
                      className={cn(
                        "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
                        payment === "COD" ? "bg-brand-700 text-white" : "bg-ink-100 text-ink-500",
                      )}
                    >
                      <Banknote className="h-5 w-5" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="text-[13px] font-black text-ink-900">پرداخت در محل</span>
                      <span className="mt-0.5 block text-[11px] leading-5 text-ink-500">
                        پرداخت نقدی یا با کارتخوان هنگام تحویل سفارش.
                      </span>
                    </span>
                  </button>

                  <p className="flex items-center gap-1.5 rounded-lg bg-ink-50 px-3 py-2 text-[11px] leading-5 text-ink-500">
                    <ShieldCheck className="h-4 w-4 shrink-0 text-brand-700" />
                    پرداخت‌ها روی بستر امن انجام می‌شود و اطلاعات کارت شما در فروشگاه ذخیره نمی‌شود.
                  </p>
                </div>
              )}

              {/* ------------------------- بازبینی ------------------------- */}
              {step === "review" && (
                <div className="mt-4 space-y-3">
                  <SummaryBlock title="آدرس تحویل" onEdit={() => setStep("address")}>
                    {selectedAddress ? (
                      <>
                        <p className="font-bold text-ink-800">
                          {selectedAddress.receiverName} —{" "}
                          {toPersianDigits(selectedAddress.receiverPhone)}
                        </p>
                        <p className="mt-0.5">
                          {selectedAddress.province}، {selectedAddress.city}،{" "}
                          {selectedAddress.address}
                        </p>
                        <p className="mt-0.5 text-[11px] text-ink-400">
                          کد پستی: {toPersianDigits(selectedAddress.postalCode)}
                        </p>
                      </>
                    ) : (
                      <p className="text-ink-500">آدرسی انتخاب نشده است.</p>
                    )}
                  </SummaryBlock>

                  <SummaryBlock title="روش ارسال" onEdit={() => setStep("shipping")}>
                    <p className="flex flex-wrap items-center justify-between gap-2 font-bold text-ink-800">
                      <span>{shippingOption?.title ?? "—"}</span>
                      <span className="text-brand-700">
                        {shippingFee === 0 ? "رایگان" : formatPrice(shippingFee)}
                      </span>
                    </p>
                    <p className="mt-0.5 text-[11px] text-ink-400">
                      زمان تقریبی تحویل: {shippingOption?.eta ?? "—"}
                    </p>
                  </SummaryBlock>

                  <SummaryBlock title="روش پرداخت" onEdit={() => setStep("payment")}>
                    <p className="flex flex-wrap items-center justify-between gap-2 font-bold text-ink-800">
                      <span>{PAYMENT_LABELS[payment]}</span>
                      <span className="text-[12px] text-ink-500">{formatPrice(total)}</span>
                    </p>
                    <p className="mt-0.5 text-[11px] text-ink-400">
                      {payment === "ONLINE"
                        ? "پس از ثبت سفارش به درگاه پرداخت آزمایشی منتقل می‌شوید."
                        : payment === "WALLET"
                          ? "مبلغ سفارش از کیف پول شما کسر می‌شود."
                          : "مبلغ سفارش هنگام تحویل دریافت می‌شود."}
                    </p>
                  </SummaryBlock>

                  <div className="rounded-2xl border border-ink-100 bg-white p-4 shadow-xs">
                    <label
                      htmlFor="checkout-note"
                      className="mb-1.5 block text-sm font-black text-ink-900"
                    >
                      یادداشت سفارش (اختیاری)
                    </label>
                    <Textarea
                      id="checkout-note"
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      rows={3}
                      maxLength={500}
                      placeholder="مثلاً: سفارش را بعدازظهر تحویل دهید."
                    />
                    <p className="mt-1 text-[10px] text-ink-400">
                      {toPersianDigits(note.length)} از ۵۰۰ کاراکتر
                    </p>
                  </div>

                  <Checkbox
                    checked={acceptTerms}
                    onChange={(e) => setAcceptTerms(e.target.checked)}
                    label={
                      <span className="text-[12px] leading-5">
                        <Link href="/terms" className="font-bold text-brand-700 hover:underline">
                          قوانین و شرایط فروش
                        </Link>{" "}
                        را مطالعه کرده‌ام و می‌پذیرم.
                      </span>
                    }
                  />
                </div>
              )}
            </div>
          )}

          {step === "auth" && <AuthStep />}

          {error && (
            <div
              role="alert"
              className="flex items-start gap-2 rounded-xl bg-danger-50 px-3 py-2.5 text-[12px] font-bold leading-5 text-danger-600"
            >
              <X className="mt-0.5 h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          {step !== "auth" && (
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-ink-100 bg-white p-3 shadow-xs">
              <Button
                type="button"
                variant="ghost"
                onClick={goBack}
                disabled={stepIndex <= 0 || submitting}
              >
                <ArrowRight className="h-4 w-4" />
                مرحله قبل
              </Button>

              {step === "review" ? (
                <Button
                  type="button"
                  size="lg"
                  onClick={submitOrder}
                  loading={submitting}
                  disabled={submitting}
                >
                  <Lock className="h-4 w-4" />
                  {submitting ? "در حال ثبت سفارش…" : "ثبت و پرداخت سفارش"}
                </Button>
              ) : (
                <Button type="button" size="lg" onClick={goNext}>
                  ادامه
                  <ChevronLeft className="h-4 w-4" />
                </Button>
              )}
            </div>
          )}
        </div>

        {/* --------------------------- خلاصه سفارش --------------------------- */}
        <aside className="space-y-3 lg:sticky lg:top-24">
          <div className="rounded-2xl border border-ink-100 bg-white p-4 shadow-xs">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-sm font-black text-ink-900">خلاصه سفارش</h2>
              {mounted && (
                <span className="rounded-full bg-ink-100 px-2 py-0.5 text-[10px] font-bold text-ink-600">
                  {toPersianDigits(itemCount)} کالا
                </span>
              )}
            </div>

            {!mounted ? (
              <div className="mt-3 space-y-2">
                <div className="skeleton h-14 rounded-xl" />
                <div className="skeleton h-14 rounded-xl" />
                <div className="skeleton h-24 rounded-xl" />
              </div>
            ) : (
              <>
                <ul className="mt-3 max-h-64 space-y-2 overflow-y-auto pl-1">
                  {lines.map((line) => (
                    <li
                      key={`${line.productId}::${line.variantId ?? ""}`}
                      className="flex gap-2.5"
                    >
                      <Link
                        href={`/product/${line.slug}`}
                        className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-ink-100 bg-ink-50"
                      >
                        <Image
                          src={line.image}
                          alt={line.name}
                          fill
                          sizes="56px"
                          className="object-contain p-1"
                        />
                      </Link>
                      <div className="min-w-0 flex-1">
                        <p className="line-clamp-2 text-[11px] font-bold leading-5 text-ink-800">
                          {line.name}
                        </p>
                        <div className="mt-1 flex items-center justify-between gap-2">
                          <span className="rounded bg-ink-100 px-1.5 py-0.5 text-[10px] font-bold text-ink-600">
                            × {toPersianDigits(line.quantity)}
                          </span>
                          <span className="text-[11px] font-black text-ink-900">
                            {formatPrice(lineTotal(line), { unit: false })}
                            <span className="mr-1 text-[9px] font-medium text-ink-400">تومان</span>
                          </span>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>

                <div className="mt-3 border-t border-ink-100 pt-3">
                  <div className="flex items-center gap-1.5">
                    <div className="relative flex-1">
                      <Tag className="pointer-events-none absolute inset-y-0 right-2.5 my-auto h-4 w-4 text-ink-400" />
                      <input
                        value={code}
                        onChange={(e) => setCode(e.target.value.toUpperCase())}
                        disabled={Boolean(coupon) || checkingCoupon}
                        placeholder="کد تخفیف"
                        aria-label="کد تخفیف"
                        className="h-9 w-full rounded-lg border border-ink-200 bg-white pr-8 pl-2 text-[11px] font-bold uppercase tracking-wider text-ink-900 placeholder:font-medium placeholder:tracking-normal placeholder:text-ink-400 focus:border-brand-600 focus:outline-none focus:ring-4 focus:ring-brand-600/10 disabled:bg-ink-50"
                      />
                    </div>
                    {coupon ? (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        onClick={removeCoupon}
                        aria-label="حذف کد تخفیف"
                        className="text-danger-600 hover:bg-danger-50"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    ) : (
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={applyCoupon}
                        loading={checkingCoupon}
                        disabled={checkingCoupon || !code.trim()}
                      >
                        اعمال
                      </Button>
                    )}
                  </div>
                  {coupon && (
                    <p
                      className={cn(
                        "mt-1.5 flex items-center gap-1 text-[10px] font-bold",
                        couponEligible ? "text-success-600" : "text-danger-600",
                      )}
                    >
                      <BadgePercent className="h-3.5 w-3.5" />
                      {couponEligible
                        ? `کد ${coupon.code} اعمال شد`
                        : `حداقل سفارش برای این کد ${formatPrice(coupon.minOrder)} است`}
                    </p>
                  )}
                </div>

                <dl className="mt-3 space-y-2 border-t border-ink-100 pt-3 text-[11px]">
                  <div className="flex items-center justify-between gap-2">
                    <dt className="text-ink-500">مبلغ کالاها</dt>
                    <dd className="font-bold text-ink-800">{formatPrice(subtotal)}</dd>
                  </div>
                  {productDiscount > 0 && (
                    <div className="flex items-center justify-between gap-2">
                      <dt className="text-ink-500">تخفیف کالاها</dt>
                      <dd className="font-bold text-danger-600">
                        {formatPrice(productDiscount)}−
                      </dd>
                    </div>
                  )}
                  {couponDiscount > 0 && (
                    <div className="flex items-center justify-between gap-2">
                      <dt className="text-ink-500">کد تخفیف</dt>
                      <dd className="font-bold text-danger-600">
                        {formatPrice(couponDiscount)}−
                      </dd>
                    </div>
                  )}
                  <div className="flex items-center justify-between gap-2">
                    <dt className="text-ink-500">هزینه ارسال</dt>
                    <dd className="font-bold text-ink-800">
                      {shippingFee === 0 ? (
                        <span className="text-success-600">رایگان</span>
                      ) : (
                        formatPrice(shippingFee)
                      )}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between gap-2 border-t border-dashed border-ink-200 pt-2.5">
                    <dt className="text-[12px] font-black text-ink-900">مبلغ قابل پرداخت</dt>
                    <dd className="text-sm font-black text-brand-800">{formatPrice(total)}</dd>
                  </div>
                </dl>
              </>
            )}

            <p className="mt-3 flex items-start gap-1.5 rounded-lg bg-ink-50 px-2.5 py-2 text-[10px] leading-5 text-ink-500">
              <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-700" />
              تضمین اصالت کالا، پرداخت امن و امکان بازگشت وجه تا ۷ روز.
            </p>
          </div>

          {mounted && !coupon && payable > 0 && (
            <div className="hidden rounded-2xl border border-dashed border-brand-200 bg-brand-50/60 p-3 text-[11px] leading-5 text-brand-800 lg:block">
              <span className="flex items-center gap-1.5 font-black">
                <BadgePercent className="h-4 w-4" />
                کد تخفیف دارید؟
              </span>
              <p className="mt-1 text-brand-700/80">
                کد تخفیف را در خلاصه سفارش وارد کنید تا از تخفیف ویژه بهره‌مند شوید.
              </p>
            </div>
          )}

          <div className="flex items-center justify-center gap-1.5 text-[10px] text-ink-400">
            <Lock className="h-3.5 w-3.5" />
            اطلاعات شما به‌صورت رمزنگاری‌شده منتقل می‌شود.
          </div>
        </aside>
      </div>

      {/* نوار مراحل پایین در موبایل */}
      {step !== "auth" && (
        <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 border-t border-ink-100 bg-white/95 px-4 py-2.5 backdrop-blur lg:hidden">
          <div className="pointer-events-auto mx-auto flex max-w-3xl items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[10px] font-medium text-ink-500">مبلغ قابل پرداخت</p>
              <p className="text-sm font-black text-ink-900">{formatPrice(total)}</p>
            </div>
            {step === "review" ? (
              <Button
                type="button"
                onClick={submitOrder}
                loading={submitting}
                disabled={submitting}
                className="shrink-0"
              >
                <Lock className="h-4 w-4" />
                ثبت سفارش
              </Button>
            ) : (
              <Button type="button" size="md" onClick={goNext} className="shrink-0">
                <ArrowLeft className="h-4 w-4" />
                ادامه
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
