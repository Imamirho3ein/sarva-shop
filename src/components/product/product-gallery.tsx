"use client";

import * as React from "react";
import Image from "next/image";
import { Maximize2, ChevronRight, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge, DiscountBadge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";

/**
 * گالری تصاویر محصول با بزرگ‌نمایی روی هاور و نمایش تمام‌صفحه.
 */
export function ProductGallery({
  images,
  name,
  discount,
  isNew,
  isSpecial,
}: {
  images: string[];
  name: string;
  discount: number;
  isNew?: boolean;
  isSpecial?: boolean;
}) {
  const safeImages = images.length > 0 ? images : ["/images/placeholder.svg"];
  const [active, setActive] = React.useState(0);
  const [zoomed, setZoomed] = React.useState(false);
  const [origin, setOrigin] = React.useState("50% 50%");
  const [lightbox, setLightbox] = React.useState(false);

  const current = safeImages[Math.min(active, safeImages.length - 1)];

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setOrigin(`${x}% ${y}%`);
  };

  const go = (dir: number) => {
    setActive((i) => (i + dir + safeImages.length) % safeImages.length);
  };

  return (
    <div className="flex flex-col gap-3">
      <div
        className="group relative aspect-square overflow-hidden rounded-2xl border border-ink-100 bg-white"
        onMouseEnter={() => setZoomed(true)}
        onMouseLeave={() => {
          setZoomed(false);
          setOrigin("50% 50%");
        }}
        onMouseMove={onMove}
      >
        <Image
          src={current}
          alt={name}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 480px"
          className={cn(
            "object-contain p-4 transition-transform duration-200 ease-out",
            zoomed && "scale-[1.9] cursor-zoom-in",
          )}
          style={{ transformOrigin: origin }}
        />

        <div className="pointer-events-none absolute top-3 right-3 flex flex-col items-end gap-1.5">
          {discount > 0 && <DiscountBadge percent={discount} />}
          {isNew && (
            <Badge variant="solid" size="xs">
              جدید
            </Badge>
          )}
          {isSpecial && (
            <Badge variant="accent" size="xs">
              شگفت‌انگیز
            </Badge>
          )}
        </div>

        <button
          type="button"
          onClick={() => setLightbox(true)}
          aria-label="مشاهده تصویر در اندازه بزرگ"
          className="absolute bottom-3 left-3 flex h-9 items-center gap-1.5 rounded-xl border border-ink-200 bg-white/90 px-3 text-[11px] font-extrabold text-ink-700 shadow-sm backdrop-blur transition-colors hover:border-brand-300 hover:text-brand-800"
        >
          <Maximize2 className="h-3.5 w-3.5" />
          بزرگ‌نمایی
        </button>

        {safeImages.length > 1 && (
          <div className="absolute inset-x-3 bottom-3 flex items-center justify-between opacity-0 transition-opacity duration-200 group-hover:opacity-100">
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label="تصویر بعدی"
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-ink-200 bg-white/90 text-ink-600 shadow-sm backdrop-blur transition-colors hover:text-brand-700"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              aria-label="تصویر قبلی"
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-ink-200 bg-white/90 text-ink-600 shadow-sm backdrop-blur transition-colors hover:text-brand-700"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {safeImages.length > 1 && (
        <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
          {safeImages.map((img, i) => (
            <button
              key={`${img}-${i}`}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`تصویر ${i + 1}`}
              aria-current={i === active}
              className={cn(
                "relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border-2 bg-white transition-all duration-200 sm:h-20 sm:w-20",
                i === active
                  ? "border-brand-600 ring-2 ring-brand-600/15"
                  : "border-ink-100 hover:border-ink-300",
              )}
            >
              <Image
                src={img}
                alt={`${name} - تصویر ${i + 1}`}
                fill
                sizes="80px"
                className="object-contain p-1.5"
              />
            </button>
          ))}
        </div>
      )}

      <Dialog open={lightbox} onOpenChange={setLightbox}>
        <DialogContent size="xl" className="p-2 sm:p-3">
          <DialogTitle className="sr-only">{name}</DialogTitle>
          <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-white">
            <Image
              src={current}
              alt={name}
              fill
              sizes="90vw"
              className="object-contain p-2"
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
