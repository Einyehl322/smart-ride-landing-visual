import { useRef } from 'react'
import { InterestToggleButton } from '../../components/interest/InterestToggleButton'
import { Price } from '../../components/showroom/Price'
import { ContactActions } from '../../components/ui/ContactActions'
import { Icon } from '../../components/ui/Icon'
import { DemoBadge, specDisplay } from '../../components/ui/Placeholders'
import { View360Button } from '../../components/viewer360/View360Button'
import { ProductStage } from '../../components/visuals/ProductStage'
import { productWhatsappMessage, whatsappHref } from '../../config/site'
import { categoryPath, getCategory, productCategoryLabel } from '../../data/catalog'
import { keyFacts } from '../../data/merchandising'
import type { Product } from '../../data/types'
import { EASE, gsap, MQ, MQ_CONDITIONS, useGSAP } from '../../motion/gsap'
import { Link } from '../../router/Link'
import { useRouter } from '../../router/context'
import './product.css'

/**
 * Hero de la ficha: fotografía grande a la izquierda e información comercial
 * a la derecha. Es el destino de la transición compartida:
 * - Si llegamos con View Transition, el producto ya viajó hasta aquí y solo
 *   entran nombre, descripción y acciones.
 * - En enlaces directos o sin soporte, el hero hace su propia entrada.
 */
export function ProductHero({ product }: { product: Product }) {
  const ref = useRef<HTMLElement>(null)
  const { nav } = useRouter()
  const category = getCategory(product.category)
  const availability = specDisplay(product.commerce.availability)
  const wa = whatsappHref(productWhatsappMessage(product.name, specDisplay(product.commerce.price)))
  const facts = keyFacts(product)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()

      mm.add(MQ.motion, () => {
        const tl = gsap.timeline({ defaults: { ease: EASE.cinematic } })
        if (!nav.shared) {
          tl.from('.stage__light', { opacity: 0, duration: 1.8, ease: 'power2.inOut' }, 0).from(
            '.stage__visual',
            { scale: 0.96, y: 16, autoAlpha: 0, duration: 1.5 },
            0.15,
          )
        }
        const t0 = nav.shared ? 0.45 : 0.6
        tl.from('.phero__crumbs, .phero__meta', { autoAlpha: 0, y: 12, duration: 0.9, stagger: 0.08 }, t0)
          .from('.phero__name .line-mask > span', { yPercent: 110, duration: 1.2 }, t0 + 0.05)
          .from('.phero__tagline, .phero__summary, .phero__facts', { autoAlpha: 0, y: 14, duration: 0.9, stagger: 0.06 }, t0 + 0.25)
          .from('.phero__commerce > *', { autoAlpha: 0, y: 12, duration: 0.8, stagger: 0.06 }, t0 + 0.4)
          .from('.phero__actions > *', { autoAlpha: 0, y: 12, duration: 0.8, stagger: 0.06 }, t0 + 0.5)
      })

      // Al desplazarse, el producto se acerca levemente a la cámara.
      mm.add(MQ_CONDITIONS.desktop, () => {
        gsap.to('.stage__visual', {
          scale: 1.06,
          ease: 'none',
          scrollTrigger: { trigger: ref.current, start: 'top top', end: 'bottom top', scrub: 0.6 },
        })
      })
    },
    { scope: ref, dependencies: [product.slug], revertOnUpdate: true },
  )

  return (
    <section ref={ref} className="phero" data-scheme="light" aria-labelledby="product-title">
      <div className="phero__layout container">
        <ProductStage
          product={product}
          variant="hero"
          shared
          priority
          sizes="(min-width: 1360px) 700px, (min-width: 900px) 52vw, 92vw"
          spin={product.category === 'intercomunicadores'}
        />

        <div className="phero__content">
          <nav className="phero__crumbs" aria-label="Ruta de navegación">
            <Link to="/">Inicio</Link>
            <span aria-hidden="true">/</span>
            <Link to={categoryPath(category.id)}>{category.name}</Link>
          </nav>
          <div className="phero__meta">
            <span className="eyebrow">{product.productType ? productCategoryLabel(product) : category.eyebrow}</span>
            {product.badge ? <span className="badge">{product.badge}</span> : null}
            {product.isDemo ? <DemoBadge /> : null}
          </div>
          <h1 id="product-title" className="phero__name">
            <span className="line-mask">
              <span>{product.name}</span>
            </span>
          </h1>
          <p className="phero__tagline">{product.tagline}</p>
          <p className="phero__summary">{product.summary}</p>
          {facts.length ? (
            <ul className="phero__facts" aria-label="Datos clave">
              {facts.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
          ) : null}

          <div className="phero__commerce">
            <Price product={product} size="xl" />
            <p className="phero__avail">
              {availability ? (
                availability
              ) : wa ? (
                <a href={wa} target="_blank" rel="noopener">
                  Consultar disponibilidad
                </a>
              ) : (
                'Disponibilidad a consultar'
              )}
            </p>
            {product.commerce.promotion && product.commerce.promotion.status !== 'pending' ? (
              <p className="phero__promo">{product.commerce.promotion.display}</p>
            ) : null}
          </div>

          <div className="phero__actions">
            <ContactActions product={product} withBuy />
            <InterestToggleButton slug={product.slug} />
            <View360Button product={product} />
          </div>
          <div className="phero__links">
            <Link to="#beneficios" className="text-link">
              <span>Ver características</span>
              <Icon name="arrow-down" />
            </Link>
            <Link to="#galeria" className="text-link">
              <span>Ver galería</span>
              <Icon name="arrow-down" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
