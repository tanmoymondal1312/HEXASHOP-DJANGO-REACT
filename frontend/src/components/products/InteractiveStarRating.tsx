"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface InteractiveStarRatingProps {
  value: number;
  onChange: (rating: number) => void;
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  className?: string;
}

const LABELS = ["", "Poor", "Fair", "Good", "Very Good", "Excellent"];

export function InteractiveStarRating({
  value,
  onChange,
  size = "md",
  disabled = false,
  className,
}: InteractiveStarRatingProps) {
  const [hover, setHover] = useState(0);
  const sizes = { sm: "h-5 w-5", md: "h-6 w-6", lg: "h-8 w-8" };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            disabled={disabled}
            onClick={() => onChange(star)}
            onMouseEnter={() => !disabled && setHover(star)}
            onMouseLeave={() => setHover(0)}
            className={cn(
              "transition-transform",
              disabled ? "cursor-not-allowed" : "cursor-pointer hover:scale-110"
            )}
          >
            <Star
              className={cn(
                sizes[size],
                (hover || value) >= star
                  ? "fill-brand-primary text-brand-primary"
                  : "fill-transparent text-gray-600"
              )}
            />
          </button>
        ))}
      </div>
      {(hover || value) > 0 && (
        <span className="text-sm font-medium text-brand-primary">
          {LABELS[hover || value]}
        </span>
      )}
    </div>
  );
}
