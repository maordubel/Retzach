/* POST /api/track  — מונה צפיות. עובד עם Vercel KV אם מוגדר, אחרת no-op שקט. */
const KV = process.env.KV_REST_API_URL, KT = process.env.KV_REST_API_TOKEN;

async function kv(cmd) {
  if (!KV || !KT) return null;
  const r = await fetch(KV + '/pipeline', {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + KT, 'Content-Type': 'application/json' },
    body: JSON.stringify(cmd)
  });
  return r.ok ? r.json() : null;
}

const day = () => new Date().toISOString().slice(0, 10);

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).json({ ok: false });
  let body = req.body;
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch { body = {}; } }
  const path = String((body && body.p) || '/').slice(0, 120);
  const isNew = !!(body && body.n);
  const d = day();
  try {
    await kv([
      ['INCR', 'v:total'],
      ['INCR', `v:day:${d}`],
      ['ZINCRBY', 'v:paths', 1, path],
      ['ZINCRBY', `v:paths:${d}`, 1, path],
      ...(isNew ? [['INCR', 'v:visitors'], ['INCR', `v:visitors:${d}`]] : []),
      ['EXPIRE', `v:day:${d}`, 60 * 60 * 24 * 400],
      ['EXPIRE', `v:paths:${d}`, 60 * 60 * 24 * 400]
    ]);
  } catch (e) { /* לא מפילים את הדף בגלל אנליטיקס */ }
  res.status(204).end();
}
