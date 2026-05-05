const CACHE_NAME = 'fin-budget-v9';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Pass through all requests
  // Chrome requires a fetch event listener to be present for PWA installability
  event.respondWith(fetch(event.request).catch(() => {
    // If offline, try to return something from cache if it was there
    return caches.match(event.request);
  }));
});
