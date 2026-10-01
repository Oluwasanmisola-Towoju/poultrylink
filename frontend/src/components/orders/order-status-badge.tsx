import { Badge, type BadgeProps } from "@/components/ui/badge";
import type { OrderStatus } from "@/types";

const LABELS: Record<OrderStatus, string> = {
  PENDING_ACCEPTANCE: "Awaiting seller",
  ACCEPTED: "Accepted",
  REJECTED: "Rejected",
  AWAITING_PAYMENT: "Awaiting payment",
  PAID: "Paid",
  OUT_FOR_DELIVERY: "Out for delivery",
  DELIVERED: "Delivered",
  CONFIRMED: "Confirmed",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
  CANCELLING: "Cancelling",
  DISPUTED: "Disputed",
};

const VARIANTS: Record<OrderStatus, NonNullable<BadgeProps["variant"]>> = {
  PENDING_ACCEPTANCE: "outline",
  ACCEPTED: "secondary",
  REJECTED: "destructive",
  AWAITING_PAYMENT: "warning",
  PAID: "success",
  OUT_FOR_DELIVERY: "secondary",
  DELIVERED: "secondary",
  CONFIRMED: "success",
  COMPLETED: "success",
  CANCELLED: "destructive",
  CANCELLING: "warning",
  DISPUTED: "destructive",
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return <Badge variant={VARIANTS[status]}>{LABELS[status]}</Badge>;
}