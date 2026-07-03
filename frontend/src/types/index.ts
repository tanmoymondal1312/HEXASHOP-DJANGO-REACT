export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  image: string | null;
  children: Category[];
  sort_order: number;
}

export interface Brand {
  id: number;
  name: string;
  slug: string;
  logo: string | null;
}

export interface ProductImage {
  id: number;
  image: string;
  alt_text: string;
  sort_order: number;
  is_primary: boolean;
}

export interface ProductColor {
  id: number;
  name: string;
  hex_code: string;
  image_url: string | null;
  sort_order: number;
}

export interface ProductVariant {
  id: number;
  sku: string;
  color_id: number | null;
  color_name: string | null;
  size: string;
  price: string | null;
  effective_price: string;
  stock: number;
  is_active: boolean;
  is_in_stock: boolean;
  is_low_stock: boolean;
  low_stock_threshold?: number;
  // legacy
  attributes?: Record<string, string>;
  image?: ProductImage | null;
}

export interface Review {
  id: number;
  user_name: string;
  rating: number;
  title: string;
  body: string;
  is_verified_purchase: boolean;
  helpful_count: number;
  created_at: string;
}

export interface FirstVariant {
  id: number;
  is_in_stock: boolean;
  stock: number;
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  sku?: string;
  description?: string;
  short_description?: string;
  base_price: string;
  compare_at_price: string | null;
  discount_percentage: number | null;
  primary_image?: string | null;
  images?: ProductImage[];
  colors?: ProductColor[];
  variants?: ProductVariant[];
  category: Category | { name: string };
  brand?: Brand | null;
  category_name?: string;
  brand_name?: string | null;
  avg_rating: string;
  review_count: number;
  sold_count?: number;
  is_featured: boolean;
  first_variant?: FirstVariant | null;
  tags?: string[];
  attributes?: Record<string, unknown>;
  meta_title?: string;
  meta_description?: string;
  reviews?: Review[];
  created_at?: string;
  updated_at?: string;
}

export interface CartItem {
  id: number;
  product: number;
  product_name: string;
  product_slug: string;
  variant: number | null;
  variant_name: string | null;
  variant_attributes: Record<string, string> | null;
  quantity: number;
  unit_price: string;
  line_total: string;
  in_stock: boolean;
  image: string | null;
}

export interface Cart {
  id: number;
  items: CartItem[];
  total: string;
  item_count: number;
  shipping_cost: string;
  free_shipping_remaining: string;
}

export interface WishlistItem {
  id: number;
  product: Product;
  added_at: string;
}

export interface Wishlist {
  id: number;
  items: WishlistItem[];
}

export interface User {
  id: string;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  avatar: string | null;
  phone: string;
  is_email_verified: boolean;
  date_joined: string;
  is_staff?: boolean;
}

export interface Address {
  id: number;
  label: string;
  address_type: "shipping" | "billing";
  full_name: string;
  phone: string;
  street_address: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  is_default: boolean;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface SearchSuggestResponse {
  suggestions: string[];
  products: Product[];
  categories: { name: string; slug: string; parent: string | null }[];
}

export interface ProductFilters {
  q?: string;
  category?: string;
  brand?: string;
  min_price?: string;
  max_price?: string;
  size?: string;
  color?: string;
  in_stock?: boolean;
  on_sale?: boolean;
  ordering?: string;
}
