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
// нэг дор авна. Бүх хуудас ачаалах үед дуудна.
async function fetchProductsData(){
  try{
    const data = await callProductsApi({ action: "list" });
    return { products: (data && data.products) || [], overrides: (data && data.overrides) || {} };
  }catch(e){
    console.warn("Custom products failed to load:", e);
    return { products: [], overrides: {} };
  }
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

// assets/data.js-ийн статик 103 бараан дээр Админ хэсгийн засвар (overrides)
// болон шинээр нэмсэн (custom) бараануудыг нэгтгэж, PRODUCTS массивыг бүрэн
// болгоно. Бүх хуудас render хийхээсээ ӨМНӦ үүнийг await хийнэ.
// Анхны 103 барааны "цэвэр" хувийг хадгалж байна (overrides ороогүй) — Админ
// засвараа арилгахад (revert) яг чухал нь, эс бөгөөс хуучин утга PRODUCTS
// массивт "наалдсан" хэвээр үлдэх эрсдэлтэй.
const BASE_PRODUCTS = JSON.parse(JSON.stringify(PRODUCTS));

let LAST_OVERRIDES = {};

async function initProducts(){
  const data = await fetchProductsData();
  LAST_OVERRIDES = data.overrides;

  // PRODUCTS-ийг BASE_PRODUCTS-аас ШИНЭЭР сэргээж, дараа нь хамгийн сүүлийн
  // overrides-ыг л давхар тавина — өмнөх дуудлагуудын хуучин утга үлдэхгүй.
  PRODUCTS.length = 0;
  BASE_PRODUCTS.forEach(bp => {
    const p = Object.assign({}, bp);
    if(!p.role) p.role = defaultRoleForCategory(p.category);
    const ov = data.overrides[String(p.id)];
    if(ov) Object.assign(p, ov);
    PRODUCTS.push(p);
  });

  data.products.forEach(p => {
    if(!p.role) p.role = defaultRoleForCategory(p.category);
    if(!p.recipients) p.recipients = tagRecipients(p);
    PRODUCTS.push(p);
  });

  updateCartBadge();
}
