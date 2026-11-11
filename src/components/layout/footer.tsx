import * as React from "react";
import Link from "next/link";
import {
  Send,
  Camera,
  MessageCircle,
  Play,
  Briefcase,
  Mail,
  Phone,
  MapPin,
  ShieldCheck,
  Truck,
  RefreshCcw,
  Headphones,
  Store,
  CreditCard,
  Wallet,
  BadgeCheck,
} from "lucide-react";
import { SITE_NAME, FOOTER_LINKS, TRUST_ITEMS } from "@/lib/constants";
import { NewsletterForm } from "@/components/content/newsletter-form";

const ICONS = { Send, Camera, MessageCircle, Play, Briefcase } as const;

const TRUST_ICONS = { Truck, ShieldCheck, RefreshCcw, Headphones } as const;

export function Footer() {
  return (
    <footer className="mt-14 border-t border-ink-100 bg-white">
      {/* نوار اعتماد */}
      <div className="border-b border-ink-100 bg-ink-50/60">
        <div className="container-site grid grid-cols-2 gap-3 py-5 lg:grid-cols-4">
          {TRUST_ITEMS.map((t) => {
            const Icon = TRUST_ICONS[t.icon as keyof typeof TRUST_ICONS];
            return (
              <div key={t.title} className="flex items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-brand-700 shadow-xs">
                  <Icon className="h-5 w-5" strokeWidth={2.2} />
                </span>
                <div className="min-w-0">
                  <p className="text-[13px] font-extrabold text-ink-900">{t.title}</p>
                  <p className="truncate text-[11px] font-medium text-ink-500">{t.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* لینک‌ها */}
      <div className="container-site grid grid-cols-2 gap-8 py-10 md:grid-cols-3 lg:grid-cols-6">
        <div className="col-span-2 lg:col-span-2">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-brand-600 to-brand-800 text-xl font-black text-white">
              س
            </span>
            <span className="flex flex-col leading-none">
              <span className="text-xl font-black text-ink-900">{SITE_NAME}</span>
              <span className="text-[11px] font-bold text-ink-400">فروشگاه اینترنتی سَروا</span>
            </span>
          </Link>

          <p className="mt-4 max-w-sm text-[13px] leading-7 text-ink-500">
            سَروا یک فروشگاه اینترنتی مدرن برای خرید آسان، سریع و مطمئن است؛ با ضمانت اصالت
            کالا، ارسال سریع و پشتیبانی همه‌روزه.
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            <BadgeItem icon={<ShieldCheck className="h-3.5 w-3.5" />} text="ضمانت اصالت" />
            <BadgeItem icon={<Truck className="h-3.5 w-3.5" />} text="ارسال سریع" />
            <BadgeItem icon={<RefreshCcw className="h-3.5 w-3.5" />} text="بازگشت ۷ روزه" />
          </div>

          {/* شبکه‌های اجتماعی */}
          <div className="mt-5 flex items-center gap-2">
            {SOCIAL_ITEMS.map((s) => {
              const Icon = ICONS[s.icon as keyof typeof ICONS];
              return (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-ink-200 text-ink-500 transition-all duration-200 hover:border-brand-400 hover:bg-brand-50 hover:text-brand-700"
                >
                  <Icon className="h-4 w-4" />
                </a>
              );
            })}
          </div>
        </div>

        {FOOTER_LINKS.map((col) => (
          <nav key={col.title}>
            <h3 className="mb-3.5 text-sm font-black text-ink-900">{col.title}</h3>
            <ul className="space-y-2.5">
              {col.links.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-[13px] font-medium text-ink-500 transition-colors hover:text-brand-700"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>

      {/* خبرنامه + تماس */}
      <div className="border-t border-ink-100">
        <div className="container-site grid gap-6 py-8 lg:grid-cols-2">
          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-black text-ink-900">خبرنامه سَروا</h3>
            <p className="text-[13px] text-ink-500">
              از تخفیف‌های ویژه و جدیدترین محصولات باخبر شوید.
            </p>
            <NewsletterForm />
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <ContactItem icon={<Phone className="h-4 w-4" />} title="تلفن" value="۰۲۱-۹۱۰۰۰۰۰۰" />
            <ContactItem icon={<Mail className="h-4 w-4" />} title="ایمیل" value="hi@sarva.shop" />
            <ContactItem icon={<MapPin className="h-4 w-4" />} title="آدرس" value="تهران، ایران" />
          </div>
        </div>
      </div>

      {/* کپی‌رایت */}
      <div className="border-t border-ink-100 bg-ink-50/60">
        <div className="container-site flex flex-col items-center justify-between gap-3 py-5 text-[12px] font-medium text-ink-500 sm:flex-row">
          <p>
            © {toFaYear()} {SITE_NAME}. تمامی حقوق محفوظ است.
          </p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <CreditCard className="h-4 w-4 text-ink-400" />
              درگاه پرداخت امن
            </span>
            <span className="flex items-center gap-1.5">
              <Wallet className="h-4 w-4 text-ink-400" />
              کیف پول سَروا
            </span>
            <span className="flex items-center gap-1.5">
              <Store className="h-4 w-4 text-ink-400" />
              ثبت‌شده در نظام صنفی
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}

const SOCIAL_ITEMS = [
  { href: "https://t.me", label: "تلگرام", icon: "Send" },
  { href: "https://instagram.com", label: "اینستاگرام", icon: "Camera" },
  { href: "https://twitter.com", label: "ایکس", icon: "MessageCircle" },
  { href: "https://youtube.com", label: "یوتیوب", icon: "Play" },
  { href: "https://linkedin.com", label: "لینکدین", icon: "Briefcase" },
];

function BadgeItem({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-lg bg-ink-100 px-2.5 py-1.5 text-[11px] font-bold text-ink-600">
      <span className="text-brand-700">{icon}</span>
      {text}
    </span>
  );
}

function ContactItem({
  icon,
  title,
  value,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-2.5 rounded-xl border border-ink-100 bg-white p-3">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
        {icon}
      </span>
      <span className="min-w-0">
        <span className="block text-[11px] font-bold text-ink-400">{title}</span>
        <span className="block truncate text-[13px] font-extrabold text-ink-800">{value}</span>
      </span>
    </div>
  );
}

function toFaYear(): string {
  const y = new Date().getFullYear();
  return String(y).replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[Number(d)]);
}
