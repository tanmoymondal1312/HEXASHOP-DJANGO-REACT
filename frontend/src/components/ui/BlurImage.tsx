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
  /** Applied to the real image (e.g. object-cover + hover transforms). */
  className?: string;
  onError?: () => void;
}

/**
 * Professional blur-up image: paints the ~400-byte LQIP immediately
 * (blurred + slightly scaled to hide pixelation) with a champagne
 * shimmer sweeping over it; when the real image finishes loading
 * the placeholder fades away.
 *
 * Parent must be position:relative with a size.
 */
export default function BlurImage({
  src,
  alt,
  blur,
  sizes,
  priority,
  className,
  onError,
}: Props) {
  const [loaded, setLoaded] = useState(false);

  const isLocal = src.includes("localhost") || src.includes("/media/");

  return (
    <>
      {/* LQIP layer — z-index:1, sits behind the image */}
      <div
        aria-hidden
        className="hx-blur-layer"
        style={{
          opacity: loaded ? 0 : 1,
          backgroundImage: blur ? `url(${blur})` : undefined,
          backgroundColor: blur ? undefined : "#10151f",
        }}
      />
      {/* Shimmer sweep — z-index:2 */}
      {!loaded && <div aria-hidden className="hx-blur-shimmer" />}

      {/* Real image — z-index:3, always above blur layers */}
      {isLocal ? (
        <img
          src={src}
          alt={alt}
          loading={priority ? "eager" : "lazy"}
          draggable={false}
          className={className}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            zIndex: 3,
          }}
          onLoad={() => setLoaded(true)}
          onError={onError}
        />
      ) : (
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          className={className}
          style={{ zIndex: 3 }}
          onLoad={() => setLoaded(true)}
          onError={onError}
        />
      )}
    </>
  );
}
