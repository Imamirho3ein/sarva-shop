import { z } from "zod";
import { productSchema } from "@/lib/validators";

/** تصویر شاخص محصول در فرم مدیریت */
export const adminProductSchema = productSchema.extend({
  image: z.string().trim().max(500).optional().or(z.literal("")),
  imageAlt: z.string().trim().max(120).optional().or(z.literal("")),
});

export type AdminProductInput = z.infer<typeof adminProductSchema>;

export const adminCategorySchema = z.object({
  name: z.string().trim().min(2).max(80),
  slug: z.string().trim().max(80).optional().or(z.literal("")),
  description: z.string().trim().max(500).optional().or(z.literal("")),
  image: z.string().trim().max(500).optional().or(z.literal("")),
  parentId: z.string().nullable().optional(),
  icon: z.string().trim().max(40).optional().or(z.literal("")),
  order: z.coerce.number().int().optional().default(0),
  isPopular: z.boolean().optional().default(false),
  isActive: z.boolean().optional().default(true),
});

export const adminBrandSchema = z.object({
  name: z.string().trim().min(2).max(80),
  slug: z.string().trim().max(80).optional().or(z.literal("")),
  logo: z.string().trim().max(500).optional().or(z.literal("")),
  country: z.string().trim().max(60).optional().or(z.literal("")),
  description: z.string().trim().max(500).optional().or(z.literal("")),
  isPopular: z.boolean().optional().default(false),
  isActive: z.boolean().optional().default(true),
});

export const adminCouponSchema = z.object({
  code: z
    .string()
    .trim()
    .min(3)
    .max(40)
    .transform((v) => v.toUpperCase()),
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

export const adminBannerSchema = z.object({
  title: z.string().trim().min(2).max(120),
  subtitle: z.string().trim().max(200).optional().or(z.literal("")),
  image: z.string().trim().min(1).max(500),
  link: z.string().trim().max(300).optional().or(z.literal("")),
  badge: z.string().trim().max(40).optional().or(z.literal("")),
  theme: z.enum(["light", "dark", "brand", "accent"]).optional().default("light"),
  order: z.coerce.number().int().optional().default(0),
  isActive: z.boolean().optional().default(true),
  startsAt: z.coerce.date().nullable().optional(),
  endsAt: z.coerce.date().nullable().optional(),
});

export const adminUserSchema = z.object({
  role: z.enum(["USER", "ADMIN"]).optional(),
  isActive: z.boolean().optional(),
});

export const adminReviewSchema = z.object({
  isApproved: z.boolean().optional(),
  reply: z.string().trim().max(1000).optional().or(z.literal("")),
});

export const adminInventorySchema = z.object({
  id: z.string().min(1),
  stock: z.coerce.number().int().nonnegative().optional(),
  reservedStock: z.coerce.number().int().nonnegative().optional(),
  price: z.coerce.number().int().nonnegative().optional(),
  discountPrice: z.coerce.number().int().nonnegative().nullable().optional(),
});

export const adminQuestionSchema = z.object({
  answer: z.string().trim().min(2).max(1000),
  isApproved: z.boolean().optional(),
});
