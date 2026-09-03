// netlify/functions/update-print-order.js
//
// Patches a single order's metadata (e.g. { linkChecked: true } or
// { status: 'printed' }) from admin.html. Same shared-password gate as
// list-print-orders.js — see the TODO there about swapping in real admin auth.

const { getStore, connectLambda } = require('@netlify/blobs');

exports.handler = async (event) => {
  connectLambda(event); // required for Netlify Blobs in CommonJS "Lambda compatibility mode" functions

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method not allowed' };
  }
  if (event.headers['x-admin-key'] !== process.env.ADMIN_KEY) {
    return { statusCode: 401, body: 'Unauthorized' };
  }

  let body;
  try {
    body = JSON.parse(event.body);
  } catch {
    return { statusCode: 400, body: 'Invalid JSON' };
  }

  const { orderId, patch } = body;
  if (!orderId || !patch) {
    return { statusCode: 400, body: 'Missing orderId or patch' };
  }

  try {
    const store = getStore('print-orders-meta');
    const order = await store.get(`${orderId}.json`, { type: 'json' });
    if (!order) return { statusCode: 404, body: 'Order not found' };

    Object.assign(order, patch);
    await store.setJSON(`${orderId}.json`, order);

    return { statusCode: 200, body: JSON.stringify({ ok: true }) };
  } catch (err) {
    console.error('update-print-order failed', err);
    return { statusCode: 500, body: 'Update failed' };
  }
};
