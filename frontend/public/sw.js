const CACHE_NAME = "hexashop-v1";
const STATIC_ASSETS = ["/", "/shop", "/offline.html"];
const API_CACHE_NAME = "hexashop-api-v1";
const IMG_CACHE_NAME = "hexashop-img-v1";

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
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
