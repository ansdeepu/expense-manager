// Simple service worker to enable PWA installation
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Pass through all requests, but ensure we have a handler for Chrome's PWA detection
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => {
        // Basic offline support - just return something if the network is down
        return new Response('Offline - please reconnect to the internet.');
      })
    );
    return;
  }
  
  event.respondWith(fetch(event.request));
});
