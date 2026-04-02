const CACHE_NAME = 'symbiosis-v4';

// Install — open a cache but don't pre-cache anything that might 404
self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME));
  self.skipWaiting();
});

// Activate — delete old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames.map((name) => {
          if (name !== CACHE_NAME) return caches.delete(name);
        })
      )
    )
  );
  self.clients.claim();
});

// Fetch strategy:
//   • API routes      → network-first (fresh data, fall back to cache)
//   • Static assets   → cache-first (content-hash versioned, never stale)
//   • Everything else → network-first (HTML pages always load latest code)
self.addEventListener('fetch', (event) => {
  // Only handle GET requests over http(s)
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (!url.protocol.startsWith('http')) return;

  const isApi =
    url.pathname.startsWith('/api/') ||
    url.hostname.includes('finance.yahoo') ||
    url.hostname.includes('allorigins');

  // /_next/static/ assets include a content hash in their URL so they are
  // safe to cache indefinitely — they never change for a given deployment.
  const isStaticAsset = url.pathname.startsWith('/_next/static/');

  if (isApi) {
    // Network-first for live data
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() => caches.match(event.request))
    );
  } else if (isStaticAsset) {
    // Cache-first for versioned static assets
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) =>
        cache.match(event.request).then((cached) => {
          if (cached) return cached;
          return fetch(event.request).then((response) => {
            if (response.ok) cache.put(event.request, response.clone());
            return response;
          });
        })
      )
    );
  } else {
    // Network-first for HTML pages so navigation always loads the latest
    // app code, preventing stale cached bundles from breaking navigation.
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() => caches.match(event.request))
    );
  }
});
