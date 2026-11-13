// AI PDF Studio Service Worker v3
const CACHE_NAME = 'ai-pdf-v3';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  // Only process standard GET requests
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // CRITICAL: NEVER intercept dev assets, Vite internals, HMR, APIs, or local dev requests!
  // Allowing these through directly to the browser network stack eliminates net::ERR_FAILED!
  if (
    url.hostname === 'localhost' ||
    url.hostname === '127.0.0.1' ||
    url.port === '3000' ||
    url.port === '8000' ||
    url.pathname.startsWith('/@vite') ||
    url.pathname.startsWith('/@react-refresh') ||
    url.pathname.startsWith('/@fs') ||
    url.pathname.startsWith('/@id') ||
    url.pathname.startsWith('/src/') ||
    url.pathname.startsWith('/node_modules/') ||
    url.pathname.startsWith('/api/') ||
    url.search.includes('v=') ||
    url.search.includes('t=')
  ) {
    return; // Pass through to standard browser network stack
  }

  // Production offline caching with bulletproof Response fallback
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(async () => {
        const cached = await caches.match(event.request);
        if (cached) return cached;
        if (event.request.headers.get('accept')?.includes('text/html')) {
          const fallback = await caches.match('/');
          if (fallback) return fallback;
        }
        // Always return a valid Response instance so "Failed to convert value to Response" NEVER triggers!
        return new Response('Network request failed or currently offline', {
          status: 503,
          statusText: 'Service Unavailable',
          headers: new Headers({ 'Content-Type': 'text/plain;charset=utf-8' })
        });
      })
  );
});
