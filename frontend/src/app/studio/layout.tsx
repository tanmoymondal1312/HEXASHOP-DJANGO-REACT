"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/store/authStore";

/**
 * Staff-only gate for the Hero Builder studio. Reuses the storefront JWT-cookie
 * auth (authStore → /auth/me/). Non-staff users are bounced to login.
 */
export default function StudioLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, isLoading, fetchUser } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated && !user) fetchUser();
  }, [isAuthenticated, user, fetchUser]);

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !user?.is_staff)) {
      router.replace(`/auth/login?next=${encodeURIComponent(pathname)}`);
    }
  }, [isLoading, isAuthenticated, user, router, pathname]);

  if (isLoading || !user) {
    return (
      <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "#070b12" }}>
        <div style={{ color: "#8b9ab5", fontSize: 14 }}>Loading studio…</div>
      </div>
    );
  }

  if (!user.is_staff) {
    return (
      <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "#070b12" }}>
        <div style={{ color: "#8b9ab5", fontSize: 14 }}>Access denied. Redirecting…</div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#070b12", color: "#e5e7eb" }}>
      <header
        style={{
          display: "flex", alignItems: "center", gap: 16,
          padding: "0.9rem 1.5rem", borderBottom: "1px solid #1f2d45",
          background: "#0f1520", position: "sticky", top: 0, zIndex: 30,
        }}
      >
        <Link href="/studio/hero" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
          <svg width="26" height="29" viewBox="0 0 34 38" fill="none">
            <polygon points="17,1 33,10 33,28 17,37 1,28 1,10" fill="none" stroke="#F5A623" strokeWidth="1.8" />
            <text x="17" y="23" textAnchor="middle" fill="#F5A623" fontSize="13" fontWeight="800">H</text>
          </svg>
          <span style={{ fontWeight: 800, fontSize: "1rem", color: "#fff" }}>
            HEXA<span style={{ color: "#1e90ff" }}>SHOP</span>
            <span style={{ color: "#8b9ab5", fontWeight: 600 }}>&nbsp;Studio</span>
          </span>
        </Link>
        <nav style={{ marginLeft: "auto", display: "flex", gap: 4 }}>
          <Link href="/studio/hero" style={navLink}>Hero Builder</Link>
          <Link href="/" style={navLink}>← Store</Link>
        </nav>
      </header>
      {children}
    </div>
  );
}

const navLink: React.CSSProperties = {
  padding: "0.4rem 0.8rem", borderRadius: 8, textDecoration: "none",
  color: "#8b9ab5", fontSize: "0.82rem", fontWeight: 600,
};
