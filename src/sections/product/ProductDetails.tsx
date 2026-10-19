import { useRef } from 'react'
import { Maybe } from '../../components/ui/Placeholders'
import { ProductVisual } from '../../components/visuals/ProductVisual'
import type { Product } from '../../data/types'
import { gsap, MQ, useGSAP } from '../../motion/gsap'
import './product.css'

/** Acercamientos: cada encuadre se descubre desde un lado distinto, con paralaje interno. */
export function ProductDetails({ product }: { product: Product }) {
  const ref = useRef<HTMLElement>(null)
  const sides = ['inset(0% 100% 0% 0%)', 'inset(100% 0% 0% 0%)', 'inset(0% 0% 0% 100%)']

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add(MQ.motion, () => {
        gsap.from('.pdetails__head > *', {
          autoAlpha: 0,
          y: 24,
          stagger: 0.1,
          scrollTrigger: { trigger: ref.current, start: 'top 75%' },
        })
        gsap.utils.toArray<HTMLElement>('.pdetail').forEach((tile, i) => {
          const tl = gsap.timeline({ scrollTrigger: { trigger: tile, start: 'top 82%' } })
          tl.fromTo(
            tile.querySelector('.pdetail__frame'),
            { clipPath: sides[i % sides.length] },
            { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.4, ease: 'expo.inOut' },
          ).from(tile.querySelector('.pv'), { scale: 1.3, duration: 2, ease: 'expo.out' }, 0.2)
          gsap.to(tile.querySelector('.pdetail__frame .pv'), {
            yPercent: -6,
            ease: 'none',
            scrollTrigger: { trigger: tile, start: 'top bottom', end: 'bottom top', scrub: true },
          })
        })
      })
    },
    { scope: ref, dependencies: [product.slug], revertOnUpdate: true },
  )

  return (
    <section ref={ref} id="detalles" className="pdetails section" data-scheme="light" aria-labelledby="pdetails-title">
      <div className="container">
        <div className="pdetails__head">
          <p className="eyebrow">De cerca</p>
          <h2 id="pdetails-title" className="t-h2">
            Cada detalle, a la vista.
          </h2>
        </div>
        <div className={`pdetails__grid ${product.details.length === 1 ? 'pdetails__grid--single' : ''}`}>
          {product.details.map((d, i) => (
            <figure key={i} className={`pdetail pdetail--${i}`}>
              <div className="pdetail__frame" style={{ background: product.theme.surface }}>
                <ProductVisual visual={d.visual} focus={d.focus} sizes="(min-width: 900px) 50vw, 92vw" />
              </div>
              <figcaption>
                <Maybe value={d.caption} />
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  )
}
