/* PrayNote AI — production service worker
 * Strategies:
 *  - Static assets (/_next/static, icons, fonts, images): cache-first
 *  - Navigations: network-first → offline fallback
 *  - Same-origin GET pages (public): stale-while-revalidate (no /api, no auth)
 * Never cache:
 *  - /api/*
 *  - Auth / callback paths
 *  - Cross-origin (Supabase, OpenRouter, etc.)
 *  - Non-GET methods
 *  - Requests with Authorization header
 */

const VERSION = "praynote-pwa-v6";
const STATIC_CACHE = `${VERSION}-static`;
const PAGE_CACHE = `${VERSION}-pages`;
const RUNTIME_CACHE = `${VERSION}-runtime`;

const PRECACHE_URLS = [
  "/",
  "/offline",
  "/manifest.webmanifest",
  "/icons/icon-192.png?v=6",
  "/icons/icon-512.png?v=6",
  "/icons/maskable-192.png?v=6",
  "/icons/apple-touch-icon.png?v=6",
  "/favicon-32.png?v=6",
];

/** Paths that must never be cached (auth tokens, APIs, mutations). */
function isSensitivePath(pathname) {
  if (pathname.startsWith("/api/")) return true;
  if (pathname.startsWith("/auth")) return true;
  // Server actions / RSC flight can carry session-bound data — don't long-cache
  if (pathname.includes("callback")) return true;
  return false;
}

function isStaticAsset(url) {
  const p = url.pathname;
  return (
    p.startsWith("/_next/static/") ||
    p.startsWith("/icons/") ||
    p.startsWith("/marketing/") ||
    p === "/manifest.webmanifest" ||
    p === "/favicon.ico" ||
    p === "/favicon-16.png" ||
    p === "/favicon-32.png" ||
    p === "/icon-512.png" ||
    p === "/sw.js" ||
    /\.(?:js|css|woff2?|ttf|otf|png|jpg|jpeg|gif|webp|svg|ico|webmanifest)$/i.test(
      p
    )
  );
}

function isNavigationRequest(request) {
  return (
    request.mode === "navigate" ||
    (request.method === "GET" &&
      request.headers.get("accept")?.includes("text/html"))
  );
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(STATIC_CACHE);
      await Promise.all(
        PRECACHE_URLS.map(async (url) => {
          try {
            const res = await fetch(url, { cache: "reload" });
            if (res.ok) await cache.put(url, res);
          } catch {
            /* ignore individual precache failures */
          }
        })
      );
      await self.skipWaiting();
    })()
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((k) => k.startsWith("praynote-") && !k.startsWith(VERSION))
          .map((k) => caches.delete(k))
      );
      // Also clean older shell names
      await Promise.all(
        keys
          .filter(
            (k) =>
              k.startsWith("praynote-shell") ||
              (k.startsWith("praynote-pwa-") && !k.startsWith(VERSION))
          )
          .map((k) => caches.delete(k))
      );
      await self.clients.claim();
    })()
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;

  if (request.method !== "GET") return;
  if (request.headers.get("authorization")) return;

  let url;
  try {
    url = new URL(request.url);
  } catch {
    return;
  }

  // Never intercept cross-origin (Supabase, fonts CDN if any, analytics)
  if (url.origin !== self.location.origin) return;

  if (isSensitivePath(url.pathname)) return;

  // Cache-first for static assets
  if (isStaticAsset(url)) {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
    return;
  }

  // Navigations: network-first → cached page → offline shell
  if (isNavigationRequest(request)) {
    event.respondWith(networkFirstNavigation(request));
    return;
  }

  // Same-origin GET (public assets / data): network-first with short runtime cache
  // Skip RSC/prefetch that might be session-sensitive when cookies matter —
  // Next RSC uses text/x-component; treat carefully.
  const accept = request.headers.get("accept") || "";
  if (accept.includes("text/x-component") || accept.includes("rsc")) {
    // Network only for RSC — never cache authenticated UI payloads
    return;
  }

  event.respondWith(networkFirst(request, RUNTIME_CACHE));
});

async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request);
  if (cached) return cached;

  try {
    const res = await fetch(request);
    if (res && res.ok && res.type === "basic") {
      const cache = await caches.open(cacheName);
      cache.put(request, res.clone());
    }
    return res;
  } catch {
    return (
      (await caches.match(request)) ||
      new Response("Offline", { status: 503, statusText: "Offline" })
    );
  }
}

async function networkFirst(request, cacheName) {
  try {
    const res = await fetch(request);
    if (res && res.ok && res.type === "basic") {
      const cache = await caches.open(cacheName);
      cache.put(request, res.clone());
    }
    return res;
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;
    return new Response("Offline", { status: 503, statusText: "Offline" });
  }
}

async function networkFirstNavigation(request) {
  try {
    const res = await fetch(request);
    // Only cache successful public HTML (not error/login redirects with private data)
    if (res && res.ok && res.type === "basic") {
      const cache = await caches.open(PAGE_CACHE);
      cache.put(request, res.clone());
    }
    return res;
  } catch {
    const cached =
      (await caches.match(request)) ||
      (await caches.match("/offline")) ||
      (await caches.match("/"));
    if (cached) return cached;
    return new Response(
      "<!DOCTYPE html><html><body style=\"font-family:Georgia,serif;padding:2rem;background:#F9F5EC;color:#10233F\"><h1>You&apos;re offline</h1><p>Your saved prayers remain safe. Reconnect to continue syncing.</p></body></html>",
      {
        status: 503,
        headers: { "Content-Type": "text/html; charset=utf-8" },
      }
    );
  }
}

self.addEventListener("message", (event) => {
  if (event.data === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
