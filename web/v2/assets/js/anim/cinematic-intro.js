/* ============================================================================
   CinematicIntro — animation module
   Ported from a React/Tailwind/Framer hero to vanilla, re-cut for INSIDUS:
   the palette is the depth ramp, the grid is the one already behind the page,
   and the drifting motes read as marine snow rather than dust.

   Self-contained on purpose. It injects its own styles, owns no copy, and can
   be deleted by removing this one <script> — the intro stays complete.
   Load it AFTER assets/js/insidus.js.
   ========================================================================= */
(function () {
"use strict";

/* Compressed for the short edition. The old sequence did not finish saying
   what INSIDUS sells until 3.6s — on a page meant to convert, an intro that
   makes the reader wait for the proposition is a cost, not an asset. The
   whole thing now lands inside ~1.1s, and the two actions in the hero are in
   the markup from the first frame regardless: this decorates, it never gates. */
var SEQ = {
  coord:  { at:  60,  step: 22 },
  brand:  { at: 180,  step: 34 },   // per letter
  line:   { at: 420,  step: 30 },   // per word
  detail: { at: 760,  step: 70 },
  cue:    { at: 950,  step: 0 }
};

var CSS = [
"@keyframes ins-word{",
"0%{opacity:0;transform:translateY(28px) scale(.94);filter:blur(10px)}",
"55%{opacity:.85;transform:translateY(7px) scale(.99);filter:blur(2px)}",
"100%{opacity:1;transform:none;filter:blur(0)}}",
"@keyframes ins-draw{from{stroke-dashoffset:1400;opacity:0}",
"60%{opacity:.5}to{stroke-dashoffset:0;opacity:.28}}",
"@keyframes ins-dot{from{opacity:0;transform:scale(0)}to{opacity:.85;transform:none}}",
"@keyframes ins-drift{",
"0%{transform:translate(0,0);opacity:.10}",
"30%{transform:translate(9px,-22px);opacity:.42}",
"60%{transform:translate(-7px,-46px);opacity:.24}",
"100%{transform:translate(4px,-72px);opacity:0}}",
"@keyframes ins-ripple{from{opacity:.55;transform:translate(-50%,-50%) scale(.2)}",
"to{opacity:0;transform:translate(-50%,-50%) scale(1)}}",
/* split units start hidden only because this module created them */
".ins-u{display:inline-block;opacity:0;will-change:transform,opacity,filter}",
".ins-u.ins-go{animation:ins-word .85s cubic-bezier(.22,.7,.28,1) forwards}",
".ins-w{display:inline-block;white-space:pre}",
".ins-stage{position:absolute;inset:0;overflow:hidden}",
".ins-stage svg{position:absolute;inset:0;width:100%;height:100%}",
".ins-stage .ins-l{stroke:var(--accent);stroke-width:.6;opacity:0;",
"stroke-dasharray:1400;stroke-dashoffset:1400}",
".ins-stage .ins-l.ins-go{animation:ins-draw 2.4s ease-out forwards}",
".ins-stage .ins-d{fill:var(--accent);opacity:0;transform-origin:center}",
".ins-stage .ins-d.ins-go{animation:ins-dot .9s ease-out forwards}",
".ins-mote{position:absolute;width:2px;height:2px;border-radius:50%;",
"background:var(--fog);opacity:0}",
".ins-mote.ins-go{animation:ins-drift linear infinite}",
".ins-light{position:absolute;width:520px;height:520px;border-radius:50%;",
"pointer-events:none;opacity:0;transition:opacity .6s ease;",
"background:radial-gradient(circle,rgba(23,56,79,.30) 0%,rgba(23,56,79,0) 68%);",
"filter:blur(28px);will-change:transform}",
".ins-ring{position:fixed;width:220px;height:220px;border-radius:50%;",
"border:1px solid rgba(169,195,212,.45);pointer-events:none;z-index:5;",
"animation:ins-ripple 1.1s cubic-bezier(.2,.7,.3,1) forwards}",
"@media (prefers-reduced-motion:reduce){",
".ins-u{opacity:1!important;animation:none!important;filter:none!important;transform:none!important}",
".ins-stage .ins-l{opacity:.28!important;stroke-dashoffset:0!important;animation:none!important}",
".ins-stage .ins-d{opacity:.85!important;animation:none!important}",
".ins-mote,.ins-light,.ins-ring{display:none!important}}"
].join("");

function injectCSS() {
  if (document.getElementById("ins-anim-intro")) return;
  var s = document.createElement("style");
  s.id = "ins-anim-intro";
  s.textContent = CSS;
  document.head.appendChild(s);
}

/* --------------------------------------------------------------- splitting */
/* Walks text nodes and wraps each word — or each letter — without flattening
   the markup, so the <b> that carries the second line keeps its colour. */
function split(root, mode) {
  if (!root || root.hasAttribute("data-split")) return unitsIn(root);
  root.setAttribute("data-split", mode);
  var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
  var texts = [], n;
  while ((n = walker.nextNode())) if (n.nodeValue.trim()) texts.push(n);

  texts.forEach(function (t) {
    var frag = document.createDocumentFragment();
    if (mode === "letter") {
      Array.prototype.forEach.call(t.nodeValue, function (ch) {
        if (ch === " ") { frag.appendChild(document.createTextNode(" ")); return; }
        var u = document.createElement("span");
        u.className = "ins-u"; u.textContent = ch;
        frag.appendChild(u);
      });
    } else {
      t.nodeValue.split(/(\s+)/).forEach(function (piece) {
        if (!piece) return;
        if (/^\s+$/.test(piece)) { frag.appendChild(document.createTextNode(piece)); return; }
        var w = document.createElement("span");
        w.className = "ins-w";
        var u = document.createElement("span");
        u.className = "ins-u"; u.textContent = piece;
        w.appendChild(u); frag.appendChild(w);
      });
    }
    t.parentNode.replaceChild(frag, t);
  });
  return unitsIn(root);
}
function unitsIn(root) {
  return root ? Array.prototype.slice.call(root.querySelectorAll(".ins-u")) : [];
}
function unsplit(root) {
  if (!root || !root.hasAttribute("data-split")) return;
  root.removeAttribute("data-split");
}

function play(units, at, step) {
  units.forEach(function (u, i) {
    u.classList.remove("ins-go");
    setTimeout(function () { u.classList.add("ins-go"); }, at + i * step);
  });
}

/* ---------------------------------------------------------------- backdrop */
function backdrop(stage, reduce) {
  stage.textContent = "";
  var wrap = document.createElement("div");
  wrap.className = "ins-stage";

  var NS = "http://www.w3.org/2000/svg";
  var svg = document.createElementNS(NS, "svg");
  svg.setAttribute("preserveAspectRatio", "none");
  svg.setAttribute("viewBox", "0 0 100 100");
  [["0","22","100","22"],["0","78","100","78"],["18","0","18","100"],["82","0","82","100"]]
    .forEach(function (c, i) {
      var l = document.createElementNS(NS, "line");
      l.setAttribute("x1", c[0]); l.setAttribute("y1", c[1]);
      l.setAttribute("x2", c[2]); l.setAttribute("y2", c[3]);
      l.setAttribute("vector-effect", "non-scaling-stroke");
      l.setAttribute("class", "ins-l");
      l.style.animationDelay = (0.35 + i * 0.28) + "s";
      svg.appendChild(l);
    });
  [["18","22"],["82","22"],["18","78"],["82","78"]].forEach(function (p, i) {
    var d = document.createElementNS(NS, "circle");
    d.setAttribute("cx", p[0]); d.setAttribute("cy", p[1]); d.setAttribute("r", ".45");
    d.setAttribute("class", "ins-d");
    d.style.animationDelay = (SEQ.detail.at + i * SEQ.detail.step) / 1000 + "s";
    svg.appendChild(d);
  });
  wrap.appendChild(svg);

  if (!reduce) {
    for (var i = 0; i < 14; i++) {
      var m = document.createElement("span");
      m.className = "ins-mote";
      m.style.left = (5 + Math.random() * 90) + "%";
      m.style.top = (35 + Math.random() * 60) + "%";
      m.style.animationDuration = (11 + Math.random() * 14) + "s";
      m.style.animationDelay = (Math.random() * 9) + "s";
      if (Math.random() > 0.75) m.style.background = "var(--accent)";
      wrap.appendChild(m);
    }
  }

  stage.appendChild(wrap);
  requestAnimationFrame(function () {
    wrap.querySelectorAll(".ins-l,.ins-d,.ins-mote").forEach(function (n) {
      n.classList.add("ins-go");
    });
  });
  return wrap;
}

/* ------------------------------------------------- pointer light + ripple */
function pointer(section, wrap) {
  if (!matchMedia("(hover: hover) and (pointer: fine)").matches) return;
  var light = document.createElement("div");
  light.className = "ins-light";
  wrap.appendChild(light);

  var x = 0, y = 0, queued = false;
  function paint() {
    queued = false;
    light.style.transform = "translate3d(" + (x - 260) + "px," + (y - 260) + "px,0)";
  }
  section.addEventListener("pointermove", function (e) {
    var r = section.getBoundingClientRect();
    x = e.clientX - r.left; y = e.clientY - r.top;
    light.style.opacity = "1";
    if (!queued) { queued = true; requestAnimationFrame(paint); }
  }, { passive: true });
  section.addEventListener("pointerleave", function () { light.style.opacity = "0"; });

  // A ripple, scoped to this section — clicks elsewhere on the site are not ours.
  section.addEventListener("click", function (e) {
    if (e.target.closest("a,button,select,input")) return;
    var ring = document.createElement("div");
    ring.className = "ins-ring";
    ring.style.left = e.clientX + "px";
    ring.style.top = e.clientY + "px";
    document.body.appendChild(ring);
    setTimeout(function () { ring.remove(); }, 1200);
  });
}

/* ------------------------------------------------------------------ mount */
function typeIn(section, reduce) {
  var coord = section.querySelector("#hero-eyebrow");
  var brand = section.querySelector(".hero__brand");
  var line  = section.querySelector("#hero-claim");
  var cue   = section.querySelector("#hero-scroll");

  [coord, brand, line, cue].forEach(unsplit);

  var u1 = split(coord, "word");
  var u2 = split(brand, "letter");
  var u3 = split(line, "word");
  var u4 = split(cue, "word");

  if (reduce) {
    [].concat(u1, u2, u3, u4).forEach(function (u) { u.style.opacity = 1; });
    return;
  }
  play(u1, SEQ.coord.at, SEQ.coord.step);
  play(u2, SEQ.brand.at, SEQ.brand.step);
  play(u3, SEQ.line.at, SEQ.line.step);
  play(u4, SEQ.cue.at, SEQ.cue.step);
}

function boot() {
  if (!window.INSIDUS || !window.INSIDUS.anim) return false;
  window.INSIDUS.anim.register("CinematicIntro", function (ctx) {
    injectCSS();
    var wrap = backdrop(ctx.stage, ctx.reduce);
    if (!ctx.reduce) pointer(ctx.section, wrap);

    var ran = false;
    function run() {
      if (!ctx.section.querySelector(".hero__brand")) return;
      typeIn(ctx.section, ctx.reduce);
      ran = true;
    }
    run();
    // The copy is re-rendered on every language change; re-split and replay.
    document.addEventListener("insidus:rendered", function () {
      var t = ran ? 0 : 0;
      setTimeout(function () { run(); }, t);
    });
  });
  return true;
}

if (!boot()) {
  document.addEventListener("DOMContentLoaded", boot);
  setTimeout(boot, 120);
}
})();
