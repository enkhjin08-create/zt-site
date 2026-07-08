/* ============================================================
   Зөвхөн түүнд — Зураг upload хийх Function (GitHub API)
   
   POST /api/upload { filename, content (base64) }
   → GitHub repo-д хадгалаад raw URL буцаана
   
   Netlify env vars:
   - GITHUB_TOKEN  → Fine-grained PAT (repo write permission)
   - GITHUB_REPO   → "username/repo-name" (жишээ: enkhjin08/zt-site)
   - GITHUB_BRANCH → branch нэр (анхдагч: main)
   ============================================================ */

function json(status, body){
  return {
    statusCode: status,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  };
}

function checkPin(pin){
  const real = process.env.ADMIN_PIN;
  return typeof real === "string" && real.length > 0 && pin === real;
}

exports.handler = async (event) => {
  if(event.httpMethod !== "POST") return json(405, { error: "Method not allowed" });

  let body;
  try{ body = JSON.parse(event.body || "{}"); }
  catch(e){ return json(400, { error: "Invalid JSON" }); }

  if(!checkPin(body.pin)) return json(401, { error: "Invalid PIN" });

  const { filename, content } = body;
  if(!filename || !content) return json(400, { error: "filename болон content шаардлагатай" });

  const token = process.env.GITHUB_TOKEN;
  const repo = process.env.GITHUB_REPO;
  const branch = process.env.GITHUB_BRANCH || "main";

  if(!token || !repo) return json(500, { error: "GITHUB_TOKEN, GITHUB_REPO тохируулаагүй байна" });

  // Файлын нэрийг цэвэрлэж, images/ фолдерт хадгална
  const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 100);
  const timestamp = Date.now();
  const path = `images/uploads/${timestamp}_${safeName}`;

  try{
    // Файл байгаа эсэх шалгана (update-д sha хэрэгтэй)
    let sha;
    const checkRes = await fetch(`https://api.github.com/repos/${repo}/contents/${path}`, {
      headers: { "Authorization": `Bearer ${token}`, "Accept": "application/vnd.github+json" }
    });
    if(checkRes.ok){ const data = await checkRes.json(); sha = data.sha; }

    // Upload
    const uploadRes = await fetch(`https://api.github.com/repos/${repo}/contents/${path}`, {
      method: "PUT",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Accept": "application/vnd.github+json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        message: `Upload ${safeName}`,
        content: content,
        branch: branch,
        ...(sha ? { sha } : {})
      })
    });

    if(!uploadRes.ok){
      const err = await uploadRes.text();
      console.error("[GitHub upload error]", uploadRes.status, err);
      return json(500, { error: "GitHub upload failed: " + uploadRes.status });
    }

    const url = `https://raw.githubusercontent.com/${repo}/${branch}/${path}`;
    return json(200, { ok: true, url });
  }catch(e){
    console.error("[Upload exception]", e.message);
    return json(500, { error: "Upload failed" });
  }
};
