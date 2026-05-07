import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  searchParams: Record<string, string>;
}

function buildUrl(searchParams: Record<string, string>, page: number): string {
  const params = new URLSearchParams(
    Object.fromEntries(Object.entries(searchParams).filter(([, v]) => v !== ""))
  );
  if (page === 1) {
    params.delete("page");
  } else {
    params.set("page", String(page));
  }
  const qs = params.toString();
  return qs ? `/shop?${qs}` : "/shop";
}

function buildPageList(current: number, total: number): (number | "...")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: (number | "...")[] = [1];
  const left = Math.max(2, current - 2);
  const right = Math.min(total - 1, current + 2);
  if (left > 2) pages.push("...");
  for (let i = left; i <= right; i++) pages.push(i);
  if (right < total - 1) pages.push("...");
  pages.push(total);
  return pages;
}

export function Pagination({ currentPage, totalPages, totalItems, pageSize, searchParams }: PaginationProps) {
  if (totalPages <= 1) return null;

  const from = (currentPage - 1) * pageSize + 1;
  const to = Math.min(currentPage * pageSize, totalItems);
  const pages = buildPageList(currentPage, totalPages);

  return (
    <nav
      aria-label="Product pagination"
      className="flex flex-col items-center gap-4 mt-10"
    >
      {/* Count */}
      <p className="text-sm text-brand-muted">
        Showing <span className="text-white font-semibold">{from}–{to}</span> of{" "}
        <span className="text-white font-semibold">{totalItems}</span> products
      </p>

      {/* Page buttons */}
      <div className="flex items-center gap-1.5" role="list">
        {/* Previous */}
        {currentPage > 1 ? (
          <Link
            href={buildUrl(searchParams, currentPage - 1)}
            aria-label="Previous page"
            className="flex items-center gap-1 px-3 py-2 rounded-lg border border-brand-border text-sm text-brand-muted hover:border-brand-primary hover:text-brand-primary transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            Prev
          </Link>
        ) : (
          <span className="flex items-center gap-1 px-3 py-2 rounded-lg border border-brand-border/30 text-sm text-brand-border cursor-not-allowed">
            <ChevronLeft className="h-4 w-4" />
            Prev
          </span>
        )}

        {/* Numbers */}
        {pages.map((p, i) =>
          p === "..." ? (
            <span key={`dots-${i}`} className="px-2 text-brand-muted text-sm select-none">
              …
            </span>
          ) : (
            <Link
              key={p}
              href={buildUrl(searchParams, p as number)}
              aria-label={`Page ${p}`}
              aria-current={p === currentPage ? "page" : undefined}
              className={
                p === currentPage
                  ? "w-9 h-9 flex items-center justify-center rounded-lg bg-brand-primary text-black text-sm font-bold"
                  : "w-9 h-9 flex items-center justify-center rounded-lg border border-brand-border text-sm text-brand-muted hover:border-brand-primary hover:text-brand-primary transition-colors"
              }
            >
              {p}
            </Link>
          )
        )}

        {/* Next */}
        {currentPage < totalPages ? (
          <Link
            href={buildUrl(searchParams, currentPage + 1)}
            aria-label="Next page"
            className="flex items-center gap-1 px-3 py-2 rounded-lg border border-brand-border text-sm text-brand-muted hover:border-brand-primary hover:text-brand-primary transition-colors"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Link>
        ) : (
          <span className="flex items-center gap-1 px-3 py-2 rounded-lg border border-brand-border/30 text-sm text-brand-border cursor-not-allowed">
            Next
            <ChevronRight className="h-4 w-4" />
          </span>
        )}
      </div>
    </nav>
  );
}
