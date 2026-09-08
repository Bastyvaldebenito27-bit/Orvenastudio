# -*- coding: utf-8 -*-
"""Generate the INSIDUS site.

Two outputs from one source:
  dist/            multi-file site (index, /products/<slug>/, /locales/*.json)
  dist-single.html one self-contained file, for review in an artifact

Components never contain copy; every string comes from content.py.
"""
import base64, io, json, os, shutil, sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
sys.path.insert(0, HERE)
from content import C, LANGS, LABEL, HTML_LANG, SPECIES  # noqa: E402

DIST = os.path.join(ROOT, "dist")
ASSETS = os.path.join(ROOT, "assets")

# animation modules, in load order; each one is optional by contract
ANIM = ["cinematic-intro.js", "global-map.js", "hero-field.js",
        "product-reveal.js", "final-reveal.js"]
# Assets and locales can be served from elsewhere; the pages and their links
# stay where they are. Empty means everything is served from the same origin.
CDN = os.environ.get("INSIDUS_CDN", "").rstrip("/")
IMG = os.path.join(ASSETS, "img")

FACTS = {
    "email": "mbonilla@valrey.cl",
    "phone": "+56 9 7637 9609",
    "address": "Av. Bernardo O'Higgins 2929, San Antonio, Valparaíso, Chile",
    "originLabel": "Chile · South Pacific",
    # read straight off the address above; nothing here is inferred
    "base": "San Antonio, Chile",
}

FONTS = ("https://fonts.googleapis.com/css2?"
         "family=Fraunces:opsz,wght,SOFT,WONK@9..144,300..600,0,0"
         "&family=Schibsted+Grotesk:wght@400;500;600"
         "&display=swap")

# Only species with a usable high-resolution frame get a full-bleed image.
HI = {"bacalao": "bacalao-hi.jpg"}
# ---------------------------------------------------------------------------
# MEDIA — the one place artwork is named.
#
# Every photograph and every film on this site enters through this table. A
# value of None renders a placeholder that states, on the page itself, which
# file the frame is waiting for; drop the file into assets/img (or /video),
# name it here, rebuild, and the layout does not move. Nothing else in the
# codebase refers to an asset by name.
#
# The eight reference thumbnails below are 200px working copies, not artwork:
# they are shown small inside the placeholder, plainly labelled, and must be
# replaced before the site is presented as finished.
# ---------------------------------------------------------------------------
MEDIA = {
    # full-bleed opening frame — a still, or a poster for a looping video
    "hero":  {"image": None, "video": None, "poster": None,
              "want": "hero-2560x1440.jpg", "wantVideo": "hero-loop.mp4"},
    # the cinematic scene between PRODUCTS and QUALITY
    "film":  {"image": None, "video": None, "poster": None,
              "want": "film-poster-2560x1440.jpg", "wantVideo": "film.mp4"},
}
# one editorial frame per species: portrait, it carries most of the viewport
PRODUCT_MEDIA = {s: None for s in
                 ("jibia bacalao pez-espada merluza-austral merluza-gayi "
                  "reineta jaiba locos").split()}

# the photo files carry the older commercial filenames, not the slugs
THUMBS = {"jibia": "calamar.jpg", "bacalao": "bacalao.jpg",
          "pez-espada": "albacora.jpg", "merluza-austral": "merluza-austral.jpg",
          "merluza-gayi": "merluza-gayi.jpg", "reineta": "reineta.jpg",
          "jaiba": "jaiba.jpg", "locos": "locos.jpg"}


# --------------------------------------------------------------- fragments
def head(title, desc, css_href, extra=""):
    return f"""<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>{title}</title>
<meta name="description" content="{desc}">
<meta property="og:site_name" content="INSIDUS">
<meta name="theme-color" content="#04070B">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="{FONTS}">
{css_href}
{extra}
</head>"""


NAV = """
<div class="gridlines" aria-hidden="true"><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span></div>

<header class="nav" id="nav">
  <div class="nav__in">
    <a class="nav__brand" href="{home}">INSIDUS</a>
    <div class="nav__right">
      <nav aria-label="Main"><ul class="nav__links" id="nav-links"></ul></nav>
      <div class="lang" id="lang">
        <button class="lang__btn" id="lang-btn" type="button" aria-haspopup="true" aria-expanded="false"></button>
        <div class="lang__menu" id="lang-menu" role="menu"></div>
      </div>
      <button class="nav__toggle" id="menu-open" type="button" aria-expanded="false" aria-controls="menu"></button>
    </div>
  </div>
</header>

<div class="menu" id="menu">
  <div class="menu__head">
    <span class="nav__brand">INSIDUS</span>
    <button class="nav__toggle" id="menu-close" type="button" style="display:block"></button>
  </div>
  <nav aria-label="Mobile"><ul class="menu__list" id="menu-list"></ul></nav>
</div>
"""

CONTACT = """
<section class="band" id="contact">
  <div class="shell">
    <p class="tag" id="contact-kicker"></p>
    <h2 class="display h-md upper" id="contact-title" style="margin:.6rem 0 1rem"></h2>
    <p class="lead" id="contact-lead" style="margin-bottom:clamp(2rem,5vh,3.5rem)"></p>
    <div class="contact__grid">
      <form class="form" id="contact-form" novalidate>
        <div class="form__row">
          <div class="field"><label for="f-name"></label><input id="f-name" name="name" type="text" autocomplete="name" required></div>
          <div class="field"><label for="f-company"></label><input id="f-company" name="company" type="text" autocomplete="organization"></div>
        </div>
        <div class="form__row">
          <div class="field"><label for="f-country"></label><input id="f-country" name="country" type="text" autocomplete="country-name"></div>
          <div class="field"><label for="f-email"></label><input id="f-email" name="email" type="email" autocomplete="email" required></div>
        </div>
        <div class="field"><label for="f-interest"></label><select id="f-interest" name="interest"></select></div>
        <div class="field"><label for="f-message"></label><textarea id="f-message" name="message" rows="4"></textarea></div>
        <button class="submit" id="f-submit" type="submit"></button>
      </form>
      <div class="direct">
        <h3 class="tag" id="direct-title" style="margin-bottom:.6rem"></h3>
        <div id="direct-rows"></div>
      </div>
    </div>
  </div>
</section>

<footer class="foot">
  <div class="shell">
    <div class="foot__grid">
      <div>
        <p class="foot__brand">INSIDUS</p>
        <p class="foot__tag" id="foot-tag"></p>
        <address class="foot__addr" id="foot-addr"></address>
      </div>
      <div class="foot__col"><h3 id="foot-nav-title"></h3><ul id="foot-nav"></ul></div>
      <div class="foot__col"><h3 id="foot-lang-title"></h3><ul id="foot-langs"></ul></div>
    </div>
    <div class="foot__base"><span id="foot-base"></span><span class="mono">CHILE · SOUTH PACIFIC</span></div>
  </div>
</footer>
"""

# ---------------------------------------------------------------------------
# A media frame. Three layers, always: the asset, a scrim so type stays
# legible over any footage, and the content. With no asset the first layer is
# a placeholder that names the file it is waiting for — the frame keeps its
# size either way, so dropping artwork in never moves the layout.
# ---------------------------------------------------------------------------
def media_layer(key, label_id=None, want_dims=""):
    m = MEDIA[key]
    if m.get("video"):
        poster = f' poster="{{BASE}}assets/img/{m["poster"]}"' if m.get("poster") else ""
        return (f'<video src="{{BASE}}assets/video/{m["video"]}"{poster} autoplay loop muted '
                'playsinline preload="none"></video>')
    if m.get("image"):
        return (f'<img src="{{BASE}}assets/img/{m["image"]}" alt="" '
                'width="2560" height="1440" decoding="async">')
    if not label_id:          # the hero: a plain field, no scaffolding copy
        return '<div class="ph" aria-hidden="true"></div>'
    return ('<div class="ph">'
            f'<span class="ph__k" id="{label_id}"></span>'
            f'<span class="ph__f">{m["wantVideo"]} &nbsp;·&nbsp; {m["want"]}</span>'
            f'<span class="ph__d">{want_dims}</span></div>')


def home_main(base):
    """HOME_MAIN with its two media frames resolved for this build target."""
    return (HOME_MAIN
            .replace("{HERO_MEDIA}", media_layer("hero"))
            .replace("{FILM_MEDIA}", media_layer("film", "film-slot", "1920 \u00d7 1080"))
            .replace("{BASE}", base))


def org_jsonld():
    """Only facts INSIDUS has confirmed. No claims, no invented markets."""
    return ('<script type="application/ld+json">' + json.dumps({
        "@context": "https://schema.org", "@type": "Organization",
        "name": "INSIDUS SpA", "email": FACTS["email"], "telephone": FACTS["phone"],
        "address": {"@type": "PostalAddress",
                    "streetAddress": "Av. Bernardo O'Higgins 2929",
                    "addressLocality": "San Antonio",
                    "addressRegion": "Valparaiso", "addressCountry": "CL"}
    }, ensure_ascii=False, separators=(",", ":")) + "</script>")


HOME_MAIN = """
<main>

<!-- 01 ...................................................... HERO
     Three layers: media, scrim, content. Replace the contents of
     .hero__media with an <img> or a looping <video> and nothing else in
     this file, the stylesheet or the script has to change. -->
<section class="hero" id="hero" data-anim-slot="CinematicIntro">
  <div class="hero__media" data-media="hero" data-anim-slot="HeroField">{HERO_MEDIA}
    <div class="slot" aria-hidden="true"></div>
  </div>
  <div class="hero__scrim" aria-hidden="true"></div>
  <div class="slot" aria-hidden="true"></div>
  <div class="hero__in">
    <div class="shell">
      <p class="hero__eyebrow coord"><i></i><span id="hero-eyebrow"></span></p>
      <h1 class="hero__brand">INSIDUS</h1>
      <p class="hero__claim" id="hero-claim"></p>
    </div>
  </div>
  <div class="hero__foot">
    <div class="shell" style="display:flex;justify-content:space-between;align-items:center;gap:1rem">
      <span class="hero__scroll coord"><i></i><span id="hero-scroll"></span></span>
      <span class="coord">33°35′S · 71°37′W</span>
    </div>
  </div>
</section>

<!-- 02 ............................................. BRAND STATEMENT -->
<section class="statement" id="statement" data-anim-slot="OceanTransition">
  <div class="slot" aria-hidden="true"></div>
  <div class="statement__in">
    <div class="shell">
      <p class="tag tag--accent" id="statement-kicker"></p>
      <p class="statement__line" id="statement-line"></p>
      <div class="statement__grid">
        <h2 class="display h-sm upper" id="statement-title"></h2>
        <p class="statement__body" id="statement-body"></p>
      </div>
    </div>
  </div>
</section>

<!-- ............................................................ ABOUT -->
<section class="band" id="about">
  <div class="shell">
    <div class="about__grid">
      <div class="about__meta">
        <p class="tag" id="about-kicker"></p>
        <h2 class="display h-sec upper" id="about-title"></h2>
        <p class="lead" id="about-lead"></p>
      </div>
      <div class="stack" id="about-body"></div>
    </div>
    <div class="figures" id="about-figures"></div>
  </div>
</section>

<!-- 03 ........................................................ PRODUCTS -->
<section class="band band--deep" id="products">
  <div class="shell">
    <div class="products__head">
      <p class="tag tag--accent" id="products-kicker"></p>
      <h2 class="display h-sec upper" id="products-title"></h2>
      <p class="lead" id="products-lead"></p>
    </div>
  </div>
  <div class="anim-stage" id="product-animation" data-anim-slot="ProductAnimation">
    <div class="slot" aria-hidden="true"></div>
  </div>
  <div class="shell" id="products-list"></div>
</section>

<!-- 04 ................................................. CINEMATIC FILM
     A scene, not a banner: full bleed, no player chrome. Drop the file into
     MEDIA["film"] and this becomes an autoplaying, muted, looping frame. -->
<section class="film" id="film">
  <div class="film__media" data-media="film">{FILM_MEDIA}</div>
  <div class="film__scrim" aria-hidden="true"></div>
  <div class="film__in">
    <div class="shell">
      <p class="tag tag--accent" id="film-kicker"></p>
      <p class="film__line" id="film-line"></p>
      <p class="tag film__note" id="film-note"></p>
    </div>
  </div>
</section>

<!-- 05 ......................................................... QUALITY -->
<section class="band" id="quality">
  <div class="shell">
    <div class="head">
      <p class="tag" id="quality-kicker"></p>
      <h2 class="display h-sec upper" id="quality-title"></h2>
      <p class="lead" id="quality-lead"></p>
    </div>
    <div class="quals" id="quality-list"></div>
  </div>
</section>

<!-- 06 ......................................................... PROCESS -->
<section class="band band--deep" id="process">
  <div class="shell">
    <div class="head">
      <p class="tag tag--accent" id="process-kicker"></p>
      <h2 class="display h-sec upper" id="process-title"></h2>
      <p class="lead" id="process-lead"></p>
    </div>
  </div>
  <div class="anim-stage" id="process-animation" data-anim-slot="ProcessAnimation">
    <div class="slot" aria-hidden="true"></div>
  </div>
  <div class="shell"><div class="chain" id="process-list"></div></div>
</section>

<!-- ..................................................... TRACEABILITY -->
<section class="band band--tight" id="traceability">
  <div class="shell">
    <div class="head">
      <p class="tag" id="trace-kicker"></p>
      <h2 class="display h-md upper" id="trace-title"></h2>
      <p class="lead" id="trace-lead"></p>
    </div>
    <div class="pairs" id="trace-list"></div>
  </div>
</section>

<!-- 07 .................................................... GLOBAL REACH -->
<section class="band band--deep" id="global">
  <div class="shell">
    <div class="head">
      <p class="tag" id="reach-kicker"></p>
      <h2 class="display h-sec upper" id="reach-title"></h2>
      <p class="lead" id="reach-lead"></p>
    </div>
    <div class="reach__grid">
      <div>
        <ul class="reach__list" id="reach-list"></ul>
        <p class="tag" id="reach-note" style="margin-top:1.6rem"></p>
      </div>
      <div class="reach__map" id="global-map" data-anim-slot="GlobalMap">
        <div class="slot" aria-hidden="true"></div>
        <span class="coord" id="reach-maplabel"></span>
      </div>
    </div>
  </div>
</section>

<!-- 08 ................................................. B2B POSITIONING -->
<section class="band" id="partnership">
  <div class="shell">
    <div class="head">
      <p class="tag tag--accent" id="partners-kicker"></p>
      <h2 class="display h-sec upper" id="partners-title"></h2>
      <p class="lead" id="partners-lead"></p>
    </div>
    <div class="partners" id="partners-list"></div>
  </div>
</section>

<!-- 09 ..................................................... FINAL MOMENT -->
<section class="final" id="final-animation" data-anim-slot="FinalAnimation">
  <div class="slot" aria-hidden="true"></div>
  <div class="shell">
    <p class="final__line display" id="final-line"></p>
    <a class="product__cta" id="final-cta" href="#contact" style="margin-top:3rem"></a>
  </div>
</section>

</main>
"""

PRODUCT_MAIN = """
<main>
<section class="phero" id="phero">
  <div class="slot" aria-hidden="true"></div>
  <div class="shell">
    <p class="coord"><span class="num" id="p-num"></span> &nbsp;<span id="p-index"></span></p>
    <h1 class="phero__name" id="p-name"></h1>
    <p class="product__trade" id="p-trade" style="margin-top:1rem"></p>
    <p class="product__bino" id="p-bino"></p>
  </div>
</section>

<section class="band">
  <div class="shell">
    <div class="pgrid">
      <div>
        <p class="tag tag--accent" id="ps-overview"></p>
        <div class="spec" id="p-spec"></div>
      </div>
      <div class="stack">
        <p class="tag" id="ps-origin"></p>
        <p class="body"><span class="editable" data-editable>—</span></p>
        <p class="tag" id="ps-processing" style="margin-top:2rem"></p>
        <p class="body"><span class="editable" data-editable>—</span></p>
        <p class="tag" id="ps-quality" style="margin-top:2rem"></p>
        <p class="body"><span class="editable" data-editable>—</span></p>
        <p class="tag" id="ps-markets" style="margin-top:2rem"></p>
        <p class="body"><span class="editable" data-editable>—</span></p>
      </div>
    </div>
  </div>
</section>

<section class="band band--deep">
  <div class="shell">
    <p class="tag" id="ps-gallery"></p>
    <div class="gallery">
      <div><span class="coord">01</span></div><div><span class="coord">02</span></div>
      <div><span class="coord">03</span></div><div><span class="coord">04</span></div>
    </div>
    <p class="tag" id="p-gallery-note" style="margin-top:1rem"></p>
  </div>
</section>

<section class="band">
  <div class="shell" style="display:flex;justify-content:space-between;gap:1.5rem;flex-wrap:wrap">
    <a class="product__cta" id="p-back" href="../../"></a>
    <span id="p-next"></span>
  </div>
</section>
</main>
"""


def config_js(photos, thumbs, product_media, inline_locales=None):
    cfg = {
        "langs": LANGS, "label": LABEL, "htmlLang": HTML_LANG,
        "species": SPECIES, "facts": FACTS,
        "photos": photos, "thumbs": thumbs, "productMedia": product_media,
        "base": "{BASE}",
    }
    if CDN:
        cfg["locales"] = CDN + "/locales/"
    out = "window.INSIDUS_CONFIG=" + json.dumps(cfg, ensure_ascii=False) + ";"
    if inline_locales is not None:
        out += "\nwindow.INSIDUS_LOCALES=" + json.dumps(inline_locales, ensure_ascii=False) + ";"
    return out


def b64(path):
    with open(path, "rb") as f:
        return "data:image/jpeg;base64," + base64.b64encode(f.read()).decode()


# ------------------------------------------------------------------ build
def build():
    if os.path.isdir(DIST):
        shutil.rmtree(DIST)
    os.makedirs(os.path.join(DIST, "locales"))
    shutil.copytree(ASSETS, os.path.join(DIST, "assets"))

    # locales as real files
    for l in LANGS:
        with io.open(os.path.join(DIST, "locales", l + ".json"), "w", encoding="utf-8") as f:
            json.dump(C[l], f, ensure_ascii=False, separators=(",", ":"))

    en = C["en"]

    # ---- multi-file: home
    photos = {k: CDN + "/assets/img/" + v for k, v in HI.items()}
    thumbs = {k: CDN + "/assets/img/" + v for k, v in THUMBS.items() if os.path.exists(os.path.join(IMG, v))}
    pmedia = {k: CDN + "/assets/img/" + v for k, v in PRODUCT_MEDIA.items() if v}
    cfg = config_js(photos, thumbs, pmedia).replace("{BASE}", "/")
    html = (head(en["meta"]["title"], en["meta"]["description"],
                 '<link rel="stylesheet" href="' + CDN + '/assets/css/insidus.css">',
                 org_jsonld())
            + '\n<body data-page="home">\n'
            + NAV.format(home="/") + home_main("/") + CONTACT
            + "\n<script>" + cfg + "</script>\n"
            + '<script src="' + CDN + '/assets/js/insidus.js" defer></script>\n'
            + "".join('<script src="' + CDN + '/assets/js/anim/%s" defer></script>\n' % a
                       for a in ANIM)
            + "</body>\n</html>\n")
    write(os.path.join(DIST, "index.html"), html)

    # ---- multi-file: one real URL per product
    for s in SPECIES:
        cfgp = config_js(photos, thumbs, pmedia).replace("{BASE}", "/")
        t = en["meta"]["productTitle"].format(**s)
        d = en["meta"]["productDesc"].format(**s)
        ph = (head(t, d, '<link rel="stylesheet" href="' + CDN + '/assets/css/insidus.css">')
              + f'\n<body data-page="product" data-product="{s["slug"]}">\n'
              + NAV.format(home="/") + PRODUCT_MAIN + CONTACT
              + "\n<script>" + cfgp + "</script>\n"
              + '<script src="' + CDN + '/assets/js/insidus.js" defer></script>\n'
              + "</body>\n</html>\n")
        write(os.path.join(DIST, "products", s["slug"], "index.html"), ph)

    # ---- single file, for review
    iphotos = {k: b64(os.path.join(IMG, v)) for k, v in HI.items() if os.path.exists(os.path.join(IMG, v))}
    ithumbs = {k: b64(os.path.join(IMG, v)) for k, v in THUMBS.items() if os.path.exists(os.path.join(IMG, v))}
    css = io.open(os.path.join(ASSETS, "css", "insidus.css"), encoding="utf-8").read()
    js = io.open(os.path.join(ASSETS, "js", "insidus.js"), encoding="utf-8").read()
    anim = "\n".join(io.open(os.path.join(ASSETS, "js", "anim", a), encoding="utf-8").read()
                     for a in ANIM)
    ipmedia = {k: b64(os.path.join(IMG, v)) for k, v in PRODUCT_MEDIA.items()
               if v and os.path.exists(os.path.join(IMG, v))}
    cfg1 = ('document.body.setAttribute("data-page","home");'
            + config_js(iphotos, ithumbs, ipmedia, inline_locales=C).replace("{BASE}", "#"))
    single = ('<meta charset="utf-8">\n'
              '<meta name="viewport" content="width=device-width,initial-scale=1">\n'
              + "<title>" + en["meta"]["title"] + "</title>\n"
              + f'<link rel="stylesheet" href="{FONTS}">\n'
              + "<style>\n" + css + "\n</style>\n"
              + NAV.format(home="#hero") + home_main("") + CONTACT
              + "\n<script>" + cfg1 + "</script>\n"
              + "<script>\n" + js + "\n</script>\n"
              + "<script>\n" + anim + "\n</script>\n")
    single = single.replace('<body data-page="home">', "")
    write(os.path.join(ROOT, "dist-single.html"), single)

    # the single-file build has no <body> of its own; the page flag rides on <html>
    print("dist/          ", sum(len(fs) for _, _, fs in os.walk(DIST)), "files")
    print("dist-single    ", round(len(single.encode()) / 1024, 1), "KB")
    print("locales        ", len(LANGS))
    print("products       ", len(SPECIES))


def write(path, text):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with io.open(path, "w", encoding="utf-8") as f:
        f.write(text)


if __name__ == "__main__":
    build()
