import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { productsApi } from "@/lib/api";
import { ProductGallery } from "@/components/products/ProductGallery";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { ProductJsonLd, BreadcrumbJsonLd } from "@/components/seo/JsonLd";
import { AddToCartSection } from "./AddToCartSection";
import { ProductGrid } from "@/components/products/ProductGrid";
import { ProductGridSkeleton } from "@/components/ui/Skeleton";
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

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const product = await getProduct(params.slug);
  if (!product) return { title: "Product Not Found" };

  return {
    title: product.meta_title || product.name,
    description: product.meta_description || product.short_description || product.description?.slice(0, 155),
    openGraph: {
      title: product.name,
      description: product.short_description || "",
      images: product.images?.[0]
        ? [{ url: product.images[0].image, width: 800, height: 800 }]
        : [],
    },
    alternates: { canonical: `/products/${product.slug}` },
    robots: { index: true, follow: true },
  };
}

export const revalidate = 3600; // ISR: revalidate every hour

export default async function ProductDetailPage({ params }: PageProps) {
  const product = await getProduct(params.slug);
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <Breadcrumb
          items={[
            { label: "Shop", href: "/shop" },
            { label: categoryName, href: `/categories/${categorySlug}` },
            { label: product.name },
          ]}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mt-8">
          {/* Gallery */}
          <ProductGallery images={product.images || []} productName={product.name} />

          {/* Details */}
          <div className="space-y-5">
            {/* Title & rating */}
            <div>
              <p className="text-sm text-brand-muted">{categoryName}</p>
              <h1 className="text-3xl font-bold mt-1">{product.name}</h1>
              <div className="flex items-center gap-3 mt-2">
                <StarRating
                  rating={parseFloat(product.avg_rating)}
                  count={product.review_count}
                  size="md"
                />
              </div>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3">
              <span className="text-4xl font-bold text-brand-primary">
                {formatPrice(product.base_price)}
              </span>
              {product.compare_at_price && (
                <>
                  <span className="text-xl text-brand-muted line-through">
                    {formatPrice(product.compare_at_price)}
                  </span>
                  {product.discount_percentage && (
                    <span className="badge bg-red-500/20 text-red-400">
                      -{product.discount_percentage}%
                    </span>
                  )}
                </>
              )}
            </div>

            {/* Short description */}
            {product.short_description && (
              <p className="text-brand-muted leading-relaxed">{product.short_description}</p>
            )}

            {/* Add to cart with variant selection */}
            <AddToCartSection product={product} />

            {/* Tabs: Description / Reviews */}
            <div className="mt-8 border-t border-brand-border pt-6">
              <h3 className="font-semibold mb-3">Description</h3>
              <div className="text-sm text-brand-muted leading-relaxed whitespace-pre-line">
                {product.description}
              </div>
            </div>

            {/* Reviews */}
            {product.reviews && product.reviews.length > 0 && (
              <div className="border-t border-brand-border pt-6">
                <h3 className="font-semibold mb-4">
                  Reviews ({product.review_count})
                </h3>
                <div className="space-y-4">
                  {product.reviews.slice(0, 5).map((review) => (
                    <div key={review.id} className="bg-brand-dark rounded-xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-brand-primary/20 flex items-center justify-center text-brand-primary font-bold text-sm">
                            {review.user_name.charAt(0).toUpperCase()}
                          </div>
                          <span className="text-sm font-medium">{review.user_name}</span>
                          {review.is_verified_purchase && (
                            <span className="badge bg-green-500/20 text-green-400">Verified</span>
                          )}
                        </div>
                        <StarRating rating={review.rating} size="sm" />
                      </div>
                      {review.title && <p className="text-sm font-medium mb-1">{review.title}</p>}
                      <p className="text-sm text-brand-muted">{review.body}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Related products */}
        <div className="mt-16">
          <h2 className="text-xl font-bold mb-6">You May Also Like</h2>
          <Suspense fallback={<ProductGridSkeleton count={4} />}>
            <ProductGrid
              filters={{ category: categorySlug, ordering: "-sold_count" }}
            />
          </Suspense>
        </div>
      </div>
    </>
  );
}
