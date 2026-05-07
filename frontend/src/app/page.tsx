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
    return data ?? [];
  } catch {
    return [];
  }
}

// ─── Transparent inline card (no card bg, blends into dark bg) ───────────────

function InlineCard({ product, priority }: { product: Product; priority?: boolean }) {
  const src = resolveImageUrl(product.primary_image ?? null);
  const price = parseFloat(product.base_price).toFixed(2);
  const rating = Math.min(5, Math.round(parseFloat(product.avg_rating)));

  return (
    <Link
      href={`/products/${product.slug}`}
      className="viral-card"
      style={{ display: "block", textDecoration: "none" }}
    >
      {/* Image — landscape 4/3, rounded, no card box */}
      <div style={{ position: "relative", aspectRatio: "4/3", borderRadius: "0.625rem", overflow: "hidden", background: "#0d1117" }}>
        {src ? (
          <Image
            src={src} alt={product.name} fill sizes="220px"
            style={{ objectFit: "cover" }}
            priority={priority}
            unoptimized={src.includes("localhost") || src.startsWith("/media")}
          />
        ) : (
          <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
        {/* Heart */}
        <span style={{
          position: "absolute", top: 7, right: 7,
          width: 26, height: 26, borderRadius: "50%",
          border: "1px solid rgba(255,255,255,0.3)",
          background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <Heart style={{ width: 12, height: 12, color: "#fff" }} />
        </span>
      </div>

      {/* Text — floats directly on dark bg, no card box */}
      <div style={{ padding: "5px 1px 0" }}>
        <p style={{ color: "#e5e7eb", fontWeight: 600, fontSize: "0.72rem", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {product.name}
        </p>
        <p style={{ color: "#f5a623", fontWeight: 700, fontSize: "0.72rem", margin: "1px 0 3px" }}>
          ${price}
        </p>
        <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
          {[1, 2, 3, 4, 5].map((s) => (
            <Star key={s} style={{ width: 9, height: 9, color: s <= rating ? "#facc15" : "#2a2f3e", fill: s <= rating ? "#facc15" : "none" }} />
          ))}
          <span style={{ color: "#6b7280", fontSize: "0.58rem", marginLeft: 2 }}>({product.review_count})</span>
        </div>
      </div>
    </Link>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function HomePage() {
  const [settings, viral, featured] = await Promise.all([
    getSiteSettings(),
    getViral(),
    getFeatured(),
  ]);
  const { hero_image_url, hero_image_alt } = settings;

  return (
    <>
      <WebsiteJsonLd />

      <style>{`
        .viral-card { transition: transform 0.2s ease; }
        .viral-card:hover { transform: translateY(-4px); }
        .viral-card:hover img { transform: scale(1.06); }
        .viral-card img { transition: transform 0.3s ease; }
      `}</style>

      <div style={{ background: "#0b0f14" }}>

        {/* ═══════════════════════════════════════════════════════════
            ONE-VIEWPORT SECTION: Hero (left) + Viral Products (right strip)
            overflow:hidden so nothing bleeds outside
        ════════════════════════════════════════════════════════════ */}
        <div style={{ height: "calc(100dvh - 64px)", display: "flex", flexDirection: "column", overflow: "hidden" }}>

          {/* ── HERO ───────────────────────────────────────────────── */}
          <section style={{ flex: 1, minHeight: 0, position: "relative", overflow: "hidden" }}>

            {/* Ambient glows */}
            <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 78% 45%, rgba(30,144,255,0.17) 0%, transparent 60%)", pointerEvents: "none" }} />
            <div style={{ position: "absolute", bottom: 0, right: "18%", width: "30%", height: "55%", background: "radial-gradient(ellipse at center bottom, rgba(245,166,35,0.07) 0%, transparent 65%)", pointerEvents: "none" }} />

            <div style={{ height: "100%", maxWidth: 1280, margin: "0 auto", padding: "0 2.5rem", display: "grid", gridTemplateColumns: "52% 48%", alignItems: "center" }}>

              {/* Left: text */}
              <div>
                <h1 style={{ fontSize: "clamp(2.4rem, 5vw, 3.8rem)", fontWeight: 900, lineHeight: 1, letterSpacing: "-0.02em", margin: 0 }}>
                  <span style={{ color: "#fff" }}>HEXA</span>
                  <span style={{ color: "#1e90ff" }}>SHOP</span>
                </h1>
                <p style={{ fontSize: "0.7rem", fontWeight: 600, letterSpacing: "0.4em", color: "#94a3b8", textTransform: "uppercase", marginTop: "0.6rem", marginBottom: "0.7rem" }}>
                  Style That Defines You
                </p>
                <p style={{ color: "#94a3b8", fontSize: "0.85rem", lineHeight: 1.65, marginBottom: "1.25rem", maxWidth: 400 }}>
                  Discover the latest trends in fashion.<br />
                  Premium quality. Best prices.
                </p>
                <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1.25rem" }}>
                  <Link href="/shop" style={{ background: "#f5a623", color: "#000", fontWeight: 700, fontSize: "0.78rem", letterSpacing: "0.08em", padding: "0.6rem 1.6rem", borderRadius: "0.45rem", textDecoration: "none" }}>
                    SHOP NOW
                  </Link>
                  <Link href="/shop?is_featured=true" style={{ border: "1.5px solid rgba(255,255,255,0.22)", color: "#fff", fontWeight: 600, fontSize: "0.78rem", letterSpacing: "0.06em", padding: "0.6rem 1.25rem", borderRadius: "0.45rem", textDecoration: "none", background: "transparent" }}>
                    EXPLORE COLLECTION
                  </Link>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                  <div style={{ width: 24, height: 5, borderRadius: 3, background: "#f5a623" }} />
                  <div style={{ width: 14, height: 5, borderRadius: 3, background: "#2a2f3e" }} />
                  <div style={{ width: 14, height: 5, borderRadius: 3, background: "#2a2f3e" }} />
                </div>
              </div>

              {/* Right: hero image + hex */}
              <div style={{ position: "relative", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg style={{ position: "absolute", zIndex: 1 }} width="340" height="392" viewBox="0 0 340 392" fill="none">
                  <defs>
                    <filter id="hg"><feGaussianBlur stdDeviation="3" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
                  </defs>
                  <polygon points="170,12 330,104 330,288 170,380 10,288 10,104" fill="none" stroke="#f5a623" strokeWidth="1.2" strokeDasharray="10 6" strokeOpacity="0.5" />
                  <polygon points="170,32 312,116 312,276 170,360 28,276 28,116" fill="rgba(30,144,255,0.04)" stroke="#1e90ff" strokeWidth="2" strokeOpacity="0.9" filter="url(#hg)" />
                </svg>

                {[{ top:"14%", right:"6%", s:7 }, { top:"34%", right:"1%", s:4 }, { top:"62%", right:"5%", s:5 }, { top:"18%", left:"12%", s:3 }, { top:"70%", left:"9%", s:4 }].map((d, i) => (
                  <div key={i} style={{ position:"absolute", zIndex:3, top:d.top, right:"right" in d ? d.right : undefined, left:"left" in d ? d.left : undefined, width:d.s, height:d.s, borderRadius:"50%", background:"#f5a623", boxShadow:`0 0 ${d.s*3}px ${d.s}px rgba(245,166,35,0.6)` }} />
                ))}

                <div style={{ position:"relative", zIndex:2, width:"100%", height:"100%", display:"flex", alignItems:"center", justifyContent:"center" }}>
                  {hero_image_url ? (
                    <Image src={hero_image_url} alt={hero_image_alt || "HEXASHOP"} width={300} height={360}
                      style={{ objectFit:"contain", maxHeight:"88%", filter:"drop-shadow(0 0 28px rgba(30,144,255,0.38)) drop-shadow(0 18px 40px rgba(0,0,0,0.7))" }}
                      priority unoptimized={hero_image_url.includes("localhost")} />
                  ) : (
                    <div style={{ textAlign:"center" }}>
                      <svg width="80" height="92" viewBox="0 0 80 92" fill="none">
                        <polygon points="40,3 77,23 77,69 40,89 3,69 3,23" fill="rgba(30,144,255,0.06)" stroke="rgba(30,144,255,0.3)" strokeWidth="1.5" />
                        <text x="40" y="56" textAnchor="middle" fill="rgba(245,166,35,0.4)" fontSize="30" fontWeight="900" fontFamily="Inter,sans-serif">H</text>
                      </svg>
                      <p style={{ color:"rgba(99,102,241,0.7)", fontSize:"0.72rem", marginTop:"0.5rem", fontWeight:500 }}>
                        Upload hero image<br /><span style={{ color:"#6b7280", fontSize:"0.65rem" }}>Admin → Hero Image</span>
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* ── VIRAL PRODUCTS (viewport strip — transparent cards) ─── */}
          <section style={{ flexShrink:0, padding:"0 2.5rem 1rem" }}>
            <div style={{ maxWidth:1280, margin:"0 auto" }}>

              {/* Header */}
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"0.65rem" }}>
                <div style={{ display:"flex", alignItems:"center", gap:"0.5rem" }}>
                  <Flame style={{ width:16, height:16, color:"#f97316", fill:"#f97316" }} />
                  <h2 style={{ color:"#fff", fontWeight:800, fontSize:"0.88rem", letterSpacing:"0.12em", textTransform:"uppercase", margin:0 }}>
                    Most Viral
                  </h2>
                </div>
                <Link href="/shop?ordering=-sold_count" style={{ border:"1.5px solid rgba(255,255,255,0.2)", color:"#fff", fontWeight:700, fontSize:"0.65rem", letterSpacing:"0.07em", padding:"0.32rem 0.85rem", borderRadius:"0.4rem", textDecoration:"none" }}>
                  VIEW ALL
                </Link>
              </div>

              {/* 5 transparent cards — no background box */}
              <div style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:"0.85rem" }}>
                {viral.slice(0, 5).map((p, i) => (
                  <InlineCard key={p.id} product={p} priority={i < 5} />
                ))}
                {viral.length === 0 && [1,2,3,4,5].map(i => (
                  <div key={i} style={{ aspectRatio:"3/4", borderRadius:"0.75rem", background:"#141929", opacity:0.4 }} />
                ))}
              </div>
            </div>
          </section>
        </div>

        {/* ═══════════════════════════════════════════════════════════
            SCROLL SECTION: Featured Products — transparent multi-row grid
        ════════════════════════════════════════════════════════════ */}
        <section style={{ padding: "2rem 2.5rem 4rem" }}>
          <div style={{ maxWidth: 1280, margin: "0 auto" }}>

            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.3rem" }}>
                  <Star style={{ width: 14, height: 14, color: "#f5a623", fill: "#f5a623" }} />
                  <span style={{ fontSize: "0.68rem", fontWeight: 700, color: "#f5a623", textTransform: "uppercase", letterSpacing: "0.12em" }}>
                    Handpicked for you
                  </span>
                </div>
                <h2 style={{ color: "#fff", fontWeight: 800, fontSize: "1.4rem", margin: 0 }}>Featured Products</h2>
              </div>
              <Link href="/shop?is_featured=true" style={{ border: "1.5px solid rgba(255,255,255,0.2)", color: "#fff", fontWeight: 700, fontSize: "0.68rem", letterSpacing: "0.07em", padding: "0.38rem 1rem", borderRadius: "0.4rem", textDecoration: "none", display: "flex", alignItems: "center", gap: "0.25rem" }}>
                View All <ChevronRight style={{ width: 12, height: 12 }} />
              </Link>
            </div>

            {/* Multi-row transparent grid — same style as viral, no card boxes */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "1.25rem" }}>
              {featured.length > 0
                ? featured.map((p, i) => <InlineCard key={p.id} product={p} priority={i < 5} />)
                : [1,2,3,4,5,6,7,8,9,10].map(i => (
                    <div key={i} style={{ aspectRatio: "4/3", borderRadius: "0.625rem", background: "#141929", opacity: 0.4 }} />
                  ))
              }
            </div>
          </div>
        </section>

      </div>
    </>
  );
}
