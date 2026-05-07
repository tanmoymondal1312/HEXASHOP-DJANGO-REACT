"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Heart, ShoppingCart, Star } from "lucide-react";
import type { Product } from "@/types";
import { formatPrice, resolveImageUrl } from "@/lib/utils";
import { useCartStore } from "@/store/cartStore";
import { useWishlist } from "@/hooks/useWishlist";
import { useAuthStore } from "@/store/authStore";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

const BLUR =
  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgZmlsbD0iIzExMTgyNyIvPjwvc3ZnPg==";

interface ProductCardProps {
  product: Product;
  priority?: boolean;
}

export function ProductCard({ product, priority = false }: ProductCardProps) {
  const [addingToCart, setAddingToCart] = useState(false);
  const [imgError, setImgError] = useState(false);

  const addItem = useCartStore((s) => s.addItem);
  const { isInWishlist, toggle } = useWishlist();
  const { isAuthenticated } = useAuthStore();

  // Resolve URL — handles both absolute (from fixed backend) and relative (fallback)
  const rawUrl = product.primary_image ?? product.images?.[0]?.image ?? null;
  const imageUrl = resolveImageUrl(rawUrl);

  const isWished = isAuthenticated && isInWishlist(product.id);
  const hasDiscount = !!product.discount_percentage;

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Use first_variant from list serializer (lightweight, no full variants array needed)
    const fv = product.first_variant;
    if (!fv) {
      // No variant info at all — go to product page to pick one
      window.location.href = `/products/${product.slug}`;
      return;
    }
    if (!fv.is_in_stock) {
      toast.error("This product is out of stock");
      return;
    }
    setAddingToCart(true);
    await addItem(fv.id, 1);
    setAddingToCart(false);
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      toast.error("Please log in to save items");
      return;
    }
    toggle(product.id);
  };

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group block bg-brand-surface border border-brand-border rounded-2xl overflow-hidden hover:border-brand-primary/30 transition-all duration-300 hover:shadow-[0_8px_32px_rgba(0,0,0,0.4)]"
    >
      {/* ── Image area ───────────────────────────────────────────────── */}
      <div className="relative aspect-[3/4] overflow-hidden bg-brand-dark">
        {imageUrl && !imgError ? (
          <Image
            src={imageUrl}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            priority={priority}
            placeholder="blur"
            blurDataURL={BLUR}
            onError={() => setImgError(true)}
          />
        ) : (
          /* Placeholder when no image */
          <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-brand-surface to-brand-dark">
            <svg className="w-12 h-12 text-brand-border" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-xs text-brand-muted">No image</span>
          </div>
        )}

        {/* Top badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5">
          {hasDiscount && (
            <span className="text-[10px] font-bold bg-red-500 text-white px-2 py-0.5 rounded-lg leading-none">
              -{product.discount_percentage}%
            </span>
          )}
          {product.is_featured && !hasDiscount && (
            <span className="text-[10px] font-bold bg-brand-primary text-black px-2 py-0.5 rounded-lg leading-none">
              Featured
            </span>
          )}
        </div>

        {/* Wishlist button */}
        <button
          onClick={handleWishlist}
          className={cn(
            "absolute top-2.5 right-2.5 p-1.5 rounded-xl backdrop-blur-sm transition-all duration-200",
            isWished
              ? "bg-brand-primary/20 text-brand-primary shadow-[0_0_12px_rgba(245,166,35,0.3)]"
              : "bg-black/40 text-white/70 hover:text-brand-primary hover:bg-black/60"
          )}
          aria-label={isWished ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart className={cn("h-4 w-4", isWished && "fill-brand-primary")} />
        </button>

        {/* Quick add overlay — slides up on hover */}
        <div className="absolute bottom-0 left-0 right-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <button
            onClick={handleAddToCart}
            disabled={addingToCart}
            className="w-full bg-brand-primary text-black text-xs font-bold py-3 hover:bg-yellow-400 transition-colors disabled:opacity-70 flex items-center justify-center gap-1.5"
          >
            <ShoppingCart className="h-3.5 w-3.5" />
            {addingToCart ? "Adding…" : "Quick Add"}
          </button>
        </div>
      </div>

      {/* ── Info ─────────────────────────────────────────────────────── */}
      <div className="p-3.5">
        {/* Category */}
        <p className="text-[11px] text-brand-muted uppercase tracking-wider mb-1 truncate">
          {product.category_name}
        </p>

        {/* Product name */}
        <h3 className="text-sm font-semibold text-white line-clamp-2 leading-snug group-hover:text-brand-primary transition-colors mb-2">
          {product.name}
        </h3>

        {/* Rating */}
        {parseFloat(product.avg_rating) > 0 && (
          <div className="flex items-center gap-1 mb-2">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  className={cn(
                    "h-3 w-3",
                    s <= Math.round(parseFloat(product.avg_rating))
                      ? "text-brand-primary fill-brand-primary"
                      : "text-brand-border"
                  )}
                />
              ))}
            </div>
            <span className="text-[11px] text-brand-muted">({product.review_count})</span>
          </div>
        )}

        {/* Price row */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-baseline gap-1.5 min-w-0">
            <span className="text-base font-bold text-brand-primary">
              {formatPrice(product.base_price)}
            </span>
            {product.compare_at_price && (
              <span className="text-xs text-brand-muted line-through truncate">
                {formatPrice(product.compare_at_price)}
              </span>
            )}
          </div>

          <button
            onClick={handleAddToCart}
            disabled={addingToCart}
            className="shrink-0 p-2 rounded-xl bg-brand-border hover:bg-brand-primary hover:text-black transition-colors disabled:opacity-50"
            aria-label="Add to cart"
          >
            <ShoppingCart className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </Link>
  );
}
