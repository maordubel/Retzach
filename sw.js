/* רצח · הארכיון — service worker | Dubel Team
   אסטרטגיה: network-first לכל מה ששלנו, כדי שדיפלוי חדש נראה מיד.
   הקאש משמש רק כרשת ביטחון כשאין אינטרנט. */
const V = 'retzach-v7';
const CORE = ['/', '/index.html', '/assets/style.css', '/assets/data.js', '/assets/scenes.js', '/assets/cases.js', '/assets/app.js'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(V).then(c => c.addAll(CORE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(ks => Promise.all(ks.filter(k => k !== V).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('message', e => { if (e.data === 'skipWaiting') self.skipWaiting(); });

self.addEventListener('fetch', e => {
  const { request } = e;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== location.origin) return;                 // צד שלישי — לא נוגעים

  const isImage = request.destination === 'image' || /\/(img|icons)\//.test(url.pathname);

  if (isImage) {                                              // תמונות: cache-first, הן לא משתנות
    e.respondWith(
      caches.match(request).then(hit => hit || fetch(request).then(r => {
        if (r && r.status === 200) { const c = r.clone(); caches.open(V).then(x => x.put(request, c)); }
        return r;
      }))
    );
    return;
  }

  /* כל השאר (HTML, CSS, JS): network-first — תמיד הגרסה החדשה */
  e.respondWith(
    fetch(request).then(r => {
      if (r && r.status === 200) { const c = r.clone(); caches.open(V).then(x => x.put(request, c)); }
      return r;
    }).catch(() => caches.match(request).then(hit => hit || caches.match('/index.html')))
  );
});
