// netlify/functions/list-canva-designs.js
//
// Called by order.html after a successful Canva OAuth popup flow. Looks up
// the stored token for the given session id, refreshes it if expired, calls
// Canva's List designs endpoint, and returns a simplified list (id, title,
// thumbnailUrl, viewUrl) for the design-picker grid.

const { getStore, connectLambda } = require('@netlify/blobs');

exports.handler = async (event) => {
  connectLambda(event);

  const sessionId = event.queryStringParameters?.session;
  if (!sessionId) return { statusCode: 400, body: JSON.stringify({ error: 'Missing session' }) };

  const sessionsStore = getStore('canva-sessions');
  let session = await sessionsStore.get(`${sessionId}.json`, { type: 'json' });
  if (!session) return { statusCode: 401, body: JSON.stringify({ error: 'Session not found or expired' }) };

  try {
    if (Date.now() > session.expiresAt - 30000) {
      session = await refreshToken(session);
      await sessionsStore.setJSON(`${sessionId}.json`, session);
    }

    const res = await fetch('https://api.canva.com/rest/v1/designs?ownership=owned', {
      headers: { Authorization: `Bearer ${session.accessToken}` }
    });
    if (!res.ok) {
      console.error('list designs failed', await res.text());
      return { statusCode: 502, body: JSON.stringify({ error: 'Failed to fetch designs from Canva' }) };
    }
    const data = await res.json();

    const designs = (data.items || []).map(d => ({
      id: d.id,
      title: d.title || 'Нэргүй дизайн',
      thumbnailUrl: d.thumbnail?.url || null,
      viewUrl: d.urls?.view_url || null
    }));

    return { statusCode: 200, body: JSON.stringify({ designs }) };
  } catch (err) {
    console.error('list-canva-designs failed', err);
    return { statusCode: 500, body: JSON.stringify({ error: 'Server error' }) };
  }
};

async function refreshToken(session) {
  const clientId = process.env.CANVA_CLIENT_ID;
  const clientSecret = process.env.CANVA_CLIENT_SECRET;
  const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

  const res = await fetch('https://api.canva.com/rest/v1/oauth/token', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${basicAuth}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: session.refreshToken
    })
  });
  if (!res.ok) throw new Error('Failed to refresh Canva token');
  const data = await res.json();

  return {
    ...session,
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresAt: Date.now() + (data.expires_in * 1000)
  };
}
