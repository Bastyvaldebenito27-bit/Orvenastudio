/* =========================================================================
   PageTransition — the index row becomes the product hero.

   Clicking a species used to be a hard cut: the index disappears, the ficha
   appears, and the buyer has to find their place again. The species name and
   its number are the one thing the two pages genuinely share, so they travel
   between them and the rest of the page crosses over behind.

   This is the only module that is not a slot: it has nothing to draw, it
   enhances a navigation. It carries no markup, no styles of its own and no
   state — the stylesheet holds the timings, and all this file does is say
   which two elements are the same subject, a moment before the browser
   navigates.

   Nothing here is required. A browser without view transitions navigates as
   it always did; delete the file and so does every browser.
   ========================================================================= */
(function () {
"use strict";

var W = window, D = document;

/* Cross-document transitions are driven by the stylesheet's @view-transition,
   not from here. Without support for the naming property there is nothing
   this file can usefully say, so it stands down rather than tagging elements
   no engine will read. */
if (!W.CSS || !CSS.supports || !CSS.supports("view-transition-name", "x")) return;
if (W.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

var TITLE = "sp-title", NUM = "sp-num";

/* A view-transition-name has to be unique in the document. The index holds
   seven rows and the featured card an eighth: tagging them all would leave
   seven subjects animating alone. So the tag is applied to one row — the one
   actually clicked — and cleared again on the way back. */
function untag() {
  var tagged = D.querySelectorAll("[data-vt]");
  for (var i = 0; i < tagged.length; i++) {
    tagged[i].style.viewTransitionName = "";
    tagged[i].removeAttribute("data-vt");
  }
}

function tag(node, name) {
  if (!node) return;
  node.style.viewTransitionName = name;
  node.setAttribute("data-vt", name);
}

/* Both shapes that link to a ficha: the index row and the featured card.
   The link is the anchor in either case, but the name and number sit beside
   it in the card and inside it in the row, so the search starts from
   whichever container holds them. */
function subject(link) {
  return link.closest(".index__row") || link.closest(".product") || link;
}

D.addEventListener("click", function (e) {
  var link = e.target.closest && e.target.closest("a[data-slug]");
  if (!link) return;
  /* Let the browser keep its own behaviour for anything that is not a plain
     left-click: a new tab has no transition to run. */
  if (e.defaultPrevented || e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
  var host = subject(link);
  untag();
  tag(host.querySelector(".index__name, .product__name"), TITLE);
  tag(host.querySelector(".num"), NUM);
}, true);

/* The ficha's side of the pair. #p-name and #p-num survive re-rendering —
   only their text is replaced — but a language switch re-runs render, so the
   tag is re-applied on every render rather than once at load. */
function tagProduct() {
  if (D.body.getAttribute("data-page") !== "product") return;
  untag();
  tag(D.getElementById("p-name"), TITLE);
  tag(D.getElementById("p-num"), NUM);
}
tagProduct();
D.addEventListener("insidus:rendered", tagProduct);

/* Coming back from a ficha, the home page may be served from the back-forward
   cache with the tag still on the row that was clicked. Left there it would
   claim the name on the next navigation, whichever row is clicked then. */
W.addEventListener("pageshow", function (e) {
  if (!e.persisted) return;
  if (D.body.getAttribute("data-page") === "product") tagProduct(); else untag();
});

})();
