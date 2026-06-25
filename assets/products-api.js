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

// Нийтэд нээлттэй — Админ хэсгээс нэмсэн барааны жагсаалт. Бүх хуудас ачаалах үед дуудна.
async function listCustomProducts(){
  try{
    const data = await callProductsApi({ action: "list" });
    return (data && data.products) || [];
  }catch(e){
    console.warn("Custom products failed to load:", e);
    return [];
  }
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

// assets/data.js-ийн статик 103 бараан дээр Админ хэсгээс нэмсэн custom
// бараануудыг нэгтгэж, PRODUCTS массивыг бүрэн болгоно. Бүх хуудас
// render хийхээсээ ӨМНӦ үүнийг await хийнэ.
async function initProducts(){
  PRODUCTS.forEach(p => { if(!p.role) p.role = defaultRoleForCategory(p.category); });
  const custom = await listCustomProducts();
  custom.forEach(p => {
    if(!p.role) p.role = defaultRoleForCategory(p.category);
    if(!p.recipients) p.recipients = tagRecipients(p);
    if(!PRODUCTS.some(existing => existing.id === p.id)){
      PRODUCTS.push(p);
    }
  });
  updateCartBadge();
}
