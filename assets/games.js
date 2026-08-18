/* =====================================================================
   ארכיון הרצח · חדר המשחקים
   ---------------------------------------------------------------------
   שלושה משחקים, מנוע אחד:
     killer  — "איזה רוצח סדרתי אתה?"
     victim  — "על ידי מי היית נרצח?"
     solve   — "החקירה" — לפתור תיק מתוך ראיות

   הכל נגזר אוטומטית מ-window.DB. אין כאן טבלה ידנית של תיקים.
   תיק חדש שנכנס למאגר — נכנס לשלושת המשחקים באותו רגע.
   ===================================================================== */
(function () {
  'use strict';
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;' }[c]));
  const strip = s => String(s == null ? '' : s).replace(/<[^>]+>/g, '');
  const pick = a => a[Math.floor(Math.random() * a.length)];
  const shuffle = a => a.map(v => [Math.random(), v]).sort((x, y) => x[0] - y[0]).map(v => v[1]);

  /* ===================================================================
     1 · הפרופיילר — קורא כל תיק והופך אותו לאוסף תגיות
     =================================================================== */
  const RULES = [
    ['ירי',        /\bיר[הו]\b|ירי\b|אקדח|רובה|נור[הו]|כדור|סניפר|קליע/],
    ['חניקה',      /חניק|נחנק|חנק|לולאת חבל|בגרבי|בחבל/],
    ['סכין',       /סכין|דקיר|נדקר|נדקרה|להב/],
    ['אש',         /הצת|שריפ|נשרף|בער/],
    ['רעל',        /רעל|הרעל|מנת יתר/],
    ['ערכת רצח',   /ערכת|מכולה|לוח דיקט|אזיקים|צינור גומי|כפפות לטקס|יריעת פלסטיק|שקיות אשפה/],
    ['מחסן',       /סככה|מכולה|מחסן|מרתף|בית נטוש|חווה|בונקר/],
    ['רכב',        /טנדר|רכב|מכונית|ואן|משאית|נסע|הסיע/],
    ['קסם',        /מקסים|נאה|חתיך|מחייך|אדיב|רהוט|קסמ|כריזמ/],
    ['הבטחה',      /הבטיח|הציע עבודה|דוגמנ|צילום|אודישן|ריאיון|מסיבה|טרמפ/],
    ['תחפושת',     /תחפוש|פאה|התחזה|שם בדוי|זהות בדויה|מדים/],
    ['כוח',        /איים|באיומי|בכוח|פרץ|חטף|חטיפ|כפת/],
    ['מדים',       /שוטר|קצין|צבא|חייל|קולונל|משמר|טייס|צי /],
    ['מקצוע מכובד',/רופא|אח |אחות|מהנדס|מתווך|עורך דין|מורה|כומר|אסטרונאוט|מדען|טכנאי|חשמלאי|צלם/],
    ['עסק משלו',   /בעל חנות|בעל חווה|מפעל|יצרן|עסק|חברה שלו|מסעדה/],
    ['שכן',        /שכונ|שכן|באותו רחוב|מוכר בשכונה|ילדי השכונה/],
    ['עיר',        /שיקגו|גלזגו|ניו יורק|לוס אנג|יוסטון|ונקובר|קליבלנד|מילווקי|לונדון|רייקיאוויק/],
    ['טבע',        /יער|מדבר|שדה|אגם|חווה|טרייל|הרים|לבה|ביצה/],
    ['כביש',       /כביש|טרמפ|תחנת דלק|מסוע|highway|נהג משאית|כביש מהיר/],
    ['בית',        /בבית|בדירה|בחדר|במרתף|חדר השינה|הבית שלו/],
    ['מים',        /נהר|חוף|ים|סירה|נמל|מזח|תעל/],
    ['לילה',       /לפנות בוקר|בלילה|חצות|אחרי חצות|שעות הלילה/],
    ['נתפס בזכות ניצולה', /ניצול|שרד|נמלט|ברח.*והזעיק|הגיעה לטלפון|נאבק/],
    ['הודה',       /הודה|הודאה|התוודה/],
    ['לא נפתר',    /לא נפתר|לא זוהה מעולם|לא הוכח|טרם זוהה|נעדר עד היום|פתוח רשמית/],
    ['DNA',        /DNA|די־אן־איי|דגימת|פורנז/],
    ['מודיעין שנזרק', /לא טופל|נגנז|תויק|מתיחה|התעלמ|לא נפתחה חקירה|בורחים מהבית|סווג/],
    ['שקרן',       /בדי|שקר|המציא|התחזה|סיפור כיסוי|לא היה שם/],
    ['ראוותן',     /התרברב|אגדה|מכתב לעיתון|התקשר למשטרה|רצה תשומת לב|פרסום/],
    ['אספן',       /תצלומים|מזכרות|טרופ|שמר את|אסף|יומן|רשימה/],
    ['זוג',        /זוג|יחד עם|שותף|שותפה|בת זוגו|אשתו|שני נערים|אחריות משותפת/]
  ];

  function victimShape(k) {
    const V = (k.victims || []).filter(v => {
      const b = [v.act || '', (v.tags || []).join(' ')].join(' ');
      return !/שרד|ניצול|זוכ|נוקה|נשלל|שוחרר|חשוד|הופרך/.test(b);
    });
    const ages = V.map(v => v.age).filter(Boolean);
    const f = V.filter(v => v.f).length;
    return { n: V.length, women: V.length ? f / V.length : 0, men: V.length ? (V.length - f) / V.length : 0,
      minAge: ages.length ? Math.min(...ages) : null, maxAge: ages.length ? Math.max(...ages) : null,
      avgAge: ages.length ? Math.round(ages.reduce((a, b) => a + b, 0) / ages.length) : null, list: V };
  }

  function profile(k) {
    const txt = [k.line, k.alias || '',
      ...(k.facts || []).map(f => f[0] + ' ' + f[1]),
      ...(k.story || []).map(s => s.h + ' ' + s.t),
      ...(k.evidence || []).map(e => e.t + ' ' + e.p + ' ' + e.b),
      ...(k.victims || []).map(v => v.d + ' ' + (v.tags || []).join(' ')),
      ...(k.timeline || []).map(t => t.t + ' ' + t.d)].join(' ').replace(/<[^>]+>/g, ' ');
    const tags = new Set();
    RULES.forEach(([tag, re]) => { if (re.test(txt)) tags.add(tag); });
    const vs = victimShape(k);
    const total = (k.stats || []).reduce((mx, s) => /קורבנ|רציח|הרוגים|מיוחסים/.test(s.l) ? Math.max(mx, s.n) : mx, vs.n);
    if (total >= 10) tags.add('רבים'); else if (total <= 3) tags.add('מעטים'); else tags.add('אמצע');
    if (vs.women >= 0.75) tags.add('קורבנות נשים');
    if (vs.men >= 0.75) tags.add('קורבנות גברים');
    if (vs.maxAge !== null && vs.maxAge <= 18) tags.add('קורבנות צעירים מאוד');
    else if (vs.avgAge !== null && vs.avgAge <= 25) tags.add('קורבנות צעירים');
    else if (vs.avgAge !== null && vs.avgAge >= 35) tags.add('קורבנות מבוגרים');
    const years = (k.timeline || []).map(t => parseInt(String(t.y).match(/\d{4}/) || 0)).filter(Boolean);
    const y0 = years.length ? Math.min(...years) : 1970, y1 = years.length ? Math.max(...years) : y0;
    if (y0 < 1960) tags.add('רטרו'); else if (y0 < 1990) tags.add('אנלוגי'); else tags.add('מודרני');
    if (y1 - y0 >= 12) tags.add('שנים ארוכות'); else if (y1 - y0 <= 3) tags.add('התפרצות קצרה');
    const place = (k.caseLabel || '').replace(/^CASE FILE · /, '').replace(/\s*[\d–\-]{4,}.*$/, '').trim();
    return { id: k.id, k, tags, place, vs, total, y0, y1 };
  }

  let PROFILES = null;
  function profiles() {
    if (PROFILES) return PROFILES;
    const db = window.DB || {};
    PROFILES = Object.keys(db).map(id => profile(db[id]))
      .filter(p => (window.vCount ? window.vCount(p.k).v : p.vs.n) > 0);
    return PROFILES;
  }

  /* ===================================================================
     2 · שאלוני האישיות
     =================================================================== */
  const Q_KILLER = [
    { q: 'מישהו נכנס לחדר. מה הדבר הראשון שאתה עושה?', s: 'שאלה 01', a: [
      { t: 'מחייך. חיוך פותח דלתות.', e: '😀', w: { 'קסם': 3, 'הבטחה': 2, 'תחפושת': 1 } },
      { t: 'סורק אותו מהר. מי הוא, מה יש לו.', e: '👁️', w: { 'ערכת רצח': 3, 'אספן': 2, 'שנים ארוכות': 1 } },
      { t: 'לא מרים את הראש.', e: '🫥', w: { 'שכן': 2, 'בית': 2, 'לא נפתר': 1 } },
      { t: 'מספר לו סיפור על עצמי. רובו לא נכון.', e: '🎭', w: { 'שקרן': 4, 'ראוותן': 2, 'תחפושת': 2 } } ] },
    { q: 'איפה אתה מרגיש הכי בבית?', s: 'שאלה 02', a: [
      { t: 'בעיר. רעש, אנשים, אנונימיות.', e: '🌃', w: { 'עיר': 4, 'לילה': 2 } },
      { t: 'ביער. אין שם אף אחד.', e: '🌲', w: { 'טבע': 4, 'ערכת רצח': 1 } },
      { t: 'בכביש. תמיד בתנועה.', e: '🛣️', w: { 'כביש': 4, 'רכב': 3 } },
      { t: 'בבית שלי. עם הדלת סגורה.', e: '🚪', w: { 'בית': 4, 'מחסן': 2 } } ] },
    { q: 'יש לך מוסך. מה בפנים?', s: 'שאלה 03', a: [
      { t: 'כלים מסודרים לפי גודל.', e: '🔧', w: { 'ערכת רצח': 4, 'מקצוע מכובד': 2 } },
      { t: 'בלגן מוחלט. אני יודע איפה הכל.', e: '📦', w: { 'מחסן': 3, 'אמצע': 1 } },
      { t: 'מצלמה, תאורה, רקע.', e: '📷', w: { 'אספן': 4, 'הבטחה': 3 } },
      { t: 'רכב. תמיד עם דלק מלא.', e: '🚐', w: { 'רכב': 4, 'כביש': 2 } } ] },
    { q: 'איך אתה משכנע מישהו לבוא איתך?', s: 'שאלה 04', a: [
      { t: 'מציע לו משהו שהוא רוצה.', e: '🎁', w: { 'הבטחה': 4, 'קסם': 2 } },
      { t: 'לובש משהו שנותן לי סמכות.', e: '🎖️', w: { 'מדים': 4, 'תחפושת': 3 } },
      { t: 'הוא כבר מכיר אותי. אני מהשכונה.', e: '🏘️', w: { 'שכן': 4, 'קורבנות צעירים מאוד': 2 } },
      { t: 'לא משכנע. פשוט לוקח.', e: '✊', w: { 'כוח': 4, 'התפרצות קצרה': 1 } } ] },
    { q: 'תעודת הזהות שלך אומרת שאתה…', s: 'שאלה 05', a: [
      { t: 'איש מקצוע. יש לי תואר.', e: '🎓', w: { 'מקצוע מכובד': 4 } },
      { t: 'בעל עסק. עובד קשה.', e: '💼', w: { 'עסק משלו': 4, 'שכן': 1 } },
      { t: 'משרת את הציבור.', e: '👮', w: { 'מדים': 4 } },
      { t: 'זה מסובך. תלוי את מי שואלים.', e: '🌀', w: { 'שקרן': 4, 'תחפושת': 2 } } ] },
    { q: 'שעה אהובה ביממה?', s: 'שאלה 06', a: [
      { t: 'שלוש לפנות בוקר.', e: '🌙', w: { 'לילה': 4, 'עיר': 1 } },
      { t: 'שעת בין ערביים.', e: '🌅', w: { 'כביש': 2, 'טבע': 2 } },
      { t: 'אמצע היום. אף אחד לא חושד באמצע היום.', e: '☀️', w: { 'קסם': 2, 'מקצוע מכובד': 2, 'שכן': 2 } },
      { t: 'לא מבחין. אני לא ישן טוב.', e: '👁️‍🗨️', w: { 'התפרצות קצרה': 2, 'כוח': 2 } } ] },
    { q: 'מישהו מצלם אותך. התגובה?', s: 'שאלה 07', a: [
      { t: 'מסתובב. אין תמונות.', e: '🚫', w: { 'לא נפתר': 4 } },
      { t: 'מחייך למצלמה. בגדול.', e: '📸', w: { 'ראוותן': 4, 'קסם': 2 } },
      { t: 'מבקש עותק.', e: '🖼️', w: { 'אספן': 4 } },
      { t: 'לא אכפת לי. אני לא נראה מסוכן.', e: '🙂', w: { 'קסם': 3, 'שכן': 2, 'מקצוע מכובד': 1 } } ] },
    { q: 'עובדים לבד או עם שותף?', s: 'שאלה 08', a: [
      { t: 'לבד. תמיד.', e: '🚶', w: { 'זוג': -4, 'לא נפתר': 1 } },
      { t: 'יש מישהו שיודע.', e: '🤝', w: { 'זוג': 4 } },
      { t: 'משלם למישהו שיביא.', e: '💵', w: { 'זוג': 3, 'קורבנות צעירים מאוד': 2 } },
      { t: 'בן/בת הזוג שלי בפנים.', e: '💍', w: { 'זוג': 5 } } ] },
    { q: 'איך זה נגמר, לדעתך?', s: 'שאלה 09', a: [
      { t: 'מישהי תשרוד ותתקשר.', e: '📞', w: { 'נתפס בזכות ניצולה': 5 } },
      { t: 'אני אספר בעצמי. בסוף.', e: '🗣️', w: { 'הודה': 4, 'ראוותן': 2 } },
      { t: 'מדע יתפוס אותי. לא בן אדם.', e: '🧬', w: { 'DNA': 4, 'שנים ארוכות': 2 } },
      { t: 'זה לא ייגמר. אף אחד לא יידע.', e: '🕳️', w: { 'לא נפתר': 5 } } ] },
    { q: 'כמה זמן זה יימשך?', s: 'שאלה 10', a: [
      { t: 'עשורים. יש לי סבלנות.', e: '⏳', w: { 'שנים ארוכות': 4, 'רבים': 2 } },
      { t: 'קיץ אחד. ואז נגמר.', e: '🔥', w: { 'התפרצות קצרה': 4, 'מעטים': 2 } },
      { t: 'עד שמישהו ישים לב. יכול לקחת זמן.', e: '🐌', w: { 'מודיעין שנזרק': 4, 'שנים ארוכות': 1 } },
      { t: 'פעם אחת. זה מספיק.', e: '1️⃣', w: { 'מעטים': 4 } } ] },
    { q: 'באיזו תקופה היית רוצה לחיות?', s: 'שאלה 11', a: [
      { t: 'שנות ה־50. חליפות וסיגריות.', e: '🎩', w: { 'רטרו': 5 } },
      { t: 'שנות ה־70. אין מצלמות ברחוב.', e: '📻', w: { 'אנלוגי': 5 } },
      { t: 'היום. אני יודע לעקוף מערכות.', e: '📱', w: { 'מודרני': 5 } },
      { t: 'לא משנה. אנשים תמיד אותו דבר.', e: '♾️', w: {} } ] },
    { q: 'משפט אחרון לפרוטוקול?', s: 'שאלה 12', a: [
      { t: '"לא עשיתי כלום."', e: '🤐', w: { 'לא נפתר': 3, 'שקרן': 2 } },
      { t: '"אתם עושים ממני יותר ממה שאני."', e: '🙃', w: { 'הודה': 2, 'ראוותן': 3 } },
      { t: '"תפסו אותי לפני שאעשה עוד."', e: '💄', w: { 'הודה': 3, 'ראוותן': 2 } },
      { t: '"היה כיף."', e: '😐', w: { 'ראוותן': 4, 'קסם': 1 } } ] }
  ];

  const Q_VICTIM = [
    { q: 'ערב חופשי. איפה אתה?', s: 'שאלה 01', a: [
      { t: 'במועדון. עד שסוגרים.', e: '🕺', w: { 'עיר': 4, 'לילה': 4 } },
      { t: 'בטיול. לבד, בשטח.', e: '🥾', w: { 'טבע': 5 } },
      { t: 'נוסע. לא חשוב לאן.', e: '🚗', w: { 'כביש': 5, 'רכב': 2 } },
      { t: 'בבית. עם נטפליקס.', e: '🛋️', w: { 'בית': 4, 'שכן': 2 } } ] },
    { q: 'איך אתה חוזר הביתה בשתיים בלילה?', s: 'שאלה 02', a: [
      { t: 'ברגל. זה קרוב.', e: '🚶‍♀️', w: { 'עיר': 3, 'לילה': 3 } },
      { t: 'עולה למונית עם מישהו שהכרתי הערב.', e: '🚕', w: { 'קסם': 4, 'עיר': 3, 'לילה': 2 } },
      { t: 'עוצר טרמפ.', e: '👍', w: { 'כביש': 5, 'רכב': 3 } },
      { t: 'לא יוצא בשתיים בלילה.', e: '😴', w: { 'בית': 3, 'שכן': 3 } } ] },
    { q: 'זר מציע לך עבודה במקום. מה אתה עונה?', s: 'שאלה 03', a: [
      { t: '"כמה משלמים?"', e: '💰', w: { 'הבטחה': 5, 'קורבנות צעירים': 2 } },
      { t: '"תשלח לי פרטים."', e: '📧', w: { 'הבטחה': 2 } },
      { t: '"לא, תודה." והולך.', e: '🙅', w: { 'כוח': 3, 'תחפושת': 2 } },
      { t: 'תלוי איך הוא נראה.', e: '👀', w: { 'קסם': 5 } } ] },
    { q: 'מי הכי קל לך לסמוך עליו?', s: 'שאלה 04', a: [
      { t: 'מישהו במדים.', e: '🚔', w: { 'מדים': 6 } },
      { t: 'איש מקצוע. רופא, מורה, מהנדס.', e: '🩺', w: { 'מקצוע מכובד': 6 } },
      { t: 'מישהו מהשכונה שאני מכיר מגיל אפס.', e: '🏡', w: { 'שכן': 6 } },
      { t: 'אף אחד. בסיס.', e: '🧊', w: { 'כוח': 4, 'לא נפתר': 1 } } ] },
    { q: 'הגיל שלך הכי קרוב ל…', s: 'שאלה 05', a: [
      { t: 'מתחת ל־18', e: '🎒', w: { 'קורבנות צעירים מאוד': 6 } },
      { t: '18–27', e: '🎧', w: { 'קורבנות צעירים': 5 } },
      { t: '28–40', e: '💼', w: { 'קורבנות מבוגרים': 3 } },
      { t: '40+', e: '🧭', w: { 'קורבנות מבוגרים': 5 } } ] },
    { q: 'איך היית מתאר את המצב שלך עכשיו?', s: 'שאלה 06', a: [
      { t: 'יציב. עבודה, בית, אנשים סביבי.', e: '🌳', w: { 'מקצוע מכובד': 2, 'שכן': 2 } },
      { t: 'בתנועה. עוד לא התיישבתי.', e: '🎒', w: { 'כביש': 4, 'קורבנות צעירים': 2 } },
      { t: 'קצת לבד. לא הרבה מי שישים לב.', e: '🌫️', w: { 'מודיעין שנזרק': 6 } },
      { t: 'באמצע משהו גדול.', e: '🚀', w: { 'ראוותן': 2, 'מקצוע מכובד': 2 } } ] },
    { q: 'משהו מרגיש לא בסדר. מה אתה עושה?', s: 'שאלה 07', a: [
      { t: 'הולך משם מיד.', e: '🚪', w: { 'נתפס בזכות ניצולה': 5 } },
      { t: 'נשאר. לא רוצה להיות לא מנומס.', e: '😬', w: { 'קסם': 4, 'הבטחה': 3 } },
      { t: 'שולח מיקום לחבר.', e: '📍', w: { 'מודרני': 4, 'DNA': 2 } },
      { t: 'נאבק. לא הולך בשקט.', e: '🔥', w: { 'נתפס בזכות ניצולה': 6 } } ] },
    { q: 'טלפון של מישהו שאתה לא מכיר. עונה?', s: 'שאלה 08', a: [
      { t: 'תמיד.', e: '☎️', w: { 'הבטחה': 3, 'קסם': 2 } },
      { t: 'רק אם זה נשמע חשוב.', e: '🤔', w: { 'תחפושת': 3, 'מדים': 2 } },
      { t: 'אף פעם.', e: '🔕', w: { 'כוח': 3 } },
      { t: 'עונה ומתחיל לדבר יותר מדי.', e: '💬', w: { 'קסם': 4, 'שכן': 2 } } ] },
    { q: 'איפה אתה גר?', s: 'שאלה 09', a: [
      { t: 'במרכז העיר.', e: '🏙️', w: { 'עיר': 5 } },
      { t: 'בפרברים. שקט.', e: '🏘️', w: { 'שכן': 4, 'בית': 3 } },
      { t: 'רחוק. יש שם חיות.', e: '🌾', w: { 'טבע': 5 } },
      { t: 'ליד המים.', e: '⚓', w: { 'מים': 5 } } ] },
    { q: 'ואם היית פוגש אותו — היית זוכר את הפנים?', s: 'שאלה 10', a: [
      { t: 'בוודאות. יש לי זיכרון פנים מעולה.', e: '🧠', w: { 'לא נפתר': -3, 'נתפס בזכות ניצולה': 4 } },
      { t: 'אולי. הם כולם נראים אותו דבר.', e: '🌀', w: { 'לא נפתר': 5 } },
      { t: 'רק אם הוא היה בולט.', e: '💫', w: { 'ראוותן': 3, 'תחפושת': 2 } },
      { t: 'לא. אני נורא בזה.', e: '🫠', w: { 'לא נפתר': 4, 'שקרן': 2 } } ] }
  ];

  function score(answers) {
    const want = {};
    answers.forEach(a => Object.entries(a.w || {}).forEach(([t, v]) => { want[t] = (want[t] || 0) + v; }));
    const maxPos = Object.values(want).reduce((s, v) => s + Math.max(0, v), 0) || 1;
    return profiles().map(p => {
      let s = 0; const hit = [];
      Object.entries(want).forEach(([t, v]) => {
        if (p.tags.has(t)) { s += v; if (v > 0) hit.push(t); } else if (v < 0) s -= v * 0.35;
      });
      s = s / Math.sqrt(Math.max(4, p.tags.size)) * 3.1;
      s += ((p.id.charCodeAt(0) * 7 + p.id.length * 13) % 11) * 0.06;
      return { p, s, hit, pct: Math.max(41, Math.min(97, Math.round((s / maxPos) * 190))) };
    }).sort((a, b) => b.s - a.s);
  }

  /* ===================================================================
     3 · "החקירה" — בונה תיק חסוי מכל תיק בארכיון
     =================================================================== */

  /* מוחק כל שם שמסגיר את התשובה, ומשאיר במקומו סימון צנזורה */
  function redact(k, s) {
    let t = strip(s);
    const words = [k.name, k.short, k.en, k.alias, k.id].filter(Boolean)
      .flatMap(n => String(n).split(/[\s·,"'’.]+/))
      .filter(w => w.length > 2)
      .sort((a, b) => b.length - a.length);
    words.forEach(w => { t = t.split(w).join('▉▉▉▉'); });
    return t.replace(/(▉▉▉▉[\s־-]*)+/g, '▉▉▉▉ ');
  }

  const NUM = n => ['אפס','אחד','שניים','שלושה','ארבעה','חמישה','שישה','שבעה','שמונה','תשעה','עשרה'][n] || n;

  function buildClues(p) {
    const k = p.k, c = window.vCount ? window.vCount(k) : { all: p.vs.n, s: 0 };
    const T = [...p.tags];
    const has = t => p.tags.has(t);
    const any = (...t) => t.filter(has);

    /* 1 · מתי ואיפה */
    const where = p.place || '—';
    const clue1 = `הפעילות מתועדת בין <b class="ltr">${p.y0}</b> ל־<b class="ltr">${p.y1}</b>. הזירה: <b class="ltr">${esc(where)}</b>.` +
      (has('שנים ארוכות') ? ' זה נמשך יותר מעשור.' : has('התפרצות קצרה') ? ' הכל קרה בפרק זמן קצר מאוד.' : '');

    /* 2 · פרופיל הקורבנות */
    const g = p.vs.women >= .75 ? 'נשים' : p.vs.men >= .75 ? 'גברים' : 'גברים ונשים';
    const ageTxt = p.vs.minAge && p.vs.maxAge
      ? (p.vs.minAge === p.vs.maxAge ? `בני <b class="ltr">${p.vs.minAge}</b>` : `בגילאי <b class="ltr">${p.vs.minAge}–${p.vs.maxAge}</b>`) : '';
    const clue2 = `בתיק <b class="ltr">${c.all}</b> קורבנות — ${g} ${ageTxt}.` +
      (c.s === 1 ? (p.vs.women >= .6 ? ' <b>אחת</b> שרדה.' : ' <b>אחד</b> שרד.')
        : c.s > 1 ? ` <b>${NUM(c.s)}</b> שרדו.` : ' אף אחד לא שרד.');

    /* 3 · שיטה ופיתיון */
    const meth = any('ירי','חניקה','סכין','אש','רעל');
    const lure = any('קסם','הבטחה','תחפושת','כוח','מדים','מקצוע מכובד','שכן','עסק משלו');
    const scene = any('עיר','טבע','כביש','בית','מים','מחסן','לילה');
    const clue3 = [
      meth.length ? `<b>שיטה:</b> ${meth.join(' · ')}` : null,
      lure.length ? `<b>גישה:</b> ${lure.slice(0,3).join(' · ')}` : null,
      scene.length ? `<b>סביבה:</b> ${scene.slice(0,3).join(' · ')}` : null
    ].filter(Boolean).join('<br>') || 'אין דפוס מובהק בתיק הזה.';

    /* 4 · פסקה מתוך התיק */
    const st = (k.story || []).slice(1);
    const clue4 = st.length ? redact(k, pick(st).t).slice(0, 420) + '…' : redact(k, k.line);

    /* 5 · ראיה */
    const ev = pick(k.evidence || [{ t: '—', b: k.line }]);
    const clue5 = `<b>${esc(redact(k, ev.t))}</b><br>${esc(redact(k, ev.b)).slice(0, 380)}…`;

    /* 6 · ציטוט */
    const qq = pick((k.quotes || []).filter(q => !/מאיה גזית|הערת הארכיון/.test(q.by)) || k.quotes || []);
    const clue6 = qq ? `<i>"${esc(redact(k, qq.t))}"</i><br><span class="gm-by">— ${esc(redact(k, qq.by))}</span>` : clue1;

    return [
      { s: 'A', t: 'מתי ואיפה',      h: clue1, i: '🗓️' },
      { s: 'B', t: 'פרופיל הקורבנות', h: clue2, i: '👤' },
      { s: 'C', t: 'שיטה וגישה',      h: clue3, i: '🧩' },
      { s: 'D', t: 'מתוך תיק החקירה', h: clue4, i: '📄' },
      { s: 'E', t: 'ראיה מהקלסר',     h: clue5, i: '🔍' },
      { s: 'F', t: 'ציטוט מהתיק',     h: clue6, i: '💬' }
    ];
  }

  const state = { mode: null, i: 0, answers: [], run: null, card: null };
  let root;

  function mount(html, cls) {
    if (!root) { root = document.createElement('div'); root.id = 'games'; document.body.appendChild(root); }
    root.innerHTML = `<div class="gm-scrim"></div><div class="gm-panel ${cls || ''}">${html}</div>`;
    root.classList.add('on');
    document.body.style.overflow = 'hidden';
    const sc = root.querySelector('.gm-scrim'); if (sc) sc.onclick = close;
    root.querySelectorAll('[data-close]').forEach(b => b.onclick = close);
    root.querySelectorAll('[data-home]').forEach(b => b.onclick = home);
    root.querySelectorAll('[data-arch]').forEach(b => b.onclick = () => { close(); if (window.goHome) window.goHome(); });
  }
  function close() {
    if (root) { root.classList.remove('on'); setTimeout(() => { if (root) root.innerHTML = ''; }, 260); }
    document.body.style.overflow = '';
  }
  /* סרגל ניווט קבוע — חזרה לארכיון, חזרה לחדר המשחקים, סגירה */
  function nav(title, sub, atHome) {
    return `<header class="gm-nav">
      <button class="gm-nb" data-arch title="חזרה לארכיון"><span>→</span> הארכיון</button>
      <div class="gm-nt"><b>${esc(title)}</b>${sub ? `<i>${esc(sub)}</i>` : ''}</div>
      ${atHome ? '<button class="gm-nb gm-x" data-close aria-label="סגירה">✕</button>'
               : '<button class="gm-nb" data-home>המשחקים</button><button class="gm-nb gm-x" data-close aria-label="סגירה">✕</button>'}
    </header>`;
  }

  const MODES = {
    solve:  { t: 'החקירה', s: 'תיק חי. שבע החלטות. אין רשימת חשודים.', e: '🔦', cta: 'קבל תיק' },
    killer: { t: 'איזה רוצח סדרתי אתה?', s: 'שתים־עשרה שאלות. אחת מהן מביכה.', e: '🩸', cta: 'בוא נגלה' },
    victim: { t: 'על ידי מי היית נרצח?', s: 'עשר שאלות. תענה בכנות, זה לא ייצא מפה.', e: '🔪', cta: 'קדימה' }
  };

  function home() {
    const n = profiles().length;
    mount(`${nav('חדר המשחקים', 'ארכיון הרצח', true)}
      <div class="gm-body">
        <div class="gm-plate" aria-hidden="true"></div>
        <div class="gm-kicker">FILE ROOM · ${String(n).padStart(2,'0')} PLAYABLE FILES</div>
        <h1 class="gm-title">תיק<span>פתוח</span></h1>
        <p class="gm-lede">שלושה משחקים שנבנים מ<b>כל התיקים שבארכיון</b>. כשנפתח תיק חדש — הוא מצטרף מעצמו, באותו רגע.</p>
        <div class="gm-modes">
          ${Object.entries(MODES).map(([k, m], i) => `
            <button class="gm-mode" data-m="${k}">
              <span class="gm-emoji">${m.e}</span>
              <span class="gm-mt"><b>${m.t}</b><i>${m.s}</i></span>
              <span class="gm-go">${m.cta} <i>←</i></span>
              <span class="gm-ref">${String.fromCharCode(65+i)}</span>
            </button>`).join('')}
        </div>
        <div class="gm-foot">זה משחק. הקורבנות בתיקים האלה היו אנשים אמיתיים, ואף אחד מהם לא בחר להיות שם — לכן המשחק צוחק עלינו, לא עליהם. שום תוצאה לא נשמרת בשום מקום.</div>
      </div>`, 'is-home');
    root.querySelectorAll('.gm-mode').forEach(b => b.onclick = () => start(b.dataset.m));
  }

  function start(mode) {
    state.mode = mode; state.i = 0; state.answers = [];
    if (window.track) try { window.track('game:' + mode); } catch (e) {}
    mode === 'solve' ? solveIntro() : question();
  }

  /* ---------- שאלוני האישיות ---------- */
  function question() {
    const M = MODES[state.mode], QS = state.mode === 'killer' ? Q_KILLER : Q_VICTIM;
    const Q = QS[state.i], pct = (state.i / QS.length) * 100;
    mount(`${nav(M.t, `${state.i + 1} / ${QS.length}`)}
      <div class="gm-body">
        <div class="gm-bar"><i style="width:${pct}%"></i></div>
        <div class="gm-step">${Q.s}<span>מתוך ${QS.length}</span></div>
        <h2 class="gm-qt">${esc(Q.q)}</h2>
        <div class="gm-opts">
          ${Q.a.map((o, i) => `<button class="gm-opt" data-i="${i}" style="animation-delay:${50 + i * 52}ms">
            <span class="gm-oe">${o.e}</span><span class="gm-ot">${esc(o.t)}</span><span class="gm-oc"></span></button>`).join('')}
        </div>
        ${state.i ? '<button class="gm-back">← שאלה קודמת</button>' : ''}
      </div>`);
    const back = root.querySelector('.gm-back');
    if (back) back.onclick = () => { state.i--; state.answers.pop(); question(); };
    root.querySelectorAll('.gm-opt').forEach(b => b.onclick = () => {
      b.classList.add('sel');
      if (navigator.vibrate) try { navigator.vibrate(12); } catch (e) {}
      state.answers.push(Q.a[+b.dataset.i]);
      setTimeout(() => { state.i++; state.i >= QS.length ? result() : question(); }, 220);
    });
  }

  const WHY = {
    'קסם':'שניכם עובדים עם חיוך, לא עם כוח','הבטחה':'שניכם מציעים משהו שאנשים רוצים',
    'תחפושת':'שניכם לא מופיעים בתור עצמכם','מדים':'סמכות פותחת דלתות. שניכם יודעים את זה',
    'מקצוע מכובד':'איש מקצוע מכובד בשעות העבודה','עסק משלו':'עצמאי. אף אחד לא מפקח',
    'שכן':'מהשכונה. זה בדיוק מה שהפך את זה לאפשרי','עיר':'עיר גדולה ואנונימית',
    'טבע':'מרחבים פתוחים בלי עדים','כביש':'תמיד בתנועה','בית':'ארבעה קירות ודלת סגורה',
    'מים':'קרוב למים','לילה':'שעות קטנות','ערכת רצח':'ציוד מסודר מראש. זה לא היה מאולתר',
    'מחסן':'היה מקום. תמיד יש מקום','רכב':'הרכב הוא חצי מהתיק','כוח':'בלי משחקים. ישר לעניין',
    'זוג':'לא לבד. זה מה שהופך את זה לנדיר','אספן':'שומרים דברים. שניכם','ראוותן':'רוצים שידעו',
    'שקרן':'הסיפור חשוב יותר מהעובדות','רבים':'מספרים גדולים','מעטים':'מעט מאוד — וזה בדיוק העניין',
    'שנים ארוכות':'סבלנות של שנים','התפרצות קצרה':'הכל בפרק זמן קצר','לא נפתר':'התיק הזה עדיין פתוח',
    'הודה':'בסוף סיפרו בעצמם','DNA':'המדע הוא שסגר את זה',
    'נתפס בזכות ניצולה':'מישהי שרדה — וזה מה שסיים את זה',
    'מודיעין שנזרק':'הסימנים היו שם. אף אחד לא הרים אותם',
    'ירי':'נשק חם','חניקה':'ידיים','סכין':'להב','אש':'אש','רעל':'רעל',
    'רטרו':'תקופה בלי מצלמות','אנלוגי':'עולם אנלוגי','מודרני':'תקופה מודרנית',
    'קורבנות נשים':'הפרופיל תואם','קורבנות גברים':'הפרופיל תואם','קורבנות צעירים':'הגיל תואם',
    'קורבנות צעירים מאוד':'הגיל תואם','קורבנות מבוגרים':'הגיל תואם'
  };
  const VERD = {
    killer: [['😐','זה יצא מדאיג'],['🫥','ובכן.'],['🩸','הארכיון קבע'],['📁','התיק שלך מוכן'],['🕯️','מזל שזה רק שאלון']],
    victim: [['🫣','תודה שהשתתפת'],['🚪','תנעל את הדלת'],['📞','שמור מספר בזיכרון'],['🧭','נסה לא ללכת לשם'],['☕','מזל שזה רק שאלון']]
  };

  function result() {
    const ranked = score(state.answers), top = ranked[0], runners = ranked.slice(1, 4), k = top.p.k;
    const V = pick(VERD[state.mode]);
    const uniq = [...new Set(top.hit.map(t => WHY[t]).filter(Boolean))].slice(0, 4);
    const txt = state.mode === 'killer'
      ? `עשיתי את השאלון של ארכיון הרצח ויצא לי ${k.name} — ${top.pct}% התאמה. 😐`
      : `לפי ארכיון הרצח, ${k.name} היה הכי מתאים לרצוח אותי (${top.pct}%). לילה טוב. 🫣`;
    if (window.track) try { window.track('game:' + state.mode + ':' + k.id); } catch (e) {}

    mount(`${nav(MODES[state.mode].t, 'תוצאה')}
      <div class="gm-body">
        <div class="gm-vk">${V[0]} ${V[1]}</div>
        <div class="gm-card">
          <div class="gm-stamp-row"><span class="gm-code">${esc(k.caseLabel || 'CASE FILE')}</span>
            <span class="gm-pct"><b>${top.pct}</b><i>%</i></span></div>
          <h2>${esc(k.name)}</h2>
          ${k.alias ? `<div class="gm-alias">${esc(k.alias)}</div>` : ''}
          <p class="gm-line">${esc(strip(k.line).slice(0, 190))}…</p>
        </div>
        ${uniq.length ? `<div class="gm-sec"><h4>למה דווקא הוא</h4><ul class="gm-why">${uniq.map(w => `<li>${esc(w)}</li>`).join('')}</ul></div>` : ''}
        <div class="gm-sec"><h4>כמעט יצא לך</h4>
          <div class="gm-alsos">${runners.map(r => `<button class="gm-also" data-id="${r.p.id}"><b>${esc(r.p.k.name)}</b><i>${r.pct}%</i></button>`).join('')}</div></div>
        <div class="gm-acts">
          <button class="gm-btn primary" data-id="${k.id}">פתח את התיק המלא</button>
          <button class="gm-btn" id="gm-share">שיתוף</button>
          <button class="gm-btn ghost" data-home>שוב, אבל בכנות</button>
        </div>
        <div class="gm-foot">התוצאה מחושבת מהתגיות שהארכיון גוזר לבד מכל תיק. אין כאן שום דבר מדעי, ואין כאן שיפוט על אף אחד — במיוחד לא על הקורבנות.</div>
      </div>`);
    bindOpen();
    root.querySelector('#gm-share').onclick = () => share(txt);
  }

  /* ---------- החקירה ---------- */
  /* ===================================================================
     החקירה · תיק חי
     ---------------------------------------------------------------------
     אתה מקבל את התיק ביום שהוא נפתח, בזמן אמת. בכל תחנה אתה מחליט מה
     לעשות — וההחלטה נמדדת מול מה שהחקירה האמיתית עשתה.
     החלטות טובות מייצרות לידים · לידים פותחים ראיות · ראיות מאפשרות לנקוב בשם.
     השם נבחר בחיפוש חופשי מכל הארכיון, לא מתוך רשימה.
     =================================================================== */

  /* מהלכי חקירה. התשואה נגזרת מהתגיות של התיק האמיתי — לא נכתבת ידנית. */
  const MOVES = [
    { k: 'open',  t: 'לפתוח תיק רצח',            e: '📂',
      d: 'להתייחס לזה כאל הרג מהרגע הראשון' },
    { k: 'file',  t: 'לסווג כנעדר או כתאונה',    e: '🗄️',
      d: 'אין ראיות. לתייק ולחכות' },
    { k: 'lab',   t: 'לשלוח לבדיקה פורנזית',     e: '🧪',
      d: 'בגדים, סיבים, דגימות — הכל למעבדה' },
    { k: 'canvas',t: 'לסרוק את הסביבה הקרובה',   e: '🏘️',
      d: 'שכנים, מכרים, מי שראה משהו' },
    { k: 'press', t: 'לצאת לציבור',              e: '📣',
      d: 'לפרסם תיאור ולבקש עזרה' },
    { k: 'cross', t: 'להצליב מול תיקים אחרים',   e: '🔗',
      d: 'אולי זה לא הראשון' },
    { k: 'wit',   t: 'לחזור לעדים ולמשפחות',     e: '🎙️',
      d: 'לשמוע שוב את מי שכבר דיברנו איתו' }
  ];

  /* כמה שווה כל מהלך בתיק הזה, ומה קרה במציאות */
  function payoff(p, mv, beat) {
    const has = t => p.tags.has(t);
    const kill = !!beat.kill;
    switch (mv.k) {
      case 'open':
        return { n: kill ? 3 : 2, real: has('מודיעין שנזרק') ? -1 : 1,
          say: has('מודיעין שנזרק')
            ? 'בחקירה האמיתית זה <b>לא</b> נעשה בשלב הזה. ההיעלמות סווגה אחרת, ותיק רצח לא נפתח.'
            : 'גם בחקירה האמיתית נפתח תיק — אבל בלי כיוון.' };
      case 'file':
        return { n: 0, real: has('מודיעין שנזרק') ? 1 : 0,
          say: has('מודיעין שנזרק')
            ? 'זה בדיוק מה שקרה. התיק נסגר במגירה, ו<b>המשפחה נשלחה הביתה</b>.'
            : 'התיק ממתין. הזמן עובר.' };
      case 'lab':
        return { n: has('DNA') ? 3 : 1, real: has('DNA') ? 1 : 0,
          say: has('DNA')
            ? 'המעבדה היא שסגרה את התיק הזה בסוף — <b>שנים אחר כך</b>.'
            : 'הבדיקות חוזרות בלי ממצא חד־משמעי.' };
      case 'canvas':
        return { n: (has('שכן') || has('זוג') || has('עסק משלו')) ? 3 : 1,
          real: has('שכן') ? 1 : 0,
          say: has('שכן')
            ? 'הוא היה שם כל הזמן. <b>אחד מהשכונה.</b>'
            : 'הסריקה מניבה שמות. אף אחד מהם לא מוביל לכלום.' };
      case 'press':
        return { n: (has('נתפס בזכות ניצולה') || has('ראוותן')) ? 3 : has('לא נפתר') ? 2 : 1,
          real: has('נתפס בזכות ניצולה') ? 1 : 0,
          say: has('נתפס בזכות ניצולה')
            ? 'הפרסום מגיע למי שצריך. <b>מישהי שרדה — והיא זו שתסגור את זה.</b>'
            : has('לא נפתר')
              ? 'אלפי הודעות מהציבור. אף אחת מהן לא האחת.'
              : 'הפרסום מייצר רעש. גם קצת מידע.' };
      case 'cross':
        return { n: has('שנים ארוכות') ? 3 : 2, real: has('שנים ארוכות') ? 1 : 0,
          say: has('שנים ארוכות')
            ? 'ההצלבה מראה דפוס. <b>זה לא הראשון, וזה לא יהיה האחרון.</b>'
            : 'אין התאמה ברורה לתיקים אחרים.' };
      default:
        return { n: (has('נתפס בזכות ניצולה') || has('מודיעין שנזרק')) ? 3 : 1,
          real: 0,
          say: has('מודיעין שנזרק')
            ? 'המשפחה אמרה את זה כבר פעם. <b>אף אחד לא רשם.</b>'
            : 'העדים חוזרים על מה שאמרו.' };
    }
  }

  /* התחנות — נבנות מציר הזמן האמיתי, מוצנזרות */
  function beats(p) {
    const tl = (p.k.timeline || []).filter(t => String(t.y).match(/\d{4}/));
    const kills = tl.filter(t => t.kill), rest = tl.filter(t => !t.kill);
    const chosen = [...kills.slice(0, 4), ...rest.slice(1, 6)]
      .sort((a, b) => (String(a.y).match(/\d{4}/) || [0])[0] - (String(b.y).match(/\d{4}/) || [0])[0]);
    const uniq = []; const seen = new Set();
    chosen.forEach(t => { if (!seen.has(t.t)) { seen.add(t.t); uniq.push(t); } });
    return uniq.slice(0, 7).map(t => ({
      y: String(t.y), t: redact(p.k, t.t), d: redact(p.k, t.d), kill: !!t.kill
    }));
  }

  const RANKS = [
    [92, '🎖️', 'ראש צוות מיוחד', 'אתה סגרת את התיק לפני שהמערכת בכלל הבינה שיש תיק.'],
    [74, '🔦', 'חוקר בכיר',       'קראת את זה נכון. לא כולם קוראים את זה נכון.'],
    [52, '📎', 'בלש',            'עבודה מסודרת. הגעת לשם.'],
    [30, '☕', 'מתמחה',          'לקח זמן. אבל לקחת גם משהו הביתה.'],
    [0,  '🗄️', 'עוזר תיוק',      'התיק נשאר במגירה. כמו במציאות.']
  ];
  const rankOf = s => RANKS.find(r => s >= r[0]);

  function newRun() {
    const p = pick(profiles());
    return { p, i: 0, leads: 0, unlocked: 1, log: [], wrong: [], done: false,
      clues: buildClues(p), bts: beats(p), t0: 0 };
  }

  /* ---------- מסך פתיחה ---------- */
  function solveIntro() {
    mount(`${nav('החקירה', 'תדריך')}
      <div class="gm-body">
        <div class="gm-brief">
          <div class="gm-brief-h"><span class="gm-code">CASE FILE · SUBJECT UNKNOWN</span><span class="gm-seal">חסוי</span></div>
          <h2 class="gm-qt" style="margin:0 0 12px">אתה מקבל את התיק ביום שהוא נפתח.</h2>
          <p class="gm-lede" style="margin:0">בכל תחנה אתה מחליט מה לעשות — <b>וההחלטה נמדדת מול מה שהחקירה האמיתית עשתה</b>.
          החלטות טובות מייצרות לידים. לידים פותחים ראיות. וכשאתה חושב שאתה יודע — אתה נוקב בשם.</p>
        </div>
        <div class="gm-rules">
          <div class="gm-rule"><span>01</span><b>שבע תחנות</b><i>כל אחת רגע אמיתי מציר הזמן של התיק</i></div>
          <div class="gm-rule"><span>02</span><b>לידים פותחים ראיות</b><i>כל ארבעה לידים — עוד חלק מהתיק נחשף</i></div>
          <div class="gm-rule"><span>03</span><b>חיפוש חופשי</b><i>אין רשימת חשודים. הארכיון כולו פתוח מולך</i></div>
          <div class="gm-rule"><span>04</span><b>מוקדם שווה יותר</b><i>ככל שתנקוב בשם מוקדם — הניקוד גבוה יותר</i></div>
        </div>
        <div class="gm-acts"><button class="gm-btn primary" id="gm-go">קבל את התיק</button></div>
        <div class="gm-foot">רוב החוקרים לא סוגרים את זה בפעם הראשונה. גם ברוב התיקים האמיתיים זה לא קרה. <b>אבל אפשר.</b></div>
      </div>`);
    root.querySelector('#gm-go').onclick = () => { state.run = newRun(); beatView(); };
  }

  /* ---------- לוח החקירה ---------- */
  function boardHTML(R) {
    const open = R.clues.slice(0, R.unlocked);
    const next = Math.max(0, (R.unlocked * 4) - R.leads);
    return `
      <div class="gm-board">
        <div class="gm-board-h">
          <span class="gm-code">INVESTIGATION BOARD</span>
          <span class="gm-leads"><b>${R.leads}</b> לידים</span>
        </div>
        <div class="gm-meter"><i style="width:${Math.min(100, ((R.leads % 4) / 4) * 100)}%"></i></div>
        <div class="gm-meter-l">${R.unlocked >= R.clues.length
          ? 'כל מה שיש בתיק כבר מולך.'
          : `עוד <b>${next}</b> לידים ונפתח <b>${esc(R.clues[R.unlocked].t)}</b>`}</div>
        <div class="gm-frags">
          ${open.map(c => `<div class="gm-frag">
            <div class="gm-frag-h"><span class="gm-ref">${c.s}</span><b>${esc(c.t)}</b><span>${c.i}</span></div>
            <div class="gm-frag-b">${c.h}</div></div>`).join('')}
        </div>
      </div>`;
  }

  /* ---------- תחנה ---------- */
  function beatView(flash) {
    const R = state.run, B = R.bts[R.i];
    if (!B) return coldCase();
    const opts = shuffle(MOVES).slice(0, 3);
    R._opts = opts;
    mount(`${nav('החקירה', `תחנה ${R.i + 1} מתוך ${R.bts.length}`)}
      <div class="gm-body">
        <div class="gm-hud">
          <span class="gm-hud-i"><b>${R.i + 1}<em>/${R.bts.length}</em></b><i>תחנה</i></span>
          <span class="gm-hud-i"><b>${R.leads}</b><i>לידים</i></span>
          <span class="gm-hud-i"><b>${R.unlocked}<em>/${R.clues.length}</em></b><i>ראיות</i></span>
        </div>
        ${flash || ''}
        <div class="gm-beat">
          <div class="gm-beat-y">${esc(B.y)}</div>
          <h2 class="gm-beat-t">${esc(B.t)}${B.kill ? '<span class="gm-kill">קורבן</span>' : ''}</h2>
          <p class="gm-beat-d">${esc(B.d)}</p>
        </div>
        <h4 class="gm-sec-h">מה אתה עושה?</h4>
        <div class="gm-moves">
          ${opts.map((m, i) => `<button class="gm-move" data-i="${i}" style="animation-delay:${60 + i * 60}ms">
            <span class="gm-move-e">${m.e}</span>
            <span class="gm-move-t"><b>${esc(m.t)}</b><i>${esc(m.d)}</i></span>
            <span class="gm-oc"></span></button>`).join('')}
        </div>
        ${boardHTML(R)}
        <div class="gm-acts">
          <button class="gm-btn ${R.unlocked >= 2 ? 'primary' : ''}" id="gm-name"
            ${R.unlocked < 2 ? 'disabled' : ''}>אני יודע מי זה ←</button>
        </div>
        ${R.unlocked < 2 ? '<div class="gm-foot">כדי לנקוב בשם צריך לפחות שתי ראיות פתוחות. תמשיך לעבוד.</div>' : ''}
      </div>`);
    root.querySelectorAll('.gm-move').forEach(b => b.onclick = () => {
      b.classList.add('sel');
      if (navigator.vibrate) try { navigator.vibrate(12); } catch (e) {}
      setTimeout(() => applyMove(+b.dataset.i), 200);
    });
    const nb = root.querySelector('#gm-name');
    if (nb && !nb.disabled) nb.onclick = nameView;
  }

  function applyMove(i) {
    const R = state.run, mv = R._opts[i], B = R.bts[R.i];
    const po = payoff(R.p, mv, B);
    R.leads += po.n;
    R.log.push({ mv, po, y: B.y });
    const before = R.unlocked;
    R.unlocked = Math.min(R.clues.length, 1 + Math.floor(R.leads / 4));
    R.i++;
    const gained = R.unlocked > before;
    const cls = po.n >= 3 ? 'good' : po.n === 0 ? 'bad' : '';
    const flash = `<div class="gm-flash ${cls}">
      <b>${po.n > 0 ? '+' + po.n + ' לידים' : 'אפס לידים'}.</b> ${po.say}
      ${gained ? `<br><span class="gm-unlock">▸ נפתחה ראיה חדשה בלוח: <b>${esc(R.clues[before].t)}</b></span>` : ''}</div>`;
    R.i >= R.bts.length ? coldCase(flash) : beatView(flash);
  }

  /* ---------- חיפוש חופשי בכל הארכיון ---------- */
  function nameView(msg) {
    const R = state.run;
    const all = Object.keys(window.DB || {}).map(id => ({ id, k: window.DB[id] }));
    mount(`${nav('החקירה', 'נקיבה בשם')}
      <div class="gm-body">
        <div class="gm-brief" style="margin-bottom:16px">
          <div class="gm-brief-h"><span class="gm-code">SUSPECT IDENTIFICATION</span><span class="gm-seal">הכרעה</span></div>
          <p class="gm-lede" style="margin:0;font-size:13.5px">אין רשימה. <b>הארכיון כולו פתוח מולך.</b>
          תנקוב מוקדם — תקבל יותר. תטעה — תשלם בלידים.</p>
        </div>
        ${msg || ''}
        <div class="gm-search">
          <input id="gm-q" type="search" placeholder="הקלד שם, כינוי או מקום…" autocomplete="off" spellcheck="false">
        </div>
        <div class="gm-results" id="gm-res"></div>
        <div class="gm-acts" style="margin-top:18px">
          <button class="gm-btn ghost" id="gm-back">← עוד לא. חזרה לחקירה</button>
        </div>
      </div>`);
    const q = root.querySelector('#gm-q'), res = root.querySelector('#gm-res');
    const draw = () => {
      const v = q.value.trim();
      const list = (v ? all.filter(x =>
        (x.k.name + ' ' + (x.k.alias || '') + ' ' + (x.k.en || '') + ' ' + (x.k.caseLabel || ''))
          .toLowerCase().includes(v.toLowerCase())) : all).slice(0, 40);
      res.innerHTML = list.length ? list.map(x => `
        <button class="gm-hit" data-s="${x.id}" ${R.wrong.includes(x.id) ? 'disabled' : ''}>
          <b>${esc(x.k.name)}</b><i>${esc(x.k.alias || '')}</i>
          <span class="gm-code">${esc((x.k.caseLabel || '').replace('CASE FILE · ', ''))}</span>
          ${R.wrong.includes(x.id) ? '<span class="gm-no">✕</span>' : ''}</button>`).join('')
        : '<p class="gm-empty">אין התאמה. נסה כינוי, עיר או שנה.</p>';
      res.querySelectorAll('.gm-hit:not([disabled])').forEach(b => b.onclick = () => accuse(b.dataset.s));
    };
    q.oninput = draw; draw();
    setTimeout(() => q.focus(), 80);
    root.querySelector('#gm-back').onclick = () => beatView();
  }

  function accuse(id) {
    const R = state.run;
    if (id === R.p.id) { R.done = true; return interview(true); }
    R.wrong.push(id);
    R.leads = Math.max(0, R.leads - 3);
    R.unlocked = Math.min(R.clues.length, Math.max(R.unlocked, 1 + Math.floor(R.leads / 4)));
    nameView(`<div class="gm-flash bad"><b>לא הוא.</b> ${esc(window.DB[id].name)} לא מתאים לתיק הזה. −3 לידים.</div>`);
  }

  function coldCase(flash) {
    const R = state.run;
    if (R.unlocked >= 2) return nameView(
      (flash || '') + '<div class="gm-flash"><b>נגמרו התחנות.</b> זו ההזדמנות האחרונה לנקוב בשם.</div>');
    interview(false);
  }

  /* ---------- חדר הריאיון ---------- */
  const LINES = {
    open:  'הדבר הראשון שעשיתי היה לפתוח תיק רצח. לא כולם הסכימו איתי.',
    file:  'תייקנו את זה. אני חושב על זה עד היום.',
    lab:   'שלחתי הכל למעבדה. אז לא היה לזה שם, היום קוראים לזה פורנזיקה.',
    canvas:'הלכתי מדלת לדלת. התשובה היתה באחת מהן.',
    press: 'יצאנו לציבור. אמרו לי שזה ייצור פאניקה. זה ייצר טלפון אחד שהיה שווה הכל.',
    cross: 'הוצאתי תיקים ישנים והנחתי אותם אחד ליד השני. ואז ראיתי את זה.',
    wit:   'חזרתי למשפחה. הם אמרו לי בדיוק את מה שאמרו בפעם הראשונה.'
  };

  function interview(won) {
    const R = state.run, k = R.p.k;
    const early = R.bts.length - R.i;
    /* ניצחון תמיד שווה משהו. טעויות עולות — אבל לא הורסות. */
    const raw = (won ? 45 : 0) + R.leads * 2 + early * 5 - Math.min(20, R.wrong.length * 5);
    const sc = Math.max(won ? 32 : 0, Math.min(100, Math.round(raw)));
    const rk = rankOf(sc);
    const best = R.log.slice().sort((a, b) => b.po.n - a.po.n).slice(0, 2);
    const missed = R.log.filter(l => l.po.real === -1);
    state.card = { won, sc, rk, k, R };
    if (window.track) try { window.track('game:solve:' + k.id + (won ? ':win' : ':cold')); } catch (e) {}

    mount(`${nav('החקירה', won ? 'התיק נסגר' : 'התיק נשאר פתוח')}
      <div class="gm-int">
        <canvas class="gm-sig" id="gm-sig" aria-hidden="true"></canvas>
        <div class="gm-int-in">
          <div class="gm-rec"><span></span>REC · ${esc((k.caseLabel || '').replace('CASE FILE · ', ''))}</div>
          <div class="gm-third">
            <b>${esc(rk[2])}</b>
            <i>${won ? 'סגר את התיק' : 'עבד על התיק'} · ${R.leads} לידים · ${R.i}/${R.bts.length} תחנות</i>
          </div>
          <div class="gm-quotes" id="gm-quotes">
            ${best.map(l => `<p>"${esc(LINES[l.mv.k])}"</p>`).join('')}
            <p>"${esc(won ? 'בסוף היה לו שם. ' + k.name + '.' : 'לא הגעתי לשם בזמן. התיק הזה נשאר איתי.')}"</p>
          </div>
        </div>
      </div>

      <div class="gm-body">
        <div class="gm-verdict ${won ? 'ok' : 'no'}">${won ? 'תיק נסגר' : 'התיק נשאר פתוח'}</div>
        <div class="gm-card">
          <div class="gm-stamp-row"><span class="gm-code">${esc(k.caseLabel || 'CASE FILE')}</span>
            <span class="gm-pct"><b>${sc}</b></span></div>
          <h2>${esc(k.name)}</h2>
          ${k.alias ? `<div class="gm-alias">${esc(k.alias)}</div>` : ''}
          <p class="gm-line">${esc(strip(k.line).slice(0, 200))}…</p>
        </div>

        ${missed.length ? `<div class="gm-sec"><h4>מה שאתה עשית והחקירה האמיתית לא</h4>
          <ul class="gm-why">${[...new Set(missed.map(l => l.mv.t))].slice(0, 3)
            .map(t => `<li>${esc(t)} — בזמן אמת זה לא נעשה.</li>`).join('')}</ul></div>` : ''}

        <div class="gm-sec"><h4>יומן החקירה שלך</h4>
          <div class="gm-log">${R.log.map(l => `<div class="gm-log-r">
            <span class="gm-code">${esc(l.y)}</span><b>${esc(l.mv.t)}</b>
            <i class="${l.po.n >= 3 ? 'g' : l.po.n === 0 ? 'b' : ''}">${l.po.n > 0 ? '+' + l.po.n : '0'}</i>
          </div>`).join('')}</div></div>

        <div class="gm-acts">
          <button class="gm-btn primary" id="gm-story">כרטיס לסטורי / טיקטוק</button>
          <button class="gm-btn" data-id="${k.id}">פתח את התיק המלא</button>
          <button class="gm-btn ghost" id="gm-again">תיק חדש</button>
        </div>
        <div class="gm-foot">כל תחנה בחקירה הזאת היא רגע אמיתי מציר הזמן של התיק. גם התגובות. <b>מה שהחקירה האמיתית עשתה — מתועד בלשונית "ראיות" של התיק.</b></div>
        <a class="plug" href="https://takemeout.dubelteam.com/?utm_source=retzach&utm_medium=game&utm_campaign=archive" target="_blank" rel="noopener"><img src="/img/dubelteam-mark.png" alt="" width="30" height="30" loading="lazy"><span>את הארכיון הזה בנינו ב־<b class="ltr">Dubel Team</b>, מאתונה. בנינו גם את <b class="ltr">TakeMeOut!</b> — שלושה מסלולים ליום שלם בעיר בשלושים שניות. חינם, בלי הרשמה.</span></a>
      </div>`);
    bindOpen();
    root.querySelector('#gm-again').onclick = solveIntro;
    root.querySelector('#gm-story').onclick = storyCard;
    signature(root.querySelector('#gm-sig'), sigSeed(state.card), state.card, true);
    typewrite(root.querySelector('#gm-quotes'));
  }

  /* הקלדה איטית לציטוטים — קצב של ריאיון, לא של ממשק */
  function typewrite(box) {
    if (!box || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const ps = [...box.querySelectorAll('p')];
    ps.forEach(p => { p.dataset.txt = p.textContent; p.textContent = ''; p.style.opacity = 1; });
    let pi = 0;
    (function step() {
      if (pi >= ps.length) return;
      const p = ps[pi], t = p.dataset.txt; let i = 0;
      const tick = () => {
        p.textContent = t.slice(0, ++i);
        if (i < t.length) setTimeout(tick, 18 + Math.random() * 26);
        else { pi++; setTimeout(step, 520); }
      };
      tick();
    })();
  }

  /* ===================================================================
     חתימת התיק · אמנות אלגוריתמית
     ---------------------------------------------------------------------
     שדה זרימה עם זרע קבוע. אותו תיק + אותן החלטות = בדיוק אותה יצירה;
     החלטה אחת שונה = יצירה אחרת לגמרי. לכן כל שיתוף הוא ייחודי,
     ולכן יש טעם לשחק שוב.
     =================================================================== */

  /* PRNG דטרמיניסטי (mulberry32) — בלי Math.random בתוך הציור */
  const rng = seed => () => {
    seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const hash = s => { let h = 2166136261; for (let i = 0; i < s.length; i++)
    { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; };

  const sigSeed = c => hash(c.k.id + '|' + c.R.log.map(l => l.mv.k).join('') + '|' + c.sc + '|' + c.won);

  /* פלטת התיק — נגזרת מהתגיות, לא נבחרת ידנית */
  function sigPal(p) {
    const t = p.tags;
    if (t.has('לא נפתר'))  return ['#6f7d8c', '#2b3540', '#c1121f'];
    if (t.has('אש'))       return ['#e0894d', '#3a1c10', '#c1121f'];
    if (t.has('טבע'))      return ['#7f9a72', '#1a2419', '#c1121f'];
    if (t.has('מים'))      return ['#6f93a8', '#111d26', '#c1121f'];
    if (t.has('כביש'))     return ['#c9a227', '#2a2110', '#c1121f'];
    if (t.has('רטרו'))     return ['#c8b79a', '#241d16', '#c1121f'];
    return ['#cfc6ba', '#1b1611', '#c1121f'];
  }

  function signature(cv, seed, card, animate) {
    if (!cv) return;
    const box = cv.parentElement.getBoundingClientRect();
    const dpr = Math.min(2, devicePixelRatio || 1);
    const W = Math.max(320, box.width | 0), H = Math.max(240, box.height | 0);
    cv.width = W * dpr; cv.height = H * dpr;
    cv.style.width = W + 'px'; cv.style.height = H + 'px';
    const x = cv.getContext('2d'); x.scale(dpr, dpr);
    drawSig(x, W, H, seed, card, animate);
  }

  function drawSig(x, W, H, seed, card, animate) {
    const R = rng(seed), pal = sigPal(card.R.p);
    const S = Math.min(W, H) / 380;                       // התאמה לגודל הבד
    const N = Math.round((260 + card.R.leads * 22) * Math.max(1, S * .8)); // צפיפות = כמה עבדת
    const turb = 0.0014 + card.R.wrong.length * 0.0008;   // כאוס = כמה טעית
    const cx = W / 2, cy = H / 2;

    x.fillStyle = '#0a0908'; x.fillRect(0, 0, W, H);
    /* שדה זרימה: כל חלקיק הוא קו חקירה */
    const ps = Array.from({ length: N }, () => ({
      x: R() * W, y: R() * H, l: 26 + R() * 90,
      c: R() < 0.075 ? pal[2] : (R() < 0.52 ? pal[0] : pal[1]),
      w: (R() < 0.1 ? 1.5 : 0.7) * Math.max(1, S * .7), a: 0.24 + R() * 0.6
    }));
    const field = (px, py) => {
      const d = Math.hypot(px - cx, py - cy) * turb;
      return Math.sin(px * 0.006 + seed % 7) * 1.6 + Math.cos(py * 0.0075 + seed % 11) * 1.6 + d;
    };
    const STEPS = 62;
    let step = 0;
    const paint = () => {
      const batch = animate ? 3 : 999;
      for (let b = 0; b < batch && step < STEPS; b++, step++) {
        ps.forEach(p => {
          const a = field(p.x, p.y);
          const nx = p.x + Math.cos(a) * 3.6 * S, ny = p.y + Math.sin(a) * 3.6 * S;
          x.strokeStyle = p.c; x.globalAlpha = p.a * 0.62; x.lineWidth = p.w;
          x.beginPath(); x.moveTo(p.x, p.y); x.lineTo(nx, ny); x.stroke();
          p.x = nx; p.y = ny;
          if (p.x < -20 || p.x > W + 20 || p.y < -20 || p.y > H + 20) { p.x = R() * W; p.y = R() * H; }
        });
      }
      x.globalAlpha = 1;
      if (animate && step < STEPS) requestAnimationFrame(paint);
      else finish();
    };
    const finish = () => {
      x.globalAlpha = 1;
      /* צלקת אחת אדומה — הרגע שבו התיק נשבר */
      const gy = H * (0.3 + (seed % 40) / 100);
      x.strokeStyle = pal[2]; x.lineWidth = 1.8 * Math.max(1, S * .8); x.globalAlpha = .95;
      x.beginPath(); x.moveTo(W * 0.06, gy); x.lineTo(W * 0.94, gy + (seed % 17) - 8); x.stroke();
      /* סימן אחד לכל תחנה שעברת */
      x.globalAlpha = 1;
      card.R.log.forEach((l, i) => {
        const tx = W * 0.08 + (W * 0.84) * (i / Math.max(1, card.R.bts.length - 1));
        const h = 5 + l.po.n * 4;
        x.strokeStyle = l.po.n >= 3 ? pal[2] : pal[0];
        x.globalAlpha = l.po.n === 0 ? .35 : .9; x.lineWidth = 1.6 * Math.max(1, S * .8);
        const by = H - 20 * Math.max(1, S * .7);
        x.beginPath(); x.moveTo(tx, by); x.lineTo(tx, by - h * Math.max(1, S * .7)); x.stroke();
      });
      x.globalAlpha = 1;
      /* וינייטה */
      const g = x.createRadialGradient(cx, cy, Math.min(W, H) * .2, cx, cy, Math.max(W, H) * .78);
      g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(6,5,5,.82)');
      x.fillStyle = g; x.fillRect(0, 0, W, H);
    };
    paint();
  }

  /* ---------- כרטיס לסטורי / טיקטוק · 1080×1920 ---------- */
  async function storyCard() {
    const c = state.card; if (!c) return;
    const W = 1080, H = 1920, cv = document.createElement('canvas');
    cv.width = W; cv.height = H;
    const x = cv.getContext('2d');
    drawSig(x, W, H, sigSeed(c), c, false);

    /* שכבת כהות כדי שהטקסט יינשם */
    const g = x.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, 'rgba(10,9,8,.93)'); g.addColorStop(.30, 'rgba(10,9,8,.74)');
    g.addColorStop(.46, 'rgba(10,9,8,.10)'); g.addColorStop(.60, 'rgba(10,9,8,.12)');
    g.addColorStop(.70, 'rgba(10,9,8,.80)'); g.addColorStop(1, 'rgba(10,9,8,.97)');
    x.fillStyle = g; x.fillRect(0, 0, W, H);

    const F = (w, s) => `${w} ${s}px Rubik, "Helvetica Neue", Arial, sans-serif`;
    const M = 92;
    x.textAlign = 'right'; x.direction = 'rtl';

    x.fillStyle = '#e8232f'; x.font = F(700, 25);
    x.letterSpacing = '8px';
    x.textAlign = 'left'; x.direction = 'ltr';
    x.fillText('ARCHION HA-RETZACH · THE INVESTIGATION', M, 150);
    x.letterSpacing = '0px';

    x.textAlign = 'right'; x.direction = 'rtl';
    x.fillStyle = '#f4efe8'; x.font = F(900, 118);
    x.fillText(c.won ? 'תיק נסגר' : 'התיק', W - M, 380);
    if (!c.won) { x.fillStyle = '#e8232f'; x.fillText('נשאר פתוח', W - M, 500); }

    /* הדרגה */
    x.fillStyle = '#e8232f'; x.font = F(800, 62);
    x.fillText(c.rk[2], W - M, c.won ? 500 : 620);
    x.fillStyle = '#9c9184'; x.font = F(300, 34);
    x.fillText(c.rk[3].slice(0, 44), W - M, c.won ? 556 : 676);

    /* המספרים */
    const stats = [[c.sc, 'ניקוד'], [c.R.leads, 'לידים'], [`${c.R.i}/${c.R.bts.length}`, 'תחנות']];
    stats.forEach(([v, l], i) => {
      const bx = W - M - i * 300;
      x.textAlign = 'right';
      x.fillStyle = '#f4efe8'; x.font = F(900, 84); x.fillText(String(v), bx, 1330);
      x.fillStyle = '#9c9184'; x.font = F(600, 27); x.fillText(l, bx, 1378);
    });
    x.strokeStyle = 'rgba(193,18,31,.55)'; x.lineWidth = 3;
    x.beginPath(); x.moveTo(M, 1430); x.lineTo(W - M, 1430); x.stroke();

    /* השם — רק אם ניצח. אחרת לא מספרים לאף אחד. */
    x.fillStyle = c.won ? '#cfc6ba' : '#6f665c'; x.font = F(400, 38);
    x.fillText(c.won ? `הרוצח: ${c.k.name}` : 'לא גיליתי מי זה. תנסה אתה.', W - M, 1500);

    /* חתימה */
    x.fillStyle = '#f4efe8'; x.font = F(800, 44);
    x.fillText('ארכיון הרצח', W - M, 1730);
    x.fillStyle = '#8d8377'; x.font = F(300, 30);
    x.fillText('מחווה לקהילת פודקאסט רצח', W - M, 1778);
    x.textAlign = 'left'; x.direction = 'ltr';
    x.fillStyle = '#e8232f'; x.font = F(700, 27); x.letterSpacing = '3px';
    x.fillText('RETZACH.DUBELTEAM.COM', M, 1730);
    x.letterSpacing = '0px';

    /* הלוגו — קטן, בפינה, בלי להשתלט */
    await new Promise(res => {
      const im = new Image();
      im.onload = () => { x.globalAlpha = .96; x.drawImage(im, M, 1752, 62, 62); x.globalAlpha = 1; res(); };
      im.onerror = res; im.src = '/img/dubelteam-mark.png';
    });

    cv.toBlob(async blob => {
      if (!blob) return;
      const file = new File([blob], 'retzach-investigation.png', { type: 'image/png' });
      const txt = c.won
        ? `סגרתי את התיק ב"החקירה" של ארכיון הרצח. דרגה: ${c.rk[2]}. תנסה אתה 👇`
        : `התיק נשאר פתוח. הגעתי לדרגת ${c.rk[2]} ולא מצאתי אותו. תנסה אתה 👇`;
      try {
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({ files: [file], text: txt, title: 'ארכיון הרצח' });
          return;
        }
      } catch (e) {}
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob); a.download = 'retzach-investigation.png'; a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 4000);
      toast('הכרטיס ירד למכשיר. העלה לסטורי 🖤');
    }, 'image/png');
  }

  /* ---------- משותף ---------- */
  function bindOpen() {
    root.querySelectorAll('[data-id]').forEach(b => b.onclick = () => {
      close(); if (window.openKiller) window.openKiller(b.dataset.id);
    });
  }
  async function share(text) {
    const url = location.origin + '/';
    try {
      if (navigator.share) await navigator.share({ title: 'ארכיון הרצח', text, url });
      else { await navigator.clipboard.writeText(text + ' ' + url); toast('הועתק. תדביק איפה שבא לך.'); }
    } catch (e) {}
  }
  function toast(m) {
    const t = document.getElementById('toast'); if (!t) return;
    t.textContent = m; t.classList.add('on'); setTimeout(() => t.classList.remove('on'), 2200);
  }

  window.openGames = home;
  window.openQuiz = home;   /* תאימות לאחור */
  home();
})();
