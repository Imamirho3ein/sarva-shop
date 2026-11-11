import { contactSchema } from "@/lib/validators";
import { prisma } from "@/lib/prisma";
import { ok, route } from "@/lib/api";

/** ثبت پیام فرم «تماس با ما» */
export const POST = route(async (req: Request) => {
  const contentType = req.headers.get("content-type") ?? "";

  if (!contentType.includes("application/json")) {
    const form = await req.formData();
    const parsed = contactSchema.safeParse({
      name: form.get("name"),
      email: form.get("email"),
      phone: form.get("phone") ?? "",
      subject: form.get("subject") ?? "general",
      message: form.get("message"),
    });

    const referer = req.headers.get("referer");
    const target = new URL(referer ?? "/contact", req.url);
    target.searchParams.set("contact", parsed.success ? "ok" : "invalid");

    if (parsed.success) {
      await prisma.contactMessage.create({ data: parsed.data });
    }

    return Response.redirect(target, 303);
  }

  const input = contactSchema.parse(await req.json());
  const message = await prisma.contactMessage.create({
    data: input,
    select: { id: true, createdAt: true },
  });

  return ok({
    id: message.id,
    message: "پیام شما ثبت شد. تیم پشتیبانی در اولین فرصت پاسخ می‌دهد.",
  });
});
