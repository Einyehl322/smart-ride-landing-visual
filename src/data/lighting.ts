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
    slug: 'exploradoras-3-ojos', name: 'Exploradoras de 3 ojos', price: 65, lumens: 8000, format: '3 ojos', modes: 3,
    tagline: 'Tres lentes. Tres formas de iluminar.', audience: 'Quienes buscan tres ojos con una inversión de entrada',
    reason: 'Por S/ 65, reúne formato de tres ojos y luz blanca, amarilla y mixta. Cuesta S/ 5 menos que la variante Compactas.',
    benefit: { title: 'Tres ojos con una inversión menor', body: 'Accede al formato de tres ojos por menos que la otra variante de tres ojos del catálogo.', evidence: 'S/ 65 frente a S/ 70 de Compactas. No se presume una diferencia de alcance real.' },
  },
  {
    slug: 'exploradoras-canon-10000', name: 'Exploradoras para tipo cañón', price: 85.9, lumens: 10000, format: 'Tipo cañón', modes: 4,
    tagline: 'Formato cañón para alternar tu iluminación.', audience: 'Quienes quieren formato cañón y modo parpadeante',
    reason: 'Reúne cuatro modos nombrados y una cifra de 10,000+ lm declarados en el formato tipo cañón.',
    benefit: { title: 'El formato tipo cañón para tu moto', body: 'Encuentra el diseño tipo cañón con cuatro modos de luz nombrados en el catálogo.', evidence: 'S/ 85.90 publicados; disponibilidad actual y contenido del kit por confirmar.' },
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

const catalogueLights: Product[] = entries.map((entry) => {
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

/* ---------- Kits de neblineros (ficha facilitada por el propietario) ---------- */

const kitSource = 'Ficha facilitada por el propietario el 19/10/2026.'
const kitConditions = 'Lúmenes declarados por el fabricante, sin medición independiente; no se publican alcance en metros, consumo en W ni clasificación IP. El rango 12–24 V no garantiza compatibilidad con toda moto: confírmanos tu modelo antes de instalar.'

type Kit = { slug: string; name: string; price: number; lumens: number; format: string; tagline: string; audience: string; reason: string }

const kits: Kit[] = [
  {
    slug: 'neblineros-led-proyector', name: 'Neblineros LED tipo proyector — Kit x2', price: 180, lumens: 28000, format: 'Tipo proyector',
    tagline: 'Seis modos de luz, blanca y amarilla, en un kit listo para instalar.',
    audience: 'Quienes quieren la mayor cifra de lúmenes de la colección',
    reason: 'Publica hasta 28,000 lm declarados, seis modos de luz y un kit con interruptor, cableado y soportes.',
  },
  {
    slug: 'neblineros-led-doble-lente', name: 'Neblineros LED doble lente — Kit x2', price: 140, lumens: 18000, format: 'Tipo proyector · doble lente',
    tagline: 'Doble lente y seis modos de luz, blanca y amarilla.',
    audience: 'Quienes buscan doble lente y seis modos en un kit completo',
    reason: 'Doble lente por unidad, seis modos de luz y hasta 18,000 lm declarados, con interruptor, cableado y soportes incluidos.',
  },
]

const kitProducts: Product[] = kits.map((kit) => {
  const photos = productPhotos(kit.slug, kit.name)
  const visual = photos[0]?.visual ?? { kind: 'render' as const, render: 'pending' as const, alt: kit.name, label: 'Fotografía pendiente' }
  const modes = 'Luz blanca, amarilla y efectos adicionales'
  const lumens = `Hasta ${kit.lumens.toLocaleString('en-US')} lm declarados`
  const content = 'Kit de 2 neblineros con interruptor, cableado y soportes de montaje'
  const benefits = [
    { title: 'Seis modos para cada tramo', body: 'Alterna entre luz blanca, amarilla y efectos adicionales según lo que necesites en la ruta.', evidence: `6 modos de iluminación: ${modes.toLowerCase()}. ${kitSource}` },
    { title: 'Todo para instalarlos', body: 'El kit trae los dos neblineros con interruptor, cableado y soportes de montaje para tu moto.', evidence: `${content}. ${kitSource}` },
    { title: 'Carcasa con disipación térmica', body: 'Su carcasa de aluminio incorpora disipación térmica y se alimenta con 12–24 V declarados.', evidence: `Carcasa de aluminio con disipación térmica; 12–24 V. ${kitSource}` },
  ]
  return {
    slug: kit.slug, category: 'exploradoras', name: kit.name, isDemo: false,
    lighting: { format: kit.format, lumens: kit.lumens, modeCount: 6, soldOut: false },
    tagline: kit.tagline,
    summary: `Kit de 2 neblineros LED tipo proyector con 6 modos de iluminación: luz blanca, amarilla y efectos adicionales. Hasta ${kit.lumens.toLocaleString('en-US')} lúmenes declarados por el fabricante, alimentación de 12–24 V y carcasa de aluminio con disipación térmica. Incluye interruptor, cableado y soportes de montaje.`,
    positioning: { audience: kit.audience, reason: kit.reason, facts: [kit.format, '6 modos', lumens], benefits, conditions: kitConditions },
    theme: { bg: '#ffffff', surface: '#f4f5f7', scheme: 'light' }, visual,
    highlights: benefits.map((b, i) => ({ title: spec(b.title, b.evidence), body: spec(b.body, b.evidence), focus: { x: 50, y: 50, zoom: i === 1 ? 1.2 : 1 } })),
    details: [], benefits: benefits.map((b) => ({ title: spec(b.title, b.evidence), body: spec(b.body, b.evidence) })),
    specs: [
      { group: 'Iluminación', items: [
        { label: 'Formato', value: spec(kit.format, kitSource) },
        { label: 'Flujo declarado', value: spec(lumens, `${kitSource} Declarado por el fabricante; sin método de medición.`) },
        { label: 'Modos anunciados', value: spec('6 modos', kitSource) },
        { label: 'Modos identificados', value: spec(modes, kitSource) },
        { label: 'Alcance medido', value: specPending('La ficha no aporta metros ni medición.') },
      ] },
      { group: 'Instalación', items: [
        { label: 'Voltaje declarado', value: spec('12–24 V', kitSource) },
        { label: 'Consumo en W', value: specPending('No figura consumo eléctrico en la ficha.') },
        { label: 'Carcasa', value: spec('Aluminio con disipación térmica', kitSource) },
        { label: 'Clasificación IP', value: specPending('No figura clasificación IP en la ficha.') },
        { label: 'Contenido y precio por unidad o par', value: spec(`${content}. Precio por kit.`, kitSource) },
      ] },
    ],
    gallery: photos.map((p) => ({ visual: p.visual, caption: 'Fotografía del producto' })),
    faqs: [
      { question: '¿El precio es por unidad o por par?', answer: spec('Es por el kit: dos neblineros con interruptor, cableado y soportes de montaje.') },
      { question: '¿Los lúmenes indican hasta dónde alumbran?', answer: spec('Son cifras declaradas por el fabricante, sin prueba de rendimiento publicada. El alcance, la distribución del haz y el consumo necesitan confirmación.') },
      { question: '¿Son compatibles con cualquier moto?', answer: spec('Se publica alimentación de 12–24 V. Indícanos tu modelo de moto para confirmar instalación, consumo y soportes.') },
      { question: '¿Qué modos tiene?', answer: spec('Seis modos de iluminación: luz blanca, amarilla y efectos adicionales.') },
      { question: '¿Está disponible?', answer: spec('Consulta la disponibilidad actual por WhatsApp.') },
    ],
    commerce: { price: spec(formatPEN(kit.price), kitSource), promotion: null, availability: null, buyUrl: null },
  }
})

/** Los kits ocupan el lugar de las dos referencias agotadas que se retiraron. */
export const lightingProducts: Product[] = [kitProducts[0], ...catalogueLights.slice(0, 5), kitProducts[1], ...catalogueLights.slice(5)]
