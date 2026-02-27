// Service Worker - No caching for development
const CACHE_NAME = 'whatsapp-web-clone-v1';

self.addEventListener('install', (event) => {
  // Skip waiting to activate immediately
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  // Clean up old caches
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          return caches.delete(cacheName);
        })
      );
    })
  );
  // Take control immediately
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // No caching - always fetch from network
  event.respondWith(
    fetch(event.request)
  );
});
