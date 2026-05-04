"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";

const OPTIONS = [
  { value: "-created_at", label: "Newest" },
  { value: "-sold_count", label: "Best Selling" },
  { value: "-avg_rating", label: "Top Rated" },
  { value: "base_price", label: "Price: Low to High" },
  { value: "-base_price", label: "Price: High to Low" },
];

export function SortSelect({ current }: { current: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("ordering", value);
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-brand-muted">Sort by:</span>
      <select
        value={current}
        onChange={(e) => handleChange(e.target.value)}
        className="bg-brand-surface border border-brand-border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
      >
        {OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}
