/* ==========================================================================
   Bosh sahifa mantiqi: hero slayder, kategoriyalar, mahsulot bo'limlari
   (barcha mahsulot va banner ma'lumotlari backend API orqali olinadi,
   bannerlar admin panel orqali tahrirlanadi)
   ========================================================================== */

// hero slayder
function renderHero(slides){
  const mount = document.querySelector("#hero-mount");
  if(!mount || !slides.length) return;
  let current = 0;

  function render(){
    const s = slides[current];
    mount.innerHTML = `
      <div class="hero" style="${s.bgImg ? `background-image:linear-gradient(90deg,rgba(8,24,22,.78),rgba(8,24,22,.25)),url('${mediaUrl(s.bgImg)}');background-size:cover;background-position:center;` : ""}">
        <div class="hero__content">
          ${s.eyebrow ? `<span class="hero__eyebrow"><span class="hero__eyebrow-dot"></span>${escapeHtml(s.eyebrow)}</span>` : ""}
          <h1 class="hero__title">${escapeHtml(s.title)}</h1>
          ${s.text ? `<p class="hero__text">${escapeHtml(s.text)}</p>` : ""}
          <div class="hero__actions">
            <a href="${escapeHtml(s.link || 'catalog.html')}" class="btn btn--primary btn--lg">${escapeHtml(s.ctaText)}</a>
            ${s.priceTag ? `<span class="hero__price-tag">${escapeHtml(s.priceTag)}</span>` : ""}
          </div>
        </div>
        ${slides.length > 1 ? `<div class="hero__dots">
          ${slides.map((_,i)=>`<button type="button" data-dot="${i}" class="hero__dot ${i===current?'hero__dot--active':''}" aria-label="Slide ${i+1}"></button>`).join("")}
        </div>` : ""}
      </div>`;
    mount.querySelectorAll("[data-dot]").forEach(btn=>{
      btn.addEventListener("click", ()=>{ current = Number(btn.dataset.dot); render(); resetTimer(); });
    });
  }
  let timer;
  function resetTimer(){
    clearTimeout(timer);
    if(slides.length < 2) return;
    timer = setTimeout(()=>{ current = (current+1) % slides.length; render(); resetTimer(); }, 5000);
  }
  render();
  resetTimer();
}

// promo bannerlar (admin panel orqali boshqariladi)
function renderPromoBanners(banners){
  const mount = document.querySelector("#promo-banners-mount");
  if(!mount || !banners.length) return;
  mount.innerHTML = `<div class="promo-banners">
    ${banners.map(b => `
      <div class="promo-banners__item promo-banners__item--${b.variant}">
        <h3 class="promo-banners__title">${escapeHtml(b.title)}</h3>
        ${b.text ? `<p class="promo-banners__text">${escapeHtml(b.text)}</p>` : ""}
        <a href="${escapeHtml(b.link)}" class="btn ${b.variant==='gold' ? 'btn--solid':'btn--outline'} btn--sm">${escapeHtml(b.ctaText)}</a>
      </div>`).join("")}
  </div>`;
}

// kategoriya panjarasi
function renderCategoryGrid(categories){
  const mount = document.querySelector("#cat-grid-mount");
  if(!mount) return;
  mount.innerHTML = categories.map(c => `
    <a class="category-grid__item" href="catalog.html?cat=${c.id}">
      <div class="category-grid__icon">${c.emoji}</div>
      <div class="category-grid__name">${tCat(c.id)}</div>
    </a>`).join("");
}

// mahsulot bo'limini render qilish (chegirma/yangi/top)
function renderProductSection(mountId, products){
  const mount = document.querySelector(mountId);
  if(!mount) return;
  mount.innerHTML = `<div class="product-grid">${products.map(productCardHTML).join("")}</div>`;
}

// statik matnlarni tilga moslash
function renderStaticTexts(){
  const map = {
    "#cat-section-eyebrow": "catSectionEyebrow",
    "#cat-section-title": "catSectionTitle",
    "#deals-eyebrow": "dealsEyebrow",
    "#deals-title": "dealsTitle",
    "#new-eyebrow": "newEyebrow",
    "#new-title": "newTitle",
    "#top-eyebrow": "topEyebrow",
    "#top-title": "topTitle",
    "#deals-view-all": "viewAll",
    "#new-view-all": "viewAll",
    "#top-view-all": "viewAll",
  };
  Object.entries(map).forEach(([sel, key])=>{
    const el = document.querySelector(sel);
    if(el) el.textContent = t(key);
  });
}

// sahifa yuklanganda ishga tushirish
document.addEventListener("DOMContentLoaded", async ()=>{
  const { categories } = await initLayout();
  renderStaticTexts();
  renderCategoryGrid(categories);

  try{
    const { hero, promo } = await Api.getBanners();
    renderHero(hero);
    renderPromoBanners(promo);
  }catch(e){ showToast(e.message); }

  try{
    const sections = await Api.getHomeSections();
    renderProductSection("#deals-mount", sections.deals);
    renderProductSection("#new-mount", sections.new);
    renderProductSection("#top-mount", sections.top);
  }catch(e){
    showToast(e.message);
  }
});
