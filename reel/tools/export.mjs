/* export.mjs — renderiza el reel cuadro a cuadro y lo codifica como video.
 *
 *   node reel/tools/export.mjs [--fps 30] [--out reel/dist] [--quality 0.95]
 *
 * Usa Chromium (Playwright) para dibujar cada frame de forma determinista y
 * ffmpeg para armar el WebM. También deja el póster y la pista de audio, para
 * mezclarla con un ffmpeg completo si se quiere un MP4 con sonido:
 *
 *   ffmpeg -i cocina-del-tata-reel.webm -i cocina-del-tata-pista.wav \
 *          -c:v libx264 -crf 18 -preset slow -pix_fmt yuv420p \
 *          -c:a aac -b:a 192k -shortest cocina-del-tata-reel.mp4
 */
import { spawn } from 'node:child_process';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/* Playwright puede estar instalado en el proyecto o de forma global. */
async function loadChromium() {
  for (const id of ['playwright', 'playwright-core', '/opt/node22/lib/node_modules/playwright/index.mjs']) {
    try { return (await import(id)).chromium; } catch (e) { /* siguiente */ }
  }
  console.error('Falta Playwright. Instálalo con:  npm i -D playwright');
  process.exit(1);
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REEL_DIR = path.resolve(__dirname, '..');
const ROOT = path.resolve(REEL_DIR, '..');

const args = Object.fromEntries(
  process.argv.slice(2).join(' ').split('--').filter(Boolean)
    .map(s => s.trim().split(/\s+/)).map(([k, v]) => [k, v === undefined ? true : v])
);

const FPS = Number(args.fps || 30);
const QUALITY = Number(args.quality || 0.95);
const OUT = path.resolve(ROOT, args.out || 'reel/dist');
const FFMPEG = process.env.FFMPEG
  || (fs.existsSync('/opt/pw-browsers/ffmpeg-1011/ffmpeg-linux') ? '/opt/pw-browsers/ffmpeg-1011/ffmpeg-linux' : 'ffmpeg');

const MIME = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.mp3': 'audio/mpeg', '.woff2': 'font/woff2',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml'
};

function serve(dir) {
  return new Promise(resolve => {
    const srv = http.createServer((req, res) => {
      const rel = decodeURIComponent(req.url.split('?')[0]).replace(/^\/+/, '');
      const file = path.join(dir, rel || 'index.html');
      if (!file.startsWith(dir) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
        res.writeHead(404); res.end('no encontrado'); return;
      }
      res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] || 'application/octet-stream' });
      fs.createReadStream(file).pipe(res);
    });
    srv.listen(0, '127.0.0.1', () => resolve({ srv, port: srv.address().port }));
  });
}

const bar = (i, n) => {
  const w = 34, f = Math.round((i / n) * w);
  process.stdout.write('\r  [' + '█'.repeat(f) + '·'.repeat(w - f) + '] ' +
    String(Math.round((i / n) * 100)).padStart(3) + '%  ' + i + '/' + n + ' frames');
};

(async () => {
  const chromium = await loadChromium();
  fs.mkdirSync(OUT, { recursive: true });
  const { srv, port } = await serve(REEL_DIR);
  console.log('▸ Servidor local en el puerto ' + port);

  const browser = await chromium.launch({ args: ['--force-color-profile=srgb', '--disable-dev-shm-usage'] });
  const page = await browser.newPage({ viewport: { width: 640, height: 1140 } });
  page.on('pageerror', e => console.error('\n  error en la página:', e.message));
  await page.goto(`http://127.0.0.1:${port}/index.html`, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(3500);

  const ready = await page.evaluate(() => !!(window.REEL && window.REEL.ready));
  if (!ready) { console.error('El reel no terminó de cargar.'); process.exit(1); }

  const duration = await page.evaluate(() => window.REEL.duration);
  const total = Math.round(duration * FPS);
  console.log(`▸ ${duration}s · ${FPS} fps · ${total} frames · 1080×1920`);

  /* --- pista de audio --- */
  const wavB64 = await page.evaluate(() => window.REEL.audioWav());
  const wavPath = path.join(OUT, 'cocina-del-tata-pista.wav');
  fs.writeFileSync(wavPath, Buffer.from(wavB64, 'base64'));
  console.log('▸ Pista de audio: ' + path.relative(ROOT, wavPath));

  /* --- video --- */
  const webmPath = path.join(OUT, 'cocina-del-tata-reel.webm');
  const ff = spawn(FFMPEG, [
    '-y', '-f', 'image2pipe', '-vcodec', 'mjpeg', '-framerate', String(FPS), '-i', 'pipe:0',
    '-c:v', 'libvpx', '-b:v', '9M', '-crf', '8', '-deadline', 'good', '-cpu-used', '2',
    '-auto-alt-ref', '0', '-pix_fmt', 'yuv420p', webmPath
  ], { stdio: ['pipe', 'ignore', 'pipe'] });

  let ffErr = '';
  ff.stderr.on('data', d => { ffErr += d.toString(); });

  const write = buf => new Promise(res => {
    if (!ff.stdin.write(buf)) ff.stdin.once('drain', res); else res();
  });

  const t0 = Date.now();
  for (let i = 0; i < total; i++) {
    const t = i / FPS;
    const data = await page.evaluate(([tt, q]) => window.REEL.frameData(tt, q), [t, QUALITY]);
    const buf = Buffer.from(data.slice(data.indexOf(',') + 1), 'base64');
    /* Portadas: el gancho ya asentado y la placa de cierre. Antes de los 3 s
       la cámara sigue empujando y recorta el titular. */
    if (i === Math.round(3.05 * FPS)) fs.writeFileSync(path.join(OUT, 'poster.jpg'), buf);
    if (i === Math.round(26.9 * FPS)) fs.writeFileSync(path.join(OUT, 'poster-cierre.jpg'), buf);
    await write(buf);
    if (i % 10 === 0 || i === total - 1) bar(i + 1, total);
  }
  ff.stdin.end();
  process.stdout.write('\n');

  const code = await new Promise(res => ff.on('close', res));
  await browser.close();
  srv.close();

  if (code !== 0) {
    console.error('ffmpeg terminó con código ' + code + '\n' + ffErr.split('\n').slice(-12).join('\n'));
    process.exit(1);
  }

  const mb = (fs.statSync(webmPath).size / 1048576).toFixed(1);
  console.log(`▸ Video listo: ${path.relative(ROOT, webmPath)} (${mb} MB)`);
  console.log(`▸ Póster: ${path.relative(ROOT, path.join(OUT, 'poster.jpg'))}`);
  console.log(`▸ Tiempo total: ${((Date.now() - t0) / 1000).toFixed(0)}s`);
})();
