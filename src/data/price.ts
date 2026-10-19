import type { Product } from './types'

const pen = new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' })

/** 249.9 → "S/ 249.90" */
export function formatPEN(amount: number) {
  return pen.format(amount)
}

/** Partes del precio para componerlo tipográficamente (moneda, entero, decimales). */
export function penParts(amount: number) {
  const parts = pen.formatToParts(amount)
  const pick = (...types: string[]) => parts.filter((p) => types.includes(p.type)).map((p) => p.value).join('')
  return { currency: pick('currency'), integer: pick('integer', 'group'), fraction: pick('fraction') }
}

/** Importe numérico del precio publicado, o null si no hay precio. */
export function priceValue(product: Product): number | null {
  const price = product.commerce.price
  if (!price || price.status === 'pending') return null
  const n = Number(price.display.replace(/[^\d.]/g, ''))
  return Number.isFinite(n) && n > 0 ? n : null
}
