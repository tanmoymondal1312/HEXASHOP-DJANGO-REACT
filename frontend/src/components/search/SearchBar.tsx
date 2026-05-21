"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Search, X, TrendingUp, Tag, Loader2 } from "lucide-react";
import { useDebounce } from "@/hooks/useDebounce";
import { useQuery } from "@tanstack/react-query";
import { productsApi } from "@/lib/api";
import { resolveImageUrl } from "@/lib/utils";
import type { SearchSuggestResponse } from "@/types";

const POPULAR = ["Sneakers", "Jeans", "Blazer", "Saree", "Formal Shirt", "Watch", "Handbag"];

interface SearchBarProps {
  onClose?: () => void;
  autoFocus?: boolean;
  placeholder?: string;
}

export function SearchBar({
  onClose,
  autoFocus = false,
  placeholder = "Search products, brands, categories…",
}: SearchBarProps) {
  const [query,       setQuery]       = useState("");
  const [open,        setOpen]        = useState(false);
  const [focusIdx,    setFocusIdx]    = useState(-1);
  const router     = useRouter();
  const inputRef   = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const debouncedQ = useDebounce(query, 280);

  // ── Fetch suggestions ──────────────────────────────────────────────────────
  const { data, isFetching } = useQuery<SearchSuggestResponse>({
    queryKey: ["search-suggest", debouncedQ],
    queryFn:  () => productsApi.searchSuggest(debouncedQ).then((r) => r.data),
    enabled:  debouncedQ.length >= 2,
    staleTime: 20_000,
  });

  // ── Build flat navigable item list for keyboard nav ───────────────────────
  type NavItem =
    | { kind: "suggestion"; value: string }
    | { kind: "category";   slug: string; name: string; parent: string | null }
    | { kind: "product";    slug: string; name: string };

  const navItems: NavItem[] = [];
  if (data && debouncedQ.length >= 2) {
    data.suggestions.forEach((s) => navItems.push({ kind: "suggestion", value: s }));
    data.categories.forEach((c)  => navItems.push({ kind: "category", ...c }));
    data.products.forEach((p)    => navItems.push({ kind: "product", slug: p.slug, name: p.name }));
  }

  // ── Highlight matched text ─────────────────────────────────────────────────
  const highlight = (text: string) => {
    if (!debouncedQ) return text;
    const escaped = debouncedQ.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const parts = text.split(new RegExp(`(${escaped})`, "gi"));
    return parts.map((p, i) =>
      p.toLowerCase() === debouncedQ.toLowerCase()
        ? `<mark style="background:rgba(245,166,35,0.28);color:#f5a623;border-radius:3px;padding:0 2px">${p}</mark>`
        : p
    ).join("");
  };

  // ── Navigation ─────────────────────────────────────────────────────────────
  const navigate = useCallback((path: string) => {
    // Blur FIRST so the mobile keyboard dismisses before the page transition
    inputRef.current?.blur();
    setOpen(false);
    setQuery("");
    router.push(path);
    onClose?.();
  }, [router, onClose, inputRef]);

  const selectItem = useCallback((item: NavItem) => {
    if (item.kind === "suggestion") navigate(`/shop?q=${encodeURIComponent(item.value)}`);
    if (item.kind === "category")   navigate(`/shop?category=${item.slug}`);
    if (item.kind === "product")    navigate(`/products/${item.slug}`);
  }, [navigate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    navigate(`/shop?q=${encodeURIComponent(q)}`);
  };

  // ── Keyboard handler ────────────────────────────────────────────────────────
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (!open) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setFocusIdx((i) => Math.min(i + 1, navItems.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setFocusIdx((i) => Math.max(i - 1, -1));
    } else if (e.key === "Enter" && focusIdx >= 0) {
      e.preventDefault();
      selectItem(navItems[focusIdx]);
    } else if (e.key === "Escape") {
      setOpen(false);
      setFocusIdx(-1);
      inputRef.current?.blur();
    }
  };

  // ── Close on outside click ──────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) {
        setOpen(false);
        setFocusIdx(-1);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // ── Open dropdown when query changes ───────────────────────────────────────
  useEffect(() => {
    setOpen(true);
    setFocusIdx(-1);
  }, [query]);

  const showPopular = open && query.length === 0;
  const showResults = open && debouncedQ.length >= 2;
  const hasResults  = data && (data.suggestions.length > 0 || data.products.length > 0 || data.categories.length > 0);
  const noResults   = showResults && !isFetching && data && !hasResults;

  let globalIdx = -1;

  return (
    <div ref={containerRef} className="relative w-full">
      {/* ── Input form ──────────────────────────────────────────────────── */}
      <form onSubmit={handleSubmit} className="relative" role="search">
        <Search
          className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
          style={{ width: 16, height: 16, color: open ? "#f5a623" : "#6b7280", transition: "color 0.2s" }}
        />
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          autoFocus={autoFocus}
          autoComplete="off"
          spellCheck={false}
          aria-label="Search HEXASHOP"
          aria-autocomplete="list"
          aria-expanded={open}
          style={{
            width: "100%",
            background: "rgba(255,255,255,0.04)",
            border: `1.5px solid ${open ? "rgba(245,166,35,0.5)" : "rgba(255,255,255,0.1)"}`,
            borderRadius: 12,
            padding: "0.65rem 2.5rem 0.65rem 2.4rem",
            fontSize: 14,
            color: "#fff",
            outline: "none",
            boxShadow: open ? "0 0 0 3px rgba(245,166,35,0.1)" : "none",
            transition: "border-color 0.2s, box-shadow 0.2s",
          }}
        />

        {/* Loading spinner / clear button */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {isFetching && (
            <Loader2
              style={{ width: 15, height: 15, color: "#f5a623", animation: "spin 0.7s linear infinite" }}
            />
          )}
          {query && !isFetching && (
            <button
              type="button"
              aria-label="Clear search"
              onClick={() => { setQuery(""); inputRef.current?.focus(); }}
              style={{
                width: 20, height: 20, borderRadius: "50%",
                background: "rgba(255,255,255,0.1)",
                border: "none", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              <X style={{ width: 11, height: 11, color: "#9ca3af" }} />
            </button>
          )}
        </div>
      </form>

      {/* ── Dropdown ──────────────────────────────────────────────────────── */}
      {(showPopular || showResults || noResults) && (
        <div
          role="listbox"
          style={{
            position: "absolute",
            top: "calc(100% + 8px)",
            left: 0, right: 0,
            background: "#0f1623",
            border: "1px solid rgba(245,166,35,0.18)",
            borderRadius: 14,
            boxShadow: "0 20px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(30,144,255,0.08)",
            zIndex: 9999,
            overflow: "hidden",
            maxHeight: "72vh",
            overflowY: "auto",
          }}
        >

          {/* ── Popular searches (empty state) ──────────────────────────── */}
          {showPopular && (
            <div style={{ padding: "14px 14px 10px" }}>
              <p style={{
                fontSize: "0.62rem", fontWeight: 700, color: "#6b7280",
                letterSpacing: "0.1em", textTransform: "uppercase",
                display: "flex", alignItems: "center", gap: 5, marginBottom: 10,
              }}>
                <TrendingUp style={{ width: 12, height: 12 }} />
                Popular Searches
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                {POPULAR.map((term) => (
                  <button
                    key={term}
                    type="button"
                    onClick={() => navigate(`/shop?q=${encodeURIComponent(term)}`)}
                    style={{
                      padding: "5px 12px",
                      background: "rgba(245,166,35,0.07)",
                      border: "1px solid rgba(245,166,35,0.2)",
                      borderRadius: 999,
                      fontSize: "0.72rem", fontWeight: 600,
                      color: "#d1a94a", cursor: "pointer",
                      transition: "all 0.15s",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.background = "rgba(245,166,35,0.18)";
                      (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(245,166,35,0.5)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.background = "rgba(245,166,35,0.07)";
                      (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(245,166,35,0.2)";
                    }}
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── No results ──────────────────────────────────────────────── */}
          {noResults && (
            <div style={{ padding: "24px 16px", textAlign: "center" }}>
              <Search style={{ width: 28, height: 28, color: "#374151", margin: "0 auto 10px" }} />
              <p style={{ color: "#6b7280", fontSize: "0.82rem", fontWeight: 600 }}>
                No results for &ldquo;{debouncedQ}&rdquo;
              </p>
              <p style={{ color: "#4b5563", fontSize: "0.72rem", marginTop: 4 }}>
                Try different keywords or browse categories
              </p>
              <button
                onClick={() => navigate(`/shop?q=${encodeURIComponent(debouncedQ)}`)}
                style={{
                  marginTop: 12, padding: "6px 18px",
                  background: "linear-gradient(135deg,#f5a623,#f59e0b)",
                  border: "none", borderRadius: 999, cursor: "pointer",
                  fontSize: "0.72rem", fontWeight: 700, color: "#000",
                }}
              >
                Search anyway
              </button>
            </div>
          )}

          {/* ── Results ─────────────────────────────────────────────────── */}
          {showResults && hasResults && (
            <>
              {/* Name / autocomplete suggestions */}
              {(data?.suggestions ?? []).length > 0 && (
                <div style={{ padding: "10px 8px 4px" }}>
                  {data!.suggestions.map((s) => {
                    globalIdx++;
                    const idx = globalIdx;
                    const focused = focusIdx === idx;
                    return (
                      <button
                        key={s}
                        type="button"
                        role="option"
                        aria-selected={focused}
                        onClick={() => navigate(`/shop?q=${encodeURIComponent(s)}`)}
                        onMouseEnter={() => setFocusIdx(idx)}
                        style={{
                          display: "flex", alignItems: "center", gap: 10,
                          width: "100%", padding: "8px 10px",
                          borderRadius: 8, border: "none", cursor: "pointer",
                          background: focused ? "rgba(245,166,35,0.1)" : "transparent",
                          textAlign: "left", transition: "background 0.12s",
                        }}
                      >
                        <Search style={{ width: 13, height: 13, color: "#4b5563", flexShrink: 0 }} />
                        <span
                          style={{ fontSize: "0.82rem", color: "#e5e7eb" }}
                          dangerouslySetInnerHTML={{ __html: highlight(s) }}
                        />
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Category chips */}
              {(data?.categories ?? []).length > 0 && (
                <div style={{
                  padding: "8px 14px 10px",
                  borderTop: (data?.suggestions ?? []).length > 0 ? "1px solid rgba(255,255,255,0.05)" : "none",
                }}>
                  <p style={{
                    fontSize: "0.58rem", fontWeight: 700, color: "#4b5563",
                    letterSpacing: "0.1em", textTransform: "uppercase",
                    display: "flex", alignItems: "center", gap: 4, marginBottom: 8,
                  }}>
                    <Tag style={{ width: 10, height: 10 }} /> Categories
                  </p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {data!.categories.map((c) => {
                      globalIdx++;
                      const idx = globalIdx;
                      const focused = focusIdx === idx;
                      return (
                        <button
                          key={c.slug}
                          type="button"
                          role="option"
                          aria-selected={focused}
                          onClick={() => navigate(`/shop?category=${c.slug}`)}
                          onMouseEnter={() => setFocusIdx(idx)}
                          style={{
                            padding: "4px 12px",
                            background: focused ? "rgba(30,144,255,0.2)" : "rgba(30,144,255,0.07)",
                            border: `1px solid ${focused ? "rgba(30,144,255,0.5)" : "rgba(30,144,255,0.18)"}`,
                            borderRadius: 999,
                            fontSize: "0.7rem", fontWeight: 600, color: "#60a5fa",
                            cursor: "pointer", transition: "all 0.12s",
                          }}
                        >
                          {c.parent ? `${c.parent} / ` : ""}
                          <span dangerouslySetInnerHTML={{ __html: highlight(c.name) }} />
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Product results */}
              {(data?.products ?? []).length > 0 && (
                <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                  <p style={{
                    fontSize: "0.58rem", fontWeight: 700, color: "#4b5563",
                    letterSpacing: "0.1em", textTransform: "uppercase",
                    padding: "10px 14px 4px",
                    display: "flex", alignItems: "center", gap: 4,
                  }}>
                    Products
                  </p>
                  {data!.products.map((product) => {
                    globalIdx++;
                    const idx = globalIdx;
                    const focused = focusIdx === idx;
                    const imgSrc = resolveImageUrl(product.primary_image ?? null);
                    const price  = parseFloat(product.base_price).toFixed(2);

                    return (
                      <Link
                        key={product.id}
                        href={`/products/${product.slug}`}
                        role="option"
                        aria-selected={focused}
                        onClick={() => { setOpen(false); setQuery(""); onClose?.(); }}
                        onMouseEnter={() => setFocusIdx(idx)}
                        style={{
                          display: "flex", alignItems: "center", gap: 12,
                          padding: "9px 14px",
                          background: focused ? "rgba(245,166,35,0.07)" : "transparent",
                          transition: "background 0.12s",
                          textDecoration: "none",
                        }}
                      >
                        {/* Thumbnail */}
                        <div style={{
                          width: 44, height: 44, borderRadius: 8, overflow: "hidden",
                          background: "#0d1117", flexShrink: 0,
                          border: "1px solid rgba(255,255,255,0.06)",
                        }}>
                          {imgSrc ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={imgSrc}
                              alt={product.name}
                              style={{ width: "100%", height: "100%", objectFit: "cover" }}
                            />
                          ) : (
                            <div style={{ width: "100%", height: "100%", background: "linear-gradient(135deg,#111827,#1a2035)" }} />
                          )}
                        </div>

                        {/* Info */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p
                            style={{ fontSize: "0.78rem", fontWeight: 600, color: "#e5e7eb", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                            dangerouslySetInnerHTML={{ __html: highlight(product.name) }}
                          />
                          <p style={{ fontSize: "0.7rem", color: "#6b7280", margin: "2px 0 0" }}>
                            {product.category?.name}
                          </p>
                        </div>

                        {/* Price */}
                        <span style={{ fontSize: "0.78rem", fontWeight: 800, color: "#f5a623", flexShrink: 0 }}>
                          ${price}
                        </span>
                      </Link>
                    );
                  })}

                  {/* See all results */}
                  <div style={{ padding: "8px 14px 12px" }}>
                    <button
                      onClick={() => navigate(`/shop?q=${encodeURIComponent(debouncedQ)}`)}
                      style={{
                        width: "100%", padding: "8px",
                        background: "rgba(245,166,35,0.06)",
                        border: "1px solid rgba(245,166,35,0.18)",
                        borderRadius: 8, cursor: "pointer",
                        fontSize: "0.72rem", fontWeight: 700,
                        color: "#f5a623", transition: "all 0.15s",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(245,166,35,0.14)")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(245,166,35,0.06)")}
                    >
                      See all results for &ldquo;{debouncedQ}&rdquo; →
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
