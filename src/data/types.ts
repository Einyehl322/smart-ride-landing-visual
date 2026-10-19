import type { FeatureKey } from './features'

export type CategoryId = 'intercomunicadores' | 'carplay' | 'accesorios'

/** Tamaños de pantalla publicados en el catálogo CarPlay. */
export type ScreenSize = '5"' | '6.25"' | '7"'

export type RenderTone = 'graphite' | 'sand'

/**
 * Fuente visual de un producto. Mientras falten fotografías oficiales se pueden
 * usar renders ilustrados (`kind: 'render'`). Para incorporar una foto real basta
 * con usar `kind: 'image'`.
 */
export type Visual =
  | {
      kind: 'render'
      render: 'display'
      tone: RenderTone
      alt: string
      /** Solo la pantalla, sin manillar ni soporte (no se conoce su montaje real). */
      bare?: boolean
    }
  /** Producto sin fotografía todavía: marcador sobrio, sin dibujar un diseño inventado. */
  | { kind: 'render'; render: 'pending'; alt: string; label: string }
  | {
      kind: 'image'
      src: string
      srcSet?: string
      alt: string
      width: number
      height: number
      /** Fotografía de escena: conserva el encuadre, sin giro en perspectiva. */
      presentation?: 'photograph'
      /** `contain` para recortes con fondo transparente, `cover` para fotografías. */
      fit: 'contain' | 'cover'
      /** object-position para `cover`, p. ej. "62% 48%". */
      position?: string
      /**
       * Secuencia de fotos para un giro 360° real (24–36 tomas en plataforma
       * giratoria, mismo encuadre y fondo transparente). Opcional.
       */
      spinFrames?: string[]
    }

/** Encuadre de cámara sobre un visual: punto de interés (en %) y acercamiento. */
export interface Focus {
  x: number
  y: number
  zoom: number
}

export interface Category {
  id: CategoryId
  /** Segmento de URL. */
  slug: string
  name: string
  eyebrow: string
  headline: string
  lede: string
  /** Beneficio breve para tarjetas de categoría. */
  benefit: string
  /** Momentos narrativos de la sección de universo. */
  beats: { title: string; body: string; focus: Focus }[]
  visual: Visual
}

/**
 * Estado de verificación de un dato comercial.
 * - 'confirmed': verificado por catálogo oficial o manual.
 * - 'pending': pendiente de validación; se muestra como "Consultar".
 * - 'discrepancy': existen fuentes contradictorias; se muestra la del catálogo
 *   con nota interna para revisión.
 */
export type SpecStatus = 'confirmed' | 'pending' | 'discrepancy'

/**
 * Un valor de especificación con metadatos de procedencia.
 * `display` es el texto que se muestra al usuario.
 * `status` controla cómo se presenta (valor directo / "Consultar").
 * `note` es interno: no se muestra en la web, sirve para tracking de validación.
 */
export interface SpecValue {
  /** Texto visible en la tabla / ficha. */
  display: string
  /** Estado de verificación. */
  status: SpecStatus
  /** Observación interna (fuente, discrepancia, etc.). */
  note?: string
}

/** `null` significa "sin información; ocultar fila si todos son null". */
export type SpecCell = SpecValue | null

export interface SpecGroup {
  group: string
  items: { label: string; value: SpecCell }[]
}

/**
 * Recursos del visor 360°: fotografías reales del producto tomadas en
 * plataforma giratoria (24–72 tomas, mismo encuadre y la misma luz).
 * Ver `src/data/view360.ts` para incorporarlas.
 */
export interface View360 {
  /** URLs en orden de giro. */
  frames: string[]
  /** Tamaño en píxeles de cada toma de `frames`. */
  width: number
  height: number
  /** Opcional: la misma secuencia en alta resolución, para pantallas densas y zoom. */
  zoomFrames?: string[]
  zoomWidth?: number
  /** Toma que coincide con la vista frontal de la ficha. */
  initialFrame?: number
  /** true si las tomas avanzan en sentido antihorario. */
  reverse?: boolean
  /** Solo para el banco de pruebas: no es una fotografía del producto. */
  isTestPattern?: boolean
}

/**
 * Modelo 3D real del producto (GLB). Se detecta solo al dejar el archivo en
 * `src/assets/models/<slug>.glb` (ver `src/data/productAssets.ts`).
 */
export interface Model3D {
  src: string
  /** Giro inicial en grados para que la vista coincida con la foto principal. */
  initialYaw?: number
  /** Solo para el banco de pruebas: no es el producto. */
  isTestModel?: boolean
}

/** Datos de exhibición: tamaño de pantalla y características del catálogo. */
export interface Showroom {
  screen?: ScreenSize
  /** Características tal como figuran en el catálogo, en su orden. */
  features: FeatureKey[]
  /** Modelo destacado en el showroom. */
  featured?: boolean
  /**
   * Las fotos son de una publicación del mismo modelo en el mercado, no de la
   * unidad de SMART RIDE. Se indica como "imagen referencial".
   */
  reference?: { source: string; url: string }
  /** Piezas reales del kit que flotan junto al equipo (cámaras, sensores…). */
  accessories?: { visual: Visual; label: string }[]
}

export interface Product {
  slug: string
  category: CategoryId
  /** Tipo comercial dentro de la colección y su ruta existentes. */
  productType?: 'intercom' | 'helmet-audio'
  name: string
  /**
   * Marca el producto como demostrativo (no disponible para la venta).
   * Cuando los datos reales están cargados, poner `false`.
   */
  isDemo: boolean
  /** Etiqueta opcional: "Nuevo", "Popular", etc. */
  badge?: string
  tagline: string
  summary: string
  /** Beneficios para elegir el modelo, vinculados a datos y condiciones publicados. */
  positioning?: {
    audience: string
    reason: string
    facts: string[]
    benefits: { title: string; body: string; evidence: string }[]
    conditions?: string
    checkBeforeBuying?: string
    sources?: { title: string; url: string }[]
  }
  theme: {
    /** Fondo del universo del producto. */
    bg: string
    /** Superficie secundaria (paneles). */
    surface: string
    scheme: 'dark' | 'light'
  }
  visual: Visual
  /** Introducción visual: la cámara recorre estos puntos del producto. */
  highlights: { title: SpecCell; body: SpecCell; focus: Focus }[]
  /** Acercamientos de detalle. */
  details: { caption: SpecCell; visual: Visual; focus: Focus }[]
  benefits: { title: SpecCell; body: SpecCell }[]
  specs: SpecGroup[]
  gallery: { visual: Visual; focus?: Focus; caption: string }[]
  faqs: { question: string; answer: SpecCell }[]
  /** Visor 360°. Si no existe, el producto mantiene su presentación actual. */
  view360?: View360
  /** Visor 3D. Tiene prioridad sobre `view360` en la ficha. */
  model3d?: Model3D
  /** Presentación tipo showroom (CarPlay y accesorios). */
  showroom?: Showroom
  commerce: {
    price: SpecCell
    promotion: SpecCell
    availability: SpecCell
    /** Enlace a una tienda real, si existe. */
    buyUrl: SpecCell
  }
}

/** Helper: crea un SpecValue confirmado. */
export function spec(value: string, note?: string): SpecValue {
  return { display: value, status: 'confirmed', note }
}

/** Helper: crea un SpecValue pendiente (se mostrará como "Consultar"). */
export function specPending(note?: string): SpecCell {
  return { display: '', status: 'pending', note }
}

/** Helper: crea un SpecValue con discrepancia (usa el dato del catálogo). */
export function specDiscrepancy(catalogValue: string, note: string): SpecValue {
  return { display: catalogValue, status: 'discrepancy', note }
}
