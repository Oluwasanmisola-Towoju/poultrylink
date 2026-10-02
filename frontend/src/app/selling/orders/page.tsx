"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { OrderStatusBadge } from "@/components/orders/order-status-badge";
import { useMyOrdersSelling } from "@/hooks/use-orders";
import { formatNaira, formatDate } from "@/lib/format";

export default function SellingOrdersPage() {
  const { data, isLoading } = useMyOrdersSelling();

  return (
    <main className="px-6 md:px-10 lg:px-16 py-10 max-w-3xl mx-auto">
      <h1 className="font-head font-extrabold text-3xl">Orders on your listings</h1>

      {isLoading ? (
        <p className="text-muted-foreground mt-6">Loading…</p>
      ) : !data?.data.length ? (
        <p className="text-muted-foreground mt-6">No orders yet.</p>
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
                    <p className="text-xs text-muted-foreground mt-1">
                      {order.buyer?.profile?.firstName ?? "A buyer"} · {formatDate(order.createdAt)}
                    </p>
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