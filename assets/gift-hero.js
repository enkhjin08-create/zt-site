// Нүүр хуудасны hero: бэлэг бэлдэх animation (автоматаар давтагдана).
// Дүрсүүд (#hero-icon-1..4) болон өнгө (--hero-ribbon) нь кампанит ажлын тематикаар солигддог хэвээр.
(function(){
  var svg = document.getElementById("hero-svg");
  if(!svg) return;
  var $ = function(id){ return document.getElementById(id); };
  var clamp = function(v){ return v < 0 ? 0 : v > 1 ? 1 : v; };
  var lerp = function(a,b,t){ return a + (b - a) * t; };
  var easeOut = function(t){ return 1 - Math.pow(1 - t, 3); };
  var easeBack = function(t){ var c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); };
  var seg = function(p, a, b){ return clamp((p - a) / (b - a)); };

  var items = [
    { el: $("gh-i1"), x: 128, y: 262, rot: -8, delay: 0.00 },
    { el: $("gh-i2"), x: 176, y: 250, rot: 5,  delay: 0.06 },
    { el: $("gh-i3"), x: 224, y: 262, rot: -4, delay: 0.12 },
    { el: $("gh-i4"), x: 272, y: 250, rot: 8,  delay: 0.18 }
  ];
  var lid = $("gh-lid"), vband = $("gh-vband"), hband = $("gh-hband"), bow = $("gh-bow"), boxg = $("gh-box"), confG = $("gh-confetti");
  var NS = "http://www.w3.org/2000/svg";

  var conf = [], colors = ["var(--hero-ribbon)", "#0F4B42", "#EFB8C3", "var(--hero-ribbon-dark)"];
  for(var i = 0; i < 16; i++){
    var a = (i / 16) * Math.PI * 2 + (i % 2) * 0.2;
    var el = document.createElementNS(NS, i % 3 === 0 ? "path" : "circle");
    if(i % 3 === 0) el.setAttribute("d", "M0 4 C-7 -2 -3 -8 0 -4 C3 -8 7 -2 0 4Z");
    else el.setAttribute("r", i % 2 ? 3 : 2);
    el.style.fill = colors[i % colors.length];
    el.setAttribute("opacity", "0");
    confG.appendChild(el);
    conf.push({ el: el, a: a, d: 70 + (i * 37 % 70), s: 0.9 + (i % 4) * 0.25 });
  }

  function render(p){
    items.forEach(function(it){
      var t = seg(p, it.delay, it.delay + 0.2);
      var drop = lerp(-300, 0, easeOut(t));
      var sink = lerp(0, 84, easeOut(seg(p, 0.36, 0.52)));
      var rot = lerp(it.rot * 3, it.rot, easeOut(t));
      it.el.setAttribute("transform", "translate(" + it.x + "," + (it.y + drop + sink) + ") rotate(" + rot + ")");
      it.el.setAttribute("opacity", t > 0.02 ? 1 : 0);
    });
    var tl = seg(p, 0.32, 0.56);
    lid.setAttribute("transform", "translate(" + lerp(66, 0, easeOut(tl)) + "," + lerp(-100, 0, easeBack(tl)) + ") rotate(" + lerp(15, 0, easeOut(tl)) + " 200 212)");
    vband.setAttribute("transform", "translate(0,190) scale(1," + easeOut(seg(p, 0.54, 0.68)) + ") translate(0,-190)");
    hband.setAttribute("transform", "translate(200,0) scale(" + easeOut(seg(p, 0.60, 0.72)) + ",1) translate(-200,0)");
    var tb = easeBack(seg(p, 0.68, 0.80));
    var wob = p > 0.82 ? Math.sin((p - 0.82) * 40) * 3 * (1 - seg(p, 0.82, 1)) : 0;
    bow.setAttribute("transform", "translate(200,190) rotate(" + wob + ") scale(" + Math.max(tb, 0) + ") translate(-200,-190)");
    var tc = seg(p, 0.80, 1);
    var hop = tc > 0 ? -Math.abs(Math.sin(tc * Math.PI * 2.2)) * 14 * (1 - tc * 0.6) : 0;
    boxg.setAttribute("transform", "translate(0," + hop + ")");
    conf.forEach(function(c){
      var d = easeOut(tc) * c.d;
      c.el.setAttribute("transform", "translate(" + (200 + Math.cos(c.a) * d) + "," + (190 + Math.sin(c.a) * d * 0.85 - tc * 24) + ") scale(" + c.s + ") rotate(" + (tc * 220 * (c.a > 3 ? 1 : -1)) + ")");
      c.el.setAttribute("opacity", tc > 0.02 ? (1 - Math.pow(tc, 2.2)) : 0);
    });
  }

  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if(reduce){ render(1); return; }

  // Давталт: 0→1 (6.2с), барьж харуулна (2.4с), зөөлөн бүдгэрч дахин эхэлнэ
  var BUILD = 6200, HOLD = 2400, FADE = 400, CYCLE = BUILD + HOLD + FADE * 2;
  var start = null, running = false, visible = true, raf = 0;
  function frame(now){
    raf = 0;
    if(!running) return;
    if(start === null) start = now;
    var t = (now - start) % CYCLE;
    var p = t < BUILD ? t / BUILD : 1;
    var o = 1;
    if(t < FADE) o = t / FADE;
    else if(t > BUILD + HOLD + FADE) o = 1 - (t - (BUILD + HOLD + FADE)) / FADE;
    // эхний FADE-д p=0 хэвээр байлгахгүйн тулд бага зэрэг шилжүүлнэ
    svg.style.opacity = o.toFixed(3);
    render(p);
    raf = requestAnimationFrame(frame);
  }
  function setRun(){
    var should = visible && !document.hidden;
    if(should && !running){ running = true; start = null; raf = requestAnimationFrame(frame); }
    else if(!should){ running = false; if(raf){ cancelAnimationFrame(raf); raf = 0; } }
  }
  if("IntersectionObserver" in window){
    new IntersectionObserver(function(es){ visible = es[0].isIntersecting; setRun(); }, { threshold: 0.1 }).observe(svg);
  }
  document.addEventListener("visibilitychange", setRun);
  render(0);
  setRun();
})();
