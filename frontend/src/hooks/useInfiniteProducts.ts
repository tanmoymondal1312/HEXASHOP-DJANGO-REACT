"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { productsApi } from "@/lib/api";
import type { PaginatedResponse, Product, ProductFilters } from "@/types";

export function useInfiniteProducts(filters: ProductFilters) {
  return useInfiniteQuery<PaginatedResponse<Product>>({
    queryKey: ["products", filters],
    queryFn: async ({ pageParam }) => {
      const params: Record<string, string | number | boolean> = {
        page_size: 20,
      };
      Object.entries(filters).forEach(([k, v]) => {
        if (v !== undefined && v !== "") params[k] = v as string | number | boolean;
      });
      // Page-number based — backend now uses StandardPageNumberPagination
      params.page = (pageParam as number) ?? 1;
      const { data } = await productsApi.list(params);
      return data;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage, _allPages, lastPageParam) => {
      if (!lastPage.next) return undefined;
      return (lastPageParam as number) + 1;
    },
    staleTime: 1000 * 60 * 5,
  });
}
