/**
 * Configuración central de la marca.
 *
 * Marca: SMART RIDE — Tecnología para motociclistas en Perú.
 */
export const site = {
  brand: {
    name: 'SMART RIDE',
    descriptor: 'Conectados a cada aventura',
    legalName: 'SMART RIDE',
  },

  /** Contacto comercial. */
  contact: {
    whatsappNumber: '51974470782' as string | null,
    whatsappDefaultMessage: 'Hola, vengo de SMART RIDE y quiero información sobre sus productos.',
    whatsappProductMessage: 'Hola, vengo de SMART RIDE y quisiera consultar por {producto}.',
    email: null as string | null,
    phone: null as string | null,
    address: null as string | null,
    hours: null as string | null,
  },

  social: [] as { label: string; href: string }[],

  seo: {
    siteUrl: '',
    defaultTitle: 'SMART RIDE — Tecnología y luces exploradoras para motocicleta',
    defaultDescription:
      'Intercomunicadores Bluetooth, pantallas CarPlay, luces exploradoras y sensores TPMS para motocicleta en Perú. Compara y consulta por WhatsApp.',
    indexable: false,
  },

  /**
   * Mientras sea `true`, la web muestra avisos de "contenido demostrativo".
   * Ponerlo en `false` cuando el catálogo contenga solo modelos reales con fotografías oficiales.
   */
  demoMode: true,
} as const

export function whatsappHref(message: string = site.contact.whatsappDefaultMessage): string | null {
  const number = site.contact.whatsappNumber
  if (!number) return null
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`
}

export function productWhatsappMessage(productName: string, price?: string | null) {
  const base = site.contact.whatsappProductMessage.replace('{producto}', productName)
  return price ? `${base} Lo veo a ${price}. ¿Está disponible?` : `${base} ¿Está disponible?`
}
