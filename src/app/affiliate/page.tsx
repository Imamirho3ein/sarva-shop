import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowLeft,
  BadgePercent,
  BarChart3,
  CircleCheck,
  Link2,
  Send,
  Share2,
  Wallet,
} from "lucide-react";
import { PageHeader } from "@/components/content/page-header";
import { ContentCard, StatGrid, Steps } from "@/components/content/content-blocks";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/format";
import { SITE_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: "همکاری در فروش",
  description:
    "برنامه همکاری در فروش سَروا: با معرفی محصولات به دوستان و مخاطبان خود، از هر خرید پورسانت دریافت کنید.",
};

const TIERS = [
  {
    name: "شروع",
    commission: "۳٪",
    requirement: "بدون سابقه فروش",
    perks: ["لینک اختصاصی", "داشبورد ساده", "تسویه ماهانه"],
  },
  {
    name: "حرفه‌ای",
    commission: "۵٪",
    requirement: "فروش ماهانه بالای ۲۰ میلیون تومان",
    perks: ["کد تخفیف اختصاصی", "گزارش تحلیلی", "اولویت پشتیبانی"],
    featured: true,
  },
  {
    name: "ویژه",
    commission: "تا ۸٪",
    requirement: "فروش ماهانه بالای ۱۰۰ میلیون تومان",
    perks: ["پورسانت پله‌ای", "کمپین اختصاصی", "مدیر حساب"],
  },
];

const RULES = [
  "پورسانت بر اساس مبلغ نهایی سفارش پس از تخفیف محاسبه می‌شود.",
  "سفارش‌های مرجوع‌شده یا لغوشده مشمول پورسانت نیستند.",
  "تسویه پس از پایان دوره مرجوعی (۷ روز) و به‌صورت ماهانه انجام می‌شود.",
  "استفاده از روش‌های تقلبی یا تبلیغات گمراه‌کننده موجب حذف از برنامه است.",
  "امکان انتشار کد تخفیف اختصاصی فقط با هماهنگی تیم بازاریابی وجود دارد.",
];

export default function AffiliatePage() {
  return (
    <div className="container-site space-y-4 py-4 lg:py-6">
      <PageHeader
        eyebrow="درآمد از معرفی"
        title="همکاری در فروش"
        description={`محصولات ${SITE_NAME} را به مخاطبان خود معرفی کنید و از هر خرید موفق، پورسانت بگیرید. مناسب تولیدکنندگان محتوا، بلاگرها و علاقه‌مندان به خرید هوشمند.`}
        crumbs={[{ label: "همکاری در فروش" }]}
        icon={<Share2 className="h-6 w-6" />}
        meta={<Badge variant="accent">پورسانت تا ۸٪</Badge>}
        actions={
          <Button asChild size="sm">
            <a href="mailto:affiliate@sarva.shop?subject=درخواست عضویت در برنامه همکاری در فروش">
              <Send className="h-3.5 w-3.5" />
              عضویت در برنامه
            </a>
          </Button>
        }
      />

      <StatGrid
        items={[
          { value: "۳٪ تا ۸٪", label: "پورسانت هر فروش" },
          { value: "۳۰ روزه", label: "اولین تسویه" },
          { value: "۷ روز", label: "دوره مرجوعی" },
          { value: "رایگان", label: "عضویت در برنامه" },
        ]}
      />

      <div className="grid gap-3 lg:grid-cols-3">
        {TIERS.map((tier) => (
          <div
            key={tier.name}
            className={
              tier.featured
                ? "relative overflow-hidden rounded-2xl border-2 border-brand-600 bg-white p-4 shadow-soft"
                : "relative rounded-2xl border border-ink-100 bg-white p-4 shadow-xs"
            }
          >
            {tier.featured && (
              <Badge variant="solid" size="xs" className="absolute left-3 top-3">
                پیشنهاد ویژه
              </Badge>
            )}
            <p className="text-[10px] font-black uppercase tracking-wide text-brand-700">
              سطح {tier.name}
            </p>
            <p className="mt-1 text-2xl font-black text-ink-900">{tier.commission}</p>
            <p className="mt-0.5 text-[10px] text-ink-400">پورسانت هر فروش</p>
            <p className="mt-2 rounded-lg bg-ink-50 px-2.5 py-1.5 text-[10px] leading-5 text-ink-500">
              شرط ارتقا: {tier.requirement}
            </p>
            <ul className="mt-3 space-y-1.5">
              {tier.perks.map((perk) => (
                <li key={perk} className="flex items-center gap-1.5 text-[11px] text-ink-600">
                  <CircleCheck className="h-3.5 w-3.5 shrink-0 text-success-600" />
                  {perk}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
        <ContentCard
          title="چطور کار می‌کند؟"
          description="در کمتر از ۱۰ دقیقه لینک اختصاصی خود را دریافت می‌کنید."
          icon={<Link2 className="h-4 w-4" />}
        >
          <Steps
            steps={[
              {
                title: "ثبت درخواست",
                description:
                  "ایمیل خود را با معرفی کانال یا صفحه‌تان (اینستاگرام، یوتیوب، وبلاگ و…) ارسال کنید.",
              },
              {
                title: "دریافت لینک اختصاصی",
                description:
                  "پس از تأیید، لینک رهگیری و کد تخفیف اختصاصی شما در پنل همکاری فعال می‌شود.",
              },
              {
                title: "معرفی محصولات",
                description:
                  "محصولات موردعلاقه مخاطبانتان را با لینک خود معرفی کنید. هر خرید از طریق لینک شما ثبت می‌شود.",
              },
              {
                title: "دریافت پورسانت",
                description:
                  "گزارش فروش و پورسانت در داشبورد قابل مشاهده است و تسویه ماهانه انجام می‌شود.",
              },
            ]}
          />
        </ContentCard>

        <div className="space-y-4">
          <ContentCard title="قوانین پورسانت" icon={<BadgePercent className="h-4 w-4" />}>
            <ul className="space-y-2">
              {RULES.map((rule) => (
                <li key={rule} className="flex gap-2 text-[11px] leading-6 text-ink-600">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" />
                  {rule}
                </li>
              ))}
            </ul>
          </ContentCard>

          <ContentCard title="مثال محاسبه" icon={<Wallet className="h-4 w-4" />}>
            <div className="space-y-1.5 text-[11px]">
              <div className="flex justify-between rounded-lg bg-ink-50 px-3 py-2">
                <span className="text-ink-500">مبلغ سفارش</span>
                <span className="font-black text-ink-800">{formatPrice(2_500_000)}</span>
              </div>
              <div className="flex justify-between rounded-lg bg-ink-50 px-3 py-2">
                <span className="text-ink-500">پورسانت ۵٪</span>
                <span className="font-black text-success-600">{formatPrice(125_000)}</span>
              </div>
              <div className="flex justify-between rounded-lg bg-brand-50 px-3 py-2">
                <span className="text-brand-800">درآمد شما</span>
                <span className="font-black text-brand-900">{formatPrice(125_000)}</span>
              </div>
            </div>
            <p className="mt-2 text-[10px] leading-5 text-ink-400">
              مبلغ نهایی بر اساس سبد خرید پس از اعمال تخفیف محاسبه می‌شود.
            </p>
          </ContentCard>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {[
          {
            icon: Share2,
            title: "چه کسانی می‌توانند عضو شوند؟",
            text: "تولیدکنندگان محتوا، ادمین صفحات اجتماعی، وبلاگ‌نویس‌ها و هر فرد دارای مخاطب واقعی.",
          },
          {
            icon: BarChart3,
            title: "چه گزارش‌هایی می‌بینم؟",
            text: "کلیک، سفارش، نرخ تبدیل و پورسانت به تفکیک لینک و بازه زمانی.",
          },
          {
            icon: Wallet,
            title: "تسویه چگونه است؟",
            text: "پس از پایان دوره مرجوعی، مبلغ به کیف پول یا حساب بانکی واریز می‌شود.",
          },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <ContentCard key={item.title} title={item.title} icon={<Icon className="h-4 w-4" />}>
              <p className="text-[11px] leading-6 text-ink-500">{item.text}</p>
            </ContentCard>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-gradient-to-l from-brand-800 to-brand-600 p-4 text-white">
        <div>
          <p className="text-[13px] font-black">آماده شروع هستید؟</p>
          <p className="mt-0.5 text-[11px] leading-6 text-white/80">
            درخواست خود را ارسال کنید؛ تیم بازاریابی در ۳ روز کاری پاسخ می‌دهد.
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild size="sm" className="bg-white text-brand-800 hover:bg-brand-50">
            <a href="mailto:affiliate@sarva.shop">affiliate@sarva.shop</a>
          </Button>
          <Button
            asChild
            size="sm"
            variant="ghost"
            className="text-white hover:bg-white/10 hover:text-white"
          >
            <Link href="/contact">
              فرم تماس
              <ArrowLeft className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
