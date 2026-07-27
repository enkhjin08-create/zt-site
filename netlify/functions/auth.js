/* ============================================================
   Зөвхөн түүнд — Хэрэглэгчийн нэвтрэлт + профайл Function

   ⚠️ Өгөгдлийн хадгалалт: Netlify Blobs ашиглана (JSONBin.io-с шилжсэн, 2026-07).
   orders.js, products.js-тэй ИЖИЛ blob-ийг ашигладаг (_data.js-г үзнэ үү).

   action="sendMagicLink"  { email }
   action="verifyToken"    { email, token }
   action="getProfile"     { email, session }
   action="updateProfile"  { email, session, name, phone, address }
   action="addWishlist"    { email, session, productId }
   action="removeWishlist" { email, session, productId }
   ============================================================ */

const { readDoc, writeDoc } = require("./_data.js");

function json(status, body){
  return {
    statusCode: status,
    headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    body: JSON.stringify(body)
  };
}

function randomToken(len){
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let t = "";
  for(let i = 0; i < len; i++) t += chars[Math.floor(Math.random()*chars.length)];
  return t;
}

function checkSession(user, session){
  if(!user || !session) return false;
  if(user.session !== session) return false;
  if(user.sessionExpiry && new Date(user.sessionExpiry) < new Date()) return false;
  return true;
}

async function sendMagicLinkEmail(to, link){
  if(!process.env.RESEND_API_KEY) return;
  const from = process.env.RESEND_FROM || "order@zuvhuntuund.com";
  const html = `<div style="font-family:sans-serif;max-width:480px;margin:0 auto">
    <h2 style="color:#C9536A">🎀 Зөвхөн түүнд — Нэвтрэх холбоос</h2>
    <p>Доорх товчийг дарж профайлдаа нэвтрэнэ үү. Холбоос 30 минут хүчинтэй.</p>
    <a href="${link}" style="display:inline-block;margin-top:16px;padding:14px 28px;background:#FF6698;color:#fff;border-radius:99px;text-decoration:none;font-weight:700">Нэвтрэх →</a>
    <p style="margin-top:20px;font-size:13px;color:#888">Хэрэв та энэ имэйлийг хүссэнгүй бол үл тоомсорлоорой.</p>
  </div>`;
  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": "Bearer " + process.env.RESEND_API_KEY },
    body: JSON.stringify({ from, to, subject: "🎀 Зөвхөн түүнд — нэвтрэх холбоос", html })
  }).catch(e => console.error("[magic link email error]", e.message));
}

exports.handler = async (event) => {
  if(event.httpMethod === "OPTIONS") return json(200, {});
  let body;
  try{ body = JSON.parse(event.body || "{}"); }
  catch(e){ return json(400, { error: "Invalid JSON" }); }

  const email = (body.email || "").trim().toLowerCase();
  if(!email || !email.includes("@")) return json(400, { error: "Зөв имэйл оруулна уу" });

  try{
    if(body.action === "sendMagicLink"){
      const doc = await readDoc();
      const token = randomToken(32);
      const expiry = new Date(Date.now() + 30*60*1000).toISOString();
      if(!doc.users[email]) doc.users[email] = { email, name: "", phone: "", address: {}, wishlist: [] };
      doc.users[email].magicToken = token;
      doc.users[email].magicExpiry = expiry;
      await writeDoc(doc);
      const origin = (event.headers && event.headers.origin) || "https://zuvhuntuund.com";
      const link = `${origin}/profile.html?email=${encodeURIComponent(email)}&token=${token}`;
      await sendMagicLinkEmail(email, link);
      return json(200, { ok: true });
    }

    if(body.action === "verifyToken"){
      const doc = await readDoc();
      const user = doc.users[email];
      if(!user || user.magicToken !== body.token) return json(401, { error: "Холбоос хүчингүй" });
      if(user.magicExpiry && new Date(user.magicExpiry) < new Date()) return json(401, { error: "Холбоосны хугацаа дууссан" });
      const session = randomToken(48);
      user.session = session;
      user.sessionExpiry = new Date(Date.now() + 30*24*60*60*1000).toISOString();
      user.magicToken = null;
      user.magicExpiry = null;
      await writeDoc(doc);
      return json(200, { ok: true, session, user: { email, name: user.name, phone: user.phone, address: user.address || {}, wishlist: user.wishlist || [] } });
    }

    if(body.action === "getProfile"){
      const doc = await readDoc();
      const user = doc.users[email];
      if(!checkSession(user, body.session)) return json(401, { error: "Нэвтрэх шаардлагатай" });
      const orders = doc.orders.filter(o => (o.customerEmail||"").toLowerCase() === email)
        .sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
      return json(200, { ok: true, user: { email, name: user.name, phone: user.phone, address: user.address || {}, wishlist: user.wishlist || [] }, orders });
    }

    if(body.action === "updateProfile"){
      const doc = await readDoc();
      const user = doc.users[email];
      if(!checkSession(user, body.session)) return json(401, { error: "Нэвтрэх шаардлагатай" });
      const str = (v, n) => String(v||"").slice(0, n);
      if(body.name !== undefined) user.name = str(body.name, 60);
      if(body.phone !== undefined) user.phone = str(body.phone, 20);
      if(body.address) user.address = {
        district: str(body.address.district, 40),
        khoroo: str(body.address.khoroo, 20),
        detail: str(body.address.detail, 200)
      };
      await writeDoc(doc);
      return json(200, { ok: true });
    }

    if(body.action === "addWishlist" || body.action === "removeWishlist"){
      const doc = await readDoc();
      const user = doc.users[email];
      if(!checkSession(user, body.session)) return json(401, { error: "Нэвтрэх шаардлагатай" });
      const pid = Number(body.productId);
      if(!user.wishlist) user.wishlist = [];
      if(body.action === "addWishlist"){
        if(!user.wishlist.includes(pid)) user.wishlist.push(pid);
      }else{
        user.wishlist = user.wishlist.filter(id => id !== pid);
      }
      await writeDoc(doc);
      return json(200, { ok: true, wishlist: user.wishlist });
    }

    return json(400, { error: "Unknown action" });
  }catch(e){
    console.error("[auth error]", e.message);
    return json(500, { error: "Server error" });
  }
};
