"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { Search, User, ShoppingCart, Heart, Moon, Sun, Menu, X, ChevronDown } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { useAuthStore } from "@/store/authStore";
import { SearchBar } from "@/components/search/SearchBar";
import { cn } from "@/lib/utils";
import { MobileNav } from "./MobileNav";

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const cart = useCartStore((s) => s.cart);
  const openCart = useCartStore((s) => s.openCart);
  const { user, isAuthenticated } = useAuthStore();

  const itemCount = cart?.item_count ?? 0;

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <>
      {/* Announcement bar */}
      <div className="bg-brand-primary text-black text-center text-xs py-2 font-semibold">
        🔥 Big Sale Live! Get Up to <strong>40% OFF</strong> on All Products.
      </div>

      <header
        className={cn(
          "sticky top-0 z-40 border-b border-brand-border transition-all duration-300",
          scrolled ? "bg-brand-dark/95 backdrop-blur-md" : "bg-brand-dark"
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 flex-shrink-0">
              <div className="w-8 h-8 bg-brand-primary rounded-lg flex items-center justify-center">
                <span className="text-black font-bold text-sm">H</span>
              </div>
              <span className="font-bold text-lg">
                HEXA<span className="text-brand-secondary">SHOP</span>
              </span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-8">
              <Link href="/" className="text-sm hover:text-brand-primary transition-colors">
                Home
              </Link>
              <Link href="/shop" className="text-sm text-brand-primary border-b-2 border-brand-primary">
                Shop
              </Link>
              <div className="relative group">
                <button className="flex items-center gap-1 text-sm hover:text-brand-primary transition-colors">
                  Categories <ChevronDown className="h-4 w-4" />
                </button>
                <div className="absolute top-full left-0 pt-2 hidden group-hover:block">
                  <div className="bg-brand-surface border border-brand-border rounded-xl p-2 w-48 space-y-1">
                    {["Hoodies", "Jackets", "T-Shirts", "Shoes", "Accessories"].map((cat) => (
                      <Link
                        key={cat}
                        href={`/categories/${cat.toLowerCase()}`}
                        className="block px-3 py-2 text-sm rounded-lg hover:bg-brand-border hover:text-brand-primary transition-colors"
                      >
                        {cat}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
              <Link href="/about" className="text-sm hover:text-brand-primary transition-colors">
                About
              </Link>
              <Link href="/contact" className="text-sm hover:text-brand-primary transition-colors">
                Contact
              </Link>
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="p-2 rounded-lg hover:bg-brand-surface transition-colors"
                aria-label="Search"
              >
                <Search className="h-5 w-5" />
              </button>

              {isAuthenticated ? (
                <Link
                  href="/dashboard"
                  className="p-2 rounded-lg hover:bg-brand-surface transition-colors"
                  aria-label="Account"
                >
                  <User className="h-5 w-5" />
                </Link>
              ) : (
                <Link
                  href="/auth/login"
                  className="p-2 rounded-lg hover:bg-brand-surface transition-colors"
                  aria-label="Login"
                >
                  <User className="h-5 w-5" />
                </Link>
              )}

              <Link
                href="/wishlist"
                className="p-2 rounded-lg hover:bg-brand-surface transition-colors hidden sm:block"
                aria-label="Wishlist"
              >
                <Heart className="h-5 w-5" />
              </Link>

              <button
                onClick={openCart}
                className="relative p-2 rounded-lg hover:bg-brand-surface transition-colors"
                aria-label={`Cart (${itemCount} items)`}
              >
                <ShoppingCart className="h-5 w-5" />
                {itemCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 h-4 w-4 bg-brand-primary text-black text-[10px] font-bold rounded-full flex items-center justify-center">
                    {itemCount > 9 ? "9+" : itemCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => setMobileOpen(true)}
                className="md:hidden p-2 rounded-lg hover:bg-brand-surface transition-colors"
                aria-label="Menu"
              >
                <Menu className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Search bar expansion */}
          {searchOpen && (
            <div className="py-3 border-t border-brand-border animate-fade-in">
              <SearchBar onClose={() => setSearchOpen(false)} autoFocus />
            </div>
          )}
        </div>
      </header>

      <MobileNav isOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
    </>
  );
}
