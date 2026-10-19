import { priceValue } from './price'
import type { Product } from './types'

export type ProductSort = 'featured' | 'price-asc' | 'price-desc'

/** Ordena una copia. Los precios sin publicar quedan al final en ambos sentidos. */
export function sortProducts(list: readonly Product[], sort: ProductSort): Product[] {
  if (sort === 'featured') return [...list]
  const direction = sort === 'price-asc' ? 1 : -1
  return [...list].sort((a, b) => {
    const first = priceValue(a)
    const second = priceValue(b)
    if (first === null) return second === null ? 0 : 1
    if (second === null) return -1
    return (first - second) * direction
  })
}
