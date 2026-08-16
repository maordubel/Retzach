/* GET /api/stats  — נתוני צפייה. דורש Authorization: Bearer <ADMIN_TOKEN|EDITOR_TOKEN>. */
const KV = process.env.KV_REST_API_URL, KT = process.env.KV_REST_API_TOKEN;
const ADMIN  = process.env.ADMIN_TOKEN  || '';
const EDITOR = process.env.EDITOR_TOKEN || '';

async function kv(cmd) {
  if (!KV || !KT) return null;
  const r = await fetch(KV + '/pipeline', {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + KT, 'Content-Type': 'application/json' },
    body: JSON.stringify(cmd)
  });
  return r.ok ? r.json() : null;
}
const dayKey = o => new Date(Date.now() - o * 864e5).toISOString().slice(0, 10);

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  const auth = (req.headers.authorization || '').replace(/^Bearer\s+/i, '');
  let role = null;
  if (ADMIN && auth === ADMIN) role = 'owner';
  else if (EDITOR && auth === EDITOR) role = 'editor';
  if (!role) return res.status(401).json({ ok: false, error: 'unauthorized' });

  if (!KV || !KT) {
    return res.status(200).json({ ok: true, role, configured: false,
      note: 'Vercel KV לא מוגדר. הוסיפו KV_REST_API_URL ו-KV_REST_API_TOKEN במשתני הסביבה.' });
  }

  const days = Array.from({ length: 14 }, (_, i) => dayKey(13 - i));
  const cmds = [['GET', 'v:total'], ['GET', 'v:visitors'],
                ['ZREVRANGE', 'v:paths', 0, 24, 'WITHSCORES'],
                ...days.flatMap(d => [['GET', `v:day:${d}`], ['GET', `v:visitors:${d}`]])];
  const out = await kv(cmds);
  if (!out) return res.status(200).json({ ok: true, role, configured: false });

  const val = i => (out[i] && out[i].result) || 0;
  const flat = val(2) || [];
  const top = [];
  for (let i = 0; i < flat.length; i += 2) top.push({ p: flat[i], v: +flat[i + 1] });

  const series = days.map((d, i) => ({
    d, views: +val(3 + i * 2) || 0, visitors: +val(4 + i * 2) || 0
  }));

  res.status(200).json({ ok: true, role, configured: true,
    total: +val(0) || 0, visitors: +val(1) || 0, top, series });
}
