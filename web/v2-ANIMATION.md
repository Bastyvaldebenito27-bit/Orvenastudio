# Integrating animation

The site is complete without a single animation module. Everything below is
additive: nothing here is required for the page to render, read or convert.

## The contract

```js
INSIDUS.anim.register("CinematicIntro", function (ctx) {
  // ctx.stage    the empty element you draw into (.slot)
  // ctx.section  the surrounding <section>
  // ctx.reduce   true when the visitor asked for reduced motion
  // ctx.lang     current language code
  // ctx.dict     the resolved copy for that language
});
```

Register whenever you like — before or after the page renders. A module
registered late mounts immediately; one registered early mounts as soon as its
stage exists. Each module mounts once. If `register` is never called for a
name, that stage stays empty and nothing about the page changes.

Helpers: `INSIDUS.anim.slot(name)`, `INSIDUS.anim.section(name)`,
`INSIDUS.anim.names()`.

A stage is the **direct child** `.slot` of its host, not any descendant — the
hero's media layer is itself a stage nested inside the hero's own, and a
descendant lookup would hand the outer module the inner stage.

## The stages

| Name | Section id | Kind | Status |
|---|---|---|---|
| `CinematicIntro` | `#hero` | background | `assets/js/anim/cinematic-intro.js` |
| `HeroField` | `.hero__media` | background | `assets/js/anim/hero-field.js` |
| `ProductAnimation` | `#product-animation` | stage | `assets/js/anim/product-reveal.js` |
| `SpeciesIndex` | `#products-index` | background | `assets/js/anim/species-index.js` |
| `ProcessAnimation` | `#process-animation` | stage | `assets/js/anim/process-chain.js` |
| `GlobalMap` | `#global-map` | background | `assets/js/anim/global-map.js` |
| `FinalAnimation` | `#final-animation` | background | `assets/js/anim/final-reveal.js` |

**Background** stages are absolutely positioned behind the section's own
content, which stays legible on top. In `#hero` the stage sits *above* the
scrim, so a module draws into the picture rather than under the dimming layer. Draw atmosphere here — video, WebGL, a
particle field, a shader.

**Stage** stages occupy **zero height** until a module mounts. On mount the
registry adds `.is-live` and the section opens to roughly 60svh — but only if
the module actually put something in the stage. A module may register for a
slot and enhance the section around it instead; the height is then given back,
so registering never costs the page an empty gap.

A `.slot` already stretches any `canvas`, `video`, `svg` or `iframe` you put
inside it to fill the stage with `object-fit: cover`.

## Rules that must hold

1. **Never move copy into a module.** Every string comes from
   `/locales/<lang>.json`. A module may read `ctx.dict`, never own text.
2. **Honour `ctx.reduce`.** Under reduced motion render the final, static
   frame — do not simply skip, and do not run a loop.
3. **Do not block first paint.** Load GSAP, Three.js or Spline yourself,
   after the page is interactive, and register when ready.
4. **Re-render is not re-mount.** Changing language re-renders the content and
   fires `insidus:rendered` on `document`; your module keeps running. Listen
   for it if a label inside your animation needs to follow the language.
   **A module that touches rendered content must listen for it**, not merely
   read the DOM at mount: locales arrive by `fetch`, so on a cold load your
   module can mount before a single product exists — and the registry mounts
   each name exactly once, so there is no second chance.
5. **Mobile.** Check `matchMedia` yourself and drop to something cheaper —
   the stage does not decide for you.

## Example: GSAP ScrollTrigger on the product stage

```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js"></script>
<script>
INSIDUS.anim.register("ProductAnimation", function ({ stage, section, reduce }) {
  var layer = document.createElement("div");
  stage.appendChild(layer);
  if (reduce) { layer.dataset.state = "final"; return; }
  gsap.registerPlugin(ScrollTrigger);
  gsap.to(layer, {
    scrollTrigger: { trigger: section, start: "top bottom", end: "bottom top", scrub: true }
    // …
  });
});
</script>
```

## Example: a video in the intro

```js
INSIDUS.anim.register("CinematicIntro", function ({ stage, reduce }) {
  var v = document.createElement("video");
  v.src = "/assets/video/ocean.mp4";
  v.muted = v.playsInline = true;
  v.poster = "/assets/img/ocean-poster.jpg";
  if (!reduce) { v.loop = v.autoplay = true; }
  stage.appendChild(v);
});
```

Lenis or any smooth-scroll layer can be initialised independently; the site
uses native scrolling and CSS `scroll-behavior`, and nothing depends on
scroll position except the navbar's solid state.

## Modules already written

Both live in `assets/js/anim/` and are listed in `ANIM` in `build/build.py`,
which is the only place a new module has to be named. Remove a filename from
that list and the site rebuilds without it, unchanged.

**`cinematic-intro.js`** — splits the intro copy into letters and words and
plays them in, over an SVG grid drawn on the page's own columns, drifting
marine snow and a pointer light. It re-splits on `insidus:rendered`, so the
sequence replays when the language changes.

**`global-map.js`** — an orthographic globe on Canvas 2D. Natural Earth land
at 110m, simplified to about 0.6° and delta-coded, comes to under 3 KB inside
the file: no image, no CDN, no licence to check. San Antonio (33°35′S
71°37′W) pulses as the origin and arcs leave it toward the four regions the
section already lists — no market is named, because none is known. The loop
runs only while the frame is on screen and the tab is visible; under reduced
motion it paints one frame and stops.

**`hero-field.js`** — a WebGL2 fragment shader filling the opening frame with
slow, dark water: domain-warped noise, an iterative swirl and a three-colour
blend, all on one quad and one DOM node. It is a stand-in for footage that
does not exist yet, so it **refuses to mount** once `MEDIA["hero"]` carries a
real `<img>` or `<video>` — it steps aside rather than sitting on top of the
film. Without WebGL2, or if a shader fails to compile, it does not mount and
the waiting-placeholder stays. Device pixel ratio is capped at 1.5 (1.25 under
700px); the loop runs only while the frame is on screen and the tab visible;
under reduced motion it paints one frame and stops.

**`product-reveal.js`** — the gesture of `parallax-image` (@pulkitxm on
21st.dev), rewritten in vanilla: a scroll-linked vertical shift on the
photograph, paired with a clip-path mask that opens upward and a 1.06 settle.
It draws nothing into its stage — the eight frames already exist — so
`#product-animation` stays closed. Three layers per frame, because the mask,
the settle and the parallax must not share a transform. A frame plainly inside
the viewport opens even if the observer never delivered: a mask stuck shut is
an invisible product.

**`final-reveal.js`** — the gesture of `vertical-cut-reveal` (@danielpetho on
21st.dev): each word of the closing line wiped up from behind its own baseline.
A clean cut, not a blur fade. It owns no copy; it re-cuts whatever the locale
put on the page, and re-cuts it again on every language change.


## The short edition

The home page was 20.7 screens on desktop and 24.6 on a phone; the products
section alone was 42% of it, and the first email address sat 23 phone-screens
down. It is now 10.8 and 14.0, with contact reachable from the first frame at
every width.

Two structural consequences for anyone writing a module here:

* `#statement` is gone as a section — the brand line folded into `#about` —
  so the `OceanTransition` slot no longer exists. `#process` and
  `#traceability` survive as ids on blocks inside `#quality`, which keeps the
  anchors working; `ProcessAnimation` still has its stage there.
* `#film` is emitted **only when `MEDIA["film"]` names a real file**. A module
  that wants to draw into the film section must tolerate its absence — the
  registry already does, since `slot()` simply returns nothing.

`SpeciesIndex` is worth reading as the reference for a background module that
enhances rendered content rather than drawing into its stage: it attaches its
`insidus:rendered` listener before the first `prepare()` (the cold-load rule
below), leaves its stage empty so the registry hands the height back, and
degrades to a plain list of links when the file is deleted.

One judgement it encodes: the pointer preview mounts **only** for a species
that has a real photograph in `PRODUCT_MEDIA`. Enlarging the 200px working
thumb would have given every row a preview today, and every one of them would
have been a bad photograph presented as artwork. The row stays typographic
until the real file lands.


## ProcessAnimation

The chain's accent rules are drawn by the stylesheet off core `js-rise`, with
no module involved — so `process-chain.js` had to add what CSS cannot:

* the stage numbers count up as each cell arrives (eight counters in sequence
  read as a line moving, which is what a process is);
* a hairline spans each grid row behind the cells, drawn left to right, so the
  eight stages read as one chain rather than eight boxes.

It builds the rails from where the cells actually landed rather than from a
hard-coded column count, and rebuilds them on resize — the grid is 1, 2 or 4
columns across three breakpoints, and a rail measured for one of them is
visibly wrong in the other two.

Like `SpeciesIndex` it leaves its stage empty, so the registry hands the height
back. Under reduced motion the counters are written at their final value and no
rail is created at all; a counter stuck at `00` because the animation did not
get to run would be worse than no animation.
