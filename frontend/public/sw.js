const CACHE_NAME = "hexashop-v3";
const STATIC_ASSETS = ["/", "/shop", "/offline.html"];
const API_CACHE_NAME = "hexashop-api-v3";
const IMG_CACHE_NAME = "hexashop-img-v3";

// Never let the SW handle the staff studio or Next build assets from cache —
// always go to network so a code change is picked up immediately.
const NETWORK_ONLY_PREFIXES = ["/studio", "/_next/"];

self.addEventListener("install", (event) => {
  // Cache each asset individually — one missing file must not abort install
  // (a failed cache.addAll leaves the SW permanently stuck in "installing").
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      Promise.allSettled(STATIC_ASSETS.map((url) => cache.add(url)))
    )
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => ![CACHE_NAME, API_CACHE_NAME, IMG_CACHE_NAME].includes(k))
          .map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Studio + Next build assets → always network, never cached (avoids serving a
  // stale app bundle that could hang the studio on an old auth flow).
  if (NETWORK_ONLY_PREFIXES.some((p) => url.pathname.startsWith(p))) {
    return; // let the browser handle it normally (no SW caching)
  }

  // Images → cache-first, 7 days
  if (request.destination === "image" || url.hostname === "res.cloudinary.com") {
    event.respondWith(
      caches.open(IMG_CACHE_NAME).then(async (cache) => {
        const cached = await cache.match(request);
        if (cached) return cached;
        const response = await fetch(request);
        cache.put(request, response.clone());
        return response;
      })
    );
    return;
  }

  // API → network-first, fall back to cache for GET
  if (url.pathname.startsWith("/api/")) {
    if (request.method !== "GET") return;
    event.respondWith(
      fetch(request)
        .then((response) => {
          const clone = response.clone();
          caches.open(API_CACHE_NAME).then((cache) => cache.put(request, clone));
          return response;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  // Pages → network-first, offline fallback
  event.respondWith(
    fetch(request).catch(() =>
      caches.match(request).then((r) => r || caches.match("/offline.html"))
    )
  );
});
