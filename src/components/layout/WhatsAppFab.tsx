import { useEffect, useState } from 'react'
import { productWhatsappMessage, whatsappHref } from '../../config/site'
import { specDisplay } from '../ui/Placeholders'
import type { Product } from '../../data/types'
import { Link } from '../../router/Link'
import { Icon } from '../ui/Icon'

/**
 * Botón contextual de WhatsApp. Aparece tras el primer scroll y, en una ficha,
 * prepara el mensaje con el nombre del modelo.
 * Configuración: `site.contact.whatsappNumber` en src/config/site.ts.
 */
export function WhatsAppFab({ product }: { product?: Product }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > window.innerHeight * 0.4)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const price = product ? specDisplay(product.commerce.price) : null
  const href = whatsappHref(product ? productWhatsappMessage(product.name, price) : undefined)
  const label = product ? `Consultar ${product.name}` : 'Consultar'
  const className = `wa-fab ${visible ? 'is-visible' : ''}`
  const content = (
    <>
      <Icon name="whatsapp" className="wa-fab__icon" />
      <span className="wa-fab__label">{label}</span>
    </>
  )

  return href ? (
    <a className={className} data-context={product ? 'product' : undefined} href={href} target="_blank" rel="noopener" aria-label={`${label} por WhatsApp`}>
      {content}
    </a>
  ) : (
    <Link className={className} data-context={product ? 'product' : undefined} to="#contacto" aria-label={`${label} (WhatsApp pendiente de configurar)`}>
      {content}
    </Link>
  )
}
