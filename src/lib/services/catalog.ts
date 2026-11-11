import "server-only";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import type {
  BannerDTO,
  BrandDTO,
  CategoryDTO,
  ProductCardDTO,
  ProductDetailDTO,
  ReviewDTO,
} from "@/types";

/** نقشه‌ی انتخاب فیلدهای کارت محصول */
const cardSelect = {
  id: true,
  slug: true,
  name: true,
  price: true,
  discountPrice: true,
  rating: true,
  reviewCount: true,
  soldCount: true,
  viewCount: true,
  stock: true,
  isNew: true,
  isFeatured: true,
  isSpecial: true,
  specialEndsAt: true,
  warranty: true,
  sku: true,
  images: { select: { url: true }, orderBy: { order: "asc" }, take: 1 },
  brand: { select: { name: true, slug: true } },
  category: { select: { name: true, slug: true } },
} satisfies Prisma.ProductSelect;

type CardRow = Prisma.ProductGetPayload<{ select: typeof cardSelect }>;

export function toCard(p: CardRow): ProductCardDTO {
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    image: p.images[0]?.url ?? "/images/placeholder.svg",
    price: p.price,
    discountPrice: p.discountPrice,
    rating: p.rating,
    reviewCount: p.reviewCount,
    soldCount: p.soldCount,
    viewCount: p.viewCount,
    stock: p.stock,
    brandName: p.brand?.name ?? null,
    brandSlug: p.brand?.slug ?? null,
    categoryName: p.category?.name ?? null,
    categorySlug: p.category?.slug ?? null,
    isNew: p.isNew,
    isFeatured: p.isFeatured,
    isSpecial: p.isSpecial,
    specialEndsAt: p.specialEndsAt?.toISOString() ?? null,
    warranty: p.warranty,
    sku: p.sku,
  };
}

// ------------------------------- دسته‌بندی -------------------------------

export async function getRootCategories(): Promise<CategoryDTO[]> {
  const rows = await prisma.category.findMany({
    where: { parentId: null, isActive: true },
    orderBy: [{ order: "asc" }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      image: true,
      icon: true,
      _count: { select: { products: true } },
      children: {
        where: { isActive: true },
        orderBy: { order: "asc" },
        select: { id: true, name: true, slug: true, icon: true },
      },
    },
  });

  // اکثر محصولات به زیردسته‌ها متصل‌اند؛ برای شمارش درست، محصولات
  // دسته‌های فرزند را هم جمع می‌زنیم.
  const childIds = rows.flatMap((c) => c.children.map((ch) => ch.id));
  const counts = childIds.length
    ? await prisma.product.groupBy({
        by: ["categoryId"],
        where: { categoryId: { in: childIds } },
        _count: { _all: true },
      })
    : [];
  const countMap = new Map(counts.map((row) => [row.categoryId, row._count._all]));

  return rows.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    description: c.description,
    image: c.image,
    icon: c.icon,
    productCount:
      c._count.products +
      c.children.reduce((sum, ch) => sum + (countMap.get(ch.id) ?? 0), 0),
    children: c.children.map((ch) => ({
      id: ch.id,
      name: ch.name,
      slug: ch.slug,
      icon: ch.icon,
    })),
  }));
}

export async function getCategoryBySlug(slug: string) {
  const cat = await prisma.category.findUnique({
    where: { slug },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      image: true,
      icon: true,
      parent: { select: { id: true, name: true, slug: true } },
      children: {
        where: { isActive: true },
        orderBy: { order: "asc" },
        select: { id: true, name: true, slug: true, icon: true },
      },
      _count: { select: { products: true } },
    },
  });
  if (!cat) return null;

  // شناسه‌ی دسته + زیردسته‌ها برای فیلتر
  const ids = [cat.id, ...cat.children.map((c) => c.id)];

  const [brands, priceAgg, attrRows] = await Promise.all([
    prisma.brand.findMany({
      where: { products: { some: { categoryId: { in: ids } } }, isActive: true },
      select: { id: true, name: true, slug: true, _count: { select: { products: true } } },
      orderBy: { name: "asc" },
    }),
    prisma.product.aggregate({
      where: { categoryId: { in: ids } },
      _min: { price: true },
      _max: { price: true },
    }),
    prisma.productAttribute.findMany({
      where: { product: { categoryId: { in: ids } } },
      select: { key: true, value: true },
      distinct: ["key", "value"],
      take: 240,
    }),
  ]);

  // ویژگی‌های قابل فیلتر: کلیدهایی که حداقل ۲ مقدار متمایز دارند
  const attrMap = new Map<string, Set<string>>();
  for (const a of attrRows) {
    if (!attrMap.has(a.key)) attrMap.set(a.key, new Set());
    attrMap.get(a.key)!.add(a.value);
  }
  const attributes = Array.from(attrMap.entries())
    .filter(([, vals]) => vals.size >= 2)
    .slice(0, 6)
    .map(([key, vals]) => ({ key, values: Array.from(vals).slice(0, 10) }));

  return {
    ...cat,
    productCount: ids.length
      ? await prisma.product.count({ where: { categoryId: { in: ids } } })
      : 0,
    childrenIds: ids,
    brands: brands.map((b) => ({
      id: b.id,
      name: b.name,
      slug: b.slug,
      productCount: b._count.products,
    })),
    priceRange: {
      min: Math.floor((priceAgg._min.price ?? 0) / 100_000) * 100_000,
      max: Math.ceil((priceAgg._max.price ?? 0) / 100_000) * 100_000,
    },
    attributes,
  };
}

// ---------------------------- جستجو و فیلتر -----------------------------

export type ProductQuery = {
  q?: string;
  categorySlug?: string;
  categoryIds?: string[];
  brands?: string[];
  minPrice?: number;
  maxPrice?: number;
  rating?: number;
  inStock?: boolean;
  onSale?: boolean;
  attributes?: { key: string; value: string }[];
  sort?: "newest" | "oldest" | "cheapest" | "expensive" | "popular" | "bestselling" | "rating";
  page?: number;
  perPage?: number;
};

function orderByFor(sort: ProductQuery["sort"]): Prisma.ProductOrderByWithRelationInput[] {
  switch (sort) {
    case "cheapest":
      return [{ discountPrice: { sort: "asc", nulls: "last" } }, { price: "asc" }];
    case "expensive":
      return [{ discountPrice: { sort: "desc", nulls: "last" } }, { price: "desc" }];
    case "popular":
      return [{ viewCount: "desc" }, { soldCount: "desc" }];
    case "bestselling":
      return [{ soldCount: "desc" }, { reviewCount: "desc" }];
    case "rating":
      return [{ rating: "desc" }, { reviewCount: "desc" }];
    case "oldest":
      return [{ createdAt: "asc" }];
    case "newest":
    default:
      return [{ isNew: "desc" }, { createdAt: "desc" }];
  }
}

export async function listProducts(query: ProductQuery) {
  const page = Math.max(1, query.page ?? 1);
  const perPage = Math.min(48, Math.max(1, query.perPage ?? 12));

  const where: Prisma.ProductWhereInput = {};

  if (query.categoryIds?.length) where.categoryId = { in: query.categoryIds };
  else if (query.categorySlug) where.category = { slug: query.categorySlug };

  if (query.brands?.length) where.brand = { slug: { in: query.brands } };

  if (query.minPrice != null || query.maxPrice != null) {
    where.AND = [
      ...(Array.isArray(where.AND) ? where.AND : where.AND ? [where.AND] : []),
      {
        OR: [
          { discountPrice: { not: null } },
          { discountPrice: null },
        ],
      },
    ];
    // فیلتر قیمت مؤثر: از discountPrice در صورت وجود، وگرنه price
    where.OR = [
      {
        discountPrice: {
          not: null,
          gte: query.minPrice ?? 0,
          lte: query.maxPrice ?? Number.MAX_SAFE_INTEGER,
        },
      },
      {
        AND: [
          { discountPrice: null },
          {
            price: {
              gte: query.minPrice ?? 0,
              lte: query.maxPrice ?? Number.MAX_SAFE_INTEGER,
            },
          },
        ],
      },
    ];
  }

  if (query.rating) where.rating = { gte: query.rating };
  if (query.inStock) where.stock = { gt: 0 };
  if (query.onSale) where.discountPrice = { not: null };

  if (query.q) {
    where.OR = [
      ...(where.OR ? (Array.isArray(where.OR) ? where.OR : [where.OR]) : []),
      { name: { contains: query.q, mode: "insensitive" } },
      { shortDesc: { contains: query.q, mode: "insensitive" } },
      { description: { contains: query.q, mode: "insensitive" } },
      { sku: { contains: query.q, mode: "insensitive" } },
      { brand: { name: { contains: query.q, mode: "insensitive" } } },
      { category: { name: { contains: query.q, mode: "insensitive" } } },
    ];
  }

  if (query.attributes?.length) {
    where.AND = [
      ...(Array.isArray(where.AND) ? where.AND : where.AND ? [where.AND] : []),
      ...query.attributes.map((a) => ({
        attrs: { some: { key: a.key, value: a.value } },
      })),
    ];
  }

  const [total, rows] = await Promise.all([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      select: cardSelect,
      orderBy: orderByFor(query.sort),
      skip: (page - 1) * perPage,
      take: perPage,
    }),
  ]);

  return {
    items: rows.map(toCard),
    total,
    page,
    perPage,
    totalPages: Math.max(1, Math.ceil(total / perPage)),
  };
}

// -------------------------------- محصول ---------------------------------

export async function getProductBySlug(slug: string): Promise<ProductDetailDTO | null> {
  const p = await prisma.product.findUnique({
    where: { slug },
    select: {
      id: true,
      slug: true,
      name: true,
      sku: true,
      description: true,
      shortDesc: true,
      price: true,
      discountPrice: true,
      stock: true,
      rating: true,
      reviewCount: true,
      soldCount: true,
      viewCount: true,
      isNew: true,
      isFeatured: true,
      isSpecial: true,
      specialEndsAt: true,
      warranty: true,
      categoryId: true,
      brandId: true,
      category: { select: { name: true, slug: true, id: true } },
      brand: { select: { name: true, slug: true, id: true } },
      images: { select: { url: true, alt: true }, orderBy: { order: "asc" } },
      variants: {
        where: { isActive: true },
        orderBy: { order: "asc" },
        select: {
          id: true,
          name: true,
          sku: true,
          price: true,
          stock: true,
          colorName: true,
          colorHex: true,
          attributes: true,
        },
      },
      attrs: { orderBy: [{ group: "asc" }, { order: "asc" }] },
      reviews: {
        where: { isApproved: true },
        orderBy: { createdAt: "desc" },
        take: 20,
        select: {
          id: true,
          rating: true,
          title: true,
          body: true,
          pros: true,
          cons: true,
          isRecommended: true,
          reply: true,
          createdAt: true,
          user: { select: { name: true } },
        },
      },
      questions: {
        where: { isApproved: true },
        orderBy: { createdAt: "desc" },
        take: 12,
        select: {
          id: true,
          body: true,
          answer: true,
          createdAt: true,
          user: { select: { name: true } },
        },
      },
    },
  });

  if (!p) return null;

  // گروه‌بندی ویژگی‌ها
  const groups = new Map<string, { key: string; value: string }[]>();
  for (const a of p.attrs) {
    if (!groups.has(a.group)) groups.set(a.group, []);
    groups.get(a.group)!.push({ key: a.key, value: a.value });
  }

  // توزیع امتیاز
  const breakdown = [0, 0, 0, 0, 0];
  for (const r of p.reviews) {
    if (r.rating >= 1 && r.rating <= 5) breakdown[r.rating - 1]++;
  }

  const [similar, related] = await Promise.all([
    prisma.product.findMany({
      where: {
        categoryId: p.categoryId,
        id: { not: p.id },
      },
      select: cardSelect,
      orderBy: { soldCount: "desc" },
      take: 8,
    }),
    prisma.product.findMany({
      where: {
        id: { not: p.id },
        OR: [
          { brandId: p.brandId ?? undefined },
          { categoryId: p.categoryId },
        ],
      },
      select: cardSelect,
      orderBy: [{ rating: "desc" }, { viewCount: "desc" }],
      take: 8,
    }),
  ]);

  const reviews: ReviewDTO[] = p.reviews.map((r) => ({
    id: r.id,
    rating: r.rating,
    title: r.title,
    body: r.body,
    pros: r.pros,
    cons: r.cons,
    isRecommended: r.isRecommended,
    reply: r.reply,
    author: r.user.name,
    createdAt: r.createdAt.toISOString(),
  }));

  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    sku: p.sku,
    image: p.images[0]?.url ?? "/images/placeholder.svg",
    images: p.images.map((i) => i.url),
    price: p.price,
    discountPrice: p.discountPrice,
    rating: p.rating,
    reviewCount: p.reviewCount,
    soldCount: p.soldCount,
    viewCount: p.viewCount,
    stock: p.stock,
    brandName: p.brand?.name ?? null,
    brandSlug: p.brand?.slug ?? null,
    categoryName: p.category?.name ?? null,
    categorySlug: p.category?.slug ?? null,
    isNew: p.isNew,
    isFeatured: p.isFeatured,
    isSpecial: p.isSpecial,
    specialEndsAt: p.specialEndsAt?.toISOString() ?? null,
    warranty: p.warranty,
    shortDesc: p.shortDesc,
    description: p.description,
    variants: p.variants.map((v) => ({
      id: v.id,
      name: v.name,
      sku: v.sku,
      price: v.price,
      stock: v.stock,
      colorName: v.colorName,
      colorHex: v.colorHex,
      attributes: (v.attributes as Record<string, string> | null) ?? null,
    })),
    attributeGroups: Array.from(groups.entries()).map(([group, items]) => ({ group, items })),
    reviews,
    questions: p.questions.map((q) => ({
      id: q.id,
      body: q.body,
      answer: q.answer,
      author: q.user.name,
      createdAt: q.createdAt.toISOString(),
    })),
    ratingBreakdown: breakdown,
    related: related.map(toCard),
    similar: similar.map(toCard),
  };
}

/** محصولات مشابه سبک (برای API) */
export async function getRelatedProducts(productId: string, limit = 8) {
  const p = await prisma.product.findUnique({
    where: { id: productId },
    select: { categoryId: true },
  });
  if (!p) return [];
  const rows = await prisma.product.findMany({
    where: { categoryId: p.categoryId, id: { not: productId } },
    select: cardSelect,
    orderBy: { soldCount: "desc" },
    take: limit,
  });
  return rows.map(toCard);
}

// ------------------------------- صفحه اصلی -------------------------------

export async function getBanners(): Promise<BannerDTO[]> {
  const rows = await prisma.banner.findMany({
    where: { isActive: true },
    orderBy: { order: "asc" },
    select: {
      id: true,
      title: true,
      subtitle: true,
      image: true,
      link: true,
      badge: true,
      theme: true,
    },
  });
  return rows;
}

export async function getPopularBrands(): Promise<BrandDTO[]> {
  const rows = await prisma.brand.findMany({
    where: { isActive: true, isPopular: true },
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      slug: true,
      logo: true,
      country: true,
      _count: { select: { products: true } },
    },
  });
  return rows.map((b) => ({
    id: b.id,
    name: b.name,
    slug: b.slug,
    logo: b.logo,
    country: b.country,
    productCount: b._count.products,
  }));
}

export async function getHomeData() {
  const [featured, bestsellers, newest, specials, categories, brands, banners] =
    await Promise.all([
      prisma.product.findMany({
        where: { isFeatured: true },
        select: cardSelect,
        orderBy: [{ soldCount: "desc" }, { createdAt: "desc" }],
        take: 10,
      }),
      prisma.product.findMany({
        select: cardSelect,
        orderBy: { soldCount: "desc" },
        take: 10,
      }),
      prisma.product.findMany({
        select: cardSelect,
        orderBy: [{ isNew: "desc" }, { createdAt: "desc" }],
        take: 10,
      }),
      prisma.product.findMany({
        where: { isSpecial: true },
        select: cardSelect,
        orderBy: { specialEndsAt: "asc" },
        take: 8,
      }),
      prisma.category.findMany({
        where: { isActive: true, parentId: null, isPopular: true },
        orderBy: { order: "asc" },
        include: {
          _count: { select: { products: true } },
          children: { where: { isActive: true }, select: { id: true } },
        },
      }),
      getPopularBrands(),
      getBanners(),
    ]);

  // تخفیف‌دارها به عنوان «تخفیف ویژه»
  const deals = await prisma.product.findMany({
    where: { discountPrice: { not: null } },
    select: cardSelect,
    orderBy: { soldCount: "desc" },
    take: 10,
  });

  // شمارش محصولات زیردسته‌ها برای نمایش درست تعداد کالاهای هر دسته
  const homeChildIds = categories.flatMap((c) => c.children.map((ch) => ch.id));
  const homeCounts = homeChildIds.length
    ? await prisma.product.groupBy({
        by: ["categoryId"],
        where: { categoryId: { in: homeChildIds } },
        _count: { _all: true },
      })
    : [];
  const homeCountMap = new Map(
    homeCounts.map((row) => [row.categoryId, row._count._all]),
  );

  return {
    featured: featured.map(toCard),
    bestsellers: bestsellers.map(toCard),
    newest: newest.map(toCard),
    specials: specials.map(toCard),
    deals: deals.map(toCard),
    categories: categories.map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      description: c.description,
      image: c.image,
      icon: c.icon,
      productCount:
        c._count.products +
        c.children.reduce((sum, ch) => sum + (homeCountMap.get(ch.id) ?? 0), 0),
    })),
    brands,
    banners,
  };
}

export async function getSuggestionItems(q: string) {
  if (!q.trim()) return [];
  const rows = await prisma.product.findMany({
    where: {
      OR: [
        { name: { contains: q, mode: "insensitive" } },
        { brand: { name: { contains: q, mode: "insensitive" } } },
        { category: { name: { contains: q, mode: "insensitive" } } },
      ],
    },
    select: {
      id: true,
      slug: true,
      name: true,
      price: true,
      discountPrice: true,
      images: { select: { url: true }, take: 1, orderBy: { order: "asc" } },
    },
    orderBy: { soldCount: "desc" },
    take: 6,
  });
  return rows.map((r) => ({
    id: r.id,
    slug: r.slug,
    name: r.name,
    price: r.price,
    discountPrice: r.discountPrice,
    image: r.images[0]?.url ?? "/images/placeholder.svg",
  }));
}

/** افزایش شمارنده بازدید محصول (بدون شکست صفحه در صورت خطا) */
export async function incrementProductView(productId: string): Promise<void> {
  try {
    await prisma.product.update({
      where: { id: productId },
      data: { viewCount: { increment: 1 } },
    });
  } catch {
    // شمارنده بازدید نباید نمایش صفحه را متوقف کند.
  }
}

/** نزدیک‌ترین زمان پایان پیشنهاد شگفت‌انگیز (برای شمارش معکوس) */
export async function getNextSpecialEnd(): Promise<string | null> {
  const row = await prisma.product.findFirst({
    where: { isSpecial: true, specialEndsAt: { gt: new Date() } },
    orderBy: { specialEndsAt: "asc" },
    select: { specialEndsAt: true },
  });
  return row?.specialEndsAt?.toISOString() ?? null;
}

/** فیلترهای قابل استفاده برای فهرست محصولات (همه یا یک دسته) */
export async function getFacets(categoryIds?: string[]) {
  const scope = categoryIds?.length ? { categoryId: { in: categoryIds } } : {};

  const [brands, priceAgg, attrRows] = await Promise.all([
    prisma.brand.findMany({
      where: { isActive: true, products: { some: scope } },
      select: { id: true, name: true, slug: true, _count: { select: { products: true } } },
      orderBy: { name: "asc" },
    }),
    prisma.product.aggregate({
      where: scope,
      _min: { price: true },
      _max: { price: true },
    }),
    prisma.productAttribute.findMany({
      where: { product: scope },
      select: { key: true, value: true },
      distinct: ["key", "value"],
      take: 400,
    }),
  ]);

  const attrMap = new Map<string, Set<string>>();
  for (const a of attrRows) {
    if (!attrMap.has(a.key)) attrMap.set(a.key, new Set());
    attrMap.get(a.key)!.add(a.value);
  }

  const attributes = Array.from(attrMap.entries())
    .filter(([, vals]) => vals.size >= 2)
    .slice(0, 8)
    .map(([key, vals]) => ({ key, values: Array.from(vals).slice(0, 12) }));

  return {
    brands: brands.map((b) => ({
      id: b.id,
      name: b.name,
      slug: b.slug,
      productCount: b._count.products,
    })),
    priceRange: {
      min: Math.floor((priceAgg._min.price ?? 0) / 100_000) * 100_000,
      max: Math.ceil((priceAgg._max.price ?? 0) / 100_000) * 100_000,
    },
    attributes,
  };
}

export type Facets = Awaited<ReturnType<typeof getFacets>>;

export async function getBrandBySlug(slug: string) {
  return prisma.brand.findUnique({
    where: { slug },
    select: {
      id: true,
      name: true,
      slug: true,
      logo: true,
      country: true,
      description: true,
      isPopular: true,
      _count: { select: { products: true } },
    },
  });
}

export async function getAllCategories() {
  const rows = await prisma.category.findMany({
    where: { isActive: true },
    orderBy: [{ parentId: "asc" }, { order: "asc" }],
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      image: true,
      icon: true,
      parentId: true,
      isPopular: true,
      _count: { select: { products: true } },
    },
  });

  const roots = rows.filter((r) => !r.parentId);
  return roots.map((r) => ({
    id: r.id,
    name: r.name,
    slug: r.slug,
    description: r.description,
    image: r.image,
    icon: r.icon,
    productCount: r._count.products,
    children: rows
      .filter((c) => c.parentId === r.id)
      .map((c) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        icon: c.icon,
        productCount: c._count.products,
        children: [] as {
          id: string;
          name: string;
          slug: string;
          icon: string | null;
          productCount: number;
          children: never[];
        }[],
      })),
  }));
}

export async function getAllBrands(): Promise<BrandDTO[]> {
  const rows = await prisma.brand.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      slug: true,
      logo: true,
      country: true,
      _count: { select: { products: true } },
    },
  });
  return rows.map((b) => ({
    id: b.id,
    name: b.name,
    slug: b.slug,
    logo: b.logo,
    country: b.country,
    productCount: b._count.products,
  }));
}
