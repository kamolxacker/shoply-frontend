/* ==========================================================================
   SOTUV SAYTI — umumiy skript (backend API bilan ishlaydi)
   Barcha sahifalarda ishlaydigan: header, katalog mega-menyu, savat,
   sevimlilar, login, qidiruv taklifi, toast xabarlar, rasm fallback.
   Holat backend'dagi SQLite bazasida saqlanadi (mehmonlar uchun sessiya
   ID orqali, ro'yxatdan o'tganlar uchun hisob orqali).
   ========================================================================== */

/* ---------- Joriy holat keshi (UI tez ishlashi uchun) ---------- */
let CART_QTY = {};        // { productId: qty }
let FAV_SET = new Set();  // productId lar to'plami
let CURRENT_USER = null;  // { id, name, phone } yoki null

// savatdagi jami mahsulot soni
function cartCount(){ return Object.values(CART_QTY).reduce((a,b)=>a+b,0); }
// sevimlilar soni
function favCount(){ return FAV_SET.size; }

// header'dagi savat/sevimlilar belgichalarini yangilash
function updateHeaderBadges(){
  const cartBadge = document.querySelector("[data-cart-badge]");
  const favBadge = document.querySelector("[data-fav-badge]");
  const c = cartCount(), f = favCount();
  if(cartBadge){ cartBadge.textContent = c; cartBadge.style.display = c ? "flex" : "none"; }
  if(favBadge){ favBadge.textContent = f; favBadge.style.display = f ? "flex" : "none"; }
}

/** Sahifa ochilganda savat/sevimlilar/foydalanuvchi holatini backend'dan yuklaydi */
// savat/sevimlilar/foydalanuvchini backend'dan yuklash
async function bootstrapUserState(){
  const token = getToken();
  if(token){
    try{
      const { user } = await Api.me();
      CURRENT_USER = user;
    }catch(e){
      setToken(null);
      CURRENT_USER = null;
    }
  }
  try{
    const cart = await Api.getCart();
    CART_QTY = {};
    cart.items.forEach(i => { CART_QTY[i.product.id] = i.qty; });
  }catch(e){ console.warn("Savatni yuklab bo'lmadi:", e.message); }
  try{
    const favs = await Api.getFavorites();
    FAV_SET = new Set(favs.map(p => p.id));
  }catch(e){ console.warn("Sevimlilarni yuklab bo'lmadi:", e.message); }
  updateHeaderBadges();
}

/** Savatga qo'shish — optimistik UI + backend bilan sinxronlash */
// savatga qo'shish
async function addToCart(id, qty=1){
  try{
    const cart = await Api.addCartItem(Number(id), qty);
    CART_QTY = {};
    cart.items.forEach(i => { CART_QTY[i.product.id] = i.qty; });
    updateHeaderBadges();
    showToast(t("toastAddCart"));
    return true;
  }catch(e){
    showToast(e.message);
    return false;
  }
}

/** Sevimlilarga qo'shish/olib tashlash (toggle) */
// sevimlilarga qo'shish/olib tashlash
async function toggleFavoriteRemote(id){
  try{
    const { active } = await Api.toggleFavorite(Number(id));
    if(active) FAV_SET.add(Number(id)); else FAV_SET.delete(Number(id));
    updateHeaderBadges();
    return active;
  }catch(e){
    showToast(e.message);
    return FAV_SET.has(Number(id));
  }
}

/* ---------- Toast xabar ---------- */

/* ---------- Rasm o'rniga placeholder (fayl topilmasa) ---------- */
// rasm topilmasa placeholder ko'rsatish
function handleImgError(imgEl){
  const slot = document.createElement("div");
  slot.className = "img-placeholder";
  slot.innerHTML = `
    <svg class="img-placeholder__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>
    <span class="img-placeholder__label">${t("imgSlotLabel")}</span>`;
  if(imgEl && imgEl.parentNode){
    imgEl.replaceWith(slot);
  }
}
// rasmlarga fallback ulash
function attachImgFallback(root=document){
  root.querySelectorAll("img[data-fallback]").forEach(img=>{
    img.addEventListener("error", ()=> handleImgError(img), { once: true });
  });
}

/* ---------- Header: HTML shablon ---------- */
// header HTML shablon
function headerTemplate(categories, megaMenu, activePage=""){
  const curLang = LANGS.find(l => l.code === getLang());
  const langOptions = LANGS.map(l => `
    <button type="button" class="lang-switcher__option ${l.code===curLang.code?'lang-switcher__option--active':''}" data-lang-option="${l.code}">
      <span class="lang-switcher__code">${l.short}</span> ${l.label}
    </button>`).join("");

  return `
  <div class="topbar">
    <div class="container">
      <button type="button" class="topbar__region topbar__region--btn" data-open-region>${locationLabel()}</button>
      <div class="topbar__links">
        <a class="topbar__link" href="#" data-open-seller>${t("topbarSeller")}</a>
        <a class="topbar__link" href="contact.html">${t("topbarHelp")}</a>
        <a class="topbar__link" href="#" data-open-app>${t("topbarApp")}</a>
      </div>
    </div>
  </div>
  <header class="header">
    <div class="container header__inner">
      <a href="index.html" class="logo" aria-label="Shoply">
        <img class="logo__img" src="images/logo.png" alt="Shoply">
      </a>
      ${catalogMenuTemplate(categories, megaMenu)}
      <form class="search" role="search" data-search-form autocomplete="off">
        <input type="text" name="q" class="search__input" placeholder="${t("searchPlaceholder")}" data-search-input>
        <button type="submit" class="search__submit" aria-label="${t("searchPlaceholder")}">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>
        </button>
        <div class="search__suggest" data-search-suggest></div>
      </form>
      <div class="header__actions">
        <button type="button" class="icon-btn icon-btn--theme" data-theme-toggle aria-label="${getTheme()==="dark" ? "Kunduzgi rejim" : "Tungi rejim"}">
          <svg class="icon-btn__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" data-theme-icon>${getTheme()==="dark" ? '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>' : '<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/>'}</svg>
        </button>
        <div class="lang-switcher">
          <button class="icon-btn" type="button" data-lang-toggle aria-haspopup="true" aria-expanded="false">
            <svg class="icon-btn__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3c2.5 2.6 3.8 5.8 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.8-3.8-9S9.5 5.6 12 3z"/></svg>
            <span>${curLang.short}</span>
          </button>
          <div class="lang-switcher__menu" data-lang-menu>${langOptions}</div>
        </div>
        <button type="button" class="icon-btn" data-login-open>
          <svg class="icon-btn__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4.5 5-6 8-6s6.5 1.5 8 6"/></svg>
          <span class="icon-btn__label" data-account-label>${t("navLogin")}</span>
        </button>
        <a class="icon-btn" href="favorites.html">
          <svg class="icon-btn__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 21s-7.5-4.6-10-9.3C.5 8 2 4 6 4c2.2 0 3.8 1.3 6 3.8C14.2 5.3 15.8 4 18 4c4 0 5.5 4 4 7.7C19.5 16.4 12 21 12 21z"/></svg>
          <span class="icon-btn__label">${t("navFavorites")}</span>
          <span class="icon-btn__badge" data-fav-badge style="display:none">0</span>
        </a>
        <a class="icon-btn" href="cart.html">
          <svg class="icon-btn__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="9" cy="21" r="1.4"/><circle cx="18" cy="21" r="1.4"/><path d="M2.5 3h2l2.2 12.2a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 2-1.6L21 7H6"/></svg>
          <span class="icon-btn__label">${t("navCart")}</span>
          <span class="icon-btn__badge" data-cart-badge style="display:none">0</span>
        </a>
      </div>
    </div>
  </header>
  <div class="catalog-menu__backdrop" data-catalog-backdrop></div>`;
}

/* ---------- Katalog mega-menyu shabloni (Uzum uslubida) ---------- */
// katalog mega-menyu HTML shablon
function catalogMenuTemplate(categories, megaMenu){
  const cats = categories || [];
  const items = cats.map((c, idx) => `
    <button type="button" class="catalog-menu__item ${idx===0 ? 'catalog-menu__item--active':''}" data-catalog-item="${c.id}">
      <span class="catalog-menu__item-icon">${c.emoji}</span>
      <span class="catalog-menu__item-name">${tCat(c.id)}</span>
      <svg class="catalog-menu__item-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 6l6 6-6 6"/></svg>
    </button>`).join("");

  const firstFlyout = cats.length ? catalogFlyoutContent(cats[0].id, cats[0].emoji, megaMenu) : "";

  return `
  <div class="catalog-menu" data-catalog-menu>
    <button type="button" class="catalog-menu__trigger" data-catalog-toggle aria-haspopup="true" aria-expanded="false">
      <span class="catalog-menu__trigger-icon catalog-menu__trigger-icon--open">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 7h16"/><path d="M4 12h16"/><path d="M4 17h16"/></svg>
      </span>
      <span class="catalog-menu__trigger-icon catalog-menu__trigger-icon--close">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 6l12 12"/><path d="M18 6L6 18"/></svg>
      </span>
      <span>${t("catalogWord")}</span>
    </button>
    <div class="catalog-menu__panel" data-catalog-panel>
      <div class="catalog-menu__sidebar" data-catalog-sidebar>${items}</div>
      <div class="catalog-menu__flyout catalog-menu__flyout--open" data-catalog-flyout>${firstFlyout}</div>
    </div>
  </div>`;
}

// mega-menyu qism-kategoriya paneli
function catalogFlyoutContent(catId, emoji, megaMenu){
  const groups = (megaMenu && megaMenu[catId]) || [];
  return `
    <div class="catalog-menu__flyout-title">${emoji || ""} ${tCat(catId)}</div>
    <div class="catalog-menu__columns">
      ${groups.map(g => `
        <div class="catalog-menu__group">
          <div class="catalog-menu__group-title">${escapeHtml(g.title)}</div>
          <div class="catalog-menu__group-list">
            ${g.links.map(link => `<a class="catalog-menu__group-link" href="catalog.html?cat=${encodeURIComponent(catId)}">${escapeHtml(link)}</a>`).join("")}
          </div>
        </div>`).join("")}
    </div>`;
}

/* ---------- Katalog mega-menyu mantiqi ---------- */
// katalog mega-menyu
function initCatalogMenu(categories, megaMenu){
  const wrap = document.querySelector("[data-catalog-menu]");
  const toggle = document.querySelector("[data-catalog-toggle]");
  const panel = document.querySelector("[data-catalog-panel]");
  const sidebar = document.querySelector("[data-catalog-sidebar]");
  const flyout = document.querySelector("[data-catalog-flyout]");
  const backdrop = document.querySelector("[data-catalog-backdrop]");
  if(!wrap || !toggle || !panel) return;

  function openMenu(){
    panel.classList.add("catalog-menu__panel--open");
    toggle.classList.add("catalog-menu__trigger--active");
    toggle.setAttribute("aria-expanded", "true");
    if(backdrop) backdrop.classList.add("catalog-menu__backdrop--open");
  }
  function closeMenu(){
    panel.classList.remove("catalog-menu__panel--open");
    toggle.classList.remove("catalog-menu__trigger--active");
    toggle.setAttribute("aria-expanded", "false");
    if(backdrop) backdrop.classList.remove("catalog-menu__backdrop--open");
  }
  function isOpen(){ return panel.classList.contains("catalog-menu__panel--open"); }

  toggle.addEventListener("click", ()=> isOpen() ? closeMenu() : openMenu());

  if(sidebar){
    sidebar.querySelectorAll("[data-catalog-item]").forEach(item=>{
      const catId = item.getAttribute("data-catalog-item");
      const cat = (categories||[]).find(c => c.id === catId);
      function activateFlyout(){
        sidebar.querySelectorAll("[data-catalog-item]").forEach(i=> i.classList.remove("catalog-menu__item--active"));
        item.classList.add("catalog-menu__item--active");
        flyout.innerHTML = catalogFlyoutContent(catId, cat && cat.emoji, megaMenu);
      }
      item.addEventListener("mouseenter", activateFlyout);
      item.addEventListener("focus", activateFlyout);
      item.addEventListener("click", ()=>{
        goTo(`catalog.html?cat=${encodeURIComponent(catId)}`);
      });
    });
  }

  document.addEventListener("click", (e)=>{
    if(isOpen() && !wrap.contains(e.target)) closeMenu();
  });
  document.addEventListener("keydown", (e)=>{
    if(e.key === "Escape" && isOpen()) closeMenu();
  });
  if(backdrop) backdrop.addEventListener("click", closeMenu);
}

// footer HTML shablon
function footerTemplate(){
  return `
  <footer class="footer">
    <div class="container">
      <div class="footer__grid">
        <div class="footer__about">
          <a href="index.html" class="logo logo--footer" aria-label="Shoply">
            <img class="logo__img" src="images/logo.png" alt="Shoply">
          </a>
          <p class="footer__about-text">${t("footerAboutText")}</p>
          <div class="footer__social">
            <a class="footer__social-link" href="#" aria-label="Telegram">✈️</a>
            <a class="footer__social-link" href="#" aria-label="Instagram">📷</a>
            <a class="footer__social-link" href="#" aria-label="Facebook">📘</a>
          </div>
        </div>
        <div>
          <h4 class="footer__col-title">${t("footerCustomers")}</h4>
          <ul class="footer__col-list">
            <li><a class="footer__col-link" href="catalog.html">${t("catalogWord")}</a></li>
            <li><a class="footer__col-link" href="cart.html">${t("navCart")}</a></li>
            <li><a class="footer__col-link" href="favorites.html">${t("navFavorites")}</a></li>
            <li><a class="footer__col-link" href="#">${t("footerTrackOrder")}</a></li>
          </ul>
        </div>
        <div>
          <h4 class="footer__col-title">${t("footerCompany")}</h4>
          <ul class="footer__col-list">
            <li><a class="footer__col-link" href="#">${t("footerAboutUs")}</a></li>
            <li><a class="footer__col-link" href="#">${t("footerVacancies")}</a></li>
            <li><a class="footer__col-link" href="#">${t("footerOffer")}</a></li>
            <li><a class="footer__col-link" href="#">${t("footerPrivacy")}</a></li>
          </ul>
        </div>
        <div>
          <h4 class="footer__col-title">${t("footerHelp")}</h4>
          <ul class="footer__col-list">
            <li><a class="footer__col-link" href="#">${t("footerFaq")}</a></li>
            <li><a class="footer__col-link" href="#">${t("footerReturns")}</a></li>
            <li><a class="footer__col-link" href="#">${t("footerDelivery")}</a></li>
            <li><a class="footer__col-link" href="contact.html">${t("footerContactUs")}</a></li>
          </ul>
        </div>
        <div>
          <h4 class="footer__col-title">${t("footerContact")}</h4>
          <ul class="footer__contact-list">
            <li>+998 71 200 00 00</li>
            <li>info@sotuvsayti.uz</li>
            <li>Toshkent sh., Chilonzor t.</li>
          </ul>
        </div>
      </div>
      <div class="footer__bottom">
        <span>${t("footerRights")}</span>
        <span>${t("footerDemo")}</span>
      </div>
    </div>
  </footer>`;
}

/* ---------- Login modal shablon ---------- */
// login/register modal HTML shablon
function loginModalTemplate(){
  return `
  <div class="modal" data-login-modal>
    <div class="modal__box">
      <button type="button" class="modal__close" data-login-close aria-label="${t("closeLabel")}">✕</button>
      <div data-modal-login-view>
        <h2 class="modal__title">${t("loginWelcome")}</h2>
        <p class="modal__subtitle">${t("loginWelcomeSub")}</p>
        <form data-login-form>
          <div class="form-field">
            <label class="form-field__label">${t("loginPhone")}</label>
            <input type="tel" class="form-field__input" placeholder="+998 90 123 45 67" required data-login-phone pattern="^\\+?[0-9\\s]{9,15}$">
          </div>
          <div class="form-field">
            <label class="form-field__label">${t("loginPassword")}</label>
            <input type="password" class="form-field__input" placeholder="••••••••" required minlength="4" data-login-pass>
            <div class="form-field__error" data-login-error></div>
          </div>
          <button type="submit" class="btn btn--primary btn--block btn--lg">${t("loginBtn")}</button>
        </form>
        <div class="modal__switch">${t("loginNoAccount")} <button type="button" class="modal__switch-btn" data-switch-register>${t("loginRegisterLink")}</button></div>
      </div>
      <div data-modal-register-view style="display:none;">
        <h2 class="modal__title">${t("registerTitle")}</h2>
        <p class="modal__subtitle">${t("registerSub")}</p>
        <form data-register-form>
          <div class="form-field">
            <label class="form-field__label">${t("registerName")}</label>
            <input type="text" class="form-field__input" placeholder="${t("registerName")}" required data-reg-name>
          </div>
          <div class="form-field">
            <label class="form-field__label">${t("loginPhone")}</label>
            <input type="tel" class="form-field__input" placeholder="+998 90 123 45 67" required data-reg-phone pattern="^\\+?[0-9\\s]{9,15}$">
          </div>
          <div class="form-field">
            <label class="form-field__label">${t("loginPassword")}</label>
            <input type="password" class="form-field__input" placeholder="••••••••" required minlength="4" data-reg-pass>
            <div class="form-field__error" data-register-error></div>
          </div>
          <button type="submit" class="btn btn--primary btn--block btn--lg">${t("registerBtn")}</button>
        </form>
        <div class="modal__switch">${t("registerHaveAccount")} <button type="button" class="modal__switch-btn" data-switch-login>${t("registerLoginLink")}</button></div>
      </div>
      <div class="modal__account" data-modal-account-view style="display:none;">
        <div class="avatar avatar--lg" data-account-avatar>A</div>
        <h2 class="modal__title" data-account-name>${t("accountDefaultName")}</h2>
        <p class="modal__subtitle" data-account-phone>+998 90 000 00 00</p>
        <button type="button" class="btn btn--ghost modal__logout" data-logout-btn>${t("logoutBtn")}</button>
      </div>
    </div>
  </div>`;
}

/* ---------- Sahifani ishga tushirish ---------- */
// sahifani ishga tushirish (header/footer/holat)
async function initLayout(activePage=""){
  document.documentElement.lang = getLang() === "uzc" ? "uz" : getLang();

  let categories = [];
  let megaMenu = {};
  try{
    [categories, megaMenu] = await Promise.all([Api.getCategories(), Api.getMegaMenu()]);
  }catch(e){
    console.warn("Kategoriyalarni yuklab bo'lmadi:", e.message);
  }

  const headerMount = document.querySelector("#header-mount");
  const footerMount = document.querySelector("#footer-mount");
  if(headerMount) headerMount.innerHTML = headerTemplate(categories, megaMenu, activePage);
  if(footerMount) footerMount.innerHTML = footerTemplate();
  document.body.insertAdjacentHTML("beforeend", loginModalTemplate());

  await bootstrapUserState();
  refreshAccountLabel();
  initSearch();
  initLoginModal();
  initLangSwitcher();
  initThemeToggle();
  withLangLinks(document);
  initCatalogMenu(categories, megaMenu);
  attachImgFallback(document);

  return { categories, megaMenu };
}

// joriy tilni saqlagan holda sahifa manzili (masalan profile.html?lang=ru)
function langHref(page){
  const u = new URL(page, location.href);
  u.searchParams.set("lang", getLang());
  return u.pathname.split("/").pop() + u.search;
}

// kunduzgi / tungi rejim tugmasi
function initThemeToggle(){
  const btn = document.querySelector("[data-theme-toggle]");
  if(!btn) return;
  btn.addEventListener("click", ()=>{
    const theme = toggleTheme();
    btn.setAttribute("aria-label", theme === "dark" ? "Kunduzgi rejim" : "Tungi rejim");
    const icon = btn.querySelector("[data-theme-icon]");
    if(icon) icon.innerHTML = theme === "dark"
      ? '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>'
      : '<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/>';
  });
}

// header'dagi 'Kirish' yorlig'ini yangilash
function refreshAccountLabel(){
  const label = document.querySelector("[data-account-label]");
  if(!label) return;
  label.textContent = CURRENT_USER ? CURRENT_USER.name.split(" ")[0] : t("navLogin");
}

/* ---------- Qidiruv ---------- */
// qidiruv
function initSearch(){
  const form = document.querySelector("[data-search-form]");
  const input = document.querySelector("[data-search-input]");
  const suggest = document.querySelector("[data-search-suggest]");
  if(!form) return;

  const params = new URLSearchParams(location.search);
  if(params.get("q")) input.value = params.get("q");

  let debounceTimer = null;
  input.addEventListener("input", ()=>{
    clearTimeout(debounceTimer);
    const q = input.value.trim();
    if(q.length < 2){ suggest.classList.remove("search__suggest--open"); return; }
    debounceTimer = setTimeout(async ()=>{
      let matches = [];
      try{ matches = await Api.searchSuggest(q); }catch(e){ return; }
      if(!matches.length){ suggest.classList.remove("search__suggest--open"); return; }
      suggest.innerHTML = matches.map(p => `
        <a class="search__suggest-item" href="product.html?id=${p.id}">
          🔎 <strong>${highlightMatch(p.name, q)}</strong>&nbsp;— ${formatPrice(p.price)}
        </a>`).join("");
      suggest.classList.add("search__suggest--open");
    }, 200);
  });

  document.addEventListener("click", (e)=>{
    if(!form.contains(e.target)) suggest.classList.remove("search__suggest--open");
  });

  form.addEventListener("submit", (e)=>{
    e.preventDefault();
    const q = input.value.trim();
    goTo(`catalog.html${q ? "?q=" + encodeURIComponent(q) : ""}`);
  });
}
// qidiruv natijasida mos so'zni belgilash
function highlightMatch(text, q){
  const escaped = escapeHtml(text);
  const idx = text.toLowerCase().indexOf(q.toLowerCase());
  if(idx === -1) return escaped;
  const before = escapeHtml(text.slice(0,idx));
  const match = escapeHtml(text.slice(idx, idx+q.length));
  const after = escapeHtml(text.slice(idx+q.length));
  return before + "<u>" + match + "</u>" + after;
}

/* ---------- Login / Register modal mantiqi ---------- */
// login/register
function initLoginModal(){
  const overlay = document.querySelector("[data-login-modal]");
  const openBtn = document.querySelector("[data-login-open]");
  const closeBtn = document.querySelector("[data-login-close]");
  if(!overlay) return;

  const views = {
    login: overlay.querySelector("[data-modal-login-view]"),
    register: overlay.querySelector("[data-modal-register-view]"),
    account: overlay.querySelector("[data-modal-account-view]"),
  };
  function showView(name){
    Object.values(views).forEach(v => v.style.display = "none");
    views[name].style.display = "block";
  }

  openBtn.addEventListener("click", ()=>{
    if(CURRENT_USER){
      window.location.href = langHref("profile.html");
      return;
    }
    if(CURRENT_USER){
      overlay.querySelector("[data-account-name]").textContent = CURRENT_USER.name;
      overlay.querySelector("[data-account-phone]").textContent = CURRENT_USER.phone;
      overlay.querySelector("[data-account-avatar]").textContent = CURRENT_USER.name.charAt(0).toUpperCase();
      showView("account");
    } else {
      showView("login");
    }
    overlay.classList.add("modal--open");
    setTimeout(()=>{
      const visibleView = Object.values(views).find(v => v.style.display !== "none");
      const focusTarget = visibleView ? visibleView.querySelector("input, button") : null;
      if(focusTarget) focusTarget.focus();
    }, 0);
  });
  function closeModal(){
    overlay.classList.remove("modal--open");
    openBtn.focus();
  }
  closeBtn.addEventListener("click", closeModal);
  overlay.addEventListener("click", (e)=>{ if(e.target === overlay) closeModal(); });
  document.addEventListener("keydown", (e)=>{
    if(e.key === "Escape" && overlay.classList.contains("modal--open")) closeModal();
  });

  overlay.querySelector("[data-switch-register]").addEventListener("click", ()=> showView("register"));
  overlay.querySelector("[data-switch-login]").addEventListener("click", ()=> showView("login"));

  overlay.querySelector("[data-login-form]").addEventListener("submit", async (e)=>{
    e.preventDefault();
    const errorEl = overlay.querySelector("[data-login-error]");
    errorEl.classList.remove("form-field__error--show");
    const phone = overlay.querySelector("[data-login-phone]").value.trim();
    const password = overlay.querySelector("[data-login-pass]").value;
    try{
      const { token, user } = await Api.login({ phone, password });
      setToken(token);
      CURRENT_USER = user;
      await bootstrapUserState();
      refreshAccountLabel();
      overlay.classList.remove("modal--open");
      showToast(t("loginSuccess"));
    }catch(err){
      errorEl.textContent = err.message || t("loginErrorMsg");
      errorEl.classList.add("form-field__error--show");
    }
  });

  overlay.querySelector("[data-register-form]").addEventListener("submit", async (e)=>{
    e.preventDefault();
    const errorEl = overlay.querySelector("[data-register-error]");
    errorEl.classList.remove("form-field__error--show");
    const name = overlay.querySelector("[data-reg-name]").value.trim();
    const phone = overlay.querySelector("[data-reg-phone]").value.trim();
    const password = overlay.querySelector("[data-reg-pass]").value;
    try{
      const { token, user } = await Api.register({ name, phone, password });
      setToken(token);
      CURRENT_USER = user;
      await bootstrapUserState();
      refreshAccountLabel();
      overlay.classList.remove("modal--open");
      showToast(t("registerSuccess"));
    }catch(err){
      errorEl.textContent = err.message || t("loginErrorMsg");
      errorEl.classList.add("form-field__error--show");
    }
  });

  overlay.querySelector("[data-logout-btn]").addEventListener("click", ()=>{
    setToken(null);
    CURRENT_USER = null;
    overlay.classList.remove("modal--open");
    refreshAccountLabel();
    showToast(t("logoutMsg"));
  });
}

/* ---------- Til almashtirgich mantiqi ---------- */
// til almashtirgich
function initLangSwitcher(){
  const toggle = document.querySelector("[data-lang-toggle]");
  const menu = document.querySelector("[data-lang-menu]");
  if(!toggle || !menu) return;
  toggle.addEventListener("click", (e)=>{
    e.stopPropagation();
    const open = menu.classList.toggle("lang-switcher__menu--open");
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
  });
  menu.querySelectorAll("[data-lang-option]").forEach(btn=>{
    btn.addEventListener("click", ()=> setLang(btn.getAttribute("data-lang-option")));
  });
  document.addEventListener("click", (e)=>{
    if(!toggle.contains(e.target) && !menu.contains(e.target)){
      menu.classList.remove("lang-switcher__menu--open");
      toggle.setAttribute("aria-expanded", "false");
    }
  });
}

/* ---------- Yulduzcha (reyting) render ---------- */
// reyting yulduzchalari
function starString(rating){
  const full = Math.round(rating);
  return "★".repeat(full) + "☆".repeat(5-full);
}

/* ---------- Mahsulot kartasi HTML ---------- */
// mahsulot kartasi HTML
function productCardHTML(p){
  const fav = FAV_SET.has(Number(p.id));
  const inCart = CART_QTY[p.id];
  return `
  <div class="product-card" data-product-card="${p.id}">
    <a href="product.html?id=${p.id}" class="product-card__media">
      <div class="product-card__badges">
        ${p.discountPct ? `<span class="badge badge--sale">-${p.discountPct}%</span>` : ""}
        ${p.isNew ? `<span class="badge badge--new">${t("badgeNew")}</span>` : ""}
      </div>
      <img src="${p.img}" alt="${escapeHtml(p.name)}" data-fallback loading="lazy">
      <button type="button" class="fav-btn product-card__fav-btn ${fav ? 'fav-btn--active':''}" data-fav-toggle="${p.id}" aria-label="${t('addFav')}" onclick="event.preventDefault()">
        <svg class="fav-btn__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 21s-7.5-4.6-10-9.3C.5 8 2 4 6 4c2.2 0 3.8 1.3 6 3.8C14.2 5.3 15.8 4 18 4c4 0 5.5 4 4 7.7C19.5 16.4 12 21 12 21z"/></svg>
      </button>
    </a>
    <div class="product-card__info">
      <div class="product-card__rating"><span class="rating-stars">${starString(p.rating)}</span> ${p.rating} (${p.reviewCount})</div>
      <a href="product.html?id=${p.id}"><p class="product-card__title">${escapeHtml(p.name)}</p></a>
      <div class="product-card__price-row price">
        <span class="price__now">${formatPrice(p.price)}</span>
        ${p.oldPrice ? `<span class="price__old">${formatPrice(p.oldPrice)}</span>` : ""}
      </div>
      ${p.freeShip ? `<div class="product-card__note">${t("freeShipping")}</div>` : `<div class="product-card__note">${tf("installmentMonth",{v:formatPrice(p.installment)})}</div>`}
      <button type="button" class="product-card__add-cart ${inCart ? 'product-card__add-cart--in-cart':''}" data-add-cart="${p.id}">
        <svg class="product-card__add-cart-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="21" r="1.4"/><circle cx="18" cy="21" r="1.4"/><path d="M2.5 3h2l2.2 12.2a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 2-1.6L21 7H6"/></svg>
        ${inCart ? t("inCartLabel") + " · " + inCart : t("addToCart")}
      </button>
    </div>
  </div>`;
}

/* Karta ichidagi tugmalarga umumiy listener (event delegation) */
// savat/sevimlilar tugmalari uchun umumiy listener
function bindProductGridEvents(root){
  root.addEventListener("click", (e)=>{
    const favBtn = e.target.closest("[data-fav-toggle]");
    if(favBtn){
      const id = favBtn.getAttribute("data-fav-toggle");
      toggleFavoriteRemote(id).then(active=>{
        favBtn.classList.toggle("fav-btn--active", active);
        showToast(active ? t("toastAddFav") : t("toastRemoveFav"));
      });
      return;
    }
    const cartBtn = e.target.closest("[data-add-cart]");
    if(cartBtn){
      const id = cartBtn.getAttribute("data-add-cart");
      addToCart(id, 1).then(added=>{
        if(!added) return;
        const qty = CART_QTY[id] || 1;
        cartBtn.classList.add("product-card__add-cart--in-cart");
        cartBtn.innerHTML = `<svg class="product-card__add-cart-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="21" r="1.4"/><circle cx="18" cy="21" r="1.4"/><path d="M2.5 3h2l2.2 12.2a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 2-1.6L21 7H6"/></svg> ${t("inCartLabel")} · ${qty}`;
      });
      return;
    }
  });
}

// sahifa yuklanganda ishga tushirish
document.addEventListener("DOMContentLoaded", ()=>{
  bindProductGridEvents(document.body);
});
