/* ==========================================================================
   utils.js — Mustaqil yordamchi funksiyalar (ma'lumotlarga bog'liq emas)
   ========================================================================== */
// narxni "123 456 so'm" formatiga o'tkazish
function formatPrice(n){
  return n.toLocaleString('ru-RU').replace(/,/g,' ') + " " + t("currencySom");
}

// XSS himoyasi (matnni xavfsizlashtirish)
function escapeHtml(str){
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// toast xabar ko'rsatish
let toastTimer = null;
function showToast(msg){
  let toast = document.querySelector(".toast");
  if(!toast){
    toast = document.createElement("div");
    toast.className = "toast";
    toast.innerHTML = `<span class="toast__dot"></span><span data-toast-text></span>`;
    document.body.appendChild(toast);
  }
  toast.querySelector("[data-toast-text]").textContent = msg;
  toast.classList.add("toast--show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(()=> toast.classList.remove("toast--show"), 2600);
}
