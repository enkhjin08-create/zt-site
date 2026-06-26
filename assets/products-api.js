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
// + нэмсэн ангилал/хүлээн авагчдыг нэг дор авна. Бүх хуудас ачаалах үед дуудна.
async function fetchProductsData(){
  try{
    const data = await callProductsApi({ action: "list" });
    return {
      products: (data && data.products) || [],
      overrides: (data && data.overrides) || {},
      categories: (data && data.categories) || {},
      recipients: (data && data.recipients) || {}
    };
  }catch(e){
    console.warn("Custom products failed to load:", e);
    return { products: [], overrides: {}, categories: {}, recipients: {} };
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
async function adminAddCategory(pin, category){
  return callProductsApi({ action: "addCategory", pin, category });
}
async function adminDeleteCategory(pin, key){
  return callProductsApi({ action: "deleteCategory", pin, key });
}
async function adminAddRecipient(pin, recipient){
  return callProductsApi({ action: "addRecipient", pin, recipient });
}
async function adminDeleteRecipient(pin, key){
  return callProductsApi({ action: "deleteRecipient", pin, key });
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

let LAST_OVERRIDES = {};

async function initProducts(){
  const data = await fetchProductsData();
  LAST_OVERRIDES = data.overrides;

  // CATEGORIES, RECIPIENTS-ийг ШИНЭЭР сэргээж, дараа нь хамгийн сүүлийн нэмэлтийг тавина.
  Object.keys(CATEGORIES).forEach(k => delete CATEGORIES[k]);
  Object.assign(CATEGORIES, BASE_CATEGORIES);
  Object.values(data.categories).forEach(c => { CATEGORIES[c.key] = c; });

  Object.keys(RECIPIENTS).forEach(k => delete RECIPIENTS[k]);
  Object.assign(RECIPIENTS, BASE_RECIPIENTS);
  Object.values(data.recipients).forEach(r => { RECIPIENTS[r.key] = r; });

  // PRODUCTS-ийг БАЗА-аас ШИНЭЭР сэргээж, дараа нь хамгийн сүүлийн
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
