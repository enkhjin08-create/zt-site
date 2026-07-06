/* ============================================================
   Зөвхөн түүнд — Хандалт хэмжих Function
   
   GET  /api/track?page=home     → нийтэд нээлттэй, нэг хандалт бүртгэнэ
   GET  /api/track?action=stats&pin=... → зөвхөн админ, статистик буцаана
   ============================================================ */

const JSONBIN_BASE = "https://api.jsonbin.io/v3/b/";

function json(status, body){
  return {
    statusCode: status,
    headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    body: JSON.stringify(body)
  };
}

function checkPin(pin){
  const real = process.env.ADMIN_PIN;
  return typeof real === "string" && real.length > 0 && pin === real;
}

async function readViews(){
  const res = await fetch(JSONBIN_BASE + process.env.JSONBIN_BIN_ID + "/latest", {
    headers: { "X-Master-Key": process.env.JSONBIN_MASTER_KEY }
  });
  if(!res.ok) throw new Error("read failed");
  const data = await res.json();
  const record = data.record || {};
  return record.pageviews || {};
}

async function writeViews(doc, pageviews){
  const updated = Object.assign({}, doc, { pageviews });
  const res = await fetch(JSONBIN_BASE + process.env.JSONBIN_BIN_ID, {
    method: "PUT",
    headers: { "Content-Type": "application/json", "X-Master-Key": process.env.JSONBIN_MASTER_KEY },
    body: JSON.stringify(updated)
  });
  if(!res.ok) throw new Error("write failed");
}

async function readFullDoc(){
  const res = await fetch(JSONBIN_BASE + process.env.JSONBIN_BIN_ID + "/latest", {
    headers: { "X-Master-Key": process.env.JSONBIN_MASTER_KEY }
  });
  if(!res.ok) throw new Error("read failed");
  const data = await res.json();
  return data.record || {};
}

exports.handler = async (event) => {
  const params = event.queryStringParameters || {};

  // Stats endpoint — admin only
  if(params.action === "stats"){
    if(!checkPin(params.pin)) return json(401, { error: "Invalid PIN" });
    try{
      const pageviews = await readViews();
      return json(200, { ok: true, pageviews });
    }catch(e){
      return json(500, { error: "Server error" });
    }
  }

  // Track a page view (no PIN needed — public)
  try{
    const today = new Date().toISOString().slice(0, 10);
    const page = (params.page || "other").slice(0, 30);
    const key = today + "|" + page;

    // Read-modify-write with simple retry
    for(let attempt = 0; attempt < 3; attempt++){
      const doc = await readFullDoc();
      const pageviews = doc.pageviews || {};
      pageviews[key] = (pageviews[key] || 0) + 1;
      try{
        await writeViews(doc, pageviews);
        break;
      }catch(e){
        if(attempt === 2) throw e;
        await new Promise(r => setTimeout(r, 200 + attempt * 300));
      }
    }
    return json(200, { ok: true });
  }catch(e){
    // Tracking failure should never break the site — silently fail
    return json(200, { ok: true });
  }
};
