import { productPhotos } from './productAssets'
import { formatPEN } from './price'
import type { Product } from './types'
import { spec, specPending } from './types'

export const lightingCatalogueUrl = `${import.meta.env.BASE_URL}catalogo-exploradoras.pdf`
const source = 'SMART_RIDE_CATALOGO_PRO.pdf, página 5, facilitado por el propietario el 19/10/2026.'
const conditions = 'Cifras y fotos del catálogo SMART RIDE. Los lúmenes son declarados: no hay medición independiente, alcance en metros, consumo en W ni clasificación IP publicados. Confirma medidas, soporte, cableado, contenido y precio por unidad o par. El rango 12–24 V no garantiza compatibilidad con toda moto.'
type Entry = {
  slug: string; name: string; price: number; lumens: number; format: string; modes: 3 | 4
  fourthModePending?: boolean; soldOut?: boolean
  tagline: string; audience: string; reason: string; benefit: { title: string; body: string; evidence: string }
}

const entries: Entry[] = [
  {
    slug: 'exploradoras-tipo-canon', name: 'Exploradoras tipo cañón', price: 89.9, lumens: 12000, format: 'Tipo cañón', modes: 4, soldOut: true,
    tagline: 'El formato cañón, con cuatro modos de luz.', audience: 'Quienes prefieren el diseño tipo cañón y cuatro modos',
    reason: 'Publica blanco, amarillo, mixto y parpadeante. Figura agotado en el PDF; consulta reposición antes de elegirlo.',
    benefit: { title: 'Elige el estilo de tu montaje', body: 'El formato tipo cañón aporta una alternativa a las barras de varios ojos del catálogo.', evidence: 'Diseño tipo cañón de la fotografía del catálogo; medidas por confirmar.' },
  },
  {
    slug: 'exploradoras-3-ojos', name: 'Exploradoras de 3 ojos', price: 65, lumens: 8000, format: '3 ojos', modes: 3,
    tagline: 'Tres lentes. Tres formas de iluminar.', audience: 'Quienes buscan tres ojos con una inversión de entrada',
    reason: 'Por S/ 65, reúne formato de tres ojos y luz blanca, amarilla y mixta. Cuesta S/ 5 menos que la variante Compactas.',
    benefit: { title: 'Tres ojos con una inversión menor', body: 'Accede al formato de tres ojos por menos que la otra variante de tres ojos del catálogo.', evidence: 'S/ 65 frente a S/ 70 de Compactas. No se presume una diferencia de alcance real.' },
  },
  {
    slug: 'exploradoras-canon-10000', name: 'Exploradoras para tipo cañón', price: 85.9, lumens: 10000, format: 'Tipo cañón', modes: 4,
    tagline: 'Formato cañón para alternar tu iluminación.', audience: 'Quienes quieren formato cañón y modo parpadeante',
    reason: 'Reúne cuatro modos nombrados y una cifra de 10,000+ lm declarados. No lleva la marca de agotado de las otras dos referencias tipo cañón.',
    benefit: { title: 'Una alternativa tipo cañón para consultar', body: 'Encuentra el diseño tipo cañón en una referencia que no figura agotada en el PDF.', evidence: 'S/ 85.90 publicados; disponibilidad actual y contenido del kit por confirmar.' },
  },
  {
    slug: 'exploradoras-5-ojos', name: 'Exploradoras de 5 ojos', price: 85, lumens: 14000, format: '5 ojos', modes: 4, fourthModePending: true,
    tagline: 'Cinco lentes en un formato alargado.', audience: 'Quienes prefieren el diseño de cinco ojos',
    reason: 'Por S/ 10 más que el modelo de cuatro ojos, ofrece cinco lentes y 14,000+ lm declarados. La cifra no demuestra más alcance.',
    benefit: { title: 'El formato de cinco ojos para tu moto', body: 'Elige la disposición de cinco lentes que muestra el catálogo si encaja con el espacio de tu montaje.', evidence: 'Cinco ojos; S/ 85 publicados. Medidas y patrón de haz por confirmar.' },
  },
  {
    slug: 'exploradoras-4-ojos', name: 'Exploradoras de 4 ojos', price: 75, lumens: 11000, format: '4 ojos', modes: 4, fourthModePending: true,
    tagline: 'Cuatro lentes, un punto intermedio.', audience: 'Quienes comparan barras de tres, cuatro y cinco ojos',
    reason: 'Se sitúa entre los tres ojos de S/ 65 y los cinco ojos de S/ 85, con 11,000+ lm declarados.',
    benefit: { title: 'Ajusta formato e inversión', body: 'El formato de cuatro ojos queda a S/ 10 de cada una de las alternativas de tres y cinco ojos.', evidence: 'S/ 75 frente a S/ 65 y S/ 85. Más lentes no garantiza un haz más amplio.' },
  },
  {
    slug: 'exploradoras-3-ojos-compactas', name: 'Exploradoras de 3 ojos — Compactas', price: 70, lumens: 9000, format: '3 ojos · compactas', modes: 3,
    tagline: 'Tres ojos con una propuesta compacta.', audience: 'Quienes buscan la variante Compactas de tres ojos',
    reason: 'Por S/ 5 más que los tres ojos básicos, publica 9,000+ lm y la denominación Compactas. Confirma sus medidas antes de elegir por tamaño.',
    benefit: { title: 'Busca el encaje para tu montaje', body: 'Compara la variante denominada Compactas con tu espacio disponible antes de equipar la moto.', evidence: 'Tres ojos y denominación Compactas en el PDF; no se publican dimensiones.' },
  },
  {
    slug: 'luces-exploradoras-12000', name: 'Luces exploradoras', price: 85.9, lumens: 12000, format: 'Tipo cañón · foto de catálogo', modes: 4, soldOut: true,
    tagline: 'Cuatro modos para cambiar de luz.', audience: 'Quienes consultan esta referencia de cuatro modos',
    reason: 'Comparte fotografía, cifra de lúmenes y modos con «Exploradoras tipo cañón», a otro precio publicado. Figura agotado; confirma si cambia el kit.',
    benefit: { title: 'Identifica la referencia antes de elegir', body: 'Conservamos su precio y nombre propios para que puedas consultar por el equipo exacto del PDF.', evidence: 'S/ 85.90. Misma imagen y funciones publicadas que Tipo cañón de S/ 89.90; diferencia de kit sin confirmar.' },
  },
  {
    slug: 'exploradoras-2-ojos', name: 'Exploradoras de 2 ojos ultra potentes', price: 125, lumens: 15000, format: '2 ojos', modes: 3,
    tagline: 'Dos ojos. Una propuesta de doble óptica.', audience: 'Quienes priorizan el formato de dos ojos',
    reason: 'Tiene la mayor cifra de lúmenes declarados de esta colección: 15,000+. El rendimiento y el alcance reales necesitan confirmación.',
    benefit: { title: 'Compara una disposición diferente', body: 'El formato de dos ojos ofrece otra disposición visual frente a las barras de tres, cuatro y cinco ojos.', evidence: 'Dos ojos en el nombre y la fotografía; S/ 125. Sin prueba que justifique superioridad de alcance.' },
  },
  {
    slug: 'exploradoras-para-moto', name: 'Exploradoras para moto', price: 60, lumens: 7500, format: 'Óptica circular', modes: 3,
    tagline: 'Empieza a equipar tu moto con luz auxiliar.', audience: 'Quienes quieren empezar con el menor precio de la colección',
    reason: 'Es la referencia de menor precio del PDF: S/ 60, con modos blanco, amarillo y mixto y 7,500+ lm declarados.',
    benefit: { title: 'Empieza con una inversión menor', body: 'Elige la opción de entrada del catálogo de luces y reserva presupuesto para el montaje que necesite tu moto.', evidence: 'S/ 60: menor precio entre las nueve referencias de la página 5.' },
  },
]

export const lightingProducts: Product[] = entries.map((entry) => {
  const photos = productPhotos(entry.slug, entry.name)
  const visual = photos[0]?.visual ?? { kind: 'render' as const, render: 'pending' as const, alt: entry.name, label: 'Fotografía pendiente' }
  const modes = entry.modes === 3 ? 'Blanco, amarillo y mixto' : entry.fourthModePending ? 'Blanco, amarillo y mixto; cuarto modo por confirmar' : 'Blanco, amarillo, mixto y parpadeante'
  const lumens = `${entry.lumens.toLocaleString('en-US')}+ lm declarados`
  const benefits = [entry.benefit, {
    title: 'Alterna entre blanco, amarillo y mixto',
    body: 'Elige entre las tres opciones de luz nombradas para este modelo en el catálogo.',
    evidence: `${entry.modes} modos anunciados: ${modes}.`,
  }, {
    title: 'Prepara la instalación para tu moto',
    body: 'El rango de alimentación publicado te permite consultar si el equipo encaja con la instalación eléctrica de tu moto.',
    evidence: '12–24 V declarados. Confirma consumo, soportes y cableado antes de instalar.',
  }]
  const check = [entry.soldOut ? 'Agotado en catálogo. Consulta reposición.' : '', entry.fourthModePending ? 'Se anuncian 4 modos, pero solo se nombran 3. Confirma el cuarto.' : ''].filter(Boolean).join(' ')
  return {
    slug: entry.slug, category: 'exploradoras', name: entry.name, isDemo: false,
    lighting: { format: entry.format, lumens: entry.lumens, modeCount: entry.modes, fourthModePending: entry.fourthModePending, soldOut: Boolean(entry.soldOut) },
    tagline: entry.tagline,
    summary: `${entry.format}, ${lumens} y alimentación de 12–24 V según el catálogo SMART RIDE. ${modes}.`,
    positioning: { audience: entry.audience, reason: entry.reason, facts: [entry.format, `${entry.modes} modos${entry.fourthModePending ? ' anunciados' : ''}`, lumens], benefits, conditions, checkBeforeBuying: check || undefined, sources: [{ title: 'Catálogo SMART RIDE · Luces exploradoras (PDF)', url: lightingCatalogueUrl }] },
    theme: { bg: '#ffffff', surface: '#f4f5f7', scheme: 'light' }, visual,
    highlights: benefits.map((b, i) => ({ title: spec(b.title, b.evidence), body: spec(b.body, b.evidence), focus: { x: i === 1 ? 55 : 50, y: 50, zoom: i === 1 ? 1.2 : 1 } })),
    details: [], benefits: benefits.map((b) => ({ title: spec(b.title, b.evidence), body: spec(b.body, b.evidence) })),
    specs: [
      { group: 'Iluminación', items: [
        { label: 'Formato', value: spec(entry.format, source) },
        { label: 'Flujo declarado', value: spec(lumens, `${source} No se especifica por unidad o par ni método de medición.`) },
        { label: 'Modos anunciados', value: spec(`${entry.modes} modos`, source) },
        { label: 'Modos identificados', value: spec(modes, source) },
        { label: 'Alcance medido', value: specPending('El PDF solo dice «alcance largo»; no aporta metros ni medición.') },
      ] },
      { group: 'Instalación', items: [
        { label: 'Voltaje declarado', value: spec('12–24 V', source) },
        { label: 'Consumo en W', value: specPending('No figura consumo eléctrico en el catálogo.') },
        { label: 'Medidas y soporte', value: specPending('El PDF no detalla medidas ni soporte para una moto concreta.') },
        { label: 'Clasificación IP', value: specPending('No figura clasificación IP de las luces en la página 5.') },
        { label: 'Contenido y precio por unidad o par', value: specPending('Las fotos muestran conjuntos, pero el texto no especifica piezas ni unidad de venta.') },
      ] },
    ],
    gallery: photos.map((p) => ({ visual: p.visual, caption: 'Imagen incluida en el catálogo SMART RIDE' })),
    faqs: [
      { question: '¿El precio es por unidad o por par?', answer: spec('El PDF no lo especifica. Confírmanos esta referencia por WhatsApp para validar cantidad, soportes, interruptor y cableado incluidos.') },
      { question: '¿Los lúmenes indican hasta dónde alumbran?', answer: spec('Son cifras declaradas en el catálogo, sin prueba de rendimiento publicada. El alcance, la distribución del haz y el consumo necesitan confirmación para esta versión.') },
      { question: '¿Son compatibles con cualquier moto?', answer: spec('Se publica alimentación de 12–24 V. Para confirmar instalación, indícanos tu modelo de moto: revisaremos consumo, soportes y cableado necesarios.') },
      { question: '¿Qué modos tiene este modelo?', answer: spec(modes + (entry.fourthModePending ? '. El PDF anuncia cuatro modos, pero enumera tres; confirma el cuarto antes de elegir.' : '.')) },
      { question: '¿Está disponible?', answer: spec(entry.soldOut ? 'Esta referencia figura agotada en el catálogo. Escríbenos para consultar reposición o una alternativa.' : 'Consulta la disponibilidad actual de esta referencia por WhatsApp.') },
    ],
    commerce: { price: spec(formatPEN(entry.price), source), promotion: null, availability: entry.soldOut ? spec('Agotado en catálogo', source) : null, buyUrl: null },
  }
})
