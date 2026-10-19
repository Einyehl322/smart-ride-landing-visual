import { feature, type FeatureKey } from './features'
import type { Product } from './types'

/** Lectura comercial derivada de las funciones publicadas, sin añadir especificaciones. */
export function carplayProfile(product: Product) {
  const keys = product.showroom?.features ?? []
  const has = (key: FeatureKey) => keys.includes(key)
  const screen = product.showroom?.screen
  const priority: FeatureKey[] = ['cameras2k', 'gpsSpeed', 'magnetic', 'remote', 'btDual', 'btSingle', 'tpms', 'tpmsOptional']
  const highlights = [
    ...(screen ? [`Pantalla ${screen}`] : []),
    ...priority.filter(has).map((key) => key === 'btSingle' ? 'Single Bluetooth' : feature(key).short),
  ]
  if (has('cameras2k') && has('gpsSpeed')) return {
    title: 'Cámaras + velocidad GPS',
    description: 'Para registrar la ruta delante y detrás y consultar la velocidad GPS.',
    highlights,
  }
  if (has('cameras2k')) return {
    title: 'Cámaras + TPMS',
    description: `Para reunir cámaras 2K y la función TPMS en una pantalla de ${screen}. Confirma el kit de sensores.`,
    highlights,
  }
  if (has('remote')) return {
    title: `${screen} + control remoto`,
    description: 'Para priorizar una pantalla de 7 pulgadas con un mando externo de control.',
    highlights,
  }
  if (has('magnetic')) return {
    title: has('btDual') ? 'Base magnética + Dual Bluetooth' : 'Base magnética + Single Bluetooth',
    description: `Para retirar fácilmente la pantalla al estacionar, en un formato de ${screen}.`,
    highlights,
  }
  return {
    title: `${screen} + ${has('btDual') ? 'Dual' : 'Single'} Bluetooth`,
    description: has('btDual')
      ? 'Para elegir el formato de 5 pulgadas con Dual Bluetooth y TPMS opcional.'
      : 'Para elegir el formato de 5 pulgadas con Single Bluetooth y TPMS opcional.',
    highlights,
  }
}

/** Contexto práctico para las diferencias del catálogo, sin presumir funciones ausentes. */
export const comparisonNotes: Record<string, string> = {
  Pantalla: 'Diagonal de la pantalla. Revisa también el espacio de montaje.',
  Cámaras: 'Tomas delantera y trasera. Resolución declarada en el catálogo.',
  Conectividad: 'Single o Dual Bluetooth. Confirma el modo de audio con tu intercomunicador.',
  'Base magnética': 'Facilita retirar la pantalla al estacionar.',
  'Control remoto multifuncional': 'Mando externo para controlar funciones de la pantalla.',
  'Sensores de llanta': 'Función TPMS. Confirma los sensores incluidos en el kit.',
  'Velocímetro con GPS': 'Lectura de velocidad mediante GPS.',
}

export const comparisonPriority = ['Pantalla', 'Cámaras', 'Conectividad', 'Base magnética', 'Control remoto multifuncional', 'Sensores de llanta', 'Velocímetro con GPS']
