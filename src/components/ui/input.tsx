import * as React from "react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
  wrapperClassName?: string;
  icon?: React.ReactNode;
  label?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, wrapperClassName, icon, invalid, label, id, type, ...props }, ref) => {
    const autoId = React.useId();
    const inputId = id ?? (label ? autoId : undefined);

    const field = icon ? (
      <div
        className={cn(
          "relative flex items-center rounded-xl border bg-white transition-all duration-200",
          invalid
            ? "border-danger-500"
            : "border-ink-200 focus-within:border-brand-600 focus-within:ring-4 focus-within:ring-brand-600/10",
          wrapperClassName,
        )}
      >
        <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-ink-400">
          {icon}
        </span>
        <input
          ref={ref}
          id={inputId}
          type={type}
          aria-invalid={invalid || undefined}
          className={cn(
            "h-11 w-full rounded-xl bg-transparent px-3 py-2 text-sm text-ink-900 placeholder:text-ink-400 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60",
            "pr-10",
            className,
          )}
          {...props}
        />
      </div>
    ) : (
      <input
        ref={ref}
        id={inputId}
        type={type}
        aria-invalid={invalid || undefined}
        className={cn(
          "flex h-11 w-full rounded-xl border bg-white px-3 py-2 text-sm text-ink-900 placeholder:text-ink-400 transition-all duration-200",
          "focus:outline-none focus:ring-4 disabled:cursor-not-allowed disabled:opacity-60",
          invalid
            ? "border-danger-500 focus:border-danger-500 focus:ring-danger-500/10"
            : "border-ink-200 focus:border-brand-600 focus:ring-brand-600/10",
          className,
        )}
        {...props}
      />
    );

    if (!label) return field;

    return (
      <div className="w-full">
        <Label htmlFor={inputId}>{label}</Label>
        {field}
      </div>
    );
  },
);
Input.displayName = "Input";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  invalid?: boolean;
  label?: React.ReactNode;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, invalid, label, id, ...props }, ref) => {
    const autoId = React.useId();
    const textareaId = id ?? (label ? autoId : undefined);

    const field = (
      <textarea
        ref={ref}
        id={textareaId}
        className={cn(
          "flex min-h-24 w-full rounded-xl border bg-white px-3 py-2 text-sm text-ink-900 placeholder:text-ink-400 transition-all duration-200",
          "focus:outline-none focus:ring-4 disabled:cursor-not-allowed disabled:opacity-60",
          invalid
            ? "border-danger-500 focus:ring-danger-500/10"
            : "border-ink-200 focus:border-brand-600 focus:ring-brand-600/10",
          className,
        )}
        {...props}
      />
    );

    if (!label) return field;

    return (
      <div className="w-full">
        <Label htmlFor={textareaId}>{label}</Label>
        {field}
      </div>
    );
  },
);
Textarea.displayName = "Textarea";

export { Input, Textarea };
