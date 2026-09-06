/* ============================================================================
   HeroField — animation module
   Ported from a React/TypeScript WebGL gradient. The fragment shader is kept
   almost verbatim: it is the valuable part, and it is genuinely good — domain
   warped noise, an iterative swirl and a three-colour blend, all on one quad.
   Everything around it was rewritten.

   What it is here: a stand-in for footage that does not exist yet. It fills
   the opening frame with slow, dark water and then gets out of the way — the
   moment a real <img> or <video> lands in MEDIA["hero"], this module refuses
   to mount. It is not decoration layered on top of the film; it is the film's
   placeholder.

   Retuned hard for INSIDUS. The preset library that came with it (Lava,
   Plasma, Vortex) is exactly the saturated, startup-looking gradient the
   brief rules out, so none of them is used. This is near-black with one
   restrained tide blue, moving at a fifth of the original speed.

   Self-contained. Delete this <script> and the frame is as it was.
   Load AFTER assets/js/insidus.js.
   ========================================================================= */
(function () {
"use strict";

/* Deep water, not plasma. Every value here is deliberately far below the
   original defaults; the hero scrim then darkens it further. */
var P = {
  color1: "#04070B",   /* the ground */
  color2: "#16374E",   /* one blue, and only just */
  color3: "#04070B",
  rotation: 0,
  proportion: 42,
  scale: 0.55,
  speed: 8,            /* the original default is 25 */
  distortion: 6,
  swirl: 52,
  swirlIterations: 6,
  softness: 100,
  offset: 0,
  shape: 2,            /* 0 checks · 1 stripes · 2 edge — a horizon, not a tile */
  shapeSize: 55
};

var VERT = "#version 300 es\n" +
  "in vec4 a_position;\n" +
  "void main() { gl_Position = a_position; }";

var FRAG = "#version 300 es\n\
precision highp float;\n\
uniform float u_time;\n\
uniform float u_pixelRatio;\n\
uniform vec2  u_resolution;\n\
uniform float u_scale;\n\
uniform float u_rotation;\n\
uniform vec4  u_color1;\n\
uniform vec4  u_color2;\n\
uniform vec4  u_color3;\n\
uniform float u_proportion;\n\
uniform float u_softness;\n\
uniform float u_shape;\n\
uniform float u_shapeScale;\n\
uniform float u_distortion;\n\
uniform float u_swirl;\n\
uniform float u_swirlIterations;\n\
out vec4 fragColor;\n\
#define TWO_PI 6.28318530718\n\
#define PI 3.14159265358979323846\n\
vec2 rotate(vec2 uv, float th) {\n\
  return mat2(cos(th), sin(th), -sin(th), cos(th)) * uv;\n\
}\n\
float random(vec2 st) {\n\
  return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);\n\
}\n\
float noise(vec2 st) {\n\
  vec2 i = floor(st);\n\
  vec2 f = fract(st);\n\
  float a = random(i);\n\
  float b = random(i + vec2(1.0, 0.0));\n\
  float c = random(i + vec2(0.0, 1.0));\n\
  float d = random(i + vec2(1.0, 1.0));\n\
  vec2 u = f * f * (3.0 - 2.0 * f);\n\
  float x1 = mix(a, b, u.x);\n\
  float x2 = mix(c, d, u.x);\n\
  return mix(x1, x2, u.y);\n\
}\n\
vec4 blend_colors(vec4 c1, vec4 c2, vec4 c3, float mixer, float edgesWidth, float edge_blur) {\n\
  vec3 color1 = c1.rgb * c1.a;\n\
  vec3 color2 = c2.rgb * c2.a;\n\
  vec3 color3 = c3.rgb * c3.a;\n\
  float r1 = smoothstep(.0 + .35 * edgesWidth, .7 - .35 * edgesWidth + .5 * edge_blur, mixer);\n\
  float r2 = smoothstep(.3 + .35 * edgesWidth, 1. - .35 * edgesWidth + edge_blur, mixer);\n\
  vec3 blended_color_2 = mix(color1, color2, r1);\n\
  float blended_opacity_2 = mix(c1.a, c2.a, r1);\n\
  vec3 c = mix(blended_color_2, color3, r2);\n\
  float o = mix(blended_opacity_2, c3.a, r2);\n\
  return vec4(c, o);\n\
}\n\
void main() {\n\
  vec2 uv = gl_FragCoord.xy / u_resolution.xy;\n\
  float t = .5 * u_time;\n\
  float noise_scale = .0005 + .006 * u_scale;\n\
  uv -= .5;\n\
  uv *= (noise_scale * u_resolution);\n\
  uv = rotate(uv, u_rotation * .5 * PI);\n\
  uv /= u_pixelRatio;\n\
  uv += .5;\n\
  float n1 = noise(uv * 1. + t);\n\
  float n2 = noise(uv * 2. - t);\n\
  float angle = n1 * TWO_PI;\n\
  uv.x += 4. * u_distortion * n2 * cos(angle);\n\
  uv.y += 4. * u_distortion * n2 * sin(angle);\n\
  float iterations_number = ceil(clamp(u_swirlIterations, 1., 30.));\n\
  for (float i = 1.; i <= iterations_number; i++) {\n\
    uv.x += clamp(u_swirl, 0., 2.) / i * cos(t + i * 1.5 * uv.y);\n\
    uv.y += clamp(u_swirl, 0., 2.) / i * cos(t + i * 1. * uv.x);\n\
  }\n\
  float proportion = clamp(u_proportion, 0., 1.);\n\
  float shape = 0.;\n\
  float mixer = 0.;\n\
  if (u_shape < .5) {\n\
    vec2 checks_shape_uv = uv * (.5 + 3.5 * u_shapeScale);\n\
    shape = .5 + .5 * sin(checks_shape_uv.x) * cos(checks_shape_uv.y);\n\
    mixer = shape + .48 * sign(proportion - .5) * pow(abs(proportion - .5), .5);\n\
  } else if (u_shape < 1.5) {\n\
    vec2 stripes_shape_uv = uv * (.25 + 3. * u_shapeScale);\n\
    float f = fract(stripes_shape_uv.y);\n\
    shape = smoothstep(.0, .55, f) * smoothstep(1., .45, f);\n\
    mixer = shape + .48 * sign(proportion - .5) * pow(abs(proportion - .5), .5);\n\
  } else {\n\
    float sh = 1. - uv.y;\n\
    sh -= .5;\n\
    sh /= (noise_scale * u_resolution.y);\n\
    sh += .5;\n\
    float shape_scaling = .2 * (1. - u_shapeScale);\n\
    shape = smoothstep(.45 - shape_scaling, .55 + shape_scaling, sh + .3 * (proportion - .5));\n\
    mixer = shape;\n\
  }\n\
  vec4 color_mix = blend_colors(u_color1, u_color2, u_color3, mixer, 1. - clamp(u_softness, 0., 1.), .01 + .01 * u_scale);\n\
  fragColor = vec4(color_mix.rgb, color_mix.a);\n\
}";

/* #rgb / #rrggbb / #rrggbbaa — the original also parsed rgb(), hsl() and
   hsla(), which nothing on this site produces. Dropped rather than carried. */
function rgba(hex) {
  var c = String(hex).replace("#", "");
  if (c.length === 3) c = c[0] + c[0] + c[1] + c[1] + c[2] + c[2];
  return [parseInt(c.slice(0, 2), 16) / 255,
          parseInt(c.slice(2, 4), 16) / 255,
          parseInt(c.slice(4, 6), 16) / 255,
          c.length === 8 ? parseInt(c.slice(6, 8), 16) / 255 : 1];
}

/* The original never checked whether the shaders compiled. On a driver that
   rejects one, it drew nothing and said nothing. */
function compile(gl, type, src) {
  var sh = gl.createShader(type);
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    console.warn("[HeroField] shader:", gl.getShaderInfoLog(sh));
    gl.deleteShader(sh);
    return null;
  }
  return sh;
}

function mount(ctx) {
  var host = ctx.section;                 // .hero__media
  /* Real footage wins. This module exists only while there is none. */
  if (host && host.querySelector("video, img")) return;

  var cv = document.createElement("canvas");
  cv.setAttribute("aria-hidden", "true");
  cv.style.width = "100%"; cv.style.height = "100%"; cv.style.display = "block";

  var gl = cv.getContext("webgl2", { premultipliedAlpha: true, alpha: true, antialias: true });
  if (!gl) return;                        // no WebGL2: the placeholder stays

  var vs = compile(gl, gl.VERTEX_SHADER, VERT);
  var fs = compile(gl, gl.FRAGMENT_SHADER, FRAG);
  if (!vs || !fs) return;

  var prog = gl.createProgram();
  gl.attachShader(prog, vs); gl.attachShader(prog, fs); gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
    console.warn("[HeroField] link:", gl.getProgramInfoLog(prog));
    return;
  }
  gl.useProgram(prog);

  var buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER,
    new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW);
  var loc = gl.getAttribLocation(prog, "a_position");
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

  var U = {};
  ["u_time", "u_resolution", "u_pixelRatio", "u_scale", "u_rotation",
   "u_color1", "u_color2", "u_color3", "u_proportion", "u_softness",
   "u_shape", "u_shapeScale", "u_distortion", "u_swirl", "u_swirlIterations"
  ].forEach(function (n) { U[n] = gl.getUniformLocation(prog, n); });

  ctx.stage.textContent = "";
  ctx.stage.appendChild(cv);

  /* A full-bleed shader at a phone's native 3x is a lot of fragments for a
     background. Capped, and capped harder on small screens. */
  var dpr = 1;
  function size() {
    var r = ctx.stage.getBoundingClientRect();
    var w = Math.max(1, Math.round(r.width)), h = Math.max(1, Math.round(r.height));
    dpr = Math.min(window.devicePixelRatio || 1, w < 700 ? 1.25 : 1.5);
    cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr);
    gl.viewport(0, 0, cv.width, cv.height);
  }
  size();

  var c1 = rgba(P.color1), c2 = rgba(P.color2), c3 = rgba(P.color3);
  function frame(seconds) {
    gl.uniform1f(U.u_time, seconds * (P.speed / 100) * 5 + P.offset * 0.01);
    gl.uniform2f(U.u_resolution, cv.width, cv.height);
    gl.uniform1f(U.u_pixelRatio, dpr);
    gl.uniform1f(U.u_scale, P.scale);
    gl.uniform1f(U.u_rotation, (P.rotation * Math.PI) / 180);
    gl.uniform4f(U.u_color1, c1[0], c1[1], c1[2], c1[3]);
    gl.uniform4f(U.u_color2, c2[0], c2[1], c2[2], c2[3]);
    gl.uniform4f(U.u_color3, c3[0], c3[1], c3[2], c3[3]);
    gl.uniform1f(U.u_proportion, P.proportion / 100);
    gl.uniform1f(U.u_softness, P.softness / 100);
    gl.uniform1f(U.u_shape, P.shape);
    gl.uniform1f(U.u_shapeScale, P.shapeSize / 100);
    gl.uniform1f(U.u_distortion, P.distortion / 50);
    gl.uniform1f(U.u_swirl, P.swirl / 100);
    gl.uniform1f(U.u_swirlIterations, P.swirl === 0 ? 0 : P.swirlIterations);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }

  /* ------------------------------------------------------------ lifecycle */
  var t0 = performance.now(), raf = 0, running = false, lost = false;

  cv.addEventListener("webglcontextlost", function (e) {
    e.preventDefault(); lost = true; stop();
  });

  function loop(now) {
    frame((now - t0) / 1000);
    raf = requestAnimationFrame(loop);
  }
  function start() {
    if (running || lost || ctx.reduce) return;
    running = true; raf = requestAnimationFrame(loop);
  }
  function stop() {
    running = false;
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
  }

  frame(0);
  if (ctx.reduce) return;    // one frame, no loop — as the contract requires

  /* The original ran its rAF for the life of the page, on screen or not. */
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (es) {
      es[0].isIntersecting ? start() : stop();
    }, { rootMargin: "80px" }).observe(host);
  } else {
    start();
  }
  document.addEventListener("visibilitychange", function () {
    document.hidden ? stop() : start();
  });

  var rz;
  window.addEventListener("resize", function () {
    clearTimeout(rz);
    rz = setTimeout(function () { size(); if (!running) frame(0); }, 150);
  }, { passive: true });
}

function boot() {
  if (!window.INSIDUS || !window.INSIDUS.anim) return false;
  window.INSIDUS.anim.register("HeroField", mount);
  return true;
}
if (!boot()) {
  document.addEventListener("DOMContentLoaded", boot);
  setTimeout(boot, 300);
}
})();
