/* ==========================================================================
   SOTUV SAYTI — Til tizimi (i18n)
   4 til: uz (lotin), uzc (Ўзбек, кирилл), ru (Русский), en (English)
   Til tanlangach sahifa qayta yuklanadi — shu bois barcha matnlar
   TRANSLATIONS lug'atidan to'g'ridan-to'g'ri o'qiladi va hech qanday
   eski/aralash holat qolmaydi.
   ========================================================================== */

const LANG_KEY = "ss_lang";
const LANGS = [
  { code: "uz",  label: "O'zbekcha",       short: "UZ" },
  { code: "uzc", label: "Ўзбекча",          short: "ЎЗ" },
  { code: "ru",  label: "Русский",          short: "РУ" },
  { code: "en",  label: "English",          short: "EN" },
];

// joriy tilni olish: avval URL (?lang=xx), keyin localStorage, aks holda uz
function getLang(){
  const fromUrl = new URLSearchParams(location.search).get("lang");
  if (LANGS.some(l => l.code === fromUrl)) {
    try{ localStorage.setItem(LANG_KEY, fromUrl); }catch(e){}
    return fromUrl;
  }
  const saved = localStorage.getItem(LANG_KEY);
  return LANGS.some(l => l.code === saved) ? saved : "uz";
}
// tilni almashtirish: URL oxiriga ?lang=xx qo'shiladi va sahifa shu manzilga o'tadi
function setLang(code){
  try{ localStorage.setItem(LANG_KEY, code); }
  catch(e){ console.warn("Sotuv Sayti: tilni saqlab bo'lmadi", e); }
  const url = new URL(location.href);
  url.searchParams.set("lang", code);
  location.href = url.toString();
}
// sahifa ichidagi ichki havolalarga joriy tilni qo'shish (?lang=xx saqlanib qolishi uchun)
function withLangLinks(root = document){
  const lang = getLang();
  root.querySelectorAll("a[href]").forEach(a => {
    const href = a.getAttribute("href");
    if (!href || /^(https?:|mailto:|tel:|#|javascript:)/.test(href)) return;
    const u = new URL(href, location.href);
    if (u.origin !== location.origin) return;
    u.searchParams.set("lang", lang);
    a.setAttribute("href", u.pathname.split("/").pop() + u.search + u.hash);
  });
}
// kalit bo'yicha tarjima
function t(key){
  const dict = TRANSLATIONS[getLang()] || TRANSLATIONS.uz;
  if(dict[key] !== undefined) return dict[key];
  return TRANSLATIONS.uz[key] !== undefined ? TRANSLATIONS.uz[key] : key;
}
// kategoriya nomini tarjima qilish
function tCat(catId){
  const dict = CATEGORY_NAMES[getLang()] || CATEGORY_NAMES.uz;
  return dict[catId] || catId;
}
// hero slaydlar tarjimasi
function tHero(){
  return HERO_TRANSLATIONS[getLang()] || HERO_TRANSLATIONS.uz;
}

/* -------------------------------------------------------------------- */
// kategoriya nomlari (4 tilda)
const CATEGORY_NAMES = {
  uz: {
    elektronika: "Elektronika", kiyim: "Kiyim-kechak", poyabzal: "Poyabzal",
    "uy-royozgor": "Uy va ro'zg'or", gozallik: "Go'zallik", bolalar: "Bolalar dunyosi",
    sport: "Sport va dam olish", avto: "Avto tovarlari", kitoblar: "Kitob va ofis",
    "oziq-ovqat": "Oziq-ovqat"
  },
  uzc: {
    elektronika: "Электроника", kiyim: "Кийим-кечак", poyabzal: "Пойабзал",
    "uy-royozgor": "Уй ва рўзғор", gozallik: "Гўзаллик", bolalar: "Болалар дунёси",
    sport: "Спорт ва дам олиш", avto: "Авто товарлари", kitoblar: "Китоб ва офис",
    "oziq-ovqat": "Озиқ-овқат"
  },
  ru: {
    elektronika: "Электроника", kiyim: "Одежда", poyabzal: "Обувь",
    "uy-royozgor": "Дом и быт", gozallik: "Красота", bolalar: "Детский мир",
    sport: "Спорт и отдых", avto: "Автотовары", kitoblar: "Книги и офис",
    "oziq-ovqat": "Продукты"
  },
  en: {
    elektronika: "Electronics", kiyim: "Clothing", poyabzal: "Footwear",
    "uy-royozgor": "Home & Living", gozallik: "Beauty", bolalar: "Kids World",
    sport: "Sport & Outdoors", avto: "Auto Goods", kitoblar: "Books & Office",
    "oziq-ovqat": "Groceries"
  }
};

/* -------------------------------------------------------------------- */
// hero slaydlar matni (4 tilda)
const HERO_TRANSLATIONS = {
  uz: [
    { eyebrow: "Kuzgi chegirmalar", title: "Sevimli mahsulotlaringizga −40% gacha chegirma",
      text: "Elektronika, kiyim va uy jihozlarida minglab mahsulot chegirmada. Faqat shu hafta oxirigacha.",
      price: "Chegirmalar 09:00 dan boshlanadi", cta: "Chegirmalarni ko'rish" },
    { eyebrow: "Yangi kolleksiya", title: "Kuz-qish fasli uchun yangi kiyimlar keldi",
      text: "Issiq va zamonaviy dizaynli kurtka, sviter va poyabzallar — barchasi bir joyda.",
      price: "Yangi mahsulotlar har kuni", cta: "Kolleksiyani ko'rish" },
    { eyebrow: "Tez yetkazib berish", title: "Toshkent bo'ylab 2 soat ichida yetkazamiz",
      text: "10 000 dan ortiq mahsulot uchun ekspress yetkazib berish xizmati endi mavjud.",
      price: "Bepul yetkazib berish 300 000 so'mdan", cta: "Xarid qilishni boshlash" }
  ],
  uzc: [
    { eyebrow: "Кузги чегирмалар", title: "Севимли маҳсулотларингизга −40% гача чегирма",
      text: "Электроника, кийим ва уй жиҳозларида минглаб маҳсулот чегирмада. Фақат шу ҳафта охиригача.",
      price: "Чегирмалар 09:00 дан бошланади", cta: "Чегирмаларни кўриш" },
    { eyebrow: "Янги коллекция", title: "Куз-қиш фасли учун янги кийимлар келди",
      text: "Иссиқ ва замонавий дизайнли куртка, свитер ва пойабзаллар — барчаси бир жойда.",
      price: "Янги маҳсулотлар ҳар куни", cta: "Коллекцияни кўриш" },
    { eyebrow: "Тез етказиб бериш", title: "Тошкент бўйлаб 2 соат ичида етказамиз",
      text: "10 000 дан ортиқ маҳсулот учун экспресс етказиб бериш хизмати энди мавжуд.",
      price: "Бепул етказиб бериш 300 000 сўмдан", cta: "Харид қилишни бошлаш" }
  ],
  ru: [
    { eyebrow: "Осенние скидки", title: "Скидки до −40% на любимые товары",
      text: "Тысячи товаров со скидкой в категориях электроника, одежда и товары для дома. Только до конца этой недели.",
      price: "Скидки начинаются с 09:00", cta: "Смотреть скидки" },
    { eyebrow: "Новая коллекция", title: "Новая осенне-зимняя коллекция одежды",
      text: "Тёплые и стильные куртки, свитеры и обувь — всё в одном месте.",
      price: "Новинки каждый день", cta: "Смотреть коллекцию" },
    { eyebrow: "Быстрая доставка", title: "Доставим по Ташкенту за 2 часа",
      text: "Экспресс-доставка теперь доступна для более чем 10 000 товаров.",
      price: "Бесплатная доставка от 300 000 сум", cta: "Начать покупки" }
  ],
  en: [
    { eyebrow: "Autumn deals", title: "Up to −40% off your favorite products",
      text: "Thousands of discounted items in electronics, clothing and home goods. This week only.",
      price: "Deals start at 09:00", cta: "View deals" },
    { eyebrow: "New collection", title: "New fall-winter clothing has arrived",
      text: "Warm, modern jackets, sweaters and footwear — all in one place.",
      price: "New arrivals every day", cta: "View collection" },
    { eyebrow: "Fast delivery", title: "We deliver across Tashkent in 2 hours",
      text: "Express delivery is now available for over 10,000 products.",
      price: "Free delivery from 300,000 soʻm", cta: "Start shopping" }
  ]
};

/* -------------------------------------------------------------------- */
// asosiy tarjima lug'ati (4 til)
const TRANSLATIONS = {

  uz: {
    topbarRegion: "📍 Toshkent shahri · Yetkazib berish manzilingizni tanlang",
    topbarSeller: "Sotuvchi bo'lish", topbarHelp: "Yordam markazi", topbarApp: "Ilovani yuklab olish",
    searchPlaceholder: "Mahsulot, brend yoki kategoriya qidirish...",
    navLogin: "Kirish", navFavorites: "Sevimlilar", navCart: "Savat",
    langSwitchLabel: "Til",

    catSectionEyebrow: "Bo'limlar", catSectionTitle: "Kategoriya bo'yicha xarid qiling",
    dealsEyebrow: "Chegirmadagi mahsulotlar", dealsTitle: "🔥 Kunning aksiyalari",
    newEyebrow: "Yangi kelganlar", newTitle: "✨ Yangi mahsulotlar",
    topEyebrow: "Xaridorlar tanlovi", topTitle: "⭐ Yuqori baholangan mahsulotlar",
    similarEyebrow: "O'xshash mahsulotlar", similarTitle: "Sizga yoqishi mumkin",
    viewAll: "Barchasini ko'rish →",

    banner1Title: "Birinchi xaridga −15% chegirma", banner1Text: "Ro'yxatdan o'ting va promo-kodni oling", banner1Cta: "Xarid qilish",
    banner2Title: "0% ulush to'lovi bilan xarid", banner2Text: "12 oygacha muddatli to'lov barcha mahsulotlarga", banner2Cta: "Batafsil",

    addToCart: "Savatga qo'shish", inCartLabel: "Savatda", freeShipping: "🚚 Bepul yetkazib berish",
    installmentMonth: "12 oyga: {v}/oy", badgeNew: "Yangi",

    home: "Bosh sahifa", catalogWord: "Katalog", allProducts: "Barcha mahsulotlar",
    searchResultsFor: '"{q}" bo\'yicha natijalar',

    filterPriceRange: "Narx oralig'i, so'm", filterFrom: "Dan", filterTo: "Gacha", filterApply: "Qo'llash",
    filterBrand: "Brend", filterRating: "Reyting", filterAndAbove: "va undan yuqori", filterAll: "Barchasi",
    filterOnlyDiscount: "Faqat chegirmadagilar",
    sortPopular: "Mashhurligi bo'yicha", sortPriceAsc: "Narx: arzondan qimmatga", sortPriceDesc: "Narx: qimmatdan arzonga",
    sortRating: "Reyting bo'yicha", sortNew: "Yangi mahsulotlar",
    resultCount: "{n} ta mahsulot topildi",
    notFoundTitle: "Hech narsa topilmadi", notFoundText: "Filtrlarni o'zgartirib ko'ring yoki qidiruv so'zini tekshiring.",
    showMore: "Yana ko'rsatish {n}", prevPage: "Orqaga", nextPage: "Oldinga", loading: "Yuklanmoqda...",
    chipSearch: 'Qidiruv: "{q}"', chipSale: "Chegirmada", chipRatingUp: "{n}★ va yuqori",

    pdDescription: "Tavsif", pdSpecs: "Xususiyatlari", pdReviews: "Xaridorlar sharhlari",
    pdBrand: "Brend", pdReviewsCount: "{n} ta sharh",
    buyNow: "Hoziroq sotib olish", addFav: "♡ Sevimlilarga qo'shish", inFav: "♥ Sevimlilarda",
    pieces: "dona", warranty: "Original mahsulot kafolati", fastShip: "Tez yetkazib berish",
    freeShip: "Bepul yetkazib berish", returnPolicy: "14 kun ichida qaytarish mumkin",
    discountLabel: "chegirma", installmentLabel: "12 oyga bo'lib to'lash: {v}/oy",
    productNotFound: "Mahsulot topilmadi", backToCatalog: "Katalogga qaytish",

    cartTitle: "Savat", cartEmptyTitle: "Savatingiz bo'sh", cartEmptyText: "Mahsulot qo'shish uchun katalogga o'ting.",
    startShopping: "Xarid qilishni boshlash", orderSummary: "Buyurtma xulosasi",
    productsCount: "Mahsulotlar ({n} dona)", discount: "Chegirma", shipping: "Yetkazib berish", free: "Bepul",
    promoPlaceholder: "Promo-kod", promoApply: "Qo'llash", total: "Jami",
    checkout: "Buyurtmani rasmiylashtirish", checkoutMsg: "Bu — namunaviy loyiha, to'lov tizimi ulanmagan 🙂",
    promoChecking: 'Promo-kod "{v}" tekshirilmoqda...', promoEmpty: "Promo-kodni kiriting",

    favTitle: "Sevimlilar", favEmptyTitle: "Sevimlilar ro'yxati bo'sh",
    favEmptyText: "Yoqqan mahsulotlarni yurak belgisi orqali shu yerga qo'shing.",
    viewCatalog: "Katalogni ko'rish", favItemsCount: "{n} ta mahsulot",

    loginWelcome: "Xush kelibsiz", loginWelcomeSub: "Hisobingizga kiring va xaridlaringizni kuzating",
    loginPhone: "Telefon raqam", loginPassword: "Parol", loginBtn: "Kirish",
    loginNoAccount: "Hisobingiz yo'qmi?", loginRegisterLink: "Ro'yxatdan o'tish",
    registerTitle: "Ro'yxatdan o'tish", registerSub: "Bir necha soniyada yangi hisob yarating",
    registerName: "Ism", registerBtn: "Ro'yxatdan o'tish",
    registerHaveAccount: "Hisobingiz bormi?", registerLoginLink: "Kirish",
    accountDefaultName: "Foydalanuvchi", logoutBtn: "Chiqish",
    loginSuccess: "Muvaffaqiyatli kirdingiz", registerSuccess: "Hisobingiz yaratildi, xush kelibsiz!",
    logoutMsg: "Hisobdan chiqdingiz", loginErrorMsg: "Iltimos, ma'lumotlarni to'liq kiriting",

    toastAddCart: "Mahsulot savatga qo'shildi", toastRemoveCart: "Mahsulot savatdan olib tashlandi",
    toastAddFav: "Sevimlilarga qo'shildi", toastRemoveFav: "Sevimlilardan olib tashlandi",
    imgSlotLabel: "Rasm shu yerga qo'yiladi",
    closeLabel: "Yopish",

    footerAboutText: "O'zbekistondagi eng qulay onlayn savdo maydonchasi — minglab mahsulot, tez yetkazib berish va ishonchli xarid tajribasi.",
    footerCustomers: "Xaridorlarga", footerCompany: "Kompaniya", footerHelp: "Yordam", footerContact: "Aloqa",
    footerAboutUs: "Biz haqimizda", footerVacancies: "Vakansiyalar", footerOffer: "Ommaviy oferta", footerPrivacy: "Maxfiylik siyosati",
    footerFaq: "Ko'p so'raladigan savollar", footerReturns: "Qaytarish shartlari", footerDelivery: "Yetkazib berish", footerContactUs: "Bog'lanish",
    footerTrackOrder: "Buyurtmani kuzatish",
    footerRights: "© 2026 Sotuv Sayti. Barcha huquqlar himoyalangan.",
    footerDemo: "Namunaviy o'quv loyihasi — haqiqiy to'lov tizimi bilan bog'lanmagan.",
    currencySom: "so'm"
  },

  uzc: {
    topbarRegion: "📍 Тошкент шаҳри · Етказиб бериш манзилингизни танланг",
    topbarSeller: "Сотувчи бўлиш", topbarHelp: "Ёрдам маркази", topbarApp: "Иловани юклаб олиш",
    searchPlaceholder: "Маҳсулот, бренд ёки категория қидириш...",
    navLogin: "Кириш", navFavorites: "Севимлилар", navCart: "Сават",
    langSwitchLabel: "Тил",

    catSectionEyebrow: "Бўлимлар", catSectionTitle: "Категория бўйича харид қилинг",
    dealsEyebrow: "Чегирмадаги маҳсулотлар", dealsTitle: "🔥 Куннинг акциялари",
    newEyebrow: "Янги келганлар", newTitle: "✨ Янги маҳсулотлар",
    topEyebrow: "Харидорлар танлови", topTitle: "⭐ Юқори баҳоланган маҳсулотлар",
    similarEyebrow: "Ўхшаш маҳсулотлар", similarTitle: "Сизга ёқиши мумкин",
    viewAll: "Барчасини кўриш →",

    banner1Title: "Биринчи харидга −15% чегирма", banner1Text: "Рўйхатдан ўтинг ва промо-кодни олинг", banner1Cta: "Харид қилиш",
    banner2Title: "0% улуш тўлови билан харид", banner2Text: "12 ойгача муддатли тўлов барча маҳсулотларга", banner2Cta: "Батафсил",

    addToCart: "Саватга қўшиш", inCartLabel: "Саватда", freeShipping: "🚚 Бепул етказиб бериш",
    installmentMonth: "12 ойга: {v}/ой", badgeNew: "Янги",

    home: "Бош саҳифа", catalogWord: "Каталог", allProducts: "Барча маҳсулотлар",
    searchResultsFor: '"{q}" бўйича натижалар',

    filterPriceRange: "Нарх оралиғи, сўм", filterFrom: "Дан", filterTo: "Гача", filterApply: "Қўллаш",
    filterBrand: "Бренд", filterRating: "Рейтинг", filterAndAbove: "ва ундан юқори", filterAll: "Барчаси",
    filterOnlyDiscount: "Фақат чегирмадагилар",
    sortPopular: "Машҳурлиги бўйича", sortPriceAsc: "Нарх: арзондан қимматга", sortPriceDesc: "Нарх: қимматдан арзонга",
    sortRating: "Рейтинг бўйича", sortNew: "Янги маҳсулотлар",
    resultCount: "{n} та маҳсулот топилди",
    notFoundTitle: "Ҳеч нарса топилмади", notFoundText: "Филтрларни ўзгартириб кўринг ёки қидирув сўзини текширинг.",
    showMore: "Яна кўрсатиш {n}", prevPage: "Орқага", nextPage: "Олдинга", loading: "Юкланмоқда...",
    chipSearch: '«{q}» қидируви', chipSale: "Чегирмада", chipRatingUp: "{n}★ ва юқори",

    pdDescription: "Тавсиф", pdSpecs: "Хусусиятлари", pdReviews: "Харидорлар шарҳлари",
    pdBrand: "Бренд", pdReviewsCount: "{n} та шарҳ",
    buyNow: "Ҳозироқ сотиб олиш", addFav: "♡ Севимлиларга қўшиш", inFav: "♥ Севимлиларда",
    pieces: "дона", warranty: "Оригинал маҳсулот кафолати", fastShip: "Тез етказиб бериш",
    freeShip: "Бепул етказиб бериш", returnPolicy: "14 кун ичида қайтариш мумкин",
    discountLabel: "чегирма", installmentLabel: "12 ойга бўлиб тўлаш: {v}/ой",
    productNotFound: "Маҳсулот топилмади", backToCatalog: "Каталогга қайтиш",

    cartTitle: "Сават", cartEmptyTitle: "Саватингиз бўш", cartEmptyText: "Маҳсулот қўшиш учун каталогга ўтинг.",
    startShopping: "Харид қилишни бошлаш", orderSummary: "Буюртма хулосаси",
    productsCount: "Маҳсулотлар ({n} дона)", discount: "Чегирма", shipping: "Етказиб бериш", free: "Бепул",
    promoPlaceholder: "Промо-код", promoApply: "Қўллаш", total: "Жами",
    checkout: "Буюртмани расмийлаштириш", checkoutMsg: "Бу — намунавий лойиҳа, тўлов тизими уланмаган 🙂",
    promoChecking: '«{v}» промо-коди текширилмоқда...', promoEmpty: "Промо-кодни киритинг",

    favTitle: "Севимлилар", favEmptyTitle: "Севимлилар рўйхати бўш",
    favEmptyText: "Ёққан маҳсулотларни юрак белгиси орқали шу ерга қўшинг.",
    viewCatalog: "Каталогни кўриш", favItemsCount: "{n} та маҳсулот",

    loginWelcome: "Хуш келибсиз", loginWelcomeSub: "Ҳисобингизга киринг ва харидларингизни кузатинг",
    loginPhone: "Телефон рақам", loginPassword: "Парол", loginBtn: "Кириш",
    loginNoAccount: "Ҳисобингиз йўқми?", loginRegisterLink: "Рўйхатдан ўтиш",
    registerTitle: "Рўйхатдан ўтиш", registerSub: "Бир неча сонияда янги ҳисоб яратинг",
    registerName: "Исм", registerBtn: "Рўйхатдан ўтиш",
    registerHaveAccount: "Ҳисобингиз борми?", registerLoginLink: "Кириш",
    accountDefaultName: "Фойдаланувчи", logoutBtn: "Чиқиш",
    loginSuccess: "Муваффақиятли кирдингиз", registerSuccess: "Ҳисобингиз яратилди, хуш келибсиз!",
    logoutMsg: "Ҳисобдан чиқдингиз", loginErrorMsg: "Илтимос, маълумотларни тўлиқ киритинг",

    toastAddCart: "Маҳсулот саватга қўшилди", toastRemoveCart: "Маҳсулот саватдан олиб ташланди",
    toastAddFav: "Севимлиларга қўшилди", toastRemoveFav: "Севимлилардан олиб ташланди",
    imgSlotLabel: "Расм шу ерга қўйилади",
    closeLabel: "Ёпиш",

    footerAboutText: "Ўзбекистондаги энг қулай онлайн савдо майдончаси — минглаб маҳсулот, тез етказиб бериш ва ишончли харид тажрибаси.",
    footerCustomers: "Харидорларга", footerCompany: "Компания", footerHelp: "Ёрдам", footerContact: "Алоқа",
    footerAboutUs: "Биз ҳақимизда", footerVacancies: "Вакансиялар", footerOffer: "Оммавий оферта", footerPrivacy: "Махфийлик сиёсати",
    footerFaq: "Кўп сораладиган саволлар", footerReturns: "Қайтариш шартлари", footerDelivery: "Етказиб бериш", footerContactUs: "Боғланиш",
    footerTrackOrder: "Буюртмани кузатиш",
    footerRights: "© 2026 Сотув Сайти. Барча ҳуқуқлар ҳимояланган.",
    footerDemo: "Намунавий ўқув лойиҳаси — ҳақиқий тўлов тизими билан боғланмаган.",
    currencySom: "сўм"
  },

  ru: {
    topbarRegion: "📍 г. Ташкент · Выберите адрес доставки",
    topbarSeller: "Стать продавцом", topbarHelp: "Центр помощи", topbarApp: "Скачать приложение",
    searchPlaceholder: "Поиск товара, бренда или категории...",
    navLogin: "Войти", navFavorites: "Избранное", navCart: "Корзина",
    langSwitchLabel: "Язык",

    catSectionEyebrow: "Разделы", catSectionTitle: "Покупайте по категориям",
    dealsEyebrow: "Товары со скидкой", dealsTitle: "🔥 Акции дня",
    newEyebrow: "Новинки", newTitle: "✨ Новые товары",
    topEyebrow: "Выбор покупателей", topTitle: "⭐ Товары с высоким рейтингом",
    similarEyebrow: "Похожие товары", similarTitle: "Вам может понравиться",
    viewAll: "Смотреть все →",

    banner1Title: "−15% на первую покупку", banner1Text: "Зарегистрируйтесь и получите промокод", banner1Cta: "Купить",
    banner2Title: "Покупка без первого взноса", banner2Text: "Рассрочка до 12 месяцев на все товары", banner2Cta: "Подробнее",

    addToCart: "В корзину", inCartLabel: "В корзине", freeShipping: "🚚 Бесплатная доставка",
    installmentMonth: "На 12 мес.: {v}/мес", badgeNew: "Новинка",

    home: "Главная", catalogWord: "Каталог", allProducts: "Все товары",
    searchResultsFor: 'Результаты по запросу «{q}»',

    filterPriceRange: "Диапазон цен, сум", filterFrom: "От", filterTo: "До", filterApply: "Применить",
    filterBrand: "Бренд", filterRating: "Рейтинг", filterAndAbove: "и выше", filterAll: "Все",
    filterOnlyDiscount: "Только со скидкой",
    sortPopular: "По популярности", sortPriceAsc: "Цена: сначала дешевле", sortPriceDesc: "Цена: сначала дороже",
    sortRating: "По рейтингу", sortNew: "Новые товары",
    resultCount: "Найдено товаров: {n}",
    notFoundTitle: "Ничего не найдено", notFoundText: "Попробуйте изменить фильтры или проверьте текст запроса.",
    showMore: "Показать ещё {n}", prevPage: "Назад", nextPage: "Вперёд", loading: "Загрузка...",
    chipSearch: 'Поиск: «{q}»', chipSale: "Со скидкой", chipRatingUp: "{n}★ и выше",

    pdDescription: "Описание", pdSpecs: "Характеристики", pdReviews: "Отзывы покупателей",
    pdBrand: "Бренд", pdReviewsCount: "{n} отзывов",
    buyNow: "Купить сейчас", addFav: "♡ В избранное", inFav: "♥ В избранном",
    pieces: "шт.", warranty: "Гарантия оригинальности товара", fastShip: "Быстрая доставка",
    freeShip: "Бесплатная доставка", returnPolicy: "Возврат в течение 14 дней",
    discountLabel: "скидка", installmentLabel: "Рассрочка на 12 мес.: {v}/мес",
    productNotFound: "Товар не найден", backToCatalog: "Вернуться в каталог",

    cartTitle: "Корзина", cartEmptyTitle: "Ваша корзина пуста", cartEmptyText: "Перейдите в каталог, чтобы добавить товары.",
    startShopping: "Начать покупки", orderSummary: "Итог заказа",
    productsCount: "Товары ({n} шт.)", discount: "Скидка", shipping: "Доставка", free: "Бесплатно",
    promoPlaceholder: "Промокод", promoApply: "Применить", total: "Итого",
    checkout: "Оформить заказ", checkoutMsg: "Это демонстрационный проект, оплата не подключена 🙂",
    promoChecking: 'Проверяем промокод «{v}»...', promoEmpty: "Введите промокод",

    favTitle: "Избранное", favEmptyTitle: "Список избранного пуст",
    favEmptyText: "Добавляйте понравившиеся товары значком сердца.",
    viewCatalog: "Смотреть каталог", favItemsCount: "Товаров: {n}",

    loginWelcome: "Добро пожаловать", loginWelcomeSub: "Войдите в аккаунт и отслеживайте покупки",
    loginPhone: "Номер телефона", loginPassword: "Пароль", loginBtn: "Войти",
    loginNoAccount: "Нет аккаунта?", loginRegisterLink: "Зарегистрироваться",
    registerTitle: "Регистрация", registerSub: "Создайте новый аккаунт за пару секунд",
    registerName: "Имя", registerBtn: "Зарегистрироваться",
    registerHaveAccount: "Уже есть аккаунт?", registerLoginLink: "Войти",
    accountDefaultName: "Пользователь", logoutBtn: "Выйти",
    loginSuccess: "Вы успешно вошли", registerSuccess: "Аккаунт создан, добро пожаловать!",
    logoutMsg: "Вы вышли из аккаунта", loginErrorMsg: "Пожалуйста, заполните все поля",

    toastAddCart: "Товар добавлен в корзину", toastRemoveCart: "Товар удалён из корзины",
    toastAddFav: "Добавлено в избранное", toastRemoveFav: "Удалено из избранного",
    imgSlotLabel: "Здесь будет изображение",
    closeLabel: "Закрыть",

    footerAboutText: "Самая удобная онлайн-площадка Узбекистана — тысячи товаров, быстрая доставка и надёжные покупки.",
    footerCustomers: "Покупателям", footerCompany: "Компания", footerHelp: "Помощь", footerContact: "Контакты",
    footerAboutUs: "О нас", footerVacancies: "Вакансии", footerOffer: "Публичная оферта", footerPrivacy: "Политика конфиденциальности",
    footerFaq: "Частые вопросы", footerReturns: "Условия возврата", footerDelivery: "Доставка", footerContactUs: "Связаться",
    footerTrackOrder: "Отследить заказ",
    footerRights: "© 2026 Sotuv Sayti. Все права защищены.",
    footerDemo: "Демонстрационный учебный проект — реальная система оплаты не подключена.",
    currencySom: "сум"
  },

  en: {
    topbarRegion: "📍 Tashkent · Choose your delivery address",
    topbarSeller: "Become a seller", topbarHelp: "Help center", topbarApp: "Download the app",
    searchPlaceholder: "Search products, brands or categories...",
    navLogin: "Sign in", navFavorites: "Favorites", navCart: "Cart",
    langSwitchLabel: "Language",

    catSectionEyebrow: "Sections", catSectionTitle: "Shop by category",
    dealsEyebrow: "Discounted products", dealsTitle: "🔥 Deals of the day",
    newEyebrow: "New arrivals", newTitle: "✨ New products",
    topEyebrow: "Customer picks", topTitle: "⭐ Top rated products",
    similarEyebrow: "Similar products", similarTitle: "You might also like",
    viewAll: "View all →",

    banner1Title: "−15% off your first purchase", banner1Text: "Sign up and get a promo code", banner1Cta: "Shop now",
    banner2Title: "Buy with 0% down payment", banner2Text: "Installments up to 12 months on all products", banner2Cta: "Learn more",

    addToCart: "Add to cart", inCartLabel: "In cart", freeShipping: "🚚 Free shipping",
    installmentMonth: "12 mo.: {v}/mo", badgeNew: "New",

    home: "Home", catalogWord: "Catalog", allProducts: "All products",
    searchResultsFor: 'Results for "{q}"',

    filterPriceRange: "Price range, soʻm", filterFrom: "From", filterTo: "To", filterApply: "Apply",
    filterBrand: "Brand", filterRating: "Rating", filterAndAbove: "and up", filterAll: "All",
    filterOnlyDiscount: "Discounted only",
    sortPopular: "Popularity", sortPriceAsc: "Price: low to high", sortPriceDesc: "Price: high to low",
    sortRating: "Rating", sortNew: "New products",
    resultCount: "{n} products found",
    notFoundTitle: "Nothing found", notFoundText: "Try changing the filters or check your search term.",
    showMore: "Show {n} more", prevPage: "Back", nextPage: "Next", loading: "Loading...",
    chipSearch: 'Search: "{q}"', chipSale: "On sale", chipRatingUp: "{n}★ and up",

    pdDescription: "Description", pdSpecs: "Specifications", pdReviews: "Customer reviews",
    pdBrand: "Brand", pdReviewsCount: "{n} reviews",
    buyNow: "Buy now", addFav: "♡ Add to favorites", inFav: "♥ In favorites",
    pieces: "pcs", warranty: "Genuine product guarantee", fastShip: "Fast delivery",
    freeShip: "Free delivery", returnPolicy: "Returns accepted within 14 days",
    discountLabel: "discount", installmentLabel: "12-month installment: {v}/mo",
    productNotFound: "Product not found", backToCatalog: "Back to catalog",

    cartTitle: "Cart", cartEmptyTitle: "Your cart is empty", cartEmptyText: "Go to the catalog to add products.",
    startShopping: "Start shopping", orderSummary: "Order summary",
    productsCount: "Products ({n})", discount: "Discount", shipping: "Shipping", free: "Free",
    promoPlaceholder: "Promo code", promoApply: "Apply", total: "Total",
    checkout: "Checkout", checkoutMsg: "This is a demo project, payment isn't connected 🙂",
    promoChecking: 'Checking promo code "{v}"...', promoEmpty: "Enter a promo code",

    favTitle: "Favorites", favEmptyTitle: "Your favorites list is empty",
    favEmptyText: "Add products you like using the heart icon.",
    viewCatalog: "Browse catalog", favItemsCount: "{n} products",

    loginWelcome: "Welcome back", loginWelcomeSub: "Sign in to your account to track your orders",
    loginPhone: "Phone number", loginPassword: "Password", loginBtn: "Sign in",
    loginNoAccount: "Don't have an account?", loginRegisterLink: "Sign up",
    registerTitle: "Create account", registerSub: "Set up a new account in seconds",
    registerName: "Name", registerBtn: "Sign up",
    registerHaveAccount: "Already have an account?", registerLoginLink: "Sign in",
    accountDefaultName: "Customer", logoutBtn: "Log out",
    loginSuccess: "You're signed in", registerSuccess: "Account created, welcome!",
    logoutMsg: "You've been logged out", loginErrorMsg: "Please fill in all fields",

    toastAddCart: "Product added to cart", toastRemoveCart: "Product removed from cart",
    toastAddFav: "Added to favorites", toastRemoveFav: "Removed from favorites",
    imgSlotLabel: "Image goes here",
    closeLabel: "Close",

    footerAboutText: "Uzbekistan's most convenient online marketplace — thousands of products, fast delivery and a trustworthy shopping experience.",
    footerCustomers: "For customers", footerCompany: "Company", footerHelp: "Help", footerContact: "Contact",
    footerAboutUs: "About us", footerVacancies: "Careers", footerOffer: "Public offer", footerPrivacy: "Privacy policy",
    footerFaq: "FAQ", footerReturns: "Return policy", footerDelivery: "Delivery", footerContactUs: "Contact us",
    footerTrackOrder: "Track order",
    footerRights: "© 2026 Sotuv Sayti. All rights reserved.",
    footerDemo: "Demo learning project — not connected to a real payment system.",
    currencySom: "soʻm"
  }
};

/* Yordamchi: matndagi {q}/{n}/{v} kabi joy egallovchilarni almashtiradi */
// joy egallovchili tarjima ({q}, {n} va h.k.)
function tf(key, params={}){
  let str = t(key);
  Object.keys(params).forEach(k => { str = str.replace(`{${k}}`, params[k]); });
  return str;
}

/* -------------------------------------------------------------------- */
// kunduzgi / tungi rejim (localStorage'da saqlanadi)
const THEME_KEY = "ss_theme";
function getTheme(){
  try{ return localStorage.getItem(THEME_KEY) === "dark" ? "dark" : "light"; }
  catch(e){ return "light"; }
}
function applyTheme(theme){
  document.documentElement.setAttribute("data-theme", theme);
}
function toggleTheme(){
  const next = getTheme() === "dark" ? "light" : "dark";
  try{ localStorage.setItem(THEME_KEY, next); }catch(e){}
  applyTheme(next);
  return next;
}
