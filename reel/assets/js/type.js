/* type.js — sistema tipográfico animado (kinetic type) para el reel. */
(function (T) {
  'use strict';
  var U = T.U, C = U.C;
  var Ty = {};

  Ty.FAM = {
    display: '"Anton", "Archivo", Impact, sans-serif',
    brand: '"Alfa Slab One", "Archivo", Georgia, serif',
    sans: '"Archivo", "Helvetica Neue", Arial, sans-serif',
    hand: '"Caveat", "Segoe Script", cursive'
  };

  function fontStr(spec) {
    return (spec.weight || 400) + ' ' + spec.size + 'px ' + (spec.family || Ty.FAM.sans);
  }

  Ty.set = function (ctx, spec) {
    ctx.font = fontStr(spec);
    ctx.letterSpacing = (spec.spacing || 0) + 'px';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
  };

  Ty.width = function (ctx, text, spec) {
    ctx.save(); Ty.set(ctx, spec);
    var w = ctx.measureText(text).width;
    ctx.restore();
    return w;
  };

  /* Ajusta el tamaño para que el texto quepa en maxW. Devuelve spec nuevo. */
  Ty.fit = function (ctx, text, spec, maxW) {
    var s = Object.assign({}, spec);
    var w = Ty.width(ctx, text, s);
    if (w > maxW) {
      s.size = Math.floor(s.size * (maxW / w));
      if (s.spacing) s.spacing = s.spacing * (maxW / w);
    }
    return s;
  };

  /* Relleno degradado vertical para texto. */
  Ty.grad = function (ctx, y, size, stops) {
    var g = ctx.createLinearGradient(0, y - size * 0.92, 0, y + size * 0.16);
    for (var i = 0; i < stops.length; i++) g.addColorStop(stops[i][0], stops[i][1]);
    return g;
  };

  Ty.FILL = {
    cream: [[0, '#FFFFFF'], [0.55, '#FBF3E6'], [1, '#EBD7B6']],
    gold: [[0, '#FFF3D0'], [0.42, '#F2CB74'], [0.78, '#E0A23C'], [1, '#C9822A']],
    warm: [[0, '#FFFFFF'], [0.5, '#FFE6C0'], [1, '#FFB871']],
    red: [[0, '#FF6A5C'], [0.5, '#D8302B'], [1, '#9E1518']]
  };

  /* Velo suave detrás del texto: garantiza legibilidad en teléfono. */
  Ty.scrim = function (ctx, x, y, w, h, alpha, tint) {
    ctx.save();
    var g = ctx.createRadialGradient(x, y, 0, x, y, Math.max(w, h) * 0.62);
    g.addColorStop(0, U.rgba(tint || C.shadow, alpha));
    g.addColorStop(0.55, U.rgba(tint || C.shadow, alpha * 0.66));
    g.addColorStop(1, U.rgba(tint || C.shadow, 0));
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.ellipse(x, y, Math.max(w, h) * 0.66, h * 0.85, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  };

  /* Divide en tokens animables. mode: 'chars' | 'words' | 'block' */
  function tokenize(ctx, text, spec, mode) {
    var out = [], i;
    if (mode === 'block') { out.push({ t: text }); }
    else if (mode === 'words') {
      var ws = text.split(' ');
      for (i = 0; i < ws.length; i++) out.push({ t: ws[i], sp: i < ws.length - 1 });
    } else {
      for (i = 0; i < text.length; i++) out.push({ t: text[i] });
    }
    ctx.save(); Ty.set(ctx, spec);
    var spaceW = ctx.measureText(' ').width;
    var total = 0;
    for (i = 0; i < out.length; i++) {
      out[i].w = ctx.measureText(out[i].t).width;
      out[i].x = total;
      total += out[i].w + (out[i].sp ? spaceW : 0);
    }
    ctx.restore();
    return { tokens: out, width: total };
  }

  /* Línea de texto animada.
     o = {
       text, spec:{family,size,weight,spacing}, x, y, align:'center'|'left'|'right',
       p: 0..1 progreso de entrada, pOut: 0..1 progreso de salida,
       mode:'chars'|'words'|'block', stagger: 0..1 (porción del progreso escalonada),
       fill: array de stops | color css, stroke:{color,width},
       shadow:{color,blur,y}, dy: desplazamiento de entrada en px,
       blurIn: px de desenfoque inicial, scaleIn: escala inicial,
       maxWidth, alphaMul, glow:{color,alpha,r}
     }
     Devuelve {width, height, left, right} de la caja dibujada. */
  Ty.line = function (ctx, o) {
    var spec = Object.assign({}, o.spec);
    if (o.maxWidth) spec = Ty.fit(ctx, o.text, spec, o.maxWidth);
    var mode = o.mode || 'block';
    var tk = tokenize(ctx, o.text, spec, mode);
    var p = U.clamp(o.p === undefined ? 1 : o.p, 0, 1);
    var pOut = U.clamp(o.pOut || 0, 0, 1);
    var align = o.align || 'center';
    var originX = align === 'center' ? o.x - tk.width / 2 : align === 'right' ? o.x - tk.width : o.x;
    var alphaMul = (o.alphaMul === undefined ? 1 : o.alphaMul) * (1 - pOut);
    if (alphaMul <= 0.001) return { width: tk.width, height: spec.size, left: originX, right: originX + tk.width };

    var n = tk.tokens.length;
    var stagger = o.stagger === undefined ? (mode === 'block' ? 0 : 0.45) : o.stagger;
    var easeIn = o.ease || U.ease.outQuint;

    for (var i = 0; i < n; i++) {
      var tok = tk.tokens[i];
      if (tok.t === ' ' || tok.t === '') continue;
      var s0 = n > 1 ? (i / (n - 1)) * stagger : 0;
      var lp = U.clamp((p - s0) / Math.max(0.0001, 1 - stagger), 0, 1);
      var e = easeIn(lp);
      if (e <= 0.001) continue;

      var dy = (o.dy === undefined ? spec.size * 0.42 : o.dy) * (1 - e);
      var dyOut = (o.dyOut === undefined ? -spec.size * 0.16 : o.dyOut) * pOut;
      var sc = U.lerp(o.scaleIn === undefined ? 1.14 : o.scaleIn, 1, e);
      var blur = (o.blurIn === undefined ? 16 : o.blurIn) * (1 - e) + (o.blurOut || 10) * pOut;
      var a = alphaMul * e;

      var cx = originX + tok.x + tok.w / 2;
      var by = o.y;

      ctx.save();
      ctx.globalAlpha = a;
      if (blur > 0.4) ctx.filter = 'blur(' + blur.toFixed(2) + 'px)';
      ctx.translate(cx, by + dy + dyOut);
      ctx.scale(sc, sc);
      if (o.rotIn) ctx.rotate(o.rotIn * (1 - e));
      ctx.translate(-cx, -by);
      Ty.set(ctx, spec);

      var drawX = originX + tok.x;

      if (o.shadow) {
        ctx.shadowColor = o.shadow.color || 'rgba(0,0,0,0.75)';
        ctx.shadowBlur = o.shadow.blur === undefined ? spec.size * 0.22 : o.shadow.blur;
        ctx.shadowOffsetY = o.shadow.y === undefined ? spec.size * 0.06 : o.shadow.y;
      }
      if (o.stroke) {
        ctx.lineJoin = 'round';
        ctx.lineWidth = o.stroke.width || spec.size * 0.07;
        ctx.strokeStyle = o.stroke.color || '#000';
        ctx.strokeText(tok.t, drawX, by);
      }
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;
      if (o.shadow) {
        /* re-aplicar sombra sólo para el relleno si no hubo trazo */
        if (!o.stroke) {
          ctx.shadowColor = o.shadow.color || 'rgba(0,0,0,0.75)';
          ctx.shadowBlur = o.shadow.blur === undefined ? spec.size * 0.22 : o.shadow.blur;
          ctx.shadowOffsetY = o.shadow.y === undefined ? spec.size * 0.06 : o.shadow.y;
        }
      }
      ctx.fillStyle = Array.isArray(o.fill) ? Ty.grad(ctx, by, spec.size, o.fill) : (o.fill || '#fff');
      ctx.fillText(tok.t, drawX, by);
      ctx.restore();

      if (o.glow && e > 0.2) {
        ctx.save();
        ctx.globalCompositeOperation = 'screen';
        ctx.globalAlpha = a * (o.glow.alpha === undefined ? 0.4 : o.glow.alpha);
        ctx.filter = 'blur(' + (o.glow.r || spec.size * 0.35) + 'px)';
        ctx.translate(cx, by + dy + dyOut); ctx.scale(sc, sc); ctx.translate(-cx, -by);
        Ty.set(ctx, spec);
        ctx.fillStyle = o.glow.color || C.ember;
        ctx.fillText(tok.t, drawX, by);
        ctx.restore();
      }
    }
    return { width: tk.width, height: spec.size, left: originX, right: originX + tk.width, spec: spec };
  };

  /* Barrido de brillo sobre un área (efecto "shine" sobre la marca). */
  Ty.shine = function (ctx, x, y, w, h, p, strength) {
    if (p <= 0 || p >= 1) return;
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    ctx.globalAlpha = (strength === undefined ? 0.85 : strength) * Math.sin(p * Math.PI);
    var sx = x - w * 0.7 + p * w * 1.6;
    var g = ctx.createLinearGradient(sx - w * 0.18, 0, sx + w * 0.18, 0);
    g.addColorStop(0, 'rgba(255,255,255,0)');
    g.addColorStop(0.5, 'rgba(255,246,222,0.95)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g;
    ctx.save();
    ctx.translate(sx, y);
    ctx.rotate(-0.22);
    ctx.translate(-sx, -y);
    ctx.fillRect(x - w * 0.9, y - h * 0.9, w * 1.8, h * 1.8);
    ctx.restore();
    ctx.restore();
  };

  /* Regla/filete decorativo dorado con apertura animada. */
  Ty.rule = function (ctx, x, y, w, p, color, thickness) {
    var e = U.ease.outQuint(U.clamp(p, 0, 1));
    if (e <= 0.001) return;
    var ww = w * e;
    ctx.save();
    var g = ctx.createLinearGradient(x - ww / 2, 0, x + ww / 2, 0);
    g.addColorStop(0, U.rgba(color || C.gold, 0));
    g.addColorStop(0.5, U.rgba(color || C.gold, 0.95));
    g.addColorStop(1, U.rgba(color || C.gold, 0));
    ctx.fillStyle = g;
    ctx.fillRect(x - ww / 2, y, ww, thickness || 4);
    ctx.restore();
  };

  T.Ty = Ty;
})(window.TATA = window.TATA || {});
