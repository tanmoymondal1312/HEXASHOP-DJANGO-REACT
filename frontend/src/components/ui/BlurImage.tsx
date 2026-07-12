"use client";

import { useState } from "react";
import Image from "next/image";

interface Props {
  src: string;
  alt: string;
  /** Tiny base64 LQIP data-URI from the API (blur_data / primary_image_blur). */
  blur?: string | null;
  sizes?: string;
  priority?: boolean;
  /** Applied to the real <Image> (e.g. object-cover + hover transforms). */
  className?: string;
  onError?: () => void;
}

/**
 * Professional blur-up image (fill layout): paints the ~400-byte LQIP
 * immediately (blurred + slightly scaled to hide pixelation) with a champagne
 * shimmer sweeping over it; when the real image finishes loading it fades in
 * and the placeholder layers fade away. Parent must be position:relative with
 * a size (all product cards/galleries here already are).
 */
export default function BlurImage({ src, alt, blur, sizes, priority, className, onError }: Props) {
  const [loaded, setLoaded] = useState(false);

  return (
    <>
      {/* LQIP layer */}
      <div
        aria-hidden
        className="hx-blur-layer"
        style={{
          opacity: loaded ? 0 : 1,
          backgroundImage: blur ? `url(${blur})` : undefined,
          backgroundColor: blur ? undefined : "#10151f",
        }}
      />
      {/* shimmer sweep */}
      {!loaded && <div aria-hidden className="hx-blur-shimmer" />}

      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        className={className}
        style={{ opacity: loaded ? 1 : 0, transition: "opacity 0.45s ease" }}
        unoptimized={src.includes("localhost") || src.includes("/media/")}
        onLoad={() => setLoaded(true)}
        onError={onError}
      />
    </>
  );
}
