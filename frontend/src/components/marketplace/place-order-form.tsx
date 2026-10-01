"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthStore } from "@/store/auth-store";
import { useCreateOrder } from "@/hooks/use-orders";
import { ApiClientError } from "@/lib/api/client";
import { formatNaira } from "@/lib/format";
import type { Listing } from "@/types";

export function PlaceOrderForm({ listing }: { listing: Listing }) {
  const router = useRouter();
  const { user, status } = useAuthStore();
  const createOrder = useCreateOrder();

  const [quantity, setQuantity] = useState(Number(listing.minOrderQuantity) || 1);
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [error, setError] = useState<string | null>(null);

  if (status !== "authenticated") {
    return (
      <Button asChild size="lg" className="w-full mt-6">
        <Link href={`/login?next=/listings/${listing.id}`}>Log in to place an order</Link>
      </Button>
    );
  }

  if (user?.role !== "BUYER") {
    return (
      <p className="text-sm text-muted-foreground text-center mt-6 border border-foreground/10 rounded-xl py-3">
        Only accounts registered as a Buyer can place orders.
      </p>
    );
  }

  if (user.id === listing.sellerId) {
    return (
      <p className="text-sm text-muted-foreground text-center mt-6 border border-foreground/10 rounded-xl py-3">
        This is your own listing.
      </p>
    );
  }

  const total = quantity * Number(listing.price);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const min = Number(listing.minOrderQuantity);
    const max = Number(listing.quantity);
    if (quantity < min) return setError(`Minimum order is ${min} ${listing.unit}`);
    if (quantity > max) return setError(`Only ${max} ${listing.unit} available`);
    if (deliveryAddress.trim().length < 5) return setError("Enter a delivery address");

    try {
      const order = await createOrder.mutateAsync({
        items: [{ listingId: listing.id, quantity }],
        deliveryAddress,
        deliveryState: listing.state ?? undefined,
      });
      router.push(`/orders/${order.id}`);
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Couldn't place the order. Try again.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-3 border border-foreground/10 rounded-2xl p-4">
      <div>
        <Label htmlFor="quantity">Quantity ({listing.unit})</Label>
        <Input
          id="quantity"
          type="number"
          min={Number(listing.minOrderQuantity) || 1}
          max={Number(listing.quantity)}
          value={quantity}
          onChange={(e) => setQuantity(Number(e.target.value))}
        />
      </div>
      <div>
        <Label htmlFor="deliveryAddress">Delivery address</Label>
        <Input
          id="deliveryAddress"
          value={deliveryAddress}
          onChange={(e) => setDeliveryAddress(e.target.value)}
          placeholder="Where should this be delivered?"
        />
      </div>

      <p className="font-head font-extrabold text-lg">Total: {formatNaira(total)}</p>

      {error && <p className="text-sm font-semibold text-destructive">{error}</p>}

      <Button type="submit" size="lg" className="w-full" disabled={createOrder.isPending}>
        {createOrder.isPending ? "Placing order…" : "Place an order"}
      </Button>
    </form>
  );
}