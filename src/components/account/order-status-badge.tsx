import { Badge } from "@/components/ui/badge";
import { ORDER_STATUS_META } from "@/lib/order-status";
import type { OrderStatusKey } from "@/types";

const VARIANT: Record<
  string,
  "warning" | "success" | "brand" | "danger" | "default"
> = {
  warning: "warning",
  success: "success",
  info: "brand",
  brand: "brand",
  danger: "danger",
  neutral: "default",
};

/** نشان وضعیت سفارش — سازگار با محیط سرور و کلاینت. */
export function OrderStatusBadge({
  status,
  size = "sm",
}: {
  status: OrderStatusKey | string;
  size?: "xs" | "sm" | "md";
}) {
  const meta = ORDER_STATUS_META[status as OrderStatusKey];
  return (
    <Badge variant={VARIANT[meta?.tone ?? "neutral"]} size={size}>
      {meta?.label ?? status}
    </Badge>
  );
}
