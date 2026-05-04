import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronRight, Shield, Truck, RefreshCcw, Headphones } from "lucide-react";
import { productsApi } from "@/lib/api";
import { ProductCard } from "@/components/products/ProductCard";
import { ProductGridSkeleton } from "@/components/ui/Skeleton";
import { WebsiteJsonLd } from "@/components/seo/JsonLd";
import type { Product } from "@/types";

const TRUST_BADGES = [
  { icon: Shield, title: "Secure Payment", subtitle: "100% secure payment" },
  { icon: Truck, title: "Fast Delivery", subtitle: "Quick & reliable delivery" },
  { icon: RefreshCcw, title: "Easy Returns", subtitle: "30-day return policy" },
  { icon: Headphones, title: "24/7 Support", subtitle: "Always here to help" },
];

async function FeaturedProducts() {
  let products: Product[] = [];
  try {
    const { data } = await productsApi.featured();
    products = data;
  } catch {
    return null;
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      {products.map((p, i) => (
        <ProductCard key={p.id} product={p} priority={i < 4} />
      ))}
    </div>
  );
}

export default function HomePage() {
  return (
    <>
      <WebsiteJsonLd />

      {/* Hero Section */}
      <section className="relative min-h-[calc(100vh-5rem)] flex items-center bg-hero-gradient overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-3 gap-8 py-12">
          {/* Sidebar categories */}
          <div className="hidden lg:block">
            <div className="card p-4">
              <h3 className="text-sm font-bold text-brand-primary flex items-center gap-2 mb-4 pb-3 border-b border-brand-border">
                <span className="w-4 h-0.5 bg-brand-primary inline-block" />
                CATEGORIES
              </h3>
              <ul className="space-y-2">
                {["Hoodies", "Jackets", "T-Shirts", "Shoes", "Accessories", "Bags", "Watches", "Gadgets"].map((cat) => (
                  <li key={cat}>
                    <Link
                      href={`/categories/${cat.toLowerCase()}`}
                      className="flex items-center justify-between py-2 text-sm text-brand-muted hover:text-white hover:translate-x-1 transition-all"
                    >
                      <span>{cat}</span>
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  </li>
                ))}
              </ul>
              <div className="mt-4 pt-4 border-t border-brand-border">
                <Link
                  href="/shop?on_sale=true"
                  className="flex items-center justify-between bg-brand-primary/10 border border-brand-primary/30 rounded-xl p-3 hover:bg-brand-primary/20 transition-colors"
                >
                  <div>
                    <p className="text-xs font-semibold text-brand-primary">Special Offer!</p>
                    <p className="text-xs text-gray-400 mt-0.5">Up to <strong className="text-brand-primary">40% OFF</strong></p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-brand-primary" />
                </Link>
              </div>
            </div>
          </div>

          {/* Hero content */}
          <div className="lg:col-span-2 flex flex-col justify-center">
            <div className="relative">
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black leading-none tracking-tight">
                <span className="text-white">HEXA</span>
                <span className="text-brand-secondary">SHOP</span>
              </h1>
              <p className="text-xs sm:text-sm tracking-[0.4em] text-brand-muted mt-2 uppercase">
                Style That Defines You
              </p>
              <p className="mt-6 text-brand-muted max-w-md leading-relaxed">
                Discover the latest trends in fashion.<br />
                Premium quality. Best prices.
              </p>
              <div className="flex flex-wrap gap-4 mt-8">
                <Link href="/shop" className="btn-primary flex items-center gap-2">
                  Shop Now <ChevronRight className="h-4 w-4" />
                </Link>
                <Link href="/shop?is_featured=true" className="btn-secondary">
                  Explore Collection
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Decorative blue/gold geometric hex shape */}
        <div className="absolute right-0 top-0 bottom-0 w-1/2 pointer-events-none hidden xl:block">
          <div className="absolute inset-0 bg-gradient-to-l from-brand-secondary/5 to-transparent" />
          <div
            className="absolute top-1/2 right-16 -translate-y-1/2 w-[360px] h-[360px] border-2 border-brand-secondary/20 rotate-45 rounded-3xl"
            style={{ boxShadow: "0 0 80px rgba(30,144,255,0.1)" }}
          />
          <div
            className="absolute top-1/2 right-20 -translate-y-1/2 w-[300px] h-[300px] border border-brand-primary/10 rotate-45 rounded-2xl"
            style={{ boxShadow: "0 0 60px rgba(245,166,35,0.05)" }}
          />
        </div>
      </section>

      {/* Trust badges */}
      <section className="border-y border-brand-border bg-brand-surface/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-brand-border">
            {TRUST_BADGES.map(({ icon: Icon, title, subtitle }) => (
              <div key={title} className="flex items-center gap-3 py-5 px-6">
                <div className="p-2.5 rounded-xl bg-brand-primary/10 text-brand-primary flex-shrink-0">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold">{title}</p>
                  <p className="text-xs text-brand-muted">{subtitle}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold">Featured Products</h2>
            <p className="text-sm text-brand-muted mt-1">Handpicked for you</p>
          </div>
          <Link href="/shop" className="btn-secondary text-sm px-4 py-2">
            View All
          </Link>
        </div>
        <Suspense fallback={<ProductGridSkeleton count={4} />}>
          <FeaturedProducts />
        </Suspense>
      </section>

      {/* Category Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { title: "Men's Hoodies", slug: "hoodies", desc: "Discover our premium collection." },
            { title: "Urban Sneakers", slug: "shoes", desc: "Step up your footwear game." },
          ].map(({ title, slug, desc }) => (
            <Link
              key={slug}
              href={`/categories/${slug}`}
              className="relative group rounded-2xl overflow-hidden border border-brand-border bg-gradient-to-br from-brand-surface to-brand-dark h-48 flex items-center px-8 hover:border-brand-primary transition-colors"
            >
              <div>
                <h3 className="text-2xl font-bold text-white group-hover:text-brand-primary transition-colors">
                  {title}
                </h3>
                <p className="text-sm text-brand-muted mt-1">{desc}</p>
              </div>
              <ChevronRight className="absolute right-6 top-1/2 -translate-y-1/2 h-6 w-6 text-brand-primary opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
