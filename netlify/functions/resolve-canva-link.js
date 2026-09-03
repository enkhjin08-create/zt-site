// netlify/functions/resolve-canva-link.js
//
// canva.link short links can't be embedded directly (we don't know the real
// design ID client-side). This function follows the redirect server-side and
// returns the final canva.com/design/... URL, so order.html can build a real
// embed thumbnail even for short links.
//
// Only fetches canva.link URLs (checked below) to avoid this becoming an
// open URL-fetching proxy.

exports.handler = async (event) => {
  const url = event.queryStringParameters?.url;
  if (!url || !/^https:\/\/(www\.)?canva\.link\//.test(url)) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid canva.link URL' }) };
  }

  try {
    const res = await fetch(url, { method: 'GET', redirect: 'follow' });
    const finalUrl = res.url;

    if (!/^https:\/\/(www\.)?canva\.com\/design\//.test(finalUrl)) {
      return { statusCode: 200, body: JSON.stringify({ resolvedUrl: null }) };
    }

    return { statusCode: 200, body: JSON.stringify({ resolvedUrl: finalUrl }) };
  } catch (err) {
    console.error('resolve-canva-link failed', err);
    return { statusCode: 200, body: JSON.stringify({ resolvedUrl: null }) };
  }
};
