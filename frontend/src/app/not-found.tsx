import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "404 – Page Not Found",
  robots: { index: false },
};

export default function NotFound() {
  return (
    <div className="min-h-[calc(100vh-12rem)] flex flex-col items-center justify-center px-4 text-center">
      {/* Geometric hex background */}
      <div className="relative mb-8">
        <div className="absolute inset-0 blur-3xl opacity-10 bg-brand-secondary rounded-full" />
        <h1 className="text-[10rem] font-black leading-none text-white/10 select-none relative">
          404
        </h1>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-[8rem] font-black bg-clip-text text-transparent bg-gradient-to-b from-brand-secondary to-brand-primary">
            404
          </span>
        </div>
      </div>

      <h2 className="text-2xl font-bold mb-3">Page Not Found</h2>
      <p className="text-brand-muted max-w-md mb-8">
        Oops! The page you are looking for doesn't exist or has been moved.
      </p>

      <Link href="/" className="btn-primary px-8 py-3">
        Back to Home
      </Link>
    </div>
  );
}
