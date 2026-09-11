/* =========================================================================
   SpeciesIndex — the gesture that replaced seven viewports.

   The short edition collapses seven full-bleed product frames into an index.
   That buys back 7 screens, but a bare list is a step down in feel, so the
   index earns its cinema the way the rest of the page does: typography,
   a rule and a number. No icons, no cards.

   Two movements:
     · entry   — rows arrive in sequence as the list crosses into view, each
                 name lifting from under its own baseline while a hairline
                 draws across the row.
     · pointer — the row under the cursor opens: the number swells, the name
                 takes the accent, and a wash travels left to right.

   On a species that HAS a photograph in PRODUCT_MEDIA the pointer also lifts
   a preview frame. On one that does not, it stays typographic — a blown-up
   200px working thumb is not a preview, it is a bad photograph, and this
   site does not show art it does not have.

   Optional, like every module here: delete the file and the index is a
   perfectly good list of links.
   ========================================================================= */
(function () {
"use strict";

var CSS = [
  ".si-row .index__link{position:relative;overflow:hidden}",

  /* the wash: a band of the accent travelling under the row's content */
  ".si-row .index__link::before{content:'';position:absolute;left:0;top:0;",
  "bottom:0;width:100%;background:linear-gradient(90deg,",
  "rgba(169,195,212,.10),rgba(169,195,212,.02) 60%,transparent);",
  "transform:scaleX(0);transform-origin:left center;",
  "transition:transform .7s cubic-bezier(.22,.72,.28,1);pointer-events:none}",
  ".si-row.si-hot .index__link::before{transform:scaleX(1)}",

  /* entry: the name lifts from under its own line */
  ".si-w{display:inline-block;overflow:hidden;vertical-align:bottom}",
  ".si-i{display:inline-block;transform:translateY(105%);",
  "transition:transform .9s cubic-bezier(.22,.72,.28,1)}",
  ".si-row.si-in .si-i{transform:translateY(0)}",

  /* the rest of the row fades in just behind the name */
  ".si-row .index__n,.si-row .index__trade,",
  ".si-row .index__bino,.si-row .index__go{opacity:0;",
  "transition:opacity .8s cubic-bezier(.22,.72,.28,1) .12s}",
  ".si-row.si-in .index__n,.si-row.si-in .index__trade,",
  ".si-row.si-in .index__bino,.si-row.si-in .index__go{opacity:1}",

  /* the number swells under the pointer */
  ".si-row .index__n{transition:opacity .8s cubic-bezier(.22,.72,.28,1) .12s,",
  "transform .6s cubic-bezier(.22,.72,.28,1),color .5s ease}",
  ".si-row.si-hot .index__n{transform:translateX(4px) scale(1.18);",
  "transform-origin:left center}",

  /* the preview, only ever mounted for a species with a real photograph */
  ".si-prev{position:absolute;right:0;width:min(30%,320px);aspect-ratio:4/5;",
  "pointer-events:none;opacity:0;overflow:hidden;background:var(--navy);",
  "transform:translateY(-50%) scale(.96);z-index:4;",
  "transition:opacity .5s cubic-bezier(.22,.72,.28,1),",
  "transform .7s cubic-bezier(.22,.72,.28,1),top .7s cubic-bezier(.22,.72,.28,1)}",
  ".si-prev.si-on{opacity:1;transform:translateY(-50%) scale(1)}",
  ".si-prev img{width:100%;height:100%;object-fit:cover}",

  /* Touch and coarse pointers get the entry only. There is no hover to
     resolve, and a wash that sticks after a tap reads as a bug. */
  "@media (hover:none),(pointer:coarse){",
  ".si-row.si-hot .index__link::before{transform:scaleX(0)}",
  ".si-row.si-hot .index__n{transform:none}",
  ".si-prev{display:none}}"
].join("");

function injectCSS() {
  if (document.getElementById("si-css")) return;
  var st = document.createElement("style");
  st.id = "si-css";
  st.textContent = CSS;
  document.head.appendChild(st);
}

/* Wrap the species name so it can rise from behind its own baseline. */
function cut(node) {
  var text = node.textContent;
  if (!text || node.querySelector(".si-w")) return;
  node.textContent = "";
  var w = document.createElement("span");
  w.className = "si-w";
  var i = document.createElement("span");
  i.className = "si-i";
  i.textContent = text;
  w.appendChild(i);
  node.appendChild(w);
}

INSIDUS.anim.register("SpeciesIndex", function (ctx) {
  injectCSS();

  var host = ctx.section;
  if (!host) return;
  var media = (window.INSIDUS_CONFIG || {}).productMedia || {};
  var enter = null, prev = null, rows = [];

  function makePreview() {
    if (prev || !host) return;
    prev = document.createElement("div");
    prev.className = "si-prev";
    prev.setAttribute("aria-hidden", "true");
    host.appendChild(prev);
  }

  function showPreview(row, src, alt) {
    makePreview();
    if (!prev) return;
    var img = prev.firstChild;
    if (!img || img.getAttribute("src") !== src) {
      prev.textContent = "";
      img = document.createElement("img");
      img.src = src; img.alt = alt || ""; img.decoding = "async";
      prev.appendChild(img);
    }
    var box = row.getBoundingClientRect();
    var top = box.top - host.getBoundingClientRect().top + box.height / 2;
    prev.style.top = top + "px";
    prev.classList.add("si-on");
  }

  function hidePreview() { if (prev) prev.classList.remove("si-on"); }

  function prepare() {
    rows = Array.prototype.slice.call(host.querySelectorAll(".index__row"));
    if (!rows.length) return;

    rows.forEach(function (row, i) {
      row.classList.add("si-row");
      var name = row.querySelector(".index__name");
      if (name) cut(name);

      /* Under reduced motion every row is simply already arrived: the final
         frame, rendered — never the animation skipped and the content left
         hidden behind a transform. */
      if (ctx.reduce) { row.classList.add("si-in"); return; }

      var d = (i * 70) + "ms";
      var inner = row.querySelector(".si-i");
      if (inner) inner.style.transitionDelay = d;
      [".index__n", ".index__trade", ".index__bino", ".index__go"]
        .forEach(function (sel) {
          var n = row.querySelector(sel);
          if (n) n.style.transitionDelay = d;
        });

      if (enter) enter.observe(row);

      var link = row.querySelector(".index__link");
      var slug = link && link.getAttribute("data-slug");
      row.addEventListener("pointerenter", function () {
        row.classList.add("si-hot");
        if (slug && media[slug]) {
          var nm = row.querySelector(".index__name");
          showPreview(row, media[slug], nm ? nm.textContent : "");
        }
      });
      row.addEventListener("pointerleave", function () {
        row.classList.remove("si-hot");
        hidePreview();
      });
    });
  }

  if (!ctx.reduce && "IntersectionObserver" in window) {
    enter = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add("si-in");
        enter.unobserve(e.target);
      });
    }, { rootMargin: "0px 0px -12% 0px", threshold: 0.15 });
  }

  /* The rows are rendered by the app after the locale resolves. On a cold
     load this module runs before a single row exists, and the registry
     mounts each name exactly once — so the listener goes on FIRST, always,
     not inside an `if` that a first-run failure would skip. */
  document.addEventListener("insidus:rendered", prepare);
  prepare();

  /* No observer (or reduced motion): nothing may stay hidden. */
  if (!enter && !ctx.reduce) {
    document.addEventListener("insidus:rendered", function () {
      rows.forEach(function (r) { r.classList.add("si-in"); });
    });
    rows.forEach(function (r) { r.classList.add("si-in"); });
  }
});
})();
