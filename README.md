# khud0x — Ubaydullo Xudoyberdiev portfolio

Shaxsiy portfolio sayti. Loyiha React va Vite asosida qurilgan; foydalanuvchi tomonida ishlaydi va statik hostingga joylashtirilishi mumkin.

Sayt shiori:

> Tarmoqlar ortida yashirin dunyo. Baytlar gapiradi, kodlar esa sir saqlaydi.

## Mundarija

- [Imkoniyatlar](#imkoniyatlar)
- [Texnologiyalar](#texnologiyalar)
- [Loyiha tuzilishi](#loyiha-tuzilishi)
- [Talablar](#talablar)
- [Lokal ishga tushirish](#lokal-ishga-tushirish)
- [Test va production build](#test-va-production-build)
- [Hostingga joylashtirish](#hostingga-joylashtirish)
- [Kontent va sozlamalarni o‘zgartirish](#kontent-va-sozlamalarni-ozgartirish)
- [Aloqa formasi haqida](#aloqa-formasi-haqida)
- [Muammolarni bartaraf etish](#muammolarni-bartaraf-etish)

## Imkoniyatlar

- O‘zbek, rus, ingliz va tojik tillaridagi interfeys.
- Kunduzgi va tungi mavzular; til va mavzu tanlovi brauzer xotirasida saqlanadi.
- Turli ekran o‘lchamlariga moslashadigan, mobil qurilmalarda ham ishlaydigan dizayn.
- Portfolio bo‘limlari bo‘yicha qidiruv va sahifa ichidagi navigatsiya.
- Dumaloq `khud0x` logotipini bosganda profil suratini ko‘rsatadigan dialog.
- Loyiha, ko‘nikma va texnologiyalar, ijtimoiy tarmoqlar hamda aloqa bo‘limlari.
- Emailni nusxalash va xabarni email dasturida tayyorlab ochish.
- Vite orqali minifikatsiya qilingan, statik hostingga tayyor build.

## Texnologiyalar

- React 19
- Vite 6
- JavaScript (ES modules)
- CSS
- Node.js test runner

## Loyiha tuzilishi

```text
.
├── assets/                 # Manba logotipi va rasmlar
├── public/
│   └── assets/             # Build ichiga nusxalanadigan statik rasmlar
├── src/
│   ├── App.jsx             # Sahifa, tarjimalar bilan ishlash va interaktivlik
│   ├── contact.js          # Email xabarining mailto manzilini yaratish
│   ├── contact.test.js     # Aloqa xabari bo‘yicha testlar
│   └── main.jsx            # React ilovasining boshlang‘ich nuqtasi
├── translations.js         # O‘zbek, rus, ingliz va tojik tarjimalari
├── styles.css              # Dizayn, mavzular va moslashuvchan stillar
├── index.html              # Vite sahifa shabloni
├── package.json            # Buyruqlar va bog‘liqliklar
├── package-lock.json       # Bog‘liqliklarning aniq versiyalari
├── vite.config.js          # Vite build sozlamalari
└── README.md
```

`dist/` papkasi `npm run build` bajarilganda yaratiladi. Unga build natijalari yoziladi; odatda ushbu papka repozitoriyga qo‘shilmaydi.

## Talablar

- Node.js 18 yoki undan yangi versiya
- npm (Node.js bilan birga o‘rnatiladi)

Versiyalarni tekshirish:

```bash
node --version
npm --version
```

## Lokal ishga tushirish

Loyiha papkasida quyidagi buyruqlarni bajaring:

```bash
npm ci
npm run dev
```

Terminal ko‘rsatgan lokal manzilni brauzerda oching (odatda `http://localhost:5173`). Ishlab chiqish serverini to‘xtatish uchun terminalda `Ctrl+C` bosing.

`npm ci` o‘rniga `npm install` ham ishlatish mumkin; `npm ci` esa `package-lock.json` dagi versiyalarni aynan tiklaydi.

## Test va production build

Testlarni ishga tushirish:

```bash
npm test
```

Production build yaratish:

```bash
npm run build
```

Natija `dist/` papkasiga yoziladi. Buildni hostingga yuklashdan oldin lokal ko‘rish uchun:

```bash
npm run preview
```

Vite preview manzilini terminalda ko‘rsatadi (odatda `http://localhost:4173`). `preview` buyrug‘i production buildni tekshirish uchun; u production hosting serveri o‘rnini bosmaydi.

## Hostingga joylashtirish

1. Hostingga chiqarishdan oldin test va production buildni bajaring:

   ```bash
   npm test
   npm run build
   ```

2. `dist/` papkasi ichidagi **barcha fayl va papkalarni** hostingning sayt ildiziga yuklang. Masalan, cPanel hostingda bu ko‘pincha `public_html/` bo‘ladi.

3. Yuklangan joylashuv taxminan quyidagicha bo‘lishi kerak:

   ```text
   public_html/
   ├── index.html
   └── assets/
       ├── index-<hash>.js
       ├── index-<hash>.css
       ├── khud0x-mark.webp
       ├── ubaydullo.png
       └── ubaydullo-avatar.webp
   ```

   Fayl nomlaridagi `<hash>` build vaqtida Vite tomonidan yaratiladi. Ularni qo‘lda nomlamang yoki `index.html` dan alohida ko‘chirmang.

4. Domenni yoki hosting bergan manzilni brauzerda ochib, sahifa, rasmlar, til tanlash, mavzu tugmasi va aloqa havolalarini tekshiring.

### Netlify, Vercel yoki boshqa build hosting

Loyihani manba kodidan deploy qiladigan hostingda odatda quyidagi sozlamalar kerak:

- **Build command:** `npm run build`
- **Publish/output directory:** `dist`
- **Node.js:** 18 yoki undan yangi

### Subpapkaga joylashtirish

Vite `base: "./"` bilan sozlangan. Shu sababli build ichidagi JS, CSS va rasmlar nisbiy manzillar orqali yuklanadi; sayt domen ildizida ham, masalan `https://example.com/portfolio/` kabi subpapkada ham ishlashi kerak.

Saytni brauzerda `file://` orqali to‘g‘ridan-to‘g‘ri ochmang. Lokal tekshiruvda `npm run dev`, `npm run preview` yoki oddiy HTTP serverdan foydalaning.

## Kontent va sozlamalarni o‘zgartirish

- Tarjimalar va sahifadagi matnlar: `translations.js`
- Sahifa bo‘limlari, havolalar va interaktiv logika: `src/App.jsx`
- Ranglar, shriftlar, mobil ko‘rinish va tema stillari: `styles.css`
- Sayt sarlavhasi, tavsifi va boshlang‘ich HTML: `index.html`
- Sayt logotipi va suratlari: `public/assets/`
- Email manzili va `mailto:` xabarini yig‘ish: `src/contact.js`

Tarjimaga yangi matn qo‘shilganda uni mavjud to‘rtta til lug‘atiga ham kiriting. So‘ng `npm test` va `npm run build` bilan tekshiring. Fayllar `public/assets/` ichida saqlansa, buildda `dist/assets/` ichiga ko‘chadi.

Til va mavzu sozlamalari brauzer `localStorage` xotirasida mos ravishda `khud0x-language` va `khud0x-theme` kalitlari bilan saqlanadi. Foydalanuvchi brauzer xotirasini tozalasa, standart til va tungi mavzu qo‘llanadi.

## Aloqa formasi haqida

Aloqa formasi serverga yoki ma’lumotlar bazasiga yuborilmaydi. Yuborish tugmasi foydalanuvchining qurilmasida sozlangan email dasturini ochib, qabul qiluvchi, mavzu va xabarni oldindan to‘ldiradi. Email ilovasi sozlanmagan bo‘lsa, xabarni yuborish ishlamasligi mumkin.

Formani serverga yuborish, xabarlarni saqlash yoki emailni avtomatik jo‘natish kerak bo‘lsa, alohida backend yoki form xizmati ulash talab etiladi.

## Muammolarni bartaraf etish

- **Sahifa bo‘sh ko‘rinadi:** hostingdagi `index.html` va `assets/` bir xil deploy builddan ekanini tekshiring. Eski build fayllari qolgan bo‘lsa, ularni almashtirib, brauzer keshini yangilang.
- **Rasm yoki stillar ko‘rinmaydi:** `dist/` ichidagi barcha fayllar yuklanganini hamda `assets/` papkasi nomi va joylashuvi o‘zgarmaganini tekshiring.
- **Yangi o‘zgarishlar hostingda ko‘rinmaydi:** `npm run build` ni qayta bajaring va yangilangan `dist/` ichidagini joylang.
- **`npm ci` xato beradi:** Node.js versiyasi 18 yoki undan yuqori ekanini tekshiring. Keyin xatolik matnidagi sababni ko‘rib chiqing.
- **Email formasi email dasturini ochmaydi:** qurilmada standart email ilovasi yoki `mailto:` havolalarini ochadigan email xizmati sozlanganini tekshiring.
