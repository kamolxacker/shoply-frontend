/* ==========================================================================
   Mahsulot sahifasi mantiqi (backend API orqali)
   ========================================================================== */

// URL'dan mahsulot ID sini olish
function currentProductId(){
  const params = new URLSearchParams(location.search);
  return params.get("id") || "1";
}

// mahsulot sahifasini render qilish
async function renderProduct(){
  const mount = document.querySelector("#product-mount");
  const id = currentProductId();
  let p;
  try{
    p = await Api.getProduct(id);
  }catch(e){
    mount.innerHTML = `
      <div class="empty-state"><div class="empty-state__icon">😕</div><h3 class="empty-state__title">${t("productNotFound")}</h3>
      <a href="catalog.html" class="btn btn--solid empty-state__action">${t("backToCatalog")}</a></div>`;
    return;
  }

  document.title = `${p.name} — Sotuv Sayti`;
  document.querySelector("#crumb-home").textContent = t("home");
  document.querySelector("#crumb-cat").textContent = tCat(p.catId);
  document.querySelector("#crumb-cat").href = `catalog.html?cat=${p.catId}`;
  document.querySelector("#crumb-name").textContent = p.name;

  mount.innerHTML = `
    <div class="product-detail">
      <div>
        <div class="product-detail__gallery-main">
          <img src="${p.gallery[0]}" alt="${escapeHtml(p.name)}" data-fallback id="gallery-main-img">
        </div>
        <div class="product-detail__gallery-thumbs">
          ${p.gallery.map((g,i)=>`
            <button type="button" class="product-detail__gallery-thumb ${i===0?'product-detail__gallery-thumb--active':''}" data-thumb="${i}">
              <img src="${g}" alt="${t('pdBrand')} ${i+1}" data-fallback>
            </button>`).join("")}
        </div>
      </div>

      <div>
        <h1 class="product-detail__title">${escapeHtml(p.name)}</h1>
        <div class="product-detail__meta">
          <span class="rating-stars">${starString(p.rating)}</span>
          <span>${p.rating} · ${tf("pdReviewsCount",{n:p.reviewCount})}</span>
          <span>·</span>
          <span>${t("pdBrand")}: <strong>${escapeHtml(p.brand)}</strong></span>
        </div>

        <div class="product-detail__section" style="border-top:none;padding-top:0;">
          <h3>${t("pdDescription")}</h3>
          <p>${escapeHtml(p.description)}</p>
        </div>
        <div class="product-detail__section">
          <h3>${t("pdSpecs")}</h3>
          <table class="product-detail__spec-table">
            ${p.specs.map(([k,v])=>`<tr><td>${escapeHtml(k)}</td><td>${escapeHtml(v)}</td></tr>`).join("")}
          </table>
        </div>
        <div class="product-detail__section" id="reviews-section">
          <h3>${t("pdReviews")}</h3>
          <div class="reviews__summary">
            <div class="reviews__score">
              <div class="reviews__score-value">${p.rating}</div>
              <div class="rating-stars">${starString(p.rating)}</div>
              <div class="reviews__score-count">${tf("pdReviewsCount",{n:p.reviewCount})}</div>
            </div>
            <div class="reviews__bars">
              ${[5,4,3,2,1].map(star => {
                const pct = star === Math.round(p.rating) ? 62 : Math.max(4, 30 - Math.abs(star-Math.round(p.rating))*12);
                return `<div class="reviews__bar-row"><span>${star}★</span><div class="reviews__bar"><span class="reviews__bar-fill" style="width:${pct}%"></span></div></div>`;
              }).join("")}
            </div>
          </div>
          ${p.reviews.map(r => `
            <div class="reviews__item">
              <div class="reviews__who">
                <div class="avatar">${escapeHtml(r.name.charAt(0))}</div>
                <div>
                  <div class="reviews__name">${escapeHtml(r.name)}</div>
                  <div class="rating-stars">${starString(r.rating)} <span class="reviews__date">${r.date}</span></div>
                </div>
              </div>
              <p class="reviews__text">${escapeHtml(r.text)}</p>
            </div>`).join("")}
        </div>
      </div>

      <div class="buy-box">
        <div class="buy-box__price price">
          <span class="price__now">${formatPrice(p.price)}</span>
          ${p.oldPrice ? `<span class="price__old">${formatPrice(p.oldPrice)}</span>` : ""}
        </div>
        ${p.discountPct ? `<div class="buy-box__discount">-${p.discountPct}% ${t("discountLabel")}</div>` : ""}
        <div class="buy-box__installment">${tf("installmentLabel",{v:formatPrice(p.installment)})}</div>

        <div class="buy-box__qty-row">
          <div class="qty-control">
            <button type="button" class="qty-control__btn" data-qty-minus aria-label="−">−</button>
            <span class="qty-control__value" data-qty-value>1</span>
            <button type="button" class="qty-control__btn" data-qty-plus aria-label="+">+</button>
          </div>
          <span class="buy-box__qty-unit">${t("pieces")}</span>
        </div>

        <div class="buy-box__actions">
          <button type="button" class="btn btn--primary btn--block btn--lg" data-buy-now>${t("buyNow")}</button>
          <button type="button" class="btn btn--ghost btn--block" data-add-to-cart-main>${t("addToCart")}</button>
          <button type="button" class="btn btn--ghost btn--block" data-fav-toggle-main>
            <span data-fav-label-main>${t("addFav")}</span>
          </button>
        </div>

        <div class="buy-box__trust">
          <div class="buy-box__trust-item"><svg class="buy-box__trust-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg> ${t("warranty")}</div>
          <div class="buy-box__trust-item"><svg class="buy-box__trust-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="8" width="13" height="10" rx="2"/><path d="M16 11h3l2 3v4h-5"/><circle cx="7.5" cy="19.5" r="1.5"/><circle cx="17.5" cy="19.5" r="1.5"/></svg> ${p.freeShip ? t("freeShip") : t("fastShip")}</div>
          <div class="buy-box__trust-item"><svg class="buy-box__trust-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12a9 9 0 1 0 9-9"/><path d="M3 4v5h5"/></svg> ${t("returnPolicy")}</div>
        </div>
      </div>
    </div>
  `;

  bindGalleryEvents(p);
  bindBuyBoxEvents(p);
  renderSimilar(p);
}

// rasm galereyasi
function bindGalleryEvents(p){
  const mainImg = document.querySelector("#gallery-main-img");
  document.querySelectorAll("[data-thumb]").forEach(btn=>{
    btn.addEventListener("click", ()=>{
      document.querySelectorAll("[data-thumb]").forEach(b=>b.classList.remove("product-detail__gallery-thumb--active"));
      btn.classList.add("product-detail__gallery-thumb--active");
      const idx = Number(btn.dataset.thumb);
      mainImg.src = p.gallery[idx];
      mainImg.onerror = () => handleImgError(mainImg);
    });
  });
}

// sotib olish paneli (miqdor, savat, sevimlilar)
function bindBuyBoxEvents(p){
  let qty = 1;
  const qtyLabel = document.querySelector("[data-qty-value]");
  const minusBtn = document.querySelector("[data-qty-minus]");
  const plusBtn = document.querySelector("[data-qty-plus]");
  function syncQtyButtons(){
    minusBtn.disabled = qty <= 1;
    plusBtn.disabled = qty >= 20;
  }
  syncQtyButtons();
  minusBtn.addEventListener("click", ()=>{
    qty = Math.max(1, qty-1); qtyLabel.textContent = qty; syncQtyButtons();
  });
  plusBtn.addEventListener("click", ()=>{
    qty = Math.min(20, qty+1); qtyLabel.textContent = qty; syncQtyButtons();
  });
  document.querySelector("[data-add-to-cart-main]").addEventListener("click", ()=>{
    addToCart(p.id, qty);
  });
  document.querySelector("[data-buy-now]").addEventListener("click", async ()=>{
    const added = await addToCart(p.id, qty);
    if(added) goTo("cart.html");
  });
  const favBtn = document.querySelector("[data-fav-toggle-main]");
  const favLabel = document.querySelector("[data-fav-label-main]");
  function syncFavLabel(){
    favLabel.textContent = FAV_SET.has(Number(p.id)) ? t("inFav") : t("addFav");
  }
  syncFavLabel();
  favBtn.addEventListener("click", ()=>{
    toggleFavoriteRemote(p.id).then(active=>{
      syncFavLabel();
      showToast(active ? t("toastAddFav") : t("toastRemoveFav"));
    });
  });
}

// o'xshash mahsulotlar
async function renderSimilar(p){
  const mount = document.querySelector("#similar-mount");
  if(!mount) return;
  try{
    const similar = await Api.getSimilar(p.id);
    mount.innerHTML = `<div class="product-grid">${similar.map(productCardHTML).join("")}</div>`;
  }catch(e){ /* o'xshash mahsulotlar bo'lmasa jim o'tkazamiz */ }
}

// statik matnlarni tilga moslash
function renderStaticTexts(){
  const eyebrow = document.querySelector("#similar-eyebrow");
  const title = document.querySelector("#similar-title");
  if(eyebrow) eyebrow.textContent = t("similarEyebrow");
  if(title) title.textContent = t("similarTitle");
}

// sahifa yuklanganda ishga tushirish
document.addEventListener("DOMContentLoaded", async ()=>{
  await initLayout();
  renderStaticTexts();
  await renderProduct();
});
