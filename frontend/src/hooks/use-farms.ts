import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api/client";
import type { Farm } from "@/types";

export function useMyFarms() {
  return useQuery({
    queryKey: ["farms", "mine"],
    queryFn: () => apiFetch<Farm[]>("/farms/mine"),
  });
}

export interface CreateFarmInput {
  name: string;
  description?: string;
  address?: string;
  state?: string;
  lga?: string;
}

export function useCreateFarm() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateFarmInput) => apiFetch<Farm>("/farms", { method: "POST", body: JSON.stringify(input) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["farms", "mine"] }),
  });
}