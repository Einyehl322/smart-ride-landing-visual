import { useRef, useState } from 'react'
import { Price } from '../../components/showroom/Price'
import { ShowroomObject } from '../../components/showroom/ShowroomObject'
import { Icon } from '../../components/ui/Icon'
import { specDisplay } from '../../components/ui/Placeholders'
import { ProductStage } from '../../components/visuals/ProductStage'
import { productWhatsappMessage, whatsappHref } from '../../config/site'
import { productCategoryLabel, productPath } from '../../data/catalog'
import { keyFacts, spotlight } from '../../data/merchandising'
import type { Product } from '../../data/types'
import { EASE, gsap, MQ, MQ_CONDITIONS, ScrollTrigger, useGSAP } from '../../motion/gsap'
import { Link } from '../../router/Link'
import './home.css'

/** Primera frase del resumen: la descripción breve del spotlight. */
const lead = (p: Product) => (p.summary.match(/^.+?\.(\s|$)/)?.[0] ?? p.summary).trim()

function eyebrow(p: Product) {
  if (p.category === 'carplay') return `Pantalla CarPlay${p.showroom?.screen ? ` · ${p.showroom.screen}` : ''}`
  return productCategoryLabel(p)
}

/**
 * Spotlight editorial: un producto por vez. En escritorio la sección se fija
 * y, al avanzar, el equipo cede su lugar al siguiente con un cambio de escala
 * y encuadre; en móvil (o con movimiento reducido) los modelos se apilan.
 */
export function Spotlight() {
  const ref = useRef<HTMLElement>(null)
  const trigger = useRef<ScrollTrigger | null>(null)
  const [current, setCurrent] = useState(0)
  const slides = spotlight

  useGSAP(
    () => {
      const mm = gsap.matchMedia()

      mm.add(MQ_CONDITIONS.desktop, () => {
        const items = gsap.utils.toArray<HTMLElement>('.spot-ed')
        const visual = (el: HTMLElement) => el.querySelector('.spot-ed__visual')
        const copy = (el: HTMLElement) => el.querySelector('.spot-ed__copy')
        const parts = (el: HTMLElement) => el.querySelectorAll('.spot-ed__copy > *')
        items.slice(1).forEach((el) => {
          gsap.set(visual(el), { autoAlpha: 0, scale: 1.12, xPercent: 8 })
          gsap.set(copy(el), { autoAlpha: 0 })
        })

        const tl = gsap.timeline({
          defaults: { ease: EASE.camera },
          scrollTrigger: {
            trigger: ref.current,
            start: 'top top',
            end: `+=${(items.length - 1) * 100 + 30}%`,
            pin: '.spotlight__pin',
            scrub: 0.8,
            snap: { snapTo: 'labels', duration: { min: 0.3, max: 0.9 }, ease: 'power2.inOut' },
            onUpdate: (self) => setCurrent(Math.min(items.length - 1, Math.round(self.progress * (items.length - 1)))),
          },
        })
        trigger.current = tl.scrollTrigger ?? null

        tl.addLabel('s0')
        // Cada relevo termina (incluida la última acción) antes de su etiqueta de anclaje.
        items.slice(1).forEach((el, i) => {
          const prev = items[i]
          const at = i * 1.4 + 0.2
          tl.to(visual(prev), { autoAlpha: 0, scale: 0.86, xPercent: -8, duration: 0.8 }, at)
            .to(parts(prev), { opacity: 0, y: -28, stagger: 0.02, duration: 0.4 }, at)
            .set(copy(prev), { autoAlpha: 0 }, at + 0.5)
            .to(visual(el), { autoAlpha: 1, scale: 1, xPercent: 0, duration: 0.9 }, at + 0.25)
            .set(copy(el), { autoAlpha: 1 }, at + 0.4)
            .fromTo(parts(el), { opacity: 0, y: 36 }, { opacity: 1, y: 0, stagger: 0.03, duration: 0.5 }, at + 0.4)
            .addLabel(`s${i + 1}`, at + 1.2)
        })
        tl.to({}, { duration: 0.25 })

        return () => {
          trigger.current = null
        }
      })

      mm.add(MQ_CONDITIONS.mobile, () => {
        gsap.utils.toArray<HTMLElement>('.spot-ed').forEach((el) => {
          gsap.from(el.querySelector('.spot-ed__visual'), {
            scale: 0.92,
            autoAlpha: 0,
            duration: 1.3,
            ease: EASE.cinematic,
            scrollTrigger: { trigger: el, start: 'top 82%' },
          })
          gsap.from(el.querySelectorAll('.spot-ed__copy > *'), {
            autoAlpha: 0,
            y: 20,
            stagger: 0.05,
            duration: 0.9,
            ease: EASE.cinematic,
            scrollTrigger: { trigger: el, start: 'top 70%' },
          })
        })
      })

      mm.add(MQ.motion, () => {
        gsap.from('.spotlight__head > *', {
          autoAlpha: 0,
          y: 18,
          stagger: 0.06,
          duration: 0.9,
          ease: EASE.cinematic,
          scrollTrigger: { trigger: ref.current, start: 'top 75%' },
        })
      })
    },
    { scope: ref },
  )

  // Los puntos llevan a cada modelo (posición exacta de su etiqueta en el recorrido).
  const goTo = (i: number) => {
    const st = trigger.current
    if (!st) {
      ref.current?.querySelectorAll<HTMLElement>('.spot-ed')[i]?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }
    const tl = st.animation as gsap.core.Timeline
    const y = st.start + (st.end - st.start) * (tl.labels[`s${i}`] / tl.duration())
    window.scrollTo({ top: y, behavior: 'smooth' })
  }

  if (!slides.length) return null

  return (
    <section ref={ref} id="destacados" className="spotlight" data-scheme="dark" aria-labelledby="spotlight-title" data-section="spotlight">
      <div className="spotlight__pin">
        <div className="container spotlight__head">
          <div>
            <p className="eyebrow">En primer plano</p>
            <h2 id="spotlight-title" className="spotlight__title">
              Modelos que marcan la ruta.
            </h2>
          </div>
          <div className="spotlight__nav" role="group" aria-label="Elegir modelo destacado">
            <span className="spotlight__counter" aria-hidden="true">
              {String(current + 1).padStart(2, '0')} / {String(slides.length).padStart(2, '0')}
            </span>
            {slides.map((p, i) => (
              <button key={p.slug} type="button" className="spotlight__dot" aria-pressed={i === current} aria-label={`Ver ${p.name}`} onClick={() => goTo(i)} />
            ))}
          </div>
        </div>

        <div className="container spotlight__stage">
          {slides.map((p, i) => {
            const wa = whatsappHref(productWhatsappMessage(p.name, specDisplay(p.commerce.price)))
            return (
              <article key={p.slug} className="spot-ed" aria-labelledby={`spot-ed-${p.slug}`} data-index={i} data-tilt-zone>
                <div className="spot-ed__visual">
                  {p.showroom ? (
                    <div className="spot-ed__object">
                      <ShowroomObject product={p} size="feature" withAccessories sizes="(min-width: 1024px) 52vw, 92vw" />
                    </div>
                  ) : (
                    <ProductStage product={p} variant="card" sizes="(min-width: 1024px) 52vw, 92vw" />
                  )}
                </div>
                <div className="spot-ed__copy">
                  <p className="eyebrow">{eyebrow(p)}</p>
                  <h3 id={`spot-ed-${p.slug}`} className="spot-ed__name">
                    {p.name}
                  </h3>
                  <p className="spot-ed__benefit">{p.tagline}</p>
                  <p className="spot-ed__lead">{lead(p)}</p>
                  <ul className="spot-ed__facts" aria-label="Datos clave">
                    {keyFacts(p).map((f) => (
                      <li key={f}>{f}</li>
                    ))}
                  </ul>
                  <Price product={p} size="xl" />
                  <div className="spot-ed__actions">
                    <Link to={productPath(p)} className="btn btn--primary" aria-label={`Explorar ${p.name}`}>
                      Explorar
                      <Icon name="arrow" />
                    </Link>
                    {wa ? (
                      <a href={wa} className="btn btn--ghost" target="_blank" rel="noopener" aria-label={`Consultar ${p.name} por WhatsApp`}>
                        <Icon name="whatsapp" />
                        Consultar
                      </a>
                    ) : null}
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
