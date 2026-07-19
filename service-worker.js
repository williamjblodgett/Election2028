/**
 * Election 2028 — Service Worker
 * Enables offline play and PWA installation
 */

const CACHE_NAME = 'election2028-v15';
const ASSETS = [
    './',
    './index.html',
    './css/styles.css',
    './js/constants.js',
    './js/candidates.js',
    './js/states.js',
    './js/vp-data.js',
    './js/events.js',
    './js/debate-system.js',
    './js/debate-content.js',
    './js/engine.js',
    './js/map-paths.js',
    './js/vendor/three.min.js',
    './js/debate-walkout.js',
    './js/legends.js',
    './js/portraits.js',
    './js/cabinet.js',
    './js/interviews.js',
    './js/presidency.js',
    './js/election-night-3d.js',
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

// Network-first for the app itself (HTML/JS/CSS/JSON) so deploys reach
// devices immediately; the cache is the offline fallback. Everything else
// (icons, manifest, cross-origin) stays cache-first.
self.addEventListener('fetch', event => {
    if (event.request.method !== 'GET') return;

    const url = new URL(event.request.url);
    const isNavigation = event.request.mode === 'navigate';
    const isAppCode = url.origin === self.location.origin &&
        /\.(?:js|css|json|html)$/.test(url.pathname);

    if (isNavigation || isAppCode) {
        event.respondWith(
            fetch(event.request).then(response => {
                if (response.ok) {
                    const clone = response.clone();
                    caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
                }
                return response;
            }).catch(() =>
                caches.match(event.request).then(cached =>
                    cached || (isNavigation ? caches.match('./index.html') : undefined)
                )
            )
        );
        return;
    }

    event.respondWith(
        caches.match(event.request).then(cached => {
            if (cached) return cached;
            return fetch(event.request).then(response => {
                if (response.ok) {
                    const clone = response.clone();
                    caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
                }
                return response;
            });
        })
    );
});
