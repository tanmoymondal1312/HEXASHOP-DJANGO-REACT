"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Heart, ShoppingCart } from "lucide-react";
import { Product } from "@/types";
import { formatPrice } from "@/lib/utils";
import { StarRating } from "@/components/ui/StarRating";
import { useCartStore } from "@/store/cartStore";
import { useWishlist } from "@/hooks/useWishlist";
import { useAuthStore } from "@/store/authStore";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

interface ProductCardProps {
  product: Product;
  priority?: boolean;
}

export function ProductCard({ product, priority = false }: ProductCardProps) {
  const [hovered, setHovered] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);

  const addItem = useCartStore((s) => s.addItem);
  const { isInWishlist, toggle } = useWishlist();
  const { isAuthenticated } = useAuthStore();

  const imageUrl = product.primary_image || product.images?.[0]?.image || "/placeholder-product.jpg";
  const isWished = isAuthenticated && isInWishlist(product.id);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const variant = (product as unknown as { variants?: Array<{ id: number; is_in_stock: boolean }> }).variants?.find((v) => v.is_in_stock);
    if (!variant) {
      toast.error("This product is out of stock");
      return;
    }
    setAddingToCart(true);
    await addItem(variant.id, 1);
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
      className="group card block"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Image container */}
      <div className="relative aspect-square overflow-hidden bg-brand-surface">
        <Image
          src={imageUrl}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className={cn(
            "object-cover transition-transform duration-500",
            hovered ? "scale-110" : "scale-100"
          )}
          priority={priority}
          placeholder="blur"
          blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgZmlsbD0iIzExMTgyNyIvPjwvc3ZnPg=="
        />

        {/* Discount badge */}
        {product.discount_percentage && (
          <span className="absolute top-2 left-2 badge bg-red-500/90 text-white">
            -{product.discount_percentage}%
          </span>
        )}

        {/* Wishlist button */}
        <button
          onClick={handleWishlist}
          className={cn(
            "absolute top-2 right-2 p-1.5 rounded-full transition-all duration-200",
            isWished
              ? "bg-brand-primary/20 text-brand-primary"
              : "bg-brand-dark/60 text-white hover:text-brand-primary hover:bg-brand-dark/80"
          )}
          aria-label={isWished ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart className={cn("h-4 w-4", isWished && "fill-brand-primary")} />
        </button>

        {/* Quick add overlay */}
        <div
          className={cn(
            "absolute bottom-0 left-0 right-0 transition-all duration-300",
            hovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
          )}
        >
          <button
            onClick={handleAddToCart}
            disabled={addingToCart}
            className="w-full bg-brand-primary/95 text-black text-xs font-semibold py-2.5 hover:bg-brand-primary transition-colors"
          >
            {addingToCart ? "Adding..." : "Quick Add"}
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="p-3">
        <p className="text-xs text-brand-muted mb-1">{product.category_name}</p>
        <h3 className="text-sm font-medium line-clamp-1 group-hover:text-brand-primary transition-colors">
          {product.name}
        </h3>

        <StarRating
          rating={parseFloat(product.avg_rating)}
          count={product.review_count}
          className="mt-1"
        />

        <div className="flex items-center justify-between mt-2">
          <div className="flex items-baseline gap-2">
            <span className="text-brand-primary font-bold">
              {formatPrice(product.base_price)}
            </span>
            {product.compare_at_price && (
              <span className="text-xs text-brand-muted line-through">
                {formatPrice(product.compare_at_price)}
              </span>
            )}
          </div>

          <button
            onClick={handleAddToCart}
            disabled={addingToCart}
            className="p-2 rounded-lg bg-brand-border hover:bg-brand-primary hover:text-black transition-colors"
            aria-label="Add to cart"
          >
            <ShoppingCart className="h-4 w-4" />
          </button>
        </div>
      </div>
    </Link>
  );
}
