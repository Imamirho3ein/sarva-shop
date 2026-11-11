import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, HelpCircle, LifeBuoy, MessageCircleQuestion } from "lucide-react";
import { PageHeader } from "@/components/content/page-header";
import { FaqAccordion, type FaqGroup } from "@/components/content/faq-accordion";
import { ContentCard } from "@/components/content/content-blocks";
import { Button } from "@/components/ui/button";
import { SITE_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: "پرسش‌های متداول",
  description:
    "پاسخ پرسش‌های پرتکرار درباره خرید، پرداخت، ارسال، مرجوعی، کیف پول و حساب کاربری در فروشگاه سَروا.",
};

const GROUPS: FaqGroup[] = [
  {
    title: "خرید و ثبت سفارش",
    items: [
      {
        question: "برای خرید در سَروا باید ثبت‌نام کنم؟",
        answer:
          "برای ثبت سفارش، وارد حساب کاربری شوید یا در چند ثانیه ثبت‌نام کنید. ثبت‌نام به ما کمک می‌کند سفارش‌ها، آدرس‌ها و کیف پول شما را به‌صورت امن نگه داریم و پیگیری سفارش ساده‌تر شود.",
      },
      {
        question: "چطور از موجود بودن کالا مطمئن شوم؟",
        answer:
          "در صفحه هر محصول، وضعیت موجودی به‌صورت لحظه‌ای نمایش داده می‌شود. اگر کالا ناموجود باشد، می‌توانید از دکمه «اطلاع از موجودی» استفاده کنید تا پس از شارژ موجودی به شما خبر بدهیم.",
      },
      {
        question: "می‌توانم سفارش خود را ویرایش یا لغو کنم؟",
        answer:
          "تا زمانی که سفارش وارد مرحله «در حال پردازش» نشده باشد، می‌توانید از پنل کاربری و صفحه جزئیات سفارش آن را لغو کنید. پس از پردازش، برای لغو با پشتیبانی تماس بگیرید.",
      },
      {
        question: "سفارش بدون ثبت‌نام (مهمان) امکان‌پذیر است؟",
        answer:
          "در نسخه فعلی، برای حفظ امنیت پرداخت و پیگیری سفارش، ثبت‌نام یا ورود لازم است. فرآیند ثبت‌نام کمتر از یک دقیقه زمان می‌برد.",
      },
    ],
  },
  {
    title: "پرداخت و کیف پول",
    items: [
      {
        question: "چه روش‌های پرداختی پشتیبانی می‌شود؟",
        answer:
          "پرداخت آنلاین از طریق درگاه امن بانکی، پرداخت با کیف پول سَروا و پرداخت در محل (برای سفارش‌های واجد شرایط) امکان‌پذیر است. در مرحله پرداخت، روش‌های فعال برای سفارش شما نمایش داده می‌شود.",
      },
      {
        question: "کیف پول سَروا چیست و چطور شارژ می‌شود؟",
        answer:
          "کیف پول، اعتبار داخلی حساب شماست که برای خریدهای بعدی یا دریافت وجه مرجوعی استفاده می‌شود. شارژ کیف پول از بخش «کیف پول» در پنل کاربری و از طریق درگاه پرداخت انجام می‌شود.",
      },
      {
        question: "اگر پرداخت انجام شود ولی سفارش ثبت نشود چه کنم؟",
        answer:
          "در صورت کسر وجه، مبلغ حداکثر تا ۷۲ ساعت کاری توسط بانک به حساب شما بازمی‌گردد. اگر پس از این مدت مبلغ برنگشت، شماره پیگیری پرداخت را برای پشتیبانی ارسال کنید تا بررسی شود.",
      },
      {
        question: "کد تخفیف را کجا وارد کنم؟",
        answer:
          "در صفحه سبد خرید، بخش «کد تخفیف» را باز کنید و کد را وارد کنید. اعتبار کد بلافاصله محاسبه و از مبلغ نهایی کم می‌شود.",
      },
    ],
  },
  {
    title: "ارسال و تحویل",
    items: [
      {
        question: "هزینه ارسال چقدر است؟",
        answer:
          "هزینه ارسال به روش انتخابی و مبلغ سبد خرید بستگی دارد. برای سفارش‌های بالای ۵ میلیون تومان، ارسال با پست پیشتاز و پیک رایگان است. جزئیات در صفحه «روش‌های ارسال» آمده است.",
      },
      {
        question: "چه زمانی سفارش را دریافت می‌کنم؟",
        answer:
          "تهران: پیک اختصاصی ۱ تا ۲ روز کاری و ارسال فوری در همان روز برای سفارش‌های قبل از ساعت ۱۵. شهرستان‌ها: ۲ تا ۴ روز کاری با پست پیشتاز. زمان دقیق پس از ثبت سفارش نمایش داده می‌شود.",
      },
      {
        question: "چطور سفارشم را پیگیری کنم؟",
        answer:
          "از پنل کاربری، بخش «سفارش‌های من» را باز کنید. وضعیت هر سفارش و کد رهگیری مرسوله (در صورت ارسال) در همان صفحه قابل مشاهده است.",
      },
      {
        question: "امکان تحویل حضوری وجود دارد؟",
        answer:
          "بله. با انتخاب روش «تحویل حضوری»، سفارش در مرکز پردازش سَروا آماده می‌شود و پس از دریافت پیام آماده‌سازی، می‌توانید با کد سفارش مراجعه کنید.",
      },
    ],
  },
  {
    title: "بازگشت کالا و گارانتی",
    items: [
      {
        question: "شرایط بازگشت کالا چیست؟",
        answer:
          "تا ۷ روز پس از تحویل، در صورت باز نشدن بسته‌بندی اصلی یا وجود ایراد فنی، می‌توانید درخواست بازگشت ثبت کنید. کالا باید همراه با همه متعلقات و بسته‌بندی ارسال شود.",
      },
      {
        question: "هزینه ارسال مرجوعی با کیست؟",
        answer:
          "اگر کالا ایراد فنی داشته باشد یا اشتباه ارسال شده باشد، هزینه بازگشت با سَروا است. در انصراف بدون ایراد، هزینه ارسال مرجوعی بر عهده مشتری خواهد بود.",
      },
      {
        question: "گارانتی کالاها چگونه است؟",
        answer:
          "مدت و نوع گارانتی هر کالا در بخش مشخصات محصول ذکر شده است. برای استفاده از گارانتی، کارت گارانتی یا فاکتور خرید را نگه دارید.",
      },
    ],
  },
  {
    title: "حساب کاربری و امنیت",
    items: [
      {
        question: "رمز عبورم را فراموش کرده‌ام، چه کنم؟",
        answer:
          "در صفحه ورود، گزینه «فراموشی رمز عبور» را انتخاب کنید. لینک بازیابی به ایمیل ثبت‌شده ارسال می‌شود. اگر به ایمیل دسترسی ندارید، با پشتیبانی تماس بگیرید.",
      },
      {
        question: "اطلاعات من چقدر امن است؟",
        answer:
          "رمز عبور به‌صورت هش‌شده ذخیره می‌شود و اطلاعات پرداخت روی سرورهای ما نگهداری نمی‌شود. جزئیات کامل در صفحه «حریم خصوصی» آمده است.",
      },
      {
        question: "چطور حساب کاربری‌ام را حذف کنم؟",
        answer:
          "از بخش «اطلاعات حساب» در پنل کاربری یا از طریق فرم تماس، درخواست حذف حساب را ثبت کنید. پس از بررسی سفارش‌های باز، حساب و داده‌های مرتبط حذف می‌شوند.",
      },
    ],
  },
];

export default function FaqPage() {
  return (
    <div className="container-site space-y-4 py-4 lg:py-6">
      <PageHeader
        eyebrow="راهنما"
        title="پرسش‌های متداول"
        description={`پاسخ سریع پرتکرارترین پرسش‌ها درباره خرید از ${SITE_NAME}. اگر پاسخ خود را پیدا نکردید، تیم پشتیبانی آماده کمک است.`}
        crumbs={[{ label: "پرسش‌های متداول" }]}
        icon={<HelpCircle className="h-6 w-6" />}
        actions={
          <Button asChild size="sm" variant="outline">
            <Link href="/contact">
              <MessageCircleQuestion className="h-3.5 w-3.5" />
              پرسش من اینجا نیست
            </Link>
          </Button>
        }
      />

      <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
        <FaqAccordion groups={GROUPS} />

        <aside className="space-y-3 lg:sticky lg:top-24 lg:self-start">
          <ContentCard title="کمک فوری" icon={<LifeBuoy className="h-4 w-4" />}>
            <p className="text-[11px] leading-6 text-ink-500">
              کارشناسان سَروا همه‌روزه از ۸ صبح تا ۱۰ شب پاسخ می‌دهند.
            </p>
            <div className="mt-3 space-y-1.5">
              <Button asChild size="sm" className="w-full">
                <Link href="/contact">
                  فرم تماس با ما
                  <ArrowLeft className="h-3.5 w-3.5" />
                </Link>
              </Button>
              <Button asChild size="sm" variant="outline" className="w-full">
                <Link href="/account/orders">پیگیری سفارش</Link>
              </Button>
            </div>
            <div className="mt-3 rounded-xl bg-ink-50 p-3">
              <p className="text-[10px] font-bold text-ink-400">تلفن پشتیبانی</p>
              <a
                href="tel:+982191000000"
                dir="ltr"
                className="mt-0.5 block text-right text-[13px] font-black text-ink-800 hover:text-brand-700"
              >
                ۰۲۱-۹۱۰۰۰۰۰۰
              </a>
            </div>
          </ContentCard>

          <ContentCard title="صفحات مرتبط">
            <ul className="space-y-1.5 text-[11px]">
              {[
                { href: "/shipping", label: "روش‌های ارسال و هزینه‌ها" },
                { href: "/returns", label: "شرایط بازگشت کالا" },
                { href: "/terms", label: "قوانین و مقررات" },
                { href: "/privacy", label: "حریم خصوصی" },
                { href: "/account/wallet", label: "راهنمای کیف پول" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="flex items-center justify-between gap-2 rounded-lg px-2 py-1.5 font-medium text-ink-600 hover:bg-ink-50 hover:text-brand-700"
                  >
                    {link.label}
                    <ArrowLeft className="h-3 w-3 shrink-0 text-ink-300" />
                  </Link>
                </li>
              ))}
            </ul>
          </ContentCard>
        </aside>
      </div>
    </div>
  );
}
