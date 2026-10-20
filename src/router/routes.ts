import { getCategory, getCategoryBySlug, getProduct } from '../data/catalog'
import { retiredSlugs } from '../data/showroom'
import type { Category, Product } from '../data/types'

/** URLs anteriores de modelos renombrados o reemplazados: siguen abriendo su ficha. */
const movedSlugs: Record<string, string> = {
  'v12-earphone': 'y12',
  'tpms-compacto': 'tpms-panel-solar',
}

export type Route =
  | { name: 'home' }
  | { name: 'category'; category: Category }
  | { name: 'product'; product: Product }
  | { name: 'not-found' }

export function matchRoute(pathname: string): Route {
  const parts = pathname.split('/').filter(Boolean)
  if (parts.length === 0) return { name: 'home' }
  if (parts.length === 1) {
    const category = getCategoryBySlug(parts[0])
    return category ? { name: 'category', category } : { name: 'not-found' }
  }
  if (parts.length === 2) {
    const product = getProduct(parts[0], movedSlugs[parts[1]] ?? parts[1])
    if (product) return { name: 'product', product }
    // Modelos demostrativos retirados: sus enlaces llevan a la categoría.
    const retired = retiredSlugs[parts[1]]
    return retired && getCategory(retired).slug === parts[0] ? { name: 'category', category: getCategory(retired) } : { name: 'not-found' }
  }
  return { name: 'not-found' }
}
