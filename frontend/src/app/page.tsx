import Image from "next/image";
import Link from "next/link";
import { ChevronRight, Flame, Heart, Search, Star } from "lucide-react";
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
    return data ?? [];
  } catch {
    return [];
  }
}

// ─── Inline product card ─────────────────────────────────────────────────────

function InlineCard({ product, priority }: { product: Product; priority?: boolean }) {
  const src   = resolveImageUrl(product.primary_image ?? null);
  const price = parseFloat(product.base_price).toFixed(2);
  const rating = Math.min(5, Math.round(parseFloat(product.avg_rating)));

  return (
    <Link href={`/products/${product.slug}`} className="hx-card" style={{ display: "block", textDecoration: "none" }}>
      {/* Image */}
      <div className="hx-card-img">
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={src}
            alt={product.name}
            loading={priority ? "eager" : "lazy"}
            style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.3s" }}
          />
        ) : (
          <div style={{ width:"100%", height:"100%", display:"flex", alignItems:"center", justifyContent:"center" }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
        <span style={{ position:"absolute", top:5, right:5, width:22, height:22, borderRadius:"50%", border:"1px solid rgba(255,255,255,0.3)", background:"rgba(0,0,0,0.5)", display:"flex", alignItems:"center", justifyContent:"center" }}>
          <Heart style={{ width:10, height:10, color:"#fff" }} />
        </span>
      </div>

      {/* Info */}
      <div className="hx-card-info">
        <p className="hx-card-name">{product.name}</p>
        <p className="hx-card-price">${price}</p>
        <div className="hx-card-stars">
          {[1,2,3,4,5].map((s) => (
            <Star key={s} style={{ width:8, height:8, color: s<=rating ? "#facc15":"#2a2f3e", fill: s<=rating ? "#facc15":"none" }} />
          ))}
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

  return (
    <>
      <WebsiteJsonLd />

      {/* ── All responsive styles in one place ────────────────────────── */}
      <style>{`

        /* ─ Outer wrapper: auto-height on mobile, viewport-locked on desktop ─ */
        .hx-wrap { background: #0b0f14; }
        .hx-screen { display:flex; flex-direction:column; }
        @media (min-width:1024px) {
          .hx-screen { height:calc(100dvh - 64px); overflow:hidden; }
        }

        /* ─ Hero section ─ */
        .hx-hero { position:relative; overflow:hidden; }
        @media (min-width:1024px) { .hx-hero { flex:1; min-height:0; } }

        /* ─ Hero inner grid ─ */
        .hx-hero-inner {
          max-width:1280px; margin:0 auto;
          padding:1.5rem 1.25rem;
          display:grid; align-items:center;
        }
        /* Tablet (768px+): show 2-column grid with image */
        @media (min-width:768px) {
          .hx-hero-inner {
            grid-template-columns:52% 48%;
            padding:1.5rem 2rem;
          }
        }
        /* Desktop (1024px+): lock to viewport height */
        @media (min-width:1024px) {
          .hx-hero-inner {
            height:100%;
            padding:0 2.5rem;
            grid-template-columns:52% 48%;
          }
        }

        /* ─ Hero heading ─ */
        .hx-h1 {
          font-size:2.6rem;   /* mobile */
          font-weight:900; line-height:1; letter-spacing:-0.02em; margin:0;
        }
        @media (min-width:640px)  { .hx-h1 { font-size:3.2rem; } }
        @media (min-width:1024px) { .hx-h1 { font-size:clamp(2.4rem,5vw,3.8rem); } }

        /* ─ Hero subtitle ─ */
        .hx-sub {
          font-size:0.58rem; font-weight:600;
          letter-spacing:0.38em; color:#94a3b8;
          text-transform:uppercase; margin-top:0.5rem; margin-bottom:0.5rem;
        }
        @media (min-width:1024px) { .hx-sub { font-size:0.7rem; margin-top:0.6rem; margin-bottom:0.7rem; } }

        /* ─ Hero description: hidden on small phones ─ */
        .hx-desc {
          color:#94a3b8; font-size:0.8rem; line-height:1.6;
          margin-bottom:1rem; max-width:400px; display:none;
        }
        @media (min-width:480px)  { .hx-desc { display:block; } }
        @media (min-width:1024px) { .hx-desc { font-size:0.85rem; margin-bottom:1.25rem; } }

        /* ─ CTA buttons ─ */
        .hx-btns { display:flex; gap:0.5rem; margin-bottom:0.875rem; flex-wrap:wrap; }
        @media (min-width:1024px) { .hx-btns { gap:0.75rem; margin-bottom:1.25rem; } }

        .hx-btn-gold {
          background:#f5a623; color:#000; font-weight:700;
          font-size:0.68rem; letter-spacing:0.07em;
          padding:0.48rem 1.1rem; border-radius:0.4rem; text-decoration:none;
          white-space:nowrap;
        }
        @media (min-width:1024px) { .hx-btn-gold { font-size:0.78rem; padding:0.6rem 1.6rem; } }

        .hx-btn-outline {
          border:1.5px solid rgba(255,255,255,0.22); color:#fff;
          font-weight:600; font-size:0.68rem; letter-spacing:0.05em;
          padding:0.48rem 0.9rem; border-radius:0.4rem;
          text-decoration:none; background:transparent; white-space:nowrap;
        }
        @media (min-width:1024px) { .hx-btn-outline { font-size:0.78rem; padding:0.6rem 1.25rem; } }

        /* ─ Slider dots ─ */
        .hx-dots { display:flex; align-items:center; gap:0.35rem; }

        /* ─ Viral strip ─ */
        .hx-viral { flex-shrink:0; padding:0 1.25rem 0.75rem; }
        @media (min-width:1024px) { .hx-viral { padding:0 2.5rem 1rem; } }

        .hx-section-head {
          display:flex; align-items:center; justify-content:space-between;
          margin-bottom:0.5rem;
        }
        .hx-section-title {
          color:#fff; font-weight:800; font-size:0.7rem;
          letter-spacing:0.12em; text-transform:uppercase; margin:0;
        }
        @media (min-width:1024px) { .hx-section-title { font-size:0.88rem; } }

        .hx-view-all {
          border:1.5px solid rgba(255,255,255,0.2); color:#fff;
          font-weight:700; font-size:0.6rem; letter-spacing:0.06em;
          padding:0.28rem 0.7rem; border-radius:0.35rem; text-decoration:none;
        }
        @media (min-width:1024px) { .hx-view-all { font-size:0.65rem; padding:0.32rem 0.85rem; } }

        /* ─ Viral grid: 3→4→5 columns ─ */
        .hx-viral-grid {
          display:grid;
          grid-template-columns:repeat(3,1fr); /* phone */
          gap:0.45rem;
        }
        @media (min-width:500px)  { .hx-viral-grid { grid-template-columns:repeat(4,1fr); gap:0.55rem; } }
        @media (min-width:1024px) { .hx-viral-grid { grid-template-columns:repeat(5,1fr); gap:0.85rem; } }

        /* ─ Card image: square on mobile, 4/3 on desktop ─ */
        .hx-card { transition:transform 0.2s ease; }
        .hx-card:hover { transform:translateY(-3px); }
        .hx-card:hover img { transform:scale(1.06); }

        .hx-card-img {
          position:relative; border-radius:0.5rem;
          overflow:hidden; background:#0d1117;
          aspect-ratio:1/1;   /* mobile: square = compact */
        }
        @media (min-width:1024px) { .hx-card-img { aspect-ratio:4/3; border-radius:0.625rem; } }

        /* ─ Card info ─ */
        .hx-card-info { padding:4px 1px 0; }

        .hx-card-name {
          color:#e5e7eb; font-weight:600; font-size:0.6rem;
          margin:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;
        }
        @media (min-width:1024px) { .hx-card-name { font-size:0.72rem; } }

        .hx-card-price {
          color:#f5a623; font-weight:700; font-size:0.6rem; margin:1px 0 2px;
        }
        @media (min-width:1024px) { .hx-card-price { font-size:0.72rem; margin:1px 0 3px; } }

        /* Stars hidden on mobile to save space */
        .hx-card-stars { display:none; align-items:center; gap:2px; }
        @media (min-width:640px) { .hx-card-stars { display:flex; } }

        /* ─ Featured section (scrollable, below fold) ─ */
        .hx-featured { padding:1.5rem 1.25rem 3rem; background:#0b0f14; }
        @media (min-width:1024px) { .hx-featured { padding:2rem 2.5rem 4rem; } }

        .hx-featured-head {
          display:flex; align-items:flex-start; justify-content:space-between;
          margin-bottom:1rem;
        }
        .hx-featured-label {
          font-size:0.6rem; font-weight:700; color:#f5a623;
          text-transform:uppercase; letter-spacing:0.12em;
          display:flex; align-items:center; gap:4px; margin-bottom:3px;
        }
        .hx-featured-title {
          color:#fff; font-weight:800; font-size:1.15rem; margin:0;
        }
        @media (min-width:1024px) { .hx-featured-title { font-size:1.4rem; } }

        /* Featured grid: 2→3→5 columns */
        .hx-featured-grid {
          display:grid;
          grid-template-columns:repeat(2,1fr); /* phone: 2 cols */
          gap:0.75rem;
        }
        @media (min-width:500px)  { .hx-featured-grid { grid-template-columns:repeat(3,1fr); } }
        @media (min-width:1024px) { .hx-featured-grid { grid-template-columns:repeat(5,1fr); gap:1.25rem; } }

        /* See-more button */
        .hx-see-more {
          display:inline-flex; align-items:center; gap:0.4rem;
          border:1.5px solid rgba(245,166,35,0.4); color:#f5a623;
          font-weight:700; font-size:0.8rem; letter-spacing:0.05em;
          padding:0.65rem 2rem; border-radius:0.5rem;
          text-decoration:none; transition:all 0.2s; margin-top:2rem;
        }
        .hx-see-more:hover {
          background:rgba(245,166,35,0.08);
          border-color:rgba(245,166,35,0.7);
          transform:translateY(-1px);
          box-shadow:0 4px 20px rgba(245,166,35,0.15);
        }

      `}</style>

      <div className="hx-wrap">

        {/* ═══════════════════════════════════════════════════
            One-viewport block: Hero + Viral strip
            Desktop: locked to viewport height
            Mobile: auto height, scrolls freely
        ═══════════════════════════════════════════════════ */}
        <div className="hx-screen">

          {/* ── HERO ─────────────────────────────────────── */}
          <section className="hx-hero">

            {/* Ambient glows */}
            <div style={{ position:"absolute", inset:0, background:"radial-gradient(ellipse at 78% 45%, rgba(30,144,255,0.17) 0%, transparent 60%)", pointerEvents:"none" }} />
            <div style={{ position:"absolute", bottom:0, right:"18%", width:"30%", height:"55%", background:"radial-gradient(ellipse at center bottom, rgba(245,166,35,0.07) 0%, transparent 65%)", pointerEvents:"none" }} />
            {/* Gradient fade into viral strip */}
            <div style={{ position:"absolute", bottom:0, left:0, right:0, height:60, background:"linear-gradient(to bottom,transparent,#0b0f14)", zIndex:10, pointerEvents:"none" }} />

            <div className="hx-hero-inner">

              {/* Left: text */}
              <div>
                <h1 className="hx-h1">
                  <span style={{ color:"#fff" }}>HEXA</span>
                  <span style={{ color:"#1e90ff" }}>SHOP</span>
                </h1>

                <p className="hx-sub">Style That Defines You</p>

                <p className="hx-desc">
                  Discover the latest trends in fashion.<br />
                  Premium quality. Best prices.
                </p>

                <div className="hx-btns">
                  <Link href="/shop" className="hx-btn-gold">SHOP NOW</Link>
                  <Link href="/shop?is_featured=true" className="hx-btn-outline">EXPLORE COLLECTION</Link>
                </div>

                {/* Mobile-only search bar (hidden on md+, where header search is accessible) */}
                <form
                  action="/shop"
                  method="get"
                  className="md:hidden"
                  style={{ marginBottom:"0.875rem" }}
                >
                  <div style={{
                    display:"flex", alignItems:"center",
                    background:"rgba(255,255,255,0.05)",
                    border:"1px solid rgba(255,255,255,0.12)",
                    borderRadius:"0.5rem", overflow:"hidden",
                  }}>
                    <input
                      type="text"
                      name="q"
                      placeholder="Search products, categories…"
                      autoComplete="off"
                      style={{
                        flex:1, background:"transparent",
                        padding:"0.55rem 0.75rem",
                        fontSize:"0.8rem", color:"#fff",
                        outline:"none", border:"none",
                      }}
                    />
                    <button
                      type="submit"
                      aria-label="Search"
                      style={{
                        padding:"0.55rem 0.75rem",
                        background:"transparent", border:"none",
                        cursor:"pointer", color:"#f5a623",
                        display:"flex", alignItems:"center",
                      }}
                    >
                      <Search style={{ width:15, height:15 }} />
                    </button>
                  </div>
                </form>

                {/* Slider dots */}
                <div className="hx-dots">
                  <div style={{ width:20, height:5, borderRadius:3, background:"#f5a623" }} />
                  <div style={{ width:12, height:5, borderRadius:3, background:"#2a2f3e" }} />
                  <div style={{ width:12, height:5, borderRadius:3, background:"#2a2f3e" }} />
                </div>
              </div>

              {/* Right: hero image + hexagon — tablet & desktop */}
              <div className="hidden md:flex items-center justify-center relative" style={{ minHeight:"260px" }}>
                {/* Hexagon SVG */}
                <svg style={{ position:"absolute", zIndex:1 }} width="340" height="392" viewBox="0 0 340 392" fill="none">
                  <defs>
                    <filter id="hg"><feGaussianBlur stdDeviation="3" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
                  </defs>
                  <polygon points="170,12 330,104 330,288 170,380 10,288 10,104" fill="none" stroke="#f5a623" strokeWidth="1.2" strokeDasharray="10 6" strokeOpacity="0.5" />
                  <polygon points="170,32 312,116 312,276 170,360 28,276 28,116" fill="rgba(30,144,255,0.04)" stroke="#1e90ff" strokeWidth="2" strokeOpacity="0.9" filter="url(#hg)" />
                </svg>

                {/* Sparkle dots */}
                {[{top:"14%",right:"6%",s:7},{top:"34%",right:"1%",s:4},{top:"62%",right:"5%",s:5},{top:"18%",left:"12%",s:3},{top:"70%",left:"9%",s:4}].map((d,i) => (
                  <div key={i} style={{ position:"absolute", zIndex:3, top:d.top, right:"right" in d ? d.right : undefined, left:"left" in d ? d.left : undefined, width:d.s, height:d.s, borderRadius:"50%", background:"#f5a623", boxShadow:`0 0 ${d.s*3}px ${d.s}px rgba(245,166,35,0.6)` }} />
                ))}

                {/* Hero image */}
                <div style={{ position:"relative", zIndex:2, width:"100%", height:"100%", display:"flex", alignItems:"center", justifyContent:"center" }}>
                  {hero_image_url ? (
                    <Image src={hero_image_url} alt={hero_image_alt||"HEXASHOP"} width={300} height={360}
                      style={{ objectFit:"contain", maxHeight:"88%", filter:"drop-shadow(0 0 28px rgba(30,144,255,0.38)) drop-shadow(0 18px 40px rgba(0,0,0,0.7))" }}
                      priority unoptimized={hero_image_url.includes("localhost")} />
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
              </div>
            </div>
          </section>

          {/* ── VIRAL PRODUCTS (compact strip) ─────────────── */}
          <section className="hx-viral">
            <div style={{ maxWidth:1280, margin:"0 auto" }}>

              <div className="hx-section-head">
                <div style={{ display:"flex", alignItems:"center", gap:"0.4rem" }}>
                  <Flame style={{ width:13, height:13, color:"#f97316", fill:"#f97316" }} />
                  <h2 className="hx-section-title">Most Viral</h2>
                </div>
                <Link href="/shop?ordering=-sold_count" className="hx-view-all">VIEW ALL</Link>
              </div>

              <div className="hx-viral-grid">
                {viral.slice(0,5).map((p,i) => <InlineCard key={p.id} product={p} priority={i<5} />)}
                {viral.length === 0 && [1,2,3,4,5].map(i => (
                  <div key={i} className="hx-card-img" style={{ opacity:0.35 }} />
                ))}
              </div>
            </div>
          </section>
        </div>

        {/* ═══════════════════════════════════════════════════
            SCROLL SECTION: Featured Products (multi-row)
        ═══════════════════════════════════════════════════ */}
        <section className="hx-featured">
          <div style={{ maxWidth:1280, margin:"0 auto" }}>

            <div className="hx-featured-head">
              <div>
                <p className="hx-featured-label">
                  <Star style={{ width:11, height:11, fill:"#f5a623", color:"#f5a623" }} />
                  Handpicked for you
                </p>
                <h2 className="hx-featured-title">Featured Products</h2>
              </div>
              <Link href="/shop?is_featured=true" className="hx-view-all" style={{ marginTop:2 }}>
                View All <ChevronRight style={{ width:10, height:10, display:"inline" }} />
              </Link>
            </div>

            <div className="hx-featured-grid">
              {featured.length > 0
                ? featured.map((p,i) => <InlineCard key={p.id} product={p} priority={i<4} />)
                : [1,2,3,4,5,6,7,8].map(i => (
                    <div key={i} className="hx-card-img" style={{ opacity:0.3 }} />
                  ))
              }
            </div>

            {/* See more */}
            <div style={{ textAlign:"center" }}>
              <Link href="/shop" className="hx-see-more">
                See more products <ChevronRight style={{ width:15, height:15 }} />
              </Link>
            </div>
          </div>
        </section>

      </div>
    </>
  );
}
