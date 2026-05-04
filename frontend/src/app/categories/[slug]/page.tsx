import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { productsApi } from "@/lib/api";
import { ProductGrid } from "@/components/products/ProductGrid";
import { ProductGridSkeleton } from "@/components/ui/Skeleton";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { BreadcrumbJsonLd } from "@/components/seo/JsonLd";
import { slugToTitle } from "@/lib/utils";
import type { Category } from "@/types";

interface PageProps {
  params: { slug: string };
  searchParams: Record<string, string>;
}

async function findCategory(slug: string): Promise<Category | null> {
  try {
    const { data } = await productsApi.categories();
    const all: Category[] = data.flatMap((c: Category) => [c, ...(c.children || [])]);
    return all.find((c: Category) => c.slug === slug) || null;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const category = await findCategory(params.slug);
  const name = category?.name || slugToTitle(params.slug);
  return {
    title: name,
    description: category?.description || `Shop ${name} at HEXASHOP`,
    alternates: { canonical: `/categories/${params.slug}` },
  };
}

export const revalidate = 21600; // 6 hours

export default async function CategoryPage({ params, searchParams }: PageProps) {
  const category = await findCategory(params.slug);
  const name = category?.name || slugToTitle(params.slug);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://hexashop.com";

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Shop", url: `${siteUrl}/shop` },
          { name, url: `${siteUrl}/categories/${params.slug}` },
        ]}
      />

      {/* Hero banner */}
      <div className="bg-gradient-to-r from-brand-surface to-brand-dark border-b border-brand-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Breadcrumb items={[{ label: "Shop", href: "/shop" }, { label: name }]} />
          <h1 className="text-4xl font-bold mt-4">{name}</h1>
          {category?.description && (
            <p className="text-brand-muted mt-2 max-w-xl">{category.description}</p>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Suspense fallback={<ProductGridSkeleton count={12} />}>
          <ProductGrid
            filters={{
              category: params.slug,
              ordering: searchParams.ordering || "-created_at",
              ...searchParams,
            }}
          />
        </Suspense>
      </div>
    </>
  );
}
