/* La Cocina del Tata — Reel 9:16
   util.js — matemática, easing, ruido, color y helpers de dibujo. */
(function (T) {
  'use strict';

  var U = {};

  U.W = 1080;
  U.H = 1920;

  U.clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  U.lerp = function (a, b, t) { return a + (b - a) * t; };
  U.inv = function (a, b, v) { return b === a ? 0 : (v - a) / (b - a); };
  /* Normaliza v de [a,b] a [0,1] con recorte. */
  U.norm = function (v, a, b) { return U.clamp(U.inv(a, b, v), 0, 1); };
  U.mix = function (a, b, t) { return a + (b - a) * t; };

  /* ---- Easing ---- */
  U.ease = {
    linear: function (t) { return t; },
    inQuad: function (t) { return t * t; },
    outQuad: function (t) { return 1 - (1 - t) * (1 - t); },
    inOutQuad: function (t) { return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; },
    outCubic: function (t) { return 1 - Math.pow(1 - t, 3); },
    inOutCubic: function (t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; },
    outQuart: function (t) { return 1 - Math.pow(1 - t, 4); },
    outQuint: function (t) { return 1 - Math.pow(1 - t, 5); },
    inOutQuint: function (t) { return t < 0.5 ? 16 * t * t * t * t * t : 1 - Math.pow(-2 * t + 2, 5) / 2; },
    outExpo: function (t) { return t >= 1 ? 1 : 1 - Math.pow(2, -10 * t); },
    inExpo: function (t) { return t <= 0 ? 0 : Math.pow(2, 10 * t - 10); },
    inOutExpo: function (t) {
      if (t <= 0) return 0; if (t >= 1) return 1;
      return t < 0.5 ? Math.pow(2, 20 * t - 10) / 2 : (2 - Math.pow(2, -20 * t + 10)) / 2;
    },
    outBack: function (t, s) {
      s = s === undefined ? 1.34 : s;
      var c3 = s + 1;
      return 1 + c3 * Math.pow(t - 1, 3) + s * Math.pow(t - 1, 2);
    },
    outElastic: function (t) {
      if (t <= 0) return 0; if (t >= 1) return 1;
      var c4 = (2 * Math.PI) / 3;
      return Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
    },
    /* Golpe seco: entra rapidísimo y asienta. Ideal para textos "slam". */
    slam: function (t) { return 1 - Math.pow(1 - t, 6); }
  };

  /* Rampa con easing entre dos tiempos absolutos. */
  U.ramp = function (t, t0, t1, easeFn) {
    var p = U.norm(t, t0, t1);
    return (easeFn || U.ease.outCubic)(p);
  };

  /* Envolvente entrada/salida: 0 -> 1 -> 0 */
  U.env = function (t, inStart, inEnd, outStart, outEnd, easeIn, easeOut) {
    var a = U.ramp(t, inStart, inEnd, easeIn || U.ease.outQuint);
    var b = 1 - U.ramp(t, outStart, outEnd, easeOut || U.ease.inOutCubic);
    return Math.min(a, b);
  };

  /* ---- Aleatoriedad determinista ---- */
  U.rng = function (seed) {
    var a = seed >>> 0;
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  };

  /* Ruido de valor 1D suave — para flicker de luces y micro-movimientos. */
  var _perm = (function () {
    var r = U.rng(20250918), p = new Float32Array(512);
    for (var i = 0; i < 512; i++) p[i] = r();
    return p;
  })();
  U.noise1 = function (x) {
    var i = Math.floor(x), f = x - i;
    var a = _perm[i & 511], b = _perm[(i + 1) & 511];
    var u = f * f * (3 - 2 * f);
    return a + (b - a) * u;
  };
  /* Ruido fractal: más orgánico. Devuelve ~[0,1] */
  U.fbm1 = function (x, oct) {
    oct = oct || 3;
    var s = 0, amp = 0.5, tot = 0;
    for (var i = 0; i < oct; i++) { s += U.noise1(x) * amp; tot += amp; x *= 2.03; amp *= 0.5; }
    return s / tot;
  };

  /* ---- Color ---- */
  U.rgba = function (hex, a) {
    var h = hex.replace('#', '');
    if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
    var n = parseInt(h, 16);
    return 'rgba(' + ((n >> 16) & 255) + ',' + ((n >> 8) & 255) + ',' + (n & 255) + ',' + a + ')';
  };
  U.mixHex = function (h1, h2, t) {
    var p = function (h) { h = h.replace('#', ''); var n = parseInt(h, 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
    var a = p(h1), b = p(h2);
    var c = [0, 1, 2].map(function (i) { return Math.round(U.lerp(a[i], b[i], t)); });
    return 'rgb(' + c[0] + ',' + c[1] + ',' + c[2] + ')';
  };

  /* Paleta de marca */
  U.C = {
    night: '#070E19',
    deepBlue: '#0C1B30',
    blue: '#12305A',
    wood: '#4A2716',
    woodMid: '#7A4423',
    woodLight: '#B07443',
    red: '#B31C1E',
    redDeep: '#7C1113',
    redBright: '#D8302B',
    cream: '#F8EFE1',
    white: '#FFFFFF',
    gold: '#E9B44C',
    goldLight: '#F7DC9A',
    ember: '#FF8A2B',
    emberHot: '#FFC46B',
    shadow: '#03070D'
  };

  /* ---- Helpers de dibujo ---- */
  U.rrect = function (ctx, x, y, w, h, r) {
    r = Math.min(r, Math.abs(w) / 2, Math.abs(h) / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  };

  /* Resplandor radial (blend screen ya aplicado por quien llama si hace falta). */
  U.glow = function (ctx, x, y, r, color, alpha) {
    var g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, U.rgba(color, alpha));
    g.addColorStop(0.35, U.rgba(color, alpha * 0.45));
    g.addColorStop(1, U.rgba(color, 0));
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
  };

  T.U = U;
})(window.TATA = window.TATA || {});
