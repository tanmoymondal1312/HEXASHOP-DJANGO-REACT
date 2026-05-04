import { Suspense } from "react";
import type { Metadata } from "next";
import { productsApi } from "@/lib/api";
import { ProductGrid } from "@/components/products/ProductGrid";
import { ProductFilters } from "@/components/products/ProductFilters";
import { ProductGridSkeleton } from "@/components/ui/Skeleton";
import { SortSelect } from "./SortSelect";
import type { Category } from "@/types";

export const metadata: Metadata = {
  title: "Shop",
  description: "Browse all products at HEXASHOP. Filter by category, price, size, and color.",
};

interface ShopPageProps {
  searchParams: Record<string, string>;
}

async function getCategories(): Promise<Category[]> {
  try {
    const { data } = await productsApi.categories();
    return data;
  } catch {
    return [];
  }
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const categories = await getCategories();

  const flatCategories = categories.flatMap((c) => [
    { name: c.name, slug: c.slug },
    ...(c.children || []).map((ch) => ({ name: ch.name, slug: ch.slug })),
  ]);

  const filters = {
    q: searchParams.q,
    category: searchParams.category,
    brand: searchParams.brand,
    min_price: searchParams.min_price,
    max_price: searchParams.max_price,
    size: searchParams.size,
    color: searchParams.color,
    in_stock: searchParams.in_stock === "true" ? true : undefined,
    on_sale: searchParams.on_sale === "true" ? true : undefined,
    ordering: searchParams.ordering || "-created_at",
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Shop</h1>
        <p className="text-sm text-brand-muted mt-1">
          {searchParams.q ? `Search results for "${searchParams.q}"` : "Showing all products"}
        </p>
      </div>

      <div className="flex gap-8">
        {/* Sidebar filters */}
        <aside className="hidden lg:block w-56 flex-shrink-0">
          <div className="card p-5 sticky top-24">
            <Suspense fallback={null}>
              <ProductFilters categories={flatCategories} />
            </Suspense>
          </div>
        </aside>

        {/* Product grid */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-brand-muted">Showing products</p>
            <SortSelect current={searchParams.ordering || "-created_at"} />
          </div>
          <Suspense fallback={<ProductGridSkeleton count={12} />}>
            <ProductGrid filters={filters} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
