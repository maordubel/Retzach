/* ---------- ICONS ---------- */
const IC = {
  chev:'<svg viewBox="0 0 24 24"><path d="M6 9l6 6 6-6"/></svg>',
  arrow:'<svg viewBox="0 0 24 24"><path d="M15 6l-6 6 6 6"/></svg>',
  ext:'<svg viewBox="0 0 24 24"><path d="M9 6l-6 6 6 6"/></svg>',
  file:'<svg viewBox="0 0 24 24"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/></svg>',
  users:'<svg viewBox="0 0 24 24"><path d="M17 20v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9.5" cy="7" r="4"/><path d="M22 20v-2a4 4 0 0 0-3-3.9"/></svg>',
  cam:'<svg viewBox="0 0 24 24"><path d="M3 8a2 2 0 0 1 2-2h2l1.5-2h7L17 6h2a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><circle cx="12" cy="13" r="4"/></svg>',
  clock:'<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
  link:'<svg viewBox="0 0 24 24"><path d="M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1"/><path d="M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1"/></svg>',
  yt:'<svg viewBox="0 0 24 24"><rect x="2" y="5" width="20" height="14" rx="4"/><path d="M10 9.5l5 2.5-5 2.5z"/></svg>',
  sp:'<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M7.5 9.5c3-1 7-.7 9.5.8M8 13c2.4-.8 5.5-.5 7.5.8M8.6 16c1.9-.6 4.2-.4 5.8.6"/></svg>',
  tv:'<svg viewBox="0 0 24 24"><rect x="2" y="6" width="20" height="13" rx="2"/><path d="M8 3l4 3 4-3"/></svg>',
  doc:'<svg viewBox="0 0 24 24"><path d="M4 5a2 2 0 0 1 2-2h8l6 6v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z"/><path d="M14 3v6h6M8 13h8M8 17h5"/></svg>',
  play:'<svg viewBox="0 0 24 24"><path d="M8 5.5v13l11-6.5z"/></svg>',
  mic:'<svg viewBox="0 0 24 24"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3M9 21h6"/></svg>',
  star:'<svg viewBox="0 0 24 24"><path d="M12 4l2.3 4.7 5.2.8-3.8 3.6.9 5.1L12 15.8 7.4 18.2l.9-5.1L4.5 9.5l5.2-.8z"/></svg>',
  eyeoff:'<svg viewBox="0 0 24 24"><path d="M10.6 6.2A9 9 0 0 1 12 6c5 0 9 6 9 6a15 15 0 0 1-2.8 3.3M6.6 6.8A15 15 0 0 0 3 12s4 6 9 6a9 9 0 0 0 3.8-.8"/><path d="M3 3l18 18"/></svg>',
  gift:'<svg viewBox="0 0 24 24"><path d="M4 11h16v9a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1z"/><path d="M3 7h18v4H3zM12 7v14"/><path d="M12 7S10.5 3 8.5 3.5 8 7 12 7zM12 7s1.5-4 3.5-3.5S16 7 12 7z"/></svg>',
  brush:'<svg viewBox="0 0 24 24"><path d="M15 4l5 5-9 9H6v-5z"/><path d="M13 6l5 5M5 20h5"/></svg>',
  check:'<svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7"/></svg>',
  cal:'<svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/></svg>',
  x:'<svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg>',
  fb:'<svg viewBox="0 0 24 24"><path d="M14 8h3V4h-3a4 4 0 0 0-4 4v2H8v4h2v6h4v-6h3l1-4h-4V9a1 1 0 0 1 1-1z"/></svg>'
};

const HN = {
  verdict:['הכרעה', 'star'],
  promise:['הובטח בפרק', 'check'],
  skip:   ['הושמט במכוון', 'eyeoff'],
  rec:    ['המלצה של מאיה', 'play'],
  art:    ['תיעוד ויזואלי', 'brush'],
  bts:    ['מאחורי הקלעים', 'mic'],
  live:   ['לייבים', 'cal'],
  fun:    ['סתם, כי כן', 'gift']
};

const COST = {
  free: ['חינם', 'free'],
  ads:  ['חינם עם פרסומות', 'ads'],
  paid: ['בתשלום', 'paid'],
  info: ['דף מידע', '']
};

/* ---------- HELPERS ---------- */
const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const esc = s => s.replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

let io = null;
function observe(root) {
  if (!io) io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: .12, rootMargin: '0px 0px -6% 0px' });
  root.querySelectorAll('.rv:not(.in),.case:not(.in),.tli:not(.in)').forEach(el => io.observe(el));
}

function countUp(el, target) {
  const dur = 1100, t0 = performance.now();
  const step = t => {
    const p = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - p, 3);
    el.textContent = Math.round(target * e).toLocaleString('he-IL');
    if (p < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}



/* =====================================================================
   MEDIA RESOLVER · פותר תמונות חופשיות מוויקישיתוף בזמן ריצה
   שתי קריאות API בלבד, תוצאה נשמרת ב-sessionStorage ל-24 שעות.
   רק מדיה שמאוחסנת בוויקישיתוף מוצגת — כלומר רק רישיונות חופשיים.
   ===================================================================== */
const M = { map: {}, done: false, waiters: [] };
const M_CACHE_KEY = 'retzach.media.v1';
const M_TTL = 864e5; // 24h

function mCacheRead() {
  try {
    const raw = sessionStorage.getItem(M_CACHE_KEY);
    if (!raw) return null;
    const o = JSON.parse(raw);
    if (!o || Date.now() - o.t > M_TTL) return null;
    return o.d;
  } catch (e) { return null; }
}
function mCacheWrite(d) {
  try { sessionStorage.setItem(M_CACHE_KEY, JSON.stringify({ t: Date.now(), d })); } catch (e) {}
}

const api = (host, params) =>
  fetch(`https://${host}/w/api.php?${new URLSearchParams({ format: 'json', origin: '*', ...params })}`,
        { mode: 'cors', credentials: 'omit' }).then(r => r.json());

const chunk = (a, n) => a.reduce((o, x, i) => (i % n ? o[o.length - 1].push(x) : o.push([x]), o), []);

/* גרד תגיות HTML משדות המטא-דאטה של ויקישיתוף */
function plain(html) {
  if (!html) return '';
  const d = document.createElement('div');
  d.innerHTML = html;
  return (d.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 90);
}

async function loadMedia() {
  const cached = mCacheRead();
  if (cached) { M.map = cached; M.done = true; return M.map; }

  /* מצב מועדף: תמונות שהורדו לשרת שלנו (tools/fetch-media.mjs) */
  try {
    const r = await fetch('/img/commons/manifest.json', { cache: 'no-cache' });
    if (r.ok) {
      const man = await r.json();
      if (man && Object.keys(man).length) {
        M.map = man; M.done = true; mCacheWrite(man);
        M.waiters.splice(0).forEach(fn => { try { fn(); } catch (e) {} });
        return M.map;
      }
    }
  } catch (e) { /* אין מניפסט — ממשיכים ל-API החי */ }

  const out = {};
  try {
    /* --- שלב 1: כותרת ערך בוויקיפדיה → שם קובץ תמונת הפתיח --- */
    const wikiKeys = Object.keys(MEDIA).filter(k => MEDIA[k].wiki);
    const artToFile = {};
    for (const part of chunk([...new Set(wikiKeys.map(k => MEDIA[k].wiki))], 40)) {
      const r = await api('en.wikipedia.org', {
        action: 'query', prop: 'pageimages', piprop: 'name', pilicense: 'free',
        redirects: '1', titles: part.join('|')
      });
      const pages = (r.query && r.query.pages) || {};
      const norm = {};
      ((r.query && r.query.normalized) || []).forEach(n => norm[n.to] = n.from);
      ((r.query && r.query.redirects) || []).forEach(n => norm[n.to] = norm[n.from] || n.from);
      Object.values(pages).forEach(pg => {
        if (!pg.pageimage) return;
        const original = norm[pg.title] || pg.title;
        artToFile[original] = 'File:' + pg.pageimage;
        artToFile[pg.title] = 'File:' + pg.pageimage;
      });
    }

    /* --- שלב 2: פרטי הקובץ + רישיון, מוויקישיתוף בלבד --- */
    const need = {};
    Object.keys(MEDIA).forEach(k => {
      const m = MEDIA[k];
      const f = m.commons || artToFile[m.wiki];
      if (f) (need[f] = need[f] || []).push(k);
    });

    for (const part of chunk(Object.keys(need), 40)) {
      const r = await api('commons.wikimedia.org', {
        action: 'query', prop: 'imageinfo',
        iiprop: 'url|extmetadata|mime',
        iiurlwidth: '1100',
        iiextmetadatafilter: 'Artist|LicenseShortName|LicenseUrl|Credit',
        titles: part.join('|')
      });
      const pages = (r.query && r.query.pages) || {};
      Object.values(pages).forEach(pg => {
        if (pg.missing !== undefined || !pg.imageinfo || !pg.imageinfo[0]) return;
        const ii = pg.imageinfo[0];
        const md = ii.extmetadata || {};
        const lic = plain(md.LicenseShortName && md.LicenseShortName.value) || 'רישיון חופשי';
        const rec = {
          src: ii.thumburl || ii.url,
          full: ii.url,
          page: ii.descriptionurl,
          author: plain((md.Artist && md.Artist.value) || (md.Credit && md.Credit.value)) || 'ויקישיתוף',
          lic,
          file: pg.title
        };
        (need[pg.title] || []).forEach(k => out[k] = rec);
      });
    }
  } catch (e) {
    /* אופליין או חסימת רשת — נשארים עם האיורים */
  }

  M.map = out; M.done = true;
  if (Object.keys(out).length) mCacheWrite(out);
  M.waiters.splice(0).forEach(fn => { try { fn(); } catch (e) {} });
  return out;
}

/* HTML של מסגרת מדיה: איור עכשיו, תמונה אמיתית כשהיא נפתרת */
function media(key, fallbackHTML, o) {
  o = o || {};
  const m = MEDIA[key];
  if (!m) return fallbackHTML || '';
  return `<div class="phwrap media noimg${o.crop ? ' crop' : ''}${key.startsWith('map-') ? ' is-map' : ''}" data-media="${key}">
    <div class="fb">${fallbackHTML || ''}</div></div>`;
}

/* מילוי מסגרות שכבר נפתרו */
function hydrateMedia(root) {
  (root || document).querySelectorAll('[data-media]').forEach(el => {
    if (el.dataset.filled) return;
    const rec = M.map[el.dataset.media];
    if (!rec) return;
    el.dataset.filled = '1';
    const cap = (MEDIA[el.dataset.media] && MEDIA[el.dataset.media].cap) || '';
    const bg = document.createElement('div');
    bg.className = 'ph-bg'; bg.style.backgroundImage = `url('${rec.src}')`;
    const img = document.createElement('img');
    img.loading = 'lazy'; img.decoding = 'async'; img.alt = cap;
    img.className = 'zoomable';
    img.onload = () => {
      el.classList.remove('noimg');
      if (!el.closest('.avatar, .nx-thumb, .ev-vis')) {
        const c = document.createElement('a');
        c.className = 'mcredit';
        c.href = rec.page; c.target = '_blank'; c.rel = 'noopener nofollow';
        c.innerHTML = `<span class="mc-i">${IC.cam}</span><span>${esc(rec.author)} · ${esc(rec.lic)} · Wikimedia Commons</span>`;
        c.onclick = ev => ev.stopPropagation();
        el.appendChild(c);
      }
      img.onclick = ev => { ev.stopPropagation(); openLightbox(rec.full, cap + ' — ' + rec.author + ' · ' + rec.lic); };
    };
    img.onerror = () => { img.remove(); el.dataset.filled = ''; };
    img.src = rec.src;
    el.insertBefore(img, el.firstChild);
    el.insertBefore(bg, el.firstChild);
  });
}

/* רשימת קרדיטים — נבנית מהמדיה שנפתרה בפועל */
function creditsHTML(keys) {
  const seen = new Set(), rows = [];
  keys.forEach(k => {
    const r = M.map[k];
    if (!r || seen.has(r.file)) return;
    seen.add(r.file);
    rows.push(`<a class="crow" href="${r.page}" target="_blank" rel="noopener nofollow">
      <span class="cr-t">${esc((MEDIA[k] && MEDIA[k].cap) || r.file.replace(/^File:/, ''))}</span>
      <span class="cr-m">${esc(r.author)} · ${esc(r.lic)}</span></a>`);
  });
  if (!rows.length) return '';
  return `<div class="block rv"><div class="block-h"><span class="ico">${IC.cam}</span><h3>קרדיטים לתמונות</h3></div>
    <div class="credits">${rows.join('')}</div>
    <div class="note">כל התמונות שמוצגות בתיק הזה מגיעות מ־<b>ויקישיתוף</b> ומפורסמות ברישיון חופשי או בנחלת הכלל. לחיצה על שורה פותחת את דף הקובץ המקורי עם פרטי הרישיון המלאים.</div>
  </div>`;
}


/* ---------- ANALYTICS (עדין, ללא עוגיות, ללא צד שלישי) ---------- */
let _newVisitor = false;
try {
  if (!localStorage.getItem('retzach.seen')) { localStorage.setItem('retzach.seen', '1'); _newVisitor = true; }
} catch (e) {}
function track(path) {
  try {
    const l = JSON.parse(localStorage.getItem('retzach.hits') || '{}');
    l[path] = (l[path] || 0) + 1;
    localStorage.setItem('retzach.hits', JSON.stringify(l));
    if (_newVisitor) localStorage.setItem('retzach.vis', String((+localStorage.getItem('retzach.vis') || 0) + 1));
  } catch (e) {}
  try {
    const body = JSON.stringify({ p: path, n: _newVisitor });
    _newVisitor = false;
    if (navigator.sendBeacon) navigator.sendBeacon('/api/track', new Blob([body], { type: 'application/json' }));
    else fetch('/api/track', { method: 'POST', body, keepalive: true, headers: { 'Content-Type': 'application/json' } }).catch(() => {});
  } catch (e) {}
}

/* ---------- ADMIN (נסתר) ---------- */
function loadAdmin() {
  if (window.openAdmin) return window.openAdmin();
  window.__adminWanted = true;
  const sc = document.createElement('script');
  sc.src = '/assets/admin.js?v=9'; document.head.appendChild(sc);
}
addEventListener('keydown', e => {
  if (e.ctrlKey && e.shiftKey && (e.key === 'A' || e.key === 'a')) { e.preventDefault(); loadAdmin(); }
});
if (/[?&]admin\b/.test(location.search)) setTimeout(loadAdmin, 300);
(function () {                       // שבע לחיצות על תג הגרסה
  let n = 0, t = 0;
  document.addEventListener('click', e => {
    if (!e.target.closest('.tape')) return;
    const now = Date.now(); n = now - t < 900 ? n + 1 : 1; t = now;
    if (n >= 7) { n = 0; loadAdmin(); }
  });
})();

/* ---------- תמונות שהוזנו בלוח הבקרה ---------- */
(function () {
  let custom = {};
  try { custom = JSON.parse(localStorage.getItem('retzach.custom') || '{}'); } catch (e) {}
  const merged = Object.assign({}, window.CUSTOM_IMAGES || {}, custom);
  Object.keys(merged).forEach(k => { if (merged[k]) IMG[k] = merged[k]; });
})();

/* ---------- BRAND ---------- */
const BRAND = {
  site: 'https://retzach.dubelteam.com/',
  by:   'Dubel Team',
  url:  'https://www.dubelteam.com/?utm_source=retzach&utm_medium=app&utm_campaign=archive'
};

function toast(msg) {
  const t = $('#toast'); t.textContent = msg; t.classList.add('on');
  clearTimeout(toast._id); toast._id = setTimeout(() => t.classList.remove('on'), 2200);
}

async function share(title, url) {
  const data = { title, text: 'ארכיון הרצח — כל מה שדובר עליו בפרק', url };
  try {
    if (navigator.share) { await navigator.share(data); return; }
    await navigator.clipboard.writeText(url);
    toast('הקישור הועתק');
  } catch (e) { /* user cancelled */ }
}

function openLightbox(src, cap) {
  const lb = $('#lightbox');
  lb.innerHTML = `<button class="lb-x" aria-label="סגירה">${IC.x}</button>
    <img src="${src}" alt="${esc(cap || '')}">
    ${cap ? `<div class="lb-cap">${esc(cap)}</div>` : ''}`;
  lb.classList.add('on');
  document.body.style.overflow = 'hidden';
  lb.onclick = closeLightbox;
}
function closeLightbox() {
  $('#lightbox').classList.remove('on');
  if (!$('#sheet').classList.contains('on')) document.body.style.overflow = '';
}

function scene(key, cap) {
  const svg = (typeof SCENE !== 'undefined' && SCENE[key]) || '';
  if (!svg) return '';
  return `<div class="sceneframe">${svg}${cap ? `<span class="scene-cap">${esc(cap)}</span>` : ''}</div>`;
}

function openAbout() {
  $('#sheet-body').innerHTML = `
    <div class="grab"></div>
    <div class="ab-hero">
      <div class="mark">ארכיון<br>הרצח</div>
      <p><b>מחווה לקהילת המאזינים של פודקאסט רצח — ולה בלבד.</b> נבנה כדי להעשיר את הידע של מאזינים שמעוניינים בכך. לכל פרק — תיק אחד שמרכז את הראיות, הקורבנות, ציר הזמן, הסרטים הדוקומנטריים והמקורות שדובר עליהם.</p>
    </div>

    <div class="ab-block">
      <h5>מה זה</h5>
      <p><b>ארכיון הרצח</b> הוא מחווה עצמאית ולא מסחרית ל<b>קהילת המאזינים של פודקאסט רצח</b>. הוא נבנה בשביל הקהילה הזאת ובשבילה בלבד, ולמטרה אחת: <b>להעשיר את הידע של מאזינים שמעוניינים בכך</b> אחרי שהם מסיימים פרק.</p>
      <p>הוא <b>אינו מסונף לפודקאסט, אינו מייצג אותו ואינו מחליף אותו</b>. אין לו כל קשר רשמי למאיה גזית, לשי מגל או למי מטעמם. הוא לא נועד להרוויח, לא נועד לתחרות, ולא נועד להחליף האזנה.</p>
      <p>התוכן המקורי, המחקר, העריכה והמותג של הפודקאסט שייכים ל<b>מאיה גזית ושי מגל</b>. כל מה שיש כאן נאסף כדי לתת מקום אחד למה שכבר דובר עליו בפרק — ומעולם לא כתחליף לו.</p>
      <p style="color:var(--muted2);font-size:12.5px">בקשת הסרה, תיקון או שינוי מכל סיבה — נענית מיד. <a href="https://www.dubelteam.com/contact.html" target="_blank" rel="noopener" style="color:var(--red-hot)">צרו קשר</a>.</p>
    </div>

    <div class="ab-block">
      <h5>איך נבנה תיק</h5>
      <p>כל עובדה מוצלבת מול מקורות ראשוניים או תקשורת מוכרת, ומופיעה עם קישור בלשונית "מקורות". כשמקורות חלוקים — מוצגים שני הנתונים. טענות שלא הוכחו בבית משפט מסומנות ככאלה.</p>
      <p>תיק נפתח רק אחרי שהוא מתועד במלואו. עד אז הוא מסומן <b>"בקרוב"</b>.</p>
    </div>


    <div class="ab-block">
      <h5>מי עומד מאחורי זה</h5>
      <p>מאחורי הממשק הנקי של הארכיון עומדת <b>רשת מחקר אנושית</b>. מחקר על תיק יכול להתחיל בשיחה — עם עיתונאי, עם אדם מהתחום, עם מי שהיה שם, עם ארכיונאי. לצוות של <b>DUBEL TEAM</b> יש גישה למגוון נקודות מבט ומקורות.</p>
      <p>ובכל זאת: <b>קשרים אישיים אינם ראיה.</b></p>
      <div class="sep-grid">
        <div class="sep"><b>קצה חוט</b><span>כיוון לבדיקה. לא נכנס לארכיון בפני עצמו.</span></div>
        <div class="sep"><b>מקור</b><span>אדם או מסמך. נבדק מול מקורות נוספים.</span></div>
        <div class="sep"><b>דעה</b><span>פרשנות. מסומנת ככזו, תמיד.</span></div>
        <div class="sep v"><b>עובדה מאומתת</b><span>מתועדת, מקושרת, וניתנת לבדיקה.</span></div>
      </div>
      <p style="margin-top:12px">אנשים מספקים כיווני חקירה, הקשר ופרספקטיבה. <b>מקורות, תיעוד ואימות קובעים מה נכנס לארכיון.</b> ההפרדה הזאת נשמרת בכל תיק, גם כשהיא עולה בזמן ובעומק.</p>
    </div>

    <div class="ab-block">
      <h5>מדיניות התוכן</h5>
      <p>הארכיון אינו מפרסם תצלומי נתיחה, חומר מיני או תיעוד גרפי של קורבנות. חומר מזירת אירוע שיש בו ערך תיעודי מוצג <b>מטושטש, מאחורי אישור מפורש</b>. כשמאיה בחרה בפרק לא להציג משהו — הבחירה הזאת מכובדת גם כאן.</p>
      <p>יש טעות? היא תתוקן ותסומן. תיקון אינו מבוכה — הוא חלק מהשיטה.</p>
    </div>

    <div class="ab-block">
      <h5>מי בנה</h5>
      <p><b>DUBEL TEAM</b> — חברת אופרייטורס בהובלת מייסד, מבסיס באתונה. בונים ומריצים מוצרים, מותגים ותפעול — מאסטרטגיה ועד הדבר שעובד בפועל.</p>
      <div class="ab-tags"><span>Brand &amp; Strategy</span><span>Operations</span><span>Events &amp; Production</span><span>Digital Products</span><span>Greece Market Entry</span></div>
      <a class="ab-cta" href="${BRAND.url}" target="_blank" rel="noopener">
        <div class="t"><h6>DUBELTEAM.COM</h6><p>Built by the brief. An operator.</p></div>
        <div class="go"><svg viewBox="0 0 24 24"><path d="M9 6l-6 6 6 6"/></svg></div>
      </a>
    </div>

    <div class="ab-block">
      <h5>יש הערה או תיקון?</h5>
      <p>דיוק הוא כל העניין כאן. אם משהו לא מדויק — כתבו, וזה יתוקן.</p>
      <a class="ab-cta" href="https://www.dubelteam.com/contact.html?utm_source=retzach&utm_medium=app&utm_campaign=feedback" target="_blank" rel="noopener">
        <div class="t"><h6>שליחת הערה</h6><p>dubelteam.com/contact</p></div>
        <div class="go"><svg viewBox="0 0 24 24"><path d="M9 6l-6 6 6 6"/></svg></div>
      </a>
    </div>
    <div style="height:10px"></div>`;
  $('#sheet').classList.add('on');
  document.body.style.overflow = 'hidden';
}

/* ---------- HOME ---------- */
let filterS = 'all', query = '';

function renderChips() {
  const seasons = [...new Set(EPISODES.map(e => e.s))].sort((a, b) => b - a);
  $('#chips').innerHTML = `<button class="chip ${filterS === 'all' ? 'on' : ''}" data-s="all">הכל</button>` +
    seasons.map(s => `<button class="chip ${filterS == s ? 'on' : ''}" data-s="${s}">עונה ${s}</button>`).join('') +
    `<button class="chip ${filterS === 'ready' ? 'on' : ''}" data-s="ready">תיקים סגורים</button>`;
  $$('#chips .chip').forEach(c => c.onclick = () => { filterS = c.dataset.s; renderChips(); renderCases();
track('/');
loadMedia().then(() => { hydrateMedia(document); }); });
}

function renderCases() {
  const list = EPISODES.filter(e => {
    if (filterS === 'ready' && !e.ready) return false;
    if (filterS !== 'all' && filterS !== 'ready' && e.s != filterS) return false;
    if (query && !(e.name + ' עונה ' + e.s + ' פרק ' + e.e + ' ' + (e.tag || '')).includes(query)) return false;
    return true;
  });
  $('#count').textContent = `${list.length} מתוך ${EPISODES.length}`;
  const box = $('#cases');
  if (!list.length) { box.innerHTML = `<div class="empty">לא נמצא תיק תואם.</div>`; return; }
  box.innerHTML = list.map(e => `
    <div class="case ${e.ready ? 'ready' : 'soon'}" ${e.ready ? `data-go="${e.id}"` : ''}>
      <div class="avatar${e.ready ? ' wide' : ''}">${e.img
        ? photo(e.img, (e.id && DB[e.id] && scene(DB[e.id].scene)) || plateFor('portrait', e.e), { crop: 1 })
        : (e.ready ? plateFor('portrait', e.e) : `<span class="init">${esc(e.name.trim()[0])}</span>`)}</div>
      <div class="case-body">
        <h3>${esc(e.name)}</h3>
        <div class="case-meta">
          <span>עונה ${e.s} · פרק ${e.e}</span><i class="dot"></i><span>${e.date}</span>
          ${e.dur ? `<i class="dot"></i><span>${e.dur}</span>` : ''}
        </div>
        <div style="margin-top:7px;display:flex;gap:5px;flex-wrap:wrap">
          ${e.ready ? `<span class="badge">תיק סגור</span>` : `<span class="badge n">בקרוב</span>`}
          ${e.tag ? `<span class="badge g">${esc(e.tag)}</span>` : ''}
        </div>
      </div>
      <div class="arrow">${IC.arrow}</div>
    </div>`).join('');
  $$('.case[data-go]').forEach(c => c.onclick = () => openKiller(c.dataset.go));
  observe(box);
}

/* ---------- KILLER PAGE ---------- */
function ohioMap(vics) {
  const pins = vics.map(v => `
    <g class="pin" data-v="${v.n}">
      <circle class="halo" cx="${v.x}" cy="${v.y}" r="3">
        <animate attributeName="r" values="3;9;3" dur="2.8s" begin="${v.n * .38}s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values=".8;0;.8" dur="2.8s" begin="${v.n * .38}s" repeatCount="indefinite"/>
      </circle>
      <circle class="core" cx="${v.x}" cy="${v.y}" r="3.4"/>
      <text x="${v.x}" y="${v.y + 1.5}" text-anchor="middle" style="font-size:4px;fill:#fff;font-weight:900">${v.n}</text>
    </g>`).join('');
  const land = 'M18 27 L41 25 Q54 20 66 25 Q79 29 89 35 L89 62 Q86 69 80 72 Q75 76 72 82 Q64 87 55 88 Q47 92 40 90 Q31 85 25 78 Q21 74 18 73 Z';
  return `<svg id="ohio" viewBox="0 0 100 100">
    <defs><linearGradient id="lg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#241d15"/><stop offset="1" stop-color="#171208"/></linearGradient></defs>
    <path class="land" d="${land}" fill="url(#lg)"/>
    <path d="M41 25 Q54 20 66 25 Q79 29 89 35" fill="none" stroke="#2f5f7d" stroke-width="1.6" opacity=".8"/>
    <path d="M43 21 Q56 16 68 20 Q78 24 86 29" fill="none" stroke="#2f5f7d" stroke-width=".6" opacity=".3"/>
    <text x="60" y="15" text-anchor="middle" style="font-size:3.4px;fill:#4a7d9c;font-family:Heebo;letter-spacing:.3px">אגם אירי</text>
    <text x="36" y="56" text-anchor="middle" style="font-size:6px;fill:#332b22;font-family:'Frank Ruhl Libre';font-weight:900;letter-spacing:1px">OHIO</text>
    ${pins}
  </svg>
  <div class="vlegend">${vics.map(v => `<button data-lv="${v.n}"><span class="n">${v.n}</span>${esc(v.name)}</button>`).join('')}</div>`;
}


/* ---------- משותף לכל התיקים ---------- */
function bindCommon(k) {
  const nc = $('#v-killer .nextcase');
  if (nc) nc.onclick = () => openKiller(nc.dataset.next);
  $$('#v-killer .phwrap img').forEach(im => {
    if (im.dataset.lb) return; im.dataset.lb = '1'; im.classList.add('zoomable');
    im.onclick = ev => {
      const t = im.closest('.gtile, .vphoto, .mtile');
      if (t && t.classList.contains('sens') && !t.classList.contains('shown')) return;
      ev.stopPropagation();
      const cap = t ? (t.querySelector('figcaption, .cap') || {}).textContent : '';
      openLightbox(im.src, cap || '');
    };
  });
  const pl = $('#player');
  pl.classList.add('on'); pl.classList.remove('open');
  $('#pl-title').textContent = 'תכירו: ' + (k.short || k.name);
  $('#pl-sub').textContent = (k.ep || '') + (k.epDate ? ' · ' + k.epDate : '');
  const btn = $('#pl-toggle');
  if (k.spotify) {
    $('#pl-frame').dataset.src = `https://open.spotify.com/embed/episode/${k.spotify}?utm_source=generator&theme=0`;
    btn.dataset.url = ''; btn.textContent = 'האזן לפרק';
  } else {
    $('#pl-frame').dataset.src = ''; $('#pl-frame').src = '';
    btn.dataset.url = k.epUrl || ''; btn.textContent = 'פתח בספוטיפיי';
  }
  track('case:' + k.id);
}

const IMGS_OF = id => { const e = EPISODES.find(x => x.id === id); return e && e.img; };
function nextCase(currentId) {
  const ready = EPISODES.filter(e => e.ready && e.id);
  if (ready.length < 2) return '';
  const i = ready.findIndex(e => e.id === currentId);
  const n = ready[(i + 1) % ready.length];
  return `<button class="nextcase rv" data-next="${n.id}">
    <div class="nx-thumb">${scene(DB[n.id] && DB[n.id].scene) || photo(IMGS_OF(n.id), plateFor('portrait', n.e), { crop: 1 })}</div>
    <div class="nx-t"><span>התיק הבא בארכיון</span><h4>${esc(n.name)}</h4></div>
    <div class="nx-go">${IC.arrow}</div>
  </button>`;
}

function openKiller(id, skipHistory) {
  const k = DB[id]; if (!k) return;
  $('#tb-k-title').textContent = k.name;
  document.title = k.name + ' · ארכיון הרצח';
  if (!skipHistory) history.pushState({ id }, '', '?case=' + id);

  const html = `
  <div class="kwrap">
  <div class="kaside">
  <div class="khero">
    <div class="khero-bg"></div>
    <div class="mug">
      <div class="scan"></div>
      <span class="corner c1"></span><span class="corner c2"></span><span class="corner c3"></span><span class="corner c4"></span>
      ${photo(k.heroKey, scene(k.scene, 'המחשה · יצירה מקורית') || `<div style="width:150px;height:150px">${ART[k.heroArt] || ART.sketch}</div>`)}
      <div class="caselabel">${esc(k.caseLabel || 'CASE FILE')}</div>
    </div>
    <h1 class="kname">${esc(k.name)}</h1>
    <div><span class="kalias">${esc(k.alias)}</span></div>
    <p class="kline">${k.line}</p>
    <div class="stats">${k.stats.map(s => `<div class="stat"><div class="n" data-n="${s.n}">0</div><div class="l">${esc(s.l)}</div></div>`).join('')}</div>
  </div>
  </div>

  <div class="kmain">
  <div class="tabs" id="tabs">
    <button class="tab on" data-p="file">התיק</button>
    ${k.host ? '<button class="tab" data-p="host">מהפרק</button>' : ''}
    <button class="tab" data-p="vic">הקורבנות</button>
    <button class="tab" data-p="ev">ראיות</button>
    <button class="tab" data-p="tl">ציר זמן</button>
    <button class="tab" data-p="src">מקורות</button>
  </div>

  <div class="pad">

    <!-- FILE -->
    <div class="panel on" id="p-file">
      <div class="block rv"><div class="block-h"><span class="ico">${IC.file}</span><h3>גיליון תיק</h3></div>
        <div class="card"><div class="facts">${k.facts.map(f => `<div class="fact"><div class="k">${esc(f[0])}</div><div class="v">${f[1]}</div></div>`).join('')}</div></div>
      </div>
      ${k.story.map((s, i) => `
      <div class="block rv"><div class="block-h"><span class="ico">${IC.file}</span><h3>${esc(s.h)}</h3></div>
        <div class="card"><div class="prose"><p>${s.t}</p></div></div>
        ${k.quotes[i] ? `<div class="quote rv"><p>${esc(k.quotes[i].t)}</p><div class="by">— <b>${esc(k.quotes[i].by)}</b>${k.quotes[i].role ? ' · ' + esc(k.quotes[i].role) : ''}</div></div>` : ''}
      </div>`).join('')}
      ${k.quotes.slice(k.story.length).map(q => `<div class="block rv">
        <div class="quote"><p>${esc(q.t)}</p><div class="by">— <b>${esc(q.by)}</b>${q.role ? ' · ' + esc(q.role) : ''}</div></div>
      </div>`).join('')}
      ${k.gal && k.gal.length ? `<div class="block rv"><div class="block-h"><span class="ico">${IC.cam}</span><h3>תמונות מהתיק</h3></div>
        <div class="gal">${k.gal.map((g, i) => `
          <figure class="gtile${g.sens ? ' sens' : ''}">
            ${photo(g.k, plateFor(['portrait','letter','witness'][i % 3], i))}
            ${g.sens ? `<button class="sens-veil" type="button"><span>${IC.eyeoff}</span><b>תוכן רגיש</b><i>לחצו להצגה</i></button>` : ''}
            <figcaption>${esc(g.c)}</figcaption>
          </figure>`).join('')}</div>
        <div class="note">התמונות באדיבות החומרים שפורסמו בקבוצת הפודקאסט. תמונות שסומנו כרגישות מוסתרות כברירת מחדל — בהתאם למדיניות התוכן של הארכיון.</div>
      </div>` : ''}
      ${k.gallery && k.gallery.length ? `<div class="block rv"><div class="block-h"><span class="ico">${IC.cam}</span><h3>המקומות שבתיק</h3></div>
        <div class="gal">${k.gallery.map(mk => `<figure class="gtile">${media(mk, plateFor('profile'), { contain: mk.startsWith('map-') })}<figcaption>${esc((MEDIA[mk] || {}).cap || '')}</figcaption></figure>`).join('')}</div>
        <div class="note">תמונות אמיתיות מוויקישיתוף, ברישיון חופשי. הן מראות את <b>המקומות</b> שבהם התיק התרחש — לא את המעורבים.</div>
      </div>` : ''}
      <div class="note"><b>הערה על דיוק.</b> כל עובדה בעמוד הזה מגובה במקורות המופיעים בלשונית "מקורות". במקרים שבהם מקורות שונים חלוקים (למשל מספר ההצתות המדויק) — מוצגים שני הנתונים.</div>
    </div>

    <!-- HOST NOTES -->
    ${k.host ? `<div class="panel" id="p-host">
      <div class="block rv"><div class="block-h"><span class="ico">${IC.mic}</span><h3>מהפרק · הערות מאיה</h3></div>
        <div class="host-intro">${k.host.intro}</div>
        <div class="hostgrid">
        ${k.host.items.map(n => {
          const meta = HN[n.k] || HN.bts;
          return `<div class="hn k-${n.k} rv">
            <div class="hn-h">
              <span class="hn-ico">${IC[meta[1]] || IC.mic}</span>
              <h4>${esc(n.t)}</h4>
            </div>
            <p class="hn-d">${n.d}</p>
            ${n.q ? `<div class="hn-q"><p>“${esc(n.q)}”</p><span>— מאיה גזית</span></div>` : ''}
            ${n.link ? `<a class="hn-link" href="${n.link.u}" target="_blank" rel="noopener">${esc(n.link.t)} ${IC.ext}</a>` : ''}
          </div>`;
        }).join('')}
        </div>
        <div class="hn-src">מבוסס על הפוסט של מאיה בקבוצת הפייסבוק של הפודקאסט.<br>הציטוטים מובאים כלשונם, לצורכי תיעוד ומחווה.</div>
      </div>
    </div>` : ''}

    <!-- VICTIMS -->
    <div class="panel" id="p-vic">
      ${k.map === 'ohio' ? `<div class="block rv"><div class="block-h"><span class="ico">${IC.users}</span><h3>מפת הזירות</h3></div>
        <div class="mapwrap"><span class="lbl">EAST-CENTRAL OHIO</span>${ohioMap(k.victims)}
          <div style="font-size:11px;color:var(--muted2);text-align:center;padding:4px 6px 2px;font-weight:300">לחצו על נקודה כדי לפתוח את התיק של הקורבן · המפה סכמטית</div>
        </div>
      </div>` : ''}
      <div class="block rv"><div class="block-h"><span class="ico">${IC.users}</span><h3>${k.victims.length === 5 ? 'חמשת הקורבנות' : k.victims.length === 2 ? 'שתי הקורבנות' : 'הקורבנות'}</h3></div>
        <div class="vgrid">${k.victims.map(v => `
          <div class="victim" id="vic-${v.n}">
            <div class="vhead">
              <div class="vnum">${v.n}</div>
              <div class="t"><h4>${esc(v.name)}</h4><div class="m">${v.f ? 'בת' : 'בן'} ${v.age} · ${esc(v.from)}</div></div>
              <div class="vchev">${IC.chev}</div>
            </div>
            <div class="vbody"><div class="vbody-in">
              ${v.photos && v.photos.length ? `<div class="${v.photos.length > 1 ? 'vshots' : ''}">${v.photos.map(pk => `<div class="vphoto">${photo(pk, portraitPlate(v.name, '', 'ink'))}<span class="cap">${esc(v.name)}</span></div>`).join('')}</div>` : ''}
              ${v.media && v.media.length ? `<div class="mstrip">${v.media.map(mk => `<figure class="mtile">${media(mk, plateFor('profile'), { contain: mk.startsWith('map-') })}<figcaption>${esc((MEDIA[mk] || {}).cap || '')}</figcaption></figure>`).join('')}</div>` : ''}
              <div class="vtags">
                <span class="vtag">${esc(v.date)}</span>
                <span class="vtag">${esc(v.county)}</span>
                <span class="vtag">${esc(v.act)}</span>
              </div>
              <div class="prose" style="font-size:14px"><p>${v.d}</p></div>
              <div class="vtags" style="margin-top:12px;margin-bottom:0">${v.tags.map(t => `<span class="vtag" style="border-color:rgba(193,18,31,.3);color:#ff9c9c">${esc(t)}</span>`).join('')}</div>
              <div style="font-size:10.5px;color:var(--muted2);margin-top:10px;letter-spacing:.05em">${esc(v.en)}</div>
            </div></div>
          </div>`).join('')}</div>
      </div>
    </div>

    <!-- EVIDENCE -->
    <div class="panel" id="p-ev">
      <div class="block rv"><div class="block-h"><span class="ico">${IC.cam}</span><h3>קלסר הראיות</h3></div>
        <div class="evgrid">${k.evidence.map((e, i) => `
          <button class="ev ${e.wide ? 'wide' : ''}" data-ev="${i}">
            <div class="ev-vis"><span class="ev-stamp">${esc(e.s)}</span>${e.img
              ? photo(e.img, ART[e.art] || ART.letter, { contain: e.contain })
              : (e.media ? media(e.media, plateFor(e.art, i), { contain: String(e.media).startsWith('map-') }) : plateFor(e.art, i))}</div>
            <div class="ev-txt"><h5>${esc(e.t)}</h5><p>${esc(e.p)}</p></div>
          </button>`).join('')}</div>
        <div class="note"><b>תמונות אמיתיות.</b> האיורים כאן הם המחשות סגנוניות שנוצרו לאפליקציה. הקלסתרון המקורי, תמונות הקורבנות והאיור של מרי קרסין זמינים דרך הקישורים בלשונית "מקורות".</div>
      </div>
    </div>

    <!-- TIMELINE -->
    <div class="panel" id="p-tl">
      <div class="block rv"><div class="block-h"><span class="ico">${IC.clock}</span><h3>ציר זמן · 1950–2023</h3></div>
        <div class="tl">${k.timeline.map(t => `
          <div class="tli ${t.kill ? 'kill' : ''}">
            <div class="yr">${esc(t.y)}</div>
            <div class="tt">${esc(t.t)}</div>
            <div class="td">${esc(t.d)}</div>
          </div>`).join('')}</div>
      </div>
    </div>

    <!-- SOURCES -->
    <div class="panel" id="p-src">
      ${k.watch && k.watch.length ? `<div class="block rv"><div class="block-h"><span class="ico">${IC.cam}</span><h3>סרטים ודוקו</h3></div>
        <div class="watch">${k.watch.map(w => `
          <a class="wcard" href="${w.u}" target="_blank" rel="noopener">
            <div class="wthumb ${w.i === 'doc' ? 'doc' : w.i === 'pod' ? 'pod' : ''}">${w.i === 'yt' ? IC.play : w.i === 'pod' ? IC.sp : IC.doc}</div>
            <div class="wbody">
              <h5>${esc(w.t)}</h5><p>${esc(w.d)}</p>
              <div class="wtags">
                <span class="wtag ${COST[w.cost] ? COST[w.cost][1] : ''}">${COST[w.cost] ? COST[w.cost][0] : 'לא ידוע'}</span>
                ${w.note ? `<span class="wtag">${esc(w.note)}</span>` : ''}
              </div>
            </div>
          </a>`).join('')}</div>
        ${k.watchNote ? `<div class="note">${k.watchNote}</div>` : ''}
      </div>` : ''}
      <div class="block rv"><div class="block-h"><span class="ico">${IC.link}</span><h3>מקורות לקריאה</h3></div>
        <div class="links">${k.links.map(l => `
          <a class="lnk" href="${l.u}" target="_blank" rel="noopener">
            <div class="li ${l.i === 'yt' ? 'yt' : l.i === 'sp' ? 'sp' : ''}">${IC[l.i] || IC.doc}</div>
            <div class="lt"><h5>${esc(l.t)}</h5><p>${esc(l.d)}</p></div>
            <div class="go">${IC.ext}</div>
          </a>`).join('')}</div>
        <div id="credits-slot"></div>
        <div class="note"><b>ארכיון הרצח</b> הוא מחווה עצמאית ולא מסחרית לקהילת המאזינים של פודקאסט רצח, ולה בלבד. הוא נועד <b>להעשיר את הידע של מאזינים שמעוניינים בכך</b> — ואינו מסונף לפודקאסט, אינו מייצג אותו ואינו מחליף אותו. התוכן המקורי, המחקר והעריכה שייכים למאיה גזית ושי מגל.</div>
      </div>
    </div>

    ${nextCase(k.id)}
  </div>
  </div>
  </div>`;

  $('#k-content').innerHTML = html;
  showView('#v-killer');

  // stats
  $$('#v-killer .stat .n').forEach(el => countUp(el, +el.dataset.n));

  // tabs
  $$('#tabs .tab').forEach(t => t.onclick = () => {
    $$('#tabs .tab').forEach(x => x.classList.remove('on')); t.classList.add('on');
    $$('#v-killer .panel').forEach(p => p.classList.remove('on'));
    const p = $('#p-' + t.dataset.p); p.classList.add('on');
    observe(p);
    window.scrollTo({ top: $('#tabs').offsetTop - 60, behavior: 'smooth' });
  });

  // victims accordion
  $$('#v-killer .victim').forEach(v => {
    v.querySelector('.vhead').onclick = () => {
      const b = v.querySelector('.vbody'), open = v.classList.contains('open');
      $$('#v-killer .victim').forEach(o => { o.classList.remove('open'); o.querySelector('.vbody').style.maxHeight = 0; });
      if (!open) { v.classList.add('open'); b.style.maxHeight = b.scrollHeight + 'px'; }
    };
  });

  // map pins + legend
  const jump = n => {
    const v = $('#vic-' + n);
    if (!v.classList.contains('open')) v.querySelector('.vhead').click();
    v.classList.add('hl'); setTimeout(() => v.classList.remove('hl'), 1300);
    setTimeout(() => v.scrollIntoView({ behavior: 'smooth', block: 'center' }), 60);
  };
  $$('#ohio .pin').forEach(p => p.onclick = () => jump(p.dataset.v));
  $$('.vlegend button').forEach(b => b.onclick = () => jump(b.dataset.lv));

  // evidence sheet
  $$('#v-killer .ev').forEach(b => b.onclick = () => openSheet(k.evidence[+b.dataset.ev]));
  $$('#v-killer .sens-veil').forEach(b => b.onclick = ev => {
    ev.stopPropagation(); b.closest('.gtile').classList.add('shown'); b.remove();
  });


  bindCommon(k);

  observe($('#v-killer'));

  // media: fill what is already resolved, and re-fill when resolution finishes
  const paintMedia = () => {
    hydrateMedia($('#v-killer'));
    const slot = $('#credits-slot');
    if (slot && !slot.dataset.done) {
      const keys = [...new Set([...(k.gallery || []),
        ...(k.victims || []).flatMap(v => v.media || []),
        ...(k.evidence || []).map(e => e.media).filter(Boolean)])];
      const html = creditsHTML(keys);
      if (html) { slot.innerHTML = html; slot.dataset.done = '1'; observe(slot); }
    }
  };
  paintMedia();
  if (!M.done) M.waiters.push(paintMedia); else setTimeout(paintMedia, 0);
}

/* ---------- SHEET ---------- */
function openSheet(e) {
  $('#sheet-body').innerHTML = `
    <div class="grab"></div>
    <div class="big-vis">${e.img
      ? photo(e.img, plateFor(e.art), { contain: true })
      : (e.media ? media(e.media, plateFor(e.art), { contain: true }) : plateFor(e.art))}<span class="ev-stamp" style="top:12px;inset-inline-start:12px">${esc(e.s)}</span></div>
    <h4>${esc(e.t)}</h4>
    <div class="sub">${esc(e.p)}</div>
    <div class="prose">${e.b}</div>
    <div style="height:8px"></div>`;
  $('#sheet').classList.add('on');
  document.body.style.overflow = 'hidden';
  hydrateMedia($('#sheet-body'));
}
function closeSheet() { $('#sheet').classList.remove('on'); document.body.style.overflow = ''; }

/* ---------- NAV ---------- */
function showView(sel) {
  $$('.view').forEach(v => v.classList.remove('on', 'back'));
  $(sel).classList.add('on');
  window.scrollTo(0, 0);
}
function goHome() {
  $$('.view').forEach(v => v.classList.remove('on', 'back'));
  const h = $('#v-home'); h.classList.add('on', 'back');
  $('#player').classList.remove('on', 'open');
  $('#pl-frame').src = '';
  document.title = 'ארכיון הרצח — כל מה שדובר עליו בפרק';
  window.scrollTo(0, 0);
  if (location.search) history.pushState({}, '', location.pathname);
}

/* ---------- INIT ---------- */
const heroArt = $('#hero-art');
if (heroArt) {
  const featured = EPISODES.find(e => e.ready && e.id && DB[e.id] && DB[e.id].scene);
  if (featured) heroArt.innerHTML = scene(DB[featured.id].scene, 'המחשה · יצירה מקורית');
}
renderChips(); renderCases();
track('/');
loadMedia().then(() => { hydrateMedia(document); });
$('#q').oninput = ev => { query = ev.target.value.trim(); renderCases(); };
$('#back').onclick = goHome;
$('#about-btn').onclick = openAbout;
$('#share-btn').onclick = () => share('ארכיון הרצח', BRAND.site);
$('#share-k').onclick = () => {
  const id = new URLSearchParams(location.search).get('case');
  share(document.title, BRAND.site + (id ? '?case=' + id : ''));
};
addEventListener('popstate', e => {
  const id = (e.state && e.state.id) || new URLSearchParams(location.search).get('case');
  if (id && DB[id]) openKiller(id, true); else goHome();
});
$('#sheet .scrim').onclick = closeSheet;
$('#pl-toggle').onclick = () => {
  const pl = $('#player'), f = $('#pl-frame');
  if ($('#pl-toggle').dataset.url) { window.open($('#pl-toggle').dataset.url, '_blank', 'noopener'); return; }
  if (!pl.classList.contains('open')) { if (!f.src) f.src = f.dataset.src; pl.classList.add('open'); $('#pl-toggle').textContent = 'סגור'; }
  else { pl.classList.remove('open'); $('#pl-toggle').textContent = 'האזן לפרק'; }
};

let lastY = 0;
addEventListener('scroll', () => {
  const y = scrollY;
  $$('.topbar').forEach(t => t.classList.toggle('solid', y > 70));
  const pl = $('#player');
  if (pl.classList.contains('on') && !pl.classList.contains('open')) pl.classList.toggle('hide', y > lastY && y > 220);
  const h = document.documentElement.scrollHeight - innerHeight;
  $('#prog').style.width = (h > 40 ? Math.min(100, (y / h) * 100) : 0) + '%';
  lastY = y;
}, { passive: true });

// tab switching with arrows on desktop
addEventListener('keydown', e => {
  if (!$('#v-killer').classList.contains('on')) return;
  if ($('#sheet').classList.contains('on') || $('#lightbox').classList.contains('on')) return;
  if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
  const tabs = $$('#tabs .tab'); if (!tabs.length) return;
  const i = tabs.findIndex(t => t.classList.contains('on'));
  const dir = e.key === 'ArrowLeft' ? 1 : -1;   // RTL
  const n = tabs[(i + dir + tabs.length) % tabs.length];
  if (n) { n.click(); n.scrollIntoView({ block: 'nearest', inline: 'center' }); }
});

addEventListener('keydown', e => { if (e.key === 'Escape') {
    if ($('#lightbox').classList.contains('on')) { closeLightbox(); return; } if ($('#sheet').classList.contains('on')) closeSheet(); else if ($('#v-killer').classList.contains('on')) goHome(); } });

// deep link ?case=dillon
const qp = new URLSearchParams(location.search).get('case');
if (qp && DB[qp]) openKiller(qp, true);
observe(document);


/* ---------- signature ---------- */
console.log(
  '%c ארכיון הרצח %c Built by Dubel Team — dubelteam.com ',
  'background:#c1121f;color:#fff;font-weight:700;padding:4px 8px;border-radius:4px 0 0 4px',
  'background:#17140f;color:#ded5c8;padding:4px 8px;border-radius:0 4px 4px 0'
);
