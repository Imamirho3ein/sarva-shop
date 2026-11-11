import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { ok, route } from "@/lib/api";
import { adminBannerSchema } from "@/lib/admin-validators";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

export const PATCH = route(async (req: Request, ctx: Ctx) => {
  await requireAdmin();
  const { id } = await ctx.params;
  const input = adminBannerSchema.partial().parse(await req.json());

  const banner = await prisma.banner.update({
    where: { id },
    data: {
      ...(input.title !== undefined ? { title: input.title } : {}),
      ...(input.subtitle !== undefined ? { subtitle: input.subtitle || null } : {}),
      ...(input.image !== undefined ? { image: input.image } : {}),
      ...(input.link !== undefined ? { link: input.link || null } : {}),
      ...(input.badge !== undefined ? { badge: input.badge || null } : {}),
      ...(input.theme !== undefined ? { theme: input.theme } : {}),
      ...(input.order !== undefined ? { order: input.order } : {}),
      ...(input.isActive !== undefined ? { isActive: input.isActive } : {}),
      ...(input.startsAt !== undefined ? { startsAt: input.startsAt ?? null } : {}),
      ...(input.endsAt !== undefined ? { endsAt: input.endsAt ?? null } : {}),
    },
    select: { id: true },
  });

  revalidatePath("/admin/banners");
  revalidatePath("/");
  return ok({ banner });
});

export const DELETE = route(async (_req: Request, ctx: Ctx) => {
  await requireAdmin();
  const { id } = await ctx.params;

  await prisma.banner.delete({ where: { id } });
  revalidatePath("/admin/banners");
  revalidatePath("/");
  return ok({ deleted: true });
});
