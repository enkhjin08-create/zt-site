/* ============================================================
   Зөвхөн түүнд — Захиалгын Netlify Function (серверийн код)

   ЭНЭ ФАЙЛ ДОТОР ХАРАГДАХ ЗҮЙЛС ХЭН Ч ХАРАХГҮЙ — браузер руу хэзээ ч
   илгээгдэхгүй. JSONBIN_MASTER_KEY, ADMIN_PIN хоёулыг Netlify Site
   Settings → Environment variables дотроос унших ёстой бөгөөд эх
   кодод бичигдэхгүй (README.md-ийн "Жинхэнэ нууцлал" хэсгийг үзээрэй).

   3 үйлдэл дэмжинэ:
   - action="submit"        → нийтэд нээлттэй, захиалга нэмнэ (PIN шаардахгүй)
   - action="list"          → зөвхөн зөв PIN-тэй бол захиалгуудыг буцаана
   - action="updateStatus"  → зөвхөн зөв PIN-тэй бол төлөв шинэчилнэ
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

// Хэрэглэгчээс ирэх захиалгын мэдээллийг найдвартай хэлбэрт оруулна
// (урт хязгаарлах, төрөл шалгах) — серверийн талд хийгддэг цорын ганц
// шалгалт тул чухал.
function sanitizeOrder(input){
  input = input || {};
  const str = (v, max) => String(v == null ? "" : v).slice(0, max);
  const num = (v) => { const n = Number(v); return Number.isFinite(n) ? n : 0; };

  const container = (input.container && typeof input.container === "object")
    ? { id: num(input.container.id), name: str(input.container.name, 100), price: num(input.container.price) }
    : null;

  const items = Array.isArray(input.items)
    ? input.items.slice(0, 40).map(i => ({ id: num(i && i.id), name: str(i && i.name, 100), price: num(i && i.price) }))
    : [];

  return {
    id: (typeof crypto !== "undefined" && crypto.randomUUID) ? crypto.randomUUID() : ("ord_" + Date.now() + "_" + Math.random().toString(36).slice(2)),
    orderNumber: str(input.orderNumber, 20),
    createdAt: new Date().toISOString(),
    customerName: str(input.customerName, 100),
    customerPhone: str(input.customerPhone, 30),
    deliveryDistrict: str(input.deliveryDistrict, 50),
    deliveryKhoroo: str(input.deliveryKhoroo, 20),
    deliveryAddress: str(input.deliveryAddress, 300),
    recipientKey: str(input.recipientKey, 30),
    recipient: str(input.recipient, 80),
    container,
    items,
    message: str(input.message, 1000),
    subtotal: num(input.subtotal),
    deliveryFee: num(input.deliveryFee),
    total: num(input.total),
    status: "new"
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
    if(body.action === "submit"){
      const order = sanitizeOrder(body.order);
      const doc = await readDoc();
      doc.orders.push(order);
      await writeDoc(doc);
      return json(200, { ok: true, id: order.id });
    }

    if(body.action === "list"){
      if(!checkPin(body.pin)) return json(401, { error: "Invalid PIN" });
      const doc = await readDoc();
      return json(200, { ok: true, orders: doc.orders });
    }

    if(body.action === "updateStatus"){
      if(!checkPin(body.pin)) return json(401, { error: "Invalid PIN" });
      const doc = await readDoc();
      const idx = doc.orders.findIndex(o => o.id === body.id);
      if(idx >= 0){
        doc.orders[idx].status = String(body.status || "new").slice(0, 20);
        await writeDoc(doc);
      }
      return json(200, { ok: true });
    }

    return json(400, { error: "Unknown action" });
  }catch(e){
    return json(500, { error: "Server error" });
  }
};
