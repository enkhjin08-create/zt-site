// ============================================================
// Meowie Giftshop-ийн бараа — Агуулах аппын Edupark салбарын БОДИТ үлдэгдлээс.
// Зөвхөн Edupark дээр үлдэгдэлтэй бараа орж ирнэ (үлдэгдэл дуусвал автоматаар алга болно).
// Татаж чадаагүй бол Meowie хэсгийг нууна (хуучин/буруу үлдэгдэл харуулахгүй).
// ============================================================
const MEOWIE_URL = "https://meowie-aguulah.netlify.app/.netlify/functions/api?public=catalog";
function meowieId(key){
  let h = 5381;
  for(let i=0;i<key.length;i++){ h = ((h<<5)+h + key.charCodeAt(i)) >>> 0; }
  return 7000000000000000 + (h % 1000000000);   // тогтвортой, одоо байгаа id-тай давхцахгүй
}
async function loadMeowieProducts(){
  try{
    const ctrl = new AbortController();
    const t = setTimeout(()=>ctrl.abort(), 12000);
    const photosP = fetch('assets/meowie-photos.json').then(x=>x.ok?x.json():{}).catch(()=>({}));
    const r = await fetch(MEOWIE_URL, { signal: ctrl.signal });
    clearTimeout(t);
    if(!r.ok) return;
    const d = await r.json();
    const photos = await photosP;
    const allRecipients = Object.keys(RECIPIENTS);
    CATEGORIES.meowie = { label: "Meowie дагалдах зүйлс", short: "Meowie", iconRef: "extra", icon: "note", color: "#C2456E", tint: "#FFEAF1" };
    const seen = new Set();
    (d.items||[]).forEach(it => {
      if(!it || !it.name || !it.image || !(it.price > 0)) return;
      const id = meowieId(String(it.id || it.name));
      if(seen.has(id)) return;
      seen.add(id);
      PRODUCTS.push({
        id, name: it.name, price: Number(it.price), oldPrice: null, image: photos[it.image] || it.image, restyled: !!photos[it.image],
        category: "meowie", role: "extra", brand: "Meowie", mCat: it.category || "Бусад",
        soldOut: false, description: "", url: "", recipients: allRecipients
      });
    });
  }catch(e){
    console.warn("Meowie products failed to load:", e);
  }
}
