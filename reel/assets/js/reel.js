/* reel.js — línea de tiempo, escenas y montaje del reel 9:16.
   render(ctx, t) es una función pura del tiempo: cualquier frame puede
   dibujarse por separado, lo que permite exportar el video cuadro a cuadro. */
(function (T) {
  'use strict';
  var U = T.U, C = U.C, G = T.G, Fx = T.Fx, A = T.A, Ty = T.Ty, M = T.M;
  var W = U.W, H = U.H;
  var R = {};

  R.DURATION = 28.8;
  R.FPS = 30;

  /* Zona segura: fuera de los controles de Reels/TikTok/Stories. */
  R.SAFE = { top: 250, bottom: 1560, left: 84, right: W - 84 };

  /* Cortes de escena (coinciden con los compases de la música). */
  var CUT = [0, 3.6, 7.2, 12.6, 18.0, 23.4, 28.8];
  /* Micro-cortes internos */
  var MICRO = [0.62, 5.42, 13.95, 15.30, 16.65];

  /* ---------------- Utilidades de cámara ---------------- */

  function handheld(t) {
    return {
      x: (U.fbm1(t * 0.55, 3) - 0.5) * 16,
      y: (U.fbm1(t * 0.5 + 11, 3) - 0.5) * 13,
      r: (U.fbm1(t * 0.38 + 23, 2) - 0.5) * 0.0075
    };
  }

  function pushCam(ctx, o) {
    ctx.save();
    ctx.translate(W / 2 + (o.x || 0), H / 2 + (o.y || 0));
    if (o.r) ctx.rotate(o.r);
    var s = o.s === undefined ? 1 : o.s;
    ctx.scale(s, s);
    ctx.translate(-W / 2, -H / 2);
  }

  /* Efecto de corte: latigazo + destello. Devuelve {dx, blur, flash}. */
  function cutFX(t) {
    var all = CUT.slice(1, CUT.length - 1).concat(MICRO);
    var dx = 0, blur = 0, flash = 0, sc = 1;
    for (var i = 0; i < all.length; i++) {
      var b = all[i];
      var isMain = i < CUT.length - 2;
      var win = isMain ? 0.2 : 0.13;
      var d = t - b;
      if (d < -win || d > win) continue;
      var dir = (i % 2 === 0) ? 1 : -1;
      var u = d / win;                  /* -1 .. 1 */
      var mag = 1 - Math.abs(u);
      var strength = isMain ? 1 : 0.62;
      dx += -Math.sign(u || 1) * mag * (isMain ? 210 : 120) * dir * strength;
      blur += mag * (isMain ? 17 : 10) * strength;
      flash += Math.pow(mag, 3.2) * (isMain ? 0.42 : 0.2);
      sc *= 1 + mag * (isMain ? 0.05 : 0.025);
    }
    return { dx: dx, blur: blur, flash: flash, sc: sc };
  }

  /* ---------------- Fondos auxiliares ---------------- */

  /* Fondo cálido desenfocado (bokeh de fonda) — base legible para info. */
  function warmBokeh(ctx, t, o) {
    o = o || {};
    var g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, '#0A0A12');
    g.addColorStop(0.35, '#1B0F0C');
    g.addColorStop(0.62, '#39170E');
    g.addColorStop(0.85, '#1A0A07');
    g.addColorStop(1, '#070405');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);

    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    U.glow(ctx, W * 0.5, H * 0.42, W * 0.85, C.ember, 0.24);
    U.glow(ctx, W * 0.16, H * 0.72, W * 0.4, C.red, 0.2);
    U.glow(ctx, W * 0.86, H * 0.28, W * 0.38, C.gold, 0.18);
    ctx.restore();

    /* guirnaldas fuera de foco */
    A.blurGroup(ctx, 16, 0.85, function (c) {
      A.stringLights(c, t, { y0: H * 0.12, y1: H * 0.09, sag: 150, count: 13, phase: 2.1, scale: 1.25 });
    });
    A.blurGroup(ctx, 22, 0.85, function (c) {
      A.stringLights(c, t, { y0: H * 0.93, y1: H * 0.96, sag: -120, count: 11, phase: 0.4, scale: 1.5 });
    });

    Fx.bokeh(ctx, t, { count: 22, alpha: o.bokeh === undefined ? 0.34 : o.bokeh, seed: 4321 });
    Fx.embers(ctx, t, { count: 26, alpha: 0.42, seed: 5150 });
    Fx.dust(ctx, t, { count: 14, alpha: 0.12, size: 2 });
  }

  /* Mesa servida bajo la luz de la fonda. */
  function foodTable(ctx, t, o) {
    o = o || {};
    var g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, '#07050C');
    g.addColorStop(0.26, '#130A08');
    g.addColorStop(0.52, '#24110A');
    g.addColorStop(0.78, '#170C06');
    g.addColorStop(1, '#070302');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);

    /* farol cálido colgando sobre la mesa */
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    U.glow(ctx, W * 0.5, H * 0.32, W * 0.46, C.ember, 0.34);
    ctx.restore();

    /* gente al fondo, fuera de foco */
    A.blurGroup(ctx, 15, 0.55, function (c) {
      A.crowd(c, t, { baseY: H * 0.50, count: 7, h: 195, seed: 313, walk: true, spread: 30 });
    });
    A.blurGroup(ctx, 9, 0.9, function (c) {
      A.stringLights(c, t, { y0: H * 0.16, y1: H * 0.13, sag: 120, count: 12, scale: 1.15 });
      A.bunting(c, t, { y0: H * 0.055, y1: H * 0.075, sag: 100, count: 12, size: 80 });
    });

    /* mesa */
    A.board(ctx, -60, H * 0.615, W + 120, H * 0.5, 616);

    /* charco de luz sobre el tablero: recorta el foco donde va la comida */
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    ctx.globalAlpha = 0.78;
    var pool = ctx.createRadialGradient(W * 0.5, H * 0.71, 20, W * 0.5, H * 0.71, W * 0.7);
    pool.addColorStop(0, U.rgba(C.emberHot, 0.5));
    pool.addColorStop(0.5, U.rgba(C.ember, 0.2));
    pool.addColorStop(1, U.rgba(C.ember, 0));
    ctx.fillStyle = pool;
    ctx.fillRect(0, H * 0.58, W, H * 0.42);
    ctx.restore();

    Fx.bokeh(ctx, t, { count: 10, alpha: 0.22, seed: 71 });
  }

  /* ---------------- ESCENA 1 — HOOK ---------------- */
  function scene1(ctx, t) {
    var hh = handheld(t);

    if (t < 0.62) {
      /* Arranque en la parrilla: humo, brasa y anticuchos. */
      var p = U.norm(t, 0, 0.62);
      M.backdrop(ctx, 'parrilla', { zoom: 1.6, blur: 34, darken: 0.6, panX: hh.x * 2 });
      M.band(ctx, 'parrilla', {
        y: H * 0.5, zoom: U.lerp(1.3, 1.18, p), anchorX: 0.58,
        panX: hh.x * 1.5, panY: hh.y * 1.5
      });
      Fx.embers(ctx, t, { count: 34, alpha: 0.85, seed: 12 });
      Fx.flash(ctx, Math.max(0, 1 - t * 5.5) * 0.85, '#FFE9C6');
      return;
    }

    /* La fonda llena: los amigos, las banderas, la tarde. */
    var q = U.norm(t, 0.62, 3.6);
    M.backdrop(ctx, 'amigos', { zoom: U.lerp(1.5, 1.35, q), blur: 32, darken: 0.62, panX: hh.x });
    M.band(ctx, 'amigos', {
      y: 690, zoom: U.lerp(1.16, 1.03, U.ease.outCubic(q)),
      panX: hh.x + U.lerp(18, -14, q), panY: hh.y, anchorY: 0.42
    });
    M.scrim(ctx, 1000, 0.55);

    /* guirnaldas propias arriba y abajo: enmarcan la banda fotográfica */
    A.blurGroup(ctx, 6, 0.9, function (c) {
      A.bunting(c, t, { y0: -40, y1: -20, sag: 108, count: 13, size: 76 });
    });
    A.stringLights(ctx, t, { y0: 156, y1: 140, sag: 96, count: 13, scale: 0.95 });
    A.stringLights(ctx, t, { y0: H * 0.965, y1: H * 0.985, sag: -104, count: 12, phase: 1.6, scale: 0.95 });

    Fx.embers(ctx, t, { count: 30, alpha: 0.55, seed: 21 });
    Fx.dust(ctx, t, { count: 12, alpha: 0.1, size: 2 });

    /* Texto del gancho */
    var tin = 0.86;
    var pIn = U.norm(t, tin, tin + 0.62);
    var pIn2 = U.norm(t, tin + 0.2, tin + 0.86);
    var pOut = U.norm(t, 3.30, 3.58);

    var fp = U.ease.outBack(U.norm(t, tin - 0.05, tin + 0.45));
    if (fp > 0.01) {
      ctx.save();
      ctx.globalAlpha = U.clamp(fp, 0, 1) * (1 - pOut);
      ctx.shadowColor = 'rgba(0,0,0,0.6)'; ctx.shadowBlur = 40; ctx.shadowOffsetY = 12;
      G.flag(ctx, W / 2, 1010, 128 * U.clamp(fp, 0, 1.06), t * 0.9, 1);
      ctx.restore();
    }

    var hero = { family: Ty.FAM.display, size: 156, weight: 400, spacing: -1 };
    Ty.line(ctx, {
      text: '¡SANTO DOMINGO', spec: hero, x: W / 2, y: 1224, maxWidth: W - 150,
      mode: 'chars', stagger: 0.55, p: pIn, pOut: pOut, dy: 120, scaleIn: 1.22, blurIn: 22,
      fill: Ty.FILL.cream, shadow: { color: 'rgba(0,0,0,0.9)', blur: 44, y: 14 }
    });
    Ty.line(ctx, {
      text: 'ESTÁ DE FIESTA!', spec: hero, x: W / 2, y: 1382, maxWidth: W - 150,
      mode: 'chars', stagger: 0.55, p: pIn2, pOut: pOut, dy: 120, scaleIn: 1.22, blurIn: 22,
      fill: Ty.FILL.gold, shadow: { color: 'rgba(0,0,0,0.9)', blur: 44, y: 14 },
      glow: { color: C.ember, alpha: 0.35 }
    });
    Ty.rule(ctx, W / 2, 1434, 560, U.norm(t, tin + 0.55, tin + 1.0), C.gold, 5);
  }

  /* ---------------- ESCENA 2 — INVITACIÓN ---------------- */
  function scene2(ctx, t) {
    var lt = t - 3.6;
    var hh = handheld(t);

    if (lt < 1.82) {
      /* El Tata en la parrilla */
      var p = U.norm(lt, 0, 1.82);
      M.backdrop(ctx, 'tata', { zoom: 1.5, blur: 32, darken: 0.6, panX: hh.x });
      M.band(ctx, 'tata', {
        y: 620, zoom: U.lerp(1.02, 1.14, U.ease.inOutCubic(p)), anchorY: 0.38,
        panX: hh.x, panY: hh.y
      });
      M.scrim(ctx, 1000, 0.6);
      Fx.embers(ctx, t, { count: 34, alpha: 0.6, seed: 202 });
    } else {
      /* La parrilla servida */
      var q = U.norm(lt, 1.82, 3.6);
      M.backdrop(ctx, 'parrilla', { zoom: 1.55, blur: 32, darken: 0.6, panX: hh.x });
      M.band(ctx, 'parrilla', {
        y: 700, zoom: U.lerp(1.22, 1.06, U.ease.outCubic(q)), anchorX: U.lerp(0.62, 0.44, q),
        panX: hh.x, panY: hh.y
      });
      M.scrim(ctx, 980, 0.6);
      Fx.embers(ctx, t, { count: 40, alpha: 0.75, seed: 303 });
      Fx.smoke(ctx, t, W * 0.5, H * 0.52, { count: 8, spread: 520, rise: 460, size: 100, alpha: 0.07, seed: 5 });
    }

    /* Texto de invitación */
    var t0 = 4.05;
    var pOut = U.norm(t, 6.92, 7.18);
    Ty.line(ctx, {
      text: 'Este 18, ven a vivir la',
      spec: { family: Ty.FAM.sans, size: 64, weight: 600, spacing: 1 },
      x: W / 2, y: 1128, maxWidth: W - 190,
      mode: 'words', stagger: 0.5, p: U.norm(t, t0, t0 + 0.6), pOut: pOut,
      dy: 46, scaleIn: 1.06, blurIn: 12,
      fill: Ty.FILL.cream, shadow: { color: 'rgba(0,0,0,0.85)', blur: 28, y: 8 }
    });
    Ty.line(ctx, {
      text: 'FIESTA DE LA',
      spec: { family: Ty.FAM.display, size: 130, weight: 400, spacing: 0 },
      x: W / 2, y: 1258, maxWidth: W - 160,
      mode: 'chars', stagger: 0.55, p: U.norm(t, t0 + 0.28, t0 + 0.98), pOut: pOut,
      dy: 92, scaleIn: 1.18, blurIn: 20,
      fill: Ty.FILL.gold, shadow: { color: 'rgba(0,0,0,0.9)', blur: 38, y: 12 },
      glow: { color: C.ember, alpha: 0.3 }
    });
    Ty.line(ctx, {
      text: 'CHILENIDAD',
      spec: { family: Ty.FAM.display, size: 130, weight: 400, spacing: 0 },
      x: W / 2, y: 1382, maxWidth: W - 160,
      mode: 'chars', stagger: 0.55, p: U.norm(t, t0 + 0.46, t0 + 1.16), pOut: pOut,
      dy: 92, scaleIn: 1.18, blurIn: 20,
      fill: Ty.FILL.gold, shadow: { color: 'rgba(0,0,0,0.9)', blur: 38, y: 12 },
      glow: { color: C.ember, alpha: 0.3 }
    });

    /* cinta roja con la comuna */
    var rp = U.norm(t, t0 + 0.95, t0 + 1.35);
    if (rp > 0 && pOut < 1) {
      ctx.save();
      ctx.globalAlpha = U.ease.outQuint(rp) * (1 - pOut);
      var bw = 660 * U.ease.outQuint(rp);
      U.rrect(ctx, W / 2 - bw / 2, 1420, bw, 66, 10);
      var bg = ctx.createLinearGradient(W / 2 - bw / 2, 0, W / 2 + bw / 2, 0);
      bg.addColorStop(0, U.rgba(C.redDeep, 0.95));
      bg.addColorStop(0.5, U.rgba(C.red, 0.98));
      bg.addColorStop(1, U.rgba(C.redDeep, 0.95));
      ctx.fillStyle = bg; ctx.fill();
      ctx.restore();
      Ty.line(ctx, {
        text: 'DE LA COMUNA DE SANTO DOMINGO',
        spec: { family: Ty.FAM.sans, size: 36, weight: 700, spacing: 3 },
        x: W / 2, y: 1465, maxWidth: 600,
        mode: 'block', p: U.norm(t, t0 + 1.1, t0 + 1.45), pOut: pOut,
        dy: 16, scaleIn: 1.02, blurIn: 6,
        fill: Ty.FILL.cream
      });
    }
  }

  /* ---------------- ESCENA 3 — LA COCINA DEL TATA ---------------- */
  function scene3(ctx, t) {
    var lt = t - 7.2;
    var hh = handheld(t);
    var q = U.norm(lt, 0, 5.4);
    var pOut3 = U.norm(t, 12.3, 12.56);

    /* el Tata, apagado: aquí manda la marca */
    M.backdrop(ctx, 'tata', {
      zoom: U.lerp(1.5, 1.35, U.ease.outQuart(q)), blur: 38, darken: 0.78,
      panX: hh.x * 0.6, panY: hh.y * 0.6, anchorY: 0.4
    });

    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    U.glow(ctx, W * 0.5, H * 0.40, W * 0.8, C.ember, 0.16);
    ctx.restore();

    /* luces encendiéndose */
    var on = U.ease.outCubic(U.norm(lt, 0.15, 1.15));
    A.stringLights(ctx, t, { y0: H * 0.075, y1: H * 0.055, sag: 118, count: 14, on: on, scale: 1.1 });

    /* "Y pasa por" */
    Ty.line(ctx, {
      text: 'Y pasa por',
      spec: { family: Ty.FAM.sans, size: 60, weight: 600, spacing: 4 },
      x: W / 2, y: 470, maxWidth: W - 240,
      mode: 'words', stagger: 0.4, p: U.norm(t, 7.45, 7.95), pOut: pOut3,
      dy: 38, scaleIn: 1.05, blurIn: 12,
      fill: Ty.FILL.cream, shadow: { color: 'rgba(0,0,0,0.85)', blur: 26, y: 8 }
    });

    /* El logo de la marca entra como protagonista */
    var ep = U.ease.outBack(U.norm(lt, 0.62, 1.42), 1.15);
    if (ep > 0.01) {
      var es = U.clamp(ep, 0.01, 1.04) * (1 + Math.sin(t * 1.5) * 0.006);
      ctx.save();
      ctx.globalAlpha = U.clamp(ep, 0, 1) * (1 - pOut3);
      M.badge(ctx, W / 2, 810, 470 * es, { rotate: (1 - ep) * -0.16, glowAlpha: 0.45 });
      ctx.restore();
      Ty.shine(ctx, W / 2, 810, 560, 560, U.norm(t, 8.5, 9.4), 0.55);
    }

    /* Nombre y bajada */
    var bt = 8.6;
    Ty.line(ctx, {
      text: 'LA COCINA DEL TATA',
      spec: { family: Ty.FAM.brand, size: 96, weight: 400, spacing: 0 },
      x: W / 2, y: 1170, maxWidth: W - 130,
      mode: 'chars', stagger: 0.5, p: U.norm(t, bt, bt + 0.72), pOut: pOut3,
      dy: 66, scaleIn: 1.12, blurIn: 18,
      fill: Ty.FILL.gold, shadow: { color: 'rgba(0,0,0,0.9)', blur: 34, y: 10 }
    });
    Ty.rule(ctx, W / 2, 1212, 620, U.norm(t, bt + 0.6, bt + 1.0), C.gold, 4);
    Ty.line(ctx, {
      text: 'Tradición en cada plato',
      spec: { family: Ty.FAM.hand, size: 78, weight: 600, spacing: 0 },
      x: W / 2, y: 1318, maxWidth: W - 260,
      mode: 'words', stagger: 0.42, p: U.norm(t, bt + 0.75, bt + 1.35), pOut: pOut3,
      dy: 34, scaleIn: 1.04, blurIn: 10,
      fill: Ty.FILL.cream, shadow: { color: 'rgba(0,0,0,0.8)', blur: 22, y: 7 }
    });

    /* corazón */
    var hp = U.ease.outElastic(U.norm(t, 10.3, 11.1));
    if (hp > 0.01) {
      ctx.save();
      ctx.globalAlpha = U.clamp(hp * 1.2, 0, 1) * (1 - pOut3);
      var beat = 1 + Math.pow(Math.max(0, Math.sin((t - 10.35) * 3.4)), 6) * 0.14;
      ctx.shadowColor = 'rgba(216,48,43,0.85)'; ctx.shadowBlur = 54;
      G.heart(ctx, W / 2, 1462, 110 * U.clamp(hp, 0, 1.1) * beat);
      ctx.restore();
    }

    ctx.save();
    ctx.globalAlpha = U.norm(lt, 1.0, 1.8) * (1 - U.norm(lt, 4.9, 5.4));
    Fx.sparkles(ctx, t, { count: 20, x: W / 2, y: 830, radius: W * 0.5, alpha: 0.7, seed: 9911 });
    ctx.restore();
    Fx.embers(ctx, t, { count: 26, alpha: 0.45, seed: 404 });
  }

  /* ---------------- ESCENA 4 — COMIDA + TRAGOS ---------------- */
  function scene4(ctx, t) {
    var hh = handheld(t);
    var shots = [12.6, 13.95, 15.30, 16.65, 18.0];
    var idx = 0;
    for (var i = 0; i < 4; i++) if (t >= shots[i]) idx = i;
    var sp = U.norm(t, shots[idx], shots[idx + 1]);

    if (idx === 0) {
      /* Anticuchos */
      M.backdrop(ctx, 'parrilla', { zoom: 1.7, blur: 32, darken: 0.62, panX: hh.x });
      M.band(ctx, 'parrilla', {
        y: 690, zoom: U.lerp(1.5, 1.32, U.ease.outCubic(sp)), anchorX: 0.6,
        panX: hh.x, panY: hh.y
      });
      M.scrim(ctx, 900, 0.66);
      Fx.smoke(ctx, t, W * 0.5, H * 0.46, { count: 9, spread: 540, rise: 440, size: 100, alpha: 0.08, seed: 15 });
      Fx.embers(ctx, t, { count: 30, alpha: 0.6, seed: 505 });
    } else if (idx === 1) {
      /* Brindis */
      M.backdrop(ctx, 'amigos', {
        zoom: U.lerp(1.6, 1.45, U.ease.outCubic(sp)), blur: 26, darken: 0.5,
        panX: hh.x, panY: hh.y
      });
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      U.glow(ctx, W * 0.5, H * 0.36, W * 0.7, C.ember, 0.24);
      ctx.restore();
      Fx.bokeh(ctx, t, { count: 14, alpha: 0.34, seed: 818 });

      var clinkT = 14.38;
      var app = U.ease.outCubic(U.norm(t, 13.98, clinkT));
      var rec = U.ease.outQuint(U.norm(t, clinkT, clinkT + 0.5));
      var gap = U.lerp(400, 112, app) + rec * 44;
      var jolt = t < clinkT ? 0 : Math.exp(-(t - clinkT) * 12) * Math.sin((t - clinkT) * 52) * 16;
      A.glass(ctx, W * 0.5 - gap / 2 - jolt, H * 0.425, 1.42, t, 71, 0.10 - app * 0.03);
      A.glass(ctx, W * 0.5 + gap / 2 + jolt, H * 0.420, 1.42, t, 72, -0.10 + app * 0.03);
      if (t >= clinkT && t < clinkT + 0.6) {
        var sparkP = U.norm(t, clinkT, clinkT + 0.5);
        ctx.save();
        ctx.globalCompositeOperation = 'screen';
        ctx.globalAlpha = 1 - sparkP;
        U.glow(ctx, W * 0.5, H * 0.335, 260 * (0.4 + sparkP), C.goldLight, 0.85);
        ctx.restore();
        Fx.sparkles(ctx, t, { count: 16, x: W * 0.5, y: H * 0.335, radius: 300 * (0.3 + sparkP), alpha: 1 - sparkP, seed: 31 });
      }
      Fx.embers(ctx, t, { count: 24, alpha: 0.5, seed: 606 });
    } else if (idx === 2) {
      /* Ambiente */
      M.backdrop(ctx, 'amigos', { zoom: 1.45, blur: 30, darken: 0.6, panX: hh.x });
      M.band(ctx, 'amigos', {
        y: 640, zoom: U.lerp(1.1, 1.0, U.ease.outCubic(sp)), anchorY: 0.4,
        panX: hh.x + U.lerp(-16, 20, sp), panY: hh.y
      });
      M.scrim(ctx, 920, 0.64);
      ctx.save();
      A.blurGroup(ctx, 6, 0.85, function (c) {
        A.bunting(c, t, { y0: -46, y1: -26, sag: 100, count: 13, size: 72 });
      });
      ctx.restore();
      Fx.embers(ctx, t, { count: 30, alpha: 0.6, seed: 707 });
      Fx.dust(ctx, t, { count: 12, alpha: 0.12, size: 2 });
    } else {
      /* Sabor */
      M.backdrop(ctx, 'parrilla', { zoom: 1.5, blur: 34, darken: 0.64, panX: hh.x });
      M.band(ctx, 'parrilla', {
        y: 690, zoom: U.lerp(1.2, 1.08, U.ease.outCubic(sp)), anchorX: U.lerp(0.18, 0.06, sp),
        panX: hh.x, panY: hh.y
      });
      M.scrim(ctx, 1000, 0.6);
      Fx.smoke(ctx, t, W * 0.5, H * 0.55, { count: 10, spread: 560, rise: 480, size: 110, alpha: 0.08, seed: 9 });
      Fx.embers(ctx, t, { count: 36, alpha: 0.7, seed: 808 });
    }

    /* Etiquetas */
    var labels = [
      { text: 'COMIDA', glyph: 'flag', t0: 12.78, t1: 13.90 },
      { text: 'TRAGOS', glyph: 'drink', t0: 14.12, t1: 15.25 },
      { text: 'AMBIENTE', glyph: 'music', t0: 15.47, t1: 16.60 },
      { text: 'Y MUCHO SABOR', glyph: 'heart', t0: 16.82, t1: 17.95 }
    ];
    var L = labels[idx];
    var pIn = U.norm(t, L.t0, L.t0 + 0.34);
    var pOut = U.norm(t, L.t1 - 0.2, L.t1);
    if (pIn > 0 && pOut < 1) {
      var yLab = 1152;
      var spec = { family: Ty.FAM.display, size: idx === 3 ? 132 : 158, weight: 400, spacing: idx === 3 ? 0 : 2 };
      Ty.line(ctx, {
        text: L.text, spec: spec, x: W / 2, y: yLab, maxWidth: W - 230,
        mode: 'chars', stagger: 0.42, p: pIn, pOut: pOut,
        dy: 70, scaleIn: 1.2, blurIn: 18, ease: U.ease.slam,
        fill: idx === 3 ? Ty.FILL.gold : Ty.FILL.cream,
        shadow: { color: 'rgba(0,0,0,0.9)', blur: 40, y: 12 },
        glow: idx === 3 ? { color: C.ember, alpha: 0.32 } : null
      });

      var gp = U.ease.outBack(U.norm(t, L.t0 + 0.18, L.t0 + 0.6));
      if (gp > 0.01) {
        ctx.save();
        ctx.globalAlpha = U.clamp(gp, 0, 1) * (1 - pOut);
        var gy = yLab + 126, gs = U.clamp(gp, 0, 1.06);
        if (L.glyph === 'flag') G.flag(ctx, W / 2, gy, 104 * gs, t * 0.9, 1);
        else if (L.glyph === 'drink') G.drink(ctx, W / 2, gy, 128 * gs, t);
        else if (L.glyph === 'music') G.music(ctx, W / 2, gy, 118 * gs, C.goldLight);
        else G.heart(ctx, W / 2, gy, 118 * gs * (1 + Math.pow(Math.max(0, Math.sin((t - L.t0) * 3.6)), 6) * 0.12));
        ctx.restore();
      }

      ctx.save();
      ctx.globalAlpha = 0.85 * pIn * (1 - pOut);
      for (var k = 0; k < 4; k++) {
        ctx.beginPath();
        ctx.arc(W / 2 + (k - 1.5) * 44, 990, k === idx ? 8 : 5, 0, Math.PI * 2);
        ctx.fillStyle = k === idx ? C.goldLight : 'rgba(255,240,220,0.35)';
        ctx.fill();
      }
      ctx.restore();
    }
  }

  /* ---------------- ESCENA 5 — FECHAS ---------------- */
  function scene5(ctx, t) {
    var lt = t - 18.0;
    var hh = handheld(t);
    var q = U.norm(lt, 0, 5.4);
    var pOutAll = U.norm(t, 23.1, 23.38);

    /* la parrilla fuera de foco: cálida y apetitosa detrás de la información */
    M.backdrop(ctx, 'parrilla', {
      zoom: U.lerp(1.75, 1.6, q), blur: 34, darken: 0.5,
      panX: hh.x * 0.5, panY: hh.y * 0.5
    });
    ctx.save();
    var vg = ctx.createLinearGradient(0, 0, 0, H);
    vg.addColorStop(0, 'rgba(6,4,8,0.88)');
    vg.addColorStop(0.3, 'rgba(6,4,8,0.74)');
    vg.addColorStop(0.75, 'rgba(6,4,8,0.76)');
    vg.addColorStop(1, 'rgba(6,4,8,0.9)');
    ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);
    ctx.restore();
    Fx.bokeh(ctx, t, { count: 16, alpha: 0.24, seed: 4321 });
    Fx.embers(ctx, t, { count: 22, alpha: 0.38, seed: 5150 });

    /* marca arriba */
    var bp = U.ease.outBack(U.norm(t, 18.02, 18.5), 1.1);
    if (bp > 0.01) {
      ctx.save();
      ctx.globalAlpha = U.clamp(bp, 0, 1) * (1 - pOutAll);
      M.badge(ctx, W / 2, 396, 190 * U.clamp(bp, 0, 1.04), { glowAlpha: 0.3 });
      ctx.restore();
    }
    Ty.line(ctx, {
      text: 'LA COCINA DEL TATA',
      spec: { family: Ty.FAM.brand, size: 50, weight: 400, spacing: 2 },
      x: W / 2, y: 552, maxWidth: W - 240,
      mode: 'block', p: U.norm(t, 18.25, 18.65), pOut: pOutAll,
      dy: 28, scaleIn: 1.04, blurIn: 10,
      fill: Ty.FILL.gold, shadow: { color: 'rgba(0,0,0,0.8)', blur: 22, y: 6 }
    });

    /* Fechas: cada número en su golpe */
    var dates = ['17', '18', '19'];
    var hits = [18.12, 18.72, 19.32];
    var specN = { family: Ty.FAM.display, size: 228, weight: 400, spacing: 0 };
    var sepSpec = { family: Ty.FAM.display, size: 116, weight: 400, spacing: 0 };
    ctx.save();
    Ty.set(ctx, specN); var wNum = ctx.measureText('17').width;
    Ty.set(ctx, sepSpec); var wSep = ctx.measureText('•').width;
    ctx.restore();
    var gapX = 44;
    var totalW = wNum * 3 + wSep * 2 + gapX * 4;
    var startX = W / 2 - totalW / 2;
    var yNum = 830;

    for (var i = 0; i < 3; i++) {
      var cx = startX + i * (wNum + wSep + gapX * 2) + wNum / 2;
      var punch = t >= hits[i] ? 1 + Math.exp(-(t - hits[i]) * 11) * 0.22 : 1;
      ctx.save();
      ctx.translate(cx, yNum - specN.size * 0.34);
      ctx.scale(punch, punch);
      ctx.translate(-cx, -(yNum - specN.size * 0.34));
      Ty.line(ctx, {
        text: dates[i], spec: specN, x: cx, y: yNum,
        mode: 'block', p: U.norm(t, hits[i], hits[i] + 0.42), pOut: pOutAll,
        dy: 90, scaleIn: 1.35, blurIn: 26, ease: U.ease.slam,
        fill: Ty.FILL.cream, shadow: { color: 'rgba(0,0,0,0.9)', blur: 44, y: 14 },
        glow: { color: C.gold, alpha: 0.3 }
      });
      ctx.restore();
      if (i < 2) {
        Ty.line(ctx, {
          text: '•', spec: sepSpec,
          x: startX + i * (wNum + wSep + gapX * 2) + wNum + gapX + wSep / 2, y: yNum - 54,
          mode: 'block', p: U.norm(t, hits[i] + 0.22, hits[i] + 0.5), pOut: pOutAll,
          dy: 20, scaleIn: 1.6, blurIn: 10, fill: Ty.FILL.gold
        });
      }
    }

    Ty.line(ctx, {
      text: 'DE SEPTIEMBRE',
      spec: { family: Ty.FAM.display, size: 104, weight: 400, spacing: 8 },
      x: W / 2, y: 960, maxWidth: W - 180,
      mode: 'chars', stagger: 0.5, p: U.norm(t, 19.62, 20.15), pOut: pOutAll,
      dy: 56, scaleIn: 1.12, blurIn: 16,
      fill: Ty.FILL.gold, shadow: { color: 'rgba(0,0,0,0.85)', blur: 30, y: 10 }
    });
    Ty.rule(ctx, W / 2, 1012, 700, U.norm(t, 20.05, 20.5), C.gold, 5);

    Ty.line(ctx, {
      text: 'Desde las 10:00 AM',
      spec: { family: Ty.FAM.sans, size: 84, weight: 800, spacing: 0 },
      x: W / 2, y: 1152, maxWidth: W - 190,
      mode: 'words', stagger: 0.42, p: U.norm(t, 20.55, 21.05), pOut: pOutAll,
      dy: 48, scaleIn: 1.08, blurIn: 14,
      fill: Ty.FILL.cream, shadow: { color: 'rgba(0,0,0,0.9)', blur: 28, y: 9 }
    });
    Ty.line(ctx, {
      text: 'hasta que cierre la fonda',
      spec: { family: Ty.FAM.sans, size: 58, weight: 600, spacing: 1 },
      x: W / 2, y: 1240, maxWidth: W - 210,
      mode: 'words', stagger: 0.42, p: U.norm(t, 21.25, 21.75), pOut: pOutAll,
      dy: 40, scaleIn: 1.05, blurIn: 12,
      fill: Ty.FILL.gold, shadow: { color: 'rgba(0,0,0,0.85)', blur: 24, y: 8 }
    });

    /* la carta, en la voz de la marca */
    var mp = U.norm(t, 21.85, 22.35);
    if (mp > 0 && pOutAll < 1) {
      ctx.save();
      ctx.globalAlpha = U.ease.outQuint(mp) * (1 - pOutAll);
      var bw = 900 * U.ease.outQuint(mp);
      U.rrect(ctx, W / 2 - bw / 2, 1348, bw, 74, 37);
      ctx.fillStyle = U.rgba('#1A0D08', 0.72); ctx.fill();
      ctx.strokeStyle = U.rgba(C.gold, 0.6); ctx.lineWidth = 2.5;
      U.rrect(ctx, W / 2 - bw / 2, 1348, bw, 74, 37); ctx.stroke();
      ctx.restore();
      Ty.line(ctx, {
        text: 'ANTICUCHOS · PAPAS FRITAS · TERREMOTOS · PÍSCOLAS',
        spec: { family: Ty.FAM.sans, size: 34, weight: 700, spacing: 2 },
        x: W / 2, y: 1397, maxWidth: 840,
        mode: 'block', p: U.norm(t, 22.0, 22.4), pOut: pOutAll,
        dy: 16, scaleIn: 1.02, blurIn: 6, fill: Ty.FILL.cream
      });
    }

    ctx.save();
    ctx.globalAlpha = U.norm(lt, 0.4, 1.2) * (1 - pOutAll);
    Fx.sparkles(ctx, t, { count: 14, x: W / 2, y: 860, radius: W * 0.5, alpha: 0.45, seed: 2211 });
    ctx.restore();
  }

  /* ---------------- ESCENA 6 — CIERRE / CTA ---------------- */
  function scene6(ctx, t) {
    var lt = t - 23.4;
    var hh = handheld(t);
    var q = U.norm(lt, 0, 5.4);

    M.backdrop(ctx, 'amigos', {
      zoom: U.lerp(1.6, 1.42, U.ease.outQuart(q)), blur: 28, darken: 0.68,
      panX: hh.x, panY: hh.y, anchorY: 0.38
    });

    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    U.glow(ctx, W * 0.5, H * 0.30, W * 0.9, C.ember, 0.22);
    ctx.restore();

    ctx.save();
    A.blurGroup(ctx, 5, 0.9, function (c) {
      A.bunting(c, t, { y0: -50, y1: -30, sag: 96, count: 13, size: 72 });
    });
    ctx.restore();
    A.stringLights(ctx, t, { y0: H * 0.955, y1: H * 0.975, sag: -110, count: 12, phase: 2.4, scale: 0.95 });

    /* banderas a los costados */
    var fw = U.ease.outCubic(U.norm(lt, 0.1, 0.7));
    ctx.save();
    ctx.globalAlpha = fw * 0.9;
    ctx.translate(0, (1 - fw) * 90);
    G.flag(ctx, W * 0.10, H * 0.215, 180, t * 1.05, 1.15);
    G.flag(ctx, W * 0.90, H * 0.215, 180, t * 1.05 + 1.7, 1.15);
    ctx.restore();

    /* logo */
    var ep = U.ease.outBack(U.norm(lt, 0.05, 0.78), 1.15);
    if (ep > 0.01) {
      ctx.save();
      ctx.globalAlpha = U.clamp(ep, 0, 1);
      var es = U.clamp(ep, 0.01, 1.05) * (1 + Math.sin(t * 1.6) * 0.007);
      M.badge(ctx, W / 2, 500, 400 * es, { rotate: (1 - ep) * 0.16, glowAlpha: 0.5 });
      ctx.restore();
      Ty.shine(ctx, W / 2, 500, 480, 480, U.norm(t, 24.35, 25.15), 0.5);
    }

    Ty.line(ctx, {
      text: 'TE ESPERAMOS EN',
      spec: { family: Ty.FAM.sans, size: 58, weight: 700, spacing: 6 },
      x: W / 2, y: 840, maxWidth: W - 200,
      mode: 'words', stagger: 0.4, p: U.norm(t, 24.05, 24.5),
      dy: 40, scaleIn: 1.05, blurIn: 12,
      fill: Ty.FILL.cream, shadow: { color: 'rgba(0,0,0,0.9)', blur: 26, y: 8 }
    });
    Ty.line(ctx, {
      text: 'SANTO DOMINGO',
      spec: { family: Ty.FAM.display, size: 140, weight: 400, spacing: 0 },
      x: W / 2, y: 972, maxWidth: W - 150,
      mode: 'chars', stagger: 0.5, p: U.norm(t, 24.28, 24.88),
      dy: 80, scaleIn: 1.18, blurIn: 20, ease: U.ease.slam,
      fill: Ty.FILL.gold, shadow: { color: 'rgba(0,0,0,0.92)', blur: 42, y: 12 },
      glow: { color: C.ember, alpha: 0.35 }
    });
    var fp = U.ease.outBack(U.norm(t, 24.7, 25.2));
    if (fp > 0.01) {
      ctx.save();
      ctx.globalAlpha = U.clamp(fp, 0, 1);
      G.flag(ctx, W / 2, 1056, 88 * U.clamp(fp, 0, 1.05), t * 0.95, 1);
      ctx.restore();
    }

    Ty.line(ctx, {
      text: 'LA COCINA DEL TATA',
      spec: { family: Ty.FAM.brand, size: 74, weight: 400, spacing: 1 },
      x: W / 2, y: 1182, maxWidth: W - 170,
      mode: 'chars', stagger: 0.45, p: U.norm(t, 25.0, 25.6),
      dy: 52, scaleIn: 1.1, blurIn: 16,
      fill: Ty.FILL.cream, shadow: { color: 'rgba(0,0,0,0.9)', blur: 30, y: 10 }
    });
    Ty.line(ctx, {
      text: 'Tradición en cada plato',
      spec: { family: Ty.FAM.hand, size: 64, weight: 600, spacing: 0 },
      x: W / 2, y: 1262, maxWidth: W - 280,
      mode: 'words', stagger: 0.4, p: U.norm(t, 25.35, 25.85),
      dy: 28, scaleIn: 1.03, blurIn: 8,
      fill: Ty.FILL.gold, shadow: { color: 'rgba(0,0,0,0.85)', blur: 20, y: 6 }
    });

    var ctaBox = Ty.line(ctx, {
      text: 'VEN A CELEBRAR CON NOSOTROS',
      spec: { family: Ty.FAM.sans, size: 48, weight: 600, spacing: 2 },
      x: W / 2 - 32, y: 1356, maxWidth: W - 260,
      mode: 'words', stagger: 0.4, p: U.norm(t, 25.75, 26.25),
      dy: 34, scaleIn: 1.04, blurIn: 10,
      fill: Ty.FILL.cream, shadow: { color: 'rgba(0,0,0,0.9)', blur: 22, y: 7 }
    });
    var hp = U.ease.outBack(U.norm(t, 26.1, 26.55));
    if (hp > 0.01) {
      ctx.save();
      ctx.globalAlpha = U.clamp(hp, 0, 1);
      var beat = 1 + Math.pow(Math.max(0, Math.sin((t - 26.1) * 3.6)), 6) * 0.16;
      G.heart(ctx, ctaBox.right + 52, 1342, 58 * U.clamp(hp, 0, 1.05) * beat);
      ctx.restore();
    }

    /* franja final */
    var sp = U.norm(t, 26.4, 26.9);
    if (sp > 0) {
      ctx.save();
      ctx.globalAlpha = sp;
      var bw = 880 * U.ease.outQuint(sp);
      U.rrect(ctx, W / 2 - bw / 2, 1440, bw, 74, 37);
      var bgg = ctx.createLinearGradient(W / 2 - bw / 2, 0, W / 2 + bw / 2, 0);
      bgg.addColorStop(0, U.rgba(C.redDeep, 0.92));
      bgg.addColorStop(0.5, U.rgba(C.red, 0.96));
      bgg.addColorStop(1, U.rgba(C.redDeep, 0.92));
      ctx.fillStyle = bgg; ctx.fill();
      ctx.strokeStyle = U.rgba(C.gold, 0.8); ctx.lineWidth = 3;
      U.rrect(ctx, W / 2 - bw / 2, 1440, bw, 74, 37); ctx.stroke();
      ctx.restore();
      Ty.line(ctx, {
        text: 'COMIDA • TRAGOS • MÚSICA • TRADICIÓN',
        spec: { family: Ty.FAM.sans, size: 39, weight: 700, spacing: 3 },
        x: W / 2, y: 1491, maxWidth: 820,
        mode: 'block', p: U.norm(t, 26.55, 26.95),
        dy: 20, scaleIn: 1.03, blurIn: 8, fill: Ty.FILL.gold
      });
    }

    Fx.confetti(ctx, t, 23.45, { count: 76, alpha: 0.88, spread: 3.2, seed: 4040 });
    Fx.confetti(ctx, t, 26.3, { count: 28, alpha: 0.8, spread: 1.2, seed: 5151 });
    Fx.embers(ctx, t, { count: 34, alpha: 0.7, seed: 808 });
    ctx.save();
    ctx.globalAlpha = 0.75;
    Fx.sparkles(ctx, t, { count: 18, x: W / 2, y: 540, radius: W * 0.5, alpha: 0.65, seed: 6161 });
    ctx.restore();
  }

  /* ---------------- MONTAJE ---------------- */

  var SCENES = [scene1, scene2, scene3, scene4, scene5, scene6];

  function sceneIndex(t) {
    for (var i = CUT.length - 2; i >= 0; i--) if (t >= CUT[i]) return i;
    return 0;
  }

  R.render = function (ctx, t, opts) {
    opts = opts || {};
    t = U.clamp(t, 0, R.DURATION - 0.0001);
    var canvas = ctx.canvas;

    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, W, H);
    ctx.restore();

    var fx = cutFX(t);

    ctx.save();
    if (fx.dx || fx.sc !== 1) {
      ctx.translate(W / 2, H / 2);
      ctx.scale(fx.sc, fx.sc);
      ctx.translate(-W / 2 + fx.dx, -H / 2);
    }
    SCENES[sceneIndex(t)](ctx, t);
    ctx.restore();

    /* Desenfoque direccional del corte (copias desplazadas) */
    if (fx.blur > 0.6 && opts.quality !== 'low') {
      ctx.save();
      ctx.globalAlpha = 0.34;
      for (var i = 1; i <= 3; i++) {
        ctx.globalCompositeOperation = 'lighter';
        ctx.globalAlpha = 0.14;
        ctx.drawImage(canvas, fx.blur * i * 1.6, 0, W, H, 0, 0, W, H);
        ctx.drawImage(canvas, -fx.blur * i * 1.6, 0, W, H, 0, 0, W, H);
      }
      ctx.restore();
    }

    /* Post-proceso */
    if (opts.quality !== 'low') {
      Fx.bloom(canvas, ctx, 0.42, 1.5);
      Fx.lightLeak(ctx, t, 0.16, 5);
    }
    Fx.flash(ctx, fx.flash, '#FFE7C4');
    Fx.vignette(ctx, 0.62, '#05030A');

    /* Gradación cálida final */
    ctx.save();
    ctx.globalCompositeOperation = 'overlay';
    ctx.globalAlpha = 0.16;
    var grade = ctx.createLinearGradient(0, 0, 0, H);
    grade.addColorStop(0, '#2A4E8C');
    grade.addColorStop(0.5, '#FFB067');
    grade.addColorStop(1, '#5B1E12');
    ctx.fillStyle = grade;
    ctx.fillRect(0, 0, W, H);
    ctx.restore();

    Fx.grain(ctx, t, opts.quality === 'low' ? 0.08 : 0.115);

    /* Fundido de entrada y salida */
    var fadeIn = 1 - U.norm(t, 0, 0.18);
    var fadeOut = U.norm(t, R.DURATION - 0.42, R.DURATION - 0.02);
    if (fadeIn > 0 || fadeOut > 0) {
      ctx.save();
      ctx.globalAlpha = Math.max(fadeIn, fadeOut);
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, W, H);
      ctx.restore();
    }

    if (opts.safeGuides) {
      ctx.save();
      ctx.strokeStyle = 'rgba(0,255,190,0.55)';
      ctx.lineWidth = 3;
      ctx.setLineDash([16, 14]);
      ctx.strokeRect(R.SAFE.left, R.SAFE.top, R.SAFE.right - R.SAFE.left, R.SAFE.bottom - R.SAFE.top);
      ctx.restore();
    }
  };

  R.CUT = CUT;
  R.sceneIndex = sceneIndex;
  R.SCENE_NAMES = ['HOOK', 'INVITACIÓN', 'LA COCINA DEL TATA', 'COMIDA + TRAGOS', 'FECHAS', 'CIERRE'];

  T.R = R;
})(window.TATA = window.TATA || {});
