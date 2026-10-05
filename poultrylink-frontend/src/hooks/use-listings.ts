import { useQuery } from "@tanstack/react-query";
import { apiFetchPaginated } from "@/lib/api/client";
import type { Listing } from "@/types";

export interface ListingFilters {
  q?: string;
  categoryId?: string;
  state?: string;
  sort?: "newest" | "price_asc" | "price_desc";
  page?: number;
}

function toQueryString(filters: ListingFilters) {
  const params = new URLSearchParams();
  if (filters.q) params.set("q", filters.q);
  if (filters.categoryId) params.set("categoryId", filters.categoryId);
  if (filters.state) params.set("state", filters.state);
  if (filters.sort) params.set("sort", filters.sort);
  if (filters.page && filters.page > 1) params.set("page", String(filters.page));
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

export function useListings(filters: ListingFilters) {
  return useQuery({
    queryKey: ["listings", filters],
    queryFn: () => apiFetchPaginated<Listing[]>(`/listings${toQueryString(filters)}`),
    placeholderData: (prev) => prev,
  });
}