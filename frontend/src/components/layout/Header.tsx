"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  Search, User, ShoppingCart, Heart, Menu, X, ChevronDown, TrendingUp,
} from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { useAuthStore } from "@/store/authStore";
import { SearchBar } from "@/components/search/SearchBar";
import { MobileNav } from "./MobileNav";
import { siteApi, productsApi } from "@/lib/api";
import { cn } from "@/lib/utils";
import type { Category } from "@/types";

interface AnnouncementState {
  text: string; isActive: boolean; link: string; bgColor: string; textColor: string;
}
const DEFAULT_ANNOUNCEMENT: AnnouncementState = {
  text: "🔥 Big Sale Live! Get Up to 40% OFF on All Products.",
  isActive: true, link: "", bgColor: "#111111", textColor: "#ffffff",
};

export function Header() {
  const pathname  = usePathname();
  const router    = useRouter();

  const [scrolled,    setScrolled]    = useState(false);
  const [mobileOpen,  setMobileOpen]  = useState(false);
  const [mobileSearch,setMobileSearch]= useState(false);   // mobile: icon opens bar
  const [focused,     setFocused]     = useState(false);   // desktop: input focused
  const [dismissed,   setDismissed]   = useState(false);
  const [announcement,setAnnouncement]= useState<AnnouncementState>(DEFAULT_ANNOUNCEMENT);
  const [categories,  setCategories]  = useState<Category[]>([]);
  const [query,       setQuery]       = useState("");

  const desktopInputRef = useRef<HTMLInputElement>(null);

  const cart     = useCartStore((s) => s.cart);
  const openCart = useCartStore((s) => s.openCart);
  const { isAuthenticated } = useAuthStore();
  const itemCount = cart?.item_count ?? 0;

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);

  useEffect(() => {
    siteApi.settings().then(({ data }) => {
      setAnnouncement({
        text:      data.announcement_bar_text || DEFAULT_ANNOUNCEMENT.text,
        isActive:  data.announcement_bar_is_active ?? true,
        link:      data.announcement_bar_link || "",
        bgColor:   data.announcement_bar_bg_color || "#111111",
        textColor: data.announcement_bar_text_color || "#ffffff",
      });
    }).catch(() => {});
    productsApi.categories().then(({ data }) => setCategories(data)).catch(() => {});
  }, []);

  const NAV_LINKS = [
    { href: "/",        label: "Home"    },
    { href: "/shop",    label: "Shop"    },
    { href: "/about",   label: "About"   },
    { href: "/contact", label: "Contact" },
  ];
  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  const handleDesktopSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/shop?q=${encodeURIComponent(query.trim())}`);
      setFocused(false);
      desktopInputRef.current?.blur();
    }
  };

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
          ) : <span>{announcement.text}</span>}
          <button
            onClick={() => setDismissed(true)}
            className="absolute right-3 top-1/2 -translate-y-1/2 opacity-50 hover:opacity-100 transition-opacity"
            aria-label="Dismiss announcement"
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
          <div className="flex items-center h-16 gap-3">

            {/* ── Hexagon Logo ───────────────────────────────────────── */}
            <Link href="/" className="flex items-center gap-2 flex-shrink-0 group">
              <svg width="34" height="38" viewBox="0 0 34 38" fill="none"
                className="group-hover:scale-105 transition-transform duration-200">
                <polygon points="17,1 33,10 33,28 17,37 1,28 1,10"
                  fill="none" stroke="#F5A623" strokeWidth="1.8" />
                <polygon points="17,6 28,12.5 28,25.5 17,32 6,25.5 6,12.5"
                  fill="rgba(245,166,35,0.08)" stroke="rgba(245,166,35,0.35)" strokeWidth="1" />
                <text x="17" y="23" textAnchor="middle" fill="#F5A623"
                  fontSize="13" fontWeight="800" fontFamily="Inter, sans-serif">H</text>
              </svg>
              <span className="font-black text-lg tracking-tight hidden sm:block">
                HEXA<span className="text-brand-secondary">SHOP</span>
              </span>
            </Link>

            {/* ── Desktop nav ────────────────────────────────────────── */}
            <nav className="hidden md:flex items-center gap-0.5 flex-shrink-0">
              {NAV_LINKS.map(({ href, label }) => (
                <Link key={href} href={href}
                  className={cn(
                    "px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-150 relative whitespace-nowrap",
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
                    "flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-150 whitespace-nowrap",
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
                        <Link key={cat.id} href={`/categories/${cat.slug}`}
                          className="flex items-center gap-2 px-3 py-2.5 text-sm rounded-xl text-brand-muted hover:bg-white/5 hover:text-white transition-colors">
                          <span className="w-1.5 h-1.5 rounded-full bg-brand-primary/50" />
                          {cat.name}
                        </Link>
                      ))}
                      <div className="mt-1 pt-1 border-t border-brand-border">
                        <Link href="/shop"
                          className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-brand-primary hover:bg-brand-primary/10 rounded-xl transition-colors">
                          View all products →
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </nav>

            {/* ════════════════════════════════════════════════════════════
                PERSISTENT SEARCH BAR — desktop & tablet (hidden on mobile)
                Always visible, pill-shaped, clearly readable.
            ════════════════════════════════════════════════════════════ */}
            <form
              onSubmit={handleDesktopSearch}
              className="hidden md:flex flex-1 items-center relative min-w-0"
              style={{ maxWidth: 360 }}
              role="search"
              aria-label="Site search"
            >
              {/*
                Gradient-border pill:
                  outer div carries the gradient background (acts as the border)
                  inner div clips to the dark background
                  This is the only reliable way to get gradient borders + border-radius.
              */}
              <div
                style={{
                  padding: "1.5px",
                  borderRadius: "9999px",
                  background: focused
                    ? "linear-gradient(120deg, #f5a623 0%, #1e90ff 100%)"
                    : "linear-gradient(120deg, rgba(245,166,35,0.55) 0%, rgba(30,144,255,0.55) 100%)",
                  boxShadow: focused
                    ? "0 0 18px rgba(245,166,35,0.22), 0 0 36px rgba(30,144,255,0.12)"
                    : "0 0 8px rgba(245,166,35,0.08), 0 0 16px rgba(30,144,255,0.06)",
                  transition: "background 0.25s ease, box-shadow 0.25s ease",
                  width: "100%",
                }}
              >
                {/* Inner dark background */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    background: "#111520",
                    borderRadius: "9999px",
                    overflow: "hidden",
                  }}
                >
                  {/* Left search icon */}
                  <Search
                    style={{
                      marginLeft: 14,
                      flexShrink: 0,
                      width: 15,
                      height: 15,
                      color: focused ? "#f5a623" : "#6b7280",
                      transition: "color 0.2s",
                    }}
                  />

                  <input
                    ref={desktopInputRef}
                    type="search"
                    name="q"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setTimeout(() => setFocused(false), 200)}
                    placeholder="Search products, categories…"
                    autoComplete="off"
                    aria-label="Search"
                    style={{
                      flex: 1,
                      background: "transparent",
                      padding: "0.6rem 0.75rem",
                      fontSize: "0.8rem",
                      color: "#fff",
                      outline: "none",
                      border: "none",
                      minWidth: 0,
                    }}
                  />

                  {/* Gold submit button — always visible */}
                  <button
                    type="submit"
                    aria-label="Submit search"
                    style={{
                      margin: "3px",
                      flexShrink: 0,
                      background: "linear-gradient(135deg, #f5a623 0%, #f59e0b 100%)",
                      color: "#000",
                      fontWeight: 700,
                      fontSize: "0.72rem",
                      padding: "0.42rem 1rem",
                      borderRadius: "9999px",
                      border: "none",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 5,
                      letterSpacing: "0.03em",
                      whiteSpace: "nowrap",
                      transition: "opacity 0.15s",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.88")}
                    onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
                  >
                    <Search style={{ width: 12, height: 12 }} />
                    Search
                  </button>
                </div>
              </div>

              {/* Popular searches hint — shows when focused and empty */}
              {focused && !query.trim() && (
                <div className="absolute top-full left-0 right-0 mt-2 z-50 bg-[#161b2e] border border-brand-border rounded-2xl shadow-2xl shadow-black/50 p-3">
                  <p className="text-[11px] text-brand-muted flex items-center gap-1.5 mb-2">
                    <TrendingUp className="h-3 w-3" /> Popular Searches
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {["Dresses", "Sneakers", "Handbags", "Jewelry", "Jackets"].map((term) => (
                      <button
                        key={term}
                        type="button"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          router.push(`/shop?q=${encodeURIComponent(term)}`);
                          setFocused(false);
                        }}
                        className="px-3 py-1 bg-brand-border rounded-full text-xs hover:bg-brand-primary hover:text-black transition-colors"
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </form>

            {/* ── Actions ──────────────────────────────────────────────── */}
            <div className="flex items-center gap-0.5 ml-auto md:ml-0">

              {/* Search icon — mobile ONLY */}
              <button
                onClick={() => setMobileSearch((o) => !o)}
                className={cn(
                  "md:hidden p-2.5 rounded-lg transition-colors duration-150",
                  mobileSearch
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
                aria-label={isAuthenticated ? "My account" : "Sign in"}
              >
                <User className="h-[18px] w-[18px]" />
              </Link>

              <Link
                href="/wishlist"
                className="p-2.5 rounded-lg text-brand-muted hover:text-white hover:bg-brand-surface transition-colors duration-150 hidden sm:block"
                aria-label="Wishlist"
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
                aria-label="Open menu"
              >
                <Menu className="h-[18px] w-[18px]" />
              </button>
            </div>
          </div>

          {/* Mobile search expansion */}
          {mobileSearch && (
            <div className="pb-4 pt-3 border-t border-brand-border animate-fade-in md:hidden">
              <SearchBar
                onClose={() => setMobileSearch(false)}
                autoFocus
              />
            </div>
          )}
        </div>
      </header>

      <MobileNav isOpen={mobileOpen} onClose={() => setMobileOpen(false)} categories={categories} />
    </>
  );
}
