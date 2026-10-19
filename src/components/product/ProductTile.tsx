import type { MouseEvent } from 'react'
import { productWhatsappMessage, whatsappHref } from '../../config/site'
import { productPath } from '../../data/catalog'
import { keyFacts } from '../../data/merchandising'
import type { Product } from '../../data/types'
import { playProductExit } from '../../motion/productTransition'
import { Link } from '../../router/Link'
import { InterestToggleButton } from '../interest/InterestToggleButton'
import { Price } from '../showroom/Price'
import { ShowroomObject } from '../showroom/ShowroomObject'
import { Icon } from '../ui/Icon'
import { specDisplay } from '../ui/Placeholders'
import { ProductStage } from '../visuals/ProductStage'
import './product-tile.css'

interface Props {
  product: Product
  /**
   * Nombres de View Transition: la imagen viaja hasta la ficha. Solo una
   * instancia por producto y página puede llevarlos.
   */
  shared?: boolean
  /** Casilla "Comparar" (showroom). */
  compare?: { checked: boolean; disabled: boolean; onChange: (checked: boolean) => void }
  sizes?: string
  /** Nivel del nombre dentro del documento. */
  level?: 'h2' | 'h3'
}

/** Tipo comercial visible en la tarjeta. */
function typeLabel(product: Product) {
  if (product.category === 'carplay') return 'Pantalla CarPlay'
  if (product.category === 'accesorios') return 'Sensor TPMS'
  return product.productType === 'helmet-audio' ? 'Audífono para casco' : 'Intercomunicador'
}

/**
 * Tarjeta de catálogo: imagen 4:3 consistente, nombre, datos clave del
 * catálogo, precio en soles y una disponibilidad honesta (se consulta).
 * "Explorar" lleva a la ficha con la transición compartida.
 */
export function ProductTile({ product, shared, compare, sizes = '(min-width: 1100px) 30vw, (min-width: 640px) 45vw, 92vw', level = 'h3' }: Props) {
  const href = productPath(product)
  const price = specDisplay(product.commerce.price)
  const availability = specDisplay(product.commerce.availability)
  const wa = whatsappHref(productWhatsappMessage(product.name, price))
  const facts = keyFacts(product)
  const Heading = level

  const exit = async (e: MouseEvent<HTMLAnchorElement>) => {
    const card = e.currentTarget.closest<HTMLElement>('[data-product-card]')
    if (card) await playProductExit(card)
  }

  return (
    <article
      className={`ptile ${product.showroom ? 'ptile--object' : 'ptile--photo'}`}
      data-product-card
      data-tilt-zone
      data-testid="product-tile"
      data-slug={product.slug}
      aria-labelledby={`ptile-${product.slug}`}
    >
      <div className="ptile__media">
        <Link to={href} beforeNavigate={exit} className="ptile__media-link" tabIndex={-1} aria-hidden="true">
          {product.showroom ? (
            <span className="ptile__object" data-card-stage>
              <ShowroomObject product={product} size="card" shared={shared} scaleBySize sizes={sizes} />
            </span>
          ) : (
            <ProductStage product={product} variant="card" shared={shared} sizes={sizes} />
          )}
        </Link>
        <div className="ptile__flags">
          {product.badge ? <span className="badge">{product.badge}</span> : null}
          {product.showroom?.screen ? <span className="ptile__chip">{product.showroom.screen}</span> : null}
        </div>
        {product.showroom?.reference ? <span className="ptile__ref">Imagen referencial</span> : null}
        <InterestToggleButton slug={product.slug} compact className="ptile__interest" />
      </div>

      <div className="ptile__body" data-card-text>
        <p className="ptile__type">{typeLabel(product)}</p>
        <Heading id={`ptile-${product.slug}`} className="ptile__name">
          <Link to={href} beforeNavigate={exit}>
            {product.name}
          </Link>
        </Heading>
        {product.positioning && <p className="ptile__promise">{product.tagline}</p>}
        {product.positioning?.checkBeforeBuying && <p className="ptile__verification">{product.positioning.checkBeforeBuying}</p>}
        {facts.length ? (
          <ul className="ptile__facts" aria-label="Datos clave">
            {facts.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
        ) : null}
      </div>

      <div className="ptile__foot" data-card-text>
        <div className="ptile__commerce">
          <Price product={product} size="lg" />
          {availability ? (
            <span className="ptile__avail">{availability}</span>
          ) : wa ? (
            <a className="ptile__avail" href={wa} target="_blank" rel="noopener" aria-label={`Consultar disponibilidad de ${product.name} por WhatsApp`}>
              Consultar disponibilidad
            </a>
          ) : (
            <span className="ptile__avail">Disponibilidad a consultar</span>
          )}
        </div>
        <div className="ptile__actions">
          {compare ? (
            <label className={`ptile__compare ${compare.disabled ? 'is-disabled' : ''}`} title={compare.disabled ? 'Puedes comparar hasta 3 modelos' : undefined}>
              <input type="checkbox" checked={compare.checked} disabled={compare.disabled} onChange={(e) => compare.onChange(e.target.checked)} />
              <span>Comparar</span>
            </label>
          ) : null}
          <Link to={href} beforeNavigate={exit} className="btn btn--ghost btn--sm ptile__explore" aria-label={`Explorar ${product.name}`}>
            Explorar
            <Icon name="arrow" />
          </Link>
        </div>
      </div>
    </article>
  )
}
