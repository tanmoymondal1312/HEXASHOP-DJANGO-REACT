"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback } from "react";
import * as Slider from "@radix-ui/react-slider";
import { Filter, X } from "lucide-react";
import { cn } from "@/lib/utils";

const SIZES = ["XS", "S", "M", "L", "XL", "XXL"];
const COLORS = [
  { name: "Black", hex: "#000000" },
  { name: "White", hex: "#FFFFFF" },
  { name: "Blue", hex: "#1E90FF" },
  { name: "Red", hex: "#EF4444" },
  { name: "Green", hex: "#10B981" },
];

interface ProductFiltersProps {
  categories: Array<{ name: string; slug: string }>;
}

export function ProductFilters({ categories }: ProductFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const updateParam = useCallback(
    (key: string, value: string | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value === null || value === "") {
        params.delete(key);
      } else {
        params.set(key, value);
      }
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [router, pathname, searchParams]
  );

  const currentSize = searchParams.get("size");
  const currentColor = searchParams.get("color");
  const currentCategory = searchParams.get("category");
  const minPrice = searchParams.get("min_price") || "0";
  const maxPrice = searchParams.get("max_price") || "500";

  const hasFilters = [currentSize, currentColor, currentCategory, searchParams.get("min_price"), searchParams.get("max_price")].some(Boolean);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <Filter className="h-4 w-4 text-brand-primary" />
          FILTERS
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

      {/* Category */}
      <div>
        <h4 className="text-xs font-semibold text-brand-muted uppercase tracking-wider mb-3">
          Categories
        </h4>
        <ul className="space-y-1.5">
          <li>
            <button
              onClick={() => updateParam("category", null)}
              className={cn(
                "text-sm w-full text-left px-2 py-1 rounded transition-colors",
                !currentCategory ? "text-brand-primary font-medium" : "text-brand-muted hover:text-white"
              )}
            >
              All Categories
            </button>
          </li>
          {categories.map((cat) => (
            <li key={cat.slug}>
              <button
                onClick={() => updateParam("category", cat.slug)}
                className={cn(
                  "text-sm w-full text-left px-2 py-1 rounded transition-colors",
                  currentCategory === cat.slug
                    ? "text-brand-primary font-medium"
                    : "text-brand-muted hover:text-white"
                )}
              >
                {cat.name}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Price Range */}
      <div>
        <h4 className="text-xs font-semibold text-brand-muted uppercase tracking-wider mb-3">
          Price Range
        </h4>
        <div className="px-1">
          <Slider.Root
            className="relative flex items-center select-none touch-none w-full h-5"
            value={[parseInt(minPrice), parseInt(maxPrice)]}
            min={0}
            max={500}
            step={10}
            onValueChange={([min, max]) => {
              updateParam("min_price", min > 0 ? String(min) : "");
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

      {/* Size */}
      <div>
        <h4 className="text-xs font-semibold text-brand-muted uppercase tracking-wider mb-3">
          Size
        </h4>
        <div className="flex flex-wrap gap-2">
          {SIZES.map((size) => (
            <button
              key={size}
              onClick={() => updateParam("size", currentSize === size ? null : size)}
              className={cn(
                "px-3 py-1.5 text-xs rounded-md border transition-colors font-medium",
                currentSize === size
                  ? "bg-brand-primary text-black border-brand-primary"
                  : "border-brand-border text-brand-muted hover:border-brand-primary hover:text-white"
              )}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      {/* Color */}
      <div>
        <h4 className="text-xs font-semibold text-brand-muted uppercase tracking-wider mb-3">
          Color
        </h4>
        <div className="flex flex-wrap gap-2">
          {COLORS.map(({ name, hex }) => (
            <button
              key={name}
              onClick={() => updateParam("color", currentColor === name ? null : name)}
              title={name}
              className={cn(
                "w-7 h-7 rounded-full border-2 transition-all",
                currentColor === name ? "border-brand-primary scale-110" : "border-brand-border"
              )}
              style={{ backgroundColor: hex }}
              aria-label={name}
            />
          ))}
        </div>
      </div>

      {/* On Sale toggle */}
      <div>
        <h4 className="text-xs font-semibold text-brand-muted uppercase tracking-wider mb-3">
          Deals
        </h4>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={searchParams.get("on_sale") === "true"}
            onChange={(e) => updateParam("on_sale", e.target.checked ? "true" : null)}
            className="rounded border-brand-border bg-brand-border text-brand-primary focus:ring-brand-primary"
          />
          <span className="text-sm">On Sale Only</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer mt-2">
          <input
            type="checkbox"
            checked={searchParams.get("in_stock") === "true"}
            onChange={(e) => updateParam("in_stock", e.target.checked ? "true" : null)}
            className="rounded border-brand-border bg-brand-border text-brand-primary focus:ring-brand-primary"
          />
          <span className="text-sm">In Stock Only</span>
        </label>
      </div>
    </div>
  );
}
