import axios from "axios";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
  timeout: 10000,
});

// Refresh token on 401
let refreshing = false;
let refreshQueue: Array<(token?: string) => void> = [];

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      if (refreshing) {
        return new Promise((resolve, reject) => {
          refreshQueue.push((token) => {
            if (token) resolve(api(original));
            else reject(error);
          });
        });
      }
      original._retry = true;
      refreshing = true;
      try {
        await api.post("/auth/token/refresh/");
        refreshQueue.forEach((cb) => cb("ok"));
        refreshQueue = [];
        return api(original);
      } catch {
        refreshQueue.forEach((cb) => cb());
        refreshQueue = [];

        // Do NOT redirect when:
        // 1. The original request was /auth/me — it naturally returns 401 for
        //    anonymous/guest users; the authStore catch handles it gracefully.
        // 2. We're already on an /auth/* page — prevents the infinite loop.
        const isAuthCheck = !!original.url?.includes("/auth/me");
        const onAuthPage =
          typeof window !== "undefined" &&
          window.location.pathname.startsWith("/auth/");

        if (typeof window !== "undefined" && !isAuthCheck && !onAuthPage) {
          window.location.href = "/auth/login";
        }
      } finally {
        refreshing = false;
      }
    }
    return Promise.reject(error);
  }
);

// ─── Auth ────────────────────────────────────────────────────────────────────
export const authApi = {
  register: (data: Record<string, string>) => api.post("/auth/register/", data),
  login: (email: string, password: string, guestKey?: string) =>
    api.post("/auth/login/", { email, password, guest_session_key: guestKey }),
  logout: () => api.post("/auth/logout/"),
  me: () => api.get("/auth/me/"),
  updateMe: (data: Partial<{ first_name: string; last_name: string; phone: string }>) =>
    api.patch("/auth/me/", data),
};

// ─── Products ────────────────────────────────────────────────────────────────
export const productsApi = {
  list: (params?: Record<string, string | number | boolean>) =>
    api.get("/products/", { params }),
  detail: (slug: string) => api.get(`/products/${slug}/`),
  featured: () => api.get("/products/featured/"),
  viral: () => api.get("/products/viral/"),
  related: (slug: string) => api.get(`/products/${slug}/related/`),
  recentlyViewed: () => api.get("/products/recently-viewed/"),
  categories: () => api.get("/products/categories/"),
  searchSuggest: (q: string) => api.get("/products/search/suggest/", { params: { q } }),
  createReview: (productSlug: string, data: Record<string, unknown>) =>
    api.post(`/products/${productSlug}/reviews/`, data),
};

// ─── Cart ─────────────────────────────────────────────────────────────────────
export const cartApi = {
  get: (sessionKey?: string) =>
    api.get("/cart/", { params: sessionKey ? { session_key: sessionKey } : {} }),
  add: (variantId: number, quantity: number, sessionKey?: string) =>
    api.post("/cart/", { variant_id: variantId, quantity, session_key: sessionKey }),
  update: (itemId: number, quantity: number) =>
    api.patch(`/cart/items/${itemId}/`, { quantity }),
  remove: (itemId: number) => api.delete(`/cart/items/${itemId}/`),
};

// ─── Wishlist ─────────────────────────────────────────────────────────────────
export const wishlistApi = {
  get: () => api.get("/wishlist/"),
  toggle: (productId: number) => api.post("/wishlist/", { product_id: productId }),
  check: (productId: number) => api.get(`/wishlist/check/${productId}/`),
};

// ─── Site Settings ────────────────────────────────────────────────────────────
export const siteApi = {
  settings: () => api.get("/settings/"),
};

// ─── Notifications ────────────────────────────────────────────────────────────
export const notificationsApi = {
  subscribeStockAlert: (email: string, variantId: number) =>
    api.post("/notifications/stock-alert/", { email, variant_id: variantId }),
  subscribeNewsletter: (email: string) =>
    api.post("/notifications/newsletter/", { email }),
};
