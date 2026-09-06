/* ============================================================================
   GlobalMap — animation module
   Ported from a CSS globe that faked rotation by scrolling a photographic
   earth texture from a third-party CDN. Kept: the turning sphere, the rim
   light, the terminator and the star field. Replaced: the texture, with a
   navigational graticule drawn on canvas — no external asset, and it can
   actually mark an origin and departures, which a photo cannot.

   Origin is San Antonio, Chile (33°35′S 71°37′W) — the same coordinate the
   intro already carries. The departure arcs point at the generic regions the
   page lists; they claim no market, exactly as the copy claims none.

   Self-contained. Delete this <script> and the map frame stays as it was.
   Load AFTER assets/js/insidus.js.
   ========================================================================= */
(function () {
"use strict";

var ORIGIN = { lat: -33.59, lon: -71.62 };

/* Region anchors, matching the generic list already rendered in the section. */
var TARGETS = [
  { lat:  34.0, lon: 118.0 },   // Asia
  { lat:  48.0, lon:   6.0 },   // Europe
  { lat:  40.0, lon: -95.0 },   // North America
  { lat:  -8.0, lon: -55.0 }    // Latin America
];

/* ---------------------------------------------------------------- coastline
   Natural Earth land at 110m, simplified to ~0.6 degrees and quantised to a
   quarter degree, then zig-zag varint delta-coded in base 32. Under 3 KB for
   the whole world — cheaper than any image, and it makes Chile a place rather
   than a dot on an empty ball. */
var CHARS = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_";
var COAST_B32 = "fBlJA36Bt25i1MS0|ZHtH19H1V6O42EC4EF|_i1bLm26W39u32p2A6EV8m11Y18b2AL818u13g1818A2u7CE7y2364J69Cy17o1266e3Bw18E89IAMi2U23Z170BTDW1L8Nj2Nr10S9X1305-4Va2Cu11o3E98l114Ck4ME65684g1GM366q15W2EO5M6i33s1Ge19-3W1u1Hy1069F7A377E3W1Io3UE7m11W12OESBw18o19u3828KDW20QBi10w1Fk29FFP5JDAFI3f13FDk2Lc25nv21|zGjDM7X15h1MU9ECC9|eh1dAA19JB3HJJ42Am1W1|qh1X9IDE2PV1E948GFOED|_i1Z4sv2364xv20|mCh34H50Lf2B3B45OAG0UQECK6B|yZ1j3E9AVIBa1h11d1Np1TB98B5L69EB628B58IDFDKN8d15JDT0F7N66MJi1815E6M05KEW18e1i1A4K98KG416Y137Pc1LCM4W1AL|aRr1I2e1Dx14N866K5|oX19AFMCo1FQH3BSNL2PKFBf16AA5EX1G537AE4PAG6E7|gVCB9R06DI8DBEP7046903E512J903MAQg18|kQj1PCv1k2I1o1f115KH1L|kTEA591Bb1l189K6KC1EAUW1KBFH4B|qVa27NFIB3CCG20689|gUq4802B5LI309PA26740AAI|zJs5i1JR366D8NAP5MAK3|eZ1g95FZ1D58V3855D705EOIQ08E63GC6O826B7L|Wa1YBA229h1DGW1G9|XEsC37Q34J900895T4GQC837|-Z1sC8DB25B8B54551w1888R|r1YDP3683AOA857H|NsE79G27Dc1P1Br19ECD4821AC4D618335CAGG0|p3qG89f1DV484H4E4F0G8E5m16|_i1eHk1L16M0E7J339j1E9105Ww20J3EHh13RD94h15BBA59LD317B1DF9a14A-1a16AZ1F5AJ1JD63b31t1X1O7E4CFBTDHRLJ1b1RGN3DJ33I62F84CX13AC34TD33C9Q0NJMP1RNTLDf1919FCJFQn10DVP1Cd1S5X1UTAX1LCBUDA4UBi1F9720ILa1Z1939n1X13j1HHVW25g1H1X1a1b227CD5PABKF1Mf1682DI0IK4HOFFPJDp1Pf195W1Ra15KTY12C7DBGOr1A76Rk1l135E9q1C09Pp1x1r17H3DEX12V9Fb1N6X1ND1NVVb2F980GNc17e1JW1Gw1Dk1PW16c178J3DGn1Bt10RKVe17KAQ5W1KY1e1U2KQQU3UAW26C15Pc2RAGA4y1FG6M3IU2GZ20BMOEY16c17S8d1QIGV7A9H5B866J4NV8Bl15AJ722B50NU0Cn1W1712Bm1TD22B773Gp1Y1J7R107H75HHFP578J13o1W282GPMO038Q4SMQ4641OG64997ABc24C62IK34C96k16n11B82KW1EP679RD5BE9F95LN5LY1D9L25S84g3w1g1AU2O59185g2B8993r14C52BG53864I58256I8G3467EM1439561y1G6073g16A5867442W2D64H81CKEQ059871BA3JHA0KC0AB688B6G41683378014C4W137Go1254A4i3CSAO9u15b1Bk3906U1Y1L88y1138A2e23SBm10G9s10E5A218W23pv23|eCgAC7DB49a132G9828E078751CHEM60CV1HFIP|pMiH07A6GFEMO1A35765F7J0BDl1LBNC18Dm2D0FIFCA9IQEFIA85KY12Y1B2FC5QGOP15a1BCJX1Fp10Z1Rm1K63554DO18867h1J78E6L0RH69T5E0F17D3447791G0952ALh1V6n194HY1f120771R6LB9j1CPE7K4A44EQ4Fh1i151X1IHG6M5EIQC43532J2GCAEDo1235g1VQ1MBAJ3DG10766M749a10a1J6F3DRV3b1DX1r1N9Tb1j1J1H6ENJDN03HH007C3D71BD315E717PJ8BJ515VC3SAEB2CM834GB58W11GGc1Ac39KZ1KTy1B81CEG940AUc17a196BDb1MDQT6RID3t1KFE3Mz1c2720Bg1t133HG0ALE66Na1PCVk14g15MI91Gb1E1Cn1k1d3Ob1DAG_1f1n1Bu1O6Cd1128F0HECEU45662X11NAS6M3d1Io2OW5HY2CK7Y12o15A393o13A47244G0c17U6E117GEH8AGI5C773G1|nSeIY10E91AG0GFS7D325h3496c12h12G6R2EAS2|pLgI65SACDO6UBE2Y1B85D3u1FHDVAQL15T8KDZ2MN35246W128Il1Kj225284B018EAM253|XPkIM035C315J3PAG274A4|ZUyHJ3N6GG74y10G5d1F|ea1yI55f11F6E8o15|XRYJI117x13G6l10IAq17B8I1|iEsHl16Y1Se3Cn2HNFGB|rNeJi1BW22C5b31BCN4I2|o4-JQ5h1Hh1O-10|i6aKG3Z13j16Y22|WPuJd10TAc18Y1B15|tL-JA3d17l1GY18i1B|ZHuKq15j15I0j1Dj13C5X19E3J3d22E636Q3N6O8F8g12j10VCu58|t6yKo15r25w45z17I0FB07A5P1G52590C7X17A7J0OBT62573W10h4b1NL5Lb16ROHSQMV34AM1X1A86TOl24N8c14p14y1CH4g1EY36m15H8Q4a42";
var LAND = (function () {
  var idx = {}, i;
  for (i = 0; i < CHARS.length; i++) idx[CHARS.charAt(i)] = i;
  return COAST_B32.split("|").map(function (g) {
    var pts = [], x = 0, y = 0, k = 0, first = true, n, sh, v, d;
    while (k < g.length) {
      n = 0; sh = 0;
      do { v = idx[g.charAt(k++)]; n |= (v & 31) << sh; sh += 5; } while (v >= 32);
      d = (n & 1) ? -((n + 1) >> 1) : (n >> 1);
      if (first) { x += d; first = false; }
      else { y += d; first = true; pts.push([x / 4, y / 4]); }
    }
    return pts;
  });
})();

var TILT = -18;          // centre latitude: favours the southern hemisphere
var SPIN = 0.055;        // degrees per frame at 60fps — one turn ≈ 110s

function css(el, prop) { return getComputedStyle(el).getPropertyValue(prop).trim(); }

/* The frame centres its caption when there is nothing to show. Once the globe
   is drawn the centre is taken, so the caption moves to a corner — and moves
   back the moment this script is removed. */
var CSS = ".ins-map-live{place-content:start!important}"
        + ".ins-map-live>.coord{position:absolute;left:1rem;bottom:.9rem;z-index:1}";
function injectCSS() {
  if (document.getElementById("ins-anim-map")) return;
  var st = document.createElement("style");
  st.id = "ins-anim-map"; st.textContent = CSS;
  document.head.appendChild(st);
}

function mount(ctx) {
  var stage = ctx.stage, section = ctx.section;
  injectCSS();
  section.classList.add("ins-map-live");
  var cv = document.createElement("canvas");
  cv.setAttribute("aria-hidden", "true");
  cv.style.width = "100%"; cv.style.height = "100%"; cv.style.display = "block";
  stage.textContent = "";
  stage.appendChild(cv);
  var g = cv.getContext("2d");

  var root = document.documentElement;
  var COL = {
    abyss:    css(root, "--abyss")    || "#03070E",
    deep:     css(root, "--deep")     || "#071C33",
    pacific:  css(root, "--tide")  || "#0E4C92",
    ocean:    css(root, "--ocean")    || "#2E7BC4",
    ice:      css(root, "--ice")      || "#EDF3F8",
    fog:      css(root, "--fog")      || "#8FA6BC",
    accent:   css(root, "--accent") || "#A9C3D4"
  };

  var W = 0, H = 0, R = 0, cx = 0, cy = 0, dpr = 1, stars = [];

  function size() {
    var r = stage.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = Math.max(1, Math.round(r.width));
    H = Math.max(1, Math.round(r.height));
    cv.width = W * dpr; cv.height = H * dpr;
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    R = Math.min(W, H) * 0.36;
    cx = W * 0.5; cy = H * 0.5;
    stars = [];
    var n = Math.round(Math.min(70, W / 12));
    for (var i = 0; i < n; i++) {
      stars.push({
        x: Math.random() * W, y: Math.random() * H,
        r: Math.random() < 0.85 ? 0.7 : 1.2,
        ph: Math.random() * Math.PI * 2,
        sp: 0.6 + Math.random() * 1.8
      });
    }
  }

  /* orthographic projection; z > 0 is the near hemisphere */
  var D = Math.PI / 180;
  function project(lat, lon, spin) {
    var p = lat * D, l = (lon - spin) * D, p0 = TILT * D;
    var cp = Math.cos(p), sp = Math.sin(p), cl = Math.cos(l), sl = Math.sin(l);
    var c0 = Math.cos(p0), s0 = Math.sin(p0);
    return {
      x: cx + R * (cp * sl),
      y: cy - R * (c0 * sp - s0 * cp * cl),
      z: s0 * sp + c0 * cp * cl
    };
  }

  function sphere() {
    // body: deep water, lit from the upper left, dark limb at the right
    var grd = g.createRadialGradient(cx - R * 0.45, cy - R * 0.5, R * 0.1,
                                     cx, cy, R * 1.05);
    grd.addColorStop(0, COL.pacific);
    grd.addColorStop(0.45, COL.deep);
    grd.addColorStop(1, COL.abyss);
    g.beginPath(); g.arc(cx, cy, R, 0, 6.2832); g.fillStyle = grd; g.fill();

    // rim light along the lit edge
    g.save();
    g.beginPath(); g.arc(cx, cy, R, 0, 6.2832); g.clip();
    var rim = g.createRadialGradient(cx - R * 0.62, cy - R * 0.62, R * 0.55,
                                     cx - R * 0.5, cy - R * 0.5, R * 1.35);
    rim.addColorStop(0, "rgba(169,195,212,0)");
    rim.addColorStop(0.72, "rgba(169,195,212,.12)");
    rim.addColorStop(1, "rgba(169,195,212,0)");
    g.fillStyle = rim; g.fillRect(cx - R, cy - R, R * 2, R * 2);
    g.restore();

    g.beginPath(); g.arc(cx, cy, R, 0, 6.2832);
    g.strokeStyle = "rgba(147,163,176,.28)"; g.lineWidth = 1; g.stroke();
  }

  function graticule(spin) {
    g.lineWidth = 1;
    var lat, lon, first, pt, i;
    // parallels
    for (lat = -60; lat <= 60; lat += 30) {
      g.beginPath(); first = true;
      for (lon = -180; lon <= 180; lon += 4) {
        pt = project(lat, lon, spin);
        if (pt.z <= 0) { first = true; continue; }
        if (first) { g.moveTo(pt.x, pt.y); first = false; } else g.lineTo(pt.x, pt.y);
      }
      g.strokeStyle = lat === 0 ? "rgba(147,163,176,.30)" : "rgba(147,163,176,.15)";
      g.stroke();
    }
    // meridians
    for (i = 0; i < 12; i++) {
      lon = -180 + i * 30;
      g.beginPath(); first = true;
      for (lat = -85; lat <= 85; lat += 3) {
        pt = project(lat, lon, spin);
        if (pt.z <= 0) { first = true; continue; }
        if (first) { g.moveTo(pt.x, pt.y); first = false; } else g.lineTo(pt.x, pt.y);
      }
      g.strokeStyle = "rgba(147,163,176,.15)";
      g.stroke();
    }
  }

  /* Coastlines, cut at the horizon: a ring is drawn only where z > 0, so the
     far side never bleeds through. Filling each visible run closes it across
     the limb chord, which is where the horizon runs anyway. */
  function land(spin) {
    var i, j, ring, pt, run;
    for (i = 0; i < LAND.length; i++) {
      ring = LAND[i]; run = null;
      for (j = 0; j <= ring.length; j++) {
        pt = j < ring.length ? project(ring[j][1], ring[j][0], spin) : { z: -1 };
        if (pt.z <= 0) {
          if (run && run.length > 2) {
            g.beginPath();
            g.moveTo(run[0], run[1]);
            for (var k = 2; k < run.length; k += 2) g.lineTo(run[k], run[k + 1]);
            g.fillStyle = "rgba(237,243,248,.055)"; g.fill();
            g.strokeStyle = "rgba(147,163,176,.42)"; g.lineWidth = 1; g.stroke();
          }
          run = null;
          continue;
        }
        if (!run) run = [];
        run.push(pt.x, pt.y);
      }
    }
  }

  function arc(a, b, t) {
    if (a.z <= 0.02 || b.z <= 0.02) return;
    var mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
    var dx = mx - cx, dy = my - cy;
    var d = Math.hypot(dx, dy) || 1;
    var lift = R * 0.42;
    var qx = mx + (dx / d) * lift, qy = my + (dy / d) * lift;

    g.beginPath();
    g.moveTo(a.x, a.y);
    g.quadraticCurveTo(qx, qy, b.x, b.y);
    g.strokeStyle = "rgba(169,195,212,.34)";
    g.lineWidth = 1;
    g.stroke();

    // a light travelling the arc, so the direction reads
    var u = t % 1;
    var px = (1 - u) * (1 - u) * a.x + 2 * (1 - u) * u * qx + u * u * b.x;
    var py = (1 - u) * (1 - u) * a.y + 2 * (1 - u) * u * qy + u * u * b.y;
    g.beginPath(); g.arc(px, py, 2, 0, 6.2832);
    g.fillStyle = COL.accent; g.fill();
  }

  function marker(p, pulse) {
    if (p.z <= 0) return;
    g.beginPath(); g.arc(p.x, p.y, 2.6, 0, 6.2832);
    g.fillStyle = COL.accent; g.fill();
    if (pulse == null) return;
    var r = 3 + pulse * 13;
    g.beginPath(); g.arc(p.x, p.y, r, 0, 6.2832);
    g.strokeStyle = "rgba(169,195,212," + (0.5 * (1 - pulse)).toFixed(3) + ")";
    g.lineWidth = 1; g.stroke();
  }

  function starfield(t, still) {
    for (var i = 0; i < stars.length; i++) {
      var s = stars[i];
      // keep them clear of the sphere, unlike the original where most were clipped
      if (Math.hypot(s.x - cx, s.y - cy) < R + 8) continue;
      var a = still ? 0.35 : 0.18 + 0.42 * (0.5 + 0.5 * Math.sin(t * s.sp + s.ph));
      g.beginPath(); g.arc(s.x, s.y, s.r, 0, 6.2832);
      g.fillStyle = "rgba(241,244,246," + a.toFixed(3) + ")";
      g.fill();
    }
  }

  function frame(spin, t, still) {
    g.clearRect(0, 0, W, H);
    starfield(t, still);
    sphere();
    graticule(spin);
    land(spin);
    var o = project(ORIGIN.lat, ORIGIN.lon, spin);
    for (var i = 0; i < TARGETS.length; i++) {
      arc(o, project(TARGETS[i].lat, TARGETS[i].lon, spin), still ? 0.5 : t * 0.22 + i * 0.25);
    }
    marker(o, still ? null : (t * 0.5) % 1);
  }

  /* ------------------------------------------------------------ lifecycle */
  var spin = -60, raf = 0, running = false, t0 = performance.now();

  function loop(now) {
    var t = (now - t0) / 1000;
    spin += SPIN;
    frame(spin, t, false);
    raf = requestAnimationFrame(loop);
  }
  function start() {
    if (running || ctx.reduce) return;
    running = true; raf = requestAnimationFrame(loop);
  }
  function stop() {
    running = false;
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
  }

  size();
  frame(spin, 0, true);

  if (ctx.reduce) return;   // one static frame, no loop — as the contract requires

  // Only run while the section is actually on screen.
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (es) {
      es[0].isIntersecting ? start() : stop();
    }, { rootMargin: "120px" }).observe(section);
  } else {
    start();
  }
  document.addEventListener("visibilitychange", function () {
    document.hidden ? stop() : start();
  });

  var rz;
  window.addEventListener("resize", function () {
    clearTimeout(rz);
    rz = setTimeout(function () { size(); if (!running) frame(spin, 0, true); }, 150);
  }, { passive: true });
}

function boot() {
  if (!window.INSIDUS || !window.INSIDUS.anim) return false;
  window.INSIDUS.anim.register("GlobalMap", mount);
  return true;
}
if (!boot()) {
  document.addEventListener("DOMContentLoaded", boot);
  setTimeout(boot, 300);
}
})();
