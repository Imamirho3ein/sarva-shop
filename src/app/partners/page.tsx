import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowLeft,
  BarChart3,
  Boxes,
  CheckCircle2,
  Handshake,
  Headphones,
  Megaphone,
  Send,
  ShieldCheck,
  Truck,
} from "lucide-react";
import { PageHeader } from "@/components/content/page-header";
import { ContentCard, Steps } from "@/components/content/content-blocks";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SITE_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: "فروشندگان و تأمین‌کنندگان",
  description:
    "همکاری با سَروا برای برندها و تأمین‌کنندگان: دسترسی به مشتریان، لجستیک، پنل فروش و پشتیبانی اختصاصی.",
};

const BENEFITS = [
  {
    icon: BarChart3,
    title: "دسترسی به بازار گسترده",
    text: "نمایش محصولات در برابر صدها هزار بازدیدکننده ماهانه و مشتریان هدفمند.",
  },
  {
    icon: Boxes,
    title: "مدیریت آسان کالا",
    text: "پنل اختصاصی برای ثبت محصول، موجودی، قیمت و پیگیری سفارش‌ها.",
  },
  {
    icon: Truck,
    title: "لجستیک آماده",
    text: "امکان استفاده از انبار و شبکه ارسال سَروا برای کاهش هزینه و زمان تحویل.",
  },
  {
    icon: Megaphone,
    title: "حمایت بازاریابی",
    text: "حضور در کمپین‌ها، پیشنهادهای ویژه و معرفی برند در صفحات منتخب.",
  },
  {
    icon: Headphones,
    title: "پشتیبانی اختصاصی",
    text: "کارشناس حساب برای پاسخ به سؤال‌ها و رفع سریع مشکلات فروش.",
  },
  {
    icon: ShieldCheck,
    title: "پرداخت شفاف",
    text: "تسویه منظم بر اساس گزارش فروش و قرارداد شفاف همکاری.",
  },
];

const REQUIREMENTS = [
  "شخصیت حقوقی یا مجوز فعالیت معتبر (برای تأمین‌کنندگان تجاری).",
  "اصالت کالا و مدارک تأمین (فاکتور، نمایندگی یا مجوز واردات).",
  "توانایی تأمین پایدار و ارسال به‌موقع سفارش‌ها.",
  "رعایت استانداردهای بسته‌بندی و اطلاعات محصول.",
  "پاسخ‌گویی به پرسش‌های مشتریان در بازه توافق‌شده.",
];

export default function PartnersPage() {
  return (
    <div className="container-site space-y-4 py-4 lg:py-6">
      <PageHeader
        eyebrow="همکاری تجاری"
        title="فروشندگان و تأمین‌کنندگان"
        description={`${SITE_NAME} بستری برای برندها و تأمین‌کنندگانی است که می‌خواهند محصولاتشان را با تجربه‌ای حرفه‌ای به مشتریان ایرانی عرضه کنند.`}
        crumbs={[{ label: "فروشندگان و تأمین‌کنندگان" }]}
        icon={<Handshake className="h-6 w-6" />}
        meta={<Badge variant="brand">پذیرش برندهای منتخب</Badge>}
        actions={
          <Button asChild size="sm">
            <a href="mailto:partners@sarva.shop?subject=درخواست همکاری فروشندگی">
              <Send className="h-3.5 w-3.5" />
              درخواست همکاری
            </a>
          </Button>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {BENEFITS.map((benefit) => {
          const Icon = benefit.icon;
          return (
            <div
              key={benefit.title}
              className="rounded-2xl border border-ink-100 bg-white p-4 shadow-xs"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
                <Icon className="h-4 w-4" />
              </span>
              <h2 className="mt-2.5 text-[12px] font-black text-ink-900">{benefit.title}</h2>
              <p className="mt-1 text-[11px] leading-6 text-ink-500">{benefit.text}</p>
            </div>
          );
        })}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
        <ContentCard
          title="مسیر شروع همکاری"
          description="از درخواست تا عرضه محصول، معمولاً کمتر از دو هفته زمان می‌برد."
          icon={<Handshake className="h-4 w-4" />}
        >
          <Steps
            steps={[
              {
                title: "ارسال درخواست",
                description:
                  "ایمیل خود را با معرفی برند، دسته‌بندی محصولات و مدارک تأمین به partners@sarva.shop ارسال کنید.",
              },
              {
                title: "بررسی و گفتگو",
                description:
                  "تیم تأمین درخواست را بررسی می‌کند و در صورت تناسب، جلسه آشنایی برگزار می‌شود.",
              },
              {
                title: "قرارداد و onboarding",
                description:
                  "شرایط همکاری، قیمت‌گذاری، لجستیک و تسویه در قرارداد مشخص و حساب فروشنده ایجاد می‌شود.",
              },
              {
                title: "ثبت محصول و شروع فروش",
                description:
                  "محصولات با اطلاعات کامل و تصاویر استاندارد ثبت و پس از تأیید، در فروشگاه منتشر می‌شوند.",
              },
            ]}
          />
        </ContentCard>

        <div className="space-y-4">
          <ContentCard title="شرایط پذیرش" icon={<CheckCircle2 className="h-4 w-4" />}>
            <ul className="space-y-2">
              {REQUIREMENTS.map((item) => (
                <li key={item} className="flex gap-2 text-[11px] leading-6 text-ink-600">
                  <CheckCircle2 className="mt-1 h-3.5 w-3.5 shrink-0 text-success-600" />
                  {item}
                </li>
              ))}
            </ul>
          </ContentCard>

          <ContentCard title="اطلاعات موردنیاز در ایمیل">
            <ul className="space-y-1.5 text-[11px] leading-6 text-ink-600">
              <li>نام برند یا شرکت و وب‌سایت (در صورت وجود)</li>
              <li>دسته‌بندی محصولات و تعداد تقریبی SKU</li>
              <li>شماره تماس و ایمیل مسئول همکاری</li>
              <li>مدارک تأمین یا نمایندگی</li>
              <li>شهر انبار و توان ارسال</li>
            </ul>
            <div className="mt-3 rounded-xl bg-ink-50 p-3">
              <p className="text-[9px] font-bold text-ink-400">ایمیل همکاری</p>
              <a
                href="mailto:partners@sarva.shop"
                dir="ltr"
                className="mt-0.5 block text-right text-[12px] font-black text-ink-800 hover:text-brand-700"
              >
                partners@sarva.shop
              </a>
            </div>
          </ContentCard>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-ink-100 bg-ink-50/60 p-4">
        <p className="max-w-2xl text-[11px] leading-6 text-ink-500">
          توجه: ارسال درخواست به معنای پذیرش قطعی همکاری نیست. همه برندها بر اساس تناسب
          دسته‌بندی، کیفیت کالا و توان تأمین بررسی می‌شوند تا تجربه مشتری سَروا حفظ شود.
        </p>
        <div className="flex gap-2">
          <Button asChild size="sm" variant="outline">
            <Link href="/contact">فرم تماس</Link>
          </Button>
          <Button asChild size="sm" variant="ghost">
            <Link href="/about">
              درباره ما
              <ArrowLeft className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
