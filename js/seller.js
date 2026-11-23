/* ==========================================================================
   Shoply — sotuvchi kabineti: buyurtmalar, mahsulotlar, sharhlar, statistika
   ========================================================================== */

const SELLER_STATUS_LABEL = { new: "Yangi", accepted: "Qabul qilingan", shipping: "Yo'lda", delivered: "Yetkazildi", rejected: "Rad etilgan" };
// har bir holat uchun keyingi qadamlar (tugmalar)
const SELLER_NEXT = {
  new: [["accepted", "Qabul qilish", "seller-btn--primary"], ["rejected", "Rad etish", "seller-btn--danger"]],
  accepted: [["shipping", "Yo'lga chiqardim", "seller-btn--primary"], ["rejected", "Bekor qilish", "seller-btn--danger"]],
  shipping: [["delivered", "Yetkazildi", "seller-btn--primary"]],
};
let sellerState = { me: null, section: "orders" };

const som = (n) => (Number(n) || 0).toLocaleString("uz-UZ").replace(/,/g, " ") + " so'm";
const dayOf = (iso) => String(iso || "").slice(0, 10);

/* ---------- Buyurtmalar ---------- */
async function renderOrders(){
  const box = document.querySelector("#seller-content");
  const orders = await apiRequest("/api/sellers/me/orders");
  box.innerHTML = `<h2 class="profile-section-title">Buyurtmalar</h2>` + (orders.length ? orders.map(o => `
    <article class="seller-order">
      <header class="seller-order__head">
        <div><strong>№ ${o.orderId}</strong> · ${escapeHtml(o.buyer)} · <span class="order-card__date">${dayOf(o.createdAt)}</span></div>
      </header>
      ${o.items.map(i => `
        <div class="seller-order__line">
          <div>${escapeHtml(i.name)} × ${i.qty} — <strong>${som(i.price * i.qty)}</strong></div>
          <div class="seller-order__actions">
            <span class="seller-status seller-status--${i.status}">${SELLER_STATUS_LABEL[i.status] || i.status}</span>
            ${(SELLER_NEXT[i.status] || []).map(([st, label, cls]) =>
              `<button type="button" class="seller-btn ${cls}" data-item-status="${st}" data-order="${o.orderId}" data-product="${i.productId}">${label}</button>`).join("")}
          </div>
        </div>`).join("")}
    </article>`).join("") : `<div class="profile-empty"><p>Hozircha buyurtmalar yo'q.</p></div>`);
}

/* ---------- Mahsulotlar ---------- */
async function renderProducts(){
  const box = document.querySelector("#seller-content");
  const [products, cats] = await Promise.all([apiRequest("/api/sellers/me/products"), Api.getCategories()]);
  box.innerHTML = `
    <h2 class="profile-section-title">Mahsulot qo'shish</h2>
    <form class="seller-form" data-product-form>
      <div class="form-field"><label class="form-field__label">Nomi *</label><input class="form-field__input" name="name" required></div>
      <div class="form-field"><label class="form-field__label">Brend *</label><input class="form-field__input" name="brand" required></div>
      <div class="form-field"><label class="form-field__label">Kategoriya *</label>
        <select class="form-field__input" name="catId" required>${cats.map(c => `<option value="${c.id}">${escapeHtml(tCat(c.id))}</option>`).join("")}</select></div>
      <div class="form-field"><label class="form-field__label">Narx (so'm) *</label><input type="number" min="1" class="form-field__input" name="price" required></div>
      <div class="form-field"><label class="form-field__label">Eski narx (chegirma uchun)</label><input type="number" min="1" class="form-field__input" name="oldPrice"></div>
      <div class="form-field wide"><label class="form-field__label">Tavsif</label><textarea class="form-field__input" rows="3" name="description"></textarea></div>
      <div class="form-field wide"><label class="form-field__label">Rasmlar (istalgancha, birinchisi asosiy)</label>
        <input type="file" multiple accept="image/jpeg,image/png,image/webp" class="form-field__input" data-files>
        <div class="seller-gallery" data-gallery></div></div>
      <div class="form-field__error wide" data-product-error></div>
      <div class="wide"><button type="submit" class="btn btn--solid">Mahsulotni saqlash</button></div>
    </form>
    <h2 class="profile-section-title" style="margin-top:28px">Mahsulotlarim (${products.length})</h2>
    ${products.length ? `<div class="promo-list">${products.map(p => `
      <div class="cart-mini-row"><span>${escapeHtml(p.name)}</span><span>${som(p.price)}</span></div>`).join("")}</div>`
      : `<p>Hali mahsulot qo'shilmagan.</p>`}`;

  let gallery = [];
  const galleryBox = box.querySelector("[data-gallery]");
  const drawGallery = () => { galleryBox.innerHTML = gallery.map(g => `<img src="${escapeHtml(g.url)}" alt="">`).join(""); };
  box.querySelector("[data-files]").addEventListener("change", async (e)=>{
    for(const file of [...e.target.files]){
      try{
        const dataUrl = await new Promise((res, rej)=>{ const r = new FileReader(); r.onload = () => res(r.result); r.onerror = () => rej(new Error("O'qib bo'lmadi")); r.readAsDataURL(file); });
        const up = await Api.uploadProductImage(file.name, dataUrl);
        gallery.push({ path: up.path, url: up.url }); drawGallery();
      }catch(err){ showToast(err.message); }
    }
    e.target.value = "";
  });

  box.querySelector("[data-product-form]").addEventListener("submit", async (e)=>{
    e.preventDefault();
    const f = e.target; const err = f.querySelector("[data-product-error]"); err.textContent = "";
    if(!gallery.length){ err.textContent = "Kamida bitta rasm yuklang."; return; }
    try{
      await apiRequest("/api/sellers/me/products", { method: "POST", body: {
        name: f.name.value.trim(), brand: f.brand.value.trim(), catId: f.catId.value,
        price: f.price.value, oldPrice: f.oldPrice.value, description: f.description.value.trim(),
        gallery: gallery.map(g => g.path), img: gallery[0].path,
      }});
      showToast("Mahsulot qo'shildi");
      renderProducts();
    }catch(e2){ err.textContent = e2.message; }
  });
}

/* ---------- Sharhlar ---------- */
async function renderReviews(){
  const box = document.querySelector("#seller-content");
  const reviews = await apiRequest("/api/sellers/me/reviews");
  box.innerHTML = `<h2 class="profile-section-title">Sharhlar</h2>` + (reviews.length ? reviews.map(r => `
    <article class="review">
      <div class="review__head"><strong>${escapeHtml(r.name)}</strong> · ${escapeHtml(r.productName)}
        <span class="review__stars">${"★".repeat(r.rating)}${"☆".repeat(5 - r.rating)}</span><span class="review__date">${dayOf(r.createdAt)}</span></div>
      <p class="review__text">${escapeHtml(r.text)}</p>
      ${r.sellerReply ? `<div class="review__reply"><strong>Sizning javobingiz:</strong> ${escapeHtml(r.sellerReply)}</div>`
        : `<form class="review-form" data-reply="${r.id}">
             <textarea class="form-field__input" rows="2" required name="text" placeholder="Javobingizni yozing"></textarea>
             <button type="submit" class="btn btn--solid">Javob berish</button>
           </form>`}
    </article>`).join("") : `<div class="profile-empty"><p>Hali sharhlar yo'q.</p></div>`);
}

/* ---------- Reyting va daromad ---------- */
async function renderStats(){
  const box = document.querySelector("#seller-content");
  const me = await apiRequest("/api/sellers/me");
  const s = me.stats;
  box.innerHTML = `
    <h2 class="profile-section-title">Reyting va daromad</h2>
    <div class="stat-grid">
      <div class="stat-card stat-card--accent"><div class="stat-card__label">Sof daromad</div><div class="stat-card__value">${som(s.income)}</div></div>
      <div class="stat-card"><div class="stat-card__label">Umumiy sotuv</div><div class="stat-card__value">${som(s.revenue)}</div></div>
      <div class="stat-card"><div class="stat-card__label">Platforma komissiyasi (10%)</div><div class="stat-card__value">${som(s.commission)}</div></div>
      <div class="stat-card"><div class="stat-card__label">Sotilgan dona</div><div class="stat-card__value">${s.soldUnits}</div></div>
      <div class="stat-card"><div class="stat-card__label">Buyurtmalar</div><div class="stat-card__value">${s.ordersCount} <small>(yangi: ${s.newOrders})</small></div></div>
      <div class="stat-card"><div class="stat-card__label">Reyting</div><div class="stat-card__value">${s.rating ? s.rating + " ★" : "—"} <small>(${s.reviewCount} sharh)</small></div></div>
      <div class="stat-card"><div class="stat-card__label">Mahsulotlar</div><div class="stat-card__value">${s.productCount}</div></div>
    </div>`;
}

/* ---------- Bo'lim boshqaruvi ---------- */
const SECTIONS = { orders: renderOrders, products: renderProducts, reviews: renderReviews, stats: renderStats };
async function showSection(){
  const id = SECTIONS[location.hash.replace("#", "")] ? location.hash.replace("#", "") : "orders";
  sellerState.section = id;
  document.querySelectorAll("[data-nav]").forEach(a => a.classList.toggle("profile-nav__item--active", a.dataset.nav === id));
  try{ await SECTIONS[id](); }catch(e){ document.querySelector("#seller-content").innerHTML = `<p>${escapeHtml(e.message)}</p>`; }
}

document.addEventListener("DOMContentLoaded", async ()=>{
  await initLayout("seller");
  const guest = document.querySelector("#seller-guest"), app = document.querySelector("#seller-app");
  if(!getToken()){ guest.hidden = false; return; }
  try{
    sellerState.me = await apiRequest("/api/sellers/me");
  }catch(e){
    // mijoz hisobi yoki token yo'q — sotuvchi emas
    guest.hidden = false;
    return;
  }
  document.querySelector("#seller-name").textContent = sellerState.me.shopName;
  app.hidden = false;
  window.addEventListener("hashchange", showSection);
  if(!location.hash) history.replaceState(null, "", "#orders");
  showSection();

  document.querySelector("#seller-logout").addEventListener("click", ()=>{ setToken(null); location.href = withLangUrl("index.html"); });

  // buyurtma holatini o'zgartirish (event delegation)
  document.querySelector("#seller-content").addEventListener("click", async (e)=>{
    const btn = e.target.closest("[data-item-status]");
    if(!btn) return;
    try{
      await apiRequest(`/api/sellers/me/orders/${btn.dataset.order}/items/${btn.dataset.product}/status`, { method: "POST", body: { status: btn.dataset.itemStatus } });
      showToast("Holat yangilandi");
      renderOrders();
    }catch(err){ showToast(err.message); }
  });

  // sharhga javob (event delegation)
  document.querySelector("#seller-content").addEventListener("submit", async (e)=>{
    const form = e.target.closest("[data-reply]");
    if(!form) return;
    e.preventDefault();
    try{
      await apiRequest(`/api/sellers/me/reviews/${form.dataset.reply}/reply`, { method: "POST", body: { text: form.text.value.trim() } });
      showToast("Javob yuborildi");
      renderReviews();
    }catch(err){ showToast(err.message); }
  });
});
