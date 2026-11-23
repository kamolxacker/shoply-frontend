/* ==========================================================================
   Katalog sahifasi: qidiruv, filtrlash, saralash va sahifalash — barchasi
   backend API orqali (server-side filtrlash/saralash/sahifalash)
   ========================================================================== */

const PAGE_SIZE = 24;

const state = {
  q: "",
  cat: "",
  sale: false,
  minPrice: null,
  maxPrice: null,
  brands: new Set(),
  minRating: 0,
  sort: "popular",
  page: 1,
};

let loadedItems = [];
let totalCount = 0;

// URL parametrlarini holatga o'qish
function readParamsToState(){
  const params = new URLSearchParams(location.search);
  state.q = params.get("q") || "";
  state.cat = params.get("cat") || "";
  state.sale = params.get("sale") === "1";
}

// backend uchun so'rov parametrlarini tuzish
function buildParams(page){
  const params = { sort: state.sort, page, pageSize: PAGE_SIZE };
  if(state.q) params.q = state.q;
  if(state.cat) params.cat = state.cat;
  if(state.sale) params.sale = "1";
  if(state.minPrice != null) params.minPrice = state.minPrice;
  if(state.maxPrice != null) params.maxPrice = state.maxPrice;
  if(state.brands.size) params.brands = [...state.brands].join(",");
  if(state.minRating) params.minRating = state.minRating;
  return params;
}

// sahifalashni 1-holatga qaytarish
function resetPaging(){
  state.page = 1;
}

// mahsulotlarni backend'dan olib render qilish
async function fetchAndRenderResults({ append = false } = {}){
  const grid = document.querySelector("#results-mount");
  if(!append){
    grid.innerHTML = `<div class="empty-state"><div class="empty-state__icon">⏳</div><p class="empty-state__text">${t("loading")}</p></div>`;
  }
  try{
    const { items, total } = await Api.getProducts(buildParams(state.page));
    totalCount = total;
    loadedItems = append ? loadedItems.concat(items) : items;
    renderResultsDOM();
  }catch(e){
    grid.innerHTML = `<div class="empty-state"><div class="empty-state__icon">⚠️</div><p class="empty-state__text">${escapeHtml(e.message)}</p></div>`;
  }
}

// natijalar panelini chizish
function renderResultsDOM(){
  document.querySelector("#result-count").innerHTML = tf("resultCount", { n: totalCount });
  const grid = document.querySelector("#results-mount");

  const catName = state.cat ? tCat(state.cat) : t("allProducts");
  document.querySelector("#catalog-title").textContent = state.q ? tf("searchResultsFor", { q: state.q }) : catName;

  if(!totalCount){
    grid.innerHTML = `
      <div class="empty-state">
        <div class="empty-state__icon">🔍</div>
        <h3 class="empty-state__title">${t("notFoundTitle")}</h3>
        <p class="empty-state__text">${t("notFoundText")}</p>
      </div>`;
    return;
  }

  grid.innerHTML = `<div class="product-grid">${loadedItems.map(productCardHTML).join("")}</div>` + paginationHTML();
  bindPaginationEvents();
}

/* ---------- Sahifalash: "Yana ko'rsatish" + raqamli navigatsiya ---------- */
// sahifalash (pagination) HTML
function paginationHTML(){
  if(totalCount <= PAGE_SIZE) return "";
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);
  const activePage = state.page;
  const shown = loadedItems.length;
  const remaining = totalCount - shown;

  const moreBtn = remaining > 0
    ? `<button type="button" class="pagination__more" data-show-more>${tf("showMore", { n: Math.min(PAGE_SIZE, remaining) })}</button>`
    : "";

  const maxVisiblePages = 3;
  let pageButtons = "";
  for(let p = 1; p <= Math.min(maxVisiblePages, totalPages); p++){
    pageButtons += `<button type="button" class="pagination__page ${p===activePage ? 'pagination__page--active':''}" data-page="${p}">${p}</button>`;
  }
  if(totalPages > maxVisiblePages){
    pageButtons += `<span class="pagination__ellipsis">…</span>`;
  }

  return `
    <div class="pagination">
      ${moreBtn}
      <div class="pagination__nav">
        <button type="button" class="pagination__arrow" data-page-prev ${activePage<=1 ? "disabled":""}>‹ ${t("prevPage")}</button>
        ${pageButtons}
        <button type="button" class="pagination__arrow" data-page-next ${activePage>=totalPages ? "disabled":""}>${t("nextPage")} ›</button>
      </div>
    </div>`;
}

// sahifalash tugmalariga listener ulash
function bindPaginationEvents(){
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  const moreBtn = document.querySelector("[data-show-more]");
  if(moreBtn){
    moreBtn.addEventListener("click", ()=>{
      state.page += 1;
      fetchAndRenderResults({ append: true });
    });
  }
  document.querySelectorAll("[data-page]").forEach(btn=>{
    btn.addEventListener("click", ()=>{
      state.page = Number(btn.dataset.page);
      fetchAndRenderResults({ append: false }).then(scrollToResults);
    });
  });
  const prevBtn = document.querySelector("[data-page-prev]");
  if(prevBtn){
    prevBtn.addEventListener("click", ()=>{
      if(state.page <= 1) return;
      state.page -= 1;
      fetchAndRenderResults({ append: false }).then(scrollToResults);
    });
  }
  const nextBtn = document.querySelector("[data-page-next]");
  if(nextBtn){
    nextBtn.addEventListener("click", ()=>{
      if(state.page >= totalPages) return;
      state.page += 1;
      fetchAndRenderResults({ append: false }).then(scrollToResults);
    });
  }
}
// natijalar boshiga skroll qilish
function scrollToResults(){
  const el = document.querySelector("#results-mount");
  if(el && typeof el.scrollIntoView === "function"){
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

/* ---------- Filtrlar ---------- */
// filtr paneli
async function renderFilters(){
  const mount = document.querySelector("#filters-mount");
  let brandCounts = {};
  try{
    const facets = await Api.getFacets({ cat: state.cat });
    brandCounts = facets.brands || {};
  }catch(e){ /* filtr panelini bo'sh brend ro'yxati bilan ko'rsatamiz */ }

  mount.innerHTML = `
    <div class="filters__block">
      <div class="filters__title">${t("filterPriceRange")}</div>
      <div class="filters__price-inputs">
        <input type="number" placeholder="${t('filterFrom')}" data-price-min min="0">
        <span>—</span>
        <input type="number" placeholder="${t('filterTo')}" data-price-max min="0">
      </div>
      <button type="button" class="btn btn--ghost btn--sm btn--block" data-apply-price>${t("filterApply")}</button>
    </div>
    <div class="filters__block">
      <div class="filters__title">${t("filterBrand")}</div>
      ${Object.keys(brandCounts).map(b => `
        <label class="filters__checkbox-row">
          <input type="checkbox" data-brand-checkbox value="${escapeHtml(b)}" ${state.brands.has(b) ? "checked":""}>
          ${escapeHtml(b)} <span class="filters__checkbox-count">${brandCounts[b]}</span>
        </label>`).join("")}
    </div>
    <div class="filters__block">
      <div class="filters__title">${t("filterRating")}</div>
      <div class="filters__star-filter">
        ${[4,3,2].map(r => `
          <label class="filters__star-option"><input type="radio" name="rating" value="${r}" data-rating-radio ${state.minRating===r?"checked":""}> ${starString(r)} ${t("filterAndAbove")}</label>`).join("")}
        <label class="filters__star-option"><input type="radio" name="rating" value="0" data-rating-radio ${state.minRating===0?"checked":""}> ${t("filterAll")}</label>
      </div>
    </div>
    <div class="filters__block">
      <label class="filters__checkbox-row">
        <input type="checkbox" data-sale-checkbox ${state.sale ? "checked":""}> ${t("filterOnlyDiscount")}
      </label>
    </div>
  `;

  const applyPrice = mount.querySelector("[data-apply-price]");
  const minInput = mount.querySelector("[data-price-min]");
  const maxInput = mount.querySelector("[data-price-max]");
  if(state.minPrice != null) minInput.value = state.minPrice;
  if(state.maxPrice != null) maxInput.value = state.maxPrice;

  applyPrice.addEventListener("click", ()=>{
    let min = minInput.value;
    let max = maxInput.value;
    let minNum = min ? Math.max(0, Number(min)) : null;
    let maxNum = max ? Math.max(0, Number(max)) : null;
    if(minNum != null && maxNum != null && minNum > maxNum){
      [minNum, maxNum] = [maxNum, minNum];
    }
    state.minPrice = minNum;
    state.maxPrice = maxNum;
    resetPaging();
    fetchAndRenderResults();
    renderChips();
  });
  [minInput, maxInput].forEach(inp=>{
    inp.addEventListener("keydown", (e)=>{
      if(e.key === "Enter"){ e.preventDefault(); applyPrice.click(); }
    });
  });

  mount.querySelectorAll("[data-brand-checkbox]").forEach(cb=>{
    cb.addEventListener("change", ()=>{
      if(cb.checked) state.brands.add(cb.value); else state.brands.delete(cb.value);
      resetPaging(); fetchAndRenderResults(); renderChips();
    });
  });
  mount.querySelectorAll("[data-rating-radio]").forEach(r=>{
    r.addEventListener("change", ()=>{
      state.minRating = Number(r.value);
      resetPaging(); fetchAndRenderResults(); renderChips();
    });
  });
  mount.querySelector("[data-sale-checkbox]").addEventListener("change", (e)=>{
    state.sale = e.target.checked;
    resetPaging(); fetchAndRenderResults(); renderChips();
  });
}

// tanlangan filtr chiplari
function renderChips(){
  const mount = document.querySelector("#chips-mount");
  const chips = [];
  if(state.q) chips.push({ label: tf("chipSearch",{q:escapeHtml(state.q)}), clear: ()=>{ state.q=""; } });
  if(state.cat) chips.push({ label: escapeHtml(tCat(state.cat)), clear: ()=>{ state.cat=""; } });
  if(state.sale) chips.push({ label: t("chipSale"), clear: ()=>{ state.sale=false; } });
  if(state.minPrice != null || state.maxPrice != null){
    chips.push({ label: `${state.minPrice||0} — ${state.maxPrice||"∞"}`, clear: ()=>{ state.minPrice=null; state.maxPrice=null; } });
  }
  state.brands.forEach(b => chips.push({ label: escapeHtml(b), clear: ()=> state.brands.delete(b) }));
  if(state.minRating) chips.push({ label: tf("chipRatingUp",{n:state.minRating}), clear: ()=>{ state.minRating=0; } });

  mount.innerHTML = chips.map((c,i) => `
    <span class="catalog__chip" data-chip="${i}">${c.label} <button type="button" class="catalog__chip-remove" aria-label="✕">✕</button></span>`).join("");

  mount.querySelectorAll("[data-chip]").forEach((el,i)=>{
    el.querySelector("button").addEventListener("click", ()=>{
      chips[i].clear();
      resetPaging();
      fetchAndRenderResults();
      renderChips();
      renderFilters();
    });
  });
}

// saralash select'ini to'ldirish
function renderSortOptions(){
  const sel = document.querySelector("#sort-select");
  if(!sel) return;
  const current = sel.value || state.sort;
  sel.innerHTML = `
    <option value="popular">${t("sortPopular")}</option>
    <option value="price-asc">${t("sortPriceAsc")}</option>
    <option value="price-desc">${t("sortPriceDesc")}</option>
    <option value="rating">${t("sortRating")}</option>
    <option value="new">${t("sortNew")}</option>
  `;
  sel.value = current;
}

// yo'l izidagi 'Bosh sahifa' matni
function renderBreadcrumbHome(){
  const el = document.querySelector("#crumb-home");
  if(el) el.textContent = t("home");
}

// sahifa yuklanganda ishga tushirish
document.addEventListener("DOMContentLoaded", async ()=>{
  await initLayout();
  readParamsToState();
  renderBreadcrumbHome();
  renderSortOptions();
  await renderFilters();
  renderChips();
  await fetchAndRenderResults();

  document.querySelector("#sort-select").addEventListener("change", (e)=>{
    state.sort = e.target.value;
    resetPaging();
    fetchAndRenderResults();
  });
});
