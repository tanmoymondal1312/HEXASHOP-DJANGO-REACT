"use client";

import { useRef, useState, useEffect, useCallback, ReactNode } from "react";

interface Props {
  children: ReactNode;
  ariaLabel?: string;
  /** Auto-drift the strip leftward while it's in view (px per second). 0 = off. */
  autoScrollSpeed?: number;
}

/**
 * Horizontal scroll strip with prev/next arrows (hero-slider style) and an
 * optional slow auto-scroll that only runs while the strip is on screen.
 * Auto-scroll pauses on hover / touch / manual scrolling / arrow clicks and
 * glides back to the start when it reaches the end. Respects
 * prefers-reduced-motion. Server-rendered children are slotted in.
 */
export default function HScroll({ children, ariaLabel, autoScrollSpeed = 0 }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);

  // ── mutable auto-scroll state (no re-renders) ──
  const inView = useRef(false);
  const hovering = useRef(false);
  const pausedUntil = useRef(0);

  const update = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 4);
    setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    update();
    const el = ref.current;
    if (!el) return;
    el.addEventListener("scroll", update, { passive: true });
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", update);
      ro.disconnect();
    };
  }, [update]);

  // ── auto-scroll engine ──
  useEffect(() => {
    if (!autoScrollSpeed) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const el = ref.current;
    const wrap = wrapRef.current;
    if (!el || !wrap) return;

    const io = new IntersectionObserver(
      (entries) => { inView.current = entries[0].intersectionRatio >= 0.6; },
      { threshold: [0, 0.6, 1] },
    );
    io.observe(wrap);

    const pause = (ms: number) => { pausedUntil.current = Date.now() + ms; };
    const onEnter = () => { hovering.current = true; };
    const onLeave = () => { hovering.current = false; };
    const onManual = () => pause(2500);
    el.addEventListener("mouseenter", onEnter);
    el.addEventListener("mouseleave", onLeave);
    el.addEventListener("wheel", onManual, { passive: true });
    el.addEventListener("touchstart", onManual, { passive: true });
    el.addEventListener("pointerdown", onManual);

    let raf = 0;
    let last = performance.now();
    let carry = 0; // sub-pixel accumulator so slow speeds still move

    const tick = (now: number) => {
      const dt = Math.min(now - last, 100);
      last = now;
      if (inView.current && !hovering.current && Date.now() >= pausedUntil.current) {
        const max = el.scrollWidth - el.clientWidth;
        if (max > 4) {
          if (el.scrollLeft >= max - 1) {
            // reached the end — pause, glide back to the start, continue
            pause(1800);
            el.scrollTo({ left: 0, behavior: "smooth" });
          } else {
            carry += (autoScrollSpeed * dt) / 1000;
            const step = Math.floor(carry);
            if (step >= 1) {
              el.scrollLeft += step;
              carry -= step;
            }
          }
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      el.removeEventListener("mouseenter", onEnter);
      el.removeEventListener("mouseleave", onLeave);
      el.removeEventListener("wheel", onManual);
      el.removeEventListener("touchstart", onManual);
      el.removeEventListener("pointerdown", onManual);
    };
  }, [autoScrollSpeed]);

  const scrollBy = (dir: 1 | -1) => {
    const el = ref.current;
    if (!el) return;
    pausedUntil.current = Date.now() + 3000; // don't fight the smooth glide
    el.scrollBy({ left: dir * el.clientWidth * 0.85, behavior: "smooth" });
  };

  return (
    <div className="hx-hscroll-wrap" ref={wrapRef}>
      <button
        className="hx-car-arrow hx-car-arrow-left"
        style={{ opacity: canLeft ? 1 : 0, pointerEvents: canLeft ? "auto" : "none" }}
        onClick={() => scrollBy(-1)}
        aria-label="Scroll left"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
          strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M15 18l-6-6 6-6" />
        </svg>
      </button>

      <div ref={ref} className="hx-hscroll scrollbar-hide" role="list" aria-label={ariaLabel}>
        {children}
      </div>

      <button
        className="hx-car-arrow hx-car-arrow-right"
        style={{ opacity: canRight ? 1 : 0, pointerEvents: canRight ? "auto" : "none" }}
        onClick={() => scrollBy(1)}
        aria-label="Scroll right"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
          strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 18l6-6-6-6" />
        </svg>
      </button>
    </div>
  );
}
