/* glyphs.js — íconos vectoriales propios (bandera, corazón, trago, música, fiesta).
   Se dibujan a mano en lugar de emoji del sistema: así el render es idéntico
   en el video exportado, en el navegador y en cualquier teléfono. */
(function (T) {
  'use strict';
  var U = T.U, C = U.C;
  var G = {};

  /* Bandera de Chile con ondeo. size = alto de la bandera.
     Se dibuja por franjas verticales continuas (no por celdas), así el borde
     queda limpio y el ondeo se lee suave a cualquier tamaño.
     wave: amplitud del ondeo (0 = plana). phase: fase temporal. */
  G.flag = function (ctx, x, y, size, phase, wave) {
    wave = wave === undefined ? 1 : wave;
    var h = size, w = size * 1.5;
    var cols = 72;
    var cw = w / cols;
    ctx.save();
    ctx.translate(x - w / 2, y - h / 2);

    function offAt(u) {
      return Math.sin(phase * 3.1 + u * 6.2) * (u * 0.9 + 0.1) * h * 0.13 * wave
        + Math.sin(phase * 2.2 + u * 4.0 + 1.3) * (u * 0.6) * h * 0.06 * wave;
    }
    function shadeAt(u) {
      var slope = Math.cos(phase * 3.1 + u * 6.2) * (u * 0.9 + 0.1) * wave;
      return U.clamp(0.74 + slope * 0.38, 0.46, 1.16);
    }

    var blue = [18, 56, 126], red = [190, 30, 35], white = [250, 247, 240];
    function col(c, k) {
      return 'rgb(' + Math.round(c[0] * k) + ',' + Math.round(c[1] * k) + ',' + Math.round(c[2] * k) + ')';
    }

    for (var i = 0; i < cols; i++) {
      var u = i / cols;
      var o = offAt(u), k = shadeAt(u);
      var px = i * cw;
      /* franja inferior roja */
      ctx.fillStyle = col(red, k);
      ctx.fillRect(px - 0.5, h * 0.5 + o, cw + 1, h * 0.5 + 2);
      /* franja superior: blanco, y cantón azul en el primer tercio */
      ctx.fillStyle = col(u < 1 / 3 ? blue : white, k);
      ctx.fillRect(px - 0.5, o - 1, cw + 1, h * 0.5 + 2);
    }

    /* estrella blanca sobre el cantón */
    var su = 1 / 6;
    G.star(ctx, w * su, h * 0.25 + offAt(su), h * 0.145, 'rgb(' +
      Math.round(255 * shadeAt(su)) + ',' + Math.round(255 * shadeAt(su)) + ',' + Math.round(250 * shadeAt(su)) + ')');

    /* sombra de pliegue para dar volumen */
    ctx.globalCompositeOperation = 'multiply';
    for (var j = 0; j < cols; j++) {
      var u2 = j / cols;
      var k2 = shadeAt(u2);
      if (k2 >= 0.92) continue;
      ctx.globalAlpha = (0.92 - k2) * 0.55;
      ctx.fillStyle = '#2A1408';
      ctx.fillRect(j * cw - 0.5, offAt(u2) - 1, cw + 1, h + 3);
    }
    ctx.restore();
  };

  /* Estrella de 5 puntas. r = radio exterior. */
  G.star = function (ctx, x, y, r, fill, rot) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot || 0);
    ctx.beginPath();
    for (var i = 0; i < 10; i++) {
      var rad = i % 2 === 0 ? r : r * 0.42;
      var a = -Math.PI / 2 + (i * Math.PI) / 5;
      var px = Math.cos(a) * rad, py = Math.sin(a) * rad;
      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fillStyle = fill || '#FFFFFF';
    ctx.fill();
    ctx.restore();
  };

  /* Corazón. size = ancho total. */
  G.heart = function (ctx, x, y, size, fill) {
    var s = size / 100;
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(s, s);
    ctx.beginPath();
    ctx.moveTo(0, 34);
    ctx.bezierCurveTo(-46, 4, -50, -30, -26, -40);
    ctx.bezierCurveTo(-10, -47, 0, -34, 0, -24);
    ctx.bezierCurveTo(0, -34, 10, -47, 26, -40);
    ctx.bezierCurveTo(50, -30, 46, 4, 0, 34);
    ctx.closePath();
    if (typeof fill === 'string' || !fill) {
      ctx.fillStyle = fill || C.redBright;
    } else { ctx.fillStyle = fill; }
    ctx.fill();
    /* brillo */
    ctx.globalAlpha = 0.35;
    ctx.beginPath();
    ctx.ellipse(-16, -26, 9, 6, -0.5, 0, Math.PI * 2);
    ctx.fillStyle = '#FFFFFF';
    ctx.fill();
    ctx.restore();
  };

  /* Vaso de trago (estilo terremoto/ponche) con pajita y burbujas. */
  G.drink = function (ctx, x, y, size, phase) {
    var s = size / 100;
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(s, s);
    /* pajita */
    ctx.save();
    ctx.rotate(0.22);
    ctx.fillStyle = C.cream;
    ctx.fillRect(10, -66, 7, 74);
    ctx.fillStyle = C.redBright;
    ctx.fillRect(10, -66, 7, 16);
    ctx.fillRect(10, -34, 7, 16);
    ctx.restore();
    /* copa */
    ctx.beginPath();
    ctx.moveTo(-34, -44);
    ctx.lineTo(34, -44);
    ctx.lineTo(24, 26);
    ctx.quadraticCurveTo(22, 34, 12, 34);
    ctx.lineTo(-12, 34);
    ctx.quadraticCurveTo(-22, 34, -24, 26);
    ctx.closePath();
    var g = ctx.createLinearGradient(-34, -44, 34, 34);
    g.addColorStop(0, 'rgba(255,214,140,0.95)');
    g.addColorStop(0.5, 'rgba(255,170,80,0.92)');
    g.addColorStop(1, 'rgba(226,112,44,0.95)');
    ctx.fillStyle = g;
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.55)';
    ctx.lineWidth = 4;
    ctx.stroke();
    /* burbujas */
    for (var i = 0; i < 5; i++) {
      var bp = ((phase || 0) * 0.6 + i * 0.21) % 1;
      ctx.globalAlpha = 0.55 * (1 - bp);
      ctx.beginPath();
      ctx.arc(-16 + i * 9, 28 - bp * 62, 3.2 - i * 0.25, 0, Math.PI * 2);
      ctx.fillStyle = '#FFFFFF';
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    /* base */
    ctx.fillStyle = 'rgba(255,255,255,0.22)';
    ctx.fillRect(-20, 34, 40, 6);
    ctx.restore();
  };

  /* Nota musical doble (corchea). */
  G.music = function (ctx, x, y, size, fill) {
    var s = size / 100;
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(s, s);
    ctx.fillStyle = fill || C.cream;
    ctx.beginPath();
    ctx.ellipse(-26, 28, 17, 12.5, -0.34, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(26, 18, 17, 12.5, -0.34, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(-13, -42, 7, 70);
    ctx.fillRect(39, -52, 7, 70);
    ctx.beginPath();
    ctx.moveTo(-13, -42);
    ctx.lineTo(46, -52);
    ctx.lineTo(46, -32);
    ctx.lineTo(-13, -22);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  };

  /* Ícono de celebración: estallido de confeti. */
  G.party = function (ctx, x, y, size, phase) {
    var s = size / 100;
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(s, s);
    /* cono */
    ctx.beginPath();
    ctx.moveTo(-46, 40);
    ctx.lineTo(-6, -6);
    ctx.lineTo(12, 12);
    ctx.closePath();
    var g = ctx.createLinearGradient(-46, 40, 12, -6);
    g.addColorStop(0, C.red);
    g.addColorStop(1, C.gold);
    ctx.fillStyle = g;
    ctx.fill();
    /* papelitos */
    var cols = [C.gold, C.cream, C.redBright, '#4C7FD1', C.emberHot];
    var r = U.rng(77);
    for (var i = 0; i < 11; i++) {
      var a = -0.2 - r() * 1.15;
      var d = 28 + r() * 54 + Math.sin((phase || 0) * 2 + i) * 4;
      var px = 4 + Math.cos(a) * d, py = 4 + Math.sin(a) * d;
      ctx.save();
      ctx.translate(px, py);
      ctx.rotate((phase || 0) * 2 + i);
      ctx.fillStyle = cols[i % cols.length];
      ctx.fillRect(-8.5, -5.5, 17, 11);
      ctx.restore();
    }
    ctx.restore();
  };

  /* Emblema circular de marca: olla + cuchara + trigo + estrella.
     Es el "logo" de La Cocina del Tata, construido en vectores. */
  G.emblem = function (ctx, x, y, size, opts) {
    opts = opts || {};
    var s = size / 200;
    var ringAlpha = opts.ringAlpha === undefined ? 1 : opts.ringAlpha;
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(s, s);

    /* disco de fondo */
    if (opts.plate !== false) {
      var bg = ctx.createRadialGradient(0, -30, 10, 0, 0, 200);
      bg.addColorStop(0, 'rgba(38,20,12,0.92)');
      bg.addColorStop(1, 'rgba(14,8,6,0.96)');
      ctx.beginPath(); ctx.arc(0, 0, 186, 0, Math.PI * 2);
      ctx.fillStyle = bg; ctx.fill();
    }

    /* anillos */
    ctx.globalAlpha = ringAlpha;
    ctx.lineWidth = 9;
    ctx.strokeStyle = C.gold;
    ctx.beginPath(); ctx.arc(0, 0, 178, 0, Math.PI * 2); ctx.stroke();
    ctx.lineWidth = 3.5;
    ctx.strokeStyle = U.rgba(C.goldLight, 0.85);
    ctx.beginPath(); ctx.arc(0, 0, 160, 0, Math.PI * 2); ctx.stroke();
    ctx.globalAlpha = 1;

    /* olla */
    ctx.save();
    ctx.translate(0, 30);
    ctx.lineCap = 'round';
    /* asas */
    ctx.lineWidth = 12; ctx.strokeStyle = C.gold;
    ctx.beginPath(); ctx.arc(-70, 14, 20, Math.PI * 0.62, Math.PI * 1.72); ctx.stroke();
    ctx.beginPath(); ctx.arc(70, 14, 20, Math.PI * 1.28, Math.PI * 0.38); ctx.stroke();
    /* cuerpo */
    ctx.fillStyle = C.gold;
    ctx.beginPath();
    ctx.moveTo(-66, -4);
    ctx.lineTo(66, -4);
    ctx.quadraticCurveTo(60, 62, 0, 66);
    ctx.quadraticCurveTo(-60, 62, -66, -4);
    ctx.closePath();
    ctx.fill();
    /* reborde superior de la olla */
    U.rrect(ctx, -72, -14, 144, 14, 7);
    ctx.fill();
    /* tapa */
    ctx.beginPath();
    ctx.moveTo(-56, -18);
    ctx.quadraticCurveTo(0, -46, 56, -18);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath(); ctx.arc(0, -50, 10, 0, Math.PI * 2); ctx.fill();
    /* sombra interior para dar volumen */
    ctx.globalAlpha = 0.22;
    ctx.fillStyle = '#5A3308';
    ctx.beginPath();
    ctx.moveTo(24, -4);
    ctx.lineTo(66, -4);
    ctx.quadraticCurveTo(60, 62, 0, 66);
    ctx.quadraticCurveTo(38, 46, 24, -4);
    ctx.closePath();
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.restore();

    /* vapor */
    ctx.strokeStyle = U.rgba(C.goldLight, 0.9);
    ctx.lineWidth = 7; ctx.lineCap = 'round';
    for (var i = -1; i <= 1; i++) {
      ctx.beginPath();
      var bx = i * 32;
      ctx.moveTo(bx, -28);
      ctx.bezierCurveTo(bx - 16, -54, bx + 16, -68, bx, -96);
      ctx.stroke();
    }

    /* estrella superior */
    G.star(ctx, 0, -126, 24, C.cream);

    /* espigas laterales */
    var wheat = function (dir) {
      ctx.save();
      ctx.scale(dir, 1);
      ctx.strokeStyle = C.gold; ctx.lineWidth = 6; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(118, 78); ctx.quadraticCurveTo(140, 20, 132, -40); ctx.stroke();
      for (var k = 0; k < 5; k++) {
        var tt = k / 5;
        var px = 122 + tt * 14 - tt * tt * 6, py = 66 - tt * 96;
        ctx.save(); ctx.translate(px, py); ctx.rotate(-0.5);
        ctx.fillStyle = C.gold;
        ctx.beginPath(); ctx.ellipse(16, 0, 15, 6.2, 0.55, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
      }
      ctx.restore();
    };
    wheat(1); wheat(-1);

    ctx.restore();
  };

  T.G = G;
})(window.TATA = window.TATA || {});
