"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useVerifyPayment } from "@/hooks/use-verify-payment";
import { Button } from "@/components/ui/button";

function CallbackContent() {
  const searchParams = useSearchParams();
  // Paystack sends both `reference` and `trxref` with the same value.
  const reference = searchParams.get("reference") ?? searchParams.get("trxref");
  const { data: payment, isLoading, isError, error } = useVerifyPayment(reference);

  return (
    <main className="min-h-[60vh] flex items-center justify-center px-6 text-center">
      <div className="max-w-sm">
        {!reference ? (
          <p className="text-muted-foreground">No payment reference was provided.</p>
        ) : isLoading ? (
          <p className="text-muted-foreground">Confirming your payment…</p>
        ) : isError ? (
          <>
            <h1 className="font-head font-extrabold text-2xl">Couldn&rsquo;t confirm that payment</h1>
            <p className="text-sm text-muted-foreground mt-2">{(error as Error)?.message}</p>
          </>
        ) : payment?.status === "SUCCESS" ? (
          <>
            <h1 className="font-head font-extrabold text-2xl">Payment confirmed 🎉</h1>
            <p className="text-sm text-muted-foreground mt-2">Your order is now in escrow, waiting on delivery.</p>
            <Button asChild size="lg" className="mt-6">
              <Link href={`/orders/${payment.orderId}`}>View order</Link>
            </Button>
          </>
        ) : (
          <>
            <h1 className="font-head font-extrabold text-2xl">Payment not completed</h1>
            <p className="text-sm text-muted-foreground mt-2">
              Status: {payment?.status.toLowerCase()}. You can try paying again from the order page.
            </p>
            {payment && (
              <Button asChild size="lg" variant="outline" className="mt-6">
                <Link href={`/orders/${payment.orderId}`}>Back to order</Link>
              </Button>
            )}
          </>
        )}
      </div>
    </main>
  );
}

export default function PaymentCallbackPage() {
  return (
    <Suspense>
      <CallbackContent />
    </Suspense>
  );
}