import Image from "next/image";
import Link from "next/link";
import { ChevronRight, Flame, Heart, Star } from "lucide-react";
import { WebsiteJsonLd } from "@/components/seo/JsonLd";
import { resolveImageUrl } from "@/lib/utils";
import type { Product } from "@/types";

// ─── #7 ISR: revalidate the page every 60 s ───────────────────────────────────
export const revalidate = 60;

// ─── #2 Native fetch replaces axios — Next.js can now cache these responses ───
const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";

async function getSiteSettings() {
  try {
    const res = await fetch(`${API_BASE}/settings/`, {
      next: { revalidate: 300 },          // cache site settings 5 min
    });
    if (!res.ok) throw new Error("settings");
    return await res.json() as { hero_image_url: string | null; hero_image_alt: string };
  } catch {
    return { hero_image_url: null, hero_image_alt: "HEXASHOP" };
  }
}

async function getViral(): Promise<Product[]> {
  try {
    const res = await fetch(`${API_BASE}/products/viral/`, {
      next: { revalidate: 60 },           // cache viral list 1 min
    });
    if (!res.ok) return [];
    const data = await res.json();
    return (Array.isArray(data) ? data : data?.results ?? []).slice(0, 5);
  } catch {
    return [];
  }
}

async function getFeatured(): Promise<Product[]> {
  try {
    const res = await fetch(`${API_BASE}/products/featured/`, {
      next: { revalidate: 60 },           // cache featured list 1 min
    });
    if (!res.ok) return [];
    const data = await res.json();
    return (Array.isArray(data) ? data : data?.results ?? []).slice(0, 10);
  } catch {
    return [];
  }
}

// ─── #3 Viral card — next/image fill + #6 prefetch={false} ───────────────────

function ViralCard({ product, priority, delay }: { product: Product; priority?: boolean; delay: number }) {
  const src    = resolveImageUrl(product.primary_image ?? null);
  const price  = parseFloat(product.base_price).toFixed(2);
  const rating = Math.min(5, Math.round(parseFloat(product.avg_rating)));

  return (
    <Link
      href={`/products/${product.slug}`}
      prefetch={false}
      className="hx-viral-card"
      style={{ display: "block", textDecoration: "none", animationDelay: `${delay}ms` }}
    >
      <div className="hx-viral-img">
        {src ? (
          <Image
            src={src}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 33vw, (max-width: 1024px) 25vw, 20vw"
            style={{ objectFit: "cover" }}
            priority={priority}
            unoptimized={src.includes("localhost")}
          />
        ) : (
          <div className="hx-img-ph" />
        )}

        <div className="hx-viral-overlay">
          <p className="hx-viral-name">{product.name}</p>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span className="hx-viral-price">${price}</span>
            <div style={{ display: "flex", gap: 2 }}>
              {[1,2,3,4,5].map((s) => (
                <Star key={s} style={{ width: 9, height: 9, color: s <= rating ? "#facc15" : "rgba(255,255,255,0.2)", fill: s <= rating ? "#facc15" : "none" }} />
              ))}
            </div>
          </div>
        </div>

        <span className="hx-wish-btn">
          <Heart style={{ width: 10, height: 10, color: "#fff" }} />
        </span>
      </div>
    </Link>
  );
}

// ─── #3 Featured card — next/image fill + #6 prefetch={false} ────────────────

function FeaturedCard({ product, priority, delay }: { product: Product; priority?: boolean; delay: number }) {
  const src     = resolveImageUrl(product.primary_image ?? null);
  const price   = parseFloat(product.base_price).toFixed(2);
  const cmpRaw  = product.compare_at_price;
  const cmp     = cmpRaw ? parseFloat(cmpRaw) : null;
  const rating  = Math.min(5, Math.round(parseFloat(product.avg_rating)));
  const discount = cmp && cmp > parseFloat(product.base_price)
    ? Math.round((cmp - parseFloat(product.base_price)) / cmp * 100)
    : null;

  return (
    <Link
      href={`/products/${product.slug}`}
      prefetch={false}
      className="hx-feat-card"
      style={{ display: "block", textDecoration: "none", animationDelay: `${delay}ms` }}
    >
      <div className="hx-feat-img">
        {src ? (
          <Image
            src={src}
            alt={product.name}
            fill
            sizes="(max-width: 500px) 50vw, (max-width: 1024px) 33vw, 20vw"
            style={{ objectFit: "cover" }}
            priority={priority}
            unoptimized={src.includes("localhost")}
          />
        ) : (
          <div className="hx-img-ph" />
        )}

        {discount && (
          <span className="hx-discount-badge">-{discount}%</span>
        )}

        <span className="hx-wish-btn">
          <Heart style={{ width: 11, height: 11, color: "#fff" }} />
        </span>
      </div>

      <div className="hx-feat-info">
        <p className="hx-feat-name">{product.name}</p>
        <div className="hx-feat-bottom">
          <span className="hx-feat-price">${price}</span>
          {cmp && cmp > parseFloat(product.base_price) && (
            <span className="hx-feat-cmp">${cmp.toFixed(2)}</span>
          )}
          <div style={{ display: "flex", gap: 2, marginLeft: "auto" }}>
            {[1,2,3,4,5].map((s) => (
              <Star key={s} style={{ width: 9, height: 9, color: s <= rating ? "#facc15" : "#1e2535", fill: s <= rating ? "#facc15" : "none" }} />
            ))}
          </div>
        </div>
      </div>
    </Link>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function HomePage() {
  const [settings, viral, featured] = await Promise.all([
    getSiteSettings(), getViral(), getFeatured(),
  ]);
  const { hero_image_url, hero_image_alt } = settings;

  const sparkles: Array<{ top: string; s: number; d: number; right?: string; left?: string }> = [
    { top: "14%", right: "6%",  s: 7, d: 0    },
    { top: "34%", right: "1%",  s: 4, d: 400  },
    { top: "62%", right: "5%",  s: 5, d: 800  },
    { top: "18%", left:  "12%", s: 3, d: 1200 },
    { top: "70%", left:  "9%",  s: 4, d: 1600 },
  ];

  return (
    <>
      <WebsiteJsonLd />

      {/* #1 — no more <style dangerouslySetInnerHTML>; CSS lives in globals.css */}

      <div className="hx-wrap">

        {/* ═══ HERO ═══════════════════════════════════════════════════════════ */}
        <section className="hx-hero">

          <div style={{ position:"absolute", inset:0, background:"radial-gradient(ellipse at 76% 44%, rgba(30,144,255,0.18) 0%, transparent 58%)", pointerEvents:"none" }} />
          <div style={{ position:"absolute", bottom:0, right:"20%", width:"28%", height:"50%", background:"radial-gradient(ellipse at center bottom, rgba(245,166,35,0.08) 0%, transparent 65%)", pointerEvents:"none" }} />
          <div style={{ position:"absolute", bottom:0, left:0, right:0, height:140, background:"linear-gradient(to bottom,transparent 0%,rgba(9,13,18,0.7) 50%,#090d12 100%)", zIndex:10, pointerEvents:"none" }} />

          <div className="hx-hero-inner">

            <div>
              <h1 className="hx-h1 hx-anim-1">
                <span style={{ color:"#fff" }}>HEXA</span>
                <span style={{ color:"#1e90ff" }}>SHOP</span>
              </h1>

              <p className="hx-sub hx-anim-2">Style That Defines You</p>

              <p className="hx-desc hx-anim-3">
                Discover the latest trends in fashion.<br />
                Premium quality. Best prices.
              </p>

              <div className="hx-btns hx-anim-4">
                <Link href="/shop" className="hx-btn-gold">SHOP NOW</Link>
                <Link href="/shop?is_featured=true" className="hx-btn-outline">EXPLORE COLLECTION</Link>
              </div>

              <form action="/shop" method="get" className="md:hidden hx-search-wrap hx-anim-4" role="search">
                <div className="hx-search-inner">
                  <svg className="hx-search-icon" width="15" height="15" viewBox="0 0 24 24"
                    fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <circle cx="11" cy="11" r="8"/>
                    <path d="m21 21-4.35-4.35"/>
                  </svg>
                  <input type="text" name="q" placeholder="Search products, categories…"
                    autoComplete="off" aria-label="Search HEXASHOP" className="hx-search-input" />
                  <button type="submit" aria-label="Search" className="hx-search-btn">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" strokeWidth="2.8" strokeLinecap="round">
                      <circle cx="11" cy="11" r="8"/>
                      <path d="m21 21-4.35-4.35"/>
                    </svg>
                    <span className="hx-search-btn-label">Search</span>
                  </button>
                </div>
              </form>

              <div className="hx-dots hx-anim-5">
                <div className="hx-dot-active" style={{ height: 5, borderRadius: 3, background: "#f5a623" }} />
                <div style={{ width: 12, height: 5, borderRadius: 3, background: "#2a2f3e" }} />
                <div style={{ width: 12, height: 5, borderRadius: 3, background: "#2a2f3e" }} />
              </div>
            </div>

            <div className="hx-hero-img-col hx-anim-img hidden md:flex items-center justify-center relative" style={{ overflow:"hidden" }}>
              <svg style={{ position:"absolute", zIndex:1 }} width="340" height="392" viewBox="0 0 340 392" fill="none">
                <defs>
                  <filter id="hg">
                    <feGaussianBlur stdDeviation="3" result="b" />
                    <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
                  </filter>
                </defs>
                <polygon points="170,12 330,104 330,288 170,380 10,288 10,104"
                  fill="none" stroke="#f5a623" strokeWidth="1.2" strokeDasharray="10 6" strokeOpacity="0.5" />
                <polygon points="170,32 312,116 312,276 170,360 28,276 28,116"
                  fill="rgba(30,144,255,0.04)" stroke="#1e90ff" strokeWidth="2" strokeOpacity="0.9" filter="url(#hg)" />
              </svg>

              {sparkles.map((dot, i) => (
                <div key={i} className="hx-sparkle" style={{
                  position: "absolute", zIndex: 3,
                  top: dot.top, right: dot.right, left: dot.left,
                  width: dot.s, height: dot.s, borderRadius: "50%",
                  background: "#f5a623",
                  boxShadow: `0 0 ${dot.s * 3}px ${dot.s}px rgba(245,166,35,0.65)`,
                  animationDelay: `${dot.d}ms`,
                }} />
              ))}

              <div className="hx-float" style={{ position:"relative", zIndex:2, width:"100%", height:"100%", display:"flex", alignItems:"center", justifyContent:"center" }}>
                {hero_image_url ? (
                  <Image
                    src={hero_image_url}
                    alt={hero_image_alt || "HEXASHOP"}
                    width={300} height={360}
                    style={{ objectFit:"contain", maxHeight:"88%", filter:"drop-shadow(0 0 28px rgba(30,144,255,0.38)) drop-shadow(0 18px 40px rgba(0,0,0,0.7))" }}
                    priority
                    unoptimized={hero_image_url.includes("localhost")}
                  />
                ) : (
                  <div style={{ textAlign:"center" }}>
                    <svg width="80" height="92" viewBox="0 0 80 92" fill="none">
                      <polygon points="40,3 77,23 77,69 40,89 3,69 3,23" fill="rgba(30,144,255,0.06)" stroke="rgba(30,144,255,0.3)" strokeWidth="1.5" />
                      <text x="40" y="56" textAnchor="middle" fill="rgba(245,166,35,0.4)" fontSize="30" fontWeight="900" fontFamily="Inter,sans-serif">H</text>
                    </svg>
                    <p style={{ color:"rgba(99,102,241,0.7)", fontSize:"0.72rem", marginTop:"0.5rem" }}>
                      Upload hero image<br /><span style={{ color:"#6b7280", fontSize:"0.65rem" }}>Admin → Hero Image</span>
                    </p>
                  </div>
                )}
              </div>
              <div style={{ position:"absolute", bottom:0, left:0, right:0, height:"50%", background:"linear-gradient(to bottom, transparent 0%, rgba(9,13,18,0.55) 55%, #090d12 100%)", zIndex:6, pointerEvents:"none" }} />
            </div>
          </div>
        </section>

        {/* ═══ MOST VIRAL ════════════════════════════════════════════════════ */}
        <section className="hx-viral">
          <div style={{ maxWidth: 1280, margin: "0 auto" }}>
            <div className="hx-section-head">
              <div style={{ display:"flex", alignItems:"center", gap:"0.45rem" }}>
                <Flame style={{ width:15, height:15, color:"#f97316", fill:"#f97316" }} />
                <h2 className="hx-section-title">Most Viral</h2>
              </div>
              <Link href="/shop?ordering=-sold_count" className="hx-view-all">VIEW ALL</Link>
            </div>
            <div className="hx-viral-grid">
              {viral.length > 0
                ? viral.map((p, i) => <ViralCard key={p.id} product={p} priority={i < 3} delay={i * 80} />)
                : [1,2,3,4,5].map(i => (
                    <div key={i} className="hx-viral-img" style={{ opacity: 0.3 }}>
                      <div className="hx-img-ph" />
                    </div>
                  ))
              }
            </div>
          </div>
        </section>

        {/* ═══ FEATURED PRODUCTS ═════════════════════════════════════════════ */}
        <section className="hx-featured">
          <div style={{ maxWidth: 1280, margin: "0 auto", position: "relative" }}>
            <div className="hx-featured-head">
              <div>
                <p className="hx-featured-label">
                  <Star style={{ width: 11, height: 11, fill: "#f5a623", color: "#f5a623" }} />
                  Handpicked for you
                </p>
                <h2 className="hx-featured-title">Featured Products</h2>
              </div>
              <Link href="/shop?is_featured=true" className="hx-view-all" style={{ marginTop: 4 }}>
                View All <ChevronRight style={{ width: 10, height: 10, display: "inline" }} />
              </Link>
            </div>
            <div className="hx-featured-grid">
              {featured.length > 0
                ? featured.map((p, i) => <FeaturedCard key={p.id} product={p} priority={i < 4} delay={i * 55} />)
                : [1,2,3,4,5,6,7,8,9,10].map(i => (
                    <div key={i} className="hx-feat-card">
                      <div className="hx-feat-img" style={{ opacity: 0.3 }}>
                        <div className="hx-img-ph" />
                      </div>
                    </div>
                  ))
              }
            </div>
            <div style={{ textAlign: "center" }}>
              <Link href="/shop" className="hx-see-more">
                See more products <ChevronRight style={{ width: 15, height: 15 }} />
              </Link>
            </div>
          </div>
        </section>

      </div>
    </>
  );
}
