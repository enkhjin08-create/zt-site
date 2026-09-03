// netlify/functions/list-print-orders.js
//
// Returns all orders from the print-orders-meta Blobs store, for admin.html.
// Gated by a shared ADMIN_KEY env var checked against the x-admin-key header.
//
// TODO: if zt-site already has a real admin auth pattern (magic link, per the
// existing customer-profile auth), swap this shared-password check for that
// instead — a single shared password is an MVP stopgap, not the long-term fit.

const { getStore } = require('@netlify/blobs');

exports.handler = async (event) => {
  if (event.headers['x-admin-key'] !== process.env.ADMIN_KEY) {
    return { statusCode: 401, body: 'Unauthorized' };
  }

  try {
    const store = getStore('print-orders-meta');
    const { blobs } = await store.list();
    const orders = await Promise.all(
      blobs.map(b => store.get(b.key, { type: 'json' }))
    );
    return {
      statusCode: 200,
      body: JSON.stringify(orders.filter(Boolean))
    };
  } catch (err) {
    console.error('list-print-orders failed', err);
    return { statusCode: 500, body: 'Failed to list orders' };
  }
};
