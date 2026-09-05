# INSIDUS — fuente del sitio

`web/v2/` y `web/v2-single.html` son salida generada. No los edites a mano:
se sobrescriben en cada compilación.

```
build/content.py   todo el texto, en los 9 idiomas. Nada de copy vive en el código.
build/build.py     el generador. ANIM lista los módulos de animación a incluir.
assets/css/        el sistema visual.
assets/js/         la aplicación, y anim/ los módulos opcionales.
```

Para compilar:

```
python3 build/build.py
```

Escribe `dist/` (multi-archivo, el que se publica) y `dist-single.html`
(un solo archivo, para revisar sin servidor).

Las fotos no están duplicadas aquí: `build.py` las lee de `assets/img/`,
que en el repositorio es `web/v2/assets/img/`. Copia esa carpeta a
`web/v2-src/assets/img/` antes de compilar.

Comprobaciones en Chromium: `check.mjs` (contraste, enlaces, SEO),
`anim-check.mjs` (el intro), `map-check.mjs` (el globo). Cada una verifica el
sitio con el módulo, sin el módulo, y con movimiento reducido.

## Publicar en Vercel

Vercel protege los despliegues de rama detrás de su inicio de sesión, así que
la única URL pública de un proyecto es la de producción. El proyecto
`insidus-spa` (https://insidus-spa.vercel.app) recibe un despliegue directo
de las nueve páginas HTML; el CSS, el JS, las fotos y los locales se sirven
desde jsDelivr sobre este mismo repositorio, fijados a un commit:

```
git push                                   # y anota el SHA
INSIDUS_CDN="https://cdn.jsdelivr.net/gh/Bastyvaldebenito27-bit/Orvenastudio@<sha>/web/v2" \
  python3 build/build.py
# sube dist/index.html y dist/products/*/index.html a Vercel
```

El SHA va fijado a propósito: así una publicación no cambia bajo los pies de
la anterior. Al cambiarlo hay que volver a compilar y volver a subir.
