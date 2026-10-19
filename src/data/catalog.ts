/**
 * Catálogo SMART RIDE.
 *
 * Modelos reales de intercomunicadores, pantallas CarPlay y accesorios TPMS
 * para motocicleta. CarPlay y accesorios viven en `showroom.ts`.
 * Los valores usan las funciones `spec()`, `specPending()` y `specDiscrepancy()`
 * para registrar el estado de verificación de cada dato.
 *
 * Precios en soles peruanos (S/).
 *
 * Para actualizar un precio, busca `commerce.price` en el modelo correspondiente.
 */
import { media, productMedia } from './media'
import type { Category, CategoryId, Product, SpecCell, SpecGroup, Visual } from './types'
import { spec, specPending, specDiscrepancy } from './types'
import { accessoryProducts, carplayProducts } from './showroom'
import { positionCatalogue } from './productPositioning'

/* ---------- visuales compartidos ---------- */

const intercomHelmet: Visual = {
  kind: 'image',
  ...media.casco,
  fit: 'cover',
  position: '58% 50%',
  alt: 'Intercomunicador montado en el lateral de un casco de motocicleta',
}

const displayGraphite: Visual = {
  kind: 'render',
  render: 'display',
  tone: 'graphite',
  bare: true,
  alt: 'Render ilustrativo de pantalla CarPlay para motocicleta con interfaz de navegación',
}

const v12Visual: Visual = {
  kind: 'image',
  ...media.v12Hero,
  fit: 'contain',
  presentation: 'photograph',
  alt: 'V12 Pro Wireless Earphone con iluminación RGB, vista en tres cuartos',
}

/** Intercomunicador grupal real (FreedConn Hero) para representar la categoría. */
const freedConnVisual: Visual = {
  kind: 'image',
  ...productMedia['freedconn-hero'],
  fit: 'contain',
  presentation: 'photograph',
  alt: 'Intercomunicador FreedConn Hero con iluminación azul sobre superficie mojada',
}

/* ---------- categorías ---------- */

export const categories: Category[] = [
  {
    id: 'intercomunicadores',
    slug: 'intercomunicadores',
    name: 'Intercomunicadores',
    eyebrow: 'Comunicación en ruta',
    headline: 'Cada voz del grupo, dentro del casco.',
    lede: 'Intercomunicadores y audífonos Bluetooth para hablar con tu acompañante, escuchar música y atender lo importante sin soltar el manillar. Tecnología que se instala en tu casco y te acompaña en cada ruta.',
    benefit: 'Habla con tu acompañante o tu grupo, escucha música y atiende llamadas desde el casco.',
    beats: [
      {
        title: 'Comunicación',
        body: 'Habla con tu acompañante o con el resto del grupo mientras la ruta continúa.',
        focus: { x: 50, y: 50, zoom: 1 },
      },
      {
        title: 'Conectividad',
        body: 'Se vincula con tu teléfono para música, llamadas e indicaciones de navegación.',
        focus: { x: 68, y: 50, zoom: 1.25 },
      },
      {
        title: 'Control',
        body: 'Controles al alcance de la mano, para no apartar la vista del camino.',
        focus: { x: 40, y: 42, zoom: 1.18 },
      },
    ],
    visual: freedConnVisual,
  },
  {
    id: 'carplay',
    slug: 'carplay',
    name: 'CarPlay',
    eyebrow: 'Navegación a la vista',
    headline: 'Tu ruta, siempre a la vista.',
    lede: 'Pantallas para motocicleta que llevan la navegación y las apps compatibles de tu teléfono al manillar, con Apple CarPlay y Android Auto. Mapas, música y llamadas en un solo lugar.',
    benefit: 'Mapas, música y llamadas de tu teléfono en una pantalla para el manillar.',
    beats: [
      {
        title: 'Navegación',
        body: 'Mapas e indicaciones en una pantalla dedicada, frente a ti y no en el bolsillo.',
        focus: { x: 50, y: 42, zoom: 1 },
      },
      {
        title: 'Conectividad',
        body: 'Proyecta las apps compatibles de tu teléfono para usarlas durante el viaje.',
        focus: { x: 30, y: 40, zoom: 1.35 },
      },
      {
        title: 'Comodidad',
        body: 'Música, llamadas y ruta en un solo lugar, para concentrarte en conducir.',
        focus: { x: 66, y: 58, zoom: 1.3 },
      },
    ],
    visual: displayGraphite,
  },
  {
    id: 'accesorios',
    slug: 'accesorios',
    name: 'Accesorios',
    eyebrow: 'Sensores TPMS',
    headline: 'La presión de tus llantas, a la vista.',
    lede: 'Sensores de presión y temperatura de llantas para moto, con pantalla recargable por USB y alerta automática.',
    benefit: 'Presión y temperatura de tus llantas en tiempo real, con alerta automática.',
    beats: [],
    visual: { kind: 'render', render: 'pending', alt: 'Sensores TPMS para moto, fotografía pendiente', label: 'Fotografía próximamente' },
  },
]

/* ---------- helpers de especificaciones: intercomunicadores ---------- */

function intercomSpecs(opts: {
  bluetooth: SpecCell
  alcance: SpecCell
  participantes: SpecCell
  autonomiaIntercom: SpecCell
  autonomiaMusica: SpecCell
  carga: SpecCell
  resistencia: SpecCell
  peso: SpecCell
  montaje: SpecCell
  reduccionRuido: SpecCell
}): SpecGroup[] {
  return [
    {
      group: 'Comunicación',
      items: [
        { label: 'Bluetooth', value: opts.bluetooth },
        { label: 'Alcance', value: opts.alcance },
        { label: 'Participantes', value: opts.participantes },
        { label: 'Reducción de ruido', value: opts.reduccionRuido },
      ],
    },
    {
      group: 'Batería',
      items: [
        { label: 'Autonomía (intercom)', value: opts.autonomiaIntercom },
        { label: 'Autonomía (música)', value: opts.autonomiaMusica },
        { label: 'Tiempo de carga', value: opts.carga },
      ],
    },
    {
      group: 'Diseño',
      items: [
        { label: 'Resistencia al agua', value: opts.resistencia },
        { label: 'Peso', value: opts.peso },
        { label: 'Montaje', value: opts.montaje },
      ],
    },
  ]
}

/** Commerce con precio en soles. */
function commercePEN(price: string) {
  return { price: spec(price), promotion: null, availability: null, buyUrl: null } as const
}

/* ===================================================================
   INTERCOMUNICADORES — modelos con datos del catálogo SMART RIDE
   =================================================================== */

/**
 * V12 Motorcycle Earphone — Audífono Bluetooth para casco.
 * NO es intercomunicador: es un audífono individual para música y llamadas.
 * Diseño con iluminación RGB, botones hexagonales y perfil compacto.
 */
const v12Earphone: Product = {
  slug: 'v12-earphone',
  category: 'intercomunicadores',
  productType: 'helmet-audio',
  name: 'V12 Pro Motorcycle Earphone',
  isDemo: false,
  badge: 'Nuevo',
  tagline: 'Tu música, tus llamadas. Tu casco.',
  summary:
    'Audífono Bluetooth diseñado para integrarse al casco de motocicleta. Iluminación RGB, botones hexagonales intuitivos y sonido envolvente para disfrutar cada ruta con tu música o atender llamadas sin distracciones.',
  theme: { bg: '#0b0c10', surface: '#15171d', scheme: 'dark' },
  visual: v12Visual,
  highlights: [
    { title: spec('Iluminación RGB'), body: spec('Anillo de luz personalizable que destaca en la ruta.'), focus: { x: 65, y: 45, zoom: 1.4 } },
    { title: spec('Botones hexagonales'), body: spec('Controles intuitivos: volumen, micrófono y multimedia.'), focus: { x: 40, y: 55, zoom: 1.5 } },
    { title: spec('Perfil compacto'), body: spec('Diseño angular que se integra al casco sin protuberancias.'), focus: { x: 50, y: 50, zoom: 1 } },
  ],
  details: [
    { caption: spec('Vista general del V12'), visual: v12Visual, focus: { x: 50, y: 50, zoom: 1.1 } },
    { caption: spec('Anillo RGB y logo M'), visual: v12Visual, focus: { x: 68, y: 42, zoom: 1.7 } },
    { caption: spec('Botones + / mic / -'), visual: v12Visual, focus: { x: 38, y: 58, zoom: 1.6 } },
  ],
  benefits: [
    { title: spec('Audio inmersivo'), body: spec('Drivers de 40 mm con graves profundos para música y navegación.') },
    { title: spec('Controles con guantes'), body: spec('Botones hexagonales grandes que puedes operar sin quitarte los guantes.') },
    { title: spec('Diseño llamativo'), body: spec('Iluminación RGB que te distingue en el grupo y aumenta tu visibilidad.') },
  ],
  specs: intercomSpecs({
    bluetooth: specPending('Valor anterior: Bluetooth 5.3. Sin fuente trazable para esta versión V12; confirmar la unidad disponible.'),
    alcance: specPending('Valor anterior: hasta 10 m de audio desde el teléfono. Confirmar en ficha de la versión V12 disponible.'),
    participantes: spec('1 usuario (audífono individual)'),
    autonomiaIntercom: spec('No aplica — es audífono, no intercomunicador'),
    autonomiaMusica: specPending('Valor anterior: hasta 12 h. Confirmar mediante manual o ficha de proveedor del V12 exacto.'),
    carga: specPending('Valor anterior: USB-C, ~1.5 h. Confirmar conexión y tiempo de carga de la unidad.'),
    resistencia: specPending('Valor anterior: IP55. No se encontró una ficha primaria asociable a la unidad V12 disponible.'),
    peso: specPending('No disponible — verificar con manual'),
    montaje: specPending('Valor anterior: clip / abrazadera. Confirmar soporte incluido para el V12 disponible.'),
    reduccionRuido: specPending('Valor anterior: sí (pasiva). Confirmar prestaciones de audio de la versión V12.'),
  }),
  gallery: [
    { visual: v12Visual, caption: 'Vista general' },
    { visual: v12Visual, focus: { x: 68, y: 42, zoom: 1.7 }, caption: 'Anillo RGB' },
    { visual: v12Visual, focus: { x: 38, y: 58, zoom: 1.6 }, caption: 'Botones hexagonales' },
    { visual: intercomHelmet, caption: 'Montado en el casco' },
  ],
  faqs: [
    { question: '¿El V12 permite comunicarme con otro motociclista?', answer: spec('No. El V12 es un audífono Bluetooth individual para escuchar música y atender llamadas desde tu teléfono. No tiene función de intercomunicador.') },
    { question: '¿Puedo usarlo para GPS y música al mismo tiempo?', answer: spec('Confirma con nosotros el comportamiento de audio de la versión disponible y su compatibilidad con tu teléfono.') },
    { question: '¿Es resistente a la lluvia?', answer: spec('Consúltanos por la resistencia declarada de la unidad disponible. La clasificación IP del V12 está pendiente de confirmar.') },
    { question: '¿Qué incluye la caja?', answer: specPending('Verificar contenido con el producto físico.') },
    { question: '¿Cómo puedo consultar precio y disponibilidad?', answer: spec('Escríbenos desde el botón de consulta y te responderemos con la información actualizada.') },
  ],
  commerce: commercePEN('S/ 75.00'),
}

/**
 * EJEAS Q8 — S/ 299.90
 * Fuente: catálogo SMART RIDE.
 * Nota: Mesh + Bluetooth, hasta 6 usuarios, 1000 m.
 * Autonomías diferenciadas por modo (Mesh / BT / música).
 */
const ejeasQ8: Product = {
  slug: 'ejeas-q8',
  category: 'intercomunicadores',
  name: 'EJEAS Q8',
  isDemo: false,
  badge: 'Destacado',
  tagline: 'Las mejores rutas también se comparten.',
  summary:
    'El EJEAS Q8 combina intercomunicación Mesh y Bluetooth para grupos de hasta 6 usuarios con un alcance de hasta 1000 m. Hasta 30 horas de autonomía y música compartida. El modelo más completo para quienes viajan en grupo.',
  theme: { bg: '#090b10', surface: '#131824', scheme: 'dark' },
  visual: intercomHelmet,
  highlights: [
    { title: spec('Intercom Mesh'), body: spec('Tecnología Mesh para grupos estables sin desconexiones.'), focus: { x: 55, y: 50, zoom: 1 } },
    { title: spec('Hasta 1000 m'), body: spec('Alcance declarado de 1 km para mantener la comunicación en ruta abierta.'), focus: { x: 60, y: 51, zoom: 1.45 } },
    { title: spec('30 horas'), body: spec('Autonomía declarada de hasta 30 h según el modo de uso.'), focus: { x: 42, y: 54, zoom: 1.5 } },
  ],
  details: [
    { caption: spec('Vista lateral'), visual: intercomHelmet, focus: { x: 60, y: 51, zoom: 1.6 } },
    { caption: spec('Botonera'), visual: intercomHelmet, focus: { x: 42, y: 54, zoom: 1.65 } },
    { caption: spec('Detalle de montaje'), visual: intercomHelmet, focus: { x: 48, y: 62, zoom: 1.75 } },
  ],
  benefits: [
    { title: spec('Mesh + Bluetooth'), body: spec('Conexión Mesh para grupos y Bluetooth individual. Lo mejor de ambas tecnologías.') },
    { title: spec('Música compartida'), body: spec('Comparte música con tu acompañante mientras hablan.') },
    { title: spec('Hasta 30 h'), body: spec('Autonomía declarada de hasta 30 h (varía según el modo).') },
  ],
  specs: intercomSpecs({
    bluetooth: spec('Bluetooth 5.1 + Mesh'),
    alcance: spec('Hasta 1000 m'),
    participantes: spec('Hasta 6 usuarios (Mesh)'),
    autonomiaIntercom: spec('9 h Mesh / 17 h BT'),
    autonomiaMusica: spec('Hasta 29 h'),
    carga: specDiscrepancy('2 h', 'Catálogo local: 2 h. Ficha oficial EJEAS Q8 consultada el 19/10/2026: 40–45 min. Confirmar versión y condiciones de carga de la unidad disponible.'),
    resistencia: spec('IP67'),
    peso: specPending('No disponible — verificar con manual'),
    montaje: spec('Clip / abrazadera al casco'),
    reduccionRuido: spec('Sí'),
  }),
  gallery: [
    { visual: intercomHelmet, caption: 'Vista general' },
    { visual: intercomHelmet, focus: { x: 60, y: 51, zoom: 1.5 }, caption: 'Control principal' },
    { visual: intercomHelmet, focus: { x: 42, y: 55, zoom: 1.55 }, caption: 'Botonera' },
  ],
  faqs: [
    { question: '¿Cuántos usuarios puede conectar el EJEAS Q8?', answer: spec('Hasta 6 usuarios en red Mesh.') },
    { question: '¿Cuánto dura la batería en modo Mesh?', answer: spec('Hasta 9 horas en intercomunicación Mesh, 17 h en Bluetooth y 29 h en música.') },
    { question: '¿Es compatible con mi casco?', answer: spec('Compatible con la mayoría de cascos mediante clip. Escríbenos para confirmar.') },
    { question: '¿Qué incluye la caja?', answer: specPending('Verificar contenido con el producto físico.') },
    { question: '¿Qué garantía tiene?', answer: specPending('Consultar condiciones de garantía.') },
    { question: '¿Cómo puedo consultar precio y disponibilidad?', answer: spec('Escríbenos desde el botón de consulta y te responderemos con la información actualizada.') },
  ],
  commerce: commercePEN('S/ 299.90'),
}

/**
 * Fichas comerciales suministradas por SMART RIDE (16/10/2026).
 * Solo se publican los datos del catálogo autorizado. La autonomía es general:
 * no se asigna a conversación o música sin confirmar la versión exacta.
 */
function rideProduct(opts: {
  slug: keyof typeof productMedia
  name: string
  price: string
  productType?: Product['productType']
  tagline: string
  summary: string
  specs: SpecGroup[]
  featureLabels: string[]
  faqs?: Product['faqs']
}): Product {
  const visual: Visual = {
    kind: 'image',
    ...productMedia[opts.slug],
    fit: 'contain',
    presentation: 'photograph',
    alt: `${opts.name}, fotografía de producto con iluminación sobre fondo azul oscuro`,
  }
  const features = opts.featureLabels.map((label) => {
    const item = opts.specs.flatMap((g) => g.items).find((i) => i.label === label)!
    return { title: item.value, body: spec(label) }
  })
  return {
    slug: opts.slug,
    category: 'intercomunicadores',
    productType: opts.productType ?? 'intercom',
    name: opts.name,
    isDemo: false,
    tagline: opts.tagline,
    summary: opts.summary,
    theme: { bg: '#060e19', surface: '#0c1a2a', scheme: 'dark' },
    visual,
    highlights: features.map((feature, i) => ({
      ...feature,
      focus: { x: 50, y: 50, zoom: 1 + i * 0.015 },
    })),
    details: [{ caption: spec(`Fotografía de ${opts.name}`), visual, focus: { x: 50, y: 50, zoom: 1 } }],
    benefits: features,
    specs: opts.specs,
    gallery: [{ visual, caption: opts.name }],
    faqs: [
      ...(opts.faqs ?? []),
      { question: '¿Cómo confirmo disponibilidad y compatibilidad?', answer: spec('Escríbenos por WhatsApp indicando el modelo y tu equipamiento para confirmar disponibilidad y compatibilidad.') },
    ],
    commerce: commercePEN(opts.price),
  }
}

function rideSpecs(opts: {
  bluetooth: string
  alcance?: string
  participantes?: string
  autonomia: SpecCell
  proteccion: string
  ruido?: string
  funciones?: { label: string; value: string }[]
}): SpecGroup[] {
  return [
    { group: 'Comunicación', items: [
      { label: 'Bluetooth', value: spec(opts.bluetooth) },
      ...(opts.alcance ? [{ label: 'Alcance declarado', value: spec(opts.alcance) }] : []),
      ...(opts.participantes ? [{ label: 'Participantes', value: spec(opts.participantes) }] : []),
      { label: 'Reducción de ruido', value: spec(opts.ruido ?? 'Sí') },
      ...(opts.funciones ?? []).map((f) => ({ label: f.label, value: spec(f.value) })),
    ] },
    { group: 'Batería', items: [{ label: 'Autonomía declarada', value: opts.autonomia }] },
    { group: 'Diseño', items: [{ label: 'Resistencia al agua', value: spec(opts.proteccion) }] },
  ]
}

const y13Pro = rideProduct({
  slug: 'y13-pro', name: 'Y13 Pro', price: 'S/ 75.00',
  tagline: 'Comparte la ruta. Mantén la conexión.',
  summary: 'Disfruta de tus recorridos con comunicación entre dos motociclistas y funciones para compartir música. Una alternativa accesible para mantenerte conectado durante tus viajes.',
  specs: rideSpecs({ bluetooth: 'Bluetooth 6.0', alcance: '700 metros', participantes: '2 riders', autonomia: spec('22 horas'), proteccion: 'IP56', funciones: [{ label: 'Music Sharing', value: 'Sí' }, { label: 'Modo mixto', value: 'Sí' }] }),
  featureLabels: ['Participantes', 'Autonomía declarada', 'Bluetooth'],
})

const freedConnHero = rideProduct({
  slug: 'freedconn-hero', name: 'FreedConn Hero', price: 'S/ 290.90',
  tagline: 'Más camino. Más conversaciones.',
  summary: 'Pensado para quienes disfrutan recorrer grandes distancias acompañados. FreedConn Hero combina comunicación grupal, funciones de audio y un diseño preparado para diferentes condiciones de ruta.',
  specs: rideSpecs({
    bluetooth: 'Bluetooth 5.1', alcance: 'Hasta 1500 metros', participantes: 'Hasta 6 riders',
    autonomia: specDiscrepancy('Hasta 35 horas', 'Fuente vigente: catálogo SMART RIDE aportado por el usuario. La ficha anterior registraba datos externos de 30 h de conversación / 26 h de música, sin fuente trazable ni versión confirmada. Revisar manual y versión exacta antes de validar o publicar esas cifras. Las 35 h son autonomía general, no una modalidad específica.'),
    proteccion: 'IP67', ruido: 'Avanzada', funciones: [{ label: 'Compartir música', value: 'Sí' }],
  }),
  featureLabels: ['Participantes', 'Alcance declarado', 'Autonomía declarada'],
})

const s7Pro = rideProduct({
  slug: 's7-pro', name: 'S7 PRO', price: 'S/ 90.00',
  tagline: 'Conectado a cada kilómetro.',
  summary: 'Una opción para quienes buscan comunicación durante sus recorridos, buena autonomía declarada y un diseño moderno para equipar su casco.',
  specs: rideSpecs({ bluetooth: 'Bluetooth 5.4', alcance: '700 metros', participantes: '2 riders', autonomia: spec('30 horas'), proteccion: 'IP67', funciones: [{ label: 'Emparejamiento universal', value: 'Sí' }] }),
  featureLabels: ['Participantes', 'Autonomía declarada', 'Resistencia al agua'],
})

const s7 = rideProduct({
  slug: 's7', name: 'S7', price: 'S/ 75.00', productType: 'helmet-audio',
  tagline: 'Tu música también forma parte del viaje.',
  summary: 'Disfruta de conectividad Bluetooth y funciones de audio durante tus recorridos, con un diseño pensado para integrarse con tu equipamiento.',
  specs: rideSpecs({ bluetooth: 'Bluetooth 5.4', autonomia: spec('30 horas'), proteccion: 'IP67', funciones: [{ label: 'Emparejamiento universal', value: 'Sí' }] }),
  featureLabels: ['Bluetooth', 'Autonomía declarada', 'Resistencia al agua'],
  faqs: [{ question: '¿El S7 permite conversar con otro motociclista?', answer: spec('El S7 se comercializa como audífono Bluetooth para casco. La comunicación entre motociclistas no está confirmada para este modelo.') }],
})

const q58Max = rideProduct({
  slug: 'q58-max', name: 'Q58 MAX', price: 'S/ 84.90',
  tagline: 'Tecnología que acompaña tu recorrido.',
  summary: 'Un dispositivo de diseño moderno que reúne conectividad Bluetooth y funciones de audio para acompañarte durante tus rutas.',
  specs: rideSpecs({ bluetooth: 'Bluetooth 5.4', alcance: '800 metros', autonomia: spec('25 horas'), proteccion: 'IP56' }),
  featureLabels: ['Alcance declarado', 'Autonomía declarada', 'Bluetooth'],
})

const p30Pro = rideProduct({
  slug: 'p30-pro', name: 'P30 PRO', price: 'S/ 85.00',
  tagline: 'Cada conversación, parte de la aventura.',
  summary: 'Comunicación para dos motociclistas, conectividad Bluetooth y una presentación moderna para quienes quieren disfrutar sus recorridos acompañados.',
  specs: rideSpecs({ bluetooth: 'Bluetooth 6.0', alcance: '700 metros', participantes: '2 riders', autonomia: spec('25 horas'), proteccion: 'IP67' }),
  featureLabels: ['Participantes', 'Autonomía declarada', 'Bluetooth'],
})

/**
 * EJEAS V6 Pro Plus — S/ 125.00
 * Fuente: catálogo SMART RIDE dice BT 5.3, 1200 m, 40 h, IP65.
 * Discrepancia con specs públicas del fabricante: BT 5.1, 800 m, 18 h intercom, IP67.
 * Se muestra el dato del catálogo con nota de discrepancia interna.
 */
const ejeasV6ProPlus: Product = {
  slug: 'ejeas-v6-pro-plus',
  category: 'intercomunicadores',
  name: 'EJEAS V6 Pro Plus',
  isDemo: false,
  tagline: 'Todo lo que necesitas para comunicarte en la ruta.',
  summary:
    'El EJEAS V6 Pro Plus ofrece hasta 6 usuarios vinculados con reducción de ruido DSP. Opción equilibrada entre funciones completas y precio accesible. Nota: existen discrepancias entre nuestro catálogo y las specs públicas del fabricante para este modelo.',
  theme: { bg: '#0a0b0f', surface: '#141620', scheme: 'dark' },
  visual: intercomHelmet,
  highlights: [
    { title: spec('Hasta 6 vinculados'), body: spec('Conecta varios cascos; conversación simultánea entre 2 usuarios.'), focus: { x: 50, y: 50, zoom: 1 } },
    { title: spec('Reducción DSP'), body: spec('Cancelación de ruido digital para llamadas más claras.'), focus: { x: 62, y: 48, zoom: 1.35 } },
    { title: spec('Precio accesible'), body: spec('Funciones completas a un precio competitivo.'), focus: { x: 40, y: 42, zoom: 1.3 } },
  ],
  details: [
    { caption: spec('Vista general'), visual: intercomHelmet, focus: { x: 50, y: 50, zoom: 1.4 } },
    { caption: spec('Detalle de controles'), visual: intercomHelmet, focus: { x: 68, y: 55, zoom: 1.6 } },
    { caption: spec('Instalado en casco'), visual: intercomHelmet, focus: { x: 55, y: 50, zoom: 1.3 } },
  ],
  benefits: [
    { title: spec('Completo y accesible'), body: spec('Funciones esenciales a un precio competitivo.') },
    { title: spec('DSP integrado'), body: spec('Reducción de ruido digital para llamadas y comunicación.') },
    { title: spec('Versátil'), body: spec('Hasta 6 vinculados, música y llamadas.') },
  ],
  specs: intercomSpecs({
    bluetooth: specDiscrepancy('Bluetooth 5.3', 'Catálogo: BT 5.3. Fabricante: BT 5.1. Verificar versión exacta del modelo vendido.'),
    alcance: specDiscrepancy('Hasta 1200 m', 'Catálogo: 1200 m. Fabricante: 800 m. Verificar con producto físico.'),
    participantes: spec('Hasta 6 vinculados (2 en conversación simultánea)'),
    autonomiaIntercom: specDiscrepancy('Hasta 40 h', 'Catálogo: 40 h. Fabricante: 18 h intercom, 25 h música. Verificar.'),
    autonomiaMusica: specPending('Verificar — fabricante reporta 25 h música para V6 Pro+'),
    carga: specPending('Verificar con producto físico'),
    resistencia: specDiscrepancy('IP65', 'Catálogo: IP65. Fabricante: IP67. Verificar versión exacta.'),
    peso: specPending('No disponible — verificar con manual'),
    montaje: spec('Clip / abrazadera al casco'),
    reduccionRuido: spec('Sí (DSP)'),
  }),
  gallery: [
    { visual: intercomHelmet, caption: 'Vista general' },
    { visual: intercomHelmet, focus: { x: 68, y: 55, zoom: 1.6 }, caption: 'Controles' },
    { visual: intercomHelmet, caption: 'Montado en el casco' },
  ],
  faqs: [
    { question: '¿Cuántos participantes puede conectar el V6 Pro Plus?', answer: spec('Hasta 6 dispositivos vinculados, con conversación simultánea entre 2 usuarios.') },
    { question: '¿Las especificaciones coinciden con el fabricante?', answer: spec('Existen diferencias entre nuestro catálogo y las specs públicas del fabricante. Consúltanos para confirmar la versión exacta.') },
    { question: '¿Es compatible con mi casco?', answer: spec('Compatible con la mayoría de cascos. Escríbenos si necesitas confirmar.') },
    { question: '¿Qué incluye la caja?', answer: specPending('Verificar contenido con el producto físico.') },
    { question: '¿Qué garantía tiene?', answer: specPending('Consultar condiciones de garantía.') },
    { question: '¿Cómo puedo consultar precio y disponibilidad?', answer: spec('Escríbenos desde el botón de consulta y te responderemos con la información actualizada.') },
  ],
  commerce: commercePEN('S/ 125.00'),
}

/* ---------- exportar catálogo ---------- */

export const products: Product[] = positionCatalogue([
  y13Pro,
  freedConnHero,
  s7Pro,
  s7,
  q58Max,
  p30Pro,
  v12Earphone,
  ejeasQ8,
  ejeasV6ProPlus,
  ...carplayProducts,
  ...accessoryProducts,
])

/* ---------- consultas ---------- */

export function getCategory(id: CategoryId) {
  return categories.find((c) => c.id === id)!
}

export function getCategoryBySlug(slug: string) {
  return categories.find((c) => c.slug === slug)
}

export function getProducts(category: CategoryId) {
  return products.filter((p) => p.category === category)
}

export function getProduct(categorySlug: string, slug: string) {
  const category = getCategoryBySlug(categorySlug)
  if (!category) return undefined
  return products.find((p) => p.category === category.id && p.slug === slug)
}

export function categoryPath(id: CategoryId) {
  return `/${getCategory(id).slug}`
}

export function productPath(p: Product) {
  return `${categoryPath(p.category)}/${p.slug}`
}

/** Siguiente modelo de la misma categoría (circular). */
export function nextProduct(p: Product) {
  const list = getProducts(p.category)
  return list[(list.indexOf(p) + 1) % list.length]
}

/** Categoría comercial visible; la colección de navegación conserva su URL. */
export function productCategoryLabel(product: Product) {
  return product.productType === 'helmet-audio'
    ? 'Audífonos Bluetooth para casco'
    : getCategory(product.category).name
}
