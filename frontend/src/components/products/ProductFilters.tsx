"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback, useState } from "react";
import * as Slider from "@radix-ui/react-slider";
import { Filter, X, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Category } from "@/types";

interface ProductFiltersProps {
  /** Full category tree (parents with children) from the API */
  categories: Category[];
}

export function ProductFilters({ categories }: ProductFiltersProps) {
  const router   = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Which parent categories are expanded in the sidebar
  const [expanded, setExpanded] = useState<Record<string, boolean>>(() => {
    const current = searchParams.get("category");
    if (!current) return {};
    // Auto-expand whichever parent owns the active subcategory
    const map: Record<string, boolean> = {};
    for (const parent of categories) {
      if (parent.children?.some((c) => c.slug === current)) {
        map[parent.slug] = true;
        break;
      }
      if (parent.slug === current) {
        map[parent.slug] = true;
        break;
      }
    }
    return map;
  });

  const updateParam = useCallback(
    (key: string, value: string | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value === null || value === "") {
        params.delete(key);
      } else {
        params.set(key, value);
      }
      // Reset to page 1 on any filter change
      params.delete("page");
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [router, pathname, searchParams]
  );

  const currentCategory = searchParams.get("category");
  const minPrice = searchParams.get("min_price") || "0";
  const maxPrice = searchParams.get("max_price") || "500";
  const hasFilters = !![
    currentCategory,
    searchParams.get("min_price"),
    searchParams.get("max_price"),
    searchParams.get("in_stock"),
    searchParams.get("on_sale"),
  ].some(Boolean);

  const toggleExpand = (slug: string) =>
    setExpanded((prev) => ({ ...prev, [slug]: !prev[slug] }));

  return (
    <div className="space-y-5 text-sm">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider">
          <Filter className="h-3.5 w-3.5 text-brand-primary" />
          Filters
        </div>
        {hasFilters && (
          <button
            onClick={() => router.push(pathname, { scroll: false })}
            className="text-xs text-brand-primary flex items-center gap-1 hover:underline"
          >
            <X className="h-3 w-3" /> Clear all
          </button>
        )}
      </div>

      {/* ── Hierarchical categories ─────────────────────────────────────── */}
      <div>
        <h4 className="text-[10px] font-semibold text-brand-muted uppercase tracking-widest mb-2">
          Categories
        </h4>

        {/* All categories */}
        <button
          onClick={() => updateParam("category", null)}
          className={cn(
            "w-full text-left px-2 py-1.5 rounded-lg text-sm transition-colors",
            !currentCategory
              ? "text-brand-primary font-semibold bg-brand-primary/8"
              : "text-brand-muted hover:text-white"
          )}
        >
          All Categories
        </button>

        <div className="mt-1 space-y-0.5">
          {categories.map((parent) => {
            const isOpen = !!expanded[parent.slug];
            const subs = parent.children || [];
            const parentActive = currentCategory === parent.slug;
            const childActive = subs.some((c) => c.slug === currentCategory);
            const anyActive = parentActive || childActive;

            return (
              <div key={parent.slug}>
                {/* Parent row */}
                <div className="flex items-center gap-0">
                  {/* Click name → filter by parent */}
                  <button
                    onClick={() => updateParam("category", parent.slug)}
                    className={cn(
                      "flex-1 text-left px-2 py-1.5 rounded-l-lg text-sm font-medium transition-colors",
                      anyActive
                        ? "text-brand-primary"
                        : "text-brand-muted hover:text-white"
                    )}
                  >
                    {parent.name}
                  </button>
                  {/* Chevron → toggle children */}
                  {subs.length > 0 && (
                    <button
                      onClick={() => toggleExpand(parent.slug)}
                      className="px-1.5 py-1.5 rounded-r-lg text-brand-muted hover:text-white transition-colors"
                      aria-label={isOpen ? "Collapse" : "Expand"}
                    >
                      <ChevronDown
                        className={cn("h-3.5 w-3.5 transition-transform", isOpen && "rotate-180")}
                      />
                    </button>
                  )}
                </div>

                {/* Children */}
                {isOpen && subs.length > 0 && (
                  <div className="ml-3 border-l border-brand-border/50 pl-3 mt-0.5 space-y-0.5">
                    {subs.map((sub) => (
                      <button
                        key={sub.slug}
                        onClick={() => updateParam("category", sub.slug)}
                        className={cn(
                          "w-full text-left px-2 py-1 rounded-lg text-[12px] transition-colors",
                          currentCategory === sub.slug
                            ? "text-brand-primary font-semibold"
                            : "text-brand-muted hover:text-white"
                        )}
                      >
                        {sub.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Price range ──────────────────────────────────────────────────── */}
      <div>
        <h4 className="text-[10px] font-semibold text-brand-muted uppercase tracking-widest mb-3">
          Price Range
        </h4>
        <div className="px-1">
          <Slider.Root
            className="relative flex items-center select-none touch-none w-full h-5"
            value={[parseInt(minPrice), parseInt(maxPrice)]}
            min={0} max={500} step={10}
            onValueChange={([min, max]) => {
              updateParam("min_price", min > 0   ? String(min) : "");
              updateParam("max_price", max < 500 ? String(max) : "");
            }}
          >
            <Slider.Track className="bg-brand-border relative grow rounded-full h-1.5">
              <Slider.Range className="absolute bg-brand-primary rounded-full h-full" />
            </Slider.Track>
            <Slider.Thumb className="block w-4 h-4 bg-brand-primary rounded-full hover:scale-110 transition-transform focus:outline-none" />
            <Slider.Thumb className="block w-4 h-4 bg-brand-primary rounded-full hover:scale-110 transition-transform focus:outline-none" />
          </Slider.Root>
          <div className="flex justify-between text-xs text-brand-muted mt-2">
            <span>${minPrice}</span>
            <span>${maxPrice}</span>
          </div>
        </div>
      </div>

      {/* ── Deals ────────────────────────────────────────────────────────── */}
      <div>
        <h4 className="text-[10px] font-semibold text-brand-muted uppercase tracking-widest mb-2">
          Deals
        </h4>
        <div className="space-y-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={searchParams.get("on_sale") === "true"}
              onChange={(e) => updateParam("on_sale", e.target.checked ? "true" : null)}
              className="rounded border-brand-border bg-brand-border text-brand-primary focus:ring-brand-primary"
            />
            <span className="text-[12px] text-brand-muted">On Sale</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={searchParams.get("in_stock") === "true"}
              onChange={(e) => updateParam("in_stock", e.target.checked ? "true" : null)}
              className="rounded border-brand-border bg-brand-border text-brand-primary focus:ring-brand-primary"
            />
            <span className="text-[12px] text-brand-muted">In Stock Only</span>
          </label>
        </div>
      </div>

    </div>
  );
}
