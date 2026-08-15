/* רצח · הארכיון — service worker | Dubel Team */
const V = 'retzach-v4';
const CORE = [
  '/', '/index.html',
  '/assets/style.css', '/assets/data.js', '/assets/app.js',
  '/manifest.webmanifest', '/icons/icon.svg', '/icons/icon-192.png', '/icons/icon-512.png'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(V).then(c => c.addAll(CORE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(ks => Promise.all(ks.filter(k => k !== V).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const { request } = e;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== location.origin) return;              // never cache third parties

  // navigations: network-first, fall back to cached shell
  if (request.mode === 'navigate') {
    e.respondWith(
      fetch(request).then(r => {
        const copy = r.clone();
        caches.open(V).then(c => c.put('/index.html', copy));
        return r;
      }).catch(() => caches.match('/index.html'))
    );
    return;
  }

  // assets: cache-first, refresh in background
  e.respondWith(
    caches.match(request).then(hit => {
      const net = fetch(request).then(r => {
        if (r && r.status === 200) {
          const copy = r.clone();
          caches.open(V).then(c => c.put(request, copy));
        }
        return r;
      }).catch(() => hit);
      return hit || net;
    })
  );
});
