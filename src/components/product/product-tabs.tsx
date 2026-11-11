"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  Info,
  MessageCircle,
  Send,
  Star,
  ThumbsUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDate, toPersianDigits } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { RatingBreakdown, StarInput, Stars } from "@/components/ui/stars";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { useToast } from "@/components/ui/toast";
import type { ProductDetailDTO } from "@/types";

/**
 * تب‌های اطلاعات محصول: مشخصات، توضیحات، نظرات و پرسش و پاسخ.
 */
export function ProductTabs({ product }: { product: ProductDetailDTO }) {
  const reviewCount = product.reviews.length;
  const questionCount = product.questions.length;

  return (
    <Tabs defaultValue="specs" className="mt-6">
      <div className="overflow-x-auto">
        <TabsList className="w-max min-w-full justify-start">
          <TabsTrigger value="specs">مشخصات فنی</TabsTrigger>
          <TabsTrigger value="description">توضیحات</TabsTrigger>
          <TabsTrigger value="reviews">
            نظرات
            <span className="mr-1.5 rounded-md bg-ink-100 px-1.5 text-[10px] font-bold text-ink-500">
              {toPersianDigits(product.reviewCount || reviewCount)}
            </span>
          </TabsTrigger>
          <TabsTrigger value="questions">
            پرسش و پاسخ
            <span className="mr-1.5 rounded-md bg-ink-100 px-1.5 text-[10px] font-bold text-ink-500">
              {toPersianDigits(questionCount)}
            </span>
          </TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="specs">
        <div className="grid gap-3 lg:grid-cols-[1fr_320px]">
          <div className="rounded-2xl border border-ink-100 bg-white p-4 shadow-xs sm:p-5">
            <h2 className="text-sm font-black text-ink-900">مشخصات فنی</h2>
            {product.shortDesc && (
              <p className="mt-1.5 text-[12px] leading-6 text-ink-500">{product.shortDesc}</p>
            )}

            {product.attributeGroups.length === 0 ? (
              <p className="mt-4 rounded-xl bg-ink-50 p-3 text-[12px] font-medium text-ink-500">
                مشخصات فنی برای این کالا ثبت نشده است.
              </p>
            ) : (
              <div className="mt-3 divide-y divide-ink-100">
                {product.attributeGroups.map((group) => (
                  <div key={group.group} className="py-2.5">
                    <h3 className="mb-1.5 text-[11px] font-extrabold text-brand-700">
                      {group.group}
                    </h3>
                    <dl className="grid gap-x-6 gap-y-1.5 sm:grid-cols-2">
                      {group.items.map((item, i) => (
                        <div
                          key={`${item.key}-${i}`}
                          className="flex items-baseline justify-between gap-3 rounded-lg px-2 py-1 odd:bg-ink-50/60"
                        >
                          <dt className="shrink-0 text-[11px] font-medium text-ink-500">
                            {item.key}
                          </dt>
                          <dd className="text-left text-[11px] font-bold text-ink-800">
                            {item.value}
                          </dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                ))}
              </div>
            )}
          </div>

          <aside className="flex flex-col gap-3">
            <div className="rounded-2xl border border-ink-100 bg-white p-4 shadow-xs">
              <h3 className="text-xs font-black text-ink-900">اطلاعات کلی</h3>
              <dl className="mt-2.5 space-y-2 text-[11px]">
                <SpecRow label="برند" value={product.brandName ?? "—"} />
                <SpecRow label="دسته‌بندی" value={product.categoryName ?? "—"} />
                <SpecRow label="کد کالا" value={toPersianDigits(product.sku ?? "—")} />
                <SpecRow label="گارانتی" value={product.warranty ?? "ضمانت اصالت"} />
              </dl>
            </div>
            <div className="rounded-2xl border border-brand-100 bg-brand-50/60 p-4">
              <h3 className="flex items-center gap-1.5 text-xs font-black text-brand-900">
                <Info className="h-4 w-4" />
                نکته خرید
              </h3>
              <p className="mt-1.5 text-[11px] leading-6 text-brand-800/80">
                مشخصات و تصاویر این کالا توسط فروشنده ثبت شده است. در صورت مغایرت، تا ۷ روز
                امکان بازگشت کالا وجود دارد.
              </p>
            </div>
          </aside>
        </div>
      </TabsContent>

      <TabsContent value="description">
        <div className="rounded-2xl border border-ink-100 bg-white p-4 shadow-xs sm:p-6">
          <h2 className="text-sm font-black text-ink-900">درباره این کالا</h2>
          <div className="mt-2.5 flex flex-col gap-3 text-[13px] leading-8 text-ink-600">
            {product.description
              .split(/\n{2,}/)
              .filter(Boolean)
              .map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
              ))}
          </div>

          {product.attributeGroups.length > 0 && (
            <div className="mt-5 rounded-xl bg-ink-50 p-4">
              <h3 className="text-xs font-black text-ink-800">خلاصه ویژگی‌ها</h3>
              <ul className="mt-2 grid gap-1.5 sm:grid-cols-2">
                {product.attributeGroups
                  .flatMap((g) => g.items)
                  .slice(0, 8)
                  .map((item, i) => (
                    <li
                      key={`${item.key}-${i}`}
                      className="flex items-center gap-1.5 text-[11px] font-medium text-ink-600"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-success-500" />
                      <span>
                        {item.key}: <span className="font-bold text-ink-800">{item.value}</span>
                      </span>
                    </li>
                  ))}
              </ul>
            </div>
          )}
        </div>
      </TabsContent>

      <TabsContent value="reviews">
        <ReviewsTab product={product} />
      </TabsContent>

      <TabsContent value="questions">
        <QuestionsTab product={product} />
      </TabsContent>
    </Tabs>
  );
}

function SpecRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="text-ink-500">{label}</dt>
      <dd className="text-left font-bold text-ink-800">{value}</dd>
    </div>
  );
}

// ------------------------------- نظرات -------------------------------

function ReviewsTab({ product }: { product: ProductDetailDTO }) {
  const router = useRouter();
  const toast = useToast();
  const [open, setOpen] = React.useState(false);
  const [rating, setRating] = React.useState(5);
  const [title, setTitle] = React.useState("");
  const [body, setBody] = React.useState("");
  const [recommended, setRecommended] = React.useState(true);
  const [sending, setSending] = React.useState(false);

  const total = product.reviewCount || product.reviews.length;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating < 1) {
      toast.warning("امتیاز را انتخاب کنید");
      return;
    }
    if (body.trim().length < 10) {
      toast.warning("متن نظر خیلی کوتاه است", "حداقل ۱۰ کاراکتر بنویسید.");
      return;
    }
    setSending(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
          rating,
          title: title.trim(),
          body: body.trim(),
          isRecommended: recommended,
        }),
      });
      if (res.status === 401) {
        toast.error("برای ثبت نظر ابتدا وارد شوید", "پس از ورود می‌توانید نظر خود را ثبت کنید.");
        router.push(`/login?next=/product/${product.slug}`);
        return;
      }
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { message?: string };
        toast.error(data.message ?? "ثبت نظر انجام نشد");
        return;
      }
      toast.success("نظر شما ثبت شد", "پس از تأیید کارشناسان نمایش داده می‌شود.");
      setTitle("");
      setBody("");
      setRating(5);
      setOpen(false);
      router.refresh();
    } catch {
      toast.error("خطای شبکه", "لطفاً دوباره تلاش کنید.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="grid gap-3 lg:grid-cols-[1fr_340px]">
      <div className="order-2 flex flex-col gap-3 lg:order-1">
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-ink-100 bg-white p-4 shadow-xs">
          <h2 className="text-sm font-black text-ink-900">
            نظرات کاربران ({toPersianDigits(total)})
          </h2>
          <Button size="sm" variant={open ? "outline" : "primary"} onClick={() => setOpen((v) => !v)}>
            <MessageCircle className="h-4 w-4" />
            {open ? "بستن فرم" : "ثبت نظر"}
          </Button>
        </div>

        {open && (
          <form
            onSubmit={submit}
            className="rounded-2xl border border-ink-100 bg-white p-4 shadow-xs"
          >
            <h3 className="text-xs font-black text-ink-900">تجربه خود را با دیگران به اشتراک بگذارید</h3>
            <div className="mt-3">
              <span className="mb-1.5 block text-[11px] font-bold text-ink-600">
                امتیاز شما به این کالا
              </span>
              <StarInput value={rating} onChange={setRating} size={26} />
            </div>
            <div className="mt-3">
              <Input
                placeholder="عنوان نظر (اختیاری)"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={80}
              />
            </div>
            <div className="mt-3">
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={4}
                maxLength={1200}
                placeholder="نقاط قوت و ضعف کالا را بنویسید…"
                className="w-full resize-y rounded-xl border border-ink-200 bg-white p-3 text-sm text-ink-900 placeholder:text-ink-400 focus:border-brand-600 focus:outline-none focus:ring-4 focus:ring-brand-600/10"
              />
            </div>
            <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
              <Checkbox
                label="این کالا را به دیگران پیشنهاد می‌کنم"
                checked={recommended}
                onChange={(e) => setRecommended(e.target.checked)}
              />
              <Button type="submit" loading={sending} disabled={sending}>
                <Send className="h-4 w-4" />
                ارسال نظر
              </Button>
            </div>
          </form>
        )}

        {product.reviews.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-ink-200 bg-white p-8 text-center">
            <Star className="mx-auto h-8 w-8 text-ink-300" />
            <p className="mt-2 text-sm font-extrabold text-ink-700">
              هنوز نظری برای این کالا ثبت نشده است
            </p>
            <p className="mt-1 text-[11px] text-ink-400">
              اولین نفری باشید که تجربه خود را با دیگران به اشتراک می‌گذارد.
            </p>
          </div>
        ) : (
          product.reviews.map((review) => (
            <article
              key={review.id}
              className="rounded-2xl border border-ink-100 bg-white p-4 shadow-xs"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-50 text-xs font-black text-brand-800">
                    {review.author.slice(0, 1)}
                  </span>
                  <div>
                    <p className="text-xs font-extrabold text-ink-800">{review.author}</p>
                    <p className="mt-0.5 text-[10px] font-medium text-ink-400">
                      {formatDate(review.createdAt)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {review.isRecommended && (
                    <Badge variant="success" size="xs">
                      <ThumbsUp className="h-3 w-3" />
                      پیشنهاد می‌کنم
                    </Badge>
                  )}
                  <Stars value={review.rating} size={13} />
                </div>
              </div>

              {review.title && (
                <h3 className="mt-2.5 text-[12px] font-black text-ink-900">{review.title}</h3>
              )}
              <p className="mt-1 text-[12px] leading-6 text-ink-600">{review.body}</p>

              {(review.pros || review.cons) && (
                <div className="mt-2 grid gap-2 sm:grid-cols-2">
                  {review.pros && (
                    <p className="rounded-lg bg-success-50 px-2.5 py-1.5 text-[10px] font-medium text-success-600">
                      <span className="font-extrabold">نقاط قوت: </span>
                      {review.pros}
                    </p>
                  )}
                  {review.cons && (
                    <p className="rounded-lg bg-danger-50 px-2.5 py-1.5 text-[10px] font-medium text-danger-600">
                      <span className="font-extrabold">نقاط ضعف: </span>
                      {review.cons}
                    </p>
                  )}
                </div>
              )}

              {review.reply && (
                <div className="mt-2.5 rounded-xl border-r-2 border-brand-300 bg-brand-50/60 p-2.5">
                  <p className="text-[10px] font-extrabold text-brand-800">پاسخ سَروا</p>
                  <p className="mt-0.5 text-[11px] leading-5 text-ink-600">{review.reply}</p>
                </div>
              )}
            </article>
          ))
        )}
      </div>

      <aside className="order-1 lg:order-2">
        <div className="rounded-2xl border border-ink-100 bg-white p-4 shadow-xs lg:sticky lg:top-36">
          <div className="flex items-center gap-4 border-b border-ink-100 pb-3">
            <div className="text-center">
              <p className="text-3xl font-black tabular text-ink-900">
                {toPersianDigits(product.rating.toFixed(1).replace(".", "٫"))}
              </p>
              <Stars value={product.rating} size={13} className="mt-1" />
              <p className="mt-1 text-[10px] font-medium text-ink-400">
                از {toPersianDigits(total)} نظر
              </p>
            </div>
            <div className="min-w-0 flex-1">
              <RatingBreakdown counts={product.ratingBreakdown} total={total} />
            </div>
          </div>
          <p className="mt-3 flex items-start gap-1.5 text-[10px] leading-5 text-ink-400">
            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            نظرات پس از بررسی توسط کارشناسان سَروا منتشر می‌شوند.
          </p>
        </div>
      </aside>
    </div>
  );
}

// ---------------------------- پرسش و پاسخ ----------------------------

function QuestionsTab({ product }: { product: ProductDetailDTO }) {
  const router = useRouter();
  const toast = useToast();
  const [body, setBody] = React.useState("");
  const [sending, setSending] = React.useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (body.trim().length < 5) {
      toast.warning("پرسش خود را بنویسید", "حداقل ۵ کاراکتر لازم است.");
      return;
    }
    setSending(true);
    try {
      const res = await fetch("/api/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product.id, body: body.trim() }),
      });
      if (res.status === 401) {
        toast.error("برای ثبت پرسش ابتدا وارد شوید");
        router.push(`/login?next=/product/${product.slug}`);
        return;
      }
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { message?: string };
        toast.error(data.message ?? "ثبت پرسش انجام نشد");
        return;
      }
      toast.success("پرسش شما ثبت شد", "پس از پاسخ کارشناسان نمایش داده می‌شود.");
      setBody("");
      router.refresh();
    } catch {
      toast.error("خطای شبکه", "لطفاً دوباره تلاش کنید.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="grid gap-3 lg:grid-cols-[1fr_340px]">
      <div className="flex flex-col gap-3">
        {product.questions.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-ink-200 bg-white p-8 text-center">
            <MessageCircle className="mx-auto h-8 w-8 text-ink-300" />
            <p className="mt-2 text-sm font-extrabold text-ink-700">
              هنوز پرسشی برای این کالا ثبت نشده است
            </p>
          </div>
        ) : (
          product.questions.map((q) => (
            <div
              key={q.id}
              className="rounded-2xl border border-ink-100 bg-white p-4 shadow-xs"
            >
              <div className="flex items-center justify-between gap-2">
                <p className="flex items-center gap-1.5 text-xs font-extrabold text-ink-800">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-50 text-[10px] font-black text-brand-800">
                    {q.author.slice(0, 1)}
                  </span>
                  {q.author}
                </p>
                <span className="text-[10px] font-medium text-ink-400">
                  {formatDate(q.createdAt)}
                </span>
              </div>
              <p className="mt-2 text-[12px] leading-6 text-ink-700">{q.body}</p>
              {q.answer ? (
                <div className="mt-2 rounded-xl border-r-2 border-brand-300 bg-brand-50/60 p-2.5">
                  <p className="text-[10px] font-extrabold text-brand-800">پاسخ کارشناس سَروا</p>
                  <p className="mt-0.5 text-[11px] leading-5 text-ink-600">{q.answer}</p>
                </div>
              ) : (
                <p className="mt-2 rounded-lg bg-ink-50 px-2.5 py-1.5 text-[10px] font-medium text-ink-400">
                  در انتظار پاسخ کارشناسان…
                </p>
              )}
            </div>
          ))
        )}

        <form onSubmit={submit} className="rounded-2xl border border-ink-100 bg-white p-4 shadow-xs">
          <h3 className="text-xs font-black text-ink-900">پرسش خود را مطرح کنید</h3>
          <div className="mt-2.5">
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={3}
              maxLength={600}
              placeholder="درباره این کالا چه سؤالی دارید؟"
              className="w-full resize-y rounded-xl border border-ink-200 bg-white p-3 text-sm text-ink-900 placeholder:text-ink-400 focus:border-brand-600 focus:outline-none focus:ring-4 focus:ring-brand-600/10"
            />
          </div>
          <div className="mt-2.5 flex justify-end">
            <Button type="submit" loading={sending} disabled={sending}>
              <Send className="h-4 w-4" />
              ثبت پرسش
            </Button>
          </div>
        </form>
      </div>

      <aside className="h-fit rounded-2xl border border-ink-100 bg-white p-4 shadow-xs lg:sticky lg:top-36">
        <h3 className="flex items-center gap-1.5 text-xs font-black text-ink-900">
          <Info className="h-4 w-4 text-brand-700" />
          راهنمای پرسش و پاسخ
        </h3>
        <ul className="mt-2 space-y-1.5 text-[11px] leading-5 text-ink-500">
          <li className="flex gap-1.5">
            <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-success-500" />
            فقط درباره همین کالا سؤال بپرسید.
          </li>
          <li className="flex gap-1.5">
            <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-success-500" />
            از درج اطلاعات شخصی خودداری کنید.
          </li>
          <li className="flex gap-1.5">
            <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-success-500" />
            پاسخ کارشناسان معمولاً در کمتر از ۲۴ ساعت ثبت می‌شود.
          </li>
        </ul>
        <Link
          href="/faq"
          className="mt-3 inline-flex text-[11px] font-extrabold text-brand-700 hover:underline"
        >
          مشاهده سوالات متداول
        </Link>
      </aside>
    </div>
  );
}
