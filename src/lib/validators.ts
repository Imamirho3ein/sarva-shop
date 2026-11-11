import { z } from "zod";
import { normalizePhone, normalizePostal } from "@/lib/utils";

const phone = z
  .string()
  .trim()
  .transform(normalizePhone)
  .refine((v) => /^(09)\d{9}$/.test(v), { message: "شماره موبایل معتبر نیست" });

const postal = z
  .string()
  .trim()
  .transform(normalizePostal)
  .refine((v) => v.length === 10, { message: "کد پستی ۱۰ رقمی است" });

const password = z
  .string()
  .min(8, "رمز عبور حداقل ۸ کاراکتر است")
  .max(72)
  .regex(/[A-Za-z]/, "رمز عبور باید حداقل یک حرف انگلیسی داشته باشد");

// ------------------------------ احراز هویت --------------------------------

export const loginSchema = z.object({
  identifier: z.string().trim().min(3, "ایمیل یا شماره موبایل را وارد کنید"),
  password: z.string().min(1, "رمز عبور را وارد کنید"),
  remember: z.boolean().optional().default(true),
});

export const registerSchema = z
  .object({
    name: z.string().trim().min(3, "نام و نام خانوادگی را وارد کنید").max(80),
    email: z.string().trim().email("ایمیل معتبر نیست"),
    phone,
    password,
    confirmPassword: z.string(),
    acceptTerms: z.literal(true, { message: "پذیرش قوانین الزامی است" }),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "رمز عبور و تکرار آن یکسان نیست",
    path: ["confirmPassword"],
  });

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;

// --------------------------------- آدرس -----------------------------------

export const addressSchema = z.object({
  label: z.string().trim().min(1).max(30).default("خانه"),
  receiverName: z.string().trim().min(3, "نام گیرنده را وارد کنید").max(80),
  receiverPhone: phone,
  province: z.string().trim().min(2, "استان را انتخاب کنید"),
  city: z.string().trim().min(2, "شهر را وارد کنید"),
  postalCode: postal,
  address: z.string().trim().min(10, "نشانی را کامل وارد کنید").max(300),
  isDefault: z.boolean().optional().default(false),
});

export type AddressInput = z.infer<typeof addressSchema>;

// --------------------------------- سفارش ----------------------------------

export const checkoutSchema = z.object({
  addressId: z.string().min(1, "آدرس را انتخاب کنید"),
  shippingMethod: z.enum(["POST", "COURIER", "EXPRESS", "PICKUP"]),
  paymentMethod: z.enum(["ONLINE", "WALLET", "COD"]),
  couponCode: z.string().trim().max(40).nullable().optional(),
  note: z.string().trim().max(500).nullable().optional(),
  useWallet: z.boolean().optional().default(false),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;

export const createOrderSchema = checkoutSchema.extend({
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        variantId: z.string().min(1).nullable().optional(),
        quantity: z.coerce.number().int().min(1).max(99),
      }),
    )
    .min(1, "سبد خرید شما خالی است"),
});

export const applyCouponSchema = z.object({
  code: z.string().trim().min(3).max(40),
  subtotal: z.number().int().nonnegative(),
});

// --------------------------------- نظرات ----------------------------------

export const reviewSchema = z.object({
  productId: z.string().min(1),
  rating: z.coerce.number().int().min(1).max(5),
  title: z.string().trim().max(120).optional().or(z.literal("")),
  body: z.string().trim().min(10, "متن نظر حداقل ۱۰ کاراکتر است").max(2000),
  pros: z.string().trim().max(500).optional().or(z.literal("")),
  cons: z.string().trim().max(500).optional().or(z.literal("")),
  isRecommended: z.boolean().optional(),
});

export type ReviewInput = z.infer<typeof reviewSchema>;

export const questionSchema = z.object({
  productId: z.string().min(1),
  body: z.string().trim().min(5, "پرسش را کامل بنویسید").max(500),
});

// --------------------------------- جستجو ----------------------------------

export const searchSchema = z.object({
  q: z.string().trim().max(120).optional().default(""),
  category: z.string().optional(),
  brand: z.array(z.string()).optional(),
  minPrice: z.coerce.number().int().nonnegative().optional(),
  maxPrice: z.coerce.number().int().nonnegative().optional(),
  rating: z.coerce.number().int().min(0).max(5).optional(),
  inStock: z.coerce.boolean().optional(),
  sort: z
    .enum(["newest", "oldest", "cheapest", "expensive", "popular", "bestselling", "rating"])
    .optional()
    .default("newest"),
  page: z.coerce.number().int().min(1).optional().default(1),
  perPage: z.coerce.number().int().min(1).max(48).optional().default(12),
});

export type SearchInput = z.infer<typeof searchSchema>;

// ------------------------------- پنل مدیریت -------------------------------

export const productSchema = z.object({
  name: z.string().trim().min(3).max(200),
  slug: z.string().trim().min(2).max(200).optional().or(z.literal("")),
  sku: z.string().trim().min(2).max(60),
  description: z.string().trim().min(10),
  shortDesc: z.string().trim().max(300).optional().or(z.literal("")),
  price: z.coerce.number().int().nonnegative(),
  discountPrice: z.coerce.number().int().nonnegative().nullable().optional(),
  stock: z.coerce.number().int().nonnegative(),
  categoryId: z.string().min(1, "دسته‌بندی را انتخاب کنید"),
  brandId: z.string().optional().nullable(),
  warranty: z.string().trim().max(80).optional().or(z.literal("")),
  isFeatured: z.boolean().optional().default(false),
  isNew: z.boolean().optional().default(false),
  isSpecial: z.boolean().optional().default(false),
  specialEndsAt: z.coerce.date().nullable().optional(),
});

export type ProductInput = z.infer<typeof productSchema>;

export const categorySchema = z.object({
  name: z.string().trim().min(2).max(80),
  slug: z.string().trim().min(2).max(80).optional().or(z.literal("")),
  description: z.string().trim().max(500).optional().or(z.literal("")),
  parentId: z.string().nullable().optional(),
  icon: z.string().trim().max(40).optional().or(z.literal("")),
  order: z.coerce.number().int().optional().default(0),
  isPopular: z.boolean().optional().default(false),
  isActive: z.boolean().optional().default(true),
});

export const brandSchema = z.object({
  name: z.string().trim().min(2).max(80),
  slug: z.string().trim().min(2).max(80).optional().or(z.literal("")),
  country: z.string().trim().max(60).optional().or(z.literal("")),
  description: z.string().trim().max(500).optional().or(z.literal("")),
  isPopular: z.boolean().optional().default(false),
  isActive: z.boolean().optional().default(true),
});

export const couponSchema = z.object({
  code: z.string().trim().min(3).max(40).transform((v) => v.toUpperCase()),
  type: z.enum(["PERCENT", "FIXED"]),
  value: z.coerce.number().int().positive(),
  minOrder: z.coerce.number().int().nonnegative().optional().default(0),
  maxDiscount: z.coerce.number().int().nonnegative().nullable().optional(),
  usageLimit: z.coerce.number().int().positive().nullable().optional(),
  perUserLimit: z.coerce.number().int().positive().optional().default(1),
  startsAt: z.coerce.date().nullable().optional(),
  expiresAt: z.coerce.date().nullable().optional(),
  description: z.string().trim().max(300).optional().or(z.literal("")),
  isActive: z.boolean().optional().default(true),
});

export const bannerSchema = z.object({
  title: z.string().trim().min(2).max(120),
  subtitle: z.string().trim().max(200).optional().or(z.literal("")),
  image: z.string().trim().min(1),
  link: z.string().trim().max(300).optional().or(z.literal("")),
  badge: z.string().trim().max(40).optional().or(z.literal("")),
  theme: z.enum(["light", "dark", "brand", "accent"]).optional().default("light"),
  order: z.coerce.number().int().optional().default(0),
  isActive: z.boolean().optional().default(true),
  startsAt: z.coerce.date().nullable().optional(),
  endsAt: z.coerce.date().nullable().optional(),
});

export const userUpdateSchema = z.object({
  name: z.string().trim().min(3).max(80).optional(),
  phone: phone.optional(),
  email: z.string().trim().email().optional(),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1),
    newPassword: password,
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "تکرار رمز عبور یکسان نیست",
    path: ["confirmPassword"],
  });

export const orderStatusSchema = z.object({
  status: z.enum([
    "PENDING",
    "PAID",
    "PROCESSING",
    "SHIPPED",
    "DELIVERED",
    "CANCELED",
    "REFUNDED",
  ]),
  trackingCode: z.string().trim().max(40).optional().or(z.literal("")),
  note: z.string().trim().max(300).optional().or(z.literal("")),
});

/** تبدیل خطاهای Zod به شیء پیام فارسی */
// ------------------------------ ارتباط با مشتری ------------------------------

export const newsletterSchema = z.object({
  email: z.string().trim().toLowerCase().email("ایمیل معتبر نیست"),
  source: z.string().trim().max(40).optional().default("footer"),
});

export const contactSchema = z.object({
  name: z.string().trim().min(2, "نام را وارد کنید").max(80),
  email: z.string().trim().toLowerCase().email("ایمیل معتبر نیست"),
  phone: z
    .string()
    .trim()
    .max(20)
    .optional()
    .or(z.literal(""))
    .transform((v) => (v ? v : undefined)),
  subject: z
    .enum(["general", "order", "product", "payment", "partnership", "other"])
    .default("general"),
  message: z
    .string()
    .trim()
    .min(10, "متن پیام باید حداقل ۱۰ کاراکتر باشد")
    .max(2000, "متن پیام طولانی‌تر از حد مجاز است"),
});

export function formatZodError(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "_";
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}
