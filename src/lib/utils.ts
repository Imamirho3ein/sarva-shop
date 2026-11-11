import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** ادغام کلاس‌های شرطی با حل تعارض Tailwind */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** شناسه slug فارسی/انگلیسی */
/** محدود کردن عدد به بازه مشخص */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function slugify(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

/** کد رهگیری سفارش: SV-8F3K29 */
export function generateOrderNumber(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < 6; i++) out += chars[Math.floor(Math.random() * chars.length)];
  const ts = Date.now().toString(36).toUpperCase().slice(-4);
  return `SV-${ts}${out}`;
}

/** شناسه پرداخت sandbox */
export function generateAuthority(): string {
  const chars = "0123456789abcdef";
  let out = "";
  for (let i = 0; i < 32; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

/** درصد تخفیف محصول (۰ تا ۱۰۰) */
export function discountPercent(price: number, discountPrice?: number | null): number {
  if (!discountPrice || discountPrice >= price || price <= 0) return 0;
  return Math.round(((price - discountPrice) / price) * 100);
}

/** قیمت مؤثر محصول */
export function effectivePrice(price: number, discountPrice?: number | null): number {
  return discountPrice && discountPrice < price ? discountPrice : price;
}

/** تقسیم آرایه به بخش‌های هم‌اندازه */
export function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

/** محدوده صفحه‌بندی */
export function paginationRange(page: number, totalPages: number, span = 2): (number | "…")[] {
  if (totalPages <= 1) return [1];
  const start = Math.max(1, page - span);
  const end = Math.min(totalPages, page + span);
  const items: (number | "…")[] = [];
  if (start > 1) {
    items.push(1);
    if (start > 2) items.push("…");
  }
  for (let i = start; i <= end; i++) items.push(i);
  if (end < totalPages) {
    if (end < totalPages - 1) items.push("…");
    items.push(totalPages);
  }
  return items;
}

/** تبدیل رشته ماتریکس رنگی به پس‌زمینه CSS */
export function hexToRgba(hex: string, alpha = 1): string {
  const h = hex.replace("#", "");
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  const n = parseInt(full, 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`;
}

/** متن کوتاه‌شده */
export function truncate(text: string, max = 100): string {
  if (text.length <= max) return text;
  return `${text.slice(0, max).trim()}…`;
}

/** بررسی ایمیل */
export function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim());
}

/** بررسی شماره موبایل ایران */
export function isPhone(value: string): boolean {
  const digits = value.replace(/[^\d]/g, "");
  return /^(09|\+989)\d{9}$/.test(digits) || /^9\d{9}$/.test(digits);
}

/** نرمال‌سازی شماره موبایل */
export function normalizePhone(value: string): string {
  let d = value.replace(/[^\d]/g, "");
  if (d.startsWith("0098")) d = d.slice(4);
  else if (d.startsWith("+98")) d = d.slice(3);
  else if (d.startsWith("98")) d = d.slice(2);
  if (d.length === 10 && d.startsWith("9")) d = `0${d}`;
  return d;
}

/** نرمال‌سازی کد پستی */
export function normalizePostal(value: string): string {
  return value.replace(/[^\d]/g, "").slice(0, 10);
}

/** تعیین وضعیت موجودی */
export type StockState = "in" | "low" | "out";

export function stockState(stock: number): StockState {
  if (stock <= 0) return "out";
  if (stock <= 5) return "low";
  return "in";
}

export const stockLabel: Record<StockState, string> = {
  in: "موجود در انبار",
  low: "تنها چند عدد باقی مانده",
  out: "ناموجود",
};
