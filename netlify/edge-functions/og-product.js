// Facebook/Messenger/Telegram/Viber зэрэг апп-ууд линк шэйрлэхэд thumbnail зураг
// татахдаа JavaScript ажиллуулдаггүй тул (product.html бол client-side SPA) статик
// meta tag-той HTML авах шаардлагатай. Энэ Edge Function зөвхөн "bot" (crawler)
// хандалтад л тухайн барааны нэр/үнэ/зурагтай тусгай HTML буцаана — жинхэнэ
// хэрэглэгчид ердийн product.html-ийг л хэвээр авна (өөрчлөлт мэдрэгдэхгүй).

import { PRODUCTS as BUILTIN_PRODUCTS } from "./_data/builtin-products.mjs";

const BOT_UA_PATTERN = /facebookexternalhit|Facebot|Twitterbot|TelegramBot|WhatsApp|Viber|LinkedInBot|Slackbot|Discordbot|Pinterest|SkypeUriPreview|vkShare|Applebot|Googlebot|redditbot|Snapchat|W3C_Validator/i;

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
  try{
    const res = await fetch(new URL("/.netlify/functions/products", origin), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "list" })
    });
    if(!res.ok) return { products: [], overrides: {} };
    const data = await res.json();
    return { products: data.products || [], overrides: data.overrides || {} };
  }catch(e){
    return { products: [], overrides: {} };
  }
}

function resolveProduct(id, builtin, custom){
  // Эхлээд захиалгат (админаас нэмсэн) бараанаас хайна
  const customMatch = custom.products.find(p => String(p.id) === String(id));
  if(customMatch) return customMatch;

  // Дараа нь үндсэн 103 барааны нэгээс хайж, override (админ засвар) байвал нэгтгэнэ
  const base = builtin.find(p => String(p.id) === String(id));
  if(!base) return null;
  const patch = custom.overrides[String(id)] || custom.overrides[id] || {};
  return Object.assign({}, base, patch);
}

export default async (request, context) => {
  const url = new URL(request.url);
  const ua = request.headers.get("user-agent") || "";
  const isBot = BOT_UA_PATTERN.test(ua);

  // Жинхэнэ хэрэглэгч бол ердийн статик product.html-ийг хэвээр нь буцаана — ямар ч өөрчлөлт үгүй.
  if(!isBot) return context.next();

  const id = url.searchParams.get("id");
  if(!id) return context.next();

  const custom = await fetchCustomData(url.origin);
  const product = resolveProduct(id, BUILTIN_PRODUCTS, custom);
  if(!product) return context.next();

  const images = product.images && product.images.length ? product.images : (product.image ? [product.image] : []);
  const ogImage = images[0] || `${url.origin}/images/og-image.png`;
  const price = typeof product.price === "number" ? product.price.toLocaleString("mn-MN") + "₮" : "";
  const catLabel = CATEGORY_LABELS[product.category] || "";
  const desc = (product.description && product.description.trim())
    ? product.description.trim()
    : (CATEGORY_DESCRIPTIONS[product.category] || "Зөвхөн түүнд тань зориулсан онцгой бэлэг.");
  const title = product.name ? `${product.name}${price ? " — " + price : ""}` : "Зөвхөн түүнд";
  const pageUrl = `${url.origin}/product.html?id=${encodeURIComponent(id)}`;

  const html = `<!DOCTYPE html>
<html lang="mn">
<head>
<meta charset="UTF-8">
<title>${escapeHTML(title)}</title>
<meta name="description" content="${escapeHTML(desc)}">
<meta property="og:type" content="product">
<meta property="og:title" content="${escapeHTML(title)}">
<meta property="og:description" content="${escapeHTML(desc)}">
<meta property="og:image" content="${escapeHTML(ogImage)}">
<meta property="og:url" content="${escapeHTML(pageUrl)}">
<meta property="og:site_name" content="Зөвхөн түүнд">
${catLabel ? `<meta property="product:category" content="${escapeHTML(catLabel)}">` : ""}
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${escapeHTML(title)}">
<meta name="twitter:description" content="${escapeHTML(desc)}">
<meta name="twitter:image" content="${escapeHTML(ogImage)}">
</head>
<body>
<p>${escapeHTML(title)}</p>
</body>
</html>`;

  return new Response(html, {
    status: 200,
    headers: { "content-type": "text/html; charset=utf-8", "cache-control": "public, max-age=600" }
  });
};

export const config = { path: "/product.html" };
