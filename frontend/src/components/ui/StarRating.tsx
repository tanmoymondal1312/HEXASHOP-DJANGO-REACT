import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  rating: number;
  count?: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function StarRating({ rating, count, size = "sm", className }: StarRatingProps) {
  const sizes = { sm: "h-3.5 w-3.5", md: "h-4 w-4", lg: "h-5 w-5" };
  const filled = Math.floor(rating);
  const hasHalf = rating - filled >= 0.5;

  return (
    <div className={cn("flex items-center gap-1", className)}>
      <div className="flex items-center">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={cn(
              sizes[size],
              i < filled
                ? "fill-brand-primary text-brand-primary"
                : "fill-transparent text-gray-600"
            )}
          />
        ))}
      </div>
      {count !== undefined && (
        <span className="text-brand-muted text-xs">({count})</span>
      )}
    </div>
  );
}
