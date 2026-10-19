/**
 * Incorporar el 360° de un modelo
 * ================================
 *
 * 1. Fotografiar el producto en plataforma giratoria: 36 tomas (cada 10°) o 72
 *    (cada 5°), cámara fija, misma luz, fondo transparente o neutro.
 * 2. Exportar en WebP con nombres ordenados:
 *      src/assets/360/<slug>/0001.webp … 0036.webp          (≈1600 px de ancho)
 *      src/assets/360/<slug>/zoom/0001.webp … 0036.webp     (≈3200 px, opcional)
 * 3. En `catalog.ts`, añadir al producto:
 *
 *      view360: sequence360(
 *        import.meta.glob('../assets/360/modelo-01/*.webp', { eager: true, import: 'default' }),
 *        { width: 1600, height: 1200 },
 *        import.meta.glob('../assets/360/modelo-01/zoom/*.webp', { eager: true, import: 'default' }),
 *      ),
 *
 * Solo se importan las URLs: las fotos se descargan al abrir el visor.
 */
import type { View360 } from './types'

const byName = (a: string, b: string) => a.localeCompare(b, undefined, { numeric: true })

function urls(modules: Record<string, unknown>) {
  return Object.keys(modules)
    .sort(byName)
    .map((k) => modules[k] as string)
}

export function sequence360(
  modules: Record<string, unknown>,
  size: { width: number; height: number },
  zoomModules?: Record<string, unknown>,
  options: Pick<View360, 'initialFrame' | 'reverse'> & { zoomWidth?: number } = {},
): View360 {
  const frames = urls(modules)
  const zoomFrames = zoomModules ? urls(zoomModules) : undefined
  return {
    frames,
    width: size.width,
    height: size.height,
    zoomFrames: zoomFrames && zoomFrames.length === frames.length ? zoomFrames : undefined,
    zoomWidth: zoomFrames ? (options.zoomWidth ?? size.width * 2) : undefined,
    initialFrame: options.initialFrame,
    reverse: options.reverse,
  }
}
