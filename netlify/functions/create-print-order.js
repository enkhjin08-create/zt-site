// netlify/functions/create-print-order.js
//
// Receives the order form (product, size, qty, customer info, Canva share
// link), stores order metadata in Netlify Blobs, and creates a QPay invoice
// for the total amount. Returns the QR data to the client.
//
// The design itself is NOT uploaded — the customer shares a Canva view link
// and someone opens it manually to review/export before printing. That
// means there's no file-size limit to worry about, but it also means an
// order isn't truly "ready to print" until a human has opened the link and
// confirmed it's shared correctly (view access on, ideally download allowed).
//
// TODO before deploying:
// - If zt-site already has a QPay helper (token exchange / invoice creation),
//   reuse it here instead of the getQpayToken/createQpayInvoice functions
//   below — no need for two separate QPay integrations in the same site.
// - Confirm env var names match what's already set in Netlify:
//   QPAY_USERNAME, QPAY_PASSWORD, QPAY_INVOICE_CODE

const { getStore, connectLambda } = require('@netlify/blobs');

const QPAY_BASE = process.env.QPAY_BASE_URL || 'https://merchant.qpay.mn/v2';

exports.handler = async (event) => {
  connectLambda(event); // required for Netlify Blobs in CommonJS "Lambda compatibility mode" functions

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method not allowed' };
  }

  let body;
  try {
    body = JSON.parse(event.body);
  } catch {
    return { statusCode: 400, body: 'Invalid JSON' };
  }

  const { product, size, shape, qty, total, customer, canvaLink } = body;
  if (!product || !size || !qty || !total || !customer?.name || !customer?.phone || !canvaLink) {
    return { statusCode: 400, body: 'Missing required fields' };
  }
  if (!/^https:\/\/(www\.)?(canva\.com\/design\/|canva\.link\/)/.test(canvaLink)) {
    return { statusCode: 400, body: 'Invalid Canva link' };
  }

  const orderId = `pr_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

  try {
    // 1. Create the QPay invoice
    const token = await getQpayToken();
    const invoice = await createQpayInvoice(token, {
      orderId,
      amount: total,
      description: `${product} ${size} x${qty}`
    });

    // 2. Store order metadata (status: pending, canva link included)
    const ordersStore = getStore('print-orders-meta');
    await ordersStore.setJSON(`${orderId}.json`, {
      orderId,
      product, size, shape, qty, total,
      customer,
      canvaLink,
      status: 'pending',
      linkChecked: false,
      qpayInvoiceId: invoice.invoice_id,
      createdAt: new Date().toISOString()
    });

    return {
      statusCode: 200,
      body: JSON.stringify({
        orderId,
        qrText: invoice.qr_text || null,
        qrImage: invoice.qr_image || null
      })
    };
  } catch (err) {
    console.error('create-print-order failed', err);
    return { statusCode: 500, body: 'Order creation failed' };
  }
};

async function getQpayToken() {
  const creds = Buffer.from(`${process.env.QPAY_USERNAME}:${process.env.QPAY_PASSWORD}`).toString('base64');
  const res = await fetch(`${QPAY_BASE}/auth/token`, {
    method: 'POST',
    headers: { Authorization: `Basic ${creds}` }
  });
  if (!res.ok) throw new Error('QPay auth failed');
  const data = await res.json();
  return data.access_token;
}

async function createQpayInvoice(token, { orderId, amount, description }) {
  const res = await fetch(`${QPAY_BASE}/invoice`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      invoice_code: process.env.QPAY_INVOICE_CODE,
      sender_invoice_no: orderId,
      invoice_receiver_code: 'terminal',
      invoice_description: description,
      amount,
      callback_url: `${process.env.URL}/.netlify/functions/qpay-status?orderId=${orderId}`
    })
  });
  if (!res.ok) throw new Error('QPay invoice creation failed');
  return res.json();
}
