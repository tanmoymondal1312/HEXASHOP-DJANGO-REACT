import Link from "next/link";
import { ChevronRight, Flame, Heart, Star } from "lucide-react";
import { productsApi, siteApi } from "@/lib/api";
import { WebsiteJsonLd } from "@/components/seo/JsonLd";
import { resolveImageUrl } from "@/lib/utils";
import type { HeroSlide, Product } from "@/types";
import HeroSlider from "@/components/hero/HeroSlider";

// ─── Data fetchers ────────────────────────────────────────────────────────────

async function getSiteSettings() {
  try {
    const { data } = await siteApi.settings();
    return data as { hero_image_url: string | null; hero_image_alt: string };
  } catch {
    return { hero_image_url: null, hero_image_alt: "HEXASHOP" };
  }
}

async function getHeroSlides(): Promise<HeroSlide[]> {
  try {
    const { data } = await siteApi.heroSlides();
    return data ?? [];
  } catch {
    return [];
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
  const [settings, heroSlides, viral, featured] = await Promise.all([
    getSiteSettings(), getHeroSlides(), getViral(), getFeatured(),
  ]);
  const { hero_image_url, hero_image_alt } = settings;

  return (
    <>
      <WebsiteJsonLd />

      <style dangerouslySetInnerHTML={{ __html: `
        /* ═══════════════ KEYFRAMES (product sections) ═══════════════ */
        @keyframes hxFadeUp   { from{opacity:0;transform:translateY(22px)} to{opacity:1;transform:translateY(0)} }
        @keyframes hxShimmer  { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
        @media(prefers-reduced-motion:reduce){
          .hx-viral-card,.hx-feat-card { animation:none !important; }
        }

        /* ═══════════════ WRAPPER ═══════════════ */
        *,*::before,*::after { box-sizing:border-box; }
        .hx-wrap { background:#090d12; overflow-x:hidden; }

        /* ═══════════════ SECTION SHARED ═══════════════ */
        .hx-section-head {
          display:flex; align-items:center; justify-content:space-between;
          margin-bottom:1rem;
        }
        @media(min-width:1024px){ .hx-section-head { margin-bottom:1.35rem; } }

        .hx-section-title {
          color:#fff; font-weight:800; font-size:0.78rem;
          letter-spacing:0.12em; text-transform:uppercase; margin:0;
        }
        @media(min-width:1024px){ .hx-section-title { font-size:1rem; } }

        .hx-view-all {
          border:1.5px solid rgba(255,255,255,0.18); color:#cdd5e0;
          font-weight:700; font-size:0.6rem; letter-spacing:0.07em;
          padding:0.3rem 0.8rem; border-radius:0.375rem;
          text-decoration:none; transition:all 0.2s;
        }
        .hx-view-all:hover {
          border-color:rgba(245,166,35,0.55);
          color:#f5a623; background:rgba(245,166,35,0.07);
        }
        @media(min-width:1024px){ .hx-view-all { font-size:0.65rem; padding:0.35rem 0.95rem; } }

        /* ─ Wishlist button ─ */
        .hx-wish-btn {
          position:absolute; top:7px; right:7px; z-index:2;
          width:28px; height:28px; border-radius:50%;
          border:1px solid rgba(255,255,255,0.18);
          background:rgba(0,0,0,0.52); backdrop-filter:blur(4px);
          display:flex; align-items:center; justify-content:center;
          transition:all 0.2s;
        }
        .hx-wish-btn:hover {
          background:rgba(245,166,35,0.28);
          border-color:rgba(245,166,35,0.6);
        }

        /* ─ Image placeholder ─ */
        .hx-img-ph {
          width:100%; height:100%;
          background:linear-gradient(135deg,#111827 0%,#1a2035 100%);
        }

        /* ═══════════════ VIRAL ═══════════════ */
        .hx-viral {
          padding:0.75rem 1.25rem 1.75rem;
          background:linear-gradient(to bottom,#090d12,#0b101a);
        }
        @media(min-width:1024px){ .hx-viral { padding:1rem 2.5rem 2.5rem; } }

        .hx-viral-grid {
          display:grid; grid-template-columns:repeat(3,1fr); gap:0.55rem;
        }
        @media(min-width:640px)  { .hx-viral-grid { grid-template-columns:repeat(4,1fr); gap:0.8rem; } }
        @media(min-width:1024px) { .hx-viral-grid { grid-template-columns:repeat(5,1fr); gap:1.1rem; } }

        .hx-viral-card { animation:hxFadeUp 0.55s cubic-bezier(0.22,1,0.36,1) both; }
        .hx-viral-img {
          position:relative; border-radius:0.625rem; overflow:hidden;
          background:#0d1117; aspect-ratio:2/3; cursor:pointer;
        }
        @media(min-width:1024px){ .hx-viral-img { border-radius:0.8rem; } }
        .hx-viral-card:hover .hx-viral-img {
          box-shadow:0 0 0 2px rgba(245,166,35,0.45),0 10px 36px rgba(0,0,0,0.55);
        }
        .hx-viral-card:hover .hx-viral-img img { transform:scale(1.07); }
        .hx-viral-img img { transition:transform 0.42s ease; }

        .hx-viral-overlay {
          position:absolute; bottom:0; left:0; right:0;
          padding:2rem 0.7rem 0.65rem;
          background:linear-gradient(to top,rgba(0,0,0,0.9) 0%,rgba(0,0,0,0.45) 55%,transparent 100%);
        }
        .hx-viral-name {
          color:#f1f5f9; font-weight:600; font-size:0.62rem;
          margin:0 0 5px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;
        }
        @media(min-width:1024px){ .hx-viral-name { font-size:0.76rem; } }
        .hx-viral-price { color:#f5a623; font-weight:800; font-size:0.7rem; }
        @media(min-width:1024px){ .hx-viral-price { font-size:0.84rem; } }

        /* ═══════════════ FEATURED ═══════════════ */
        .hx-featured {
          position:relative; overflow:hidden;
          padding:2.25rem 1.25rem 4rem;
          background:linear-gradient(to bottom,#0b101a,#090d12);
        }
        @media(min-width:1024px){ .hx-featured { padding:3rem 2.5rem 5.5rem; } }
        .hx-featured::before {
          content:''; position:absolute; inset:0; pointer-events:none;
          background-image:radial-gradient(rgba(245,166,35,0.028) 1px,transparent 1px);
          background-size:28px 28px;
        }

        .hx-featured-head {
          position:relative;
          display:flex; align-items:flex-start; justify-content:space-between;
          margin-bottom:1.5rem;
        }
        @media(min-width:1024px){ .hx-featured-head { margin-bottom:2.25rem; } }

        .hx-featured-label {
          font-size:0.62rem; font-weight:700; color:#f5a623;
          text-transform:uppercase; letter-spacing:0.12em;
          display:flex; align-items:center; gap:5px; margin-bottom:5px;
        }
        .hx-featured-title {
          color:#fff; font-weight:800; font-size:1.3rem; margin:0;
          background:linear-gradient(135deg,#fff 30%,rgba(245,166,35,0.75) 100%);
          -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text;
        }
        @media(min-width:1024px){ .hx-featured-title { font-size:1.8rem; } }

        .hx-featured-grid {
          position:relative; display:grid;
          grid-template-columns:repeat(2,1fr); gap:0.85rem;
        }
        @media(min-width:500px)  { .hx-featured-grid { grid-template-columns:repeat(3,1fr); gap:1rem; } }
        @media(min-width:1024px) { .hx-featured-grid { grid-template-columns:repeat(5,1fr); gap:1.35rem; } }

        .hx-feat-card {
          animation:hxFadeUp 0.55s cubic-bezier(0.22,1,0.36,1) both;
          border-radius:0.85rem; overflow:hidden;
          background:rgba(255,255,255,0.028); border:1px solid rgba(255,255,255,0.065);
          transition:transform 0.32s ease,box-shadow 0.32s ease,border-color 0.32s ease,background 0.32s ease;
        }
        .hx-feat-card:hover {
          transform:translateY(-5px); background:rgba(245,166,35,0.04);
          border-color:rgba(245,166,35,0.22);
          box-shadow:0 14px 44px rgba(0,0,0,0.45),0 0 24px rgba(245,166,35,0.09);
        }
        .hx-feat-img {
          position:relative; overflow:hidden; aspect-ratio:3/4; background:#0d1117;
        }
        .hx-feat-img img { transition:transform 0.45s ease; }
        .hx-feat-card:hover .hx-feat-img img { transform:scale(1.07); }

        .hx-feat-info {
          padding:0.65rem 0.75rem 0.8rem; display:flex; flex-direction:column; gap:6px;
        }
        @media(min-width:1024px){ .hx-feat-info { padding:0.8rem 0.9rem 0.9rem; gap:8px; } }
        .hx-feat-name {
          color:#e5e7eb; font-weight:600; font-size:0.65rem;
          margin:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;
        }
        @media(min-width:1024px){ .hx-feat-name { font-size:0.78rem; } }
        .hx-feat-bottom { display:flex; align-items:center; gap:5px; flex-wrap:wrap; }
        .hx-feat-price { color:#f5a623; font-weight:800; font-size:0.72rem; }
        @media(min-width:1024px){ .hx-feat-price { font-size:0.86rem; } }
        .hx-feat-cmp { color:#6b7280; font-size:0.6rem; text-decoration:line-through; font-weight:500; }

        .hx-discount-badge {
          position:absolute; top:8px; left:8px; z-index:2;
          background:linear-gradient(135deg,#e74c3c,#c0392b);
          color:#fff; font-weight:800; font-size:0.58rem;
          letter-spacing:0.04em; padding:2px 7px; border-radius:4px;
          box-shadow:0 2px 8px rgba(231,76,60,0.4);
        }

        .hx-see-more {
          display:inline-flex; align-items:center; gap:0.5rem;
          border:1.5px solid rgba(245,166,35,0.4); color:#f5a623;
          font-weight:700; font-size:0.82rem; letter-spacing:0.05em;
          padding:0.78rem 2.5rem; border-radius:0.55rem;
          text-decoration:none; transition:all 0.25s; margin-top:2.5rem;
          position:relative; overflow:hidden;
        }
        .hx-see-more::before {
          content:''; position:absolute; inset:0;
          background:linear-gradient(90deg,transparent,rgba(245,166,35,0.1),transparent);
          background-size:200% 100%; animation:hxShimmer 2.5s linear infinite;
        }
        .hx-see-more:hover {
          background:rgba(245,166,35,0.1); border-color:rgba(245,166,35,0.75);
          transform:translateY(-2px); box-shadow:0 6px 24px rgba(245,166,35,0.2);
        }
      ` }} />

      <div className="hx-wrap">

        {/* ═══ HERO SLIDER ═════════════════════════════════════════════════════ */}
        <HeroSlider
          heroImageUrl={hero_image_url}
          heroImageAlt={hero_image_alt}
          apiSlides={heroSlides}
        />

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
