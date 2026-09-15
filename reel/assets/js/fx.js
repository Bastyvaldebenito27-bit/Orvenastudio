/* fx.js — partículas deterministas y post-proceso cinematográfico.
   Todas las partículas se calculan como función del tiempo (sin acumulación),
   para que cualquier frame pueda renderizarse de forma independiente. */
(function (T) {
  'use strict';
  var U = T.U, C = U.C;
  var Fx = {};
  var W = U.W, H = U.H;

  /* ---------- Grano de película ---------- */
  var grainTile = null;
  function makeGrain() {
    var n = 256;
    var cv = document.createElement('canvas');
    cv.width = n; cv.height = n;
    var c = cv.getContext('2d');
    var img = c.createImageData(n, n);
    var r = U.rng(4242);
    for (var i = 0; i < n * n; i++) {
      var v = 118 + (r() - 0.5) * 150;
      img.data[i * 4] = v; img.data[i * 4 + 1] = v; img.data[i * 4 + 2] = v; img.data[i * 4 + 3] = 255;
    }
    c.putImageData(img, 0, 0);
    return cv;
  }
  Fx.grain = function (ctx, t, amount) {
    if (!grainTile) grainTile = makeGrain();
    var r = U.rng(Math.floor(t * 30) + 1);
    ctx.save();
    ctx.globalCompositeOperation = 'overlay';
    ctx.globalAlpha = amount === undefined ? 0.13 : amount;
    var ox = -r() * 256, oy = -r() * 256;
    var p = ctx.createPattern(grainTile, 'repeat');
    ctx.translate(ox, oy);
    ctx.fillStyle = p;
    ctx.fillRect(0, 0, W + 256, H + 256);
    ctx.restore();
  };

  /* ---------- Viñeta ---------- */
  Fx.vignette = function (ctx, strength, tint) {
    ctx.save();
    var g = ctx.createRadialGradient(W / 2, H * 0.46, H * 0.22, W / 2, H * 0.5, H * 0.78);
    g.addColorStop(0, 'rgba(0,0,0,0)');
    g.addColorStop(0.62, U.rgba(tint || '#000000', strength * 0.28));
    g.addColorStop(1, U.rgba(tint || '#000000', strength));
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
    ctx.restore();
  };

  /* ---------- Bloom ---------- */
  var bA = null, bB = null;
  Fx.bloom = function (src, ctx, amount, threshold) {
    var w = 270, h = 480;
    if (!bA) {
      bA = document.createElement('canvas'); bA.width = w; bA.height = h;
      bB = document.createElement('canvas'); bB.width = w; bB.height = h;
    }
    var ca = bA.getContext('2d'), cb = bB.getContext('2d');
    ca.clearRect(0, 0, w, h);
    ca.save();
    ca.filter = 'brightness(' + (threshold || 1.45) + ') contrast(2.6) saturate(1.15)';
    ca.drawImage(src, 0, 0, w, h);
    ca.restore();
    cb.clearRect(0, 0, w, h);
    cb.save();
    cb.filter = 'blur(11px)';
    cb.drawImage(bA, 0, 0);
    cb.restore();
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    ctx.globalAlpha = amount === undefined ? 0.45 : amount;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(bB, 0, 0, W, H);
    ctx.restore();
  };

  /* ---------- Fugas de luz cálida ---------- */
  Fx.lightLeak = function (ctx, t, alpha, seed) {
    if (alpha <= 0.001) return;
    var r = U.rng(seed || 9);
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    for (var i = 0; i < 3; i++) {
      var ph = t * (0.18 + i * 0.07) + r() * 10;
      var x = W * (0.18 + 0.7 * U.fbm1(ph + i * 3));
      var y = H * (0.12 + 0.72 * U.fbm1(ph * 0.7 + i * 7 + 2));
      var rad = H * (0.22 + 0.2 * U.fbm1(ph * 1.3 + i));
      ctx.globalAlpha = alpha * (0.4 + 0.5 * U.fbm1(ph * 2 + i * 5));
      var col = i === 1 ? C.red : i === 2 ? C.goldLight : C.ember;
      U.glow(ctx, x, y, rad, col, 0.55);
    }
    ctx.restore();
  };

  /* ---------- Destello ---------- */
  Fx.flash = function (ctx, alpha, color) {
    if (alpha <= 0.001) return;
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    ctx.globalAlpha = U.clamp(alpha, 0, 1);
    ctx.fillStyle = color || '#FFE4B5';
    ctx.fillRect(0, 0, W, H);
    ctx.restore();
  };

  /* ---------- Brasas ascendentes ---------- */
  Fx.embers = function (ctx, t, opts) {
    opts = opts || {};
    var n = opts.count || 46;
    var r = U.rng(opts.seed || 1337);
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    for (var i = 0; i < n; i++) {
      var sx = r(), sy = r(), sp = 0.35 + r() * 0.85, ph = r() * 20, sz = 1.6 + r() * 5.4, sw = 0.4 + r() * 1.6;
      var life = 3.2 + r() * 4.5;
      var lt = ((t * sp + ph) % life) / life;
      var x = sx * W + Math.sin((t * sw + ph) * 1.4) * 52 * (0.4 + sy);
      var y = H * (1.06 + sy * 0.25) - lt * H * (0.72 + sy * 0.5);
      var a = Math.sin(lt * Math.PI) * (opts.alpha === undefined ? 0.85 : opts.alpha);
      if (a <= 0.01) continue;
      var col = i % 5 === 0 ? C.goldLight : C.ember;
      ctx.globalAlpha = a;
      U.glow(ctx, x, y, sz * 5.2, col, 0.5);
      ctx.globalAlpha = a * 0.95;
      ctx.beginPath(); ctx.arc(x, y, sz * 0.62, 0, Math.PI * 2);
      ctx.fillStyle = col; ctx.fill();
    }
    ctx.restore();
  };

  /* ---------- Motas de polvo / bokeh flotante ---------- */
  Fx.dust = function (ctx, t, opts) {
    opts = opts || {};
    var n = opts.count || 30;
    var r = U.rng(opts.seed || 77);
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    for (var i = 0; i < n; i++) {
      var sx = r(), sy = r(), sp = 0.05 + r() * 0.12, ph = r() * 30;
      var rad = (opts.size || 1) * (10 + r() * 46);
      var x = (sx + Math.sin(t * sp + ph) * 0.06) * W;
      var y = ((sy - t * sp * 0.05 + ph) % 1.2 + 1.2) % 1.2 * H - H * 0.1;
      var a = (opts.alpha === undefined ? 0.2 : opts.alpha) * (0.35 + 0.65 * U.fbm1(t * 0.8 + ph));
      ctx.globalAlpha = a;
      U.glow(ctx, x, y, rad, i % 4 === 0 ? C.goldLight : C.emberHot, 0.5);
    }
    ctx.restore();
  };

  /* ---------- Confeti (colores de la bandera + dorado) ---------- */
  Fx.confetti = function (ctx, t, t0, opts) {
    opts = opts || {};
    if (t < t0) return;
    var el = t - t0;
    var n = opts.count || 130;
    var r = U.rng(opts.seed || 505);
    var cols = ['#D8302B', '#FFFFFF', '#1D4F9E', '#E9B44C', '#F7DC9A', '#B31C1E'];
    ctx.save();
    for (var i = 0; i < n; i++) {
      var sx = r(), delay = r() * (opts.spread === undefined ? 1.6 : opts.spread), spin = (r() - 0.5) * 9;
      var vy = 160 + r() * 340, sway = 40 + r() * 130, swf = 0.6 + r() * 1.5;
      var w = 12 + r() * 20, h = 16 + r() * 26;
      var col = cols[Math.floor(r() * cols.length)];
      var lt = el - delay;
      if (lt < 0) continue;
      var y = -80 + lt * vy + lt * lt * 26;
      if (y > H + 100) continue;
      var x = sx * W + Math.sin(lt * swf + i) * sway;
      var a = U.clamp(lt * 3, 0, 1) * (opts.alpha === undefined ? 1 : opts.alpha);
      ctx.save();
      ctx.globalAlpha = a;
      ctx.translate(x, y);
      ctx.rotate(lt * spin + i);
      ctx.scale(1, Math.abs(Math.cos(lt * spin * 1.3 + i)) * 0.85 + 0.15);
      ctx.fillStyle = col;
      ctx.fillRect(-w / 2, -h / 2, w, h);
      ctx.restore();
    }
    ctx.restore();
  };

  /* ---------- Destellos / chispitas ---------- */
  Fx.sparkles = function (ctx, t, opts) {
    opts = opts || {};
    var n = opts.count || 20;
    var r = U.rng(opts.seed || 3113);
    var cx = opts.x === undefined ? W / 2 : opts.x;
    var cy = opts.y === undefined ? H / 2 : opts.y;
    var rad = opts.radius || W * 0.42;
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    for (var i = 0; i < n; i++) {
      var a0 = r() * Math.PI * 2, d = (0.35 + r() * 0.65) * rad, ph = r() * 10, sp = 0.7 + r() * 1.5;
      var x = cx + Math.cos(a0) * d, y = cy + Math.sin(a0) * d * 0.9;
      var tw = Math.pow(Math.max(0, Math.sin(t * sp * 2.2 + ph * 6)), 5);
      var a = tw * (opts.alpha === undefined ? 0.95 : opts.alpha);
      if (a < 0.02) continue;
      var s = (opts.size || 1) * (10 + r() * 18) * (0.5 + tw);
      ctx.globalAlpha = a;
      U.glow(ctx, x, y, s * 1.9, C.goldLight, 0.6);
      /* cruz de destello */
      ctx.strokeStyle = 'rgba(255,248,226,' + a.toFixed(3) + ')';
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.moveTo(x - s, y); ctx.lineTo(x + s, y);
      ctx.moveTo(x, y - s); ctx.lineTo(x, y + s);
      ctx.stroke();
    }
    ctx.restore();
  };

  /* ---------- Humo / vapor ---------- */
  Fx.smoke = function (ctx, t, x, y, opts) {
    opts = opts || {};
    var n = opts.count || 9;
    var r = U.rng(opts.seed || 808);
    ctx.save();
    ctx.globalCompositeOperation = opts.comp || 'screen';
    for (var i = 0; i < n; i++) {
      var ph = r() * 12, sp = 0.18 + r() * 0.22, life = 2.6 + r() * 2.2;
      var lt = ((t * sp * 3 + ph) % life) / life;
      var px = x + (r() - 0.5) * (opts.spread || 180) + Math.sin(t * 0.8 + ph * 5) * 40 * lt;
      var py = y - lt * (opts.rise || 420);
      var rad = (opts.size || 90) * (0.4 + lt * 1.5);
      var a = Math.sin(lt * Math.PI) * (opts.alpha === undefined ? 0.16 : opts.alpha);
      ctx.globalAlpha = a;
      U.glow(ctx, px, py, rad, opts.color || '#FFD9A8', 0.4);
    }
    ctx.restore();
  };

  /* ---------- Bokeh de fondo desenfocado ---------- */
  Fx.bokeh = function (ctx, t, opts) {
    opts = opts || {};
    var n = opts.count || 16;
    var r = U.rng(opts.seed || 2024);
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    for (var i = 0; i < n; i++) {
      var sx = r(), sy = r(), sp = 0.03 + r() * 0.07, ph = r() * 20;
      var x = (sx + Math.sin(t * sp * 3 + ph) * 0.03) * W;
      var y = (sy + Math.cos(t * sp * 2.2 + ph) * 0.02) * H;
      var rad = 34 + r() * 96;
      var a = (opts.alpha === undefined ? 0.3 : opts.alpha) * (0.45 + 0.55 * U.fbm1(t * 0.9 + ph));
      var col = i % 5 === 0 ? C.red : i % 3 === 0 ? C.goldLight : C.ember;
      ctx.globalAlpha = a;
      var g = ctx.createRadialGradient(x, y, rad * 0.1, x, y, rad);
      g.addColorStop(0, U.rgba(col, 0.55));
      g.addColorStop(0.72, U.rgba(col, 0.32));
      g.addColorStop(0.92, U.rgba(col, 0.1));
      g.addColorStop(1, U.rgba(col, 0));
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(x, y, rad, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
  };

  T.Fx = Fx;
})(window.TATA = window.TATA || {});
