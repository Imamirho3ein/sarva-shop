"use client";

import * as React from "react";
import { toPersianDigits } from "@/lib/format";

/**
 * شمارش معکوس پیشنهادهای شگفت‌انگیز.
 * پس از پایان زمان، همه‌ی خانه‌ها صفر می‌شوند.
 */
export function Countdown({
  endsAt,
  compact = false,
}: {
  endsAt: string | Date | null | undefined;
  compact?: boolean;
}) {
  const target = React.useMemo(() => {
    if (!endsAt) return null;
    const t = new Date(endsAt).getTime();
    return Number.isNaN(t) ? null : t;
  }, [endsAt]);

  const [remaining, setRemaining] = React.useState(() => Math.max(0, (target ?? 0) - Date.now()));

  React.useEffect(() => {
    if (!target) return;
    setRemaining(Math.max(0, target - Date.now()));
    const timer = setInterval(() => {
      setRemaining(Math.max(0, target - Date.now()));
    }, 1000);
    return () => clearInterval(timer);
  }, [target]);

  const totalSec = Math.floor(remaining / 1000);
  const days = Math.floor(totalSec / 86400);
  const hours = Math.floor((totalSec % 86400) / 3600);
  const minutes = Math.floor((totalSec % 3600) / 60);
  const seconds = totalSec % 60;

  const units = [
    { value: days, label: "روز" },
    { value: hours, label: "ساعت" },
    { value: minutes, label: "دقیقه" },
    { value: seconds, label: "ثانیه" },
  ];

  if (!target) return null;

  return (
    <div className={compact ? "flex items-center gap-1" : "flex items-center gap-1.5"} dir="ltr">
      {units.map((u, i) => (
        <React.Fragment key={u.label}>
          <div
            className={
              compact
                ? "flex h-8 min-w-8 flex-col items-center justify-center rounded-lg bg-white/15 px-1 text-white backdrop-blur"
                : "flex h-11 min-w-11 flex-col items-center justify-center rounded-xl bg-white/15 px-1.5 text-white backdrop-blur"
            }
          >
            <span className={compact ? "text-sm font-black tabular" : "text-lg font-black tabular"}>
              {toPersianDigits(String(u.value).padStart(2, "0"))}
            </span>
            {!compact && (
              <span className="text-[8px] font-bold text-white/70">{u.label}</span>
            )}
          </div>
          {i < units.length - 1 && (
            <span className={compact ? "text-xs font-black text-white/60" : "text-base font-black text-white/60"}>
              :
            </span>
          )}
        </React.Fragment>
      ))}
    </div>
  );
}
