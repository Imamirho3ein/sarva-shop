import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowLeft,
  Briefcase,
  Coffee,
  GraduationCap,
  HeartHandshake,
  Laptop,
  MapPin,
  Send,
  Sparkles,
  Users,
  Wallet,
} from "lucide-react";
import { PageHeader } from "@/components/content/page-header";
import { ContentCard, Steps } from "@/components/content/content-blocks";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SITE_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: "فرصت‌های شغلی",
  description:
    "فرصت‌های همکاری با تیم سَروا در حوزه‌های فناوری، محصول، پشتیبانی، لجستیک و بازاریابی. محیط کار انعطاف‌پذیر و رشد حرفه‌ای.",
};

const BENEFITS = [
  {
    icon: Laptop,
    title: "کار انعطاف‌پذیر",
    text: "ترکیب دورکاری و حضور در دفتر، با تمرکز بر نتیجه به‌جای ساعت کاری.",
  },
  {
    icon: GraduationCap,
    title: "بودجه یادگیری",
    text: "دوره، کتاب و کنفرانس تخصصی برای رشد مهارت‌های هر عضو تیم.",
  },
  {
    icon: Wallet,
    title: "حقوق و پاداش منصفانه",
    text: "بازبینی دوره‌ای حقوق، پاداش عملکرد و بیمه تکمیلی.",
  },
  {
    icon: Coffee,
    title: "فضای انسانی",
    text: "ناهار تیمی، فضای آرام و فرهنگ بازخورد سازنده و بدون حاشیه.",
  },
];

const ROLES = [
  {
    title: "توسعه‌دهنده ارشد فرانت‌اند",
    team: "فناوری",
    type: "تمام‌وقت",
    location: "تهران / دورکاری ترکیبی",
    desc: "تجربه ساخت رابط‌های فروشگاهی سریع با React و Next.js، توجه به جزئیات UI و دسترس‌پذیری.",
  },
  {
    title: "کارشناس محصول (دسته دیجیتال)",
    team: "محصول",
    type: "تمام‌وقت",
    location: "تهران",
    desc: "تحلیل بازار، انتخاب کالا و همکاری با تأمین‌کنندگان برای توسعه سبد محصولات دیجیتال.",
  },
  {
    title: "کارشناس پشتیبانی مشتریان",
    team: "پشتیبانی",
    type: "تمام‌وقت / شیفتی",
    location: "تهران",
    desc: "پاسخ‌گویی تلفنی و متنی به مشتریان، پیگیری سفارش‌ها و حل مسائل پس از فروش.",
  },
  {
    title: "کارشناس بازاریابی عملکردی",
    team: "بازاریابی",
    type: "تمام‌وقت",
    location: "تهران / دورکاری ترکیبی",
    desc: "مدیریت کمپین‌های دیجیتال، تحلیل داده و بهینه‌سازی نرخ تبدیل در کانال‌های آنلاین.",
  },
  {
    title: "سرپرست عملیات انبار",
    team: "لجستیک",
    type: "تمام‌وقت",
    location: "تهران",
    desc: "برنامه‌ریزی ورود و خروج کالا، کنترل موجودی و ارتقای بهره‌وری فرآیند بسته‌بندی.",
  },
];

export default function CareersPage() {
  return (
    <div className="container-site space-y-4 py-4 lg:py-6">
      <PageHeader
        eyebrow="به تیم ما بپیوندید"
        title="فرصت‌های شغلی"
        description={`اگر دوست دارید تجربه خرید آنلاین را برای میلیون‌ها نفر بهتر کنید، ${SITE_NAME} جای شماست. ما به دنبال آدم‌هایی هستیم که مسئولیت‌پذیر، کنجکاو و مشتری‌محور هستند.`}
        crumbs={[{ label: "فرصت‌های شغلی" }]}
        icon={<Briefcase className="h-6 w-6" />}
        meta={<Badge variant="brand">{ROLES.length} موقعیت باز</Badge>}
        actions={
          <Button asChild size="sm">
            <a href="mailto:jobs@sarva.shop">
              <Send className="h-3.5 w-3.5" />
              ارسال رزومه
            </a>
          </Button>
        }
      />

      <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
        <ContentCard
          title="موقعیت‌های باز"
          description="عنوان مناسب را انتخاب کنید و رزومه خود را با موضوع همان موقعیت ارسال کنید."
          icon={<Users className="h-4 w-4" />}
        >
          <ul className="space-y-2">
            {ROLES.map((role) => (
              <li
                key={role.title}
                className="rounded-xl border border-ink-100 p-3.5 transition-colors hover:border-brand-200 hover:bg-brand-50/30"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="text-[12px] font-black text-ink-900">{role.title}</h3>
                    <p className="mt-1 text-[11px] leading-6 text-ink-500">{role.desc}</p>
                  </div>
                  <Button asChild size="sm" variant="outline" className="shrink-0">
                    <a
                      href={`mailto:jobs@sarva.shop?subject=${encodeURIComponent(
                        `درخواست همکاری — ${role.title}`,
                      )}`}
                    >
                      ارسال رزومه
                    </a>
                  </Button>
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  <Badge variant="brand" size="xs">
                    {role.team}
                  </Badge>
                  <Badge variant="outline" size="xs">
                    {role.type}
                  </Badge>
                  <Badge variant="outline" size="xs">
                    <MapPin className="h-2.5 w-2.5" />
                    {role.location}
                  </Badge>
                </div>
              </li>
            ))}
          </ul>
        </ContentCard>

        <div className="space-y-4">
          <ContentCard title="مزایای همکاری" icon={<Sparkles className="h-4 w-4" />}>
            <ul className="space-y-3">
              {BENEFITS.map((benefit) => {
                const Icon = benefit.icon;
                return (
                  <li key={benefit.title} className="flex gap-2.5">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
                      <Icon className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="text-[11px] font-black text-ink-800">{benefit.title}</p>
                      <p className="mt-0.5 text-[10px] leading-5 text-ink-500">
                        {benefit.text}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </ContentCard>

          <ContentCard title="فرآیند استخدام" icon={<HeartHandshake className="h-4 w-4" />}>
            <Steps
              steps={[
                { title: "بررسی رزومه", description: "حداکثر ۵ روز کاری." },
                { title: "گفتگوی اولیه", description: "آشنایی و بررسی تجربه، به‌صورت آنلاین." },
                { title: "ارزیابی تخصصی", description: "یک تمرین کوتاه مرتبط با نقش." },
                { title: "پیشنهاد همکاری", description: "گفتگو درباره شرایط و شروع کار." },
              ]}
            />
          </ContentCard>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-ink-100 bg-white p-4 shadow-xs">
        <div>
          <p className="text-[12px] font-black text-ink-900">موقعیت مناسب پیدا نکردید؟</p>
          <p className="mt-0.5 text-[11px] leading-6 text-ink-500">
            رزومه خود را برای ما بفرستید؛ در صورت نیاز در آینده با شما تماس می‌گیریم.
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild size="sm" variant="outline">
            <a href="mailto:jobs@sarva.shop">jobs@sarva.shop</a>
          </Button>
          <Button asChild size="sm" variant="ghost">
            <Link href="/about">
              درباره سَروا
              <ArrowLeft className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
