/* ============================================================
   Зөвхөн түүнд — QPay төлбөрийн Function (QPay Merchant API v2)

   Netlify env vars шаардлагатай (QPay Merchant Portal-аас авна):
   - QPAY_USERNAME     → Merchant Username
   - QPAY_PASSWORD     → Merchant Password
   - QPAY_INVOICE_CODE → Invoice Code (QPay-с бүртгүүлсэн)

   3 үйлдэл дэмжинэ:
   - action="createInvoice" { orderNumber, amount, description }
       → QPay-с QR зураг + банкны апп руу шилжих холбоосуудыг үүсгэж буцаана
   - action="checkPayment"  { invoiceId }
       → тухайн invoice-ийн төлбөр орсон эсэхийг шалгана (frontend-ээс polling хийхэд)
   - action="checkAndConfirm" { invoiceId, orderId }
       → төлбөр орсон бол JSONBin/Blobs дэх захиалгын статусыг "confirmed" болгоно
   ============================================================ */

const { readDoc, writeDoc } = require("./_data.js");

function json(status, body){
  return {
    statusCode: status,
    headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    body: JSON.stringify(body)
  };
}

const QPAY_BASE = "https://merchant.qpay.mn/v2";

let cachedToken = null;
let cachedTokenExpiry = 0;

async function getQpayToken(){
  // Token-г кэшлэж, дахин дахин нэвтрэхгүй байх (QPay token ~1 цаг хүчинтэй)
  if(cachedToken && Date.now() < cachedTokenExpiry){
    return cachedToken;
  }
  const username = process.env.QPAY_USERNAME;
  const password = process.env.QPAY_PASSWORD;
  if(!username || !password){
    throw new Error("QPAY_USERNAME / QPAY_PASSWORD тохируулаагүй байна");
  }
  const basicAuth = Buffer.from(`${username}:${password}`).toString("base64");
  const res = await fetch(`${QPAY_BASE}/auth/token`, {
    method: "POST",
    headers: { "Authorization": `Basic ${basicAuth}`, "Content-Type": "application/json" }
  });
  if(!res.ok){
    const errText = await res.text();
    throw new Error("QPay auth алдаа: " + res.status + " " + errText);
  }
  const data = await res.json();
  cachedToken = data.access_token;
  // Аюулгүйн зэрэгцээ 5 минутаар эрт дуусгана (clock drift-с сэргийлэх)
  cachedTokenExpiry = Date.now() + ((data.expires_in || 3600) - 300) * 1000;
  return cachedToken;
}

async function createInvoice(orderNumber, amount, description){
  const token = await getQpayToken();
  const invoiceCode = process.env.QPAY_INVOICE_CODE;
  if(!invoiceCode) throw new Error("QPAY_INVOICE_CODE тохируулаагүй байна");

  const res = await fetch(`${QPAY_BASE}/invoice`, {
    method: "POST",
    headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      invoice_code: invoiceCode,
      sender_invoice_no: orderNumber,
      invoice_receiver_code: "terminal",
      invoice_description: description || `Захиалга №${orderNumber}`,
      amount: amount,
      callback_url: `${process.env.URL || "https://zuvhuntuund.com"}/.netlify/functions/qpay?action=callback&orderNumber=${orderNumber}`
    })
  });
  if(!res.ok){
    const errText = await res.text();
    throw new Error("QPay invoice алдаа: " + res.status + " " + errText);
  }
  return res.json();
}

async function checkPayment(invoiceId){
  const token = await getQpayToken();
  const res = await fetch(`${QPAY_BASE}/payment/check`, {
    method: "POST",
    headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      object_type: "INVOICE",
      object_id: invoiceId,
      offset: { page_number: 1, page_limit: 100 }
    })
  });
  if(!res.ok){
    const errText = await res.text();
    throw new Error("QPay check алдаа: " + res.status + " " + errText);
  }
  return res.json();
}

exports.handler = async (event) => {
  if(event.httpMethod === "OPTIONS") return json(200, {});

  let body = {};
  try{ body = JSON.parse(event.body || "{}"); }
  catch(e){ /* GET callback дуудлагад body шаардлагагүй */ }

  const params = event.queryStringParameters || {};
  const action = body.action || params.action;

  try{
    /* ---- QPay callback (QPay сервер өөрөө дуудна) ---- */
    if(action === "callback"){
      // QPay callback ирэхэд бид зөвхөн 200 OK буцаана — жинхэнэ баталгаажуулалтыг
      // frontend-ийн checkAndConfirm polling-оор хийдэг (найдвартай байдлын үүднээс)
      return json(200, { ok: true });
    }

    /* ---- createInvoice ---- */
    if(action === "createInvoice"){
      const { orderNumber, amount, description } = body;
      if(!orderNumber || !amount) return json(400, { error: "orderNumber, amount шаардлагатай" });
      const invoice = await createInvoice(orderNumber, amount, description);
      return json(200, {
        ok: true,
        invoiceId: invoice.invoice_id,
        qrText: invoice.qr_text,
        qrImage: invoice.qr_image,
        urls: invoice.urls || []
      });
    }

    /* ---- checkPayment ---- */
    if(action === "checkPayment"){
      const { invoiceId } = body;
      if(!invoiceId) return json(400, { error: "invoiceId шаардлагатай" });
      const result = await checkPayment(invoiceId);
      const paid = (result.count || 0) > 0 &&
        (result.rows || []).some(r => r.payment_status === "PAID");
      return json(200, { ok: true, paid, raw: result });
    }

    /* ---- checkAndConfirm ---- */
    if(action === "checkAndConfirm"){
      const { invoiceId, orderId } = body;
      if(!invoiceId || !orderId) return json(400, { error: "invoiceId, orderId шаардлагатай" });
      const result = await checkPayment(invoiceId);
      const paid = (result.count || 0) > 0 &&
        (result.rows || []).some(r => r.payment_status === "PAID");

      if(paid){
        const doc = await readDoc();
        const idx = doc.orders.findIndex(o => o.id === orderId);
        if(idx >= 0 && doc.orders[idx].status === "new"){
          doc.orders[idx].status = "confirmed";
          doc.orders[idx].paidViaQpay = true;
          doc.orders[idx].qpayInvoiceId = invoiceId;
          await writeDoc(doc);
        }
      }
      return json(200, { ok: true, paid });
    }

    return json(400, { error: "Unknown action" });
  }catch(e){
    console.error("[qpay error]", e.message);
    return json(500, { error: e.message });
  }
};
