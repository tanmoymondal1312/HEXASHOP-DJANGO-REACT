import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { Filter } from "lucide-react";
import { productsApi } from "@/lib/api";
import { ProductFilters } from "@/components/products/ProductFilters";
import { SortSelect } from "./SortSelect";
import { Pagination } from "./Pagination";
import { resolveImageUrl } from "@/lib/utils";
import type { Category, Product, PaginatedResponse } from "@/types";

// ─── Constants ────────────────────────────────────────────────────────────────

const PAGE_SIZE = 20;
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://hexashop.com";

// ─── SEO metadata ─────────────────────────────────────────────────────────────

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Record<string, string>;
}): Promise<Metadata> {
  const { q, category, page } = searchParams;
  const pageNum = parseInt(page || "1");

  const baseTitle = q
    ? `Search: "${q}"`
    : category
    ? `${category.charAt(0).toUpperCase() + category.slice(1)}`
    : "Shop All Products";

  const title = `${baseTitle} — HEXASHOP`;
  const description =
    "Browse 200+ premium fashion products at HEXASHOP — hoodies, jackets, sneakers, dresses, accessories and more. Free shipping on orders over $50. Easy 30-day returns.";

  return {
    title,
    description,
    keywords:
      "shop, fashion, clothing, hoodies, jackets, sneakers, dresses, accessories, HEXASHOP",
    robots: {
      index: pageNum === 1 && !q,
      follow: true,
      googleBot: { index: pageNum === 1 && !q, follow: true, "max-image-preview": "large" },
    },
    alternates: { canonical: `${SITE_URL}/shop` },
    openGraph: {
      type: "website",
      title,
      description,
      url: `${SITE_URL}/shop`,
      siteName: "HEXASHOP",
      images: [{ url: `${SITE_URL}/og-image.jpg`, width: 1200, height: 630 }],
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

// ─── Data fetchers ────────────────────────────────────────────────────────────

async function getCategories(): Promise<Category[]> {
  try {
    const { data } = await productsApi.categories();
    return data ?? [];
  } catch {
    return [];
  }
}

async function getProducts(
  sp: Record<string, string>
): Promise<PaginatedResponse<Product>> {
  const params: Record<string, string | number | boolean> = {
    page_size: PAGE_SIZE,
    ordering: sp.ordering || "-created_at",
    page: parseInt(sp.page || "1"),
  };
  if (sp.q)         params.q         = sp.q;
  if (sp.category)  params.category  = sp.category;
  if (sp.min_price) params.min_price = sp.min_price;
  if (sp.max_price) params.max_price = sp.max_price;
  if (sp.in_stock === "true") params.in_stock = true;
  if (sp.on_sale  === "true") params.on_sale  = true;

  try {
    const { data } = await productsApi.list(params);
    return data;
  } catch {
    return { count: 0, next: null, previous: null, results: [] };
  }
}

// ─── JSON-LD structured data ──────────────────────────────────────────────────

function ShopJsonLd({
  products,
  count,
  page,
}: {
  products: Product[];
  count: number;
  page: number;
}) {
  const data = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "HEXASHOP — Fashion Products",
    url: `${SITE_URL}/shop`,
    numberOfItems: count,
    itemListElement: products.slice(0, 10).map((p, i) => ({
      "@type": "ListItem",
      position: (page - 1) * PAGE_SIZE + i + 1,
      item: {
        "@type": "Product",
        name: p.name,
        url: `${SITE_URL}/products/${p.slug}`,
        image: p.primary_image,
        offers: {
          "@type": "Offer",
          price: p.base_price,
          priceCurrency: "USD",
          availability: "https://schema.org/InStock",
          seller: { "@type": "Organization", name: "HEXASHOP" },
        },
      },
    })),
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

// ─── Inline product card (server-rendered, native <img>) ─────────────────────

function ShopProductCard({ product, priority }: { product: Product; priority?: boolean }) {
  const src = resolveImageUrl(product.primary_image ?? null);
  const price = parseFloat(product.base_price).toFixed(2);
  const compare = product.compare_at_price
    ? parseFloat(product.compare_at_price).toFixed(2)
    : null;
  const pct = product.discount_percentage;

  return (
    <article>
      <Link
        href={`/products/${product.slug}`}
        className="group block bg-brand-surface border border-brand-border rounded-xl overflow-hidden hover:border-brand-primary/40 transition-all duration-300 hover:shadow-lg hover:shadow-black/40"
        aria-label={`${product.name} — $${price}`}
      >
        {/* Image */}
        <div
          className="relative overflow-hidden"
          style={{ aspectRatio: "4/3", background: "#0d1117" }}
        >
          {src ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={src}
              alt={product.name}
              loading={priority ? "eager" : "lazy"}
              decoding="async"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div
              className="w-full h-full flex items-center justify-center"
              style={{ background: "linear-gradient(135deg,#1a1f2e,#0d1117)" }}
              aria-hidden="true"
            >
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="1.5" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}

          {/* Discount badge */}
          {pct && (
            <span className="absolute top-2 left-2 text-[10px] font-bold bg-red-500 text-white px-1.5 py-0.5 rounded-md leading-none">
              -{pct}%
            </span>
          )}
        </div>

        {/* Info */}
        <div className="p-2.5">
          <p className="text-[10px] text-brand-muted uppercase tracking-wider truncate mb-0.5">
            {product.category_name}
          </p>
          <h3 className="text-xs font-semibold text-white line-clamp-2 leading-snug group-hover:text-brand-primary transition-colors mb-1.5">
            {product.name}
          </h3>
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-bold text-brand-primary">${price}</span>
            {compare && (
              <span className="text-[11px] text-brand-muted line-through">${compare}</span>
            )}
          </div>
        </div>
      </Link>
    </article>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

interface Props {
  searchParams: Record<string, string>;
}

export default async function ShopPage({ searchParams }: Props) {
  const currentPage = Math.max(1, parseInt(searchParams.page || "1"));

  const [categories, productsData] = await Promise.all([
    getCategories(),
    getProducts(searchParams),
  ]);

  const { count, results: products } = productsData;
  const totalPages = Math.ceil(count / PAGE_SIZE);

  const flatCategories = categories.flatMap((c) => [
    { name: c.name, slug: c.slug },
    ...(c.children || []).map((ch) => ({ name: ch.name, slug: ch.slug })),
  ]);

  const ordering = searchParams.ordering || "-created_at";
  const hasActiveFilters = [
    searchParams.category,
    searchParams.min_price,
    searchParams.max_price,
    searchParams.in_stock,
    searchParams.on_sale,
    searchParams.size,
    searchParams.color,
  ].some(Boolean);

  return (
    <>
      <ShopJsonLd products={products} count={count} page={currentPage} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Page header */}
        <header className="mb-6">
          <h1 className="text-2xl font-bold">Shop</h1>
          <p className="text-sm text-brand-muted mt-1">
            {searchParams.q
              ? `Search results for "${searchParams.q}"`
              : `Showing all products`}
            {count > 0 && (
              <span className="ml-1 text-brand-primary font-semibold">
                ({count} items)
              </span>
            )}
          </p>
        </header>

        <div className="flex gap-7">

          {/* ── Sticky sidebar ──────────────────────────────────────── */}
          <aside
            className="hidden lg:block w-52 flex-shrink-0"
            aria-label="Product filters"
          >
            {/* sticky: top = navbar(64px) + 16px gap */}
            <div
              className="bg-brand-surface border border-brand-border rounded-xl p-4"
              style={{
                position: "sticky",
                top: "80px",
                maxHeight: "calc(100vh - 96px)",
                overflowY: "auto",
              }}
            >
              <Suspense fallback={null}>
                <ProductFilters categories={flatCategories} />
              </Suspense>
            </div>
          </aside>

          {/* ── Main content ─────────────────────────────────────────── */}
          <section className="flex-1 min-w-0" aria-label="Product listing">

            {/* Toolbar */}
            <div className="flex items-center justify-between mb-5 gap-4">
              <div className="flex items-center gap-2 text-sm text-brand-muted">
                {hasActiveFilters && (
                  <Link
                    href="/shop"
                    className="flex items-center gap-1 text-brand-primary text-xs hover:underline"
                    aria-label="Clear all filters"
                  >
                    <Filter className="h-3 w-3" />
                    Clear filters
                  </Link>
                )}
                <span>{count} products found</span>
              </div>
              <Suspense fallback={null}>
                <SortSelect current={ordering} />
              </Suspense>
            </div>

            {/* Product grid */}
            {products.length > 0 ? (
              <div
                className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3"
                role="list"
                aria-label="Products"
              >
                {products.map((product, i) => (
                  <div key={product.id} role="listitem">
                    <ShopProductCard
                      product={product}
                      priority={i < 5}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-24" role="status" aria-live="polite">
                <p className="text-lg text-brand-muted">No products found</p>
                <p className="text-sm text-brand-muted mt-2">
                  Try adjusting your filters or{" "}
                  <Link href="/shop" className="text-brand-primary hover:underline">
                    browse all products
                  </Link>
                </p>
              </div>
            )}

            {/* ── Pagination ──────────────────────────────────────────── */}
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={count}
              pageSize={PAGE_SIZE}
              searchParams={searchParams}
            />

          </section>
        </div>
      </div>
    </>
  );
}
