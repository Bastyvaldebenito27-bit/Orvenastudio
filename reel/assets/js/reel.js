/* reel.js — línea de tiempo, escenas y montaje del reel 9:16.
   render(ctx, t) es una función pura del tiempo: cualquier frame puede
   dibujarse por separado, lo que permite exportar el video cuadro a cuadro. */
(function (T) {
  'use strict';
  var U = T.U, C = U.C, G = T.G, Fx = T.Fx, A = T.A, Ty = T.Ty;
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
    var lt = t;
    var hh = handheld(t);

    if (lt < 0.62) {
      /* Plano detalle: bandera llenando el cuadro */
      var p = U.norm(lt, 0, 0.62);
      ctx.save();
      var bg = ctx.createLinearGradient(0, 0, W, H);
      bg.addColorStop(0, '#120A08');
      bg.addColorStop(1, '#05060C');
      ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
      pushCam(ctx, { s: 1.24 - p * 0.14, x: hh.x * 2, y: hh.y * 2, r: hh.r });
      ctx.save();
      ctx.translate(0, -30);
      G.flag(ctx, W * 0.5, H * 0.5, H * 0.78, t * 1.15, 1.25);
      ctx.restore();
      ctx.restore();
      /* contraluz */
      ctx.save();
      ctx.globalCompositeOperation = 'multiply';
      var vg = ctx.createRadialGradient(W * 0.5, H * 0.45, H * 0.1, W * 0.5, H * 0.5, H * 0.66);
      vg.addColorStop(0, 'rgba(255,255,255,1)');
      vg.addColorStop(1, 'rgba(18,10,6,1)');
      ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);
      ctx.restore();
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      U.glow(ctx, W * 0.5, H * 0.42, W * 0.7, C.ember, 0.3);
      ctx.restore();
      Fx.embers(ctx, t, { count: 34, alpha: 0.9, seed: 12 });
      Fx.flash(ctx, Math.max(0, 1 - lt * 5.5) * 0.8, '#FFE9C6');
      return;
    }

    /* Plano general de la fonda con empuje de cámara */
    var q = U.norm(lt, 0.62, 3.6);
    var s = U.lerp(1.16, 1.03, U.ease.outCubic(q));
    var px = U.lerp(-46, 30, U.ease.inOutCubic(q));
    pushCam(ctx, { s: s, x: hh.x, y: hh.y - 20 + q * 14, r: hh.r });
    A.fondaWide(ctx, t, { px: px, py: U.lerp(24, -10, q) });
    ctx.restore();

    /* Texto del gancho */
    var tin = 0.86;
    var pIn = U.norm(t, tin, tin + 0.62);
    var pIn2 = U.norm(t, tin + 0.2, tin + 0.86);
    var pOut = U.norm(t, 3.30, 3.58);

    ctx.save();
    ctx.globalAlpha = (1 - pOut) * U.norm(t, tin - 0.1, tin + 0.25);
    Ty.scrim(ctx, W / 2, 900, W * 1.15, 480, 0.72);
    ctx.restore();

    /* bandera sobre el titular */
    var fp = U.ease.outBack(U.norm(t, tin - 0.05, tin + 0.45));
    if (fp > 0.01) {
      ctx.save();
      ctx.globalAlpha = U.clamp(fp, 0, 1) * (1 - pOut);
      ctx.save();
      ctx.shadowColor = 'rgba(0,0,0,0.6)'; ctx.shadowBlur = 40; ctx.shadowOffsetY = 12;
      G.flag(ctx, W / 2, 648, 132 * U.clamp(fp, 0, 1.06), t * 0.9, 1);
      ctx.restore();
      ctx.restore();
    }

    var hero = { family: Ty.FAM.display, size: 156, weight: 400, spacing: -1 };
    Ty.line(ctx, {
      text: '¡SANTO DOMINGO', spec: hero, x: W / 2, y: 872, maxWidth: W - 150,
      mode: 'chars', stagger: 0.55, p: pIn, pOut: pOut, dy: 120, scaleIn: 1.22, blurIn: 22,
      fill: Ty.FILL.cream, shadow: { color: 'rgba(0,0,0,0.85)', blur: 42, y: 14 }
    });
    Ty.line(ctx, {
      text: 'ESTÁ DE FIESTA!', spec: hero, x: W / 2, y: 1030, maxWidth: W - 150,
      mode: 'chars', stagger: 0.55, p: pIn2, pOut: pOut, dy: 120, scaleIn: 1.22, blurIn: 22,
      fill: Ty.FILL.gold, shadow: { color: 'rgba(0,0,0,0.85)', blur: 42, y: 14 },
      glow: { color: C.ember, alpha: 0.35 }
    });
    Ty.rule(ctx, W / 2, 1082, 560, U.norm(t, tin + 0.55, tin + 1.0), C.gold, 5);
  }

  /* ---------------- ESCENA 2 — INVITACIÓN ---------------- */
  function scene2(ctx, t) {
    var lt = t - 3.6;
    var hh = handheld(t);

    if (lt < 1.82) {
      /* Parrilla en primer plano */
      var p = U.norm(lt, 0, 1.82);
      var bg = ctx.createLinearGradient(0, 0, 0, H);
      bg.addColorStop(0, '#0A0710');
      bg.addColorStop(0.45, '#24100A');
      bg.addColorStop(1, '#0A0503');
      ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);

      A.blurGroup(ctx, 15, 0.8, function (c) {
        A.crowd(c, t, { baseY: H * 0.24, count: 6, h: 160, seed: 88, walk: true });
        A.stringLights(c, t, { y0: H * 0.10, y1: H * 0.08, sag: 120, count: 12, scale: 1.2 });
      });

      pushCam(ctx, { s: U.lerp(1.02, 1.14, U.ease.inOutCubic(p)), x: hh.x, y: hh.y + U.lerp(40, -30, p), r: hh.r });
      A.grill(ctx, t, { x: W * 0.5, y: H * 0.435, w: W * 1.05, h: 430, meatScale: 1.45 });
      ctx.restore();

      Fx.embers(ctx, t, { count: 52, alpha: 0.95, seed: 202 });
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      U.glow(ctx, W * 0.5, H * 0.46, W * 0.7, C.ember, 0.2);
      ctx.restore();
    } else {
      /* Mesa servida */
      var q = U.norm(lt, 1.82, 3.6);
      pushCam(ctx, { s: U.lerp(1.14, 1.02, U.ease.outCubic(q)), x: hh.x, y: hh.y - 16, r: hh.r });
      foodTable(ctx, t);
      /* piezas sobre la tabla */
      var ph = U.ease.outBack(U.norm(lt, 1.86, 2.4));
      ctx.save();
      ctx.translate(0, (1 - ph) * 90);
      ctx.globalAlpha = U.clamp(ph, 0, 1);
      A.pastry(ctx, W * 0.28, H * 0.700, 0.96, -0.1, 11);
      A.pastry(ctx, W * 0.72, H * 0.685, 0.88, 0.14, 22);
      A.pastry(ctx, W * 0.50, H * 0.775, 1.08, 0.02, 33);
      ctx.restore();
      ctx.save();
      ctx.globalAlpha = U.clamp(U.norm(lt, 2.1, 2.6), 0, 1);
      A.glass(ctx, W * 0.12, H * 0.745, 0.7, t, 41, -0.05);
      A.glass(ctx, W * 0.89, H * 0.730, 0.66, t, 42, 0.06);
      ctx.restore();
      Fx.smoke(ctx, t, W * 0.5, H * 0.66, { count: 8, spread: 420, rise: 420, size: 90, alpha: 0.12, seed: 5 });
      ctx.restore();
      Fx.embers(ctx, t, { count: 22, alpha: 0.5, seed: 303 });
    }

    /* Texto de invitación */
    var t0 = 4.05;
    var pOut = U.norm(t, 6.92, 7.18);
    ctx.save();
    ctx.globalAlpha = (1 - pOut) * U.norm(t, t0 - 0.15, t0 + 0.2);
    Ty.scrim(ctx, W / 2, 1140, W * 1.2, 430, 0.74);
    ctx.restore();

    Ty.line(ctx, {
      text: 'Este 18, ven a vivir la',
      spec: { family: Ty.FAM.sans, size: 66, weight: 600, spacing: 1 },
      x: W / 2, y: 1012, maxWidth: W - 190,
      mode: 'words', stagger: 0.5, p: U.norm(t, t0, t0 + 0.6), pOut: pOut,
      dy: 46, scaleIn: 1.06, blurIn: 12,
      fill: Ty.FILL.cream, shadow: { color: 'rgba(0,0,0,0.8)', blur: 26, y: 8 }
    });
    Ty.line(ctx, {
      text: 'FIESTA DE LA CHILENIDAD',
      spec: { family: Ty.FAM.display, size: 116, weight: 400, spacing: 0 },
      x: W / 2, y: 1148, maxWidth: W - 150,
      mode: 'chars', stagger: 0.6, p: U.norm(t, t0 + 0.28, t0 + 1.06), pOut: pOut,
      dy: 96, scaleIn: 1.18, blurIn: 20,
      fill: Ty.FILL.gold, shadow: { color: 'rgba(0,0,0,0.85)', blur: 36, y: 12 },
      glow: { color: C.ember, alpha: 0.3 }
    });
    Ty.rule(ctx, W / 2, 1196, 520, U.norm(t, t0 + 0.85, t0 + 1.3), C.gold, 4);
    var fp = U.ease.outBack(U.norm(t, t0 + 1.0, t0 + 1.5));
    if (fp > 0.01) {
      ctx.save();
      ctx.globalAlpha = U.clamp(fp, 0, 1) * (1 - pOut);
      G.flag(ctx, W / 2, 1292, 96 * U.clamp(fp, 0, 1.05), t * 0.9, 1);
      ctx.restore();
    }
  }

  /* ---------------- ESCENA 3 — LA COCINA DEL TATA ---------------- */
  function scene3(ctx, t) {
    var lt = t - 7.2;
    var hh = handheld(t);
    var q = U.norm(lt, 0, 5.4);

    /* interior de la fonda, cálido y oscuro */
    var bg = ctx.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0, '#080610');
    bg.addColorStop(0.42, '#1A0D09');
    bg.addColorStop(0.75, '#2A1308');
    bg.addColorStop(1, '#080403');
    ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);

    pushCam(ctx, { s: U.lerp(1.08, 1.0, U.ease.outQuart(q)), x: hh.x, y: hh.y, r: hh.r });

    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    U.glow(ctx, W * 0.5, H * 0.52, W * 0.8, C.ember, 0.2);
    ctx.restore();

    /* gente al fondo, fuera de foco */
    A.blurGroup(ctx, 18, 0.55, function (c) {
      A.crowd(c, t, { baseY: H * 0.90, count: 9, h: 250, seed: 707, walk: true, spread: 50 });
    });

    /* luces encendiéndose en secuencia */
    var on = U.ease.outCubic(U.norm(lt, 0.18, 1.25));
    A.stringLights(ctx, t, { y0: H * 0.115, y1: H * 0.095, sag: 120, count: 14, on: on, scale: 1.1 });
    A.stringLights(ctx, t, { y0: H * 0.90, y1: H * 0.92, sag: -96, count: 12, on: on, phase: 1.8, scale: 0.9 });

    A.blurGroup(ctx, 6, 0.85, function (c) {
      A.bunting(c, t, { y0: H * 0.04, y1: H * 0.06, sag: 92, count: 12, size: 70 });
    });

    /* letrero bajando desde el alero */
    var drop = U.ease.outBack(U.norm(lt, 0.62, 1.55), 1.05);
    var signCY = U.lerp(-H * 0.35, 1150, U.clamp(drop, 0, 1));
    var sw = 900, sh = 470;
    A.sign(ctx, W / 2, signCY, sw, sh, t, { ropeLen: Math.max(60, signCY - sh / 2 - 60), swing: 0.016 * (1 - q * 0.55) });

    /* contenido del letrero: acompaña el balanceo */
    var sgn = Math.sin(t * 1.15) * 0.016 * (1 - q * 0.55);
    var pivotY = signCY - sh * 0.5 - Math.max(60, signCY - sh / 2 - 60);
    ctx.save();
    ctx.translate(W / 2, pivotY);
    ctx.rotate(sgn);
    ctx.translate(-W / 2, -pivotY);

    var bt = 8.7;
    var brand = { family: Ty.FAM.brand, size: 106, weight: 400, spacing: 1 };
    Ty.line(ctx, {
      text: 'LA COCINA', spec: brand, x: W / 2, y: signCY - 32, maxWidth: sw - 140,
      mode: 'chars', stagger: 0.5, p: U.norm(t, bt, bt + 0.6),
      dy: 58, scaleIn: 1.1, blurIn: 16,
      fill: Ty.FILL.gold, shadow: { color: 'rgba(0,0,0,0.85)', blur: 26, y: 9 }
    });
    Ty.line(ctx, {
      text: 'DEL TATA', spec: brand, x: W / 2, y: signCY + 122, maxWidth: sw - 140,
      mode: 'chars', stagger: 0.5, p: U.norm(t, bt + 0.24, bt + 0.86),
      dy: 58, scaleIn: 1.1, blurIn: 16,
      fill: Ty.FILL.gold, shadow: { color: 'rgba(0,0,0,0.85)', blur: 26, y: 9 }
    });
    Ty.rule(ctx, W / 2, signCY + 168, sw * 0.6, U.norm(t, bt + 0.7, bt + 1.1), C.goldLight, 4);
    Ty.shine(ctx, W / 2, signCY + 40, sw * 0.92, sh * 0.8, U.norm(t, bt + 0.95, bt + 1.95), 0.6);
    ctx.restore();

    ctx.restore(); /* cámara */

    /* "Y pasa por" */
    var yt = 7.45;
    var pOut3 = U.norm(t, 12.3, 12.56);
    Ty.line(ctx, {
      text: 'Y pasa por',
      spec: { family: Ty.FAM.sans, size: 60, weight: 600, spacing: 4 },
      x: W / 2, y: 372, maxWidth: W - 240,
      mode: 'words', stagger: 0.4, p: U.norm(t, yt, yt + 0.5), pOut: pOut3,
      dy: 38, scaleIn: 1.05, blurIn: 12,
      fill: Ty.FILL.cream, shadow: { color: 'rgba(0,0,0,0.8)', blur: 24, y: 8 }
    });

    /* medallón de marca, sobre el letrero */
    var ep = U.ease.outBack(U.norm(lt, 1.35, 2.15), 1.2);
    if (ep > 0.01) {
      ctx.save();
      ctx.globalAlpha = U.clamp(ep, 0, 1) * (1 - pOut3);
      ctx.translate(W / 2, 662);
      var es = U.clamp(ep, 0.01, 1.05);
      ctx.scale(es, es);
      ctx.rotate((1 - ep) * -0.22);
      ctx.shadowColor = 'rgba(0,0,0,0.85)'; ctx.shadowBlur = 54; ctx.shadowOffsetY = 16;
      G.emblem(ctx, 0, 0, 270, {});
      ctx.restore();
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      ctx.globalAlpha = 0.42 * U.clamp(ep, 0, 1) * (1 - pOut3);
      U.glow(ctx, W / 2, 662, 250, C.gold, 0.4);
      ctx.restore();
    }

    /* corazón bajo el letrero */
    var hp = U.ease.outElastic(U.norm(t, 10.3, 11.1));
    if (hp > 0.01) {
      ctx.save();
      ctx.globalAlpha = U.clamp(hp * 1.2, 0, 1) * (1 - pOut3);
      var beat = 1 + Math.pow(Math.max(0, Math.sin((t - 10.35) * 3.4)), 6) * 0.14;
      ctx.shadowColor = 'rgba(216,48,43,0.85)'; ctx.shadowBlur = 54;
      G.heart(ctx, W / 2, 1490, 124 * U.clamp(hp, 0, 1.1) * beat);
      ctx.restore();
    }

    /* chispitas de la marca */
    ctx.save();
    ctx.globalAlpha = U.norm(lt, 1.4, 2.2) * (1 - U.norm(lt, 4.9, 5.4));
    Fx.sparkles(ctx, t, { count: 22, x: W / 2, y: H * 0.48, radius: W * 0.52, alpha: 0.75, seed: 9911 });
    ctx.restore();
    Fx.embers(ctx, t, { count: 28, alpha: 0.5, seed: 404 });
    Fx.dust(ctx, t, { count: 14, alpha: 0.12, size: 2.2 });
  }

  /* ---------------- ESCENA 4 — COMIDA + TRAGOS ---------------- */
  function scene4(ctx, t) {
    var lt = t - 12.6;
    var hh = handheld(t);
    var shots = [12.6, 13.95, 15.30, 16.65, 18.0];
    var idx = 0;
    for (var i = 0; i < 4; i++) if (t >= shots[i]) idx = i;
    var s0 = shots[idx], s1 = shots[idx + 1];
    var sp = U.norm(t, s0, s1);

    if (idx === 0) {
      /* Comida */
      pushCam(ctx, { s: U.lerp(1.16, 1.02, U.ease.outCubic(sp)), x: hh.x, y: hh.y + U.lerp(30, -18, sp), r: hh.r });
      foodTable(ctx, t);
      A.pastry(ctx, W * 0.25, H * 0.545, 1.02, -0.13, 51);
      A.pastry(ctx, W * 0.75, H * 0.530, 0.94, 0.18, 52);
      A.pastry(ctx, W * 0.50, H * 0.625, 1.2, 0.0, 53);
      A.pastry(ctx, W * 0.17, H * 0.665, 0.84, 0.26, 54);
      A.pastry(ctx, W * 0.83, H * 0.655, 0.88, -0.22, 55);
      Fx.smoke(ctx, t, W * 0.5, H * 0.56, { count: 10, spread: 520, rise: 460, size: 96, alpha: 0.1, seed: 15 });
      ctx.restore();
    } else if (idx === 1) {
      /* Tragos + brindis */
      pushCam(ctx, { s: U.lerp(1.12, 1.03, U.ease.outCubic(sp)), x: hh.x, y: hh.y, r: hh.r });
      var bg = ctx.createLinearGradient(0, 0, 0, H);
      bg.addColorStop(0, '#0A0611');
      bg.addColorStop(0.5, '#28130C');
      bg.addColorStop(1, '#0B0504');
      ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      U.glow(ctx, W * 0.5, H * 0.40, W * 0.72, C.ember, 0.26);
      ctx.restore();
      A.blurGroup(ctx, 16, 0.7, function (c) {
        A.crowd(c, t, { baseY: H * 0.38, count: 8, h: 200, seed: 617, walk: true });
        A.stringLights(c, t, { y0: H * 0.11, y1: H * 0.09, sag: 130, count: 12, scale: 1.3 });
      });
      Fx.bokeh(ctx, t, { count: 16, alpha: 0.4, seed: 818 });

      /* brindis: dos vasos que se acercan y chocan */
      var clinkT = 14.38;
      var app = U.ease.outCubic(U.norm(t, 13.98, clinkT));
      var rec = U.ease.outQuint(U.norm(t, clinkT, clinkT + 0.5));
      var gap = U.lerp(400, 112, app) + rec * 44;
      var jolt = Math.exp(-Math.max(0, t - clinkT) * 12) * Math.sin((t - clinkT) * 52) * 16;
      if (t < clinkT) jolt = 0;
      A.glass(ctx, W * 0.5 - gap / 2 - jolt, H * 0.525, 1.48, t, 71, 0.10 - app * 0.03);
      A.glass(ctx, W * 0.5 + gap / 2 + jolt, H * 0.520, 1.48, t, 72, -0.10 + app * 0.03);
      if (t >= clinkT && t < clinkT + 0.6) {
        var sparkP = U.norm(t, clinkT, clinkT + 0.5);
        ctx.save();
        ctx.globalCompositeOperation = 'screen';
        ctx.globalAlpha = 1 - sparkP;
        U.glow(ctx, W * 0.5, H * 0.43, 260 * (0.4 + sparkP), C.goldLight, 0.85);
        ctx.restore();
        Fx.sparkles(ctx, t, { count: 16, x: W * 0.5, y: H * 0.43, radius: 300 * (0.3 + sparkP), alpha: 1 - sparkP, seed: 31 });
      }
      ctx.restore();
      Fx.embers(ctx, t, { count: 26, alpha: 0.6, seed: 505 });
    } else if (idx === 2) {
      /* Ambiente: baile y guitarra */
      pushCam(ctx, { s: U.lerp(1.10, 1.02, U.ease.outCubic(sp)), x: hh.x, y: hh.y - 10, r: hh.r });
      var bg2 = ctx.createLinearGradient(0, 0, 0, H);
      bg2.addColorStop(0, '#07060F');
      bg2.addColorStop(0.45, '#1A0D14');
      bg2.addColorStop(0.72, '#45200E');
      bg2.addColorStop(1, '#0B0504');
      ctx.fillStyle = bg2; ctx.fillRect(0, 0, W, H);
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      U.glow(ctx, W * 0.5, H * 0.55, W * 0.9, C.ember, 0.36);
      U.glow(ctx, W * 0.2, H * 0.5, W * 0.3, C.red, 0.2);
      ctx.restore();

      A.stringLights(ctx, t, { y0: H * 0.16, y1: H * 0.13, sag: 150, count: 15, scale: 1.15 });
      A.blurGroup(ctx, 5, 1, function (c) {
        A.bunting(c, t, { y0: H * 0.075, y1: H * 0.095, sag: 110, count: 13, size: 80 });
      });

      /* piso iluminado */
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      ctx.globalAlpha = 0.35;
      var fl = ctx.createRadialGradient(W * 0.5, H * 0.61, 20, W * 0.5, H * 0.61, W * 0.6);
      fl.addColorStop(0, U.rgba(C.emberHot, 0.6));
      fl.addColorStop(1, U.rgba(C.ember, 0));
      ctx.fillStyle = fl; ctx.fillRect(0, H * 0.45, W, H * 0.4);
      ctx.restore();

      A.blurGroup(ctx, 8, 0.8, function (c) {
        A.crowd(c, t, { baseY: H * 0.50, count: 7, h: 160, seed: 919, walk: true });
      });
      A.guitarist(ctx, W * 0.145, H * 0.600, 300, t, 5);
      A.cuecaPair(ctx, W * 0.58, H * 0.618, 380, t, 3);
      A.person(ctx, W * 0.915, H * 0.606, 268, 250, t, { raise: 1 });
      ctx.restore();
      Fx.embers(ctx, t, { count: 34, alpha: 0.7, seed: 606 });
      Fx.dust(ctx, t, { count: 12, alpha: 0.14, size: 2 });
    } else {
      /* Sabor: parrilla + mesa, plano amplio */
      pushCam(ctx, { s: U.lerp(1.14, 1.0, U.ease.outCubic(sp)), x: hh.x, y: hh.y, r: hh.r });
      var bg3 = ctx.createLinearGradient(0, 0, 0, H);
      bg3.addColorStop(0, '#080610');
      bg3.addColorStop(0.4, '#20100A');
      bg3.addColorStop(1, '#090403');
      ctx.fillStyle = bg3; ctx.fillRect(0, 0, W, H);
      A.blurGroup(ctx, 14, 0.75, function (c) {
        A.crowd(c, t, { baseY: H * 0.30, count: 8, h: 175, seed: 1212, walk: true });
        A.stringLights(c, t, { y0: H * 0.09, y1: H * 0.07, sag: 120, count: 13, scale: 1.25 });
      });
      A.grill(ctx, t, { x: W * 0.5, y: H * 0.40, w: W * 0.98, h: 330, meatScale: 1.1, seed: 321 });
      A.board(ctx, -50, H * 0.575, W + 100, H * 0.46, 818);
      A.pastry(ctx, W * 0.21, H * 0.655, 0.86, -0.1, 61);
      A.pastry(ctx, W * 0.79, H * 0.648, 0.8, 0.14, 62);
      A.glass(ctx, W * 0.50, H * 0.685, 0.8, t, 63, 0);
      Fx.smoke(ctx, t, W * 0.5, H * 0.42, { count: 12, spread: 620, rise: 520, size: 110, alpha: 0.09, seed: 9 });
      ctx.restore();
      Fx.embers(ctx, t, { count: 40, alpha: 0.8, seed: 707 });
    }

    /* Etiquetas — una por plano */
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
      var yLab = 1272;
      ctx.save();
      ctx.globalAlpha = pIn * (1 - pOut);
      Ty.scrim(ctx, W / 2, yLab - 20, W * 1.2, 340, 0.76);
      ctx.restore();

      var spec = { family: Ty.FAM.display, size: idx === 3 ? 132 : 158, weight: 400, spacing: idx === 3 ? 0 : 2 };
      var box = Ty.line(ctx, {
        text: L.text, spec: spec, x: W / 2, y: yLab, maxWidth: W - 230,
        mode: 'chars', stagger: 0.42, p: pIn, pOut: pOut,
        dy: 70, scaleIn: 1.2, blurIn: 18, ease: U.ease.slam,
        fill: idx === 3 ? Ty.FILL.gold : Ty.FILL.cream,
        shadow: { color: 'rgba(0,0,0,0.85)', blur: 38, y: 12 },
        glow: idx === 3 ? { color: C.ember, alpha: 0.32 } : null
      });

      /* glifo acompañante */
      var gp = U.ease.outBack(U.norm(t, L.t0 + 0.18, L.t0 + 0.6));
      if (gp > 0.01) {
        ctx.save();
        ctx.globalAlpha = U.clamp(gp, 0, 1) * (1 - pOut);
        var gy = yLab + 128;
        var gs = U.clamp(gp, 0, 1.06);
        if (L.glyph === 'flag') G.flag(ctx, W / 2, gy, 104 * gs, t * 0.9, 1);
        else if (L.glyph === 'drink') G.drink(ctx, W / 2, gy, 128 * gs, t);
        else if (L.glyph === 'music') G.music(ctx, W / 2, gy, 118 * gs, C.goldLight);
        else G.heart(ctx, W / 2, gy, 118 * gs * (1 + Math.pow(Math.max(0, Math.sin((t - L.t0) * 3.6)), 6) * 0.12));
        ctx.restore();
      }

      /* indicador de progreso del bloque */
      ctx.save();
      ctx.globalAlpha = 0.85 * pIn * (1 - pOut);
      for (var k = 0; k < 4; k++) {
        var dx2 = W / 2 + (k - 1.5) * 44;
        ctx.beginPath();
        ctx.arc(dx2, 1108, k === idx ? 8 : 5, 0, Math.PI * 2);
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

    pushCam(ctx, { s: U.lerp(1.08, 1.0, U.ease.outQuart(q)), x: hh.x * 0.6, y: hh.y * 0.6, r: hh.r * 0.5 });
    warmBokeh(ctx, t, { bokeh: 0.38 });
    ctx.restore();

    /* velo para legibilidad máxima */
    ctx.save();
    var vg = ctx.createLinearGradient(0, H * 0.10, 0, H * 0.92);
    vg.addColorStop(0, 'rgba(6,4,8,0.15)');
    vg.addColorStop(0.28, 'rgba(6,4,8,0.74)');
    vg.addColorStop(0.75, 'rgba(6,4,8,0.76)');
    vg.addColorStop(1, 'rgba(6,4,8,0.2)');
    ctx.fillStyle = vg;
    ctx.fillRect(0, H * 0.10, W, H * 0.82);
    ctx.restore();

    /* marca arriba, para recordarla junto a la información */
    Ty.line(ctx, {
      text: 'LA COCINA DEL TATA',
      spec: { family: Ty.FAM.brand, size: 52, weight: 400, spacing: 2 },
      x: W / 2, y: 430, maxWidth: W - 240,
      mode: 'block', p: U.norm(t, 18.05, 18.5), pOut: U.norm(t, 23.1, 23.38),
      dy: 30, scaleIn: 1.04, blurIn: 10,
      fill: Ty.FILL.gold, shadow: { color: 'rgba(0,0,0,0.8)', blur: 22, y: 6 }
    });
    Ty.rule(ctx, W / 2, 470, 420, U.norm(t, 18.25, 18.7), C.gold, 3);

    /* Fechas: cada número entra en su golpe */
    var dates = ['17', '18', '19'];
    var hits = [18.12, 18.72, 19.32];
    var specN = { family: Ty.FAM.display, size: 228, weight: 400, spacing: 0 };
    var sepSpec = { family: Ty.FAM.display, size: 116, weight: 400, spacing: 0 };
    ctx.save();
    Ty.set(ctx, specN);
    var wNum = ctx.measureText('17').width;
    Ty.set(ctx, sepSpec);
    var wSep = ctx.measureText('•').width;
    ctx.restore();
    var gapX = 44;
    var totalW = wNum * 3 + wSep * 2 + gapX * 4;
    var startX = W / 2 - totalW / 2;
    var yNum = 790;
    var pOutAll = U.norm(t, 23.1, 23.38);

    for (var i = 0; i < 3; i++) {
      var cx = startX + i * (wNum + wSep + gapX * 2) + wNum / 2;
      var pn = U.norm(t, hits[i], hits[i] + 0.42);
      var punch = 1 + Math.exp(-Math.max(0, t - hits[i]) * 11) * 0.22 * (t >= hits[i] ? 1 : 0);
      ctx.save();
      ctx.globalAlpha = 1;
      ctx.translate(cx, yNum - specN.size * 0.34);
      ctx.scale(punch, punch);
      ctx.translate(-cx, -(yNum - specN.size * 0.34));
      Ty.line(ctx, {
        text: dates[i], spec: specN, x: cx, y: yNum,
        mode: 'block', p: pn, pOut: pOutAll,
        dy: 90, scaleIn: 1.35, blurIn: 26, ease: U.ease.slam,
        fill: Ty.FILL.cream, shadow: { color: 'rgba(0,0,0,0.9)', blur: 44, y: 14 },
        glow: { color: C.gold, alpha: 0.3 }
      });
      ctx.restore();
      if (i < 2) {
        var cxs = startX + i * (wNum + wSep + gapX * 2) + wNum + gapX + wSep / 2;
        Ty.line(ctx, {
          text: '•', spec: sepSpec, x: cxs, y: yNum - 54,
          mode: 'block', p: U.norm(t, hits[i] + 0.22, hits[i] + 0.5), pOut: pOutAll,
          dy: 20, scaleIn: 1.6, blurIn: 10,
          fill: Ty.FILL.gold
        });
      }
    }

    Ty.line(ctx, {
      text: 'DE SEPTIEMBRE',
      spec: { family: Ty.FAM.display, size: 104, weight: 400, spacing: 8 },
      x: W / 2, y: 920, maxWidth: W - 180,
      mode: 'chars', stagger: 0.5, p: U.norm(t, 19.62, 20.15), pOut: pOutAll,
      dy: 56, scaleIn: 1.12, blurIn: 16,
      fill: Ty.FILL.gold, shadow: { color: 'rgba(0,0,0,0.85)', blur: 30, y: 10 }
    });
    Ty.rule(ctx, W / 2, 972, 700, U.norm(t, 20.05, 20.5), C.gold, 5);

    /* Horario */
    Ty.line(ctx, {
      text: 'Desde las 10:00 AM',
      spec: { family: Ty.FAM.sans, size: 84, weight: 800, spacing: 0 },
      x: W / 2, y: 1112, maxWidth: W - 190,
      mode: 'words', stagger: 0.42, p: U.norm(t, 20.55, 21.05), pOut: pOutAll,
      dy: 48, scaleIn: 1.08, blurIn: 14,
      fill: Ty.FILL.cream, shadow: { color: 'rgba(0,0,0,0.85)', blur: 28, y: 9 }
    });
    Ty.line(ctx, {
      text: 'hasta que cierre la fonda',
      spec: { family: Ty.FAM.sans, size: 60, weight: 600, spacing: 1 },
      x: W / 2, y: 1206, maxWidth: W - 210,
      mode: 'words', stagger: 0.42, p: U.norm(t, 21.25, 21.75), pOut: pOutAll,
      dy: 40, scaleIn: 1.05, blurIn: 12,
      fill: Ty.FILL.gold, shadow: { color: 'rgba(0,0,0,0.85)', blur: 24, y: 8 }
    });
    var pp = U.ease.outBack(U.norm(t, 21.72, 22.2));
    if (pp > 0.01) {
      ctx.save();
      ctx.globalAlpha = U.clamp(pp, 0, 1) * (1 - pOutAll);
      G.party(ctx, W / 2, 1338, 168 * U.clamp(pp, 0, 1.05), t);
      ctx.restore();
    }

    ctx.save();
    ctx.globalAlpha = U.norm(lt, 0.4, 1.2) * (1 - pOutAll);
    Fx.sparkles(ctx, t, { count: 14, x: W / 2, y: 830, radius: W * 0.5, alpha: 0.5, seed: 2211 });
    ctx.restore();
  }

  /* ---------------- ESCENA 6 — CIERRE / CTA ---------------- */
  function scene6(ctx, t) {
    var lt = t - 23.4;
    var hh = handheld(t);
    var q = U.norm(lt, 0, 5.4);

    pushCam(ctx, { s: U.lerp(1.12, 1.0, U.ease.outQuart(q)), x: hh.x, y: hh.y, r: hh.r });

    var bg = ctx.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0, '#070511');
    bg.addColorStop(0.35, '#1A0C0C');
    bg.addColorStop(0.68, '#3A160C');
    bg.addColorStop(1, '#0A0504');
    ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);

    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    U.glow(ctx, W * 0.5, H * 0.34, W * 0.95, C.ember, 0.3);
    U.glow(ctx, W * 0.5, H * 0.88, W * 0.6, C.red, 0.2);
    ctx.restore();

    /* gentío celebrando al fondo */
    A.blurGroup(ctx, 14, 0.72, function (c) {
      A.crowd(c, t, { baseY: H * 0.93, count: 11, h: 260, seed: 1313, walk: true, spread: 44 });
    });

    A.stringLights(ctx, t, { y0: H * 0.10, y1: H * 0.078, sag: 132, count: 15, scale: 1.15 });
    A.stringLights(ctx, t, { y0: H * 0.955, y1: H * 0.975, sag: -110, count: 12, phase: 2.4, scale: 0.95 });
    A.blurGroup(ctx, 4, 1, function (c) {
      A.bunting(c, t, { y0: H * 0.035, y1: H * 0.055, sag: 92, count: 13, size: 74 });
    });

    /* banderas ondeando a los costados */
    var fw = U.ease.outCubic(U.norm(lt, 0.1, 0.7));
    ctx.save();
    ctx.globalAlpha = fw;
    ctx.save();
    ctx.translate(0, (1 - fw) * 90);
    G.flag(ctx, W * 0.115, H * 0.30, 200, t * 1.05, 1.15);
    G.flag(ctx, W * 0.885, H * 0.30, 200, t * 1.05 + 1.7, 1.15);
    ctx.restore();
    ctx.restore();

    ctx.restore(); /* cámara */

    /* Emblema de marca */
    var ep = U.ease.outBack(U.norm(lt, 0.05, 0.75), 1.15);
    if (ep > 0.01) {
      ctx.save();
      ctx.globalAlpha = U.clamp(ep, 0, 1);
      ctx.translate(W / 2, 560);
      var es = U.clamp(ep, 0.01, 1.05) * (1 + Math.sin(t * 1.6) * 0.008);
      ctx.scale(es, es);
      ctx.rotate((1 - ep) * 0.18);
      ctx.shadowColor = 'rgba(0,0,0,0.8)'; ctx.shadowBlur = 60; ctx.shadowOffsetY = 18;
      G.emblem(ctx, 0, 0, 430, {});
      ctx.restore();
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      ctx.globalAlpha = 0.5 * U.clamp(ep, 0, 1);
      U.glow(ctx, W / 2, 560, 340, C.gold, 0.4);
      ctx.restore();
    }
    Ty.shine(ctx, W / 2, 560, 520, 520, U.norm(t, 24.35, 25.15), 0.5);

    /* CTA */
    ctx.save();
    ctx.globalAlpha = U.norm(t, 24.0, 24.35);
    Ty.scrim(ctx, W / 2, 1090, W * 1.25, 560, 0.66);
    ctx.restore();

    Ty.line(ctx, {
      text: 'TE ESPERAMOS EN',
      spec: { family: Ty.FAM.sans, size: 62, weight: 700, spacing: 6 },
      x: W / 2, y: 900, maxWidth: W - 200,
      mode: 'words', stagger: 0.4, p: U.norm(t, 24.05, 24.5),
      dy: 40, scaleIn: 1.05, blurIn: 12,
      fill: Ty.FILL.cream, shadow: { color: 'rgba(0,0,0,0.85)', blur: 26, y: 8 }
    });
    Ty.line(ctx, {
      text: 'SANTO DOMINGO',
      spec: { family: Ty.FAM.display, size: 142, weight: 400, spacing: 0 },
      x: W / 2, y: 1032, maxWidth: W - 150,
      mode: 'chars', stagger: 0.5, p: U.norm(t, 24.28, 24.88),
      dy: 80, scaleIn: 1.18, blurIn: 20, ease: U.ease.slam,
      fill: Ty.FILL.gold, shadow: { color: 'rgba(0,0,0,0.9)', blur: 40, y: 12 },
      glow: { color: C.ember, alpha: 0.35 }
    });
    var fp = U.ease.outBack(U.norm(t, 24.7, 25.2));
    if (fp > 0.01) {
      ctx.save();
      ctx.globalAlpha = U.clamp(fp, 0, 1);
      G.flag(ctx, W / 2, 1122, 92 * U.clamp(fp, 0, 1.05), t * 0.95, 1);
      ctx.restore();
    }

    Ty.line(ctx, {
      text: 'LA COCINA DEL TATA',
      spec: { family: Ty.FAM.brand, size: 80, weight: 400, spacing: 1 },
      x: W / 2, y: 1248, maxWidth: W - 170,
      mode: 'chars', stagger: 0.45, p: U.norm(t, 25.0, 25.6),
      dy: 52, scaleIn: 1.1, blurIn: 16,
      fill: Ty.FILL.cream, shadow: { color: 'rgba(0,0,0,0.85)', blur: 30, y: 10 }
    });
    Ty.rule(ctx, W / 2, 1288, 620, U.norm(t, 25.5, 25.95), C.gold, 4);

    var ctaP = U.norm(t, 25.75, 26.25);
    var ctaBox = Ty.line(ctx, {
      text: 'VEN A CELEBRAR CON NOSOTROS',
      spec: { family: Ty.FAM.sans, size: 52, weight: 600, spacing: 2 },
      x: W / 2 - 34, y: 1372, maxWidth: W - 260,
      mode: 'words', stagger: 0.4, p: ctaP,
      dy: 34, scaleIn: 1.04, blurIn: 10,
      fill: Ty.FILL.cream, shadow: { color: 'rgba(0,0,0,0.85)', blur: 22, y: 7 }
    });
    var hp = U.ease.outBack(U.norm(t, 26.1, 26.55));
    if (hp > 0.01) {
      ctx.save();
      ctx.globalAlpha = U.clamp(hp, 0, 1);
      var beat = 1 + Math.pow(Math.max(0, Math.sin((t - 26.1) * 3.6)), 6) * 0.16;
      G.heart(ctx, ctaBox.right + 56, 1356, 62 * U.clamp(hp, 0, 1.05) * beat);
      ctx.restore();
    }

    /* Franja final */
    var sp = U.norm(t, 26.4, 26.9);
    if (sp > 0) {
      ctx.save();
      ctx.globalAlpha = sp;
      var bw = 880 * U.ease.outQuint(sp), bh = 76;
      U.rrect(ctx, W / 2 - bw / 2, 1448, bw, bh, 38);
      var bgg = ctx.createLinearGradient(W / 2 - bw / 2, 0, W / 2 + bw / 2, 0);
      bgg.addColorStop(0, U.rgba(C.redDeep, 0.9));
      bgg.addColorStop(0.5, U.rgba(C.red, 0.95));
      bgg.addColorStop(1, U.rgba(C.redDeep, 0.9));
      ctx.fillStyle = bgg; ctx.fill();
      ctx.strokeStyle = U.rgba(C.gold, 0.8); ctx.lineWidth = 3;
      U.rrect(ctx, W / 2 - bw / 2, 1448, bw, bh, 38); ctx.stroke();
      ctx.restore();
      Ty.line(ctx, {
        text: 'COMIDA • TRAGOS • MÚSICA • TRADICIÓN',
        spec: { family: Ty.FAM.sans, size: 40, weight: 700, spacing: 3 },
        x: W / 2, y: 1500, maxWidth: 820,
        mode: 'block', p: U.norm(t, 26.55, 26.95),
        dy: 20, scaleIn: 1.03, blurIn: 8,
        fill: Ty.FILL.gold
      });
    }

    /* Celebración */
    Fx.confetti(ctx, t, 23.45, { count: 88, alpha: 0.9, spread: 3.0, seed: 4040 });
    Fx.confetti(ctx, t, 26.3, { count: 44, alpha: 0.85, spread: 1.1, seed: 5151 });
    Fx.embers(ctx, t, { count: 40, alpha: 0.8, seed: 808 });
    ctx.save();
    ctx.globalAlpha = 0.8;
    Fx.sparkles(ctx, t, { count: 20, x: W / 2, y: 620, radius: W * 0.55, alpha: 0.7, seed: 6161 });
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
