# La Cocina del Tata — Reel 9:16

Reel publicitario vertical para **La Cocina del Tata** durante la **Fiesta de la
Chilenidad de Santo Domingo**. Formato 1080×1920, 28,8 segundos, pensado para
Instagram Reels, TikTok, Facebook Reels y Stories.

Todo el reel se dibuja por código sobre un `<canvas>` de 1080×1920: escenografía,
iluminación, partículas, tipografía animada y la música. No depende de stock ni de
conexión a internet.

## Ver el reel

```bash
cd reel
npm start           # abre http://127.0.0.1:8080
```

O abre directamente `dist/cocina-del-tata-reel.html`, que es el reel completo en un
solo archivo (funciona con doble clic, sin servidor).

Controles: **Reproducir**, **Reiniciar**, **Sonido**, **Grabar video**,
**Guardar frame PNG**, **Descargar música WAV** y **Zona segura**.
Atajos: `espacio` reproduce/pausa, `←` `→` saltan medio segundo, `R` reinicia.
La barra inferior es navegable con un clic.

## Exportar

```bash
npm run export      # video + póster + pista de audio en dist/
npm run bundle      # reel en un solo archivo HTML
```

`npm run export` renderiza los 864 frames de forma determinista y los codifica con
ffmpeg. Deja en `dist/`:

| Archivo | Qué es |
| --- | --- |
| `cocina-del-tata-reel.webm` | Video 1080×1920 a 30 fps, sin audio |
| `cocina-del-tata-pista.wav` | La música y los efectos, 44,1 kHz estéreo |
| `poster.jpg`, `poster-cierre.jpg` | Portadas para la publicación |
| `cocina-del-tata-reel.html` | El reel autocontenido |

El ffmpeg incluido con Playwright solo trae VP8, por eso el video sale en WebM y
mudo. Con un ffmpeg completo se obtiene el MP4 con sonido que piden las redes:

```bash
ffmpeg -i dist/cocina-del-tata-reel.webm -i dist/cocina-del-tata-pista.wav \
       -c:v libx264 -crf 18 -preset slow -pix_fmt yuv420p \
       -c:a aac -b:a 192k -shortest dist/cocina-del-tata-reel.mp4
```

El botón **Grabar video** del reproductor es la vía corta: graba en tiempo real
con la música ya incluida y descarga un MP4 (o WebM, según el navegador).

## Estructura del reel

| Escena | Tiempo | Contenido |
| --- | --- | --- |
| 1 · Hook | 0 – 3,6 s | Bandera en primer plano y plano general de la fonda. *¡SANTO DOMINGO ESTÁ DE FIESTA!* |
| 2 · Invitación | 3,6 – 7,2 s | Parrilla y mesa servida. *Este 18, ven a vivir la Fiesta de la Chilenidad* |
| 3 · Marca | 7,2 – 12,6 s | Las luces se encienden, baja el letrero. *Y pasa por LA COCINA DEL TATA* |
| 4 · Comida y tragos | 12,6 – 18 s | Cuatro cortes rápidos: *COMIDA · TRAGOS · AMBIENTE · Y MUCHO SABOR* |
| 5 · Fechas | 18 – 23,4 s | *17 • 18 • 19 DE SEPTIEMBRE · Desde las 10:00 AM hasta que cierre la fonda* |
| 6 · Cierre | 23,4 – 28,8 s | Emblema, confeti y banderas. *TE ESPERAMOS EN SANTO DOMINGO* |

Los cortes caen sobre los compases de la música (1,8 s cada uno), así la edición y
el ritmo van juntos.

## Archivos

```
reel/
├── index.html                  reproductor
├── assets/
│   ├── css/reel.css            interfaz del reproductor
│   ├── fonts/fonts.css         Anton, Alfa Slab One y Archivo en base64
│   └── js/
│       ├── util.js             matemática, easing, ruido, paleta
│       ├── glyphs.js           bandera, corazón, trago, música, emblema
│       ├── type.js             tipografía animada y jerarquía
│       ├── fx.js               partículas y post-proceso
│       ├── art.js              escenografía procedural
│       ├── audio.js            síntesis de la pista y los efectos
│       ├── reel.js             línea de tiempo y las seis escenas
│       └── player.js           reproductor y exportadores
└── tools/
    ├── export.mjs              render cuadro a cuadro → video
    └── bundle.mjs              reel en un solo archivo
```

`reel.js` expone `R.render(ctx, t)`, que es una función pura del tiempo: el frame
del segundo 12,4 se dibuja igual se llegue reproduciendo o saltando. De ahí que la
previsualización y el video exportado sean idénticos.

## Decisiones de diseño

**Tipografía.** Anton para los titulares (condensada y contundente en vertical),
Alfa Slab One para la marca —una slab con carácter artesanal, no corporativa— y
Archivo para la información, que es la que debe leerse sin esfuerzo en un teléfono.

**Color.** Noche azul profunda, maderas, rojo hondo y dorado de las luces de fonda.
El rojo, blanco y azul aparecen donde corresponde —banderas, guirnaldas, franja
final— y el resto de la imagen se mantiene cálida y apetecible.

**Íconos en lugar de emoji.** La bandera, el corazón, el vaso, la nota musical y el
confeti están dibujados en vectores. Un emoji del sistema cambia de forma en cada
teléfono; así el reel se ve igual en todas partes y a cualquier tamaño.

**Zona segura.** Todo el texto vive entre los 250 y los 1560 px de alto, fuera de
los controles de Reels, TikTok y Stories. El botón *Zona segura* muestra la guía.

**Sin sonido también funciona.** Cada escena dice lo suyo por escrito, con velo
detrás del texto para que contraste con cualquier fondo.

## Audio

La pista se sintetiza en JavaScript: bombo, palmas en hemiola de 6/8 sobre 3/4,
guitarra por Karplus–Strong, shaker, bajo, campanitas, brindis, vítores y whooshes
en cada transición. La energía sube hacia el cierre y los acentos caen sobre los
cortes.

Para usar una pista propia con licencia, déjala en `assets/audio/track.mp3`: el
reproductor la detecta y la usa en lugar de la síntesis, sin tocar nada más.

## Reemplazar la escenografía por fotos reales

El reel no trae fotografías porque el repositorio no tenía material de la marca.
Cuando existan fotos de la fonda, los platos o el equipo, se pueden dibujar dentro
de cualquier escena de `reel.js` con `ctx.drawImage`, manteniendo la animación de
cámara y los textos tal como están. La estructura de escenas no cambia.

## Textos

Los textos en pantalla son exactamente estos y no deben alterarse:

- ¡SANTO DOMINGO ESTÁ DE FIESTA!
- Este 18, ven a vivir la Fiesta de la Chilenidad
- Y pasa por LA COCINA DEL TATA
- COMIDA · TRAGOS · AMBIENTE · Y MUCHO SABOR
- 17 • 18 • 19 DE SEPTIEMBRE
- Desde las 10:00 AM · hasta que cierre la fonda
- TE ESPERAMOS EN SANTO DOMINGO · LA COCINA DEL TATA · VEN A CELEBRAR CON NOSOTROS
- COMIDA • TRAGOS • MÚSICA • TRADICIÓN

No hay precios, direcciones, nombres de platos ni artistas: no se entregó esa
información y el reel no la inventa.

## Tipografías

Anton, Alfa Slab One y Archivo se distribuyen bajo SIL Open Font License 1.1 y van
embebidas en `assets/fonts/fonts.css`.
