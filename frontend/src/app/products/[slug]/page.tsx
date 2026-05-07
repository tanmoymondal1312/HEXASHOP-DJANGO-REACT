import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  Shield, Truck, RefreshCcw, Package, ChevronRight, Star
} from "lucide-react";
import { productsApi } from "@/lib/api";
import { ProductGallery } from "@/components/products/ProductGallery";
import { ProductJsonLd, BreadcrumbJsonLd } from "@/components/seo/JsonLd";
import { AddToCartSection } from "./AddToCartSection";
import { ProductCard } from "@/components/products/ProductCard";
import { StarRating } from "@/components/ui/StarRating";
import { formatPrice } from "@/lib/utils";
import type { Product } from "@/types";

interface PageProps {
  params: { slug: string };
}

async function getProduct(slug: string): Promise<Product | null> {
  try {
    const { data } = await productsApi.detail(slug);
    return data;
  } catch {
    return null;
  }
}

async function getRelated(slug: string): Promise<Product[]> {
  try {
    const { data } = await productsApi.related(slug);
    return (data as Product[]).slice(0, 4);
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const product = await getProduct(params.slug);
  if (!product) return { title: "Product Not Found" };
  return {
    title: product.meta_title || product.name,
    description:
      product.meta_description ||
      product.short_description ||
      product.description?.slice(0, 155) ||
      "",
    openGraph: {
      title: product.name,
      description: product.short_description || "",
      images: product.images?.[0] ? [{ url: product.images[0].image }] : [],
    },
    alternates: { canonical: `/products/${product.slug}` },
  };
}

export const revalidate = 3600;

const TRUST = [
  { icon: Shield,     text: "Secure payment" },
  { icon: Truck,      text: "Free shipping over $50" },
  { icon: RefreshCcw, text: "30-day returns" },
  { icon: Package,    text: "Quality guaranteed" },
];

export default async function ProductDetailPage({ params }: PageProps) {
  const [product, related] = await Promise.all([
    getProduct(params.slug),
    getRelated(params.slug),
  ]);

  if (!product) notFound();

  const categoryName =
    typeof product.category === "object" && "name" in product.category
      ? product.category.name
      : product.category_name || "";

  const categorySlug =
    typeof product.category === "object" && "slug" in product.category
      ? (product.category as { slug: string }).slug
      : "";

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://hexashop.com";
  const productUrl = `${siteUrl}/products/${product.slug}`;

  const savingsAmount =
    product.compare_at_price && product.discount_percentage
      ? parseFloat(product.compare_at_price) - parseFloat(product.base_price)
      : null;

  return (
    <>
      <ProductJsonLd product={product} url={productUrl} />
      <BreadcrumbJsonLd
        items={[
          { name: "Shop", url: `${siteUrl}/shop` },
          { name: categoryName, url: `${siteUrl}/categories/${categorySlug}` },
          { name: product.name, url: productUrl },
        ]}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs text-brand-muted mb-6">
          <Link href="/shop" className="hover:text-white transition-colors">Shop</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          {categorySlug && (
            <>
              <Link href={`/categories/${categorySlug}`} className="hover:text-white transition-colors">
                {categoryName}
              </Link>
              <ChevronRight className="h-3.5 w-3.5" />
            </>
          )}
          <span className="text-gray-400 truncate max-w-[200px]">{product.name}</span>
        </nav>

        {/* ── Main product grid ──────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 xl:gap-16">

          {/* Left: Gallery */}
          <ProductGallery images={product.images || []} productName={product.name} />

          {/* Right: Info */}
          <div className="flex flex-col gap-5">

            {/* Category + badges */}
            <div className="flex items-center gap-2 flex-wrap">
              {categorySlug && (
                <Link
                  href={`/categories/${categorySlug}`}
                  className="text-xs font-semibold text-brand-primary bg-brand-primary/10 border border-brand-primary/20 px-3 py-1 rounded-full hover:bg-brand-primary/20 transition-colors"
                >
                  {categoryName}
                </Link>
              )}
              {product.is_featured && (
                <span className="text-xs font-semibold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 rounded-full">
                  ⭐ Featured
                </span>
              )}
              {product.discount_percentage && (
                <span className="text-xs font-bold text-red-400 bg-red-500/10 border border-red-500/20 px-3 py-1 rounded-full">
                  -{product.discount_percentage}% OFF
                </span>
              )}
            </div>

            {/* Product name */}
            <h1 className="text-2xl sm:text-3xl font-black leading-tight text-white">
              {product.name}
            </h1>

            {/* Rating row */}
            {(product.review_count > 0 || parseFloat(product.avg_rating) > 0) && (
              <div className="flex items-center gap-3">
                <StarRating
                  rating={parseFloat(product.avg_rating)}
                  count={product.review_count}
                  size="md"
                />
                {product.sold_count && product.sold_count > 0 ? (
                  <span className="text-xs text-brand-muted">
                    · {product.sold_count} sold
                  </span>
                ) : null}
              </div>
            )}

            {/* Price block */}
            <div className="bg-brand-surface border border-brand-border rounded-2xl p-4 flex items-start gap-4">
              <div className="flex-1">
                <div className="flex items-baseline gap-3 flex-wrap">
                  <span className="text-4xl font-black text-brand-primary">
                    {formatPrice(product.base_price)}
                  </span>
                  {product.compare_at_price && (
                    <span className="text-xl text-brand-muted line-through">
                      {formatPrice(product.compare_at_price)}
                    </span>
                  )}
                </div>
                {savingsAmount && savingsAmount > 0 && (
                  <p className="text-sm text-emerald-400 font-medium mt-1">
                    You save {formatPrice(savingsAmount.toFixed(2))}!
                  </p>
                )}
              </div>
              {product.discount_percentage && (
                <div className="text-center bg-red-500/20 border border-red-500/30 rounded-xl px-3 py-2">
                  <p className="text-2xl font-black text-red-400">-{product.discount_percentage}%</p>
                  <p className="text-[10px] text-red-400/70 font-medium">SALE</p>
                </div>
              )}
            </div>

            {/* Short description */}
            {product.short_description && (
              <p className="text-brand-muted leading-relaxed text-sm sm:text-base">
                {product.short_description}
              </p>
            )}

            {/* SKU */}
            {product.sku && (
              <p className="text-xs text-brand-muted">
                SKU: <span className="text-gray-400 font-mono">{product.sku}</span>
              </p>
            )}

            {/* Add to cart section */}
            <AddToCartSection product={product} />

            {/* Trust badges */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              {TRUST.map(({ icon: Icon, text }) => (
                <div
                  key={text}
                  className="flex items-center gap-2 bg-brand-dark/50 border border-brand-border rounded-xl px-3 py-2.5"
                >
                  <Icon className="h-4 w-4 text-brand-primary flex-shrink-0" />
                  <span className="text-xs text-brand-muted font-medium">{text}</span>
                </div>
              ))}
            </div>

          </div>
        </div>

        {/* ── Description + Reviews tabs ─────────────────────────────────── */}
        <div className="mt-14 border border-brand-border rounded-2xl overflow-hidden">

          {/* Description */}
          <div className="border-b border-brand-border px-6 py-5">
            <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
              <span className="w-1 h-4 bg-brand-primary rounded-full inline-block" />
              Product Description
            </h2>
            {product.description ? (
              <div className="text-sm text-brand-muted leading-relaxed whitespace-pre-line max-w-3xl">
                {product.description}
              </div>
            ) : (
              <p className="text-sm text-brand-muted italic">No description provided.</p>
            )}
          </div>

          {/* Details / Attributes */}
          {product.attributes && Object.keys(product.attributes).length > 0 && (
            <div className="border-b border-brand-border px-6 py-5">
              <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                <span className="w-1 h-4 bg-brand-secondary rounded-full inline-block" />
                Specifications
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {Object.entries(product.attributes).map(([key, val]) => (
                  <div key={key} className="bg-brand-dark rounded-xl px-4 py-3">
                    <p className="text-xs text-brand-muted capitalize">{key}</p>
                    <p className="text-sm font-medium text-white mt-0.5">{String(val)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reviews */}
          <div className="px-6 py-5">
            <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
              <span className="w-1 h-4 bg-indigo-500 rounded-full inline-block" />
              Customer Reviews
              {product.review_count > 0 && (
                <span className="text-xs font-normal text-brand-muted ml-1">
                  ({product.review_count})
                </span>
              )}
            </h2>

            {product.reviews && product.reviews.length > 0 ? (
              <div className="space-y-4 max-w-3xl">
                {product.reviews.slice(0, 6).map((review) => (
                  <div
                    key={review.id}
                    className="bg-brand-dark border border-brand-border rounded-2xl p-4"
                  >
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-primary/30 to-brand-secondary/30 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                          {review.user_name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-white">{review.user_name}</p>
                          {review.is_verified_purchase && (
                            <span className="text-[10px] text-emerald-400 font-medium">
                              ✓ Verified Purchase
                            </span>
                          )}
                        </div>
                      </div>
                      <StarRating rating={review.rating} size="sm" />
                    </div>
                    {review.title && (
                      <p className="text-sm font-semibold text-white mb-1">{review.title}</p>
                    )}
                    <p className="text-sm text-brand-muted leading-relaxed">{review.body}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 max-w-sm mx-auto">
                <Star className="h-10 w-10 text-brand-muted/30 mx-auto mb-3" />
                <p className="text-sm font-medium text-white mb-1">No reviews yet</p>
                <p className="text-xs text-brand-muted">
                  Be the first to share your experience with this product.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ── Related products ──────────────────────────────────────────── */}
        {related.length > 0 && (
          <div className="mt-14">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">You May Also Like</h2>
              {categorySlug && (
                <Link
                  href={`/categories/${categorySlug}`}
                  className="text-sm text-brand-primary hover:underline flex items-center gap-1"
                >
                  See all <ChevronRight className="h-4 w-4" />
                </Link>
              )}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}

      </div>
    </>
  );
}
