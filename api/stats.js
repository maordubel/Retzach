/* GET /api/stats — נתוני צפייה. דורש Authorization: Bearer <ADMIN_TOKEN|EDITOR_TOKEN>.
   האחסון נפתר אוטומטית מכל מסד Redis שחובר לפרויקט (ראו api/_redis.js). */
import { pipeline, diag, ping } from './_redis.js';

const ADMIN  = process.env.ADMIN_TOKEN  || '';
const EDITOR = process.env.EDITOR_TOKEN || '';

const dayKey = o => new Date(Date.now() - o * 864e5).toISOString().slice(0, 10);

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  const auth = (req.headers.authorization || '').replace(/^Bearer\s+/i, '');

  /* עדיין לא הוגדרו מפתחות — אין מה להגן עליו, ואין טעם לנעול בחוץ */
  if (!ADMIN && !EDITOR) {
    const st = diag();
    return res.status(200).json({
      ok: true, role: 'owner', configured: false, setup: true, storage: st,
      note: 'לא הוגדר ADMIN_TOKEN. הוסיפו אותו במשתני הסביבה ב-Vercel כדי להגן על הלוח.'
    });
  }

  let role = null;
  if (ADMIN && auth === ADMIN) role = 'owner';
  else if (EDITOR && auth === EDITOR) role = 'editor';
  if (!role) return res.status(401).json({ ok: false, error: 'unauthorized' });

  const st = diag();
  if (!st.ok) {
    return res.status(200).json({ ok: true, role, configured: false, storage: st,
      note: 'לא נמצא מסד Redis מחובר. חברו את המסד לפרויקט ב-Vercel ואז Redeploy.' });
  }

  const days = Array.from({ length: 14 }, (_, i) => dayKey(13 - i));
  const cmds = [['GET', 'v:total'], ['GET', 'v:visitors'],
                ['ZREVRANGE', 'v:paths', 0, 24, 'WITHSCORES'],
                ...days.flatMap(d => [['GET', `v:day:${d}`], ['GET', `v:visitors:${d}`]])];
  const out = await pipeline(cmds);

  if (!out) {
    const alive = await ping();
    return res.status(200).json({ ok: true, role, configured: false,
      storage: { ...st, ok: false, hint: alive
        ? 'המסד עונה אבל שאילתת הנתונים נכשלה.'
        : 'המסד לא עונה. בדקו שהוא מחובר לפרויקט ושבוצע Redeploy אחרי החיבור.' },
      note: 'החיבור לא הצליח.' });
  }

  const val = i => (out[i] && out[i].result) || 0;
  const flat = val(2) || [];
  const top = [];
  for (let i = 0; i < flat.length; i += 2) top.push({ p: flat[i], v: +flat[i + 1] });

  const series = days.map((d, i) => ({
    d, views: +val(3 + i * 2) || 0, visitors: +val(4 + i * 2) || 0
  }));

  res.status(200).json({ ok: true, role, configured: true, storage: st,
    total: +val(0) || 0, visitors: +val(1) || 0, top, series });
}
