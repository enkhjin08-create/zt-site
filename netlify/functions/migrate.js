/* ============================================================
   Зөвхөн түүнд — JSONBin → Netlify Blobs НЭГ УДААГИЙН шилжилтийн Function

   ХЭРХЭН АШИГЛАХ:
   1. Хуучин JSONBIN_BIN_ID, JSONBIN_MASTER_KEY орчны хувьсагчид Netlify
      дээр ХЭВЭЭР байгаа эсэхийг шалгана (устгаагүй байх ёстой — энэ
      function тэднийг уншиж, Blobs руу хуулна).
   2. Дараах URL руу browser-с ordоно (эсвэл шинэ tab):
      https://таны-сайт.netlify.app/.netlify/functions/migrate?pin=ТАНЫ_ADMIN_PIN
   3. "ok: true, migrated: {...}" гэсэн хариу харагдвал шилжилт амжилттай.
   4. Шилжилт дууссаны дараа энэ файл (migrate.js)-г устгаж болно —
      цаашид хэрэггүй.

   ⚠️ Аюулгүй байдал: зөвхөн зөв ADMIN_PIN-тэй л ажиллана.
   ============================================================ */

const { getStore } = require("@netlify/blobs");

function json(status, body){
  return {
    statusCode: status,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  };
}

function checkPin(pin){
  const real = process.env.ADMIN_PIN;
  return typeof real === "string" && real.length > 0 && pin === real;
}

exports.handler = async (event) => {
  const params = event.queryStringParameters || {};
  if(!checkPin(params.pin)) return json(401, { error: "Invalid PIN" });

  if(!process.env.JSONBIN_BIN_ID || !process.env.JSONBIN_MASTER_KEY){
    return json(400, { error: "JSONBIN_BIN_ID / JSONBIN_MASTER_KEY орчны хувьсагч олдсонгүй — эдгээрийг түр хугацаанд Netlify дээр хэвээр байлгана уу." });
  }

  try{
    // 1) Хуучин JSONBin-аас гол баримт бичгийг татаж авна
    const mainRes = await fetch(
      "https://api.jsonbin.io/v3/b/" + process.env.JSONBIN_BIN_ID + "/latest",
      { headers: { "X-Master-Key": process.env.JSONBIN_MASTER_KEY } }
    );
    if(!mainRes.ok) throw new Error("JSONBin (main) read failed: " + mainRes.status);
    const mainData = await mainRes.json();
    const record = mainData.record || {};

    const mainDoc = {
      orders: Array.isArray(record.orders) ? record.orders : [],
      products: Array.isArray(record.products) ? record.products : [],
      overrides: (record.overrides && typeof record.overrides === "object") ? record.overrides : {},
      categories: (record.categories && typeof record.categories === "object") ? record.categories : {},
      recipients: (record.recipients && typeof record.recipients === "object") ? record.recipients : {},
      recipientOverrides: (record.recipientOverrides && typeof record.recipientOverrides === "object") ? record.recipientOverrides : {},
      coupons: (record.coupons && typeof record.coupons === "object") ? record.coupons : {},
      users: (record.users && typeof record.users === "object") ? record.users : {}
    };

    // 2) Netlify Blobs руу бичнэ (гол дата)
    const mainStore = getStore("zt-data");
    await mainStore.setJSON("main", mainDoc);

    // 3) Хандалтын түүх (pageviews) — хуучин main bin дотор байсан бол,
    //    эсвэл тусдаа PAGEVIEWS_BIN_ID байсан бол хоёуланг нь шалгана.
    let pageviews = (record.pageviews && typeof record.pageviews === "object") ? record.pageviews : {};
    if(process.env.PAGEVIEWS_BIN_ID){
      try{
        const pvRes = await fetch(
          "https://api.jsonbin.io/v3/b/" + process.env.PAGEVIEWS_BIN_ID + "/latest",
          { headers: { "X-Master-Key": process.env.JSONBIN_MASTER_KEY } }
        );
        if(pvRes.ok){
          const pvData = await pvRes.json();
          const pvRecord = pvData.record || {};
          if(pvRecord.pageviews && typeof pvRecord.pageviews === "object"){
            pageviews = Object.assign({}, pageviews, pvRecord.pageviews);
          }
        }
      }catch(e){ /* pageviews bin байхгүй бол алгасна */ }
    }
    const pvStore = getStore("zt-pageviews");
    await pvStore.setJSON("views", pageviews);

    return json(200, {
      ok: true,
      migrated: {
        orders: mainDoc.orders.length,
        products: mainDoc.products.length,
        overrides: Object.keys(mainDoc.overrides).length,
        categories: Object.keys(mainDoc.categories).length,
        recipients: Object.keys(mainDoc.recipients).length,
        coupons: Object.keys(mainDoc.coupons).length,
        users: Object.keys(mainDoc.users).length,
        pageviewKeys: Object.keys(pageviews).length
      },
      note: "Амжилттай! Одоо шилжилт дууссан тул migrate.js файлыг устгаж болно."
    });
  }catch(e){
    console.error("[migrate error]", e.message);
    return json(500, { error: "Шилжилт амжилтгүй: " + e.message });
  }
};
