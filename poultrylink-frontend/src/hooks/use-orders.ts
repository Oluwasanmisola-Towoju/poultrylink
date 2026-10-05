import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch, apiFetchPaginated } from "@/lib/api/client";
import type { Order, OrderStatus, Payment } from "@/types";

export function useMyOrdersBuying(status?: OrderStatus) {
  return useQuery({
    queryKey: ["orders", "buying", status],
    queryFn: () => apiFetchPaginated<Order[]>(`/orders/mine/buying${status ? `?status=${status}` : ""}`),
  });
}

export function useMyOrdersSelling(status?: OrderStatus) {
  return useQuery({
    queryKey: ["orders", "selling", status],
    queryFn: () => apiFetchPaginated<Order[]>(`/orders/mine/selling${status ? `?status=${status}` : ""}`),
  });
}

export function useOrder(id: string) {
  return useQuery({
    queryKey: ["orders", id],
    queryFn: () => apiFetch<Order>(`/orders/${id}`),
    enabled: Boolean(id),
  });
}

export interface CreateOrderInput {
  items: { listingId: string; quantity: number }[];
  deliveryAddress: string;
  deliveryState?: string;
  deliveryLga?: string;
  notes?: string;
}

export function useCreateOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateOrderInput) => apiFetch<Order>("/orders", { method: "POST", body: JSON.stringify(input) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["orders", "buying"] }),
  });
}

// One factory for the "POST /orders/:id/<action>, refresh this order + both
// list views" shape every status-transition mutation shares.
function useOrderAction(action: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body?: unknown }) =>
      apiFetch<Order>(`/orders/${id}/${action}`, { method: "POST", body: body ? JSON.stringify(body) : undefined }),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["orders", id] });
      queryClient.invalidateQueries({ queryKey: ["orders", "buying"] });
      queryClient.invalidateQueries({ queryKey: ["orders", "selling"] });
    },
  });
}

export const useAcceptOrder = () => useOrderAction("accept");
export const useRejectOrder = () => useOrderAction("reject");
export const useDispatchOrder = () => useOrderAction("dispatch");
export const useConfirmDelivery = () => useOrderAction("confirm-delivery");

export function useCancelOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      apiFetch<Order>(`/orders/${id}/cancel`, { method: "POST", body: JSON.stringify({ reason }) }),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["orders", id] });
      queryClient.invalidateQueries({ queryKey: ["orders", "buying"] });
    },
  });
}

export function useDisputeOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      apiFetch(`/orders/${id}/dispute`, { method: "POST", body: JSON.stringify({ reason }) }),
    onSuccess: (_data, { id }) => queryClient.invalidateQueries({ queryKey: ["orders", id] }),
  });
}

export function usePayOrder() {
  return useMutation({
    mutationFn: (id: string) =>
      apiFetch<{ authorizationUrl: string; reference: string }>(`/orders/${id}/pay`, { method: "POST" }),
  });
}

export function useSimulateMockPayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ reference, outcome }: { reference: string; outcome: "success" | "failed" }) =>
      apiFetch<Payment>("/payments/mock-simulate", { method: "POST", body: JSON.stringify({ reference, outcome }) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
}