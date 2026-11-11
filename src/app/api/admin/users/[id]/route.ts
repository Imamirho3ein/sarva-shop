import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { fail, ok, route } from "@/lib/api";
import { adminUserSchema } from "@/lib/admin-validators";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

/** تغییر نقش یا وضعیت فعال‌بودن کاربر */
export const PATCH = route(async (req: Request, ctx: Ctx) => {
  const admin = await requireAdmin();
  const { id } = await ctx.params;
  const input = adminUserSchema.parse(await req.json());

  if (id === admin.id && (input.role === "USER" || input.isActive === false)) {
    return fail("امکان حذف دسترسی مدیر از حساب خودتان وجود ندارد.", 422);
  }

  const user = await prisma.user.update({
    where: { id },
    data: {
      ...(input.role !== undefined ? { role: input.role } : {}),
      ...(input.isActive !== undefined ? { isActive: input.isActive } : {}),
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
    },
  });

  revalidatePath("/admin/users");
  return ok({ user });
});
