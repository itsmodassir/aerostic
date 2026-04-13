const CACHE_NAME = 'aimstore-pwa-cache-v1';

// Minimal install behavior - install event
self.addEventListener('install', (event) => {
    // Skip waiting ensures the new service worker activates immediately
    self.skipWaiting();
});

// Activate event - clean up old caches if needed
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
    self.clients.claim();
});

// Fetch event - strictly required by Chrome for PWA installability heuristic
self.addEventListener('fetch', (event) => {
    // For now, act as a network-first pass-through.
    // This allows the browser to recognize the PWA while not breaking Next.js SSR.
    event.respondWith(fetch(event.request).catch(error => {
        // Fallback functionality could be added here for pure offline mode
        return caches.match(event.request);
    }));
});
