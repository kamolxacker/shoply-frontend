/* ==========================================================================
   Shoply — Profil sahifasi
   Bo'limlar: Buyurtmalarim, Sevimlilar, Savat, Menga yoqadigan buyurtmalar,
   Sharhlar, Ma'lumotlarim, Ijtimoiy promokodlar.
   ========================================================================== */

const PROFILE_T = {
  uz: {
    orders: "Buyurtmalarim", favorites: "Sevimlilar", cart: "Savat",
    liked: "Menga yoqadigan buyurtmalar", reviews: "Sharhlar",
    info: "Ma'lumotlarim", promos: "Ijtimoiy promokodlar",
    tabAll: "Barcha buyurtmalar", tabUnpaid: "To'lov qilinmagan", tabActive: "Faol",
    statusActive: "Faol", statusUnpaid: "To'lov qilinmagan", statusDelivered: "Yetkazildi",
    emptyTitle: "Hech narsa yo‘q", emptyOrders: "Sizda faol buyurtma mavjud emas!",
    emptyHint: "Barcha kerakli narsalarni topish uchun qidirishdan foydalaning!",
    startShopping: "Xaridlarni boshlash", backHome: "Bosh sahifaga qaytish",
    total: "Jami", qty: "dona", date: "Sana",
    like: "Menga yoqdi", liked_: "Yoqdi ♥", likeHint: "Yoqqan buyurtmangizga o'xshash mahsulotlar tavsiya qilinadi",
    likedEmpty: "Hali buyurtma belgilamadingiz. Buyurtmalarim bo'limida «Menga yoqdi» tugmasini bosing.",
    recoTitle: "Siz uchun tavsiyalar", recoEmpty: "Tavsiyalar hozircha yo'q",
    favEmpty: "Sevimli mahsulotlar yo'q", cartEmpty: "Savatingiz bo'sh",
    cartOpen: "Savatga o'tish", cartTotal: "Savat jami",
    reviewsEmpty: "Hali sharhlar yo'q", reviewsHint: "Xarid qilingan mahsulotlarga sharh qoldiring.",
    name: "Ism", phone: "Telefon", memberSince: "Ro'yxatdan o'tgan",
    copy: "Nusxalash", copied: "Promokod nusxalandi", minOrder: "Minimal buyurtma",
    discount: "chegirma", guest: "Profilga kirish",
    guestText: "Buyurtmalaringiz va sevimlilaringizni ko'rish uchun tizimga kiring.", login: "Kirish",
    loadError: "Ma'lumotni yuklab bo'lmadi",
  },
  ru: {
    orders: "Мои заказы", favorites: "Избранное", cart: "Корзина",
    liked: "Понравившиеся заказы", reviews: "Отзывы",
    info: "Мои данные", promos: "Социальные промокоды",
    tabAll: "Все заказы", tabUnpaid: "Не оплачено", tabActive: "Активные",
    statusActive: "Активен", statusUnpaid: "Не оплачен", statusDelivered: "Доставлен",
    emptyTitle: "Здесь пусто", emptyOrders: "У вас нет активных заказов!",
    emptyHint: "Воспользуйтесь поиском, чтобы найти всё необходимое!",
    startShopping: "Начать покупки", backHome: "Вернуться на главную",
    total: "Итого", qty: "шт.", date: "Дата",
    like: "Нравится", liked_: "Нравится ♥", likeHint: "Похожие товары будут рекомендованы по понравившемуся заказу",
    likedEmpty: "Вы ещё не отметили заказы. Нажмите «Нравится» в разделе «Мои заказы».",
    recoTitle: "Рекомендации для вас", recoEmpty: "Рекомендаций пока нет",
    favEmpty: "Нет избранных товаров", cartEmpty: "Ваша корзина пуста",
    cartOpen: "Перейти в корзину", cartTotal: "Итого в корзине",
    reviewsEmpty: "Отзывов пока нет", reviewsHint: "Оставьте отзыв о купленных товарах.",
    name: "Имя", phone: "Телефон", memberSince: "Дата регистрации",
    copy: "Копировать", copied: "Промокод скопирован", minOrder: "Минимальный заказ",
    discount: "скидка", guest: "Вход в профиль",
    guestText: "Войдите, чтобы увидеть свои заказы и избранное.", login: "Войти",
    loadError: "Не удалось загрузить данные",
  },
  en: {
    orders: "My orders", favorites: "Favorites", cart: "Cart",
    liked: "Orders I like", reviews: "Reviews",
    info: "My details", promos: "Social promo codes",
    tabAll: "All orders", tabUnpaid: "Unpaid", tabActive: "Active",
    statusActive: "Active", statusUnpaid: "Unpaid", statusDelivered: "Delivered",
    emptyTitle: "Nothing here", emptyOrders: "You have no active orders!",
    emptyHint: "Use search to find everything you need!",
    startShopping: "Start shopping", backHome: "Back to home",
    total: "Total", qty: "pcs", date: "Date",
    like: "I like it", liked_: "Liked ♥", likeHint: "Products similar to this order will be recommended",
    likedEmpty: "You have not marked any orders yet. Press “I like it” in My orders.",
    recoTitle: "Recommended for you", recoEmpty: "No recommendations yet",
    favEmpty: "No favorite products", cartEmpty: "Your cart is empty",
    cartOpen: "Go to cart", cartTotal: "Cart total",
    reviewsEmpty: "No reviews yet", reviewsHint: "Leave a review for the products you bought.",
    name: "Name", phone: "Phone", memberSince: "Registered",
    copy: "Copy", copied: "Promo code copied", minOrder: "Minimum order",
    discount: "off", guest: "Sign in to your profile",
    guestText: "Sign in to see your orders and favorites.", login: "Sign in",
    loadError: "Could not load data",
  },
};

const PROFILE_SECTIONS = ["orders", "favorites", "cart", "liked", "reviews", "info", "promos"];
let profileOrderTab = "all";

function pt(key){
  const lang = getLang() === "uzc" ? "uz" : getLang();
  return (PROFILE_T[lang] || PROFILE_T.uz)[key] || PROFILE_T.uz[key] || key;
}
function fmtDate(iso){
  const d = new Date(String(iso).replace(" ", "T") + "Z");
  return isNaN(d) ? iso : d.toLocaleDateString("uz-UZ", { day: "2-digit", month: "2-digit", year: "numeric" });
}
function statusLabel(s){
  return s === "unpaid" ? pt("statusUnpaid") : s === "delivered" ? pt("statusDelivered") : pt("statusActive");
}
function sectionHref(id){ return langHref("profile.html") + "#" + id; }

/* ---------- Chap menyu ---------- */
function renderNav(active){
  const icons = {
    orders: '<path d="M6 2h12l2 4v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6z"/><path d="M4 6h16"/>',
    favorites: '<path d="M12 21s-7.5-4.6-10-9.3C.5 8 2 4 6 4c2.2 0 3.8 1.3 6 3.8C14.2 5.3 15.8 4 18 4c4 0 5.5 4 4 7.7C19.5 16.4 12 21 12 21z"/>',
    cart: '<circle cx="9" cy="21" r="1.4"/><circle cx="18" cy="21" r="1.4"/><path d="M2.5 3h2l2.2 12.2a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 2-1.6L21 7H6"/>',
    liked: '<path d="M7 10v11"/><path d="M15 5.9 14 10h5.8a2 2 0 0 1 2 2.3l-1.3 7a2 2 0 0 1-2 1.7H7V10l4-7a2 2 0 0 1 4 1z"/>',
    reviews: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
    info: '<circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4.5 5-6 8-6s6.5 1.5 8 6"/>',
    promos: '<path d="M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8z"/><circle cx="7.5" cy="7.5" r="1.5"/>',
  };
  document.querySelector("#profile-nav").innerHTML = PROFILE_SECTIONS.map(id => `
    <a class="profile-nav__item ${id === active ? "profile-nav__item--active" : ""}" href="${sectionHref(id)}" data-nav="${id}">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">${icons[id]}</svg>
      <span>${pt(id)}</span>
      ${id === "reviews" ? '<span class="profile-nav__dot"></span>' : ""}
    </a>`).join("");
}

/* ---------- Buyurtmalar ---------- */
function orderCardHTML(o){
  const items = o.items.map(i => `
    <li class="order-card__item">
      <span class="order-card__media">${i.img ? `<img class="order-card__thumb" src="${escapeHtml(i.img)}" alt="" data-fallback>` : ""}</span>
      <span class="order-card__name">${escapeHtml(i.name)}</span>
      <span class="order-card__qty">${i.qty} ${pt("qty")}</span>
    </li>`).join("");
  return `
    <article class="order-card">
      <header class="order-card__head">
        <div><strong>№ ${o.id}</strong><span class="order-card__date">${pt("date")}: ${fmtDate(o.createdAt)}</span></div>
        <span class="order-badge order-badge--${o.status}">${statusLabel(o.status)}</span>
      </header>
      <ul class="order-card__items">${items}</ul>
      <footer class="order-card__foot">
        <span class="order-card__total">${pt("total")}: ${formatPrice(o.total)}</span>
        <button type="button" class="order-like ${o.liked ? "is-liked" : ""}" data-like="${o.id}" data-liked="${o.liked ? 1 : 0}" title="${pt("likeHint")}">
          ${o.liked ? pt("liked_") : pt("like")}
        </button>
      </footer>
    </article>`;
}

async function renderOrders(){
  const content = document.querySelector("#profile-content");
  let orders = [];
  try{ orders = await Api.getMyOrders(); }
  catch(e){ content.innerHTML = `<p>${escapeHtml(pt("loadError"))}</p>`; return; }

  const tabs = [["all", pt("tabAll")], ["unpaid", pt("tabUnpaid")], ["active", pt("tabActive")]];
  const filtered = orders.filter(o => profileOrderTab === "all" || o.status === profileOrderTab);

  const tabsHTML = `<div class="profile-tabs">${tabs.map(([k, label]) =>
    `<button type="button" class="profile-tab ${profileOrderTab === k ? "profile-tab--active" : ""}" data-order-tab="${k}">${label}</button>`).join("")}</div>`;

  const body = filtered.length
    ? filtered.map(orderCardHTML).join("")
    : `<div class="profile-empty">
         <h2 class="profile-empty__title">${pt("emptyTitle")}</h2>
         <p>${pt("emptyOrders")}</p>
         <p>${pt("emptyHint")}</p>
         <a class="btn btn--solid" href="${langHref("catalog.html")}">${pt("startShopping")}</a><br>
         <a class="profile-empty__link" href="${langHref("index.html")}">${pt("backHome")}</a>
       </div>`;

  content.innerHTML = `<h2 class="profile-section-title">${pt("orders")}</h2>${tabsHTML}${body}`;
  attachImgFallback(content);
}

/* ---------- Sevimlilar ---------- */
async function renderFavoritesSection(){
  const content = document.querySelector("#profile-content");
  let favs = [];
  try{ favs = await Api.getFavorites(); }catch(e){ content.innerHTML = `<p>${escapeHtml(pt("loadError"))}</p>`; return; }
  FAV_SET = new Set(favs.map(p => p.id));
  updateHeaderBadges();
  content.innerHTML = `<h2 class="profile-section-title">${pt("favorites")}</h2>` +
    (favs.length
      ? `<div class="product-grid">${favs.map(productCardHTML).join("")}</div>`
      : `<div class="profile-empty"><p>${pt("favEmpty")}</p></div>`);
  bindProductGridEvents(content);
}

/* ---------- Savat ---------- */
async function renderCartSection(){
  const content = document.querySelector("#profile-content");
  let cart = { items: [] };
  try{ cart = await Api.getCart(); }catch(e){ content.innerHTML = `<p>${escapeHtml(pt("loadError"))}</p>`; return; }
  const total = cart.items.reduce((s, i) => s + i.product.price * i.qty, 0);
  content.innerHTML = `
    <h2 class="profile-section-title">${pt("cart")}</h2>
    ${cart.items.length
      ? cart.items.map(i => `
          <div class="cart-mini-row"><span>${escapeHtml(i.product.name)} × ${i.qty}</span><span>${formatPrice(i.product.price * i.qty)}</span></div>`).join("") +
        `<div class="cart-mini-total"><span>${pt("cartTotal")}</span><span>${formatPrice(total)}</span></div>
         <div style="margin-top:18px"><a class="btn btn--solid" href="${langHref("cart.html")}">${pt("cartOpen")}</a></div>`
      : `<div class="profile-empty"><p>${pt("cartEmpty")}</p></div>`}`;
}

/* ---------- Menga yoqadigan buyurtmalar + tavsiyalar ---------- */
async function renderLikedSection(){
  const content = document.querySelector("#profile-content");
  let orders = [], reco = { items: [] };
  try{
    [orders, reco] = await Promise.all([Api.getMyOrders(), Api.getRecommendations()]);
  }catch(e){ content.innerHTML = `<p>${escapeHtml(pt("loadError"))}</p>`; return; }

  const liked = orders.filter(o => o.liked);
  content.innerHTML = `
    <h2 class="profile-section-title">${pt("liked")}</h2>
    ${liked.length ? liked.map(orderCardHTML).join("") : `<div class="profile-empty"><p>${pt("likedEmpty")}</p></div>`}
    ${liked.length ? `
      <div class="profile-recos">
        <h3 class="profile-section-title">${pt("recoTitle")}</h3>
        ${reco.items.length
          ? `<div class="product-grid">${reco.items.map(productCardHTML).join("")}</div>`
          : `<p>${pt("recoEmpty")}</p>`}
      </div>` : ""}`;
  attachImgFallback(content);
  bindProductGridEvents(content);
}

/* ---------- Sharhlar ---------- */
function renderReviewsSection(){
  document.querySelector("#profile-content").innerHTML = `
    <h2 class="profile-section-title">${pt("reviews")}</h2>
    <div class="profile-empty">
      <h2 class="profile-empty__title">${pt("reviewsEmpty")}</h2>
      <p>${pt("reviewsHint")}</p>
    </div>`;
}

/* ---------- Ma'lumotlarim ---------- */
function renderInfoSection(){
  const u = CURRENT_USER || {};
  document.querySelector("#profile-content").innerHTML = `
    <h2 class="profile-section-title">${pt("info")}</h2>
    <div class="profile-info">
      <div class="profile-info__row"><span class="profile-info__label">${pt("name")}</span><span class="profile-info__value">${escapeHtml(u.name || "—")}</span></div>
      <div class="profile-info__row"><span class="profile-info__label">${pt("phone")}</span><span class="profile-info__value">${escapeHtml(u.phone || "—")}</span></div>
    </div>`;
}

/* ---------- Ijtimoiy promokodlar ---------- */
async function renderPromosSection(){
  const content = document.querySelector("#profile-content");
  let promos = [];
  try{ promos = await Api.getPromos(); }catch(e){ content.innerHTML = `<p>${escapeHtml(pt("loadError"))}</p>`; return; }
  content.innerHTML = `
    <h2 class="profile-section-title">${pt("promos")}</h2>
    <div class="promo-list">
      ${promos.map(p => `
        <div class="promo-card">
          <div>
            <div class="promo-card__code">${escapeHtml(p.code)}</div>
            <div class="promo-card__title">${escapeHtml(p.title)} — −${p.discountPct}%</div>
            <div class="promo-card__desc">${escapeHtml(p.description)}${p.minTotal ? ` · ${pt("minOrder")}: ${formatPrice(p.minTotal)}` : ""}</div>
          </div>
          <button type="button" class="promo-card__copy" data-copy="${escapeHtml(p.code)}">${pt("copy")}</button>
        </div>`).join("")}
    </div>`;
}

/* ---------- Bo'lim yo'naltiruvchi ---------- */
async function renderSection(id){
  renderNav(id);
  if(id === "orders") return renderOrders();
  if(id === "favorites") return renderFavoritesSection();
  if(id === "cart") return renderCartSection();
  if(id === "liked") return renderLikedSection();
  if(id === "reviews") return renderReviewsSection();
  if(id === "info") return renderInfoSection();
  if(id === "promos") return renderPromosSection();
}
function currentSection(){
  const id = location.hash.replace("#", "");
  return PROFILE_SECTIONS.includes(id) ? id : "orders";
}

/* ---------- Ishga tushirish ---------- */
function renderProfileStaticTexts(){
  document.querySelector("#guest-title").textContent = pt("guest");
  document.querySelector("#guest-text").textContent = pt("guestText");
  document.querySelector("#guest-btn").textContent = pt("login");
  document.title = pt("orders") + " — Shoply";
}

document.addEventListener("DOMContentLoaded", async ()=>{
  await initLayout("profile");
  renderProfileStaticTexts();

  document.querySelector("#guest-btn").addEventListener("click", ()=>{
    document.querySelector("[data-login-open]").click();
  });

  if(!CURRENT_USER){
    document.querySelector("#profile-name").textContent = pt("guest");
    document.querySelector("#profile-guest").hidden = false;
    return;
  }

  document.querySelector("#profile-name").textContent = CURRENT_USER.name;
  document.querySelector("#profile-app").hidden = false;

  const route = async ()=> renderSection(currentSection());
  window.addEventListener("hashchange", route);
  await route();

  const content = document.querySelector("#profile-content");
  content.addEventListener("click", async (e)=>{
    const tab = e.target.closest("[data-order-tab]");
    if(tab){
      profileOrderTab = tab.dataset.orderTab;
      return renderOrders();
    }
    const likeBtn = e.target.closest("[data-like]");
    if(likeBtn){
      const id = Number(likeBtn.dataset.like);
      const liked = likeBtn.dataset.liked !== "1";
      try{
        await Api.likeOrder(id, liked);
        showToast(liked ? pt("like") + " ✓" : pt("like"));
        if(currentSection() === "liked") return renderLikedSection();
        return renderOrders();
      }catch(err){ showToast(err.message); }
    }
    const copy = e.target.closest("[data-copy]");
    if(copy){
      try{ await navigator.clipboard.writeText(copy.dataset.copy); }catch(err){}
      showToast(pt("copied"));
    }
  });
});
