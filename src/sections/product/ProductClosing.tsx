import { useRef, type MouseEvent } from 'react'
import { ContactActions } from '../../components/ui/ContactActions'
import { Icon } from '../../components/ui/Icon'
import { ProductStage } from '../../components/visuals/ProductStage'
import { nextProduct, productPath } from '../../data/catalog'
import type { Product } from '../../data/types'
import { gsap, MQ, useGSAP } from '../../motion/gsap'
import { playProductExit } from '../../motion/productTransition'
import { Link } from '../../router/Link'
import './product.css'

/** Cierre comercial + salto al siguiente modelo (con transición compartida). */
export function ProductClosing({ product }: { product: Product }) {
  const ref = useRef<HTMLElement>(null)
  const next = nextProduct(product)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add(MQ.motion, () => {
        gsap.from('.pclose__title .line-mask > span', {
          yPercent: 110,
          stagger: 0.1,
          duration: 1.2,
          ease: 'expo.out',
          scrollTrigger: { trigger: ref.current, start: 'top 70%' },
        })
      })
    },
    { scope: ref, dependencies: [product.slug], revertOnUpdate: true },
  )

  const exit = async (e: MouseEvent<HTMLAnchorElement>) => {
    const card = e.currentTarget.closest<HTMLElement>('[data-product-card]')
    if (card) await playProductExit(card)
  }

  return (
    <section ref={ref} className="pclose section" data-scheme="dark" aria-labelledby="pclose-title">
      <div className="container">
        <h2 id="pclose-title" className="pclose__title t-display">
          <span className="line-mask">
            <span>¿Te interesa</span>
          </span>
          <span className="line-mask">
            <span>{product.name}?</span>
          </span>
        </h2>
        <p className="t-lead pclose__lead">
          Escríbenos y te confirmamos precio, disponibilidad y compatibilidad con tu equipo.
        </p>
        <ContactActions product={product} withBuy className="pclose__actions" />

        {next && next !== product ? (
          <article className="pnext" data-product-card aria-label={`Siguiente modelo: ${next.name}`}>
            <Link to={productPath(next)} beforeNavigate={exit} className="pnext__link">
              <ProductStage product={next} variant="card" shared sizes="(min-width: 900px) 40vw, 92vw" />
              <span className="pnext__copy" data-card-text>
                <span className="eyebrow">Siguiente modelo</span>
                <span className="pnext__name">{next.name}</span>
                <span className="text-link">
                  <span>Explorar</span>
                  <Icon name="arrow" />
                </span>
              </span>
            </Link>
          </article>
        ) : null}
      </div>
    </section>
  )
}
