import Image from "next/image";
import Link from "next/link";
import {
  ChevronRight,
  Shield,
  Truck,
  RefreshCcw,
  Headphones,
  Star,
  TrendingUp,
  Flame,
} from "lucide-react";
import { productsApi, siteApi } from "@/lib/api";
import { ProductCard } from "@/components/products/ProductCard";
import { ProductGridSkeleton } from "@/components/ui/Skeleton";
import { WebsiteJsonLd } from "@/components/seo/JsonLd";
import type { Product, PaginatedResponse } from "@/types";

// ─── Server-side fetchers ─────────────────────────────────────────────────────

async function getSiteSettings() {
  try {
    const { data } = await siteApi.settings();
    return data as { hero_image_url: string | null; hero_image_alt: string };
  } catch {
    return { hero_image_url: null, hero_image_alt: "Featured collection" };
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

async function getViralProducts(): Promise<Product[]> {
  try {
    const { data } = await productsApi.viral();
    return data ?? [];
  } catch {
    return [];
  }
}

async function getNewArrivals(): Promise<Product[]> {
  try {
    const { data } = (await productsApi.list({ ordering: "-created_at" })) as {
      data: PaginatedResponse<Product>;
    };
    return (data.results ?? []).slice(0, 4);
  } catch {
    return [];
  }
}

// ─── Static data ──────────────────────────────────────────────────────────────

const TRUST_BADGES = [
  { icon: Shield,     label: "Secure Payment",  sub: "256-bit SSL" },
  { icon: Truck,      label: "Free Shipping",   sub: "Orders over $50" },
  { icon: RefreshCcw, label: "Easy Returns",    sub: "30-day policy" },
  { icon: Headphones, label: "24/7 Support",    sub: "Always here" },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function HomePage() {
  const [siteSettings, featuredProducts, viralProducts, newArrivals] = await Promise.all([
    getSiteSettings(),
    getFeaturedProducts(),
    getViralProducts(),
    getNewArrivals(),
  ]);

  const { hero_image_url, hero_image_alt } = siteSettings;

  return (
    <>
      <WebsiteJsonLd />

      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-brand-dark" style={{ minHeight: "72vh" }}>

        {/* Background — blue radial on right, gold hint bottom */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute right-0 top-0 h-full w-1/2"
            style={{ background: "radial-gradient(ellipse at 80% 40%, rgba(30,144,255,0.14) 0%, transparent 65%)" }} />
          <div className="absolute right-1/4 bottom-0 w-2/5 h-2/3"
            style={{ background: "radial-gradient(ellipse at center bottom, rgba(245,166,35,0.07) 0%, transparent 65%)" }} />
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-brand-border to-transparent" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-[1fr_auto] gap-0 items-center" style={{ minHeight: "72vh" }}>

            {/* ── Left: Text ──────────────────────────────────────── */}
            <div className="py-12 lg:py-16 pr-0 lg:pr-10">

              {/* Brand name */}
              <h1 className="text-6xl sm:text-7xl xl:text-8xl font-black leading-none tracking-tight mb-3">
                <span className="text-white">HEXA</span>
                <span className="text-brand-secondary">SHOP</span>
              </h1>

              {/* Subtitle */}
              <p className="text-xs sm:text-sm tracking-[0.45em] text-brand-muted font-semibold uppercase mb-5">
                Style That Defines You
              </p>

              {/* Description */}
              <p className="text-brand-muted leading-relaxed mb-8 max-w-md text-sm sm:text-base">
                Discover the latest trends in fashion.<br />
                Premium quality. Best prices.
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap gap-4 mb-8">
                <Link
                  href="/shop"
                  className="btn-primary px-8 py-3 rounded-lg text-sm font-bold uppercase tracking-wider"
                >
                  Shop Now
                </Link>
                <Link
                  href="/shop?is_featured=true"
                  className="btn-secondary px-8 py-3 rounded-lg text-sm font-bold uppercase tracking-wider"
                >
                  Explore Collection
                </Link>
              </div>

              {/* Slider dots */}
              <div className="flex items-center gap-2">
                <span className="w-6 h-1.5 rounded-full bg-brand-primary" />
                <span className="w-4 h-1.5 rounded-full bg-brand-border" />
                <span className="w-4 h-1.5 rounded-full bg-brand-border" />
              </div>
            </div>

            {/* ── Right: Hero image with hexagon border ────────────── */}
            <div
              className="hidden lg:flex items-center justify-center self-stretch"
              style={{ width: "480px", position: "relative" }}
            >
              {/* Blue radial glow behind image */}
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "radial-gradient(ellipse at center, rgba(30,144,255,0.22) 0%, rgba(30,144,255,0.08) 45%, transparent 70%)",
                }}
              />

              {/* Outer hexagon — gold dashed */}
              <svg
                className="absolute"
                style={{ top: "50%", left: "50%", transform: "translate(-50%,-50%)" }}
                width="440"
                height="500"
                viewBox="0 0 440 500"
                fill="none"
              >
                <polygon
                  points="220,14 428,127 428,373 220,486 12,373 12,127"
                  stroke="#F5A623"
                  strokeWidth="1.2"
                  strokeDasharray="10 6"
                  opacity="0.45"
                />
              </svg>

              {/* Inner hexagon — blue glowing */}
              <svg
                className="absolute"
                style={{ top: "50%", left: "50%", transform: "translate(-50%,-50%)", filter: "drop-shadow(0 0 10px rgba(30,144,255,0.7))" }}
                width="380"
                height="436"
                viewBox="0 0 380 436"
                fill="none"
              >
                <polygon
                  points="190,12 370,110 370,326 190,424 10,326 10,110"
                  fill="rgba(30,144,255,0.04)"
                  stroke="rgba(30,144,255,0.85)"
                  strokeWidth="1.8"
                />
              </svg>

              {/* Gold sparkle dots */}
              {[
                { top: "14%", right: "6%",  size: 8 },
                { top: "38%", right: "1%",  size: 5 },
                { bottom: "22%", right: "7%", size: 6 },
                { top: "10%",  left: "8%",  size: 4 },
                { bottom: "18%", left: "5%", size: 5 },
              ].map((s, i) => (
                <div
                  key={i}
                  className="absolute rounded-full bg-brand-primary"
                  style={{
                    ...s,
                    width: s.size,
                    height: s.size,
                    boxShadow: `0 0 ${s.size * 2}px ${s.size}px rgba(245,166,35,0.55)`,
                    animation: `pulse ${1.5 + i * 0.4}s ease-in-out infinite alternate`,
                  }}
                />
              ))}

              {/* Product image */}
              <div className="relative z-10 flex items-center justify-center w-full h-full">
                {hero_image_url ? (
                  <Image
                    src={hero_image_url}
                    alt={hero_image_alt || "Featured collection"}
                    width={360}
                    height={460}
                    className="object-contain"
                    style={{
                      filter:
                        "drop-shadow(0 0 35px rgba(30,144,255,0.35)) drop-shadow(0 20px 50px rgba(0,0,0,0.65))",
                      maxHeight: "68vh",
                    }}
                    priority
                  />
                ) : (
                  /* Placeholder when no hero image uploaded */
                  <div
                    className="flex flex-col items-center justify-center gap-4 text-center"
                    style={{ width: 300, height: 400 }}
                  >
                    {/* Hexagon placeholder */}
                    <svg width="80" height="90" viewBox="0 0 80 90" fill="none">
                      <polygon
                        points="40,2 78,22 78,68 40,88 2,68 2,22"
                        fill="none"
                        stroke="rgba(30,144,255,0.4)"
                        strokeWidth="2"
                      />
                      <text x="40" y="52" textAnchor="middle" fill="rgba(245,166,35,0.5)" fontSize="28" fontWeight="800">H</text>
                    </svg>
                    <p className="text-sm text-brand-muted font-medium">
                      Upload hero image<br />
                      <span className="text-indigo-400 text-xs">Admin → Hero Image</span>
                    </p>
                  </div>
                )}
              </div>

              {/* Scroll indicator — absolute inside hero */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 hidden lg:flex flex-col items-center gap-1.5 pointer-events-none opacity-60">
                <span className="text-[9px] uppercase tracking-[0.22em] text-brand-muted font-semibold">Scroll</span>
                <div style={{ animation: "bounce 1.6s ease-in-out infinite" }}>
                  <svg width="16" height="20" viewBox="0 0 16 20" fill="none">
                    <path d="M8 0 L8 13 M3 8 L8 13 L13 8" stroke="#F5A623" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M3 14 L8 19 L13 14" stroke="#F5A623" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" opacity="0.35"/>
                  </svg>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── Trust bar ────────────────────────────────────────────────── */}
      <section className="border-y border-brand-border bg-brand-surface/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-brand-border">
            {TRUST_BADGES.map(({ icon: Icon, label, sub }) => (
              <div key={label} className="flex items-center gap-3 py-4 px-5">
                <div className="p-2 rounded-xl bg-brand-primary/10 text-brand-primary shrink-0">
                  <Icon className="h-4 w-4" />
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

      {/* ── Featured Products ─────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl sm:text-2xl font-bold uppercase tracking-wider">
            Featured Products
          </h2>
          <Link
            href="/shop?is_featured=true"
            className="btn-secondary text-xs px-4 py-2 rounded-lg flex items-center gap-1 uppercase tracking-wide font-bold"
          >
            View All <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {featuredProducts.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {featuredProducts.slice(0, 4).map((p, i) => (
              <ProductCard key={p.id} product={p} priority={i < 4} />
            ))}
          </div>
        ) : (
          <ProductGridSkeleton count={4} />
        )}
      </section>

      {/* ── 🔥 Most Viral Products ────────────────────────────────────── */}
      {viralProducts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-orange-500" />
              </span>
              <Flame className="h-4 w-4 text-orange-500 fill-orange-500" />
              <h2 className="text-xl sm:text-2xl font-bold uppercase tracking-wider">
                Most Viral
              </h2>
            </div>
            <Link
              href="/shop?ordering=-sold_count"
              className="btn-secondary text-xs px-4 py-2 rounded-lg flex items-center gap-1 uppercase tracking-wide font-bold"
            >
              View All <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {viralProducts.slice(0, 4).map((p, i) => (
              <ProductCard key={p.id} product={p} priority={i < 2} />
            ))}
          </div>
        </section>
      )}

      {/* ── Promo Banners ─────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { label: "New Season", title: "Men's Collection", desc: "Fresh styles just dropped", href: "/shop?category=mens", accent: "text-brand-secondary", gradient: "from-indigo-900/60 to-brand-dark" },
            { label: "Up to 40% OFF", title: "Sale", desc: "Limited time deals", href: "/shop?on_sale=true", accent: "text-brand-primary", gradient: "from-amber-900/50 to-brand-dark" },
          ].map(({ label, title, desc, href, accent, gradient }) => (
            <Link
              key={title}
              href={href}
              className={`group relative overflow-hidden rounded-2xl border border-brand-border bg-gradient-to-br ${gradient} h-36 flex items-center px-8 hover:border-white/10 transition-colors`}
            >
              <div>
                <span className={`text-xs font-bold uppercase tracking-widest ${accent}`}>{label}</span>
                <h3 className="text-2xl font-black text-white mt-1 group-hover:translate-x-1 transition-transform duration-200">{title}</h3>
                <p className="text-xs text-brand-muted mt-1">{desc}</p>
              </div>
              <ChevronRight className="absolute right-6 top-1/2 -translate-y-1/2 h-5 w-5 text-white/20 group-hover:text-white/60 group-hover:translate-x-1 transition-all duration-200" />
            </Link>
          ))}
        </div>
      </section>

      {/* ── New Arrivals ──────────────────────────────────────────────── */}
      {newArrivals.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-14">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-brand-secondary" />
              <h2 className="text-xl sm:text-2xl font-bold uppercase tracking-wider">New Arrivals</h2>
            </div>
            <Link
              href="/shop?ordering=-created_at"
              className="btn-secondary text-xs px-4 py-2 rounded-lg flex items-center gap-1 uppercase tracking-wide font-bold"
            >
              View All <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {newArrivals.map((p, i) => (
              <ProductCard key={p.id} product={p} priority={i < 2} />
            ))}
          </div>
        </section>
      )}
    </>
  );
}
