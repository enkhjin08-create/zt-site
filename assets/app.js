/* ============================================================
   Зөвхөн түүнд — shared app logic
   Cart/box state lives in localStorage (this is a real deployed
   site, not a Claude.ai artifact, so localStorage is fine here).
   ============================================================ */

const BOX_KEY = "zt_box_v1";

function emptyBox(){
  return { recipient: null, containerId: null, itemIds: [], message: "", customerName: "", customerPhone: "", deliveryDistrict: "", deliveryKhoroo: "", deliveryAddress: "", orderNumber: null };
}
function loadBox(){
  try{
    const raw = localStorage.getItem(BOX_KEY);
    if(!raw) return emptyBox();
    const b = JSON.parse(raw);
    return Object.assign(emptyBox(), b);
  }catch(e){ return emptyBox(); }
}
function saveBox(box){
  localStorage.setItem(BOX_KEY, JSON.stringify(box));
  updateCartBadge();
}
function getProduct(id){ return PRODUCTS.find(p => p.id === Number(id)); }
function formatPrice(n){
  let s;
  try{ s = n.toLocaleString("mn-MN"); }
  catch(e){ s = String(n); }
  // Хэрэв locale өргөн дэлгэрэнгүй биш бол (espace дутуу), гараар таслалаар ангилна
  if(!/[,\s]/.test(s) && n >= 1000){ s = String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ","); }
  return s + "₮";
}

// Хэрэглэгчээс шууд орж ирсэн текстийг (нэр, утас, зурвас) HTML-д аюулгүй оруулах
function escapeHTML(s){
  return String(s == null ? "" : s)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

function boxItemCount(box){
  return box.itemIds.length + (box.containerId ? 1 : 0);
}
function boxTotal(box){
  let total = 0;
  if(box.containerId){ const c = getProduct(box.containerId); if(c) total += c.price; }
  box.itemIds.forEach(id => { const p = getProduct(id); if(p) total += p.price; });
  return total;
}
function addToBox(id){
  const box = loadBox();
  box.itemIds.push(Number(id));
  saveBox(box);
  const p = getProduct(id);
  toast((p ? p.name : "Бараа") + " хайрцагт нэмэгдлээ 🎀");
}
function removeFromBoxIndex(i){
  const box = loadBox();
  box.itemIds.splice(i,1);
  saveBox(box);
  return box;
}

function updateCartBadge(){
  const box = loadBox();
  document.querySelectorAll(".nav-cart .count").forEach(el => { el.textContent = boxItemCount(box); });
}

/* ---------------- Toast ---------------- */
let toastTimer = null;
function toast(msg){
  let el = document.querySelector(".toast");
  if(!el){
    el = document.createElement("div");
    el.className = "toast";
    document.body.appendChild(el);
  }
  el.textContent = msg;
  el.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove("show"), 2400);
}

/* ---------------- Icons (monoline, viewBox 0 0 100 100) ---------------- */
const ICONS = {
  cup: `<path d="M26 30h40v28a20 20 0 0 1-20 20 20 20 0 0 1-20-20V30z" fill="none" stroke="currentColor" stroke-width="5" stroke-linejoin="round"/>
        <path d="M66 38h6a10 10 0 0 1 0 20h-6" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round"/>
        <path d="M36 22c0-4 4-4 4-8" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>
        <path d="M48 22c0-4 4-4 4-8" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>`,
  giftset: `<rect x="22" y="42" width="56" height="38" rx="4" fill="none" stroke="currentColor" stroke-width="5"/>
        <path d="M22 56h56" stroke="currentColor" stroke-width="5"/>
        <path d="M50 42v38" stroke="currentColor" stroke-width="5"/>
        <path d="M50 42c-4-10-22-14-22-2 0 6 10 6 22 2z" fill="none" stroke="currentColor" stroke-width="4.5" stroke-linejoin="round"/>
        <path d="M50 42c4-10 22-14 22-2 0 6-10 6-22 2z" fill="none" stroke="currentColor" stroke-width="4.5" stroke-linejoin="round"/>`,
  flower: `<circle cx="50" cy="46" r="8" fill="none" stroke="currentColor" stroke-width="5"/>
        <circle cx="50" cy="26" r="11" fill="none" stroke="currentColor" stroke-width="4.5"/>
        <circle cx="50" cy="66" r="11" fill="none" stroke="currentColor" stroke-width="4.5"/>
        <circle cx="30" cy="36" r="11" fill="none" stroke="currentColor" stroke-width="4.5"/>
        <circle cx="70" cy="36" r="11" fill="none" stroke="currentColor" stroke-width="4.5"/>
        <circle cx="30" cy="56" r="11" fill="none" stroke="currentColor" stroke-width="4.5"/>
        <circle cx="70" cy="56" r="11" fill="none" stroke="currentColor" stroke-width="4.5"/>
        <path d="M50 77v14" stroke="currentColor" stroke-width="4.5" stroke-linecap="round"/>`,
  extra: `<rect x="18" y="28" width="64" height="46" rx="5" fill="none" stroke="currentColor" stroke-width="5"/>
        <path d="M18 32l32 24 32-24" fill="none" stroke="currentColor" stroke-width="5" stroke-linejoin="round" stroke-linecap="round"/>
        <path d="M50 56l-4 4 4 4 4-4z" fill="currentColor" stroke="none"/>`,
  greeting: `<rect x="20" y="18" width="60" height="64" rx="6" fill="none" stroke="currentColor" stroke-width="5"/>
        <path d="M50 18v64" stroke="currentColor" stroke-width="4"/>
        <path d="M58 53c-3-6-13-6-13-1 0 4 6 4 13 8 7-4 13-4 13-8 0-5-10-5-13 1z" fill="currentColor" stroke="none"/>`,
  box: `<path d="M30 44c8-16 32-16 40 0" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round"/>
        <circle cx="30" cy="44" r="7" fill="none" stroke="currentColor" stroke-width="5"/>
        <circle cx="70" cy="44" r="7" fill="none" stroke="currentColor" stroke-width="5"/>
        <path d="M50 50v26" stroke="currentColor" stroke-width="5" stroke-linecap="round"/>
        <path d="M38 64c4 6 20 6 24 0" fill="none" stroke="currentColor" stroke-width="4.5" stroke-linecap="round"/>`
};

// Ангилал бүрийн дүрс — built-in ангилал бол шууд key-ээрээ, custom (Админ
// нэмсэн) ангилал бол category.iconRef-ээр одоо байгаа дүрс зээлнэ.
function categoryIconSvg(catKey){
  const cat = CATEGORIES[catKey];
  const ref = (cat && cat.iconRef) || catKey;
  return ICONS[ref] || ICONS.extra;
}

function productArtHTML(p, opts){
  opts = opts || {};
  const cat = CATEGORIES[p.category];
  let badge = "";
  if(p.soldOut){ badge = `<span class="badge sold">Дууссан</span>`; }
  else if(p.oldPrice){ badge = `<span class="badge">-${Math.round(100 - (p.price/p.oldPrice*100))}%</span>`; }
  const heightRule = opts.height ? `height:${opts.height};` : "";
  if(p.image){
    return `<div class="product-art" style="${heightRule}background:${cat.tint}">
        ${badge}
        <img src="${p.image}" alt="${escapeHTML(p.name)}" loading="lazy" style="width:100%;height:100%;object-fit:cover">
      </div>`;
  }
  return `<div class="product-art" style="${heightRule}background:${cat.tint};color:${cat.color}">
      ${badge}
      <svg viewBox="0 0 100 100">${categoryIconSvg(p.category)}</svg>
    </div>`;
}

function priceRowHTML(p){
  return `<div class="price-row">
      <span class="price">${formatPrice(p.price)}</span>
      ${p.oldPrice ? `<span class="price-old">${formatPrice(p.oldPrice)}</span>` : ""}
    </div>`;
}

function productCardHTML(p){
  return `<div class="product-card" data-id="${p.id}">
    <a href="product.html?id=${p.id}">${productArtHTML(p)}</a>
    <div class="product-body">
      <a href="product.html?id=${p.id}"><div class="name">${p.name}</div></a>
      ${priceRowHTML(p)}
      <div class="product-actions">
        <button class="btn btn-ghost btn-sm" onclick="addToBox(${p.id})" ${p.soldOut ? "disabled" : ""}>Хайрцагт нэмэх</button>
        <a class="btn btn-outline btn-sm" href="product.html?id=${p.id}">Дэлгэрэнгүй</a>
      </div>
    </div>
  </div>`;
}

/* ---------------- Header / Footer ---------------- */
function renderHeader(active){
  const links = [
    ["index.html","Нүүр"],
    ["category.html","Бүтээгдэхүүн"],
    ["builder.html","Бэлэг бэлдэх"],
  ];
  const navLinks = links.map(([href,label]) =>
    `<a href="${href}" class="${active===href ? "active" : ""}">${label}</a>`).join("");
  const html = `
  <div class="wrap">
    <a href="index.html" class="logo">
      <img class="mark" src="assets/images/logo-icon.png" alt="" width="36" height="36">
      <img class="wordmark-img" src="assets/images/logo-wordmark-sm.png" alt="Зөвхөн түүнд" height="22">
    </a>
    <nav class="main-nav">${navLinks}</nav>
    <a class="nav-cart" href="builder.html"><span>🎁 Сагс</span><span class="count">0</span></a>
  </div>`;
  document.querySelectorAll(".site-header").forEach(el => el.innerHTML = html);
  updateCartBadge();
}

function renderFooter(){
  const html = `
  <div class="wrap">
    <div>
      <img src="assets/images/logo-wordmark-sm.png" alt="Зөвхөн түүнд" height="26" style="margin-bottom:12px">
      <p style="margin-top:10px;max-width:30em">Зөвхөн түүнд тань зориулсан онцгой бэлгийн дэлгүүр — Улаанбаатар хот.</p>
    </div>
    <div>
      <h4>Холбоо барих</h4>
      <p style="margin-top:10px">Хөдөө аж ахуйн яамны эсрэг талд<br>Orchlon complex, 3 давхар, 312 тоот</p>
      <p><a href="tel:90081808">90081808</a></p>
      <p><a href="mailto:info.zuvhuntuund@gmail.com">info.zuvhuntuund@gmail.com</a></p>
    </div>
    <div>
      <h4>Биднийг дагаарай</h4>
      <p style="margin-top:10px"><a href="https://www.facebook.com/Zuvhuntuund/" target="_blank" rel="noopener">Facebook</a></p>
      <p><a href="https://instagram.com/zuvhuntuund" target="_blank" rel="noopener">Instagram</a></p>
      <p><a href="https://zuvhuntuund.com" target="_blank" rel="noopener">Дэлгүүр (Zochil) →</a></p>
    </div>
  </div>
  <div class="wrap foot-bottom">
    <span>© 2026 Зөвхөн түүнд</span>
    <span>Захиалга баталгаажуулалт, төлбөр, хүргэлт — zuvhuntuund.com дэлгүүрээр дамжина</span>
  </div>`;
  document.querySelectorAll(".site-footer").forEach(el => el.innerHTML = html);
}

document.addEventListener("DOMContentLoaded", updateCartBadge);
