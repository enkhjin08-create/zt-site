// netlify/functions/canva-oauth-callback.js
//
// Step 2 of the Canva Connect OAuth (PKCE) flow. Canva redirects here after
// the customer approves access. Verifies the CSRF state, exchanges the
// authorization code for an access token, stores the token server-side in
// Netlify Blobs (keyed by a random session id — the browser never sees the
// token itself), then returns a tiny HTML page that posts the session id
// back to the order.html popup opener and closes itself.

const crypto = require('crypto');
const { getStore, connectLambda } = require('@netlify/blobs');

function parseCookies(header) {
  const out = {};
  (header || '').split(';').forEach(part => {
    const [k, ...v] = part.trim().split('=');
    if (k) out[k] = decodeURIComponent(v.join('='));
  });
  return out;
}

function popupResponse({ ok, sessionId, error }) {
  const message = ok
    ? { type: 'canva-oauth-success', sessionId }
    : { type: 'canva-oauth-error', error: error || 'unknown_error' };
  return {
    statusCode: 200,
    headers: { 'Content-Type': 'text/html' },
    body: `<!DOCTYPE html><html><body>
      <script>
        if (window.opener) {
          window.opener.postMessage(${JSON.stringify(message)}, '*');
        }
        window.close();
      </script>
      <p>Та энэ цонхыг хааж болно.</p>
    </body></html>`
  };
}

exports.handler = async (event) => {
  connectLambda(event);

  const { code, state, error: canvaError } = event.queryStringParameters || {};
  const cookies = parseCookies(event.headers.cookie);

  if (canvaError) return popupResponse({ ok: false, error: canvaError });
  if (!code || !state || state !== cookies.canva_oauth_state) {
    return popupResponse({ ok: false, error: 'invalid_state' });
  }
  if (!cookies.canva_pkce_verifier) {
    return popupResponse({ ok: false, error: 'missing_verifier' });
  }

  try {
    const clientId = process.env.CANVA_CLIENT_ID;
    const clientSecret = process.env.CANVA_CLIENT_SECRET;
    const redirectUri = process.env.CANVA_REDIRECT_URI;
    const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

    const tokenRes = await fetch('https://api.canva.com/rest/v1/oauth/token', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${basicAuth}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        code_verifier: cookies.canva_pkce_verifier,
        redirect_uri: redirectUri
      })
    });

    if (!tokenRes.ok) {
      console.error('canva token exchange failed', await tokenRes.text());
      return popupResponse({ ok: false, error: 'token_exchange_failed' });
    }

    const tokenData = await tokenRes.json();
    const sessionId = crypto.randomBytes(24).toString('base64url');
    const sessionsStore = getStore('canva-sessions');
    await sessionsStore.setJSON(`${sessionId}.json`, {
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token,
      expiresAt: Date.now() + (tokenData.expires_in * 1000),
      createdAt: new Date().toISOString()
    });

    return popupResponse({ ok: true, sessionId });
  } catch (err) {
    console.error('canva-oauth-callback failed', err);
    return popupResponse({ ok: false, error: 'server_error' });
  }
};
