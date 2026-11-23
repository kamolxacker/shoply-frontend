/* ==========================================================================
   contact.js — Savol-javob sahifasi: so'rov yuborish va o'z so'rovlarini
   (hamda admin javoblarini) ko'rish.
   ========================================================================== */

// avval yuborilgan so'rovlarni ko'rsatish
async function renderMyInquiries(){
  const mount = document.querySelector("#my-inquiries-mount");
  let list;
  try{
    list = await Api.getMyInquiries();
  }catch(e){ return; }

  if(!list.length){ mount.innerHTML = ""; return; }

  mount.innerHTML = `
    <h2 style="font-size:18px;margin-bottom:14px;">Sizning so'rovlaringiz</h2>
    ${list.map(inq => `
      <div style="background:var(--color-surface);border:1px solid var(--color-border);border-radius:var(--radius-md);padding:16px 18px;margin-bottom:12px;">
        <div style="display:flex;justify-content:space-between;gap:10px;margin-bottom:8px;">
          <span class="badge ${inq.status==='answered' ? 'badge--new' : 'badge--sale'}">${inq.status==='answered' ? "Javob berildi" : "Kutilmoqda"}</span>
          <span style="font-size:12px;color:var(--color-text-faint);">${inq.createdAt}</span>
        </div>
        <p style="font-size:14px;margin-bottom:8px;"><strong>Savol:</strong> ${escapeHtml(inq.message)}</p>
        ${inq.adminReply ? `<p style="font-size:14px;color:var(--color-primary-dark);background:var(--color-primary-light);padding:10px 12px;border-radius:var(--radius-sm);"><strong>Javob:</strong> ${escapeHtml(inq.adminReply)}</p>` : ""}
      </div>`).join("")}
  `;
}

// so'rov formasini yuborish
function bindInquiryForm(){
  document.querySelector("[data-inquiry-form]").addEventListener("submit", async (e)=>{
    e.preventDefault();
    const errorEl = document.querySelector("[data-form-error]");
    errorEl.classList.remove("form-field__error--show");

    const payload = {
      name: document.querySelector("[data-f-name]").value.trim(),
      phone: document.querySelector("[data-f-phone]").value.trim(),
      message: document.querySelector("[data-f-message]").value.trim(),
    };

    try{
      await Api.submitInquiry(payload);
      showToast("So'rovingiz qabul qilindi, tez orada javob beramiz");
      document.querySelector("[data-inquiry-form]").reset();
      renderMyInquiries();
    }catch(err){
      errorEl.textContent = err.message;
      errorEl.classList.add("form-field__error--show");
    }
  });
}

document.addEventListener("DOMContentLoaded", async ()=>{
  await initLayout();
  document.querySelector("#crumb-home").textContent = t("home");
  bindInquiryForm();
  renderMyInquiries();
});
