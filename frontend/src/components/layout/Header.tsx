"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Search, User, ShoppingCart, Heart, Menu, X, ChevronDown } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { useAuthStore } from "@/store/authStore";
import { SearchBar } from "@/components/search/SearchBar";
import { MobileNav } from "./MobileNav";
import { siteApi, productsApi } from "@/lib/api";
import { cn } from "@/lib/utils";
import type { Category } from "@/types";

interface AnnouncementState {
  text: string;
  isActive: boolean;
  link: string;
  bgColor: string;
  textColor: string;
}

const DEFAULT_ANNOUNCEMENT: AnnouncementState = {
  text: "🔥 Big Sale Live! Get Up to 40% OFF on All Products.",
  isActive: true,
  link: "",
  bgColor: "#111111",
  textColor: "#ffffff",
};

export function Header() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [announcement, setAnnouncement] = useState<AnnouncementState>(DEFAULT_ANNOUNCEMENT);
  const [categories, setCategories] = useState<Category[]>([]);

  const cart = useCartStore((s) => s.cart);
  const openCart = useCartStore((s) => s.openCart);
  const { isAuthenticated } = useAuthStore();
  const itemCount = cart?.item_count ?? 0;

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  useEffect(() => {
    siteApi.settings().then(({ data }) => {
      setAnnouncement({
        text: data.announcement_bar_text || DEFAULT_ANNOUNCEMENT.text,
        isActive: data.announcement_bar_is_active ?? true,
        link: data.announcement_bar_link || "",
        bgColor: data.announcement_bar_bg_color || "#111111",
        textColor: data.announcement_bar_text_color || "#ffffff",
      });
    }).catch(() => {});

    productsApi.categories().then(({ data }) => setCategories(data)).catch(() => {});
  }, []);

  const NAV_LINKS = [
    { href: "/",       label: "Home" },
    { href: "/shop",   label: "Shop" },
    { href: "/about",  label: "About" },
    { href: "/contact",label: "Contact" },
  ];

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <>
      {/* ── Announcement bar ─────────────────────────────────────────── */}
      {announcement.isActive && !dismissed && (
        <div
          className="relative text-center text-xs py-2.5 px-10 font-medium tracking-wide"
          style={{ backgroundColor: announcement.bgColor, color: announcement.textColor }}
        >
          {announcement.link ? (
            <Link href={announcement.link} className="hover:underline underline-offset-2">
              {announcement.text}
            </Link>
          ) : (
            <span>{announcement.text}</span>
          )}
          <button
            onClick={() => setDismissed(true)}
            className="absolute right-3 top-1/2 -translate-y-1/2 opacity-50 hover:opacity-100 transition-opacity"
            aria-label="Dismiss"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* ── Header ───────────────────────────────────────────────────── */}
      <header
        className={cn(
          "sticky top-0 z-40 border-b border-brand-border transition-all duration-300",
          scrolled
            ? "bg-brand-dark/95 backdrop-blur-md shadow-xl shadow-black/30"
            : "bg-brand-dark"
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">

            {/* ── Hexagon Logo ─────────────────────────────────────── */}
            <Link href="/" className="flex items-center gap-2 flex-shrink-0 group">
              <svg width="34" height="38" viewBox="0 0 34 38" fill="none" className="group-hover:scale-105 transition-transform duration-200">
                <polygon
                  points="17,1 33,10 33,28 17,37 1,28 1,10"
                  fill="none"
                  stroke="#F5A623"
                  strokeWidth="1.8"
                />
                <polygon
                  points="17,6 28,12.5 28,25.5 17,32 6,25.5 6,12.5"
                  fill="rgba(245,166,35,0.08)"
                  stroke="rgba(245,166,35,0.35)"
                  strokeWidth="1"
                />
                <text
                  x="17" y="23"
                  textAnchor="middle"
                  fill="#F5A623"
                  fontSize="13"
                  fontWeight="800"
                  fontFamily="Inter, sans-serif"
                >H</text>
              </svg>
              <span className="font-black text-lg tracking-tight">
                HEXA<span className="text-brand-secondary">SHOP</span>
              </span>
            </Link>

            {/* ── Desktop nav ──────────────────────────────────────── */}
            <nav className="hidden md:flex items-center gap-1">
              {NAV_LINKS.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-150 relative",
                    isActive(href)
                      ? "text-brand-primary"
                      : "text-brand-muted hover:text-white hover:bg-white/5"
                  )}
                >
                  {label}
                  {isActive(href) && (
                    <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-brand-primary rounded-full" />
                  )}
                </Link>
              ))}

              {/* Categories dropdown */}
              {categories.length > 0 && (
                <div className="relative group">
                  <button className={cn(
                    "flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-150",
                    pathname.startsWith("/categories")
                      ? "text-brand-primary"
                      : "text-brand-muted hover:text-white hover:bg-white/5"
                  )}>
                    Categories
                    <ChevronDown className="h-3.5 w-3.5 transition-transform duration-200 group-hover:rotate-180" />
                  </button>
                  <div className="absolute top-full left-0 pt-2 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-200 z-50">
                    <div className="bg-[#161b2e] border border-brand-border rounded-2xl p-2 shadow-2xl shadow-black/50 min-w-[200px]">
                      {categories.slice(0, 8).map((cat) => (
                        <Link
                          key={cat.id}
                          href={`/categories/${cat.slug}`}
                          className="flex items-center gap-2 px-3 py-2.5 text-sm rounded-xl text-brand-muted hover:bg-white/5 hover:text-white transition-colors"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-brand-primary/50" />
                          {cat.name}
                        </Link>
                      ))}
                      <div className="mt-1 pt-1 border-t border-brand-border">
                        <Link
                          href="/shop"
                          className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-brand-primary hover:bg-brand-primary/10 rounded-xl transition-colors"
                        >
                          View all products →
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </nav>

            {/* ── Actions ──────────────────────────────────────────── */}
            <div className="flex items-center gap-0.5">
              <button
                onClick={() => setSearchOpen((o) => !o)}
                className={cn(
                  "p-2.5 rounded-lg transition-colors duration-150",
                  searchOpen
                    ? "bg-brand-primary/10 text-brand-primary"
                    : "text-brand-muted hover:text-white hover:bg-brand-surface"
                )}
                aria-label="Search"
              >
                <Search className="h-[18px] w-[18px]" />
              </button>

              <Link
                href={isAuthenticated ? "/dashboard" : "/auth/login"}
                className="p-2.5 rounded-lg text-brand-muted hover:text-white hover:bg-brand-surface transition-colors duration-150"
              >
                <User className="h-[18px] w-[18px]" />
              </Link>

              <Link
                href="/wishlist"
                className="p-2.5 rounded-lg text-brand-muted hover:text-white hover:bg-brand-surface transition-colors duration-150 hidden sm:block"
              >
                <Heart className="h-[18px] w-[18px]" />
              </Link>

              <button
                onClick={openCart}
                className="relative p-2.5 rounded-lg text-brand-muted hover:text-white hover:bg-brand-surface transition-colors duration-150"
                aria-label={`Cart (${itemCount} items)`}
              >
                <ShoppingCart className="h-[18px] w-[18px]" />
                {itemCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 h-[18px] w-[18px] bg-brand-primary text-black text-[9px] font-black rounded-full flex items-center justify-center leading-none">
                    {itemCount > 9 ? "9+" : itemCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => setMobileOpen(true)}
                className="md:hidden p-2.5 rounded-lg text-brand-muted hover:text-white hover:bg-brand-surface transition-colors duration-150 ml-1"
              >
                <Menu className="h-[18px] w-[18px]" />
              </button>
            </div>
          </div>

          {/* Search expansion */}
          {searchOpen && (
            <div className="pb-4 pt-3 border-t border-brand-border animate-fade-in">
              <SearchBar onClose={() => setSearchOpen(false)} autoFocus />
            </div>
          )}
        </div>
      </header>

      <MobileNav isOpen={mobileOpen} onClose={() => setMobileOpen(false)} categories={categories} />
    </>
  );
}
