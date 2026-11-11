import type { Metadata, Viewport } from "next";
import "@fontsource-variable/vazirmatn";
import "./globals.css";
import { Providers } from "./providers";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { SITE_NAME, SITE_URL } from "@/lib/constants";
import { getRootCategories } from "@/lib/services/catalog";
import type { CategoryDTO } from "@/types";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} | فروشگاه اینترنتی`,
    template: `%s | ${SITE_NAME}`,
  },
  description:
    "سَروا فروشگاه اینترنتی مدرن؛ خرید آنلاین کالای دیجیتال، خانه و آشپزخانه، مد و پوشاک و زیبایی با ضمانت اصالت، ارسال سریع و پشتیبانی ۲۴ ساعته.",
  keywords: [
    "فروشگاه اینترنتی",
    "خرید آنلاین",
    "خرید کالای دیجیتال",
    "سَروا",
    "خرید موبایل",
    "خرید لپ تاپ",
  ],
  openGraph: {
    type: "website",
    locale: "fa_IR",
    siteName: SITE_NAME,
    title: `${SITE_NAME} | فروشگاه اینترنتی`,
    description: "خرید آسان و مطمئن از فروشگاه اینترنتی سَروا",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#0f766e",
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  let categories: CategoryDTO[] = [];
  try {
    categories = await getRootCategories();
  } catch {
    // دیتابیس هنوز آماده نیست — سایت با منوی خالی بالا می‌آید
  }

  return (
    <html lang="fa" dir="rtl" suppressHydrationWarning>
      <body className="min-h-dvh antialiased">
        <Providers>
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:right-2 focus:z-[200] focus:rounded-lg focus:bg-brand-700 focus:px-4 focus:py-2 focus:text-white"
          >
            رفتن به محتوای اصلی
          </a>
          <Header categories={categories} />
          <main id="main" className="min-h-[60vh]">
            {children}
          </main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
