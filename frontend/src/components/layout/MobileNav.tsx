"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { X, Home, ShoppingBag, Heart, User, ChevronRight } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useAuthStore } from "@/store/authStore";
import { cn } from "@/lib/utils";
import type { Category } from "@/types";

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
  categories?: Category[];
}

const FALLBACK_CATEGORIES = ["Hoodies", "Jackets", "T-Shirts", "Shoes", "Accessories"];

export function MobileNav({ isOpen, onClose, categories = [] }: MobileNavProps) {
  const pathname = usePathname();
  const { isAuthenticated } = useAuthStore();

  const topLinks = [
    { href: "/", label: "Home", icon: Home },
    { href: "/shop", label: "Shop", icon: ShoppingBag },
    { href: "/wishlist", label: "Wishlist", icon: Heart },
    {
      href: isAuthenticated ? "/dashboard" : "/auth/login",
      label: isAuthenticated ? "Account" : "Sign In",
      icon: User,
    },
  ];

  const displayCategories =
    categories.length > 0
      ? categories.slice(0, 6)
      : FALLBACK_CATEGORIES.map((name, i) => ({
          id: i,
          name,
          slug: name.toLowerCase(),
          description: "",
          image: null,
          children: [],
          sort_order: i,
        }));

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 md:hidden"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 220 }}
            className="fixed left-0 top-0 bottom-0 w-[300px] bg-[#0e1120] border-r border-brand-border z-50 md:hidden flex flex-col overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-brand-border">
              <Link href="/" onClick={onClose} className="flex items-center gap-2">
                <div className="w-7 h-7 bg-brand-primary rounded-lg flex items-center justify-center">
                  <span className="text-black font-black text-xs">H</span>
                </div>
                <span className="font-bold tracking-tight">
                  HEXA<span className="text-brand-secondary">SHOP</span>
                </span>
              </Link>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-brand-border text-brand-muted hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Nav links */}
            <nav className="px-3 pt-4 space-y-0.5">
              {topLinks.map(({ href, label, icon: Icon }) => (
                <Link
                  key={label}
                  href={href}
                  onClick={onClose}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors",
                    (href === "/" ? pathname === "/" : pathname.startsWith(href))
                      ? "bg-brand-primary/10 text-brand-primary"
                      : "text-brand-muted hover:text-white hover:bg-white/5"
                  )}
                >
                  <Icon className="h-4.5 w-4.5 shrink-0" />
                  {label}
                </Link>
              ))}
            </nav>

            {/* Categories */}
            <div className="px-3 pt-5">
              <p className="text-[10px] uppercase tracking-widest text-brand-muted font-semibold px-4 mb-2">
                Categories
              </p>
              <div className="space-y-0.5">
                {displayCategories.map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/categories/${cat.slug}`}
                    onClick={onClose}
                    className="flex items-center justify-between px-4 py-2.5 rounded-xl text-sm text-brand-muted hover:text-white hover:bg-white/5 transition-colors"
                  >
                    {cat.name}
                    <ChevronRight className="h-3.5 w-3.5 opacity-40" />
                  </Link>
                ))}
              </div>
            </div>

            {/* Footer promo */}
            <div className="mt-auto p-4 pt-6">
              <Link
                href="/shop?on_sale=true"
                onClick={onClose}
                className="block bg-gradient-to-r from-brand-primary/10 to-brand-secondary/5 border border-brand-primary/20 rounded-2xl p-4 hover:border-brand-primary/40 transition-colors"
              >
                <p className="text-brand-primary text-sm font-bold">🔥 Special Offer</p>
                <p className="text-xs text-brand-muted mt-0.5">
                  Up to <strong className="text-brand-primary">40% OFF</strong> sitewide
                </p>
                <p className="text-xs text-brand-secondary mt-1 font-medium">Shop sale →</p>
              </Link>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
