"use client";

import { useEffect, useState } from "react";
import { ShoppingCart, Heart, Bell, Minus, Plus, Zap } from "lucide-react";
import { Product, ProductColor, ProductVariant } from "@/types";
import { useCartStore } from "@/store/cartStore";
import { useWishlist } from "@/hooks/useWishlist";
import { useAuthStore } from "@/store/authStore";
import { notificationsApi } from "@/lib/api";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

interface Props { product: Product }

export function AddToCartSection({ product }: Props) {
  const colors   = product.colors   ?? [];
  const variants = product.variants ?? [];

  // ── State ─────────────────────────────────────────────────────────────────
  const [selectedColor,   setSelectedColor]   = useState<ProductColor | null>(colors[0] ?? null);
  const [selectedSize,    setSelectedSize]    = useState<string | null>(null);
  const [quantity,        setQuantity]        = useState(1);
  const [alertEmail,      setAlertEmail]      = useState("");
  const [showAlertForm,   setShowAlertForm]   = useState(false);

  // ── Derived helpers ────────────────────────────────────────────────────────

  /** All sizes available for the currently selected colour (stock > 0). */
  const sizesForColor = (colorId: number | null): string[] => {
    const relevant = variants.filter(
      (v) => v.is_active && (colorId === null || v.color_id === colorId)
    );
    // Only include sizes that are in-stock
    const inStock = [...new Set(relevant.filter((v) => v.stock > 0).map((v) => v.size).filter(Boolean))];
    return inStock;
  };

  /** Variant for the selected colour × size combo. */
  const findVariant = (colorId: number | null, size: string | null): ProductVariant | null => {
    if (!size) return null;
    return variants.find(
      (v) =>
        v.is_active &&
        v.size === size &&
        (colorId === null || v.color_id === colorId)
    ) ?? null;
  };

  // Reset size when colour changes if the current size is no longer available
  useEffect(() => {
    const available = sizesForColor(selectedColor?.id ?? null);
    if (selectedSize && !available.includes(selectedSize)) {
      setSelectedSize(null);
    }
    // Auto-select size if only one is available
    if (!selectedSize && available.length === 1) {
      setSelectedSize(available[0]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedColor]);

  // If no colours defined, handle size-only flow
  const noColors = colors.length === 0;
  const allSizes = noColors
    ? [...new Set(variants.filter((v) => v.is_active && v.stock > 0).map((v) => v.size).filter(Boolean))]
    : sizesForColor(selectedColor?.id ?? null);

  const selectedVariant = noColors
    ? findVariant(null, selectedSize)
    : findVariant(selectedColor?.id ?? null, selectedSize);

  // ── Emit event so the gallery switches image ───────────────────────────────
  const handleColorSelect = (color: ProductColor) => {
    setSelectedColor(color);
    setQuantity(1);
    window.dispatchEvent(
      new CustomEvent("hexashop:color-select", { detail: { colorId: color.id } })
    );
  };

  // ── Cart / wishlist ────────────────────────────────────────────────────────
  const addItem    = useCartStore((s) => s.addItem);
  const { toggle, isInWishlist } = useWishlist();
  const { isAuthenticated, user } = useAuthStore();
  const isWished   = isAuthenticated && isInWishlist(product.id);

  const canAdd     = !!selectedVariant?.is_in_stock && quantity <= (selectedVariant?.stock ?? 0);
  const isOutOfStock = selectedVariant ? !selectedVariant.is_in_stock : allSizes.length === 0;

  const openCartDrawer = useCartStore((s) => s.openCart);

  const handleAddToCart = async () => {
    if (!selectedVariant) {
      toast.error(selectedSize ? "This combination is out of stock." : "Please select a size.");
      return;
    }
    await addItem(selectedVariant.id, quantity);
  };

  const handleBuyNow = async () => {
    if (!selectedVariant) {
      toast.error(selectedSize ? "This combination is out of stock." : "Please select a size.");
      return;
    }
    await addItem(selectedVariant.id, quantity);
    openCartDrawer();
  };

  const handleStockAlert = async () => {
    if (!selectedVariant) return;
    const email = alertEmail || user?.email || "";
    if (!email) { toast.error("Please enter your email."); return; }
    try {
      await notificationsApi.subscribeStockAlert(email, selectedVariant.id);
      toast.success("We'll notify you when this is back in stock!");
      setShowAlertForm(false);
    } catch {
      toast.error("Failed to register alert.");
    }
  };

  return (
    <div className="space-y-5">

      {/* ── Colour selector ────────────────────────────────────────────── */}
      {colors.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-sm font-semibold">Colour</span>
            {selectedColor && (
              <span className="text-sm text-brand-muted font-normal">{selectedColor.name}</span>
            )}
          </div>
          <div className="flex flex-wrap gap-2.5">
            {colors.map((color) => {
              const isSelected = selectedColor?.id === color.id;
              return (
                <button
                  key={color.id}
                  type="button"
                  title={color.name}
                  onClick={() => handleColorSelect(color)}
                  className={cn(
                    "relative w-10 h-10 rounded-full border-2 transition-all duration-200 overflow-hidden",
                    isSelected
                      ? "border-brand-primary scale-110 shadow-lg shadow-brand-primary/30"
                      : "border-brand-border hover:border-brand-primary hover:scale-105"
                  )}
                  style={!color.image_url ? { backgroundColor: color.hex_code || "#9ca3af" } : undefined}
                >
                  {color.image_url && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={color.image_url}
                      alt={color.name}
                      className="w-full h-full object-cover"
                    />
                  )}
                  {/* Selected ring */}
                  {isSelected && (
                    <span className="absolute inset-0 rounded-full ring-2 ring-offset-2 ring-offset-brand-dark ring-brand-primary pointer-events-none" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Size selector ──────────────────────────────────────────────── */}
      {(noColors ? allSizes : sizesForColor(selectedColor?.id ?? null)).length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold">Size</span>
            <button className="text-xs text-brand-primary underline underline-offset-2">Size Guide</button>
          </div>
          <div className="flex flex-wrap gap-2">
            {(noColors ? allSizes : sizesForColor(selectedColor?.id ?? null)).map((size) => {
              const v         = findVariant(selectedColor?.id ?? null, size);
              const inStock   = (v?.stock ?? 0) > 0;
              const isSelected = selectedSize === size;
              return (
                <button
                  key={size}
                  type="button"
                  onClick={() => { setSelectedSize(size); setQuantity(1); }}
                  className={cn(
                    "px-4 py-2 text-sm rounded-lg border-2 font-medium transition-all duration-150",
                    isSelected
                      ? "border-brand-primary bg-brand-primary/10 text-brand-primary"
                      : inStock
                      ? "border-brand-border hover:border-brand-primary hover:text-brand-primary"
                      : "border-brand-border/30 text-brand-muted/30 line-through cursor-not-allowed"
                  )}
                  disabled={!inStock}
                >
                  {size}
                  {v && v.stock > 0 && v.stock <= (v.low_stock_threshold ?? 5) && (
                    <span className="ml-1 text-[10px] text-orange-400">({v.stock})</span>
                  )}
                </button>
              );
            })}
          </div>
          {selectedSize && !selectedVariant && (
            <p className="text-xs text-red-400 mt-1.5">This size is out of stock in the selected colour.</p>
          )}
        </div>
      )}

      {/* No sizes/colours at all */}
      {allSizes.length === 0 && colors.length === 0 && (
        <p className="text-sm text-brand-muted">No variants available.</p>
      )}

      {/* ── Quantity ────────────────────────────────────────────────────── */}
      {selectedVariant?.is_in_stock && (
        <div>
          <span className="text-sm font-semibold mb-2 block">Quantity</span>
          <div className="flex items-center gap-3">
            <div className="flex items-center border border-brand-border rounded-xl overflow-hidden">
              <button
                type="button"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="p-3 hover:text-brand-primary hover:bg-brand-border/30 transition-colors"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="px-5 font-semibold text-sm">{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity(Math.min(selectedVariant.stock, quantity + 1))}
                className="p-3 hover:text-brand-primary hover:bg-brand-border/30 transition-colors"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            {selectedVariant.is_low_stock && (
              <span className="text-xs text-orange-400 font-medium">
                Only {selectedVariant.stock} left!
              </span>
            )}
          </div>
        </div>
      )}

      {/* ── CTA buttons ─────────────────────────────────────────────────── */}
      {canAdd ? (
        <div className="space-y-3">
          <button
            type="button"
            onClick={handleBuyNow}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-brand-primary to-emerald-500 text-white font-bold py-3.5 px-6 rounded-xl shadow-lg shadow-brand-primary/25 hover:shadow-xl hover:shadow-brand-primary/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
          >
            <Zap className="h-5 w-5" />
            Buy Now
          </button>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleAddToCart}
              className="btn-primary flex-1 flex items-center justify-center gap-2"
            >
              <ShoppingCart className="h-5 w-5" />
              Add to Cart
            </button>
            <button
              type="button"
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
        </div>
      ) : (
        <div className="space-y-2">
          <button disabled className="btn-primary w-full opacity-40 cursor-not-allowed">
            {selectedSize ? "Out of Stock" : "Select a Size"}
          </button>
          {isOutOfStock && (
            <>
              <button
                type="button"
                onClick={() => setShowAlertForm(!showAlertForm)}
                className="btn-secondary w-full flex items-center justify-center gap-2"
              >
                <Bell className="h-4 w-4" />
                Notify When Available
              </button>
              {showAlertForm && (
                <div className="flex gap-2 mt-2">
                  <input
                    type="email"
                    value={alertEmail}
                    onChange={(e) => setAlertEmail(e.target.value)}
                    placeholder={user?.email || "your@email.com"}
                    className="flex-1 px-3 py-2 bg-brand-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
                  />
                  <button type="button" onClick={handleStockAlert} className="btn-primary px-4 py-2 text-sm">
                    Alert Me
                  </button>
                </div>
              )}
            </>
          )}
          <button
            type="button"
            onClick={() => isAuthenticated && toggle(product.id)}
            className={cn(
              "w-full p-3 rounded-xl border-2 flex items-center justify-center gap-2 text-sm font-medium transition-colors",
              isWished
                ? "border-brand-primary bg-brand-primary/10 text-brand-primary"
                : "border-brand-border hover:border-brand-primary hover:text-brand-primary"
            )}
          >
            <Heart className={cn("h-4 w-4", isWished && "fill-brand-primary")} />
            {isWished ? "Saved to Wishlist" : "Save to Wishlist"}
          </button>
        </div>
      )}
    </div>
  );
}
