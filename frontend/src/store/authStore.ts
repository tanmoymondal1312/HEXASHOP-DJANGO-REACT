"use client";

import { create } from "zustand";
import { User } from "@/types";
import { authApi } from "@/lib/api";

interface AuthStore {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  fetchUser: () => Promise<void>;
  setUser: (user: User | null) => void;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isLoading: true,
  isAuthenticated: false,

  fetchUser: async () => {
    try {
      const { data } = await authApi.me();
      set({ user: data, isAuthenticated: true, isLoading: false });
    } catch {
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  setUser: (user) => set({ user, isAuthenticated: !!user }),

  logout: async () => {
    try {
      await authApi.logout();
    } finally {
      set({ user: null, isAuthenticated: false });
    }
  },
}));
