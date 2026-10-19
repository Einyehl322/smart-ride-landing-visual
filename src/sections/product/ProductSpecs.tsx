import { useRef } from 'react'
import { Maybe, Pending } from '../../components/ui/Placeholders'
import type { Product } from '../../data/types'
import { gsap, MQ, useGSAP } from '../../motion/gsap'
import './product.css'

/** Especificaciones técnicas. Los valores `null` se muestran como pendientes. */
export function ProductSpecs({ product }: { product: Product }) {
  const ref = useRef<HTMLElement>(null)
  const missing = product.specs.some((g) => g.items.some((i) => i.value === null || i.value?.status === 'pending'))

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add(MQ.motion, () => {
        gsap.utils.toArray<HTMLElement>('.specs__group').forEach((g) => {
          gsap.from(g.querySelectorAll('.specs__row'), {
            '--rule': 0,
            autoAlpha: 0,
            y: 10,
            stagger: 0.07,
            duration: 0.9,
            ease: 'power3.out',
            scrollTrigger: { trigger: g, start: 'top 80%' },
          })
        })
      })
    },
    { scope: ref, dependencies: [product.slug], revertOnUpdate: true },
  )

  return (
    <section ref={ref} id="especificaciones" className="specs section section--alt" data-scheme="light" aria-labelledby="specs-title">
      <div className="container specs__layout">
        <div className="specs__intro">
          <p className="eyebrow">Especificaciones</p>
          <h2 id="specs-title" className="t-h2">
            Ficha técnica
          </h2>
          {missing ? (
            <Pending block label="Hay datos por confirmar para esta versión. Consúltanos por las especificaciones que necesitas antes de elegir." />
          ) : null}
        </div>
        <div className="specs__groups">
          {product.specs.map((g) => (
            <div key={g.group} className="specs__group">
              <h3 className="specs__group-title">{g.group}</h3>
              <dl>
                {g.items.map((item) => (
                  <div key={item.label} className="specs__row">
                    <dt>{item.label}</dt>
                    <dd>
                      <Maybe value={item.value} />
                      {item.value?.status === 'discrepancy' && <small className="specs__verification">Dato de catálogo · confirmar versión</small>}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
