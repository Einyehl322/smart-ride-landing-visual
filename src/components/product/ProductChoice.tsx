import type { Product } from '../../data/types'
import './product-choice.css'

/** Ayuda a reconocer el uso que encaja con el modelo, sin declarar superioridad universal. */
export function ProductChoice({ product, compact = false }: { product: Product; compact?: boolean }) {
  const choice = product.positioning
  if (!choice) return null
  return (
    <div className={`product-choice ${compact ? 'product-choice--compact' : ''}`} data-product-choice>
      {compact ? <strong>{product.tagline}</strong> : <>
        <span className="product-choice__label">Especialmente para</span>
        <strong>{choice.audience}</strong>
      </>}
      <p>{choice.reason}</p>
      {choice.checkBeforeBuying && <small className="product-choice__check">{choice.checkBeforeBuying}</small>}
    </div>
  )
}
