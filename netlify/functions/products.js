/* ============================================================
   Зөвхөн түүнд — Бараа удирдах Netlify Function (серверийн код)

   Энэ нь 4 зүйлийг хадгална:
   1. "products"   — Админ хэсгээс ШИНЭЭР нэмсэн бараанууд
   2. "overrides"  — zuvhuntuund.com-ийн 103 бэлэн барааны (assets/data.js доторх)
      аль нэгэнд админ хийсэн ЗАСВАР, id-аар холбогддог.
   3. "categories" — Админ хэсгээс шинээр нэмсэн АНГИЛАЛ (Нэр, Өнгө, Дүрс).
   4. "recipients" — Админ хэсгээс шинээр нэмсэн ХҦЛЭЭН АВАГЧ ("Хэнд бэлэглэх вэ?").
      assets/data.js-ийн үндсэн ангилал/хүлээн авагч хэвээр кодод байна; эндээс
      зөвхөн НЭМЭЛТ зүйлс хадгалагдана.

   assets/data.js файл өөрөө хэвээр үлдэнэ — зүгээр сайт ачаалах үед эдгээр
   засвар/нэмэлт дээр нь "наалддаг" (overlay).

   Захиалгын Function-тэй ИЖИЛ JSONBin bin-ийг ашигладаг тул бичих
   үед нөгөөгийнхөө мэдээллийг устгахгүйн тулд бүтэн баримтыг уншиж бичнэ.

   10 үйлдэл дэмжинэ:
   - action="list"            → нийтэд нээлттэй — бараа + засвар + ангилал + хүлээн авагч буцаана
   - action="add"             → зөв PIN-тэй бол шинэ бараа нэмнэ
   - action="update"          → зөв PIN-тэй бол НЭМСЭН барааг засна
   - action="delete"          → зөв PIN-тэй бол НЭМСЭН барааг устгана
   - action="setOverride"     → зөв PIN-тэй бол ҮНДСЭН 103 барааны нэгэнд засвар хийнэ
   - action="clearOverride"   → зөв PIN-тэй бол засврыг арилгаж, анхны байдалд оруулна
   - action="addCategory"     → зөв PIN-тэй бол шинэ ангилал нэмнэ
   - action="deleteCategory"  → зөв PIN-тэй бол нэмсэн ангилал устгана
   - action="addRecipient"    → зөв PIN-тэй бол шинэ хүлээн авагч нэмнэ
   - action="deleteRecipient" → зөв PIN-тэй бол нэмсэн хүлээн авагчийг устгана
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
    recipients: (record.recipients && typeof record.recipients === "object") ? record.recipients : {}
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

const BUILTIN_CATEGORIES = ["cup", "giftset", "flower", "extra", "box", "greeting"];
const BUILTIN_RECIPIENTS = ["mom", "partner", "friend", "self", "kid"];
const VALID_ROLES = ["main", "extra", "container"];
const COLOR_PRESETS = {
  pink:  { color: "#FF6698", tint: "#FFEAF1" },
  green: { color: "#0F4B42", tint: "#E7EDEC" },
  black: { color: "#15140F", tint: "#F3F3F3" },
  blush: { color: "#FF6698", tint: "#EFB8C3" }
};
const ICON_REFS = ["cup", "giftset", "flower", "extra", "greeting"];

function cleanRecipients(arr, validRecipients){
  if(!Array.isArray(arr)) return null;
  const cleaned = arr.filter(r => validRecipients.includes(r)).slice(0, 10);
  return cleaned;
}

function sanitizeProduct(input, existing, validCategories, validRecipients){
  input = input || {};
  existing = existing || {};
  const str = (v, max) => String(v == null ? "" : v).slice(0, max);
  const num = (v) => { const n = Number(v); return Number.isFinite(n) ? n : 0; };

  const category = validCategories.includes(input.category) ? input.category : (existing.category || "extra");
  const role = VALID_ROLES.includes(input.role) ? input.role : (existing.role || "extra");
  const recipients = cleanRecipients(input.recipients, validRecipients);

  const out = {
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
  if(recipients !== null) out.recipients = recipients;
  else if(existing.recipients) out.recipients = existing.recipients;
  return out;
}

function sanitizeOverride(input, existing, validCategories, validRecipients){
  input = input || {};
  existing = existing || {};
  const patch = Object.assign({}, existing);
  const str = (v, max) => String(v == null ? "" : v).slice(0, max);
  const num = (v) => { const n = Number(v); return Number.isFinite(n) ? n : 0; };

  if(input.name != null) patch.name = str(input.name, 120);
  if(input.price != null) patch.price = num(input.price);
  if("oldPrice" in input) patch.oldPrice = (input.oldPrice === "" || input.oldPrice == null) ? null : num(input.oldPrice);
  if(input.category != null && validCategories.includes(input.category)) patch.category = input.category;
  if(input.role != null && VALID_ROLES.includes(input.role)) patch.role = input.role;
  if(typeof input.soldOut === "boolean") patch.soldOut = input.soldOut;
  if(input.image != null) patch.image = str(input.image, 500);
  if(input.url != null) patch.url = str(input.url, 500);
  const recipients = cleanRecipients(input.recipients, validRecipients);
  if(recipients !== null) patch.recipients = recipients;
  return patch;
}

function sanitizeCategory(input){
  input = input || {};
  const str = (v, max) => String(v == null ? "" : v).slice(0, max);
  const label = str(input.label, 40).trim();
  const colorKey = Object.keys(COLOR_PRESETS).includes(input.colorKey) ? input.colorKey : "pink";
  const iconRef = ICON_REFS.includes(input.iconRef) ? input.iconRef : "extra";
  const preset = COLOR_PRESETS[colorKey];
  return {
    key: "cat" + Date.now(),
    label: label || "Нэргүй ангилал",
    color: preset.color,
    tint: preset.tint,
    iconRef: iconRef,
    custom: true
  };
}

function sanitizeRecipient(input){
  input = input || {};
  const str = (v, max) => String(v == null ? "" : v).slice(0, max);
  const label = str(input.label, 30).trim();
  const emoji = str(input.emoji, 8).trim() || "🎁";
  return {
    key: "rec" + Date.now(),
    label: label || "Нэргүй",
    emoji: emoji,
    custom: true
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
      return json(200, { ok: true, products: doc.products, overrides: doc.overrides, categories: doc.categories, recipients: doc.recipients });
    }

    if(body.action === "add"){
      if(!checkPin(body.pin)) return json(401, { error: "Invalid PIN" });
      const doc = await readDoc();
      const validCategories = BUILTIN_CATEGORIES.concat(Object.keys(doc.categories));
      const validRecipients = BUILTIN_RECIPIENTS.concat(Object.keys(doc.recipients));
      const product = sanitizeProduct(body.product, null, validCategories, validRecipients);
      doc.products.push(product);
      await writeDoc(doc);
      return json(200, { ok: true, product });
    }

    if(body.action === "update"){
      if(!checkPin(body.pin)) return json(401, { error: "Invalid PIN" });
      const doc = await readDoc();
      const validCategories = BUILTIN_CATEGORIES.concat(Object.keys(doc.categories));
      const validRecipients = BUILTIN_RECIPIENTS.concat(Object.keys(doc.recipients));
      const idx = doc.products.findIndex(p => p.id === body.id);
      if(idx < 0) return json(404, { error: "Product not found" });
      doc.products[idx] = sanitizeProduct(body.product, doc.products[idx], validCategories, validRecipients);
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

    if(body.action === "setOverride"){
      if(!checkPin(body.pin)) return json(401, { error: "Invalid PIN" });
      if(body.id == null) return json(400, { error: "Missing id" });
      const doc = await readDoc();
      const validCategories = BUILTIN_CATEGORIES.concat(Object.keys(doc.categories));
      const validRecipients = BUILTIN_RECIPIENTS.concat(Object.keys(doc.recipients));
      const key = String(body.id);
      doc.overrides[key] = sanitizeOverride(body.patch, doc.overrides[key], validCategories, validRecipients);
      await writeDoc(doc);
      return json(200, { ok: true, override: doc.overrides[key] });
    }

    if(body.action === "clearOverride"){
      if(!checkPin(body.pin)) return json(401, { error: "Invalid PIN" });
      if(body.id == null) return json(400, { error: "Missing id" });
      const doc = await readDoc();
      delete doc.overrides[String(body.id)];
      await writeDoc(doc);
      return json(200, { ok: true });
    }

    if(body.action === "addCategory"){
      if(!checkPin(body.pin)) return json(401, { error: "Invalid PIN" });
      const doc = await readDoc();
      const cat = sanitizeCategory(body.category);
      doc.categories[cat.key] = cat;
      await writeDoc(doc);
      return json(200, { ok: true, category: cat });
    }

    if(body.action === "deleteCategory"){
      if(!checkPin(body.pin)) return json(401, { error: "Invalid PIN" });
      if(!body.key) return json(400, { error: "Missing key" });
      const doc = await readDoc();
      delete doc.categories[body.key];
      await writeDoc(doc);
      return json(200, { ok: true });
    }

    if(body.action === "addRecipient"){
      if(!checkPin(body.pin)) return json(401, { error: "Invalid PIN" });
      const doc = await readDoc();
      const rec = sanitizeRecipient(body.recipient);
      doc.recipients[rec.key] = rec;
      await writeDoc(doc);
      return json(200, { ok: true, recipient: rec });
    }

    if(body.action === "deleteRecipient"){
      if(!checkPin(body.pin)) return json(401, { error: "Invalid PIN" });
      if(!body.key) return json(400, { error: "Missing key" });
      const doc = await readDoc();
      delete doc.recipients[body.key];
      await writeDoc(doc);
      return json(200, { ok: true });
    }

    return json(400, { error: "Unknown action" });
  }catch(e){
    return json(500, { error: "Server error" });
  }
};
