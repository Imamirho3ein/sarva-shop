import type { Metadata } from "next";
import { ShoppingBag } from "lucide-react";
import { CartView } from "@/components/cart/cart-view";
import { Breadcrumb } from "@/components/ui/breadcrumb";

export const metadata: Metadata = {
  title: `سبد خرید`,
  description: "سبد خرید شما در فروشگاه اینترنتی سَروا؛ تغییر تعداد، حذف کالا و اعمال کد تخفیف.",
  robots: { index: false, follow: false },
};

export default function CartPage() {
  return (
    <div className="container-site py-4 lg:py-6">
      <div className="rounded-2xl border border-ink-100 bg-white px-4 py-4 shadow-xs sm:px-5">
        <Breadcrumb items={[{ label: "سبد خرید" }]} />
        <div className="mt-2.5 flex items-center gap-2">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
            <ShoppingBag className="h-5 w-5" />
          </span>
          <div>
            <h1 className="text-xl font-black text-ink-900 sm:text-2xl">سبد خرید</h1>
            <p className="mt-0.5 text-[12px] text-ink-500">
              کالاهای انتخابی خود را بررسی و سفارش را نهایی کنید.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-4">
        <CartView />
      </div>
    </div>
  );
}
