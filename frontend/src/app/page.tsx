import Image from "next/image";
import Link from "next/link";
import { ChevronRight, Flame, Heart, Star } from "lucide-react";
import { productsApi, siteApi } from "@/lib/api";
import { WebsiteJsonLd } from "@/components/seo/JsonLd";
import { resolveImageUrl } from "@/lib/utils";
import type { Product } from "@/types";

// ─── Data fetchers ────────────────────────────────────────────────────────────

async function getSiteSettings() {
  try {
    const { data } = await siteApi.settings();
    return data as { hero_image_url: string | null; hero_image_alt: string };
  } catch {
    return { hero_image_url: null, hero_image_alt: "HEXASHOP" };
  }
}

async function getViral(): Promise<Product[]> {
  try {
    const { data } = await productsApi.viral();
    return (data ?? []).slice(0, 5);
  } catch {
    return [];
  }
}

async function getFeatured(): Promise<Product[]> {
  try {
    const { data } = await productsApi.featured();
    return (data ?? []).slice(0, 10);
  } catch {
    return [];
  }
}

// ─── Viral card: image-dominant portrait with overlay ────────────────────────

function ViralCard({ product, priority, delay }: { product: Product; priority?: boolean; delay: number }) {
  const src    = resolveImageUrl(product.primary_image ?? null);
  const price  = parseFloat(product.base_price).toFixed(2);
  const rating = Math.min(5, Math.round(parseFloat(product.avg_rating)));

  return (
    <Link
      href={`/products/${product.slug}`}
      className="hx-viral-card"
      style={{ display: "block", textDecoration: "none", animationDelay: `${delay}ms` }}
    >
      <div className="hx-viral-img">
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={src}
            alt={product.name}
            loading={priority ? "eager" : "lazy"}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <div className="hx-img-ph" />
        )}

        {/* Bottom overlay */}
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

// ─── Featured card: glass card with info below ────────────────────────────────

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
      className="hx-feat-card"
      style={{ display: "block", textDecoration: "none", animationDelay: `${delay}ms` }}
    >
      <div className="hx-feat-img">
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={src}
            alt={product.name}
            loading={priority ? "eager" : "lazy"}
            style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.45s ease" }}
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

      <style dangerouslySetInnerHTML={{ __html: `

        /* ═══════════════ KEYFRAMES ═══════════════ */
        @keyframes hxFadeUp {
          from { opacity: 0; transform: translateY(22px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes hxFadeLeft {
          from { opacity: 0; transform: translateX(-28px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes hxFadeRight {
          from { opacity: 0; transform: translateX(28px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes hxFloat {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-11px); }
        }
        @keyframes hxSparkle {
          0%, 100% { opacity: 0.4; transform: scale(0.85); }
          50%       { opacity: 1;   transform: scale(1.5);  }
        }
        @keyframes hxDotPulse {
          0%, 100% { width: 20px; }
          50%       { width: 28px; }
        }
        @keyframes hxShimmer {
          0%   { background-position: -200% 0; }
          100% { background-position:  200% 0; }
        }
        @media (prefers-reduced-motion: reduce) {
          .hx-anim-1, .hx-anim-2, .hx-anim-3, .hx-anim-4, .hx-anim-5,
          .hx-anim-img, .hx-float, .hx-sparkle, .hx-dot-active,
          .hx-viral-card, .hx-feat-card { animation: none !important; }
        }

        /* ─ Animation helpers ─ */
        .hx-anim-1 { animation: hxFadeUp 0.65s cubic-bezier(0.22,1,0.36,1)   0ms both; }
        .hx-anim-2 { animation: hxFadeUp 0.65s cubic-bezier(0.22,1,0.36,1) 100ms both; }
        .hx-anim-3 { animation: hxFadeUp 0.65s cubic-bezier(0.22,1,0.36,1) 200ms both; }
        .hx-anim-4 { animation: hxFadeUp 0.65s cubic-bezier(0.22,1,0.36,1) 310ms both; }
        .hx-anim-5 { animation: hxFadeUp 0.65s cubic-bezier(0.22,1,0.36,1) 420ms both; }
        .hx-anim-img { animation: hxFadeRight 0.8s cubic-bezier(0.22,1,0.36,1) 0.12s both; }
        .hx-float    { animation: hxFloat 4.2s ease-in-out infinite; }
        .hx-sparkle  { animation: hxSparkle 2.4s ease-in-out infinite; }
        .hx-dot-active { animation: hxDotPulse 2s ease-in-out infinite; }

        /* ═══════════════ WRAPPER ═══════════════ */
        *, *::before, *::after { box-sizing: border-box; }
        .hx-wrap { background: #090d12; overflow-x: hidden; }

        /* ═══════════════ HERO ═══════════════ */
        .hx-hero {
          position: relative; overflow: hidden;
          background: radial-gradient(ellipse at 75% 50%, #0d1a2d 0%, #090d12 60%);
        }

        .hx-hero-inner {
          max-width: 1280px; margin: 0 auto; width: 100%;
          padding: 1.25rem 1rem 0.75rem;
          display: grid; grid-template-columns: 1fr; align-items: center;
        }
        @media (min-width: 768px) {
          .hx-hero-inner {
            grid-template-columns: 52% 48%;
            padding: 1.75rem 2rem 1.25rem;
            min-height: 300px;
          }
        }
        @media (min-width: 1024px) {
          .hx-hero-inner {
            grid-template-columns: 52% 48%;
            padding: 1.75rem 2.5rem 1rem;
            min-height: 360px;
          }
        }

        /* ─ Hero heading ─ */
        .hx-h1 {
          font-size: clamp(1.7rem, 9vw, 2.6rem); font-weight: 900;
          line-height: 1; letter-spacing: -0.02em; margin: 0;
        }
        @media (min-width: 640px)  { .hx-h1 { font-size: 3.2rem; } }
        @media (min-width: 1024px) { .hx-h1 { font-size: clamp(2.6rem, 5vw, 4rem); } }

        /* ─ Hero subtitle ─ */
        .hx-sub {
          font-size: 0.58rem; font-weight: 600;
          letter-spacing: 0.38em; color: #94a3b8;
          text-transform: uppercase; margin-top: 0.55rem; margin-bottom: 0.55rem;
        }
        @media (min-width: 1024px) { .hx-sub { font-size: 0.7rem; margin-top: 0.65rem; margin-bottom: 0.75rem; } }

        /* ─ Hero description ─ */
        .hx-desc {
          color: #94a3b8; font-size: 0.8rem; line-height: 1.6;
          margin-bottom: 1.1rem; max-width: 400px; display: none;
        }
        @media (min-width: 480px)  { .hx-desc { display: block; } }
        @media (min-width: 1024px) { .hx-desc { font-size: 0.875rem; margin-bottom: 1.35rem; } }

        /* ─ CTA buttons ─ */
        .hx-btns { display: flex; gap: 0.55rem; margin-bottom: 0.9rem; flex-wrap: wrap; }
        @media (min-width: 1024px) { .hx-btns { gap: 0.75rem; margin-bottom: 1.25rem; } }

        .hx-btn-gold {
          background: linear-gradient(135deg, #f5a623 0%, #f59e0b 100%);
          color: #000; font-weight: 800; font-size: 0.68rem; letter-spacing: 0.07em;
          padding: 0.5rem 1.2rem; border-radius: 0.4rem;
          text-decoration: none; white-space: nowrap;
          transition: opacity 0.2s, transform 0.2s;
          box-shadow: 0 4px 14px rgba(245,166,35,0.35);
        }
        .hx-btn-gold:hover { opacity: 0.88; transform: translateY(-1px); }
        @media (min-width: 1024px) { .hx-btn-gold { font-size: 0.8rem; padding: 0.62rem 1.65rem; } }

        .hx-btn-outline {
          border: 1.5px solid rgba(255,255,255,0.22); color: #fff;
          font-weight: 600; font-size: 0.68rem; letter-spacing: 0.05em;
          padding: 0.5rem 0.95rem; border-radius: 0.4rem;
          text-decoration: none; background: transparent; white-space: nowrap;
          transition: border-color 0.2s, background 0.2s;
        }
        .hx-btn-outline:hover {
          border-color: rgba(255,255,255,0.45);
          background: rgba(255,255,255,0.05);
        }
        @media (min-width: 1024px) { .hx-btn-outline { font-size: 0.8rem; padding: 0.62rem 1.3rem; } }

        /* ─ Hero search (mobile / tablet) ─ */
        .hx-search-wrap {
          display: block; width: 100%; box-sizing: border-box;
          position: relative; z-index: 12; /* above hero bottom gradient (z-index:10) */
          padding: 1.5px; border-radius: 9999px;
          /* Use a pseudo-element trick to avoid gradient transitions (causes black flash) */
          background: linear-gradient(120deg, rgba(245,166,35,0.65) 0%, rgba(30,144,255,0.65) 100%);
          box-shadow: 0 0 14px rgba(245,166,35,0.12), 0 0 28px rgba(30,144,255,0.08);
          /* Only transition box-shadow — never transition background (causes black flash on mobile) */
          transition: box-shadow 0.25s ease; margin-bottom: 0.9rem;
          -webkit-tap-highlight-color: transparent;
        }
        .hx-search-wrap:focus-within {
          background: linear-gradient(120deg, #f5a623 0%, #1e90ff 100%);
          box-shadow: 0 0 22px rgba(245,166,35,0.3), 0 0 44px rgba(30,144,255,0.2);
        }
        .hx-search-inner {
          display: flex; align-items: center; width: 100%;
          background: #111520; border-radius: 9999px; overflow: hidden;
        }
        .hx-search-icon {
          margin-left: 10px; flex-shrink: 0;
          color: rgba(245,166,35,0.7); transition: color 0.2s;
        }
        .hx-search-wrap:focus-within .hx-search-icon { color: #f5a623; }
        .hx-search-input {
          flex: 1 1 0; background: transparent; min-width: 0; width: 0;
          padding: 0.65rem 0.5rem; font-size: 16px; /* 16px prevents iOS auto-zoom */
          color: #fff; border: none;
          outline: none !important; box-shadow: none !important;
          -webkit-appearance: none; appearance: none;
          -webkit-tap-highlight-color: transparent;
        }
        .hx-search-input:focus { outline: none !important; box-shadow: none !important; border: none !important; }
        .hx-search-input::placeholder { color: #5a6480; font-size: 0.82rem; }
        .hx-search-input::-webkit-search-decoration,
        .hx-search-input::-webkit-search-cancel-button { display: none; }
        /* Search button: icon-only on mobile, text on larger screens */
        .hx-search-btn {
          margin: 3px; flex-shrink: 0;
          background: linear-gradient(135deg, #f5a623 0%, #f59e0b 100%);
          color: #000; font-weight: 800; font-size: 0.72rem;
          padding: 0.48rem 0.6rem; border-radius: 9999px;
          border: none; cursor: pointer;
          display: flex; align-items: center; gap: 4px;
          letter-spacing: 0.04em; white-space: nowrap;
          transition: opacity 0.15s, transform 0.15s;
          -webkit-tap-highlight-color: transparent;
        }
        .hx-search-btn:hover { opacity: 0.88; transform: scale(0.98); }
        /* Show "Search" text only on screens wide enough */
        .hx-search-btn-label { display: none; }
        @media (min-width: 400px) {
          .hx-search-btn { padding: 0.48rem 1rem; }
          .hx-search-btn-label { display: inline; }
        }

        /* ─ Slider dots ─ */
        .hx-dots { display: flex; align-items: center; gap: 0.35rem; }

        /* ─ Hero image column ─ */
        .hx-hero-img-col { min-height: 260px; }
        @media (min-width: 768px)  { .hx-hero-img-col { min-height: 320px; } }
        @media (min-width: 1024px) { .hx-hero-img-col { min-height: 400px; } }

        /* ═══════════════ SECTION SHARED ═══════════════ */
        .hx-section-head {
          display: flex; align-items: center; justify-content: space-between;
          margin-bottom: 1rem;
        }
        @media (min-width: 1024px) { .hx-section-head { margin-bottom: 1.35rem; } }

        .hx-section-title {
          color: #fff; font-weight: 800; font-size: 0.78rem;
          letter-spacing: 0.12em; text-transform: uppercase; margin: 0;
        }
        @media (min-width: 1024px) { .hx-section-title { font-size: 1rem; } }

        .hx-view-all {
          border: 1.5px solid rgba(255,255,255,0.18); color: #cdd5e0;
          font-weight: 700; font-size: 0.6rem; letter-spacing: 0.07em;
          padding: 0.3rem 0.8rem; border-radius: 0.375rem;
          text-decoration: none; transition: all 0.2s;
        }
        .hx-view-all:hover {
          border-color: rgba(245,166,35,0.55);
          color: #f5a623; background: rgba(245,166,35,0.07);
        }
        @media (min-width: 1024px) { .hx-view-all { font-size: 0.65rem; padding: 0.35rem 0.95rem; } }

        /* ─ Common wishlist button ─ */
        .hx-wish-btn {
          position: absolute; top: 7px; right: 7px; z-index: 2;
          width: 28px; height: 28px; border-radius: 50%;
          border: 1px solid rgba(255,255,255,0.18);
          background: rgba(0,0,0,0.52); backdrop-filter: blur(4px);
          display: flex; align-items: center; justify-content: center;
          transition: all 0.2s;
        }
        .hx-wish-btn:hover {
          background: rgba(245,166,35,0.28);
          border-color: rgba(245,166,35,0.6);
        }

        /* ─ Image placeholder ─ */
        .hx-img-ph {
          width: 100%; height: 100%;
          background: linear-gradient(135deg, #111827 0%, #1a2035 100%);
        }

        /* ─ Section divider ─ */
        .hx-divider {
          height: 1px; margin: 0 1.25rem;
          background: linear-gradient(to right, transparent, rgba(245,166,35,0.18), rgba(30,144,255,0.15), transparent);
        }
        @media (min-width: 1024px) { .hx-divider { margin: 0 2.5rem; } }

        /* ═══════════════ VIRAL ═══════════════ */
        .hx-viral {
          padding: 0.75rem 1.25rem 1.75rem;
          background: linear-gradient(to bottom, #090d12, #0b101a);
        }
        @media (min-width: 1024px) { .hx-viral { padding: 1rem 2.5rem 2.5rem; } }

        /* Viral grid: 3 (mobile) → 4 (tablet) → 5 (desktop) */
        .hx-viral-grid {
          display: grid;
          grid-template-columns: repeat(3,1fr);
          gap: 0.55rem;
        }
        @media (min-width: 640px)  { .hx-viral-grid { grid-template-columns: repeat(4,1fr); gap: 0.8rem; } }
        @media (min-width: 1024px) { .hx-viral-grid { grid-template-columns: repeat(5,1fr); gap: 1.1rem; } }

        /* Viral card */
        .hx-viral-card { animation: hxFadeUp 0.55s cubic-bezier(0.22,1,0.36,1) both; }
        .hx-viral-img {
          position: relative; border-radius: 0.625rem; overflow: hidden;
          background: #0d1117; aspect-ratio: 2/3; cursor: pointer;
        }
        @media (min-width: 1024px) { .hx-viral-img { border-radius: 0.8rem; } }

        .hx-viral-card:hover .hx-viral-img {
          box-shadow: 0 0 0 2px rgba(245,166,35,0.45), 0 10px 36px rgba(0,0,0,0.55);
        }
        .hx-viral-card:hover .hx-viral-img img { transform: scale(1.07); }
        .hx-viral-img img { transition: transform 0.42s ease; }

        /* Viral overlay */
        .hx-viral-overlay {
          position: absolute; bottom: 0; left: 0; right: 0;
          padding: 2rem 0.7rem 0.65rem;
          background: linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.45) 55%, transparent 100%);
        }
        .hx-viral-name {
          color: #f1f5f9; font-weight: 600; font-size: 0.62rem;
          margin: 0 0 5px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
        }
        @media (min-width: 1024px) { .hx-viral-name { font-size: 0.76rem; } }
        .hx-viral-price {
          color: #f5a623; font-weight: 800; font-size: 0.7rem;
        }
        @media (min-width: 1024px) { .hx-viral-price { font-size: 0.84rem; } }

        /* ═══════════════ FEATURED ═══════════════ */
        .hx-featured {
          position: relative; overflow: hidden;
          padding: 2.25rem 1.25rem 4rem;
          background: linear-gradient(to bottom, #0b101a, #090d12);
        }
        @media (min-width: 1024px) { .hx-featured { padding: 3rem 2.5rem 5.5rem; } }

        /* Subtle dot-grid texture */
        .hx-featured::before {
          content: '';
          position: absolute; inset: 0; pointer-events: none;
          background-image: radial-gradient(rgba(245,166,35,0.028) 1px, transparent 1px);
          background-size: 28px 28px;
        }

        /* Featured header */
        .hx-featured-head {
          position: relative;
          display: flex; align-items: flex-start; justify-content: space-between;
          margin-bottom: 1.5rem;
        }
        @media (min-width: 1024px) { .hx-featured-head { margin-bottom: 2.25rem; } }

        .hx-featured-label {
          font-size: 0.62rem; font-weight: 700; color: #f5a623;
          text-transform: uppercase; letter-spacing: 0.12em;
          display: flex; align-items: center; gap: 5px; margin-bottom: 5px;
        }
        .hx-featured-title {
          color: #fff; font-weight: 800; font-size: 1.3rem; margin: 0;
          background: linear-gradient(135deg, #fff 30%, rgba(245,166,35,0.75) 100%);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        @media (min-width: 1024px) { .hx-featured-title { font-size: 1.8rem; } }

        /* Featured grid: 2 → 3 → 5 cols */
        .hx-featured-grid {
          position: relative;
          display: grid;
          grid-template-columns: repeat(2,1fr);
          gap: 0.85rem;
        }
        @media (min-width: 500px)  { .hx-featured-grid { grid-template-columns: repeat(3,1fr); gap: 1rem; } }
        @media (min-width: 1024px) { .hx-featured-grid { grid-template-columns: repeat(5,1fr); gap: 1.35rem; } }

        /* Featured glass card */
        .hx-feat-card {
          animation: hxFadeUp 0.55s cubic-bezier(0.22,1,0.36,1) both;
          border-radius: 0.85rem; overflow: hidden;
          background: rgba(255,255,255,0.028);
          border: 1px solid rgba(255,255,255,0.065);
          transition: transform 0.32s ease, box-shadow 0.32s ease, border-color 0.32s ease, background 0.32s ease;
        }
        .hx-feat-card:hover {
          transform: translateY(-5px);
          background: rgba(245,166,35,0.04);
          border-color: rgba(245,166,35,0.22);
          box-shadow: 0 14px 44px rgba(0,0,0,0.45), 0 0 24px rgba(245,166,35,0.09);
        }
        .hx-feat-img {
          position: relative; overflow: hidden;
          aspect-ratio: 3/4; background: #0d1117;
        }
        .hx-feat-img img { transition: transform 0.45s ease; }
        .hx-feat-card:hover .hx-feat-img img { transform: scale(1.07); }

        .hx-feat-info {
          padding: 0.65rem 0.75rem 0.8rem;
          display: flex; flex-direction: column; gap: 6px;
        }
        @media (min-width: 1024px) { .hx-feat-info { padding: 0.8rem 0.9rem 0.9rem; gap: 8px; } }

        .hx-feat-name {
          color: #e5e7eb; font-weight: 600; font-size: 0.65rem;
          margin: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
        }
        @media (min-width: 1024px) { .hx-feat-name { font-size: 0.78rem; } }

        .hx-feat-bottom {
          display: flex; align-items: center; gap: 5px; flex-wrap: wrap;
        }
        .hx-feat-price {
          color: #f5a623; font-weight: 800; font-size: 0.72rem;
        }
        @media (min-width: 1024px) { .hx-feat-price { font-size: 0.86rem; } }

        .hx-feat-cmp {
          color: #6b7280; font-size: 0.6rem; text-decoration: line-through; font-weight: 500;
        }

        /* Discount badge */
        .hx-discount-badge {
          position: absolute; top: 8px; left: 8px; z-index: 2;
          background: linear-gradient(135deg, #e74c3c, #c0392b);
          color: #fff; font-weight: 800; font-size: 0.58rem;
          letter-spacing: 0.04em; padding: 2px 7px; border-radius: 4px;
          box-shadow: 0 2px 8px rgba(231,76,60,0.4);
        }

        /* See more */
        .hx-see-more {
          display: inline-flex; align-items: center; gap: 0.5rem;
          border: 1.5px solid rgba(245,166,35,0.4); color: #f5a623;
          font-weight: 700; font-size: 0.82rem; letter-spacing: 0.05em;
          padding: 0.78rem 2.5rem; border-radius: 0.55rem;
          text-decoration: none; transition: all 0.25s; margin-top: 2.5rem;
          position: relative; overflow: hidden;
        }
        .hx-see-more::before {
          content: '';
          position: absolute; inset: 0;
          background: linear-gradient(90deg, transparent, rgba(245,166,35,0.1), transparent);
          background-size: 200% 100%;
          animation: hxShimmer 2.5s linear infinite;
        }
        .hx-see-more:hover {
          background: rgba(245,166,35,0.1);
          border-color: rgba(245,166,35,0.75);
          transform: translateY(-2px);
          box-shadow: 0 6px 24px rgba(245,166,35,0.2);
        }

        /* ─ Tiny screens — everything scales via clamp/vw, just tune buttons ─ */
        @media (max-width: 359px) {
          .hx-btn-gold    { font-size: 0.6rem; padding: 0.4rem 0.75rem; }
          .hx-btn-outline { font-size: 0.6rem; padding: 0.4rem 0.6rem; }
        }

        /* ─ Full viewport hero — tablet & desktop only ─
           Hero fills 100% of visible screen so products are below the fold.
           Mobile is untouched (single column, auto height). */
        @media (min-width: 768px) {
          .hx-hero {
            min-height: calc(100vh  - 64px);  /* fallback */
            min-height: calc(100dvh - 64px);  /* accounts for mobile browser chrome */
            display: flex;
            flex-direction: column;
          }
          .hx-hero-inner {
            flex: 1;
            min-height: unset;
          }
        }

      ` }} />

      <div className="hx-wrap">

        {/* ═══ HERO ═══════════════════════════════════════════════════════════ */}
        <section className="hx-hero">

          {/* Ambient glows */}
          <div style={{ position:"absolute", inset:0, background:"radial-gradient(ellipse at 76% 44%, rgba(30,144,255,0.18) 0%, transparent 58%)", pointerEvents:"none" }} />
          <div style={{ position:"absolute", bottom:0, right:"20%", width:"28%", height:"50%", background:"radial-gradient(ellipse at center bottom, rgba(245,166,35,0.08) 0%, transparent 65%)", pointerEvents:"none" }} />
          {/* Strong bottom fade — hero bleeds seamlessly into viral */}
          <div style={{ position:"absolute", bottom:0, left:0, right:0, height:140, background:"linear-gradient(to bottom,transparent 0%,rgba(9,13,18,0.7) 50%,#090d12 100%)", zIndex:10, pointerEvents:"none" }} />

          <div className="hx-hero-inner">

            {/* Left: text with staggered entrance */}
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

              {/* Mobile search */}
              <form action="/shop" method="get" className="md:hidden hx-search-wrap hx-anim-4" role="search">
                <div className="hx-search-inner">
                  <svg className="hx-search-icon" width="15" height="15" viewBox="0 0 24 24"
                    fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <circle cx="11" cy="11" r="8"/>
                    <path d="m21 21-4.35-4.35"/>
                  </svg>
                  <input
                    type="text" name="q"
                    placeholder="Search products, categories…"
                    autoComplete="off" aria-label="Search HEXASHOP"
                    className="hx-search-input"
                  />
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

              {/* Slider dots */}
              <div className="hx-dots hx-anim-5">
                <div className="hx-dot-active" style={{ height: 5, borderRadius: 3, background: "#f5a623" }} />
                <div style={{ width: 12, height: 5, borderRadius: 3, background: "#2a2f3e" }} />
                <div style={{ width: 12, height: 5, borderRadius: 3, background: "#2a2f3e" }} />
              </div>
            </div>

            {/* Right: hexagon + hero image */}
            <div className="hx-hero-img-col hx-anim-img hidden md:flex items-center justify-center relative" style={{ overflow:"hidden" }}>
              {/* Hexagon SVG */}
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

              {/* Sparkle dots */}
              {sparkles.map((dot, i) => (
                <div key={i} className="hx-sparkle" style={{
                  position: "absolute", zIndex: 3,
                  top: dot.top,
                  right: dot.right,
                  left:  dot.left,
                  width: dot.s, height: dot.s, borderRadius: "50%",
                  background: "#f5a623",
                  boxShadow: `0 0 ${dot.s * 3}px ${dot.s}px rgba(245,166,35,0.65)`,
                  animationDelay: `${dot.d}ms`,
                }} />
              ))}

              {/* Hero image — floating */}
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
              {/* Image column bottom fade — person blends into background */}
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
