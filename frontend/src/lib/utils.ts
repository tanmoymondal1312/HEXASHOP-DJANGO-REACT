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
 * Convert relative Django media paths (/media/...) to absolute backend URLs.
 * Returns null when no URL is given (shows placeholder in UI).
 */
export function resolveImageUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  const origin = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1")
    .replace(/\/api\/v1\/?$/, "");
  return `${origin}${url}`;
}
