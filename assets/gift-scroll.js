// Бэлэг бэлдэх scroll animation: гүйлгэх тусам бэлэг хайрцагт орж, таг хаагдаж, ленточ уяагдана.
(function(){
  var root = document.getElementById("gift-scroll");
  if(!root) return;
  var $ = function(id){ return document.getElementById(id); };
  var clamp = function(v){ return v < 0 ? 0 : v > 1 ? 1 : v; };
  var lerp = function(a,b,t){ return a + (b - a) * t; };
  var easeOut = function(t){ return 1 - Math.pow(1 - t, 3); };
  var easeBack = function(t){ var c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); };
  var seg = function(p, a, b){ return clamp((p - a) / (b - a)); };

  var items = [
    { el: $("gs-cup"),    x: 150, y: 252, rot: -10, delay: 0.00 },
    { el: $("gs-flower"), x: 205, y: 264, rot: 4,   delay: 0.07 },
    { el: $("gs-card"),   x: 258, y: 258, rot: 9,   delay: 0.14 }
  ];
  var lid = $("gs-lid"), vband = $("gs-vband"), hband = $("gs-hband"), bow = $("gs-bow"), boxg = $("gs-box");
  var caps = [$("gs-cap1"), $("gs-cap2"), $("gs-cap3")];
  var bar = $("gs-bar"), hint = $("gs-hint");
  var NS = "http://www.w3.org/2000/svg";

  // Confetti (зүрх, оч)
  var confG = $("gs-confetti"), conf = [];
  var colors = ["#FF6698", "#0F4B42", "#EFB8C3", "#FBF4E8"];
  for(var i = 0; i < 18; i++){
    var a = (i / 18) * Math.PI * 2 + (i % 2) * 0.2;
    var el = document.createElementNS(NS, i % 3 === 0 ? "path" : "circle");
    if(i % 3 === 0){ el.setAttribute("d", "M0 4 C-7 -2 -3 -8 0 -4 C3 -8 7 -2 0 4Z"); }
    else { el.setAttribute("r", i % 2 ? 3 : 2); }
    el.setAttribute("fill", colors[i % colors.length]);
    el.setAttribute("opacity", "0");
    confG.appendChild(el);
    conf.push({ el: el, a: a, d: 70 + (i * 37 % 70), s: 0.9 + (i % 4) * 0.25 });
  }

  var last = -1, current = -1;
  function render(p){
    // A: бараанууд хайрцагт унана
    items.forEach(function(it){
      var t = seg(p, it.delay, it.delay + 0.2);
      var drop = lerp(-300, 0, easeOut(t));
      var sink = lerp(0, 84, easeOut(seg(p, 0.36, 0.52)));  // таг хаагдахад бага зэрэг шигдэнэ
      var rot = lerp(it.rot * 3, it.rot, easeOut(t));
      it.el.setAttribute("transform", "translate(" + it.x + "," + (it.y + drop + sink) + ") rotate(" + rot + ")");
      it.el.setAttribute("opacity", t > 0.02 ? 1 : 0);
    });
    // B1: таг ирж хаагдана
    var tl = seg(p, 0.32, 0.56), e = easeBack(tl) ;
    var lx = lerp(75, 0, easeOut(tl)), ly = lerp(-175, 0, e), lr = lerp(22, 0, easeOut(tl));
    lid.setAttribute("transform", "translate(" + lx + "," + ly + ") rotate(" + lr + " 200 212)");
    // B2: ленточ ороогдоно
    var tv = easeOut(seg(p, 0.54, 0.68)), th = easeOut(seg(p, 0.60, 0.72));
    vband.setAttribute("transform", "translate(0,190) scale(1," + tv + ") translate(0,-190)");
    hband.setAttribute("transform", "translate(200,0) scale(" + th + ",1) translate(-200,0)");
    // Бант
    var tb = easeBack(seg(p, 0.68, 0.80));
    var wob = p > 0.82 ? Math.sin((p - 0.82) * 40) * 3 * (1 - seg(p, 0.82, 1)) : 0;
    bow.setAttribute("transform", "translate(200,190) rotate(" + wob + ") scale(" + Math.max(tb, 0) + ") translate(-200,-190)");
    // C: хайрцаг хөнгөхөн үсэрч, confetti
    var tc = seg(p, 0.80, 1);
    var hop = tc > 0 ? -Math.abs(Math.sin(tc * Math.PI * 2.2)) * 14 * (1 - tc * 0.6) : 0;
    boxg.setAttribute("transform", "translate(0," + hop + ")");
    conf.forEach(function(c){
      var d = easeOut(tc) * c.d;
      c.el.setAttribute("transform", "translate(" + (200 + Math.cos(c.a) * d) + "," + (190 + Math.sin(c.a) * d * 0.85 - tc * 24) + ") scale(" + c.s + ") rotate(" + (tc * 220 * (c.a > 3 ? 1 : -1)) + ")");
      c.el.setAttribute("opacity", tc > 0.02 ? (1 - Math.pow(tc, 2.2)) : 0);
    });
    // Текст
    var idx = p < 0.3 ? 0 : p < 0.68 ? 1 : 2;
    if(idx !== current){
      current = idx;
      caps.forEach(function(c, i){ c.classList.toggle("is-on", i === idx); });
    }
    bar.style.width = (p * 100).toFixed(1) + "%";
    hint.style.opacity = p > 0.04 ? 0 : 1;
  }

  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if(reduce){ render(1); return; }

  var ticking = false;
  function update(){
    ticking = false;
    var r = root.getBoundingClientRect();
    var total = r.height - window.innerHeight;
    var p = total > 0 ? clamp(-r.top / total) : 0;
    if(Math.abs(p - last) > 0.0005){ last = p; render(p); }
  }
  function req(){ if(!ticking){ ticking = true; requestAnimationFrame(update); } }
  window.addEventListener("scroll", req, { passive: true });
  window.addEventListener("resize", req);
  render(0); update();
})();
