import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch, apiFetchPaginated } from "@/lib/api/client";
import type { AdminDashboardSummary, AdminDisputeOrder, AdminUser, UserRole, VerificationStatus } from "@/types";

export function useAdminDashboard() {
  return useQuery({
    queryKey: ["admin", "dashboard"],
    queryFn: () => apiFetch<AdminDashboardSummary>("/admin/dashboard"),
  });
}

export function useAdminDisputes() {
  return useQuery({
    queryKey: ["admin", "disputes"],
    queryFn: () => apiFetch<AdminDisputeOrder[]>("/admin/disputes"),
  });
}

export function useResolveDispute() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ orderId, resolution }: { orderId: string; resolution: "RELEASE_TO_SELLER" | "REFUND_BUYER" }) =>
      apiFetch(`/admin/disputes/${orderId}/resolve`, { method: "POST", body: JSON.stringify({ resolution }) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "disputes"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "dashboard"] });
    },
  });
}

export function useAdminUsers(filters: { role?: UserRole; verificationStatus?: VerificationStatus; page?: number }) {
  const params = new URLSearchParams();
  if (filters.role) params.set("role", filters.role);
  if (filters.verificationStatus) params.set("verificationStatus", filters.verificationStatus);
  if (filters.page) params.set("page", String(filters.page));
  const qs = params.toString();

  return useQuery({
    queryKey: ["admin", "users", filters],
    queryFn: () => apiFetchPaginated<AdminUser[]>(`/admin/users${qs ? `?${qs}` : ""}`),
  });
}

export function useSetVerificationStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: "VERIFIED" | "REJECTED" }) =>
      apiFetch<AdminUser>(`/admin/users/${id}/verification`, { method: "PATCH", body: JSON.stringify({ status }) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
    },
  });
}

export function useSetActiveStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      apiFetch<AdminUser>(`/admin/users/${id}/active`, { method: "PATCH", body: JSON.stringify({ isActive }) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
    },
  });
}