/* media.js — fotografías y logo de la marca.
   Las imágenes son material real de La Cocina del Tata: el logo y recortes
   limpios de las fotos del puesto en la fonda. Se dibujan siempre con escala
   uniforme (encuadre tipo "cover"), nunca estiradas: los rostros de las
   personas conservan sus proporciones originales. */
(function (T) {
  'use strict';
  var U = T.U;
  var M = {};

  /* El empaquetador reemplaza estas rutas por data URIs para la versión
     de un solo archivo; en el proyecto se sirven desde assets/img/. */
  M.SRC = {
    logo: 'assets/img/logo.png',
    parrilla: 'assets/img/parrilla.jpg',
    amigos: 'assets/img/amigos.jpg',
    tata: 'assets/img/tata.jpg'
  };

  M.img = {};
  M.ready = false;

  M.load = function () {
    var names = Object.keys(M.SRC);
    return Promise.all(names.map(function (n) {
      return new Promise(function (res) {
        var im = new Image();
        im.onload = function () { M.img[n] = im; res(n); };
        im.onerror = function () { res(null); };
        im.src = M.SRC[n];
      });
    })).then(function () { M.ready = true; });
  };

  /* Encuadre "cover" con escala uniforme y movimiento de cámara opcional.
     o = { zoom, panX, panY, anchorX, anchorY } */
  M.cover = function (ctx, img, x, y, w, h, o) {
    if (!img) return;
    o = o || {};
    var iw = img.naturalWidth, ih = img.naturalHeight;
    var scale = Math.max(w / iw, h / ih) * (o.zoom === undefined ? 1 : o.zoom);
    var dw = iw * scale, dh = ih * scale;
    var ax = o.anchorX === undefined ? 0.5 : o.anchorX;
    var ay = o.anchorY === undefined ? 0.5 : o.anchorY;
    ctx.save();
    ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    if (o.filter) ctx.filter = o.filter;
    ctx.drawImage(img,
      x + (w - dw) * ax + (o.panX || 0),
      y + (h - dh) * ay + (o.panY || 0),
      dw, dh);
    ctx.restore();
  };

  /* Gradación cálida común a todas las fotos. */
  function grade(ctx, x, y, w, h, amount) {
    var C = U.C;
    ctx.save();
    ctx.globalCompositeOperation = 'overlay';
    ctx.globalAlpha = amount === undefined ? 0.16 : amount;
    var gr = ctx.createLinearGradient(0, y, 0, y + h);
    gr.addColorStop(0, '#26406E');
    gr.addColorStop(0.5, '#FFB067');
    gr.addColorStop(1, '#4E1A10');
    ctx.fillStyle = gr; ctx.fillRect(x, y, w, h);
    ctx.globalCompositeOperation = 'soft-light';
    ctx.globalAlpha = 0.13;
    ctx.fillStyle = C.ember;
    ctx.fillRect(x, y, w, h);
    ctx.restore();
  }

  /* Relleno de fondo: la misma foto muy desenfocada y oscurecida.
     Las fotos del puesto son apaisadas y de resolución acotada; ampliarlas a
     pantalla completa las deshace. Esto da un fondo que combina en color con
     la banda nítida que va encima, sin estirar nada. */
  M.backdrop = function (ctx, name, o) {
    o = o || {};
    var W = U.W, H = U.H;
    var img = M.img[name];
    var base = ctx.createLinearGradient(0, 0, 0, H);
    base.addColorStop(0, '#08050E');
    base.addColorStop(0.5, '#1E0E08');
    base.addColorStop(1, '#070303');
    ctx.fillStyle = base; ctx.fillRect(0, 0, W, H);
    if (!img) return;

    T.A.blurGroup(ctx, o.blur === undefined ? 30 : o.blur, 1, function (c) {
      M.cover(c, img, 0, 0, W, H, {
        zoom: o.zoom === undefined ? 1.35 : o.zoom,
        panX: o.panX || 0, panY: o.panY || 0,
        anchorY: o.anchorY === undefined ? 0.5 : o.anchorY
      });
    });
    grade(ctx, 0, 0, W, H, 0.14);
    ctx.save();
    ctx.globalAlpha = o.darken === undefined ? 0.58 : o.darken;
    ctx.fillStyle = '#0A0508';
    ctx.fillRect(0, 0, W, H);
    ctx.restore();
  };

  /* Banda fotográfica: la foto a su proporción real, al ancho indicado.
     Nunca se deforma y nunca se amplía más allá de lo que aguanta. */
  M.band = function (ctx, name, o) {
    o = o || {};
    var W = U.W, H = U.H, C = U.C;
    var img = M.img[name];
    if (!img) return null;

    var bw = o.width === undefined ? W : o.width;
    var bh = o.height === undefined ? bw * img.naturalHeight / img.naturalWidth : o.height;
    var bx = W / 2 - bw / 2, by = (o.y === undefined ? H * 0.42 : o.y) - bh / 2;
    var r = o.radius === undefined ? (bw >= W ? 0 : 26) : o.radius;

    ctx.save();
    if (o.shadow !== false) {
      ctx.shadowColor = 'rgba(0,0,0,0.8)';
      ctx.shadowBlur = 70; ctx.shadowOffsetY = 24;
      if (r) U.rrect(ctx, bx, by, bw, bh, r); else { ctx.beginPath(); ctx.rect(bx, by, bw, bh); }
      ctx.fillStyle = '#000'; ctx.fill();
    }
    ctx.restore();

    ctx.save();
    if (r) U.rrect(ctx, bx, by, bw, bh, r); else { ctx.beginPath(); ctx.rect(bx, by, bw, bh); }
    ctx.clip();
    M.cover(ctx, img, bx, by, bw, bh, {
      zoom: o.zoom === undefined ? 1 : o.zoom,
      panX: o.panX || 0, panY: o.panY || 0,
      anchorX: o.anchorX, anchorY: o.anchorY,
      filter: o.filter === undefined ? 'contrast(1.12) saturate(1.1) brightness(0.96)' : o.filter
    });
    grade(ctx, bx, by, bw, bh, o.grade);
    if (o.darken) {
      ctx.globalAlpha = o.darken;
      ctx.fillStyle = '#0A0508';
      ctx.fillRect(bx, by, bw, bh);
      ctx.globalAlpha = 1;
    }
    ctx.restore();

    /* filo de luz arriba y abajo: integra la banda con el fondo */
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    ctx.globalAlpha = 0.35;
    var e1 = ctx.createLinearGradient(0, by, 0, by + 6);
    e1.addColorStop(0, U.rgba(C.emberHot, 0.8)); e1.addColorStop(1, U.rgba(C.ember, 0));
    ctx.fillStyle = e1; ctx.fillRect(bx, by, bw, 6);
    ctx.restore();

    if (o.border !== false && r) {
      ctx.save();
      ctx.strokeStyle = U.rgba(C.gold, 0.35);
      ctx.lineWidth = 3;
      U.rrect(ctx, bx, by, bw, bh, r);
      ctx.stroke();
      ctx.restore();
    }

    return { x: bx, y: by, w: bw, h: bh };
  };

  /* Velo inferior para que la tipografía se lea sobre cualquier fondo. */
  M.scrim = function (ctx, from, alpha) {
    var W = U.W, H = U.H;
    ctx.save();
    var g = ctx.createLinearGradient(0, from, 0, H);
    g.addColorStop(0, 'rgba(6,4,8,0)');
    g.addColorStop(0.45, 'rgba(6,4,8,' + (alpha * 0.6).toFixed(3) + ')');
    g.addColorStop(1, 'rgba(6,4,8,' + alpha + ')');
    ctx.fillStyle = g; ctx.fillRect(0, from, W, H - from);
    ctx.restore();
  };

  /* Insignia de marca: el logo real, sobre disco blanco, con aro dorado. */
  M.badge = function (ctx, x, y, size, o) {
    o = o || {};
    var img = M.img.logo;
    var r = size / 2;
    ctx.save();
    ctx.translate(x, y);
    if (o.rotate) ctx.rotate(o.rotate);

    /* halo cálido */
    if (o.glow !== false) {
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      ctx.globalAlpha = o.glowAlpha === undefined ? 0.4 : o.glowAlpha;
      U.glow(ctx, 0, 0, r * 1.9, U.C.gold, 0.42);
      ctx.restore();
    }

    /* sombra proyectada */
    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.75)';
    ctx.shadowBlur = size * 0.16;
    ctx.shadowOffsetY = size * 0.035;
    ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fillStyle = '#FFFFFF'; ctx.fill();
    ctx.restore();

    if (img) {
      ctx.save();
      ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.clip();
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, -r, -r, size, size);
      ctx.restore();
    }

    /* aro dorado */
    ctx.lineWidth = Math.max(3, size * 0.022);
    ctx.strokeStyle = U.rgba(U.C.gold, o.ring === undefined ? 0.95 : o.ring);
    ctx.beginPath(); ctx.arc(0, 0, r + ctx.lineWidth * 0.6, 0, Math.PI * 2); ctx.stroke();
    ctx.lineWidth = Math.max(1.5, size * 0.008);
    ctx.strokeStyle = U.rgba(U.C.goldLight, (o.ring === undefined ? 0.95 : o.ring) * 0.55);
    ctx.beginPath(); ctx.arc(0, 0, r + size * 0.038, 0, Math.PI * 2); ctx.stroke();

    ctx.restore();
  };

  T.M = M;
})(window.TATA = window.TATA || {});
