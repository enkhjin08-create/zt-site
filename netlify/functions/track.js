/* ============================================================
   Зөвхөн түүнд — Хандалт хэмжих Function

   ⚠️ Хандалтын өгөгдлийг ТУСДАА JSONBin bin-д хадгална (захиалга/барааны
   bin-тэй ХОЛИХГҮЙ) — ингэснээр олон хэрэглэгч зэрэг хуудас нээх үед
   (race condition) захиалга/барааны чухал өгөгдөл дарагдаж устах эрсдэлийг
   бүрэн арилгана. Шинэ орчны хувьсагч шаардлагатай:
   - PAGEVIEWS_BIN_ID → шинэ, ХООСОН JSONBin bin (агуулга: {"pageviews":{}})

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

function pageviewsBinId(){
  // Хэрэв тусдаа bin тохируулаагүй бол л, аюулгүй байдлын үүднээс
  // fallback-аар үндсэн bin руу орохгүй — тохиргоо дутуу гэдгийг тодорхой алдаагаар мэдэгдэнэ.
  return process.env.PAGEVIEWS_BIN_ID;
}

async function readViews(){
  const binId = pageviewsBinId();
  if(!binId) throw new Error("PAGEVIEWS_BIN_ID тохируулаагүй байна");
  const res = await fetch(JSONBIN_BASE + binId + "/latest", {
    headers: { "X-Master-Key": process.env.JSONBIN_MASTER_KEY }
  });
  if(!res.ok) throw new Error("read failed");
  const data = await res.json();
  const record = data.record || {};
  return record.pageviews || {};
}

async function writeViews(pageviews){
  const binId = pageviewsBinId();
  if(!binId) throw new Error("PAGEVIEWS_BIN_ID тохируулаагүй байна");
  const res = await fetch(JSONBIN_BASE + binId, {
    method: "PUT",
    headers: { "Content-Type": "application/json", "X-Master-Key": process.env.JSONBIN_MASTER_KEY },
    body: JSON.stringify({ pageviews })
  });
  if(!res.ok) throw new Error("write failed");
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
      console.error("[track stats error]", e.message);
      return json(500, { error: "Server error" });
    }
  }

  // Track a page view (no PIN needed — public)
  try{
    const today = new Date().toISOString().slice(0, 10);
    const page = (params.page || "other").slice(0, 30);
    const key = today + "|" + page;

    // Read-modify-write with retry — учир нь энэ нь ЗӨВХӨН pageviews bin-д
    // хамааралтай тул хоцрогдсон бичилт нь хамгийн муугаараа зөвхөн хандалтын
    // тоог алдагдуулна, захиалга/барааны өгөгдөлд НӨЛӨӨЛӨХГҮЙ.
    for(let attempt = 0; attempt < 3; attempt++){
      try{
        const pageviews = await readViews();
        pageviews[key] = (pageviews[key] || 0) + 1;
        await writeViews(pageviews);
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
