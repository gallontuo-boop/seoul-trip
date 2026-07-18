/* 首爾同行 — offline app shell (network-first for HTML) */
const CACHE = 'seoul-trip-v8';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-512.png',
  './vendor/leaflet.js',
  './vendor/leaflet.css'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  const url = new URL(req.url);

  // Live exchange-rate API: always go to network, never cache
  if (url.hostname.includes('er-api.com')) return;

  const isHTML = req.mode === 'navigate'
    || req.destination === 'document'
    || url.pathname.endsWith('.html')
    || url.pathname.endsWith('/');

  if (isHTML) {
    // Network-first: always try to fetch the latest page, fall back to cache offline
    e.respondWith(
      fetch(req)
        .then(res => {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put('./index.html', copy));
          return res;
        })
        .catch(() => caches.match('./index.html').then(r => r || caches.match('./')))
    );
    return;
  }

  // Other assets (icons, manifest): cache-first
  e.respondWith(
    caches.match(req).then(hit => hit || fetch(req).then(res => {
      if (res && res.status === 200 && req.method === 'GET' && url.origin === location.origin) {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(req, copy));
      }
      return res;
    }).catch(() => caches.match('./index.html')))
  );
});
