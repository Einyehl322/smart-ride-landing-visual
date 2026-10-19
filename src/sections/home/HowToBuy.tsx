import { useRef } from 'react'
import { gsap, MQ, MQ_CONDITIONS, useGSAP } from '../../motion/gsap'
import './home.css'

const STEPS = [
  {
    title: 'Explora',
    body: 'Recorre los modelos y compara cuál encaja con tu moto y con tu forma de viajar.',
  },
  {
    title: 'Consulta',
    body: 'Escríbenos por WhatsApp para confirmar precio, disponibilidad y compatibilidad antes de decidir.',
  },
  {
    title: 'Coordina',
    body: 'Te indicamos los pasos para completar tu compra de forma directa.',
  },
]

/** Proceso de compra: una línea de recorrido conecta los pasos al ritmo del scroll. */
export function HowToBuy() {
  const ref = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add(MQ.motion, () => {
        gsap.from('.steps__head > *', {
          autoAlpha: 0,
          y: 24,
          stagger: 0.1,
          duration: 1,
          scrollTrigger: { trigger: ref.current, start: 'top 78%' },
        })
      })
      mm.add(MQ_CONDITIONS.desktop, () => {
        const tl = gsap.timeline({
          scrollTrigger: { trigger: '.steps__list', start: 'top 82%', end: 'bottom 60%', scrub: 0.6 },
        })
        tl.fromTo('.steps__progress', { scaleX: 0 }, { scaleX: 1, ease: 'none', duration: 3 }, 0)
        gsap.utils.toArray<HTMLElement>('.step').forEach((step, i) => {
          tl.from(step, { autoAlpha: 0.2, y: 20, duration: 0.8, ease: 'power2.out' }, i * 0.9)
          tl.from(step.querySelector('.step__dot'), { scale: 0, duration: 0.4, ease: 'back.out(3)' }, i * 0.9)
        })
      })
      mm.add(MQ_CONDITIONS.mobile, () => {
        gsap.fromTo(
          '.steps__progress',
          { scaleY: 0 },
          {
            scaleY: 1,
            ease: 'none',
            scrollTrigger: { trigger: '.steps__list', start: 'top 75%', end: 'bottom 60%', scrub: true },
          },
        )
      })
    },
    { scope: ref },
  )

  return (
    <section ref={ref} id="comprar" className="steps section section--alt" data-scheme="light" aria-labelledby="steps-title" data-section="comprar">
      <div className="container">
        <div className="steps__head">
          <p className="eyebrow">Cómo comprar</p>
          <h2 id="steps-title" className="t-h3 steps__title">
            De la curiosidad a la ruta, en tres pasos.
          </h2>
        </div>
        <div className="steps__list">
          <span className="steps__track" aria-hidden="true">
            <span className="steps__progress" />
          </span>
          <ol className="steps__items">
            {STEPS.map((s, i) => (
              <li key={s.title} className="step">
                <span className="step__dot" aria-hidden="true" />
                <span className="step__index">{String(i + 1).padStart(2, '0')}</span>
                <h3 className="step__title">{s.title}</h3>
                <p className="t-muted">{s.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}
