"use client";

import { useRef, useState, useEffect, useCallback, ReactNode } from "react";

/**
 * Horizontal scroll strip with prev/next arrow buttons (hero-slider style).
 * Server-rendered children are slotted in, so cards keep SSR/next-image perks.
 * Arrows fade out at the ends; on touch devices native swipe still works.
 */
export default function HScroll({ children, ariaLabel }: { children: ReactNode; ariaLabel?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);

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

  const scrollBy = (dir: 1 | -1) => {
    const el = ref.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.85, behavior: "smooth" });
  };

  return (
    <div className="hx-hscroll-wrap">
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
