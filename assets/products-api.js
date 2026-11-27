/* ============================================================
   Зөвхөн түүнд — Барааны API клиент (зөвхөн Function-тэй ярьдаг)
   Энэ файлд НУУЦ КОД АГУУЛАГДАХГҮЙ.
   ============================================================ */

const PRODUCTS_API = "/api/products";

async function callProductsApi(payload){
  const res = await fetch(PRODUCTS_API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  let data = null;
  try{ data = await res.json(); }catch(e){ /* ignore */ }
  if(!res.ok){
    const err = new Error((data && data.error) || ("HTTP " + res.status));
    err.status = res.status;
    throw err;
  }
  return data;
}

// Нийтэд нээлттэй — Админ хэсгээс нэмсэн бараа + үндсэн 103 барааны засваруудыг
// + нэмсэн ангилал/хүлээн авагч + үндсэн хүлээн авагчдын засваруудыг нэг дор авна.
// Бүх хуудас ачаалах үед дуудна.
async function fetchProductsData(){
  try{
    const data = await callProductsApi({ action: "list" });
    return {
      products: (data && data.products) || [],
      overrides: (data && data.overrides) || {},
      categories: (data && data.categories) || {},
      recipients: (data && data.recipients) || {},
      recipientOverrides: (data && data.recipientOverrides) || {},
      campaigns: (data && data.campaigns) || []
    };
  }catch(e){
    console.warn("Custom products failed to load:", e);
    return { products: [], overrides: {}, categories: {}, recipients: {}, recipientOverrides: {}, campaigns: [] };
  }
}

// Огноогоор идэвхтэй кампанит ажлыг сонгоно (эхлэх/дуусах огнооны хооронд,
// active !== false бол). Олон идэвхтэй кампанит ажил зэрэгцвэл эхнийхийг авна.
function getActiveCampaign(campaigns){
  if(!Array.isArray(campaigns) || !campaigns.length) return null;
  const today = new Date().toISOString().slice(0,10);
  return campaigns.find(c =>
    c && c.active !== false &&
    c.startDate && c.endDate &&
    c.startDate <= today && today <= c.endDate
  ) || null;
}

// Хуучин нэрийг хадгалж байгаа (зарим хуучин дуудалт ашиглаж байж магадгүй)
async function listCustomProducts(){
  const data = await fetchProductsData();
  return data.products;
}

// Эдгээр функцууд зөвхөн зөв PIN-тэй бол ажиллана. admin.html ашигладаг.
async function adminAddProduct(pin, product){
  return callProductsApi({ action: "add", pin, product });
}
async function adminUpdateProduct(pin, id, product){
  return callProductsApi({ action: "update", pin, id, product });
}
async function adminDeleteProduct(pin, id){
  return callProductsApi({ action: "delete", pin, id });
}
async function adminSetOverride(pin, id, patch){
  return callProductsApi({ action: "setOverride", pin, id, patch });
}
async function adminClearOverride(pin, id){
  return callProductsApi({ action: "clearOverride", pin, id });
}
async function adminAddCategory(pin, category){
  return callProductsApi({ action: "addCategory", pin, category });
}
async function adminUpdateCategory(pin, key, label, iconRef){
  return callProductsApi({ action: "updateCategory", pin, key, label, iconRef });
}
async function adminDeleteCategory(pin, key){
  return callProductsApi({ action: "deleteCategory", pin, key });
}
async function adminAddRecipient(pin, recipient){
  return callProductsApi({ action: "addRecipient", pin, recipient });
}
async function adminUpdateRecipient(pin, key, recipient){
  return callProductsApi({ action: "updateRecipient", pin, key, recipient });
}
async function adminDeleteRecipient(pin, key){
  return callProductsApi({ action: "deleteRecipient", pin, key });
}
async function adminSetRecipientOverride(pin, key, patch){
  return callProductsApi({ action: "setRecipientOverride", pin, key, patch });
}
async function adminClearRecipientOverride(pin, key){
  return callProductsApi({ action: "clearRecipientOverride", pin, key });
}
async function adminListCampaigns(pin){
  const data = await callProductsApi({ action: "listCampaigns", pin });
  return (data && data.campaigns) || [];
}
async function adminSaveCampaign(pin, campaign){
  return callProductsApi({ action: "saveCampaign", pin, campaign });
}
async function adminDeleteCampaign(pin, id){
  return callProductsApi({ action: "deleteCampaign", pin, id });
}
async function adminListCoupons(pin){
  const data = await callProductsApi({ action: "listCoupons", pin });
  return (data && data.coupons) || {};
}
async function adminAddCoupon(pin, coupon){
  return callProductsApi({ action: "addCoupon", pin, coupon });
}
async function adminUpdateCoupon(pin, code, coupon){
  return callProductsApi({ action: "updateCoupon", pin, code, coupon });
}
async function adminDeleteCoupon(pin, code){
  return callProductsApi({ action: "deleteCoupon", pin, code });
}

// assets/data.js-ийн статик 103 бараан дээр Админ хэсгийн засвар (overrides)
// болон шинээр нэмсэн (custom) бараа/ангилал/хүлээн авагчдыг нэгтгэж, PRODUCTS,
// CATEGORIES, RECIPIENTS массивуудыг бүрэн болгоно. Бүх хуудас render хийхээсээ
// ӨМНӦ үүнийг await хийнэ. Анхны байдлын "цэвэр" хувийг хадгалж байна — Админ
// засвар/нэмэлтээ арилгахад (revert/delete) яг чухал нь, эс бөгөөс хуучин утга
// наалдсан хэвээр үлдэх эрсдэлтэй.
const BASE_PRODUCTS = JSON.parse(JSON.stringify(PRODUCTS));
const BASE_CATEGORIES = JSON.parse(JSON.stringify(CATEGORIES));
const BASE_RECIPIENTS = JSON.parse(JSON.stringify(RECIPIENTS));

// ── Нэг өдрийн хямдрал (Black Friday) ──────────────────────────────────────
// Зөвхөн date өдөр (Улаанбаатарын цагаар) бүх барааны үнэ percent% буурна.
// Админ хуудсанд үнэ өөрчлөгдөхгүй (админ жинхэнэ үнийг харж засна).
const SITE_SALE = { name: "Black Friday", percent: 20, date: "2026-11-27" };

function isSiteSaleActive(){
  const ub = new Date(Date.now() + 8 * 3600 * 1000).toISOString().slice(0, 10); // UTC+8
  return ub === SITE_SALE.date;
}

function applySiteSale(){
  if(/admin/i.test(location.pathname)) return;
  if(!isSiteSaleActive()) return;
  const k = 1 - SITE_SALE.percent / 100;
  PRODUCTS.forEach(p => {
    if(!p || !(p.price > 0)) return;
    p.oldPrice = p.price;
    p.price = Math.round(p.price * k / 100) * 100; // 100₮-д бүхэлчилнэ
  });
  window.SITE_SALE_ACTIVE = SITE_SALE;
  const show = () => {
    if(document.getElementById("site-sale-bar") || !document.body) return;
    const bar = document.createElement("div");
    bar.id = "site-sale-bar";
    bar.style.cssText = "background:#111;color:#fff;text-align:center;padding:9px 14px;font:600 14px/1.35 system-ui,-apple-system,sans-serif;letter-spacing:.2px";
    bar.innerHTML = '<span style="background:#ff3b5c;color:#fff;border-radius:6px;padding:2px 8px;margin-right:8px">BLACK FRIDAY</span>Зөвхөн өнөөдөр бүх бараа -' + SITE_SALE.percent + '% · 23:59 хүртэл';
    document.body.insertBefore(bar, document.body.firstChild);
  };
  if(document.body) show(); else document.addEventListener("DOMContentLoaded", show);
}

let LAST_OVERRIDES = {};
let LAST_RECIPIENT_OVERRIDES = {};
window.ACTIVE_CAMPAIGN = null;

async function initProducts(){
  const data = await fetchProductsData();
  LAST_OVERRIDES = data.overrides;
  LAST_RECIPIENT_OVERRIDES = data.recipientOverrides;
  window.ACTIVE_CAMPAIGN = getActiveCampaign(data.campaigns);

  // CATEGORIES, RECIPIENTS-ийг ШИНЭЭР сэргээж, дараа нь хамгийн сүүлийн нэмэлтийг тавина.
  Object.keys(CATEGORIES).forEach(k => delete CATEGORIES[k]);
  Object.assign(CATEGORIES, BASE_CATEGORIES);
  Object.values(data.categories).forEach(c => { CATEGORIES[c.key] = c; });

  Object.keys(RECIPIENTS).forEach(k => delete RECIPIENTS[k]);
  Object.assign(RECIPIENTS, BASE_RECIPIENTS);
  Object.entries(data.recipientOverrides).forEach(([key, patch]) => {
    if(RECIPIENTS[key]) Object.assign(RECIPIENTS[key], patch);
  });
  Object.values(data.recipients).forEach(r => { RECIPIENTS[r.key] = r; });

  // PRODUCTS-ийг БАЗА-аас ШИНЭЭР сэргээж, дараа нь хамгийн сүүлийн
  // overrides-ыг л давхар тавина — өмнөх дуудлагуудын хуучин утга үлдэхгүй.
  PRODUCTS.length = 0;
  const ALL_PRODUCTS_INCLUDING_HIDDEN = [];
  BASE_PRODUCTS.forEach(bp => {
    const p = Object.assign({}, bp);
    if(!p.role) p.role = defaultRoleForCategory(p.category);
    const ov = data.overrides[String(p.id)];
    if(ov) Object.assign(p, ov);
    ALL_PRODUCTS_INCLUDING_HIDDEN.push(p);
    if(!p.hidden) PRODUCTS.push(p);
  });

  data.products.forEach(p => {
    if(!p.role) p.role = defaultRoleForCategory(p.category);
    if(!p.recipients) p.recipients = tagRecipients(p);
    ALL_PRODUCTS_INCLUDING_HIDDEN.push(p);
    if(!p.hidden) PRODUCTS.push(p);
  });

  // Meridian-маягийн шинэ зургийг (assets/data.js → PHOTO_PATCH) тавина.
  if(typeof PHOTO_PATCH !== "undefined"){
    ALL_PRODUCTS_INCLUDING_HIDDEN.forEach(p => {
      const e = PHOTO_PATCH[p.id];
      if(!e) return;
      const tok = e[0], url = PHOTO_BASE + e[1];
      let hit = false;
      if(typeof p.image === "string" && p.image.includes(tok)){ p.image = url; hit = true; }
      if(Array.isArray(p.images)){
        const next = p.images.map(u => (typeof u === "string" && u.includes(tok)) ? url : u);
        if(next.some((u, i) => u !== p.images[i])){ p.images = next.filter((u, i) => next.indexOf(u) === i); hit = true; }
      }
      if(hit && !(Array.isArray(p.images) && p.images.length)) p.images = [url];
    });
  }

  if(typeof NAME_PATCH !== "undefined"){
    ALL_PRODUCTS_INCLUDING_HIDDEN.forEach(p => {
      const e = NAME_PATCH[p.id];
      if(e && p.name === e[0]) p.name = e[1];
    });
  }

  // Кактус / суккулент — нэрэнд аль нэг нь байвал хоёуланг нь шошголно (хайлтад хамт гарна).
  ALL_PRODUCTS_INCLUDING_HIDDEN.forEach(p => {
    if(/кактус|суккулент/i.test(p.name || "") && !/кактус/i.test(p.tag || "")) p.tag = "Кактус, суккулент";
  });

  window._ALL_PRODUCTS_ADMIN = ALL_PRODUCTS_INCLUDING_HIDDEN;

  applySiteSale();

  updateCartBadge();
}
