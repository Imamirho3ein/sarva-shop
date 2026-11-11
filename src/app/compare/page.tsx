import type { Metadata } from "next";
import { Scale } from "lucide-react";
import { CompareView } from "@/components/compare/compare-view";
import { Breadcrumb } from "@/components/ui/breadcrumb";

export const metadata: Metadata = {
  title: `مقایسه محصولات`,
  description: "مقایسه دقیق مشخصات، قیمت و امتیاز محصولات پیش از خرید.",
  robots: { index: false, follow: true },
};

export default function ComparePage() {
  return (
    <div className="container-site py-4 lg:py-6">
      <div className="rounded-2xl border border-ink-100 bg-white px-4 py-4 shadow-xs sm:px-5">
        <Breadcrumb items={[{ label: "مقایسه محصولات" }]} />
        <div className="mt-2.5 flex items-center gap-2">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
            <Scale className="h-5 w-5" />
          </span>
          <div>
            <h1 className="text-xl font-black text-ink-900 sm:text-2xl">مقایسه محصولات</h1>
            <p className="mt-0.5 text-[12px] text-ink-500">
              حداکثر ۴ کالا را از نظر قیمت، امتیاز و موجودی مقایسه کنید.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-4">
        <CompareView />
      </div>
    </div>
  );
}
