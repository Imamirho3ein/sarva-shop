import * as React from "react";
import { Star, StarHalf } from "lucide-react";
import { cn, clamp } from "@/lib/utils";
import { formatRating, toPersianDigits } from "@/lib/format";

/**
 * نمایش امتیاز کاربران — با نیم‌ستاره و گزینه تعاملی.
 */

export function Stars({
  value,
  size = 14,
  className,
  showValue = false,
}: {
  value: number;
  size?: number;
  className?: string;
  showValue?: boolean;
}) {
  const safe = clamp(value, 0, 5);
  const full = Math.floor(safe);
  const hasHalf = safe - full >= 0.5;

  return (
    <span
      className={cn("inline-flex items-center gap-1", className)}
      aria-label={`امتیاز ${formatRating(safe)} از ۵`}
    >
      <span className="flex items-center gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => {
          const filled = i < full;
          const half = i === full && hasHalf;
          return (
            <span key={i} className="relative inline-flex">
              <Star
                size={size}
                className="text-ink-300"
                fill="currentColor"
                strokeWidth={0}
              />
              {(filled || half) && (
                <span
                  className="absolute inset-0 overflow-hidden"
                  style={{ width: half ? "50%" : "100%" }}
                >
                  <Star
                    size={size}
                    className="text-warning-500"
                    fill="currentColor"
                    strokeWidth={0}
                  />
                </span>
              )}
            </span>
          );
        })}
      </span>
      {showValue && (
        <span className="text-xs font-black tabular text-ink-700">
          {formatRating(safe)}
        </span>
      )}
    </span>
  );
}

/** امتیازدهی تعاملی برای فرم نظر */
export function StarInput({
  value,
  onChange,
  size = 28,
  id = "rating",
}: {
  value: number;
  onChange: (v: number) => void;
  size?: number;
  id?: string;
}) {
  const [hover, setHover] = React.useState(0);
  const active = hover || value;

  return (
    <div className="flex items-center gap-1.5" role="radiogroup" aria-label="امتیاز">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          id={id}
          aria-label={`${n} ستاره`}
          aria-checked={value === n}
          role="radio"
          onMouseEnter={() => setHover(n)}
          onMouseLeave={() => setHover(0)}
          onClick={() => onChange(n)}
          className="rounded-md p-0.5 transition-transform duration-150 hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600"
        >
          <Star
            size={size}
            className={n <= active ? "text-warning-500" : "text-ink-300"}
            fill="currentColor"
            strokeWidth={0}
          />
        </button>
      ))}
      <span className="mr-2 text-sm font-bold text-ink-600">
        {active > 0 ? `${toPersianDigits(active)} از ۵` : "انتخاب کنید"}
      </span>
    </div>
  );
}

/** توزیع ستاره‌ها برای بلوک نظرات */
export function RatingBreakdown({
  counts,
  total,
}: {
  counts: number[]; // index 0..4 ↔ ۱..۵ ستاره
  total: number;
}) {
  const rows = [5, 4, 3, 2, 1];
  return (
    <div className="space-y-2">
      {rows.map((star) => {
        const c = counts[star - 1] ?? 0;
        const pct = total > 0 ? Math.round((c / total) * 100) : 0;
        return (
          <div key={star} className="flex items-center gap-3">
            <span className="w-8 shrink-0 text-xs font-bold text-ink-600 tabular">
              {toPersianDigits(star)}
            </span>
            <span className="flex items-center gap-0.5">
              <Star size={12} className="text-warning-500" fill="currentColor" strokeWidth={0} />
            </span>
            <span className="h-2 flex-1 overflow-hidden rounded-full bg-ink-100">
              <span
                className="block h-full rounded-full bg-warning-500 transition-all duration-500"
                style={{ width: `${pct}%` }}
              />
            </span>
            <span className="w-8 shrink-0 text-left text-xs font-bold text-ink-500 tabular">
              {toPersianDigits(c)}
            </span>
          </div>
        );
      })}
    </div>
  );
}
