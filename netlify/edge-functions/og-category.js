// Категорийн хуудас (category.html?cat=...) линк шэйрлэхэд тухайн категорийн зураг
// (категорийн эхний бүтээгдэхүүний зураг) thumbnail болж гарна. Бүтээгдэхүүний хуудсыг
// og-product.js хариуцна.

import { PRODUCTS as BUILTIN_PRODUCTS } from "./_data/builtin-products.mjs";

const CATEGORY_LABELS = {
  cup: "CuteCup аяга",
  giftset: "Бэлгийн багц",
  flower: "Цэцэгс",
  extra: "Дагалдах зүйлс",
  box: "Сав, баглаа боодол",
  greeting: "Мэндчилгээ"
};

const CATEGORY_DESCRIPTIONS = {
  cup: "Өдөр тутмын дулаан мөчид зориулсан CuteCup аяга.",
  giftset: "Хэд хэдэн зүйл нэг дор уядаг бэлгийн багц.",
  flower: "Амьд мэдрэмж төрүүлэх цэцгийн баглаа.",
  extra: "Бэлгээ өнгөлөх жижиг дагалдах зүйлс.",
  box: "Бэлгээ гоёмсог болгох сав, баглаа боодол.",
  greeting: "Зүрх сэтгэлээсээ бичсэн мэндчилгээний карт."
};

// Шинэ жилийн Монита багцууд (id 1794000000001..) нь "Бэлгийн багц"-ын ерөнхий зураг болохгүй.
const isNewYear = (p) => Number(p.id) >= 1794000000000 && Number(p.id) < 1794000000100;

function escapeHTML(s){
  return String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[c]));
}

async function fetchCustomData(origin){
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 2500);
  try{
    const res = await fetch(new URL("/.netlify/functions/products", origin), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "list" }),
      signal: controller.signal
    });
    if(!res.ok) return { products: [], overrides: {} };
    const data = await res.json();
    return { products: data.products || [], overrides: data.overrides || {} };
  }catch(e){
    return { products: [], overrides: {} };
  }finally{
    clearTimeout(timeout);
  }
}

export default async (request, context) => {
  const url = new URL(request.url);
  const cat = url.searchParams.get("cat");

  const originalResponse = await context.next();
  if(request.method !== "GET" || !cat || !CATEGORY_LABELS[cat]) return originalResponse;

  try{
    const custom = await fetchCustomData(url.origin);
    const merged = BUILTIN_PRODUCTS.map(p => Object.assign({}, p, custom.overrides[String(p.id)] || {}))
      .concat(custom.products);
    const inCat = merged.filter(p => p.category === cat && !p.hidden && !p.soldOut && (p.image || (p.images && p.images.length)));
    const pick = inCat.find(p => !isNewYear(p)) || inCat[0];
    let img = pick ? ((pick.images && pick.images[0]) || pick.image) : "/images/uploads/og-image.png";
    if(!/^https?:/i.test(img)) img = new URL(img.replace(/^\.?\//, "/"), url.origin).href;
    const label = CATEGORY_LABELS[cat];
    const title = `${label} — Зөвхөн түүнд`;
    const desc = CATEGORY_DESCRIPTIONS[cat];
    const pageUrl = `${url.origin}/category.html?cat=${encodeURIComponent(cat)}`;

    const tags = `<meta property="og:type" content="website">
<meta property="og:title" content="${escapeHTML(title)}">
<meta property="og:description" content="${escapeHTML(desc)}">
<meta property="og:image" content="${escapeHTML(img)}">
<meta property="og:image:secure_url" content="${escapeHTML(img)}">
<meta property="og:url" content="${escapeHTML(pageUrl)}">
<meta property="og:site_name" content="Зөвхөн түүнд">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${escapeHTML(title)}">
<meta name="twitter:description" content="${escapeHTML(desc)}">
<meta name="twitter:image" content="${escapeHTML(img)}">
<meta name="description" content="${escapeHTML(desc)}">
<title>${escapeHTML(title)}</title>`;

    let html = await originalResponse.text();
    if(html.includes("<title>") && html.includes("</title>")){
      html = html.replace(/<title>.*?<\/title>/s, tags);
    }else{
      html = html.replace("</head>", tags + "\n</head>");
    }
    return new Response(html, {
      status: originalResponse.status,
      headers: { "content-type": "text/html; charset=utf-8", "cache-control": "public, max-age=300" }
    });
  }catch(e){
    return originalResponse;
  }
};

export const config = { path: "/category.html" };
