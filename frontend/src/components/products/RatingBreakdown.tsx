"use client";

import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface RatingBreakdownProps {
  avgRating: number;
  reviewCount: number;
  distribution: Record<string, number>;
}

export function RatingBreakdown({
  avgRating,
  reviewCount,
  distribution,
}: RatingBreakdownProps) {
  return (
    <div className="flex items-center gap-6">
      {/* Average score */}
      <div className="text-center flex-shrink-0">
        <p className="text-4xl font-black text-white">{avgRating.toFixed(1)}</p>
        <div className="flex items-center gap-0.5 justify-center mt-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={cn(
                "h-4 w-4",
                star <= Math.round(avgRating)
                  ? "fill-brand-primary text-brand-primary"
                  : "fill-transparent text-gray-600"
              )}
            />
          ))}
        </div>
        <p className="text-xs text-brand-muted mt-1">
          {reviewCount} {reviewCount === 1 ? "review" : "reviews"}
        </p>
      </div>

      {/* Bars */}
      <div className="flex-1 space-y-1.5 max-w-[200px]">
        {[5, 4, 3, 2, 1].map((star) => {
          const count = distribution[String(star)] || 0;
          const pct = reviewCount > 0 ? (count / reviewCount) * 100 : 0;
          return (
            <div key={star} className="flex items-center gap-2">
              <span className="text-xs text-brand-muted w-3 text-right">
                {star}
              </span>
              <Star className="h-3 w-3 fill-brand-primary text-brand-primary flex-shrink-0" />
              <div className="flex-1 h-2 bg-brand-dark rounded-full overflow-hidden">
                <div
                  className="h-full bg-brand-primary rounded-full transition-all"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className="text-[10px] text-brand-muted w-6 text-right">
                {count}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
