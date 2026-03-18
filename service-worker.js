/**
 * Election 2028 — Service Worker
 * Enables offline play and PWA installation
 */

const CACHE_NAME = 'election2028-v4';
const ASSETS = [
    './',
    './index.html',
    './css/styles.css',
    './js/candidates.js',
    './js/states.js',
    './js/events.js',
    './js/engine.js',
    './js/map-paths.js',
    './js/ui.js',
    './manifest.json',
    './icons/icon-192.svg',
    './icons/icon-512.svg',
    './icons/apple-touch-icon.svg'
];

// Pre-cache all game assets on install
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(ASSETS))
            .then(() => self.skipWaiting())
    );
});

// Clean old caches on activate
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys =>
            Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
        ).then(() => self.clients.claim())
    );
});

// Cache-first strategy: serve from cache, fallback to network
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request).then(cached => {
            if (cached) return cached;
            return fetch(event.request).then(response => {
                // Cache new requests dynamically
                if (response.ok && event.request.method === 'GET') {
                    const clone = response.clone();
                    caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
                }
                return response;
            });
        }).catch(() => {
            // Offline fallback for navigation
            if (event.request.mode === 'navigate') {
                return caches.match('./index.html');
            }
        })
    );
});
