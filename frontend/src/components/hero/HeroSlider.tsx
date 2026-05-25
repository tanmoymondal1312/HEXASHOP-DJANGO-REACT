"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

// ─── Slide data ────────────────────────────────────────────────────────────────

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
}

const SLIDES: Slide[] = [
  {
    id: 1,
    badge: "New Arrivals 2025",
    heading: "HEXA",
    headingAccent: "SHOP",
    subtitle: "Style That Defines You",
    description: "Discover the latest trends in fashion.\nPremium quality. Best prices.",
    ctaPrimary:   { label: "SHOP NOW",           href: "/shop" },
    ctaSecondary: { label: "EXPLORE COLLECTION", href: "/shop?is_featured=true" },
    accentColor: "#1e90ff",
    glowColor:   "rgba(30,144,255,0.22)",
  },
  {
    id: 2,
    badge: "Featured Picks",
    heading: "FASHION",
    headingAccent: "FORWARD",
    subtitle: "Curated For You",
    description: "Hand-picked styles for every occasion.\nElegance meets affordability.",
    ctaPrimary:   { label: "VIEW FEATURED", href: "/shop?is_featured=true" },
    ctaSecondary: { label: "ALL PRODUCTS",  href: "/shop" },
    accentColor: "#f5a623",
    glowColor:   "rgba(245,166,35,0.20)",
  },
  {
    id: 3,
    badge: "Trending Now",
    heading: "TOP",
    headingAccent: "TRENDS",
    subtitle: "Be Ahead of the Curve",
    description: "Shop what's trending right now.\nFresh drops updated daily.",
    ctaPrimary:   { label: "SHOP TRENDING", href: "/shop?ordering=-sold_count" },
    ctaSecondary: { label: "EXPLORE ALL",   href: "/shop" },
    accentColor: "#a855f7",
    glowColor:   "rgba(168,85,247,0.18)",
  },
];

const AUTOPLAY_MS = 5000;

// ─── Component ─────────────────────────────────────────────────────────────────

interface HeroSliderProps {
  heroImageUrl: string | null;
  heroImageAlt?: string;
}

export default function HeroSlider({ heroImageUrl, heroImageAlt = "HEXASHOP" }: HeroSliderProps) {
  const [current, setCurrent] = useState(0);
  const [animDir, setAnimDir] = useState<"left" | "right">("right");
  const [paused, setPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const goTo = useCallback((idx: number, dir: "left" | "right" = "right") => {
    setAnimDir(dir);
    setCurrent(idx);
  }, []);

  const prev = useCallback(() => {
    goTo((current - 1 + SLIDES.length) % SLIDES.length, "left");
  }, [current, goTo]);

  const next = useCallback(() => {
    goTo((current + 1) % SLIDES.length, "right");
  }, [current, goTo]);

  // Auto-play
  useEffect(() => {
    if (paused) return;
    timerRef.current = setTimeout(next, AUTOPLAY_MS);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [current, paused, next]);

  const slide = SLIDES[current];

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        /* ─── Hero slider ─── */
        @keyframes hxSlideInRight  { from { opacity:0; transform:translateX(40px);  } to { opacity:1; transform:translateX(0); } }
        @keyframes hxSlideInLeft   { from { opacity:0; transform:translateX(-40px); } to { opacity:1; transform:translateX(0); } }
        @keyframes hxSlideOutRight { from { opacity:1; transform:translateX(0); } to { opacity:0; transform:translateX(-40px); } }
        @keyframes hxSlideOutLeft  { from { opacity:1; transform:translateX(0); } to { opacity:0; transform:translateX(40px);  } }

        @keyframes hxFadeUp   { from{opacity:0;transform:translateY(22px)} to{opacity:1;transform:translateY(0)} }
        @keyframes hxFadeRight{ from{opacity:0;transform:translateX(28px)} to{opacity:1;transform:translateX(0)} }
        @keyframes hxFloat    { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-11px)} }
        @keyframes hxSparkle  { 0%,100%{opacity:.4;transform:scale(.85)} 50%{opacity:1;transform:scale(1.5)} }
        @keyframes hxShimmer  { 0%{background-position:-200% 0} 100%{background-position:200% 0} }

        @media(prefers-reduced-motion:reduce){
          .hx-anim-1,.hx-anim-2,.hx-anim-3,.hx-anim-4,.hx-anim-5,
          .hx-anim-img,.hx-float,.hx-sparkle,.hx-slide-content,
          .hx-slide-img { animation:none !important; transition:none !important; }
        }

        /* content pane */
        .hx-slide-content {
          animation-duration: 0.55s;
          animation-timing-function: cubic-bezier(0.22,1,0.36,1);
          animation-fill-mode: both;
        }
        .hx-dir-right .hx-slide-content { animation-name: hxSlideInRight; }
        .hx-dir-left  .hx-slide-content { animation-name: hxSlideInLeft;  }

        /* image pane */
        .hx-slide-img {
          animation: hxFadeRight 0.8s cubic-bezier(0.22,1,0.36,1) 0.12s both;
        }

        /* stagger helpers inside content pane */
        .hx-s1 { animation: hxFadeUp 0.55s cubic-bezier(0.22,1,0.36,1)   0ms both; }
        .hx-s2 { animation: hxFadeUp 0.55s cubic-bezier(0.22,1,0.36,1)  80ms both; }
        .hx-s3 { animation: hxFadeUp 0.55s cubic-bezier(0.22,1,0.36,1) 160ms both; }
        .hx-s4 { animation: hxFadeUp 0.55s cubic-bezier(0.22,1,0.36,1) 240ms both; }
        .hx-s5 { animation: hxFadeUp 0.55s cubic-bezier(0.22,1,0.36,1) 330ms both; }

        .hx-float   { animation: hxFloat   4.2s ease-in-out infinite; }
        .hx-sparkle { animation: hxSparkle 2.4s ease-in-out infinite; }

        /* ─── Layout ─── */
        *,*::before,*::after { box-sizing:border-box; }
        .hx-wrap { background:#090d12; overflow-x:hidden; }

        .hx-hero {
          position:relative; overflow:hidden;
          background:radial-gradient(ellipse at 75% 50%, #0d1a2d 0%, #090d12 60%);
        }
        @media(min-width:768px){
          .hx-hero {
            min-height:calc(100vh  - 64px);
            min-height:calc(100dvh - 64px);
            display:flex; flex-direction:column;
          }
        }

        .hx-hero-inner {
          max-width:1280px; margin:0 auto; width:100%;
          padding:1.25rem 1rem 0.75rem;
          display:grid; grid-template-columns:1fr; align-items:center;
        }
        @media(min-width:768px){
          .hx-hero-inner {
            flex:1; min-height:unset;
            grid-template-columns:52% 48%;
            padding:1.75rem 2rem 1.25rem;
          }
        }
        @media(min-width:1024px){
          .hx-hero-inner { padding:1.75rem 2.5rem 1rem; }
        }

        /* ─── Typography ─── */
        .hx-h1 {
          font-size:clamp(1.7rem,9vw,2.6rem); font-weight:900;
          line-height:1; letter-spacing:-0.02em; margin:0;
        }
        @media(min-width:640px)  { .hx-h1 { font-size:3.2rem; } }
        @media(min-width:1024px) { .hx-h1 { font-size:clamp(2.6rem,5vw,4rem); } }

        .hx-badge {
          display:inline-flex; align-items:center; gap:6px;
          font-size:0.62rem; font-weight:700; letter-spacing:0.14em;
          text-transform:uppercase; padding:4px 10px; border-radius:999px;
          border:1.5px solid; margin-bottom:0.6rem;
          opacity:0.9;
        }

        .hx-sub {
          font-size:0.58rem; font-weight:600; letter-spacing:0.38em;
          color:#94a3b8; text-transform:uppercase;
          margin-top:0.45rem; margin-bottom:0.45rem;
        }
        @media(min-width:1024px){ .hx-sub { font-size:0.7rem; } }

        .hx-desc {
          color:#94a3b8; font-size:0.8rem; line-height:1.6;
          margin-bottom:1.1rem; max-width:400px; display:none;
          white-space:pre-line;
        }
        @media(min-width:480px)  { .hx-desc { display:block; } }
        @media(min-width:1024px) { .hx-desc { font-size:0.875rem; margin-bottom:1.35rem; } }

        /* ─── Buttons ─── */
        .hx-btns { display:flex; gap:0.55rem; margin-bottom:0.9rem; flex-wrap:wrap; }
        @media(min-width:1024px){ .hx-btns { gap:0.75rem; margin-bottom:1.25rem; } }

        .hx-btn-gold {
          color:#000; font-weight:800; font-size:0.68rem; letter-spacing:0.07em;
          padding:0.5rem 1.2rem; border-radius:0.4rem;
          text-decoration:none; white-space:nowrap;
          transition:opacity 0.2s, transform 0.2s;
          box-shadow:0 4px 14px rgba(245,166,35,0.35);
        }
        .hx-btn-gold:hover { opacity:0.88; transform:translateY(-1px); }
        @media(min-width:1024px){ .hx-btn-gold { font-size:0.8rem; padding:0.62rem 1.65rem; } }

        .hx-btn-outline {
          border:1.5px solid rgba(255,255,255,0.22); color:#fff;
          font-weight:600; font-size:0.68rem; letter-spacing:0.05em;
          padding:0.5rem 0.95rem; border-radius:0.4rem;
          text-decoration:none; background:transparent; white-space:nowrap;
          transition:border-color 0.2s, background 0.2s;
        }
        .hx-btn-outline:hover {
          border-color:rgba(255,255,255,0.45);
          background:rgba(255,255,255,0.05);
        }
        @media(min-width:1024px){ .hx-btn-outline { font-size:0.8rem; padding:0.62rem 1.3rem; } }

        /* ─── Nav arrows ─── */
        .hx-nav-btn {
          position:absolute; top:50%; transform:translateY(-50%);
          z-index:20; width:36px; height:36px; border-radius:50%;
          border:1.5px solid rgba(255,255,255,0.15);
          background:rgba(9,13,18,0.65); backdrop-filter:blur(8px);
          color:#fff; display:flex; align-items:center; justify-content:center;
          cursor:pointer; transition:all 0.2s;
          display:none;
        }
        @media(min-width:768px){ .hx-nav-btn { display:flex; } }
        .hx-nav-btn:hover {
          background:rgba(245,166,35,0.18);
          border-color:rgba(245,166,35,0.55);
          color:#f5a623;
          transform:translateY(-50%) scale(1.05);
        }
        .hx-nav-prev { left:0.75rem; }
        .hx-nav-next { right:0.75rem; }
        @media(min-width:1024px){
          .hx-nav-prev { left:1.25rem; }
          .hx-nav-next { right:1.25rem; }
        }

        /* ─── Dots ─── */
        .hx-dots { display:flex; align-items:center; gap:0.4rem; margin-top:0.15rem; }
        .hx-dot {
          height:5px; border-radius:3px; cursor:pointer;
          transition:width 0.35s ease, background 0.35s ease;
          border:none; padding:0;
        }
        .hx-dot-inactive { width:12px; background:#2a2f3e; }
        .hx-dot-inactive:hover { background:#4a5168; }
        .hx-dot-active-el { width:22px; }

        /* ─── Progress bar ─── */
        .hx-progress {
          position:absolute; bottom:0; left:0; height:2px; z-index:15;
          background:linear-gradient(90deg,#f5a623,#1e90ff);
          transform-origin:left;
          transition:none;
        }
        @keyframes hxProgress {
          from { width:0%; }
          to   { width:100%; }
        }
        .hx-progress-run {
          animation: hxProgress linear;
        }

        /* ─── Misc hero elements ─── */
        .hx-hero-img-col { min-height:260px; }
        @media(min-width:768px)  { .hx-hero-img-col { min-height:320px; } }
        @media(min-width:1024px) { .hx-hero-img-col { min-height:400px; } }

        .hx-wish-btn {
          position:absolute; top:7px; right:7px; z-index:2;
          width:28px; height:28px; border-radius:50%;
          border:1px solid rgba(255,255,255,0.18);
          background:rgba(0,0,0,0.52); backdrop-filter:blur(4px);
          display:flex; align-items:center; justify-content:center;
          transition:all 0.2s;
        }

        /* Search (mobile) */
        .hx-search-wrap {
          display:block; width:100%; box-sizing:border-box;
          position:relative; z-index:12;
          padding:1.5px; border-radius:9999px;
          background:linear-gradient(120deg,rgba(245,166,35,0.65) 0%,rgba(30,144,255,0.65) 100%);
          box-shadow:0 0 14px rgba(245,166,35,0.12),0 0 28px rgba(30,144,255,0.08);
          transition:box-shadow 0.25s ease; margin-bottom:0.9rem;
          -webkit-tap-highlight-color:transparent;
        }
        .hx-search-wrap:focus-within {
          background:linear-gradient(120deg,#f5a623 0%,#1e90ff 100%);
          box-shadow:0 0 22px rgba(245,166,35,0.3),0 0 44px rgba(30,144,255,0.2);
        }
        .hx-search-inner {
          display:flex; align-items:center; width:100%;
          background:#111520; border-radius:9999px; overflow:hidden;
        }
        .hx-search-icon { margin-left:10px; flex-shrink:0; color:rgba(245,166,35,0.7); transition:color 0.2s; }
        .hx-search-wrap:focus-within .hx-search-icon { color:#f5a623; }
        .hx-search-input {
          flex:1 1 0; background:transparent; min-width:0; width:0;
          padding:0.65rem 0.5rem; font-size:16px; color:#fff;
          border:none; outline:none !important; box-shadow:none !important;
          -webkit-appearance:none; appearance:none;
          -webkit-tap-highlight-color:transparent;
        }
        .hx-search-input::placeholder { color:#5a6480; font-size:0.82rem; }
        .hx-search-btn {
          margin:3px; flex-shrink:0;
          background:linear-gradient(135deg,#f5a623 0%,#f59e0b 100%);
          color:#000; font-weight:800; font-size:0.72rem;
          padding:0.48rem 0.6rem; border-radius:9999px;
          border:none; cursor:pointer;
          display:flex; align-items:center; gap:4px;
          letter-spacing:0.04em; white-space:nowrap;
          transition:opacity 0.15s,transform 0.15s;
          -webkit-tap-highlight-color:transparent;
        }
        .hx-search-btn:hover { opacity:0.88; transform:scale(0.98); }
        .hx-search-btn-label { display:none; }
        @media(min-width:400px){
          .hx-search-btn { padding:0.48rem 1rem; }
          .hx-search-btn-label { display:inline; }
        }

        @media(max-width:359px){
          .hx-btn-gold    { font-size:0.6rem; padding:0.4rem 0.75rem; }
          .hx-btn-outline { font-size:0.6rem; padding:0.4rem 0.6rem; }
        }
      ` }} />

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
            <div className="hx-badge hx-s1" style={{ color: slide.accentColor, borderColor: slide.accentColor + "55", backgroundColor: slide.accentColor + "14" }}>
              <span style={{ width:6, height:6, borderRadius:"50%", background:slide.accentColor, display:"inline-block", flexShrink:0, boxShadow:`0 0 6px 2px ${slide.accentColor}88` }} />
              {slide.badge}
            </div>

            <h1 className="hx-h1 hx-s2">
              <span style={{ color:"#fff" }}>{slide.heading}</span>
              <span style={{ color: slide.accentColor }}>{slide.headingAccent}</span>
            </h1>

            <p className="hx-sub hx-s3">{slide.subtitle}</p>

            <p className="hx-desc hx-s4">{slide.description}</p>

            <div className="hx-btns hx-s4">
              <Link
                href={slide.ctaPrimary.href}
                className="hx-btn-gold"
                style={{ background: `linear-gradient(135deg, ${slide.accentColor === "#f5a623" ? "#f5a623" : slide.accentColor} 0%, ${slide.accentColor === "#f5a623" ? "#f59e0b" : slide.accentColor + "cc"} 100%)` }}
              >
                {slide.ctaPrimary.label}
              </Link>
              <Link href={slide.ctaSecondary.href} className="hx-btn-outline">
                {slide.ctaSecondary.label}
              </Link>
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
              {heroImageUrl ? (
                <Image
                  src={heroImageUrl}
                  alt={heroImageAlt}
                  width={300} height={360}
                  style={{ objectFit:"contain", maxHeight:"88%",
                    filter:`drop-shadow(0 0 28px ${slide.glowColor}) drop-shadow(0 18px 40px rgba(0,0,0,0.7))` }}
                  priority
                  unoptimized={heroImageUrl.includes("localhost")}
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
    </>
  );
}
