# רצח · הארכיון

**ארכיון המאזינים של [פודקאסט רצח](https://open.spotify.com/show/0UvJ4TczaGA7oC3Bu8lYdt).**
לכל פרק — תיק אחד שמרכז את הראיות, הקורבנות, ציר הזמן, הסרטים הדוקומנטריים והמקורות שדובר עליהם.

🔗 **[retzach.dubelteam.com](https://retzach.dubelteam.com/)**

> פרויקט מחווה עצמאי ולא מסחרי. אינו מסונף לפודקאסט.
> התוכן המקורי, המחקר והעריכה שייכים למאיה גזית ושי מגל.

---

## מה יש בפנים

- **ארכיון** — כל הפרקים, חיפוש חופשי, סינון לפי עונה, סימון "תיק פתוח" מול "בקרוב"
- **עמוד תיק** בחמש לשוניות: התיק · הקורבנות · ראיות · ציר זמן · מקורות
- **מפת זירות** אינטראקטיבית (איפה שרלוונטי)
- **קלסר ראיות** — כל ראיה נפתחת ל־bottom sheet מלא
- **סרטים ודוקו** עם תג עלות: חינם / חינם עם פרסומות / בתשלום
- **נגן ספוטיפיי** מוטמע, PWA להתקנה למסך הבית, ועבודה אופליין אחרי ביקור ראשון

## סטאק

אין. HTML, CSS ו־JavaScript סטטיים, בלי build ובלי תלויות. הפונט היחיד שנטען מבחוץ הוא Rubik.

## מבנה

```
├── index.html                 מעטפת האפליקציה + מטא־תגיות ו־SEO
├── assets/
│   ├── style.css              עיצוב מלא (טוקנים, קומפוננטות, אנימציות)
│   ├── data.js                ← כל התוכן: פרקים, תיקים, ראיות, מקורות
│   └── app.js                 ראוטינג, רינדור, אינטראקציות
├── img/                       תמונות אמיתיות (ראו img/README.md)
├── icons/                     אייקוני PWA
├── manifest.webmanifest
├── sw.js                      service worker (offline)
├── vercel.json                headers + cache
├── robots.txt · sitemap.xml · og.png
```

## הרצה מקומית

```bash
python3 -m http.server 8080
# → http://localhost:8080
```

חובה להריץ דרך שרת (ולא לפתוח את הקובץ ישירות) כדי שה־service worker ונתיבי `/assets` יעבדו.

## דיפלוי ל־Vercel

1. `git push` לריפו ב־GitHub
2. ב־Vercel: **Add New → Project → Import** את הריפו
3. Framework Preset: **Other** · Build Command: *(ריק)* · Output Directory: `.`
4. **Settings → Domains** → `retzach.dubelteam.com` (רשומת CNAME ל־`cname.vercel-dns.com`)

זהו. אתר סטטי, בלי build step.

## הוספת תיק חדש

הכל ב־`assets/data.js`:

1. הוסיפו אובייקט תיק לפי המבנה של `DILLON` / `ZELICH`:
   `facts · story · quotes · victims · timeline · evidence · watch · links`
2. רשמו אותו ב־`const DB = { ... }`
3. ב־`EPISODES`, החליפו `id:null, ready:false` ב־`id:'<המזהה>', ready:true`
4. תמונות — ראו [`img/README.md`](img/README.md)

**כללי הדיוק של הארכיון:** כל עובדה מקושרת למקור בלשונית "מקורות"; כשמקורות חלוקים — מציגים את שני הנתונים; טענה שלא הוכחה בבית משפט מסומנת במפורש ככזו.

## תוכן ורישוי

הקוד והעיצוב © Dubel Team. תוכן הפרקים, השמות והמותג של הפודקאסט שייכים ליוצריו.
בקשת הסרה או תיקון — [dubelteam.com/contact](https://www.dubelteam.com/contact.html).

---

<div dir="ltr">

**Built by [DUBEL TEAM](https://www.dubelteam.com/)** — *Built by the brief. An operator.*
Founder-led operations, brand and digital products. Athens.

</div>
