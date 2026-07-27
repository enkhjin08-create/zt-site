/* ============================================================
   Зөвхөн түүнд — Хандалт хэмжих Function

   ⚠️ Өгөгдлийн хадгалалт: Netlify Blobs ашиглана (JSONBin.io-с шилжсэн, 2026-07),
   тусдаа "zt-pageviews" store-д хадгалагдана — захиалга/барааны өгөгдөлтэй
   огт холилдохгүй (_data.js-г үзнэ үү).

   GET  /api/track?page=home     → нийтэд нээлттэй, нэг хандалт бүртгэнэ
   GET  /api/track?action=stats&pin=... → зөвхөн админ, статистик буцаана
   ============================================================ */

const { readPageviews, writePageviews } = require("./_data.js");

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

exports.handler = async (event) => {
  const params = event.queryStringParameters || {};

  // Stats endpoint — admin only
  if(params.action === "stats"){
    if(!checkPin(params.pin)) return json(401, { error: "Invalid PIN" });
    try{
      const pageviews = await readPageviews();
      return json(200, { ok: true, pageviews });
    }catch(e){
      console.error("[track stats error]", e.message);
      return json(500, { error: "Server error" });
    }
  }

  // Track a page view (no PIN needed — public)
  try{
    const today = new Date().toISOString().slice(0, 10);
    const page = (params.page || "other").slice(0, 30);
    const key = today + "|" + page;

    for(let attempt = 0; attempt < 3; attempt++){
      try{
        const pageviews = await readPageviews();
        pageviews[key] = (pageviews[key] || 0) + 1;
        await writePageviews(pageviews);
        break;
      }catch(e){
        if(attempt === 2) throw e;
        await new Promise(r => setTimeout(r, 200 + attempt * 300));
      }
    }
    return json(200, { ok: true });
  }catch(e){
    // Tracking failure should never break the site — silently fail
    console.error("[track error]", e.message);
    return json(200, { ok: true });
  }
};
