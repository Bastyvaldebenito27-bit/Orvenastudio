/* audio.js — pista festiva sintetizada íntegramente en JS.
   Nada de samples externos: bombo, palmas, guitarra (Karplus–Strong),
   shaker, campanitas, brindis, whooshes y ambiente de fonda.
   Se genera como Float32Array y se usa igual en vivo y al exportar,
   así el video y la previsualización suenan idénticos.

   Si el proyecto incluye assets/audio/track.mp3 (pista propia con licencia),
   el reproductor la usa en lugar de esta síntesis. */
(function (T) {
  'use strict';
  var U = T.U;
  var Au = {};

  Au.BAR = 1.8;            /* compás: 3 negras de 0.6 s */
  Au.STEP = Au.BAR / 6;    /* corchea en 6/8 */
  Au.EXTERNAL = 'assets/audio/track.mp3';

  /* ---------------- Generadores ---------------- */

  function kick(L, R, sr, t0, g) {
    var n = Math.floor(sr * 0.45), i0 = Math.floor(t0 * sr);
    for (var i = 0; i < n; i++) {
      var idx = i0 + i; if (idx < 0 || idx >= L.length) continue;
      var tt = i / sr;
      var f = 134 * Math.exp(-tt * 33) + 45;
      var env = Math.exp(-tt * 9);
      var s = Math.sin(2 * Math.PI * f * tt) * env;
      s += Math.sin(2 * Math.PI * 880 * tt) * Math.exp(-tt * 250) * 0.3;
      s = Math.tanh(s * 1.7) * 0.6;
      L[idx] += s * g; R[idx] += s * g;
    }
  }

  function clap(L, R, sr, t0, g, seed) {
    var r = U.rng(seed >>> 0);
    var offs = [0, 0.011, 0.023, 0.037];
    var amps = [0.7, 1.0, 0.75, 0.45];
    for (var k = 0; k < offs.length; k++) {
      var n = Math.floor(sr * 0.2), i0 = Math.floor((t0 + offs[k]) * sr);
      var lp = 0, bp = 0;
      for (var i = 0; i < n; i++) {
        var idx = i0 + i; if (idx < 0 || idx >= L.length) continue;
        var tt = i / sr;
        var noise = r() * 2 - 1;
        lp += (noise - lp) * 0.42;
        bp += (lp - bp) * 0.055;
        var band = lp - bp;
        var env = Math.exp(-tt * (k === 3 ? 20 : 56));
        var s = band * env * amps[k] * 0.85;
        L[idx] += s * g * 0.94; R[idx] += s * g * 1.02;
      }
    }
  }

  function shaker(L, R, sr, t0, g, seed) {
    var r = U.rng(seed >>> 0);
    var n = Math.floor(sr * 0.09), i0 = Math.floor(t0 * sr);
    var hp = 0, prev = 0;
    for (var i = 0; i < n; i++) {
      var idx = i0 + i; if (idx < 0 || idx >= L.length) continue;
      var tt = i / sr;
      var noise = r() * 2 - 1;
      hp = 0.86 * (hp + noise - prev); prev = noise;
      var env = Math.exp(-tt * 44) * (1 - Math.exp(-tt * 900));
      var s = hp * env * 0.32;
      L[idx] += s * g * 1.05; R[idx] += s * g * 0.9;
    }
  }

  /* Cuerda pulsada (Karplus–Strong) con timbre de guitarra de nylon. */
  function pluck(L, R, sr, t0, freq, dur, g, pan, seed) {
    var N = Math.max(2, Math.round(sr / freq));
    var buf = new Float32Array(N);
    var r = U.rng(seed >>> 0);
    var i, j;
    for (i = 0; i < N; i++) buf[i] = r() * 2 - 1;
    for (var pass = 0; pass < 2; pass++) {
      var prev = buf[N - 1];
      for (j = 0; j < N; j++) { var cur = buf[j]; buf[j] = (cur + prev) * 0.5; prev = cur; }
    }
    var n = Math.floor(dur * sr), i0 = Math.floor(t0 * sr), p = 0, last = 0, lp = 0;
    for (var k = 0; k < n; k++) {
      var idx = i0 + k; if (idx >= L.length) break;
      var c = buf[p];
      var out = (c + last) * 0.4968;
      buf[p] = out; last = c; p = (p + 1) % N;
      if (idx < 0) continue;
      var env = Math.min(1, k / 90) * Math.exp(-(k / sr) * 2.4);
      lp += (out - lp) * 0.6;
      var s = lp * env * 0.55;
      L[idx] += s * g * (1 - Math.max(0, pan || 0) * 0.7);
      R[idx] += s * g * (1 + Math.min(0, pan || 0) * 0.7);
    }
  }

  /* Rasgueo: varias cuerdas con retardo entre ellas. */
  function strum(L, R, sr, t0, chord, g, dir, seed) {
    var sp = 0.013;
    for (var i = 0; i < chord.length; i++) {
      var k = dir > 0 ? i : chord.length - 1 - i;
      var amp = g * (dir > 0 ? (0.72 + i * 0.07) : (0.55 + i * 0.05));
      pluck(L, R, sr, t0 + i * sp, chord[k], 1.5, amp, (k / chord.length - 0.5) * 0.7, seed + k * 37);
    }
  }

  function bass(L, R, sr, t0, freq, dur, g) {
    var n = Math.floor(dur * sr), i0 = Math.floor(t0 * sr);
    for (var i = 0; i < n; i++) {
      var idx = i0 + i; if (idx < 0 || idx >= L.length) continue;
      var tt = i / sr;
      var env = Math.min(1, tt * 90) * Math.exp(-tt * 3.4);
      var s = Math.sin(2 * Math.PI * freq * tt) * 0.8 + Math.sin(2 * Math.PI * freq * 2 * tt) * 0.12;
      s = Math.tanh(s * 1.2) * env * 0.42;
      L[idx] += s * g; R[idx] += s * g;
    }
  }

  function chime(L, R, sr, t0, freq, g, pan) {
    var parts = [1, 2.76, 5.4, 8.9], amps = [1, 0.5, 0.26, 0.12];
    var n = Math.floor(sr * 2.2), i0 = Math.floor(t0 * sr);
    for (var i = 0; i < n; i++) {
      var idx = i0 + i; if (idx < 0 || idx >= L.length) continue;
      var tt = i / sr, s = 0;
      for (var k = 0; k < parts.length; k++) {
        s += Math.sin(2 * Math.PI * freq * parts[k] * tt) * amps[k] * Math.exp(-tt * (2.6 + k * 2.4));
      }
      s *= 0.14;
      L[idx] += s * g * (1 - Math.max(0, pan || 0) * 0.6);
      R[idx] += s * g * (1 + Math.min(0, pan || 0) * 0.6);
    }
  }

  /* Choque de vasos. */
  function clink(L, R, sr, t0, g, seed) {
    var r = U.rng(seed >>> 0);
    var fs = [2450, 3180, 4420, 5760];
    var n = Math.floor(sr * 1.0), i0 = Math.floor(t0 * sr);
    for (var i = 0; i < n; i++) {
      var idx = i0 + i; if (idx < 0 || idx >= L.length) continue;
      var tt = i / sr, s = 0;
      for (var k = 0; k < fs.length; k++) s += Math.sin(2 * Math.PI * fs[k] * tt) * Math.exp(-tt * (9 + k * 5)) / (k + 1.4);
      s += (r() * 2 - 1) * Math.exp(-tt * 320) * 0.5;
      s *= 0.2;
      L[idx] += s * g; R[idx] += s * g * 0.92;
    }
  }

  /* Whoosh de transición. */
  function whoosh(L, R, sr, t0, dur, g, seed) {
    var r = U.rng(seed >>> 0);
    var n = Math.floor(dur * sr), i0 = Math.floor(t0 * sr);
    var lp = 0, lp2 = 0;
    for (var i = 0; i < n; i++) {
      var idx = i0 + i; if (idx < 0 || idx >= L.length) continue;
      var u = i / n;
      var noise = r() * 2 - 1;
      var cut = 0.02 + Math.sin(u * Math.PI) * 0.4;
      lp += (noise - lp) * cut;
      lp2 += (lp - lp2) * cut;
      var env = Math.pow(Math.sin(u * Math.PI), 1.7);
      var s = lp2 * env * 0.75;
      L[idx] += s * g * (1 - u * 0.5); R[idx] += s * g * (0.5 + u * 0.5);
    }
  }

  /* Riser tonal para el build-up. */
  function riser(L, R, sr, t0, dur, g) {
    var n = Math.floor(dur * sr), i0 = Math.floor(t0 * sr), ph = 0;
    for (var i = 0; i < n; i++) {
      var idx = i0 + i; if (idx < 0 || idx >= L.length) continue;
      var u = i / n;
      var f = 180 * Math.pow(6, u);
      ph += (2 * Math.PI * f) / sr;
      var env = Math.pow(u, 2.1) * 0.5;
      var s = (Math.sin(ph) * 0.5 + Math.sin(ph * 1.5) * 0.25) * env;
      L[idx] += s * g; R[idx] += s * g;
    }
  }

  /* Ambiente de fonda: ruido marrón filtrado + murmullo. */
  function ambience(L, R, sr, t0, dur, g, seed) {
    var r = U.rng(seed >>> 0);
    var n = Math.floor(dur * sr), i0 = Math.floor(t0 * sr);
    var b0 = 0, b1 = 0, b2 = 0, c0 = 0, c1 = 0;
    for (var i = 0; i < n; i++) {
      var idx = i0 + i; if (idx < 0 || idx >= L.length) continue;
      var tt = i / sr;
      var w = r() * 2 - 1;
      b0 = 0.99 * b0 + w * 0.06; b1 = 0.95 * b1 + w * 0.09; b2 = 0.86 * b2 + w * 0.12;
      var brown = b0 + b1 + b2;
      var w2 = r() * 2 - 1;
      c0 = 0.985 * c0 + w2 * 0.07; c1 = 0.93 * c1 + w2 * 0.1;
      var mod = 0.55 + 0.45 * U.fbm1(tt * 1.7 + 3, 3);
      var fade = Math.min(1, tt * 1.2) * Math.min(1, (dur - tt) * 1.2);
      L[idx] += brown * 0.22 * mod * g * fade;
      R[idx] += (c0 + c1) * 0.22 * mod * g * fade;
    }
  }

  /* Vitoreo / grito de celebración. */
  function cheer(L, R, sr, t0, dur, g, seed) {
    var r = U.rng(seed >>> 0);
    var n = Math.floor(dur * sr), i0 = Math.floor(t0 * sr);
    var lp = 0, bp = 0, lp2 = 0, bp2 = 0;
    for (var i = 0; i < n; i++) {
      var idx = i0 + i; if (idx < 0 || idx >= L.length) continue;
      var u = i / n, tt = i / sr;
      var w = r() * 2 - 1;
      lp += (w - lp) * 0.22; bp += (lp - bp) * 0.035;
      var band = lp - bp;
      var w2 = r() * 2 - 1;
      lp2 += (w2 - lp2) * 0.3; bp2 += (lp2 - bp2) * 0.04;
      var band2 = lp2 - bp2;
      var env = Math.min(1, u * 9) * Math.pow(1 - u, 1.4) * (0.7 + 0.3 * U.fbm1(tt * 6, 2));
      L[idx] += band * env * g * 0.5;
      R[idx] += band2 * env * g * 0.5;
    }
  }

  /* ---------------- Arreglo ---------------- */

  var A2 = 110.0, D3 = 146.83, E3 = 164.81;
  var CH = {
    A: [110.0, 164.81, 220.0, 277.18, 329.63, 440.0],
    D: [146.83, 220.0, 293.66, 369.99, 440.0, 587.33],
    E: [164.81, 246.94, 329.63, 415.30, 493.88, 659.26]
  };
  var ROOT = { A: A2, D: D3, E: E3 };
  var PROG = ['A', 'A', 'D', 'E', 'A', 'A', 'D', 'E', 'A', 'D', 'A', 'E', 'A', 'D', 'E', 'A'];

  /* Intensidad por sección (0..1) para bombo, palmas, guitarra y ambiente. */
  function intensity(t) {
    if (t < 3.6) return { drum: 1.0, clap: 0.95, gtr: 0.0, shk: 0.5, bass: 0.7, amb: 0.7 };
    if (t < 7.2) return { drum: 0.95, clap: 0.8, gtr: 0.95, shk: 0.8, bass: 0.85, amb: 0.75 };
    if (t < 12.6) return { drum: 0.62, clap: 0.35, gtr: 0.85, shk: 0.45, bass: 0.7, amb: 0.6 };
    if (t < 18.0) return { drum: 1.0, clap: 1.0, gtr: 1.0, shk: 1.0, bass: 1.0, amb: 0.8 };
    if (t < 23.4) return { drum: 0.9, clap: 0.55, gtr: 0.5, shk: 0.55, bass: 0.9, amb: 0.55 };
    return { drum: 1.0, clap: 1.05, gtr: 1.0, shk: 1.0, bass: 1.0, amb: 0.95 };
  }

  /* Construye la pista completa. Devuelve {L, R, sampleRate, duration}. */
  Au.build = function (sr, duration) {
    sr = sr || 44100;
    duration = duration || 28.8;
    var len = Math.ceil(sr * (duration + 0.6));
    var L = new Float32Array(len), R = new Float32Array(len);
    var BAR = Au.BAR, STEP = Au.STEP;
    var bars = Math.ceil(duration / BAR);
    var seed = 1;

    ambience(L, R, sr, 0, duration + 0.4, 0.5, 991);

    for (var b = 0; b < bars; b++) {
      var bt = b * BAR;
      var chordName = PROG[b % PROG.length];
      var chord = CH[chordName];
      for (var s = 0; s < 6; s++) {
        var t = bt + s * STEP;
        if (t > duration + 0.2) break;
        var I = intensity(t);
        seed += 7;

        /* Bombo: 6/8 en 1 y 4 */
        if (s === 0) kick(L, R, sr, t, 1.05 * I.drum);
        else if (s === 3) kick(L, R, sr, t, 0.82 * I.drum);
        else if (s === 5 && I.drum > 0.9) kick(L, R, sr, t + STEP * 0.5, 0.34 * I.drum);

        /* Palmas: hemiola de 3/4 en 1, 3 y 5 */
        if (I.clap > 0.2 && (s === 0 || s === 2 || s === 4)) {
          clap(L, R, sr, t, (s === 0 ? 0.52 : 0.62) * I.clap, seed * 13 + s);
        }

        /* Shaker en todas las corcheas */
        if (I.shk > 0.1) shaker(L, R, sr, t, (s % 2 === 0 ? 0.5 : 0.34) * I.shk, seed * 29 + s);

        /* Guitarra: rasgueo cueca */
        if (I.gtr > 0.05) {
          if (s === 0) strum(L, R, sr, t, chord, 0.40 * I.gtr, 1, seed * 3 + 11);
          else if (s === 2) strum(L, R, sr, t, chord, 0.26 * I.gtr, -1, seed * 5 + 23);
          else if (s === 3) strum(L, R, sr, t, chord, 0.32 * I.gtr, 1, seed * 7 + 31);
          else if (s === 5) strum(L, R, sr, t, chord, 0.22 * I.gtr, -1, seed * 11 + 41);
        }

        /* Bajo */
        if (I.bass > 0.1 && (s === 0 || s === 3)) {
          bass(L, R, sr, t, ROOT[chordName] * (s === 3 ? 1.5 : 1), 0.7, 0.55 * I.bass);
        }
      }
    }

    /* --- Acentos y efectos ligados a la edición --- */
    /* Golpe de entrada */
    kick(L, R, sr, 0, 1.35);
    clink(L, R, sr, 0.02, 0.5, 5);
    whoosh(L, R, sr, 0.0, 0.55, 0.5, 21);

    /* Whooshes en cada transición de escena */
    [3.6, 7.2, 12.6, 18.0, 23.4].forEach(function (tt, i) {
      whoosh(L, R, sr, tt - 0.42, 0.62, 0.55, 100 + i * 17);
      kick(L, R, sr, tt, 1.15);
    });

    /* Micro-cortes de la escena 4 */
    [13.95, 15.3, 16.65].forEach(function (tt, i) {
      whoosh(L, R, sr, tt - 0.26, 0.38, 0.32, 300 + i * 9);
    });

    /* Campanitas al revelar la marca */
    [7.35, 7.55, 7.78, 8.05].forEach(function (tt, i) {
      chime(L, R, sr, tt, [1046.5, 1318.5, 1567.98, 2093.0][i], 0.85, (i % 2 ? 0.5 : -0.5));
    });
    chime(L, R, sr, 9.0, 1567.98, 0.5, 0);

    /* Brindis en el bloque de tragos */
    clink(L, R, sr, 14.38, 0.95, 77);
    clink(L, R, sr, 14.50, 0.72, 78);
    cheer(L, R, sr, 14.35, 1.5, 0.28, 404);

    /* Build-up hacia las fechas y golpes por número */
    riser(L, R, sr, 16.9, 1.1, 0.30);
    [18.0, 18.6, 19.2].forEach(function (tt, i) {
      kick(L, R, sr, tt, 1.25);
      clap(L, R, sr, tt, 0.8, 600 + i * 31);
    });

    /* Cierre: riser, golpe grande, vitoreo y campanitas */
    riser(L, R, sr, 22.5, 0.9, 0.34);
    kick(L, R, sr, 23.4, 1.5);
    clink(L, R, sr, 23.42, 0.55, 123);
    cheer(L, R, sr, 23.4, 3.0, 0.4, 909);
    [23.5, 23.72, 23.95].forEach(function (tt, i) {
      chime(L, R, sr, tt, [1318.5, 1567.98, 2093.0][i], 0.7, i - 1);
    });
    kick(L, R, sr, 27.0, 1.35);
    clap(L, R, sr, 27.0, 0.9, 1717);
    chime(L, R, sr, 27.02, 1046.5, 0.8, 0);
    chime(L, R, sr, 27.05, 1567.98, 0.6, 0.4);
    cheer(L, R, sr, 27.0, 1.8, 0.3, 313);

    /* --- Masterizado simple: limitador suave + fades --- */
    var fadeIn = Math.floor(sr * 0.02);
    var fadeOutStart = Math.floor((duration - 0.55) * sr);
    for (var i2 = 0; i2 < len; i2++) {
      var gg = 1;
      if (i2 < fadeIn) gg = i2 / fadeIn;
      if (i2 > fadeOutStart) gg = Math.max(0, 1 - (i2 - fadeOutStart) / (sr * 0.55));
      L[i2] = Math.tanh(L[i2] * 1.08) * 0.92 * gg;
      R[i2] = Math.tanh(R[i2] * 1.08) * 0.92 * gg;
    }

    return { L: L, R: R, sampleRate: sr, duration: duration };
  };

  /* WAV PCM 16-bit estéreo — para exportar la música y mezclarla después. */
  Au.toWav = function (track) {
    var L = track.L, R = track.R, sr = track.sampleRate;
    var n = Math.floor(track.duration * sr);
    var buf = new ArrayBuffer(44 + n * 4);
    var v = new DataView(buf);
    function str(off, s) { for (var i = 0; i < s.length; i++) v.setUint8(off + i, s.charCodeAt(i)); }
    str(0, 'RIFF'); v.setUint32(4, 36 + n * 4, true); str(8, 'WAVE');
    str(12, 'fmt '); v.setUint32(16, 16, true); v.setUint16(20, 1, true);
    v.setUint16(22, 2, true); v.setUint32(24, sr, true); v.setUint32(28, sr * 4, true);
    v.setUint16(32, 4, true); v.setUint16(34, 16, true);
    str(36, 'data'); v.setUint32(40, n * 4, true);
    var o = 44;
    for (var i = 0; i < n; i++) {
      v.setInt16(o, Math.max(-1, Math.min(1, L[i])) * 32767, true); o += 2;
      v.setInt16(o, Math.max(-1, Math.min(1, R[i])) * 32767, true); o += 2;
    }
    return buf;
  };

  /* ---------------- Reproducción ---------------- */

  Au.Player = function (duration) {
    this.duration = duration;
    this.ctx = null;
    this.gain = null;
    this.src = null;
    this.buffer = null;
    this.external = null;
    this.ready = false;
    this.muted = false;
  };

  Au.Player.prototype.init = function () {
    var self = this;
    if (self.ready) return Promise.resolve();
    var AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) { self.ready = true; return Promise.resolve(); }
    self.ctx = new AC();
    self.gain = self.ctx.createGain();
    self.gain.gain.value = 0.9;
    self.gain.connect(self.ctx.destination);

    return fetch(Au.EXTERNAL).then(function (r) {
      if (!r.ok) throw new Error('sin pista externa');
      return r.arrayBuffer();
    }).then(function (ab) {
      return self.ctx.decodeAudioData(ab);
    }).then(function (buf) {
      self.buffer = buf; self.external = true; self.ready = true;
    }).catch(function () {
      var track = Au.build(self.ctx.sampleRate, self.duration);
      var b = self.ctx.createBuffer(2, Math.floor(self.duration * self.ctx.sampleRate), self.ctx.sampleRate);
      b.copyToChannel(track.L.subarray(0, b.length), 0);
      b.copyToChannel(track.R.subarray(0, b.length), 1);
      self.buffer = b; self.external = false; self.ready = true;
    });
  };

  Au.Player.prototype.play = function (offset) {
    var self = this;
    if (!self.ctx || !self.buffer) return;
    self.stop();
    if (self.ctx.state === 'suspended') self.ctx.resume();
    var s = self.ctx.createBufferSource();
    s.buffer = self.buffer;
    s.connect(self.gain);
    s.start(0, Math.max(0, offset || 0));
    self.src = s;
  };

  Au.Player.prototype.stop = function () {
    if (this.src) { try { this.src.stop(); } catch (e) { } this.src = null; }
  };

  Au.Player.prototype.setMuted = function (m) {
    this.muted = m;
    if (this.gain) this.gain.gain.value = m ? 0 : 0.9;
  };

  /* Nodo para grabar el video con audio incluido. */
  Au.Player.prototype.streamDestination = function () {
    if (!this.ctx) return null;
    var d = this.ctx.createMediaStreamDestination();
    this.gain.connect(d);
    return d;
  };

  T.Au = Au;
})(window.TATA = window.TATA || {});
