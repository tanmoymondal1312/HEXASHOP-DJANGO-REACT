"use client";

import { useEffect, useRef, useState } from "react";
import type { HeroDocument } from "@/types/hero";
import HeroSlideView from "@/components/hero/HeroSlideView";

/**
 * Renders a scaled-down live <HeroSlideView> as a card thumbnail / preview. Uses
 * the real render component (not a screenshot) so it always reflects the current
 * doc — the studio editor reuses it as the live preview too.
 */
export default function SlideThumb({
  document, fallbackImageUrl, baseWidth = 1200, baseHeight = 500,
}: {
  document: HeroDocument; fallbackImageUrl?: string | null;
  baseWidth?: number; baseHeight?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.3);

  useEffect(() => {
    if (!ref.current) return;
    const ro = new ResizeObserver((entries) => {
      const w = entries[0].contentRect.width;
      setScale(w / baseWidth);
    });
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, [baseWidth]);

  return (
    <div
      ref={ref}
      style={{
        position: "relative", width: "100%", height: baseHeight * scale,
        overflow: "hidden", borderRadius: 10, background: "#090d12",
        border: "1px solid #1f2d45",
      }}
    >
      <div
        style={{
          position: "absolute", top: 0, left: 0, width: baseWidth, height: baseHeight,
          transform: `scale(${scale})`, transformOrigin: "top left", pointerEvents: "none",
        }}
      >
        <HeroSlideView document={document} fallbackImageUrl={fallbackImageUrl} />
      </div>
    </div>
  );
}
