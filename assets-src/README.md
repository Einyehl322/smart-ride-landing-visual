# Originales de imágenes de producto

Aquí se guardan los archivos originales en máxima calidad. No se publican; `npm run images` genera las versiones web en `src/assets/` y la web las detecta sola por el *slug* del producto (el final de su URL, por ejemplo `carplay-625-freedconn`).

## Fotografías

```
assets-src/products/<slug>/hero.png       ← principal (obligatoria)
assets-src/products/<slug>/lateral.png    ← resto de la galería (opcional)
```

- PNG con **canal alfa real** (fondo eliminado) para que el producto flote sobre el showroom. Sin transparencia se muestra como fotografía de escena.
- Mínimo 2400 px de ancho; ideal hasta 4K. El script nunca amplía.
- Salida: WebP de 640, 1024, 1600 y 2400 px más `meta.json`.

## Giro 360° real (secuencia de fotos)

```
assets-src/360/<slug>/0001.png … 0036.png
```

- Producto en plataforma giratoria: 36 tomas (cada 10°) o 72 (cada 5°), con la cámara fija y la misma luz. Mínimo 24 tomas.
- Fondo transparente o neutro uniforme.

## Modelo 3D

Copia el archivo directamente en `src/assets/models/<slug>.glb`. No pasa por este script. Para que pese poco, optimízalo antes con `npx @gltf-transform/cli optimize entrada.glb salida.glb --compress meshopt --texture-compress webp`. El visor ya decodifica Meshopt. En la ficha, el modelo 3D tiene prioridad sobre las fotos.

Después de añadir archivos: `npm run images` (o `npm run images -- <slug>`).
