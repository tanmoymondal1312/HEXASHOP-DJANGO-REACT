"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Search, X, Clock, TrendingUp } from "lucide-react";
import { useDebounce } from "@/hooks/useDebounce";
import { useQuery } from "@tanstack/react-query";
import { productsApi } from "@/lib/api";
import { formatPrice } from "@/lib/utils";
import type { SearchSuggestResponse } from "@/types";

const POPULAR = ["Hoodies", "Sneakers", "Jackets", "Caps"];

interface SearchBarProps {
  onClose?: () => void;
  autoFocus?: boolean;
}

export function SearchBar({ onClose, autoFocus = false }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const debouncedQuery = useDebounce(query, 300);

  const { data: suggestions } = useQuery<SearchSuggestResponse>({
    queryKey: ["search-suggest", debouncedQuery],
    queryFn: () => productsApi.searchSuggest(debouncedQuery).then((r) => r.data),
    enabled: debouncedQuery.length >= 2,
    staleTime: 30000,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    onClose?.();
  };

  const handleSelect = (term: string) => {
    router.push(`/search?q=${encodeURIComponent(term)}`);
    onClose?.();
  };

  const showDropdown = debouncedQuery.length >= 2 && suggestions;
  const isEmpty = !showDropdown;

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-brand-muted pointer-events-none" />
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for products..."
          autoFocus={autoFocus}
          className="w-full bg-brand-surface border border-brand-border rounded-xl pl-11 pr-10 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary placeholder-brand-muted"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-brand-muted hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </form>

      {/* Dropdown */}
      {(showDropdown || isEmpty) && query.length === 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-brand-surface border border-brand-border rounded-xl shadow-2xl z-50 overflow-hidden">
          <div className="p-3 border-b border-brand-border">
            <p className="text-xs text-brand-muted flex items-center gap-1.5">
              <TrendingUp className="h-3.5 w-3.5" /> Popular Searches
            </p>
            <div className="flex flex-wrap gap-2 mt-2">
              {POPULAR.map((term) => (
                <button
                  key={term}
                  onClick={() => handleSelect(term)}
                  className="px-3 py-1 bg-brand-border rounded-full text-xs hover:bg-brand-primary hover:text-black transition-colors"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {showDropdown && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-brand-surface border border-brand-border rounded-xl shadow-2xl z-50 overflow-hidden max-h-[70vh] overflow-y-auto">
          {/* Text suggestions */}
          {suggestions.suggestions.length > 0 && (
            <div className="p-2">
              {suggestions.suggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => handleSelect(s)}
                  className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg hover:bg-brand-border text-sm text-left transition-colors"
                >
                  <Search className="h-4 w-4 text-brand-muted flex-shrink-0" />
                  <span dangerouslySetInnerHTML={{ __html: s.replace(new RegExp(debouncedQuery, "gi"), (m) => `<mark class="bg-brand-primary/30 text-brand-primary rounded px-0.5">${m}</mark>`) }} />
                </button>
              ))}
            </div>
          )}

          {/* Product suggestions */}
          {suggestions.products.length > 0 && (
            <div className="border-t border-brand-border p-2">
              <p className="text-xs text-brand-muted px-2 py-1">Products</p>
              {suggestions.products.map((product) => (
                <Link
                  key={product.id}
                  href={`/products/${product.slug}`}
                  onClick={onClose}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-brand-border transition-colors"
                >
                  {product.primary_image && (
                    <div className="relative w-10 h-10 rounded-md overflow-hidden flex-shrink-0">
                      <Image src={product.primary_image} alt={product.name} fill className="object-cover" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{product.name}</p>
                    <p className="text-xs text-brand-primary">{formatPrice(product.base_price)}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
