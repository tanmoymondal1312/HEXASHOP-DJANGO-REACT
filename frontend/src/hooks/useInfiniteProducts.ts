"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { productsApi } from "@/lib/api";
import type { PaginatedResponse, Product, ProductFilters } from "@/types";

export function useInfiniteProducts(filters: ProductFilters) {
  return useInfiniteQuery<PaginatedResponse<Product>>({
    queryKey: ["products", filters],
    queryFn: async ({ pageParam }) => {
      const params: Record<string, string | number | boolean> = {};
      Object.entries(filters).forEach(([k, v]) => {
        if (v !== undefined && v !== "") params[k] = v as string | number | boolean;
      });
      if (pageParam) params["cursor"] = pageParam as string;
      const { data } = await productsApi.list(params);
      return data;
    },
    initialPageParam: undefined,
    getNextPageParam: (last) => {
      if (!last.next) return undefined;
      const url = new URL(last.next);
      return url.searchParams.get("cursor") || undefined;
    },
    staleTime: 1000 * 60 * 5,
  });
}
