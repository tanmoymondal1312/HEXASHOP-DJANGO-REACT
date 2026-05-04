"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { Cart, CartItem } from "@/types";
import { cartApi } from "@/lib/api";
import toast from "react-hot-toast";

interface CartStore {
  cart: Cart | null;
  isOpen: boolean;
  isLoading: boolean;
  guestSessionKey: string | null;
  fetchCart: () => Promise<void>;
  addItem: (variantId: number, quantity?: number) => Promise<void>;
  updateItem: (itemId: number, quantity: number) => Promise<void>;
  removeItem: (itemId: number) => Promise<void>;
  openCart: () => void;
  closeCart: () => void;
  setGuestKey: (key: string) => void;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      cart: null,
      isOpen: false,
      isLoading: false,
      guestSessionKey: null,

      fetchCart: async () => {
        try {
          const { data } = await cartApi.get(get().guestSessionKey || undefined);
          set({ cart: data });
        } catch {
          // ignore — user might not be logged in
        }
      },

      addItem: async (variantId, quantity = 1) => {
        set({ isLoading: true });
        // Optimistic: open drawer immediately
        set({ isOpen: true });
        try {
          const { data } = await cartApi.add(variantId, quantity, get().guestSessionKey || undefined);
          if (data.session_key) {
            set({ guestSessionKey: data.session_key });
          }
          set({ cart: data });
          toast.success("Added to cart");
        } catch (err: unknown) {
          const msg =
            (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ||
            "Failed to add item";
          toast.error(msg);
        } finally {
          set({ isLoading: false });
        }
      },

      updateItem: async (itemId, quantity) => {
        const prevCart = get().cart;
        // Optimistic update
        if (prevCart) {
          const optimistic: Cart = {
            ...prevCart,
            items: prevCart.items
              .map((i) => (i.id === itemId ? { ...i, quantity } : i))
              .filter((i) => i.quantity > 0),
          };
          set({ cart: optimistic });
        }
        try {
          const { data } = await cartApi.update(itemId, quantity);
          set({ cart: data });
        } catch {
          set({ cart: prevCart });
          toast.error("Failed to update cart");
        }
      },

      removeItem: async (itemId) => {
        const prevCart = get().cart;
        if (prevCart) {
          set({
            cart: {
              ...prevCart,
              items: prevCart.items.filter((i) => i.id !== itemId),
            },
          });
        }
        try {
          const { data } = await cartApi.remove(itemId);
          set({ cart: data });
        } catch {
          set({ cart: prevCart });
          toast.error("Failed to remove item");
        }
      },

      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      setGuestKey: (key) => set({ guestSessionKey: key }),
    }),
    {
      name: "hexashop-cart",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ guestSessionKey: state.guestSessionKey }),
    }
  )
);
