export const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME ?? "سَروا";
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const NAV_LINKS = [
  { href: "/", label: "خانه" },
  { href: "/categories", label: "دسته‌بندی‌ها" },
  { href: "/products", label: "همه محصولات" },
  { href: "/special-offers", label: "پیشنهادهای ویژه" },
  { href: "/brands", label: "برندها" },
  { href: "/about", label: "درباره سَروا" },
  { href: "/contact", label: "تماس با ما" },
] as const;

export const FOOTER_LINKS: { title: string; links: { href: string; label: string }[] }[] = [
  {
    title: "خرید از سَروا",
    links: [
      { href: "/products", label: "همه محصولات" },
      { href: "/categories", label: "دسته‌بندی‌ها" },
      { href: "/special-offers", label: "پیشنهادهای شگفت‌انگیز" },
      { href: "/brands", label: "برندها" },
      { href: "/products?sort=newest", label: "جدیدترین محصولات" },
      { href: "/products?sort=bestselling", label: "پرفروش‌ترین‌ها" },
    ],
  },
  {
    title: "خدمات مشتریان",
    links: [
      { href: "/account/orders", label: "پیگیری سفارش" },
      { href: "/faq", label: "پرسش‌های متداول" },
      { href: "/shipping", label: "روش‌های ارسال" },
      { href: "/returns", label: "شرایط بازگشت کالا" },
      { href: "/contact", label: "تماس با ما" },
      { href: "/account/wallet", label: "کیف پول" },
    ],
  },
  {
    title: "شرایط و قوانین",
    links: [
      { href: "/terms", label: "قوانین و مقررات" },
      { href: "/privacy", label: "حریم خصوصی" },
      { href: "/disclaimer", label: "سلب مسئولیت" },
      { href: "/sitemap", label: "نقشه سایت" },
    ],
  },
  {
    title: "درباره سَروا",
    links: [
      { href: "/about", label: "درباره ما" },
      { href: "/careers", label: "فرصت‌های شغلی" },
      { href: "/partners", label: "فروشندگان و تأمین‌کنندگان" },
      { href: "/affiliate", label: "همکاری در فروش" },
    ],
  },
];

export const SOCIAL_LINKS = [
  { href: "https://t.me", label: "تلگرام", icon: "Send" },
  { href: "https://instagram.com", label: "اینستاگرام", icon: "Instagram" },
  { href: "https://twitter.com", label: "ایکس", icon: "Twitter" },
  { href: "https://youtube.com", label: "یوتیوب", icon: "Youtube" },
  { href: "https://linkedin.com", label: "لینکدین", icon: "Linkedin" },
] as const;

export const TRUST_ITEMS = [
  {
    icon: "Truck",
    title: "ارسال سریع",
    desc: "تحویل ۲۴ ساعته در تهران",
  },
  {
    icon: "ShieldCheck",
    title: "ضمانت اصالت",
    desc: "۱۸ ماه گارانتی معتبر",
  },
  {
    icon: "RefreshCcw",
    title: "بازگشت ۷ روزه",
    desc: "بدون پرسش، بازگشت کالا",
  },
  {
    icon: "Headphones",
    title: "پشتیبانی ۲۴/۷",
    desc: "همه‌روزه، حتی روزهای تعطیل",
  },
] as const;
