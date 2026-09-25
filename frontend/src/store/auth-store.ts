import { create } from "zustand";
import type { User } from "@/types";
import { apiFetch } from "@/lib/api/client";

interface AuthState {
  user: User | null;
  status: "idle" | "loading" | "authenticated" | "unauthenticated";
  hydrate: () => Promise<void>;
  setUser: (user: User) => void;
  clear: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  status: "idle",

  hydrate: async () => {
    set({ status: "loading" });
    try {
      const user = await apiFetch<User>("/auth/me");
      set({ user, status: "authenticated" });
    } catch {
      set({ user: null, status: "unauthenticated" });
    }
  },

  setUser: (user) => set({ user, status: "authenticated" }),

  clear: () => set({ user: null, status: "unauthenticated" }),
}));