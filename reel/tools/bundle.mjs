/* bundle.mjs — arma una versión de un solo archivo del reel.
 * Sirve para compartirlo, subirlo a cualquier hosting o abrirlo sin servidor.
 *
 *   node reel/tools/bundle.mjs [salida.html]
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REEL = path.resolve(__dirname, '..');
const OUT = path.resolve(process.argv[2] || path.join(REEL, 'dist', 'cocina-del-tata-reel.html'));

let html = fs.readFileSync(path.join(REEL, 'index.html'), 'utf8');

html = html.replace(/<link rel="stylesheet" href="([^"]+)">/g, (_, href) =>
  '<style>\n' + fs.readFileSync(path.join(REEL, href), 'utf8') + '\n</style>');

html = html.replace(/<script src="([^"]+)"><\/script>/g, (_, src) =>
  '<script>\n' + fs.readFileSync(path.join(REEL, src), 'utf8') + '\n</script>');

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, html);
console.log('▸ ' + path.relative(path.resolve(REEL, '..'), OUT) +
  ' (' + (fs.statSync(OUT).size / 1024).toFixed(0) + ' KB, autocontenido)');
