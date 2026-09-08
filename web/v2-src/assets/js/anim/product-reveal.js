/* ============================================================================
   ProductAnimation — animation module
   The gesture of `parallax-image` (@pulkitxm on 21st.dev): a scroll-linked
   vertical shift on the photograph. Rewritten in vanilla — the original is a
   React wrapper over framer-motion, some 50 KB this site does not load — and
   paired with a clip-path mask that opens upward, which is the half that makes
   the photograph arrive rather than simply be there.

   It does not draw into its stage. The eight product frames already exist in
   the page; this enhances them, and the 60svh stage stays shut.

   Three layers per frame, because the two motions must not share a property:
     .pr-frame   the mask, on the existing .product__media
       .pr-scale the settle from 1.06 to 1, transitioned, driven by a class
         .pr-par the parallax, set inline every frame, never transitioned
   Sharing one transform would make the parallax inherit the 1.3s easing and
   drag behind the scroll.

   Self-contained. Delete this <script> and the catalogue is as it was.
   Load AFTER assets/js/insidus.js.
   ========================================================================= */
(function () {
"use strict";

var SHIFT = 26;    /* px the photograph travels across a full pass */
var LEAD  = 14;    /* px the name travels the other way */

var CSS = [
".pr-frame{clip-path:inset(100% 0 0 0);",
"transition:clip-path 1.15s cubic-bezier(.22,.72,.28,1)}",
".pr-frame.pr-open{clip-path:inset(0 0 0 0)}",
".pr-scale{position:absolute;inset:0;transform:scale(1.06);will-change:transform;",
"transition:transform 1.4s cubic-bezier(.22,.72,.28,1)}",
".pr-frame.pr-open .pr-scale{transform:scale(1)}",
".pr-par{position:absolute;inset:0;will-change:transform}",
".pr-shift{will-change:transform}",
"@media (prefers-reduced-motion:reduce){",
".pr-frame{clip-path:none!important;transition:none!important}",
".pr-scale,.pr-par,.pr-shift{transform:none!important;transition:none!important}}"
].join("");

function injectCSS() {
  if (document.getElementById("ins-anim-product")) return;
  var s = document.createElement("style");
  s.id = "ins-anim-product"; s.textContent = CSS;
  document.head.appendChild(s);
}

function mount(ctx) {
  injectCSS();

  var live = [];     /* frames on screen, the only ones worth moving */
  var raf = 0;
  var IO = "IntersectionObserver" in window;

  /* Opening is one-way: a photograph does not un-arrive on the way back up. */
  var openObs = IO && new IntersectionObserver(function (es, obs) {
    es.forEach(function (e) {
      if (!e.isIntersecting) return;
      e.target.classList.add("pr-open");
      obs.unobserve(e.target);
    });
  }, { rootMargin: "0px 0px -12% 0px" });

  var liveObs = IO && new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      var f = e.target;
      if (e.isIntersecting) {
        if (!live.some(function (r) { return r.frame === f; })) live.push(f._pr);
      } else {
        live = live.filter(function (r) { return r.frame !== f; });
        f._pr.par.style.transform = "";
        if (f._pr.name) f._pr.name.style.transform = "";
      }
    });
    queue();
  }, { rootMargin: "20% 0px 20% 0px" });

  function prepare() {
    var frames = document.querySelectorAll("#products-list .product__media");
    if (!frames.length) return false;

    Array.prototype.forEach.call(frames, function (frame) {
      if (frame.classList.contains("pr-frame")) return;
      frame.classList.add("pr-frame");

      var scale = document.createElement("div"); scale.className = "pr-scale";
      var par = document.createElement("div"); par.className = "pr-par";
      while (frame.firstChild) par.appendChild(frame.firstChild);
      scale.appendChild(par);
      frame.appendChild(scale);

      var art = frame.closest(".product");
      var name = art ? art.querySelector(".product__name") : null;
      if (name) name.classList.add("pr-shift");
      frame._pr = { frame: frame, par: par, name: name };

      if (ctx.reduce || !IO) { frame.classList.add("pr-open"); return; }
      openObs.observe(frame);
      liveObs.observe(frame);
    });
    return true;
  }

  function paint() {
    raf = 0;
    var vh = window.innerHeight || 1;
    for (var i = 0; i < live.length; i++) {
      var r = live[i];
      var box = r.frame.getBoundingClientRect();
      /* Belt and braces: a mask that never opens is an invisible product, so
         if a frame is plainly inside the viewport and still shut, open it here
         rather than trust the observer to have delivered. */
      if (box.top < vh * 0.88 && box.bottom > 0 && !r.frame.classList.contains("pr-open")) {
        r.frame.classList.add("pr-open");
      }
      /* +1 well below the fold, -1 well above it */
      var t = 1 - 2 * ((box.top + box.height / 2) / vh);
      t = t < -1 ? -1 : t > 1 ? 1 : t;
      r.par.style.transform = "translate3d(0," + (t * SHIFT).toFixed(2) + "px,0)";
      if (r.name) r.name.style.transform = "translate3d(0," + (-t * LEAD).toFixed(2) + "px,0)";
    }
  }
  function queue() { if (!raf) raf = requestAnimationFrame(paint); }

  /* A module can be registered before the first render — the locale arrives by
     fetch — so the catalogue may not exist yet when this runs. The registry
     mounts once and only once, so the listener has to be attached whatever
     prepare() finds now, and it is what actually gets the work done on a cold
     load as well as on every language change. */
  document.addEventListener("insidus:rendered", function () {
    live = [];
    setTimeout(function () { prepare(); queue(); }, 0);
  });
  prepare();

  if (ctx.reduce) return;   /* masks open, nothing moves — as the contract asks */

  addEventListener("scroll", queue, { passive: true });
  addEventListener("resize", queue, { passive: true });
  queue();
}

function boot() {
  if (!window.INSIDUS || !window.INSIDUS.anim) return false;
  window.INSIDUS.anim.register("ProductAnimation", mount);
  return true;
}
if (!boot()) {
  document.addEventListener("DOMContentLoaded", boot);
  setTimeout(boot, 300);
}
})();
