/** @type {import('next').NextConfig} */

// Extract the backend hostname from NEXT_PUBLIC_API_URL so LAN IPs work for images.
// e.g. "http://192.168.0.110:8000/api/v1" → hostname "192.168.0.110", port "8000"
const _apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
let _lanPattern = null;
try {
  if (_apiUrl) {
    const u = new URL(_apiUrl);
    if (u.hostname !== "localhost" && u.hostname !== "127.0.0.1") {
      _lanPattern = { protocol: "http", hostname: u.hostname, port: u.port || "8000", pathname: "/media/**" };
    }
  }
} catch (_) {}

const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,

  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "8000",
        pathname: "/media/**",
      },
      // Allow any LAN IP passed via NEXT_PUBLIC_API_URL
      ...(_lanPattern ? [_lanPattern] : []),
    ],
    deviceSizes: [375, 640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
  },

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
      {
        source: "/sw.js",
        headers: [
          { key: "Cache-Control", value: "public, max-age=0, must-revalidate" },
          { key: "Service-Worker-Allowed", value: "/" },
        ],
      },
    ];
  },

  async rewrites() {
    return [
      // Proxy API calls in development to avoid CORS issues with cookies
      {
        source: "/api/backend/:path*",
        destination: `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1"}/:path*`,
      },
    ];
  },

  experimental: {
    optimizePackageImports: ["lucide-react", "framer-motion"],
  },
};

module.exports = nextConfig;
