import { newsletterSchema } from "@/lib/validators";
import { prisma } from "@/lib/prisma";
import { ok, route } from "@/lib/api";

/**
 * عضویت در خبرنامه.
 * هم درخواست JSON (فرم‌های کلاینتی) و هم ارسال معمولی فرم (بدون جاوااسکریپت)
 * را پشتیبانی می‌کند.
 */
export const POST = route(async (req: Request) => {
  const contentType = req.headers.get("content-type") ?? "";

  if (!contentType.includes("application/json")) {
    const form = await req.formData();
    const parsed = newsletterSchema.safeParse({
      email: form.get("email"),
      source: "footer",
    });

    const referer = req.headers.get("referer");
    const target = new URL(referer ?? "/", req.url);
    target.searchParams.set("newsletter", parsed.success ? "ok" : "invalid");

    if (parsed.success) {
      await prisma.newsletterSubscriber.upsert({
        where: { email: parsed.data.email },
        update: { isActive: true, source: parsed.data.source },
        create: { email: parsed.data.email, source: parsed.data.source },
      });
    }

    return Response.redirect(target, 303);
  }

  const input = newsletterSchema.parse(await req.json());
  await prisma.newsletterSubscriber.upsert({
    where: { email: input.email },
    update: { isActive: true, source: input.source },
    create: { email: input.email, source: input.source },
  });

  return ok({ message: "عضویت شما در خبرنامه ثبت شد." });
});
