/* ---- Client-side auth helpers ---- */

const AUTH_KEY = "zt_session";

function getSession(){
  try{ return JSON.parse(localStorage.getItem(AUTH_KEY) || "null"); }
  catch(e){ return null; }
}

function saveSession(data){
  localStorage.setItem(AUTH_KEY, JSON.stringify(data));
}

function clearSession(){
  localStorage.removeItem(AUTH_KEY);
}

function isLoggedIn(){
  const s = getSession();
  return s && s.session && s.email;
}

async function callAuthApi(body){
  const res = await fetch("/api/auth", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  const data = await res.json();
  if(!res.ok) throw Object.assign(new Error(data.error || "Auth error"), { status: res.status });
  return data;
}

async function sendMagicLink(email){
  return callAuthApi({ action: "sendMagicLink", email });
}

async function verifyToken(email, token){
  const data = await callAuthApi({ action: "verifyToken", email, token });
  if(data.ok) saveSession({ email, session: data.session, user: data.user });
  return data;
}

async function getProfile(){
  const s = getSession();
  if(!s) throw new Error("Not logged in");
  return callAuthApi({ action: "getProfile", email: s.email, session: s.session });
}

async function updateProfile(fields){
  const s = getSession();
  if(!s) throw new Error("Not logged in");
  return callAuthApi({ action: "updateProfile", email: s.email, session: s.session, ...fields });
}

async function toggleWishlist(productId){
  const s = getSession();
  if(!s) return null;
  const profile = await getProfile();
  const wishlist = profile.user.wishlist || [];
  const action = wishlist.includes(Number(productId)) ? "removeWishlist" : "addWishlist";
  const data = await callAuthApi({ action, email: s.email, session: s.session, productId });
  if(data.ok){
    const sess = getSession();
    if(sess){ sess.user = sess.user || {}; sess.user.wishlist = data.wishlist; saveSession(sess); }
  }
  return data;
}

function getWishlist(){
  const s = getSession();
  return (s && s.user && s.user.wishlist) || [];
}
