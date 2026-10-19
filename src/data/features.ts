/**
 * Características publicadas en el catálogo SMART RIDE.
 *
 * `label` es el texto literal del catálogo. `row` y `value` ordenan esa misma
 * información en el comparador (p. ej. "Conectividad: Dual Bluetooth + WiFi").
 * `tag` marca lo que diferencia a un modelo y se muestra como etiqueta.
 * No añadir aquí datos que no figuren en el catálogo.
 */
export type FeatureIconName =
  | 'carplay'
  | 'android'
  | 'magnet'
  | 'drop'
  | 'bluetooth'
  | 'tire'
  | 'camera'
  | 'remote'
  | 'gauge'
  | 'usb'
  | 'battery'
  | 'alert'
  | 'pulse'

export interface Feature {
  label: string
  /** Versión corta para etiquetas y tarjetas. */
  short: string
  icon: FeatureIconName
  /** Fila del comparador. */
  row: string
  /** Valor en el comparador; sin valor se muestra una marca de "incluido". */
  value?: string
  tag?: boolean
}

export const FEATURES = {
  carplay: { label: 'Apple CarPlay inalámbrico', short: 'CarPlay inalámbrico', icon: 'carplay', row: 'Apple CarPlay inalámbrico' },
  androidAuto: { label: 'Android Auto inalámbrico', short: 'Android Auto inalámbrico', icon: 'android', row: 'Android Auto inalámbrico' },
  magnetic: { label: 'Base magnética fácil de desmontar', short: 'Base magnética', icon: 'magnet', row: 'Base magnética', tag: true },
  ip67: { label: 'Resistente al agua IP67', short: 'IP67', icon: 'drop', row: 'Resistencia al agua', value: 'IP67' },
  btSingle: { label: 'Single Bluetooth + WiFi', short: 'Bluetooth + WiFi', icon: 'bluetooth', row: 'Conectividad', value: 'Single Bluetooth + WiFi' },
  btDual: { label: 'Dual Bluetooth + WiFi', short: 'Dual Bluetooth', icon: 'bluetooth', row: 'Conectividad', value: 'Dual Bluetooth + WiFi', tag: true },
  tpmsOptional: { label: 'Sensores de llanta (opcional)', short: 'Sensores de llanta opcionales', icon: 'tire', row: 'Sensores de llanta', value: 'Opcional' },
  tpms: { label: 'Sensores de llanta (TPMS)', short: 'Sensores TPMS', icon: 'tire', row: 'Sensores de llanta', value: 'TPMS', tag: true },
  cameras2k: { label: 'Cámaras delantera y trasera 2K', short: 'Cámaras 2K', icon: 'camera', row: 'Cámaras', value: 'Delantera y trasera 2K', tag: true },
  remote: { label: 'Control remoto multifuncional', short: 'Control remoto', icon: 'remote', row: 'Control remoto multifuncional', tag: true },
  gpsSpeed: { label: 'Velocímetro con GPS', short: 'Velocímetro GPS', icon: 'gauge', row: 'Velocímetro con GPS', tag: true },

  /* Sensores TPMS */
  liveReadings: { label: 'Presión y temperatura en tiempo real', short: 'Presión y temperatura', icon: 'pulse', row: 'Presión y temperatura en tiempo real' },
  usbDisplay: { label: 'Pantalla recargable USB', short: 'Recarga USB', icon: 'usb', row: 'Pantalla recargable USB' },
  sensorBattery: { label: 'Sensores con batería hasta 2 años', short: 'Batería hasta 2 años', icon: 'battery', row: 'Batería de sensores', value: 'Hasta 2 años' },
  waterproof: { label: 'Impermeable', short: 'Impermeable', icon: 'drop', row: 'Impermeable' },
  autoAlert: { label: 'Alerta automática', short: 'Alerta automática', icon: 'alert', row: 'Alerta automática' },
} as const satisfies Record<string, Feature>

export type FeatureKey = keyof typeof FEATURES

export function feature(key: FeatureKey): Feature {
  return FEATURES[key]
}
