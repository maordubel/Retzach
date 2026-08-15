#!/usr/bin/env node
/**
 * מוריד את כל התמונות החופשיות שמוגדרות ב-MEDIA (assets/data.js)
 * מוויקישיתוף אל img/commons/, וכותב manifest.json עם רישיון וייחוס.
 *
 *     node tools/fetch-media.mjs
 *
 * אחרי ההרצה האפליקציה מגישה את התמונות מהשרת שלנו במקום מוויקימדיה.
 * להרצה מחדש (למשל אחרי הוספת תיק) — פשוט הריצו שוב.
 */
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { createWriteStream } from 'node:fs';
import { pipeline } from 'node:stream/promises';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const OUT  = path.join(ROOT, 'img', 'commons');
const UA   = 'RetzachArchive/1.0 (https://retzach.dubelteam.com; built by Dubel Team)';

const chunk = (a, n) => a.reduce((o, x, i) => (i % n ? o[o.length - 1].push(x) : o.push([x]), o), []);
const api = async (host, params) => {
  const u = `https://${host}/w/api.php?` + new URLSearchParams({ format: 'json', ...params });
  const r = await fetch(u, { headers: { 'User-Agent': UA } });
  if (!r.ok) throw new Error(`${host} → ${r.status}`);
  return r.json();
};
const plain = h => String(h || '').replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim().slice(0, 90);

/* --- קריאת אובייקט MEDIA מתוך data.js בלי להריץ את כל הקובץ --- */
const src = await readFile(path.join(ROOT, 'assets', 'data.js'), 'utf8');
const body = src.slice(src.indexOf('const MEDIA = {') + 'const MEDIA ='.length);
let depth = 0, end = 0;
for (let i = 0; i < body.length; i++) {
  if (body[i] === '{') depth++;
  else if (body[i] === '}') { depth--; if (!depth) { end = i + 1; break; } }
}
const MEDIA = eval('(' + body.slice(0, end) + ')');
console.log(`נמצאו ${Object.keys(MEDIA).length} פריטי מדיה.`);

/* --- שלב 1: ערכי ויקיפדיה → שמות קבצים --- */
const artToFile = {};
const arts = [...new Set(Object.values(MEDIA).filter(m => m.wiki).map(m => m.wiki))];
for (const part of chunk(arts, 40)) {
  const r = await api('en.wikipedia.org', {
    action: 'query', prop: 'pageimages', piprop: 'name', pilicense: 'free',
    redirects: '1', titles: part.join('|')
  });
  const norm = {};
  (r.query?.normalized || []).forEach(n => norm[n.to] = n.from);
  (r.query?.redirects  || []).forEach(n => norm[n.to] = norm[n.from] || n.from);
  Object.values(r.query?.pages || {}).forEach(pg => {
    if (!pg.pageimage) return;
    artToFile[norm[pg.title] || pg.title] = 'File:' + pg.pageimage;
    artToFile[pg.title] = 'File:' + pg.pageimage;
  });
}

/* --- שלב 2: פרטי קובץ מוויקישיתוף --- */
const need = {};
for (const [k, m] of Object.entries(MEDIA)) {
  const f = m.commons || artToFile[m.wiki];
  if (f) (need[f] ??= []).push(k);
  else console.warn(`  ✗ ${k} — לא נמצאה תמונה חופשית`);
}

const info = {};
for (const part of chunk(Object.keys(need), 40)) {
  const r = await api('commons.wikimedia.org', {
    action: 'query', prop: 'imageinfo', iiprop: 'url|extmetadata|mime', iiurlwidth: '1400',
    iiextmetadatafilter: 'Artist|LicenseShortName|LicenseUrl|Credit', titles: part.join('|')
  });
  Object.values(r.query?.pages || {}).forEach(pg => {
    if (pg.missing !== undefined || !pg.imageinfo?.[0]) {
      console.warn(`  ✗ ${pg.title} — לא בוויקישיתוף (ייתכן רישיון לא חופשי). מדולג.`);
      return;
    }
    const ii = pg.imageinfo[0], md = ii.extmetadata || {};
    info[pg.title] = {
      url: ii.thumburl || ii.url,
      mime: ii.thumbmime || ii.mime,
      page: ii.descriptionurl,
      author: plain(md.Artist?.value || md.Credit?.value) || 'Wikimedia Commons',
      lic: plain(md.LicenseShortName?.value) || 'Free license'
    };
  });
}

/* --- הורדה + מניפסט --- */
await mkdir(OUT, { recursive: true });
const manifest = {};
let n = 0;
for (const [file, keys] of Object.entries(need)) {
  const rec = info[file];
  if (!rec) continue;
  const ext = (rec.mime || '').includes('png') ? 'png'
            : (rec.mime || '').includes('svg') ? 'svg'
            : (rec.mime || '').includes('webp') ? 'webp' : 'jpg';
  const name = `${keys[0]}.${ext}`;
  const res = await fetch(rec.url, { headers: { 'User-Agent': UA } });
  if (!res.ok) { console.warn(`  ✗ ${name} → ${res.status}`); continue; }
  await pipeline(res.body, createWriteStream(path.join(OUT, name)));
  const entry = { src: `/img/commons/${name}`, full: `/img/commons/${name}`,
                  page: rec.page, author: rec.author, lic: rec.lic, file };
  keys.forEach(k => manifest[k] = entry);
  n++;
  console.log(`  ✓ ${name.padEnd(26)} ${rec.lic} · ${rec.author}`);
}

await writeFile(path.join(OUT, 'manifest.json'), JSON.stringify(manifest, null, 2));
await writeFile(path.join(OUT, 'CREDITS.md'),
  '# קרדיטים לתמונות\n\nכל התמונות מוויקישיתוף, ברישיון חופשי או בנחלת הכלל.\n\n' +
  Object.values(manifest)
    .filter((v, i, a) => a.findIndex(x => x.file === v.file) === i)
    .map(v => `- [${v.file.replace(/^File:/, '')}](${v.page}) — ${v.author} · ${v.lic}`).join('\n') + '\n');

console.log(`\nהורדו ${n} תמונות אל img/commons/`);
console.log('נכתבו manifest.json ו-CREDITS.md. האפליקציה תשתמש בהן אוטומטית.');
