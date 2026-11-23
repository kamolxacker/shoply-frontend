/* ==========================================================================
   Shoply — topbar oynalari: yetkazib berish manzili, sotuvchi kirish/ro'yxat,
   ilova tayyorlanmoqda oynasi. Hamma sahifalarda ishlaydi (event delegation).
   ========================================================================== */

// Viloyatlar va tumanlar (O'zbekiston)
const REGIONS = [
  { name: "Toshkent shahri", districts: ["Bektemir", "Chilonzor", "Hamza", "Mirobod", "Mirzo Ulug'bek", "Olmazor", "Sergeli", "Shayxontohur", "Uchtepa", "Yakkasaroy", "Yunusobod", "Yashnobod"] },
  { name: "Qoraqalpog'iston Respublikasi", districts: ["Nukus", "Amudaryo", "Beruniy", "Chimboy", "Ellikqal'a", "Kegeyli", "Mo'ynoq", "Qanliko'l", "Qo'ng'irot", "Qorao'zak", "Shumanay", "Taxiatosh", "Taxtako'pir", "To'rtko'l", "Xo'jayli", "Bo'zatov"] },
  { name: "Toshkent viloyati", districts: ["Angren", "Bekobod", "Bo'stonliq", "Bo'ka", "Chinoz", "Qibray", "Oqqo'rg'on", "Ohangaron", "Olmaliq", "Parkent", "Piskent", "Quyichirchiq", "Yangiyo'l", "Yuqorichirchiq", "Zangiota", "O'rtachirchiq"] },
  { name: "Andijon viloyati", districts: ["Andijon", "Asaka", "Baliqchi", "Bo'z", "Buloqboshi", "Izboskan", "Jalaquduq", "Marhamat", "Oltinko'l", "Paxtaobod", "Qo'rg'ontepa", "Shahrixon", "Ulug'nor", "Xo'jaobod"] },
  { name: "Buxoro viloyati", districts: ["Buxoro", "G'ijduvon", "Jondor", "Kogon", "Olot", "Peshku", "Qorako'l", "Qorovulbozor", "Romitan", "Shofirkon", "Vobkent"] },
  { name: "Farg'ona viloyati", districts: ["Farg'ona", "Bag'dod", "Beshariq", "Bozorko'r", "Buvayda", "Dang'ara", "Furqat", "Marg'ilon", "Oltiariq", "Qo'qon", "Quva", "Quvasoy", "Rishton", "So'x", "Toshloq", "Uchko'prik", "O'zbekiston", "Yozyovon"] },
  { name: "Jizzax viloyati", districts: ["Jizzax", "Arnasoy", "Baxmal", "Do'stlik", "Forish", "G'allaorol", "Mirzacho'l", "Paxtakor", "Sharof Rashidov", "Yangiobod", "Zafarobod", "Zomin"] },
  { name: "Xorazm viloyati", districts: ["Urganch", "Bog'ot", "Gurlan", "Hazorasp", "Xiva", "Xonqa", "Qo'shko'pir", "Shovot", "Tuproqqal'a", "Urganch shahri", "Yangiariq", "Yangibozor"] },
  { name: "Namangan viloyati", districts: ["Namangan", "Chortoq", "Chust", "Kosonsoy", "Mingbuloq", "Norin", "Pop", "To'raqo'rg'on", "Uchqo'rg'on", "Uychi", "Yangiqo'rg'on"] },
  { name: "Navoiy viloyati", districts: ["Navoiy", "Konimex", "Karmana", "Navbahor", "Nurota", "Qiziltepa", "Tomdi", "Uchquduq", "Xatirchi", "Zarafshon"] },
  { name: "Qashqadaryo viloyati", districts: ["Qarshi", "Chiroqchi", "Dehqonobod", "G'uzor", "Kasbi", "Kitob", "Koson", "Mirishkor", "Muborak", "Nishon", "Qamashi", "Shahrisabz", "Yakkabog'"] },
  { name: "Samarqand viloyati", districts: ["Samarqand", "Bulung'ur", "Ishtixon", "Jomboy", "Kattaqo'rg'on", "Narpay", "Nurobod", "Oqdaryo", "Pastdarg'om", "Paxtachi", "Payariq", "Qo'shrabot", "Toyloq", "Urgut"] },
  { name: "Sirdaryo viloyati", districts: ["Guliston", "Boyovut", "Mirzaobod", "Oqoltin", "Sardoba", "Sayxunobod", "Shirin", "Sirdaryo", "Xovos", "Yangiyer"] },
  { name: "Surxondaryo viloyati", districts: ["Termiz", "Angor", "Bandixon", "Boysun", "Denov", "Jarqo'rg'on", "Qiziriq", "Qumqo'rg'on", "Muzrabot", "Oltinsoy", "Sariosiyo", "Sherobod", "Sho'rchi", "Uzun"] },
];

const POPUP_T = {
  uz: {
    regionTitle: "Yetkazib berish manzili", regionSub: "Viloyatni tanlang, so'ng tumanni", regions: "Viloyat", districts: "Tuman", pickRegion: "Avval viloyatni tanlang",
    sellerTitle: "Sotuvchi bo'lish", sellerSub: "Do'koningizni Shoply ga qo'shing va buyurtmalarni boshqaring", tabLogin: "Kirish", tabRegister: "Yangi hisob",
    phone: "Telefon", password: "Parol", name: "Ismingiz", shopName: "Do'kon nomi", loginBtn: "Kirish", registerBtn: "Hisob ochish",
    notSeller: "Bu hisob sotuvchi hisobi emas. Yangi sotuvchi hisobi oching.", appTitle: "Ilova hozir tayyorlanmoqda",
    appSub: "Shoply ilovasi tayyor bo'lganda sizga xabar beramiz. Telefon raqamingiz yoki email manzilingizni qoldiring.",
    contact: "Telefon yoki email", notifyBtn: "Tayyor bo'lganda xabar bering", notifyDone: "Rahmat! Ilova tayyor bo'lganda xabar beramiz.",
    close: "Yopish", locSaved: "Manzil saqlandi",
  },
  ru: {
    regionTitle: "Адрес доставки", regionSub: "Выберите область, затем район", regions: "Область", districts: "Район", pickRegion: "Сначала выберите область",
    sellerTitle: "Стать продавцом", sellerSub: "Добавьте магазин в Shoply и управляйте заказами", tabLogin: "Вход", tabRegister: "Новый аккаунт",
    phone: "Телефон", password: "Пароль", name: "Ваше имя", shopName: "Название магазина", loginBtn: "Войти", registerBtn: "Открыть аккаунт",
    notSeller: "Это не аккаунт продавца. Откройте новый аккаунт продавца.", appTitle: "Приложение готовится",
    appSub: "Мы сообщим вам, когда приложение Shoply будет готово. Оставьте телефон или email.",
    contact: "Телефон или email", notifyBtn: "Сообщить, когда будет готово", notifyDone: "Спасибо! Сообщим, когда приложение будет готово.",
    close: "Закрыть", locSaved: "Адрес сохранён",
  },
  en: {
    regionTitle: "Delivery address", regionSub: "Choose a region, then a district", regions: "Region", districts: "District", pickRegion: "Choose a region first",
    sellerTitle: "Become a seller", sellerSub: "Add your shop to Shoply and manage orders", tabLogin: "Sign in", tabRegister: "New account",
    phone: "Phone", password: "Password", name: "Your name", shopName: "Shop name", loginBtn: "Sign in", registerBtn: "Create account",
    notSeller: "This is not a seller account. Create a new seller account.", appTitle: "The app is being prepared",
    appSub: "We will notify you when the Shoply app is ready. Leave your phone or email.",
    contact: "Phone or email", notifyBtn: "Notify me when ready", notifyDone: "Thank you! We will notify you when the app is ready.",
    close: "Close", locSaved: "Address saved",
  },
};
function pT(key){
  const lang = getLang() === "uzc" ? "uz" : getLang();
  return (POPUP_T[lang] || POPUP_T.uz)[key] || POPUP_T.uz[key] || key;
}

/* ---------- yetkazib berish manzili (localStorage) ---------- */
function getSavedLocation(){
  try{ return JSON.parse(localStorage.getItem("ss_location")); }catch(e){ return null; }
}
function locationLabel(){
  const loc = getSavedLocation();
  if(!loc) return "📍 " + pT("regionTitle") + " · " + (pT("regionSub"));
  return "📍 " + loc.region + (loc.district ? " · " + loc.district : "");
}
function updateTopbarRegion(){
  const el = document.querySelector("[data-open-region]");
  if(el) el.textContent = locationLabel();
}

// media URL (yuklangan rasm — backend'dan to'liq manzil)
function mediaUrl(p){
  if(!p) return "";
  if(/^https?:\/\//.test(p)) return p;
  if(/^media\//.test(p)) return (window.SOTUV_API_BASE || "") + "/api/" + p;
  return p;
}

function closePopup(){
  document.querySelectorAll("[data-popup]").forEach(n => n.remove());
}
function popupShell(name, inner){
  closePopup();
  const wrap = document.createElement("div");
  wrap.className = "modal modal--open";
  wrap.setAttribute("data-popup", name);
  wrap.innerHTML = `<div class="modal__box modal__box--wide">
    <button type="button" class="modal__close" data-popup-close aria-label="${pT("close")}">✕</button>${inner}</div>`;
  document.body.appendChild(wrap);
  return wrap;
}

/* ---------- 1) manzil tanlash: viloyat → tuman ---------- */
function openRegionModal(){
  const saved = getSavedLocation();
  let active = saved ? REGIONS.findIndex(r => r.name === saved.region) : -1;
  const wrap = popupShell("region", `
    <h2 class="modal__title">${pT("regionTitle")}</h2>
    <p class="modal__subtitle">${pT("regionSub")}</p>
    <div class="loc-picker">
      <div class="loc-col"><div class="loc-col__title">${pT("regions")}</div><div class="loc-list" data-region-list></div></div>
      <div class="loc-col"><div class="loc-col__title">${pT("districts")}</div><div class="loc-list" data-district-list></div></div>
    </div>`);

  const regionList = wrap.querySelector("[data-region-list]");
  const districtList = wrap.querySelector("[data-district-list]");
  regionList.innerHTML = REGIONS.map((r, i) =>
    `<button type="button" class="loc-item ${i === active ? "loc-item--active" : ""}" data-region-index="${i}">${r.name}</button>`).join("");

  function showDistricts(i){
    active = i;
    regionList.querySelectorAll(".loc-item").forEach((b, j) => b.classList.toggle("loc-item--active", j === i));
    districtList.innerHTML = REGIONS[i].districts.map(d =>
      `<button type="button" class="loc-item ${saved && saved.district === d && saved.region === REGIONS[i].name ? "loc-item--selected" : ""}" data-district="${d}">${d}</button>`).join("");
  }
  if(active >= 0) showDistricts(active);
  else districtList.innerHTML = `<p class="loc-hint">${pT("pickRegion")}</p>`;

  regionList.addEventListener("click", (e)=>{
    const b = e.target.closest("[data-region-index]");
    if(b) showDistricts(Number(b.dataset.regionIndex));
  });
  districtList.addEventListener("click", (e)=>{
    const b = e.target.closest("[data-district]");
    if(!b || active < 0) return;
    localStorage.setItem("ss_location", JSON.stringify({ region: REGIONS[active].name, district: b.dataset.district }));
    updateTopbarRegion();
    closePopup();
    showToast(pT("locSaved"));
  });
}

/* ---------- 2) sotuvchi: kirish yoki yangi hisob ---------- */
function openSellerModal(startTab = "login", note = ""){
  const wrap = popupShell("seller", `
    <h2 class="modal__title">${pT("sellerTitle")}</h2>
    <p class="modal__subtitle">${pT("sellerSub")}</p>
    <div class="seller-tabs">
      <button type="button" class="seller-tab ${startTab === "login" ? "seller-tab--active" : ""}" data-seller-tab="login">${pT("tabLogin")}</button>
      <button type="button" class="seller-tab ${startTab === "register" ? "seller-tab--active" : ""}" data-seller-tab="register">${pT("tabRegister")}</button>
    </div>
    <div class="form-field__error seller-note" data-seller-note>${note}</div>
    <form data-seller-login ${startTab === "register" ? "hidden" : ""}>
      <div class="form-field"><label class="form-field__label">${pT("phone")}</label>
        <input type="tel" class="form-field__input" required placeholder="+998 90 123 45 67" name="phone"></div>
      <div class="form-field"><label class="form-field__label">${pT("password")}</label>
        <input type="password" class="form-field__input" required minlength="4" name="password"></div>
      <div class="form-field__error" data-seller-error></div>
      <button type="submit" class="btn btn--solid btn--block">${pT("loginBtn")}</button>
    </form>
    <form data-seller-register ${startTab === "login" ? "hidden" : ""}>
      <div class="form-field"><label class="form-field__label">${pT("shopName")}</label>
        <input type="text" class="form-field__input" required name="shopName"></div>
      <div class="form-field"><label class="form-field__label">${pT("name")}</label>
        <input type="text" class="form-field__input" required name="name"></div>
      <div class="form-field"><label class="form-field__label">${pT("phone")}</label>
        <input type="tel" class="form-field__input" required placeholder="+998 90 123 45 67" name="phone"></div>
      <div class="form-field"><label class="form-field__label">${pT("password")}</label>
        <input type="password" class="form-field__input" required minlength="4" name="password"></div>
      <div class="form-field__error" data-seller-error></div>
      <button type="submit" class="btn btn--solid btn--block">${pT("registerBtn")}</button>
    </form>`);

  const tabs = wrap.querySelectorAll("[data-seller-tab]");
  tabs.forEach(t => t.addEventListener("click", ()=>{
    const which = t.dataset.sellerTab;
    tabs.forEach(x => x.classList.toggle("seller-tab--active", x === t));
    wrap.querySelector("[data-seller-login]").hidden = which !== "login";
    wrap.querySelector("[data-seller-register]").hidden = which !== "register";
    wrap.querySelector("[data-seller-note]").textContent = "";
  }));

  const errorOf = (form) => form.querySelector("[data-seller-error]");

  wrap.querySelector("[data-seller-login]").addEventListener("submit", async (e)=>{
    e.preventDefault();
    const f = e.target; errorOf(f).textContent = "";
    try{
      const res = await apiRequest("/api/auth/login", { method: "POST", body: { phone: f.phone.value.trim(), password: f.password.value } });
      if(res.user.role !== "seller"){
        // sotuvchi bo'lmagan hisob — ro'yxatdan o'tish oynasiga yo'naltiramiz
        openSellerModal("register", pT("notSeller"));
        return;
      }
      setToken(res.token);
      location.href = withLangUrl("seller.html");
    }catch(err){ errorOf(f).textContent = err.message; }
  });

  wrap.querySelector("[data-seller-register]").addEventListener("submit", async (e)=>{
    e.preventDefault();
    const f = e.target; errorOf(f).textContent = "";
    try{
      const res = await apiRequest("/api/sellers/register", { method: "POST", body: {
        shopName: f.shopName.value.trim(), name: f.name.value.trim(),
        phone: f.phone.value.trim(), password: f.password.value } });
      setToken(res.token);
      location.href = withLangUrl("seller.html");
    }catch(err){ errorOf(f).textContent = err.message; }
  });
}

/* ---------- 3) ilova: tayyorlanmoqda + xabar berish ---------- */
function openAppModal(){
  const wrap = popupShell("app", `
    <h2 class="modal__title">${pT("appTitle")}</h2>
    <p class="modal__subtitle">${pT("appSub")}</p>
    <form data-app-form>
      <div class="form-field"><label class="form-field__label">${pT("contact")}</label>
        <input type="text" class="form-field__input" required name="contact"></div>
      <div class="form-field__error" data-app-error></div>
      <button type="submit" class="btn btn--solid btn--block">${pT("notifyBtn")}</button>
    </form>`);
  wrap.querySelector("[data-app-form]").addEventListener("submit", async (e)=>{
    e.preventDefault();
    const f = e.target; const err = f.querySelector("[data-app-error]"); err.textContent = "";
    try{
      await apiRequest("/api/app-notify", { method: "POST", body: { contact: f.contact.value.trim() } });
      f.innerHTML = `<p class="popup-done">${pT("notifyDone")}</p>`;
    }catch(e2){ err.textContent = e2.message; }
  });
}

/* ---------- ulanish: topbar tugmalari va yopish ---------- */
document.addEventListener("click", (e)=>{
  const open = e.target.closest("[data-open-region],[data-open-seller],[data-open-app]");
  if(open){
    e.preventDefault();
    if(open.hasAttribute("data-open-region")) openRegionModal();
    else if(open.hasAttribute("data-open-seller")) openSellerModal();
    else openAppModal();
    return;
  }
  if(e.target.closest("[data-popup-close]") || e.target.classList.contains("modal")) closePopup();
});

// sahifa yuklanganda manzil yorlig'ini qo'yish (header render bo'lgandan keyin ham ishlaydi)
document.addEventListener("DOMContentLoaded", updateTopbarRegion);
