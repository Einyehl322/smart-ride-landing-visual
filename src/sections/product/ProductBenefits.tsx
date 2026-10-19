import { useRef } from 'react'
import { Maybe } from '../../components/ui/Placeholders'
import type { Product } from '../../data/types'
import { gsap, MQ, revealOnEnter, useGSAP } from '../../motion/gsap'
import './product.css'

/** Beneficios principales para el comprador, en tarjetas que se revelan por lotes. */
export function ProductBenefits({ product }: { product: Product }) {
  const ref = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add(MQ.motion, () => {
        gsap.from('.pbenefits .section-head > *', {
          autoAlpha: 0,
          y: 20,
          stagger: 0.06,
          duration: 0.9,
          scrollTrigger: { trigger: ref.current, start: 'top 80%' },
        })
        revealOnEnter('.benefit', { y: 24 })
      })
    },
    { scope: ref, dependencies: [product.slug], revertOnUpdate: true },
  )

  return (
    <section ref={ref} id="beneficios" className="pbenefits section" data-scheme="light" aria-labelledby="pbenefits-title">
      <div className="container">
        <header className="section-head">
          <div className="section-head__copy">
            <p className="eyebrow">Beneficios principales</p>
            <h2 id="pbenefits-title" className="t-h2">
              Lo que cambia en cada viaje.
            </h2>
          </div>
        </header>
        <ol className="pbenefits__list">
          {product.benefits.map((b, i) => (
            <li key={i} className="benefit">
              <span className="benefit__index">{String(i + 1).padStart(2, '0')}</span>
              <h3 className="benefit__title">
                <Maybe value={b.title} />
              </h3>
              {b.body ? (
                <p className="benefit__body">
                  <Maybe value={b.body} />
                </p>
              ) : null}
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
