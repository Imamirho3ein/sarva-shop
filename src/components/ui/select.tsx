import * as React from "react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";

/**
 * Select ساده و راست‌چین — بدون وابستگی سنگین.
 * از native select استفاده می‌کند تا در موبایل بهترین UX را داشته باشد.
 */

export type SelectOption = { value: string; label: string; disabled?: boolean };

export interface SelectProps
  extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "children"> {
  options: SelectOption[];
  placeholder?: string;
  invalid?: boolean;
  label?: React.ReactNode;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, options, placeholder, invalid, label, id, ...props }, ref) => {
    const autoId = React.useId();
    const selectId = id ?? (label ? autoId : undefined);

    const field = (
    <div className="relative">
      <select
        ref={ref}
        id={selectId}
        aria-invalid={invalid || undefined}
        className={cn(
          "h-11 w-full cursor-pointer appearance-none rounded-xl border bg-white px-3 py-2 pl-9 text-sm font-medium text-ink-900 transition-all duration-200",
          "focus:outline-none focus:ring-4 disabled:cursor-not-allowed disabled:opacity-60",
          invalid
            ? "border-danger-500 focus:ring-danger-500/10"
            : "border-ink-200 focus:border-brand-600 focus:ring-brand-600/10",
          className,
        )}
        {...props}
      >
        {placeholder !== undefined && (
          <option value="">{placeholder}</option>
        )}
        {options.map((o) => (
          <option key={o.value} value={o.value} disabled={o.disabled}>
            {o.label}
          </option>
        ))}
      </select>
      <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-ink-400">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="m6 9 6 6 6-6" />
        </svg>
      </span>
    </div>
    );

    if (!label) return field;

    return (
      <div className="w-full">
        <Label htmlFor={selectId}>{label}</Label>
        {field}
      </div>
    );
  },
);
Select.displayName = "Select";

export { Select };
