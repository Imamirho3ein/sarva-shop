"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BadgeCheck,
  Check,
  Heart,
  Minus,
  Plus,
  RefreshCcw,
  Scale,
  Share2,
  ShieldCheck,
  ShoppingCart,
  Store,
  Truck,
  Zap,
} from "lucide-react";
import { cn, discountPercent, stockState } from "@/lib/utils";
import { formatPrice, toPersianDigits } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Stars } from "@/components/ui/stars";
import { Countdown } from "@/components/home/countdown";
import { useToast } from "@/components/ui/toast";
import { useCart } from "@/store/cart";
import { useCompare, useWishlist, type CompactProduct } from "@/store/lists";
import type { ProductDetailDTO } from "@/types";

/**
 * پنل خرید صفحه محصول: انتخاب تنوع، تعداد، افزودن به سبد و اقدامات سریع.
 */
export function PurchasePanel({ product }: { product: ProductDetailDTO }) {
  const router = useRouter();
  const toast = useToast();
  const add = useCart((s) => s.add);
  const toggleWish = useWishlist((s) => s.toggle);
  const hasWish = useWishlist((s) => s.items.some((i) => i.id === product.id));
  const toggleCompare = useCompare((s) => s.toggle);
  const hasCompare = useCompare((s) => s.items.some((i) => i.id === product.id));

  const variants = product.variants;
  const [variantId, setVariantId] = React.useState<string | null>(
    variants.find((v) => v.stock > 0)?.id ?? variants[0]?.id ?? null,
  );
  const [qty, setQty] = React.useState(1);

  const variant = variants.find((v) => v.id === variantId) ?? null;
  const stock = variant ? variant.stock : product.stock;
  const state = stockState(stock);

  const unitPrice =
    product.discountPrice && product.discountPrice < product.price
      ? product.discountPrice
      : product.price;
  const percent = discountPercent(product.price, product.discountPrice);

  const compact: CompactProduct = {
    id: product.id,
    slug: product.slug,
    name: product.name,
    image: product.image,
    price: product.price,
    discountPrice: product.discountPrice,
    rating: product.rating,
    reviewCount: product.reviewCount,
    stock: product.stock,
  };

  const handleAdd = (goCheckout = false) => {
    if (stock <= 0) {
      toast.warning("ناموجود", "این کالا در حال حاضر موجود نیست.");
      return;
    }
    const res = add(
      {
        productId: product.id,
        variantId: variant?.id ?? null,
        name: variant ? `${product.name} — ${variant.name}` : product.name,
        image: product.image,
        slug: product.slug,
        sku: variant?.sku ?? product.sku ?? product.id,
        price: product.price,
        discountPrice: product.discountPrice,
        stock,
        brandName: product.brandName,
      },
      qty,
    );

    if (!res.ok) {
      toast.warning(res.message);
      return;
    }

    if (goCheckout) {
      router.push("/checkout");
      return;
    }
    toast.success(res.message, product.name);
  };

  const handleWish = () => {
    const added = toggleWish(compact);
    toast.push({
      kind: "success",
      title: added ? "به علاقه‌مندی‌ها اضافه شد" : "از علاقه‌مندی‌ها حذف شد",
      description: product.name,
    });
  };

  const handleCompare = () => {
    const added = toggleCompare(compact);
    toast.push({
      kind: "info",
      title: added ? "به مقایسه اضافه شد" : "از مقایسه حذف شد",
      description: added ? "حداکثر ۴ محصول قابل مقایسه است." : undefined,
    });
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("لینک کالا کپی شد", "می‌توانید برای دوستانتان بفرستید.");
    } catch {
      toast.info("لینک کالا", window.location.href);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-2xl border border-ink-100 bg-white p-4 shadow-xs sm:p-5">
        {/* برند و عنوان */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            {product.brandName && (
              <Link
                href={product.brandSlug ? `/brands/${product.brandSlug}` : "/brands"}
                className="inline-flex items-center gap-1 text-[11px] font-extrabold text-brand-700 hover:text-brand-900"
              >
                <BadgeCheck className="h-3.5 w-3.5" />
                {product.brandName}
              </Link>
            )}
            <h1 className="mt-1.5 text-lg font-black leading-8 text-ink-900 sm:text-xl lg:text-2xl">
              {product.name}
            </h1>
            {product.shortDesc && (
              <p className="mt-1.5 text-[12px] leading-6 text-ink-500">{product.shortDesc}</p>
            )}
          </div>
          <div className="hidden shrink-0 gap-1.5 sm:flex">
            <QuickButton label="افزودن به علاقه‌مندی" onClick={handleWish} active={hasWish}>
              <Heart
                className={cn("h-4.5 w-4.5", hasWish && "fill-danger-500 text-danger-500")}
                strokeWidth={2.2}
              />
            </QuickButton>
            <QuickButton label="افزودن به مقایسه" onClick={handleCompare} active={hasCompare}>
              <Scale
                className={cn("h-4.5 w-4.5", hasCompare && "text-brand-700")}
                strokeWidth={2.2}
              />
            </QuickButton>
            <QuickButton label="کپی لینک" onClick={handleShare}>
              <Share2 className="h-4.5 w-4.5" strokeWidth={2.2} />
            </QuickButton>
          </div>
        </div>

        {/* امتیاز */}
        <div className="mt-3 flex flex-wrap items-center gap-3 border-b border-ink-100 pb-3">
          <Stars value={product.rating} size={15} showValue />
          <span className="text-[11px] font-bold text-ink-400">
            ({toPersianDigits(product.reviewCount)} نظر)
          </span>
          <span className="h-3 w-px bg-ink-200" aria-hidden />
          <span className="text-[11px] font-bold text-ink-400">
            {toPersianDigits(product.soldCount)} فروش موفق
          </span>
          <span className="h-3 w-px bg-ink-200" aria-hidden />
          <span className="text-[11px] font-medium text-ink-400">
            کد کالا: {toPersianDigits(product.sku ?? product.id.slice(-6))}
          </span>
        </div>

        {/* پیشنهاد شگفت‌انگیز */}
        {product.isSpecial && product.specialEndsAt && (
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-xl bg-gradient-to-l from-accent-600 to-accent-400 p-2.5 text-white">
            <span className="flex items-center gap-1.5 text-[11px] font-extrabold">
              <Zap className="h-4 w-4" />
              پیشنهاد شگفت‌انگیز — فرصت محدود
            </span>
            <Countdown endsAt={product.specialEndsAt} compact />
          </div>
        )}

        {/* تنوع */}
        {variants.length > 0 && (
          <div className="mt-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-ink-800">
                انتخاب {variants.some((v) => v.colorName) ? "رنگ / تنوع" : "تنوع"}
              </span>
              {variant && (
                <span className="text-[11px] font-bold text-ink-500">{variant.name}</span>
              )}
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {variants.map((v) => {
                const selected = v.id === variantId;
                const out = v.stock <= 0;
                return (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => {
                      setVariantId(v.id);
                      setQty(1);
                    }}
                    disabled={out}
                    title={out ? "ناموجود" : v.name}
                    className={cn(
                      "inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-[11px] font-bold transition-all duration-200",
                      selected
                        ? "border-brand-600 bg-brand-50 text-brand-800 ring-2 ring-brand-600/15"
                        : "border-ink-200 bg-white text-ink-600 hover:border-ink-300",
                      out && "cursor-not-allowed opacity-45 line-through",
                    )}
                  >
                    {v.colorHex ? (
                      <span
                        className="h-4 w-4 rounded-full border border-ink-200 shadow-sm"
                        style={{ backgroundColor: v.colorHex }}
                      />
                    ) : (
                      <Check className="h-3.5 w-3.5" />
                    )}
                    {v.name}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* قیمت */}
        <div className="mt-4 rounded-xl bg-ink-50/70 p-3">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div className="flex flex-col">
              {percent > 0 && (
                <span className="text-[11px] font-bold text-ink-400">
                  قیمت قبل از تخفیف:{" "}
                  <span className="line-through tabular">{formatPrice(product.price)}</span>
                </span>
              )}
              <div className="mt-0.5 flex items-center gap-2">
                <span className="text-2xl font-black tabular text-ink-900">
                  {formatPrice(unitPrice, { unit: false })}
                </span>
                <span className="text-xs font-bold text-ink-500">تومان</span>
                {percent > 0 && (
                  <span className="rounded-md bg-danger-600 px-1.5 py-0.5 text-[11px] font-black text-white">
                    {toPersianDigits(percent)}٪ تخفیف
                  </span>
                )}
              </div>
            </div>

            <span
              className={cn(
                "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] font-extrabold",
                state === "in" && "bg-success-50 text-success-600",
                state === "low" && "bg-accent-50 text-accent-600",
                state === "out" && "bg-ink-100 text-ink-500",
              )}
            >
              <span
                className={cn(
                  "h-1.5 w-1.5 rounded-full",
                  state === "in" && "bg-success-500",
                  state === "low" && "bg-accent-500",
                  state === "out" && "bg-ink-400",
                )}
              />
              {state === "in" && `موجود در انبار (${toPersianDigits(stock)})`}
              {state === "low" && `تنها ${toPersianDigits(stock)} عدد باقی مانده`}
              {state === "out" && "ناموجود"}
            </span>
          </div>
        </div>

        {/* تعداد و افزودن */}
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex h-12 w-fit items-center rounded-xl border border-ink-200 bg-white">
            <button
              type="button"
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              disabled={qty <= 1}
              aria-label="کاهش تعداد"
              className="flex h-full w-11 items-center justify-center text-ink-500 transition-colors hover:text-brand-700 disabled:opacity-40"
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="min-w-10 text-center text-sm font-black tabular text-ink-900">
              {toPersianDigits(qty)}
            </span>
            <button
              type="button"
              onClick={() => setQty((q) => Math.min(Math.max(1, stock), q + 1))}
              disabled={qty >= stock || stock <= 0}
              aria-label="افزایش تعداد"
              className="flex h-full w-11 items-center justify-center text-ink-500 transition-colors hover:text-brand-700 disabled:opacity-40"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>

          <Button
            type="button"
            size="lg"
            onClick={() => handleAdd(false)}
            disabled={state === "out"}
            className="flex-1"
          >
            <ShoppingCart className="h-5 w-5" strokeWidth={2.4} />
            {state === "out" ? "ناموجود" : "افزودن به سبد خرید"}
          </Button>

          <Button
            type="button"
            size="lg"
            variant="accent"
            onClick={() => handleAdd(true)}
            disabled={state === "out"}
            className="flex-1"
          >
            <Zap className="h-5 w-5" strokeWidth={2.4} />
            خرید سریع
          </Button>
        </div>

        <div className="mt-3 flex items-center gap-2 sm:hidden">
          <Button type="button" variant="outline" size="sm" onClick={handleWish} className="flex-1">
            <Heart className={cn("h-4 w-4", hasWish && "fill-danger-500 text-danger-500")} />
            {hasWish ? "در علاقه‌مندی‌ها" : "علاقه‌مندی"}
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={handleCompare} className="flex-1">
            <Scale className={cn("h-4 w-4", hasCompare && "text-brand-700")} />
            مقایسه
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={handleShare} className="flex-1">
            <Share2 className="h-4 w-4" />
            اشتراک
          </Button>
        </div>
      </div>

      {/* اعتماد و فروشنده */}
      <div className="grid gap-2 sm:grid-cols-3">
        <TrustItem icon={<Truck className="h-4.5 w-4.5" />} title="ارسال سریع" desc="تحویل ۲۴ ساعته در تهران" />
        <TrustItem icon={<ShieldCheck className="h-4.5 w-4.5" />} title="ضمانت اصالت" desc="تضمین اورجینال بودن کالا" />
        <TrustItem icon={<RefreshCcw className="h-4.5 w-4.5" />} title="بازگشت ۷ روزه" desc="بدون قید و شرط" />
      </div>

      <div className="flex items-center gap-3 rounded-2xl border border-ink-100 bg-white p-3.5 shadow-xs">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
          <Store className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-extrabold text-ink-900">فروشنده: سَروا</p>
          <p className="mt-0.5 flex flex-wrap items-center gap-1.5 text-[10px] font-medium text-ink-400">
            <span className="inline-flex items-center gap-0.5 text-success-600">
              <BadgeCheck className="h-3 w-3" />
              عملکرد عالی
            </span>
            <span className="h-2.5 w-px bg-ink-200" aria-hidden />
            گارانتی {product.warranty ?? "اصالت کالا"}
          </p>
        </div>
        <Badge variant="success" size="xs">
          ارسال از انبار سَروا
        </Badge>
      </div>
    </div>
  );
}

function QuickButton({
  children,
  label,
  onClick,
  active,
}: {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={cn(
        "flex h-9 w-9 items-center justify-center rounded-xl border border-ink-200 bg-white text-ink-500 transition-all duration-200 hover:border-brand-300 hover:text-brand-700",
        active && "border-danger-100 bg-danger-50 text-danger-600",
      )}
    >
      {children}
    </button>
  );
}

function TrustItem({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <div className="flex items-center gap-2.5 rounded-xl border border-ink-100 bg-white p-2.5 shadow-xs">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
        {icon}
      </span>
      <span className="min-w-0">
        <span className="block text-[11px] font-extrabold text-ink-800">{title}</span>
        <span className="block truncate text-[10px] font-medium text-ink-400">{desc}</span>
      </span>
    </div>
  );
}
