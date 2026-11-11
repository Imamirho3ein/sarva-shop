import * as React from "react";
import { cn } from "@/lib/utils";

const Separator = ({
  className,
  orientation = "horizontal",
  decorative = true,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  orientation?: "horizontal" | "vertical";
  decorative?: boolean;
}) => (
  <div
    role={decorative ? "none" : "separator"}
    aria-orientation={decorative ? undefined : orientation}
    className={cn(
      "shrink-0 bg-ink-100",
      orientation === "horizontal" ? "h-px w-full" : "h-full w-px",
      className,
    )}
    {...props}
  />
);

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("skeleton rounded-lg", className)} {...props} />;
}

/** بلوک بارگذاری کارت محصول */
function ProductSkeleton() {
  return (
    <div className="rounded-2xl border border-ink-100 bg-white p-3">
      <Skeleton className="aspect-square w-full rounded-xl" />
      <Skeleton className="mt-3 h-3.5 w-4/5" />
      <Skeleton className="mt-2 h-3.5 w-3/5" />
      <Skeleton className="mt-4 h-5 w-1/2" />
      <Skeleton className="mt-3 h-9 w-full rounded-lg" />
    </div>
  );
}

function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-2xl border border-dashed border-ink-200 bg-white px-6 py-14 text-center",
        className,
      )}
    >
      {icon && (
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-ink-100 text-ink-400">
          {icon}
        </div>
      )}
      <h3 className="text-base font-extrabold text-ink-800">{title}</h3>
      {description && (
        <p className="mt-1.5 max-w-sm text-sm leading-6 text-ink-500">{description}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

function Spinner({ className }: { className?: string }) {
  return (
    <span
      aria-label="در حال بارگذاری"
      className={cn(
        "inline-block h-5 w-5 animate-spin rounded-full border-2 border-brand-600 border-t-transparent",
        className,
      )}
    />
  );
}

export { Separator, Skeleton, ProductSkeleton, EmptyState, Spinner };
