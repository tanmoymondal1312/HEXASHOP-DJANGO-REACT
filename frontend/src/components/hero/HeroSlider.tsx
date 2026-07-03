"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type { HeroSlideDTO } from "@/types/hero";
import HeroSlideView from "./HeroSlideView";

const AUTO_INTERVAL = 4000;

interface Props {
  slides: HeroSlideDTO[];
  /** Admin hero image used when a slide's own image is null (e.g. slide 1). */
  fallbackImageUrl?: string | null;
}

/**
 * Storefront hero slider. Stacks N document-driven <HeroSlideView> layers in a
 * single grid cell (height locks to the tallest, cross-fades between slides)
 * and adds autoplay + arrows + dots. Uses the SAME HeroSlideView the studio
 * live-preview uses → what you build is exactly what ships.
 */
export default function HeroSlider({ slides, fallbackImageUrl }: Props) {
  const count = slides.length;
  const [active, setActive] = useState(0);
  const [animKey, setAnimKey] = useState(0);
  const activeRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const goTo = useCallback((idx: number) => {
    if (idx === activeRef.current) return;
    activeRef.current = idx;
    setActive(idx);
    setAnimKey((k) => k + 1);
  }, []);

  const startTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (count <= 1) return;
    timerRef.current = setInterval(() => {
      goTo((activeRef.current + 1) % count);
    }, AUTO_INTERVAL);
  }, [goTo, count]);

  useEffect(() => {
    startTimer();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [startTimer]);

  if (count === 0) return null;

  const handleDot = (i: number) => { goTo(i); startTimer(); };
  const handlePrev = () => { goTo((activeRef.current - 1 + count) % count); startTimer(); };
  const handleNext = () => { goTo((activeRef.current + 1) % count); startTimer(); };

  const arrowClr = slides[active].document.background.starColor;

  return (
    <section className="hx-hero">
      {count > 1 && (
        <>
          <button
            className="hx-arrow hx-arrow-left"
            style={{ "--arrow-clr": arrowClr } as React.CSSProperties}
            onClick={handlePrev}
            aria-label="Previous slide"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <button
            className="hx-arrow hx-arrow-right"
            style={{ "--arrow-clr": arrowClr } as React.CSSProperties}
            onClick={handleNext}
            aria-label="Next slide"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        </>
      )}

      <div className="hx-hero-stack">
        {slides.map((slide, i) => (
          <div
            key={slide.id}
            className="hx-hero-slide-layer"
            style={{
              opacity: i === active ? 1 : 0,
              visibility: i === active ? "visible" : "hidden",
              pointerEvents: i === active ? "auto" : "none",
            }}
            aria-hidden={i !== active}
          >
            <HeroSlideView
              key={i === active ? `a-${animKey}` : "idle"}
              document={slide.document}
              fallbackImageUrl={fallbackImageUrl}
              animate={i === active}
            />
          </div>
        ))}
      </div>

      {count > 1 && (
        <div className="hx-hero-dots">
          {slides.map((slide, i) => (
            <button
              key={slide.id}
              className={`hx-sdot${active === i ? " active" : ""}`}
              style={{
                background: active === i ? slide.document.background.starColor : "#2a2f3e",
                boxShadow: active === i ? `0 0 12px 2px ${slide.document.background.starColor}60` : "none",
              }}
              onClick={() => handleDot(i)}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
