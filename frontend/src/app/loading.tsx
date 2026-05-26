/**
 * Route-level loading UI for the homepage.
 * Next.js automatically shows this while the async Server Component resolves.
 * Uses the `.skeleton` shimmer class defined in globals.css.
 */
export default function HomeLoading() {
  return (
    <main className="min-h-screen" style={{ backgroundColor: "#0A0E1A" }}>
      {/* ── Hero skeleton ───────────────────────────────────────────── */}
      <section className="hx-hero-section">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center gap-8 py-16">
            {/* Text side */}
            <div className="flex-1 space-y-4">
              <div className="skeleton h-5 w-32 mb-2" />
              <div className="skeleton h-12 w-3/4" />
              <div className="skeleton h-12 w-1/2" />
              <div className="skeleton h-5 w-2/3 mt-2" />
              <div className="skeleton h-5 w-3/5" />
              <div className="flex gap-3 mt-6">
                <div className="skeleton h-11 w-36 rounded-full" />
                <div className="skeleton h-11 w-36 rounded-full" />
              </div>
            </div>
            {/* Image side */}
            <div className="flex-1 flex justify-center">
              <div className="skeleton w-80 h-80 lg:w-96 lg:h-96 rounded-2xl" />
            </div>
          </div>
        </div>
      </section>

      {/* ── Viral / trending section ─────────────────────────────────── */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          {/* Section heading */}
          <div className="text-center mb-8 space-y-2">
            <div className="skeleton h-4 w-24 mx-auto" />
            <div className="skeleton h-8 w-48 mx-auto" />
          </div>

          {/* 5-card row */}
          <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <ViralCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Divider ──────────────────────────────────────────────────── */}
      <div className="hx-divider mx-auto" />

      {/* ── Featured products section ─────────────────────────────── */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          {/* Section heading */}
          <div className="text-center mb-8 space-y-2">
            <div className="skeleton h-4 w-24 mx-auto" />
            <div className="skeleton h-8 w-52 mx-auto" />
          </div>

          {/* 5-per-row × 2 rows = 10 cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <FeaturedCardSkeleton key={i} />
            ))}
          </div>

          {/* See-more button */}
          <div className="flex justify-center mt-8">
            <div className="skeleton h-11 w-40 rounded-full" />
          </div>
        </div>
      </section>
    </main>
  );
}

/* ── Sub-skeletons ──────────────────────────────────────────────────────────── */

function ViralCardSkeleton() {
  return (
    <div className="hx-viral-card" style={{ cursor: "default" }}>
      {/* Image placeholder */}
      <div className="hx-viral-img skeleton" style={{ borderRadius: "10px 10px 0 0" }} />
      {/* Text */}
      <div className="hx-viral-info" style={{ padding: "8px" }}>
        <div className="skeleton h-3 w-4/5 mb-1" />
        <div className="skeleton h-3 w-2/4" />
      </div>
    </div>
  );
}

function FeaturedCardSkeleton() {
  return (
    <div className="hx-feat-card" style={{ cursor: "default" }}>
      {/* Badge placeholder */}
      <div style={{ position: "absolute", top: 7, left: 7, zIndex: 2 }}>
        <div className="skeleton h-5 w-12 rounded-full" />
      </div>
      {/* Image placeholder */}
      <div className="hx-feat-img skeleton" style={{ borderRadius: "12px 12px 0 0" }} />
      {/* Info */}
      <div className="hx-feat-info" style={{ padding: "10px 10px 12px" }}>
        <div className="skeleton h-3 w-16 mb-2" />
        <div className="skeleton h-4 w-full mb-1" />
        <div className="skeleton h-4 w-4/5 mb-3" />
        {/* Price + button row */}
        <div className="flex items-center justify-between">
          <div className="skeleton h-5 w-20" />
          <div className="skeleton h-8 w-8 rounded-full" />
        </div>
      </div>
    </div>
  );
}
