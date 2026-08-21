// Facebook/Messenger/Telegram/Viber/iMessage зэрэг апп-ууд линк шэйрлэхэд thumbnail
// татахдаа ихэвчлэн JavaScript ажиллуулдаггүй тул (product.html бол зөвхөн browser
// дээр л дата ачаалдаг SPA хуудас) статик meta tag ХЭРЭГТЭЙ.
//
// ⚠️ Анхны хувилбар зөвхөн "мэдэгдэж буй bot" User-Agent-уудад (Facebook, Telegram гэх мэт)
// тусгай HTML буцаадаг байсан ч Apple-ийн iMessage crawler нь ялгагдах тодорхой bot
// тэмдэг ашигладаггүй тул алгасагдаж байсан. Тиймээс одоо ЭНЭ Edge Function БҮХ хандалтад
// (хүн, bot аль алинд адилхан) жинхэнэ product.html-ийн <head> дотор зөв OG meta tag-г
// шууд нэмж өгдөг болсон — жинхэнэ хэрэглэгчийн харах, ажиллах контент огт өөрчлөгдөхгүй,
// зөвхөн <head> доторх мета мэдээлэл л product-специфик болно.

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

function resolveProduct(id, builtin, custom){
  const customMatch = custom.products.find(p => String(p.id) === String(id));
  if(customMatch) return customMatch;
  const base = builtin.find(p => String(p.id) === String(id));
  if(!base) return null;
  const patch = custom.overrides[String(id)] || custom.overrides[id] || {};
  return Object.assign({}, base, patch);
}

export default async (request, context) => {
  const url = new URL(request.url);
  const id = url.searchParams.get("id");

  const originalResponse = await context.next();

  // Зөвхөн энгийн GET хүсэлтэд л body-г өөрчилнө. iMessage/зарим preview fetcher
  // эхлээд HEAD хүсэлт илгээдэг тул тэдгээрт хуучин хариугаа хэвээр буцаана —
  // эс тэгвээс HEAD хариунд хоосон body дээр .text()/replace хийх нь Apple-ийн
  // fetcher-т алдаа мэт харагдаж, урьдчилан харах цонх огт татгалзагдах эрсдэлтэй.
  if(request.method !== "GET" || !id) return originalResponse;

  try{
    const custom = await fetchCustomData(url.origin);
    const product = resolveProduct(id, BUILTIN_PRODUCTS, custom);
    if(!product) return originalResponse;

    const images = product.images && product.images.length ? product.images : (product.image ? [product.image] : []);
    const ogImage = images[0] || `${url.origin}/images/og-image.png`;
    const price = typeof product.price === "number" ? product.price.toLocaleString("mn-MN") + "₮" : "";
    const catLabel = CATEGORY_LABELS[product.category] || "";
    const desc = (product.description && product.description.trim())
      ? product.description.trim()
      : (CATEGORY_DESCRIPTIONS[product.category] || "Зөвхөн түүнд тань зориулсан онцгой бэлэг.");
    const title = product.name ? `${product.name}${price ? " — " + price : ""}` : "Зөвхөн түүнд";
    const pageUrl = `${url.origin}/product.html?id=${encodeURIComponent(id)}`;

    const injectedTags = `<meta property="og:type" content="product">
<meta property="og:title" content="${escapeHTML(title)}">
<meta property="og:description" content="${escapeHTML(desc)}">
<meta property="og:image" content="${escapeHTML(ogImage)}">
<meta property="og:image:secure_url" content="${escapeHTML(ogImage)}">
<meta property="og:url" content="${escapeHTML(pageUrl)}">
<meta property="og:site_name" content="Зөвхөн түүнд">
${catLabel ? `<meta property="product:category" content="${escapeHTML(catLabel)}">` : ""}
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${escapeHTML(title)}">
<meta name="twitter:description" content="${escapeHTML(desc)}">
<meta name="twitter:image" content="${escapeHTML(ogImage)}">
<meta name="description" content="${escapeHTML(desc)}">
<title>${escapeHTML(title)}</title>`;

    let html = await originalResponse.text();
    if(html.includes("<title>") && html.includes("</title>")){
      html = html.replace(/<title>.*?<\/title>/s, injectedTags);
    }else{
      html = html.replace("</head>", injectedTags + "\n</head>");
    }

    return new Response(html, {
      status: originalResponse.status,
      headers: { "content-type": "text/html; charset=utf-8", "cache-control": "public, max-age=300" }
    });
  }catch(e){
    // Ямар нэг алдаа гарвал (жишээ нь Blobs удаашрал) эвдэрсэн хариу буцаахаас
    // илүү аюулгүй нь — анхны статик хуудсыг л шууд буцаах.
    return originalResponse;
  }
};

export const config = { path: "/product.html" };
