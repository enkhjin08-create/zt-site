/* Шинэ жилийн төрх — NY_END огнооноос хойш өөрөө унтарна. */
(function(){
  var NY_END = new Date("2027-01-20T00:00:00+08:00");
  if(new Date() >= NY_END) return;
  var NY_FIRST_ID = 1794000000000;
  document.body.classList.add("ny");

  window.renderNewYear = function(){
    var list = PRODUCTS.filter(function(p){ return p.id > NY_FIRST_ID && !p.hidden; }).sort(function(a,b){ return a.id-b.id; });
    var sec = document.getElementById("ny-section"), grid = document.getElementById("ny-grid");
    if(!sec || !grid || !list.length) return;
    grid.innerHTML = list.map(productCardHTML).join("");
    var min = Math.min.apply(null, list.map(function(p){ return p.price; }));
    var bar = document.getElementById("ny-bar-price");
    if(bar) bar.textContent = list.length + " багц · " + Math.round(min/1000) + ",000₮-өөс";
  };

  // Дээд зурвас
  var bar = document.createElement("div");
  bar.className = "ny-bar";
  bar.innerHTML = '🎄 Шинэ жилийн Монита багцууд — <span id="ny-bar-price">шинэ</span><a href="#ny-section">Үзэх →</a>';
  document.body.insertBefore(bar, document.body.firstChild);

  // Цас
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if(reduce) return;
  var c = document.createElement("canvas"); c.id = "ny-snow"; c.setAttribute("aria-hidden","true");
  document.body.appendChild(c);
  var ctx = c.getContext("2d"), W, H, flakes = [], dpr = Math.min(window.devicePixelRatio||1, 2);
  function size(){ W = innerWidth; H = innerHeight; c.width = W*dpr; c.height = H*dpr; ctx.setTransform(dpr,0,0,dpr,0,0); }
  function make(init){ return { x:Math.random()*W, y: init ? Math.random()*H : -10, r:1+Math.random()*2.6, v:.4+Math.random()*1, s:Math.random()*Math.PI*2, a:.45+Math.random()*.45 }; }
  size();
  var n = W < 700 ? 38 : 70; for(var i=0;i<n;i++) flakes.push(make(true));
  addEventListener("resize", size);
  var run = true; document.addEventListener("visibilitychange", function(){ run = !document.hidden; if(run) loop(); });
  function loop(){
    if(!run) return;
    ctx.clearRect(0,0,W,H);
    for(var i=0;i<flakes.length;i++){
      var f = flakes[i]; f.y += f.v; f.s += .012; f.x += Math.sin(f.s)*.5;
      if(f.y > H+10){ flakes[i] = make(false); continue; }
      ctx.beginPath(); ctx.fillStyle = "rgba(255,255,255,"+f.a+")"; ctx.shadowColor = "rgba(120,140,180,.5)"; ctx.shadowBlur = 3;
      ctx.arc(f.x,f.y,f.r,0,6.283); ctx.fill();
    }
    requestAnimationFrame(loop);
  }
  loop();
})();
