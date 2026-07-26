"use client";

import { useCallback, useEffect, useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  Star,
  ThumbsUp,
  Loader2,
  MessageSquare,
} from "lucide-react";
import { StarRating } from "@/components/ui/StarRating";
import { RatingBreakdown } from "./RatingBreakdown";
import { ReviewForm } from "./ReviewForm";
import { productsApi } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import type { Review } from "@/types";

interface ReviewSectionProps {
  productSlug: string;
}

const REVIEWS_PER_PAGE = 5;

export function ReviewSection({ productSlug }: ReviewSectionProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [distribution, setDistribution] = useState<Record<string, number>>({});
  const [avgRating, setAvgRating] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [helpfulLoading, setHelpfulLoading] = useState<number | null>(null);

  const { user } = useAuthStore();
  const isLoggedIn = !!user;

  const fetchReviews = useCallback(
    async (pageNum: number, append = false) => {
      try {
        const { data } = await productsApi.reviews(productSlug, {
          page: pageNum,
          page_size: REVIEWS_PER_PAGE,
        });

        const items: Review[] = data.results || data;
        setDistribution(data.distribution || {});
        setAvgRating(parseFloat(data.avg_rating) || 0);
        setReviewCount(data.review_count || 0);

        if (append) {
          setReviews((prev) => [...prev, ...items]);
        } else {
          setReviews(items);
        }

        setHasMore(items.length >= REVIEWS_PER_PAGE);
      } catch {
        // silent
      }
    },
    [productSlug]
  );

  useEffect(() => {
    setLoading(true);
    fetchReviews(1).finally(() => setLoading(false));
  }, [fetchReviews]);

  const handleLoadMore = async () => {
    const next = page + 1;
    setLoadingMore(true);
    await fetchReviews(next, true);
    setPage(next);
    setLoadingMore(false);
  };

  const handleReviewSubmitted = async () => {
    setShowForm(false);
    setPage(1);
    await fetchReviews(1);
  };

  const handleHelpful = async (reviewId: number) => {
    if (helpfulLoading !== null) return;
    setHelpfulLoading(reviewId);
    try {
      const { data } = await productsApi.reviewHelpful(productSlug, reviewId);
      setReviews((prev) =>
        prev.map((r) =>
          r.id === reviewId ? { ...r, helpful_count: data.helpful_count } : r
        )
      );
    } catch {
      // silent
    } finally {
      setHelpfulLoading(null);
    }
  };

  const visibleReviews = showAll ? reviews : reviews.slice(0, 3);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <span className="w-1 h-4 bg-indigo-500 rounded-full inline-block" />
          Customer Reviews
          {reviewCount > 0 && (
            <span className="text-xs font-normal text-brand-muted ml-1">
              ({reviewCount})
            </span>
          )}
        </h2>
        {isLoggedIn && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="text-xs font-semibold text-brand-primary hover:text-brand-primary/80 transition-colors"
          >
            {showForm ? "Cancel" : "Write a Review"}
          </button>
        )}
      </div>

      {/* Rating breakdown */}
      {reviewCount > 0 && (
        <RatingBreakdown
          avgRating={avgRating}
          reviewCount={reviewCount}
          distribution={distribution}
        />
      )}

      {/* Review form */}
      {showForm && isLoggedIn && (
        <div className="bg-brand-dark border border-brand-border rounded-2xl p-5">
          <ReviewForm
            productSlug={productSlug}
            onSuccess={handleReviewSubmitted}
          />
        </div>
      )}

      {!isLoggedIn && (
        <p className="text-xs text-brand-muted">
          <a
            href="/auth/login"
            className="text-brand-primary hover:underline font-medium"
          >
            Sign in
          </a>{" "}
          to write a review.
        </p>
      )}

      {/* Reviews list */}
      {loading ? (
        <div className="flex items-center justify-center py-10">
          <Loader2 className="h-6 w-6 animate-spin text-brand-primary" />
        </div>
      ) : visibleReviews.length > 0 ? (
        <div className="space-y-3">
          {visibleReviews.map((review) => (
            <ReviewCard
              key={review.id}
              review={review}
              onHelpful={handleHelpful}
              helpfulLoading={helpfulLoading === review.id}
            />
          ))}

          {/* See more / See less */}
          {reviews.length > 3 && (
            <div className="flex justify-center pt-2">
              <button
                onClick={() => {
                  if (!showAll && !hasMore) {
                    setShowAll(true);
                  } else if (!showAll && hasMore) {
                    handleLoadMore();
                    setShowAll(true);
                  } else {
                    setShowAll(false);
                    setPage(1);
                    setReviews((prev) => prev.slice(0, REVIEWS_PER_PAGE));
                  }
                }}
                className="flex items-center gap-1.5 text-xs font-semibold text-brand-primary hover:text-brand-primary/80 transition-colors"
              >
                {showAll ? (
                  <>
                    Show less <ChevronUp className="h-3.5 w-3.5" />
                  </>
                ) : loadingMore ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <>
                    See all {reviewCount} reviews{" "}
                    <ChevronDown className="h-3.5 w-3.5" />
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-10">
          <Star className="h-10 w-10 text-brand-muted/30 mx-auto mb-3" />
          <p className="text-sm font-medium text-white mb-1">No reviews yet</p>
          <p className="text-xs text-brand-muted">
            Be the first to share your experience with this product.
          </p>
        </div>
      )}
    </div>
  );
}

/* ── Single review card ────────────────────────────────────────────────────── */

function ReviewCard({
  review,
  onHelpful,
  helpfulLoading,
}: {
  review: Review;
  onHelpful: (id: number) => void;
  helpfulLoading: boolean;
}) {
  return (
    <div className="bg-brand-dark border border-brand-border rounded-2xl p-4">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-primary/30 to-brand-secondary/30 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
            {review.user_name?.charAt(0).toUpperCase() || "?"}
          </div>
          <div>
            <p className="text-sm font-semibold text-white">
              {review.user_name || "Anonymous"}
            </p>
            {review.is_verified_purchase && (
              <span className="text-[10px] text-emerald-400 font-medium flex items-center gap-0.5">
                <MessageSquare className="h-2.5 w-2.5" />
                Verified Purchase
              </span>
            )}
          </div>
        </div>
        <StarRating rating={review.rating} size="sm" />
      </div>

      {review.title && (
        <p className="text-sm font-semibold text-white mb-1">{review.title}</p>
      )}
      <p className="text-sm text-brand-muted leading-relaxed">{review.body}</p>

      {/* Helpful */}
      <div className="flex items-center gap-3 mt-3 pt-3 border-t border-brand-border/50">
        <button
          onClick={() => onHelpful(review.id)}
          disabled={helpfulLoading}
          className="flex items-center gap-1.5 text-xs text-brand-muted hover:text-brand-primary transition-colors disabled:opacity-50"
        >
          {helpfulLoading ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <ThumbsUp className="h-3 w-3" />
          )}
          Helpful{review.helpful_count > 0 && ` (${review.helpful_count})`}
        </button>
      </div>
    </div>
  );
}
