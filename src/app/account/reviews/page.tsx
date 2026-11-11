import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { MessageSquareQuote, Star } from "lucide-react";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDateLong, toPersianDigits } from "@/lib/format";
import { Stars } from "@/components/ui/stars";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/misc";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: `نظرات من`,
  robots: { index: false, follow: false },
};

export default async function AccountReviewsPage() {
  const session = await getSession();
  if (!session) return null;

  const reviews = await prisma.review.findMany({
    where: { userId: session.id },
    orderBy: { createdAt: "desc" },
    include: {
      product: {
        select: {
          name: true,
          slug: true,
          images: { orderBy: { order: "asc" }, take: 1, select: { url: true } },
          brand: { select: { name: true } },
        },
      },
    },
  });

  const approved = reviews.filter((r) => r.isApproved).length;
  const average =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-ink-100 bg-white p-4 shadow-xs">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="flex items-center gap-1.5 text-base font-black text-ink-900">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent-100 text-accent-700">
                <Star className="h-4 w-4" />
              </span>
              نظرات من
            </h1>
            <p className="mt-1 text-[11px] leading-5 text-ink-500">
              نظراتی که برای محصولات ثبت کرده‌اید و پاسخ فروشگاه به آن‌ها.
            </p>
          </div>
          <div className="flex gap-2">
            <div className="rounded-xl bg-ink-50 px-3 py-2 text-center">
              <p className="text-[9px] text-ink-500">کل نظرات</p>
              <p className="mt-0.5 text-sm font-black text-ink-900">
                {toPersianDigits(reviews.length)}
              </p>
            </div>
            <div className="rounded-xl bg-success-100/60 px-3 py-2 text-center">
              <p className="text-[9px] text-success-600">تأییدشده</p>
              <p className="mt-0.5 text-sm font-black text-success-600">
                {toPersianDigits(approved)}
              </p>
            </div>
            <div className="rounded-xl bg-accent-100/60 px-3 py-2 text-center">
              <p className="text-[9px] text-accent-700">میانگین امتیاز</p>
              <p className="mt-0.5 text-sm font-black text-accent-700">
                {toPersianDigits(average.toFixed(1).replace(".", "٫"))}
              </p>
            </div>
          </div>
        </div>
      </div>

      {reviews.length === 0 ? (
        <EmptyState
          icon={<MessageSquareQuote className="h-8 w-8" />}
          title="هنوز نظری ثبت نکرده‌اید"
          description="پس از خرید محصولات، تجربه خود را با دیگران به اشتراک بگذارید تا به انتخاب بهتر آن‌ها کمک کنید."
          action={
            <Button asChild>
              <Link href="/products">مشاهده محصولات</Link>
            </Button>
          }
        />
      ) : (
        <ul className="space-y-3">
          {reviews.map((review) => (
            <li
              key={review.id}
              className="rounded-2xl border border-ink-100 bg-white p-4 shadow-xs"
            >
              <div className="flex gap-3">
                <Link
                  href={`/product/${review.product.slug}`}
                  className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-ink-100 bg-ink-50"
                >
                  <Image
                    src={review.product.images[0]?.url ?? "/images/placeholder.svg"}
                    alt={review.product.name}
                    fill
                    sizes="64px"
                    className="object-cover"
                  />
                </Link>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-start justify-between gap-1.5">
                    <Link
                      href={`/product/${review.product.slug}`}
                      className="line-clamp-1 text-[12px] font-black text-ink-900 hover:text-brand-700"
                    >
                      {review.product.name}
                    </Link>
                    <div className="flex items-center gap-1.5">
                      {review.isApproved ? (
                        <Badge variant="success" size="xs">
                          تأییدشده
                        </Badge>
                      ) : (
                        <Badge variant="warning" size="xs">
                          در انتظار تأیید
                        </Badge>
                      )}
                      <span className="text-[9px] text-ink-400">
                        {formatDateLong(review.createdAt)}
                      </span>
                    </div>
                  </div>

                  {review.product.brand?.name && (
                    <p className="mt-0.5 text-[10px] text-ink-400">
                      {review.product.brand.name}
                    </p>
                  )}

                  <div className="mt-1.5 flex items-center gap-2">
                    <Stars value={review.rating} size={13} />
                    <span className="text-[10px] font-bold text-ink-600">
                      {toPersianDigits(review.rating)} از{" "}
                      {toPersianDigits(5)}
                    </span>
                  </div>

                  <p className="mt-1.5 text-[12px] font-black text-ink-800">
                    {review.title}
                  </p>
                  <p className="mt-1 text-[11px] leading-6 text-ink-600">
                    {review.body}
                  </p>

                  {(review.pros || review.cons) && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {review.pros && (
                        <Badge variant="success" size="xs">
                          مزیت: {review.pros}
                        </Badge>
                      )}
                      {review.cons && (
                        <Badge variant="danger" size="xs">
                          عیب: {review.cons}
                        </Badge>
                      )}
                    </div>
                  )}

                  {review.reply && (
                    <div className="mt-2.5 rounded-xl border-r-2 border-brand-400 bg-brand-50/60 px-3 py-2">
                      <p className="text-[9px] font-black text-brand-800">
                        پاسخ سَروا
                      </p>
                      <p className="mt-0.5 text-[10px] leading-5 text-ink-600">
                        {review.reply}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
