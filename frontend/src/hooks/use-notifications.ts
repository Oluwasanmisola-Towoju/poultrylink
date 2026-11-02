import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch, apiFetchPaginated } from "@/lib/api/client";
import type { AppNotification } from "@/types";

const KEY = ["notifications"] as const;

// Express has no unread-count endpoint, so we pull the latest 50 and count
// the unread ones here. If someone ever has more than 50 unread, the badge
// just caps out at 50 — fine for the bell, and the list is still correct.
export function useNotifications(enabled: boolean) {
  return useQuery({
    queryKey: KEY,
    queryFn: () => apiFetchPaginated<AppNotification[]>("/notifications?limit=50"),
    enabled,
    refetchInterval: 30_000, // light polling; no websockets in Phase 1
    refetchOnWindowFocus: true,
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiFetch(`/notifications/${id}/read`, { method: "PATCH" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KEY }),
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => apiFetch("/notifications/read-all", { method: "PATCH" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KEY }),
  });
}