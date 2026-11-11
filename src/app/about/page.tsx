import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowLeft,
  BadgeCheck,
  HeartHandshake,
  Leaf,
  MapPin,
  Package,
  ShieldCheck,
  Sparkles,
  Store,
  Target,
  Truck,
  Users,
} from "lucide-react";
import { PageHeader } from "@/components/content/page-header";
import {
  ContentCard,
  StatGrid,
  Steps,
} from "@/components/content/content-blocks";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SITE_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: `درباره ما`,
  description:
    "داستان سَروا، ارزش‌ها و مسیر رشد یک فروشگاه اینترنتی مدرن؛ از یک ایده ساده تا تجربه خرید آنلاین مطمئن برای هزاران مشتری.",
};

const VALUES = [
  {
    icon: ShieldCheck,
    title: "اصالت کالا، بدون استثنا",
    text: "همه کالاها از تأمین‌کنندگان رسمی و با ضمانت اصالت عرضه می‌شوند؛ اگر کالایی مطابق توضیحات نبود، بازگشت آن رایگان است.",
  },
  {
    icon: Truck,
    title: "سرعت، بخشی از تجربه است",
    text: "انبار مرکزی و شبکه پیک اختصاصی، سفارش‌های تهران را در همان روز و شهرهای بزرگ را در ۲۴ تا ۴۸ ساعت تحویل می‌دهد.",
  },
  {
    icon: HeartHandshake,
    title: "پشتیبانی انسانی",
    text: "پشتیبانی سَروا فقط یک ربات پاسخ‌گو نیست؛ کارشناسان واقعی، همه‌روزه از ۸ صبح تا ۱۰ شب در کنار شما هستند.",
  },
  {
    icon: Leaf,
    title: "بسته‌بندی مسئولانه",
    text: "با کاهش مصرف پلاستیک و استفاده از بسته‌بندی قابل بازیافت، تلاش می‌کنیم اثر محیط‌زیستی خرید آنلاین را کم کنیم.",
  },
];

const MILESTONES = [
  {
    title: "۱۳۹۸ — شروع با یک ایده",
    description:
      "سَروا با تمرکز بر یک دسته‌بندی محدود و چند برند منتخب کار خود را آغاز کرد؛ هدف ساده بود: خرید آنلاین باید مطمئن و بدون استرس باشد.",
  },
  {
    title: "۱۴۰۰ — انبار و پیک اختصاصی",
    description:
      "با رشد سفارش‌ها، انبار مرکزی و شبکه پیک اختصاصی راه‌اندازی شد تا کنترل کیفیت و زمان تحویل در دست خودمان باشد.",
  },
  {
    title: "۱۴۰۲ — پلتفرم چندفروشندگی",
    description:
      "زیرساخت فنی سَروا برای پذیرش فروشندگان همکار بازطراحی شد؛ از این سال، برندهای بیشتری می‌توانند محصولاتشان را عرضه کنند.",
  },
  {
    title: "امروز — تجربه‌ای یکپارچه",
    description:
      "از جستجوی هوشمند و مقایسه محصول تا کیف پول، پیگیری لحظه‌ای سفارش و بازگشت کالا، همه در یک تجربه ساده و سریع جمع شده‌اند.",
  },
];

export default function AboutPage() {
  return (
    <div className="container-site space-y-4 py-4 lg:py-6">
      <PageHeader
        eyebrow="داستان ما"
        title={`درباره ${SITE_NAME}`}
        description="سَروا یک فروشگاه اینترنتی ایرانی است که با تکیه بر فناوری، لجستیک و پشتیبانی انسانی، خرید آنلاین را ساده‌تر، سریع‌تر و مطمئن‌تر می‌کند."
        crumbs={[{ label: "درباره سَروا" }]}
        icon={<Store className="h-6 w-6" />}
        meta={<Badge variant="brand">از ۱۳۹۸ در کنار شما</Badge>}
        actions={
          <Button asChild size="sm" variant="outline">
            <Link href="/products">
              مشاهده محصولات
              <ArrowLeft className="h-3.5 w-3.5" />
            </Link>
          </Button>
        }
      />

      <StatGrid
        items={[
          { value: "۱۳۹۸", label: "سال آغاز فعالیت" },
          { value: "+۴۰۰", label: "برند و تأمین‌کننده" },
          { value: "+۱۲۰هزار", label: "مشتری وفادار" },
          { value: "۳۱", label: "استان تحت پوشش" },
        ]}
      />

      <div className="grid gap-4 lg:grid-cols-[1.6fr_1fr]">
        <ContentCard
          title="چرا سَروا؟"
          description="ما فروشگاه را از دریچه تجربه مشتری طراحی می‌کنیم، نه فقط از دریچه فهرست محصولات."
          icon={<Sparkles className="h-4 w-4" />}
        >
          <div className="space-y-3 text-[13px] leading-8 text-ink-600">
            <p>
              خرید آنلاین در ایران گاهی پر از ابهام است: قیمت‌های متناقض، توضیحات ناقص،
              ارسال دیرتر از موعد و پاسخی که هیچ‌وقت نمی‌آید. سَروا با یک باور ساده شروع
              شد: <strong className="font-black text-ink-800">اگر اطلاعات شفاف باشد و
              پشتیبانی واقعی، خرید آنلاین می‌تواند لذت‌بخش‌ترین راه خرید باشد.</strong>
            </p>
            <p>
              به همین دلیل، روی سه چیز سرمایه‌گذاری کرده‌ایم: اطلاعات دقیق محصول (مشخصات،
              نظرات واقعی خریداران و پرسش و پاسخ)، لجستیک قابل پیگیری، و تیمی که پیش از
              فروش و بعد از فروش پاسخ می‌دهد. تیم محصول ما هر هفته بازخورد مشتریان را
              بررسی می‌کند و همین بازخوردها مسیر توسعه سَروا را تعیین می‌کنند.
            </p>
            <p>
              امروز سَروا میزبان صدها برند در دسته‌بندی‌های کالای دیجیتال، مد و پوشاک،
              خانه و آشپزخانه، زیبایی و سلامت و لوازم ورزشی است؛ اما معیار موفقیت ما تعداد
              محصولات نیست، تعداد مشتریانی است که با خیال راحت برمی‌گردند.
            </p>
          </div>

          <div className="mt-4 grid gap-2 sm:grid-cols-3">
            {[
              { icon: Package, title: "انبار مرکزی", text: "کنترل کیفیت پیش از ارسال" },
              { icon: MapPin, title: "پوشش سراسری", text: "ارسال به ۳۱ استان" },
              { icon: BadgeCheck, title: "ضمانت اصالت", text: "گارانتی معتبر کالا" },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="rounded-xl border border-ink-100 bg-ink-50/50 p-3"
                >
                  <Icon className="h-4 w-4 text-brand-700" />
                  <p className="mt-1.5 text-[11px] font-black text-ink-800">{item.title}</p>
                  <p className="mt-0.5 text-[10px] leading-5 text-ink-500">{item.text}</p>
                </div>
              );
            })}
          </div>
        </ContentCard>

        <ContentCard title="ارزش‌های ما" icon={<Target className="h-4 w-4" />}>
          <ul className="space-y-3">
            {VALUES.map((value) => {
              const Icon = value.icon;
              return (
                <li key={value.title} className="flex gap-2.5">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
                    <Icon className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-[12px] font-black text-ink-800">{value.title}</p>
                    <p className="mt-0.5 text-[11px] leading-6 text-ink-500">{value.text}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        </ContentCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <ContentCard title="مسیر رشد سَروا" icon={<Users className="h-4 w-4" />}>
          <Steps steps={MILESTONES} />
        </ContentCard>

        <div className="space-y-4">
          <ContentCard
            title="تیم سَروا"
            description="ما یک تیم چندتخصصی هستیم که برای یک تجربه خرید بهتر کار می‌کنیم."
            icon={<Users className="h-4 w-4" />}
          >
            <div className="grid gap-2 sm:grid-cols-2">
              {[
                { title: "تیم محصول و فناوری", text: "ساخت تجربه خرید، جستجو و پرداخت" },
                { title: "تیم تأمین و انبار", text: "انتخاب کالا و کنترل کیفیت" },
                { title: "تیم لجستیک", text: "بسته‌بندی و تحویل سریع سفارش‌ها" },
                { title: "تیم پشتیبانی", text: "پاسخ به مشتریان، پیش و پس از خرید" },
              ].map((team) => (
                <div key={team.title} className="rounded-xl border border-ink-100 p-3">
                  <p className="text-[11px] font-black text-ink-800">{team.title}</p>
                  <p className="mt-0.5 text-[10px] leading-5 text-ink-500">{team.text}</p>
                </div>
              ))}
            </div>
          </ContentCard>

          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-l from-brand-800 to-brand-600 p-5 text-white shadow-soft">
            <div
              aria-hidden
              className="absolute -left-10 -top-10 h-36 w-36 rounded-full bg-white/10"
            />
            <h2 className="relative text-base font-black">دوست دارید بخشی از سَروا باشید؟</h2>
            <p className="relative mt-1.5 max-w-md text-[12px] leading-6 text-white/80">
              ما همیشه به دنبال آدم‌هایی هستیم که برای بهتر شدن تجربه خرید مشتری فکر
              می‌کنند. فرصت‌های شغلی و همکاری را ببینید.
            </p>
            <div className="relative mt-3 flex flex-wrap gap-2">
              <Button asChild size="sm" className="bg-white text-brand-800 hover:bg-brand-50">
                <Link href="/careers">فرصت‌های شغلی</Link>
              </Button>
              <Button
                asChild
                size="sm"
                variant="ghost"
                className="text-white hover:bg-white/10 hover:text-white"
              >
                <Link href="/contact">تماس با ما</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
