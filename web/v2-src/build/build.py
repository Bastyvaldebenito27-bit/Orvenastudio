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
ANIM = ["cinematic-intro.js", "global-map.js"]
IMG = os.path.join(ASSETS, "img")

FACTS = {
    "email": "mbonilla@valrey.cl",
    "phone": "+56 9 7637 9609",
    "address": "Av. Bernardo O'Higgins 2929, San Antonio, Valparaíso, Chile",
    "originLabel": "Chile · South Pacific",
}

FONTS = ("https://fonts.googleapis.com/css2?"
         "family=Instrument+Serif:ital@0;1"
         "&family=Schibsted+Grotesk:wght@400;500;600"
         "&family=DM+Mono:ital,wght@0,300;0,400;0,500"
         "&display=swap")

# Only species with a usable high-resolution frame get a full-bleed image.
HI = {"bacalao": "bacalao-hi.jpg"}
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
<meta name="theme-color" content="#03070E">
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
      </div>
      <div class="foot__col"><h3 id="foot-nav-title"></h3><ul id="foot-nav"></ul></div>
      <div class="foot__col"><h3 id="foot-lang-title"></h3><ul id="foot-langs"></ul></div>
    </div>
    <div class="foot__base"><span id="foot-base"></span><span class="mono">CHILE · SOUTH PACIFIC</span></div>
  </div>
</footer>
"""

HOME_MAIN = """
<main>

<!-- 01 ................................................. CINEMATIC INTRO -->
<section class="intro" id="cinematic-intro" data-anim-slot="CinematicIntro">
  <div class="slot" aria-hidden="true"></div>
  <div class="intro__in">
    <div class="shell">
      <p class="intro__coord coord"><i></i><span id="intro-coord"></span></p>
      <h1 class="intro__brand">INSIDUS</h1>
      <p class="intro__line" id="intro-line"></p>
    </div>
  </div>
  <div class="intro__foot">
    <div class="shell" style="display:flex;justify-content:space-between;align-items:center;gap:1rem">
      <span class="intro__scroll coord"><i></i><span id="intro-scroll"></span></span>
      <span class="coord">33°35′S · 71°37′W</span>
    </div>
  </div>
</section>

<!-- 02 ............................................... OCEAN TRANSITION -->
<section class="ocean" id="ocean-transition" data-anim-slot="OceanTransition">
  <div class="slot" aria-hidden="true"></div>
  <div class="shell ocean__in">
    <div class="ocean__grid">
      <div>
        <p class="tag tag--accent" id="ocean-kicker"></p>
        <h2 class="display h-md upper ocean__title" id="ocean-title" style="margin-top:.8rem"></h2>
      </div>
      <p class="body" id="ocean-body"></p>
    </div>
  </div>
</section>

<!-- ............................................................. ABOUT -->
<section class="band" id="about">
  <div class="shell">
    <div class="about__grid">
      <div class="about__meta">
        <p class="tag" id="about-kicker"></p>
        <h2 class="display h-lg upper" id="about-title"></h2>
        <p class="lead" id="about-lead"></p>
      </div>
      <div class="stack" id="about-body"></div>
    </div>
  </div>
</section>

<!-- 03 ......................................................... PRODUCTS -->
<section class="band band--deep" id="products">
  <div class="shell">
    <div class="products__head">
      <p class="tag tag--accent" id="products-kicker"></p>
      <h2 class="display h-lg upper" id="products-title"></h2>
      <p class="lead" id="products-lead"></p>
    </div>
  </div>
  <div class="anim-stage" id="product-animation" data-anim-slot="ProductAnimation">
    <div class="slot" aria-hidden="true"></div>
  </div>
  <div class="shell" id="products-list"></div>
</section>

<!-- 04 .......................................................... PROCESS -->
<section class="band" id="process">
  <div class="shell">
    <p class="tag" id="process-kicker"></p>
    <h2 class="display h-lg upper" id="process-title" style="margin:.8rem 0 1rem"></h2>
    <p class="lead" id="process-lead"></p>
  </div>
  <div class="anim-stage" id="process-animation" data-anim-slot="ProcessAnimation">
    <div class="slot" aria-hidden="true"></div>
  </div>
  <div class="shell"><div class="stages" id="process-list"></div></div>
</section>

<!-- ........................................................... QUALITY -->
<section class="band band--deep" id="quality">
  <div class="shell">
    <p class="tag tag--accent" id="quality-kicker"></p>
    <h2 class="display h-lg upper" id="quality-title" style="margin:.8rem 0 1rem"></h2>
    <p class="lead" id="quality-lead"></p>
    <div class="pairs" id="quality-list"></div>
  </div>
</section>

<!-- ...................................................... TRACEABILITY -->
<section class="band" id="traceability">
  <div class="shell">
    <p class="tag" id="trace-kicker"></p>
    <h2 class="display h-md upper" id="trace-title" style="margin:.8rem 0 1rem"></h2>
    <p class="lead" id="trace-lead"></p>
    <div class="pairs" id="trace-list"></div>
  </div>
</section>

<!-- ...................................................... GLOBAL REACH -->
<section class="band band--deep" id="global">
  <div class="shell">
    <p class="tag" id="reach-kicker"></p>
    <h2 class="display h-lg upper" id="reach-title" style="margin:.8rem 0 1rem"></h2>
    <p class="lead" id="reach-lead" style="margin-bottom:clamp(2rem,5vh,3.5rem)"></p>
    <div class="reach__grid">
      <div>
        <ul class="reach__list" id="reach-list"></ul>
        <p class="tag" id="reach-note" style="margin-top:1.4rem"></p>
      </div>
      <!-- Map stage: an SVG, Three.js globe or WebGL layer mounts here later. -->
      <div class="reach__map" id="global-map" data-anim-slot="GlobalMap">
        <div class="slot" aria-hidden="true"></div>
        <span class="coord" id="reach-maplabel"></span>
      </div>
    </div>
  </div>
</section>

<!-- 05 ..................................................... FINAL MOMENT -->
<section class="final" id="final-animation" data-anim-slot="FinalAnimation">
  <div class="slot" aria-hidden="true"></div>
  <div class="shell">
    <p class="final__line display" id="final-line"></p>
    <a class="product__cta" id="final-cta" href="#contact" style="margin-top:2.5rem"></a>
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


def config_js(photos, thumbs, inline_locales=None):
    cfg = {
        "langs": LANGS, "label": LABEL, "htmlLang": HTML_LANG,
        "species": SPECIES, "facts": FACTS,
        "photos": photos, "thumbs": thumbs,
        "base": "{BASE}",
    }
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
    photos = {k: "/assets/img/" + v for k, v in HI.items()}
    thumbs = {k: "/assets/img/" + v for k, v in THUMBS.items() if os.path.exists(os.path.join(IMG, v))}
    cfg = config_js(photos, thumbs).replace("{BASE}", "/")
    html = (head(en["meta"]["title"], en["meta"]["description"],
                 '<link rel="stylesheet" href="/assets/css/insidus.css">')
            + '\n<body data-page="home">\n'
            + NAV.format(home="/") + HOME_MAIN + CONTACT
            + "\n<script>" + cfg + "</script>\n"
            + '<script src="/assets/js/insidus.js" defer></script>\n'
            + "".join('<script src="/assets/js/anim/%s" defer></script>\n' % a
                       for a in ANIM)
            + "</body>\n</html>\n")
    write(os.path.join(DIST, "index.html"), html)

    # ---- multi-file: one real URL per product
    for s in SPECIES:
        cfgp = config_js(photos, thumbs).replace("{BASE}", "/")
        t = en["meta"]["productTitle"].format(**s)
        d = en["meta"]["productDesc"].format(**s)
        ph = (head(t, d, '<link rel="stylesheet" href="/assets/css/insidus.css">')
              + f'\n<body data-page="product" data-product="{s["slug"]}">\n'
              + NAV.format(home="/") + PRODUCT_MAIN + CONTACT
              + "\n<script>" + cfgp + "</script>\n"
              + '<script src="/assets/js/insidus.js" defer></script>\n'
              + "</body>\n</html>\n")
        write(os.path.join(DIST, "products", s["slug"], "index.html"), ph)

    # ---- single file, for review
    iphotos = {k: b64(os.path.join(IMG, v)) for k, v in HI.items() if os.path.exists(os.path.join(IMG, v))}
    ithumbs = {k: b64(os.path.join(IMG, v)) for k, v in THUMBS.items() if os.path.exists(os.path.join(IMG, v))}
    css = io.open(os.path.join(ASSETS, "css", "insidus.css"), encoding="utf-8").read()
    js = io.open(os.path.join(ASSETS, "js", "insidus.js"), encoding="utf-8").read()
    anim = "\n".join(io.open(os.path.join(ASSETS, "js", "anim", a), encoding="utf-8").read()
                     for a in ANIM)
    cfg1 = ('document.body.setAttribute("data-page","home");'
            + config_js(iphotos, ithumbs, inline_locales=C).replace("{BASE}", "#"))
    single = ('<meta charset="utf-8">\n'
              '<meta name="viewport" content="width=device-width,initial-scale=1">\n'
              + "<title>" + en["meta"]["title"] + "</title>\n"
              + f'<link rel="stylesheet" href="{FONTS}">\n'
              + "<style>\n" + css + "\n</style>\n"
              + NAV.format(home="#cinematic-intro") + HOME_MAIN + CONTACT
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
