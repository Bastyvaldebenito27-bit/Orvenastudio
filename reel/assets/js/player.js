/* player.js — reproductor, reloj y exportadores del reel. */
(function (T) {
  'use strict';
  var U = T.U, R = T.R, Au = T.Au;

  var canvas = document.getElementById('reel');
  var ctx = canvas.getContext('2d', { alpha: false });
  var overlay = document.getElementById('overlay');
  var bar = document.getElementById('bar');
  var clock = document.getElementById('clock');
  var sceneName = document.getElementById('sceneName');
  var fpsEl = document.getElementById('fps');
  var status = document.getElementById('status');

  var btnPlay = document.getElementById('btnPlay');
  var btnRestart = document.getElementById('btnRestart');
  var btnSound = document.getElementById('btnSound');
  var btnRec = document.getElementById('btnRec');
  var btnFrame = document.getElementById('btnFrame');
  var btnWav = document.getElementById('btnWav');
  var btnSafe = document.getElementById('btnSafe');

  var state = {
    playing: false,
    t: 0,
    last: 0,
    safe: false,
    sound: true,
    recording: false
  };

  var player = new Au.Player(R.DURATION);

  function say(msg) { status.textContent = msg; }

  /* En la página publicada el visor bloquea las descargas que inicia la propia
     página, así que se ocultan esos botones en lugar de dejarlos sin efecto. */
  if (window.TATA_ARTIFACT) {
    [btnRec, btnFrame, btnWav].forEach(function (b) { if (b) b.remove(); });
  }

  function draw(t) {
    R.render(ctx, t, { safeGuides: state.safe });
    bar.style.width = ((t / R.DURATION) * 100).toFixed(2) + '%';
    clock.textContent = t.toFixed(1) + 's / ' + R.DURATION.toFixed(1) + 's';
    sceneName.textContent = R.SCENE_NAMES[R.sceneIndex(t)];
  }

  /* ---- bucle ---- */
  var frames = 0, fpsT = 0;
  function loop(now) {
    if (!state.playing) return;
    var dt = (now - state.last) / 1000;
    state.last = now;
    if (dt > 0.25) dt = 1 / 60;
    state.t += dt;

    frames++;
    if (now - fpsT > 500) {
      fpsEl.textContent = Math.round((frames * 1000) / (now - fpsT)) + ' fps';
      frames = 0; fpsT = now;
    }

    if (state.t >= R.DURATION) {
      state.t = R.DURATION - 0.001;
      draw(state.t);
      stop(true);
      return;
    }
    draw(state.t);
    requestAnimationFrame(loop);
  }

  function start(fromZero) {
    if (fromZero) state.t = 0;
    if (state.t >= R.DURATION - 0.01) state.t = 0;
    overlay.classList.add('hidden');
    state.playing = true;
    state.last = performance.now();
    fpsT = state.last; frames = 0;
    btnPlay.textContent = 'Pausar';
    player.init().then(function () {
      if (state.playing) player.play(state.t);
      say(player.external === false
        ? 'Sonando pista sintetizada (cueca, palmas, bombo y guitarra).'
        : 'Sonando assets/audio/track.mp3.');
    });
    requestAnimationFrame(loop);
  }

  function stop(ended) {
    state.playing = false;
    player.stop();
    btnPlay.textContent = ended ? 'Ver de nuevo' : 'Reproducir';
    if (ended && !state.recording) {
      overlay.classList.remove('hidden');
      say('Reel finalizado. 28,8 s · 1080×1920.');
    }
  }

  btnPlay.addEventListener('click', function () {
    if (state.playing) { stop(false); say('En pausa.'); }
    else start(false);
  });
  overlay.addEventListener('click', function () { start(state.t >= R.DURATION - 0.01); });
  btnRestart.addEventListener('click', function () { start(true); });

  btnSound.addEventListener('click', function () {
    state.sound = !state.sound;
    player.setMuted(!state.sound);
    btnSound.dataset.on = String(state.sound);
    btnSound.textContent = 'Sonido: ' + (state.sound ? 'ON' : 'OFF');
  });

  btnSafe.addEventListener('click', function () {
    state.safe = !state.safe;
    btnSafe.dataset.on = String(state.safe);
    draw(state.t);
    say(state.safe
      ? 'Guía de zona segura: todo el texto queda fuera de la interfaz de Reels/TikTok.'
      : 'Guía desactivada.');
  });

  /* ---- exportar frame ---- */
  btnFrame.addEventListener('click', function () {
    canvas.toBlob(function (b) {
      download(b, 'cocina-del-tata-' + state.t.toFixed(1).replace('.', '_') + 's.png');
      say('Frame guardado en 1080×1920.');
    }, 'image/png');
  });

  /* ---- exportar música ---- */
  btnWav.addEventListener('click', function () {
    btnWav.disabled = true;
    say('Generando pista…');
    setTimeout(function () {
      var track = Au.build(44100, R.DURATION);
      var wav = Au.toWav(track);
      download(new Blob([wav], { type: 'audio/wav' }), 'cocina-del-tata-pista.wav');
      btnWav.disabled = false;
      say('Pista WAV descargada (44,1 kHz estéreo).');
    }, 30);
  });

  /* ---- grabar video (con audio) ---- */
  function pickMime() {
    var opts = [
      'video/mp4;codecs=avc1.42E01E,mp4a.40.2',
      'video/mp4',
      'video/webm;codecs=vp9,opus',
      'video/webm;codecs=vp8,opus',
      'video/webm'
    ];
    for (var i = 0; i < opts.length; i++) {
      if (window.MediaRecorder && MediaRecorder.isTypeSupported(opts[i])) return opts[i];
    }
    return '';
  }

  btnRec.addEventListener('click', function () {
    if (state.recording) return;
    if (!window.MediaRecorder || !canvas.captureStream) {
      say('Este navegador no permite grabar. Usa npm run export en el proyecto.');
      return;
    }
    player.init().then(function () {
      var mime = pickMime();
      var stream = canvas.captureStream(30);
      var dest = player.streamDestination();
      if (dest && state.sound) {
        dest.stream.getAudioTracks().forEach(function (tr) { stream.addTrack(tr); });
      }
      var rec;
      try {
        rec = new MediaRecorder(stream, mime ? { mimeType: mime, videoBitsPerSecond: 12000000 } : undefined);
      } catch (e) {
        say('No se pudo iniciar la grabación: ' + e.message);
        return;
      }
      var chunks = [];
      rec.ondataavailable = function (e) { if (e.data.size) chunks.push(e.data); };
      rec.onstop = function () {
        var type = rec.mimeType || mime || 'video/webm';
        var ext = type.indexOf('mp4') >= 0 ? 'mp4' : 'webm';
        download(new Blob(chunks, { type: type }), 'cocina-del-tata-reel.' + ext);
        state.recording = false;
        btnRec.disabled = false;
        btnRec.textContent = 'Grabar video';
        say('Video ' + ext.toUpperCase() + ' descargado (1080×1920, con audio).');
      };
      state.recording = true;
      btnRec.disabled = true;
      btnRec.textContent = 'Grabando…';
      say('Grabando en tiempo real. No cambies de pestaña.');
      rec.start(200);
      start(true);
      var check = setInterval(function () {
        if (!state.playing) {
          clearInterval(check);
          setTimeout(function () { if (rec.state !== 'inactive') rec.stop(); }, 260);
        }
      }, 120);
    });
  });

  function download(blob, name) {
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url; a.download = name;
    document.body.appendChild(a); a.click();
    setTimeout(function () { URL.revokeObjectURL(url); a.remove(); }, 1500);
  }

  /* ---- teclado ---- */
  window.addEventListener('keydown', function (e) {
    if (e.code === 'Space') { e.preventDefault(); state.playing ? stop(false) : start(false); }
    if (e.code === 'ArrowRight') { state.t = Math.min(R.DURATION - 0.01, state.t + 0.5); draw(state.t); }
    if (e.code === 'ArrowLeft') { state.t = Math.max(0, state.t - 0.5); draw(state.t); }
    if (e.key === 'r' || e.key === 'R') start(true);
  });

  /* ---- clic en la barra para saltar ---- */
  document.querySelector('.scrubber').addEventListener('click', function (e) {
    var r = this.getBoundingClientRect();
    state.t = U.clamp((e.clientX - r.left) / r.width, 0, 0.999) * R.DURATION;
    draw(state.t);
  });

  /* ---- API para el exportador headless ---- */
  window.REEL = {
    duration: R.DURATION,
    fps: R.FPS,
    seek: function (t) { state.playing = false; R.render(ctx, t, {}); },
    frameData: function (t, quality) {
      state.playing = false;
      R.render(ctx, t, {});
      return canvas.toDataURL('image/jpeg', quality || 0.94);
    },
    audioWav: function () {
      var track = Au.build(44100, R.DURATION);
      var buf = Au.toWav(track);
      var bytes = new Uint8Array(buf), s = '';
      for (var i = 0; i < bytes.length; i += 0x8000) {
        s += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
      }
      return btoa(s);
    }
  };

  /* Primer frame visible de inmediato. */
  document.fonts.ready.then(function () {
    draw(0.9);
    window.REEL.ready = true;
  });
})(window.TATA);
