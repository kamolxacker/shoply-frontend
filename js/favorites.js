/* ==========================================================================
   Sevimlilar sahifasi mantiqi (backend API orqali)
   ========================================================================== */

// sevimlilarni backend'dan yuklab render qilish
async function renderFavorites(){
  const mount = document.querySelector("#fav-mount");
  const countEl = document.querySelector("#fav-count");

  let favorites;
  try{
    favorites = await Api.getFavorites();
  }catch(e){
    mount.innerHTML = `<div class="empty-state"><div class="empty-state__icon">⚠️</div><p class="empty-state__text">${escapeHtml(e.message)}</p></div>`;
    return;
  }

  FAV_SET = new Set(favorites.map(p => p.id));
  updateHeaderBadges();
  countEl.textContent = favorites.length ? tf("favItemsCount",{n:favorites.length}) : "";

  if(!favorites.length){
    mount.innerHTML = `
      <div class="empty-state">
        <div class="empty-state__icon">🤍</div>
        <h3 class="empty-state__title">${t("favEmptyTitle")}</h3>
        <p class="empty-state__text">${t("favEmptyText")}</p>
        <a href="catalog.html" class="btn btn--solid empty-state__action">${t("viewCatalog")}</a>
      </div>`;
    return;
  }
  mount.innerHTML = `<div class="product-grid">${favorites.map(productCardHTML).join("")}</div>`;
}

// statik matnlarni tilga moslash
function renderFavoritesStaticTexts(){
  const title = document.querySelector("#fav-page-title");
  const crumbHome = document.querySelector("#crumb-home");
  const crumbFav = document.querySelector("#crumb-fav");
  if(title) title.textContent = t("favTitle");
  if(crumbHome) crumbHome.textContent = t("home");
  if(crumbFav) crumbFav.textContent = t("favTitle");
}

// sahifa yuklanganda ishga tushirish
document.addEventListener("DOMContentLoaded", async ()=>{
  await initLayout();
  renderFavoritesStaticTexts();
  await renderFavorites();
  document.body.addEventListener("click", (e)=>{
    if(e.target.closest("[data-fav-toggle]")){
      setTimeout(renderFavorites, 250);
    }
  });
});
