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

// ─── Inline product card (exact match to screenshot) ─────────────────────────

function FeaturedCard({ product, priority }: { product: Product; priority?: boolean }) {
  const raw = product.primary_image ?? null;
  const src = resolveImageUrl(raw);
  const price = parseFloat(product.base_price).toFixed(2);
  const rating = Math.min(5, Math.round(parseFloat(product.avg_rating)));

  return (
    <Link
      href={`/products/${product.slug}`}
      className="featured-card"
      style={{
        display: "block",
        background: "#141929",
        borderRadius: "1rem",
        overflow: "hidden",
        textDecoration: "none",
      }}
    >
      {/* Image */}
      <div style={{ position: "relative", aspectRatio: "4/3", background: "#0d1117", overflow: "hidden" }}>
        {src ? (
          <Image
            src={src}
            alt={product.name}
            fill
            sizes="300px"
            style={{ objectFit: "cover", transition: "transform 0.3s" }}
            priority={priority}
            unoptimized={src.includes("localhost") || src.startsWith("/media")}
          />
        ) : (
          <div style={{ width: "100%", height: "100%", background: "#1a1f2e", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
        {/* Heart */}
        {/* Heart icon — Link click navigates to product; no JS handler needed here */}
        <span
          style={{
            position: "absolute", top: 10, right: 10,
            width: 32, height: 32, borderRadius: "50%",
            border: "1.5px solid rgba(255,255,255,0.3)",
            background: "rgba(0,0,0,0.4)",
            backdropFilter: "blur(4px)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          <Heart style={{ width: 15, height: 15, color: "#fff" }} />
        </span>
      </div>

      {/* Info */}
      <div style={{ padding: "10px 12px 12px" }}>
        <p style={{ color: "#fff", fontWeight: 600, fontSize: "0.875rem", margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {product.name}
        </p>
        <p style={{ color: "#f5a623", fontWeight: 700, fontSize: "0.9rem", margin: "3px 0 4px" }}>
          ${price}
        </p>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          {[1, 2, 3, 4, 5].map((s) => (
            <Star
              key={s}
              style={{
                width: 12, height: 12,
                color: s <= rating ? "#facc15" : "#374151",
                fill: s <= rating ? "#facc15" : "none",
              }}
            />
          ))}
          <span style={{ color: "#6b7280", fontSize: "0.7rem", marginLeft: 2 }}>
            ({product.review_count})
          </span>
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

      {/* Hover styles — pure CSS, no JS event handlers needed in server component */}
      <style>{`
        .featured-card { transition: transform 0.2s ease, box-shadow 0.2s ease; }
        .featured-card:hover { transform: translateY(-4px); box-shadow: 0 12px 32px rgba(0,0,0,0.5); }
        .featured-card:hover img { transform: scale(1.05); }
        .featured-card img { transition: transform 0.3s ease; }
      `}</style>

      {/*
        Outer container: fills exactly the viewport below the sticky navbar.
        Flex-column so hero grows freely and products stay compact at the bottom.
        overflow-hidden prevents any accidental scroll.
      */}
      <div
        style={{
          height: "calc(100dvh - 64px)",
          display: "flex",
          flexDirection: "column",
          background: "#0b0f14",
          overflow: "hidden",
        }}
      >
        {/* ── HERO ──────────────────────────────────────────────────────── */}
        <section style={{ flex: 1, minHeight: 0, position: "relative", overflow: "hidden" }}>

          {/* Ambient blue glow (right) */}
          <div style={{
            position: "absolute", top: 0, right: 0, width: "55%", height: "100%",
            background: "radial-gradient(ellipse at 75% 45%, rgba(30,144,255,0.18) 0%, transparent 65%)",
            pointerEvents: "none",
          }} />
          {/* Ambient gold hint (bottom-right) */}
          <div style={{
            position: "absolute", bottom: 0, right: "15%", width: "35%", height: "60%",
            background: "radial-gradient(ellipse at center bottom, rgba(245,166,35,0.07) 0%, transparent 65%)",
            pointerEvents: "none",
          }} />

          <div style={{
            height: "100%",
            maxWidth: 1280,
            margin: "0 auto",
            padding: "0 2.5rem",
            display: "grid",
            gridTemplateColumns: "52% 48%",
            alignItems: "center",
          }}>
            {/* ── Left column ─────────────────────────────────────────── */}
            <div>
              {/* Main heading */}
              <h1 style={{
                fontSize: "clamp(3.8rem, 7vw, 5.8rem)",
                fontWeight: 900,
                lineHeight: 1,
                letterSpacing: "-0.02em",
                margin: 0,
              }}>
                <span style={{ color: "#fff" }}>HEXA</span>
                <span style={{ color: "#1e90ff" }}>SHOP</span>
              </h1>

              {/* Subheading */}
              <p style={{
                fontSize: "0.8rem",
                fontWeight: 600,
                letterSpacing: "0.45em",
                color: "#94a3b8",
                textTransform: "uppercase",
                marginTop: "0.875rem",
                marginBottom: "1.1rem",
              }}>
                Style That Defines You
              </p>

              {/* Description */}
              <p style={{
                color: "#94a3b8",
                fontSize: "0.95rem",
                lineHeight: 1.7,
                marginBottom: "2rem",
                maxWidth: 420,
              }}>
                Discover the latest trends in fashion.<br />
                Premium quality. Best prices.
              </p>

              {/* Buttons */}
              <div style={{ display: "flex", gap: "1rem", marginBottom: "2rem" }}>
                <Link
                  href="/shop"
                  style={{
                    background: "#f5a623",
                    color: "#000",
                    fontWeight: 700,
                    fontSize: "0.82rem",
                    letterSpacing: "0.08em",
                    padding: "0.75rem 2rem",
                    borderRadius: "0.5rem",
                    textDecoration: "none",
                    whiteSpace: "nowrap",
                  }}
                >
                  SHOP NOW
                </Link>
                <Link
                  href="/shop?is_featured=true"
                  style={{
                    border: "1.5px solid rgba(255,255,255,0.25)",
                    color: "#fff",
                    fontWeight: 600,
                    fontSize: "0.82rem",
                    letterSpacing: "0.06em",
                    padding: "0.75rem 1.5rem",
                    borderRadius: "0.5rem",
                    textDecoration: "none",
                    background: "transparent",
                    whiteSpace: "nowrap",
                  }}
                >
                  EXPLORE COLLECTION
                </Link>
              </div>

              {/* Slider dots */}
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <div style={{ width: 28, height: 6, borderRadius: 3, background: "#f5a623" }} />
                <div style={{ width: 18, height: 6, borderRadius: 3, background: "#2a2f3e" }} />
                <div style={{ width: 18, height: 6, borderRadius: 3, background: "#2a2f3e" }} />
              </div>
            </div>

            {/* ── Right column: hero image + hex decoration ──────────── */}
            <div style={{ position: "relative", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>

              {/* Blue hexagon glow */}
              <svg
                style={{ position: "absolute", zIndex: 1 }}
                width="440" height="510" viewBox="0 0 440 510" fill="none"
              >
                <defs>
                  <filter id="hexglow">
                    <feGaussianBlur stdDeviation="4" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>
                {/* Outer dashed gold */}
                <polygon
                  points="220,16 428,128 428,382 220,494 12,382 12,128"
                  fill="none"
                  stroke="#f5a623"
                  strokeWidth="1.2"
                  strokeDasharray="11 7"
                  strokeOpacity="0.5"
                />
                {/* Inner solid blue — glowing */}
                <polygon
                  points="220,42 406,148 406,362 220,468 34,362 34,148"
                  fill="rgba(30,144,255,0.04)"
                  stroke="#1e90ff"
                  strokeWidth="2"
                  strokeOpacity="0.9"
                  filter="url(#hexglow)"
                />
              </svg>

              {/* Gold sparkle particles */}
              {[
                { top: "13%", right: "8%",  s: 8 },
                { top: "32%", right: "2%",  s: 5 },
                { top: "60%", right: "5%",  s: 6 },
                { top: "48%", right: "0%",  s: 3 },
                { top: "18%", left: "10%",  s: 4 },
                { top: "72%", left: "8%",   s: 4 },
              ].map((d, i) => (
                <div
                  key={i}
                  style={{
                    position: "absolute", zIndex: 3,
                    top: d.top, right: "right" in d ? d.right : undefined,
                    left: "left" in d ? d.left : undefined,
                    width: d.s, height: d.s,
                    borderRadius: "50%",
                    background: "#f5a623",
                    boxShadow: `0 0 ${d.s * 3}px ${d.s}px rgba(245,166,35,0.65)`,
                  }}
                />
              ))}

              {/* Hero image (uploaded from panel) */}
              <div style={{ position: "relative", zIndex: 2, width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                {hero_image_url ? (
                  <Image
                    src={hero_image_url}
                    alt={hero_image_alt || "HEXASHOP featured product"}
                    width={380}
                    height={460}
                    style={{
                      objectFit: "contain",
                      maxHeight: "90%",
                      filter: "drop-shadow(0 0 32px rgba(30,144,255,0.4)) drop-shadow(0 24px 48px rgba(0,0,0,0.7))",
                    }}
                    priority
                    unoptimized={hero_image_url.includes("localhost")}
                  />
                ) : (
                  /* Placeholder when no hero image uploaded */
                  <div style={{ textAlign: "center" }}>
                    <svg width="100" height="115" viewBox="0 0 100 115" fill="none">
                      <polygon points="50,4 96,29 96,86 50,111 4,86 4,29" fill="rgba(30,144,255,0.06)" stroke="rgba(30,144,255,0.35)" strokeWidth="2" />
                      <text x="50" y="68" textAnchor="middle" fill="rgba(245,166,35,0.45)" fontSize="38" fontWeight="900" fontFamily="Inter, sans-serif">H</text>
                    </svg>
                    <p style={{ color: "rgba(99,102,241,0.7)", fontSize: "0.8rem", marginTop: "0.75rem", fontWeight: 500 }}>
                      Upload hero image<br />
                      <span style={{ color: "#6b7280", fontSize: "0.7rem" }}>Admin → Hero Image</span>
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ── FEATURED PRODUCTS ─────────────────────────────────────── */}
        <section
          style={{
            flexShrink: 0,
            padding: "0 2.5rem 1.25rem",
            background: "#0b0f14",
          }}
        >
          <div style={{ maxWidth: 1280, margin: "0 auto" }}>
            {/* Section header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.875rem" }}>
              <h2 style={{
                color: "#fff",
                fontWeight: 800,
                fontSize: "1rem",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                margin: 0,
              }}>
                Featured Products
              </h2>
              <Link
                href="/shop?is_featured=true"
                style={{
                  border: "1.5px solid rgba(255,255,255,0.22)",
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: "0.72rem",
                  letterSpacing: "0.07em",
                  padding: "0.4rem 1.1rem",
                  borderRadius: "0.4rem",
                  textDecoration: "none",
                  whiteSpace: "nowrap",
                }}
              >
                VIEW ALL
              </Link>
            </div>

            {/* 4-column product grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem" }}>
              {featured.slice(0, 4).map((p, i) => (
                <FeaturedCard key={p.id} product={p} priority={i < 4} />
              ))}
              {/* Skeleton placeholders if no products yet */}
              {featured.length === 0 &&
                [1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    style={{
                      background: "#141929",
                      borderRadius: "1rem",
                      aspectRatio: "4/3",
                      animation: "pulse 1.5s ease-in-out infinite",
                    }}
                  />
                ))}
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
