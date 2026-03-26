const CACHE_NAME = 'symbiosis-v3';

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
//   • API routes  → network-first (fresh data, fall back to cache)
//   • Everything  → stale-while-revalidate (fast load, refresh in bg)
self.addEventListener('fetch', (event) => {
  // Only handle GET requests over http(s)
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (!url.protocol.startsWith('http')) return;

  const isApi =
    url.pathname.startsWith('/api/') ||
    url.hostname.includes('finance.yahoo') ||
    url.hostname.includes('allorigins');

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
  } else {
    // Stale-while-revalidate for pages and assets
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) =>
        cache.match(event.request).then((cached) => {
          const networkFetch = fetch(event.request).then((response) => {
            if (response.ok) cache.put(event.request, response.clone());
            return response;
          });
          return cached || networkFetch;
        })
      )
    );
  }
});
