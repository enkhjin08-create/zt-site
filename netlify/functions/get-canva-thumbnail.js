// netlify/functions/get-canva-thumbnail.js
//
// Fetches a Canva link (either a full canva.com/design/... URL or a
// canva.link short link) server-side, follows any redirect, and pulls the
// og:image meta tag out of the HTML. Canva sets this tag for link-preview
// purposes (the same thumbnail you'd see if you pasted the link into Slack
// or Twitter), so it works even when the design's iframe embed would show
// a "This design is private" error — og:image is generated for the share
// link regardless of embed/framing restrictions.
//
// Only fetches canva.com / canva.link URLs to avoid becoming an open proxy.

exports.handler = async (event) => {
  const url = event.queryStringParameters?.url;
  if (!url || !/^https:\/\/(www\.)?(canva\.com\/design\/|canva\.link\/)/.test(url)) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid Canva URL' }) };
  }

  try {
    const res = await fetch(url, {
      method: 'GET',
      redirect: 'follow',
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; ZuvkhunTuundBot/1.0; +https://zuvhuntuund.com)' }
    });
    const html = await res.text();

    // og:image tag can appear with property/content attributes in either order
    const match =
      html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i) ||
      html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i);

    const thumbnailUrl = match ? match[1] : null;

    return {
      statusCode: 200,
      body: JSON.stringify({ thumbnailUrl, resolvedUrl: res.url })
    };
  } catch (err) {
    console.error('get-canva-thumbnail failed', err);
    return { statusCode: 200, body: JSON.stringify({ thumbnailUrl: null, resolvedUrl: null }) };
  }
};
