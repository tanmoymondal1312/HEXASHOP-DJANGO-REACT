"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import Image from "next/image"
import Link from "next/link"

interface Props {
  heroImageUrl: string | null
  heroImageAlt: string
}

const TOTAL_SLIDES = 3
const AUTO_INTERVAL = 4000

/* ─ Sparkle positions (shared across slides) ─ */
const SPARKLES = [
  { top: "14%", right: "6%",  s: 7, d: 0    },
  { top: "34%", right: "1%",  s: 4, d: 400  },
  { top: "62%", right: "5%",  s: 5, d: 800  },
  { top: "18%", left: "12%",  s: 3, d: 1200 },
  { top: "70%", left: "9%",   s: 4, d: 1600 },
]

/* ─ Per-slide theme tokens ─ */
const THEMES = [
  {
    // Slide 1 — HEXASHOP main
    bg:       "radial-gradient(ellipse at 75% 50%, #0d1a2d 0%, #090d12 60%)",
    ambient:  "rgba(30,144,255,0.18)",
    hex1:     { stroke: "#f5a623", opacity: "0.5",  dash: "10 6" },
    hex2:     { fill: "rgba(30,144,255,0.04)",  stroke: "#1e90ff" },
    spark:    { color: "#f5a623", glow: "rgba(245,166,35,0.65)"  },
    dot:      "#f5a623",
    imgFx:    "drop-shadow(0 0 28px rgba(30,144,255,0.42)) drop-shadow(0 18px 40px rgba(0,0,0,0.75))",
  },
  {
    // Slide 2 — Sharee & Lehenga
    bg:       "radial-gradient(ellipse at 75% 50%, #1a070d 0%, #090d12 60%)",
    ambient:  "rgba(190,55,80,0.2)",
    hex1:     { stroke: "#d4af37", opacity: "0.55", dash: "8 5"  },
    hex2:     { fill: "rgba(180,45,70,0.08)",   stroke: "#d4af37" },
    spark:    { color: "#d4af37", glow: "rgba(212,175,55,0.65)"  },
    dot:      "#d4af37",
    imgFx:    "drop-shadow(0 0 28px rgba(212,175,55,0.42)) drop-shadow(0 18px 40px rgba(0,0,0,0.75))",
  },
  {
    // Slide 3 — Low Cost / Deals
    bg:       "radial-gradient(ellipse at 28% 50%, #030e07 0%, #090d12 60%)",
    ambient:  "rgba(34,197,94,0.14)",
    hex1:     { stroke: "#22c55e", opacity: "0.5",  dash: "10 6" },
    hex2:     { fill: "rgba(16,185,129,0.06)",  stroke: "#22c55e" },
    spark:    { color: "#22c55e", glow: "rgba(34,197,94,0.65)"   },
    dot:      "#22c55e",
    imgFx:    "drop-shadow(0 0 28px rgba(34,197,94,0.42)) drop-shadow(0 18px 40px rgba(0,0,0,0.75))",
  },
]

/* ─ SVG placeholder for slide 2 ─ */
function EthnicPlaceholder() {
  return (
    <div style={{ textAlign: "center", animation: "hxFloat 4.2s ease-in-out infinite" }}>
      <svg width="240" height="280" viewBox="0 0 240 280" fill="none">
        {/* Outer ornate hexagon */}
        <polygon points="120,10 222,68 222,184 120,242 18,184 18,68"
          fill="none" stroke="#d4af37" strokeWidth="1.5" strokeDasharray="6 4" strokeOpacity="0.7" />
        {/* Inner hexagon */}
        <polygon points="120,30 204,80 204,172 120,222 36,172 36,80"
          fill="rgba(180,50,70,0.08)" stroke="#d4af37" strokeWidth="2" strokeOpacity="0.9" />
        {/* Inner decorative ring */}
        <polygon points="120,55 182,91 182,159 120,195 58,159 58,91"
          fill="none" stroke="rgba(212,175,55,0.3)" strokeWidth="1" />
        {/* Cross ornament lines */}
        <line x1="120" y1="30" x2="120" y2="222" stroke="rgba(212,175,55,0.12)" strokeWidth="1"/>
        <line x1="36" y1="80" x2="204" y2="172" stroke="rgba(212,175,55,0.12)" strokeWidth="1"/>
        <line x1="204" y1="80" x2="36" y2="172" stroke="rgba(212,175,55,0.12)" strokeWidth="1"/>
        {/* Center mandala */}
        <circle cx="120" cy="126" r="36" fill="rgba(212,175,55,0.05)" stroke="rgba(212,175,55,0.35)" strokeWidth="1.5"/>
        <circle cx="120" cy="126" r="22" fill="rgba(180,50,70,0.1)" stroke="rgba(212,175,55,0.5)" strokeWidth="1"/>
        <circle cx="120" cy="126" r="8"  fill="rgba(212,175,55,0.3)" />
        {/* Petal ornaments */}
        {[0,60,120,180,240,300].map(deg => {
          const rad = (deg * Math.PI) / 180
          const x = 120 + 29 * Math.cos(rad)
          const y = 126 + 29 * Math.sin(rad)
          return <circle key={deg} cx={x} cy={y} r="4" fill="rgba(212,175,55,0.5)" />
        })}
        {/* Tip ornaments */}
        {[0,60,120,180,240,300].map(deg => {
          const rad = (deg * Math.PI) / 180
          const x = 120 + 52 * Math.cos(rad)
          const y = 126 + 52 * Math.sin(rad)
          return <circle key={`t${deg}`} cx={x} cy={y} r="2.5" fill="rgba(212,175,55,0.35)" />
        })}
        {/* Text */}
        <text x="120" y="265" textAnchor="middle" fill="rgba(212,175,55,0.5)"
          fontSize="10" fontWeight="700" fontFamily="Inter,sans-serif" letterSpacing="2">
          PLACE IMAGE HERE
        </text>
      </svg>
    </div>
  )
}

/* ─ SVG placeholder for slide 3 ─ */
function DealsPlaceholder() {
  return (
    <div style={{ textAlign: "center", animation: "hxFloat 4.2s ease-in-out infinite" }}>
      <svg width="240" height="280" viewBox="0 0 240 280" fill="none">
        {/* Outer hexagon */}
        <polygon points="120,10 222,68 222,184 120,242 18,184 18,68"
          fill="none" stroke="#22c55e" strokeWidth="1.5" strokeDasharray="10 6" strokeOpacity="0.6" />
        <polygon points="120,30 204,80 204,172 120,222 36,172 36,80"
          fill="rgba(16,185,129,0.05)" stroke="#22c55e" strokeWidth="2" strokeOpacity="0.85" />
        {/* Price tag shape */}
        <rect x="62" y="72" width="116" height="76" rx="12" fill="rgba(34,197,94,0.08)" stroke="rgba(34,197,94,0.3)" strokeWidth="1.5"/>
        {/* Price hole */}
        <circle cx="85" cy="84" r="6" fill="rgba(34,197,94,0.2)" stroke="rgba(34,197,94,0.5)" strokeWidth="1.5"/>
        {/* Taka symbol + price */}
        <text x="120" y="102" textAnchor="middle" fill="rgba(34,197,94,0.8)"
          fontSize="11" fontWeight="700" fontFamily="Inter,sans-serif" letterSpacing="1">
          STARTING FROM
        </text>
        <text x="120" y="134" textAnchor="middle" fill="#22c55e"
          fontSize="26" fontWeight="900" fontFamily="Inter,sans-serif">
          ৳299
        </text>
        {/* OFF badge */}
        <rect x="78" y="164" width="84" height="24" rx="6" fill="rgba(239,68,68,0.8)"/>
        <text x="120" y="181" textAnchor="middle" fill="#fff"
          fontSize="10" fontWeight="900" fontFamily="Inter,sans-serif" letterSpacing="2">
          UPTO 70% OFF
        </text>
        {/* Sparkle dots */}
        <circle cx="46" cy="100" r="3" fill="rgba(34,197,94,0.5)"/>
        <circle cx="196" cy="100" r="3" fill="rgba(34,197,94,0.5)"/>
        <circle cx="46" cy="152" r="2" fill="rgba(34,197,94,0.35)"/>
        <circle cx="196" cy="152" r="2" fill="rgba(34,197,94,0.35)"/>
        <text x="120" y="265" textAnchor="middle" fill="rgba(34,197,94,0.4)"
          fontSize="10" fontWeight="700" fontFamily="Inter,sans-serif" letterSpacing="2">
          PLACE IMAGE HERE
        </text>
      </svg>
    </div>
  )
}

/* ══════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════ */
export default function HeroSlider({ heroImageUrl, heroImageAlt }: Props) {
  const [active, setActive]       = useState(0)
  const [contentKey, setContentKey] = useState(0) // bump to re-trigger entrance anim
  const [img2Error, setImg2Error] = useState(false)
  const [img3Error, setImg3Error] = useState(false)
  const activeRef = useRef(0)
  const timerRef  = useRef<ReturnType<typeof setInterval> | null>(null)

  const goTo = useCallback((idx: number) => {
    if (idx === activeRef.current) return
    activeRef.current = idx
    setActive(idx)
    setContentKey(k => k + 1)
  }, [])

  const startTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = setInterval(() => {
      const next = (activeRef.current + 1) % TOTAL_SLIDES
      goTo(next)
    }, AUTO_INTERVAL)
  }, [goTo])

  useEffect(() => {
    startTimer()
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [startTimer])

  const handleDot = (i: number) => { goTo(i); startTimer() }

  const t = THEMES[active]

  return (
    <>
      {/* ─ Slider-specific styles ─ */}
      <style dangerouslySetInnerHTML={{ __html: `
        /* Slide entrance */
        @keyframes hxSlIn {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0);    }
        }
        .sl-0 { animation: hxSlIn 0.55s cubic-bezier(0.22,1,0.36,1)   0ms both; }
        .sl-1 { animation: hxSlIn 0.55s cubic-bezier(0.22,1,0.36,1)  90ms both; }
        .sl-2 { animation: hxSlIn 0.55s cubic-bezier(0.22,1,0.36,1) 190ms both; }
        .sl-3 { animation: hxSlIn 0.55s cubic-bezier(0.22,1,0.36,1) 295ms both; }
        .sl-4 { animation: hxSlIn 0.55s cubic-bezier(0.22,1,0.36,1) 400ms both; }
        .sl-5 { animation: hxSlIn 0.55s cubic-bezier(0.22,1,0.36,1) 490ms both; }

        /* Image entrance */
        @keyframes hxImgIn {
          from { opacity: 0; transform: scale(0.92) translateY(12px); }
          to   { opacity: 1; transform: scale(1)    translateY(0px);  }
        }
        .sl-img { animation: hxImgIn 0.7s cubic-bezier(0.22,1,0.36,1) 0.08s both; }

        /* ── Slide 2: Ethnic badge ── */
        .hx-ethnic-badge {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 5px 14px; border-radius: 999px;
          font-size: 0.58rem; font-weight: 800; letter-spacing: 0.14em;
          text-transform: uppercase; margin-bottom: 0.7rem;
          background: linear-gradient(135deg, rgba(212,175,55,0.14), rgba(160,40,70,0.14));
          border: 1px solid rgba(212,175,55,0.42); color: #d4af37;
        }
        .hx-ethnic-h {
          background: linear-gradient(135deg, #d4af37 0%, #f8e9a0 50%, #c9a227 100%);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
        }

        /* ── Slide 3: Savings ── */
        .hx-deals-badge {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 5px 14px; border-radius: 8px;
          font-size: 0.7rem; font-weight: 900; letter-spacing: 0.08em;
          text-transform: uppercase; margin-bottom: 0.75rem;
          background: linear-gradient(135deg, #ef4444, #dc2626);
          color: #fff; box-shadow: 0 4px 16px rgba(239,68,68,0.45);
        }
        .hx-savings-h {
          background: linear-gradient(135deg, #22c55e 0%, #86efac 100%);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
        }
        .hx-price-row {
          display: flex; align-items: baseline; gap: 8px;
          margin-bottom: 1rem; flex-wrap: wrap;
        }
        .hx-price-from {
          font-size: 0.6rem; color: #9ca3af; font-weight: 600;
          letter-spacing: 0.07em; text-transform: uppercase;
        }
        .hx-price-big {
          font-size: clamp(2rem, 7.5vw, 3rem); font-weight: 900; line-height: 1;
          background: linear-gradient(135deg, #22c55e 0%, #86efac 100%);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
        }

        /* ── Slider navigation dots ── */
        .hx-sdot {
          height: 5px; border-radius: 3px; cursor: pointer;
          transition: width 0.38s cubic-bezier(0.22,1,0.36,1),
                      background 0.38s ease, box-shadow 0.38s ease, opacity 0.38s ease;
          border: none; outline: none; padding: 0;
          width: 12px; opacity: 0.55; background: #2a2f3e;
        }
        .hx-sdot:hover { opacity: 0.8; }
        .hx-sdot.active { width: 26px; opacity: 1; }

        /* ── Hero image / SVG transitions ── */
        .hx-hex-poly {
          transition: stroke 0.65s ease, fill 0.65s ease, stroke-opacity 0.65s ease;
        }
        .hx-spark-dot {
          transition: background 0.65s ease, box-shadow 0.65s ease;
        }

        /* ── Ethnic btn override ── */
        .hx-btn-ethnic {
          background: linear-gradient(135deg, #d4af37 0%, #b8860b 100%) !important;
          box-shadow: 0 4px 14px rgba(212,175,55,0.38) !important;
        }
        .hx-btn-ethnic-out {
          border-color: rgba(212,175,55,0.38) !important;
          color: #d4af37 !important;
        }
        .hx-btn-deals {
          background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%) !important;
          color: #fff !important;
          box-shadow: 0 4px 14px rgba(34,197,94,0.38) !important;
        }
        .hx-btn-deals-out {
          border-color: rgba(34,197,94,0.38) !important;
          color: #22c55e !important;
        }
      ` }} />

      {/* ══ HERO SECTION ════════════════════════════════════════════ */}
      <section
        className="hx-hero"
        style={{ background: t.bg, transition: "background 0.75s ease" }}
      >
        {/* Ambient colour glow */}
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          background: `radial-gradient(ellipse at 76% 44%, ${t.ambient} 0%, transparent 58%)`,
          transition: "background 0.75s ease",
        }} />
        {/* Bottom-right warm glow */}
        <div style={{
          position: "absolute", bottom: 0, right: "20%", width: "28%", height: "50%",
          background: "radial-gradient(ellipse at center bottom, rgba(245,166,35,0.07) 0%, transparent 65%)",
          pointerEvents: "none",
        }} />
        {/* Bottom fade → next section */}
        <div style={{
          position: "absolute", bottom: 0, left: 0, right: 0, height: 140,
          background: "linear-gradient(to bottom,transparent 0%,rgba(9,13,18,0.7) 50%,#090d12 100%)",
          zIndex: 10, pointerEvents: "none",
        }} />

        {/* ── GRID ─────────────────────────────────────────────────── */}
        <div className="hx-hero-inner">

          {/* ═══ LEFT — text content ════════════════════════════════ */}
          <div>

            {/* ── SLIDE 1 — HEXASHOP main ── */}
            {active === 0 && (
              <div key={`s0-${contentKey}`}>
                <h1 className="hx-h1 sl-0">
                  <span style={{ color: "#fff" }}>HEXA</span>
                  <span style={{ color: "#1e90ff" }}>SHOP</span>
                </h1>

                <p className="hx-sub sl-1">Style That Defines You</p>

                <p className="hx-desc sl-2">
                  Discover the latest trends in fashion.<br />
                  Premium quality. Best prices.
                </p>

                <div className="hx-btns sl-3">
                  <Link href="/shop" className="hx-btn-gold">SHOP NOW</Link>
                  <Link href="/shop?is_featured=true" className="hx-btn-outline">EXPLORE COLLECTION</Link>
                </div>
              </div>
            )}

            {/* ── SLIDE 2 — Sharee & Lehenga ── */}
            {active === 1 && (
              <div key={`s1-${contentKey}`}>

                {/* Ethnic badge */}
                <div className="hx-ethnic-badge sl-0">
                  <span>✦</span> Ethnic Collection 2025 <span>✦</span>
                </div>

                {/* Heading */}
                <h1 className="hx-h1 sl-1" style={{ lineHeight: 1.05 }}>
                  <span style={{ color: "#fff", display: "block" }}>ETHNIC</span>
                  <span className="hx-ethnic-h">GRACE</span>
                </h1>

                <p className="hx-sub sl-2" style={{ color: "#c9a227", letterSpacing: "0.3em" }}>
                  শাড়ি ও লেহেঙ্গা Collection
                </p>

                <p className="hx-desc sl-3">
                  Drape yourself in timeless elegance.<br />
                  Exquisite handcrafted ethnic wear for every celebration.
                </p>

                <div className="hx-btns sl-4">
                  <Link href="/shop" className="hx-btn-gold hx-btn-ethnic">
                    EXPLORE NOW
                  </Link>
                  <Link href="/shop" className="hx-btn-outline hx-btn-ethnic-out">
                    VIEW COLLECTION
                  </Link>
                </div>

              </div>
            )}

            {/* ── SLIDE 3 — Low Cost / Deals ── */}
            {active === 2 && (
              <div key={`s2-${contentKey}`}>

                {/* Deals badge */}
                <div className="hx-deals-badge sl-0">🔥 UPTO 70% OFF</div>

                {/* Heading */}
                <h1 className="hx-h1 sl-1" style={{ lineHeight: 1.05 }}>
                  <span style={{ color: "#fff", display: "block" }}>BIG</span>
                  <span className="hx-savings-h">SAVINGS</span>
                </h1>

                <p className="hx-sub sl-2" style={{ color: "#22c55e" }}>
                  Fashion Starts at Just ৳299
                </p>

                <p className="hx-desc sl-3">
                  Why spend more when you can look amazing for less?<br />
                  Discover our budget collection — new deals every day!
                </p>

                {/* Starting price display */}
                <div className="hx-price-row sl-4">
                  <span className="hx-price-from">Starting from</span>
                  <span className="hx-price-big">৳299</span>
                </div>

                <div className="hx-btns sl-4">
                  <Link href="/shop?ordering=base_price" className="hx-btn-gold hx-btn-deals">
                    SHOP DEALS
                  </Link>
                  <Link href="/shop" className="hx-btn-outline hx-btn-deals-out">
                    ALL OFFERS
                  </Link>
                </div>

              </div>
            )}

            {/* ── Mobile search (always visible across all slides) ── */}
            <form
              action="/shop" method="get"
              className="md:hidden hx-search-wrap hx-anim-4"
              role="search"
              style={{ marginTop: "0.85rem" }}
            >
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

            {/* ── Slider navigation dots ── */}
            <div className="hx-dots" style={{ marginTop: "0.9rem", gap: "0.4rem" }}>
              {[0, 1, 2].map(i => (
                <button
                  key={i}
                  className={`hx-sdot${active === i ? " active" : ""}`}
                  style={{
                    background:  active === i ? THEMES[i].dot : "#2a2f3e",
                    boxShadow:   active === i ? `0 0 12px 2px ${THEMES[i].dot}60` : "none",
                  }}
                  onClick={() => handleDot(i)}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
            </div>
          </div>

          {/* ═══ RIGHT — image column ═══════════════════════════════ */}
          <div
            className="hx-hero-img-col hidden md:flex items-center justify-center relative"
            style={{ overflow: "hidden" }}
          >
            {/* Hexagon SVG — stroke colour changes per slide */}
            <svg
              style={{ position: "absolute", zIndex: 1 }}
              width="340" height="392" viewBox="0 0 340 392" fill="none"
            >
              <defs>
                <filter id="hgx">
                  <feGaussianBlur stdDeviation="3" result="b" />
                  <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
                </filter>
              </defs>
              <polygon
                className="hx-hex-poly"
                points="170,12 330,104 330,288 170,380 10,288 10,104"
                fill="none"
                stroke={t.hex1.stroke}
                strokeWidth="1.2"
                strokeDasharray={t.hex1.dash}
                strokeOpacity={t.hex1.opacity}
              />
              <polygon
                className="hx-hex-poly"
                points="170,32 312,116 312,276 170,360 28,276 28,116"
                fill={t.hex2.fill}
                stroke={t.hex2.stroke}
                strokeWidth="2"
                strokeOpacity="0.9"
                filter="url(#hgx)"
              />
            </svg>

            {/* Sparkle dots — colour transitions per slide */}
            {SPARKLES.map((dot, i) => (
              <div
                key={i}
                className="hx-sparkle hx-spark-dot"
                style={{
                  position: "absolute", zIndex: 3,
                  top: dot.top, right: dot.right, left: dot.left,
                  width: dot.s, height: dot.s, borderRadius: "50%",
                  background: t.spark.color,
                  boxShadow: `0 0 ${dot.s * 3}px ${dot.s}px ${t.spark.glow}`,
                  animationDelay: `${dot.d}ms`,
                }}
              />
            ))}

            {/* ── Images ── */}
            <div
              className="hx-float"
              style={{
                position: "relative", zIndex: 2,
                width: "100%", height: "100%",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              {/* Slide 1 — dynamic hero image from admin */}
              {active === 0 && (
                heroImageUrl ? (
                  <Image
                    key={`img0-${contentKey}`}
                    src={heroImageUrl}
                    alt={heroImageAlt || "HEXASHOP"}
                    width={300} height={360}
                    className="sl-img"
                    style={{ objectFit: "contain", maxHeight: "88%", filter: t.imgFx }}
                    priority
                    unoptimized={heroImageUrl.includes("localhost")}
                  />
                ) : (
                  <div key="ph0" style={{ textAlign: "center", animation: "hxFloat 4.2s ease-in-out infinite" }}>
                    <svg width="80" height="92" viewBox="0 0 80 92" fill="none">
                      <polygon points="40,3 77,23 77,69 40,89 3,69 3,23"
                        fill="rgba(30,144,255,0.06)" stroke="rgba(30,144,255,0.3)" strokeWidth="1.5" />
                      <text x="40" y="56" textAnchor="middle" fill="rgba(245,166,35,0.4)"
                        fontSize="30" fontWeight="900" fontFamily="Inter,sans-serif">H</text>
                    </svg>
                    <p style={{ color: "rgba(99,102,241,0.7)", fontSize: "0.72rem", marginTop: "0.5rem" }}>
                      Upload hero image<br />
                      <span style={{ color: "#6b7280", fontSize: "0.65rem" }}>Admin → Hero Image</span>
                    </p>
                  </div>
                )
              )}

              {/* Slide 2 — Sharee & Lehenga static image */}
              {active === 1 && (
                img2Error ? (
                  <EthnicPlaceholder key="ph2" />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={`img2-${contentKey}`}
                    src="/slides/sharee-lehenga.jpg"
                    alt="Sharee and Lehenga Collection"
                    className="sl-img"
                    style={{
                      objectFit: "contain", maxHeight: "88%",
                      width: "100%", maxWidth: 320,
                      filter: t.imgFx,
                    }}
                    onError={() => setImg2Error(true)}
                  />
                )
              )}

              {/* Slide 3 — Low Cost static image */}
              {active === 2 && (
                img3Error ? (
                  <DealsPlaceholder key="ph3" />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={`img3-${contentKey}`}
                    src="/slides/low-cost-fashion.jpg"
                    alt="Budget Fashion Deals"
                    className="sl-img"
                    style={{
                      objectFit: "contain", maxHeight: "88%",
                      width: "100%", maxWidth: 320,
                      filter: t.imgFx,
                    }}
                    onError={() => setImg3Error(true)}
                  />
                )
              )}
            </div>

            {/* Image column bottom fade */}
            <div style={{
              position: "absolute", bottom: 0, left: 0, right: 0, height: "50%",
              background: "linear-gradient(to bottom, transparent 0%, rgba(9,13,18,0.55) 55%, #090d12 100%)",
              zIndex: 6, pointerEvents: "none",
            }} />
          </div>

        </div>{/* /hx-hero-inner */}
      </section>
    </>
  )
}
