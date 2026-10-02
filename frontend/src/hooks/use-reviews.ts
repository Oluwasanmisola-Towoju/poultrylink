import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api/client";
import type { Review } from "@/types";

export function useCreateReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ orderId, rating, comment }: { orderId: string; rating: number; comment?: string }) =>
      apiFetch<Review>(`/reviews/orders/${orderId}`, { method: "POST", body: JSON.stringify({ rating, comment }) }),
    onSuccess: (_data, { orderId }) => queryClient.invalidateQueries({ queryKey: ["orders", orderId] }),
  });
}