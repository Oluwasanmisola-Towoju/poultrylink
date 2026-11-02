import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch, apiFetchPaginated } from "@/lib/api/client";
import type { Listing } from "@/types";

export function useMyListings() {
  return useQuery({
    queryKey: ["listings", "mine"],
    queryFn: () => apiFetchPaginated<Listing[]>("/listings/mine"),
  });
}

export interface CreateListingInput {
  farmId?: string;
  categoryId: string;
  productName: string;
  description?: string;
  quantity: number;
  unit: string;
  price: number;
  minOrderQuantity?: number;
  location?: string;
  state?: string;
  lga?: string;
  availabilityDate?: string; // ISO datetime
  images?: string[]; // URLs — there's no upload endpoint yet, see note on the form
}

export function useCreateListing() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateListingInput) =>
      apiFetch<Listing>("/listings", { method: "POST", body: JSON.stringify(input) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["listings", "mine"] });
      queryClient.invalidateQueries({ queryKey: ["listings"] });
    },
  });
}

export interface UpdateListingInput {
  quantity?: number;
  price?: number;
  minOrderQuantity?: number;
}

export function useUpdateListing() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...input }: UpdateListingInput & { id: string }) =>
      apiFetch<Listing>(`/listings/${id}`, { method: "PATCH", body: JSON.stringify(input) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["listings", "mine"] });
      queryClient.invalidateQueries({ queryKey: ["listings"] });
    },
  });
}

export function useDeleteListing() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiFetch(`/listings/${id}`, { method: "DELETE" }),
    onSuccess: (_data, id) => {
      queryClient.setQueryData<{ data: Listing[]; meta?: unknown }>(["listings", "mine"], (current) =>
        current ? { ...current, data: current.data.filter((listing) => listing.id !== id) } : current
      );
      queryClient.invalidateQueries({ queryKey: ["listings", "mine"] });
      queryClient.invalidateQueries({ queryKey: ["listings"] });
    },
  });
}