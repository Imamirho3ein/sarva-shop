import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { ok, route } from "@/lib/api";
import { adminBannerSchema } from "@/lib/admin-validators";

export const dynamic = "force-dynamic";

/** ایجاد بنر */
export const POST = route(async (req: Request) => {
  await requireAdmin();
  const input = adminBannerSchema.parse(await req.json());

  const banner = await prisma.banner.create({
    data: {
      title: input.title,
      subtitle: input.subtitle || null,
      image: input.image,
      link: input.link || null,
      badge: input.badge || null,
      theme: input.theme ?? "light",
      order: input.order ?? 0,
      isActive: input.isActive ?? true,
      startsAt: input.startsAt ?? null,
      endsAt: input.endsAt ?? null,
    },
    select: { id: true },
  });

  revalidatePath("/admin/banners");
  revalidatePath("/");
  return ok({ banner });
});
