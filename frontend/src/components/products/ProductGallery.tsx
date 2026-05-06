"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X, ZoomIn } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ProductImage } from "@/types";

interface ProductGalleryProps {
  images: ProductImage[];
  productName: string;
}

const PLACEHOLDER =
  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgZmlsbD0iIzExMTgyNyIvPjwvc3ZnPg==";

export function ProductGallery({ images, productName }: ProductGalleryProps) {
  const [active, setActive] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const [fade, setFade] = useState(true);

  const count = images.length;
  const current = images[active];

  const goTo = useCallback(
    (idx: number) => {
      setFade(false);
      setTimeout(() => {
        setActive((idx + count) % count);
        setFade(true);
      }, 120);
    },
    [count]
  );

  const prev = useCallback(() => goTo(active - 1), [active, goTo]);
  const next = useCallback(() => goTo(active + 1), [active, goTo]);

  // Keyboard navigation in lightbox
  useEffect(() => {
    if (!lightbox) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
      if (e.key === "Escape") setLightbox(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [lightbox, prev, next]);

  // Prevent body scroll when lightbox is open
  useEffect(() => {
    document.body.style.overflow = lightbox ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [lightbox]);

  if (!count) {
    return (
      <div className="aspect-square bg-brand-surface rounded-2xl flex flex-col items-center justify-center gap-3 text-brand-muted border border-brand-border">
        <svg className="w-16 h-16 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <p className="text-sm">No images yet</p>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-3 lg:sticky lg:top-24">
        {/* ── Main image ──────────────────────────────────────────────────── */}
        <div
          className="relative aspect-[4/5] rounded-2xl overflow-hidden bg-brand-surface border border-brand-border group cursor-zoom-in"
          onClick={() => setLightbox(true)}
        >
          <Image
            src={current.image}
            alt={current.alt_text || productName}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className={cn(
              "object-cover transition-all duration-200",
              fade ? "opacity-100 scale-100" : "opacity-0 scale-[0.98]"
            )}
            priority
            placeholder="blur"
            blurDataURL={PLACEHOLDER}
          />

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Zoom hint */}
          <div className="absolute top-3 right-3 p-2 rounded-xl bg-black/40 backdrop-blur-sm text-white opacity-0 group-hover:opacity-100 transition-opacity">
            <ZoomIn className="h-4 w-4" />
          </div>

          {/* Image counter */}
          {count > 1 && (
            <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-full bg-black/50 backdrop-blur-sm text-xs text-white font-medium">
              {active + 1} / {count}
            </div>
          )}

          {/* Arrow navigation */}
          {count > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); prev(); }}
                className="absolute left-3 top-1/2 -translate-y-1/2 p-2.5 rounded-xl bg-black/50 backdrop-blur-sm text-white hover:bg-black/70 transition-all opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0"
                aria-label="Previous"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); next(); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 rounded-xl bg-black/50 backdrop-blur-sm text-white hover:bg-black/70 transition-all opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0"
                aria-label="Next"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          )}

          {/* Dot indicators */}
          {count > 1 && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
              {images.map((_, i) => (
                <button
                  key={i}
                  onClick={(e) => { e.stopPropagation(); goTo(i); }}
                  className={cn(
                    "rounded-full transition-all",
                    i === active
                      ? "w-5 h-1.5 bg-brand-primary"
                      : "w-1.5 h-1.5 bg-white/50 hover:bg-white/80"
                  )}
                />
              ))}
            </div>
          )}
        </div>

        {/* ── Thumbnail strip ─────────────────────────────────────────────── */}
        {count > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {images.map((img, i) => (
              <button
                key={img.id}
                onClick={() => goTo(i)}
                className={cn(
                  "flex-shrink-0 relative w-[72px] h-[90px] rounded-xl overflow-hidden border-2 transition-all duration-200",
                  i === active
                    ? "border-brand-primary shadow-[0_0_12px_rgba(245,166,35,0.3)]"
                    : "border-brand-border opacity-60 hover:opacity-100 hover:border-brand-border"
                )}
              >
                <Image
                  src={img.image}
                  alt={img.alt_text || `${productName} view ${i + 1}`}
                  fill
                  sizes="72px"
                  className="object-cover"
                  placeholder="blur"
                  blurDataURL={PLACEHOLDER}
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Lightbox ────────────────────────────────────────────────────── */}
      {lightbox && (
        <div
          className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex items-center justify-center"
          onClick={() => setLightbox(false)}
        >
          {/* Close */}
          <button
            className="absolute top-4 right-4 p-2.5 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-colors z-10"
            onClick={() => setLightbox(false)}
          >
            <X className="h-6 w-6" />
          </button>

          {/* Counter */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-white/10 text-white text-sm font-medium">
            {active + 1} / {count}
          </div>

          {/* Main lightbox image */}
          <div
            className="relative w-full h-full max-w-4xl max-h-[90vh] mx-8"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={current.image}
              alt={current.alt_text || productName}
              fill
              sizes="90vw"
              className="object-contain"
              priority
            />
          </div>

          {/* Nav arrows */}
          {count > 1 && (
            <>
              <button
                className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
                onClick={(e) => { e.stopPropagation(); prev(); }}
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
                onClick={(e) => { e.stopPropagation(); next(); }}
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </>
          )}

          {/* Thumbnail strip in lightbox */}
          {count > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              {images.map((img, i) => (
                <button
                  key={img.id}
                  onClick={(e) => { e.stopPropagation(); goTo(i); }}
                  className={cn(
                    "relative w-12 h-12 rounded-lg overflow-hidden border-2 transition-all",
                    i === active ? "border-brand-primary" : "border-white/20 opacity-50 hover:opacity-80"
                  )}
                >
                  <Image src={img.image} alt={`View ${i + 1}`} fill sizes="48px" className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}
