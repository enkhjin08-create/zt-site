// GET /api/delivery-quote?lat=..&lng=..
// Амьд цэцгийн UBCab хүргэлтийн үнийг bouquet.zuvhuntuund.com-ийн тооцоогоор (дэлгүүрийн
// байршил, суурь төлбөр, км тутмын үнэ — бүгд тэндээс) авна. Ингэснээр хоёр сайтын үнэ үргэлж ижил.
exports.handler = async (event) => {
  const h = { "Content-Type": "application/json", "Cache-Control": "no-store" };
  const q = event.queryStringParameters || {};
  const lat = Number(q.lat), lng = Number(q.lng);
  if(!(Math.abs(lat) <= 90 && Math.abs(lng) <= 180 && lat && lng)){
    return { statusCode: 400, headers: h, body: JSON.stringify({ error: "Байршил буруу байна." }) };
  }
  try{
    const r = await fetch(`https://bouquet.zuvhuntuund.com/api/quote?lat=${lat}&lng=${lng}`, { signal: AbortSignal.timeout(8000) });
    const j = await r.json();
    if(!r.ok) return { statusCode: r.status, headers: h, body: JSON.stringify({ error: j.error || "Тооцоолж чадсангүй." }) };
    return { statusCode: 200, headers: h, body: JSON.stringify({ km: j.km, fee: j.fee, configured: !!j.configured }) };
  }catch(e){
    return { statusCode: 502, headers: h, body: JSON.stringify({ error: "Хүргэлтийн үнийг тооцоолж чадсангүй. Дахин оролдоно уу." }) };
  }
};
