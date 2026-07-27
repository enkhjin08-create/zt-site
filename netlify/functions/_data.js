/* ============================================================
   Зөвхөн түүнд — Нэгдсэн өгөгдлийн давхарга (Netlify Blobs)

   ⚠️ JSONBin.io-с Netlify Blobs руу шилжсэн (2026 оны 7-р сар):
   - JSONBin-ийн үнэгүй хязгаар (quota) дүүрч эхэлсэн тул
   - Netlify Blobs нь Netlify-тай угаас нэгтгэгдсэн, тусдаа бүртгэл/
     API key шаардахгүй, чөлөөтэй хэмжээтэй хадгалалт

   ⚠️ Зарим орчинд Netlify Blobs-ийн context автоматаар тохируулагдахгүй
   тул (алдаа: "environment has not been configured...") дараах 2 орчны
   хувьсагчийг ГАРААР тохируулах шаардлагатай:
   - NETLIFY_SITE_ID    → Site configuration → General → Site details → Site ID
   - NETLIFY_BLOBS_TOKEN → Personal Access Token (User settings → Applications
     → New access token, ямар нэгэн тусгай эрх шаардахгүй)

   Бүх Function (orders, products, auth) энэ модулийг ашиглаж
   ЯГ ИЖИЛ "main" гэсэн нэг blob-г уншиж/бичдэг — өгөгдлийн бүтэц
   өмнөх JSONBin баримт бичигтэй бүрэн ижил хэвээр байна:
   { orders, products, overrides, categories, recipients,
     recipientOverrides, coupons, users }

   Хандалтын тоо (pageviews) тусдаа "pageviews" store-д хадгалагдана —
   захиалга/барааны өгөгдөлтэй огт холилдохгүй (race condition-оос
   хамгаалах зорилготой тусгаарлалт).
   ============================================================ */

const { getStore } = require("@netlify/blobs");

const MAIN_KEY = "main";
const EMPTY_DOC = {
  orders: [],
  products: [],
  overrides: {},
  categories: {},
  recipients: {},
  recipientOverrides: {},
  coupons: {},
  users: {}
};

// Хэрэв автомат context ажиллахгүй бол (жишээ: "environment has not been
// configured..." алдаа) siteID/token-ийг гараар дамжуулна.
function storeConfig(name){
  const siteID = process.env.NETLIFY_SITE_ID;
  const token = process.env.NETLIFY_BLOBS_TOKEN;
  if(siteID && token){
    return { name, siteID, token };
  }
  return name; // автомат context ажиллаж байгаа орчинд зүгээр нэрийг дамжуулна
}

function mainStore(){
  return getStore(storeConfig("zt-data"));
}

function pageviewsStore(){
  return getStore(storeConfig("zt-pageviews"));
}

async function readDoc(){
  const store = mainStore();
  const rec = await store.get(MAIN_KEY, { type: "json" });
  if(!rec) return Object.assign({}, EMPTY_DOC);
  return {
    orders: rec.orders || [],
    products: rec.products || [],
    overrides: rec.overrides || {},
    categories: rec.categories || {},
    recipients: rec.recipients || {},
    recipientOverrides: rec.recipientOverrides || {},
    coupons: rec.coupons || {},
    users: rec.users || {}
  };
}

async function writeDoc(doc){
  const store = mainStore();
  await store.setJSON(MAIN_KEY, doc);
}

async function readPageviews(){
  const store = pageviewsStore();
  const rec = await store.get("views", { type: "json" });
  return rec || {};
}

async function writePageviews(pageviews){
  const store = pageviewsStore();
  await store.setJSON("views", pageviews);
}

module.exports = { readDoc, writeDoc, readPageviews, writePageviews };
