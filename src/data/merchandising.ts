/**
 * Configuración comercial de la home: qué modelos se destacan y cómo se
 * agrupan. No contiene datos de producto: todo se lee del catálogo.
 *
 * - Favoritos y spotlight: listas de slugs, en orden. Un slug que no exista en
 *   el catálogo se ignora (no se inventan productos para rellenar).
 * - Colecciones: se calculan a partir de las especificaciones publicadas, para
 *   que un modelo solo aparezca donde su función está verificada.
 */
import { getProducts, products } from './catalog'
import { carplayProfile } from './carplayComparison'
import { feature } from './features'
import { priceValue } from './price'
import type { CategoryId, Product } from './types'

const bySlugs = (slugs: string[]) =>
  slugs.map((slug) => products.find((p) => p.slug === slug)).filter((p): p is Product => Boolean(p))

/* ---------- favoritos (pestañas de la home) ---------- */

export const favorites: { id: CategoryId; label: string; products: Product[] }[] = [
  {
    id: 'intercomunicadores',
    label: 'Intercomunicadores',
    products: bySlugs(['p30-pro', 'y13-pro', 's7-pro', 'q58-max', 'freedconn-hero', 'ejeas-q8']),
  },
  {
    id: 'carplay',
    label: 'Pantallas CarPlay',
    products: bySlugs([
      'carplay-625-freedconn',
      'carplay-7-waterproof',
      'carplay-625-magnetico',
      'carplay-7',
      'carplay-5-camaras-2k',
      'carplay-5-dual-bt',
    ]),
  },
  { id: 'accesorios', label: 'Sensores TPMS', products: getProducts('accesorios') },
]

/* ---------- portadas de categoría ---------- */

/**
 * Producto real que ilustra cada categoría en la home (su fotografía).
 * Intercomunicadores usa la portada propia de la categoría.
 */
export const categoryCovers: Partial<Record<CategoryId, Product | undefined>> = {
  carplay: bySlugs(['carplay-625-magnetico'])[0],
  accesorios: bySlugs(['tpms-kit-solar'])[0],
}

/** Modelo protagonista de la presentación CarPlay de la home. */
export const carplayShowcase: Product | undefined = bySlugs(['carplay-7'])[0]

/* ---------- spotlight editorial ---------- */

export const spotlight: Product[] = bySlugs(['freedconn-hero', 'carplay-625-freedconn', 'p30-pro'])

/* ---------- datos clave de un modelo ---------- */

function specValue(product: Product, label: string) {
  const value = product.specs.flatMap((g) => g.items).find((i) => i.label === label)?.value
  return value && value.status !== 'pending' ? value.display : null
}

/**
 * Hasta tres datos que resumen el modelo, tal como figuran en el catálogo:
 * los destacados de su ficha (intercomunicadores) o las características que lo
 * diferencian (showroom).
 */
export function keyFacts(product: Product, max = 3): string[] {
  if (product.positioning) return product.positioning.facts.slice(0, max)
  if (product.category === 'carplay' && product.showroom) return carplayProfile(product).highlights.slice(0, max)
  if (product.showroom) {
    const keys = product.showroom.features
    const tags = keys.filter((k) => feature(k).tag)
    const list = (tags.length ? tags : keys).map((k) => feature(k).short)
    return [...(product.showroom.screen ? [`Pantalla ${product.showroom.screen}`] : []), ...list].slice(0, max)
  }
  return product.benefits
    .map((b) => (b.title && b.title.status !== 'pending' ? b.title.display : null))
    .filter((t): t is string => Boolean(t))
    .slice(0, max)
}

/* ---------- colecciones por necesidad ---------- */

export interface Collection {
  id: string
  title: string
  body: string
  /** Criterio verificable con el que se eligen los modelos. */
  criterion: string
  products: Product[]
  /** Peso visual en la composición. */
  size: 'lg' | 'sm'
}

const isIntercom = (p: Product) => p.category === 'intercomunicadores' && p.productType !== 'helmet-audio'
const participants = (p: Product) => specValue(p, 'Participantes') ?? ''

export const collections: Collection[] = [
  {
    id: 'grupo',
    title: 'Para recorrer en grupo',
    body: 'Intercomunicadores que conectan hasta seis motociclistas en la misma conversación.',
    criterion: 'Participantes: hasta 6 riders o usuarios en red.',
    products: products.filter((p) => isIntercom(p) && /^Hasta 6 (riders|usuarios)/.test(participants(p))),
    size: 'lg',
  },
  {
    id: 'acompanado',
    title: 'Para viajar acompañado',
    body: 'Comunicación entre dos motociclistas: piloto y acompañante, o dos motos en ruta.',
    criterion: 'Participantes: 2 riders.',
    products: products.filter((p) => isIntercom(p) && /^2 riders/.test(participants(p))),
    size: 'lg',
  },
  {
    id: 'navegar',
    title: 'Para navegar conectado',
    body: 'Pantallas con Apple CarPlay y Android Auto inalámbricos para llevar mapas y música al manillar.',
    criterion: 'Apple CarPlay y Android Auto inalámbricos.',
    products: getProducts('carplay').filter((p) => p.showroom?.features.includes('carplay')),
    size: 'sm',
  },
  {
    id: 'musica',
    title: 'Para tu música y llamadas',
    body: 'Audífonos Bluetooth para casco. Son individuales: no funcionan como intercomunicador.',
    criterion: 'Audífonos Bluetooth para casco.',
    products: products.filter((p) => p.productType === 'helmet-audio'),
    size: 'sm',
  },
  {
    id: 'equipar',
    title: 'Para equipar tu moto',
    body: 'Sensores de presión de llantas y pantallas con cámaras delantera y trasera.',
    criterion: 'Sensores TPMS o cámaras delantera y trasera 2K.',
    products: [
      ...getProducts('accesorios'),
      ...getProducts('carplay').filter((p) => p.showroom?.features.includes('cameras2k')),
    ],
    size: 'sm',
  },
].filter((c) => c.products.length > 0) as Collection[]

/** Precio más bajo de una lista, para "Desde S/ …". */
export function minPrice(list: Product[]) {
  const values = list.map(priceValue).filter((n): n is number => n !== null)
  return values.length ? Math.min(...values) : null
}
