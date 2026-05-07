import Image from "next/image";
import Link from "next/link";
import { Heart, Star } from "lucide-react";
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

async function getFeatured(): Promise<Product[]> {
  try {
    const { data } = await productsApi.featured();
    return (data ?? []).slice(0, 4);
  } catch {
    return [];
  }
}

// ─── Product card ─────────────────────────────────────────────────────────────

function FeaturedCard({ product, priority }: { product: Product; priority?: boolean }) {
  const src = resolveImageUrl(product.primary_image ?? null);
  const price = parseFloat(product.base_price).toFixed(2);
  const rating = Math.min(5, Math.round(parseFloat(product.avg_rating)));

  return (
    <Link href={`/products/${product.slug}`} className="featured-card"
      style={{ display: "block", background: "#141929", borderRadius: "0.875rem", overflow: "hidden", textDecoration: "none" }}
    >
      {/* Image */}
      <div style={{ position: "relative", aspectRatio: "16/9", background: "#0d1117", overflow: "hidden" }}>
        {src ? (
          <Image src={src} alt={product.name} fill sizes="300px"
            style={{ objectFit: "cover" }}
            priority={priority}
            unoptimized={src.includes("localhost") || src.startsWith("/media")}
          />
        ) : (
          <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
        {/* Heart */}
        <span style={{
          position: "absolute", top: 8, right: 8,
          width: 28, height: 28, borderRadius: "50%",
          border: "1.5px solid rgba(255,255,255,0.3)",
          background: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <Heart style={{ width: 13, height: 13, color: "#fff" }} />
        </span>
      </div>

      {/* Info */}
      <div style={{ padding: "8px 10px 10px" }}>
        <p style={{ color: "#fff", fontWeight: 600, fontSize: "0.8rem", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {product.name}
        </p>
        <p style={{ color: "#f5a623", fontWeight: 700, fontSize: "0.82rem", margin: "2px 0 4px" }}>
          ${price}
        </p>
        <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
          {[1, 2, 3, 4, 5].map((s) => (
            <Star key={s} style={{ width: 11, height: 11, color: s <= rating ? "#facc15" : "#374151", fill: s <= rating ? "#facc15" : "none" }} />
          ))}
          <span style={{ color: "#6b7280", fontSize: "0.65rem", marginLeft: 2 }}>({product.review_count})</span>
        </div>
      </div>
    </Link>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function HomePage() {
  const [settings, featured] = await Promise.all([getSiteSettings(), getFeatured()]);
  const { hero_image_url, hero_image_alt } = settings;

  return (
    <>
      <WebsiteJsonLd />

      <style>{`
        .featured-card { transition: transform 0.2s ease, box-shadow 0.2s ease; }
        .featured-card:hover { transform: translateY(-3px); box-shadow: 0 8px 24px rgba(0,0,0,0.55); }
        .featured-card:hover img { transform: scale(1.06); }
        .featured-card img { transition: transform 0.3s ease; }
      `}</style>

      {/* Full-viewport container — hero grows, products stay compact at bottom */}
      <div style={{ height: "calc(100dvh - 64px)", display: "flex", flexDirection: "column", background: "#0b0f14", overflow: "hidden" }}>

        {/* ── HERO ──────────────────────────────────────────────────── */}
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
                <Link href="/shop" style={{ background: "#f5a623", color: "#000", fontWeight: 700, fontSize: "0.78rem", letterSpacing: "0.08em", padding: "0.6rem 1.6rem", borderRadius: "0.45rem", textDecoration: "none", whiteSpace: "nowrap" }}>
                  SHOP NOW
                </Link>
                <Link href="/shop?is_featured=true" style={{ border: "1.5px solid rgba(255,255,255,0.22)", color: "#fff", fontWeight: 600, fontSize: "0.78rem", letterSpacing: "0.06em", padding: "0.6rem 1.25rem", borderRadius: "0.45rem", textDecoration: "none", background: "transparent", whiteSpace: "nowrap" }}>
                  EXPLORE COLLECTION
                </Link>
              </div>

              {/* Slider dots */}
              <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                <div style={{ width: 24, height: 5, borderRadius: 3, background: "#f5a623" }} />
                <div style={{ width: 14, height: 5, borderRadius: 3, background: "#2a2f3e" }} />
                <div style={{ width: 14, height: 5, borderRadius: 3, background: "#2a2f3e" }} />
              </div>
            </div>

            {/* Right: hero image + hex */}
            <div style={{ position: "relative", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>

              {/* Hexagon SVG — scaled down to fit */}
              <svg style={{ position: "absolute", zIndex: 1 }} width="340" height="392" viewBox="0 0 340 392" fill="none">
                <defs>
                  <filter id="hg">
                    <feGaussianBlur stdDeviation="3" result="b" />
                    <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
                  </filter>
                </defs>
                {/* Outer dashed gold */}
                <polygon points="170,12 330,104 330,288 170,380 10,288 10,104"
                  fill="none" stroke="#f5a623" strokeWidth="1.2" strokeDasharray="10 6" strokeOpacity="0.5" />
                {/* Inner blue glowing */}
                <polygon points="170,32 312,116 312,276 170,360 28,276 28,116"
                  fill="rgba(30,144,255,0.04)" stroke="#1e90ff" strokeWidth="2" strokeOpacity="0.9" filter="url(#hg)" />
              </svg>

              {/* Gold sparkle dots */}
              {[
                { top: "14%", right: "6%",  s: 7  },
                { top: "34%", right: "1%",  s: 4  },
                { top: "62%", right: "5%",  s: 5  },
                { top: "18%", left: "12%",  s: 3  },
                { top: "70%", left: "9%",   s: 4  },
              ].map((d, i) => (
                <div key={i} style={{
                  position: "absolute", zIndex: 3,
                  top: d.top,
                  right: "right" in d ? d.right : undefined,
                  left:  "left"  in d ? d.left  : undefined,
                  width: d.s, height: d.s, borderRadius: "50%",
                  background: "#f5a623",
                  boxShadow: `0 0 ${d.s * 3}px ${d.s}px rgba(245,166,35,0.6)`,
                }} />
              ))}

              {/* Hero image */}
              <div style={{ position: "relative", zIndex: 2, width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                {hero_image_url ? (
                  <Image
                    src={hero_image_url}
                    alt={hero_image_alt || "HEXASHOP"}
                    width={300}
                    height={360}
                    style={{ objectFit: "contain", maxHeight: "88%", filter: "drop-shadow(0 0 28px rgba(30,144,255,0.38)) drop-shadow(0 18px 40px rgba(0,0,0,0.7))" }}
                    priority
                    unoptimized={hero_image_url.includes("localhost")}
                  />
                ) : (
                  <div style={{ textAlign: "center" }}>
                    <svg width="80" height="92" viewBox="0 0 80 92" fill="none">
                      <polygon points="40,3 77,23 77,69 40,89 3,69 3,23" fill="rgba(30,144,255,0.06)" stroke="rgba(30,144,255,0.3)" strokeWidth="1.5" />
                      <text x="40" y="56" textAnchor="middle" fill="rgba(245,166,35,0.4)" fontSize="30" fontWeight="900" fontFamily="Inter,sans-serif">H</text>
                    </svg>
                    <p style={{ color: "rgba(99,102,241,0.7)", fontSize: "0.72rem", marginTop: "0.5rem", fontWeight: 500 }}>
                      Upload hero image<br />
                      <span style={{ color: "#6b7280", fontSize: "0.65rem" }}>Admin → Hero Image</span>
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ── FEATURED PRODUCTS ──────────────────────────────────────── */}
        <section style={{ flexShrink: 0, padding: "0 2.5rem 1rem", background: "#0b0f14" }}>
          <div style={{ maxWidth: 1280, margin: "0 auto" }}>

            {/* Header row */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.7rem" }}>
              <h2 style={{ color: "#fff", fontWeight: 800, fontSize: "0.9rem", letterSpacing: "0.14em", textTransform: "uppercase", margin: 0 }}>
                Featured Products
              </h2>
              <Link href="/shop?is_featured=true" style={{ border: "1.5px solid rgba(255,255,255,0.2)", color: "#fff", fontWeight: 700, fontSize: "0.68rem", letterSpacing: "0.07em", padding: "0.35rem 1rem", borderRadius: "0.4rem", textDecoration: "none", whiteSpace: "nowrap" }}>
                VIEW ALL
              </Link>
            </div>

            {/* 4-column grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "0.85rem" }}>
              {featured.slice(0, 4).map((p, i) => (
                <FeaturedCard key={p.id} product={p} priority={i < 4} />
              ))}
              {featured.length === 0 && [1, 2, 3, 4].map((i) => (
                <div key={i} style={{ background: "#141929", borderRadius: "0.875rem", aspectRatio: "16/9" }} />
              ))}
            </div>
          </div>
        </section>

      </div>
    </>
  );
}
