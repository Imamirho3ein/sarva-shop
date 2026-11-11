import type { Metadata } from "next";
import Link from "next/link";
import {
  Bike,
  CircleCheck,
  Clock,
  MapPin,
  Package,
  ShieldCheck,
  Store,
  Truck,
  Zap,
} from "lucide-react";
import { PageHeader } from "@/components/content/page-header";
import { ContentCard, Steps } from "@/components/content/content-blocks";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatPrice, toPersianDigits } from "@/lib/format";
import {
  FREE_SHIPPING_THRESHOLD,
  getShippingOptions,
} from "@/lib/shipping";

export const metadata: Metadata = {
  title: "روش‌های ارسال",
  description:
    "روش‌های ارسال سَروا، هزینه و زمان تحویل، آستانه ارسال رایگان و نکات مهم درباره بسته‌بندی و پیگیری مرسوله.",
};

const ICONS = { Package, Bike, Zap, Store } as const;

export default function ShippingPage() {
  const options = getShippingOptions({ subtotal: 0 });

  return (
    <div className="container-site space-y-4 py-4 lg:py-6">
      <PageHeader
        eyebrow="ارسال و تحویل"
        title="روش‌های ارسال"
        description="روش ارسال را در مرحله نهایی خرید انتخاب می‌کنید. هزینه و زمان تحویل هر روش، پیش از پرداخت به‌صورت شفاف نمایش داده می‌شود."
        crumbs={[{ label: "روش‌های ارسال" }]}
        icon={<Truck className="h-6 w-6" />}
        meta={
          <Badge variant="success">
            ارسال رایگان بالای {formatPrice(FREE_SHIPPING_THRESHOLD)}
          </Badge>
        }
        actions={
          <Button asChild size="sm" variant="outline">
            <Link href="/products">شروع خرید</Link>
          </Button>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {options.map((option) => {
          const Icon = ICONS[option.icon as keyof typeof ICONS] ?? Package;
          return (
            <div
              key={option.key}
              className="rounded-2xl border border-ink-100 bg-white p-4 shadow-xs"
            >
              <div className="flex items-start justify-between gap-2">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
                  <Icon className="h-5 w-5" />
                </span>
                <Badge variant={option.fee === 0 ? "success" : "outline"} size="xs">
                  {option.fee === 0 ? "رایگان" : formatPrice(option.fee)}
                </Badge>
              </div>
              <h2 className="mt-3 text-sm font-black text-ink-900">{option.title}</h2>
              <p className="mt-1 text-[11px] leading-6 text-ink-500">{option.description}</p>
              <p className="mt-2 flex items-center gap-1 text-[10px] font-bold text-brand-700">
                <Clock className="h-3.5 w-3.5" />
                {option.eta}
              </p>
            </div>
          );
        })}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
        <ContentCard
          title="از ثبت سفارش تا تحویل"
          description="مسیر سفارش شما شفاف است؛ در هر مرحله می‌توانید وضعیت را در پنل کاربری ببینید."
          icon={<MapPin className="h-4 w-4" />}
        >
          <Steps
            steps={[
              {
                title: "ثبت و پرداخت سفارش",
                description:
                  "پس از انتخاب روش ارسال و پرداخت موفق، سفارش شما به‌صورت خودکار در صف پردازش قرار می‌گیرد.",
              },
              {
                title: "آماده‌سازی و کنترل کیفیت",
                description:
                  "کالا از انبار مرکزی برداشت، از نظر سالم بودن و کامل بودن متعلقات بررسی و بسته‌بندی می‌شود.",
              },
              {
                title: "تحویل به شرکت حمل",
                description:
                  "مرسوله به پست، پیک یا سرویس فوری تحویل داده می‌شود و کد رهگیری در صفحه سفارش ثبت می‌گردد.",
              },
              {
                title: "دریافت و تأیید",
                description:
                  "هنگام تحویل، بسته را در حضور مأمور بررسی کنید. در صورت آسیب، از تحویل خودداری و با پشتیبانی تماس بگیرید.",
              },
            ]}
          />
        </ContentCard>

        <div className="space-y-4">
          <ContentCard title="نکات مهم ارسال" icon={<CircleCheck className="h-4 w-4" />}>
            <ul className="space-y-2 text-[11px] leading-6 text-ink-600">
              <li className="flex gap-2">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" />
                سفارش‌های ثبت‌شده در روزهای تعطیل، اولین روز کاری بعد پردازش می‌شوند.
              </li>
              <li className="flex gap-2">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" />
                ارسال فوری فقط برای سفارش‌های قبل از ساعت ۱۵ در محدوده سرویس‌دهی فعال است.
              </li>
              <li className="flex gap-2">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" />
                آدرس گیرنده باید دقیق و شامل کد پستی باشد؛ تغییر آدرس پس از ارسال ممکن نیست.
              </li>
              <li className="flex gap-2">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" />
                در صورت عدم حضور گیرنده، مرسوله طبق رویه شرکت حمل به دفتر پست بازمی‌گردد.
              </li>
            </ul>
          </ContentCard>

          <ContentCard title="بسته‌بندی و اصالت" icon={<ShieldCheck className="h-4 w-4" />}>
            <p className="text-[11px] leading-6 text-ink-500">
              هر سفارش با بسته‌بندی محافظ و برچسب اصالت سَروا ارسال می‌شود. در صورت مشاهده
              هرگونه آسیب یا بازشدگی، بسته را تحویل نگیرید و موضوع را همان روز به پشتیبانی
              اطلاع دهید.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Badge variant="brand">ضمانت اصالت</Badge>
              <Badge variant="outline">بسته‌بندی ایمن</Badge>
              <Badge variant="outline">پیگیری لحظه‌ای</Badge>
            </div>
          </ContentCard>
        </div>
      </div>

      <ContentCard title="جدول خلاصه هزینه‌ها">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-right text-[11px]">
            <thead className="bg-ink-50 text-[10px] text-ink-500">
              <tr>
                <th className="rounded-r-lg px-3 py-2 font-medium">روش ارسال</th>
                <th className="px-3 py-2 font-medium">زمان تحویل</th>
                <th className="px-3 py-2 font-medium">هزینه پایه</th>
                <th className="rounded-l-lg px-3 py-2 font-medium">بالای {formatPrice(FREE_SHIPPING_THRESHOLD)}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {options.map((option) => (
                <tr key={option.key}>
                  <td className="px-3 py-2.5 font-black text-ink-800">{option.title}</td>
                  <td className="px-3 py-2.5 text-ink-500">{option.eta}</td>
                  <td className="px-3 py-2.5 text-ink-600">
                    {option.key === "PICKUP" ? "رایگان" : formatPrice(option.fee)}
                  </td>
                  <td className="px-3 py-2.5">
                    {option.key === "PICKUP" ? (
                      <span className="text-ink-400">—</span>
                    ) : (
                      <span className="font-bold text-success-600">ارسال رایگان</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-[10px] text-ink-400">
          هزینه‌ها به تومان و برای هر مرسوله است. تعداد {toPersianDigits(1)} مرسوله در هر
          سفارش لحاظ می‌شود؛ سفارش‌های چندبسته‌ای هزینه جداگانه ندارند.
        </p>
      </ContentCard>
    </div>
  );
}
