/* =====================================================================
   ארכיון הרצח · שכבת אחסון
   מזהה לבד את מסד ה-Redis שחובר לפרויקט ב-Vercel, בלי קשר לשם שנתתם לו
   ולשם שהאינטגרציה בחרה למשתני הסביבה.

   נתמכים (לפי סדר עדיפות):
     KV_REST_API_URL      / KV_REST_API_TOKEN          (Vercel KV הישן, וגם Upstash)
     UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN (Upstash דרך ה-Marketplace)
     REDIS_REST_URL       / REDIS_REST_TOKEN
     STORAGE_REST_API_URL / STORAGE_REST_API_TOKEN
   ואם אף אחד מהם לא קיים — סריקה אוטומטית של כל משתני הסביבה אחרי זוג
   URL+TOKEN שנראה כמו נקודת קצה של Redis-over-HTTP (למשל כשה-Marketplace
   הוסיף קידומת בשם המסד: REDIS_BOLE_BALL_KV_REST_API_URL).
   ===================================================================== */

const PAIRS = [
  ['KV_REST_API_URL', 'KV_REST_API_TOKEN'],
  ['UPSTASH_REDIS_REST_URL', 'UPSTASH_REDIS_REST_TOKEN'],
  ['REDIS_REST_URL', 'REDIS_REST_TOKEN'],
  ['STORAGE_REST_API_URL', 'STORAGE_REST_API_TOKEN'],
  ['STORAGE_KV_REST_API_URL', 'STORAGE_KV_REST_API_TOKEN']
];

const isUrl = v => typeof v === 'string' && /^https:\/\/[^\s]+$/i.test(v.trim());
const isTok = v => typeof v === 'string' && v.trim().length >= 16 && !/\s/.test(v.trim());

/* מוצא זוג URL+TOKEN. מחזיר גם מאיפה הוא בא, בשביל האבחון בלוח הבקרה. */
function resolve() {
  const E = process.env || {};

  for (const [u, t] of PAIRS) {
    if (isUrl(E[u]) && isTok(E[t])) {
      return { url: E[u].trim().replace(/\/+$/, ''), token: E[t].trim(), source: u, auto: false };
    }
  }

  /* סריקה: כל מפתח שנגמר ב-REST_API_URL / REST_URL עם ערך https */
  const urlKeys = Object.keys(E).filter(k => /(REST_API_URL|REST_URL)$/.test(k) && isUrl(E[k]));
  for (const uk of urlKeys) {
    const cands = [
      uk.replace(/REST_API_URL$/, 'REST_API_TOKEN'),
      uk.replace(/REST_URL$/, 'REST_TOKEN'),
      uk.replace(/REST_API_URL$/, 'REST_API_READ_ONLY_TOKEN')
    ];
    /* ואם גם זה לא — כל טוקן שחולק את אותה קידומת */
    const prefix = uk.replace(/(REST_API_URL|REST_URL)$/, '');
    for (const k of Object.keys(E)) {
      if (k.startsWith(prefix) && /TOKEN$/.test(k)) cands.push(k);
    }
    for (const tk of cands) {
      if (isTok(E[tk])) {
        return { url: E[uk].trim().replace(/\/+$/, ''), token: E[tk].trim(), source: uk, auto: true };
      }
    }
  }

  return null;
}

let _conn;
export function conn() {
  if (_conn === undefined) _conn = resolve();
  return _conn;
}

/* אבחון בטוח להצגה בלוח הבקרה — בלי לחשוף את הטוקן */
export function diag() {
  const c = conn();
  if (!c) {
    const found = Object.keys(process.env || {}).filter(k => /(KV_|UPSTASH_|REDIS_|STORAGE_)/.test(k));
    return {
      ok: false,
      source: null,
      hint: found.length
        ? 'נמצאו משתני סביבה קרובים אבל לא זוג שלם של כתובת+טוקן: ' + found.slice(0, 12).join(', ')
        : 'לא נמצאו משתני סביבה של Redis. חברו את המסד לפרויקט ואז Redeploy.'
    };
  }
  let host = '';
  try { host = new URL(c.url).host; } catch { host = c.url.slice(0, 40); }
  return { ok: true, source: c.source, auto: c.auto, host, driver: 'redis-rest' };
}

/* הרצת פקודות. מקבל מערך של מערכי פקודה, מחזיר מערך תוצאות או null. */
export async function pipeline(cmds) {
  const c = conn();
  if (!c || !cmds || !cmds.length) return null;
  try {
    const r = await fetch(c.url + '/pipeline', {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + c.token, 'Content-Type': 'application/json' },
      body: JSON.stringify(cmds)
    });
    if (!r.ok) return null;
    const j = await r.json();
    return Array.isArray(j) ? j : null;
  } catch {
    return null;
  }
}

/* בדיקת חיים אמיתית — PING */
export async function ping() {
  const out = await pipeline([['PING']]);
  return !!(out && out[0] && (out[0].result === 'PONG' || out[0].result === 'pong'));
}
