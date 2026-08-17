/* =====================================================================
   לוח בקרה · ארכיון הרצח
   נטען רק בדרישה. ציבורית האפליקציה לא יודעת שהוא קיים.
   כניסה:  ?admin  ·  Ctrl+Shift+A  ·  לחיצה שביעית על תג הגרסה
   ===================================================================== */
(function () {
  const $ = s => document.querySelector(s);
  const $$ = s => [...document.querySelectorAll(s)];
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;' }[c]));
  const SK = 'retzach.admin.tok';

  const ROLES = {
    owner:  { label: 'בעלים · Dubel Team',
      can: ['stats','cases','images','page','roles','export'],
      note: 'גישה מלאה: נתוני צפייה, ניהול תיקים, תמונות, עמוד עורכת והרשאות.' },
    editor: { label: 'עורכת · מאיה גזית',
      can: ['stats-lite','page','export'],
      note: 'גישה מוגבלת: סיכום צפיות בלבד, ועריכת העמוד האישי. אין גישה לתיקים, לתמונות או להרשאות.' }
  };

  const state = { role: null, tok: null, tab: 'stats', stats: null, custom: {}, page: null };

  /* ---------- אחסון מקומי ---------- */
  const lsGet = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } };
  const lsSet = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };

  /* ---------- API ---------- */
  async function api(path, tok) {
    const r = await fetch(path, { headers: { Authorization: 'Bearer ' + tok }, cache: 'no-store' });
    if (r.status === 401) throw new Error('unauthorized');
    if (!r.ok) throw new Error('http ' + r.status);
    return r.json();
  }

  /* ---------- מונה מקומי (גיבוי כשאין שרת) ---------- */
  function localStats() {
    const l = lsGet('retzach.hits', {});
    const total = Object.values(l).reduce((a, b) => a + b, 0);
    const top = Object.entries(l).sort((a, b) => b[1] - a[1]).slice(0, 25).map(([p, v]) => ({ p, v }));
    return { ok: true, configured: false, local: true, total, visitors: lsGet('retzach.vis', 0), top, series: [] };
  }

  /* ---------- מסך כניסה ---------- */
  function gate() {
    mount(`<div class="ad-gate">
      <div class="ad-lock">${icon('lock')}</div>
      <h2>לוח בקרה</h2>
      <p>אזור מוגן. הזינו מפתח גישה.<br><small style="color:var(--muted2)">טרם הגדרתם מפתח? כל ערך יכניס אתכם.</small></p>
      <input id="ad-key" type="password" placeholder="מפתח גישה" autocomplete="off" spellcheck="false">
      <button class="ad-btn primary" id="ad-go">כניסה</button>
      <div class="ad-err" id="ad-err"></div>
      <button class="ad-x2" id="ad-close2">ביטול</button>
    </div>`);
    const go = async () => {
      const k = $('#ad-key').value.trim();
      if (!k) return;
      $('#ad-err').textContent = 'בודק…';
      try {
        const d = await api('/api/stats', k);
        state.role = d.role || 'owner'; state.tok = k; state.stats = d;
        sessionStorage.setItem(SK, k);
        render();
      } catch (e) {
        if (String(e.message) === 'unauthorized') { $('#ad-err').textContent = 'מפתח שגוי.'; return; }
        // אין שרת (למשל בהרצה מקומית) — מצב אופליין לבעלים
        state.role = 'owner'; state.tok = k; state.stats = localStats();
        sessionStorage.setItem(SK, k);
        render();
      }
    };
    $('#ad-go').onclick = go;
    $('#ad-key').onkeydown = e => { if (e.key === 'Enter') go(); };
    $('#ad-close2').onclick = close;
    setTimeout(() => $('#ad-key').focus(), 60);
  }

  function icon(n) {
    const I = {
      lock:'<path d="M6 10V8a6 6 0 1 1 12 0v2"/><rect x="4" y="10" width="16" height="11" rx="2"/>',
      chart:'<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
      folder:'<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
      image:'<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="M4 18l5-5 4 4 3-3 4 4"/>',
      page:'<path d="M6 3h8l4 4v14H6z"/><path d="M14 3v4h4M9 12h7M9 16h5"/>',
      users:'<circle cx="9" cy="8" r="3.5"/><path d="M2 20c1-4 4-6 7-6s6 2 7 6"/><path d="M17 5.5a3.5 3.5 0 0 1 0 7M18 20c-.4-2.4-1.3-4.2-2.6-5.4"/>',
      x:'<path d="M6 6l12 12M18 6L6 18"/>', down:'<path d="M12 4v12M7 12l5 5 5-5M5 20h14"/>',
      trash:'<path d="M4 7h16M9 7V5h6v2M6 7l1 13h10l1-13"/>'
    };
    return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${I[n] || ''}</svg>`;
  }

  /* ---------- שלד ---------- */
  function mount(html) {
    let w = $('#admin');
    if (!w) { w = document.createElement('div'); w.id = 'admin'; document.body.appendChild(w); }
    w.innerHTML = html; w.classList.add('on');
    document.body.style.overflow = 'hidden';
  }
  function close() {
    const w = $('#admin'); if (w) { w.classList.remove('on'); w.innerHTML = ''; }
    document.body.style.overflow = '';
    if (location.search.includes('admin')) history.replaceState({}, '', location.pathname);
  }

  const TABS = [
    { k:'stats',  t:'סקירה',    i:'chart',  need:['stats','stats-lite'] },
    { k:'cases',  t:'תיקים',    i:'folder', need:['cases'] },
    { k:'images', t:'תמונות',   i:'image',  need:['images'] },
    { k:'page',   t:'עמוד עורכת', i:'page', need:['page'] },
    { k:'roles',  t:'הרשאות',   i:'users',  need:['roles'] }
  ];
  const can = c => (ROLES[state.role] || { can: [] }).can.includes(c);

  function render() {
    const tabs = TABS.filter(t => t.need.some(can));
    if (!tabs.find(t => t.k === state.tab)) state.tab = tabs[0] ? tabs[0].k : 'stats';
    mount(`
      <div class="ad-shell">
        <header class="ad-top">
          <div class="ad-brand"><b>לוח בקרה</b><span>ארכיון הרצח</span></div>
          <div class="ad-role">${esc((ROLES[state.role] || {}).label || '')}</div>
          <button class="ad-x" id="ad-close">${icon('x')}</button>
        </header>
        <nav class="ad-nav">${tabs.map(t =>
          `<button class="ad-tab ${state.tab === t.k ? 'on' : ''}" data-t="${t.k}">${icon(t.i)}<span>${t.t}</span></button>`).join('')}</nav>
        <main class="ad-body" id="ad-body"></main>
      </div>`);
    $('#ad-close').onclick = close;
    $$('.ad-tab').forEach(b => b.onclick = () => { state.tab = b.dataset.t; render(); });
    ({ stats: vStats, cases: vCases, images: vImages, page: vPage, roles: vRoles }[state.tab] || vStats)();
  }

  /* ---------- סקירה ---------- */
  function vStats() {
    const d = state.stats || localStats();
    const lite = state.role === 'editor';
    const series = d.series || [];
    const max = Math.max(1, ...series.map(x => x.views));
    const sum = k => series.reduce((a, x) => a + (x[k] || 0), 0);
    const label = p => {
      if (p === '/' || p === 'home') return 'עמוד הבית';
      const id = String(p).replace(/^case:/, '');
      return (window.DB && DB[id] && DB[id].name) ? 'תיק · ' + DB[id].name : p;
    };
    $('#ad-body').innerHTML = `
      ${d.setup ? `<div class="ad-warn" style="border-color:rgba(232,35,47,.4);background:rgba(193,18,31,.09);color:#f0c4c4">
        <b>הלוח אינו מוגן.</b> לא הוגדר <code>ADMIN_TOKEN</code>, ולכן כל מי שיודע איך לפתוח את הלוח נכנס אליו.
        הגדירו אותו ב-Vercel: <b>Settings → Environment Variables</b>, ואז Redeploy.</div>` : ''}
      ${!d.configured ? `<div class="ad-warn"><b>מקור נתונים לא מחובר.</b> המספרים למטה נספרים מקומית בדפדפן הזה בלבד.
        לנתונים אמיתיים מהשרת: ב-Vercel → <b>Storage</b> → צרו או חברו מסד <b>Redis</b> לפרויקט
        (משתני הסביבה נוספים אוטומטית), ואז <b>Redeploy</b>.
        ${d.storage && d.storage.hint ? `<br><span class="ad-mono">${esc(d.storage.hint)}</span>` : ''}</div>` : ''}
      ${d.storage ? `<div class="ad-conn ${d.storage.ok ? 'on' : 'off'}">
        <i></i><b>${d.storage.ok ? 'מסד הנתונים מחובר' : 'מסד הנתונים מנותק'}</b>
        ${d.storage.ok ? `<span class="ad-mono">${esc(d.storage.host || '')} · ${esc(d.storage.source || '')}${d.storage.auto ? ' · זוהה אוטומטית' : ''}</span>` : ''}
      </div>` : ''}
      <div class="ad-kpis">
        <div class="ad-kpi"><b>${(d.total || 0).toLocaleString('he-IL')}</b><span>צפיות בסך הכל</span></div>
        <div class="ad-kpi"><b>${(d.visitors || 0).toLocaleString('he-IL')}</b><span>מבקרים ייחודיים</span></div>
        <div class="ad-kpi"><b>${sum('views').toLocaleString('he-IL')}</b><span>צפיות ב-14 יום</span></div>
        <div class="ad-kpi"><b>${(series.at(-1) || {}).views || 0}</b><span>היום</span></div>
      </div>
      ${series.length ? `<div class="ad-card"><h4>14 הימים האחרונים</h4>
        <div class="ad-bars">${series.map(x => `<div class="ad-bar" title="${x.d}: ${x.views}">
          <i style="height:${Math.round((x.views / max) * 100)}%"></i><u>${x.d.slice(8)}</u></div>`).join('')}</div></div>` : ''}
      <div class="ad-card"><h4>העמודים הנצפים ביותר</h4>
        ${(d.top || []).length ? `<table class="ad-tbl"><tbody>${d.top.map(r =>
          `<tr><td>${esc(label(r.p))}</td><td class="n">${r.v.toLocaleString('he-IL')}</td></tr>`).join('')}</tbody></table>`
          : '<p class="ad-empty">אין נתונים עדיין.</p>'}</div>
      ${lite ? '<div class="ad-note">בתפקיד עורכת מוצג סיכום בלבד. נתונים גולמיים ופילוחים מלאים זמינים לבעלים.</div>' : ''}`;
  }

  /* ---------- תיקים ---------- */
  function vCases() {
    const eps = window.EPISODES || [];
    const ready = eps.filter(e => e.ready).length;
    $('#ad-body').innerHTML = `
      <div class="ad-kpis">
        <div class="ad-kpi"><b>${eps.length}</b><span>פרקים באינדקס</span></div>
        <div class="ad-kpi"><b>${ready}</b><span>תיקים סגורים</span></div>
        <div class="ad-kpi"><b>${eps.length - ready}</b><span>בקרוב</span></div>
        <div class="ad-kpi"><b>${Object.keys(window.DB || {}).length}</b><span>תיקים במאגר</span></div>
      </div>
      <div class="ad-card"><h4>מצב התיקים</h4>
      <table class="ad-tbl"><thead><tr><th>פרק</th><th>שם</th><th>מצב</th><th>עומק</th></tr></thead><tbody>
      ${eps.map(e => {
        const k = e.id && DB[e.id];
        return `<tr><td>ע${e.s} פ${e.e}${e.e2 ? '–' + e.e2 : ''}</td><td>${esc(e.name)}</td>
        <td>${e.ready ? '<span class="ad-pill ok">סגור</span>' : '<span class="ad-pill">בקרוב</span>'}</td>
        <td>${!k ? '—' : k.brief ? '<span class="ad-pill">מתועד</span>' : '<span class="ad-pill full">מורחב</span>'}</td></tr>`;
      }).join('')}</tbody></table></div>
      <div class="ad-note">עריכת תוכן נעשית ב-<code>assets/data.js</code> ו-<code>assets/cases.js</code>. הלוח הזה משקף מצב בלבד.</div>`;
  }

  /* ---------- תמונות (סטודיו) ---------- */
  const SLOTS = () => {
    const out = [];
    Object.keys(window.IMG || {}).forEach(k => out.push({ k, label: k }));
    return out;
  };
  function vImages() {
    state.custom = lsGet('retzach.custom', {});
    $('#ad-body').innerHTML = `
      <div class="ad-card"><h4>סטודיו תמונות</h4>
      <p class="ad-p">גררו קובץ לכל משבצת כדי לראות אותו מיד באתר (נשמר בדפדפן שלכם בלבד).
      בסיום — <b>ייצוא</b> יוריד קובץ <code>custom-images.js</code>. החליפו איתו את הקובץ ב-<code>assets/</code> ועשו commit.</p>
      <div class="ad-actions">
        <button class="ad-btn primary" id="ad-exp">${icon('down')} ייצוא לקובץ</button>
        <button class="ad-btn" id="ad-clr">${icon('trash')} ניקוי הכל</button>
      </div></div>
      <div class="ad-slots">${SLOTS().map(s => {
        const cur = state.custom[s.k];
        return `<label class="ad-slot ${cur ? 'has' : ''}" data-k="${s.k}">
          <input type="file" accept="image/*" hidden>
          <div class="ad-thumb">${cur ? `<img src="${cur}" alt="">` : `<span>גררו או לחצו</span>`}</div>
          <div class="ad-slot-t">${esc(s.label)}</div>
        </label>`; }).join('')}</div>`;
    $$('.ad-slot').forEach(el => {
      const inp = el.querySelector('input');
      inp.onchange = () => inp.files[0] && takeFile(el.dataset.k, inp.files[0]);
      el.ondragover = e => { e.preventDefault(); el.classList.add('drop'); };
      el.ondragleave = () => el.classList.remove('drop');
      el.ondrop = e => { e.preventDefault(); el.classList.remove('drop');
        const f = e.dataTransfer.files[0]; if (f) takeFile(el.dataset.k, f); };
    });
    $('#ad-exp').onclick = exportImages;
    $('#ad-clr').onclick = () => { if (confirm('לנקות את כל התמונות שהוספתם בדפדפן הזה?')) { lsSet('retzach.custom', {}); vImages(); } };
  }
  function takeFile(key, file) {
    const fr = new FileReader();
    fr.onload = () => {
      const im = new Image();
      im.onload = () => {
        const max = 1400, sc = Math.min(1, max / im.width);
        const c = document.createElement('canvas');
        c.width = Math.round(im.width * sc); c.height = Math.round(im.height * sc);
        c.getContext('2d').drawImage(im, 0, 0, c.width, c.height);
        const data = c.toDataURL('image/jpeg', 0.82);
        const cur = lsGet('retzach.custom', {}); cur[key] = data; lsSet('retzach.custom', cur);
        vImages();
      };
      im.src = fr.result;
    };
    fr.readAsDataURL(file);
  }
  function exportImages() {
    const cur = lsGet('retzach.custom', {});
    if (!Object.keys(cur).length) return alert('אין תמונות לייצוא.');
    const body = '/* נוצר בלוח הבקרה של ארכיון הרצח */\nwindow.CUSTOM_IMAGES = ' +
      JSON.stringify(cur, null, 1) + ';\n';
    dl('custom-images.js', body, 'application/javascript');
  }
  function dl(name, body, type) {
    const b = new Blob([body], { type: type + ';charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(b); a.download = name; a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  }

  /* ---------- עמוד עורכת ---------- */
  const PAGE_DEF = { title: 'מאיה גזית', sub: 'מאחורי הפרקים', blocks: [] };
  function vPage() {
    state.page = lsGet('retzach.page', (window.EDITOR_PAGE || PAGE_DEF));
    const p = state.page;
    $('#ad-body').innerHTML = `
      <div class="ad-card"><h4>העמוד האישי</h4>
      <p class="ad-p">הכנה לעמוד שמאיה תוכל לנהל בעצמה. כותבים כאן, רואים תצוגה מקדימה, ובסיום מייצאים קובץ אחד לפרסום.</p>
      <label class="ad-f"><span>כותרת</span><input id="pg-t" value="${esc(p.title)}"></label>
      <label class="ad-f"><span>כותרת משנה</span><input id="pg-s" value="${esc(p.sub)}"></label>
      <div id="pg-blocks"></div>
      <div class="ad-actions">
        <button class="ad-btn" id="pg-add">הוספת קטע</button>
        <button class="ad-btn primary" id="pg-exp">${icon('down')} ייצוא לפרסום</button>
      </div>
      <div class="ad-note">העמוד אינו מפורסם עד שהקובץ המיוצא נכנס לריפו. עד אז הכל נשמר בדפדפן הזה בלבד.</div>
      </div>`;
    const draw = () => {
      $('#pg-blocks').innerHTML = p.blocks.map((b, i) => `
        <div class="ad-block">
          <label class="ad-f"><span>כותרת קטע ${i + 1}</span><input data-i="${i}" data-f="h" value="${esc(b.h || '')}"></label>
          <label class="ad-f"><span>תוכן</span><textarea data-i="${i}" data-f="t" rows="4">${esc(b.t || '')}</textarea></label>
          <button class="ad-btn sm" data-del="${i}">${icon('trash')} מחיקה</button>
        </div>`).join('');
      $$('#pg-blocks [data-f]').forEach(el => el.oninput = () => { p.blocks[+el.dataset.i][el.dataset.f] = el.value; lsSet('retzach.page', p); });
      $$('#pg-blocks [data-del]').forEach(el => el.onclick = () => { p.blocks.splice(+el.dataset.del, 1); lsSet('retzach.page', p); draw(); });
    };
    draw();
    $('#pg-t').oninput = e => { p.title = e.target.value; lsSet('retzach.page', p); };
    $('#pg-s').oninput = e => { p.sub = e.target.value; lsSet('retzach.page', p); };
    $('#pg-add').onclick = () => { p.blocks.push({ h: '', t: '' }); lsSet('retzach.page', p); draw(); };
    $('#pg-exp').onclick = () => dl('editor-page.js',
      '/* עמוד העורכת — נוצר בלוח הבקרה */\nwindow.EDITOR_PAGE = ' + JSON.stringify(p, null, 1) + ';\n',
      'application/javascript');
  }

  /* ---------- הרשאות ---------- */
  function vRoles() {
    const rows = [
      ['נתוני צפייה מלאים', 1, 0], ['סיכום צפיות', 1, 1], ['ניהול תיקים', 1, 0],
      ['סטודיו תמונות', 1, 0], ['עריכת העמוד האישי', 1, 1], ['ניהול הרשאות', 1, 0]
    ];
    $('#ad-body').innerHTML = `
      <div class="ad-card"><h4>תפקידים</h4>
      ${Object.entries(ROLES).map(([k, r]) => `<div class="ad-role-row"><b>${esc(r.label)}</b><span>${esc(r.note)}</span></div>`).join('')}
      </div>
      <div class="ad-card"><h4>מטריצת הרשאות</h4>
      <table class="ad-tbl"><thead><tr><th>יכולת</th><th>בעלים</th><th>עורכת</th></tr></thead><tbody>
      ${rows.map(r => `<tr><td>${r[0]}</td><td class="c">${r[1] ? '✓' : '—'}</td><td class="c">${r[2] ? '✓' : '—'}</td></tr>`).join('')}
      </tbody></table></div>
      <div class="ad-card"><h4>הגדרת מפתחות</h4>
      <p class="ad-p">המפתחות נשמרים כמשתני סביבה ב-Vercel, לא בקוד:</p>
      <table class="ad-tbl"><tbody>
        <tr><td><code>ADMIN_TOKEN</code></td><td>מפתח הבעלים</td></tr>
        <tr><td><code>EDITOR_TOKEN</code></td><td>מפתח העורכת — גישה מוגבלת</td></tr>
        <tr><td><code>KV_REST_API_URL</code></td><td>חיבור לאחסון הנתונים</td></tr>
        <tr><td><code>KV_REST_API_TOKEN</code></td><td>אסימון האחסון</td></tr>
      </tbody></table>
      <div class="ad-note">שינוי מפתח מנתק מיד את כל מי שהחזיק בו.</div></div>`;
  }

  /* ---------- פתיחה ---------- */
  window.openAdmin = function () {
    const t = sessionStorage.getItem(SK);
    if (!t) return gate();
    api('/api/stats', t).then(d => { state.role = d.role || 'owner'; state.tok = t; state.stats = d; render(); })
      .catch(e => { if (String(e.message) === 'unauthorized') { sessionStorage.removeItem(SK); gate(); }
                    else { state.role = 'owner'; state.tok = t; state.stats = localStats(); render(); } });
  };
  window.openAdmin.ready = true;
  if (window.__adminWanted) window.openAdmin();
})();
