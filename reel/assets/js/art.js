/* art.js — pintores procedurales de la escenografía.
   Todo es vectorial y determinista: cielo, cerros, ramada, guirnaldas,
   luces de fonda, gente, parrilla, comida, tragos y letrero de marca. */
(function (T) {
  'use strict';
  var U = T.U, C = U.C, G = T.G, Fx = T.Fx;
  var A = {};
  var W = U.W, H = U.H;

  /* ================= CIELO ================= */
  A.sky = function (ctx, t, o) {
    o = o || {};
    var horizon = o.horizon === undefined ? H * 0.58 : o.horizon;
    var g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0.00, o.top || '#050A14');
    g.addColorStop(0.20, o.high || '#0B1A30');
    g.addColorStop(0.40, o.mid || '#2A2340');
    g.addColorStop(0.53, o.low || '#7C3B2A');
    g.addColorStop(0.60, o.warm || '#C9682C');
    g.addColorStop(0.66, o.hot || '#F0A85A');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);

    /* estrellas */
    var r = U.rng(31);
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    for (var i = 0; i < 90; i++) {
      var x = r() * W, y = r() * horizon * 0.72, ph = r() * 10;
      var a = (0.25 + 0.6 * Math.pow(U.fbm1(t * 0.8 + ph * 4), 2)) * (1 - y / (horizon * 0.8));
      ctx.globalAlpha = U.clamp(a, 0, 1) * (o.stars === undefined ? 1 : o.stars);
      ctx.fillStyle = '#FFF6E2';
      ctx.beginPath(); ctx.arc(x, y, r() * 1.9 + 0.7, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();

    /* nubes largas en contraluz */
    ctx.save();
    ctx.globalCompositeOperation = 'source-over';
    var r2 = U.rng(88);
    for (var k = 0; k < 7; k++) {
      var cy = horizon - 40 - r2() * horizon * 0.5;
      var cx = (r2() * 1.4 - 0.2) * W + Math.sin(t * 0.02 + k) * 18;
      var cw = 200 + r2() * 480, ch = 12 + r2() * 26;
      ctx.globalAlpha = 0.10 + r2() * 0.14;
      ctx.filter = 'blur(' + (10 + r2() * 16).toFixed(1) + 'px)';
      var cg = ctx.createLinearGradient(cx - cw / 2, cy, cx + cw / 2, cy);
      cg.addColorStop(0, 'rgba(255,170,90,0)');
      cg.addColorStop(0.5, 'rgba(255,186,110,0.85)');
      cg.addColorStop(1, 'rgba(255,170,90,0)');
      ctx.fillStyle = cg;
      ctx.beginPath(); ctx.ellipse(cx, cy, cw / 2, ch, 0, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();

    /* resplandor del horizonte */
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    U.glow(ctx, W * 0.5, horizon + 30, W * 0.95, C.ember, 0.34);
    ctx.restore();
  };

  /* ================= CERROS / COSTA ================= */
  function ridge(ctx, baseY, amp, seed, color, alpha, blur) {
    var r = U.rng(seed);
    ctx.save();
    if (blur) ctx.filter = 'blur(' + blur + 'px)';
    ctx.globalAlpha = alpha === undefined ? 1 : alpha;
    ctx.beginPath();
    ctx.moveTo(-40, H + 10);
    var steps = 26;
    for (var i = 0; i <= steps; i++) {
      var u = i / steps;
      var y = baseY - (U.fbm1(u * 3.2 + seed, 3) - 0.35) * amp - Math.sin(u * 5.2 + seed) * amp * 0.22;
      ctx.lineTo(u * (W + 80) - 40, y);
    }
    ctx.lineTo(W + 40, H + 10);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
    ctx.restore();
  }

  A.hills = function (ctx, t, horizon, px) {
    px = px || 0;
    ctx.save(); ctx.translate(px * 0.25, 0);
    ridge(ctx, horizon - 6, 120, 3.1, '#2B2036', 0.9, 6);
    ctx.restore();
    ctx.save(); ctx.translate(px * 0.5, 0);
    ridge(ctx, horizon + 26, 92, 7.7, '#1A1526', 0.95, 3);
    ctx.restore();
    ctx.save(); ctx.translate(px * 0.8, 0);
    ridge(ctx, horizon + 74, 62, 12.4, '#0E0C16', 1, 0);
    ctx.restore();
  };

  /* ================= MADERA ================= */
  A.wood = function (ctx, x, y, w, h, seed, opts) {
    opts = opts || {};
    var r = U.rng(seed);
    var g = ctx.createLinearGradient(x, y, x, y + h);
    g.addColorStop(0, opts.top || '#8A5228');
    g.addColorStop(0.42, opts.mid || '#5E3318');
    g.addColorStop(1, opts.bot || '#36190B');
    ctx.save();
    ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
    ctx.fillStyle = g; ctx.fillRect(x, y, w, h);
    /* veta */
    ctx.globalAlpha = 0.16;
    ctx.strokeStyle = '#2A1208';
    for (var i = 0; i < 22; i++) {
      ctx.lineWidth = 0.8 + r() * 2.6;
      ctx.beginPath();
      var yy = y + r() * h;
      ctx.moveTo(x, yy);
      for (var k = 0; k <= 6; k++) ctx.lineTo(x + (k / 6) * w, yy + Math.sin(k * 1.7 + r() * 6) * h * 0.035);
      ctx.stroke();
    }
    /* luz superior */
    ctx.globalAlpha = 0.22;
    var lg = ctx.createLinearGradient(x, y, x, y + h * 0.3);
    lg.addColorStop(0, 'rgba(255,205,140,0.8)');
    lg.addColorStop(1, 'rgba(255,205,140,0)');
    ctx.fillStyle = lg; ctx.fillRect(x, y, w, h * 0.3);
    ctx.restore();
  };

  /* ================= RAMADA / FONDA ================= */
  A.ramada = function (ctx, t, o) {
    o = o || {};
    var baseY = o.baseY === undefined ? H * 0.80 : o.baseY;
    var topY = o.topY === undefined ? H * 0.40 : o.topY;
    var left = o.left === undefined ? -60 : o.left;
    var right = o.right === undefined ? W + 60 : o.right;

    /* interior cálido brillando bajo el techo */
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    U.glow(ctx, W * 0.5, topY + (baseY - topY) * 0.62, W * 0.72, C.ember, 0.30);
    U.glow(ctx, W * 0.24, topY + (baseY - topY) * 0.74, W * 0.34, C.goldLight, 0.22);
    U.glow(ctx, W * 0.78, topY + (baseY - topY) * 0.70, W * 0.30, C.gold, 0.2);
    ctx.restore();

    /* techo de totora / ramas */
    var roofH = 108;
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(left, topY + roofH);
    ctx.lineTo(left, topY + 22);
    ctx.lineTo(W * 0.5, topY - 44);
    ctx.lineTo(right, topY + 22);
    ctx.lineTo(right, topY + roofH);
    ctx.closePath();
    ctx.clip();
    var rg = ctx.createLinearGradient(0, topY - 44, 0, topY + roofH);
    rg.addColorStop(0, '#3A2412');
    rg.addColorStop(0.55, '#24150A');
    rg.addColorStop(1, '#140B05');
    ctx.fillStyle = rg;
    ctx.fillRect(left, topY - 60, right - left, roofH + 80);
    /* pajas */
    var r = U.rng(451);
    ctx.globalAlpha = 0.5;
    for (var i = 0; i < 190; i++) {
      var x = left + r() * (right - left);
      var yy = topY - 30 + r() * (roofH + 40);
      ctx.strokeStyle = r() > 0.72 ? 'rgba(180,120,60,0.55)' : 'rgba(60,34,16,0.8)';
      ctx.lineWidth = 1 + r() * 2.4;
      ctx.beginPath();
      ctx.moveTo(x, yy);
      ctx.lineTo(x + (r() - 0.5) * 26, yy + 18 + r() * 34);
      ctx.stroke();
    }
    ctx.restore();

    /* borde iluminado del alero */
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    ctx.globalAlpha = 0.5;
    ctx.strokeStyle = U.rgba(C.ember, 0.75);
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(left, topY + roofH); ctx.lineTo(right, topY + roofH);
    ctx.stroke();
    ctx.restore();

    /* pilares */
    var posts = o.posts || [0.055, 0.34, 0.66, 0.945];
    for (var p = 0; p < posts.length; p++) {
      var px = posts[p] * W;
      var pw = 26;
      A.wood(ctx, px - pw / 2, topY + roofH - 8, pw, baseY - topY - roofH + 30, 900 + p * 13,
        { top: '#331C0C', mid: '#1C0F06', bot: '#0B0603' });
      /* contraluz mínimo en el canto */
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      ctx.globalAlpha = 0.18;
      ctx.fillStyle = U.rgba(C.ember, 0.7);
      ctx.fillRect(px + pw / 2 - 3, topY + roofH - 8, 3, baseY - topY - roofH + 30);
      ctx.restore();
    }

    /* piso de tierra */
    var fg = ctx.createLinearGradient(0, baseY - 20, 0, H);
    fg.addColorStop(0, '#2A1A10');
    fg.addColorStop(0.35, '#1A0F08');
    fg.addColorStop(1, '#0A0503');
    ctx.fillStyle = fg;
    ctx.fillRect(0, baseY - 20, W, H - baseY + 20);
    /* reflejo cálido en el piso */
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    ctx.globalAlpha = 0.28;
    var rf = ctx.createLinearGradient(0, baseY - 10, 0, baseY + 260);
    rf.addColorStop(0, U.rgba(C.ember, 0.55));
    rf.addColorStop(1, U.rgba(C.ember, 0));
    ctx.fillStyle = rf;
    ctx.fillRect(0, baseY - 10, W, 280);
    ctx.restore();
  };

  /* ================= GUIRNALDAS ================= */
  /* Guirnalda de banderines triangulares tricolor. */
  A.bunting = function (ctx, t, o) {
    o = o || {};
    var x0 = o.x0 === undefined ? -70 : o.x0;
    var x1 = o.x1 === undefined ? W + 70 : o.x1;
    var y0 = o.y0 === undefined ? H * 0.20 : o.y0;
    var y1 = o.y1 === undefined ? H * 0.17 : o.y1;
    var sag = o.sag === undefined ? 150 : o.sag;
    var n = o.count || 15;
    var sw = o.sway === undefined ? 1 : o.sway;
    var size = o.size || 74;
    var cols = o.colors || [C.red, C.cream, '#1D4F9E'];

    function pt(u) {
      var x = U.lerp(x0, x1, u);
      var y = U.lerp(y0, y1, u) + Math.sin(Math.PI * u) * sag
        + Math.sin(t * 1.25 + u * 3.4 + (o.phase || 0)) * 13 * sw * Math.sin(Math.PI * u);
      return [x, y];
    }

    /* cuerda */
    ctx.save();
    ctx.strokeStyle = o.rope || 'rgba(30,18,10,0.92)';
    ctx.lineWidth = o.ropeW || 5;
    ctx.beginPath();
    for (var i = 0; i <= 60; i++) {
      var q = pt(i / 60);
      if (i === 0) ctx.moveTo(q[0], q[1]); else ctx.lineTo(q[0], q[1]);
    }
    ctx.stroke();
    ctx.restore();

    for (var k = 0; k < n; k++) {
      var u = (k + 0.5) / n;
      var a = pt(u), b = pt(Math.min(1, u + 1 / n * 0.8));
      var ang = Math.atan2(b[1] - a[1], b[0] - a[0]);
      var flap = Math.sin(t * 2.6 + k * 0.8) * 0.13 * sw;
      ctx.save();
      ctx.translate(a[0], a[1]);
      ctx.rotate(ang * 0.55 + flap);
      var col = cols[k % cols.length];
      var wd = size * 0.62;
      /* banderín */
      ctx.beginPath();
      ctx.moveTo(-wd / 2, 0);
      ctx.lineTo(wd / 2, 0);
      ctx.lineTo(Math.sin(flap * 2) * 8, size);
      ctx.closePath();
      ctx.fillStyle = col;
      ctx.fill();
      /* sombra de pliegue */
      ctx.globalAlpha = 0.28 + 0.22 * Math.sin(t * 2.6 + k * 0.8 + 1.2);
      ctx.fillStyle = 'rgba(0,0,0,0.85)';
      ctx.beginPath();
      ctx.moveTo(0, 0); ctx.lineTo(wd / 2, 0); ctx.lineTo(Math.sin(flap * 2) * 8, size);
      ctx.closePath(); ctx.fill();
      ctx.globalAlpha = 1;
      /* luz superior */
      ctx.globalCompositeOperation = 'screen';
      ctx.globalAlpha = 0.2;
      ctx.fillStyle = U.rgba(C.emberHot, 0.6);
      ctx.fillRect(-wd / 2, 0, wd, 5);
      ctx.restore();
    }
  };

  /* Guirnalda de banderas chilenas rectangulares. */
  A.flagLine = function (ctx, t, o) {
    o = o || {};
    var x0 = o.x0 === undefined ? -60 : o.x0, x1 = o.x1 === undefined ? W + 60 : o.x1;
    var y0 = o.y0 === undefined ? H * 0.12 : o.y0, y1 = o.y1 === undefined ? H * 0.14 : o.y1;
    var sag = o.sag === undefined ? 90 : o.sag;
    var n = o.count || 7, size = o.size || 92;
    function pt(u) {
      return [U.lerp(x0, x1, u), U.lerp(y0, y1, u) + Math.sin(Math.PI * u) * sag + Math.sin(t * 1.1 + u * 3) * 9 * Math.sin(Math.PI * u)];
    }
    ctx.save();
    ctx.strokeStyle = 'rgba(28,16,9,0.9)'; ctx.lineWidth = 4;
    ctx.beginPath();
    for (var i = 0; i <= 50; i++) { var q = pt(i / 50); if (i === 0) ctx.moveTo(q[0], q[1]); else ctx.lineTo(q[0], q[1]); }
    ctx.stroke();
    ctx.restore();
    for (var k = 0; k < n; k++) {
      var u = (k + 0.5) / n, a = pt(u);
      ctx.save();
      ctx.translate(a[0], a[1] + size * 0.5);
      ctx.rotate(Math.sin(t * 1.8 + k) * 0.05);
      G.flag(ctx, 0, 0, size, t * 0.55 + k * 0.7, 0.85);
      ctx.restore();
    }
  };

  /* ================= LUCES DE FONDA ================= */
  A.stringLights = function (ctx, t, o) {
    o = o || {};
    var x0 = o.x0 === undefined ? -60 : o.x0, x1 = o.x1 === undefined ? W + 60 : o.x1;
    var y0 = o.y0 === undefined ? H * 0.30 : o.y0, y1 = o.y1 === undefined ? H * 0.27 : o.y1;
    var sag = o.sag === undefined ? 170 : o.sag;
    var n = o.count || 17;
    var on = o.on === undefined ? 1 : o.on;   /* 0..1 encendido progresivo */
    var scale = o.scale || 1;
    function pt(u) {
      return [U.lerp(x0, x1, u), U.lerp(y0, y1, u) + Math.sin(Math.PI * u) * sag + Math.sin(t * 0.9 + u * 2.6 + (o.phase || 0)) * 10 * Math.sin(Math.PI * u)];
    }
    /* cable */
    ctx.save();
    ctx.strokeStyle = 'rgba(20,12,7,0.95)';
    ctx.lineWidth = 3.4 * scale;
    ctx.beginPath();
    for (var i = 0; i <= 60; i++) { var q = pt(i / 60); if (i === 0) ctx.moveTo(q[0], q[1]); else ctx.lineTo(q[0], q[1]); }
    ctx.stroke();
    ctx.restore();

    for (var k = 0; k < n; k++) {
      var u = (k + 0.5) / n, p = pt(u);
      var lit = U.clamp((on * n - k) * 1.4, 0, 1);
      if (lit <= 0.01) continue;
      var flick = 0.78 + 0.22 * U.fbm1(t * 2.4 + k * 3.7, 2);
      var a = lit * flick;
      var bx = p[0], by = p[1] + 20 * scale;
      /* casquillo */
      ctx.save();
      ctx.fillStyle = '#1A1009';
      U.rrect(ctx, bx - 5 * scale, p[1] + 2 * scale, 10 * scale, 12 * scale, 3 * scale);
      ctx.fill();
      /* ampolleta */
      ctx.globalCompositeOperation = 'screen';
      ctx.globalAlpha = a;
      U.glow(ctx, bx, by, 62 * scale, k % 4 === 0 ? C.goldLight : C.ember, 0.55);
      ctx.globalAlpha = a;
      var bg = ctx.createRadialGradient(bx - 3 * scale, by - 4 * scale, 1, bx, by, 13 * scale);
      bg.addColorStop(0, '#FFFDF2');
      bg.addColorStop(0.5, '#FFD98F');
      bg.addColorStop(1, '#E08A2A');
      ctx.fillStyle = bg;
      ctx.beginPath(); ctx.ellipse(bx, by, 11 * scale, 14 * scale, 0, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    }
  };

  /* ================= GENTE ================= */
  function person(ctx, x, y, h, seed, t, opts) {
    opts = opts || {};
    var r = U.rng(seed);
    var bob = Math.sin(t * (1.4 + r() * 1.2) + seed) * h * 0.012;
    var lean = Math.sin(t * 0.7 + seed) * 0.03;
    ctx.save();
    ctx.translate(x, y + bob);
    ctx.rotate(lean);
    ctx.fillStyle = opts.color || 'rgba(8,5,3,0.94)';
    var hw = h * 0.15;
    /* piernas */
    var step = Math.sin(t * 1.9 + seed) * hw * 0.28;
    ctx.beginPath();
    ctx.moveTo(-hw * 0.62 - step, 0); ctx.lineTo(-hw * 0.16 - step * 0.3, 0);
    ctx.lineTo(-hw * 0.05, -h * 0.46); ctx.lineTo(-hw * 0.52, -h * 0.46);
    ctx.closePath(); ctx.fill();
    ctx.beginPath();
    ctx.moveTo(hw * 0.16 + step * 0.3, 0); ctx.lineTo(hw * 0.62 + step, 0);
    ctx.lineTo(hw * 0.52, -h * 0.46); ctx.lineTo(hw * 0.05, -h * 0.46);
    ctx.closePath(); ctx.fill();
    /* cadera */
    ctx.beginPath();
    ctx.moveTo(-hw * 0.6, -h * 0.40); ctx.lineTo(hw * 0.6, -h * 0.40);
    ctx.lineTo(hw * 0.52, -h * 0.5); ctx.lineTo(-hw * 0.52, -h * 0.5);
    ctx.closePath(); ctx.fill();
    /* torso */
    ctx.beginPath();
    ctx.moveTo(-hw * 0.82, -h * 0.42);
    ctx.quadraticCurveTo(-hw * 1.05, -h * 0.72, -hw * 0.72, -h * 0.80);
    ctx.lineTo(hw * 0.72, -h * 0.80);
    ctx.quadraticCurveTo(hw * 1.05, -h * 0.72, hw * 0.82, -h * 0.42);
    ctx.closePath(); ctx.fill();
    /* cabeza */
    /* cuello */
    ctx.fillRect(-h * 0.026, -h * 0.85, h * 0.052, h * 0.06);
    ctx.beginPath();
    ctx.arc(0, -h * 0.895, h * 0.078, 0, Math.PI * 2); ctx.fill();
    /* brazos */
    ctx.lineCap = 'round';
    ctx.strokeStyle = opts.color || 'rgba(8,5,3,0.94)';
    ctx.lineWidth = h * 0.055;
    var raise = opts.raise === undefined ? (r() > 0.68 ? 1 : 0) : opts.raise;
    var aw = Math.sin(t * 2.3 + seed) * 0.25;
    ctx.beginPath();
    ctx.moveTo(-hw * 0.78, -h * 0.74);
    if (raise) ctx.lineTo(-hw * 1.5 - Math.sin(aw) * 10, -h * (1.02 + 0.03 * Math.sin(t * 3 + seed)));
    else ctx.lineTo(-hw * 1.25, -h * 0.45);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(hw * 0.78, -h * 0.74);
    if (raise) ctx.lineTo(hw * 1.5 + Math.sin(aw) * 10, -h * (1.02 + 0.03 * Math.cos(t * 3 + seed)));
    else ctx.lineTo(hw * 1.25, -h * 0.45);
    ctx.stroke();
    ctx.restore();
  }
  A.person = person;

  /* Pareja bailando cueca con pañuelos. */
  A.cuecaPair = function (ctx, x, y, h, t, seed) {
    var sway = Math.sin(t * 2.0 + seed) * h * 0.06;
    var turn = Math.sin(t * 1.0 + seed) * 0.12;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(turn * 0.1);
    /* él */
    ctx.save();
    ctx.translate(-h * 0.24 + sway * 0.5, 0);
    person(ctx, 0, 0, h, seed + 1, t, { raise: 1 });
    /* pañuelo */
    A.panuelo(ctx, -h * 0.28, -h * 1.02, h * 0.085, t * 1.6 + seed);
    ctx.restore();
    /* ella (falda) */
    ctx.save();
    ctx.translate(h * 0.26 - sway * 0.5, 0);
    ctx.fillStyle = 'rgba(8,5,3,0.94)';
    var hw = h * 0.15;
    /* falda */
    var flare = 1 + Math.sin(t * 2.2 + seed) * 0.18;
    ctx.beginPath();
    ctx.moveTo(-hw * 0.6, -h * 0.46);
    ctx.quadraticCurveTo(-hw * 2.0 * flare, -h * 0.1, -hw * 1.7 * flare, 0);
    ctx.lineTo(hw * 1.7 * flare, 0);
    ctx.quadraticCurveTo(hw * 2.0 * flare, -h * 0.1, hw * 0.6, -h * 0.46);
    ctx.closePath(); ctx.fill();
    /* torso + cabeza + brazos */
    ctx.beginPath();
    ctx.moveTo(-hw * 0.72, -h * 0.44);
    ctx.quadraticCurveTo(-hw * 0.95, -h * 0.72, -hw * 0.62, -h * 0.80);
    ctx.lineTo(hw * 0.62, -h * 0.80);
    ctx.quadraticCurveTo(hw * 0.95, -h * 0.72, hw * 0.72, -h * 0.44);
    ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.arc(0, -h * 0.885, h * 0.08, 0, Math.PI * 2); ctx.fill();
    /* moño */
    ctx.beginPath(); ctx.arc(h * 0.055, -h * 0.93, h * 0.035, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = 'rgba(8,5,3,0.94)'; ctx.lineWidth = h * 0.05; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(hw * 0.7, -h * 0.74); ctx.lineTo(hw * 1.55, -h * 1.0); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-hw * 0.7, -h * 0.74); ctx.lineTo(-hw * 1.35, -h * 0.5); ctx.stroke();
    A.panuelo(ctx, hw * 1.55, -h * 1.0, h * 0.08, t * 1.7 + seed + 2);
    ctx.restore();
    ctx.restore();
  };

  A.panuelo = function (ctx, x, y, s, ph) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(Math.sin(ph) * 0.5);
    ctx.fillStyle = 'rgba(250,244,232,0.93)';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(s * 0.7, -s * 0.5 + Math.sin(ph * 1.7) * s * 0.25, s * 1.5, -s * 0.1);
    ctx.quadraticCurveTo(s * 0.9, s * 0.5, 0, s * 0.35);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  };

  /* Multitud en silueta a distintas profundidades. */
  A.crowd = function (ctx, t, o) {
    o = o || {};
    var baseY = o.baseY === undefined ? H * 0.80 : o.baseY;
    var r = U.rng(o.seed || 61);
    var n = o.count || 13;
    ctx.save();
    if (o.blur) ctx.filter = 'blur(' + o.blur + 'px)';
    ctx.globalAlpha = o.alpha === undefined ? 1 : o.alpha;
    for (var i = 0; i < n; i++) {
      var depth = r();
      var x = (o.x0 === undefined ? -0.05 : o.x0) * W + r() * ((o.x1 === undefined ? 1.1 : o.x1) - (o.x0 === undefined ? -0.05 : o.x0)) * W;
      var h = (o.h || 210) * (0.72 + depth * 0.55) * (o.scale || 1);
      var y = baseY + depth * (o.spread === undefined ? 62 : o.spread);
      var drift = o.walk ? Math.sin(t * 0.35 + i * 2.1) * 34 : 0;
      person(ctx, x + drift, y, h, 100 + i * 7, t);
    }
    ctx.restore();
  };

  /* Guitarrista en silueta. */
  A.guitarist = function (ctx, x, y, h, t, seed) {
    ctx.save();
    ctx.translate(x, y);
    var strum = Math.sin(t * 7.2 + seed) * 0.13;
    person(ctx, 0, 0, h, seed, t, { raise: 0 });
    ctx.fillStyle = 'rgba(8,5,3,0.96)';
    ctx.save();
    ctx.translate(h * 0.16, -h * 0.52);
    ctx.rotate(-0.42);
    ctx.beginPath();
    ctx.ellipse(0, 0, h * 0.082, h * 0.10, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath();
    ctx.ellipse(0, -h * 0.125, h * 0.066, h * 0.076, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillRect(-h * 0.012, -h * 0.40, h * 0.024, h * 0.29);
    U.rrect(ctx, -h * 0.026, -h * 0.435, h * 0.052, h * 0.045, h * 0.012); ctx.fill();
    ctx.restore();
    /* brazo rasgueando */
    ctx.strokeStyle = 'rgba(8,5,3,0.96)';
    ctx.lineWidth = h * 0.055; ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(h * 0.10, -h * 0.74);
    ctx.lineTo(h * 0.22, -h * 0.50 + strum * h * 0.4);
    ctx.stroke();
    ctx.restore();
  };

  /* ================= MESA Y COMIDA ================= */
  A.board = function (ctx, x, y, w, h, seed) {
    var r = U.rng(seed);
    /* sombra bajo la mesa */
    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.85)';
    ctx.shadowBlur = 60; ctx.shadowOffsetY = 26;
    U.rrect(ctx, x, y, w, h, 20);
    ctx.fillStyle = '#2C1608';
    ctx.fill();
    ctx.restore();

    ctx.save();
    U.rrect(ctx, x, y, w, h, 20); ctx.clip();

    /* tablones */
    var planks = 5;
    for (var i = 0; i < planks; i++) {
      var py = y + 18 + (i / planks) * (h - 18);
      var ph = (h - 18) / planks;
      A.wood(ctx, x, py, w, ph + 1, seed + i * 31, {
        top: i % 2 ? '#6A3C1B' : '#5E3417',
        mid: '#3E2110',
        bot: '#201007'
      });
      /* junta entre tablones */
      ctx.globalAlpha = 0.55;
      ctx.fillStyle = 'rgba(12,6,3,0.9)';
      ctx.fillRect(x, py - 2, w, 3);
      ctx.globalAlpha = 1;
    }

    /* oscurecer hacia el fondo y hacia los bordes */
    var sh = ctx.createLinearGradient(0, y, 0, y + h);
    sh.addColorStop(0, 'rgba(0,0,0,0.55)');
    sh.addColorStop(0.28, 'rgba(0,0,0,0.05)');
    sh.addColorStop(1, 'rgba(0,0,0,0.62)');
    ctx.fillStyle = sh; ctx.fillRect(x, y, w, h);
    var sv = ctx.createLinearGradient(x, 0, x + w, 0);
    sv.addColorStop(0, 'rgba(0,0,0,0.6)');
    sv.addColorStop(0.5, 'rgba(0,0,0,0)');
    sv.addColorStop(1, 'rgba(0,0,0,0.6)');
    ctx.fillStyle = sv; ctx.fillRect(x, y, w, h);
    ctx.restore();

    /* canto frontal iluminado por las luces de la fonda */
    ctx.save();
    var lip = ctx.createLinearGradient(0, y, 0, y + 22);
    lip.addColorStop(0, U.rgba(C.emberHot, 0.55));
    lip.addColorStop(1, U.rgba(C.ember, 0));
    ctx.globalCompositeOperation = 'screen';
    ctx.fillStyle = lip;
    ctx.fillRect(x, y, w, 24);
    ctx.restore();
  };

  /* Empanada dorada (media luna con repulgue). */
  A.pastry = function (ctx, x, y, s, rot, seed) {
    var r = U.rng(seed);
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot || 0);
    ctx.scale(s, s);

    /* sombra de contacto, corta y oscura */
    ctx.save();
    ctx.globalAlpha = 0.8;
    ctx.filter = 'blur(12px)';
    ctx.fillStyle = 'rgba(0,0,0,0.95)';
    ctx.beginPath(); ctx.ellipse(4, 40, 88, 15, 0, 0, Math.PI * 2); ctx.fill();
    ctx.restore();

    function bodyPath() {
      ctx.beginPath();
      ctx.moveTo(-96, 20);
      ctx.bezierCurveTo(-86, -62, 86, -62, 96, 20);
      ctx.quadraticCurveTo(0, 50, -96, 20);
      ctx.closePath();
    }

    /* repulgue: arcos superpuestos en el borde inferior */
    for (var i = 0; i <= 10; i++) {
      var u = i / 10;
      var px = U.lerp(-94, 94, u);
      var py = 20 + Math.sin(u * Math.PI) * 24;
      ctx.beginPath();
      ctx.ellipse(px, py, 15, 12, Math.cos(u * Math.PI) * -0.5, 0, Math.PI * 2);
      var cg = ctx.createLinearGradient(px - 12, py - 12, px + 10, py + 12);
      cg.addColorStop(0, '#D89A43');
      cg.addColorStop(0.55, '#A96324');
      cg.addColorStop(1, '#5E3010');
      ctx.fillStyle = cg;
      ctx.fill();
    }

    /* cuerpo */
    bodyPath();
    var g = ctx.createLinearGradient(-50, -58, 40, 44);
    g.addColorStop(0, '#F8C976');
    g.addColorStop(0.2, '#E29B41');
    g.addColorStop(0.5, '#BC6C26');
    g.addColorStop(0.78, '#7E4113');
    g.addColorStop(1, '#4A2409');
    ctx.fillStyle = g;
    ctx.fill();

    /* textura: ampollas tostadas del horno */
    ctx.save();
    bodyPath(); ctx.clip();
    for (var k = 0; k < 14; k++) {
      var bx = -84 + r() * 168, by = -46 + r() * 74;
      ctx.globalAlpha = 0.24 + r() * 0.28;
      ctx.filter = 'blur(' + (3 + r() * 5).toFixed(1) + 'px)';
      ctx.beginPath();
      ctx.ellipse(bx, by, 7 + r() * 17, 4 + r() * 9, r() * 3, 0, Math.PI * 2);
      ctx.fillStyle = r() > 0.45 ? '#6E3810' : '#FFD48C';
      ctx.fill();
    }
    /* sombra bajo el borde superior */
    ctx.filter = 'none';
    ctx.globalAlpha = 0.5;
    var us = ctx.createLinearGradient(0, 4, 0, 46);
    us.addColorStop(0, 'rgba(60,26,6,0)');
    us.addColorStop(1, 'rgba(48,20,4,0.95)');
    ctx.fillStyle = us;
    ctx.fillRect(-100, 0, 200, 52);
    ctx.restore();

    /* brillo especular del dorado */
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    ctx.globalAlpha = 0.3;
    ctx.filter = 'blur(9px)';
    ctx.beginPath();
    ctx.ellipse(-28, -32, 32, 10, -0.3, 0, Math.PI * 2);
    ctx.fillStyle = '#FFE6B4';
    ctx.fill();
    ctx.globalAlpha = 0.62;
    ctx.filter = 'blur(2px)';
    ctx.beginPath();
    ctx.ellipse(-36, -35, 13, 4, -0.32, 0, Math.PI * 2);
    ctx.fillStyle = '#FFF4DC';
    ctx.fill();
    ctx.restore();

    /* luz de contra en el borde superior */
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    ctx.globalAlpha = 0.4;
    ctx.lineWidth = 4;
    ctx.strokeStyle = U.rgba(C.emberHot, 0.8);
    ctx.beginPath();
    ctx.moveTo(-88, 6);
    ctx.bezierCurveTo(-80, -56, 80, -56, 88, 6);
    ctx.stroke();
    ctx.restore();

    ctx.restore();
  };

  /* Parrilla con brasas, carnes y humo. */
  A.grill = function (ctx, t, o) {
    o = o || {};
    var cx = o.x === undefined ? W / 2 : o.x;
    var cy = o.y === undefined ? H * 0.58 : o.y;
    var w = o.w || W * 0.92, h = o.h || 280;
    var r = U.rng(o.seed || 909);

    /* caja metálica */
    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.9)'; ctx.shadowBlur = 70; ctx.shadowOffsetY = 30;
    U.rrect(ctx, cx - w / 2, cy - h / 2, w, h, 20);
    ctx.fillStyle = '#17100C'; ctx.fill();
    ctx.restore();
    ctx.save();
    ctx.strokeStyle = 'rgba(150,110,80,0.35)'; ctx.lineWidth = 5;
    U.rrect(ctx, cx - w / 2 + 3, cy - h / 2 + 3, w - 6, h - 6, 18);
    ctx.stroke();
    ctx.restore();

    /* lecho de brasas */
    ctx.save();
    U.rrect(ctx, cx - w / 2 + 14, cy - h / 2 + 14, w - 28, h - 28, 12);
    ctx.clip();
    ctx.fillStyle = '#040201';
    ctx.fillRect(cx - w / 2, cy - h / 2, w, h);

    /* núcleo caliente al centro */
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    var core = ctx.createRadialGradient(cx, cy, 10, cx, cy, w * 0.52);
    core.addColorStop(0, U.rgba(C.ember, 0.13));
    core.addColorStop(0.45, U.rgba(C.ember, 0.07));
    core.addColorStop(1, U.rgba('#3A0C00', 0));
    ctx.fillStyle = core;
    ctx.fillRect(cx - w / 2, cy - h / 2, w, h);
    ctx.restore();

    /* carbones individuales */
    for (var i = 0; i < 40; i++) {
      var ex = cx - w / 2 + 24 + r() * (w - 48);
      var ey = cy - h / 2 + 24 + r() * (h - 48);
      var dCen = 1 - U.clamp(Math.abs(ex - cx) / (w * 0.5), 0, 1) * 0.65;
      var heat = U.clamp((0.2 + 0.8 * U.fbm1(t * 1.5 + i * 2.7, 2)) * dCen, 0, 1);
      var rad = 16 + r() * 34;
      /* carbón apagado */
      ctx.globalAlpha = 0.9;
      ctx.fillStyle = '#1A0E07';
      ctx.beginPath(); ctx.ellipse(ex, ey, rad * 0.55, rad * 0.38, r() * 3, 0, Math.PI * 2); ctx.fill();
      /* rescoldo encendido */
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      ctx.globalAlpha = heat * 0.5;
      U.glow(ctx, ex, ey, rad * 1.05, heat > 0.72 ? C.emberHot : C.ember, 0.55);
      ctx.globalAlpha = heat * 0.95;
      ctx.fillStyle = U.mixHex('#4A1503', '#FFD089', Math.pow(heat, 0.8));
      ctx.beginPath(); ctx.ellipse(ex, ey, rad * 0.30, rad * 0.19, r() * 3, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
      ctx.globalAlpha = 1;
    }

    /* ceniza */
    ctx.globalAlpha = 0.09;
    for (var a = 0; a < 20; a++) {
      ctx.fillStyle = '#C9B7A4';
      ctx.beginPath();
      ctx.ellipse(cx - w / 2 + r() * w, cy - h / 2 + r() * h, 6 + r() * 16, 3 + r() * 7, r() * 3, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    ctx.restore();

    /* rejilla: pocas barras y gruesas, con brillo metálico */
    ctx.save();
    var bars = 7;
    for (var b = 0; b < bars; b++) {
      var by = cy - h / 2 + 34 + (b / (bars - 1)) * (h - 68);
      ctx.strokeStyle = 'rgba(10,7,5,0.96)';
      ctx.lineWidth = 13;
      ctx.beginPath(); ctx.moveTo(cx - w / 2 + 16, by); ctx.lineTo(cx + w / 2 - 16, by); ctx.stroke();
      ctx.strokeStyle = 'rgba(255,186,120,0.30)';
      ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(cx - w / 2 + 16, by - 4.5); ctx.lineTo(cx + w / 2 - 16, by - 4.5); ctx.stroke();
    }
    ctx.restore();

    /* carnes sobre la rejilla */
    var meats = o.meats || [[-0.29, -0.26, 1.15, 0.10], [0.04, -0.31, 1.05, -0.16],
    [0.32, -0.16, 1.08, 0.2], [-0.30, 0.06, 1.2, -0.1], [-0.02, 0.02, 1.1, 0.16],
    [0.30, 0.12, 1.05, -0.2], [-0.16, 0.30, 1.0, 0.24], [0.17, 0.32, 0.95, -0.12]];
    for (var m = 0; m < meats.length; m++) {
      A.meat(ctx, cx + meats[m][0] * w, cy + meats[m][1] * h,
        meats[m][2] * (o.meatScale || 1), meats[m][3], 300 + m * 11, t);
    }

    /* viñeta interior de la parrilla */
    ctx.save();
    U.rrect(ctx, cx - w / 2, cy - h / 2, w, h, 20); ctx.clip();
    var vg = ctx.createRadialGradient(cx, cy, h * 0.15, cx, cy, w * 0.62);
    vg.addColorStop(0, 'rgba(0,0,0,0)');
    vg.addColorStop(1, 'rgba(0,0,0,0.72)');
    ctx.fillStyle = vg;
    ctx.fillRect(cx - w / 2, cy - h / 2, w, h);
    ctx.restore();

    /* humo y calor */
    Fx.smoke(ctx, t, cx, cy - h * 0.3, { count: 10, spread: w * 0.8, rise: 560, size: 120, alpha: 0.075, seed: 66, color: '#FFCF9A' });
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    U.glow(ctx, cx, cy - h * 0.06, w * 0.42, C.ember, 0.16);
    ctx.restore();
  };

  /* Corte a la parrilla: se dibuja con grosor (cara superior + canto)
     para que lea como una pieza real y no como una mancha plana. */
  A.meat = function (ctx, x, y, s, rot, seed, t) {
    var r = U.rng(seed);
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);
    ctx.scale(s * (0.9 + r() * 0.22), s * (0.88 + r() * 0.26));

    /* sombra de contacto */
    ctx.save();
    ctx.globalAlpha = 0.9; ctx.filter = 'blur(11px)';
    ctx.fillStyle = 'rgba(0,0,0,0.95)';
    ctx.beginPath(); ctx.ellipse(4, 34, 74, 15, 0, 0, Math.PI * 2); ctx.fill();
    ctx.restore();

    /* contorno irregular, no una elipse */
    function shape(dy) {
      ctx.beginPath();
      ctx.moveTo(-76, -4 + dy);
      ctx.bezierCurveTo(-72, -32 + dy, -34, -42 + dy, 2, -38 + dy);
      ctx.bezierCurveTo(38, -34 + dy, 72, -30 + dy, 78, -6 + dy);
      ctx.bezierCurveTo(74, 16 + dy, 34, 26 + dy, -6, 24 + dy);
      ctx.bezierCurveTo(-42, 22 + dy, -74, 14 + dy, -76, -4 + dy);
      ctx.closePath();
    }

    /* canto (grosor de la carne) */
    shape(16);
    ctx.fillStyle = '#2A0E05';
    ctx.fill();

    /* cara superior */
    shape(0);
    var g = ctx.createLinearGradient(-60, -38, 50, 24);
    g.addColorStop(0, '#A85A28');
    g.addColorStop(0.28, '#7C3617');
    g.addColorStop(0.58, '#54200C');
    g.addColorStop(0.84, '#341207');
    g.addColorStop(1, '#1B0904');
    ctx.fillStyle = g; ctx.fill();

    ctx.save();
    shape(0); ctx.clip();

    /* marcas de parrilla, cruzadas */
    ctx.globalAlpha = 0.55;
    ctx.strokeStyle = '#150603'; ctx.lineWidth = 12;
    for (var i = -2; i <= 2; i++) {
      ctx.beginPath();
      ctx.moveTo(-100, i * 21 - 6); ctx.lineTo(100, i * 21 + 14); ctx.stroke();
    }
    ctx.globalAlpha = 0.2;
    ctx.lineWidth = 7;
    for (var j = -2; j <= 2; j++) {
      ctx.beginPath();
      ctx.moveTo(j * 34 - 20, -60); ctx.lineTo(j * 34 + 20, 60); ctx.stroke();
    }

    /* borde chamuscado */
    ctx.globalAlpha = 0.55;
    ctx.filter = 'blur(10px)';
    ctx.strokeStyle = '#0C0402'; ctx.lineWidth = 26;
    shape(0); ctx.stroke();
    ctx.filter = 'none';

    /* vetas de grasa */
    ctx.globalAlpha = 0.16;
    for (var v = 0; v < 4; v++) {
      ctx.strokeStyle = '#EACB9A'; ctx.lineWidth = 2 + r() * 3;
      ctx.beginPath();
      var vy = -28 + r() * 48;
      ctx.moveTo(-74, vy);
      ctx.bezierCurveTo(-20, vy + (r() - 0.5) * 16, 24, vy + (r() - 0.5) * 16, 74, vy + (r() - 0.5) * 10);
      ctx.stroke();
    }

    /* luz de las brasas subiendo por el canto inferior, difusa y recortada */
    ctx.globalCompositeOperation = 'screen';
    ctx.globalAlpha = 0.26;
    ctx.filter = 'blur(10px)';
    var rim = ctx.createLinearGradient(0, 28, 0, 4);
    rim.addColorStop(0, U.rgba(C.emberHot, 0.9));
    rim.addColorStop(1, U.rgba(C.ember, 0));
    ctx.fillStyle = rim;
    ctx.fillRect(-90, 2, 180, 30);
    ctx.restore();

    /* jugos brillantes */
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    ctx.globalAlpha = 0.26 + 0.1 * Math.sin((t || 0) * 2 + seed);
    ctx.filter = 'blur(7px)';
    ctx.beginPath(); ctx.ellipse(-16, -22, 26, 7, -0.22, 0, Math.PI * 2);
    ctx.fillStyle = '#FFC178'; ctx.fill();
    ctx.globalAlpha = 0.5;
    ctx.filter = 'blur(2px)';
    ctx.beginPath(); ctx.ellipse(-26, -27, 11, 3, -0.24, 0, Math.PI * 2);
    ctx.fillStyle = '#FFEBC8'; ctx.fill();
    ctx.globalAlpha = 0.45;
    ctx.beginPath(); ctx.ellipse(30, -14, 9, 2.6, 0.2, 0, Math.PI * 2);
    ctx.fillStyle = '#FFE0AE'; ctx.fill();
    ctx.restore();

    ctx.restore();
  };

  /* Vaso de trago tipo ponche/terremoto, con brindis opcional. */
  A.glass = function (ctx, x, y, s, t, seed, tilt) {
    var r = U.rng(seed);
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(tilt || 0);
    ctx.scale(s, s);
    /* sombra */
    ctx.save();
    ctx.globalAlpha = 0.55; ctx.filter = 'blur(14px)';
    ctx.fillStyle = 'rgba(0,0,0,0.9)';
    ctx.beginPath(); ctx.ellipse(0, 122, 68, 16, 0, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
    /* cuerpo del vaso */
    ctx.beginPath();
    ctx.moveTo(-54, -100);
    ctx.lineTo(54, -100);
    ctx.lineTo(40, 104);
    ctx.quadraticCurveTo(38, 116, 24, 116);
    ctx.lineTo(-24, 116);
    ctx.quadraticCurveTo(-38, 116, -40, 104);
    ctx.closePath();
    var gg = ctx.createLinearGradient(-54, -100, 54, 116);
    gg.addColorStop(0, 'rgba(255,224,160,0.30)');
    gg.addColorStop(0.5, 'rgba(255,190,120,0.22)');
    gg.addColorStop(1, 'rgba(255,170,90,0.30)');
    ctx.fillStyle = gg; ctx.fill();
    /* líquido */
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(-50, -66); ctx.lineTo(50, -66);
    ctx.lineTo(40, 104);
    ctx.quadraticCurveTo(38, 114, 24, 114);
    ctx.lineTo(-24, 114);
    ctx.quadraticCurveTo(-38, 114, -40, 104);
    ctx.closePath();
    var lg = ctx.createLinearGradient(0, -66, 0, 114);
    lg.addColorStop(0, '#FFD58A');
    lg.addColorStop(0.45, '#F09A3C');
    lg.addColorStop(1, '#C9531C');
    ctx.fillStyle = lg; ctx.fill();
    /* burbujas */
    for (var i = 0; i < 9; i++) {
      var ph = (t * (0.35 + r() * 0.5) + r() * 3) % 1;
      ctx.globalAlpha = 0.6 * (1 - ph);
      ctx.beginPath();
      ctx.arc(-36 + r() * 72, 104 - ph * 168, 2 + r() * 4, 0, Math.PI * 2);
      ctx.fillStyle = '#FFF3DC'; ctx.fill();
    }
    ctx.globalAlpha = 1;
    ctx.restore();
    /* reflejo del vidrio */
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    ctx.globalAlpha = 0.7;
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.beginPath();
    ctx.moveTo(-44, -92); ctx.lineTo(-30, -92); ctx.lineTo(-22, 96); ctx.lineTo(-34, 96);
    ctx.closePath(); ctx.fill();
    ctx.globalAlpha = 0.35;
    ctx.fillStyle = 'rgba(255,240,210,0.6)';
    ctx.fillRect(32, -86, 8, 170);
    ctx.restore();
    /* borde */
    ctx.strokeStyle = 'rgba(255,248,232,0.75)';
    ctx.lineWidth = 5;
    ctx.beginPath(); ctx.moveTo(-54, -100); ctx.lineTo(54, -100); ctx.stroke();
    ctx.restore();
  };

  /* ================= LETRERO DE MARCA ================= */
  /* Tabla de madera colgante. El texto lo dibuja la escena encima. */
  A.sign = function (ctx, cx, cy, w, h, t, o) {
    o = o || {};
    var swing = Math.sin(t * 1.15 + (o.phase || 0)) * (o.swing === undefined ? 0.022 : o.swing);
    ctx.save();
    ctx.translate(cx, cy - h * 0.5 - (o.ropeLen || 150));
    ctx.rotate(swing);
    ctx.translate(0, h * 0.5 + (o.ropeLen || 150));

    /* cuerdas */
    ctx.strokeStyle = '#3A2413';
    ctx.lineWidth = 9; ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-w * 0.34, -h / 2 - (o.ropeLen || 150));
    ctx.lineTo(-w * 0.38, -h / 2 - 6);
    ctx.moveTo(w * 0.34, -h / 2 - (o.ropeLen || 150));
    ctx.lineTo(w * 0.38, -h / 2 - 6);
    ctx.stroke();

    /* tabla */
    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.85)';
    ctx.shadowBlur = 70; ctx.shadowOffsetY = 26;
    U.rrect(ctx, -w / 2, -h / 2, w, h, 26);
    ctx.fillStyle = '#4A2716'; ctx.fill();
    ctx.restore();
    ctx.save();
    U.rrect(ctx, -w / 2, -h / 2, w, h, 26); ctx.clip();
    A.wood(ctx, -w / 2, -h / 2, w, h, 771, { top: '#7E4A23', mid: '#512C14', bot: '#301708' });
    /* luz cálida desde arriba */
    ctx.globalCompositeOperation = 'screen';
    ctx.globalAlpha = 0.30;
    var lg = ctx.createLinearGradient(0, -h / 2, 0, h / 2);
    lg.addColorStop(0, U.rgba(C.ember, 0.85));
    lg.addColorStop(0.6, U.rgba(C.ember, 0));
    ctx.fillStyle = lg;
    ctx.fillRect(-w / 2, -h / 2, w, h);
    ctx.restore();

    /* marco dorado */
    ctx.save();
    ctx.strokeStyle = U.rgba(C.gold, o.frameAlpha === undefined ? 0.95 : o.frameAlpha);
    ctx.lineWidth = 7;
    U.rrect(ctx, -w / 2 + 20, -h / 2 + 20, w - 40, h - 40, 16);
    ctx.stroke();
    ctx.strokeStyle = U.rgba(C.goldLight, (o.frameAlpha === undefined ? 0.95 : o.frameAlpha) * 0.5);
    ctx.lineWidth = 2.5;
    U.rrect(ctx, -w / 2 + 31, -h / 2 + 31, w - 62, h - 62, 10);
    ctx.stroke();
    ctx.restore();

    /* tornillos */
    ctx.fillStyle = 'rgba(20,12,6,0.8)';
    [[-w / 2 + 34, -h / 2 + 34], [w / 2 - 34, -h / 2 + 34], [-w / 2 + 34, h / 2 - 34], [w / 2 - 34, h / 2 - 34]]
      .forEach(function (p) { ctx.beginPath(); ctx.arc(p[0], p[1], 7, 0, Math.PI * 2); ctx.fill(); });

    ctx.restore();
    return { swing: swing };
  };

  /* ================= FONDO COMPUESTO ================= */
  /* Plano general de la fonda con parallax. */
  A.fondaWide = function (ctx, t, cam) {
    cam = cam || {};
    var px = cam.px || 0, py = cam.py || 0;
    var horizon = H * 0.52 + py * 0.3;

    A.sky(ctx, t, { horizon: horizon });
    A.hills(ctx, t, horizon, px);

    /* luces lejanas del pueblo */
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    var r = U.rng(19);
    ctx.filter = 'blur(2px)';
    for (var i = 0; i < 46; i++) {
      var x = r() * W + px * 0.6, y = horizon + 22 + r() * 54;
      ctx.globalAlpha = 0.35 + 0.4 * U.fbm1(t * 1.2 + i * 3);
      U.glow(ctx, x, y, 14, i % 3 === 0 ? C.goldLight : C.ember, 0.7);
    }
    ctx.restore();

    A.ramada(ctx, t, { baseY: H * 0.855 + py * 0.6, topY: H * 0.33 + py * 0.4 });

    /* guirnaldas al fondo */
    ctx.save();
    ctx.translate(px * 0.55, py * 0.45);
    A.stringLights(ctx, t, { y0: H * 0.30, y1: H * 0.285, sag: 128, count: 15, phase: 1.2 });
    ctx.restore();
    ctx.save();
    ctx.translate(px * 0.75, py * 0.55);
    A.bunting(ctx, t, { y0: H * 0.235, y1: H * 0.255, sag: 132, count: 14, size: 78 });
    ctx.restore();

    /* gente */
    A.crowd(ctx, t, { baseY: H * 0.855 + py * 0.6, count: 9, h: 190, alpha: 0.85, blur: 3, seed: 21, walk: true });
    A.crowd(ctx, t, { baseY: H * 0.90 + py * 0.7, count: 7, h: 250, alpha: 1, seed: 45, walk: true, spread: 40 });

    /* guirnalda de banderas en primer plano (desenfocada) */
    ctx.save();
    ctx.translate(px * 1.5, py * 1.1);
    ctx.filter = 'blur(7px)';
    A.flagLine(ctx, t, { y0: H * 0.055, y1: H * 0.085, sag: 96, count: 6, size: 118 });
    ctx.restore();

    /* primer plano: hombros y cabezas muy cerca de la cámara, fuera de foco */
    ctx.save();
    ctx.translate(px * 2.2, py * 1.4);
    ctx.filter = 'blur(20px)';
    A.crowd(ctx, t, {
      baseY: H * 1.17, count: 5, h: 700, alpha: 0.95, seed: 909,
      x0: -0.1, x1: 1.1, spread: 30
    });
    ctx.restore();

    Fx.embers(ctx, t, { count: 40, alpha: 0.7 });
    Fx.dust(ctx, t, { count: 16, alpha: 0.14, size: 1.5 });
  };

  T.A = A;
})(window.TATA = window.TATA || {});
