import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(amount: string | number): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(num);
}

export function formatRating(rating: string | number): number {
  return Math.round(parseFloat(String(rating)) * 10) / 10;
}

export function buildCloudinaryUrl(
  publicId: string,
  options: { width?: number; height?: number; format?: string } = {}
): string {
  const cloud = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  if (!cloud || !publicId) return publicId;
  const { width = 800, height = 800, format = "webp" } = options;
  return `https://res.cloudinary.com/${cloud}/image/upload/w_${width},h_${height},c_fill,f_${format}/${publicId}`;
}

export function debounce<T extends (...args: unknown[]) => void>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout>;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

export function truncate(text: string, length: number): string {
  return text.length > length ? text.slice(0, length) + "…" : text;
}

export function slugToTitle(slug: string): string {
  return slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export const FREE_SHIPPING_THRESHOLD = 75;

/**
 * Convert Django media URLs to absolute backend URLs using the configured API origin.
 * Handles three cases:
 *   1. Relative path  (/media/...)          → prepend configured origin
 *   2. Absolute URL with wrong host         → swap host to configured origin
 *      e.g. http://localhost:8000/media/... → http://192.168.0.110:8000/media/...
 *   3. External CDN URL (cloudinary, etc.)  → return as-is
 */
export function resolveImageUrl(url: string | null | undefined): string | null {
  if (!url) return null;

  const configuredOrigin = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1")
    .replace(/\/api\/v1\/?$/, "")
    .replace(/\/$/, "");

  // Relative path — just prepend origin
  if (url.startsWith("/")) {
    return `${configuredOrigin}${url}`;
  }

  // Absolute URL — replace origin so LAN IP is used instead of localhost
  if (url.startsWith("http://") || url.startsWith("https://")) {
    try {
      const u = new URL(url);
      // Only rewrite local/backend media URLs, not CDN URLs
      if (u.pathname.startsWith("/media/")) {
        const configured = new URL(configuredOrigin);
        u.hostname = configured.hostname;
        u.port     = configured.port;
        u.protocol = configured.protocol;
        return u.toString();
      }
    } catch {
      // malformed URL — return as-is
    }
    return url;
  }

  return url;
}
