/* =========================================================================
   ProcessAnimation — the chain as an industrial sequence.

   The brief asked for process told with typography, lines and numbers, and
   explicitly not with icons. The stylesheet already draws each stage's accent
   rule when the cell arrives (that is core `js-rise`, no module needed), so
   this module adds the two instruments the CSS cannot:

     · the numbers count up to their stage as the cell arrives — eight
       counters running in sequence read as a line moving, which is what a
       process is;
     · a hairline runs the width of each grid row behind the cells, drawn
       left to right, so the eight stages read as one continuous chain
       rather than eight independent boxes.

   It leaves its stage empty on purpose: the registry hands the height back,
   so nothing here opens a 60svh hole in the page. Delete the file and the
   chain is still a complete, legible, animated-by-CSS list of stages.
   ========================================================================= */
(function () {
"use strict";

var CSS = [
  /* The rail sits behind the cells and spans the whole grid. It is one
     element per row of the grid, sized from the cells themselves, because
     the column count changes at three breakpoints and hard-coding it would
     put the line in the wrong place at two of them. */
  ".pc-rail{position:absolute;height:1px;background:linear-gradient(90deg,",
  "rgba(169,195,212,.42),rgba(169,195,212,.10));",
  "transform:scaleX(0);transform-origin:left center;pointer-events:none;",
  "transition:transform 1.5s cubic-bezier(.22,.72,.28,1)}",
  ".pc-rail.pc-on{transform:scaleX(1)}",
  ".pc-host{position:relative}",

  /* A counter must not reflow the row every time a digit changes width. */
  ".pc-host .num{font-variant-numeric:tabular-nums}"
].join("");

function injectCSS() {
  if (document.getElementById("pc-css")) return;
  var st = document.createElement("style");
  st.id = "pc-css";
  st.textContent = CSS;
  document.head.appendChild(st);
}

function pad(n) { return n < 10 ? "0" + n : String(n); }

INSIDUS.anim.register("ProcessAnimation", function (ctx) {
  injectCSS();

  var host = document.getElementById("process-list");
  if (!host) return;

  var enter = null, rails = [], cells = [];

  /* One rail per grid row, measured from where the cells actually landed.
     Recomputed on resize because the grid goes 1 → 2 → 4 columns. */
  function layout() {
    rails.forEach(function (r) { r.remove(); });
    rails = [];
    if (ctx.reduce || !cells.length) return;

    var base = host.getBoundingClientRect();
    var rows = {};
    cells.forEach(function (c) {
      var b = c.getBoundingClientRect();
      var top = Math.round(b.top - base.top);
      var key = String(top);
      if (!rows[key]) rows[key] = { top: top, left: b.left - base.left, right: b.right - base.left };
      else {
        rows[key].left = Math.min(rows[key].left, b.left - base.left);
        rows[key].right = Math.max(rows[key].right, b.right - base.left);
      }
    });

    Object.keys(rows).forEach(function (k) {
      var r = rows[k];
      var el = document.createElement("div");
      el.className = "pc-rail";
      el.setAttribute("aria-hidden", "true");
      el.style.top = r.top + "px";
      el.style.left = r.left + "px";
      el.style.width = (r.right - r.left) + "px";
      host.appendChild(el);
      rails.push(el);
    });
  }

  function railsOn() { rails.forEach(function (r, i) {
    setTimeout(function () { r.classList.add("pc-on"); }, i * 220);
  }); }

  /* Count to the stage number. Short enough that eight of them staggered
     still finish inside the time it takes to read the first two. */
  function count(node, target) {
    var t0 = 0, DUR = 520;
    function step(ts) {
      if (!t0) t0 = ts;
      var p = Math.min((ts - t0) / DUR, 1);
      // ease-out so the last digits settle rather than snap
      var v = Math.round(target * (1 - Math.pow(1 - p, 3)));
      node.textContent = pad(v);
      if (p < 1) requestAnimationFrame(step);
      else node.textContent = pad(target);
    }
    requestAnimationFrame(step);
  }

  function prepare() {
    host.classList.add("pc-host");
    cells = Array.prototype.slice.call(host.querySelectorAll(".link"));
    if (!cells.length) return;

    cells.forEach(function (cell, i) {
      var num = cell.querySelector(".num");
      if (!num) return;
      var target = i + 1;
      num.setAttribute("data-target", String(target));

      /* Reduced motion, or no observer: the final frame, rendered. Never a
         counter left at 00 because the animation did not get to run. */
      if (ctx.reduce || !enter) { num.textContent = pad(target); return; }

      num.textContent = "00";
      enter.observe(cell);
    });

    layout();
    if (ctx.reduce) rails.forEach(function (r) { r.classList.add("pc-on"); });
  }

  if (!ctx.reduce && "IntersectionObserver" in window) {
    enter = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        var num = e.target.querySelector(".num");
        var t = num && +num.getAttribute("data-target");
        if (num && t) setTimeout(function () { count(num, t); }, 90);
        enter.unobserve(e.target);
      });
    }, { rootMargin: "0px 0px -10% 0px", threshold: 0.2 });

    var railSeen = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        railsOn();
        railSeen.unobserve(e.target);
      });
    }, { threshold: 0.08 });
    railSeen.observe(host);
  }

  var t;
  window.addEventListener("resize", function () {
    clearTimeout(t);
    t = setTimeout(function () {
      var wasOn = rails.length && rails[0].classList.contains("pc-on");
      layout();
      if (wasOn) rails.forEach(function (r) { r.classList.add("pc-on"); });
    }, 180);
  });

  /* The stages are rendered by the app after the locale resolves; on a cold
     load this runs before a single one exists, and the registry mounts each
     name exactly once. The listener goes on first, unconditionally. */
  document.addEventListener("insidus:rendered", prepare);
  prepare();
});
})();
