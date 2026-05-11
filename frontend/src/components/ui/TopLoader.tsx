"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

export default function TopLoader() {
  const pathname = usePathname();
  const [active, setActive]   = useState(false);
  const [width,  setWidth]    = useState(0);
  const [fading, setFading]   = useState(false);

  const prevPath    = useRef(pathname);
  const ticker      = useRef<ReturnType<typeof setInterval>>();
  const fadeTimer   = useRef<ReturnType<typeof setTimeout>>();
  const startedRef  = useRef(false);

  // ── helpers ─────────────────────────────────────────────────
  const clearTimers = () => {
    clearInterval(ticker.current);
    clearTimeout(fadeTimer.current);
  };

  const start = () => {
    if (startedRef.current) return;
    startedRef.current = true;
    clearTimers();
    setFading(false);
    setActive(true);
    setWidth(8);

    let w = 8;
    ticker.current = setInterval(() => {
      // Easing: fast at first, slow near 90
      const step = w < 30 ? 10 : w < 60 ? 6 : w < 80 ? 3 : 1;
      w = Math.min(w + step * (0.5 + Math.random()), 89);
      setWidth(w);
    }, 180);
  };

  const finish = () => {
    clearTimers();
    startedRef.current = false;
    setWidth(100);
    // Let the bar reach 100%, then fade out
    fadeTimer.current = setTimeout(() => {
      setFading(true);
      fadeTimer.current = setTimeout(() => {
        setActive(false);
        setWidth(0);
        setFading(false);
      }, 380);
    }, 150);
  };

  // ── Detect navigation END (pathname changed) ─────────────────
  useEffect(() => {
    if (prevPath.current !== pathname) {
      prevPath.current = pathname;
      finish();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  // ── Detect navigation START (click on internal <a> links) ────
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement).closest("a");
      if (!anchor) return;

      const href = anchor.getAttribute("href");
      if (!href) return;

      // Skip: external, hash, mailto, tel, _blank
      if (
        anchor.target === "_blank"        ||
        href.startsWith("http")           ||
        href.startsWith("//")             ||
        href.startsWith("#")              ||
        href.startsWith("mailto:")        ||
        href.startsWith("tel:")
      ) return;

      // Skip if same path (hash navigation or no-op)
      const destination = href.split("?")[0].split("#")[0];
      const current     = window.location.pathname;
      if (destination && destination === current) return;

      start();
    };

    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!active) return null;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes pg-shimmer {
          0%   { background-position: 200% center; }
          100% { background-position: -200% center; }
        }
        @keyframes pg-spin {
          to { transform: rotate(360deg); }
        }
        @keyframes pg-dot-pulse {
          0%, 100% { box-shadow: 0 0 6px 2px rgba(245,166,35,0.9), 0 0 16px 4px rgba(245,166,35,0.4); }
          50%       { box-shadow: 0 0 12px 4px rgba(30,144,255,0.9), 0 0 28px 6px rgba(30,144,255,0.5); }
        }
        @keyframes pg-badge-in {
          from { opacity: 0; transform: scale(0.6) translateY(-4px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}} />

      {/* ── Progress bar ─────────────────────────────────────── */}
      <div
        aria-hidden="true"
        style={{
          position:   "fixed",
          top:        0,
          left:       0,
          height:     "3px",
          width:      `${width}%`,
          zIndex:     99999,
          opacity:    fading ? 0 : 1,
          transition: fading
            ? "opacity 0.38s ease"
            : "width 0.22s cubic-bezier(0.4,0,0.2,1), opacity 0.2s ease",
          background:     "linear-gradient(90deg,#f5a623 0%,#facc15 20%,#1e90ff 50%,#f5a623 80%,#facc15 100%)",
          backgroundSize: "300% 100%",
          animation:      "pg-shimmer 1.4s linear infinite",
          boxShadow:      "0 0 10px rgba(245,166,35,0.7), 0 0 22px rgba(30,144,255,0.4)",
          borderRadius:   "0 2px 2px 0",
        }}
      >
        {/* Glowing leading-edge dot */}
        <div style={{
          position:     "absolute",
          right:        -5,
          top:          "50%",
          transform:    "translateY(-50%)",
          width:        11,
          height:       11,
          borderRadius: "50%",
          background:   "linear-gradient(135deg,#f5a623,#1e90ff)",
          animation:    "pg-dot-pulse 1s ease-in-out infinite",
        }} />
      </div>

      {/* ── Hex spinner badge ─────────────────────────────────── */}
      {!fading && (
        <div
          aria-label="Loading…"
          style={{
            position:     "fixed",
            top:          14,
            right:        14,
            zIndex:       99999,
            animation:    "pg-badge-in 0.25s ease both",
            display:      "flex",
            alignItems:   "center",
            gap:          8,
            background:   "rgba(9,13,18,0.85)",
            backdropFilter: "blur(10px)",
            border:       "1px solid rgba(245,166,35,0.2)",
            borderRadius: 999,
            padding:      "5px 11px 5px 7px",
            boxShadow:    "0 4px 24px rgba(0,0,0,0.4), 0 0 0 1px rgba(30,144,255,0.1)",
          }}
        >
          {/* Ring spinner */}
          <div style={{
            width:        18,
            height:       18,
            borderRadius: "50%",
            border:       "2.5px solid rgba(245,166,35,0.15)",
            borderTop:    "2.5px solid #f5a623",
            borderRight:  "2.5px solid #1e90ff",
            animation:    "pg-spin 0.65s linear infinite",
            flexShrink:   0,
          }} />
          <span style={{
            fontSize:     "0.65rem",
            fontWeight:   700,
            letterSpacing:"0.06em",
            color:        "#94a3b8",
            textTransform:"uppercase",
          }}>
            Loading
          </span>
        </div>
      )}
    </>
  );
}
