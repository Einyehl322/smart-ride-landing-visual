import { products, productCategoryLabel } from '../../data/catalog'
import type { Product } from '../../data/types'
import { toHref } from '../../router/base'
import { specDisplay } from '../ui/Placeholders'

const knownSlugs = new Set(products.map((product) => product.slug))

/** Solo conserva modelos actuales, sin duplicados ni datos ajenos al catálogo. */
export function normalizeSelection(value: unknown): string[] {
  return Array.isArray(value)
    ? [...new Set(value.filter((slug): slug is string => typeof slug === 'string' && knownSlugs.has(slug)))]
    : []
}

export function selectionUrl(list: Product[]) {
  const url = new URL(toHref('/'), window.location.origin)
  url.searchParams.set('seleccion', list.map((product) => product.slug).join(','))
  return url.href
}

export function interestMessage(list: Product[]): string {
  const lines = list.map((product) => {
    const price = specDisplay(product.commerce.price)
    return `• ${productCategoryLabel(product)}: ${product.name}${price ? ` — ${price}` : ''}`
  })
  return [
    `Hola, vengo de SMART RIDE. Me ${list.length === 1 ? 'interesa este producto' : 'interesan estos productos'}:`,
    '',
    ...lines,
    '',
    '¿Me confirman disponibilidad y compatibilidad con mi equipamiento?',
  ].join('\n')
}
