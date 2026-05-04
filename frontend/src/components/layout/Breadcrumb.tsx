import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm text-brand-muted">
      <Link href="/" className="hover:text-brand-primary transition-colors">
        <Home className="h-4 w-4" />
      </Link>
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-1.5">
          <ChevronRight className="h-4 w-4" />
          {item.href && i < items.length - 1 ? (
            <Link href={item.href} className="hover:text-brand-primary transition-colors">
              {item.label}
            </Link>
          ) : (
            <span className="text-white">{item.label}</span>
          )}
        </div>
      ))}
    </nav>
  );
}
