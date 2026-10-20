import { priceValue } from './price'
import type { Product } from './types'
import { spec } from './types'

const q8Source = { title: 'Ficha oficial EJEAS Q8', url: 'https://www.ejeas.com/products/q8' }
const v6Source = { title: 'Ficha oficial EJEAS V6 Pro+', url: 'https://www.ejeas.com/products/v6-pro' }
const carplaySource = { title: 'Cómo funciona CarPlay · Apple', url: 'https://support.apple.com/en-gb/108415' }

type Benefit = NonNullable<Product['positioning']>['benefits'][number]
interface Position {
  headline: string
  summary: string
  audience: string
  reason: string
  facts: string[]
  benefits: Benefit[]
  conditions?: string
  checkBeforeBuying?: string
  sources?: { title: string; url: string }[]
}
const benefit = (title: string, body: string, evidence: string): Benefit => ({ title, body, evidence })

/**
 * Traduce funciones del catálogo en beneficios. No supone que una función
 * ausente no exista, ni equipara vinculación con conversación simultánea.
 */
function position(product: Product, catalogue: Product[]): Position | null {
  const published = (...labels: string[]) => {
    const value = product.specs.flatMap((group) => group.items).find((item) => labels.includes(item.label))?.value
    return value && value.status !== 'pending' ? value.display : 'Por confirmar'
  }
  const autonomy = published('Autonomía declarada')
  const declaredAutonomy = `${autonomy} declaradas`
  const twoRiders = 'Comunicación entre 2 motociclistas'
  const batteryConditions = 'La autonomía es la cifra general declarada en el catálogo. Cambia según el uso; confirma el modo antes de elegir por duración.'
  const audio = benefit('Tu playlist también sale de ruta', 'Escucha música y atiende llamadas desde tu teléfono con un equipo dedicado al casco.', 'Audífono Bluetooth individual para música y llamadas.')
  const pressure = benefit('Mira cómo van tus llantas', 'Consulta presión y temperatura mientras preparas o realizas tu recorrido.', 'Lecturas de presión y temperatura en tiempo real, según catálogo.')
  const alert = benefit('Una alerta para revisar a tiempo', 'La alerta automática te avisa de cambios que requieren revisar las llantas.', 'Alerta automática declarada. No sustituye la revisión de las llantas.')
  const usb = benefit('Recárgalo y vuelve a la ruta', 'La pantalla se recarga por USB para volver a consultar tus lecturas.', 'Pantalla recargable USB publicada en el catálogo.')
  const navigation = benefit('Tus mapas, en una pantalla dedicada', 'Consulta la ruta y las aplicaciones compatibles de tu teléfono desde la pantalla de la moto.', 'Apple CarPlay y Android Auto inalámbricos. Requiere teléfono compatible.')
  const removable = benefit('Estaciona y llévate la pantalla', 'Desmonta la pantalla de su base magnética para llevarla contigo al terminar el trayecto.', 'Base magnética fácil de desmontar, según catálogo.')
  const cameras = benefit('Una mirada delante y otra detrás', 'Suma cámaras delantera y trasera a tu equipo para cubrir ambos sentidos de la ruta.', 'Cámaras delantera y trasera 2K declaradas en el catálogo; confirmar resolución y contenido del kit.')
  const compact = benefit('Lleva la ruta en cinco pulgadas', 'Elige una diagonal más pequeña que las opciones de 6.25 y 7 pulgadas del catálogo.', 'Pantalla de 5 pulgadas. Confirma las medidas y el soporte para tu moto.')
  const large = benefit('Más diagonal para tus mapas', 'El formato de 7 pulgadas ofrece una pantalla mayor que las alternativas de 5 y 6.25 pulgadas.', 'Pantalla de 7 pulgadas; brillo y resolución dependen de la versión.')
  const dual = benefit('Prepara tu conexión de audio', 'Elige la variante Dual Bluetooth si esa es la conexión que necesita tu instalación.', 'Dual Bluetooth + WiFi declarado. Confirma el modo y los dispositivos compatibles.')
  const optionalTpms = benefit('Deja abierta la opción de vigilar tus llantas', 'Este modelo publica TPMS opcional para añadir la monitorización de presión.', 'Sensores de llanta opcionales. Confirma compatibilidad y kit antes de añadirlos.')

  switch (product.slug) {
    case 'y13-pro': return {
      headline: 'La misma ruta. La misma canción.',
      summary: 'Habla con tu acompañante o con otra moto y comparte música durante el recorrido. Una entrada al audio compartido con comunicación para dos.',
      audience: 'Salidas en pareja y primeras rutas acompañado',
      reason: 'Combina conversación de a dos y música compartida en uno de los modelos de entrada del catálogo.',
      facts: [twoRiders, 'Música compartida', declaredAutonomy],
      benefits: [
        benefit('Habla con quien comparte tu ruta', 'Comparte indicaciones y comentarios con tu acompañante o con otra moto compatible.', published('Participantes')),
        benefit('Escuchen la misma canción', 'La función Music Sharing permite compartir música durante la salida.', 'Music Sharing: ' + published('Music Sharing')),
        benefit('Planea tu siguiente escapada', 'Revisa su autonomía declarada para elegirlo según la duración habitual de tus salidas.', declaredAutonomy),
      ], conditions: batteryConditions,
    }
    case 'freedconn-hero': return {
      headline: 'Que todo tu grupo sea parte de la ruta.',
      summary: 'Reúne hasta seis motociclistas, comparte música y mantén la conversación del grupo. Pensado para quienes prefieren salir acompañados.',
      audience: 'Viajes y escapadas con tu grupo de motociclistas',
      reason: 'La comunicación para hasta seis riders y la música compartida son sus ventajas frente a las opciones para dos.',
      facts: ['Hasta 6 riders', 'Música compartida', published('Alcance declarado') + ' declarados'],
      benefits: [
        benefit('Más amigos dentro de la conversación', 'Elige una comunicación grupal en lugar de limitarte a una pareja de motociclistas.', published('Participantes')),
        benefit('Comparte también la música', 'Lleva una banda sonora compartida a las salidas con tu acompañante.', 'Compartir música: ' + published('Compartir música')),
        benefit('Dale espacio a tu grupo', 'Su alcance declarado permite comparar esta opción con los modelos de menor distancia publicada.', published('Alcance declarado') + '. El alcance real depende del entorno.'),
      ], conditions: 'Confirma la versión y el modo de autonomía: las hasta 35 horas del catálogo son una cifra general con fuentes discrepantes.',
    }
    case 's7-pro': return {
      headline: 'Una escapada más. Una conversación más.',
      summary: 'Comunicación para dos motociclistas, autonomía general declarada de 30 horas y protección IP67. Una combinación para quienes salen acompañados y priorizan la batería.',
      audience: 'Parejas de motociclistas que priorizan autonomía',
      reason: 'Ofrece 30 horas generales declaradas y comunicación de a dos, frente al S7 de audio individual.',
      facts: [twoRiders, declaredAutonomy, published('Resistencia al agua')],
      benefits: [
        benefit('Conversen durante la salida', 'Lleva comunicación entre tu casco y el de tu acompañante o una segunda moto compatible.', published('Participantes')),
        benefit('Elige pensando en tus rutas largas', 'Sus 30 horas generales declaradas son un dato para comparar con los modelos de 22 y 25 horas del catálogo.', declaredAutonomy),
        benefit('Protección publicada para tu equipo', 'La ficha declara IP67 para el dispositivo. Confirma las condiciones de uso de tu unidad.', 'Resistencia al agua: ' + published('Resistencia al agua')),
      ], conditions: batteryConditions,
    }
    case 's7': return {
      headline: 'Tu próxima ruta ya tiene playlist.',
      summary: 'Audio Bluetooth individual para música y llamadas, con 30 horas de autonomía general declarada. Para quien quiere acompañar sus trayectos con audio desde el teléfono.',
      audience: 'Uso individual y recorridos con música desde el teléfono',
      reason: 'Prioriza audio individual y autonomía declarada, con el precio de entrada de esta familia.',
      facts: ['Audio individual', declaredAutonomy, published('Resistencia al agua')],
      benefits: [audio,
        benefit('Elige según tu tiempo en ruta', 'Compara las 30 horas generales publicadas con el uso que darás al equipo.', declaredAutonomy),
        benefit('Equipa tu casco para uso individual', 'Una elección para escuchar y atender llamadas cuando tu prioridad es el audio del teléfono.', 'Se comercializa como audífono para casco; comunicación entre motos sin confirmar.'),
      ], conditions: batteryConditions + ' La comunicación entre motociclistas no está confirmada para el S7.',
    }
    case 'q58-max': return {
      headline: 'Dale más espacio a tu próxima ruta.',
      summary: 'Alcance declarado de 800 metros y autonomía general de 25 horas. Una opción para quien compara distancia y batería antes de equipar su casco.',
      audience: 'Quienes priorizan alcance declarado y batería',
      reason: 'Su alcance publicado es de 800 metros, frente a los 700 de Y13 Pro, P30 PRO y S7 PRO.',
      facts: [published('Alcance declarado') + ' declarados', declaredAutonomy, published('Bluetooth')],
      benefits: [
        benefit('Compara el margen de alcance', 'La cifra de 800 metros aporta una diferencia publicada frente a varios modelos de entrada.', published('Alcance declarado') + '. Depende del terreno y las condiciones.'),
        benefit('Planea la duración de tus salidas', 'Usa sus 25 horas generales declaradas como referencia para elegir según tus recorridos.', declaredAutonomy),
        benefit('Confirma la conversación que necesitas', 'Dinos si viajas con pasajero, otra moto o un grupo para confirmar que esta versión encaje.', 'El número de participantes no figura en el catálogo de este modelo.'),
      ], conditions: 'Confirma el número de participantes y la versión exacta. ' + batteryConditions,
      checkBeforeBuying: 'Confirma cuántos motociclistas conecta esta versión.',
    }
    case 'p30-pro': return {
      headline: 'Dos cascos. Mucho por conversar.',
      summary: 'Comparte el recorrido con comunicación para dos, autonomía general declarada de 25 horas e IP67. Una opción intermedia para tus escapadas acompañado.',
      audience: 'Escapadas de a dos con una inversión intermedia',
      reason: 'Suma autonomía general de 25 horas e IP67 a una propuesta de comunicación para dos.',
      facts: [twoRiders, declaredAutonomy, published('Resistencia al agua')],
      benefits: [
        benefit('Haz del camino una conversación', 'Comparte indicaciones con tu acompañante o con otra moto compatible.', published('Participantes')),
        benefit('Batería para planear la escapada', 'Sus 25 horas generales declaradas quedan entre las cifras publicadas de Y13 Pro y S7 PRO.', declaredAutonomy),
        benefit('Compara también la protección', 'La protección IP67 publicada es otro dato para elegir tu equipo, además del precio.', 'Resistencia al agua: ' + published('Resistencia al agua')),
      ], conditions: batteryConditions,
    }
    case 'y12': return {
      headline: 'Tu casco. Tu música. Tu estilo.',
      summary: 'Audio Bluetooth individual para música y llamadas, con el diseño RGB que muestra su fotografía. Para personalizar tu equipo cuando tu prioridad es el audio del teléfono.',
      audience: 'Audio individual y un diseño con estilo RGB',
      reason: 'Su propuesta es el audio individual y el diseño del dispositivo; confirma la versión antes de elegir por batería o resistencia.',
      facts: ['Audio individual', 'Música y llamadas', 'Diseño RGB'],
      benefits: [audio,
        benefit('Dale tu estilo al casco', 'El anillo y el diseño RGB de la fotografía distinguen su presentación visual.', 'Diseño visible en la imagen disponible; confirma acabados y versión.'),
        benefit('Elige la función que vas a usar', 'Una propuesta para audio desde el teléfono cuando buscas un equipo de uso individual.', 'Clasificado como audífono Bluetooth individual; no se ofrece como intercomunicador grupal.'),
      ], conditions: 'Confirma autonomía, versión Bluetooth, resistencia y contenido de caja para la unidad disponible. El RGB se presenta como diseño, sin atribuirle ventajas de seguridad.',
      checkBeforeBuying: 'Autonomía y resistencia por confirmar para la unidad disponible.',
    }
    case 'ejeas-q8': return {
      headline: 'Vuelve al grupo. Sigue compartiendo la ruta.',
      summary: 'Habla en Mesh con hasta seis motociclistas y recupera la conexión al volver al alcance del grupo. Comparte música entre dos Q8 en modo Mesh.',
      audience: 'Grupos que quieren conversación Mesh y reconexión',
      reason: 'La reconexión automática al recuperar alcance y el audio compartido en Mesh aportan una diferencia práctica al viajar en grupo.',
      facts: ['Hasta 6 en Mesh', 'Reconexión automática', 'Música compartida en Mesh'],
      benefits: [
        benefit('Vuelve a entrar en la conversación', 'Al regresar al alcance válido de tu grupo Mesh, el Q8 puede reconectarse automáticamente.', 'Reconexión automática en grupo Mesh descrita por EJEAS.'),
        benefit('Que participen hasta seis', 'Permite conversación simultánea en un grupo Mesh de hasta seis Q8.', 'Hasta 6 participantes en Mesh; alcance sujeto al entorno.'),
        benefit('Hablen y compartan la música', 'En modo Mesh, dos Q8 pueden compartir la música de un teléfono mientras se usa el intercom.', 'Música compartida y audio simultáneo en Mesh; no atribuir esta función al modo Bluetooth.'),
      ], conditions: 'Las autonomías dependen del modo: 9 h Mesh, 17 h Bluetooth y hasta 29 h de música según la ficha consultada. Revisa versión y activación de Mesh al configurar el equipo.',
      sources: [q8Source, { title: 'Soporte y versiones EJEAS', url: 'https://www.ejeas.com/pages/firmware-update' }],
    }
    case 'ejeas-v6-pro-plus': return {
      headline: 'Elige con quién hablar en cada tramo.',
      summary: 'Guarda hasta seis dispositivos vinculados y conversa con uno de tus compañeros a la vez. Reducción DSP para acompañar la comunicación de a dos.',
      audience: 'Conversaciones de a dos con varios compañeros vinculados',
      reason: 'Permite elegir interlocutor entre los dispositivos vinculados. Es distinto de una conversación grupal simultánea.',
      facts: ['Hasta 6 vinculados', '2 en conversación simultánea', 'Reducción DSP'],
      benefits: [
        benefit('Cambia de compañero de conversación', 'El equipo principal puede elegir con cuál de los otros dispositivos vinculados conversar.', 'Hasta 6 vinculados; conversación simultánea de 2, según EJEAS.'),
        benefit('Conversa con apoyo de reducción de ruido', 'La reducción DSP está orientada a reducir ruido de fondo durante la comunicación.', 'Tecnología DSP descrita en la ficha oficial; el resultado depende de montaje y entorno.'),
        benefit('Ten clara la versión antes de elegir', 'Te confirmamos las cifras de batería, alcance y protección de la unidad disponible.', 'Hay discrepancias entre el catálogo local y la ficha pública del fabricante.'),
      ], conditions: 'Confirma versión: la ficha del fabricante y el catálogo difieren en Bluetooth, alcance, autonomía e IP. No se presenta como conversación simultánea entre seis.', sources: [v6Source],
      checkBeforeBuying: 'Hasta 6 vinculados; solo 2 conversan a la vez. Confirma la versión técnica.',
    }
    case 'carplay-625-freedconn': return {
      headline: 'Tu ruta merece una mirada completa.',
      summary: 'Suma cámaras delantera y trasera y consulta la velocidad GPS en una pantalla de 6.25 pulgadas. Una propuesta para llevar navegación y equipo de ruta en un solo lugar.',
      audience: 'Quienes quieren navegación, cámaras y velocidad GPS',
      reason: 'Combina las dos cámaras y el velocímetro GPS declarados en el catálogo, frente a los modelos centrados en navegación.',
      facts: ['Pantalla 6.25"', 'Cámaras delantera y trasera', 'Velocímetro GPS'],
      benefits: [cameras, benefit('Ten la velocidad a la vista', 'El velocímetro GPS añade una lectura de velocidad a la pantalla.', 'Velocímetro con GPS declarado; no confirma mapas autónomos.'), navigation], sources: [carplaySource],
      conditions: 'Confirma la resolución real de cámaras, accesorios incluidos y compatibilidad con tu teléfono. Las fotos son referenciales.',
    }
    case 'carplay-625-magnetico': return {
      headline: 'Estaciona. Llévate tu pantalla.',
      summary: 'Consulta tus mapas en 6.25 pulgadas y retira la pantalla de su base magnética al llegar. Una diagonal intermedia para quienes valoran poder llevársela consigo.',
      audience: 'Quienes estacionan y quieren retirar la pantalla',
      reason: 'Combina una diagonal intermedia con base magnética desmontable y Single Bluetooth declarado.',
      facts: ['Pantalla 6.25"', 'Base magnética', 'Single Bluetooth'],
      benefits: [removable, benefit('Encuentra tu tamaño intermedio', 'Sus 6.25 pulgadas quedan entre las diagonales de 5 y 7 del catálogo.', 'Diagonal de 6.25 pulgadas; confirma medidas exteriores y soporte.'), navigation], sources: [carplaySource],
      conditions: 'Confirma el modo de audio de esta versión: se publica Single Bluetooth. Las imágenes son referenciales.',
    }
    case 'carplay-7': return {
      headline: 'Más mapa. Un mando para controlarlo.',
      summary: 'Lleva tus mapas a una pantalla de 7 pulgadas y controla funciones desde un mando externo. Con Dual Bluetooth publicado y TPMS opcional.',
      audience: 'Quienes priorizan una pantalla grande y mando externo',
      reason: 'El mando es su diferencia publicada frente al 7 pulgadas Waterproof; ambos declaran IP67.',
      facts: ['Pantalla 7"', 'Control remoto', 'Dual Bluetooth'],
      benefits: [large, benefit('Controla funciones desde el mando', 'El control remoto ofrece otra forma de interactuar con la pantalla.', 'Control remoto multifuncional publicado; confirma montaje y funciones.'), optionalTpms], sources: [carplaySource],
      conditions: 'Confirma la versión, funciones del mando, modo de audio y kit TPMS. Las fotos son referenciales.',
    }
    case 'carplay-7-waterproof': return {
      headline: 'Tu pantalla grande también se baja contigo.',
      summary: 'Combina 7 pulgadas de pantalla y base magnética desmontable para llevarte el equipo al estacionar. Con Dual Bluetooth y TPMS opcional publicados.',
      audience: 'Quienes quieren 7 pulgadas y una pantalla desmontable',
      reason: 'La base magnética es su diferencia publicada frente al otro 7 pulgadas. La protección declarada es IP67 en ambos.',
      facts: ['Pantalla 7"', 'Base magnética', 'Dual Bluetooth'],
      benefits: [removable, large, optionalTpms], sources: [carplaySource],
      conditions: 'Confirma base, medidas, versión de audio y accesorios del kit. «Waterproof» no indica una protección superior a los demás IP67 del catálogo.',
    }
    case 'carplay-5-camaras-2k': return {
      headline: 'Una mirada delante. Otra detrás.',
      summary: 'Reúne pantalla de 5 pulgadas, cámaras delantera y trasera y función TPMS anunciada. Para quien prioriza equipo de ruta en una diagonal compacta.',
      audience: 'Quienes buscan cámaras y TPMS en cinco pulgadas',
      reason: 'Suma cámaras y TPMS anunciado frente a los modelos básicos de 5 pulgadas; confirma qué incluye el kit.',
      facts: ['Pantalla 5"', 'Cámaras delantera y trasera', 'TPMS anunciado'],
      benefits: [cameras, benefit('Añade información de tus llantas', 'El catálogo anuncia función TPMS para consultar la presión con sensores compatibles.', 'TPMS anunciado; confirmar si los sensores están incluidos.'), compact], sources: [carplaySource],
      conditions: 'Confirma cámaras, resolución y sensores incluidos antes de elegir el kit. Las fotos son referenciales.',
    }
    case 'carplay-5-dual-bt': {
      const alternative = catalogue.find((p) => p.slug === 'carplay-5-navegacion')
      const equalPrice = alternative && priceValue(product) === priceValue(alternative)
      return {
        headline: 'Compacta para la ruta. Dual para tu conexión.',
        summary: 'Lleva los mapas de tu teléfono a una pantalla de 5 pulgadas con Dual Bluetooth publicado. Una alternativa compacta con TPMS opcional.',
        audience: 'Quienes buscan cinco pulgadas y conexión Dual Bluetooth',
        reason: equalPrice ? 'Por el mismo precio publicado que el 5 pulgadas Navegación, esta variante declara Dual Bluetooth.' : 'La conexión Dual Bluetooth publicada la diferencia de la variante Single de cinco pulgadas.',
        facts: ['Pantalla 5"', 'Dual Bluetooth', 'TPMS opcional'],
        benefits: [compact, dual, navigation], sources: [carplaySource],
        conditions: 'Confirma cómo conecta esta versión con tu teléfono e intercomunicador. Dual Bluetooth por sí solo no confirma dos cascos con audio simultáneo.',
      }
    }
    case 'carplay-5-navegacion': return {
      headline: 'Tus mapas a la vista. Tu teléfono contigo.',
      summary: 'Lleva las aplicaciones de navegación de tu teléfono a una pantalla de 5 pulgadas con Single Bluetooth publicado. Para una instalación compacta centrada en navegación.',
      audience: 'Quienes buscan navegación en una pantalla compacta',
      reason: 'Prioriza una diagonal de cinco pulgadas y conexión Single Bluetooth. Confirma qué opción de audio encaja con tu casco.',
      facts: ['Pantalla 5"', 'Single Bluetooth', 'TPMS opcional'],
      benefits: [navigation, compact, optionalTpms], sources: [carplaySource],
      conditions: 'Confirma compatibilidad de teléfono, modo de audio y sensores opcionales. El nombre «Navegación» no implica GPS autónomo.',
    }
    case 'tpms-panel-solar': {
      const peers = catalogue.filter((p) => p.category === 'accesorios').map(priceValue).filter((n): n is number => n !== null)
      const lowest = peers.length > 0 && priceValue(product) === Math.min(...peers)
      return {
        headline: lowest ? 'Vigila tus llantas con una inversión menor.' : 'Tus llantas también tienen algo que decir.',
        summary: 'Consulta presión y temperatura y recibe alertas automáticas, con panel solar, pantalla recargable por USB y 12 horas de duración declaradas.',
        audience: 'Quienes quieren empezar a vigilar presión y temperatura',
        reason: lowest ? 'Es el TPMS de menor precio del catálogo actual y suma panel solar y una duración de 12 horas publicada.' : 'Reúne presión, temperatura y alertas automáticas, con panel solar y recarga USB.',
        facts: ['Presión y temperatura', 'Panel solar', '12 h de duración'], benefits: [pressure, alert, usb],
        conditions: 'Datos facilitados por el propietario el 19/10/2026. Confirma válvulas compatibles, medidas y piezas del kit; no se atribuye una precisión distinta a la del otro TPMS.',
      }
    }
    case 'tpms-kit-solar': return {
      headline: 'Lleva el pulso de tus llantas a la vista.',
      summary: 'Presión, temperatura y alertas automáticas en una pantalla con recarga USB publicada. Para sumar información de tus llantas al equipo de ruta.',
      audience: 'Quienes quieren consultar sus llantas desde una pantalla',
      reason: 'Reúne lectura de presión, temperatura y alertas. Confirma qué cambia en el kit frente a los sensores con panel solar antes de elegir.',
      facts: ['Presión y temperatura', 'Alerta automática', 'Recarga USB publicada'], benefits: [pressure, alert, usb],
      conditions: 'La carga solar no está confirmada para la unidad disponible. Comparte las funciones de monitorización con los sensores con panel solar; confirma qué justifica la diferencia de precio y qué incluye cada kit.',
      checkBeforeBuying: 'Carga solar por confirmar; recarga USB publicada.',
    }
    default: return null
  }
}

export function positionCatalogue(catalogue: Product[]): Product[] {
  return catalogue.map((product) => {
    const copy = position(product, catalogue)
    if (!copy) return product
    return {
      ...product,
      tagline: copy.headline,
      summary: copy.summary,
      positioning: { audience: copy.audience, reason: copy.reason, facts: copy.facts, benefits: copy.benefits, conditions: copy.conditions, checkBeforeBuying: copy.checkBeforeBuying, sources: copy.sources },
      specs: product.slug === 'ejeas-q8' ? product.specs.map((group) => group.group === 'Comunicación' ? {
        ...group, items: [...group.items,
          { label: 'Reconexión Mesh', value: spec('Automática al recuperar alcance', q8Source.url) },
          { label: 'Música compartida en Mesh', value: spec('Entre 2 Q8; compatible con intercom en Mesh', q8Source.url) },
        ],
      } : group) : product.specs,
      benefits: copy.benefits.map((item) => ({ title: spec(item.title, item.evidence), body: spec(item.body, item.evidence) })),
      highlights: copy.benefits.map((item, index) => ({
        title: spec(item.title, item.evidence), body: spec(item.body, item.evidence),
        focus: product.highlights[index]?.focus ?? { x: 50, y: 50, zoom: 1 },
      })),
    }
  })
}

