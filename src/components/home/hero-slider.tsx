"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { toPersianDigits } from "@/lib/format";
import type { BannerDTO } from "@/types";

/**
 * اسلایدر بنر صفحه اصلی — با پشتیبانی RTL، پخش خودکار و کنترل دستی.
 */
export function HeroSlider({ banners }: { banners: BannerDTO[] }) {
  const [index, setIndex] = React.useState(0);
  const [paused, setPaused] = React.useState(false);
  const count = banners.length;

  React.useEffect(() => {
    if (paused || count <= 1) return;
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % count);
    }, 6500);
    return () => clearInterval(timer);
  }, [paused, count]);

  if (!count) return null;

  const go = (dir: number) => setIndex((i) => (i + dir + count) % count);
  const active = banners[index];

  return (
    <div
      className="group relative h-[240px] overflow-hidden rounded-2xl bg-ink-900 shadow-card sm:h-[320px] lg:h-[380px]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      role="region"
      aria-roledescription="carousel"
      aria-label="بنرهای ویژه"
    >
      <AnimatePresence initial={false} mode="popLayout">
        <motion.div
          key={active.id}
          initial={{ opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-0"
        >
          <Image
            src={active.image}
            alt={active.title}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 1000px"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-l from-black/10 via-black/35 to-black/70" />
        </motion.div>
      </AnimatePresence>

      <div className="relative z-10 flex h-full flex-col justify-center gap-3 p-6 text-white sm:gap-4 sm:p-10 lg:p-12">
        {active.badge && (
          <motion.span
            key={`${active.id}-badge`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="inline-flex w-fit items-center gap-1.5 rounded-full bg-accent-500 px-3 py-1 text-[11px] font-black text-white shadow-soft"
          >
            <Sparkles className="h-3.5 w-3.5" />
            {active.badge}
          </motion.span>
        )}
        <motion.h1
          key={`${active.id}-title`}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.45 }}
          className="max-w-lg text-2xl font-black leading-tight text-shadow-soft sm:text-3xl lg:text-4xl"
        >
          {active.title}
        </motion.h1>
        {active.subtitle && (
          <motion.p
            key={`${active.id}-sub`}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.45 }}
            className="max-w-md text-sm font-medium leading-7 text-white/85 sm:text-base"
          >
            {active.subtitle}
          </motion.p>
        )}
        {active.link && (
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Link
              href={active.link}
              className="inline-flex h-11 items-center gap-2 rounded-xl bg-white px-6 text-sm font-extrabold text-ink-900 shadow-soft transition-transform hover:scale-[1.03]"
            >
              مشاهده و خرید
              <ChevronLeft className="h-4 w-4" />
            </Link>
          </motion.div>
        )}
      </div>

      {count > 1 && (
        <>
          <div className="absolute bottom-5 left-5 z-20 flex items-center gap-1.5">
            {banners.map((b, i) => (
              <button
                key={b.id}
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`اسلاید ${i + 1}`}
                aria-current={i === index}
                className={cn(
                  "h-1.5 rounded-full transition-all duration-300",
                  i === index ? "w-7 bg-white" : "w-2.5 bg-white/40 hover:bg-white/70",
                )}
              />
            ))}
          </div>

          <div className="absolute bottom-5 right-5 z-20 flex items-center gap-2">
            <button
              type="button"
              onClick={() => go(-1)}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/25 bg-white/10 text-white backdrop-blur transition-colors hover:bg-white/20"
              aria-label="اسلاید قبلی"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
            <span className="min-w-9 text-center text-xs font-black tabular text-white/80">
              {toPersianDigits(index + 1)} / {toPersianDigits(count)}
            </span>
            <button
              type="button"
              onClick={() => go(1)}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/25 bg-white/10 text-white backdrop-blur transition-colors hover:bg-white/20"
              aria-label="اسلاید بعدی"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          </div>
        </>
      )}
    </div>
  );
}
