"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, ZoomIn } from "lucide-react";
import { ProductImage } from "@/types";
import { cn } from "@/lib/utils";

interface ProductGalleryProps {
  images: ProductImage[];
  productName: string;
}

export function ProductGallery({ images, productName }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [zoomed, setZoomed] = useState(false);

  const active = images[activeIndex];

  const prev = () => setActiveIndex((i) => (i === 0 ? images.length - 1 : i - 1));
  const next = () => setActiveIndex((i) => (i === images.length - 1 ? 0 : i + 1));

  if (!images.length) {
    return (
      <div className="aspect-square bg-brand-surface rounded-xl flex items-center justify-center text-brand-muted">
        No image available
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Main image */}
      <div className="relative aspect-square rounded-xl overflow-hidden bg-brand-surface group">
        <Image
          src={active.image}
          alt={active.alt_text || productName}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className={cn(
            "object-cover transition-transform duration-500",
            zoomed ? "scale-125 cursor-zoom-out" : "cursor-zoom-in"
          )}
          onClick={() => setZoomed(!zoomed)}
          priority
        />

        {/* Navigation arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-brand-dark/70 text-white hover:bg-brand-dark transition-colors opacity-0 group-hover:opacity-100"
              aria-label="Previous image"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={next}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-brand-dark/70 text-white hover:bg-brand-dark transition-colors opacity-0 group-hover:opacity-100"
              aria-label="Next image"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}

        <button
          className="absolute top-3 right-3 p-1.5 rounded-lg bg-brand-dark/70 text-white opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={() => setZoomed(!zoomed)}
          aria-label="Zoom"
        >
          <ZoomIn className="h-4 w-4" />
        </button>
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((img, i) => (
            <button
              key={img.id}
              onClick={() => setActiveIndex(i)}
              className={cn(
                "flex-shrink-0 relative w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors",
                i === activeIndex ? "border-brand-primary" : "border-brand-border"
              )}
            >
              <Image
                src={img.image}
                alt={img.alt_text || `${productName} ${i + 1}`}
                fill
                sizes="64px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
