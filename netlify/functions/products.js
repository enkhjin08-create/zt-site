/* ============================================================
   Зөвхөн түүнд — Бараа удирдах Netlify Function (серверийн код)

   Энэ нь Админ хэсгээс нэмсэн НЭМЭЛТ бараануудыг хадгална (zuvhuntuund.com-ийн
   103 бэлэн барааны үндсэн сан, assets/data.js дотор хэвээр үлдэнэ). Энд
   нэмэгдсэн бараанууд сайт ачаалах үед үндсэн сантай НЭГТГЭГДЭНЭ
   (assets/products-api.js → app.js-ийн PRODUCTS массив).

   Захиалгын Function-тэй ИЖИЛ JSONBin bin-ийг ашигладаг (өөр түлхүүрээр —
   {"orders":[...], "products":[...]}) тул хоёул бичих үедээ нөгөөгийнхөө
   мэдээллийг устгахгүйн тулд бүтэн баримтыг (doc) уншиж бичнэ.

   4 үйлдэл дэмжинэ:
   - action="list"    → нийтэд нээлттэй (PIN шаардахгүй) — сайт дээр бараа харуулахад хэрэгтэй
   - action="add"     → зөвхөн зөв PIN-тэй бол шинэ бараа нэмнэ
   - action="update"  → зөвхөн зөв PIN-тэй бол бараа засна (үнэ, Дууссан төлөв г.м.)
   - action="delete"  → зөвхөн зөв PIN-тэй бол бараа устгана
   ============================================================ */

const JSONBIN_BASE = "https://api.jsonbin.io/v3/b/";

function json(status, body){
  return {
    statusCode: status,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  };
}

async function readDoc(){
  const res = await fetch(JSONBIN_BASE + process.env.JSONBIN_BIN_ID + "/latest", {
    headers: { "X-Master-Key": process.env.JSONBIN_MASTER_KEY }
  });
  if(!res.ok) throw new Error("JSONBin read failed: " + res.status);
  const data = await res.json();
  const record = data.record || {};
  return {
    orders: Array.isArray(record.orders) ? record.orders : [],
    products: Array.isArray(record.products) ? record.products : []
  };
}

async function writeDoc(doc){
  const res = await fetch(JSONBIN_BASE + process.env.JSONBIN_BIN_ID, {
    method: "PUT",
    headers: { "Content-Type": "application/json", "X-Master-Key": process.env.JSONBIN_MASTER_KEY },
    body: JSON.stringify(doc)
  });
  if(!res.ok) throw new Error("JSONBin write failed: " + res.status);
}

function checkPin(pin){
  const real = process.env.ADMIN_PIN;
  return typeof real === "string" && real.length > 0 && pin === real;
}

const VALID_CATEGORIES = ["cup", "giftset", "flower", "extra", "box"];
const VALID_ROLES = ["main", "extra", "container"];

function sanitizeProduct(input, existing){
  input = input || {};
  existing = existing || {};
  const str = (v, max) => String(v == null ? "" : v).slice(0, max);
  const num = (v) => { const n = Number(v); return Number.isFinite(n) ? n : 0; };

  const category = VALID_CATEGORIES.includes(input.category) ? input.category : (existing.category || "extra");
  const role = VALID_ROLES.includes(input.role) ? input.role : (existing.role || "extra");

  return {
    id: existing.id || (9000000000 + Date.now()),
    name: str(input.name, 120) || existing.name || "Нэргүй бараа",
    price: input.price != null ? num(input.price) : (existing.price || 0),
    oldPrice: (input.oldPrice != null && input.oldPrice !== "") ? num(input.oldPrice) : null,
    category: category,
    role: role,
    soldOut: typeof input.soldOut === "boolean" ? input.soldOut : !!existing.soldOut,
    image: str(input.image != null ? input.image : existing.image, 500),
    url: str(input.url != null ? input.url : existing.url, 500),
    custom: true,
    createdAt: existing.createdAt || new Date().toISOString()
  };
}

exports.handler = async (event) => {
  if(event.httpMethod !== "POST"){
    return json(405, { error: "Method not allowed" });
  }
  if(!process.env.JSONBIN_BIN_ID || !process.env.JSONBIN_MASTER_KEY){
    return json(500, { error: "Серверт JSONBIN тохиргоо дутуу байна (Netlify Environment variables)" });
  }

  let body;
  try{ body = JSON.parse(event.body || "{}"); }
  catch(e){ return json(400, { error: "Bad JSON" }); }

  try{
    if(body.action === "list"){
      const doc = await readDoc();
      return json(200, { ok: true, products: doc.products });
    }

    if(body.action === "add"){
      if(!checkPin(body.pin)) return json(401, { error: "Invalid PIN" });
      const doc = await readDoc();
      const product = sanitizeProduct(body.product, null);
      doc.products.push(product);
      await writeDoc(doc);
      return json(200, { ok: true, product });
    }

    if(body.action === "update"){
      if(!checkPin(body.pin)) return json(401, { error: "Invalid PIN" });
      const doc = await readDoc();
      const idx = doc.products.findIndex(p => p.id === body.id);
      if(idx < 0) return json(404, { error: "Product not found" });
      doc.products[idx] = sanitizeProduct(body.product, doc.products[idx]);
      await writeDoc(doc);
      return json(200, { ok: true, product: doc.products[idx] });
    }

    if(body.action === "delete"){
      if(!checkPin(body.pin)) return json(401, { error: "Invalid PIN" });
      const doc = await readDoc();
      doc.products = doc.products.filter(p => p.id !== body.id);
      await writeDoc(doc);
      return json(200, { ok: true });
    }

    return json(400, { error: "Unknown action" });
  }catch(e){
    return json(500, { error: "Server error" });
  }
};
