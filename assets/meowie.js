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
// --- Хурдан ачаалах: каталогийг хуудас нээгдэнгүүт (ZT бараа ачаалахаас өмнө) татаж эхэлнэ,
// сүүлд татсан хариуг localStorage-д хадгалж, дараагийн удаа шууд харуулаад ард нь шинэчилнэ.
const MEOWIE_CACHE_KEY = "meowie_catalog_v1";
function meowieReadCache(){
  try{ const c = JSON.parse(localStorage.getItem(MEOWIE_CACHE_KEY)||"null"); return c && c.d && c.d.items ? c.d : null; }catch(e){ return null; }
}
function meowieWriteCache(d){
  try{ localStorage.setItem(MEOWIE_CACHE_KEY, JSON.stringify({t:Date.now(), d})); }catch(e){}
}
function meowieFetchFresh(){
  const ctrl = new AbortController();
  const t = setTimeout(()=>ctrl.abort(), 15000);
  return fetch(MEOWIE_URL, { signal: ctrl.signal })
    .then(r => r.ok ? r.json() : null)
    .then(d => { clearTimeout(t); if(d && d.items){ meowieWriteCache(d); return d; } return null; })
    .catch(() => { clearTimeout(t); return null; });
}
let _mPhotosP = null, _mFreshP = null;
function meowiePhotosP(){ return _mPhotosP || (_mPhotosP = fetch('assets/meowie-photos.json').then(x=>x.ok?x.json():{}).catch(()=>({}))); }
function meowieFreshP(){ return _mFreshP || (_mFreshP = meowieFetchFresh()); }
// Meowie/хайрцаг хуудас дээр нэн даруй эхлүүлнэ; бусад хуудсанд (жишээ нь ЗТ барааны) зөвхөн хэрэгтэй үед.
if(/\/(meowie|builder)\.html$/.test(location.pathname)){ meowiePhotosP(); meowieFreshP(); }
let MEOWIE_ITEMS_JSON = "";

async function loadMeowieProducts(){
  try{
    const cached = meowieReadCache();
    // Cache байвал шууд, үгүй бол шинэ хариуг хүлээнэ
    const d = cached || await meowieFreshP();
    if(!d) return;
    await buildMeowie(d);
    MEOWIE_ITEMS_JSON = JSON.stringify(d.items);
    if(cached){
      // Ард нь шинэчилж, өөрчлөлт гарсан бол дахин зурна
      meowieFreshP().then(async fresh => {
        if(!fresh || JSON.stringify(fresh.items) === MEOWIE_ITEMS_JSON) return;
        MEOWIE_ITEMS_JSON = JSON.stringify(fresh.items);
        for(let i = PRODUCTS.length - 1; i >= 0; i--) if(PRODUCTS[i].category === "meowie") PRODUCTS.splice(i,1);
        await buildMeowie(fresh);
        if(typeof window.onMeowieUpdate === "function") window.onMeowieUpdate();
      });
    }
  }catch(e){
    console.warn("Meowie products failed to load:", e);
  }
}
async function buildMeowie(d){
  {
    const photos = await meowiePhotosP();
    const allRecipients = Object.keys(RECIPIENTS);
    CATEGORIES.meowie = { label: "Meowie дагалдах зүйлс", short: "Meowie", iconRef: "extra", icon: "note", color: "#C2456E", tint: "#FFEAF1" };
    const seen = new Set();
    // Ижил нэртэй барааг "#2, #3" гэж ялгана (id-аар эрэмбэлсэн тул тогтвортой).
    const nk = n => String(n||"").toLowerCase().replace(/[^\p{L}\p{N}]+/gu," ").trim().replace(/^sticky note$/,"sticky notes");
    const valid = (d.items||[]).filter(it => it && it.name && it.image && it.price > 0);
    const groups = {};
    valid.forEach(it => (groups[nk(it.name)] = groups[nk(it.name)] || []).push(it));
    const label = new Map();
    Object.values(groups).forEach(g => {
      if(g.length < 2) return;
      g.slice().sort((a,b)=>String(a.id||a.name).localeCompare(String(b.id||b.name)))
        .forEach((it,i)=>label.set(it, it.name + " #" + (i+1)));
    });
    valid.forEach(it => {
      if(!it || !it.name || !it.image || !(it.price > 0)) return;
      const id = meowieId(String(it.id || it.name));
      if(seen.has(id)) return;
      seen.add(id);
      PRODUCTS.push({
        id, name: label.get(it) || it.name, price: Number(it.price), oldPrice: null, image: photos[it.image] || it.image, restyled: !!photos[it.image],
        category: "meowie", role: "extra", brand: "Meowie", mCat: it.category || "Бусад",
        stock: Number(it.qty)||0, soldOut: false, description: "", url: "", recipients: allRecipients
      });
    });
  }
}
