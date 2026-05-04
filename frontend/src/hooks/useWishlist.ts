"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { wishlistApi } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import toast from "react-hot-toast";

export function useWishlist() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const qc = useQueryClient();

  const { data: wishlist } = useQuery({
    queryKey: ["wishlist"],
    queryFn: () => wishlistApi.get().then((r) => r.data),
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 5,
  });

  const wishlistProductIds = new Set(wishlist?.items?.map((i: { product: { id: number } }) => i.product.id) ?? []);

  const { mutate: toggle } = useMutation({
    mutationFn: (productId: number) => wishlistApi.toggle(productId),
    onMutate: async (productId) => {
      await qc.cancelQueries({ queryKey: ["wishlist"] });
      const prev = qc.getQueryData(["wishlist"]);
      // Optimistic toggle
      qc.setQueryData(["wishlist"], (old: typeof wishlist) => {
        if (!old) return old;
        const exists = old.items.some((i: { product: { id: number } }) => i.product.id === productId);
        return {
          ...old,
          items: exists
            ? old.items.filter((i: { product: { id: number } }) => i.product.id !== productId)
            : [...old.items, { id: Date.now(), product: { id: productId }, added_at: new Date().toISOString() }],
        };
      });
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      qc.setQueryData(["wishlist"], ctx?.prev);
      toast.error("Please log in to save items");
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ["wishlist"] }),
  });

  const isInWishlist = (productId: number) => wishlistProductIds.has(productId);

  return { wishlist, toggle, isInWishlist };
}
