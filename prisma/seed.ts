/**
 * seed داده‌های نمونه فروشگاه سَروا
 * اجرا: npm run db:seed
 */
import "dotenv/config";
import { PrismaClient, type Prisma } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import {
  makeProductSvg,
  makeBannerSvg,
  makeBrandSvg,
  makeCategorySvg,
  writeImage,
} from "../src/lib/seed/images";

const prisma = new PrismaClient({
  adapter: new PrismaPg({
    connectionString:
      process.env.DATABASE_URL ??
      "postgresql://sarva:sarva_secret@localhost:5432/sarva_shop?schema=public",
  }),
});

const DAY = 24 * 60 * 60 * 1000;
const now = Date.now();

// ------------------------- دسته‌بندی‌ها -------------------------

const CATEGORIES: {
  name: string;
  slug: string;
  icon: string;
  family: string;
  popular?: boolean;
  desc: string;
  children: { name: string; slug: string }[];
}[] = [
  {
    name: "کالای دیجیتال",
    slug: "digital",
    icon: "Smartphone",
    family: "digital",
    popular: true,
    desc: "موبایل، لپ‌تاپ، تبلت، هدفون و لوازم جانبی دیجیتال با ضمانت اصالت کالا",
    children: [
      { name: "موبایل و تبلت", slug: "mobile-tablet" },
      { name: "لپ‌تاپ و کامپیوتر", slug: "laptop-computer" },
      { name: "هدفون و اسپیکر", slug: "headphone-speaker" },
      { name: "ساعت هوشمند", slug: "smartwatch" },
      { name: "دوربین و عکاسی", slug: "camera" },
    ],
  },
  {
    name: "خانه و آشپزخانه",
    slug: "home-kitchen",
    icon: "Home",
    family: "home",
    popular: true,
    desc: "لوازم آشپزخانه، ظروف، دکوراسیون و لوازم خانگی برای خانه‌ای زیباتر",
    children: [
      { name: "لوازم آشپزخانه", slug: "kitchen-appliances" },
      { name: "ظروف و سرویس", slug: "tableware" },
      { name: "دکوراسیون خانه", slug: "home-decor" },
    ],
  },
  {
    name: "مد و پوشاک",
    slug: "fashion",
    icon: "Shirt",
    family: "fashion",
    popular: true,
    desc: "پوشاک مردانه و زنانه، کفش، کیف و اکسسوری از برندهای معتبر",
    children: [
      { name: "پوشاک مردانه", slug: "mens-wear" },
      { name: "پوشاک زنانه", slug: "womens-wear" },
      { name: "کفش", slug: "shoes" },
      { name: "کیف و اکسسوری", slug: "bags" },
    ],
  },
  {
    name: "زیبایی و سلامت",
    slug: "beauty",
    icon: "Sparkles",
    family: "beauty",
    popular: true,
    desc: "مراقبت پوست و مو، عطر، محصولات آرایشی و مکمل‌های سلامت",
    children: [
      { name: "مراقبت از پوست", slug: "skincare" },
      { name: "عطر و ادکلن", slug: "perfume" },
      { name: "آرایشی", slug: "makeup" },
    ],
  },
  {
    name: "ورزش و سفر",
    slug: "sport-travel",
    icon: "Dumbbell",
    family: "sport",
    popular: true,
    desc: "تجهیزات ورزشی، کوهنوردی و سفر برای سبک زندگی فعال",
    children: [
      { name: "تجهیزات ورزشی", slug: "fitness" },
      { name: "کوهنوردی و کمپینگ", slug: "camping" },
    ],
  },
  {
    name: "کتاب و لوازم‌التحریر",
    slug: "books",
    icon: "BookOpen",
    family: "books",
    desc: "کتاب، نوشت‌افزار و لوازم اداری برای علاقه‌مندان به دانستن",
    children: [
      { name: "کتاب", slug: "book" },
      { name: "نوشت‌افزار", slug: "stationery" },
    ],
  },
  {
    name: "سوپرمارکت",
    slug: "grocery",
    icon: "ShoppingBasket",
    family: "grocery",
    desc: "مواد غذایی، نوشیدنی و اقلام روزمره با ارسال سریع",
    children: [
      { name: "مواد غذایی", slug: "food" },
      { name: "نوشیدنی", slug: "drinks" },
    ],
  },
  {
    name: "اسباب‌بازی و کودک",
    slug: "toys",
    icon: "Baby",
    family: "toys",
    desc: "اسباب‌بازی، لوازم سیسمونی و بازی‌های فکری برای کودکان",
    children: [
      { name: "اسباب‌بازی", slug: "toys-games" },
      { name: "سیسمونی", slug: "baby" },
    ],
  },
];

// ------------------------------ برندها ------------------------------

const BRANDS = [
  { name: "سامسونگ", slug: "samsung", country: "کره جنوبی", popular: true },
  { name: "اپل", slug: "apple", country: "آمریکا", popular: true },
  { name: "شیائومی", slug: "xiaomi", country: "چین", popular: true },
  { name: "سونی", slug: "sony", country: "ژاپن", popular: true },
  { name: "ال‌جی", slug: "lg", country: "کره جنوبی", popular: true },
  { name: "لنوو", slug: "lenovo", country: "چین", popular: true },
  { name: "ایسوس", slug: "asus", country: "تایوان", popular: true },
  { name: "بوش", slug: "bosch", country: "آلمان", popular: true },
  { name: "فیلیپس", slug: "philips", country: "هلند" },
  { name: "نایکی", slug: "nike", country: "آمریکا", popular: true },
  { name: "آدیداس", slug: "adidas", country: "آلمان" },
  { name: "زارا", slug: "zara", country: "اسپانیا" },
  { name: "لورآل", slug: "loreal", country: "فرانسه", popular: true },
  { name: "نیوآ", slug: "nivea", country: "آلمان" },
  { name: "کانن", slug: "canon", country: "ژاپن" },
  { name: "جی‌بی‌ال", slug: "jbl", country: "آمریکا" },
];

// ------------------------------ محصولات ------------------------------

type SeedProduct = {
  name: string;
  slug: string;
  cat: string;
  brand: string;
  price: number;
  discount?: number;
  stock: number;
  rating: number;
  reviews: number;
  sold: number;
  family: string;
  short: string;
  specs: [string, string][];
  colors?: [string, string][];
  special?: boolean;
};

const PRODUCTS: SeedProduct[] = [
  {
    name: "گوشی موبایل سامسونگ مدل Galaxy A55 با حافظه ۲۵۶ گیگابایت",
    slug: "samsung-galaxy-a55-256",
    cat: "mobile-tablet",
    brand: "samsung",
    price: 21_500_000,
    discount: 19_800_000,
    stock: 24,
    rating: 4.6,
    reviews: 128,
    sold: 940,
    family: "digital",
    short: "نمایشگر سوپر آمولد، دوربین ۵۰ مگاپیکسل و باتری ۵۰۰۰ میلی‌آمپری",
    specs: [
      ["نوع نمایشگر", "Super AMOLED"],
      ["اندازه نمایشگر", "۶.۶ اینچ"],
      ["حافظه داخلی", "۲۵۶ گیگابایت"],
      ["رم", "۸ گیگابایت"],
      ["دوربین اصلی", "۵۰ مگاپیکسل"],
      ["باتری", "۵۰۰۰ میلی‌آمپرساعت"],
      ["سیستم‌عامل", "اندروید ۱۴"],
    ],
    colors: [
      ["آبی یخی", "#7dd3fc"],
      ["مشکی", "#0f172a"],
      ["بنفش", "#a78bfa"],
    ],
  },
  {
    name: "گوشی موبایل اپل iPhone 15 Pro ظرفیت ۲۵۶ گیگابایت",
    slug: "apple-iphone-15-pro-256",
    cat: "mobile-tablet",
    brand: "apple",
    price: 74_900_000,
    discount: 71_500_000,
    stock: 8,
    rating: 4.9,
    reviews: 214,
    sold: 380,
    family: "digital",
    short: "بدنه تیتانیومی، تراشه A17 Pro و سیستم دوربین سه‌گانه",
    specs: [
      ["نمایشگر", "Super Retina XDR"],
      ["اندازه", "۶.۱ اینچ"],
      ["تراشه", "A17 Pro"],
      ["حافظه", "۲۵۶ گیگابایت"],
      ["دوربین", "۴۸ + ۱۲ + ۱۲ مگاپیکسل"],
      ["مقاومت", "IP68"],
    ],
    colors: [
      ["تیتانیوم طبیعی", "#9ca3af"],
      ["تیتانیوم آبی", "#475569"],
    ],
  },
  {
    name: "شیائومی Redmi Note 13 Pro با حافظه ۲۵۶ گیگابایت",
    slug: "xiaomi-redmi-note-13-pro",
    cat: "mobile-tablet",
    brand: "xiaomi",
    price: 12_800_000,
    discount: 11_450_000,
    stock: 42,
    rating: 4.5,
    reviews: 96,
    sold: 1_320,
    family: "digital",
    short: "دوربین ۲۰۰ مگاپیکسل و شارژ سریع ۶۷ وات",
    specs: [
      ["نمایشگر", "AMOLED"],
      ["اندازه", "۶.۶۷ اینچ"],
      ["حافظه", "۲۵۶ گیگابایت"],
      ["رم", "۸ گیگابایت"],
      ["دوربین", "۲۰۰ مگاپیکسل"],
      ["شارژ سریع", "۶۷ وات"],
    ],
    colors: [
      ["مشکی", "#111827"],
      ["سفید", "#f8fafc"],
    ],
  },
  {
    name: "لپ‌تاپ ۱۵ اینچی لنوو IdeaPad با پردازنده Core i7",
    slug: "lenovo-ideapad-i7",
    cat: "laptop-computer",
    brand: "lenovo",
    price: 48_900_000,
    discount: 45_200_000,
    stock: 12,
    rating: 4.4,
    reviews: 74,
    sold: 210,
    family: "digital",
    short: "پردازنده نسل ۱۳، ۱۶ گیگابایت رم و SSD یک ترابایتی",
    specs: [
      ["پردازنده", "Core i7-1355U"],
      ["رم", "۱۶ گیگابایت"],
      ["حافظه", "SSD 1TB"],
      ["نمایشگر", "۱۵.۶ اینچ Full HD"],
      ["کارت گرافیک", "Intel Iris Xe"],
      ["سیستم‌عامل", "ویندوز ۱۱"],
    ],
  },
  {
    name: "لپ‌تاپ ۱۴ اینچی ایسوس Zenbook OLED",
    slug: "asus-zenbook-oled",
    cat: "laptop-computer",
    brand: "asus",
    price: 62_400_000,
    stock: 6,
    rating: 4.8,
    reviews: 41,
    sold: 96,
    family: "digital",
    short: "نمایشگر OLED، بدنه فلزی فوق‌باریک و باتری ۷۵ وات‌ساعت",
    specs: [
      ["پردازنده", "Core Ultra 7"],
      ["رم", "۱۶ گیگابایت"],
      ["حافظه", "SSD 1TB"],
      ["نمایشگر", "۱۴ اینچ OLED"],
      ["وزن", "۱.۲ کیلوگرم"],
    ],
  },
  {
    name: "هدفون بی‌سیم سونی WH-1000XM5 نویز کنسلینگ",
    slug: "sony-wh-1000xm5",
    cat: "headphone-speaker",
    brand: "sony",
    price: 18_900_000,
    discount: 16_900_000,
    stock: 18,
    rating: 4.9,
    reviews: 312,
    sold: 870,
    family: "digital",
    short: "حذف نویز پیشرفته، ۳۰ ساعت شارژدهی و کیفیت صدای Hi-Res",
    specs: [
      ["نوع", "روگوشی بی‌سیم"],
      ["باتری", "۳۰ ساعت"],
      ["بلوتوث", "۵.۲"],
      ["نویز کنسلینگ", "فعال"],
      ["وزن", "۲۵۰ گرم"],
    ],
    colors: [
      ["مشکی", "#0f172a"],
      ["نقره‌ای", "#e2e8f0"],
    ],
  },
  {
    name: "اسپیکر بلوتوثی JBL Charge 5 ضدآب",
    slug: "jbl-charge-5",
    cat: "headphone-speaker",
    brand: "jbl",
    price: 6_450_000,
    discount: 5_690_000,
    stock: 30,
    rating: 4.7,
    reviews: 188,
    sold: 640,
    family: "digital",
    short: "صدای قدرتمند، ضدآب IP67 و پاوربانک داخلی",
    specs: [
      ["توان", "۴۰ وات"],
      ["باتری", "۲۰ ساعت"],
      ["ضدآب", "IP67"],
      ["بلوتوث", "۵.۱"],
    ],
    colors: [
      ["مشکی", "#111827"],
      ["آبی", "#1d4ed8"],
      ["قرمز", "#dc2626"],
    ],
  },
  {
    name: "ساعت هوشمند سامسونگ Galaxy Watch 6 کلاسیک",
    slug: "samsung-watch-6-classic",
    cat: "smartwatch",
    brand: "samsung",
    price: 11_900_000,
    discount: 10_200_000,
    stock: 15,
    rating: 4.5,
    reviews: 87,
    sold: 290,
    family: "digital",
    short: "صفحه سوپر آمولد، پایش خواب و ضربان قلب، بدنه استیل",
    specs: [
      ["نمایشگر", "Super AMOLED"],
      ["اندازه", "۴۳ میلی‌متر"],
      ["باتری", "۴۲۵ میلی‌آمپر"],
      ["مقاومت", "5ATM"],
      ["سازگاری", "اندروید"],
    ],
  },
  {
    name: "دوربین بدون آینه کانن EOS R50 با لنز ۱۸-۴۵",
    slug: "canon-eos-r50",
    cat: "camera",
    brand: "canon",
    price: 38_700_000,
    discount: 36_200_000,
    stock: 5,
    rating: 4.7,
    reviews: 33,
    sold: 74,
    family: "digital",
    short: "سنسور APS-C، فیلم‌برداری 4K و فوکوس خودکار هوشمند",
    specs: [
      ["سنسور", "APS-C 24.2MP"],
      ["فیلم‌برداری", "4K 30fps"],
      ["فوکوس", "Dual Pixel CMOS AF II"],
      ["صفحه", "لمسی چرخشی"],
    ],
  },
  {
    name: "چای‌ساز برقی بوش مدل ComfortLine",
    slug: "bosch-tea-maker",
    cat: "kitchen-appliances",
    brand: "bosch",
    price: 4_250_000,
    discount: 3_690_000,
    stock: 22,
    rating: 4.3,
    reviews: 52,
    sold: 340,
    family: "home",
    short: "بدنه استیل، کتری ۱.۷ لیتری و قوری شیشه‌ای",
    specs: [
      ["توان", "۲۲۰۰ وات"],
      ["ظرفیت کتری", "۱.۷ لیتر"],
      ["جنس بدنه", "استیل ضدزنگ"],
      ["گارانتی", "۱۸ ماه"],
    ],
  },
  {
    name: "سرویس قابلمه گرانیتی ۷ پارچه",
    slug: "granite-cookware-set",
    cat: "kitchen-appliances",
    brand: "bosch",
    price: 8_900_000,
    discount: 7_450_000,
    stock: 0,
    rating: 4.1,
    reviews: 61,
    sold: 520,
    family: "home",
    short: "پوشش نچسب گرانیتی، مناسب همه نوع اجاق",
    specs: [
      ["تعداد قطعات", "۷"],
      ["پوشش", "گرانیتی"],
      ["مناسب", "گاز، برق، القایی"],
    ],
  },
  {
    name: "ست ظروف سرامیکی ۱۸ پارچه طرح مینیمال",
    slug: "ceramic-dinner-set-18",
    cat: "tableware",
    brand: "philips",
    price: 3_450_000,
    stock: 40,
    rating: 4.4,
    reviews: 44,
    sold: 260,
    family: "home",
    short: "سرامیک باکیفیت، مناسب ماشین ظرفشویی و مایکروویو",
    specs: [
      ["تعداد", "۱۸ پارچه"],
      ["جنس", "سرامیک"],
      ["طرح", "مینیمال"],
    ],
  },
  {
    name: "چراغ رومیزی LED با قابلیت تنظیم نور",
    slug: "led-desk-lamp",
    cat: "home-decor",
    brand: "philips",
    price: 1_890_000,
    discount: 1_490_000,
    stock: 55,
    rating: 4.2,
    reviews: 38,
    sold: 610,
    family: "home",
    short: "سه حالت نور، پایه انعطاف‌پذیر و مصرف低 انرژی",
    specs: [
      ["توان", "۱۲ وات"],
      ["دمای رنگ", "۳۰۰۰ تا ۶۵۰۰ کلوین"],
      ["پورت شارژ", "USB-C"],
    ],
  },
  {
    name: "تی‌شرت مردانه نایکی مدل Sportswear کلاسیک",
    slug: "nike-tshirt-classic",
    cat: "mens-wear",
    brand: "nike",
    price: 2_450_000,
    discount: 1_990_000,
    stock: 70,
    rating: 4.3,
    reviews: 112,
    sold: 830,
    family: "fashion",
    short: "پنبه ۱۰۰٪، برش راحت و مناسب استفاده روزمره",
    specs: [
      ["جنس", "پنبه"],
      ["برش", "Regular Fit"],
      ["قابل شستشو", "ماشین لباسشویی"],
    ],
    colors: [
      ["مشکی", "#111827"],
      ["سفید", "#f8fafc"],
      ["خاکستری", "#6b7280"],
    ],
  },
  {
    name: "کتان مردانه آدیداس مدل Essentials",
    slug: "adidas-shirt-essentials",
    cat: "mens-wear",
    brand: "adidas",
    price: 3_290_000,
    stock: 36,
    rating: 4.0,
    reviews: 47,
    sold: 210,
    family: "fashion",
    short: "پارچه سبک و خنک با طراحی مینیمال",
    specs: [
      ["جنس", "پنبه-پلی‌استر"],
      ["یقه", "گرد"],
      ["فصل", "بهار و تابستان"],
    ],
  },
  {
    name: "مانتو زنانه زارا مدل لینن جلو دکمه",
    slug: "zara-linen-manto",
    cat: "womens-wear",
    brand: "zara",
    price: 5_890_000,
    discount: 4_690_000,
    stock: 18,
    rating: 4.6,
    reviews: 63,
    sold: 190,
    family: "fashion",
    short: "پارچه لینن خنک، برش آزاد و مناسب بهار و تابستان",
    specs: [
      ["جنس", "لینن"],
      ["برش", "آزاد"],
      ["قد", "بلند"],
    ],
    colors: [
      ["کرم", "#f5f5f4"],
      ["سبز", "#166534"],
    ],
  },
  {
    name: "کفش اسنیکر نایکی مدل Air Zoom",
    slug: "nike-air-zoom",
    cat: "shoes",
    brand: "nike",
    price: 7_450_000,
    discount: 6_290_000,
    stock: 26,
    rating: 4.7,
    reviews: 154,
    sold: 720,
    family: "fashion",
    short: "کفی Air Zoom، رویه مش تنفسی و زیره لاستیکی",
    specs: [
      ["جنس رویه", "مش"],
      ["نوع", "اسنیکر ورزشی"],
      ["زیره", "لاستیک"],
    ],
    colors: [
      ["سفید", "#f8fafc"],
      ["مشکی", "#111827"],
    ],
  },
  {
    name: "کیف چرم طبیعی زنانه مدل Shopper",
    slug: "leather-shopper-bag",
    cat: "bags",
    brand: "zara",
    price: 4_980_000,
    stock: 14,
    rating: 4.2,
    reviews: 29,
    sold: 130,
    family: "fashion",
    short: "چرم طبیعی، جادار و مناسب استفاده روزمره",
    specs: [
      ["جنس", "چرم طبیعی"],
      ["ابعاد", "۳۵ × ۲۸ سانتی‌متر"],
      ["بند", "قابل تنظیم"],
    ],
    colors: [
      ["قهوه‌ای", "#78350f"],
      ["مشکی", "#111827"],
    ],
  },
  {
    name: "کرم مرطوب‌کننده لورآل مدل Hydra Genius",
    slug: "loreal-hydra-genius",
    cat: "skincare",
    brand: "loreal",
    price: 1_290_000,
    discount: 990_000,
    stock: 85,
    rating: 4.5,
    reviews: 203,
    sold: 1_460,
    family: "beauty",
    short: "آبرسان ۷۲ ساعته با هیالورونیک اسید",
    specs: [
      ["حجم", "۷۰ میلی‌لیتر"],
      ["نوع پوست", "همه انواع"],
      ["ترکیبات کلیدی", "هیالورونیک اسید"],
    ],
  },
  {
    name: "سرم ویتامین C روشن‌کننده ۳۰ میلی‌لیتر",
    slug: "vitamin-c-serum",
    cat: "skincare",
    brand: "nivea",
    price: 1_690_000,
    discount: 1_390_000,
    stock: 60,
    rating: 4.4,
    reviews: 118,
    sold: 870,
    family: "beauty",
    short: "روشن‌کننده و آنتی‌اکسیدان قوی برای شفافیت پوست",
    specs: [
      ["حجم", "۳۰ میلی‌لیتر"],
      ["غلظت ویتامین C", "۱۵٪"],
      ["نوع پوست", "همه انواع"],
    ],
  },
  {
    name: "ادکلن مردانه لورآل مدل Sauvage ۱۰۰ میلی‌لیتر",
    slug: "sauvage-edp-100",
    cat: "perfume",
    brand: "loreal",
    price: 6_900_000,
    stock: 20,
    rating: 4.8,
    reviews: 91,
    sold: 320,
    family: "beauty",
    short: "رایحه چوبی-تند، ماندگاری بالا و مناسب استفاده روزانه",
    specs: [
      ["حجم", "۱۰۰ میلی‌لیتر"],
      ["خانواده رایحه", "چوبی-تند"],
      ["ماندگاری", "۸ تا ۱۰ ساعت"],
    ],
  },
  {
    name: "پالت سایه چشم ۱۲ رنگ نیوآ",
    slug: "nivea-eyeshadow-palette",
    cat: "makeup",
    brand: "nivea",
    price: 890_000,
    discount: 690_000,
    stock: 95,
    rating: 4.1,
    reviews: 67,
    sold: 540,
    family: "beauty",
    short: "بافت پودری نرم، پیگمنت بالا و رنگ‌های روزمره",
    specs: [
      ["تعداد رنگ", "۱۲"],
      ["بافت", "پودری"],
      ["ماندگاری", "۸ ساعت"],
    ],
  },
  {
    name: "دمبل قابل تنظیم ۲۰ کیلوگرمی",
    slug: "adjustable-dumbbell-20",
    cat: "fitness",
    brand: "adidas",
    price: 4_890_000,
    discount: 3_990_000,
    stock: 16,
    rating: 4.4,
    reviews: 28,
    sold: 140,
    family: "sport",
    short: "وزنه‌های قابل تنظیم برای تمرین خانگی",
    specs: [
      ["وزن", "۲۰ کیلوگرم"],
      ["جنس", "فولاد با روکش"],
      ["تنظیم", "پیچی"],
    ],
  },
  {
    name: "کیسه خواب کوهنوردی سه فصل",
    slug: "sleeping-bag-3season",
    cat: "camping",
    brand: "nike",
    price: 3_290_000,
    stock: 11,
    rating: 4.2,
    reviews: 19,
    sold: 88,
    family: "sport",
    short: "مناسب دمای ۰ تا ۱۵ درجه، سبک و کم‌حجم",
    specs: [
      ["دمای کارکرد", "۰ تا ۱۵ درجه"],
      ["وزن", "۱.۴ کیلوگرم"],
      ["ابعاد جمع‌شده", "۳۵ × ۱۸ سانتی‌متر"],
    ],
  },
  {
    name: "کتاب اثر مرکب — دارن هاردی",
    slug: "compound-effect-book",
    cat: "book",
    brand: "samsung",
    price: 690_000,
    discount: 520_000,
    stock: 40,
    rating: 4.7,
    reviews: 156,
    sold: 1_100,
    family: "books",
    short: "راهنمای رسیدن به موفقیت پایدار با عادت‌های کوچک",
    specs: [
      ["نویسنده", "دارن هاردی"],
      ["ناشر", "نشر سَروا"],
      ["تعداد صفحات", "۳۲۰"],
      ["قطع", "رقعی"],
    ],
  },
  {
    name: "دفتر یادداشت لوکس جلد چرمی",
    slug: "leather-notebook",
    cat: "stationery",
    brand: "zara",
    price: 450_000,
    stock: 70,
    rating: 4.3,
    reviews: 22,
    sold: 310,
    family: "books",
    short: "جلد چرمی، ۲۰۰ برگ و کاغذ بدون خط",
    specs: [
      ["تعداد برگ", "۲۰۰"],
      ["جنس جلد", "چرم مصنوعی"],
      ["ابعاد", "A5"],
    ],
  },
  {
    name: "پسته احمدآقایی درجه یک ۵۰۰ گرم",
    slug: "pistachio-500",
    cat: "food",
    brand: "bosch",
    price: 890_000,
    discount: 720_000,
    stock: 120,
    rating: 4.6,
    reviews: 74,
    sold: 2_200,
    family: "grocery",
    short: "پسته تازه و خندان، بسته‌بندی بهداشتی",
    specs: [
      ["وزن", "۵۰۰ گرم"],
      ["منشأ", "رفسنجان"],
      ["درجه", "یک"],
    ],
  },
  {
    name: "قهوه اسپرسو ترکیبی ۲۵۰ گرمی",
    slug: "espresso-blend-250",
    cat: "drinks",
    brand: "bosch",
    price: 540_000,
    stock: 90,
    rating: 4.5,
    reviews: 48,
    sold: 760,
    family: "grocery",
    short: "ترکیب عربیکا و روبوستا با رُست متوسط",
    specs: [
      ["وزن", "۲۵۰ گرم"],
      ["ترکیب", "۷۰٪ عربیکا، ۳۰٪ روبوستا"],
      ["رست", "متوسط"],
    ],
  },
  {
    name: "لگو ساختنی ۵۰۰ قطعه‌ای شهر",
    slug: "lego-city-500",
    cat: "toys-games",
    brand: "philips",
    price: 1_890_000,
    discount: 1_590_000,
    stock: 34,
    rating: 4.8,
    reviews: 56,
    sold: 420,
    family: "toys",
    short: "مناسب کودکان ۶ سال به بالا، تقویت خلاقیت",
    specs: [
      ["تعداد قطعات", "۵۰۰"],
      ["رده سنی", "۶+"],
      ["جنس", "پلاستیک ABS"],
    ],
  },
  {
    name: "پوشک بچه سایز ۴ بسته ۵۰ عددی",
    slug: "baby-diaper-size4",
    cat: "baby",
    brand: "philips",
    price: 1_290_000,
    stock: 150,
    rating: 4.4,
    reviews: 88,
    sold: 1_900,
    family: "toys",
    short: "جذب بالا، لایه تنفسی و مناسب پوست حساس",
    specs: [
      ["تعداد", "۵۰ عدد"],
      ["سایز", "۴"],
      ["وزن مناسب", "۷ تا ۱۴ کیلوگرم"],
    ],
  },
  {
    name: "پاوربانک شیائومی ۲۰۰۰۰ میلی‌آمپر ۵۰ وات",
    slug: "xiaomi-powerbank-20000",
    cat: "mobile-tablet",
    brand: "xiaomi",
    price: 2_890_000,
    discount: 2_390_000,
    stock: 65,
    rating: 4.6,
    reviews: 142,
    sold: 1_050,
    family: "digital",
    short: "شارژ سریع دوطرفه، نمایشگر دیجیتال و سه خروجی",
    specs: [
      ["ظرفیت", "۲۰۰۰۰ میلی‌آمپر"],
      ["توان", "۵۰ وات"],
      ["خروجی", "۳ پورت"],
    ],
  },
  {
    name: "ماوس بی‌سیم ایسوس ROG Gladius III",
    slug: "asus-rog-mouse",
    cat: "laptop-computer",
    brand: "asus",
    price: 2_450_000,
    discount: 1_990_000,
    stock: 28,
    rating: 4.5,
    reviews: 39,
    sold: 180,
    family: "digital",
    short: "سنسور ۱۹۰۰۰ DPI، بدنه ارگونومیک و باتری ۸۰ ساعته",
    specs: [
      ["سنسور", "۱۹۰۰۰ DPI"],
      ["اتصال", "بی‌سیم ۲.۴ گیگاهرتز"],
      ["باتری", "۸۰ ساعت"],
    ],
  },
  {
    name: "کیبورد مکانیکال ایسوس ROG Strix",
    slug: "asus-rog-keyboard",
    cat: "laptop-computer",
    brand: "asus",
    price: 3_890_000,
    stock: 19,
    rating: 4.4,
    reviews: 31,
    sold: 120,
    family: "digital",
    short: "سوییچ مکانیکی، نورپردازی RGB و بدنه آلومینیومی",
    specs: [
      ["نوع سوییچ", "مکانیکی"],
      ["نورپردازی", "RGB"],
      ["اتصال", "USB-C"],
    ],
  },
  {
    name: "ماشین لباسشویی ۸ کیلوگرمی بوش سری ۶",
    slug: "bosch-washing-machine-8kg",
    cat: "kitchen-appliances",
    brand: "bosch",
    price: 42_900_000,
    discount: 39_500_000,
    stock: 7,
    rating: 4.7,
    reviews: 62,
    sold: 130,
    family: "home",
    short: "موتور EcoSilence، ۱۵ برنامه شستشو و رده انرژی A+++",
    specs: [
      ["ظرفیت", "۸ کیلوگرم"],
      ["سرعت چرخش", "۱۴۰۰ دور"],
      ["رده انرژی", "A+++"],
      ["گارانتی", "۲۴ ماه"],
    ],
  },
  {
    name: "جاروبرقی شارژی فیلیپس ۲۵۰ وات",
    slug: "philips-vacuum-250w",
    cat: "kitchen-appliances",
    brand: "philips",
    price: 6_290_000,
    discount: 5_490_000,
    stock: 23,
    rating: 4.2,
    reviews: 44,
    sold: 260,
    family: "home",
    short: "مکش قوی، فیلتر HEPA و باتری ۴۰ دقیقه‌ای",
    specs: [
      ["توان", "۲۵۰ وات"],
      ["باتری", "۴۰ دقیقه"],
      ["فیلتر", "HEPA"],
    ],
  },
  {
    name: "عطر زنانه لورآل مدل La Vie Est Belle ۹۰ میلی‌لیتر",
    slug: "la-vie-est-belle-90",
    cat: "perfume",
    brand: "loreal",
    price: 7_450_000,
    discount: 6_290_000,
    stock: 13,
    rating: 4.9,
    reviews: 108,
    sold: 290,
    family: "beauty",
    short: "رایحه شیرین-گلی با ماندگاری بالا",
    specs: [
      ["حجم", "۹۰ میلی‌لیتر"],
      ["خانواده رایحه", "گلی-میوه‌ای"],
      ["ماندگاری", "۸ ساعت"],
    ],
  },
  {
    name: "رژ لب مات نیوآ مدل Velvet",
    slug: "nivea-lipstick-velvet",
    cat: "makeup",
    brand: "nivea",
    price: 590_000,
    stock: 110,
    rating: 4.0,
    reviews: 35,
    sold: 480,
    family: "beauty",
    short: "بافت مات مخملی، رنگ‌دهی بالا و ماندگاری طولانی",
    specs: [
      ["نوع", "مات"],
      ["ماندگاری", "۶ ساعت"],
    ],
    colors: [
      ["قرمز", "#dc2626"],
      ["نود", "#d6a692"],
    ],
  },
  {
    name: "کوله پشتی ورزشی آدیداس ۳۰ لیتری",
    slug: "adidas-backpack-30l",
    cat: "bags",
    brand: "adidas",
    price: 2_190_000,
    discount: 1_790_000,
    stock: 44,
    rating: 4.3,
    reviews: 26,
    sold: 210,
    family: "fashion",
    short: "پارچه ضدآب، جیب لپ‌تاپ و بندهای ارگونومیک",
    specs: [
      ["حجم", "۳۰ لیتر"],
      ["جنس", "پلی‌استر ضدآب"],
      ["جیب لپ‌تاپ", "۱۴ اینچ"],
    ],
  },
  {
    name: "شلوار جین مردانه زارا مدل Slim Fit",
    slug: "zara-jeans-slim",
    cat: "mens-wear",
    brand: "zara",
    price: 3_890_000,
    stock: 30,
    rating: 4.1,
    reviews: 58,
    sold: 340,
    family: "fashion",
    short: "جین باکیفیت با برش اسلیم و کشش ملایم",
    specs: [
      ["جنس", "۹۸٪ پنبه"],
      ["برش", "Slim Fit"],
      ["قد", "بلند"],
    ],
  },
  {
    name: "هودی زنانه نایکی مدل Sportswear Club",
    slug: "nike-hoodie-women",
    cat: "womens-wear",
    brand: "nike",
    price: 4_290_000,
    discount: 3_490_000,
    stock: 21,
    rating: 4.5,
    reviews: 41,
    sold: 160,
    family: "fashion",
    short: "پارچه فرنچ تری، برش اورسایز و کلاه دو لایه",
    specs: [
      ["جنس", "پنبه-پلی‌استر"],
      ["برش", "اورسایز"],
      ["فصل", "پاییز و زمستان"],
    ],
    colors: [
      ["خاکستری", "#9ca3af"],
      ["صورتی", "#f9a8d4"],
    ],
  },
  {
    name: "سازدهنی ۲۴ سوراخ حرفه‌ای",
    slug: "harmonica-24",
    cat: "toys-games",
    brand: "philips",
    price: 1_190_000,
    stock: 38,
    rating: 3.9,
    reviews: 12,
    sold: 90,
    family: "toys",
    short: "مناسب مبتدی تا حرفه‌ای، جعبه محافظ",
    specs: [
      ["تعداد سوراخ", "۲۴"],
      ["جنس", "فلز"],
    ],
  },
  {
    name: "سطل زباله سنسوری ۵۰ لیتری استیل",
    slug: "sensor-trash-50l",
    cat: "home-decor",
    brand: "philips",
    price: 2_890_000,
    discount: 2_390_000,
    stock: 27,
    rating: 4.1,
    reviews: 21,
    sold: 150,
    family: "home",
    short: "بازشو سنسوری، بدنه استیل ضدزنگ و سطل داخلی",
    specs: [
      ["ظرفیت", "۵۰ لیتر"],
      ["جنس", "استیل"],
      ["باتری", "۴ عدد AA"],
    ],
  },
  {
    name: "چمدان مسافرتی ۲۴ اینچ پلی‌کربنات",
    slug: "suitcase-24",
    cat: "camping",
    brand: "nike",
    price: 5_490_000,
    discount: 4_490_000,
    stock: 17,
    rating: 4.4,
    reviews: 33,
    sold: 140,
    family: "sport",
    short: "بدنه سبک و مقاوم، قفل TSA و چرخ ۳۶۰ درجه",
    specs: [
      ["ابعاد", "۲۴ اینچ"],
      ["جنس", "پلی‌کربنات"],
      ["قفل", "TSA"],
    ],
  },
];

// --------------------------- کاربران نمونه ---------------------------

const USERS = [
  { name: "مدیر سَروا", email: "admin@sarva.shop", role: "ADMIN" as const, phone: "09120000000" },
  { name: "سارا محمدی", email: "sara@example.com", role: "USER" as const, phone: "09121111111" },
  { name: "علی رضایی", email: "ali@example.com", role: "USER" as const, phone: "09122222222" },
  { name: "مریم حسینی", email: "maryam@example.com", role: "USER" as const, phone: "09123333333" },
  { name: "رضا کریمی", email: "reza@example.com", role: "USER" as const, phone: "09124444444" },
];

const PASSWORD = "User@12345";

// ------------------------------- helpers -------------------------------

function daysAgo(n: number) {
  return new Date(now - n * DAY);
}

async function main() {
  console.log("🌱 در حال پاک‌سازی داده‌های قبلی…");

  await prisma.orderEvent.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.paymentTransaction.deleteMany();
  await prisma.order.deleteMany();
  await prisma.review.deleteMany();
  await prisma.question.deleteMany();
  await prisma.wishlistItem.deleteMany();
  await prisma.favoriteItem.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.walletTransaction.deleteMany();
  await prisma.productRelation.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.productAttribute.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.brand.deleteMany();
  await prisma.coupon.deleteMany();
  await prisma.banner.deleteMany();
  await prisma.address.deleteMany();
  await prisma.user.deleteMany();

  console.log("🖼  تولید تصاویر SVG…");

  // تصاویر دسته‌بندی
  for (const c of CATEGORIES) {
    writeImage(`categories/${c.slug}.svg`, makeCategorySvg(c.family, c.slug.length));
  }
  // لوگوی برندها
  BRANDS.forEach((b, i) => {
    writeImage(`brands/${b.slug}.svg`, makeBrandSvg(b.name, i));
  });
  // بنرها
  writeImage("banners/main-1.svg", makeBannerSvg("brand", 0));
  writeImage("banners/main-2.svg", makeBannerSvg("accent", 1));
  writeImage("banners/main-3.svg", makeBannerSvg("dark", 2));
  writeImage("banners/strip-1.svg", makeBannerSvg("light", 3));
  writeImage("banners/strip-2.svg", makeBannerSvg("accent", 4));

  console.log("👤 ساخت کاربران…");
  const passwordHash = await bcrypt.hash(PASSWORD, 10);
  const adminHash = await bcrypt.hash(process.env.SEED_ADMIN_PASSWORD ?? "Admin@12345", 10);

  const users: Record<string, string> = {};
  for (const u of USERS) {
    const created = await prisma.user.create({
      data: {
        name: u.name,
        email: u.email,
        phone: u.phone,
        passwordHash: u.role === "ADMIN" ? adminHash : passwordHash,
        role: u.role,
        walletBalance: u.role === "ADMIN" ? 0 : 1_500_000,
        createdAt: daysAgo(120),
      },
    });
    users[u.email] = created.id;

    if (u.role === "USER") {
      await prisma.address.create({
        data: {
          userId: created.id,
          label: "خانه",
          receiverName: u.name,
          receiverPhone: u.phone,
          province: "تهران",
          city: "تهران",
          postalCode: "1968" + Math.floor(100000 + Math.random() * 899999),
          address: "خیابان ولیعصر، کوچه بهار، پلاک " + Math.floor(10 + Math.random() * 80) + "، واحد ۴",
          isDefault: true,
        },
      });
    }
  }

  console.log("📦 ساخت دسته‌بندی‌ها و برندها…");
  const catIds: Record<string, string> = {};
  for (let i = 0; i < CATEGORIES.length; i++) {
    const c = CATEGORIES[i];
    const root = await prisma.category.create({
      data: {
        name: c.name,
        slug: c.slug,
        description: c.desc,
        icon: c.icon,
        image: `/images/categories/${c.slug}.svg`,
        order: i,
        isPopular: !!c.popular,
      },
    });
    catIds[c.slug] = root.id;

    for (let j = 0; j < c.children.length; j++) {
      const child = c.children[j];
      const created = await prisma.category.create({
        data: {
          name: child.name,
          slug: child.slug,
          description: `${child.name} — ${c.desc}`,
          image: `/images/categories/${c.slug}.svg`,
          parentId: root.id,
          order: j,
          isPopular: false,
        },
      });
      catIds[child.slug] = created.id;
    }
  }

  const brandIds: Record<string, string> = {};
  for (const b of BRANDS) {
    const created = await prisma.brand.create({
      data: {
        name: b.name,
        slug: b.slug,
        country: b.country,
        logo: `/images/brands/${b.slug}.svg`,
        isPopular: !!b.popular,
      },
    });
    brandIds[b.slug] = created.id;
  }

  console.log("🛍  ساخت محصولات…");
  const productIds: string[] = [];
  const productBySlug: Record<string, string> = {};

  for (let i = 0; i < PRODUCTS.length; i++) {
    const p = PRODUCTS[i];
    const seed = i + 3;

    // تصاویر
    const images: string[] = [];
    for (let v = 0; v < 4; v++) {
      const rel = `products/${p.slug}-${v + 1}.svg`;
      writeImage(rel, makeProductSvg(p.family, seed, v));
      images.push(`/images/${rel}`);
    }

    const specialEnds = p.discount ? new Date(now + (6 + (i % 30)) * 60 * 60 * 1000) : null;

    const created = await prisma.product.create({
      data: {
        name: p.name,
        slug: p.slug,
        sku: `SRV-${String(1000 + i)}`,
        description: buildDescription(p),
        shortDesc: p.short,
        price: p.price,
        discountPrice: p.discount ?? null,
        stock: p.stock,
        categoryId: catIds[p.cat] ?? catIds.digital,
        brandId: brandIds[p.brand] ?? null,
        rating: p.rating,
        reviewCount: p.reviews,
        soldCount: p.sold,
        viewCount: p.sold * (6 + (i % 5)),
        favoriteCount: Math.floor(p.sold / 8),
        isFeatured: i % 4 === 0,
        isNew: i % 6 === 0,
        isSpecial: !!p.discount && i % 3 === 0,
        specialEndsAt: specialEnds,
        warranty: "۱۸ ماه ضمانت سَروا",
        weight: 500 + (i % 9) * 200,
        createdAt: daysAgo(60 - (i % 50)),
        images: {
          create: images.map((url, idx) => ({
            url,
            alt: `${p.name} — تصویر ${idx + 1}`,
            order: idx,
          })),
        },
        attrs: {
          create: p.specs.map(([key, value], idx) => ({
            group: "مشخصات فنی",
            key,
            value,
            order: idx,
          })),
        },
        variants: {
          create:
            p.colors?.map(([colorName, colorHex], idx) => ({
              name: colorName,
              sku: `SRV-${String(1000 + i)}-${idx + 1}`,
              stock: Math.max(0, Math.floor(p.stock / (idx + 1))),
              colorName,
              colorHex,
              order: idx,
              isActive: true,
            })) ?? [],
        },
      },
    });

    productIds.push(created.id);
    productBySlug[p.slug] = created.id;

    // روابط مرتبط
    if (i >= 3) {
      await prisma.productRelation.create({
        data: { productId: created.id, relatedProductId: productIds[Math.floor(i / 2)] },
      });
    }
  }

  console.log("💬 ساخت نظرات و پرسش‌ها…");
  const reviewers = USERS.filter((u) => u.role === "USER").map((u) => users[u.email]);
  const reviewTemplates = [
    ["کیفیت فوق‌العاده", "بعد از دو هفته استفاده، کاملاً راضی هستم. کیفیت ساخت و بسته‌بندی عالی بود."],
    ["ارزش خرید بالا", "در مقایسه با قیمت، امکانات بسیار خوبی دارد. ارسال هم سریع انجام شد."],
    ["انتظار بیشتری داشتم", "محصول خوبه اما انتظار داشتم متریالش بهتر باشه. با این حال کارمو راه انداخت."],
    ["دقیقاً مطابق توضیحات", "همون چیزی بود که در مشخصات نوشته شده بود. پیشنهاد می‌کنم."],
    ["پشتیبانی خوب", "یک سوال داشتم که سریع جواب دادن. تجربه خرید خوبی بود."],
  ];

  for (let i = 0; i < productIds.length; i++) {
    const pid = productIds[i];
    const n = 1 + (i % 3);
    for (let r = 0; r < n; r++) {
      const userId = reviewers[(i + r) % reviewers.length];
      const t = reviewTemplates[(i + r) % reviewTemplates.length];
      await prisma.review.create({
        data: {
          productId: pid,
          userId,
          rating: 3 + ((i + r) % 3),
          title: t[0],
          body: t[1],
          isRecommended: r % 3 !== 2,
          reply: r === 0 ? "از خرید شما سپاسگزاریم؛ خوشحالیم که راضی بودید. 🌿" : null,
          replyAt: r === 0 ? daysAgo(2) : null,
          createdAt: daysAgo(10 + r * 4 + (i % 20)),
        },
      });
    }

    await prisma.question.create({
      data: {
        productId: pid,
        userId: reviewers[i % reviewers.length],
        body: "آیا این محصول گارانتی رسمی دارد و ارسال آن چند روز طول می‌کشد؟",
        answer: "بله، ۱۸ ماه گارانتی سَروا دارد و ارسال تهران معمولاً ۲۴ ساعته انجام می‌شود.",
        answerAt: daysAgo(3),
        createdAt: daysAgo(6),
      },
    });
  }

  console.log("🎟  ساخت بنرها و کدهای تخفیف…");
  await prisma.banner.createMany({
    data: [
      {
        title: "جشنواره پایان فصل سَروا",
        subtitle: "تا ۴۰٪ تخفیف روی منتخب کالای دیجیتال و لوازم خانه",
        image: "/images/banners/main-1.svg",
        link: "/special-offers",
        badge: "تا ۴۰٪ تخفیف",
        theme: "brand",
        order: 0,
      },
      {
        title: "تازه‌های پاییز رسید",
        subtitle: "کالکشن جدید پوشاک و اکسسوری با ارسال رایگان",
        image: "/images/banners/main-2.svg",
        link: "/category/fashion",
        badge: "کالکشن جدید",
        theme: "accent",
        order: 1,
      },
      {
        title: "دنیای صدا با سونی",
        subtitle: "هدفون و اسپیکرهای اورجینال با ضمانت اصالت",
        image: "/images/banners/main-3.svg",
        link: "/category/headphone-speaker",
        badge: "ویژه",
        theme: "dark",
        order: 2,
      },
    ],
  });

  await prisma.banner.createMany({
    data: [
      {
        title: "ارسال رایگان",
        subtitle: "برای خرید بالای ۵ میلیون تومان",
        image: "/images/banners/strip-1.svg",
        link: "/shipping",
        theme: "light",
        order: 10,
      },
      {
        title: "۷ روز ضمانت بازگشت",
        subtitle: "بدون قید و شرط",
        image: "/images/banners/strip-2.svg",
        link: "/returns",
        theme: "accent",
        order: 11,
      },
    ],
  });

  await prisma.coupon.createMany({
    data: [
      {
        code: "SARVA10",
        type: "PERCENT",
        value: 10,
        minOrder: 1_000_000,
        maxDiscount: 2_000_000,
        usageLimit: 500,
        perUserLimit: 1,
        description: "۱۰٪ تخفیف روی اولین خرید",
        expiresAt: new Date(now + 30 * DAY),
      },
      {
        code: "WELCOME",
        type: "FIXED",
        value: 500_000,
        minOrder: 3_000_000,
        usageLimit: 200,
        perUserLimit: 1,
        description: "۵۰۰ هزار تومان تخفیف خوش‌آمدگویی",
        expiresAt: new Date(now + 60 * DAY),
      },
      {
        code: "DIGITAL15",
        type: "PERCENT",
        value: 15,
        minOrder: 5_000_000,
        maxDiscount: 5_000_000,
        usageLimit: 100,
        perUserLimit: 1,
        description: "۱۵٪ تخفیف کالای دیجیتال",
        expiresAt: new Date(now + 14 * DAY),
      },
      {
        code: "FREESHIP",
        type: "FIXED",
        value: 89_000,
        minOrder: 500_000,
        usageLimit: null,
        perUserLimit: 3,
        description: "تخفیف معادل هزینه ارسال",
        expiresAt: new Date(now + 90 * DAY),
      },
    ],
  });

  console.log("🧾 ساخت سفارش‌های نمونه…");
  const buyer = users["sara@example.com"];
  const addr = await prisma.address.findFirst({ where: { userId: buyer } });

  const orderPlans: {
    status: "PENDING" | "PAID" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELED";
    days: number;
    items: { slug: string; qty: number }[];
    paymentMethod: "ONLINE" | "WALLET" | "COD";
    shipping: "POST" | "COURIER" | "EXPRESS" | "PICKUP";
  }[] = [
    { status: "DELIVERED", days: 26, items: [{ slug: "sony-wh-1000xm5", qty: 1 }, { slug: "xiaomi-powerbank-20000", qty: 1 }], paymentMethod: "ONLINE", shipping: "POST" },
    { status: "SHIPPED", days: 6, items: [{ slug: "samsung-galaxy-a55-256", qty: 1 }], paymentMethod: "ONLINE", shipping: "EXPRESS" },
    { status: "PROCESSING", days: 2, items: [{ slug: "loreal-hydra-genius", qty: 2 }, { slug: "vitamin-c-serum", qty: 1 }], paymentMethod: "WALLET", shipping: "COURIER" },
    { status: "PAID", days: 1, items: [{ slug: "nike-air-zoom", qty: 1 }], paymentMethod: "ONLINE", shipping: "POST" },
    { status: "CANCELED", days: 12, items: [{ slug: "ceramic-dinner-set-18", qty: 1 }], paymentMethod: "COD", shipping: "POST" },
  ];

  let seq = 0;
  for (const plan of orderPlans) {
    seq++;
    const items = plan.items
      .map((it) => {
        const p = PRODUCTS.find((x) => x.slug === it.slug)!;
        return { p, qty: it.qty, pid: productBySlug[it.slug] };
      })
      .filter((x) => x.pid);

    const subtotal = items.reduce((s, it) => s + it.p.price * it.qty, 0);
    const effective = items.reduce(
      (s, it) => s + (it.p.discount ?? it.p.price) * it.qty,
      0,
    );
    const discount = subtotal - effective;
    const shippingFee = plan.shipping === "PICKUP" ? 0 : plan.shipping === "EXPRESS" ? 289_000 : 89_000;
    const total = effective + shippingFee;

    const createdAt = daysAgo(plan.days);
    const orderNumber = `SV-${String(1000 + seq)}${String(100 + seq)}`;

    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId: buyer,
        status: plan.status,
        paymentMethod: plan.paymentMethod,
        shippingMethod: plan.shipping,
        subtotal,
        discount,
        shippingFee,
        total,
        addressLabel: addr?.label,
        receiverName: addr?.receiverName,
        receiverPhone: addr?.receiverPhone,
        province: addr?.province,
        city: addr?.city,
        postalCode: addr?.postalCode,
        addressLine: addr?.address,
        trackingCode: ["SHIPPED", "DELIVERED"].includes(plan.status) ? `IR${Date.now().toString().slice(-9)}` : null,
        paidAt: plan.status !== "CANCELED" && plan.status !== "PENDING" ? createdAt : null,
        shippedAt: ["SHIPPED", "DELIVERED"].includes(plan.status) ? daysAgo(plan.days - 1) : null,
        deliveredAt: plan.status === "DELIVERED" ? daysAgo(plan.days - 3) : null,
        canceledAt: plan.status === "CANCELED" ? daysAgo(plan.days - 1) : null,
        cancelReason: plan.status === "CANCELED" ? "انصراف مشتری از خرید" : null,
        createdAt,
        items: {
          create: items.map((it) => ({
            productId: it.pid,
            name: it.p.name,
            image: `/images/products/${it.p.slug}-1.svg`,
            sku: `SRV-${String(1000 + PRODUCTS.indexOf(it.p))}`,
            unitPrice: it.p.discount ?? it.p.price,
            quantity: it.qty,
            total: (it.p.discount ?? it.p.price) * it.qty,
          })),
        },
        timeline: {
          create: buildTimeline(plan.status, plan.days),
        },
        payment: {
          create: {
            gateway: "sandbox",
            amount: total,
            status: plan.status === "CANCELED" ? "FAILED" : "SUCCESS",
            refId: plan.status === "CANCELED" ? null : `${Date.now()}`.slice(-10),
            cardPan: plan.status === "CANCELED" ? null : "6037••••••••1234",
            message: plan.status === "CANCELED" ? "لغو شده توسط کاربر" : "پرداخت موفق",
          },
        },
      },
    });

    // اعلان سفارش
    await prisma.notification.create({
      data: {
        userId: buyer,
        title: orderStatusTitle(plan.status),
        body: `سفارش ${orderNumber} با مبلغ ${total.toLocaleString("fa-IR")} تومان`,
        link: `/account/orders/${order.id}`,
        type: "order",
        isRead: plan.days > 5,
        createdAt,
      },
    });

    seq++;
  }

  // اعلان‌های عمومی
  await prisma.notification.createMany({
    data: [
      {
        userId: buyer,
        title: "کد تخفیف ویژه شما",
        body: "کد SARVA10 را در سبد خرید وارد کنید و ۱۰٪ تخفیف بگیرید.",
        link: "/special-offers",
        type: "promo",
        isRead: false,
      },
      {
        userId: buyer,
        title: "به سَروا خوش آمدید 👋",
        body: "از اینکه سَروا را انتخاب کردید سپاسگزاریم.",
        link: "/account",
        type: "system",
        isRead: true,
        createdAt: daysAgo(100),
      },
    ],
  });

  // کیف پول
  const txTypes = [
    ["GIFT", 500_000, "هدیه ثبت‌نام"],
    ["DEPOSIT", 1_000_000, "شارژ کیف پول"],
    ["PURCHASE", -126_000, "پرداخت سفارش"],
    ["REFUND", 89_000, "بازگشت هزینه ارسال"],
  ] as const;
  let bal = 0;
  for (const [type, amount, desc] of txTypes) {
    bal += amount;
    await prisma.walletTransaction.create({
      data: {
        userId: buyer,
        type,
        amount,
        balanceAfter: bal,
        description: desc,
        createdAt: daysAgo(Math.floor(Math.random() * 60)),
      },
    });
  }
  await prisma.user.update({ where: { id: buyer }, data: { walletBalance: bal } });

  // علاقه‌مندی‌ها
  for (const slug of ["apple-iphone-15-pro-256", "sony-wh-1000xm5", "nike-air-zoom"]) {
    if (productBySlug[slug]) {
      await prisma.wishlistItem.create({
        data: { userId: buyer, productId: productBySlug[slug] },
      });
      await prisma.favoriteItem.create({
        data: { userId: buyer, productId: productBySlug[slug] },
      });
    }
  }

  console.log("✅ seed کامل شد.");
  console.log("   ادمین: admin@sarva.shop / Admin@12345");
  console.log("   کاربر:  sara@example.com / User@12345");
}

function buildTimeline(status: string, days: number): Prisma.OrderEventCreateWithoutOrderInput[] {
  const base: Prisma.OrderEventCreateWithoutOrderInput[] = [
    { status: "PENDING", title: "ثبت سفارش", actor: "user", createdAt: daysAgo(days) },
  ];
  if (status === "CANCELED") {
    base.push({ status: "CANCELED", title: "لغو سفارش", note: "انصراف مشتری", actor: "user", createdAt: daysAgo(days - 1) });
    return base;
  }
  base.push({ status: "PAID", title: "پرداخت موفق", actor: "system", createdAt: daysAgo(days) });
  if (["PROCESSING", "SHIPPED", "DELIVERED"].includes(status))
    base.push({ status: "PROCESSING", title: "در حال آماده‌سازی", actor: "admin", createdAt: daysAgo(Math.max(0, days - 1)) });
  if (["SHIPPED", "DELIVERED"].includes(status))
    base.push({ status: "SHIPPED", title: "تحویل به شرکت حمل", actor: "admin", createdAt: daysAgo(Math.max(0, days - 2)) });
  if (status === "DELIVERED")
    base.push({ status: "DELIVERED", title: "تحویل به مشتری", actor: "system", createdAt: daysAgo(Math.max(0, days - 3)) });
  return base;
}

function orderStatusTitle(status: string) {
  const map: Record<string, string> = {
    PENDING: "سفارش شما ثبت شد",
    PAID: "پرداخت سفارش تأیید شد",
    PROCESSING: "سفارش شما در حال آماده‌سازی است",
    SHIPPED: "سفارش شما ارسال شد",
    DELIVERED: "سفارش شما تحویل داده شد",
    CANCELED: "سفارش لغو شد",
  };
  return map[status] ?? "به‌روزرسانی سفارش";
}

function buildDescription(p: SeedProduct): string {
  return `${p.name}

${p.short}

این محصول از فروشگاه اینترنتی سَروا با ضمانت اصالت کالا و پشتیبانی ۲۴ ساعته عرضه می‌شود. تمامی کالاها پیش از ارسال از نظر سلامت فیزیکی و اصالت بررسی می‌شوند و در صورت وجود هرگونه مشکل، امکان بازگشت کالا تا ۷ روز وجود دارد.

مشخصات برجسته:
${p.specs.map(([k, v]) => `• ${k}: ${v}`).join("\n")}

مناسب برای استفاده روزمره و افرادی که به کیفیت و دوام اهمیت می‌دهند. بسته‌بندی این محصول به‌صورت ایمن و ضدضربه انجام می‌شود تا در حین حمل آسیب نبیند.`;
}

main()
  .catch((e) => {
    console.error("❌ خطا در seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
