"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { OrderStatusBadge } from "@/components/orders/order-status-badge";
import { useMyOrdersBuying } from "@/hooks/use-orders";
import { formatNaira, formatDate } from "@/lib/format";

export default function MyOrdersPage() {
  const { data, isLoading } = useMyOrdersBuying();

  return (
    <main className="px-6 md:px-10 lg:px-16 py-10 max-w-3xl mx-auto">
      <h1 className="font-head font-extrabold text-3xl">Your orders</h1>

      {isLoading ? (
        <p className="text-muted-foreground mt-6">Loading…</p>
      ) : !data?.data.length ? (
        <p className="text-muted-foreground mt-6">
          No orders yet —{" "}
          <Link href="/marketplace" className="underline hover:no-underline">
            browse the marketplace
          </Link>{" "}
          to place your first one.
        </p>
      ) : (
        <div className="space-y-3 mt-6">
          {data.data.map((order) => (
            <Link key={order.id} href={`/orders/${order.id}`}>
              <Card className="hover:-translate-y-0.5 transition">
                <CardContent className="pt-5 flex items-center justify-between">
                  <div>
                    <p className="font-head font-bold">
                      {order.items[0]?.listing?.productName ?? "Order"}
                      {order.items.length > 1 ? ` +${order.items.length - 1} more` : ""}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">{formatDate(order.createdAt)}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-head font-bold">{formatNaira(order.totalAmount)}</p>
                    <OrderStatusBadge status={order.status} />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}