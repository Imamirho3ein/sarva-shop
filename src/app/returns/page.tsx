import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowLeft,
  BadgeCheck,
  CalendarClock,
  CircleAlert,
  CircleCheck,
  CreditCard,
  PackageX,
  RefreshCcw,
  ShieldCheck,
  Truck,
} from "lucide-react";
import { PageHeader } from "@/components/content/page-header";
import { ContentCard, Steps } from "@/components/content/content-blocks";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "شرایط بازگشت کالا",
  description:
    "قوانین مرجوعی سَروا: مهلت ۷ روزه بازگشت، شرایط پذیرش کالا، مراحل ثبت درخواست و زمان بازگشت وجه یا شارژ کیف پول.",
};

const ACCEPTED = [
  "کالا در بازه ۷ روز پس از تحویل مرجوع شود.",
  "بسته‌بندی اصلی، کارتن، برچسب‌ها و متعلقات کامل باشد.",
  "کالا استفاده نشده و آسیب فیزیکی نداشته باشد.",
  "فاکتور خرید یا شماره سفارش قابل ارائه باشد.",
  "برای کالای معیوب، گزارش ایراد و در صورت امکان عکس یا ویدئو ارسال شود.",
];

const REJECTED = [
  "کالاهای بهداشتی و آرایشی که بسته‌بندی آن‌ها باز شده باشد.",
  "محصولات سفارشی‌سازی‌شده یا شخصی‌سازی‌شده.",
  "کالاهای دیجیتال با لایسنس فعال‌شده یا نرم‌افزار نصب‌شده.",
  "لباس‌های زیر، جوراب و اقلام بهداشتی بازشده.",
  "کالایی که به دلیل استفاده نادرست آسیب دیده است.",
];

const REFUND_TIMELINE = [
  {
    title: "بررسی درخواست",
    text: "حداکثر ۲ روز کاری برای بررسی اولیه و تأیید شرایط مرجوعی.",
    time: "۱ تا ۲ روز کاری",
  },
  {
    title: "دریافت و کنترل کالا",
    text: "پس از تحویل مرسوله به انبار، کالا توسط کارشناس بررسی می‌شود.",
    time: "۲ تا ۴ روز کاری",
  },
  {
    title: "بازگشت وجه",
    text: "مبلغ به کیف پول سَروا یا حساب بانکی شما بازمی‌گردد.",
    time: "۳ تا ۷ روز کاری",
  },
];

export default function ReturnsPage() {
  return (
    <div className="container-site space-y-4 py-4 lg:py-6">
      <PageHeader
        eyebrow="خرید بدون ریسک"
        title="شرایط بازگشت کالا"
        description="اگر کالایی مطابق انتظار شما نبود، نگران نباشید. تا ۷ روز پس از تحویل می‌توانید درخواست بازگشت ثبت کنید؛ فرآیند ساده و قابل پیگیری است."
        crumbs={[{ label: "شرایط بازگشت کالا" }]}
        icon={<RefreshCcw className="h-6 w-6" />}
        meta={
          <Badge variant="success">
            <ShieldCheck className="h-3 w-3" />
            ضمانت بازگشت ۷ روزه
          </Badge>
        }
        actions={
          <Button asChild size="sm" variant="outline">
            <Link href="/account/orders">
              ثبت درخواست مرجوعی
              <ArrowLeft className="h-3.5 w-3.5" />
            </Link>
          </Button>
        }
      />

      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-4">
          <ContentCard
            title="مراحل بازگشت کالا"
            description="درخواست مرجوعی را از صفحه جزئیات سفارش ثبت کنید؛ بقیه کارها با ماست."
            icon={<RefreshCcw className="h-4 w-4" />}
          >
            <Steps
              steps={[
                {
                  title: "ثبت درخواست",
                  description:
                    "وارد پنل کاربری شوید، سفارش موردنظر را باز کنید و گزینه «درخواست مرجوعی» را انتخاب کنید. دلیل بازگشت را دقیق بنویسید.",
                },
                {
                  title: "تأیید و هماهنگی ارسال",
                  description:
                    "کارشناس ما درخواست را بررسی و نحوه ارسال مرسوله (پیک یا پست) را با شما هماهنگ می‌کند.",
                },
                {
                  title: "بسته‌بندی و تحویل",
                  description:
                    "کالا را همراه متعلقات و بسته‌بندی اصلی بسته‌بندی کنید و طبق هماهنگی به مأمور تحویل دهید.",
                },
                {
                  title: "بررسی و بازگشت وجه",
                  description:
                    "پس از کنترل کالا، مبلغ به کیف پول یا حساب بانکی شما بازمی‌گردد و نتیجه به شما اطلاع داده می‌شود.",
                },
              ]}
            />
          </ContentCard>

          <div className="grid gap-4 sm:grid-cols-2">
            <ContentCard
              title="شرایط پذیرش"
              icon={<CircleCheck className="h-4 w-4" />}
              className="border-success-100"
            >
              <ul className="space-y-2">
                {ACCEPTED.map((item) => (
                  <li key={item} className="flex gap-2 text-[11px] leading-6 text-ink-600">
                    <CircleCheck className="mt-1 h-3.5 w-3.5 shrink-0 text-success-600" />
                    {item}
                  </li>
                ))}
              </ul>
            </ContentCard>

            <ContentCard
              title="موارد غیرقابل بازگشت"
              icon={<PackageX className="h-4 w-4" />}
              className="border-danger-100"
            >
              <ul className="space-y-2">
                {REJECTED.map((item) => (
                  <li key={item} className="flex gap-2 text-[11px] leading-6 text-ink-600">
                    <CircleAlert className="mt-1 h-3.5 w-3.5 shrink-0 text-danger-500" />
                    {item}
                  </li>
                ))}
              </ul>
            </ContentCard>
          </div>
        </div>

        <div className="space-y-4">
          <ContentCard title="زمان‌بندی بازگشت وجه" icon={<CalendarClock className="h-4 w-4" />}>
            <ul className="space-y-2.5">
              {REFUND_TIMELINE.map((item) => (
                <li key={item.title} className="rounded-xl border border-ink-100 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[11px] font-black text-ink-800">{item.title}</p>
                    <Badge variant="outline" size="xs">
                      {item.time}
                    </Badge>
                  </div>
                  <p className="mt-1 text-[10px] leading-5 text-ink-500">{item.text}</p>
                </li>
              ))}
            </ul>
          </ContentCard>

          <ContentCard title="روش بازگشت وجه" icon={<CreditCard className="h-4 w-4" />}>
            <div className="space-y-2 text-[11px] leading-6 text-ink-600">
              <p>
                <strong className="font-black text-ink-800">کیف پول سَروا:</strong> سریع‌ترین
                روش؛ مبلغ بلافاصله پس از تأیید قابل استفاده است.
              </p>
              <p>
                <strong className="font-black text-ink-800">حساب بانکی:</strong> به شماره
                حسابی که با آن پرداخت کرده‌اید یا به نام صاحب حساب، بازگردانده می‌شود.
              </p>
              <p>
                <strong className="font-black text-ink-800">پرداخت در محل:</strong> بازگشت
                از طریق واریز بانکی انجام می‌شود و نیاز به شماره شبا دارد.
              </p>
            </div>
          </ContentCard>

          <ContentCard title="هزینه ارسال مرجوعی" icon={<Truck className="h-4 w-4" />}>
            <p className="text-[11px] leading-6 text-ink-500">
              اگر کالا ایراد فنی داشته باشد، اشتباه ارسال شده باشد یا با توضیحات مغایرت
              داشته باشد، هزینه ارسال مرجوعی با سَروا است. در انصراف از خرید بدون ایراد،
              هزینه ارسال به عهده مشتری خواهد بود.
            </p>
          </ContentCard>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-brand-100 bg-brand-50/60 p-4">
        <div className="flex items-start gap-2.5">
          <BadgeCheck className="mt-0.5 h-5 w-5 shrink-0 text-brand-700" />
          <div>
            <p className="text-[12px] font-black text-brand-900">
              خرید شما با ضمانت سَروا همراه است
            </p>
            <p className="mt-0.5 text-[11px] leading-6 text-brand-800/80">
              اگر در فرآیند مرجوعی سؤالی داشتید، پشتیبانی همه‌روزه در کنار شماست.
            </p>
          </div>
        </div>
        <Button asChild size="sm">
          <Link href="/contact">تماس با پشتیبانی</Link>
        </Button>
      </div>
    </div>
  );
}
