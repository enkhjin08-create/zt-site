/* ============================================================
   Зөвхөн түүнд — Захиалгын Netlify Function (серверийн код)

   ЭНЭ ФАЙЛ ДОТОР ХАРАГДАХ ЗҮЙЛС ХЭН Ч ХАРАХГҮЙ — браузер руу хэзээ ч
   илгээгдэхгүй. JSONBIN_MASTER_KEY, ADMIN_PIN хоёулыг Netlify Site
   Settings → Environment variables дотроос унших ёстой бөгөөд эх
   кодод бичигдэхгүй (README.md-ийн "Жинхэнэ нууцлал" хэсгийг үзээрэй).

   ⚠️ Энэ Function products.js, coupons.js-тэй ИЖИЛ JSONBin bin-ийг хуваан
   ашигладаг тул readDoc/writeDoc нь БҦХ түлхүүрийг (orders, products,
   overrides, categories, recipients, coupons) хадгалж байх ЁСТОЙ —
   эс бөгөөс нэг Function-ийн бичилт нөгөөгийнхөө мэдээллийг устгана.

   Шинэ захиалга ирэх бүрд админ руу, мөн төлөв өөрчлөгдөх бүрд ЗАХИАЛАГЧ руу
   имэйл мэдэгдэл явуулна (Resend.com ашиглана, заавал биш — RESEND_API_KEY
   тохируулаагүй бол энгийнээр алгасна):
   - RESEND_API_KEY → resend.com-ийн API key
   - NOTIFY_EMAIL   → админ мэдэгдэл хүлээн авах имэйл (заавал биш, анхдагч: info.zuvhuntuund@gmail.com)
   - RESEND_FROM    → илгээгч хаяг (заавал биш, анхдагч: onboarding@resend.dev)

   4 үйлдэл дэмжинэ:
   - action="submit"         → нийтэд нээлттэй, захиалга нэмнэ (PIN шаардахгүй) — купон автоматаар хэрэгжинэ
   - action="validateCoupon" → нийтэд нээлттэй, купон шалгана (хямдрал урьдчилан харуулахад)
   - action="list"           → зөвхөн зөв PIN-тэй бол захиалгуудыг буцаана
   - action="updateStatus"   → зөвхөн зөв PIN-тэй бол төлөв шинэчилнэ
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
    products: Array.isArray(record.products) ? record.products : [],
    overrides: (record.overrides && typeof record.overrides === "object") ? record.overrides : {},
    categories: (record.categories && typeof record.categories === "object") ? record.categories : {},
    recipients: (record.recipients && typeof record.recipients === "object") ? record.recipients : {},
    recipientOverrides: (record.recipientOverrides && typeof record.recipientOverrides === "object") ? record.recipientOverrides : {},
    coupons: (record.coupons && typeof record.coupons === "object") ? record.coupons : {}
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

function isCouponValid(coupon){
  if(!coupon || coupon.active === false) return false;
  if(coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) return false;
  if(coupon.maxUses != null && (coupon.usedCount || 0) >= coupon.maxUses) return false;
  return true;
}

function computeDiscount(coupon, subtotal){
  if(coupon.type === "percent") return Math.round(subtotal * coupon.value / 100);
  return Math.min(coupon.value, subtotal);
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
    customerEmail: str(input.customerEmail, 150),
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
    couponCode: str(input.couponCode, 30).toUpperCase(),
    discount: 0,
    total: num(input.total),
    status: "new"
  };
}

function escapeHtml(s){
  return String(s == null ? "" : s)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// Шинэ захиалга ирэх бүрд админ руу мэдэгдэл мэйл илгээнэ (Resend.com ашиглана).
// Энэ функц АЛДАА ГАРВАЛ Ч захиалгыг бүртгэхэд саад болохгүй — try/catch-аар тусгаарлагдсан.
async function sendOrderNotificationEmail(order){
  if(!process.env.RESEND_API_KEY) return; // тохиргоо хийгээгүй бол зүгээр алгасна

  const to = process.env.NOTIFY_EMAIL || "info.zuvhuntuund@gmail.com";
  const from = process.env.RESEND_FROM || "onboarding@resend.dev";

  const itemsHtml = (order.items || []).map(i =>
    `<tr><td style="padding:4px 0">${escapeHtml(i.name)}</td><td style="padding:4px 0;text-align:right">${i.price.toLocaleString()}₮</td></tr>`
  ).join("");

  const html = `
    <div style="font-family:sans-serif;max-width:480px;margin:0 auto">
      <h2 style="color:#C9536A">🎀 Шинэ захиалга — №${escapeHtml(order.orderNumber)}</h2>
      <p><b>Захиалагч:</b> ${escapeHtml(order.customerName)} · ${escapeHtml(order.customerPhone)}</p>
      <p><b>Хүргэлтийн хаяг:</b> ${escapeHtml([order.deliveryDistrict, order.deliveryKhoroo ? order.deliveryKhoroo + "-р хороо" : "", order.deliveryAddress].filter(Boolean).join(", "))}</p>
      <p><b>Хүлээн авагч:</b> ${escapeHtml(order.recipient)}</p>
      ${order.container ? `<p><b>Сав:</b> ${escapeHtml(order.container.name)} (${order.container.price.toLocaleString()}₮)</p>` : ""}
      <table style="width:100%;border-collapse:collapse;margin-top:10px">${itemsHtml}</table>
      ${order.message ? `<p style="margin-top:10px"><b>Зурвас:</b> "${escapeHtml(order.message)}"</p>` : ""}
      ${order.couponCode ? `<p><b>Купон:</b> ${escapeHtml(order.couponCode)} (-${(order.discount||0).toLocaleString()}₮)</p>` : ""}
      <p style="font-size:18px;margin-top:14px"><b>Нийт төлөх дүн: ${order.total.toLocaleString()}₮</b></p>
      <p style="margin-top:18px;font-size:13px;color:#888">Админ хэсэгт нэвтэрч дэлгэрэнгүйг харах болон төлвийг шинэчлэх боломжтой.</p>
    </div>`;

  try{
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": "Bearer " + process.env.RESEND_API_KEY },
      body: JSON.stringify({
        from: from,
        to: to,
        subject: `🎀 Шинэ захиалга №${order.orderNumber} — ${order.total.toLocaleString()}₮`,
        html: html
      })
    });
  }catch(e){
    // Мэйл явуулахад алдаа гарсан ч захиалга аль хэдийн хадгалагдсан тул дахин шидэхгүй.
  }
}

const STATUS_EMAIL_TEXT = {
  new:       { subject: "Захиалга хүлээн авлаа", body: "Таны захиалгыг хүлээн авлаа. Удахгүй баталгаажуулаад мэдэгдэх болно." },
  confirmed: { subject: "Захиалга баталгаажлаа ✓", body: "Таны захиалгыг баталгаажуулсан байна. Бид бэлтгэж, заасан хугацаанд хүргэх болно." },
  done:      { subject: "Захиалга хийгдсэн 🎀", body: "Таны захиалга бэлэн болж, хүргэгдсэн/хүргэгдэж байна. Худалдан авалт хийсэнд баярлалаа!" },
  cancelled: { subject: "Захиалга цуцлагдсан", body: "Таны захиалгыг цуцалсан байна. Шалтгаан, дэлгэрэнгүй мэдээллийг мэдэхийг хүсвэл бидэнтэй холбогдоорой." }
};

// Захиалгын төлөв өөрчлөгдөх бүрд захиалагч руу имэйл мэдэгдэл явуулна.
// Захиалагч имэйлээ оруулаагүй бол энгийнээр алгасна. Алдаа гарвал ч
// төлөв шинэчлэлтэд саад болохгүй.
async function sendStatusUpdateEmail(order, newStatus){
  if(!process.env.RESEND_API_KEY) return;
  if(!order.customerEmail || !order.customerEmail.includes("@")) return;

  const info = STATUS_EMAIL_TEXT[newStatus] || STATUS_EMAIL_TEXT.new;
  const from = process.env.RESEND_FROM || "onboarding@resend.dev";

  const html = `
    <div style="font-family:sans-serif;max-width:480px;margin:0 auto">
      <h2 style="color:#C9536A">🎀 ${escapeHtml(info.subject)}</h2>
      <p>Сайн байна уу, ${escapeHtml(order.customerName || "")}!</p>
      <p>${escapeHtml(info.body)}</p>
      <p style="margin-top:14px;background:#FFEAF1;border-radius:10px;padding:10px 14px">
        <b>Захиалгын дугаар:</b> ${escapeHtml(order.orderNumber)}<br>
        <b>Нийт дүн:</b> ${(order.total || 0).toLocaleString()}₮
      </p>
      <p style="margin-top:18px;font-size:13px;color:#888">Асуулт байвал бидэнтэй Messenger-р холбогдоорой — Зөвхөн түүнд.</p>
    </div>`;

  try{
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": "Bearer " + process.env.RESEND_API_KEY },
      body: JSON.stringify({
        from: from,
        to: order.customerEmail,
        subject: `🎀 ${info.subject} — №${order.orderNumber}`,
        html: html
      })
    });
  }catch(e){
    // Мэйл явуулахад алдаа гарсан ч төлөв шинэчлэлт аль хэдийн хадгалагдсан тул дахин шидэхгүй.
  }
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

      if(order.couponCode){
        const coupon = doc.coupons[order.couponCode];
        if(isCouponValid(coupon)){
          const discount = computeDiscount(coupon, order.subtotal);
          order.discount = discount;
          order.total = Math.max(0, order.subtotal + order.deliveryFee - discount);
          coupon.usedCount = (coupon.usedCount || 0) + 1;
        }else{
          order.couponCode = ""; // хүчингүй болсон тул чимэхгүй
        }
      }

      doc.orders.push(order);
      await writeDoc(doc);
      await sendOrderNotificationEmail(order);
      return json(200, { ok: true, id: order.id, discount: order.discount, total: order.total });
    }

    if(body.action === "validateCoupon"){
      const doc = await readDoc();
      const code = String(body.code || "").trim().toUpperCase();
      const coupon = doc.coupons[code];
      if(!code || !isCouponValid(coupon)){
        return json(200, { ok: false, error: "Хүчингүй эсвэл хугацаа дууссан купон" });
      }
      return json(200, { ok: true, code, type: coupon.type, value: coupon.value });
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
        const newStatus = String(body.status || "new").slice(0, 20);
        doc.orders[idx].status = newStatus;
        await writeDoc(doc);
        await sendStatusUpdateEmail(doc.orders[idx], newStatus);
      }
      return json(200, { ok: true });
    }

    return json(400, { error: "Unknown action" });
  }catch(e){
    return json(500, { error: "Server error" });
  }
};
