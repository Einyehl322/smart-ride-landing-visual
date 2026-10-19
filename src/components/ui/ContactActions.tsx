import { productWhatsappMessage, site, whatsappHref } from '../../config/site'
import { specDisplay } from './Placeholders'
import type { Product } from '../../data/types'
import { Link } from '../../router/Link'
import { Icon } from './Icon'

interface Props {
  product?: Product
  size?: 'md' | 'sm'
  /** Muestra también la acción de compra si el producto tiene tienda real. */
  withBuy?: boolean
  className?: string
}

/**
 * Acción comercial principal: consulta por WhatsApp (contextual al producto).
 * Si WhatsApp aún no está configurado, lleva a la sección de contacto en lugar
 * de abrir un enlace roto. Nunca simula una compra.
 */
export function ContactActions({ product, size = 'md', withBuy, className = '' }: Props) {
  const price = product ? specDisplay(product.commerce.price) : null
  const message = product ? productWhatsappMessage(product.name, price) : site.contact.whatsappDefaultMessage
  const href = whatsappHref(message)
  const sm = size === 'sm' ? 'btn--sm' : ''
  const label = product ? 'Consultar este modelo' : 'Consultar por WhatsApp'
  const buyUrl = product ? specDisplay(product.commerce.buyUrl) : null

  return (
    <div className={`actions ${className}`}>
      {withBuy && buyUrl ? (
        <a className={`btn btn--accent ${sm}`} href={buyUrl} target="_blank" rel="noopener">
          Comprar
          <Icon name="external" />
        </a>
      ) : null}
      {href ? (
        <a className={`btn btn--primary ${sm}`} href={href} target="_blank" rel="noopener">
          <Icon name="whatsapp" />
          {label}
        </a>
      ) : (
        <Link className={`btn btn--primary ${sm}`} to="#contacto" title="WhatsApp pendiente de configurar">
          <Icon name="whatsapp" />
          {label}
        </Link>
      )}
    </div>
  )
}
