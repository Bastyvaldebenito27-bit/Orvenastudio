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

## The six stages

| Name | Section id | Kind |
|---|---|---|
| `CinematicIntro` | `#cinematic-intro` | background |
| `OceanTransition` | `#ocean-transition` | background |
| `ProductAnimation` | `#product-animation` | stage |
| `ProcessAnimation` | `#process-animation` | stage |
| `GlobalMap` | `#global-map` | background |
| `FinalAnimation` | `#final-animation` | background |

**Background** stages are absolutely positioned behind the section's own
content, which stays legible on top. Draw atmosphere here — video, WebGL, a
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
