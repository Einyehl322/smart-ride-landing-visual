/**
 * Pantallas CarPlay y accesorios TPMS — catálogo SMART RIDE.
 *
 * Nombres, precios y características son los del catálogo del propietario
 * (17/10/2026). Mientras no haya fotos propias, cada modelo usa las de una
 * publicación del mismo equipo en el mercado (`reference`), marcadas en la web
 * como imagen referencial. Para agregar un modelo basta con una nueva llamada a
 * `showroomProduct()`; sus fotos, giro 360° o modelo 3D se detectan por slug
 * (ver `productAssets.ts`).
 */
import { feature, type FeatureKey } from './features'
import { formatPEN } from './price'
import { productAccessories, productModel, productPhotos, productSpin } from './productAssets'
import type { CategoryId, Product, ScreenSize, SpecGroup, Visual } from './types'
import { spec } from './types'

interface Options {
  slug: string
  category: Extract<CategoryId, 'carplay' | 'accesorios'>
  name: string
  price: number
  screen?: ScreenSize
  features: FeatureKey[]
  tagline: string
  summary: string
  featured?: boolean
  /** Origen de las fotos referenciales del mercado (ver `Showroom.reference`). */
  reference?: { source: string; url: string }
  /** Texto de cada pieza `accesorio-<clave>`; solo piezas que figuran en el catálogo. */
  accessories?: Record<string, string>
}

function placeholderVisual(o: Options): Visual {
  if (o.category === 'carplay') {
    return {
      kind: 'render',
      render: 'display',
      tone: 'graphite',
      bare: true,
      alt: `Render ilustrativo de pantalla CarPlay ${o.screen ?? ''} para motocicleta`.replace('  ', ' '),
    }
  }
  return { kind: 'render', render: 'pending', alt: `${o.name}, fotografía pendiente`, label: 'Fotografía próximamente' }
}

function specsFrom(o: Options): SpecGroup[] {
  return [
    ...(o.screen ? [{ group: 'Pantalla', items: [{ label: 'Tamaño', value: spec(o.screen) }] }] : []),
    {
      group: 'Características',
      items: o.features.map((key) => {
        const f = feature(key)
        return { label: f.row, value: spec(f.value ?? 'Sí') }
      }),
    },
  ]
}

function showroomProduct(o: Options): Product {
  const photos = productPhotos(o.slug, o.name)
  const visual = photos[0]?.visual ?? placeholderVisual(o)
  const accessories = productAccessories(o.slug, o.name)
    .filter((a) => o.accessories?.[a.key])
    .map((a) => ({ visual: { ...a.visual, alt: o.accessories![a.key] }, label: o.accessories![a.key] }))
  const price = formatPEN(o.price)

  return {
    slug: o.slug,
    category: o.category,
    name: o.name,
    isDemo: false,
    tagline: o.tagline,
    summary: o.summary,
    theme: { bg: '#07090d', surface: '#10131a', scheme: 'dark' },
    visual,
    highlights: [],
    details: [],
    benefits: o.features.map((key) => ({ title: spec(feature(key).label), body: null })),
    specs: specsFrom(o),
    gallery: photos.map((p) => ({ visual: p.visual, caption: p.label })),
    faqs: [
      {
        question: '¿Cómo confirmo disponibilidad y compatibilidad con mi moto?',
        answer: spec('Escríbenos por WhatsApp indicando el modelo y tu moto; te confirmamos disponibilidad y compatibilidad.'),
      },
    ],
    view360: productSpin(o.slug),
    model3d: productModel(o.slug),
    showroom: { screen: o.screen, features: o.features, featured: o.featured, reference: photos.length ? o.reference : undefined, accessories },
    commerce: { price: spec(price), promotion: null, availability: null, buyUrl: null },
  }
}

/* ---------- CarPlay ---------- */

export const carplayProducts: Product[] = [
  showroomProduct({
    slug: 'carplay-625-freedconn',
    reference: { source: 'AliExpress · «Freedconn» 6.25" GPS DVR', url: 'https://es.aliexpress.com/item/1005012945744716.html' },
    category: 'carplay',
    name: 'CarPlay 6.25" FreedConn',
    price: 560,
    screen: '6.25"',
    features: ['carplay', 'androidAuto', 'cameras2k', 'ip67', 'gpsSpeed'],
    accessories: { camaras: 'Cámaras delantera y trasera' },
    tagline: 'Navegación, cámaras 2K delantera y trasera y velocímetro con GPS.',
    summary: 'Pantalla de 6.25" para motocicleta con Apple CarPlay y Android Auto inalámbricos, cámaras delantera y trasera 2K y velocímetro con GPS.',
    featured: true,
  }),
  showroomProduct({
    slug: 'carplay-625-magnetico',
    reference: { source: 'AliExpress · «Freedconn» 6.25" pantalla extraíble', url: 'https://es.aliexpress.com/item/1005010395580534.html' },
    category: 'carplay',
    name: 'CarPlay 6.25" Magnético',
    price: 340,
    screen: '6.25"',
    features: ['carplay', 'androidAuto', 'magnetic', 'ip67', 'btSingle'],
    tagline: 'Base magnética fácil de desmontar, en formato de 6.25".',
    summary: 'Pantalla de 6.25" para motocicleta con Apple CarPlay y Android Auto inalámbricos y base magnética fácil de desmontar.',
  }),
  showroomProduct({
    slug: 'carplay-7',
    reference: { source: 'Carpuride W702S Pro', url: 'https://carpuride.com/products/carpuride-w702s-motorcycle-stereo-with-universal-mounting-bracket-bm05' },
    category: 'carplay',
    name: 'CarPlay 7"',
    price: 420,
    screen: '7"',
    features: ['carplay', 'androidAuto', 'tpmsOptional', 'ip67', 'btDual', 'remote'],
    tagline: 'Pantalla de 7" con Dual Bluetooth y control remoto multifuncional.',
    summary: 'Pantalla de 7" para motocicleta con Apple CarPlay y Android Auto inalámbricos, Dual Bluetooth + WiFi y control remoto multifuncional.',
  }),
  showroomProduct({
    slug: 'carplay-7-waterproof',
    reference: { source: 'AliExpress · 7" con soporte de liberación rápida y TPMS', url: 'https://es.aliexpress.com/item/1005013130388810.html' },
    category: 'carplay',
    name: 'CarPlay 7" Waterproof',
    price: 400,
    screen: '7"',
    features: ['carplay', 'androidAuto', 'magnetic', 'tpmsOptional', 'ip67', 'btDual'],
    tagline: 'Pantalla de 7" con base magnética y Dual Bluetooth.',
    summary: 'Pantalla de 7" para motocicleta con Apple CarPlay y Android Auto inalámbricos, base magnética fácil de desmontar y Dual Bluetooth + WiFi.',
  }),
  showroomProduct({
    slug: 'carplay-5-camaras-2k',
    reference: { source: 'AliExpress · 5" con cámara dual', url: 'https://es.aliexpress.com/item/1005010576192879.html' },
    category: 'carplay',
    name: 'CarPlay 5" + Cámaras 2K',
    price: 450,
    screen: '5"',
    features: ['carplay', 'androidAuto', 'cameras2k', 'tpms', 'ip67', 'btSingle'],
    accessories: { camaras: 'Cámaras delantera y trasera' },
    tagline: 'Formato de 5" con cámaras 2K delantera y trasera y sensores de llanta.',
    summary: 'Pantalla de 5" para motocicleta con Apple CarPlay y Android Auto inalámbricos, cámaras delantera y trasera 2K y sensores de llanta (TPMS).',
  }),
  showroomProduct({
    slug: 'carplay-5-dual-bt',
    reference: { source: 'AliExpress · 5" Bluetooth dual con TPMS', url: 'https://es.aliexpress.com/item/1005010610158372.html' },
    category: 'carplay',
    name: 'CarPlay 5" Dual BT',
    price: 249.9,
    screen: '5"',
    features: ['carplay', 'androidAuto', 'tpmsOptional', 'ip67', 'btDual'],
    tagline: 'Formato de 5" con Dual Bluetooth + WiFi.',
    summary: 'Pantalla de 5" para motocicleta con Apple CarPlay y Android Auto inalámbricos y Dual Bluetooth + WiFi.',
  }),
  showroomProduct({
    slug: 'carplay-5-navegacion',
    reference: { source: 'Linkifun MT11 / MT11A', url: 'https://www.linkifun.com/products/linkifu-mt11a-5-motorcycle-navigation-screen-with-wireless-carplay-android-auto-ip67-waterproof-single-bluetooth-optional-tpms' },
    category: 'carplay',
    name: 'CarPlay 5" Navegación',
    price: 249.9,
    screen: '5"',
    features: ['carplay', 'androidAuto', 'tpmsOptional', 'ip67', 'btSingle'],
    tagline: 'Formato de 5" con CarPlay y Android Auto inalámbricos.',
    summary: 'Pantalla de 5" para motocicleta con Apple CarPlay y Android Auto inalámbricos y Single Bluetooth + WiFi.',
  }),
]

/* ---------- Accesorios TPMS ---------- */

const tpmsFeatures: FeatureKey[] = ['liveReadings', 'usbDisplay', 'sensorBattery', 'waterproof', 'autoAlert']

export const accessoryProducts: Product[] = [
  showroomProduct({
    slug: 'tpms-kit-solar',
    reference: { source: 'Amazon · TPMS solar para moto (B0GTQPXY82)', url: 'https://www.amazon.com/dp/B0GTQPXY82' },
    category: 'accesorios',
    name: 'TPMS para moto — Kit solar',
    price: 250,
    features: tpmsFeatures,
    tagline: 'Presión y temperatura de tus llantas, en tiempo real.',
    summary: 'Sensores de presión y temperatura de llantas para moto, con pantalla recargable por USB y alerta automática.',
  }),
  showroomProduct({
    slug: 'tpms-compacto',
    reference: { source: 'Amazon · TPMS M3 para moto (B0CYT1QC8B)', url: 'https://www.amazon.com/dp/B0CYT1QC8B' },
    category: 'accesorios',
    name: 'TPMS para moto — Compacto',
    price: 110,
    features: tpmsFeatures,
    tagline: 'Presión y temperatura de tus llantas, en tiempo real.',
    summary: 'Sensores de presión y temperatura de llantas para moto, con pantalla recargable por USB y alerta automática.',
  }),
]

/**
 * URLs de los modelos demostrativos retirados. Llevan a la categoría para no
 * romper enlaces compartidos.
 */
export const retiredSlugs: Record<string, CategoryId> = {
  'carplay-625-full': 'carplay',
  'carplay-81-hd': 'carplay',
  'carplay-7-magnetica': 'carplay',
}
