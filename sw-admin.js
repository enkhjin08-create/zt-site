// Админ вэб апп-ын service worker. Зөвхөн /admin хуудас болон түүний статик файлыг (CSS, зураг, фонт)
// кэшлэнэ. /api/* болон бүх өгөгдөл ХЭЗЭЭ Ч кэшлэгдэхгүй — захиалга үргэлж шинэ байна.
const CACHE = "zt-admin-v1";
const SHELL = ["/assets/style.css", "/assets/images/pwa/icon-192.png"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).catch(() => {}));
  self.skipWaiting();
});
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});
self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;
  if (url.pathname.startsWith("/api/") || url.pathname.startsWith("/.netlify/")) return;

  // Хуудас: үргэлж сүлжээнээс (шинэ хувилбар), сүлжээгүй бол кэшээс
  if (req.mode === "navigate") {
    e.respondWith(
      fetch(req).then((r) => {
        const copy = r.clone();
        caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
        return r;
      }).catch(() => caches.match(req).then((m) => m || new Response("Интернэт холболтгүй байна. Холбогдоод дахин оролдоно уу.", { status: 503, headers: { "Content-Type": "text/plain; charset=utf-8" } })))
    );
    return;
  }
  // Статик файл: кэшээс шууд, цаана нь шинэчилнэ
  if (url.pathname.startsWith("/assets/") || url.pathname.startsWith("/images/")) {
    e.respondWith(
      caches.match(req).then((m) => {
        const net = fetch(req).then((r) => {
          if (r.ok) caches.open(CACHE).then((c) => c.put(req, r.clone())).catch(() => {});
          return r;
        }).catch(() => m);
        return m || net;
      })
    );
  }
});
