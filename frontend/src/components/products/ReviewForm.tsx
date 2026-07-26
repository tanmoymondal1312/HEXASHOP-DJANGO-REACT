"use client";

import { useState } from "react";
import { Loader2, Send } from "lucide-react";
import { InteractiveStarRating } from "./InteractiveStarRating";
import { productsApi } from "@/lib/api";

interface ReviewFormProps {
  productSlug: string;
  onSuccess: () => void;
}

export function ReviewForm({ productSlug, onSuccess }: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      setError("Please select a star rating.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await productsApi.createReview(productSlug, {
        rating,
        title: title.trim() || undefined,
        body: body.trim(),
      });
      setRating(0);
      setTitle("");
      setBody("");
      onSuccess();
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to submit review.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-sm font-medium text-white mb-2 block">
          Your Rating
        </label>
        <InteractiveStarRating value={rating} onChange={setRating} size="lg" />
      </div>

      <div>
        <label className="text-sm font-medium text-white mb-1 block">
          Title <span className="text-brand-muted font-normal">(optional)</span>
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Summarize your experience"
          maxLength={120}
          className="w-full bg-brand-dark border border-brand-border rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-brand-muted/50 focus:outline-none focus:border-brand-primary/50 transition-colors"
        />
      </div>

      <div>
        <label className="text-sm font-medium text-white mb-1 block">
          Your Review
        </label>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="What did you like or dislike about this product?"
          rows={4}
          required
          className="w-full bg-brand-dark border border-brand-border rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-brand-muted/50 focus:outline-none focus:border-brand-primary/50 transition-colors resize-none"
        />
      </div>

      {error && (
        <p className="text-sm text-red-400">{error}</p>
      )}

      <button
        type="submit"
        disabled={loading || rating === 0}
        className="flex items-center gap-2 px-5 py-2.5 bg-brand-primary text-white text-sm font-semibold rounded-xl hover:bg-brand-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Send className="h-4 w-4" />
        )}
        Submit Review
      </button>
    </form>
  );
}
