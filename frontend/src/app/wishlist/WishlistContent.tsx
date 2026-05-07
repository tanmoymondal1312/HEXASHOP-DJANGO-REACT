"use client";

import Image from "next/image";
import Link from "next/link";
import { X, ShoppingCart, Heart } from "lucide-react";
import { useWishlist } from "@/hooks/useWishlist";
import { useCartStore } from "@/store/cartStore";
import { useAuthStore } from "@/store/authStore";
import { formatPrice } from "@/lib/utils";
import { StarRating } from "@/components/ui/StarRating";
import { Skeleton } from "@/components/ui/Skeleton";

export function WishlistContent() {
  const { wishlist, toggle } = useWishlist();
  const addItem = useCartStore((s) => s.addItem);
  const { isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return (
      <div className="text-center py-20">
        <Heart className="h-16 w-16 text-brand-muted mx-auto mb-4" />
        <p className="text-lg font-semibold">Your wishlist is empty</p>
        <p className="text-brand-muted mt-2">Please log in to see your saved items</p>
        <Link href="/auth/login" className="btn-primary inline-block mt-6">
          Log In
        </Link>
      </div>
    );
  }

  if (!wishlist) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="aspect-square rounded-xl" />
        ))}
      </div>
    );
  }

  if (wishlist.items.length === 0) {
    return (
      <div className="text-center py-20">
        <Heart className="h-16 w-16 text-brand-muted mx-auto mb-4" />
        <p className="text-lg font-semibold">Your wishlist is empty</p>
        <p className="text-brand-muted mt-2">Save items you love for later</p>
        <Link href="/shop" className="btn-primary inline-block mt-6">
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
      {wishlist.items.map(({ product }: { product: import("@/types").Product }) => {
        const image = product.primary_image || product.images?.[0]?.image;
        const variant = product.variants?.find((v: import("@/types").ProductVariant) => v.is_in_stock);

        return (
          <div key={product.id} className="card group relative">
            {/* Remove */}
            <button
              onClick={() => toggle(product.id)}
              className="absolute top-2 right-2 z-10 p-1 bg-brand-dark/70 rounded-full text-brand-muted hover:text-red-400 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Image */}
            <Link href={`/products/${product.slug}`} className="block relative aspect-square overflow-hidden">
              {image ? (
                <Image
                  src={image}
                  alt={product.name}
                  fill
                  sizes="(max-width: 640px) 50vw, 25vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full bg-brand-surface" />
              )}
            </Link>

            {/* Info */}
            <div className="p-3">
              <Link
                href={`/products/${product.slug}`}
                className="text-sm font-medium line-clamp-1 hover:text-brand-primary transition-colors"
              >
                {product.name}
              </Link>
              <StarRating
                rating={parseFloat(product.avg_rating)}
                count={product.review_count}
                className="mt-1"
              />
              <div className="flex items-center justify-between mt-2">
                <span className="text-brand-primary font-bold">
                  {formatPrice(product.base_price)}
                </span>
                <button
                  onClick={() => variant && addItem(variant.id, 1)}
                  disabled={!variant}
                  className="btn-primary px-3 py-1.5 text-xs flex items-center gap-1"
                >
                  <ShoppingCart className="h-3.5 w-3.5" />
                  {variant ? "Add to Cart" : "Out of Stock"}
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
