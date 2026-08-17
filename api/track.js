/* POST /api/track — מונה צפיות.
   עובד מול כל מסד Redis שחובר לפרויקט ב-Vercel (ראו api/_redis.js).
   אם אין מסד — no-op שקט, האתר ממשיך לעבוד רגיל. */
import { pipeline } from './_redis.js';

const day = () => new Date().toISOString().slice(0, 10);
const TTL = 60 * 60 * 24 * 400;

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).json({ ok: false });

  let body = req.body;
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch { body = {}; } }
  const path = String((body && body.p) || '/').slice(0, 120);
  const isNew = !!(body && body.n);
  const d = day();

  try {
    await pipeline([
      ['INCR', 'v:total'],
      ['INCR', `v:day:${d}`],
      ['ZINCRBY', 'v:paths', 1, path],
      ['ZINCRBY', `v:paths:${d}`, 1, path],
      ...(isNew ? [['INCR', 'v:visitors'], ['INCR', `v:visitors:${d}`]] : []),
      ['EXPIRE', `v:day:${d}`, TTL],
      ['EXPIRE', `v:paths:${d}`, TTL],
      ...(isNew ? [['EXPIRE', `v:visitors:${d}`, TTL]] : [])
    ]);
  } catch (e) { /* לא מפילים את הדף בגלל אנליטיקס */ }

  res.status(204).end();
}
