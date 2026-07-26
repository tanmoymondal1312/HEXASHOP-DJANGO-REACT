"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { Mail, Instagram, Twitter, Facebook, Youtube } from "lucide-react";
import { notificationsApi } from "@/lib/api";
import toast from "react-hot-toast";

const SHOP_LINKS = ["Hoodies", "Jackets", "T-Shirts", "Shoes", "Accessories", "Bags", "Watches"];
const HELP_LINKS = [
  { label: "About Us", href: "/about" },
  { label: "Contact", href: "/contact" },
  { label: "FAQ", href: "/faq" },
  { label: "Shipping Policy", href: "/shipping" },
  { label: "Returns", href: "/returns" },
  { label: "Privacy Policy", href: "/privacy" },
];

export function Footer() {
  const pathname = usePathname();
  const [email, setEmail] = useState("");
  const [subscribing, setSubscribing] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubscribing(true);
    try {
      await notificationsApi.subscribeNewsletter(email);
      toast.success("Subscribed! Check your inbox for a welcome email.");
      setEmail("");
    } catch {
      toast.error("Could not subscribe. Try again later.");
    } finally {
      setSubscribing(false);
    }
  };

  // Studio has its own chrome — no storefront footer there.
  if (pathname.startsWith("/studio")) return null;

  return (
    <footer className="bg-brand-surface border-t border-brand-border mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Mobile: 2-col grid — Brand + Categories on row 1, Help + Newsletter on row 2 */}
        {/* Tablet: 2-col — Brand spans full, rest 2-col */}
        {/* Desktop: 4-col */}
        {/* Mobile: 2×2 grid (Brand+Categories row 1, Help+Newsletter row 2) */}
        {/* md+: 4-col single row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="overflow-hidden">
            <Link href="/" className="block mb-4" aria-label="HEXASHOP home">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/og-image.jpg"
                alt="HEXASHOP — Style That Defines You"
                width={1200}
                height={630}
                loading="lazy"
                className="w-full max-w-[300px] h-auto rounded-xl border border-brand-border shadow-lg shadow-black/40"
              />
            </Link>
            <p className="text-sm text-brand-muted leading-relaxed mb-4">
              Premium fashion that defines your style. Quality you can trust, prices you'll love.
            </p>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              {[Instagram, Twitter, Facebook, Youtube].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="p-2 rounded-lg bg-brand-border hover:bg-brand-primary/20 hover:text-brand-primary transition-colors"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Categories */}
          <div>
            <h3 className="font-semibold mb-4 text-brand-primary">Categories</h3>
            <ul className="space-y-2">
              {SHOP_LINKS.map((cat) => (
                <li key={cat}>
                  <Link
                    href={`/categories/${cat.toLowerCase()}`}
                    className="text-sm text-brand-muted hover:text-brand-primary transition-colors"
                  >
                    {cat}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Help */}
          <div>
            <h3 className="font-semibold mb-4 text-brand-primary">Help</h3>
            <ul className="space-y-2">
              {HELP_LINKS.map(({ label, href }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-sm text-brand-muted hover:text-brand-primary transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="font-semibold mb-4 text-brand-primary">Newsletter</h3>
            <p className="text-sm text-brand-muted mb-4">
              Get exclusive deals and style inspiration delivered to your inbox.
            </p>
            <form onSubmit={handleSubscribe} className="flex flex-col gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full px-4 py-2.5 bg-brand-border rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-primary"
                required
              />
              <button
                type="submit"
                disabled={subscribing}
                className="btn-primary flex items-center justify-center gap-2"
              >
                <Mail className="h-4 w-4" />
                {subscribing ? "Subscribing..." : "Subscribe"}
              </button>
            </form>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-brand-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-brand-muted">
            © {new Date().getFullYear()} HEXASHOP. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            {["Visa", "Mastercard", "PayPal", "Apple Pay"].map((method) => (
              <span
                key={method}
                className="px-2 py-1 bg-brand-border rounded text-xs text-brand-muted"
              >
                {method}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
