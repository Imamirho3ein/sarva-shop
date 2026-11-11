import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { ok, route } from "@/lib/api";
import { adminBrandSchema } from "@/lib/admin-validators";
import { slugify } from "@/lib/utils";

export const dynamic = "force-dynamic";

/** ایجاد برند */
export const POST = route(async (req: Request) => {
  await requireAdmin();
  const input = adminBrandSchema.parse(await req.json());

  const base = slugify(input.slug || input.name) || `brand-${Date.now()}`;
  const exists = await prisma.brand.findUnique({
    where: { slug: base },
    select: { id: true },
  });
  const slug = exists ? `${base}-${Date.now().toString(36).slice(-4)}` : base;

  const brand = await prisma.brand.create({
    data: {
      name: input.name,
      slug,
      logo: input.logo || null,
      country: input.country || null,
      description: input.description || null,
      isPopular: input.isPopular ?? false,
      isActive: input.isActive ?? true,
    },
    select: { id: true, slug: true },
  });

  revalidatePath("/admin/brands");
  revalidatePath("/brands");
  revalidatePath("/");
  return ok({ brand });
});
