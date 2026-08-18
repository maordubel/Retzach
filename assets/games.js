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

  const DIFF = {
    easy:   { n: 3, t: 'מתמחה',  d: 'שלושה חשודים' },
    mid:    { n: 5, t: 'בלש',    d: 'חמישה חשודים' },
    hard:   { n: 8, t: 'ראש צוות', d: 'שמונה חשודים — כולם דומים' }
  };

  function newCase(diffKey) {
    const D = DIFF[diffKey], pool = profiles();
    const answer = pick(pool);
    const jac = p => { const inter = [...p.tags].filter(t => answer.tags.has(t)).length;
      return inter / (new Set([...p.tags, ...answer.tags]).size || 1); };
    const near = pool.filter(p => p.id !== answer.id).map(p => ({ p, s: jac(p) }))
      .sort((a, b) => b.s - a.s).slice(0, Math.max(D.n + 3, 9)).map(o => o.p);
    const decoys = shuffle(near).slice(0, D.n - 1);
    return { answer, lineup: shuffle([answer, ...decoys]), clues: buildClues(answer), opened: [0], wrong: [] };
  }

  const RANKS = [
    [95, '🏅', 'ראש צוות מיוחד', 'זה כבר לא מזל.'],
    [78, '🎖️', 'חוקר בכיר',     'התיק נסגר לפני שהקפה התקרר.'],
    [58, '🔦', 'בלש',            'עבודה מסודרת.'],
    [35, '📎', 'מתמחה',          'הגעת לשם. לקח קצת.'],
    [0,  '☕', 'עוזר תיוק',      'אולי תתחיל מהתיקים הפתוחים.']
  ];
  const rankOf = s => RANKS.find(r => s >= r[0]);

  /* ===================================================================
     4 · המעטפת
     =================================================================== */
  const state = { mode: null, i: 0, answers: [], solve: null, run: null };
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
    solve:  { t: 'החקירה', s: 'תיק חסוי. שישה רמזים. מי זה?', e: '🔦', cta: 'פתח תיק' },
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
  function solveIntro() {
    state.run = { done: 0, total: 5, score: 0, solved: 0 };
    mount(`${nav('החקירה', 'בחירת רמה')}
      <div class="gm-body">
        <div class="gm-brief">
          <div class="gm-brief-h"><span class="gm-code">CLASSIFIED · CASE UNKNOWN</span><span class="gm-seal">חסוי</span></div>
          <h2 class="gm-qt" style="margin-bottom:12px">חמישה תיקים. שמות מושחרים.</h2>
          <p class="gm-lede" style="margin-bottom:0">כל תיק נפתח עם רמז אחד. אפשר לפתוח עוד — אבל <b>כל רמז עולה לך בניקוד</b>. מזהים את הרוצח מוקדם ככל האפשר, מתוך שורת חשודים.</p>
        </div>
        <div class="gm-diffs">
          ${Object.entries(DIFF).map(([k, d], i) => `<button class="gm-diff" data-d="${k}">
            <span class="gm-ref">${String(i+1).padStart(2,'0')}</span>
            <b>${d.t}</b><i>${d.d}</i></button>`).join('')}
        </div>
      </div>`);
    root.querySelectorAll('.gm-diff').forEach(b => b.onclick = () => {
      state.run.diff = b.dataset.d; nextCase();
    });
  }

  function nextCase() {
    state.solve = newCase(state.run.diff);
    state.solve.pts = 100;
    solveView();
  }

  function solveView(feedback) {
    const S = state.solve, R = state.run;
    mount(`${nav('החקירה', `תיק ${R.done + 1} מתוך ${R.total}`)}
      <div class="gm-body">
        <div class="gm-hud">
          <span class="gm-hud-i"><b>${S.pts}</b><i>ניקוד לתיק</i></span>
          <span class="gm-hud-i"><b>${S.opened.length}/6</b><i>רמזים פתוחים</i></span>
          <span class="gm-hud-i"><b>${R.score}</b><i>סה״כ</i></span>
        </div>
        ${feedback || ''}
        <div class="gm-clues">
          ${S.clues.map((c, i) => S.opened.includes(i) ? `
            <div class="gm-clue open">
              <div class="gm-clue-h"><span class="gm-ref">${c.s}</span><b>${esc(c.t)}</b><span class="gm-clue-e">${c.i}</span></div>
              <div class="gm-clue-b">${c.h}</div>
            </div>` : `
            <button class="gm-clue" data-c="${i}">
              <div class="gm-clue-h"><span class="gm-ref">${c.s}</span><b>${esc(c.t)}</b><span class="gm-cost">−14</span></div>
              <div class="gm-clue-b redacted">${'<span></span>'.repeat(6)}</div>
            </button>`).join('')}
        </div>
        <div class="gm-sec"><h4>שורת החשודים</h4>
          <div class="gm-lineup">${S.lineup.map(p => {
            const bad = S.wrong.includes(p.id);
            return `<button class="gm-sus ${bad ? 'bad' : ''}" data-s="${p.id}" ${bad ? 'disabled' : ''}>
              <b>${esc(p.k.name)}</b><i>${esc(p.k.alias || p.place || '')}</i>${bad ? '<span class="gm-no">✕</span>' : ''}</button>`;
          }).join('')}</div></div>
        <div class="gm-foot">כל הרמזים לקוחים מהתיק האמיתי בארכיון. השמות מושחרים — שאר המידע נכון.</div>
      </div>`);
    root.querySelectorAll('.gm-clue[data-c]').forEach(b => b.onclick = () => {
      S.opened.push(+b.dataset.c); S.pts = Math.max(10, S.pts - 14);
      if (navigator.vibrate) try { navigator.vibrate(10); } catch (e) {}
      solveView();
    });
    root.querySelectorAll('.gm-sus:not([disabled])').forEach(b => b.onclick = () => guess(b.dataset.s));
  }

  function guess(id) {
    const S = state.solve, R = state.run;
    if (id === S.answer.id) {
      R.score += S.pts; R.solved++; R.done++;
      if (window.track) try { window.track('game:solve:' + id); } catch (e) {}
      return solveDone(true);
    }
    S.wrong.push(id);
    S.pts = Math.max(10, S.pts - 25);
    const left = S.lineup.filter(p => !S.wrong.includes(p.id));
    if (left.length === 1) { R.done++; return solveDone(false); }
    const un = S.clues.map((_, i) => i).filter(i => !S.opened.includes(i));
    if (un.length) S.opened.push(un[0]);
    solveView(`<div class="gm-flash bad"><b>לא הוא.</b> נפתח לך רמז נוסף. ${left.length} חשודים נשארו.</div>`);
  }

  function solveDone(won) {
    const S = state.solve, R = state.run, k = S.answer.k;
    const last = R.done >= R.total;
    mount(`${nav('החקירה', `תיק ${R.done} מתוך ${R.total}`)}
      <div class="gm-body">
        <div class="gm-verdict ${won ? 'ok' : 'no'}">${won ? 'תיק נסגר' : 'התיק נשאר פתוח'}</div>
        <div class="gm-card">
          <div class="gm-stamp-row"><span class="gm-code">${esc(k.caseLabel || 'CASE FILE')}</span>
            ${won ? `<span class="gm-pct"><b>+${S.pts}</b></span>` : ''}</div>
          <h2>${esc(k.name)}</h2>
          ${k.alias ? `<div class="gm-alias">${esc(k.alias)}</div>` : ''}
          <p class="gm-line">${esc(strip(k.line).slice(0, 190))}…</p>
        </div>
        <div class="gm-acts">
          ${last ? '<button class="gm-btn primary" id="gm-fin">לסיכום החקירה</button>'
                 : '<button class="gm-btn primary" id="gm-next">התיק הבא ←</button>'}
          <button class="gm-btn" data-id="${k.id}">פתח את התיק המלא</button>
          <button class="gm-btn ghost" data-home>חדר המשחקים</button>
        </div>
      </div>`);
    bindOpen();
    const nx = root.querySelector('#gm-next'); if (nx) nx.onclick = nextCase;
    const fn = root.querySelector('#gm-fin');  if (fn) fn.onclick = solveSummary;
  }

  function solveSummary() {
    const R = state.run, avg = Math.round(R.score / R.total), rk = rankOf(avg);
    const txt = `פתרתי ${R.solved} מתוך ${R.total} תיקים ב"החקירה" של ארכיון הרצח. דרגה: ${rk[2]}. ${rk[1]}`;
    mount(`${nav('החקירה', 'סיכום')}
      <div class="gm-body">
        <div class="gm-rank">
          <div class="gm-rank-e">${rk[1]}</div>
          <div class="gm-rank-t"><b>${rk[2]}</b><i>${rk[3]}</i></div>
        </div>
        <div class="gm-hud big">
          <span class="gm-hud-i"><b>${R.solved}/${R.total}</b><i>תיקים שנסגרו</i></span>
          <span class="gm-hud-i"><b>${R.score}</b><i>ניקוד</i></span>
          <span class="gm-hud-i"><b>${avg}</b><i>ממוצע לתיק</i></span>
        </div>
        <div class="gm-acts">
          <button class="gm-btn primary" id="gm-again">חקירה חדשה</button>
          <button class="gm-btn" id="gm-share">שיתוף</button>
          <button class="gm-btn ghost" data-arch>חזרה לארכיון</button>
        </div>
        <div class="gm-foot">כל תיק שנפתח בארכיון מצטרף אוטומטית למאגר החקירות. ככל שהארכיון גדל — המשחק נעשה קשה יותר.</div>
      </div>`);
    root.querySelector('#gm-again').onclick = solveIntro;
    root.querySelector('#gm-share').onclick = () => share(txt);
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
