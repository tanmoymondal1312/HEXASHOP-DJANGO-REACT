"use client";

import Link from "next/link";
import Image from "next/image";
import { X, Minus, Plus, Trash2, ShoppingBag, Truck } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useCartStore } from "@/store/cartStore";
import { formatPrice, FREE_SHIPPING_THRESHOLD } from "@/lib/utils";
import { cn } from "@/lib/utils";

export function CartDrawer() {
  const { cart, isOpen, closeCart, updateItem, removeItem } = useCartStore();

  const total = parseFloat(cart?.total || "0");
  const freeShippingProgress = Math.min((total / FREE_SHIPPING_THRESHOLD) * 100, 100);
  const remaining = Math.max(FREE_SHIPPING_THRESHOLD - total, 0);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50"
            onClick={closeCart}
          />

          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-brand-surface border-l border-brand-border z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-brand-border">
              <div className="flex items-center gap-2">
                <ShoppingBag className="h-5 w-5 text-brand-primary" />
                <h2 className="font-semibold">Your Cart</h2>
                {cart && cart.item_count > 0 && (
                  <span className="badge bg-brand-primary/20 text-brand-primary">
                    {cart.item_count}
                  </span>
                )}
              </div>
              <button
                onClick={closeCart}
                className="p-2 rounded-lg hover:bg-brand-border transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Free shipping progress */}
            {remaining > 0 && (
              <div className="px-5 py-3 bg-brand-dark/50 border-b border-brand-border">
                <div className="flex items-center gap-2 mb-2">
                  <Truck className="h-4 w-4 text-brand-primary" />
                  <p className="text-xs text-brand-muted">
                    Add <span className="text-brand-primary font-semibold">{formatPrice(remaining)}</span> more for free shipping!
                  </p>
                </div>
                <div className="h-1.5 bg-brand-border rounded-full overflow-hidden">
                  <div
                    className="h-full bg-brand-primary rounded-full transition-all duration-500"
                    style={{ width: `${freeShippingProgress}%` }}
                  />
                </div>
              </div>
            )}
            {remaining === 0 && cart && cart.item_count > 0 && (
              <div className="px-5 py-3 bg-green-500/10 border-b border-green-500/20">
                <p className="text-xs text-green-400 flex items-center gap-2">
                  <Truck className="h-4 w-4" /> You qualify for free shipping!
                </p>
              </div>
            )}

            {/* Items */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
              {!cart || cart.items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-4 text-brand-muted">
                  <ShoppingBag className="h-16 w-16 opacity-30" />
                  <p className="text-lg">Your cart is empty</p>
                  <button onClick={closeCart}>
                    <Link href="/shop" className="btn-primary text-sm">
                      Continue Shopping
                    </Link>
                  </button>
                </div>
              ) : (
                cart.items.map((item) => (
                  <div key={item.id} className="flex gap-3">
                    <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-brand-dark">
                      {item.image && (
                        <Image src={item.image} alt={item.product_name} fill className="object-cover" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/products/${item.product_slug}`}
                        onClick={closeCart}
                        className="text-sm font-medium line-clamp-1 hover:text-brand-primary transition-colors"
                      >
                        {item.product_name}
                      </Link>
                      {item.variant_name && (
                        <p className="text-xs text-brand-muted mt-0.5">{item.variant_name}</p>
                      )}
                      {item.variant_attributes && (
                        <div className="flex gap-2 mt-0.5">
                          {Object.entries(item.variant_attributes).map(([k, v]) => (
                            <span key={k} className="text-xs text-brand-muted capitalize">
                              {k}: {v}
                            </span>
                          ))}
                        </div>
                      )}
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-1 bg-brand-border rounded-lg">
                          <button
                            onClick={() => updateItem(item.id, item.quantity - 1)}
                            className="p-1.5 hover:text-brand-primary transition-colors"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <span className="px-2 text-sm font-medium">{item.quantity}</span>
                          <button
                            onClick={() => updateItem(item.id, item.quantity + 1)}
                            className="p-1.5 hover:text-brand-primary transition-colors"
                            aria-label="Increase quantity"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-brand-primary">
                            {formatPrice(item.line_total)}
                          </span>
                          <button
                            onClick={() => removeItem(item.id)}
                            className="p-1 text-brand-muted hover:text-red-400 transition-colors"
                            aria-label="Remove item"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer summary */}
            {cart && cart.items.length > 0 && (
              <div className="border-t border-brand-border px-5 py-4 space-y-3">
                <div className="space-y-1.5">
                  <div className="flex justify-between text-sm text-brand-muted">
                    <span>Subtotal</span>
                    <span>{formatPrice(cart.total)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-brand-muted">
                    <span>Shipping</span>
                    <span className={cn(cart.shipping_cost === "0.00" ? "text-green-400" : "")}>
                      {cart.shipping_cost === "0.00" ? "FREE" : formatPrice(cart.shipping_cost)}
                    </span>
                  </div>
                  <div className="flex justify-between font-bold text-lg border-t border-brand-border pt-2">
                    <span>Total</span>
                    <span className="text-brand-primary">
                      {formatPrice(parseFloat(cart.total) + parseFloat(cart.shipping_cost))}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => { closeCart(); }}
                  className="btn-primary w-full text-center"
                >
                  Proceed to Checkout
                </button>
                <button
                  onClick={closeCart}
                  className="btn-secondary w-full text-center text-sm"
                >
                  Continue Shopping
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
