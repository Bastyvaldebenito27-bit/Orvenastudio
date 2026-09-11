# Reemplazar fotografía y video

Ningún archivo de arte está referenciado desde el código. Todos entran por una
sola tabla, `MEDIA` y `PRODUCT_MEDIA`, en `build/build.py`.

Mientras un hueco está vacío la página dibuja un marcador que dice, en la
propia web, qué archivo está esperando. Al poner el archivo el marcador
desaparece y **el layout no se mueve**: el marco ya ocupaba ese espacio.

## Portada

```python
MEDIA["hero"] = {"image": "hero.jpg", "video": None, "poster": None, ...}
```

- Una foto: `"image": "hero.jpg"` en `assets/img/`. 2560 × 1440 o mayor.
- Un video en bucle: `"video": "hero-loop.mp4"` en `assets/video/`, y
  `"poster": "hero.jpg"`. Sale con `autoplay loop muted playsinline` y
  `preload="none"`, que es lo que pide un fondo cinematográfico sin coste.

La capa de oscurecido (`.hero__scrim`) va encima del asset y debajo del texto,
así que el titular sigue legible sobre cualquier metraje.

## Sección de video

`MEDIA["film"]`, mismos campos. El marco ocupa 88 svh a pantalla completa, sin
controles, sin borde, sin tarjeta.

## Productos

```python
PRODUCT_MEDIA = {"jibia": "jibia.jpg", "bacalao": "bacalao.jpg", ...}
```

Vertical, 1600 × 2000 o mayor. Las ocho miniaturas de 200 px que hay ahora
**no son arte**: se muestran pequeñas dentro del marcador y etiquetadas como
referencia, para que nadie las confunda con la fotografía definitiva.

## Después de cambiar la tabla

```
python3 build/build.py
```

Y si el sitio se sirve desde el CDN, súbelo a GitHub y recompila con el nuevo
SHA (ver `README.md`).
