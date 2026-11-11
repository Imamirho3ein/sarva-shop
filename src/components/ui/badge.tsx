import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-bold leading-5 transition-colors",
  {
    variants: {
      variant: {
        default: "bg-ink-100 text-ink-700",
        brand: "bg-brand-50 text-brand-800 ring-1 ring-inset ring-brand-200",
        accent: "bg-accent-100 text-accent-700",
        danger: "bg-danger-100 text-danger-700",
        success: "bg-success-100 text-success-600",
        warning: "bg-warning-100 text-warning-500",
        outline: "border border-ink-200 bg-white text-ink-600",
        solid: "bg-brand-700 text-white",
        dark: "bg-ink-900 text-white",
      },
      size: {
        xs: "px-1.5 py-0.5 text-[10px]",
        sm: "px-2 py-0.5 text-[11px]",
        md: "px-2.5 py-1 text-xs",
      },
    },
    defaultVariants: { variant: "default", size: "sm" },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, size, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant, size }), className)} {...props} />;
}

/** نشان تخفیف: «۲۵٪» */
function DiscountBadge({ percent, className }: { percent: number; className?: string }) {
  if (!percent) return null;
  return (
    <span
      className={cn(
        "inline-flex h-9 min-w-9 flex-col items-center justify-center rounded-lg bg-danger-600 px-1.5 text-[11px] font-black leading-4 text-white shadow-sm",
        className,
      )}
      aria-label={`تخفیف ${percent} درصد`}
    >
      <span className="tabular">{percent}٪</span>
      <span className="text-[8px] font-semibold opacity-90">تخفیف</span>
    </span>
  );
}

export { Badge, badgeVariants, DiscountBadge };
