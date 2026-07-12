"use client";

import { useEffect } from "react";

/**
 * Registers public/sw.js. The worker caches images cache-first (so a product
 * photo already seen on the home/shop page appears instantly on the detail
 * page, even across visits) and provides the offline fallback. It never
 * caches /studio or /_next assets.
 */
export default function SWRegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js").catch(() => {
      /* registration failure is non-fatal — site works without it */
    });
  }, []);
  return null;
}
