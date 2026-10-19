#!/usr/bin/env node
/**
 * Prepara las imágenes de producto para la web (requiere ImageMagick 7: `magick`).
 *
 *   assets-src/products/<slug>/hero.png, lateral.png, …
 *     → src/assets/products/<slug>/<nombre>-<ancho>.webp + meta.json
 *     La primera imagen (orden alfabético; `hero` siempre primero) es la principal.
 *
 *   assets-src/360/<slug>/0001.png … 0036.png   (mínimo 24 tomas)
 *     → src/assets/360/<slug>/0001.webp …, zoom/0001.webp … y meta.json
 *
 * Los originales se conservan en assets-src/ y no se publican.
 * Uso: npm run images            (todos)
 *      npm run images -- <slug>  (solo un producto)
 */
import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, readdirSync, rmSync, writeFileSync } from 'node:fs'
import { join, parse } from 'node:path'

const ROOT = new URL('..', import.meta.url).pathname
const SRC = join(ROOT, 'assets-src')
const OUT = join(ROOT, 'src/assets')
const PHOTO_WIDTHS = [640, 1024, 1600, 2400]
const SPIN_WIDTH = 1600
const SPIN_ZOOM_WIDTH = 3200
const only = process.argv[2]

const magick = (...args) => execFileSync('magick', args, { encoding: 'utf8' }).trim()
const isImage = (f) => /\.(png|webp|tiff?|jpe?g)$/i.test(f)

function size(file) {
  const [w, h] = magick('identify', '-format', '%w %h', `${file}[0]`).split(' ').map(Number)
  return { width: w, height: h }
}

/** true si la imagen tiene píxeles transparentes (recorte con fondo eliminado). */
function hasAlpha(file) {
  return magick('identify', '-format', '%[opaque]', `${file}[0]`).toLowerCase() === 'false'
}

function toWebp(input, output, width) {
  // Calidad alta con alfa sin pérdidas visibles; nunca se amplía el original.
  magick(input, '-resize', `${width}x>`, '-strip', '-quality', '88', '-define', 'webp:method=6', '-define', 'webp:alpha-quality=100', output)
}

function slugs(dir) {
  if (!existsSync(dir)) return []
  return readdirSync(dir, { withFileTypes: true })
    .filter((d) => d.isDirectory() && (!only || d.name === only))
    .map((d) => d.name)
}

for (const slug of slugs(join(SRC, 'products'))) {
  const dir = join(SRC, 'products', slug)
  const files = readdirSync(dir)
    .filter(isImage)
    .sort((a, b) => (parse(a).name === 'hero' ? -1 : parse(b).name === 'hero' ? 1 : a.localeCompare(b, undefined, { numeric: true })))
  if (!files.length) continue
  const out = join(OUT, 'products', slug)
  rmSync(out, { recursive: true, force: true })
  mkdirSync(out, { recursive: true })
  const images = files.map((file) => {
    const input = join(dir, file)
    const name = parse(file).name.toLowerCase().replace(/[^a-z0-9]+/g, '-')
    const { width, height } = size(input)
    const alpha = hasAlpha(input)
    const widths = PHOTO_WIDTHS.filter((w) => w < width).concat(width).filter((w, i, a) => a.indexOf(w) === i)
    for (const w of widths) toWebp(input, join(out, `${name}-${w}.webp`), w)
    if (!alpha) console.warn(`  ! ${slug}/${file}: sin transparencia; se mostrará como fotografía de escena, no como objeto flotante.`)
    if (width < 1600) console.warn(`  ! ${slug}/${file}: ${width}px de ancho; se recomiendan al menos 2400px.`)
    return { name, width, height, alpha, widths }
  })
  writeFileSync(join(out, 'meta.json'), JSON.stringify({ images }, null, 2) + '\n')
  console.log(`✓ fotos ${slug}: ${images.map((i) => `${i.name} (${i.width}×${i.height}${i.alpha ? ', alfa' : ''})`).join(', ')}`)
}

for (const slug of slugs(join(SRC, '360'))) {
  const dir = join(SRC, '360', slug)
  const files = readdirSync(dir).filter(isImage).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
  if (files.length < 24) {
    console.warn(`  ! 360 ${slug}: ${files.length} tomas; se necesitan al menos 24 (ideal 36 o 72).`)
    continue
  }
  const out = join(OUT, '360', slug)
  rmSync(out, { recursive: true, force: true })
  mkdirSync(join(out, 'zoom'), { recursive: true })
  const first = size(join(dir, files[0]))
  files.forEach((file, i) => {
    const name = `${String(i + 1).padStart(4, '0')}.webp`
    toWebp(join(dir, file), join(out, name), SPIN_WIDTH)
    if (first.width > SPIN_WIDTH) toWebp(join(dir, file), join(out, 'zoom', name), SPIN_ZOOM_WIDTH)
  })
  const w = Math.min(SPIN_WIDTH, first.width)
  writeFileSync(join(out, 'meta.json'), JSON.stringify({ width: w, height: Math.round((first.height * w) / first.width) }, null, 2) + '\n')
  console.log(`✓ 360 ${slug}: ${files.length} tomas`)
}
