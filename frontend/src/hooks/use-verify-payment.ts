import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api/client";
import type { Payment } from "@/types";

export function useVerifyPayment(reference: string | null) {
  return useQuery({
    queryKey: ["payments", "verify", reference],
    queryFn: () => apiFetch<Payment>(`/payments/verify/${reference}`),
    enabled: Boolean(reference),
    retry: false,
  });
}