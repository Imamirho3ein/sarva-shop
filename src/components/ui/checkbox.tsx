"use client";

import * as React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

/** چک‌باکس سفارشی با ظاهر مدرن */
const Checkbox = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement> & { label?: React.ReactNode }
>(({ className, label, id, ...props }, ref) => {
  const autoId = React.useId();
  const inputId = id ?? autoId;
  return (
    <label
      htmlFor={inputId}
      className={cn(
        "group inline-flex cursor-pointer select-none items-center gap-2.5 text-sm font-medium text-ink-700",
        props.disabled && "cursor-not-allowed opacity-60",
        className,
      )}
    >
      <span className="relative flex h-5 w-5 shrink-0 items-center justify-center">
        <input
          ref={ref}
          id={inputId}
          type="checkbox"
          className="peer sr-only"
          {...props}
        />
        <span
          aria-hidden
          className="flex h-5 w-5 items-center justify-center rounded-md border-2 border-ink-300 bg-white transition-all duration-200 peer-checked:border-brand-700 peer-checked:bg-brand-700 peer-focus-visible:ring-4 peer-focus-visible:ring-brand-600/20"
        >
          <Check
            className="h-3.5 w-3.5 scale-0 text-white transition-transform duration-150 peer-checked:scale-100"
            strokeWidth={3.5}
          />
        </span>
      </span>
      {label && <span className="leading-5">{label}</span>}
    </label>
  );
});
Checkbox.displayName = "Checkbox";

/** رادیو با ظاهر مدرن */
const Radio = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement> & { label?: React.ReactNode; hint?: React.ReactNode }
>(({ className, label, hint, id, ...props }, ref) => {
  const autoId = React.useId();
  const inputId = id ?? autoId;
  return (
    <label
      htmlFor={inputId}
      className={cn(
        "group inline-flex cursor-pointer select-none items-start gap-2.5",
        props.disabled && "cursor-not-allowed opacity-60",
        className,
      )}
    >
      <span className="relative flex h-5 w-5 shrink-0 items-center justify-center">
        <input ref={ref} id={inputId} type="radio" className="peer sr-only" {...props} />
        <span
          aria-hidden
          className="flex h-5 w-5 items-center justify-center rounded-full border-2 border-ink-300 bg-white transition-all duration-200 peer-checked:border-brand-700 peer-focus-visible:ring-4 peer-focus-visible:ring-brand-600/20"
        >
          <span className="h-2.5 w-2.5 scale-0 rounded-full bg-brand-700 transition-transform duration-150 peer-checked:scale-100" />
        </span>
      </span>
      {(label || hint) && (
        <span className="flex flex-col">
          {label && <span className="text-sm font-bold text-ink-800 leading-5">{label}</span>}
          {hint && <span className="text-xs font-medium text-ink-500 leading-5">{hint}</span>}
        </span>
      )}
    </label>
  );
});
Radio.displayName = "Radio";

/** سوئیچ */
const Switch = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement> & { label?: React.ReactNode }
>(({ className, label, id, ...props }, ref) => {
  const autoId = React.useId();
  const inputId = id ?? autoId;
  return (
    <label htmlFor={inputId} className={cn("inline-flex cursor-pointer items-center gap-2.5", className)}>
      <span className="relative">
        <input ref={ref} id={inputId} type="checkbox" role="switch" className="peer sr-only" {...props} />
        <span
          aria-hidden
          className="block h-6 w-11 rounded-full bg-ink-300 transition-colors duration-200 peer-checked:bg-brand-700 peer-focus-visible:ring-4 peer-focus-visible:ring-brand-600/20"
        >
          <span className="absolute top-0.5 right-0.5 block h-5 w-5 rounded-full bg-white shadow transition-transform duration-200 peer-checked:-translate-x-5" />
        </span>
      </span>
      {label && <span className="text-sm font-medium text-ink-700">{label}</span>}
    </label>
  );
});
Switch.displayName = "Switch";

export { Checkbox, Radio, Switch };
