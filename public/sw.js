/* Simple PWA Service Worker */
const CACHE_NAME = 'budget-v12';

self.addEventListener('install', (event) => {
  console.log('PWA: Service Worker installing');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('PWA: Service Worker activating');
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Respond with something for fetch to satisfy Chrome
  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.match(event.request);
    })
  );
});
