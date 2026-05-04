"use client";

import { useState } from "react";
import { ShoppingCart, Heart, Bell, Minus, Plus } from "lucide-react";
import { Product, ProductVariant } from "@/types";
import { useCartStore } from "@/store/cartStore";
import { useWishlist } from "@/hooks/useWishlist";
import { useAuthStore } from "@/store/authStore";
import { notificationsApi } from "@/lib/api";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

interface AddToCartSectionProps {
  product: Product;
}

export function AddToCartSection({ product }: AddToCartSectionProps) {
  const variants = product.variants || [];
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    variants.find((v) => v.is_in_stock) || variants[0] || null
  );
  const [quantity, setQuantity] = useState(1);
  const [alertEmail, setAlertEmail] = useState("");
  const [showAlert, setShowAlert] = useState(false);

  const addItem = useCartStore((s) => s.addItem);
  const { toggle, isInWishlist } = useWishlist();
  const { isAuthenticated, user } = useAuthStore();

  // Group variants by attribute (size, color)
  const sizes = [...new Set(variants.map((v) => v.attributes?.size).filter(Boolean))];
  const colors = [...new Set(variants.map((v) => v.attributes?.color).filter(Boolean))];

  const getVariantForAttributes = (size?: string, color?: string) => {
    return variants.find((v) => {
      const sizeMatch = !size || v.attributes?.size === size;
      const colorMatch = !color || v.attributes?.color === color;
      return sizeMatch && colorMatch;
    });
  };

  const handleAddToCart = async () => {
    if (!selectedVariant) return;
    await addItem(selectedVariant.id, quantity);
  };

  const handleStockAlert = async () => {
    if (!selectedVariant) return;
    const email = alertEmail || user?.email || "";
    if (!email) {
      toast.error("Please enter your email address");
      return;
    }
    try {
      await notificationsApi.subscribeStockAlert(email, selectedVariant.id);
      toast.success("You'll be notified when this item is back in stock!");
      setShowAlert(false);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail || "Failed to register alert";
      toast.error(msg);
    }
  };

  const isWished = isAuthenticated && isInWishlist(product.id);
  const canAddToCart = selectedVariant?.is_in_stock && quantity <= (selectedVariant?.stock ?? 0);

  return (
    <div className="space-y-4">
      {/* Size selector */}
      {sizes.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Size</span>
            <button className="text-xs text-brand-primary underline">Size Guide</button>
          </div>
          <div className="flex flex-wrap gap-2">
            {sizes.map((size) => {
              const variant = getVariantForAttributes(size, selectedVariant?.attributes?.color);
              const isSelected = selectedVariant?.attributes?.size === size;
              const inStock = variant?.is_in_stock;
              return (
                <button
                  key={size}
                  onClick={() => variant && setSelectedVariant(variant)}
                  disabled={!inStock}
                  className={cn(
                    "px-4 py-2 text-sm rounded-lg border-2 font-medium transition-all",
                    isSelected
                      ? "border-brand-primary bg-brand-primary/10 text-brand-primary"
                      : inStock
                      ? "border-brand-border hover:border-brand-primary hover:text-brand-primary"
                      : "border-brand-border/30 text-brand-muted/30 cursor-not-allowed line-through"
                  )}
                >
                  {size}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Color selector */}
      {colors.length > 0 && (
        <div>
          <span className="text-sm font-medium mb-2 block">
            Color: <span className="text-brand-muted font-normal">{selectedVariant?.attributes?.color}</span>
          </span>
          <div className="flex gap-2">
            {colors.map((color) => {
              const variant = getVariantForAttributes(selectedVariant?.attributes?.size, color);
              const isSelected = selectedVariant?.attributes?.color === color;
              return (
                <button
                  key={color}
                  onClick={() => variant && setSelectedVariant(variant)}
                  title={color}
                  className={cn(
                    "w-8 h-8 rounded-full border-2 transition-all",
                    isSelected ? "border-brand-primary scale-110" : "border-brand-border hover:border-brand-primary"
                  )}
                  style={{ backgroundColor: color?.toLowerCase() || "#ccc" }}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* Quantity */}
      <div>
        <span className="text-sm font-medium mb-2 block">Quantity</span>
        <div className="flex items-center gap-3">
          <div className="flex items-center border border-brand-border rounded-xl">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="p-3 hover:text-brand-primary transition-colors"
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="px-4 font-medium">{quantity}</span>
            <button
              onClick={() =>
                setQuantity(Math.min(selectedVariant?.stock || 99, quantity + 1))
              }
              className="p-3 hover:text-brand-primary transition-colors"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
          {selectedVariant?.is_low_stock && (
            <span className="text-xs text-orange-400">
              Only {selectedVariant.stock} left!
            </span>
          )}
        </div>
      </div>

      {/* CTA buttons */}
      {canAddToCart ? (
        <div className="flex gap-3">
          <button
            onClick={handleAddToCart}
            className="btn-primary flex-1 flex items-center justify-center gap-2"
          >
            <ShoppingCart className="h-5 w-5" />
            Add to Cart
          </button>
          <button
            onClick={() => isAuthenticated && toggle(product.id)}
            className={cn(
              "p-3 rounded-xl border-2 transition-colors",
              isWished
                ? "border-brand-primary bg-brand-primary/10 text-brand-primary"
                : "border-brand-border hover:border-brand-primary hover:text-brand-primary"
            )}
            aria-label="Add to wishlist"
          >
            <Heart className={cn("h-5 w-5", isWished && "fill-brand-primary")} />
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          <button disabled className="btn-primary w-full opacity-50 cursor-not-allowed">
            Out of Stock
          </button>
          <button
            onClick={() => setShowAlert(!showAlert)}
            className="btn-secondary w-full flex items-center justify-center gap-2"
          >
            <Bell className="h-4 w-4" />
            Notify When Available
          </button>
          {showAlert && (
            <div className="flex gap-2 mt-2">
              <input
                type="email"
                value={alertEmail}
                onChange={(e) => setAlertEmail(e.target.value)}
                placeholder={user?.email || "your@email.com"}
                className="flex-1 px-3 py-2 bg-brand-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
              />
              <button onClick={handleStockAlert} className="btn-primary px-4 py-2 text-sm">
                Alert Me
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
