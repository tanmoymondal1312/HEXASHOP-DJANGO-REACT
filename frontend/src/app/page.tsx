import { Suspense } from "react";
import Image from "next/image";
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
  Flame,
  ArrowRight,
} from "lucide-react";
import { productsApi, siteApi } from "@/lib/api";
import { ProductCard } from "@/components/products/ProductCard";
import { ProductGridSkeleton } from "@/components/ui/Skeleton";
import { WebsiteJsonLd } from "@/components/seo/JsonLd";
import type { Category, Product, PaginatedResponse } from "@/types";

// ─── Server-side fetchers ─────────────────────────────────────────────────────

async function getSiteSettings() {
  try {
    const { data } = await siteApi.settings();
    return data as {
      hero_image_url: string | null;
      hero_image_alt: string;
      free_shipping_threshold: string;
    };
  } catch {
    return { hero_image_url: null, hero_image_alt: "Featured collection", free_shipping_threshold: "50.00" };
  }
}

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
    return (data.results ?? []).slice(0, 8);
  } catch {
    return [];
  }
}

// ─── Static data ──────────────────────────────────────────────────────────────

const TRUST_BADGES = [
  { icon: Shield, label: "Secure Payment",  sub: "256-bit SSL encryption" },
  { icon: Truck,  label: "Free Shipping",   sub: "On orders over $50" },
  { icon: RefreshCcw, label: "Easy Returns", sub: "30-day return policy" },
  { icon: Headphones, label: "24/7 Support", sub: "Always here for you" },
];

const CAT_COLORS = [
  "from-violet-500/20 to-indigo-500/10 border-violet-500/20",
  "from-amber-500/20  to-orange-500/10 border-amber-500/20",
  "from-sky-500/20    to-blue-500/10   border-sky-500/20",
  "from-emerald-500/20 to-green-500/10 border-emerald-500/20",
  "from-rose-500/20   to-pink-500/10   border-rose-500/20",
  "from-cyan-500/20   to-teal-500/10   border-cyan-500/20",
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function HomePage() {
  const [siteSettings, categories, featuredProducts, viralProducts, newArrivals] =
    await Promise.all([
      getSiteSettings(),
      getCategories(),
      getFeaturedProducts(),
      getViralProducts(),
      getNewArrivals(),
    ]);

  const { hero_image_url, hero_image_alt } = siteSettings;

  return (
    <>
      <WebsiteJsonLd />

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative bg-hero-gradient overflow-hidden">
        {/* bg rings */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -right-40 -top-40 w-[700px] h-[700px] rounded-full border border-brand-secondary/8" />
          <div className="absolute -right-24 -top-24 w-[480px] h-[480px] rounded-full border border-brand-primary/6" />
          <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-brand-border to-transparent" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
          <div className="grid lg:grid-cols-2 gap-10 items-center">

            {/* ── Left: text ──────────────────────────────────────────── */}
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
              <div className="flex items-center gap-7 mt-6">
                {[
                  { value: "1K+",  label: "Products" },
                  { value: "50K+", label: "Customers" },
                  { value: "4.9",  label: "Rating", icon: Star },
                ].map(({ value, label, icon: Icon }) => (
                  <div key={label}>
                    <div className="flex items-center gap-1">
                      {Icon && <Icon className="h-3.5 w-3.5 text-brand-primary fill-brand-primary" />}
                      <span className="text-white font-bold text-xl">{value}</span>
                    </div>
                    <p className="text-brand-muted text-xs mt-0.5">{label}</p>
                  </div>
                ))}
              </div>

              {/* CTAs */}
              <div className="flex flex-wrap gap-3 mt-8">
                <Link href="/shop" className="btn-primary flex items-center gap-2 rounded-xl px-6 py-3 text-sm">
                  Shop Now <ArrowRight className="h-4 w-4" />
                </Link>
                <Link href="/shop?is_featured=true" className="btn-secondary flex items-center gap-2 rounded-xl px-6 py-3 text-sm">
                  <TrendingUp className="h-4 w-4" /> Trending
                </Link>
              </div>
            </div>

            {/* ── Right: Dr Strange magic portal ──────────────────── */}
            <div className="hidden lg:flex items-center justify-center py-6">
              <style>{`
                @keyframes hx-cw   { to { transform: rotate(360deg);  } }
                @keyframes hx-ccw  { to { transform: rotate(-360deg); } }
                @keyframes hx-glow {
                  0%,100% { opacity:.55; filter:blur(18px); }
                  50%     { opacity:1;   filter:blur(24px); }
                }
                @keyframes hx-float {
                  0%,100% { transform:translateY(0);    }
                  50%     { transform:translateY(-10px); }
                }
                @keyframes hx-spark {
                  0%,100% { opacity:1; transform:scale(1);   box-shadow:0 0 8px currentColor,0 0 16px currentColor; }
                  50%     { opacity:.6; transform:scale(0.7); box-shadow:0 0 4px currentColor; }
                }
              `}</style>

              <div style={{ position:"relative", width:"420px", height:"420px" }}>

                {/* ── Background radial glow ── */}
                <div style={{
                  position:"absolute", inset:"-70px", borderRadius:"50%",
                  background:"radial-gradient(circle at 45% 50%, rgba(99,102,241,0.22) 0%, rgba(245,166,35,0.1) 45%, transparent 70%)",
                  animation:"hx-glow 4s ease-in-out infinite",
                }} />

                {/* ── Ring 0: outermost dashed amber ── */}
                <div style={{
                  position:"absolute", inset:"-14px", borderRadius:"50%",
                  border:"2px dashed rgba(245,166,35,0.45)",
                  boxShadow:"0 0 28px rgba(245,166,35,0.15)",
                  animation:"hx-cw 18s linear infinite",
                }} />

                {/* ── Ring 1: solid amber ── */}
                <div style={{
                  position:"absolute", inset:"0", borderRadius:"50%",
                  border:"3px solid rgba(245,166,35,0.75)",
                  boxShadow:"0 0 22px rgba(245,166,35,0.35), inset 0 0 22px rgba(245,166,35,0.08)",
                  animation:"hx-ccw 11s linear infinite",
                }} />

                {/* ── Ring 2: indigo fast ── */}
                <div style={{
                  position:"absolute", inset:"20px", borderRadius:"50%",
                  border:"2.5px solid rgba(99,102,241,0.85)",
                  boxShadow:"0 0 18px rgba(99,102,241,0.5)",
                  animation:"hx-cw 7s linear infinite",
                }} />

                {/* ── Ring 3: small dashed amber ── */}
                <div style={{
                  position:"absolute", inset:"34px", borderRadius:"50%",
                  border:"1.5px dashed rgba(245,166,35,0.35)",
                  animation:"hx-ccw 5s linear infinite",
                }} />

                {/* ── Ring 4: inner indigo ── */}
                <div style={{
                  position:"absolute", inset:"46px", borderRadius:"50%",
                  border:"2px solid rgba(99,102,241,0.55)",
                  boxShadow:"0 0 12px rgba(99,102,241,0.35)",
                  animation:"hx-cw 3.5s linear infinite",
                }} />

                {/* ── Orbiting spark — amber (outer ring) ── */}
                <div style={{ position:"absolute", inset:0, animation:"hx-cw 4s linear infinite" }}>
                  <div style={{
                    position:"absolute", top:"50%", left:"-5px",
                    width:"10px", height:"10px", marginTop:"-5px",
                    borderRadius:"50%", background:"#f59e0b", color:"#f59e0b",
                    boxShadow:"0 0 8px #f59e0b, 0 0 20px rgba(245,158,11,0.7)",
                    animation:"hx-spark 1.5s ease-in-out infinite",
                  }} />
                </div>

                {/* ── Orbiting spark — indigo (outer ring opposite) ── */}
                <div style={{ position:"absolute", inset:0, animation:"hx-ccw 6s linear infinite" }}>
                  <div style={{
                    position:"absolute", top:"-5px", left:"50%",
                    width:"9px", height:"9px", marginLeft:"-4px",
                    borderRadius:"50%", background:"#818cf8", color:"#818cf8",
                    boxShadow:"0 0 8px #818cf8, 0 0 18px rgba(129,140,248,0.6)",
                    animation:"hx-spark 2s ease-in-out infinite .5s",
                  }} />
                </div>

                {/* ── Orbiting spark — amber (inner ring) ── */}
                <div style={{ position:"absolute", inset:"20px", animation:"hx-cw 9s linear infinite" }}>
                  <div style={{
                    position:"absolute", bottom:"-4px", right:"10%",
                    width:"7px", height:"7px",
                    borderRadius:"50%", background:"#fbbf24",
                    boxShadow:"0 0 6px #fbbf24, 0 0 12px rgba(251,191,36,0.5)",
                  }} />
                </div>

                {/* ── Orbiting spark — indigo (inner ring) ── */}
                <div style={{ position:"absolute", inset:"46px", animation:"hx-ccw 4s linear infinite" }}>
                  <div style={{
                    position:"absolute", top:"10%", right:"-4px",
                    width:"6px", height:"6px",
                    borderRadius:"50%", background:"#6366f1",
                    boxShadow:"0 0 6px #6366f1",
                  }} />
                </div>

                {/* ── Center image (floating) ── */}
                <div style={{
                  position:"absolute", inset:"60px", borderRadius:"50%",
                  overflow:"hidden",
                  background:"linear-gradient(135deg,#1a1d27 0%,#0f1117 100%)",
                  border:"2px solid rgba(99,102,241,0.45)",
                  boxShadow:"inset 0 0 40px rgba(0,0,0,0.6), 0 0 30px rgba(99,102,241,0.2)",
                  animation:"hx-float 5s ease-in-out infinite",
                }}>
                  {hero_image_url ? (
                    <Image
                      src={hero_image_url}
                      alt={hero_image_alt || "Featured collection"}
                      fill className="object-cover object-center"
                      priority sizes="300px"
                    />
                  ) : (
                    <div style={{
                      width:"100%", height:"100%",
                      display:"grid", gridTemplateColumns:"1fr 1fr", gap:0,
                    }}>
                      {categories.slice(0,4).map((cat, i) => (
                        <div key={cat.id} className={`flex flex-col items-center justify-center gap-1 bg-gradient-to-br ${CAT_COLORS[i%CAT_COLORS.length]}`}>
                          <span className="text-xl font-black text-white/50">{cat.name.charAt(0)}</span>
                          <span className="text-[9px] text-white/30">{cat.name}</span>
                        </div>
                      ))}
                      {categories.length === 0 && (
                        <div style={{gridColumn:"1/-1",display:"flex",alignItems:"center",justifyContent:"center"}}>
                          <p className="text-[10px] text-brand-muted text-center px-6">
                            Upload a hero image<br/>from Admin → Hero Image
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* ── Floating badge top-right ── */}
                <div style={{
                  position:"absolute", top:"8px", right:"-8px",
                  display:"flex", alignItems:"center", gap:"0.375rem",
                  padding:"0.375rem 0.75rem", borderRadius:"0.75rem",
                  background:"#6366f1", color:"#fff",
                  fontSize:"0.7rem", fontWeight:700,
                  boxShadow:"0 4px 20px rgba(99,102,241,0.5)",
                }}>
                  <Flame className="h-3 w-3 fill-white" /> New Drop
                </div>

                {/* ── Floating badge bottom-left ── */}
                <div style={{
                  position:"absolute", bottom:"12px", left:"-12px",
                  display:"flex", alignItems:"center", gap:"0.375rem",
                  padding:"0.375rem 0.75rem", borderRadius:"0.75rem",
                  background:"#1a1d27", color:"#f5a623",
                  fontSize:"0.7rem", fontWeight:700,
                  border:"1px solid rgba(245,166,35,0.35)",
                  boxShadow:"0 4px 20px rgba(0,0,0,0.5)",
                }}>
                  <Star className="h-3 w-3 fill-brand-primary" /> 4.9 Rating
                </div>

              </div>
            </div>

          </div>
        </div>

        {/* ── Animated scroll indicator ─────────────────────────────────── */}
        <div className="flex flex-col items-center gap-1 pb-6 pt-2">
          <span className="text-[10px] uppercase tracking-[0.2em] text-brand-muted font-medium">
            Scroll to explore
          </span>
          <div className="flex flex-col items-center" style={{ animation: "bounce 1.6s ease-in-out infinite" }}>
            <svg width="20" height="24" viewBox="0 0 20 24" fill="none">
              <path d="M10 0 L10 16 M4 10 L10 16 L16 10" stroke="#F5A623" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M4 17 L10 23 L16 17" stroke="#F5A623" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.4"/>
            </svg>
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

      {/* ── 🔥 Most Viral Products ────────────────────────────────────────── */}
      {viralProducts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <div className="flex items-end justify-between mb-8">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-orange-500" />
                </span>
                <Flame className="h-4 w-4 text-orange-500 fill-orange-500" />
                <span className="text-xs font-bold text-orange-500 uppercase tracking-wider">
                  Trending Now
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold">Most Viral Products</h2>
              <p className="text-sm text-brand-muted mt-1">
                Top sold · most reviewed · highest views
              </p>
            </div>
            <Link
              href="/shop?ordering=-sold_count"
              className="btn-secondary text-sm px-4 py-2 rounded-xl hidden sm:flex items-center gap-1"
            >
              View all <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {viralProducts.map((p, i) => (
              <ProductCard key={p.id} product={p} priority={i < 4} />
            ))}
          </div>
        </section>
      )}

      {/* ── Categories strip (mobile) ─────────────────────────────────────── */}
      {categories.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-2 lg:hidden">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map((cat, i) => (
              <Link
                key={cat.id}
                href={`/categories/${cat.slug}`}
                className={`flex-shrink-0 bg-gradient-to-br ${CAT_COLORS[i % CAT_COLORS.length]} border rounded-xl px-4 py-2.5 text-sm font-medium text-white hover:scale-105 transition-transform`}
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
      </section>

      {/* ── Promo Banners ─────────────────────────────────────────────────── */}
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
            </Link>
          ))}
        </div>
      </section>

      {/* ── New Arrivals ──────────────────────────────────────────────────── */}
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
