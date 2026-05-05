const CACHE_NAME = 'finbudget-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/globals.css',
  '/app-icon.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      return cachedResponse || fetch(event.request).catch(() => {
        // Fallback for navigation requests
        if (event.request.mode === 'navigate') {
          return caches.match('/').then(rootResponse => {
            return rootResponse || new Response('Offline - application content not cached');
          });
        }
        // Return a generic error response for other failed fetches
        return new Response('Network error occurred', {
          status: 408,
          statusText: 'Network Error'
        });
      });
    })
  );
});
