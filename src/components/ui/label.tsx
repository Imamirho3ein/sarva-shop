import * as React from "react";
import * as LabelPrimitive from "@radix-ui/react-label";
import { cn } from "@/lib/utils";

const Label = React.forwardRef<
  React.ComponentRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> & { required?: boolean }
>(({ className, required, children, ...props }, ref) => (
  <LabelPrimitive.Root
    ref={ref}
    className={cn(
      "mb-1.5 block text-[13px] font-bold text-ink-700 peer-disabled:cursor-not-allowed peer-disabled:opacity-60",
      className,
    )}
    {...props}
  >
    {children}
    {required && <span className="mr-1 text-danger-600">*</span>}
  </LabelPrimitive.Root>
));
Label.displayName = "Label";

/** متن خطای فرم */
function FieldError({ message, className }: { message?: string; className?: string }) {
  if (!message) return null;
  return (
    <p role="alert" className={cn("mt-1.5 text-xs font-semibold text-danger-600", className)}>
      {message}
    </p>
  );
}

/** توضیح زیر فیلد */
function FieldHint({ children, className }: { children: React.ReactNode; className?: string }) {
  return <p className={cn("mt-1.5 text-xs text-ink-500", className)}>{children}</p>;
}

export { Label, FieldError, FieldHint };
