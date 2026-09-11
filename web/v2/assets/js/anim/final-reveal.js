/* ============================================================================
   FinalAnimation — animation module
   The gesture of `vertical-cut-reveal` (@danielpetho on 21st.dev): each word
   revealed by a vertical clip wipe, sliding up from behind its own baseline.
   Rewritten in vanilla; the original is React over framer-motion.

   A clean cut, not a blur fade — which is the register of the rest of the
   site, where every edge is a hairline.

   It owns no copy. The closing line comes from the locale bundle like
   everything else; this only re-cuts whatever is already on the page, and
   re-cuts it again when the language changes.

   Self-contained. Delete this <script> and the closing reads as before.
   Load AFTER assets/js/insidus.js.
   ========================================================================= */
(function () {
"use strict";

var STEP = 90;     /* ms between words */
var DUR  = 900;    /* ms per word */

var CSS = [
"@keyframes ins-cut{from{transform:translateY(105%)}to{transform:translateY(0)}}",
/* The clip lives on the outer span so the inner one can travel behind it. */
".fr-w{display:inline-block;overflow:hidden;vertical-align:bottom;",
"padding-bottom:.06em;margin-bottom:-.06em}",
".fr-i{display:inline-block;transform:translateY(105%)}",
".fr-i.fr-go{animation:ins-cut " + DUR + "ms cubic-bezier(.22,.72,.28,1) forwards}",
".fr-cta{opacity:0;transition:opacity .9s ease}",
".fr-cta.fr-go{opacity:1}",
"@media (prefers-reduced-motion:reduce){",
".fr-i{transform:none!important;animation:none!important}",
".fr-cta{opacity:1!important}}"
].join("");

function injectCSS() {
  if (document.getElementById("ins-anim-final")) return;
  var s = document.createElement("style");
  s.id = "ins-anim-final"; s.textContent = CSS;
  document.head.appendChild(s);
}

/* Wrap each word in its own clip box, walking text nodes so the <span> that
   carries the first half of the line keeps its colour. */
function cut(root) {
  if (!root) return [];
  var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
  var texts = [], n;
  while ((n = walker.nextNode())) if (n.nodeValue.trim()) texts.push(n);

  texts.forEach(function (t) {
    var frag = document.createDocumentFragment();
    t.nodeValue.split(/(\s+)/).forEach(function (piece) {
      if (!piece) return;
      if (/^\s+$/.test(piece)) { frag.appendChild(document.createTextNode(piece)); return; }
      var box = document.createElement("span");
      box.className = "fr-w";
      var inner = document.createElement("span");
      inner.className = "fr-i";
      inner.textContent = piece;
      box.appendChild(inner);
      frag.appendChild(box);
    });
    t.parentNode.replaceChild(frag, t);
  });
  return Array.prototype.slice.call(root.querySelectorAll(".fr-i"));
}

function mount(ctx) {
  injectCSS();
  var section = ctx.section;
  var played = false;
  var obs = null;

  function run() {
    var line = section.querySelector("#final-line");
    var cta = section.querySelector("#final-cta");
    if (!line || !line.textContent.trim()) return;

    var words = cut(line);
    if (cta) cta.classList.add("fr-cta");

    if (ctx.reduce) {
      words.forEach(function (w) { w.classList.add("fr-go"); });
      if (cta) cta.classList.add("fr-go");
      return;
    }

    function play() {
      words.forEach(function (w, i) {
        w.classList.remove("fr-go");
        setTimeout(function () { w.classList.add("fr-go"); }, i * STEP);
      });
      if (cta) setTimeout(function () { cta.classList.add("fr-go"); },
                          words.length * STEP + 320);
    }

    /* The closing line is the last thing on the page: it should land when the
       reader gets there, not while it is still three screens below. */
    if (played) { play(); return; }
    if (!("IntersectionObserver" in window)) { played = true; play(); return; }
    if (obs) obs.disconnect();
    obs = new IntersectionObserver(function (es, o) {
      if (!es[0].isIntersecting) return;
      played = true; play(); o.disconnect(); obs = null;
    }, { rootMargin: "0px 0px -18% 0px" });
    obs.observe(section);
  }

  run();
  /* Changing language rewrites the line; cut it again and replay. */
  document.addEventListener("insidus:rendered", function () {
    setTimeout(run, 0);
  });
}

function boot() {
  if (!window.INSIDUS || !window.INSIDUS.anim) return false;
  window.INSIDUS.anim.register("FinalAnimation", mount);
  return true;
}
if (!boot()) {
  document.addEventListener("DOMContentLoaded", boot);
  setTimeout(boot, 300);
}
})();
