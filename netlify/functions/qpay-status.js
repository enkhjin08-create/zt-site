// netlify/functions/qpay-status.js
//
// Polled by order.html every 3s while the QPay modal is open. Checks the
// invoice status with QPay; on first transition to "paid", sends a
// confirmation email via Resend and marks the order paid in Blobs so
// repeat polls don't re-send the email.
//
// TODO: swap in zt-site's existing Resend sending helper / template if one
// already exists, rather than the inline fetch below.

const { getStore, connectLambda } = require('@netlify/blobs');

const QPAY_BASE = process.env.QPAY_BASE_URL || 'https://merchant.qpay.mn/v2';

exports.handler = async (event) => {
  connectLambda(event); // required for Netlify Blobs in CommonJS "Lambda compatibility mode" functions

  const orderId = event.queryStringParameters?.orderId;
  if (!orderId) return { statusCode: 400, body: 'Missing orderId' };

  const ordersStore = getStore('print-orders-meta');
  const order = await ordersStore.get(`${orderId}.json`, { type: 'json' });
  if (!order) return { statusCode: 404, body: 'Order not found' };

  if (order.status === 'paid') {
    return { statusCode: 200, body: JSON.stringify({ status: 'paid' }) };
  }

  try {
    const token = await getQpayToken();
    const res = await fetch(`${QPAY_BASE}/payment/check`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ object_type: 'INVOICE', object_id: order.qpayInvoiceId })
    });
    const data = await res.json();
    const isPaid = data.count > 0 && data.rows?.some(r => r.payment_status === 'PAID');

    if (isPaid) {
      order.status = 'paid';
      order.paidAt = new Date().toISOString();
      await ordersStore.setJSON(`${orderId}.json`, order);
      await sendConfirmationEmail(order);
      return { statusCode: 200, body: JSON.stringify({ status: 'paid' }) };
    }
    return { statusCode: 200, body: JSON.stringify({ status: 'pending' }) };
  } catch (err) {
    console.error('qpay-status check failed', err);
    return { statusCode: 200, body: JSON.stringify({ status: 'pending' }) };
  }
};

async function getQpayToken() {
  const creds = Buffer.from(`${process.env.QPAY_USERNAME}:${process.env.QPAY_PASSWORD}`).toString('base64');
  const res = await fetch(`${QPAY_BASE}/auth/token`, {
    method: 'POST',
    headers: { Authorization: `Basic ${creds}` }
  });
  const data = await res.json();
  return data.access_token;
}

async function sendConfirmationEmail(order) {
  if (!process.env.RESEND_API_KEY) return;
  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: 'ZuvkhunTuund Хэвлэл <orders@zuvhuntuund.com>',
      to: order.customer.email || undefined,
      subject: `Захиалга #${order.orderId} — төлбөр амжилттай`,
      html: `<p>${order.customer.name}, таны ${order.product} (${order.size}) x${order.qty} захиалга төлбөр төлөгдлөө. Бид удахгүй холбогдох болно.</p>`
    })
  }).catch(() => {}); // don't fail the payment check on email errors
}
