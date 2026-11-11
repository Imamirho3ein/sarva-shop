import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowLeft,
  Clock,
  Headphones,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Send,
} from "lucide-react";
import { PageHeader } from "@/components/content/page-header";
import { ContentCard } from "@/components/content/content-blocks";
import { ContactForm } from "@/components/content/contact-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: `تماس با ما`,
  description:
    "راه‌های ارتباط با فروشگاه سَروا: تلفن پشتیبانی، ایمیل، فرم تماس و آدرس دفتر. پاسخ‌گویی همه‌روزه از ۸ صبح تا ۱۰ شب.",
};

const CHANNELS = [
  {
    icon: Phone,
    title: "تلفن پشتیبانی",
    value: "۰۲۱-۹۱۰۰۰۰۰۰",
    href: "tel:+982191000000",
    text: "همه‌روزه، حتی تعطیلات — ۸ صبح تا ۱۰ شب",
  },
  {
    icon: Mail,
    title: "ایمیل",
    value: "hi@sarva.shop",
    href: "mailto:hi@sarva.shop",
    text: "پاسخ حداکثر تا ۲۴ ساعت کاری",
  },
  {
    icon: MessageCircle,
    title: "چت آنلاین",
    value: "در پنل کاربری",
    href: "/account",
    text: "گفتگو با کارشناس در ساعات کاری",
  },
  {
    icon: MapPin,
    title: "دفتر مرکزی",
    value: "تهران، ایران",
    href: "/contact",
    text: "شنبه تا چهارشنبه، با هماهنگی قبلی",
  },
];

const TOPICS = [
  {
    title: "پیگیری سفارش",
    text: "وضعیت سفارش، مرجوعی یا تأخیر ارسال را از پنل کاربری و صفحه سفارش‌ها ببینید.",
    href: "/account/orders",
    action: "سفارش‌های من",
  },
  {
    title: "سؤال درباره محصول",
    text: "در صفحه هر محصول، بخش پرسش و پاسخ بهترین جای مطرح کردن سؤال فنی است.",
    href: "/faq",
    action: "پرسش‌های متداول",
  },
  {
    title: "همکاری و فروشندگی",
    text: "اگر برند یا تأمین‌کننده هستید، از مسیر همکاری با ما درخواست ثبت کنید.",
    href: "/partners",
    action: "شرایط همکاری",
  },
];

export default function ContactPage() {
  return (
    <div className="container-site space-y-4 py-4 lg:py-6">
      <PageHeader
        eyebrow="پشتیبانی"
        title="تماس با ما"
        description="هر پرسش، پیشنهاد یا انتقادی دارید؟ ما واقعاً پاسخ می‌دهیم. سریع‌ترین راه، فرم همین صفحه است؛ اگر عجله دارید، تلفن پشتیبانی در دسترس است."
        crumbs={[{ label: "تماس با ما" }]}
        icon={<Headphones className="h-6 w-6" />}
        meta={<Badge variant="success">میانگین پاسخ‌گویی: زیر ۲ ساعت</Badge>}
      />

      <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
        <ContentCard
          title="فرم تماس"
          description="اطلاعات را کامل بنویسید تا سریع‌تر و دقیق‌تر پاسخ بگیرید."
          icon={<Send className="h-4 w-4" />}
        >
          <ContactForm />
        </ContentCard>

        <div className="space-y-4">
          <ContentCard title="راه‌های ارتباطی" icon={<Phone className="h-4 w-4" />}>
            <ul className="space-y-2.5">
              {CHANNELS.map((channel) => {
                const Icon = channel.icon;
                return (
                  <li key={channel.title}>
                    <Link
                      href={channel.href}
                      className="group flex items-start gap-2.5 rounded-xl border border-ink-100 p-3 transition-colors hover:border-brand-200 hover:bg-brand-50/40"
                    >
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-700 group-hover:bg-white">
                        <Icon className="h-4 w-4" />
                      </span>
                      <span className="min-w-0">
                        <span className="block text-[10px] font-bold text-ink-400">
                          {channel.title}
                        </span>
                        <span
                          dir={channel.title === "ایمیل" || channel.title === "تلفن پشتیبانی" ? "ltr" : undefined}
                          className="mt-0.5 block truncate text-right text-[12px] font-black text-ink-800"
                        >
                          {channel.value}
                        </span>
                        <span className="mt-0.5 block text-[10px] leading-5 text-ink-500">
                          {channel.text}
                        </span>
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </ContentCard>

          <ContentCard title="ساعات پاسخ‌گویی" icon={<Clock className="h-4 w-4" />}>
            <dl className="space-y-2 text-[11px]">
              <div className="flex items-center justify-between gap-2 rounded-lg bg-ink-50 px-3 py-2">
                <dt className="text-ink-500">شنبه تا چهارشنبه</dt>
                <dd className="font-black text-ink-800">۸:۰۰ تا ۲۲:۰۰</dd>
              </div>
              <div className="flex items-center justify-between gap-2 rounded-lg bg-ink-50 px-3 py-2">
                <dt className="text-ink-500">پنجشنبه</dt>
                <dd className="font-black text-ink-800">۹:۰۰ تا ۱۸:۰۰</dd>
              </div>
              <div className="flex items-center justify-between gap-2 rounded-lg bg-ink-50 px-3 py-2">
                <dt className="text-ink-500">جمعه و تعطیلات</dt>
                <dd className="font-black text-ink-800">پاسخ به تیکت و چت</dd>
              </div>
            </dl>
            <p className="mt-2.5 text-[10px] leading-5 text-ink-400">
              پیام‌های ثبت‌شده خارج از ساعات کاری، در اولین فرصت روز کاری بعد پاسخ داده
              می‌شوند.
            </p>
          </ContentCard>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {TOPICS.map((topic) => (
          <ContentCard key={topic.title} title={topic.title}>
            <p className="text-[11px] leading-6 text-ink-500">{topic.text}</p>
            <Button asChild size="sm" variant="outline" className="mt-3">
              <Link href={topic.href}>
                {topic.action}
                <ArrowLeft className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </ContentCard>
        ))}
      </div>
    </div>
  );
}
