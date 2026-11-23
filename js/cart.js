/* ==========================================================================
   Savat sahifasi mantiqi (backend API orqali — narxlar, chegirma va
   yetkazib berish backend tomonida hisoblanadi)
   ========================================================================== */

// savatni backend'dan yuklab render qilish
async function loadAndRenderCart(){
  const layout = document.querySelector("#cart-layout");
  const mount = document.querySelector("#cart-list-mount");
  const summaryMount = document.querySelector("#summary-mount");

  let cart;
  try{
    cart = await Api.getCart();
  }catch(e){
    mount.innerHTML = `<div class="empty-state"><div class="empty-state__icon">⚠️</div><p class="empty-state__text">${escapeHtml(e.message)}</p></div>`;
    summaryMount.style.display = "none";
    return;
  }

  CART_QTY = {};
  cart.items.forEach(i => { CART_QTY[i.product.id] = i.qty; });
  updateHeaderBadges();

  if(!cart.items.length){
    layout.classList.add("cart__layout--empty");
    mount.innerHTML = `
      <div class="empty-state">
        <div class="empty-state__icon">🛒</div>
        <h3 class="empty-state__title">${t("cartEmptyTitle")}</h3>
        <p class="empty-state__text">${t("cartEmptyText")}</p>
        <a href="catalog.html" class="btn btn--solid empty-state__action">${t("startShopping")}</a>
      </div>`;
    summaryMount.style.display = "none";
    return;
  }
  layout.classList.remove("cart__layout--empty");

  mount.innerHTML = cart.items.map(({ product: p, qty }) => `
    <div class="cart__item" data-cart-item="${p.id}">
      <a href="product.html?id=${p.id}" class="cart__item-img"><img src="${p.img}" alt="${escapeHtml(p.name)}" data-fallback></a>
      <div>
        <a href="product.html?id=${p.id}"><div class="cart__item-name">${escapeHtml(p.name)}</div></a>
        <div class="cart__item-sub">${escapeHtml(p.brand)}</div>
      </div>
      <div class="qty-control">
        <button type="button" class="qty-control__btn" data-cart-minus="${p.id}" aria-label="−">−</button>
        <span class="qty-control__value">${qty}</span>
        <button type="button" class="qty-control__btn" data-cart-plus="${p.id}" aria-label="+" ${qty>=20 ? "disabled":""}>+</button>
      </div>
      <div class="cart__item-price">${formatPrice(p.price * qty)}</div>
      <button type="button" class="cart__item-remove" data-cart-remove="${p.id}" aria-label="✕">
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>
      </button>
    </div>`).join("");

  attachImgFallback(mount);

  mount.querySelectorAll("[data-cart-minus]").forEach(btn=>{
    btn.addEventListener("click", async ()=>{
      const id = Number(btn.dataset.cartMinus);
      const newQty = (CART_QTY[id] || 1) - 1;
      try{ await Api.setCartItemQty(id, newQty); }
      catch(e){ showToast(e.message); }
      loadAndRenderCart();
    });
  });
  mount.querySelectorAll("[data-cart-plus]").forEach(btn=>{
    btn.addEventListener("click", async ()=>{
      const id = Number(btn.dataset.cartPlus);
      try{ await Api.addCartItem(id, 1); }
      catch(e){ showToast(e.message); }
      loadAndRenderCart();
    });
  });
  mount.querySelectorAll("[data-cart-remove]").forEach(btn=>{
    btn.addEventListener("click", async ()=>{
      const id = Number(btn.dataset.cartRemove);
      try{ await Api.removeCartItem(id); showToast(t("toastRemoveCart")); }
      catch(e){ showToast(e.message); }
      loadAndRenderCart();
    });
  });

  renderSummary(cart);
}

// buyurtma xulosasi (narx, chegirma, yetkazib berish)
function renderSummary(cart){
  const summaryMount = document.querySelector("#summary-mount");
  summaryMount.style.display = "block";

  summaryMount.innerHTML = `
    <h3 class="order-summary__title">${t("orderSummary")}</h3>
    <div class="order-summary__row"><span>${tf("productsCount",{n:cart.itemCount})}</span><span>${formatPrice(cart.subtotal)}</span></div>
    ${cart.discount ? `<div class="order-summary__row order-summary__row--discount"><span>${t("discount")}</span><span>−${formatPrice(cart.discount)}</span></div>` : ""}
    <div class="order-summary__row"><span>${t("shipping")}</span><span>${cart.shipping === 0 ? t("free") : formatPrice(cart.shipping)}</span></div>
    <div class="order-summary__promo">
      <input type="text" class="order-summary__promo-input" placeholder="${t('promoPlaceholder')}" data-promo-input>
      <button type="button" class="btn btn--ghost btn--sm" data-promo-apply>${t("promoApply")}</button>
    </div>
    <div class="order-summary__row order-summary__row--total"><span>${t("total")}</span><span>${formatPrice(cart.total)}</span></div>
    <button type="button" class="btn btn--primary btn--block btn--lg order-summary__checkout" data-checkout>${t("checkout")}</button>
  `;

  summaryMount.querySelector("[data-promo-apply]").addEventListener("click", ()=>{
    const val = summaryMount.querySelector("[data-promo-input]").value.trim();
    showToast(val ? tf("promoChecking",{v:val}) : t("promoEmpty"));
  });
  summaryMount.querySelector("[data-checkout]").addEventListener("click", async ()=>{
    try{
      await Api.createOrder();
      showToast(t("checkoutMsg"));
      loadAndRenderCart();
    }catch(e){
      showToast(e.message);
    }
  });
}

// statik matnlarni tilga moslash
function renderCartStaticTexts(){
  const title = document.querySelector("#cart-page-title");
  const crumbHome = document.querySelector("#crumb-home");
  const crumbCart = document.querySelector("#crumb-cart");
  if(title) title.textContent = t("cartTitle");
  if(crumbHome) crumbHome.textContent = t("home");
  if(crumbCart) crumbCart.textContent = t("cartTitle");
}

// sahifa yuklanganda ishga tushirish
document.addEventListener("DOMContentLoaded", async ()=>{
  await initLayout();
  renderCartStaticTexts();
  await loadAndRenderCart();
});
