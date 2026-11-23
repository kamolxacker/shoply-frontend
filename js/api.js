/* ==========================================================================
   api.js — Backend REST API bilan ishlash uchun yagona joy.
   Barcha tarmoq so'rovlari shu yerdan o'tadi.
   ========================================================================== */

/** Mehmon (login qilmagan) foydalanuvchi uchun barqaror sessiya ID */
// mehmon sessiya ID sini olish/yaratish
function getSessionId(){
  let sid = localStorage.getItem("ss_session");
  if(!sid){
    sid = (typeof crypto !== "undefined" && crypto.randomUUID)
      ? crypto.randomUUID()
      : `sess-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    localStorage.setItem("ss_session", sid);
  }
  return sid;
}
// JWT tokenni olish
function getToken(){ return localStorage.getItem("ss_token"); }
// JWT tokenni saqlash/o'chirish
function setToken(token){
  if(token) localStorage.setItem("ss_token", token);
  else localStorage.removeItem("ss_token");
}

// backend'ga so'rov yuborish (umumiy wrapper)
async function apiRequest(pathname, { method = "GET", body } = {}){
  const headers = { "Content-Type": "application/json", "X-Session-Id": getSessionId() };
  const token = getToken();
  if(token) headers["Authorization"] = `Bearer ${token}`;

  let res;
  try{
    res = await fetch(window.SOTUV_API_BASE + pathname, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  }catch(networkErr){
    throw new Error("Serverga ulanib bo'lmadi. Internetni yoki backend ishga tushganini tekshiring.");
  }

  let data = null;
  try{ data = await res.json(); }catch(e){ /* bo'sh javob bo'lishi mumkin */ }

  if(!res.ok){
    throw new Error((data && data.error) || `So'rov muvaffaqiyatsiz (HTTP ${res.status})`);
  }
  return data;
}

// barcha API endpointlari
const Api = {
  getCategories: () => apiRequest("/api/categories"),
  getMegaMenu: () => apiRequest("/api/categories/megamenu"),
  getProducts: (params={}) => apiRequest("/api/products?" + new URLSearchParams(params).toString()),
  getFacets: (params={}) => apiRequest("/api/products/facets?" + new URLSearchParams(params).toString()),
  getProduct: (id) => apiRequest(`/api/products/${id}`),
  getSimilar: (id) => apiRequest(`/api/products/${id}/similar`),
  getHomeSections: () => apiRequest("/api/products/home-sections"),
  getBanners: () => apiRequest("/api/banners"),
  searchSuggest: (q) => apiRequest("/api/products/search-suggest?q=" + encodeURIComponent(q)),

  register: (payload) => apiRequest("/api/auth/register", { method: "POST", body: payload }),
  login: (payload) => apiRequest("/api/auth/login", { method: "POST", body: payload }),
  me: () => apiRequest("/api/auth/me"),

  getCart: () => apiRequest("/api/cart"),
  addCartItem: (productId, qty=1) => apiRequest("/api/cart/items", { method: "POST", body: { productId, qty } }),
  setCartItemQty: (productId, qty) => apiRequest(`/api/cart/items/${productId}`, { method: "PATCH", body: { qty } }),
  removeCartItem: (productId) => apiRequest(`/api/cart/items/${productId}`, { method: "DELETE" }),

  getFavorites: () => apiRequest("/api/favorites"),
  toggleFavorite: (productId) => apiRequest(`/api/favorites/${productId}/toggle`, { method: "POST" }),

  createOrder: () => apiRequest("/api/orders", { method: "POST" }),

  // profil: buyurtmalar tarixi, "menga yoqdi" va tavsiyalar, promokodlar
  getMyOrders: () => apiRequest("/api/orders/mine"),
  likeOrder: (id, liked) => apiRequest(`/api/orders/${id}/like`, { method: "POST", body: { liked } }),
  getRecommendations: () => apiRequest("/api/orders/recommendations"),
  getPromos: () => apiRequest("/api/promos"),

  // admin panel uchun
  uploadProductImage: (filename, dataUrl) => apiRequest("/api/products/upload", { method: "POST", body: { filename, dataUrl } }),
  createProduct: (payload) => apiRequest("/api/products", { method: "POST", body: payload }),
  updateProduct: (id, payload) => apiRequest(`/api/products/${id}`, { method: "PUT", body: payload }),
  deleteProduct: (id) => apiRequest(`/api/products/${id}`, { method: "DELETE" }),
  getAdminStats: () => apiRequest("/api/admin/stats"),

  // bannerlar (admin)
  getAllBanners: () => apiRequest("/api/banners/all"),
  createBanner: (payload) => apiRequest("/api/banners", { method: "POST", body: payload }),
  updateBanner: (id, payload) => apiRequest(`/api/banners/${id}`, { method: "PUT", body: payload }),
  deleteBanner: (id) => apiRequest(`/api/banners/${id}`, { method: "DELETE" }),

  // katalog mega-menyu guruhlari (admin)
  getSubcategoryGroups: () => apiRequest("/api/categories/groups"),
  createSubcategoryGroup: (payload) => apiRequest("/api/categories/groups", { method: "POST", body: payload }),
  updateSubcategoryGroup: (id, payload) => apiRequest(`/api/categories/groups/${id}`, { method: "PUT", body: payload }),
  deleteSubcategoryGroup: (id) => apiRequest(`/api/categories/groups/${id}`, { method: "DELETE" }),

  // mijoz so'rovlari (savol-javob)
  submitInquiry: (payload) => apiRequest("/api/inquiries", { method: "POST", body: payload }),
  getMyInquiries: () => apiRequest("/api/inquiries/mine"),
  getAllInquiries: (status) => apiRequest("/api/inquiries" + (status ? `?status=${status}` : "")),
  replyInquiry: (id, reply) => apiRequest(`/api/inquiries/${id}`, { method: "PATCH", body: { reply } }),
};
