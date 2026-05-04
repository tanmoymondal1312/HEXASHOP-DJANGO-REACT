"use client";

import Link from "next/link";
import { X, Home, ShoppingBag, Heart, User, Grid3X3 } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useAuthStore } from "@/store/authStore";

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileNav({ isOpen, onClose }: MobileNavProps) {
  const { isAuthenticated } = useAuthStore();

  const links = [
    { href: "/", label: "Home", icon: Home },
    { href: "/shop", label: "Shop", icon: ShoppingBag },
    { href: "/categories", label: "Categories", icon: Grid3X3 },
    { href: "/wishlist", label: "Wishlist", icon: Heart },
    { href: isAuthenticated ? "/dashboard" : "/auth/login", label: isAuthenticated ? "Account" : "Login", icon: User },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 z-50 md:hidden"
          />
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed left-0 top-0 bottom-0 w-72 bg-brand-surface border-r border-brand-border z-50 md:hidden flex flex-col"
          >
            <div className="flex items-center justify-between p-4 border-b border-brand-border">
              <Link href="/" onClick={onClose} className="flex items-center gap-2">
                <div className="w-7 h-7 bg-brand-primary rounded-md flex items-center justify-center">
                  <span className="text-black font-bold text-xs">H</span>
                </div>
                <span className="font-bold">HEXA<span className="text-brand-secondary">SHOP</span></span>
              </Link>
              <button onClick={onClose} className="p-2 rounded-lg hover:bg-brand-border">
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav className="flex-1 p-4 space-y-1">
              {links.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={onClose}
                  className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-brand-border hover:text-brand-primary transition-colors"
                >
                  <Icon className="h-5 w-5" />
                  <span>{label}</span>
                </Link>
              ))}
            </nav>

            <div className="p-4 border-t border-brand-border">
              <div className="bg-brand-primary/10 border border-brand-primary/30 rounded-xl p-3">
                <p className="text-brand-primary text-sm font-semibold">Special Offer!</p>
                <p className="text-xs text-gray-400 mt-0.5">Up to 40% OFF sitewide</p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
