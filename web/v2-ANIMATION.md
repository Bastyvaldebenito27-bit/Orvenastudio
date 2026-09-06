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

## The six stages

| Name | Section id | Kind | Status |
|---|---|---|---|
| `CinematicIntro` | `#hero` | background | `assets/js/anim/cinematic-intro.js` |
| `HeroField` | `.hero__media` | background | `assets/js/anim/hero-field.js` |
| `OceanTransition` | `#statement` | background | free |
| `ProductAnimation` | `#product-animation` | stage | free |
| `ProcessAnimation` | `#process-animation` | stage | free |
| `GlobalMap` | `#global-map` | background | `assets/js/anim/global-map.js` |
| `FinalAnimation` | `#final-animation` | background | free |

**Background** stages are absolutely positioned behind the section's own
content, which stays legible on top. In `#hero` the stage sits *above* the
scrim, so a module draws into the picture rather than under the dimming layer. Draw atmosphere here — video, WebGL, a
particle field, a shader.

**Stage** stages occupy **zero height** until a module mounts. On mount the
registry adds `.is-live` and the section opens to roughly 60svh. This is why
the page has no empty gaps today.

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
