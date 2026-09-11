
/**
 * Election 2028 — Service Worker
 * Enables offline play and PWA installation
 */

const CACHE_NAME = 'election2028-v31-reliable-campaigns';
const ASSETS = [
    './',
    './index.html',
    './css/styles.css',
    './js/constants.js',
    './js/random.js',
    './js/candidates.js',
    './js/states.js',
    './js/vp-data.js',
    './js/events.js',
    './js/debate-system.js',
    './js/debate-content.js',
    './js/debate-expanded.js',
    './js/engine.js',
    './js/game-commands.js',
    './js/save-store.js',
    './js/career-system.js',
    './js/campaign-depth.js',
    './js/map-paths.js',
    './js/debate-walkout.js',
    './js/legends.js',
    './js/portraits.js',
    './js/cabinet.js',
    './js/politicians-expanded.js',
    './js/interviews.js',
    './js/world.js',
    './js/war.js',
    './js/presidency.js',
    './js/ui.js',
    './images/broadcast/debate-stage.jpg',
    './images/broadcast/election-night-studio.jpg',
    './images/broadcast/special-report-studio.jpg',
    './images/portraits/newsom.jpg',
    './images/portraits/buttigieg.jpg',
    './images/portraits/aoc.jpg',
    './images/portraits/harris.jpg',
    './images/portraits/shapiro.jpg',
    './images/portraits/stephensmith.jpg',
    './images/portraits/moore.jpg',
    './images/portraits/whitmer.jpg',
    './images/portraits/warnock.jpg',
    './images/portraits/beshear.jpg',
    './images/portraits/pritzker.jpg',
    './images/portraits/booker.jpg',
    './images/portraits/polis.jpg',
    './images/portraits/khanna.jpg',
    './images/portraits/gallego.jpg',
    './images/portraits/slotkin.jpg',
    './images/portraits/vance.jpg',
    './images/portraits/rubio.jpg',
    './images/portraits/desantis.jpg',
    './images/portraits/trumpjr.jpg',
    './images/portraits/ramaswamy.jpg',
    './images/portraits/carlson.jpg',
    './images/portraits/youngkin.jpg',
    './images/portraits/scott.jpg',
    './images/portraits/kemp.jpg',
    './images/portraits/britt.jpg',
    './images/portraits/hawley.jpg',
    './images/portraits/cotton.jpg',
    './images/portraits/cruz.jpg',
    './images/portraits/noem.jpg',
    './images/portraits/donalds.jpg',
    './images/portraits/sununu.jpg',
    './images/portraits/legend_fdr.jpg',
    './images/portraits/legend_jfk.jpg',
    './images/portraits/legend_lbj.jpg',
    './images/portraits/legend_truman.jpg',
    './images/portraits/legend_obama.jpg',
    './images/portraits/legend_lincoln.jpg',
    './images/portraits/legend_teddy.jpg',
    './images/portraits/legend_ike.jpg',
    './images/portraits/legend_reagan.jpg',
    './images/portraits/legend_nixon.jpg',
    './images/portraits/legend_washington_d.jpg',
    './images/portraits/legend_washington_r.jpg',
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
    );
});

// Clean old caches on activate
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys =>
            Promise.all(keys.filter(k => k.startsWith('election2028-') && k !== CACHE_NAME).map(k => caches.delete(k)))
        ).then(() => self.clients.claim())
    );
});

// A waiting update is activated only after a continuity checkpoint is saved.
self.addEventListener('message', event => { if (event.data?.type === 'APPLY_UPDATE') self.skipWaiting(); });
// Keep each open session on one complete release, including offline.
self.addEventListener('fetch', event => {
    if (event.request.method !== 'GET') return;

    const url = new URL(event.request.url);
    const isNavigation = event.request.mode === 'navigate';
    const isAppCode = url.origin === self.location.origin &&
        /\.(?:js|css|json|html)$/.test(url.pathname);

    if (isNavigation || isAppCode) {
        event.respondWith(
            caches.open(CACHE_NAME).then(cache => cache.match(event.request)).then(cached => cached || fetch(event.request).then(response => {
                if (response.ok) {
                    const clone = response.clone();
                    caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
                }
                return response;
            })).catch(() =>
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
