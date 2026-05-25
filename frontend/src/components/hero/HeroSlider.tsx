"use client";

import "./hero-slider.css";
import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { HeroSlide as ApiSlide } from "@/types";

// ─── Internal slide shape ─────────────────────────────────────────────────────

interface Slide {
  id: number;
  badge: string;
  heading: string;
  headingAccent: string;
  subtitle: string;
  description: string;
  ctaPrimary: { label: string; href: string };
  ctaSecondary: { label: string; href: string };
  accentColor: string;
  glowColor: string;
  imageUrl: string | null;
}

// ─── Fallback slides (used when no slides are in the DB) ──────────────────────

const FALLBACK_SLIDES: Slide[] = [
  {
    id: -1,
    badge: "New Arrivals 2025",
    heading: "HEXA",
    headingAccent: "SHOP",
    subtitle: "Style That Defines You",
    description: "Discover the latest trends in fashion.\nPremium quality. Best prices.",
    ctaPrimary:   { label: "SHOP NOW",           href: "/shop" },
    ctaSecondary: { label: "EXPLORE COLLECTION", href: "/shop?is_featured=true" },
    accentColor: "#1e90ff",
    glowColor:   "rgba(30,144,255,0.22)",
    imageUrl: null,
  },
  {
    id: -2,
    badge: "Featured Picks",
    heading: "FASHION",
    headingAccent: "FORWARD",
    subtitle: "Curated For You",
    description: "Hand-picked styles for every occasion.\nElegance meets affordability.",
    ctaPrimary:   { label: "VIEW FEATURED", href: "/shop?is_featured=true" },
    ctaSecondary: { label: "ALL PRODUCTS",  href: "/shop" },
    accentColor: "#f5a623",
    glowColor:   "rgba(245,166,35,0.20)",
    imageUrl: null,
  },
  {
    id: -3,
    badge: "Trending Now",
    heading: "TOP",
    headingAccent: "TRENDS",
    subtitle: "Be Ahead of the Curve",
    description: "Shop what's trending right now.\nFresh drops updated daily.",
    ctaPrimary:   { label: "SHOP TRENDING", href: "/shop?ordering=-sold_count" },
    ctaSecondary: { label: "EXPLORE ALL",   href: "/shop" },
    accentColor: "#a855f7",
    glowColor:   "rgba(168,85,247,0.18)",
    imageUrl: null,
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Convert a hex colour (#rrggbb) into rgba(r,g,b,alpha) string */
function hexToGlow(hex: string, alpha = 0.22): string {
  const clean = hex.replace("#", "");
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  if (isNaN(r) || isNaN(g) || isNaN(b)) return `rgba(30,144,255,${alpha})`;
  return `rgba(${r},${g},${b},${alpha})`;
}

/** Map an API slide to the internal Slide shape */
function fromApi(s: ApiSlide, fallbackImageUrl: string | null): Slide {
  const accent = s.accent_color || "#1e90ff";
  return {
    id:           s.id,
    badge:        s.badge_text || "",
    heading:      s.title || "HEXASHOP",
    headingAccent: s.heading_accent || "",
    subtitle:     s.subtitle || "",
    description:  s.description || "",
    ctaPrimary:   { label: s.cta_text || "SHOP NOW", href: s.cta_url || "/shop" },
    ctaSecondary: {
      label: s.secondary_cta_text || "EXPLORE",
      href:  s.secondary_cta_url  || "/shop",
    },
    accentColor: accent,
    glowColor:   hexToGlow(accent),
    imageUrl:    s.image_url || fallbackImageUrl,
  };
}

const AUTOPLAY_MS = 5000;

// ─── Component ─────────────────────────────────────────────────────────────────

interface HeroSliderProps {
  heroImageUrl: string | null;
  heroImageAlt?: string;
  /** Slides fetched from the API (may be empty — falls back to FALLBACK_SLIDES) */
  apiSlides?: ApiSlide[];
}

export default function HeroSlider({
  heroImageUrl,
  heroImageAlt = "HEXASHOP",
  apiSlides = [],
}: HeroSliderProps) {

  // Build the slides array: use API slides when available, otherwise fall back.
  // Each API slide's image is the slide's own image; if none, use the hero_image.
  const SLIDES = useMemo<Slide[]>(() => {
    if (apiSlides.length > 0) {
      return apiSlides.map((s) => fromApi(s, heroImageUrl));
    }
    // Fallback: inject the hero_image into every fallback slide
    return FALLBACK_SLIDES.map((s) => ({ ...s, imageUrl: heroImageUrl }));
  }, [apiSlides, heroImageUrl]);

  const [current, setCurrent] = useState(0);
  const [animDir, setAnimDir] = useState<"left" | "right">("right");
  const [paused, setPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Reset to slide 0 if SLIDES length changes (e.g. hydration)
  useEffect(() => {
    setCurrent(0);
  }, [SLIDES.length]);

  const goTo = useCallback((idx: number, dir: "left" | "right" = "right") => {
    setAnimDir(dir);
    setCurrent(idx);
  }, []);

  const prev = useCallback(() => {
    goTo((current - 1 + SLIDES.length) % SLIDES.length, "left");
  }, [current, goTo, SLIDES.length]);

  const next = useCallback(() => {
    goTo((current + 1) % SLIDES.length, "right");
  }, [current, goTo, SLIDES.length]);

  // Auto-play
  useEffect(() => {
    if (paused || SLIDES.length <= 1) return;
    timerRef.current = setTimeout(next, AUTOPLAY_MS);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [current, paused, next, SLIDES.length]);

  const slide = SLIDES[current] ?? SLIDES[0];

  return (
    <section
        className="hx-hero"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        aria-roledescription="carousel"
        aria-label="Hero promotional slides"
      >
        {/* Ambient background glows — transition with slide */}
        <div style={{
          position:"absolute", inset:0,
          background:`radial-gradient(ellipse at 76% 44%, ${slide.glowColor} 0%, transparent 58%)`,
          pointerEvents:"none", transition:"background 0.7s ease",
        }} />
        <div style={{ position:"absolute", bottom:0, right:"20%", width:"28%", height:"50%",
          background:"radial-gradient(ellipse at center bottom, rgba(245,166,35,0.08) 0%, transparent 65%)",
          pointerEvents:"none" }} />
        {/* Bottom fade */}
        <div style={{ position:"absolute", bottom:0, left:0, right:0, height:140,
          background:"linear-gradient(to bottom,transparent 0%,rgba(9,13,18,0.7) 50%,#090d12 100%)",
          zIndex:10, pointerEvents:"none" }} />

        {/* Progress bar */}
        <div
          key={`pb-${current}`}
          className="hx-progress hx-progress-run"
          style={{ animationDuration: `${AUTOPLAY_MS}ms`, animationPlayState: paused ? "paused" : "running" }}
        />

        {/* Nav arrows */}
        <button className="hx-nav-btn hx-nav-prev" onClick={prev} aria-label="Previous slide">
          <ChevronLeft size={18} />
        </button>
        <button className="hx-nav-btn hx-nav-next" onClick={next} aria-label="Next slide">
          <ChevronRight size={18} />
        </button>

        {/* Main grid */}
        <div key={current} className={`hx-hero-inner hx-dir-${animDir}`}>

          {/* Left: text */}
          <div className="hx-slide-content">

            {/* Badge */}
            {slide.badge && (
              <div className="hx-badge hx-s1" style={{ color: slide.accentColor, borderColor: slide.accentColor + "55", backgroundColor: slide.accentColor + "14" }}>
                <span style={{ width:6, height:6, borderRadius:"50%", background:slide.accentColor, display:"inline-block", flexShrink:0, boxShadow:`0 0 6px 2px ${slide.accentColor}88` }} />
                {slide.badge}
              </div>
            )}

            <h1 className="hx-h1 hx-s2">
              <span style={{ color:"#fff" }}>{slide.heading}</span>
              <span style={{ color: slide.accentColor }}>{slide.headingAccent}</span>
            </h1>

            <p className="hx-sub hx-s3">{slide.subtitle}</p>

            <p className="hx-desc hx-s4">{slide.description}</p>

            <div className="hx-btns hx-s4">
              {slide.ctaPrimary.label && (
                <Link
                  href={slide.ctaPrimary.href}
                  className="hx-btn-gold"
                  style={{ background: `linear-gradient(135deg, ${slide.accentColor} 0%, ${slide.accentColor}cc 100%)` }}
                >
                  {slide.ctaPrimary.label}
                </Link>
              )}
              {slide.ctaSecondary.label && (
                <Link href={slide.ctaSecondary.href} className="hx-btn-outline">
                  {slide.ctaSecondary.label}
                </Link>
              )}
            </div>

            {/* Mobile search */}
            <form action="/shop" method="get" className="md:hidden hx-search-wrap hx-s4" role="search">
              <div className="hx-search-inner">
                <svg className="hx-search-icon" width="15" height="15" viewBox="0 0 24 24"
                  fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <circle cx="11" cy="11" r="8"/>
                  <path d="m21 21-4.35-4.35"/>
                </svg>
                <input type="text" name="q" placeholder="Search products, categories…"
                  autoComplete="off" aria-label="Search HEXASHOP"
                  className="hx-search-input" />
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

            {/* Functional dots */}
            <div className="hx-dots hx-s5" role="tablist" aria-label="Slide navigation">
              {SLIDES.map((s, i) => (
                <button
                  key={s.id}
                  role="tab"
                  aria-selected={i === current}
                  aria-label={`Go to slide ${i + 1}`}
                  className={`hx-dot ${i === current ? "hx-dot-active-el" : "hx-dot-inactive"}`}
                  style={i === current ? { background: slide.accentColor } : {}}
                  onClick={() => goTo(i, i > current ? "right" : "left")}
                />
              ))}
            </div>
          </div>

          {/* Right: hexagon + image */}
          <div className="hx-hero-img-col hx-slide-img hidden md:flex items-center justify-center relative"
            style={{ overflow:"hidden" }}>

            {/* Hex SVG */}
            <svg style={{ position:"absolute", zIndex:1 }} width="340" height="392" viewBox="0 0 340 392" fill="none">
              <defs>
                <filter id="hg"><feGaussianBlur stdDeviation="3" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
              </defs>
              <polygon points="170,12 330,104 330,288 170,380 10,288 10,104"
                fill="none" stroke={slide.accentColor} strokeWidth="1.2" strokeDasharray="10 6" strokeOpacity="0.5" />
              <polygon points="170,32 312,116 312,276 170,360 28,276 28,116"
                fill={slide.accentColor + "08"} stroke={slide.accentColor} strokeWidth="2" strokeOpacity="0.9" filter="url(#hg)" />
            </svg>

            {/* Sparkle dots */}
            {[
              { top:"14%", right:"6%",  s:7, d:0    },
              { top:"34%", right:"1%",  s:4, d:400  },
              { top:"62%", right:"5%",  s:5, d:800  },
              { top:"18%", left:"12%",  s:3, d:1200 },
              { top:"70%", left:"9%",   s:4, d:1600 },
            ].map((dot, i) => (
              <div key={i} className="hx-sparkle" style={{
                position:"absolute", zIndex:3,
                top:dot.top, right:(dot as { right?: string }).right, left:(dot as { left?: string }).left,
                width:dot.s, height:dot.s, borderRadius:"50%",
                background: slide.accentColor,
                boxShadow:`0 0 ${dot.s*3}px ${dot.s}px ${slide.accentColor}a8`,
                animationDelay:`${dot.d}ms`,
              }} />
            ))}

            {/* Hero image — floating */}
            <div className="hx-float" style={{ position:"relative", zIndex:2, width:"100%", height:"100%", display:"flex", alignItems:"center", justifyContent:"center" }}>
              {slide.imageUrl ? (
                <Image
                  src={slide.imageUrl}
                  alt={slide.subtitle || heroImageAlt}
                  width={300} height={360}
                  style={{ objectFit:"contain", maxHeight:"88%",
                    filter:`drop-shadow(0 0 28px ${slide.glowColor}) drop-shadow(0 18px 40px rgba(0,0,0,0.7))` }}
                  priority
                  unoptimized={slide.imageUrl.includes("localhost")}
                />
              ) : (
                <div style={{ textAlign:"center" }}>
                  <svg width="80" height="92" viewBox="0 0 80 92" fill="none">
                    <polygon points="40,3 77,23 77,69 40,89 3,69 3,23"
                      fill={slide.accentColor + "10"} stroke={slide.accentColor + "50"} strokeWidth="1.5" />
                    <text x="40" y="56" textAnchor="middle" fill={slide.accentColor + "66"}
                      fontSize="30" fontWeight="900" fontFamily="Inter,sans-serif">H</text>
                  </svg>
                  <p style={{ color:"rgba(99,102,241,0.7)", fontSize:"0.72rem", marginTop:"0.5rem" }}>
                    Upload hero image<br />
                    <span style={{ color:"#6b7280", fontSize:"0.65rem" }}>Admin → Hero Image</span>
                  </p>
                </div>
              )}
            </div>

            {/* Bottom fade */}
            <div style={{ position:"absolute", bottom:0, left:0, right:0, height:"50%",
              background:"linear-gradient(to bottom,transparent 0%,rgba(9,13,18,0.55) 55%,#090d12 100%)",
              zIndex:6, pointerEvents:"none" }} />
          </div>
        </div>
      </section>
  );
}
