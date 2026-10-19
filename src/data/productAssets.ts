/**
 * Recursos visuales que se detectan solos por carpeta.
 * =================================================
 *
 * No hace falta tocar el catálogo para incorporar material real de un modelo:
 *
 *   Fotografías      assets-src/products/<slug>/hero.png (+ otras tomas)
 *                    → `npm run images` genera src/assets/products/<slug>/
 *                    Las tomas `accesorio-<nombre>.png` (piezas reales del kit,
 *                    recortadas) flotan junto al equipo en lugar de ir a la galería.
 *   Giro 360° real   assets-src/360/<slug>/0001.png … 0036.png
 *                    → `npm run images` genera src/assets/360/<slug>/
 *   Modelo 3D        src/assets/models/<slug>.glb
 *
 * `<slug>` es el de la URL del producto (p. ej. `carplay-625-freedconn`).
 * Prioridad en la ficha: modelo 3D → giro 360° → fotografía → render ilustrativo.
 */
import type { Model3D, View360, Visual } from './types'
import { sequence360 } from './view360'

interface ImageMeta {
  name: string
  width: number
  height: number
  /** true si el PNG de origen tiene transparencia real. */
  alpha: boolean
  widths: number[]
}

interface ProductImagesMeta {
  images: ImageMeta[]
}

const photoMeta = import.meta.glob<ProductImagesMeta>('../assets/products/*/meta.json', { eager: true, import: 'default' })
const photoFiles = import.meta.glob<string>('../assets/products/*/*.webp', { eager: true, import: 'default', query: '?url' })

const spinMeta = import.meta.glob<{ width: number; height: number }>('../assets/360/*/meta.json', { eager: true, import: 'default' })
const spinFiles = import.meta.glob<string>('../assets/360/*/[0-9]*.webp', { eager: true, import: 'default', query: '?url' })
const spinZoomFiles = import.meta.glob<string>('../assets/360/*/zoom/[0-9]*.webp', { eager: true, import: 'default', query: '?url' })

const modelFiles = import.meta.glob<string>('../assets/models/*.glb', { eager: true, import: 'default', query: '?url' })

const slugOf = (path: string, depth: number) => path.split('/').at(-1 - depth)!

function filesFor(files: Record<string, string>, slug: string, prefix: string) {
  return Object.fromEntries(Object.entries(files).filter(([k]) => k.startsWith(`${prefix}/${slug}/`)))
}

function toVisual(slug: string, image: ImageMeta, alt: string): Visual {
  const url = (w: number) => photoFiles[`../assets/products/${slug}/${image.name}-${w}.webp`]
  const widths = image.widths.filter((w) => url(w))
  const largest = widths.at(-1)!
  return {
    kind: 'image',
    src: url(widths.find((w) => w >= 1280) ?? largest),
    srcSet: widths.map((w) => `${url(w)} ${w}w`).join(', '),
    width: image.width,
    height: image.height,
    // Recorte con transparencia → objeto flotante; si no, escena fotográfica completa.
    fit: 'contain',
    presentation: image.alpha ? undefined : 'photograph',
    alt,
  }
}

/** Nombre visible de cada toma según su archivo. */
const VIEW_LABELS: Record<string, string> = {
  hero: 'Principal',
  frontal: 'Frontal',
  soporte: 'Con soporte',
  lateral: 'Lateral',
  trasera: 'Trasera',
  kit: 'Kit completo',
}

const isAccessory = (image: ImageMeta) => image.name.startsWith('accesorio-')

/** Fotografías del producto: la primera es la principal. */
export function productPhotos(slug: string, name: string): { visual: Visual; label: string }[] {
  const meta = photoMeta[`../assets/products/${slug}/meta.json`]
  if (!meta) return []
  return meta.images
    .filter((image) => !isAccessory(image))
    .map((image, i) => ({
      visual: toVisual(slug, image, i === 0 ? `${name}, fotografía de producto` : `${name}, vista ${VIEW_LABELS[image.name]?.toLowerCase() ?? i + 1}`),
      label: VIEW_LABELS[image.name] ?? `Vista ${i + 1}`,
    }))
}

/** Piezas del kit recortadas (`accesorio-<clave>`), por clave. */
export function productAccessories(slug: string, name: string): { key: string; visual: Visual }[] {
  const meta = photoMeta[`../assets/products/${slug}/meta.json`]
  if (!meta) return []
  return meta.images.filter(isAccessory).map((image) => {
    const key = image.name.replace('accesorio-', '')
    return { key, visual: toVisual(slug, image, `${name}: ${key}`) }
  })
}

/** Secuencia real de giro 360° (mínimo 24 tomas). */
export function productSpin(slug: string): View360 | undefined {
  const meta = spinMeta[`../assets/360/${slug}/meta.json`]
  const frames = filesFor(spinFiles, slug, '../assets/360')
  if (!meta || Object.keys(frames).length < 24) return undefined
  const zoom = Object.fromEntries(
    Object.entries(spinZoomFiles).filter(([k]) => slugOf(k, 2) === slug),
  )
  return sequence360(frames, meta, Object.keys(zoom).length ? zoom : undefined)
}

/** Modelo 3D real del producto. */
export function productModel(slug: string): Model3D | undefined {
  const src = modelFiles[`../assets/models/${slug}.glb`]
  return src ? { src } : undefined
}
