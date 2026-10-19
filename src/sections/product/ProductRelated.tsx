import { useRef } from 'react'
import { ProductTile } from '../../components/product/ProductTile'
import { Icon } from '../../components/ui/Icon'
import { categoryPath, getCategory, getProducts, nextProduct } from '../../data/catalog'
import type { Product } from '../../data/types'
import { gsap, MQ, revealOnEnter, useGSAP } from '../../motion/gsap'
import { Link } from '../../router/Link'
import '../../components/product/product-tile.css'
import './product.css'

/**
 * Productos relacionados: otros modelos del mismo tipo primero. El siguiente
 * modelo queda fuera porque el cierre ya lo presenta con la transición compartida.
 */
export function ProductRelated({ product }: { product: Product }) {
  const ref = useRef<HTMLElement>(null)
  const next = nextProduct(product)
  const sameType = (p: Product) => (p.productType ?? 'intercom') === (product.productType ?? 'intercom')
  const pool = getProducts(product.category).filter((p) => p !== product && p !== next)
  const list = [...pool.filter(sameType), ...pool.filter((p) => !sameType(p))].slice(0, 3)
  const category = getCategory(product.category)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add(MQ.motion, () => revealOnEnter('.ptile'))
    },
    { scope: ref, dependencies: [product.slug], revertOnUpdate: true },
  )

  if (!list.length) return null

  return (
    <section ref={ref} className="related section section--alt" data-scheme="light" aria-labelledby="related-title">
      <div className="container">
        <header className="section-head">
          <div className="section-head__copy">
            <p className="eyebrow">Explora</p>
            <h2 id="related-title" className="t-h2">
              Productos relacionados
            </h2>
          </div>
          <Link to={categoryPath(category.id)} className="text-link">
            <span>Ver todos los {category.name.toLowerCase()}</span>
            <Icon name="arrow" />
          </Link>
        </header>
        <ul className="tile-grid">
          {list.map((p) => (
            <li key={p.slug}>
              <ProductTile product={p} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
