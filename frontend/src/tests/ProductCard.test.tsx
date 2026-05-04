import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { ProductCard } from "@/components/products/ProductCard";
import type { Product } from "@/types";

vi.mock("next/image", () => ({
  default: ({ alt, ...props }: { alt: string; [key: string]: unknown }) => (
    <img alt={alt} {...props} />
  ),
}));
vi.mock("next/link", () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));
vi.mock("@/store/cartStore", () => ({ useCartStore: () => ({ addItem: vi.fn() }) }));
vi.mock("@/hooks/useWishlist", () => ({ useWishlist: () => ({ isInWishlist: () => false, toggle: vi.fn() }) }));
vi.mock("@/store/authStore", () => ({ useAuthStore: () => ({ isAuthenticated: false }) }));

const mockProduct: Product = {
  id: 1,
  name: "HEX Hoodie",
  slug: "hex-hoodie",
  base_price: "49.99",
  compare_at_price: "69.99",
  discount_percentage: 29,
  primary_image: null,
  category: { id: 1, name: "Hoodies", slug: "hoodies", description: "", image: null, children: [], sort_order: 0 },
  category_name: "Hoodies",
  brand_name: "Hexa Brand",
  avg_rating: "4.5",
  review_count: 120,
  is_featured: true,
};

describe("ProductCard", () => {
  it("renders product name", () => {
    render(<ProductCard product={mockProduct} />);
    expect(screen.getByText("HEX Hoodie")).toBeDefined();
  });

  it("renders price", () => {
    render(<ProductCard product={mockProduct} />);
    expect(screen.getByText("$49.99")).toBeDefined();
  });

  it("renders discount badge", () => {
    render(<ProductCard product={mockProduct} />);
    expect(screen.getByText("-29%")).toBeDefined();
  });

  it("renders original price with strikethrough", () => {
    render(<ProductCard product={mockProduct} />);
    expect(screen.getByText("$69.99")).toBeDefined();
  });
});
