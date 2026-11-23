/* Mahsulot sharhlari: ro'yxat, sotuvchi javobi, mijoz sharh qoldirishi (product.html) */
(function(){
  const productId = Number(new URLSearchParams(location.search).get("id"));
  const mount = () => document.querySelector("#reviews-mount");
  const stars = (n) => "★".repeat(n) + "☆".repeat(5 - n);
  const fmt = (iso) => String(iso || "").slice(0, 10);

  async function load(){
    const list = await apiRequest(`/api/products/${productId}/reviews`);
    const form = getToken() ? `
      <form class="review-form" data-review-form>
        <div class="form-field"><label class="form-field__label">Baho</label>
          <select class="form-field__input" name="rating">
            <option value="5">5 ★</option><option value="4">4 ★</option><option value="3">3 ★</option><option value="2">2 ★</option><option value="1">1 ★</option>
          </select></div>
        <div class="form-field"><label class="form-field__label">Sharhingiz</label>
          <textarea class="form-field__input" rows="3" name="text" required minlength="3"></textarea></div>
        <div class="form-field__error" data-review-error></div>
        <button type="submit" class="btn btn--solid">Sharh qoldirish</button>
      </form>` : `<p class="review-login">Sharh qoldirish uchun tizimga kiring.</p>`;

    mount().innerHTML = `
      ${form}
      <div class="review-list">
        ${list.length ? list.map(r => `
          <article class="review">
            <div class="review__head"><strong>${escapeHtml(r.name)}</strong>
              <span class="review__stars">${stars(r.rating)}</span><span class="review__date">${fmt(r.createdAt)}</span></div>
            <p class="review__text">${escapeHtml(r.text)}</p>
            ${r.sellerReply ? `<div class="review__reply"><strong>Sotuvchi javobi:</strong> ${escapeHtml(r.sellerReply)}</div>` : ""}
          </article>`).join("") : `<p class="review-login">Hali sharhlar yo'q. Birinchi bo'lib sharh qoldiring!</p>`}
      </div>`;

    const f = mount().querySelector("[data-review-form]");
    if(f) f.addEventListener("submit", async (e)=>{
      e.preventDefault();
      const err = f.querySelector("[data-review-error]"); err.textContent = "";
      try{
        await apiRequest(`/api/products/${productId}/reviews`, { method: "POST", body: { rating: f.rating.value, text: f.text.value.trim() } });
        showToast("Sharhingiz qabul qilindi");
        load();
      }catch(e2){ err.textContent = e2.message; }
    });
  }

  document.addEventListener("DOMContentLoaded", ()=>{ if(mount() && productId) load().catch(()=>{}); });
})();
