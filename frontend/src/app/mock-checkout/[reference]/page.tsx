"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useSimulateMockPayment } from "@/hooks/use-orders";
import { ApiClientError } from "@/lib/api/client";

// The backend's mock payment provider builds authorizationUrl as
// `${CLIENT_URL}/mock-checkout/:reference` — this page is the frontend half
// of that contract. It's not shown to real buyers in production.
export default function MockCheckoutPage({ params }: { params: { reference: string } }) {
  const router = useRouter();
  const simulate = useSimulateMockPayment();
  const [error, setError] = useState<string | null>(null);

  async function resolve(outcome: "success" | "failed") {
    setError(null);
    try {
      await simulate.mutateAsync({ reference: params.reference, outcome });
      router.push(`/payments/callback?reference=${params.reference}`);
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Something went wrong.");
    }
  }

  return (
    <main className="min-h-[60vh] flex items-center justify-center px-6">
      <Card className="w-full max-w-sm">
        <CardContent className="pt-6 text-center space-y-4">
          <p className="text-xs font-bold uppercase text-muted-foreground">Mock checkout</p>
          <p className="text-sm text-muted-foreground">
            This stands in for Paystack while <code className="text-xs">PAYMENT_PROVIDER=mock</code>. Pick an outcome to
            continue.
          </p>
          {error && <p className="text-sm font-semibold text-destructive">{error}</p>}
          <div className="flex flex-col gap-2">
            <Button onClick={() => resolve("success")} disabled={simulate.isPending}>
              Simulate successful payment
            </Button>
            <Button variant="outline" onClick={() => resolve("failed")} disabled={simulate.isPending}>
              Simulate failed payment
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}