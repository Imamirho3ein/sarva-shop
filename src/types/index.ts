/**
 * DTOهای سراسری — لایه‌ی انتزاعی بین دیتابیس و UI.
 * کامپوننت‌ها فقط با این تایپ‌ها کار می‌کنند تا تغییر اسکیما به UI آسیب نزند.
 */

export type ProductCardDTO = {
  id: string;
  slug: string;
  name: string;
  image: string;
  price: number;
  discountPrice?: number | null;
  rating: number;
  reviewCount: number;
  soldCount: number;
  viewCount?: number;
  stock: number;
  brandName?: string | null;
  brandSlug?: string | null;
  categoryName?: string | null;
  categorySlug?: string | null;
  isNew?: boolean;
  isFeatured?: boolean;
  isSpecial?: boolean;
  specialEndsAt?: string | Date | null;
  warranty?: string | null;
  sku?: string;
};

export type CategoryDTO = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  image?: string | null;
  icon?: string | null;
  productCount?: number;
  children?: CategoryDTO[];
};

export type BrandDTO = {
  id: string;
  name: string;
  slug: string;
  logo?: string | null;
  country?: string | null;
  productCount?: number;
};

export type BannerDTO = {
  id: string;
  title: string;
  subtitle?: string | null;
  image: string;
  link?: string | null;
  badge?: string | null;
  theme?: string;
};

export type VariantDTO = {
  id: string;
  name: string;
  sku: string;
  price?: number | null;
  stock: number;
  colorName?: string | null;
  colorHex?: string | null;
  attributes?: Record<string, string> | null;
};

export type AttributeGroupDTO = {
  group: string;
  items: { key: string; value: string }[];
};

export type ReviewDTO = {
  id: string;
  rating: number;
  title: string;
  body: string;
  pros?: string | null;
  cons?: string | null;
  isRecommended?: boolean | null;
  reply?: string | null;
  author: string;
  createdAt: string;
};

export type QuestionDTO = {
  id: string;
  body: string;
  answer?: string | null;
  author: string;
  createdAt: string;
};

export type ProductDetailDTO = ProductCardDTO & {
  shortDesc?: string | null;
  description: string;
  images: string[];
  variants: VariantDTO[];
  attributeGroups: AttributeGroupDTO[];
  reviews: ReviewDTO[];
  questions: QuestionDTO[];
  ratingBreakdown: number[]; // تعداد برای ۱..۵
  related: ProductCardDTO[];
  similar: ProductCardDTO[];
};

export type CartLineDTO = import("@/lib/cart").CartLine;

export type OrderStatusKey =
  | "PENDING"
  | "PAID"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELED"
  | "REFUNDED";

export type OrderSummaryDTO = {
  id: string;
  orderNumber: string;
  status: OrderStatusKey;
  total: number;
  itemCount: number;
  createdAt: string;
  statusLabel: string;
};

export type OrderItemDTO = {
  id: string;
  productId: string;
  slug: string;
  name: string;
  image: string;
  sku: string | null;
  variantName?: string | null;
  unitPrice: number;
  quantity: number;
  total: number;
};

export type OrderEventDTO = {
  id: string;
  status: string;
  title: string;
  note?: string | null;
  actor: string;
  createdAt: string;
};

export type OrderPaymentDTO = {
  gateway: string;
  status: string;
  refId?: string | null;
  cardPan?: string | null;
  amount: number;
  message?: string | null;
};

export type OrderAddressDTO = {
  label?: string | null;
  receiverName?: string | null;
  receiverPhone?: string | null;
  province?: string | null;
  city?: string | null;
  postalCode?: string | null;
  addressLine?: string | null;
};

export type OrderDetailDTO = OrderSummaryDTO & {
  subtotal: number;
  discount: number;
  productDiscount: number;
  couponDiscount: number;
  shippingFee: number;
  couponCode?: string | null;
  paymentMethod: "ONLINE" | "WALLET" | "COD";
  shippingMethod: "POST" | "COURIER" | "EXPRESS" | "PICKUP";
  trackingCode?: string | null;
  note?: string | null;
  paidAt?: string | null;
  shippedAt?: string | null;
  deliveredAt?: string | null;
  canceledAt?: string | null;
  cancelReason?: string | null;
  address: OrderAddressDTO;
  items: OrderItemDTO[];
  timeline: OrderEventDTO[];
  payment?: OrderPaymentDTO | null;
};

export type AddressDTO = {
  id: string;
  label: string;
  receiverName: string;
  receiverPhone: string;
  province: string;
  city: string;
  postalCode: string;
  address: string;
  isDefault: boolean;
};
