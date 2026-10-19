import { useRef } from 'react'
import { Maybe } from '../../components/ui/Placeholders'
import { ProductVisual } from '../../components/visuals/ProductVisual'
import type { Product } from '../../data/types'
import { EASE, focusToTransform, gsap, MQ_CONDITIONS, useGSAP } from '../../motion/gsap'
import './product.css'

/**
 * Introducción visual: sección fijada en la que la cámara se acerca a distintos
 * puntos del producto mientras cambian los textos de cada característica.
 */
export function ProductIntro({ product }: { product: Product }) {
  const ref = useRef<HTMLElement>(null)
  const camera = useRef<HTMLDivElement>(null)
  const { highlights } = product
  // Todos los momentos usan prácticamente el mismo encuadre (foto única).
  const sameFrame = highlights.every((h) => Math.abs(h.focus.zoom - highlights[0].focus.zoom) < 0.1)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()

      mm.add(MQ_CONDITIONS.desktop, () => {
        const captions = gsap.utils.toArray<HTMLElement>('.pintro__caption')
        gsap.set(camera.current, focusToTransform(highlights[0].focus))
        gsap.set(captions.slice(1), { autoAlpha: 0, x: 40 })

        const tl = gsap.timeline({
          defaults: { ease: EASE.camera },
          scrollTrigger: {
            trigger: ref.current,
            start: 'top top',
            end: `+=${highlights.length * 85}%`,
            pin: true,
            scrub: 0.8,
          },
        })
        tl.fromTo(
          '.pintro__frame',
          { clipPath: 'inset(10% 8% 10% 8% round 32px)' },
          { clipPath: 'inset(0% 0% 0% 0% round 0px)', duration: 0.8 },
          0,
        )
        highlights.slice(1).forEach((h, i) => {
          const at = 0.8 + i * 1.2
          tl.to(camera.current, { ...focusToTransform(h.focus), duration: 1 }, at)
            .to(captions[i], { autoAlpha: 0, x: -40, duration: 0.45 }, at)
            .to(captions[i + 1], { autoAlpha: 1, x: 0, duration: 0.55 }, at + 0.4)
            .to('.pintro__reel', { yPercent: -(100 / highlights.length) * (i + 1), duration: 0.5 }, at + 0.3)
        })
        tl.to({}, { duration: 0.4 })
      })

      mm.add(MQ_CONDITIONS.mobile, () => {
        gsap.utils.toArray<HTMLElement>('.pintro__m-item').forEach((el) => {
          gsap.from(el.querySelector('.pv'), {
            scale: 1.25,
            duration: 1.6,
            ease: 'expo.out',
            scrollTrigger: { trigger: el, start: 'top 85%' },
          })
        })
      })
    },
    { scope: ref, dependencies: [product.slug], revertOnUpdate: true },
  )

  return (
    <section ref={ref} id="resumen" className="pintro" data-scheme="dark" aria-labelledby="pintro-title">
      <h2 id="pintro-title" className="sr-only">
        Introducción a {product.name}
      </h2>

      {/* Escritorio: recorrido de cámara fijado */}
      <div className="pintro__desktop">
        <div className="pintro__frame" style={{ background: product.theme.surface }}>
          <ProductVisual visual={product.visual} cameraRef={camera} sizes="100vw" className="pintro__visual" />
        </div>
        <div className="pintro__captions">
          <p className="pintro__count" aria-hidden="true">
            <span className="pintro__count-window">
              <span className="pintro__reel">
                {highlights.map((_, i) => (
                  <span key={i}>{String(i + 1).padStart(2, '0')}</span>
                ))}
              </span>
            </span>{' '}
            / {String(highlights.length).padStart(2, '0')}
          </p>
          <div className="pintro__stack">
            {highlights.map((h, i) => (
              <div key={i} className="pintro__caption">
                <h3 className="t-h3">
                  <Maybe value={h.title} />
                </h3>
                <p className="t-muted">
                  <Maybe value={h.body} />
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Móvil y movimiento reducido: secuencia vertical */}
      <div className="pintro__mobile container">
        {sameFrame ? (
          // Un solo encuadre: una foto y los datos debajo, sin repetir la imagen.
          <div className="pintro__m-item">
            <div className="pintro__m-frame" style={{ background: product.theme.surface }}>
              <ProductVisual visual={product.visual} focus={highlights[0]?.focus} sizes="92vw" />
            </div>
            <dl className="pintro__m-facts">
              {highlights.map((h, i) => (
                <div key={i}>
                  <dt>
                    <Maybe value={h.title} />
                  </dt>
                  <dd className="t-muted">
                    <Maybe value={h.body} />
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        ) : (
          highlights.map((h, i) => (
            <div key={i} className="pintro__m-item">
              <div className="pintro__m-frame" style={{ background: product.theme.surface }}>
                <ProductVisual visual={product.visual} focus={h.focus} sizes="92vw" />
              </div>
              <h3 className="t-h3">
                <Maybe value={h.title} />
              </h3>
              <p className="t-muted">
                <Maybe value={h.body} />
              </p>
            </div>
          ))
        )}
      </div>
    </section>
  )
}
