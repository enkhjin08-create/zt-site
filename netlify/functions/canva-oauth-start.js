// netlify/functions/canva-oauth-start.js
//
// Step 1 of the Canva Connect OAuth (PKCE) flow. Opened in a popup from
// order.html. Generates a code_verifier/code_challenge pair and a CSRF
// state value, stashes them in short-lived httpOnly cookies (this function
// is stateless otherwise), and redirects the browser to Canva's authorize
// screen. Canva then redirects back to canva-oauth-callback.js.

const crypto = require('crypto');

exports.handler = async (event) => {
  const clientId = process.env.CANVA_CLIENT_ID;
  const redirectUri = process.env.CANVA_REDIRECT_URI; // e.g. https://zuvhuntuund.com/.netlify/functions/canva-oauth-callback
  if (!clientId || !redirectUri) {
    return { statusCode: 500, body: 'Canva OAuth is not configured (missing CANVA_CLIENT_ID / CANVA_REDIRECT_URI env vars).' };
  }

  const codeVerifier = crypto.randomBytes(64).toString('base64url');
  const codeChallenge = crypto.createHash('sha256').update(codeVerifier).digest('base64url');
  const state = crypto.randomBytes(32).toString('base64url');

  const scope = 'design:meta:read';
  const authUrl = `https://www.canva.com/api/oauth/authorize` +
    `?code_challenge=${encodeURIComponent(codeChallenge)}` +
    `&code_challenge_method=S256` +
    `&scope=${encodeURIComponent(scope)}` +
    `&response_type=code` +
    `&client_id=${encodeURIComponent(clientId)}` +
    `&state=${encodeURIComponent(state)}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}`;

  const cookieOpts = 'Path=/; Max-Age=600; HttpOnly; Secure; SameSite=Lax';

  return {
    statusCode: 302,
    multiValueHeaders: {
      'Set-Cookie': [
        `canva_pkce_verifier=${codeVerifier}; ${cookieOpts}`,
        `canva_oauth_state=${state}; ${cookieOpts}`
      ]
    },
    headers: { Location: authUrl },
    body: ''
  };
};
