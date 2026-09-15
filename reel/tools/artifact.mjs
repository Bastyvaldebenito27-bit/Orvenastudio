/* artifact.mjs — versión del reel para publicar como página.
 * Igual que bundle.mjs, pero sin el andamiaje <html>/<head>/<body> y sin los
 * botones de descarga, que el visor de páginas publicadas bloquea.
 *
 *   node reel/tools/artifact.mjs [salida.html]
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REEL = path.resolve(__dirname, '..');

/* Las rutas de assets/img se incrustan como data URI: así el archivo funciona
   solo, sin servidor y sin depender de la carpeta del proyecto. */
function inlineImages(js, reelDir) {
  return js.replace(/'(assets\/img\/[\w.-]+)'/g, (m, rel) => {
    const file = path.join(reelDir, rel);
    if (!fs.existsSync(file)) return m;
    const type = rel.endsWith('.png') ? 'image/png' : 'image/jpeg';
    return "'data:" + type + ";base64," + fs.readFileSync(file).toString('base64') + "'";
  });
}

const OUT = path.resolve(process.argv[2] || path.join(REEL, 'dist', 'artifact.html'));

const read = f => fs.readFileSync(path.join(REEL, f), 'utf8');
const src = read('index.html');

const title = src.match(/<title>([^<]*)<\/title>/)[1];
const body = src.match(/<body>([\s\S]*?)<\/body>/)[1];

const css = [...src.matchAll(/<link rel="stylesheet" href="([^"]+)">/g)]
  .map(m => read(m[1])).join('\n');

let js = inlineImages([...body.matchAll(/<script src="([^"]+)"><\/script>/g)]
  .map(m => read(m[1])).join('\n'), REEL);

/* El visor de páginas publicadas no concede permiso de descarga, así que aquí
   no se genera ningún enlace de descarga: los botones que lo usaban ya no
   existen y la función queda como aviso. */
js = js.replace(
  /function download\(blob, name\) \{[\s\S]*?\n  \}/,
  `function download() {
    say('Las descargas se generan con npm run export en el proyecto.');
  }`);

const markup = body.replace(/<script src="[^"]+"><\/script>\s*/g, '').trim();

const out = `<title>${title}</title>
<style>
${css}
</style>

${markup}

<script>window.TATA_ARTIFACT = true;</script>
<script>
${js}
</script>
`;

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, out);
console.log('▸ ' + path.relative(path.resolve(REEL, '..'), OUT) +
  ' (' + (fs.statSync(OUT).size / 1024).toFixed(0) + ' KB)');
