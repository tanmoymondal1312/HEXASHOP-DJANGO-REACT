import Link from "next/link";
import { useId } from "react";
import type { HeroDocument } from "@/types/hero";
import TiptapRenderer from "./TiptapRenderer";

/* Sparkle positions (shared across slides) */
const SPARKLES = [
  { top: "14%", right: "6%", s: 7, d: 0 },
  { top: "34%", right: "1%", s: 4, d: 400 },
  { top: "62%", right: "5%", s: 5, d: 800 },
  { top: "18%", left: "12%", s: 3, d: 1200 },
  { top: "70%", left: "9%", s: 4, d: 1600 },
] as const;

interface Props {
  document: HeroDocument;
  /** Used when the slide's own image is null (e.g. slide 1 → admin hero image). */
  fallbackImageUrl?: string | null;
  /** Replay the staggered entrance animation (storefront active slide). */
  animate?: boolean;
}

/**
 * Renders ONE complete hero slide from its JSON document: background, hexagon,
 * sparkles, image, badge, title (Tiptap), subtitle, description, promo (Tiptap)
 * and buttons. Self-contained so the SAME component powers the storefront slider
 * and the studio live preview — guaranteeing preview == production.
 */
export default function HeroSlideView({ document: doc, fallbackImageUrl, animate }: Props) {
  const uid = useId().replace(/:/g, "");
  const bg = doc.background;
  const imgUrl = doc.image?.url || fallbackImageUrl || null;
  const a = (n: number) => (animate ? `sl-${n}` : "");

  return (
    <div className="hx-slide-view">
      {/* Background layers */}
      <div
        className="hx-slide-bg"
        style={{
          background: `radial-gradient(ellipse at 75% 50%, ${bg.color} 0%, #090d12 60%)`,
          opacity: bg.opacity ?? 1,
        }}
      />
      <div
        className="hx-slide-ambient"
        style={{
          background: `radial-gradient(ellipse at 76% 44%, ${bg.starColor}22 0%, transparent 58%)`,
        }}
      />

      {/* Grid: text | image */}
      <div className="hx-hero-inner">
        {/* ── LEFT — text ── */}
        <div className="hx-hero-text-col">
          <div>
            {doc.badge?.enabled && doc.badge.text && (
              <div
                className={`hx-badge-dyn ${a(0)}`}
                style={{
                  background: doc.badge.bgColor,
                  color: doc.badge.textColor,
                  borderRadius: doc.badge.borderRadius,
                  fontSize: `${doc.badge.fontSize}rem`,
                  padding: `${doc.badge.paddingY}px ${doc.badge.paddingX}px`,
                }}
              >
                {doc.badge.text}
              </div>
            )}

            <h1 className={`hx-h1 ${a(1)}`} style={{ lineHeight: 1.05 }}>
              <TiptapRenderer doc={doc.title} />
            </h1>

            {doc.subtitle?.text && (
              <p className={`hx-sub ${a(2)}`} style={{ color: doc.subtitle.color }}>
                {doc.subtitle.text}
              </p>
            )}

            {doc.description?.text && (
              <p
                className={`hx-desc ${a(3)}`}
                style={{ color: doc.description.color, whiteSpace: "pre-line" }}
              >
                {doc.description.text}
              </p>
            )}

            {doc.promo && (
              <div className={`hx-promo ${a(4)}`}>
                <TiptapRenderer doc={doc.promo} />
              </div>
            )}

            {doc.buttons?.length > 0 && (
              <div className={`hx-btns ${a(4)}`}>
                {doc.buttons.map((b) => (
                  <Link
                    key={b.id}
                    href={b.link || "#"}
                    className="hx-btn-dyn"
                    style={{
                      background: b.style.bg,
                      color: b.style.color,
                      border: `1.5px solid ${b.style.borderColor}`,
                      borderRadius: b.style.borderRadius,
                      fontSize: `${b.style.fontSize}rem`,
                      fontWeight: b.style.fontWeight,
                      padding: `${b.style.paddingY}px ${b.style.paddingX}px`,
                      boxShadow: b.style.shadow === "none" ? "none" : b.style.shadow,
                      width: b.style.width && b.style.width !== "auto" ? b.style.width : undefined,
                      height: b.style.height && b.style.height !== "auto" ? b.style.height : undefined,
                      // Per-button hover via CSS vars (SSR-safe, no JS state)
                      "--h-op": b.style.hover?.opacity ?? 0.88,
                      "--h-ty": `${b.style.hover?.translateY ?? -1}px`,
                    } as React.CSSProperties}
                  >
                    {b.text}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── RIGHT — image ── */}
        <div className="hx-hero-img-col hidden md:flex items-center justify-center relative">
          {/* Hexagon frame — stroke colour from background.hexColor */}
          <svg
            style={{ position: "absolute", zIndex: 1 }}
            width="340"
            height="392"
            viewBox="0 0 340 392"
            fill="none"
          >
            <defs>
              <filter id={`hgx-${uid}`}>
                <feGaussianBlur stdDeviation="3" result="b" />
                <feMerge>
                  <feMergeNode in="b" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            <polygon
              points="170,12 330,104 330,288 170,380 10,288 10,104"
              fill="none"
              stroke={bg.hexColor}
              strokeWidth="1.2"
              strokeDasharray="10 6"
              strokeOpacity="0.5"
            />
            <polygon
              points="170,32 312,116 312,276 170,360 28,276 28,116"
              fill={`${bg.hexColor}0d`}
              stroke={bg.hexColor}
              strokeWidth="2"
              strokeOpacity="0.9"
              filter={`url(#hgx-${uid})`}
            />
          </svg>

          {/* Sparkles — colour from background.starColor */}
          {SPARKLES.map((dot, i) => (
            <div
              key={i}
              className="hx-sparkle"
              style={{
                position: "absolute",
                zIndex: 3,
                top: dot.top,
                right: "right" in dot ? dot.right : undefined,
                left: "left" in dot ? dot.left : undefined,
                width: dot.s,
                height: dot.s,
                borderRadius: "50%",
                background: bg.starColor,
                boxShadow: `0 0 ${dot.s * 3}px ${dot.s}px ${bg.starColor}a6`,
                animationDelay: `${dot.d}ms`,
              }}
            />
          ))}

          <div
            className="hx-float"
            style={{
              position: "relative",
              zIndex: 2,
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {imgUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={imgUrl}
                alt={doc.image?.alt || ""}
                className={a(1) ? "sl-img" : ""}
                style={{
                  objectFit: "contain",
                  maxHeight: "88%",
                  width: "100%",
                  maxWidth: 320,
                  filter: `drop-shadow(0 0 28px ${bg.hexColor}6b) drop-shadow(0 18px 40px rgba(0,0,0,0.75))`,
                }}
              />
            ) : (
              <div style={{ textAlign: "center", animation: "hxFloat 4.2s ease-in-out infinite" }}>
                <svg width="80" height="92" viewBox="0 0 80 92" fill="none">
                  <polygon
                    points="40,3 77,23 77,69 40,89 3,69 3,23"
                    fill={`${bg.hexColor}10`}
                    stroke={`${bg.hexColor}4d`}
                    strokeWidth="1.5"
                  />
                  <text
                    x="40"
                    y="56"
                    textAnchor="middle"
                    fill={`${bg.starColor}66`}
                    fontSize="30"
                    fontWeight="900"
                    fontFamily="Inter,sans-serif"
                  >
                    H
                  </text>
                </svg>
                <p style={{ color: "#6b7280", fontSize: "0.72rem", marginTop: "0.5rem" }}>
                  No image
                </p>
              </div>
            )}
          </div>

          {/* bottom fade */}
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: "50%",
              background:
                "linear-gradient(to bottom, transparent 0%, rgba(9,13,18,0.55) 55%, #090d12 100%)",
              zIndex: 6,
              pointerEvents: "none",
            }}
          />
        </div>
      </div>
    </div>
  );
}
