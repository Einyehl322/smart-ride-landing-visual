import { useRef } from 'react'
import { Price } from '../../components/showroom/Price'
import { Icon } from '../../components/ui/Icon'
import { ProductVisual } from '../../components/visuals/ProductVisual'
import { categoryPath, productPath } from '../../data/catalog'
import { collections } from '../../data/merchandising'
import type { Product } from '../../data/types'
import { gsap, MQ, revealOnEnter, useGSAP } from '../../motion/gsap'
import { Link } from '../../router/Link'
import './home.css'

const MAX_ROWS = 4

function Thumb({ product }: { product: Product }) {
  const cutout = product.visual.kind === 'image' && product.visual.presentation !== 'photograph'
  return (
    <span className={`coll__thumb ${cutout ? 'coll__thumb--cutout' : ''}`} style={cutout ? undefined : { background: product.theme.bg }}>
      <ProductVisual visual={product.visual} sizes="72px" />
    </span>
  )
}

/**
 * Colecciones por necesidad: cada una reúne los modelos cuya función está
 * verificada en su ficha (ver `collections` en data/merchandising.ts).
 */
export function Collections() {
  const ref = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add(MQ.motion, () => {
        revealOnEnter('.coll', { y: 32, stagger: 0.07 })
      })
    },
    { scope: ref },
  )

  return (
    <section ref={ref} id="colecciones" className="collections section section--alt" data-scheme="light" aria-labelledby="collections-title" data-section="colecciones">
      <div className="container">
        <header className="section-head">
          <div className="section-head__copy">
            <p className="eyebrow">Encuentra el tuyo</p>
            <h2 id="collections-title" className="t-h2">
              Elige según cómo viajas.
            </h2>
            <p>Cada colección reúne solo los modelos cuya ficha confirma esa función.</p>
          </div>
        </header>

        <ul className="coll-grid">
          {collections.map((c) => (
            <li key={c.id} className={`coll coll--${c.size}`} data-testid="collection">
              <div className="coll__head">
                <h3 className="coll__title">{c.title}</h3>
                <p className="coll__body">{c.body}</p>
              </div>
              <ul className="coll__list">
                {c.products.slice(0, MAX_ROWS).map((p) => (
                  <li key={p.slug}>
                    <Link to={productPath(p)} className="coll__row">
                      <Thumb product={p} />
                      <span className="coll__name">{p.name}</span>
                      <Price product={p} size="md" />
                      <Icon name="arrow" />
                    </Link>
                  </li>
                ))}
              </ul>
              <div className="coll__foot">
                <p className="coll__criterion">{c.criterion}</p>
                {c.products.length > MAX_ROWS && c.products.every((p) => p.category === c.products[0].category) ? (
                  <Link to={categoryPath(c.products[0].category)} className="text-link">
                    <span>Ver los {c.products.length} modelos</span>
                    <Icon name="arrow" />
                  </Link>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
