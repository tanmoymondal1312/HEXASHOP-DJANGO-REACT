import type { Metadata } from "next";
import { Suspense } from "react";
import { ProductGrid } from "@/components/products/ProductGrid";
import { ProductGridSkeleton } from "@/components/ui/Skeleton";
import { SearchBar } from "@/components/search/SearchBar";

interface SearchPageProps {
  searchParams: { q?: string };
}

export async function generateMetadata({ searchParams }: SearchPageProps): Promise<Metadata> {
  const q = searchParams.q || "";
  return {
    title: q ? `Search: "${q}"` : "Search",
    description: q ? `Search results for "${q}" at HEXASHOP` : "Search for products at HEXASHOP",
    robots: { index: false, follow: true },
  };
}

export default function SearchPage({ searchParams }: SearchPageProps) {
  const q = searchParams.q || "";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-2xl mx-auto mb-8">
        <SearchBar />
      </div>

      {q ? (
        <>
          <h1 className="text-lg font-semibold mb-6">
            Search Results for <span className="text-brand-primary">"{q}"</span>
          </h1>
          <Suspense fallback={<ProductGridSkeleton count={12} />}>
            <ProductGrid filters={{ q, ordering: "-sold_count" }} />
          </Suspense>
        </>
      ) : (
        <div className="text-center py-12 text-brand-muted">
          <p>Enter a search term to find products</p>
        </div>
      )}
    </div>
  );
}
