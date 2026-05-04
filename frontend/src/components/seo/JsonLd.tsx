import { Product } from "@/types";

interface ProductJsonLdProps {
  product: Product;
  url: string;
}

export function ProductJsonLd({ product, url }: ProductJsonLdProps) {
  const price = product.base_price;
  const image =
    product.images?.[0]?.image ||
    product.primary_image ||
    "https://hexashop.com/og-image.jpg";

  const schema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.short_description || product.description,
    image,
    url,
    sku: product.sku,
    brand: {
      "@type": "Brand",
      name: (product.brand as { name: string } | null)?.name || "HEXASHOP",
    },
    aggregateRating:
      product.review_count > 0
        ? {
            "@type": "AggregateRating",
            ratingValue: product.avg_rating,
            reviewCount: product.review_count,
          }
        : undefined,
    offers: {
      "@type": "Offer",
      url,
      priceCurrency: "USD",
      price,
      availability:
        product.variants && product.variants.some((v) => v.is_in_stock)
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      seller: { "@type": "Organization", name: "HEXASHOP" },
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function WebsiteJsonLd() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "HEXASHOP",
    url: "https://hexashop.com",
    potentialAction: {
      "@type": "SearchAction",
      target: "https://hexashop.com/search?q={search_term_string}",
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function BreadcrumbJsonLd({ items }: { items: { name: string; url: string }[] }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
