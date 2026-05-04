"use client";

import { useEffect, useRef } from "react";
import { ProductCard } from "./ProductCard";
import { ProductGridSkeleton } from "@/components/ui/Skeleton";
import { type Product } from "@/types";
import { useInfiniteProducts } from "@/hooks/useInfiniteProducts";
import { useInView } from "react-intersection-observer";
import { ProductFilters } from "@/types";

interface ProductGridProps {
  filters: ProductFilters;
  initialProducts?: Product[];
}

export function ProductGrid({ filters, initialProducts }: ProductGridProps) {
  const { ref: loadMoreRef, inView } = useInView({ threshold: 0.5 });

  const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } =
    useInfiniteProducts(filters);

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const products =
    data?.pages.flatMap((p) => p.results) ?? initialProducts ?? [];

  if (isLoading) return <ProductGridSkeleton count={12} />;
  if (products.length === 0) {
    return (
      <div className="text-center py-24 text-brand-muted">
        <p className="text-lg">No products found</p>
        <p className="text-sm mt-2">Try adjusting your filters</p>
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
        {products.map((product, i) => (
          <ProductCard key={product.id} product={product} priority={i < 4} />
        ))}
      </div>

      {/* Infinite scroll sentinel */}
      <div ref={loadMoreRef} className="py-8 flex justify-center">
        {isFetchingNextPage && (
          <div className="flex gap-2">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-2 h-2 rounded-full bg-brand-primary animate-bounce"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
