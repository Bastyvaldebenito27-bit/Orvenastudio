/* ============================================================================
   INSIDUS — application
   Content never lives in the components: every string is read from a locale
   bundle. Animation is a registry, not a dependency — with nothing registered
   the page is complete and static.
   ========================================================================= */
(function () {
"use strict";

var W = window;
var INSIDUS = W.INSIDUS = W.INSIDUS || {};

/* -------------------------------------------------------------- config -- */
var CFG = W.INSIDUS_CONFIG || {};
var LANGS = CFG.langs || ["es", "en"];
var LABEL = CFG.label || {};
var HTML_LANG = CFG.htmlLang || {};
var SPECIES = CFG.species || [];
var FACTS = CFG.facts || {};
var PHOTOS = CFG.photos || {};
var BASE = CFG.base || "/";
var PAGE = document.body.getAttribute("data-page") || "home";
var PRODUCT = document.body.getAttribute("data-product") || null;
var STORE = "insidus.lang";
var REDUCE = W.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ------------------------------------------------------------ helpers -- */
function el(tag, cls, text) {
  var n = document.createElement(tag);
  if (cls) n.className = cls;
  if (text != null) n.textContent = text;
  return n;
}
function $(sel, root) { return (root || document).querySelector(sel); }
function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
function setText(sel, text) { var n = $(sel); if (n) n.textContent = text; }
function clear(sel) { var n = $(sel); if (n) n.textContent = ""; return n; }
function fmt(s, vars) {
  return String(s).replace(/\{(\w+)\}/g, function (_, k) {
    return vars[k] != null ? vars[k] : "";
  });
}

/* ------------------------------------------------------- language pick -- */
function pickLang() {
  try {
    var q = new URLSearchParams(location.search).get("lang");
    if (q && LANGS.indexOf(q) > -1) return q;
  } catch (e) {}
  try {
    var s = localStorage.getItem(STORE);
    if (s && LANGS.indexOf(s) > -1) return s;
  } catch (e) {}
  try {
    var nav = (navigator.languages && navigator.languages.length)
      ? navigator.languages : [navigator.language || "es"];
    for (var i = 0; i < nav.length; i++) {
      var t = String(nav[i]).toLowerCase();
      if (t.indexOf("zh") === 0 && LANGS.indexOf("zh") > -1) return "zh";
      var b = t.split("-")[0];
      if (LANGS.indexOf(b) > -1) return b;
    }
  } catch (e) {}
  return LANGS[0];
}

/* ------------------------------------------------------------- locales -- */
/* Bundles may be inlined (single-file build) or fetched from /locales.
   CFG.locales moves that origin — a CDN, say — without moving the links,
   which stay on BASE. Either way the components only ever see a resolved
   dictionary. */
var CACHE = W.INSIDUS_LOCALES || {};
var LOCALES = CFG.locales || (BASE + "locales/");
function loadLocale(lang) {
  if (CACHE[lang]) return Promise.resolve(CACHE[lang]);
  return fetch(LOCALES + lang + ".json", { credentials: "same-origin" })
    .then(function (r) {
      if (!r.ok) throw new Error("locale " + lang + " " + r.status);
      return r.json();
    })
    .then(function (d) { CACHE[lang] = d; return d; });
}

/* ----------------------------------------------------------------- SEO -- */
function applySEO(lang, d) {
  var html = document.documentElement;
  html.setAttribute("lang", HTML_LANG[lang] || lang);

  var title, desc;
  if (PAGE === "product") {
    var sp = speciesBySlug(PRODUCT) || {};
    var vars = { name: sp.name, trade: sp.trade, bino: sp.bino };
    title = fmt(d.meta.productTitle, vars);
    desc = fmt(d.meta.productDesc, vars);
  } else {
    title = d.meta.title;
    desc = d.meta.description;
  }
  document.title = title;
  meta("name", "description", desc);
  meta("property", "og:title", title);
  meta("property", "og:description", desc);
  meta("property", "og:locale", (HTML_LANG[lang] || lang).replace("-", "_"));
  meta("property", "og:type", "website");
  meta("name", "twitter:card", "summary_large_image");

  // hreflang set, regenerated so the alternates always match the current path
  $$("link[data-hreflang]").forEach(function (n) { n.remove(); });
  var head = document.head;
  var path = location.pathname;
  LANGS.forEach(function (l) {
    var link = document.createElement("link");
    link.rel = "alternate";
    link.setAttribute("hreflang", HTML_LANG[l] || l);
    link.href = location.origin + path + "?lang=" + l;
    link.setAttribute("data-hreflang", "");
    head.appendChild(link);
  });
  var x = document.createElement("link");
  x.rel = "alternate"; x.setAttribute("hreflang", "x-default");
  x.href = location.origin + path;
  x.setAttribute("data-hreflang", "");
  head.appendChild(x);
}
function meta(attr, key, val) {
  var n = document.head.querySelector("meta[" + attr + '="' + key + '"]');
  if (!n) { n = document.createElement("meta"); n.setAttribute(attr, key); document.head.appendChild(n); }
  n.setAttribute("content", val);
}

function speciesBySlug(slug) {
  for (var i = 0; i < SPECIES.length; i++) if (SPECIES[i].slug === slug) return SPECIES[i];
  return null;
}

/* ============================ COMPONENTS ================================ */
/* Each takes the resolved dictionary; none holds copy of its own. */

function Navbar(d) {
  var host = clear("#nav-links");
  if (host) {
    navItems(d).forEach(function (it) {
      var li = el("li"), a = el("a", null, it.label);
      a.href = it.href; li.appendChild(a); host.appendChild(li);
    });
  }
  var mob = clear("#menu-list");
  if (mob) {
    var root = PAGE === "product" ? BASE : "";
    navItems(d).concat([{ label: d.nav.contact, href: root + "#contact" }])
      .forEach(function (it, i) {
        var li = el("li"), a = el("a");
        a.href = it.href;
        a.appendChild(el("span", "num", String(i + 1).padStart(2, "0")));
        a.appendChild(el("span", null, it.label));
        li.appendChild(a); mob.appendChild(li);
      });
  }
  setText("#menu-open", d.nav.menu);
  setText("#menu-close", d.nav.close);
  var cta = $("#nav-cta");
  if (cta) {
    cta.textContent = d.nav.contact;
    if (PAGE === "product") cta.href = BASE + "#contact";
  }
}
/* Four destinations, not six. Process folded into quality, and contact left
   the list entirely — it is the button, always on screen. */
function navItems(d) {
  var root = PAGE === "product" ? BASE : "";
  return [
    { label: d.nav.products, href: root + "#products" },
    { label: d.nav.about,    href: root + "#about" },
    { label: d.nav.quality,  href: root + "#quality" },
    { label: d.nav.global,   href: root + "#global" }
  ];
}

function LanguageSwitcher(lang, d) {
  var btn = $("#lang-btn"), menu = clear("#lang-menu");
  if (btn) { btn.textContent = LABEL[lang] || lang; btn.setAttribute("aria-label", d.ui.langLabel); }
  if (!menu) return;
  LANGS.forEach(function (l) {
    var a = el("a");
    a.href = "?lang=" + l;
    a.setAttribute("data-lang", l);
    if (l === lang) a.setAttribute("aria-current", "true");
    a.appendChild(el("span", null, LABEL[l] || l));
    a.appendChild(el("span", "mono", l.toUpperCase()));
    menu.appendChild(a);
  });
}

function Hero(d) {
  setText("#hero-eyebrow", d.intro.coord);
  setText("#hero-scroll", d.intro.scroll);
  var claim = clear("#hero-claim");
  if (claim) {
    claim.appendChild(document.createTextNode(d.hero.claim1));
    claim.appendChild(el("b", null, d.hero.claim2));
  }
  setText("#hero-cta", d.ui.ctaQuote);
  setText("#hero-alt", d.ui.ctaSpecies);
}

/* The statement: one sentence carrying the position, then the short reading
   of the ocean it comes from. */
function Statement(d) {
  setText("#statement-kicker", d.ocean.kicker);
  setText("#statement-line", d.statement.line);
  setText("#statement-title", d.ocean.title);
  setText("#statement-body", d.ocean.body);
}

/* The cinematic frame. Copy only — whether it holds a film or is still
   waiting for one is decided in MEDIA, at build time. */
function Film(d) {
  setText("#film-kicker", d.film.kicker);
  setText("#film-line", d.film.line);
  setText("#film-note", d.film.note);
  setText("#film-slot", d.ui.filmSlot);
}

/* Three figures under ABOUT. Two are known — the species on the list and the
   address the company trades from. The third stays an editable field. */
function Figures(d) {
  var host = clear("#about-figures");
  if (!host) return;
  var vals = [String(SPECIES.length).padStart(2, "0"), FACTS.base, null];
  (d.figures || []).forEach(function (k, i) {
    var f = el("div", "figure js-rise");
    f.setAttribute("data-delay", String(Math.min(i, 3)));
    var v = el("span", "figure__v");
    if (vals[i]) v.textContent = vals[i];
    else v.appendChild(el("span", "editable", d.ui.editable));
    f.appendChild(v);
    f.appendChild(el("span", "figure__k tag", k));
    host.appendChild(f);
  });
}

function AboutSection(d) {
  setText("#about-kicker", d.about.kicker);
  setText("#about-title", d.about.title);
  setText("#about-lead", d.about.lead);
  var body = clear("#about-body");
  if (body) ["p1", "p2", "p3"].forEach(function (k) {
    body.appendChild(el("p", "body", d.about[k]));
  });
}

/* One species carries the editorial frame; the rest are an index that links
   to the detail pages, where the full treatment already lives. Eight full
   viewports of photography was 42% of the page and none of it exists yet. */
function ProductShowcase(d) {
  setText("#products-kicker", d.products.kicker);
  setText("#products-title", d.products.title);
  setText("#products-lead", d.products.lead);

  var feat = clear("#products-featured");
  if (feat && SPECIES.length) feat.appendChild(productCard(d, SPECIES[0], true));

  var list = clear("#products-index-list");
  if (!list) return;
  setText("#products-index-kicker", d.ui.indexKicker);
  SPECIES.slice(1).forEach(function (s) {
    var li = el("li", "index__row js-rise");
    var a = el("a", "index__link");
    a.href = BASE + "products/" + s.slug + "/" + langQuery();
    a.setAttribute("data-slug", s.slug);
    a.appendChild(el("span", "num index__n", s.n));
    var t = el("span", "index__t");
    t.appendChild(el("span", "index__name", s.name));
    t.appendChild(el("span", "index__trade", s.trade));
    a.appendChild(t);
    a.appendChild(el("span", "index__bino", s.bino));
    a.appendChild(el("i", "index__go", "\u2192"));
    li.appendChild(a);
    list.appendChild(li);
  });
}

/* The frame keeps its size whether or not the photograph exists, so dropping
   artwork into PRODUCT_MEDIA never moves the layout. */
function productCard(d, s, featured) {
  var art = el("article", "product js-rise");
  var media = el("div", "product__media");
  var shot = (CFG.productMedia || {})[s.slug];
  if (shot) {
    var img = el("img");
    img.src = shot;
    img.alt = s.name + " \u2014 " + s.trade;
    img.loading = "lazy"; img.decoding = "async";
    media.appendChild(img);
  } else {
    media.appendChild(photoSlot(d, s.slug + ".jpg", "1600 \u00d7 2000",
                                (CFG.thumbs || {})[s.slug], d.ui.reference));
  }

  var info = el("div");
  var head = el("div", "product__num");
  head.appendChild(el("span", "num", s.n));
  head.appendChild(el("span", "tag", featured ? d.ui.featured : d.products.index));
  info.appendChild(head);
  info.appendChild(el("h3", "product__name", s.name));
  info.appendChild(el("p", "product__trade", s.trade));
  info.appendChild(el("p", "product__bino", s.bino));

  var a = el("a", "product__cta");
  a.href = BASE + "products/" + s.slug + "/" + langQuery();
  a.appendChild(el("span", null, d.products.view));
  a.appendChild(el("i", null, "\u2192"));
  info.appendChild(a);

  art.appendChild(media); art.appendChild(info);
  return art;
}

/* A placeholder that says, on the page, exactly which file the frame wants —
   with the low-resolution working copy shown small and labelled, so nobody
   mistakes it for the artwork. */
function photoSlot(d, filename, dims, refSrc, refLabel) {
  var ph = el("div", "ph");
  ph.appendChild(el("span", "ph__k", d.ui.photoSlot));
  ph.appendChild(el("span", "ph__f", filename));
  ph.appendChild(el("span", "ph__d", dims));
  if (refSrc) {
    var t = el("img", "ph__ref");
    t.src = refSrc; t.alt = ""; t.loading = "lazy"; t.decoding = "async";
    ph.appendChild(t);
    ph.appendChild(el("span", "ph__d", refLabel));
  }
  return ph;
}

function ProcessTimeline(d) {
  setText("#process-kicker", d.process.kicker);
  setText("#process-title", d.process.title);
  setText("#process-lead", d.process.lead);
  var host = clear("#process-list");
  if (!host) return;
  host.classList.add("chain--grid");
  d.process.stages.forEach(function (st, i) {
    var row = el("div", "link js-rise");
    row.appendChild(el("span", "num", String(i + 1).padStart(2, "0")));
    row.appendChild(el("h3", "link__t", st[0]));
    row.appendChild(el("p", "link__b", st[1]));
    host.appendChild(row);
  });
}

/* Quality as four numbered movements rather than a list of features. */
function Quality(d) {
  setText("#quality-kicker", d.quality.kicker);
  setText("#quality-title", d.quality.title);
  setText("#quality-lead", d.quality.lead);
  var host = clear("#quality-list");
  if (!host) return;
  d.quality.items.forEach(function (it, i) {
    var b = el("div", "qual js-rise");
    b.setAttribute("data-delay", String(i % 2));
    b.appendChild(el("p", "qual__n", String(i + 1).padStart(2, "0")));
    b.appendChild(el("h3", "qual__t", it[0]));
    b.appendChild(el("p", "qual__b", it[1]));
    host.appendChild(b);
  });
}

/* What INSIDUS offers a buyer over time — the commercial position, stated
   without a single number it cannot stand behind. */
function Partners(d) {
  setText("#partners-kicker", d.partners.kicker);
  setText("#partners-title", d.partners.title);
  setText("#partners-lead", d.partners.lead);
  var host = clear("#partners-list");
  if (!host) return;
  d.partners.items.forEach(function (it, i) {
    var b = el("div", "partner js-rise");
    b.setAttribute("data-delay", String(Math.min(i, 3)));
    b.appendChild(el("h3", "partner__t", it[0]));
    b.appendChild(el("p", "partner__b", it[1]));
    host.appendChild(b);
  });
}

function PairsSection(prefix, block) {
  setText("#" + prefix + "-kicker", block.kicker);
  setText("#" + prefix + "-title", block.title);
  setText("#" + prefix + "-lead", block.lead);
  var host = clear("#" + prefix + "-list");
  if (!host) return;
  host.classList.add("pairs--grid");
  block.items.forEach(function (it) {
    var row = el("div", "pair js-rise");
    row.appendChild(el("h3", "pair__t", it[0]));
    row.appendChild(el("p", "pair__b", it[1]));
    host.appendChild(row);
  });
}

function GlobalReach(d) {
  setText("#reach-kicker", d.reach.kicker);
  setText("#reach-title", d.reach.title);
  setText("#reach-lead", d.reach.lead);
  setText("#reach-note", d.reach.note);
  setText("#reach-maplabel", d.reach.destinations);
  var host = clear("#reach-list");
  if (!host) return;
  var origin = el("li");
  origin.appendChild(el("span", null, d.reach.origin));
  origin.appendChild(el("b", null, FACTS.originLabel || "Chile"));
  host.appendChild(origin);
  d.reach.regions.forEach(function (r) {
    var li = el("li");
    li.appendChild(el("span", null, r));
    li.appendChild(el("b", "editable", d.ui.editable));
    host.appendChild(li);
  });
}

function FinalMoment(d) {
  var line = clear("#final-line");
  if (line) {
    line.appendChild(el("span", "final__lead", d.final.line1 + " "));
    line.appendChild(document.createTextNode(d.final.line2));
  }
  setText("#final-cta", d.final.cta);
  var a = $("#final-cta");
  if (a) a.href = "#contact";
}

function ContactForm(d) {
  setText("#contact-kicker", d.contact.kicker);
  setText("#contact-title", d.contact.title);
  setText("#contact-lead", d.contact.lead);
  ["name", "company", "country", "email", "interest", "message"].forEach(function (k) {
    setText('label[for="f-' + k + '"]', d.contact[k]);
  });
  setText("#f-submit", d.contact.send);
  setText("#direct-title", d.contact.direct);

  var sel = clear("#f-interest");
  if (sel) {
    var any = el("option", null, d.contact.any); any.value = ""; sel.appendChild(any);
    SPECIES.forEach(function (s) {
      var o = el("option", null, s.name + " · " + s.trade); o.value = s.name; sel.appendChild(o);
    });
    if (PAGE === "product" && PRODUCT) {
      var sp = speciesBySlug(PRODUCT);
      if (sp) sel.value = sp.name;
    }
  }

  var rows = clear("#direct-rows");
  if (rows) {
    [[d.contact.addressLabel, FACTS.address, null],
     [d.contact.emailLabel, FACTS.email, "mailto:" + FACTS.email],
     [d.contact.phoneLabel, FACTS.phone, "tel:" + String(FACTS.phone || "").replace(/\s/g, "")]
    ].forEach(function (r) {
      if (!r[1]) return;
      var row = el("div", "direct__row");
      row.appendChild(el("span", "direct__k", r[0]));
      var v = el("span", "direct__v");
      if (r[2]) { var a = el("a", null, r[1]); a.href = r[2]; v.appendChild(a); }
      else v.textContent = r[1];
      row.appendChild(v); rows.appendChild(row);
    });
  }
}

function Footer(d) {
  var tag = clear("#foot-tag");
  if (tag) {
    tag.appendChild(document.createTextNode(d.footer.tagline1 + " "));
    tag.appendChild(el("b", null, d.footer.tagline2));
  }
  var addr = clear("#foot-addr");
  if (addr) {
    addr.appendChild(el("span", null, FACTS.address));
    addr.appendChild(el("br"));
    var m = el("a", null, FACTS.email); m.href = "mailto:" + FACTS.email;
    addr.appendChild(m);
    addr.appendChild(document.createTextNode(" · "));
    var t = el("a", null, FACTS.phone);
    t.href = "tel:" + String(FACTS.phone || "").replace(/\s/g, "");
    addr.appendChild(t);
  }
  setText("#foot-nav-title", d.footer.nav);
  setText("#foot-lang-title", d.footer.langs);
  setText("#foot-base", "© " + new Date().getFullYear() + " " + d.footer.legal + " · " + d.footer.rights);

  var nav = clear("#foot-nav");
  if (nav) navItems(d).forEach(function (it) {
    var li = el("li"), a = el("a", null, it.label); a.href = it.href;
    li.appendChild(a); nav.appendChild(li);
  });
  var langs = clear("#foot-langs");
  if (langs) LANGS.forEach(function (l) {
    var li = el("li"), a = el("a", null, LABEL[l] || l);
    a.href = "?lang=" + l; a.setAttribute("data-lang", l);
    li.appendChild(a); langs.appendChild(li);
  });
}

/* ------------------------------------------------------- product page -- */
function ProductDetail(d) {
  var s = speciesBySlug(PRODUCT);
  if (!s) return;
  setText("#p-num", s.n);
  setText("#p-index", d.products.index);
  setText("#p-name", s.name);
  setText("#p-trade", s.trade);
  setText("#p-bino", s.bino);
  setText("#p-back", d.products.all);
  var back = $("#p-back"); if (back) back.href = BASE + langQuery();

  var sections = [
    ["overview", d.prodfields.overview],
    ["origin", d.prodfields.origin],
    ["formats", d.prodfields.formats],
    ["processing", d.prodfields.processing],
    ["quality", d.prodfields.quality],
    ["markets", d.prodfields.markets],
    ["gallery", d.prodfields.gallery],
    ["inquiry", d.contact.title]
  ];
  sections.forEach(function (p) { setText("#ps-" + p[0], p[1]); });

  var spec = clear("#p-spec");
  if (spec) {
    [[d.prodfields.species, s.bino, true],
     [d.prodfields.trade, s.trade, false],
     [d.prodfields.area, null, false],
     [d.prodfields.season, null, false],
     [d.prodfields.formats, null, false],
     [d.prodfields.sizes, null, false],
     [d.prodfields.packing, null, false],
     [d.prodfields.markets, null, false]
    ].forEach(function (r) {
      var row = el("div", "spec__row");
      row.appendChild(el("span", "spec__k", r[0]));
      var v = el("span", "spec__v");
      if (r[1]) { var i = el("i", null, r[1]); if (r[2]) i.style.fontStyle = "italic"; v.appendChild(i); }
      else v.appendChild(el("span", "editable", d.ui.editable));
      row.appendChild(v); spec.appendChild(row);
    });
  }
  setText("#p-gallery-note", d.prodfields.galleryNote);

  var nx = clear("#p-next");
  if (nx) {
    var idx = SPECIES.indexOf(s);
    var next = SPECIES[(idx + 1) % SPECIES.length];
    var a = el("a", "product__cta");
    a.href = BASE + "products/" + next.slug + "/" + langQuery();
    a.appendChild(el("span", null, d.ui.next + " · " + next.name));
    a.appendChild(el("i", null, "→"));
    nx.appendChild(a);
  }
}

function langQuery() {
  var l = INSIDUS.lang;
  return (l && l !== LANGS[0]) ? "?lang=" + l : "";
}

/* ============================== RENDER ================================== */
function render(lang, d) {
  INSIDUS.lang = lang;
  INSIDUS.dict = d;
  applySEO(lang, d);
  Navbar(d);
  LanguageSwitcher(lang, d);
  Footer(d);
  ContactForm(d);
  if (PAGE === "home") {
    Hero(d);
    Statement(d);
    AboutSection(d);
    Figures(d);
    ProductShowcase(d);
    Film(d);
    Quality(d);
    ProcessTimeline(d);
    PairsSection("trace", d.trace);
    GlobalReach(d);
    Partners(d);
    FinalMoment(d);
  } else if (PAGE === "product") {
    ProductDetail(d);
  }
  markRises();
  INSIDUS.anim._mountAll();
  document.dispatchEvent(new CustomEvent("insidus:rendered", { detail: { lang: lang, dict: d } }));
}

function setLang(lang, push) {
  if (LANGS.indexOf(lang) < 0) return;
  try { localStorage.setItem(STORE, lang); } catch (e) {}
  if (push) {
    try {
      var u = new URL(location.href);
      u.searchParams.set("lang", lang);
      history.replaceState(null, "", u.pathname + u.search + u.hash);
    } catch (e) {}
  }
  loadLocale(lang).then(function (d) { render(lang, d); })
    .catch(function (err) { console.error("[insidus]", err); });
}
INSIDUS.setLang = setLang;

/* ====================== ANIMATION SLOT REGISTRY ========================= */
/* Modules register by name and receive their stage element. Nothing here
   renders content; if no module ever registers, the site is unchanged. */
INSIDUS.anim = (function () {
  var mods = {}, mounted = {};
  return {
    register: function (name, mount) {
      mods[name] = mount;
      this._mount(name);
      return this;
    },
    /* Direct child, not descendant: a slot may sit inside another slot's
       section (the hero holds one for its media layer), and a descendant
       lookup would hand the outer module the inner stage. */
    slot: function (name) { return $('[data-anim-slot="' + name + '"] > .slot'); },
    section: function (name) { return $('[data-anim-slot="' + name + '"]'); },
    _mount: function (name) {
      if (mounted[name] || !mods[name]) return;
      var stage = this.slot(name);
      if (!stage) return;
      mounted[name] = true;
      var host = this.section(name);
      var stageKind = host && host.classList.contains("anim-stage");
      if (stageKind) host.classList.add("is-live");
      try {
        mods[name]({ stage: stage, section: this.section(name),
                     reduce: REDUCE, lang: INSIDUS.lang, dict: INSIDUS.dict });
      } catch (e) { mounted[name] = false; console.error("[insidus.anim]", name, e); }
      /* A stage earns its height by being used. A module may register for a
         slot and enhance the section around it instead of drawing into the
         stage; without this it would leave a 60svh hole in the page. */
      if (stageKind && !stage.children.length) host.classList.remove("is-live");
    },
    _mountAll: function () { for (var k in mods) this._mount(k); },
    names: function () { return $$("[data-anim-slot]").map(function (n) { return n.getAttribute("data-anim-slot"); }); }
  };
})();

/* ============================== CHROME ================================== */
function chrome() {
  // nav turns solid once the opening frame is behind us
  var nav = $("#nav"), opening = $("#hero") || $("#phero");
  var queued = false;
  function paint() {
    queued = false;
    var past = opening ? (opening.getBoundingClientRect().bottom <= 90) : (scrollY > 90);
    if (nav) nav.classList.toggle("is-solid", past);
  }
  addEventListener("scroll", function () {
    if (!queued) { queued = true; requestAnimationFrame(paint); }
  }, { passive: true });
  addEventListener("resize", paint);
  paint();

  // mobile fullscreen menu
  var menu = $("#menu");
  function toggleMenu(open) {
    if (!menu) return;
    menu.classList.toggle("is-open", open);
    document.body.style.overflow = open ? "hidden" : "";
    var t = $("#menu-open"); if (t) t.setAttribute("aria-expanded", open ? "true" : "false");
  }
  on("#menu-open", "click", function () { toggleMenu(true); });
  on("#menu-close", "click", function () { toggleMenu(false); });
  if (menu) menu.addEventListener("click", function (e) {
    if (e.target.closest("a")) toggleMenu(false);
  });

  // language dropdown
  var lang = $("#lang");
  on("#lang-btn", "click", function (e) {
    e.stopPropagation();
    if (lang) lang.classList.toggle("is-open");
  });
  document.addEventListener("click", function () { if (lang) lang.classList.remove("is-open"); });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") { if (lang) lang.classList.remove("is-open"); toggleMenu(false); }
  });
  document.addEventListener("click", function (e) {
    var a = e.target.closest("a[data-lang]");
    if (!a) return;
    e.preventDefault();
    if (lang) lang.classList.remove("is-open");
    setLang(a.getAttribute("data-lang"), true);
  });

  // contact form → prefilled mail today; a CRM/WhatsApp transport can replace
  // this handler without touching the markup or the copy.
  var form = $("#contact-form");
  if (form) form.addEventListener("submit", function (e) {
    e.preventDefault();
    var d = INSIDUS.dict; if (!d) return;
    var g = function (id) { var n = $("#f-" + id); return n ? n.value.trim() : ""; };
    var lines = [
      d.contact.name + ": " + g("name"),
      d.contact.company + ": " + g("company"),
      d.contact.country + ": " + g("country"),
      d.contact.email + ": " + g("email"),
      d.contact.interest + ": " + (g("interest") || d.contact.any),
      "", g("message")
    ].join("\n");
    var subject = d.contact.title + (g("interest") ? " — " + g("interest") : "");
    location.href = "mailto:" + FACTS.email +
      "?subject=" + encodeURIComponent(subject) +
      "&body=" + encodeURIComponent(lines);
  });
}
function on(sel, ev, fn) { var n = $(sel); if (n) n.addEventListener(ev, fn); }

/* reveals: added by script so no-JS leaves nothing at zero opacity */
var riseObs = null;
function markRises() {
  if (REDUCE) return;
  if (!riseObs && "IntersectionObserver" in W) {
    riseObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("is-in"); riseObs.unobserve(e.target); }
      });
    }, { rootMargin: "0px 0px -10% 0px" });
  }
  if (!riseObs) return;
  $$(".js-rise").forEach(function (n) {
    if (!n.hasAttribute("data-observed")) { n.setAttribute("data-observed", ""); riseObs.observe(n); }
  });
}

/* nav current-section marking */
function navSpy() {
  if (!("IntersectionObserver" in W) || PAGE !== "home") return;
  var obs = new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      if (!e.isIntersecting) return;
      var id = "#" + e.target.id;
      $$("#nav-links a").forEach(function (a) {
        a.setAttribute("aria-current", a.getAttribute("href").slice(-id.length) === id ? "true" : "false");
      });
    });
  }, { rootMargin: "-45% 0px -50% 0px" });
  ["about", "products", "quality", "process", "global", "contact"].forEach(function (id) {
    var n = document.getElementById(id); if (n) obs.observe(n);
  });
}

/* ================================ BOOT ================================== */
chrome();
navSpy();
setLang(pickLang(), false);

})();
