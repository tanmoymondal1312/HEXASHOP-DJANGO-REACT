import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { Toaster } from "react-hot-toast";
import TopLoader from "@/components/ui/TopLoader";

const inter = Inter({ subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://hexashop.com"),
  title: {
    default: "HEXASHOP – Style That Defines You",
    template: "%s | HEXASHOP",
  },
  description:
    "Discover the latest trends in fashion. Premium quality hoodies, jackets, sneakers and more. Best prices guaranteed.",
  keywords: ["fashion", "hoodies", "sneakers", "clothing", "streetwear", "HEXASHOP"],
  authors: [{ name: "HEXASHOP" }],
  creator: "HEXASHOP",
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "HEXASHOP",
    title: "HEXASHOP – Style That Defines You",
    description: "Premium fashion at unbeatable prices.",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    site: "@hexashop",
  },
  robots: { index: true, follow: true },
  verification: { google: "your-google-verification-code" },
};

export const viewport: Viewport = {
  themeColor: "#0A0E1A",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-brand-dark text-white antialiased`}>
        <Providers>
          <TopLoader />
          <Header />
          <main>{children}</main>
          <Footer />
          <CartDrawer />
          <Toaster
            position="top-right"
            toastOptions={{
              style: { background: "#111827", color: "#fff", border: "1px solid #1F2937" },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
