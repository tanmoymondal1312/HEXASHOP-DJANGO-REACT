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
