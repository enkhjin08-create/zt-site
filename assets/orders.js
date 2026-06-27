/* ============================================================
   Зөвхөн түүнд — Захиалгын API клиент (зөвхөн Function-тэй ярьдаг)
   Энэ файлд НУУЦ КОД (key, PIN) АГУУЛАГДАХГҮЙ. JSONBin Master Key,
   Админ PIN хоёул зөвхөн серверийн Netlify Function дотор (Environment
   Variables) хадгалагдана — netlify/functions/orders.js, README.md-г үзээрэй.
   ============================================================ */

const ORDERS_API = "/api/orders";

async function callOrdersApi(payload){
  const res = await fetch(ORDERS_API, {
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

// Нийтэд нээлттэй — PIN шаардахгүй. builder.html ашигладаг.
async function submitOrder(order){
  return callOrdersApi({ action: "submit", order });
}

// Нийтэд нээлттэй — захиалга баталгаажуулахаас өмнө купоны хямдралыг урьдчилан харуулна.
async function validateCoupon(code){
  return callOrdersApi({ action: "validateCoupon", code });
}

// Зөвхөн зөв PIN-тэй бол ажиллана. admin.html ашигладаг.
async function adminListOrders(pin){
  const data = await callOrdersApi({ action: "list", pin });
  return (data && data.orders) || [];
}

async function adminUpdateStatus(pin, id, status){
  return callOrdersApi({ action: "updateStatus", pin, id, status });
}
