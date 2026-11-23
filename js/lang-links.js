/* ==========================================================================
   Shoply — har bir sahifa manzili oxirida joriy til bo'ladi (?lang=uz|ru|en|uzc).
   1) sahifa ochilganda URL da til bo'lmasa, qo'shiladi;
   2) har qanday ichki havola bosilganda til qo'shiladi (dinamik kontent ham);
   3) JavaScript orqali o'tishlar uchun goTo(url) ishlatiladi.
   ========================================================================== */

// URL ga joriy tilni qo'shadi va nisbiy manzil qaytaradi
function withLangUrl(href){
  const u = new URL(href, location.href);
  u.searchParams.set("lang", getLang());
  return u.pathname + u.search + u.hash;
}

// sahifa ochilganda: URL da til bo'lmasa, uni manzilga yozib qo'yamiz (sahifa qayta yuklanmaydi)
function ensureLangInUrl(){
  const current = new URL(location.href);
  const lang = getLang();
  if(current.searchParams.get("lang") !== lang){
    current.searchParams.set("lang", lang);
    history.replaceState(null, "", current.pathname + current.search + current.hash);
  }
}

// JavaScript orqali sahifaga o'tish (tilni saqlagan holda)
function goTo(href){
  location.href = withLangUrl(href);
}

// har bir havola bosilishidan oldin tilni qo'shish (capture fazasi — navigatsiyadan oldin)
document.addEventListener("click", (e)=>{
  const a = e.target && e.target.closest ? e.target.closest("a[href]") : null;
  if(!a) return;
  const raw = a.getAttribute("href");
  if(!raw || /^(https?:|mailto:|tel:|#|javascript:)/.test(raw)) return;
  const u = new URL(raw, location.href);
  if(u.origin !== location.origin) return;
  if(u.searchParams.get("lang") === getLang()) return;
  a.setAttribute("href", withLangUrl(raw));
}, true);

ensureLangInUrl();

// barcha ichki havolalarning o'zida (atributda) ham til bo'lsin — sahifa yuklanganda va
// dinamik ravishda qo'shilgan (kartochka, menyu va h.k.) havolalar uchun ham
function rewriteLangAnchors(root){
  const lang = getLang();
  (root.querySelectorAll ? root.querySelectorAll("a[href]") : []).forEach(a => {
    const raw = a.getAttribute("href");
    if(!raw || /^(https?:|mailto:|tel:|#|javascript:)/.test(raw)) return;
    const u = new URL(raw, location.href);
    if(u.origin !== location.origin || u.searchParams.get("lang") === lang) return;
    a.setAttribute("href", withLangUrl(raw));
  });
}
function startLangAnchorObserver(){
  rewriteLangAnchors(document);
  new MutationObserver(muts => {
    muts.forEach(m => m.addedNodes.forEach(n => {
      if(n.nodeType !== 1) return;
      if(n.matches && n.matches("a[href]")) rewriteLangAnchors({ querySelectorAll: () => [n] });
      rewriteLangAnchors(n);
    }));
  }).observe(document.documentElement, { childList: true, subtree: true });
}
if(document.readyState === "loading") document.addEventListener("DOMContentLoaded", startLangAnchorObserver);
else startLangAnchorObserver();
