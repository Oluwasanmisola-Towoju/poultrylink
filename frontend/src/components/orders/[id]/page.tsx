"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { OrderStatusBadge } from "@/components/orders/order-status-badge";
import { useAuthStore } from "@/store/auth-store";
import {
  useOrder,
  useAcceptOrder,
  useRejectOrder,
  useCancelOrder,
  usePayOrder,
  useDispatchOrder,
  useConfirmDelivery,
  useDisputeOrder,
} from "@/hooks/use-orders";
import { useCreateReview } from "@/hooks/use-reviews";
import { ApiClientError } from "@/lib/api/client";
import { formatNaira, formatQuantity, formatDate } from "@/lib/format";

function ActionError({ message }: { message: string | null }) {
  if (!message) return null;
  return <p className="text-sm font-semibold text-destructive mt-2">{message}</p>;
}

export default function OrderDetailPage({ params }: { params: { id: string } }) {
  const { user } = useAuthStore();
  const { data: order, isLoading } = useOrder(params.id);

  const accept = useAcceptOrder();
  const reject = useRejectOrder();
  const cancel = useCancelOrder();
  const pay = usePayOrder();
  const dispatch = useDispatchOrder();
  const confirmDelivery = useConfirmDelivery();
  const dispute = useDisputeOrder();
  const review = useCreateReview();

  const [actionError, setActionError] = useState<string | null>(null);
  const [disputeReason, setDisputeReason] = useState("");
  const [showDisputeForm, setShowDisputeForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  if (isLoading) return <main className="px-6 py-16 text-center text-muted-foreground">Loading order…</main>;
  if (!order) return <main className="px-6 py-16 text-center text-muted-foreground">Order not found.</main>;

  const isBuyer = user?.id === order.buyerId;
  const isSeller = order.items[0]?.sellerId === user?.id;

  async function run<T>(mutateAsync: () => Promise<T>) {
    setActionError(null);
    try {
      await mutateAsync();
    } catch (err) {
      setActionError(err instanceof ApiClientError ? err.message : "Something went wrong. Try again.");
    }
  }

  async function handlePay() {
    setActionError(null);
    try {
      const { authorizationUrl } = await pay.mutateAsync(order!.id);
      window.location.href = authorizationUrl;
    } catch (err) {
      setActionError(err instanceof ApiClientError ? err.message : "Couldn't start payment. Try again.");
    }
  }

  return (
    <main className="px-6 md:px-10 lg:px-16 py-10 max-w-3xl mx-auto">
      <Link href={isSeller ? "/selling/orders" : "/orders"} className="text-sm font-semibold underline hover:no-underline">
        ← Back to orders
      </Link>

      <div className="flex items-center justify-between mt-4">
        <h1 className="font-head font-extrabold text-2xl">Order #{order.id.slice(0, 8)}</h1>
        <OrderStatusBadge status={order.status} />
      </div>
      <p className="text-sm text-muted-foreground">Placed {formatDate(order.createdAt)}</p>

      <Card className="mt-6">
        <CardContent className="pt-5 space-y-3">
          {order.items.map((item) => (
            <div key={item.id} className="flex justify-between text-sm">
              <span>
                {item.listing?.productName ?? "Listing"} — {formatQuantity(item.quantity, "")}
              </span>
              <span className="font-semibold">{formatNaira(item.subtotal)}</span>
            </div>
          ))}
          <div className="border-t border-foreground/10 pt-3 flex justify-between font-head font-extrabold">
            <span>Total</span>
            <span>{formatNaira(order.totalAmount)}</span>
          </div>
        </CardContent>
      </Card>

      <Card className="mt-4">
        <CardContent className="pt-5 space-y-1 text-sm">
          <p className="text-xs font-bold uppercase text-muted-foreground">Delivery</p>
          <p>{order.deliveryAddress}</p>
          {(order.deliveryState || order.deliveryLga) && (
            <p className="text-muted-foreground">{[order.deliveryLga, order.deliveryState].filter(Boolean).join(", ")}</p>
          )}
          {order.notes && <p className="text-muted-foreground mt-2">Note: {order.notes}</p>}
        </CardContent>
      </Card>

      {(order.payment || order.escrow) && (
        <Card className="mt-4">
          <CardContent className="pt-5 space-y-1 text-sm">
            <p className="text-xs font-bold uppercase text-muted-foreground">Payment & escrow</p>
            {order.payment && (
              <p>
                Payment: <Badge variant="outline">{order.payment.status}</Badge>
              </p>
            )}
            {order.escrow && (
              <p>
                Escrow: <Badge variant="outline">{order.escrow.status}</Badge>
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {isSeller && order.status === "PENDING_ACCEPTANCE" && (
        <div className="flex gap-3 mt-6">
          <Button className="flex-1" disabled={accept.isPending} onClick={() => run(() => accept.mutateAsync({ id: order.id }))}>
            Accept order
          </Button>
          <Button
            variant="outline"
            className="flex-1"
            disabled={reject.isPending}
            onClick={() => run(() => reject.mutateAsync({ id: order.id }))}
          >
            Reject
          </Button>
        </div>
      )}

      {isSeller && order.status === "PAID" && (
        <Button
          className="w-full mt-6"
          disabled={dispatch.isPending}
          onClick={() => run(() => dispatch.mutateAsync({ id: order.id }))}
        >
          Mark as dispatched
        </Button>
      )}

      {isBuyer && ["PENDING_ACCEPTANCE", "ACCEPTED", "AWAITING_PAYMENT"].includes(order.status) && (
        <Button
          variant="outline"
          className="w-full mt-6"
          disabled={cancel.isPending}
          onClick={() => run(() => cancel.mutateAsync({ id: order.id }))}
        >
          Cancel order
        </Button>
      )}

      {isBuyer && order.status === "ACCEPTED" && (
        <Button className="w-full mt-3" disabled={pay.isPending} onClick={handlePay}>
          {pay.isPending ? "Starting payment…" : "Pay now"}
        </Button>
      )}

      {isBuyer && order.status === "AWAITING_PAYMENT" && order.payment && (
        <Button asChild className="w-full mt-3">
          <Link href={`/payments/callback?reference=${order.payment.providerReference}`}>Check payment status</Link>
        </Button>
      )}

      {isBuyer && ["OUT_FOR_DELIVERY", "DELIVERED"].includes(order.status) && (
        <Button
          className="w-full mt-6"
          disabled={confirmDelivery.isPending}
          onClick={() => run(() => confirmDelivery.mutateAsync({ id: order.id }))}
        >
          Confirm delivery received
        </Button>
      )}

      {(isBuyer || isSeller) && ["PAID", "OUT_FOR_DELIVERY", "DELIVERED"].includes(order.status) && (
        <div className="mt-6">
          {!showDisputeForm ? (
            <button
              onClick={() => setShowDisputeForm(true)}
              className="text-xs font-semibold underline text-muted-foreground hover:no-underline"
            >
              Report a problem with this order
            </button>
          ) : (
            <Card>
              <CardContent className="pt-5 space-y-2">
                <textarea
                  value={disputeReason}
                  onChange={(e) => setDisputeReason(e.target.value)}
                  placeholder="What went wrong?"
                  className="w-full h-20 rounded-xl border-2 border-foreground/15 bg-background p-3 text-sm"
                />
                <Button
                  variant="destructive"
                  disabled={dispute.isPending || disputeReason.trim().length < 5}
                  onClick={() => run(() => dispute.mutateAsync({ id: order.id, reason: disputeReason }))}
                >
                  Submit dispute
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {(isBuyer || isSeller) && order.status === "COMPLETED" && !reviewSubmitted && (
        <Card className="mt-6">
          <CardContent className="pt-5 space-y-3">
            <p className="text-xs font-bold uppercase text-muted-foreground">Leave a review</p>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button key={n} type="button" onClick={() => setRating(n)} className="text-2xl leading-none">
                  {n <= rating ? "★" : "☆"}
                </button>
              ))}
            </div>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="How did it go?"
              className="w-full h-20 rounded-xl border-2 border-foreground/15 bg-background p-3 text-sm"
            />
            <Button
              disabled={review.isPending}
              onClick={async () => {
                setActionError(null);
                try {
                  await review.mutateAsync({ orderId: order.id, rating, comment: comment || undefined });
                  setReviewSubmitted(true);
                } catch (err) {
                  setActionError(err instanceof ApiClientError ? err.message : "Couldn't submit that review.");
                }
              }}
            >
              Submit review
            </Button>
          </CardContent>
        </Card>
      )}

      <ActionError message={actionError} />
    </main>
  );
}