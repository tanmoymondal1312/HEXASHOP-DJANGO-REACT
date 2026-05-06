import { Suspense } from "react";
import Link from "next/link";
import {
  ChevronRight,
  Shield,
  Truck,
  RefreshCcw,
  Headphones,
  Zap,
  Star,
  TrendingUp,
  ArrowRight,
} from "lucide-react";
import { productsApi } from "@/lib/api";
import { ProductCard } from "@/components/products/ProductCard";
import { ProductGridSkeleton } from "@/components/ui/Skeleton";
import { WebsiteJsonLd } from "@/components/seo/JsonLd";
import type { Category, Product, PaginatedResponse } from "@/types";

// ─── Server-side data fetchers ────────────────────────────────────────────────

async function getCategories(): Promise<Category[]> {
  try {
    const { data } = await productsApi.categories();
    return data ?? [];
  } catch {
    return [];
  }
}

async function getFeaturedProducts(): Promise<Product[]> {
  try {
    const { data } = await productsApi.featured();
    return data ?? [];
  } catch {
    return [];
  }
}

async function getNewArrivals(): Promise<Product[]> {
  try {
    const { data } = (await productsApi.list({
      ordering: "-created_at",
    })) as { data: PaginatedResponse<Product> };
    return (data.results ?? []).slice(0, 8);
  } catch {
    return [];
  }
}

// ─── Trust badges data ────────────────────────────────────────────────────────

const TRUST_BADGES = [
  { icon: Shield, label: "Secure Payment", sub: "256-bit SSL encryption" },
  { icon: Truck, label: "Free Shipping", sub: "On orders over $50" },
  { icon: RefreshCcw, label: "Easy Returns", sub: "30-day return policy" },
  { icon: Headphones, label: "24/7 Support", sub: "Always here for you" },
];

// ─── Category icons (decorative) ─────────────────────────────────────────────

const CAT_COLORS = [
  "from-violet-500/20 to-indigo-500/10 border-violet-500/20",
  "from-amber-500/20 to-orange-500/10 border-amber-500/20",
  "from-sky-500/20 to-blue-500/10 border-sky-500/20",
  "from-emerald-500/20 to-green-500/10 border-emerald-500/20",
  "from-rose-500/20 to-pink-500/10 border-rose-500/20",
  "from-cyan-500/20 to-teal-500/10 border-cyan-500/20",
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function HomePage() {
  const [categories, featuredProducts, newArrivals] = await Promise.all([
    getCategories(),
    getFeaturedProducts(),
    getNewArrivals(),
  ]);

  return (
    <>
      <WebsiteJsonLd />

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-hero-gradient">
        {/* Decorative rings */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div
            className="absolute -right-32 -top-32 w-[600px] h-[600px] rounded-full border border-brand-secondary/10"
            style={{ boxShadow: "0 0 120px rgba(30,144,255,0.07)" }}
          />
          <div
            className="absolute -right-20 -top-20 w-[400px] h-[400px] rounded-full border border-brand-primary/10"
            style={{ boxShadow: "0 0 80px rgba(245,166,35,0.05)" }}
          />
          <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-brand-border to-transparent" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">

            {/* Text */}
            <div>
              {/* Badge */}
              <div className="inline-flex items-center gap-2 bg-brand-primary/10 border border-brand-primary/20 rounded-full px-4 py-1.5 mb-6">
                <Zap className="h-3.5 w-3.5 text-brand-primary fill-brand-primary" />
                <span className="text-xs font-semibold text-brand-primary tracking-wide">
                  New Collection 2025
                </span>
              </div>

              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black leading-[0.95] tracking-tight">
                <span className="text-white">Style That</span>
                <br />
                <span className="bg-gradient-to-r from-brand-primary via-yellow-300 to-brand-primary bg-clip-text text-transparent">
                  Defines You
                </span>
              </h1>

              <p className="mt-5 text-brand-muted text-base sm:text-lg leading-relaxed max-w-lg">
                Discover premium fashion — from streetwear to everyday essentials.
                Quality crafted, priced for everyone.
              </p>

              {/* Stats */}
              <div className="flex items-center gap-6 mt-6">
                {[
                  { value: "1K+", label: "Products" },
                  { value: "50K+", label: "Customers" },
                  { value: "4.9", label: "Rating", icon: Star },
                ].map(({ value, label, icon: Icon }) => (
                  <div key={label}>
                    <div className="flex items-center gap-1">
                      {Icon && <Icon className="h-3.5 w-3.5 text-brand-primary fill-brand-primary" />}
                      <span className="text-white font-bold text-lg">{value}</span>
                    </div>
                    <p className="text-brand-muted text-xs mt-0.5">{label}</p>
                  </div>
                ))}
              </div>

              {/* CTAs */}
              <div className="flex flex-wrap gap-3 mt-8">
                <Link
                  href="/shop"
                  className="btn-primary flex items-center gap-2 rounded-xl px-6 py-3 text-sm"
                >
                  Shop Now
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/shop?is_featured=true"
                  className="btn-secondary flex items-center gap-2 rounded-xl px-6 py-3 text-sm"
                >
                  <TrendingUp className="h-4 w-4" />
                  Trending
                </Link>
              </div>
            </div>

            {/* Categories quick grid — right side on desktop */}
            {categories.length > 0 && (
              <div className="hidden lg:grid grid-cols-3 gap-3">
                {categories.slice(0, 6).map((cat, i) => (
                  <Link
                    key={cat.id}
                    href={`/categories/${cat.slug}`}
                    className={`group bg-gradient-to-br ${CAT_COLORS[i % CAT_COLORS.length]} border rounded-2xl p-4 flex flex-col gap-2 hover:scale-105 transition-transform duration-200`}
                  >
                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-lg">
                      {cat.name.charAt(0)}
                    </div>
                    <p className="text-sm font-semibold text-white truncate">{cat.name}</p>
                    <p className="text-[10px] text-brand-muted group-hover:text-brand-primary transition-colors">
                      Explore →
                    </p>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── Trust bar ────────────────────────────────────────────────────── */}
      <section className="border-y border-brand-border bg-brand-surface/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-brand-border">
            {TRUST_BADGES.map(({ icon: Icon, label, sub }) => (
              <div key={label} className="flex items-center gap-3 py-5 px-5">
                <div className="p-2.5 rounded-xl bg-brand-primary/10 text-brand-primary shrink-0">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold truncate">{label}</p>
                  <p className="text-xs text-brand-muted truncate">{sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Categories strip (mobile) ─────────────────────────────────────── */}
      {categories.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 lg:hidden">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold">Browse Categories</h2>
            <Link href="/shop" className="text-xs text-brand-primary hover:underline">
              All products →
            </Link>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map((cat, i) => (
              <Link
                key={cat.id}
                href={`/categories/${cat.slug}`}
                className={`flex-shrink-0 bg-gradient-to-br ${CAT_COLORS[i % CAT_COLORS.length]} border rounded-xl px-4 py-3 text-sm font-medium text-white hover:scale-105 transition-transform`}
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ── Featured Products ─────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="flex items-end justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Star className="h-4 w-4 text-brand-primary fill-brand-primary" />
              <span className="text-xs font-semibold text-brand-primary uppercase tracking-wider">
                Handpicked for you
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold">Featured Products</h2>
          </div>
          <Link
            href="/shop?is_featured=true"
            className="btn-secondary text-sm px-4 py-2 rounded-xl hidden sm:flex items-center gap-1"
          >
            View all <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        {featuredProducts.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {featuredProducts.map((p, i) => (
              <ProductCard key={p.id} product={p} priority={i < 4} />
            ))}
          </div>
        ) : (
          <ProductGridSkeleton count={4} />
        )}

        <div className="text-center mt-6 sm:hidden">
          <Link href="/shop?is_featured=true" className="btn-secondary text-sm px-5 py-2.5 rounded-xl">
            See all featured →
          </Link>
        </div>
      </section>

      {/* ── Promo Banner ─────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-14">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            {
              label: "New Season",
              title: "Men's Collection",
              desc: "Fresh styles just dropped",
              href: "/shop?category=mens",
              from: "from-indigo-900/60",
              to: "to-brand-dark",
              accent: "text-brand-secondary",
            },
            {
              label: "Up to 40% OFF",
              title: "Sale",
              desc: "Limited time deals on top picks",
              href: "/shop?on_sale=true",
              from: "from-amber-900/50",
              to: "to-brand-dark",
              accent: "text-brand-primary",
            },
          ].map(({ label, title, desc, href, from, to, accent }) => (
            <Link
              key={title}
              href={href}
              className={`group relative overflow-hidden rounded-2xl border border-brand-border bg-gradient-to-br ${from} ${to} h-44 flex items-center px-8 hover:border-white/10 transition-colors`}
            >
              <div className="relative z-10">
                <span className={`text-xs font-bold uppercase tracking-widest ${accent}`}>
                  {label}
                </span>
                <h3 className="text-3xl font-black text-white mt-1 group-hover:translate-x-1 transition-transform duration-200">
                  {title}
                </h3>
                <p className="text-sm text-brand-muted mt-1">{desc}</p>
              </div>
              <ArrowRight className="absolute right-6 top-1/2 -translate-y-1/2 h-6 w-6 text-white/20 group-hover:text-white/60 group-hover:translate-x-1 transition-all duration-200" />
              {/* Glow */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/[0.02] group-hover:to-white/[0.04] transition-colors" />
            </Link>
          ))}
        </div>
      </section>

      {/* ── New Arrivals ─────────────────────────────────────────────────── */}
      {newArrivals.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          <div className="flex items-end justify-between mb-8">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="h-4 w-4 text-brand-secondary" />
                <span className="text-xs font-semibold text-brand-secondary uppercase tracking-wider">
                  Just landed
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold">New Arrivals</h2>
            </div>
            <Link
              href="/shop?ordering=-created_at"
              className="btn-secondary text-sm px-4 py-2 rounded-xl hidden sm:flex items-center gap-1"
            >
              View all <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {newArrivals.map((p, i) => (
              <ProductCard key={p.id} product={p} priority={i < 2} />
            ))}
          </div>
        </section>
      )}
    </>
  );
}
