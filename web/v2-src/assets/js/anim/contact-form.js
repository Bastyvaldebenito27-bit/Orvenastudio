/* =========================================================================
   ContactAnimation — the form is where the page is pointing.

   Everything else on this site sells; this section is where a buyer acts, so
   the gestures here are affordances first and decoration second:

     · the underline of the focused field draws from the left instead of
       simply changing colour — you can see which field has you;
     · the direct-contact rows (address, mail, phone) arrive in sequence with
       their rule drawing, the same instrument the chain and the index use;
     · the submit fills by a sweep rather than a swap, so the button reads as
       something that happens rather than something that blinks.

   All three are pure enhancement. Delete the file and the form still
   focuses, still reads, still submits: the stylesheet already colours the
   focused border and the button already inverts on hover.
   ========================================================================= */
(function () {
"use strict";

var CSS = [
  /* The drawn underline is a second, thicker line laid over the existing
     hairline border — the border itself cannot be animated from one end. */
  ".cf-field{position:relative}",
  ".cf-field::after{content:'';position:absolute;left:0;right:0;bottom:0;",
  "height:1px;background:var(--accent);transform:scaleX(0);",
  "transform-origin:left center;pointer-events:none;",
  "transition:transform .5s cubic-bezier(.22,.72,.28,1)}",
  ".cf-field.cf-on::after{transform:scaleX(1)}",

  /* The label lifts a hair and takes the accent while its field is active,
     which is the actual point: you can see where you are. */
  ".cf-field label{transition:color .35s cubic-bezier(.22,.72,.28,1),",
  "transform .35s cubic-bezier(.22,.72,.28,1);transform-origin:left center}",
  ".cf-field.cf-on label{color:var(--accent);transform:translateY(-2px)}",

  /* The direct rows arrive with their rule drawing across. */
  ".cf-row{position:relative}",
  /* A gradient, not flat accent: three full-width lines at full strength
     shouted next to a page whose every other rule is a hairline. This is the
     same fade the process rails use. */
  ".cf-row::after{content:'';position:absolute;left:0;top:-1px;height:1px;",
  "width:100%;background:linear-gradient(90deg,rgba(169,195,212,.42),",
  "rgba(169,195,212,.10));transform:scaleX(0);",
  "transform-origin:left center;pointer-events:none;",
  "transition:transform 1s cubic-bezier(.22,.72,.28,1);",
  "transition-delay:var(--cf-d,0ms)}",
  ".cf-row.cf-in::after{transform:scaleX(1)}",
  ".cf-row .direct__k,.cf-row .direct__v{opacity:0;transform:translateY(6px);",
  "transition:opacity .7s cubic-bezier(.22,.72,.28,1),",
  "transform .7s cubic-bezier(.22,.72,.28,1)}",
  ".cf-row.cf-in .direct__k,.cf-row.cf-in .direct__v{opacity:1;transform:none}",

  /* The submit fills from the left. The base rule keeps the text colour, so
     a browser that ignores the pseudo-element still gets the plain swap. */
  ".cf-submit{position:relative;overflow:hidden;isolation:isolate}",
  ".cf-submit::before{content:'';position:absolute;inset:0;z-index:-1;",
  "background:var(--accent);transform:scaleX(0);transform-origin:left center;",
  "transition:transform .55s cubic-bezier(.22,.72,.28,1)}",
  ".cf-submit:hover::before,.cf-submit:focus-visible::before{transform:scaleX(1)}",
  ".cf-submit:hover,.cf-submit:focus-visible{background:transparent;",
  "color:var(--abyss);border-color:var(--accent)}",

  /* Reduced motion: the affordances stay, the travel goes. Nothing here may
     leave a label or a row invisible. */
  "@media (prefers-reduced-motion:reduce){",
  ".cf-field::after,.cf-row::after,.cf-submit::before{transition:none}",
  ".cf-row .direct__k,.cf-row .direct__v{opacity:1;transform:none;transition:none}",
  ".cf-field.cf-on label{transform:none}}"
].join("");

function injectCSS() {
  if (document.getElementById("cf-css")) return;
  var st = document.createElement("style");
  st.id = "cf-css";
  st.textContent = CSS;
  document.head.appendChild(st);
}

INSIDUS.anim.register("ContactAnimation", function (ctx) {
  injectCSS();

  var host = ctx.section;
  if (!host) return;

  var seen = null;
  if (!ctx.reduce && "IntersectionObserver" in window) {
    seen = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add("cf-in");
        seen.unobserve(e.target);
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.2 });
  }

  function prepare() {
    /* Fields. The listeners are bound once per element — the form is not
       re-rendered on a language change, only its labels are rewritten. */
    Array.prototype.forEach.call(host.querySelectorAll(".field"), function (f) {
      if (f.classList.contains("cf-field")) return;
      f.classList.add("cf-field");
      var input = f.querySelector("input, select, textarea");
      if (!input) return;
      input.addEventListener("focus", function () { f.classList.add("cf-on"); });
      input.addEventListener("blur", function () {
        /* A field the visitor has filled keeps its underline: it reads as
           done rather than as reset. */
        if (!input.value) f.classList.remove("cf-on");
      });
      if (input.value) f.classList.add("cf-on");
    });

    /* Direct rows. These ARE re-rendered on every language change, so they
       are re-observed each time rather than marked once. */
    Array.prototype.forEach.call(host.querySelectorAll(".direct__row"), function (r, i) {
      if (r.classList.contains("cf-row")) return;
      r.classList.add("cf-row");
      if (ctx.reduce || !seen) { r.classList.add("cf-in"); return; }
      var d = (i * 140) + "ms";
      if (r.querySelector(".direct__k")) r.querySelector(".direct__k").style.transitionDelay = d;
      if (r.querySelector(".direct__v")) r.querySelector(".direct__v").style.transitionDelay = d;
      r.style.setProperty("--cf-d", d);
      seen.observe(r);
    });

    var sub = host.querySelector(".submit");
    if (sub) sub.classList.add("cf-submit");
  }

  /* The rows and the select are built by the app after the locale resolves,
     and rebuilt on every language change. The listener goes on first. */
  document.addEventListener("insidus:rendered", prepare);
  prepare();
});
})();
